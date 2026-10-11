import { Suspense } from 'react'
import { SessionView } from '@/components/session/SessionView'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const instant = false

type SessionPageProps = {
  params: Promise<{ topic: string }>
}

/**
 * Active quiz session for a topic.
 */
export default async function SessionPage({ params }: SessionPageProps) {
  const { topic } = await params
  return (
    <Suspense fallback={<LoadingSpinner label="Loading session…" />}>
      <SessionView topicSlug={topic} />
    </Suspense>
  )
}
