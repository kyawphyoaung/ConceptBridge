-- =============================================================================
-- Migration: 20260101000010_restructure_philo_topics
-- Purpose: Group Philo topics into Papers (MCQ + Q&A) + Logic modules.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add grouping + mode columns to topics
-- -----------------------------------------------------------------------------
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS group_slug text;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS group_name text;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS group_subtitle text;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS group_order integer;

ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS mode text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'topics_mode_check'
      AND conrelid = 'public.topics'::regclass
  ) THEN
    ALTER TABLE public.topics
      ADD CONSTRAINT topics_mode_check
      CHECK (
        mode IS NULL
        OR mode IN ('mcq', 'qa', 'logic-truth-table', 'logic-quantification')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_topics_group_slug ON public.topics(group_slug);
CREATE INDEX IF NOT EXISTS idx_topics_group_order ON public.topics(group_order);

-- -----------------------------------------------------------------------------
-- 2. Replace Philo topics (cascades questions/attempts; sessions.topic_id → NULL)
-- -----------------------------------------------------------------------------
DELETE FROM public.topics
WHERE subject_id = (SELECT id FROM subjects WHERE slug = 'philo');

INSERT INTO public.topics (
  subject_id,
  slug,
  name,
  description,
  topic_type,
  mode,
  group_slug,
  group_name,
  group_subtitle,
  group_order,
  display_order,
  is_active
)
SELECT
  s.id,
  v.slug,
  v.name,
  v.description,
  v.topic_type,
  v.mode,
  v.group_slug,
  v.group_name,
  v.group_subtitle,
  v.group_order,
  v.display_order,
  true
FROM public.subjects s
CROSS JOIN (
  VALUES
    (
      'paper-1-mcq',
      'Paper 1 — MCQs',
      'MCQ practice for Aesthetics papers 3101 and 3107.',
      'mcq',
      'mcq',
      'paper-1',
      'Paper 1 — Aesthetics',
      '(3101) Western Aesthetics · (3107) Eastern Aesthetics',
      1,
      1
    ),
    (
      'paper-1-qa',
      'Paper 1 — Questions & Answers',
      'Questions & Answers for Aesthetics papers 3101 and 3107.',
      'essay',
      'qa',
      'paper-1',
      'Paper 1 — Aesthetics',
      '(3101) Western Aesthetics · (3107) Eastern Aesthetics',
      1,
      2
    ),
    (
      'paper-3-mcq',
      'Paper 3 — MCQs',
      'MCQ practice for Philosophy of History papers 3103 and 3109.',
      'mcq',
      'mcq',
      'paper-3',
      'Paper 3 — Philosophy of History',
      '(3103) · (3109)',
      3,
      3
    ),
    (
      'paper-3-qa',
      'Paper 3 — Questions & Answers',
      'Questions & Answers for Philosophy of History papers 3103 and 3109.',
      'essay',
      'qa',
      'paper-3',
      'Paper 3 — Philosophy of History',
      '(3103) · (3109)',
      3,
      4
    ),
    (
      'paper-4-mcq',
      'Paper 4 — MCQs',
      'MCQ practice for Myanmar Culture papers 3104 and 3110.',
      'mcq',
      'mcq',
      'paper-4',
      'Paper 4 — Myanmar Culture & Man''s Way of Thinking',
      '(3104) · (3110)',
      4,
      5
    ),
    (
      'paper-4-qa',
      'Paper 4 — Questions & Answers',
      'Questions & Answers for Myanmar Culture papers 3104 and 3110.',
      'essay',
      'qa',
      'paper-4',
      'Paper 4 — Myanmar Culture & Man''s Way of Thinking',
      '(3104) · (3110)',
      4,
      6
    ),
    (
      'paper-5-mcq',
      'Paper 5 — MCQs',
      'MCQ practice for Ethics papers 3106 and 3112.',
      'mcq',
      'mcq',
      'paper-5',
      'Paper 5 — Ethics',
      '(3106) · (3112)',
      5,
      7
    ),
    (
      'paper-5-qa',
      'Paper 5 — Questions & Answers',
      'Questions & Answers for Ethics papers 3106 and 3112.',
      'essay',
      'qa',
      'paper-5',
      'Paper 5 — Ethics',
      '(3106) · (3112)',
      5,
      8
    ),
    (
      'logic-truth-tables',
      'Truth Tables',
      'Fill truth tables and classify tautology / contradiction / contingency.',
      'truth-table',
      'logic-truth-table',
      'logic',
      'Logic',
      'Propositional + Quantificational Logic',
      6,
      9
    ),
    (
      'logic-quantification',
      'Quantification',
      'Drag-and-drop practice building quantificational answers.',
      'quantification',
      'logic-quantification',
      'logic',
      'Logic',
      'Propositional + Quantificational Logic',
      6,
      10
    )
) AS v(
  slug,
  name,
  description,
  topic_type,
  mode,
  group_slug,
  group_name,
  group_subtitle,
  group_order,
  display_order
)
WHERE s.slug = 'philo';
