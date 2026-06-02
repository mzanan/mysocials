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
    <div className="w-full">
      <h1
        className={
          hero
            ? "text-[2.9rem] leading-[1.04] font-bold tracking-tight text-balance text-white sm:text-[3.4rem]"
            : "text-[1.9rem] leading-tight font-semibold tracking-tight text-white"
        }
      >
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
      {children}
    </div>
  );
}
