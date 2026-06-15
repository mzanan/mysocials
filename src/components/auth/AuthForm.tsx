"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        hero
      >
        <div className="mb-2 mt-5 flex items-center justify-center gap-3 text-fg-subtle">
          <Badge className="bg-gradient-to-r from-accent/20 to-accent/10">
            <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            $3/month
          </Badge>
          <span className="text-xs text-fg-subtle">•</span>
          <Badge className="bg-gradient-to-r from-accent/20 to-accent/10">
            <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Cancel anytime
          </Badge>
        </div>

        <p className="mb-2 text-center text-xs text-fg-subtle">
          Start building your page now. Subscribe to publish.
        </p>

        {googleEnabled && (
          <div className="mt-2">
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
          className={`flex flex-col gap-3 ${googleEnabled ? "" : "mt-6"}`}
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

        <p className="mt-6 text-center text-[11px] text-fg-subtle">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline-offset-4 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
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

      <Button
        type="button"
        variant="ghost"
        onClick={f.useDifferentEmail}
        className="mt-6 w-full text-fg-subtle hover:text-fg-muted"
      >
        ← Use a different email
      </Button>
    </AuthCard>
  );
}
