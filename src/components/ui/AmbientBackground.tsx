export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--accent-glow) 20%, transparent), transparent 65%)',
        }}
      />
      <div
        className="absolute -right-40 top-1/3 h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklab, var(--accent-2) 16%, transparent), transparent 65%)',
        }}
      />
    </div>
  )
}
