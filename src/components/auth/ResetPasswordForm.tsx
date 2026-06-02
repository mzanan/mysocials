"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { AuthCard } from "./AuthCard";
import { AuthSubmit } from "./AuthSubmit";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Could not reset password");
      return;
    }
    toast.success("Password updated — sign in with your new password");
    router.push("/");
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password you don’t use elsewhere"
    >
      {token ? (
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 px-4"
          />
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-11 px-4"
          />
          {error && <p className="text-sm text-red-300/90">{error}</p>}
          <AuthSubmit disabled={loading}>
            {loading ? "…" : "Update password"}
          </AuthSubmit>
        </form>
      ) : (
        <p className="mt-7 text-center text-sm text-red-300/90">
          This reset link is invalid or has expired.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-white/50">
        <Link
          href="/"
          className="text-white/80 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
