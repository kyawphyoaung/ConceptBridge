export type GrammarQuestionSeed = {
  pattern_slug: string
  topic_slug: string
  prompt: string
  original: string
  answer: string
  transformation_hint: string
  grammar_tags: string[]
  difficulty: number
}

export const grammarQuestions: GrammarQuestionSeed[] = [
  {
    pattern_slug: 'modal-auxiliaries',
    topic_slug: 'grammar-modal-auxiliaries',
    prompt: 'Rewrite using may/might.',
    original: 'Perhaps it will rain this evening.',
    answer: 'It may rain this evening.',
    transformation_hint: 'Use may/might for possibility',
    grammar_tags: ['modal', 'possibility'],
    difficulty: 1,
  },
  {
    pattern_slug: 'third-person-singular',
    topic_slug: 'grammar-third-person',
    prompt: 'Change to singular form.',
    original: 'Igloos are circular snow houses used by Eskimos.',
    answer: 'An igloo is a circular snow house used by an Eskimo.',
    transformation_hint: 'Singular noun + verb agreement',
    grammar_tags: ['third-person-singular'],
    difficulty: 2,
  },
  {
    pattern_slug: 'wish',
    topic_slug: 'grammar-wish',
    prompt: 'Rewrite using wish.',
    original: 'I am sorry that I cannot speak French.',
    answer: 'I wish I could speak French.',
    transformation_hint: 'wish + could',
    grammar_tags: ['wish'],
    difficulty: 2,
  },
]
