'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

/**
 * Admin-only layout guard. Non-admins redirect to /dashboard.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!profile || profile.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [profile, loading, router])

  if (loading) {
    return <LoadingSpinner label="Checking admin access…" />
  }

  if (!profile || profile.role !== 'admin') {
    return <LoadingSpinner label="Redirecting…" />
  }

  return <>{children}</>
}
