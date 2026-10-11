'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { RankBadge } from '@/components/shared/RankBadge'
import { StreakFlame } from '@/components/shared/StreakFlame'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function titleFromPath(pathname: string): string {
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/learn')) return 'Learn'
  if (pathname.startsWith('/profile')) return 'Profile'
  if (pathname.startsWith('/settings')) return 'Settings'
  if (pathname.startsWith('/admin/leaderboard')) return 'Leaderboard'
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/session')) return 'Session'
  return 'ConceptBridge'
}

/**
 * Mobile top bar (< md). Sticky with backdrop blur.
 *
 * @example
 * <TopBar />
 */
export function TopBar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const title = titleFromPath(pathname)

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden pt-[env(safe-area-inset-top)]"
      style={{ minHeight: 'calc(3.5rem + env(safe-area-inset-top))' }}
    >
      <div className="min-w-0">
        <Link
          href="/dashboard"
          className="block truncate text-base font-bold tracking-tight"
        >
          {title === 'ConceptBridge' ? 'ConceptBridge' : title}
        </Link>
        {title !== 'ConceptBridge' ? (
          <p className="truncate text-[11px] text-muted-foreground">
            ConceptBridge
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <StreakFlame streak={profile?.current_streak ?? 0} size="sm" />
        {profile?.rank ? <RankBadge rank={profile.rank} size="sm" /> : null}
        <Avatar size="sm" className="ml-1">
          <AvatarFallback>
            {getInitials(profile?.display_name, profile?.email)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
