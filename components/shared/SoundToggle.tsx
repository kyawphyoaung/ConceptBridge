'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSound } from '@/components/providers/SoundProvider'
import { cn } from '@/lib/utils'

type SoundToggleProps = {
  className?: string
}

/**
 * Toggles game sounds on/off.
 *
 * @example
 * <SoundToggle />
 */
export function SoundToggle({ className }: SoundToggleProps) {
  const { enabled, toggle, playClick } = useSound()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-11 w-11 min-h-[44px] min-w-[44px]', className)}
      onClick={() => {
        toggle()
        if (!enabled) {
          // About to enable — give a tiny click after toggle next tick
          window.setTimeout(() => playClick(), 0)
        }
      }}
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      aria-pressed={enabled}
    >
      {enabled ? (
        <Volume2 className="h-5 w-5" aria-hidden />
      ) : (
        <VolumeX className="h-5 w-5" aria-hidden />
      )}
    </Button>
  )
}
