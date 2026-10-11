/**
 * Convert a flashcard question into an MCQ using distractors from the same topic.
 * Pure helper — no I/O.
 */

import {
  isFlashcardData,
  type FlashcardData,
  type MCQData,
  type Question,
} from '@/lib/types/database'

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]!
    items[j] = tmp!
  }
  return items
}

function getDefinition(q: Question): string | null {
  if (!isFlashcardData(q.question_data)) return null
  return q.question_data.definition
}

/**
 * Build an MCQ Question from a flashcard, using other topic flashcards as wrong options.
 * Falls back to the original flashcard if the source is not a flashcard.
 *
 * @example
 * const mcq = flashcardToMcq(current, allTopicQuestions)
 */
export function flashcardToMcq(
  question: Question,
  allQuestions: Question[]
): Question {
  if (!isFlashcardData(question.question_data)) {
    return question
  }

  const data: FlashcardData = question.question_data
  const correct = data.definition

  const distractors = allQuestions
    .filter((q) => q.id !== question.id && q.question_type === 'flashcard')
    .map(getDefinition)
    .filter((d): d is string => typeof d === 'string' && d !== correct)

  const uniqueDistractors = Array.from(new Set(distractors))
  shuffleInPlace(uniqueDistractors)

  // Need 3 wrong options; if fewer, pad with placeholders then fall back to flashcard
  if (uniqueDistractors.length < 3) {
    // Not enough distractors — keep as flashcard self-rating
    return question
  }

  const wrong = uniqueDistractors.slice(0, 3)
  const options = shuffleInPlace([correct, ...wrong])
  const correct_index = options.indexOf(correct)

  const mcqData: MCQData = {
    options,
    correct_index,
    passage_id: null,
  }

  return {
    ...question,
    question_type: 'mcq',
    prompt: data.term,
    correct_answer: correct,
    explanation:
      question.explanation ??
      `${data.term} stands for “${correct}”.`,
    question_data: mcqData,
  }
}
