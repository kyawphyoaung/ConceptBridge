import { EssayReaderView } from '@/components/essay/EssayReaderView'

export const instant = false

type EssayPageProps = {
  params: Promise<{ subject: string; topic: string; essayId: string }>
}

/**
 * Essay reading page (full English + line-by-line).
 */
export default async function EssayPage({ params }: EssayPageProps) {
  const { subject, topic, essayId } = await params
  return (
    <EssayReaderView
      essayId={essayId}
      subjectSlug={subject}
      topicSlug={topic}
    />
  )
}
