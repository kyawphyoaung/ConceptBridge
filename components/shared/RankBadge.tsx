'use client'

import { Award, Diamond, Gem, Medal, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type RankBadgeProps = {
  rank: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const RANK_STYLES: Record<
  string,
  { color: string; bg: string; Icon: typeof Medal }
> = {
  Bronze: { color: '#CD7F32', bg: 'bg-[#CD7F32]/15', Icon: Medal },
  Silver: { color: '#6B7280', bg: 'bg-[#C0C0C0]/25', Icon: Award },
  Gold: { color: '#D97706', bg: 'bg-[#FFD700]/20', Icon: Trophy },
  Platinum: { color: '#64748B', bg: 'bg-[#E5E4E2]/30', Icon: Gem },
  Diamond: { color: '#0EA5E9', bg: 'bg-[#B9F2FF]/30', Icon: Diamond },
}

const SIZE_CLASSES = {
  sm: 'h-6 min-w-[44px] gap-1 px-2 text-xs',
  md: 'h-8 min-w-[44px] gap-1.5 px-2.5 text-sm',
  lg: 'h-10 min-w-[44px] gap-2 px-3 text-base',
} as const

const ICON_SIZES = {
  sm: 12,
  md: 14,
  lg: 18,
} as const

/**
 * Rank badge with color + icon.
 *
 * @example
 * <RankBadge rank="Gold" size="sm" />
 */
export function RankBadge({
  rank,
  size = 'md',
  className,
}: RankBadgeProps) {
  const style = RANK_STYLES[rank] ?? RANK_STYLES.Bronze
  const Icon = style.Icon

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        style.bg,
        SIZE_CLASSES[size],
        className
      )}
      style={{ color: style.color }}
      aria-label={`Rank ${rank}`}
    >
      <Icon size={ICON_SIZES[size]} aria-hidden />
      <span>{rank}</span>
    </span>
  )
}
