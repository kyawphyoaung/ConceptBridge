'use client'

import Link from 'next/link'
import { FlashcardQuestion } from '@/components/quiz/FlashcardQuestion'
import { IdiomMcqQuestion } from '@/components/quiz/IdiomMcqQuestion'
import { IdiomTransformQuestion } from '@/components/quiz/IdiomTransformQuestion'
import { MCQQuestion } from '@/components/quiz/MCQQuestion'
import { QuantificationQuestion } from '@/components/quiz/QuantificationQuestion'
import { SentenceTransformQuestion } from '@/components/quiz/SentenceTransformQuestion'
import { SimileFillQuestion } from '@/components/quiz/SimileFillQuestion'
import { TruthTableQuestion } from '@/components/quiz/TruthTableQuestion'
import type { BaseQuestionProps } from '@/components/quiz/types'
import { isEssayQuestionData } from '@/lib/types/database'
import type { Question } from '@/lib/types/database'

type QuestionRendererProps = BaseQuestionProps & {
  subjectSlug?: string
}

/**
 * Routes a Question to the correct type-specific UI.
 */
export function QuestionRenderer({
  question,
  onSubmit,
  mode,
  subjectSlug,
  format,
  allTopicQuestions = [],
  topicSlug,
}: QuestionRendererProps) {
  const isIdiomsTopic = topicSlug === 'idioms'

  switch (question.question_type) {
    case 'flashcard':
      return (
        <FlashcardQuestion question={question} onSubmit={onSubmit} mode={mode} />
      )
    case 'sentence-transform':
      if (isIdiomsTopic && format === 'mcq') {
        return (
          <IdiomMcqQuestion
            question={question}
            onSubmit={onSubmit}
            mode={mode}
            allTopicQuestions={allTopicQuestions}
          />
        )
      }
      return (
        <SentenceTransformQuestion
          question={question}
          onSubmit={onSubmit}
          mode={mode}
        />
      )
    case 'mcq':
      return <MCQQuestion question={question} onSubmit={onSubmit} mode={mode} />
    case 'simile-fill':
      return (
        <SimileFillQuestion question={question} onSubmit={onSubmit} mode={mode} />
      )
    case 'idiom-transform':
      if (format === 'mcq') {
        return (
          <IdiomMcqQuestion
            question={question}
            onSubmit={onSubmit}
            mode={mode}
            allTopicQuestions={allTopicQuestions}
          />
        )
      }
      return (
        <IdiomTransformQuestion
          question={question}
          onSubmit={onSubmit}
          mode={mode}
        />
      )
    case 'truth-table':
      return (
        <TruthTableQuestion question={question} onSubmit={onSubmit} mode={mode} />
      )
    case 'quantification':
      return (
        <QuantificationQuestion
          question={question}
          onSubmit={onSubmit}
          mode={mode}
        />
      )
    case 'essay-question':
      return <EssayQuestionFallback question={question} subjectSlug={subjectSlug} />
    default:
      return (
        <p className="text-sm text-destructive">
          Unsupported question type: {question.question_type}
        </p>
      )
  }
}

function EssayQuestionFallback({
  question,
  subjectSlug,
}: {
  question: Question
  subjectSlug?: string
}) {
  const data = isEssayQuestionData(question.question_data)
    ? question.question_data
    : null

  if (!data) {
    return <p className="text-sm text-destructive">Invalid essay-question data.</p>
  }

  const href = subjectSlug ? `/learn/${subjectSlug}` : '/learn'
  const isPhilo = subjectSlug === 'philo'

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="font-medium">{question.prompt}</p>
      <p className="text-sm text-muted-foreground">
        {isPhilo
          ? `This item links to a questions & answers entry (paper ${data.paper_code}). Open the reading view to study it.`
          : `This item links to an essay (paper ${data.paper_code}). Open the reading view to study it.`}
      </p>
      <Link href={href} className="text-sm font-medium text-primary underline">
        {isPhilo ? 'Open →' : 'Open essay →'}
      </Link>
    </div>
  )
}
