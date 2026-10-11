import { Suspense } from 'react'
import { SessionResultsView } from '@/components/session/SessionResultsView'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const instant = false

type ResultsPageProps = {
  params: Promise<{ topic: string }>
}

/**
 * Session results page.
 */
export default async function SessionResultsPage({ params }: ResultsPageProps) {
  const { topic } = await params
  return (
    <Suspense fallback={<LoadingSpinner label="Loading results…" />}>
      <SessionResultsView topicSlug={topic} />
    </Suspense>
  )
}
