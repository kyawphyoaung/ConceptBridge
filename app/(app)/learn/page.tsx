import { Suspense } from 'react'
import { LearnSubjectsView } from '@/components/learn/LearnSubjectsView'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const instant = false

/**
 * Learn subject browser.
 */
export default function LearnPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading learn…" />}>
      <LearnSubjectsView />
    </Suspense>
  )
}
