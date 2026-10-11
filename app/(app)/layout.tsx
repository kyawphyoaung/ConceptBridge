'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

/**
 * Authenticated / guest app shell with auth guard.
 * Guests: Supabase anonymous session + profile.is_guest === true.
 */
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/auth/login')
      return
    }

    // Deactivated accounts (including guests if ever flagged)
    if (profile && profile.is_active === false) {
      void (async () => {
        try {
          await signOut()
        } finally {
          router.replace('/auth/login?error=deactivated')
        }
      })()
    }
  }, [user, profile, loading, router, signOut])

  if (loading) {
    return (
      <div className="min-h-dvh">
        <LoadingSpinner label="Loading…" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-dvh">
        <LoadingSpinner label="Redirecting to login…" />
      </div>
    )
  }

  if (profile && profile.is_active === false) {
    return (
      <div className="min-h-dvh">
        <LoadingSpinner label="Signing out…" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background">
      <TopBar />
      <Sidebar />
      <main className="min-h-dvh px-4 pb-20 pt-14 md:px-8 md:py-6 md:pb-6 md:pl-64 md:pt-6">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
