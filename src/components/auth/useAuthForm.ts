"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { emailExists } from "@/app/(auth)/actions";

type Step = "email" | "password";
type Mode = "login" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export function useAuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function changeEmail(value: string) {
    setEmail(value);
    if (emailError) setEmailError(null);
    if (error) setError(null);
  }

  function changePassword(value: string) {
    setPassword(value);
    if (passwordError) setPasswordError(null);
    if (error) setError(null);
  }

  async function continueWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = email.trim();
    if (!value) {
      setEmailError("Enter your email to continue.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setEmailError("That doesn't look like a valid email.");
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      const exists = await emailExists(value);
      setMode(exists ? "login" : "signup");
      setStep("password");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password) {
      setPasswordError("Enter your password.");
      return;
    }
    if (mode === "signup" && password.length < MIN_PASSWORD) {
      setPasswordError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setPasswordError(null);

    setLoading(true);
    const { error } =
      mode === "signup"
        ? await authClient.signUp.email({
            name: name || email.split("@")[0],
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function useDifferentEmail() {
    setStep("email");
    setPassword("");
    setName("");
    setPasswordError(null);
    setError(null);
  }

  return {
    step,
    mode,
    email,
    setEmail: changeEmail,
    name,
    setName,
    password,
    setPassword: changePassword,
    emailError,
    passwordError,
    error,
    loading,
    continueWithEmail,
    submitPassword,
    useDifferentEmail,
  };
}
