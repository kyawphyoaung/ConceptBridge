'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  description?: string
  backHref?: string
  actions?: ReactNode
  className?: string
}

/**
 * Reusable page header — stacked on mobile, row on desktop.
 *
 * @example
 * <PageHeader title="Learn" description="Pick a subject" backHref="/dashboard" />
 */
export function PageHeader({
  title,
  description,
  backHref,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-start md:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        {backHref ? (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="mt-0.5 h-11 w-11 min-h-[44px] min-w-[44px] shrink-0"
          >
            <Link href={backHref} aria-label="Go back">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
