'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSound } from '@/components/providers/SoundProvider'
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { insertAttempt } from '@/lib/queries/attempts'
import { getMistakeBank } from '@/lib/queries/progress'
import { listQuestionsByTopic } from '@/lib/queries/questions'
import {
  completeSession,
  createSession,
} from '@/lib/queries/sessions'
import { getTopicBySlugAlone } from '@/lib/queries/subjects'
import { flashcardToMcq } from '@/lib/logic/flashcardToMcq'
import {
  applyRequeue,
  buildSessionQueue,
  handleAnswer,
  type QueueItem,
} from '@/lib/logic/repetitiveLearning'
import type { Question, SessionMode, Topic } from '@/lib/types/database'

type SessionViewProps = {
  topicSlug: string
}

function parseMode(value: string | null): SessionMode {
  if (
    value === 'practice' ||
    value === 'review-mistakes' ||
    value === 'exam' ||
    value === 'guest'
  ) {
    return value
  }
  // mode=quiz is a UI flag for flashcard→MCQ; persist as practice
  return 'practice'
}

/**
 * Live quiz session: queue, answer, requeue, finish.
 */
export function SessionView({ topicSlug }: SessionViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const { playScore } = useSound()

  const rawMode = searchParams.get('mode')
  const isQuizMode = rawMode === 'quiz'
  const formatParam = searchParams.get('format')
  const idiomFormat =
    formatParam === 'mcq' || formatParam === 'sentence'
      ? formatParam
      : topicSlug === 'idioms'
        ? 'sentence'
        : undefined
  const modeParam = parseMode(rawMode)
  const countParam = Number(searchParams.get('count') ?? '10')
  const plannedCount = countParam === 20 ? 20 : 10

  const isGuest = profile?.is_guest === true || modeParam === 'guest'
  const sessionMode: SessionMode = isGuest ? 'guest' : modeParam
  const quizUiMode = sessionMode === 'exam' ? 'exam' : 'practice'

  const [topic, setTopic] = useState<Topic | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [index, setIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [scoreEarned, setScoreEarned] = useState(0)
  const [advancing, setAdvancing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const midSession = useRef(false)

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>()
    for (const q of questions) map.set(q.id, q)
    return map
  }, [questions])

  const currentItem = queue[index]
  const currentQuestionRaw = currentItem
    ? questionMap.get(currentItem.questionId) ?? null
    : null

  /** In quiz mode, flashcards become MCQs on the fly. */
  const currentQuestion = useMemo(() => {
    if (!currentQuestionRaw) return null
    if (
      isQuizMode &&
      currentQuestionRaw.question_type === 'flashcard'
    ) {
      return flashcardToMcq(currentQuestionRaw, questions)
    }
    return currentQuestionRaw
  }, [currentQuestionRaw, isQuizMode, questions])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const nextTopic = await getTopicBySlugAlone(topicSlug)
      if (!nextTopic) {
        setError('Topic not found')
        return
      }
      setTopic(nextTopic)

      const allQuestions = await listQuestionsByTopic(nextTopic.id)
      setQuestions(allQuestions)

      let mistakeIds: string[] = []
      if (user && !isGuest) {
        const mistakes = await getMistakeBank(user.id)
        mistakeIds = mistakes.map((m) => m.question_id)
      }

      const built = buildSessionQueue({
        questionIds: allQuestions.map((q) => q.id),
        totalQuestions: plannedCount,
        mode: sessionMode === 'guest' ? 'practice' : sessionMode,
        mistakeBankIds: mistakeIds,
      })
      setQueue(built)
      setIndex(0)
      setCorrectCount(0)
      setCompleted(0)
      setScoreEarned(0)

      if (user && !isGuest) {
        const session = await createSession({
          userId: user.id,
          subjectId: nextTopic.subject_id,
          topicId: nextTopic.id,
          sessionMode,
          questionsPlanned: built.length,
        })
        setSessionId(session.id)
      } else {
        setSessionId(null)
      }

      midSession.current = built.length > 0
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }, [topicSlug, user, isGuest, plannedCount, sessionMode])

  useEffect(() => {
    if (authLoading) return
    void load()
  }, [authLoading, load])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!midSession.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const finishSession = async (stats: {
    completed: number
    correct: number
    score: number
  }) => {
    midSession.current = false
    playScore()

    if (sessionId && user && !isGuest) {
      await completeSession(sessionId, {
        questionsCompleted: stats.completed,
        correctCount: stats.correct,
        scoreEarned: stats.score,
      })
      router.push(
        `/session/${topicSlug}/results?sessionId=${sessionId}`
      )
      return
    }

    const params = new URLSearchParams({
      correct: String(stats.correct),
      completed: String(stats.completed),
      score: String(stats.score),
      guest: '1',
    })
    router.push(`/session/${topicSlug}/results?${params.toString()}`)
  }

  const onSubmit = async (userAnswer: string, isCorrect: boolean) => {
    // Called only after the user clicks Continue in the question feedback panel.
    if (!currentQuestion || !topic || advancing) return
    setAdvancing(true)

    const nextCompleted = completed + 1
    const nextCorrect = correctCount + (isCorrect ? 1 : 0)
    const points = isCorrect
      ? currentQuestion.question_type === 'truth-table' ||
        currentQuestion.question_type === 'quantification'
        ? 2
        : currentQuestion.question_type === 'essay-question'
          ? 15
          : 1
      : 0
    const nextScore = scoreEarned + points

    setCompleted(nextCompleted)
    setCorrectCount(nextCorrect)
    setScoreEarned(nextScore)

    if (user && !isGuest && sessionId) {
      try {
        await insertAttempt({
          userId: user.id,
          questionId: currentQuestion.id,
          topicId: topic.id,
          sessionId,
          userAnswer,
          isCorrect,
          attemptNumber: 1,
        })
      } catch {
        // Continue session even if attempt logging fails
      }
    }

    let nextQueue = queue
    const result = handleAnswer({
      questionId: currentQuestion.id,
      isCorrect,
      currentQueue: queue,
      currentIndex: index,
    })
    if (result.requeue && result.requeueAtIndex !== null) {
      nextQueue = applyRequeue(
        queue,
        currentQuestion.id,
        result.requeueAtIndex
      )
      setQueue(nextQueue)
    }

    const nextIndex = index + 1
    if (nextIndex >= nextQueue.length) {
      await finishSession({
        completed: nextCompleted,
        correct: nextCorrect,
        score: nextScore,
      })
      return
    }
    setIndex(nextIndex)
    setAdvancing(false)
  }

  if (authLoading || loading) {
    return <LoadingSpinner label="Preparing session…" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />
  }

  if (!topic || queue.length === 0 || !currentQuestion) {
    return (
      <EmptyState
        iconName="Inbox"
        title="No questions available"
        description={
          sessionMode === 'review-mistakes'
            ? 'Your mistake bank is empty for this topic.'
            : 'Add questions to this topic before starting a session.'
        }
        action={
          <Button
            type="button"
            className="h-11 min-h-[44px]"
            onClick={() => router.back()}
          >
            Go back
          </Button>
        }
      />
    )
  }

  const progress = Math.round((completed / queue.length) * 100)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {isGuest ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
          Guest session — answers are not saved.
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{topic.name}</span>
          <span className="tabular-nums text-muted-foreground">
            {Math.min(completed + 1, queue.length)} / {queue.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id + '-' + index}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-border bg-card p-4 md:p-6"
        >
          <QuestionRenderer
            question={currentQuestion}
            onSubmit={(answer, correct) => {
              void onSubmit(answer, correct)
            }}
            mode={quizUiMode}
            format={idiomFormat}
            allTopicQuestions={questions}
            topicSlug={topicSlug}
          />
        </motion.div>
      </AnimatePresence>

    </div>
  )
}
