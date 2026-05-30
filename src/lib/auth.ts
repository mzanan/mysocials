import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins'

import { db, schema } from '@/lib/db'
import { buildPolarPlugin } from '@/lib/polar'
import { generateUniqueUsername } from '@/lib/profile/username'

const adminUserIds = process.env.ADMIN_USER_ID ? [process.env.ADMIN_USER_ID] : []
const polarPlugin = buildPolarPlugin()

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          const username = await generateUniqueUsername(createdUser.email)
          await db.insert(schema.profiles).values({
            user_id: createdUser.id,
            username,
            display_name: createdUser.name ?? null,
            avatar_url: createdUser.image ?? null,
          })
        },
      },
    },
  },
  plugins: [admin({ adminUserIds }), ...(polarPlugin ? [polarPlugin] : []), nextCookies()],
})

export type Auth = typeof auth
