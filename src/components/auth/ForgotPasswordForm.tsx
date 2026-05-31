"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthCard } from "./AuthCard";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle={
        sent ? "Check your inbox" : "Enter your email and we’ll send you a link"
      }
    >
      {sent ? (
        <p className="mt-7 text-center text-sm text-white/55">
          If an account exists for{" "}
          <span className="text-white/80">{email}</span>, a reset link is on its
          way.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 px-4"
          />
          <Button
            type="submit"
            variant="glass"
            disabled={loading}
            className="link-btn mt-2 h-11 w-full rounded-xl text-[15px]"
          >
            {loading ? "…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/50">
        <Link
          href="/login"
          className="text-white/80 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
