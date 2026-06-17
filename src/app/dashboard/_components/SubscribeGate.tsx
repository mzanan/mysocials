'use client'

import { useState } from 'react'
import { Images, Link2, Palette } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

const FEATURES = [
  { icon: Link2, text: 'Your public link in bio' },
  { icon: Images, text: 'Photo & video grids' },
  { icon: Palette, text: 'Custom themes & branding' },
]

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
            <Text as="h1" variant="title">
              Your page is ready
            </Text>
            <Text variant="caption">
              Publish at <span className="font-medium text-fg">/{username}</span>
            </Text>
          </div>

          <div className="my-2 flex flex-col gap-3 text-left">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-fg-subtle">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-strong text-fg-muted">
                  <Icon size={18} />
                </span>
                {text}
              </div>
            ))}
          </div>

          <div className="my-1 h-px bg-hairline-strong" />

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? <Spinner className="size-5" /> : 'Publish your page'}
            </Button>
            <Text variant="caption" className="text-fg-muted">
              $3/month · Cancel anytime
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
