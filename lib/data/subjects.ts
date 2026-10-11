/**
 * Sample subject definitions (already seeded via SQL migrations).
 * Kept here for documentation / generator reference.
 */

export const subjects = [
  {
    slug: 'english',
    name: 'English',
    description: 'Grammar, vocabulary, idioms, and essays.',
    icon: 'BookOpen',
    display_order: 1,
  },
  {
    slug: 'philo',
    name: 'Philo Major',
    description: 'Philosophy papers, MCQs, Q&A, and logic.',
    icon: 'GraduationCap',
    display_order: 2,
  },
] as const
