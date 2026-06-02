"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export function GoogleSignInButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      setLoading(false);
      toast.error(error.message ?? "Could not continue with Google");
    }
  }

  return (
    <Button
      type="button"
      variant="glass"
      size="auth"
      disabled={loading}
      onClick={handleClick}
      className="w-full hover:border-white/20 hover:bg-white/[0.1]"
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.24 1.4-.96 2.6-2.05 3.4l3.3 2.56C20.7 18.3 21.7 15.4 21.7 12c0-.7-.06-1.4-.18-2.05H12z"
        />
        <path
          fill="#34A853"
          d="M5.27 14.28l-.74.57-2.62 2.04C3.6 20.1 7.5 22.5 12 22.5c2.97 0 5.46-.98 7.28-2.66l-3.3-2.56c-.9.6-2.06.96-3.98.96-3.05 0-5.64-2.06-6.56-4.83z"
        />
        <path
          fill="#4285F4"
          d="M2.91 7.11A10.4 10.4 0 0 0 1.8 12c0 1.73.42 3.36 1.11 4.89l3.36-2.61A6.24 6.24 0 0 1 5.94 12c0-.81.14-1.59.39-2.31L2.91 7.11z"
        />
        <path
          fill="#FBBC05"
          d="M12 5.95c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.59 14.97 1.5 12 1.5 7.5 1.5 3.6 3.9 1.91 7.11l3.42 2.58C6.36 8.01 8.95 5.95 12 5.95z"
        />
      </svg>
      {loading ? "…" : label}
    </Button>
  );
}
