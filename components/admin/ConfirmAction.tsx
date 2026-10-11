'use client'

import { useMediaQuery } from '@/components/essay/useMediaQuery'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type ConfirmActionProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * Confirm destructive/sensitive actions — Sheet on mobile, Dialog on desktop.
 */
export function ConfirmAction({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = true,
  loading = false,
  onConfirm,
}: ConfirmActionProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  if (isDesktop) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              className={
                destructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              }
              onClick={(e) => {
                e.preventDefault()
                void handleConfirm()
              }}
            >
              {loading ? 'Working…' : confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            className="h-12 min-h-[44px] w-full"
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[44px] w-full"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
