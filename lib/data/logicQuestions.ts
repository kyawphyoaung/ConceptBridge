export type TruthTableSeed = {
  prompt: string
  expression: string
  variables: string[]
  correct_truth_values: string[]
  classification: 'tautology' | 'contradiction' | 'contingency'
  explanation: string
  difficulty: number
}

export type QuantificationSeed = {
  prompt: string
  premises: string[]
  available_components: string[]
  correct_answer: string
  rule_applied: string
  difficulty: number
}

export const truthTableQuestions: TruthTableSeed[] = [
  {
    prompt: 'Complete the truth table and classify: P v ~P',
    expression: 'P v ~P',
    variables: ['P'],
    correct_truth_values: ['T', 'T'],
    classification: 'tautology',
    explanation: 'P or not-P is always true.',
    difficulty: 1,
  },
  {
    prompt: 'Complete the truth table and classify: P . ~P',
    expression: 'P . ~P',
    variables: ['P'],
    correct_truth_values: ['F', 'F'],
    classification: 'contradiction',
    explanation: 'P and not-P is never true.',
    difficulty: 1,
  },
  {
    prompt: 'Complete the truth table and classify: P v Q',
    expression: 'P v Q',
    variables: ['P', 'Q'],
    correct_truth_values: ['T', 'T', 'T', 'F'],
    classification: 'contingency',
    explanation: 'False only when both P and Q are false.',
    difficulty: 2,
  },
]

export const quantificationQuestions: QuantificationSeed[] = [
  {
    prompt: 'Build the quantificational form for: All men are human.',
    premises: ['Mx', 'Hx'],
    available_components: ['(x)', 'Mx', 'Hx', '→', '∧', '∨'],
    correct_answer: '(x)[Mx → Hx]',
    rule_applied: 'Universal generalization pattern',
    difficulty: 2,
  },
  {
    prompt: 'Select the correct instantiation pattern.',
    premises: ['(x)[Mx → Hx]', 'Ma'],
    available_components: ['Ma', 'Ha', '→', '∧'],
    correct_answer: 'Ma → Ha',
    rule_applied: 'Universal Instantiation',
    difficulty: 2,
  },
]
