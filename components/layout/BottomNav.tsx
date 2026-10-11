'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSound } from '@/components/providers/SoundProvider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const PRIMARY_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
] as const

/**
 * Mobile bottom navigation (< md). Fixed with safe-area padding.
 *
 * @example
 * <BottomNav />
 */
export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { playClick } = useSound()
  const [moreOpen, setMoreOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden',
          'pb-[env(safe-area-inset-bottom)]'
        )}
        aria-label="Mobile navigation"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-4">
          {PRIMARY_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <li key={item.href} className="flex">
                <Link
                  href={item.href}
                  onClick={() => playClick()}
                  className={cn(
                    'flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <motion.span
                    whileTap={{ scale: 0.9 }}
                    className="inline-flex h-11 w-11 items-center justify-center"
                  >
                    <Icon
                      className="h-5 w-5"
                      aria-hidden
                      fill={active ? 'currentColor' : 'none'}
                    />
                  </motion.span>
                  <span className="-mt-2">{item.label}</span>
                </Link>
              </li>
            )
          })}

          <li className="flex">
            <button
              type="button"
              onClick={() => {
                playClick()
                setMoreOpen(true)
              }}
              className={cn(
                'flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                moreOpen ||
                  pathname.startsWith('/settings') ||
                  pathname.startsWith('/admin')
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label="More"
            >
              <motion.span
                whileTap={{ scale: 0.9 }}
                className="inline-flex h-11 w-11 items-center justify-center"
              >
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </motion.span>
              <span className="-mt-2">More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="mt-2 flex flex-col gap-1 px-1 pb-2">
            <button
              type="button"
              className="flex min-h-[48px] items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent"
              onClick={() => {
                setMoreOpen(false)
                router.push('/settings')
              }}
            >
              <Settings className="h-5 w-5" aria-hidden />
              Settings
            </button>
            {isAdmin ? (
              <button
                type="button"
                className="flex min-h-[48px] items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent"
                onClick={() => {
                  setMoreOpen(false)
                  router.push('/admin')
                }}
              >
                <Shield className="h-5 w-5" aria-hidden />
                Admin
              </button>
            ) : null}
            <button
              type="button"
              className="flex min-h-[48px] items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive/10"
              onClick={async () => {
                setMoreOpen(false)
                await signOut()
                router.push('/auth/login')
              }}
            >
              <LogOut className="h-5 w-5" aria-hidden />
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
