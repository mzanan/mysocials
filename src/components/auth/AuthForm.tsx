"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthCard } from "./AuthCard";
import { AuthSubmit } from "./AuthSubmit";

export function AuthForm({
  mode,
  googleEnabled = false,
}: {
  mode: "login" | "signup";
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignup
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

  return (
    <AuthCard
      title={isSignup ? "Create your page" : "Welcome back"}
      subtitle={
        isSignup ? "Start building your link page" : "Sign in to your dashboard"
      }
    >
      {googleEnabled && (
        <div className="mt-7">
          <GoogleSignInButton
            label={isSignup ? "Sign up with Google" : "Continue with Google"}
          />
          <div className="my-5 flex items-center gap-3 text-xs text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-3 ${googleEnabled ? "" : "mt-7"}`}
      >
        {isSignup && (
          <Input
            type="text"
            autoComplete="name"
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 px-4"
          />
        )}
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 px-4"
        />
        <Input
          type="password"
          required
          minLength={8}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 px-4"
        />

        {!isSignup && (
          <Link
            href="/forgot-password"
            className="-mt-1 self-end text-xs text-white/45 underline-offset-4 hover:text-white/70 hover:underline"
          >
            Forgot password?
          </Link>
        )}

        {error && <p className="text-sm text-red-300/90">{error}</p>}

        <AuthSubmit disabled={loading}>
          {loading ? "…" : isSignup ? "Sign up" : "Sign in"}
        </AuthSubmit>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-white/80 underline-offset-4 hover:underline"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </AuthCard>
  );
}
