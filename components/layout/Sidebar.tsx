'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { RankBadge } from '@/components/shared/RankBadge'
import { SoundToggle } from '@/components/shared/SoundToggle'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.trim() || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

/**
 * Desktop/tablet sidebar (md+). Hidden below md.
 *
 * @example
 * <Sidebar />
 */
export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <motion.aside
      initial={false}
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card md:flex',
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center px-5">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          ConceptBridge
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          )
        })}

        {isAdmin ? (
          <Link
            href="/admin"
            className={cn(
              'flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
          >
            <Shield className="h-5 w-5 shrink-0" aria-hidden />
            Admin
          </Link>
        ) : null}
      </nav>

      <div className="mt-auto space-y-3 p-3">
        <Separator />
        <div className="flex items-center gap-2 px-1">
          <ThemeToggle />
          <SoundToggle />
        </div>
        <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(profile?.display_name, profile?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {profile?.display_name || profile?.email || 'Learner'}
            </p>
            {profile?.rank ? (
              <div className="mt-1">
                <RankBadge rank={profile.rank} size="sm" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
