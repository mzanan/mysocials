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
            ? "text-[2.9rem] leading-[1.04] font-bold tracking-tight text-balance text-fg sm:text-[3.4rem]"
            : "text-[1.9rem] leading-tight font-semibold tracking-tight text-fg"
        }
      >
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-fg-subtle">{subtitle}</p>}
      {children}
    </div>
  );
}
