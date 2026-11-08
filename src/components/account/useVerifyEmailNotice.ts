"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GENERIC_ERROR } from "@/lib/formErrors";

type Status = "idle" | "sending" | "sent";

export function useVerifyEmailNotice(email: string) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setError(null);
    setStatus("sending");
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });
    if (error) {
      setError(error.message ?? GENERIC_ERROR);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  return { status, error, resend };
}
