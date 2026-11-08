"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { GENERIC_ERROR } from "@/lib/formErrors";
import { sendMail } from "@/lib/mailer";
import { mailFailureMessage } from "@/lib/mailFailure";
import { captureResetMail } from "@/lib/passwordResetMail";

export type ResetRequestResult = { ok: true } | { ok: false; error: string };

const FORWARDED_HEADERS = ["origin", "cookie", "user-agent", "x-forwarded-for", "x-real-ip"];

export async function emailExists(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const rows = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.email, normalized))
    .limit(1);
  return rows.length > 0;
}

export async function requestPasswordReset(email: string): Promise<ResetRequestResult> {
  const incoming = await headers();
  const forwarded = new Headers({ "content-type": "application/json" });
  for (const name of FORWARDED_HEADERS) {
    const value = incoming.get(name);
    if (value) forwarded.set(name, value);
  }

  const { result: response, mail } = await captureResetMail(() =>
    auth.handler(
      new Request(new URL("/api/auth/request-password-reset", process.env.BETTER_AUTH_URL), {
        method: "POST",
        headers: forwarded,
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      }),
    ),
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, error: body?.message ?? GENERIC_ERROR };
  }
  if (!mail) return { ok: true };

  try {
    await sendMail(mail);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: mailFailureMessage(error) };
  }
}
