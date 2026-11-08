"use client";

import Link from "next/link";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { AuthCard } from "./AuthCard";
import { AuthSubmit } from "./AuthSubmit";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

export function ForgotPasswordForm() {
  const f = useForgotPasswordForm();

  return (
    <AuthCard
      hero
      title={<DisplayTitle lead="Forgot your" accent="password?" size="md" />}
      subtitle={
        f.sent ? "Check your inbox" : "Enter your email and we’ll send you a link"
      }
    >
      {f.sent ? (
        <p className="mt-7 text-center text-sm text-fg-subtle">
          If an account exists for{" "}
          <span className="text-fg-muted">{f.email}</span>, a reset link is on its
          way.
        </p>
      ) : (
        <form onSubmit={f.submit} className="mt-7 flex flex-col gap-3">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={f.email}
            onChange={(e) => f.setEmail(e.target.value)}
            className="h-11 px-4"
          />
          {f.error && <Text variant="error">{f.error}</Text>}
          <AuthSubmit disabled={f.loading}>
            {f.loading ? "…" : "Send reset link"}
          </AuthSubmit>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-fg-subtle">
        <Link
          href="/"
          className="text-fg-muted underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
