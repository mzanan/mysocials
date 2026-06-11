import { Polar } from '@polar-sh/sdk'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

function buildPolarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  if (!accessToken) return null

  return new Polar({
    accessToken,
    server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
  })
}

type PolarUser = { id: string; email: string; name?: string | null }

export async function ensurePolarCustomer(user: PolarUser) {
  const client = buildPolarClient()
  if (!client) return

  try {
    await client.customers.getExternal({ externalId: user.id })
  } catch {
    const { result } = await client.customers.list({ email: user.email })
    const existing = result.items[0]
    if (existing) {
      await client.customers.update({
        id: existing.id,
        customerUpdate: { externalId: user.id },
      })
    } else {
      await client.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        externalId: user.id,
      })
    }
  }
}

export function buildPolarPlugin() {
  const client = buildPolarClient()
  const productId = process.env.POLAR_PRODUCT_ID
  if (!client || !productId) return null

  const successUrl = `${process.env.BETTER_AUTH_URL ?? ''}/dashboard?checkout=success`
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET

  const use: Parameters<typeof polar>[0]['use'] = [
    checkout({
      products: [{ productId, slug: 'pro' }],
      successUrl,
      authenticatedUsersOnly: true,
    }),
    portal(),
  ]

  if (webhookSecret) {
    use.push(
      webhooks({
        secret: webhookSecret,
        onCustomerStateChanged: async ({ data }) => {
          const userId = data.externalId
          if (!userId) return
          const sub = data.activeSubscriptions[0]
          if (sub) {
            await db
              .update(profiles)
              .set({
                subscription_status: 'active',
                subscription_id: sub.id,
                polar_customer_id: data.id,
                subscription_current_period_end: sub.currentPeriodEnd ?? null,
              })
              .where(eq(profiles.user_id, userId))
          } else {
            await db
              .update(profiles)
              .set({ subscription_status: 'canceled' })
              .where(eq(profiles.user_id, userId))
          }
        },
        onSubscriptionRevoked: async ({ data }) => {
          const userId = data.customer?.externalId
          if (!userId) return
          await db
            .update(profiles)
            .set({ subscription_status: 'revoked', published: false })
            .where(eq(profiles.user_id, userId))
        },
      }),
    )
  }

  return polar({ client, createCustomerOnSignUp: true, use })
}
