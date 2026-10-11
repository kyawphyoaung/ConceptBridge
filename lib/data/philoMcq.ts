export type PhiloMcqSeed = {
  topic_slug: string
  prompt: string
  options: string[]
  correct_index: number
  explanation: string
  difficulty: number
}

export const philoMcq: PhiloMcqSeed[] = [
  {
    topic_slug: 'paper-1-mcq',
    prompt: 'Western aesthetics primarily studies which of the following?',
    options: ['Beauty and art', 'Political power', 'Economic systems', 'Astronomy'],
    correct_index: 0,
    explanation: 'Aesthetics concerns beauty, art, and taste.',
    difficulty: 1,
  },
  {
    topic_slug: 'paper-1-mcq',
    prompt: 'Eastern aesthetics often emphasizes harmony between:',
    options: ['Humans and nature', 'Markets and states', 'Machines and code', 'Sports and media'],
    correct_index: 0,
    explanation: 'Many Eastern traditions stress harmony with nature.',
    difficulty: 1,
  },
  {
    topic_slug: 'paper-3-mcq',
    prompt: 'Philosophy of history asks questions about:',
    options: [
      'Meaning and patterns in historical change',
      'Only dates of kings',
      'Only geography maps',
      'Only grammar rules',
    ],
    correct_index: 0,
    explanation: 'It studies meaning, causality, and patterns in history.',
    difficulty: 2,
  },
  {
    topic_slug: 'paper-4-mcq',
    prompt: 'Myanmar culture studies often explore:',
    options: [
      'Ways of thinking and social values',
      'Only foreign stock markets',
      'Only computer networks',
      'Only sports scores',
    ],
    correct_index: 0,
    explanation: 'The papers examine culture and modes of thinking.',
    difficulty: 1,
  },
  {
    topic_slug: 'paper-5-mcq',
    prompt: 'Ethics is primarily concerned with:',
    options: ['Right and wrong action', 'Chemical formulas', 'Hardware design', 'Weather'],
    correct_index: 0,
    explanation: 'Ethics studies moral principles and right action.',
    difficulty: 1,
  },
]
