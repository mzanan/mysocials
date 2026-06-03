'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl border border-hairline bg-app-bg/90 text-fg backdrop-blur-xl shadow-glass',
          description: 'text-fg-subtle',
        },
      }}
    />
  )
}
