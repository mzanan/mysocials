import { AuthBackground } from '@/components/auth/AuthBackground'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-bg px-4">
      <AuthBackground />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_30%,rgba(0,0,0,0.82)_100%)]"
      />
      <div className="relative z-10">{children}</div>
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
