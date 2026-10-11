'use client'

import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type IconName = keyof typeof Icons

function getIcon(name: IconName): LucideIcon {
  return Icons[name] as LucideIcon
}

type EmptyStateProps = {
  /** Lucide icon name as a string (safe across Server → Client boundary) */
  iconName?: IconName
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Empty state with optional action.
 *
 * @example
 * <EmptyState iconName="Inbox" title="No questions yet" description="Check back later." />
 */
export function EmptyState({
  iconName = 'Inbox',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = getIcon(iconName)

  return (
    <div
      className={cn(
        'flex min-h-[40dvh] flex-col items-center justify-center gap-3 px-4 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
