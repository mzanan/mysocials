"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

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
