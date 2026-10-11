/**
 * Profile query helpers (Section 3.1 / 7.5 / 7.7 / 7.8).
 * Uses the browser Supabase client; RLS enforces access.
 */

import { createClient } from '@/lib/supabase/client'
import type { Profile, ProfileUpdate, Role } from '@/lib/types/database'

/**
 * Fetch a single profile by user id.
 *
 * @example
 * const profile = await getProfile(userId)
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`[profiles.getProfile] ${error.message}`)
  }

  return data as Profile | null
}

/**
 * Fetch the profile for the currently authenticated user.
 * Returns null if there is no session or no profile row.
 *
 * @example
 * const me = await getCurrentProfile()
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw new Error(`[profiles.getCurrentProfile] ${authError.message}`)
  }
  if (!user) {
    return null
  }

  return getProfile(user.id)
}

/**
 * Update a profile and return the updated row.
 *
 * @example
 * const updated = await updateProfile(userId, { display_name: 'Aung' })
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[profiles.updateProfile] ${error.message}`)
  }

  return data as Profile
}

/**
 * Update theme preference and dark mode for a user.
 *
 * @example
 * await updateThemePreference(userId, 'forest', true)
 */
export async function updateThemePreference(
  userId: string,
  theme: string,
  darkMode: boolean
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      theme_preference: theme,
      dark_mode: darkMode,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`[profiles.updateThemePreference] ${error.message}`)
  }
}

/**
 * Touch last_active_at to now for the given user.
 *
 * @example
 * await touchLastActive(userId)
 */
export async function touchLastActive(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw new Error(`[profiles.touchLastActive] ${error.message}`)
  }
}

/**
 * List all profiles ordered by total_score desc (admin only via RLS).
 *
 * @example
 * const users = await listAllProfiles()
 */
export async function listAllProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('total_score', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`[profiles.listAllProfiles] ${error.message}`)
  }

  return (data ?? []) as Profile[]
}

/**
 * Activate or deactivate a user account (admin only via RLS).
 *
 * @example
 * await setUserActive(userId, false)
 */
export async function setUserActive(
  userId: string,
  isActive: boolean
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`[profiles.setUserActive] ${error.message}`)
  }
}

/**
 * Change a user's role (admin only via RLS).
 *
 * @example
 * await setUserRole(userId, 'admin')
 */
export async function setUserRole(userId: string, role: Role): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`[profiles.setUserRole] ${error.message}`)
  }
}

/**
 * Mark the currently authenticated user as a guest (`is_guest = true`).
 * Used after `signInAnonymously()`. Prefer also passing `is_guest: true`
 * in auth user metadata so `handle_new_user` sets it on insert.
 *
 * @example
 * await supabase.auth.signInAnonymously({ options: { data: { is_guest: true } } })
 * await markCurrentUserAsGuest()
 */
export async function markCurrentUserAsGuest(): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    throw new Error(`[profiles.markCurrentUserAsGuest] ${authError.message}`)
  }
  if (!user) {
    throw new Error('[profiles.markCurrentUserAsGuest] No authenticated user')
  }

  await updateProfile(user.id, {
    is_guest: true,
    display_name: 'Guest',
  })
}
