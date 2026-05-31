'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useChangePassword } from './useChangePassword'

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { current, setCurrent, next, setNext, pending, submit } = useChangePassword(() =>
    onOpenChange(false),
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.12] bg-app-bg/95 p-6 text-white backdrop-blur-2xl shadow-glass-lg">
          <Dialog.Title className="text-base font-semibold">Change password</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-white/55">
            Enter your current password and a new one.
          </Dialog.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <Field label="Current password">
              <Input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </Field>
            <Field label="New password">
              <Input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
              />
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="glass">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="glassPrimary" disabled={pending}>
                {pending ? 'Saving…' : 'Update password'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
