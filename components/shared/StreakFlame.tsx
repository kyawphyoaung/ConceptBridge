'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

type StreakFlameProps = {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-8 min-w-[44px] gap-1 px-2 text-xs',
  md: 'h-9 min-w-[44px] gap-1.5 px-2.5 text-sm',
  lg: 'h-11 min-w-[44px] gap-2 px-3 text-base',
} as const

const ICON_SIZES = {
  sm: 14,
  md: 18,
  lg: 22,
} as const

/**
 * Current streak with a pulsing flame when streak > 0.
 *
 * @example
 * <StreakFlame streak={5} size="sm" />
 */
export function StreakFlame({
  streak,
  size = 'md',
  className,
}: StreakFlameProps) {
  const active = streak > 0

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400',
        SIZE_CLASSES[size],
        className
      )}
      aria-label={`Current streak ${streak}`}
    >
      <motion.span
        animate={
          active
            ? { scale: [1, 1.15, 1], opacity: [1, 0.85, 1] }
            : { scale: 1, opacity: 0.5 }
        }
        transition={
          active
            ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
            : undefined
        }
        className="inline-flex"
      >
        <Flame size={ICON_SIZES[size]} aria-hidden fill="currentColor" />
      </motion.span>
      <span className="font-semibold tabular-nums">{streak}</span>
    </span>
  )
}
