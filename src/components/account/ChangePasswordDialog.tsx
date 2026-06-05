'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <DialogHeader>
        <DialogTitle>Change password</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <DialogDescription>Enter your current password and a new one.</DialogDescription>
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="glass">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="glassPrimary" disabled={pending}>
              {pending ? 'Saving…' : 'Update password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogBody>
    </Dialog>
  )
}
