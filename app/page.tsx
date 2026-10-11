import { LandingPage } from '@/components/marketing/LandingPage'

export const instant = false

/**
 * Marketing landing (server segment so `instant` is allowed).
 */
export default function Page() {
  return <LandingPage />
}
