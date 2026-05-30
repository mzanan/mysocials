import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-app-bg px-4 text-center">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.12),transparent_60%)]"
      />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-6">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Your links, beautifully alive.
        </h1>
        <p className="text-white/55">
          One stunning page for all your socials — your own photos and videos as a living
          background.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="link-btn flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.1] px-6 text-[15px] font-medium text-white transition hover:bg-white/[0.14]"
          >
            Create your page
          </Link>
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 text-[15px] font-medium text-white/80 transition hover:bg-white/[0.08]"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
