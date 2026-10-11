'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getProfile } from '@/lib/queries/profiles'
import type { Profile } from '@/lib/types/database'

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Tracks Supabase auth session + linked profile.
 * Guest users are identified via `profile.is_guest === true`.
 *
 * @example
 * <AuthProvider>{children}</AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const next = await getProfile(userId)
      setProfile(next)
    } catch {
      setProfile(null)
    }
  }, [])

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user: nextUser },
    } = await supabase.auth.getUser()
    setUser(nextUser)

    if (nextUser) {
      await loadProfile(nextUser.id)
    } else {
      setProfile(null)
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`[AuthProvider.signOut] ${error.message}`)
    }
    setUser(null)
    setProfile(null)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const init = async () => {
      setLoading(true)
      const {
        data: { user: nextUser },
      } = await supabase.auth.getUser()

      if (!mounted) return
      setUser(nextUser)

      if (nextUser) {
        await loadProfile(nextUser.id)
      } else {
        setProfile(null)
      }
      if (mounted) setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (nextUser) {
        void loadProfile(nextUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refresh,
      signOut,
    }),
    [user, profile, loading, refresh, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Access auth context.
 *
 * @example
 * const { user, profile, loading, signOut } = useAuth()
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
