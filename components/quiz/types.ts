import type { Question, SessionMode } from '@/lib/types/database'

export type QuizMode = Extract<SessionMode, 'practice' | 'exam' | 'review-mistakes' | 'guest'>

export type QuestionSubmitHandler = (
  userAnswer: string,
  isCorrect: boolean
) => void

export type IdiomPracticeFormat = 'mcq' | 'sentence'

export type BaseQuestionProps = {
  question: Question
  onSubmit: QuestionSubmitHandler
  mode: 'practice' | 'exam'
  /** Idioms topic: mcq vs full-sentence transform */
  format?: IdiomPracticeFormat
  /** Sibling questions (for MCQ distractors) */
  allTopicQuestions?: Question[]
  topicSlug?: string
}
