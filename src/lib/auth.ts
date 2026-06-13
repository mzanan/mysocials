import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { db, schema } from "@/lib/db";
import { buildPolarPlugin, ensurePolarCustomer } from "@/lib/polar";
import { generateUniqueUsername } from "@/lib/profile/username";
import { mailerEnabled, sendMail } from "@/lib/mailer";
import { verifyEmail } from "@/emails/verifyEmail";
import { resetPassword } from "@/emails/resetPassword";

const adminUserIds = process.env.ADMIN_USER_ID
  ? [process.env.ADMIN_USER_ID]
  : [];
const polarPlugin = buildPolarPlugin();
const POLAR_CUSTOMER_PATHS = new Set(["/checkout", "/customer/portal"]);

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

export const googleAuthEnabled = Boolean(googleProvider);

type MailCallbackArgs = {
  user: { name?: string | null; email: string };
  url: string;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
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
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  onAPIError: {
    errorURL: "/",
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!polarPlugin || !POLAR_CUSTOMER_PATHS.has(ctx.path)) return;
      const session = await getSessionFromCtx(ctx);
      if (!session) return;
      try {
        await ensurePolarCustomer(session.user);
      } catch (e) {
        console.error("ensurePolarCustomer failed", e);
      }
    }),
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    ...(mailerEnabled
      ? {
          sendResetPassword: async ({ user, url }: MailCallbackArgs) => {
            const { subject, html } = resetPassword({ name: user.name, url });
            await sendMail({ to: user.email, subject, html });
          },
        }
      : {}),
  },
  ...(mailerEnabled
    ? {
        emailVerification: {
          sendOnSignUp: true,
          sendVerificationEmail: async ({ user, url }: MailCallbackArgs) => {
            const { subject, html } = verifyEmail({ name: user.name, url });
            await sendMail({ to: user.email, subject, html });
          },
        },
      }
    : {}),
  ...(googleProvider ? { socialProviders: googleProvider } : {}),
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          const username = await generateUniqueUsername(createdUser.email);
          await db.insert(schema.profiles).values({
            user_id: createdUser.id,
            username,
            display_name: createdUser.name ?? null,
            avatar_url: createdUser.image ?? null,
          });
        },
      },
    },
  },
  plugins: [
    admin({ adminUserIds }),
    ...(polarPlugin ? [polarPlugin] : []),
    nextCookies(),
  ],
});

export type Auth = typeof auth;
