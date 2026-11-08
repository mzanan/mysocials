"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { GENERIC_ERROR, INVALID_EMAIL, isValidEmail } from "@/lib/formErrors";

export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeEmail(value: string) {
    setEmail(value);
    if (error) setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email.trim())) {
      setError(INVALID_EMAIL);
      return;
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return { email, setEmail: changeEmail, loading, sent, error, submit };
}
