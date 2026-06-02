export function AuthAmbient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="bg-app-bg absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 90% at 20% 22%, #1c1b2b 0%, #16151f 46%, #0c0c13 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(44% 36% at 15% 6%, color-mix(in oklab, var(--accent-glow) 15%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
        }}
      />
      <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,transparent_0%,transparent_28%,var(--color-app-bg)_52%)] lg:block" />
    </div>
  );
}
