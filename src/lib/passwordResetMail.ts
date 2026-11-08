import { AsyncLocalStorage } from "node:async_hooks";

import type { Mail } from "@/lib/mailer";

const pending = new AsyncLocalStorage<{ mail: Mail | null }>();

export function deferResetMail(mail: Mail): boolean {
  const store = pending.getStore();
  if (!store) return false;
  store.mail = mail;
  return true;
}

export async function captureResetMail<T>(
  run: () => Promise<T>,
): Promise<{ result: T; mail: Mail | null }> {
  const store: { mail: Mail | null } = { mail: null };
  const result = await pending.run(store, run);
  return { result, mail: store.mail };
}
