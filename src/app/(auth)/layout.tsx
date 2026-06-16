import { HeroCards } from "@/components/auth/HeroCards";
import { AuthAmbient } from "@/components/auth/AuthAmbient";
import { BrandFooter } from "@/components/ui/BrandFooter";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="light"
      className="relative min-h-dvh overflow-hidden bg-app-bg text-fg lg:grid lg:grid-cols-[2fr_3fr]"
    >
      <AuthAmbient />

      <div className="absolute inset-0 overflow-hidden lg:relative lg:order-2">
        <HeroCards />
      </div>

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-12 lg:order-1 lg:px-12">
        <div className="w-full max-w-sm">{children}</div>
        <BrandFooter overlay />
      </main>

      <div aria-hidden className="grain-overlay" />
    </div>
  );
}
