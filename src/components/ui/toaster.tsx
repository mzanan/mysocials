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
            'rounded-xl border border-white/10 bg-app-bg/90 text-white backdrop-blur-xl shadow-glass',
          description: 'text-white/55',
        },
      }}
    />
  )
}
