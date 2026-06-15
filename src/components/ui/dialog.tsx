'use client'

import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const SIZE_CLASSES = {
  sm: 'w-[360px] max-w-[calc(100vw-2rem)]',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-2xl',
  xl: 'w-full max-w-4xl',
} as const

export type DialogSize = keyof typeof SIZE_CLASSES

export function Dialog({
  open,
  onOpenChange,
  size = 'sm',
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  size?: DialogSize
  children: ReactNode
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[9999] bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[9999] flex max-h-[85vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline-strong bg-app-bg text-fg shadow-[var(--shadow-card)]',
            SIZE_CLASSES[size],
          )}
        >
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-hairline-subtle px-5 py-4">
      {children}
      <RadixDialog.Close
        aria-label="Close"
        className="rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-strong hover:text-fg"
      >
        <X size={16} />
      </RadixDialog.Close>
    </div>
  )
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <RadixDialog.Title className="text-sm font-medium text-fg">{children}</RadixDialog.Title>
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return <RadixDialog.Description className="mt-1 text-sm text-fg-subtle">{children}</RadixDialog.Description>
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto p-5', className)}>{children}</div>
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-hairline-subtle px-5 py-4">
      {children}
    </div>
  )
}

export const DialogClose = RadixDialog.Close
