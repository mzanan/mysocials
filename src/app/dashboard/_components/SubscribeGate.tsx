'use client'

import { useState, useSyncExternalStore } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Segmented } from '@/components/ui/segmented'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useCheckout } from './useCheckout'

type Device = 'desktop' | 'mobile'

const MOBILE_QUERY = '(max-width: 767px)'

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(MOBILE_QUERY)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  )
}

export function SubscribeGate({
  username,
  open,
  onOpenChange,
}: {
  username: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { checkout, loading } = useCheckout()
  const isMobile = useIsMobile()
  const [device, setDevice] = useState<Device>('desktop')
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const showMobile = isMobile || device === 'mobile'

  function handleOpenChange(next: boolean) {
    if (!next) setIframeLoaded(false)
    onOpenChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      size="full"
      aria-describedby={undefined}
      className="h-[85vh] p-0"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-hairline-subtle px-5 py-3">
        <div className="flex min-w-0 flex-col">
          <DialogTitle className="text-fg text-sm font-semibold">
            Your page is ready
          </DialogTitle>
          <Text variant="caption" className="truncate">
            Preview of /{username}
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            className="hidden md:inline-flex"
            size="sm"
            aria-label="Preview device"
            value={device}
            onChange={setDevice}
            options={[
              { value: 'desktop', label: 'Desktop' },
              { value: 'mobile', label: 'Mobile' },
            ]}
          />
          <DialogClose
            aria-label="Close"
            className="text-fg-subtle hover:bg-surface-strong hover:text-fg rounded-md p-1 transition-colors"
          >
            <X size={16} />
          </DialogClose>
        </div>
      </div>

      <div className="bg-surface-subtle relative flex min-h-0 flex-1 items-stretch justify-center overflow-hidden p-3 sm:p-5">
        <div
          className={cn(
            'bg-app-bg shadow-card relative h-full overflow-hidden',
            showMobile
              ? 'border-hairline-strong w-[380px] max-w-full rounded-[2rem] border'
              : 'border-hairline w-full rounded-xl border',
          )}
        >
          {!iframeLoaded && (
            <div className="absolute inset-0 grid place-items-center">
              <Spinner className="text-fg-subtle size-6" />
            </div>
          )}
          {open && (
            <iframe
              src="/preview"
              title="Live preview of your page"
              onLoad={() => setIframeLoaded(true)}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3 border-t border-hairline-subtle px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <Monitor size={15} className="text-fg-subtle hidden sm:block" />
          <Smartphone size={15} className="text-fg-subtle sm:hidden" />
          <Text variant="caption" className="text-fg-muted">
            This is exactly how your live page will look.
          </Text>
        </div>
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Text variant="caption" className="text-fg-muted">
            $3/month · Cancel anytime
          </Text>
          <Button
            variant="primary"
            onClick={checkout}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Spinner className="size-5" /> : 'Publish your page'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
