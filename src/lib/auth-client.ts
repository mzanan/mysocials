import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { polarClient } from '@polar-sh/better-auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,
  plugins: [adminClient(), polarClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient
