export function AuthCard({
  title,
  subtitle,
  hero = false,
  children,
}: {
  title: React.ReactNode;
  subtitle?: string;
  hero?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[34px] bg-app-bg/55 backdrop-blur-2xl ring-1 ring-white/[0.12] lg:hidden"
        style={{
          boxShadow:
            "0 24px 70px -24px color-mix(in oklab, var(--accent-glow) 45%, transparent), 0 18px 50px -20px rgba(0,0,0,0.6)",
        }}
      />
      <div className="relative px-7 py-9 text-center sm:px-8 sm:py-10 lg:p-0 lg:text-left">
        <h1
          className={
            hero
              ? "text-[2.4rem] leading-[1.04] font-bold tracking-tight text-balance text-fg sm:text-[2.6rem] lg:text-[3.4rem]"
              : "text-[1.7rem] leading-tight font-semibold tracking-tight text-fg lg:text-[1.9rem]"
          }
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-fg-subtle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
