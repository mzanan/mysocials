import { Polar } from '@polar-sh/sdk'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export function buildPolarPlugin() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  const productId = process.env.POLAR_PRODUCT_ID
  if (!accessToken || !productId) return null

  const client = new Polar({
    accessToken,
    server: process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox',
  })

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
