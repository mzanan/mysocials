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
          className="absolute inset-0 hidden lg:block lg:bg-[linear-gradient(to_right,var(--color-app-bg)_0%,transparent_62%)]"
        />
        <PhoneShowcase />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <footer className="absolute bottom-6 left-6 z-10 text-xs text-fg-faint lg:bottom-8 lg:left-8">
        A product by{" "}
        <a
          href="https://itsmatias.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 transition-colors hover:text-fg-muted hover:underline"
        >
          itsmatias.com
        </a>
      </footer>

      <div aria-hidden className="grain-overlay" />
    </div>
  );
}
