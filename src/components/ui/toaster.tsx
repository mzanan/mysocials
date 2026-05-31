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
            'rounded-xl border border-white/10 bg-app-bg/90 text-white backdrop-blur-xl shadow-[0_16px_50px_-30px_rgba(0,0,0,0.7)]',
          description: 'text-white/55',
        },
      }}
    />
  )
}
