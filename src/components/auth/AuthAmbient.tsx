export function AuthAmbient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute -top-1/4 -left-1/4 h-[70%] w-[80%] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent-glow) 70%, transparent), transparent 65%)" }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[70%] w-[80%] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent-2) 55%, transparent), transparent 65%)" }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 h-[65%] w-[75%] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent-2) 65%, transparent), transparent 65%)" }}
      />
    </div>
  );
}
