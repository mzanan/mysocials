"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthCard } from "./AuthCard";
import { AuthSubmit } from "./AuthSubmit";
import { useAuthForm } from "./useAuthForm";

export function AuthForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const f = useAuthForm();

  if (f.step === "email") {
    return (
      <AuthCard
        title={
          <>
            Your whole world,
            <br className="lg:hidden" />{" "}
            <span className="text-accent">one link.</span>
          </>
        }
        subtitle="Start free for 7 days · No card required"
        hero
      >
        {googleEnabled && (
          <div className="mt-8">
            <GoogleSignInButton label="Continue with Google" />
            <div className="my-5 flex items-center gap-3 text-xs text-fg-subtle">
              <span className="h-px flex-1 bg-surface-strong" />
              or
              <span className="h-px flex-1 bg-surface-strong" />
            </div>
          </div>
        )}

        <form
          onSubmit={f.continueWithEmail}
          noValidate
          className={`flex flex-col gap-3 ${googleEnabled ? "" : "mt-8"}`}
        >
          <div className="flex flex-col gap-1.5">
            <Input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={f.email}
              onChange={(e) => f.setEmail(e.target.value)}
              aria-invalid={!!f.emailError}
              className={cn(
                "h-11 px-4",
                f.emailError && "border-danger-strong focus:border-danger-strong"
              )}
            />
            {f.emailError && (
              <p className="text-xs text-danger">{f.emailError}</p>
            )}
          </div>

          {f.error && <p className="text-sm text-danger">{f.error}</p>}

          <AuthSubmit disabled={f.loading}>
            {f.loading ? "…" : "Continue"}
          </AuthSubmit>
        </form>
      </AuthCard>
    );
  }

  const isSignup = f.mode === "signup";

  return (
    <AuthCard
      title={isSignup ? "Create your page" : "Welcome back"}
      subtitle={f.email}
    >
      <form
        onSubmit={f.submitPassword}
        noValidate
        className="mt-7 flex flex-col gap-3"
      >
        {isSignup && (
          <Input
            type="text"
            autoComplete="name"
            placeholder="Display name"
            value={f.name}
            onChange={(e) => f.setName(e.target.value)}
            className="h-11 px-4"
          />
        )}
        <div className="flex flex-col gap-1.5">
          <Input
            type="password"
            autoFocus
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="Password"
            value={f.password}
            onChange={(e) => f.setPassword(e.target.value)}
            aria-invalid={!!f.passwordError}
            className={cn(
              "h-11 px-4",
              f.passwordError && "border-danger-strong focus:border-danger-strong"
            )}
          />
          {f.passwordError && (
            <p className="text-xs text-danger">{f.passwordError}</p>
          )}
        </div>

        {!isSignup && (
          <Link
            href="/forgot-password"
            className="-mt-1 self-end text-xs text-fg-subtle underline-offset-4 hover:text-fg-muted hover:underline"
          >
            Forgot password?
          </Link>
        )}

        {f.error && <p className="text-sm text-danger">{f.error}</p>}

        <AuthSubmit disabled={f.loading}>
          {f.loading ? "…" : isSignup ? "Create account" : "Sign in"}
        </AuthSubmit>
      </form>

      <button
        type="button"
        onClick={f.useDifferentEmail}
        className="mt-6 w-full text-center text-sm text-fg-subtle transition-colors hover:text-fg-muted"
      >
        ← Use a different email
      </button>
    </AuthCard>
  );
}
