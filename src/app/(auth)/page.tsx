import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, googleAuthEnabled } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthErrorToast } from "@/components/auth/AuthErrorToast";

export const metadata: Metadata = { title: "Sign in" };

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");
  return (
    <>
      <Suspense fallback={null}>
        <AuthErrorToast />
      </Suspense>
      <AuthForm googleEnabled={googleAuthEnabled} />
    </>
  );
}
