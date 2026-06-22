'use client'

import { useSyncExternalStore } from 'react'
import { Toaster as Sonner } from 'sonner'

type Theme = 'light' | 'dark'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function getServerSnapshot(): Theme {
  return 'dark'
}

export function Toaster() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <Sonner
      position="top-right"
      expand
      closeButton
      visibleToasts={3}
      theme={theme}
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border backdrop-blur-xl shadow-glass',
          success: '!text-success !border-success/40',
          error: '!text-danger !border-danger/40',
          info: '!text-info !border-info/40',
        },
      }}
    />
  )
}
