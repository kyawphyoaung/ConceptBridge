import { TopicDetailView } from '@/components/learn/TopicDetailView'

export const instant = false

type TopicPageProps = {
  params: Promise<{ subject: string; topic: string }>
}

/**
 * Topic detail with practice entry points.
 */
export default async function TopicPage({ params }: TopicPageProps) {
  const { subject, topic } = await params
  return <TopicDetailView subjectSlug={subject} topicSlug={topic} />
}
