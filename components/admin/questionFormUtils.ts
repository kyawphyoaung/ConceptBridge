import type {
  QuestionData,
  QuestionType,
  TruthClassification,
} from '@/lib/types/database'

export const QUESTION_TYPES: QuestionType[] = [
  'flashcard',
  'sentence-transform',
  'mcq',
  'simile-fill',
  'idiom-transform',
  'truth-table',
  'quantification',
  'essay-question',
]

export type QuestionFormValues = {
  topic_id: string
  question_type: QuestionType
  prompt: string
  correct_answer: string
  explanation: string
  difficulty: number
  grammar_pattern_id: string
  is_active: boolean
  // type-specific
  term: string
  definition: string
  category: string
  original: string
  answer: string
  hint: string
  tags: string
  optionsText: string
  correct_index: number
  sentence: string
  acceptable_answers: string
  idiom: string
  expression: string
  classification: TruthClassification
  tt_explanation: string
  premises: string
  components: string
  rule: string
  paper_code: string
  essay_id: string
}

export function emptyQuestionForm(
  defaults?: Partial<QuestionFormValues>
): QuestionFormValues {
  return {
    topic_id: '',
    question_type: 'mcq',
    prompt: '',
    correct_answer: '',
    explanation: '',
    difficulty: 1,
    grammar_pattern_id: '',
    is_active: true,
    term: '',
    definition: '',
    category: 'abbreviation',
    original: '',
    answer: '',
    hint: '',
    tags: '',
    optionsText: 'A\nB\nC\nD',
    correct_index: 0,
    sentence: '',
    acceptable_answers: '',
    idiom: '',
    expression: '',
    classification: 'contingency',
    tt_explanation: '',
    premises: '',
    components: '',
    rule: '',
    paper_code: '',
    essay_id: '',
    ...defaults,
  }
}

function splitLines(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function buildQuestionData(values: QuestionFormValues): QuestionData {
  switch (values.question_type) {
    case 'flashcard':
      return {
        term: values.term,
        definition: values.definition,
        category: values.category || 'abbreviation',
      }
    case 'sentence-transform':
      return {
        original: values.original,
        answer: values.answer,
        transformation_hint: values.hint,
        grammar_tags: splitLines(values.tags),
      }
    case 'mcq':
      return {
        options: splitLines(values.optionsText),
        correct_index: values.correct_index,
        passage_id: null,
      }
    case 'simile-fill':
      return {
        sentence: values.sentence,
        answer: values.answer,
        hint_context: values.hint,
        acceptable_answers: splitLines(values.acceptable_answers),
      }
    case 'idiom-transform':
      return {
        original: values.original,
        answer: values.answer,
        idiom: values.idiom,
      }
    case 'truth-table': {
      const vars = Array.from(
        new Set((values.expression.match(/[A-Z]/g) ?? []))
      )
      return {
        expression: values.expression,
        variables: vars,
        correct_truth_values: [],
        classification: values.classification,
        explanation: values.tt_explanation || values.explanation,
      }
    }
    case 'quantification':
      return {
        premises: splitLines(values.premises),
        available_components: splitLines(values.components),
        correct_answer: values.answer || values.correct_answer,
        rule_applied: values.rule,
      }
    case 'essay-question':
      return {
        paper_code: values.paper_code,
        essay_id: values.essay_id,
      }
  }
}

export function valuesFromQuestionData(
  type: QuestionType,
  data: QuestionData
): Partial<QuestionFormValues> {
  if (type === 'flashcard' && 'term' in data) {
    return {
      term: data.term,
      definition: data.definition,
      category: data.category,
    }
  }
  if (type === 'sentence-transform' && 'original' in data && 'grammar_tags' in data) {
    return {
      original: data.original,
      answer: data.answer,
      hint: data.transformation_hint,
      tags: data.grammar_tags.join(', '),
    }
  }
  if (type === 'mcq' && 'options' in data) {
    return {
      optionsText: data.options.join('\n'),
      correct_index: data.correct_index,
    }
  }
  if (type === 'simile-fill' && 'sentence' in data) {
    return {
      sentence: data.sentence,
      answer: data.answer,
      hint: data.hint_context,
      acceptable_answers: data.acceptable_answers.join('\n'),
    }
  }
  if (type === 'idiom-transform' && 'idiom' in data) {
    return {
      original: data.original,
      answer: data.answer,
      idiom: data.idiom,
    }
  }
  if (type === 'truth-table' && 'expression' in data) {
    return {
      expression: data.expression,
      classification: data.classification,
      tt_explanation: data.explanation,
    }
  }
  if (type === 'quantification' && 'premises' in data) {
    return {
      premises: data.premises.join('\n'),
      components: data.available_components.join('\n'),
      answer: data.correct_answer,
      rule: data.rule_applied,
    }
  }
  if (type === 'essay-question' && 'essay_id' in data) {
    return {
      paper_code: data.paper_code,
      essay_id: data.essay_id,
    }
  }
  return {}
}
