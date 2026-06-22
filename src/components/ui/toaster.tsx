'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      expand
      closeButton
      visibleToasts={3}
      theme="dark"
      richColors
      toastOptions={{
        classNames: {
          toast: 'rounded-xl backdrop-blur-xl shadow-glass',
        },
      }}
    />
  )
}
