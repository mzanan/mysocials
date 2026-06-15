import { HeroCards } from "@/components/auth/HeroCards";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="light" className="bg-app-bg relative min-h-dvh overflow-hidden text-fg">
      <HeroCards />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <footer className="absolute inset-x-0 bottom-6 z-10 text-center text-xs text-fg-faint lg:bottom-8 lg:right-1/2">
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
