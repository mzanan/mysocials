'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SubscribeGate({ username }: { username: string }) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      await authClient.checkout({ slug: 'pro' })
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative w-full max-w-md rounded-3xl border border-hairline-strong bg-surface p-10 backdrop-blur-2xl shadow-glass-lg [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--accent-glow)_14%,transparent)_0%,transparent_60%)]"
        />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              Your page is ready
            </h1>
            <p className="text-sm text-fg-subtle">
              Publish at{' '}
              <span className="font-medium text-fg">/{username}</span>
            </p>
          </div>

          <div className="my-2 flex flex-col gap-3 text-left">
            <FeatureRow
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
              text="Your public link in bio"
            />
            <FeatureRow
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              text="Photo & video grids"
            />
            <FeatureRow
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              text="Custom themes & branding"
            />
          </div>

          <div className="my-1 h-px bg-hairline-strong" />

          <div className="flex flex-col gap-2">
            <Button
              variant="glassPrimary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Publish your page'
              )}
            </Button>
            <p className="text-xs text-fg-muted">
              $3/month · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-fg-subtle">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-strong text-fg-muted">
        {icon}
      </span>
      {text}
    </div>
  )
}
