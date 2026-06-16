"use client";

import Link from "next/link";
import { Lock, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthCard } from "./AuthCard";
import { AuthSubmit } from "./AuthSubmit";
import { HeroHeadline } from "./HeroHeadline";
import { useAuthForm } from "./useAuthForm";

export function AuthForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const f = useAuthForm();

  if (f.step === "email") {
    return (
      <AuthCard title={<HeroHeadline />} hero>
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 lg:items-start">
            <div className="flex items-center gap-2.5">
              <Badge variant="accent">
                <Lock className="size-3.5" />
                $3/month
              </Badge>
              <Badge variant="accent">
                <Check className="size-3.5" />
                Cancel anytime
              </Badge>
            </div>
            <Text variant="caption" className="text-center lg:text-left">
              Start building your page now. Subscribe to publish.
            </Text>
          </div>

          <div className="flex flex-col gap-5">
            {googleEnabled && (
              <>
                <GoogleSignInButton label="Continue with Google" />
                <div className="flex items-center gap-3 text-xs text-fg-subtle">
                  <span className="h-px flex-1 bg-hairline-strong" />
                  or
                  <span className="h-px flex-1 bg-hairline-strong" />
                </div>
              </>
            )}

            <form
              onSubmit={f.continueWithEmail}
              noValidate
              className="flex flex-col gap-3"
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
          </div>

          <Text variant="caption" className="text-center lg:text-left">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </Text>
        </div>
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
