# Seed Data Guide

ConceptBridge keeps sample/content seeds in TypeScript under `lib/data/`, then generates a SQL migration you can push to Supabase.

## Workflow

1. Edit or add content in `lib/data/*.ts`
2. Generate SQL:
   ```bash
   npm run seed:sql
   ```
3. Push the migration:
   ```bash
   npx supabase db push
   ```

Generated file:

`supabase/migrations/20260101000020_seed_content.sql`

Inserts are idempotent (`WHERE … NOT EXISTS`), so re-running is safe for the sample rows.

## Files

| File | Content |
|---|---|
| `lib/data/subjects.ts` | Subject slug reference |
| `lib/data/topics.ts` | Topic slug reference (English + Philo) |
| `lib/data/abbreviations.ts` | Flashcard terms |
| `lib/data/similes.ts` | Simile-fill questions |
| `lib/data/idioms.ts` | Idiom-transform questions |
| `lib/data/grammarQuestions.ts` | Sentence-transform samples per pattern |
| `lib/data/englishEssays.ts` | English essays + lines + terms |
| `lib/data/philoMcq.ts` | Philo MCQs per paper topic slug |
| `lib/data/philoQA.ts` | Philo Questions & Answers essays |
| `lib/data/logicQuestions.ts` | Truth-table + quantification samples |

## Examples

### Abbreviation
```ts
{ term: 'G.P.O', definition: 'General Post Office', category: 'abbreviation' }
```

### Philo MCQ
```ts
{
  topic_slug: 'paper-1-mcq',
  prompt: 'Western aesthetics primarily studies which of the following?',
  options: ['Beauty and art', 'Political power', 'Economic systems', 'Astronomy'],
  correct_index: 0,
  explanation: 'Aesthetics concerns beauty, art, and taste.',
  difficulty: 1,
}
```

### Grammar question
```ts
{
  pattern_slug: 'modal-auxiliaries',
  topic_slug: 'grammar-modal-auxiliaries',
  prompt: 'Rewrite using may/might.',
  original: 'Perhaps it will rain this evening.',
  answer: 'It may rain this evening.',
  transformation_hint: 'Use may/might for possibility',
  grammar_tags: ['modal', 'possibility'],
  difficulty: 1,
}
```

## Notes

- Topic/subject IDs are resolved in SQL by slug (`SELECT id FROM topics WHERE slug = …`).
- Philo paper topics use the Phase 8 slugs: `paper-1-mcq`, `paper-1-qa`, …, `logic-truth-tables`, `logic-quantification`.
- Bulk admin import (`/admin/import`) is separate: paste JSON with real `topic_id` UUIDs for ad-hoc inserts.
- Prefer adding large content sets in `lib/data/*.ts` so you can regenerate SQL consistently.
