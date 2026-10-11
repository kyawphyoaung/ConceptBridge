/**
 * Grammar pattern query helpers (Section 3.5 / 7.2.4).
 */

import { createClient } from '@/lib/supabase/client'
import type {
  GrammarCategory,
  GrammarExample,
  GrammarPattern,
} from '@/lib/types/database'

export type CreateGrammarPatternInput = {
  slug: string
  name: string
  category: GrammarCategory
  trigger_words?: string[]
  target_auxiliary?: string | null
  transformation_rules?: Record<string, unknown>
  explanation_mm?: string | null
  explanation_en?: string | null
  examples?: GrammarExample[]
}

export type UpdateGrammarPatternInput = Partial<
  Omit<GrammarPattern, 'id'>
>

/**
 * List all grammar patterns ordered by name.
 *
 * @example
 * const patterns = await listGrammarPatterns()
 */
export async function listGrammarPatterns(): Promise<GrammarPattern[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grammar_patterns')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`[grammar.listGrammarPatterns] ${error.message}`)
  }

  return (data ?? []) as GrammarPattern[]
}

/**
 * Fetch a grammar pattern by slug.
 *
 * @example
 * const pattern = await getGrammarPatternBySlug('modal-auxiliaries')
 */
export async function getGrammarPatternBySlug(
  slug: string
): Promise<GrammarPattern | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grammar_patterns')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(`[grammar.getGrammarPatternBySlug] ${error.message}`)
  }

  return data as GrammarPattern | null
}

/**
 * Fetch a grammar pattern by id.
 *
 * @example
 * const pattern = await getGrammarPatternById(id)
 */
export async function getGrammarPatternById(
  id: string
): Promise<GrammarPattern | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grammar_patterns')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`[grammar.getGrammarPatternById] ${error.message}`)
  }

  return data as GrammarPattern | null
}

/**
 * Create a grammar pattern (admin only via RLS).
 */
export async function createGrammarPattern(
  input: CreateGrammarPatternInput
): Promise<GrammarPattern> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grammar_patterns')
    .insert({
      slug: input.slug,
      name: input.name,
      category: input.category,
      trigger_words: input.trigger_words ?? [],
      target_auxiliary: input.target_auxiliary ?? null,
      transformation_rules: input.transformation_rules ?? {},
      explanation_mm: input.explanation_mm ?? null,
      explanation_en: input.explanation_en ?? null,
      examples: input.examples ?? [],
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`[grammar.createGrammarPattern] ${error.message}`)
  }

  return data as GrammarPattern
}

/**
 * Update a grammar pattern (admin only via RLS).
 */
export async function updateGrammarPattern(
  id: string,
  updates: UpdateGrammarPatternInput
): Promise<GrammarPattern> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('grammar_patterns')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`[grammar.updateGrammarPattern] ${error.message}`)
  }

  return data as GrammarPattern
}

/**
 * Delete a grammar pattern (admin only via RLS).
 */
export async function deleteGrammarPattern(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('grammar_patterns')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`[grammar.deleteGrammarPattern] ${error.message}`)
  }
}
