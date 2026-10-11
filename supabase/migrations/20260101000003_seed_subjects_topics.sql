-- =============================================================================
-- Migration: 20260101000003_seed_subjects_topics.sql
-- Purpose: Seed subjects (english, philo) and all topics from Sections 7.2–7.3.
-- Uses INSERT ... ON CONFLICT DO NOTHING for idempotent re-runs.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Subjects
-- -----------------------------------------------------------------------------
INSERT INTO public.subjects (slug, name, description, icon, display_order, is_active)
VALUES
  (
    'english',
    'English',
    'Abbreviations, similes, idioms, grammar patterns, and essay reading for exam prep.',
    'book-open',
    1,
    true
  ),
  (
    'philo',
    'Philo Major',
    'Philosophy papers (aesthetics, history, culture, ethics) plus formal logic practice.',
    'brain',
    2,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- English topics (Section 7.2)
-- -----------------------------------------------------------------------------
INSERT INTO public.topics (subject_id, slug, name, description, topic_type, display_order, is_active)
SELECT s.id, v.slug, v.name, v.description, v.topic_type, v.display_order, true
FROM public.subjects s
CROSS JOIN (
  VALUES
    (
      'abbreviations',
      'Common Abbreviations',
      'Flashcard practice for common abbreviations (e.g. G.P.O).',
      'flashcard',
      1
    ),
    (
      'similes',
      'Similes',
      'Fill-in-the-blank simile practice.',
      'sentence-transform',
      2
    ),
    (
      'idioms',
      'Idiomatic Expressions',
      'Rewrite sentences using idiomatic expressions.',
      'sentence-transform',
      3
    ),
    (
      'grammar-third-person',
      'Grammar: Third Person Singular',
      'Transform sentences to/from third person singular.',
      'sentence-transform',
      4
    ),
    (
      'grammar-interrogative',
      'Grammar: Interrogative',
      'Transform statements into questions and related forms.',
      'sentence-transform',
      5
    ),
    (
      'grammar-modal-auxiliaries',
      'Grammar: Modal Auxiliaries',
      'Practice may/might and related modal transformations.',
      'sentence-transform',
      6
    ),
    (
      'grammar-deduction',
      'Grammar: Deduction',
      'Practice deduction forms (must be, etc.).',
      'sentence-transform',
      7
    ),
    (
      'grammar-causative',
      'Grammar: Causative Form',
      'Practice have + object + past participle.',
      'sentence-transform',
      8
    ),
    (
      'grammar-tenses',
      'Grammar: Tenses',
      'Practice tense transformations.',
      'sentence-transform',
      9
    ),
    (
      'grammar-wish',
      'Grammar: Wish',
      'Practice wish / if only constructions.',
      'sentence-transform',
      10
    ),
    (
      'essays',
      'Essays',
      'English essay reading with line-by-line Myanmar translations.',
      'essay',
      11
    )
) AS v(slug, name, description, topic_type, display_order)
WHERE s.slug = 'english'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Philo topics (Section 7.3) — 8 papers + logic modules
-- -----------------------------------------------------------------------------
INSERT INTO public.topics (subject_id, slug, name, description, topic_type, display_order, is_active)
SELECT s.id, v.slug, v.name, v.description, v.topic_type, v.display_order, true
FROM public.subjects s
CROSS JOIN (
  VALUES
    -- Paper pair 1: Aesthetics
    (
      'western-aesthetics-3101',
      'Western Aesthetics (3101)',
      'MCQ practice for Western Aesthetics paper 3101.',
      'mcq',
      1
    ),
    (
      'eastern-aesthetics-3107',
      'Eastern Aesthetics (3107)',
      'MCQ practice for Eastern Aesthetics paper 3107.',
      'mcq',
      2
    ),
    (
      'essay-western-aesthetics-3101',
      'Essays: Western Aesthetics (3101)',
      'Memorization essays for paper 3101.',
      'essay',
      3
    ),
    (
      'essay-eastern-aesthetics-3107',
      'Essays: Eastern Aesthetics (3107)',
      'Memorization essays for paper 3107.',
      'essay',
      4
    ),
    -- Paper pair 2: Philosophy of History
    (
      'philosophy-of-history-i-3103',
      'Philosophy of History I (3103)',
      'MCQ practice for Philosophy of History I paper 3103.',
      'mcq',
      5
    ),
    (
      'philosophy-of-history-ii-3109',
      'Philosophy of History II (3109)',
      'MCQ practice for Philosophy of History II paper 3109.',
      'mcq',
      6
    ),
    (
      'essay-philosophy-of-history-i-3103',
      'Essays: Philosophy of History I (3103)',
      'Memorization essays for paper 3103.',
      'essay',
      7
    ),
    (
      'essay-philosophy-of-history-ii-3109',
      'Essays: Philosophy of History II (3109)',
      'Memorization essays for paper 3109.',
      'essay',
      8
    ),
    -- Paper pair 3: Myanmar Culture
    (
      'myanmar-culture-i-3104',
      'Myanmar Culture & Man''s Way of Thinking I (3104)',
      'MCQ practice for Myanmar Culture I paper 3104.',
      'mcq',
      9
    ),
    (
      'myanmar-culture-ii-3110',
      'Myanmar Culture & Man''s Way of Thinking II (3110)',
      'MCQ practice for Myanmar Culture II paper 3110.',
      'mcq',
      10
    ),
    (
      'essay-myanmar-culture-i-3104',
      'Essays: Myanmar Culture I (3104)',
      'Memorization essays for paper 3104.',
      'essay',
      11
    ),
    (
      'essay-myanmar-culture-ii-3110',
      'Essays: Myanmar Culture II (3110)',
      'Memorization essays for paper 3110.',
      'essay',
      12
    ),
    -- Paper pair 4: Ethics
    (
      'ethics-i-3106',
      'Ethics I — Theoretical Ethics (3106)',
      'MCQ practice for Theoretical Ethics paper 3106.',
      'mcq',
      13
    ),
    (
      'ethics-ii-3112',
      'Ethics II — Applied Ethics (3112)',
      'MCQ practice for Applied Ethics paper 3112.',
      'mcq',
      14
    ),
    (
      'essay-ethics-i-3106',
      'Essays: Ethics I (3106)',
      'Memorization essays for paper 3106.',
      'essay',
      15
    ),
    (
      'essay-ethics-ii-3112',
      'Essays: Ethics II (3112)',
      'Memorization essays for paper 3112.',
      'essay',
      16
    ),
    -- Logic module (Section 7.4)
    (
      'truth-tables',
      'Propositional Logic — Truth Tables',
      'Fill truth tables and classify tautology / contradiction / contingency.',
      'truth-table',
      17
    ),
    (
      'quantification',
      'Quantificational Logic',
      'Drag-and-drop practice building quantificational answers.',
      'quantification',
      18
    )
) AS v(slug, name, description, topic_type, display_order)
WHERE s.slug = 'philo'
ON CONFLICT (subject_id, slug) DO NOTHING;
