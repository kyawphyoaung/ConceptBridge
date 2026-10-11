# ConceptBridge — Context Summary (for new Cursor chat)

## Project
Next.js 16 + TypeScript + Tailwind + shadcn/ui + Supabase + Framer Motion.
Mobile-first. Folder: `~/Code/learning_assist/my-app`.

## Read these files first
1. `project_spec.md` — full spec
2. `lib/types/database.ts` — DB types
3. `lib/queries/*.ts` — data layer
4. `lib/logic/*.ts` — pure logic
5. `supabase/migrations/*.sql` — DB schema

## Completed Phases
- Phase 1: DB schema, RLS, triggers, seed (all pushed to Supabase)
- Phase 2: types + logic (truthTable, answerCheck, repetitiveLearning)
- Phase 3: query layer (10 files in lib/queries/)
- Phase 4: providers (Theme, Sound, Auth) + layout (Sidebar, BottomNav, TopBar) + shared components
- Phase 5: landing page, dashboard placeholder, guest mode, route guards
- Phase 6+7: learn browser, session flow, 8 question types, grammar UI, essay UI

## Key Conventions
- All data via lib/queries/*.ts (never supabase.from() in components)
- All logic via lib/logic/*.ts
- Icons passed as STRING names (e.g. iconName="Trophy"), not components
- Pages under app/(app)/ need `export const instant = false` (Next.js 16 warning)
- Mobile-first: 375px baseline, safe-area insets, bottom nav < md
- Sound via useSound(), theme via useTheme(), auth via useAuth()
- Guest: profile.is_guest === true; skip DB writes for attempts/progress

## Known Pending Fixes (Phase 8)
1. **Philo structure is WRONG** — currently 18 topics.
   Must be restructured as 4 Papers + Logic:
   - Paper 1 → (3101) Western Aesthetics + (3107) Eastern Aesthetics
   - Paper 3 → (3103) Philo of History I + (3109) Philo of History II
   - Paper 4 → (3104) Myanmar Culture I + (3110) Myanmar Culture II
   - Paper 5 → (3106) Ethics I + (3112) Ethics II
   - Logic → Truth Tables + Quantification
   Each Paper has 2 buttons: "MCQs" and "Questions & Answers"
   (rename "Essays" to "Questions & Answers" everywhere)

2. **Leaderboard must be admin-only** — remove from user nav,
   add to /admin/leaderboard

## DB Migration Convention
File: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
Push via: `npx supabase db push`

## Current DB Tables
profiles, subjects, topics, questions, grammar_patterns, essays,
essay_lines, essay_terms, quiz_attempts, user_progress, sessions,
rank_thresholds