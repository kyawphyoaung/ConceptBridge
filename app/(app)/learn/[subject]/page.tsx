import { SubjectTopicsView } from '@/components/learn/SubjectTopicsView'

export const instant = false

type SubjectPageProps = {
  params: Promise<{ subject: string }>
}

/**
 * Subject topics browser.
 */
export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject } = await params
  return <SubjectTopicsView slug={subject} />
}
