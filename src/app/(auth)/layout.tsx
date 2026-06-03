import { AuthAmbient } from "@/components/auth/AuthAmbient";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { PhoneShowcase } from "@/components/PhoneMockup/PhoneShowcase";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-app-bg relative min-h-dvh overflow-hidden text-fg">
      <AuthAmbient />

      <div className="absolute inset-0 overflow-hidden lg:left-1/2">
        <AuthBackground />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_25%,rgba(0,0,0,0.88)_100%)] lg:bg-[linear-gradient(to_right,var(--color-app-bg)_0%,transparent_62%)]"
        />
        <PhoneShowcase />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div aria-hidden className="grain-overlay" />
    </div>
  );
}
