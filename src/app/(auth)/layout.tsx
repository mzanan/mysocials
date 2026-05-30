export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-bg px-4">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.10),transparent_60%)]"
      />
      {children}
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
