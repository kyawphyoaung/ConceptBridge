'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type LoadingSpinnerProps = {
  label?: string
  className?: string
}

/**
 * Centered loading spinner.
 *
 * @example
 * <LoadingSpinner label="Loading dashboard…" />
 */
export function LoadingSpinner({
  label = 'Loading…',
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'flex min-h-[40dvh] flex-col items-center justify-center gap-3',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-muted border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
