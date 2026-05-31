export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shadow-glass-lg relative w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl">
      <div className="absolute inset-0 rounded-3xl border border-white/[0.12] bg-white/[0.06] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)] backdrop-blur-2xl" />
      <div className="relative p-8">
        <h1 className="text-center text-[1.6rem] font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-1 text-center text-sm text-white/55">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
