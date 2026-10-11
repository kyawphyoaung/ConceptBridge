'use client'

import { cn } from '@/lib/utils'

type ProgressRingProps = {
  value: number
  max: number
  size?: number
  stroke?: number
  className?: string
  label?: string
}

/**
 * Simple SVG progress ring. Pass max=0 to show an empty placeholder ring.
 */
export function ProgressRing({
  value,
  max,
  size = 48,
  stroke = 4,
  className,
  label,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - ratio)

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-label={label ?? `Progress ${value} of ${max}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-muted-foreground">
        {max > 0 ? `${Math.round(ratio * 100)}%` : '0%'}
      </span>
    </div>
  )
}
