'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { PageHeader } from '@/components/shared/PageHeader'
import { SoundToggle } from '@/components/shared/SoundToggle'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useSound } from '@/components/providers/SoundProvider'
import { THEMES } from '@/lib/themes'

/**
 * Settings: theme, sound, sign out.
 */
export function SettingsView() {
  const router = useRouter()
  const { signOut, profile } = useAuth()
  const { theme, darkMode } = useTheme()
  const { enabled: soundEnabled } = useSound()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/auth/login')
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Personalize ConceptBridge for your study sessions."
      />

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Current theme: {THEMES[theme].name}
          {darkMode ? ' (dark)' : ' (light)'}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">Change theme</span>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Sound</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Feedback sounds are {soundEnabled ? 'on' : 'off'}.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <SoundToggle />
          <span className="text-sm text-muted-foreground">Toggle sound</span>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as{' '}
          {profile?.email ||
            (profile?.is_guest ? 'Guest' : profile?.display_name || 'User')}
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-4 h-11 min-h-[44px]"
          disabled={signingOut}
          onClick={() => void handleSignOut()}
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </section>
    </div>
  )
}
