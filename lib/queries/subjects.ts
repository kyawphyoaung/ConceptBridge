/**
 * Subject and topic query helpers (Section 3.2 / 3.3 / 7.2 / 7.3).
 */

import { createClient } from '@/lib/supabase/client'
import type { Subject, Topic } from '@/lib/types/database'

/**
 * List active subjects ordered by display_order.
 *
 * @example
 * const subjects = await listSubjects()
 */
export async function listSubjects(): Promise<Subject[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`[subjects.listSubjects] ${error.message}`)
  }

  return (data ?? []) as Subject[]
}

/**
 * Fetch a subject by slug.
 *
 * @example
 * const english = await getSubjectBySlug('english')
 */
export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(`[subjects.getSubjectBySlug] ${error.message}`)
  }

  return data as Subject | null
}

/**
 * List active topics for a subject, ordered by display_order.
 *
 * @example
 * const topics = await listTopicsBySubject(subjectId)
 */
export async function listTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`[subjects.listTopicsBySubject] ${error.message}`)
  }

  return (data ?? []) as Topic[]
}

/**
 * Fetch a topic by subject id + slug.
 *
 * @example
 * const topic = await getTopicBySlug(subjectId, 'abbreviations')
 */
export async function getTopicBySlug(
  subjectId: string,
  slug: string
): Promise<Topic | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(`[subjects.getTopicBySlug] ${error.message}`)
  }

  return data as Topic | null
}

/**
 * Fetch a subject by slug together with its active topics.
 *
 * @example
 * const result = await getSubjectWithTopics('philo')
 * // → { subject, topics } | null
 */
export async function getSubjectWithTopics(
  slug: string
): Promise<{ subject: Subject; topics: Topic[] } | null> {
  const subject = await getSubjectBySlug(slug)
  if (!subject) {
    return null
  }

  const topics = await listTopicsBySubject(subject.id)
  return { subject, topics }
}

/**
 * Fetch a topic by slug alone (unique per subject in practice; first match).
 *
 * @example
 * const topic = await getTopicBySlugAlone('abbreviations')
 */
export async function getTopicBySlugAlone(
  slug: string
): Promise<Topic | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`[subjects.getTopicBySlugAlone] ${error.message}`)
  }

  return data as Topic | null
}
