"use server";

import { syncSubscriptionFromPolar } from "@/lib/polar";
import { requireUserId, revalidate } from "./_helpers";

export async function refreshBilling(): Promise<void> {
  const uid = await requireUserId();
  await syncSubscriptionFromPolar(uid);
  revalidate();
}
