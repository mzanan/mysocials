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
        className="absolute inset-0 rounded-[28px] bg-white/[0.02] backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08] lg:hidden"
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
