import { Polar } from '@polar-sh/sdk'
import { checkout, polar, portal, webhooks } from '@polar-sh/better-auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

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

function isNotFound(e: unknown): boolean {
  return Boolean(
    e && typeof e === 'object' && 'statusCode' in e && (e as { statusCode?: number }).statusCode === 404,
  )
}

async function markActive(
  userId: string,
  subId: string,
  customerId: string,
  periodEnd: Date | null | undefined,
) {
  await db
    .update(profiles)
    .set({
      subscription_status: 'active',
      subscription_id: subId,
      polar_customer_id: customerId,
      subscription_current_period_end: periodEnd ?? null,
    })
    .where(eq(profiles.user_id, userId))
}

async function markInactive(
  userId: string,
  status: 'canceled' | 'revoked',
  opts?: { unpublish?: boolean },
) {
  await db
    .update(profiles)
    .set({
      subscription_status: status,
      subscription_current_period_end: null,
      ...(opts?.unpublish ? { published: false } : {}),
    })
    .where(eq(profiles.user_id, userId))
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
      if (!existing.externalId) {
        await client.customers.update({
          id: existing.id,
          customerUpdate: { externalId: user.id },
        })
      }
    } else {
      await client.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        externalId: user.id,
      })
    }
  }
}

/** Reconcile the stored subscription state from Polar's source of truth.
 *  Activates if there's an active subscription, otherwise downgrades.
 *  Lets the app work without the webhook (local sandbox, or as a prod fallback). */
export async function syncSubscriptionFromPolar(userId: string): Promise<void> {
  const client = buildPolarClient()
  if (!client || !process.env.POLAR_PRODUCT_ID) return
  try {
    const state = await client.customers.getStateExternal({ externalId: userId })
    const sub = state.activeSubscriptions?.[0]
    if (sub) await markActive(userId, sub.id, state.id, sub.currentPeriodEnd)
    else await markInactive(userId, 'canceled')
  } catch (e) {
    if (isNotFound(e)) {
      await markInactive(userId, 'canceled')
      return
    }
    console.error('syncSubscriptionFromPolar failed', e)
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
          if (sub) await markActive(userId, sub.id, data.id, sub.currentPeriodEnd)
          else await markInactive(userId, 'canceled')
          revalidatePath('/dashboard')
        },
        onSubscriptionRevoked: async ({ data }) => {
          const userId = data.customer?.externalId
          if (!userId) return
          await markInactive(userId, 'revoked', { unpublish: true })
          revalidatePath('/dashboard')
        },
      }),
    )
  }

  return polar({ client, createCustomerOnSignUp: false, use })
}
