'use client'

import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { IconName } from '@/components/shared/EmptyState'

function getIcon(name: IconName): LucideIcon {
  return Icons[name] as LucideIcon
}

type ErrorStateProps = {
  title?: string
  message: string
  /** Lucide icon name as a string (safe across Server → Client boundary) */
  iconName?: IconName
  onRetry?: () => void
  className?: string
}

/**
 * Error state with optional retry.
 *
 * @example
 * <ErrorState iconName="AlertTriangle" message="Failed to load" onRetry={() => refetch()} />
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  iconName = 'AlertTriangle',
  onRetry,
  className,
}: ErrorStateProps) {
  const Icon = getIcon(iconName)

  return (
    <div
      className={cn(
        'flex min-h-[40dvh] flex-col items-center justify-center gap-3 px-4 text-center',
        className
      )}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <Icon className="h-7 w-7 text-destructive" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          className="mt-2 h-11 min-h-[44px] px-6"
          onClick={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  )
}
