# ConceptBridge — Project Specification

## 1. PROJECT OVERVIEW

**Name:** ConceptBridge

**Purpose:** A learning app for Myanmar students preparing for English and Philosophy (Philo Major) exams. Combines flashcard-based vocabulary learning, grammar pattern practice, MCQ quizzes, essay reading with line-by-line translations, and formal logic (propositional + quantificational) practice.

**Target Users:** ~30 users maximum. Myanmar students.

**Core Promise:** Repetitive learning system that adapts to user mistakes. All content is admin-editable (no hardcoded content).

---

## 2. TECH STACK (already set up)

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animation:** Framer Motion
- **Backend/DB/Auth:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting (later):** Vercel
- **Package manager:** npm

---

## 3. DATABASE SCHEMA

All tables in `public` schema. All tables have RLS enabled.

### 3.1 `profiles`
Extends `auth.users`. Auto-created via trigger on signup.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, references auth.users(id) ON DELETE CASCADE |
| email | text | |
| display_name | text | |
| role | text | 'user' or 'admin', default 'user' |
| is_guest | boolean | default false |
| is_active | boolean | default true (admin can deactivate) |
| total_score | integer | default 0 |
| current_streak | integer | default 0 |
| longest_streak | integer | default 0 |
| rank | text | computed: 'Bronze' / 'Silver' / 'Gold' / 'Platinum' / 'Diamond' |
| theme_preference | text | default 'default' |
| dark_mode | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| last_active_at | timestamptz | default now() |

**Rank thresholds (based on total_score):**
- Bronze: 0–99
- Silver: 100–299
- Gold: 300–599
- Platinum: 600–999
- Diamond: 1000+

### 3.2 `subjects`
Top-level categories (English, Philo).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| slug | text | unique, e.g., 'english', 'philo' |
| name | text | Display name |
| description | text | |
| icon | text | emoji or icon name |
| display_order | integer | |
| is_active | boolean | default true |

### 3.3 `topics`
Subcategories under a subject. Each topic maps to a question type.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| subject_id | uuid | FK subjects |
| slug | text | e.g., 'abbreviations', 'similes', 'modal-auxiliaries', 'grammar-third-person' |
| name | text | Display name |
| description | text | |
| topic_type | text | 'flashcard' / 'sentence-transform' / 'mcq' / 'essay' / 'truth-table' / 'quantification' / 'drag-drop' |
| display_order | integer | |
| is_active | boolean | default true |

### 3.4 `questions`
Universal question table. Uses `question_data` JSONB for type-specific fields.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| topic_id | uuid | FK topics |
| question_type | text | See section 3.4.1 |
| prompt | text | Question shown to user |
| correct_answer | text | Canonical answer (for text-input types) |
| explanation | text | Shown after answering |
| grammar_pattern_id | uuid | FK grammar_patterns (nullable) |
| difficulty | integer | 1=Easy, 2=Medium, 3=Hard, default 1 |
| question_data | jsonb | Type-specific data (see below) |
| display_order | integer | |
| is_active | boolean | default true |
| created_by | uuid | FK profiles |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

#### 3.4.1 `question_data` shapes by type

**`flashcard`** (Abbreviations)
```json
{ "term": "G.P.O", "definition": "General Post Office", "category": "abbreviation" }
```

**`sentence-transform`** (Grammar sentence rewriting)
```json
{
  "original": "Igloos are circular snow houses used by Eskimos.",
  "answer": "An igloo is a circular snow house used by an Eskimo.",
  "transformation_hint": "Change to singular form",
  "grammar_tags": ["third-person-singular"]
}
```

**`mcq`** (Philio MCQ, Theory MCQ)
```json
{
  "options": ["option A", "option B", "option C", "option D"],
  "correct_index": 2,
  "passage_id": null
}
```

**`simile-fill`**
```json
{
  "sentence": "His words were as .......... as ......., filling her heart with joy.",
  "answer": "beautiful as the rainbow",
  "hint_context": "His words brought joy",
  "acceptable_answers": ["beautiful as the rainbow", "bright as the rainbow"]
}
```

**`idiom-transform`**
```json
{
  "original": "I telephoned the office yesterday to ask about my application status.",
  "answer": "I called up the office yesterday to ask about my application status.",
  "idiom": "call up"
}
```

**`truth-table`**
```json
{
  "expression": "P v Q",
  "variables": ["P", "Q"],
  "correct_truth_values": ["T", "T", "T", "F"],
  "classification": "contingency",
  "explanation": "..."
}
```

**`quantification`**
```json
{
  "premises": ["Mx", "Hx", "(x)[Mx → Hx]"],
  "available_components": ["(x)", "Mx", "Hx", "→", "∧", "∨", "∀", "∃"],
  "correct_answer": "(x)[Mx → Hx]",
  "rule_applied": "Universal Instantiation"
}
```

**`essay-question`** (Philio)
```json
{
  "paper_code": "3101",
  "essay_id": "uuid-of-essay"
}
```

### 3.5 `grammar_patterns`
Grammar pattern definitions with trigger words and transformations.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| slug | text | e.g., 'modal-auxiliaries' |
| name | text | e.g., 'Modal Auxiliaries' |
| category | text | 'modal' / 'tense' / 'causative' / 'wish' / 'third-person' / 'interrogative' / 'deduction' |
| trigger_words | text[] | e.g., ['perhaps', 'guess', 'possible', 'permit'] |
| target_auxiliary | text | e.g., 'may/might' |
| transformation_rules | jsonb | Detailed rules |
| explanation_mm | text | Myanmar explanation |
| explanation_en | text | English explanation |
| examples | jsonb | Array of {from, to, note} |

**Seed grammar patterns** (from spec):
1. **Modal Auxiliaries**: trigger `perhaps, guess, possible, permit` → `may/might`
2. **Ability**: trigger `be able to, ability to, allow, permit` → `can/could`
3. **Future/Promise**: trigger `promise, be going to` → `will/would`
4. **Advice/Obligation**: trigger `advise, obligated to, ought to, advisable to` → `should`
5. **Necessity**: trigger `necessary, have to` → `must`
6. **Third Person Singular**
7. **Interrogative**
8. **Deduction**: `must be`
9. **Causative Form**: `have + object + past participle`
10. **Tenses** (various)
11. **Wish**

### 3.6 `essays`
Essay content (English subject + Philo).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| subject_id | uuid | FK subjects |
| paper_code | text | nullable, e.g., '3101' for Philo |
| title | text | |
| content_en | text | Full English essay |
| display_order | integer | |
| is_active | boolean | |

### 3.7 `essay_lines`
Line-by-line translation. Each essay_line = one line of the essay.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| essay_id | uuid | FK essays ON DELETE CASCADE |
| line_number | integer | |
| line_en | text | |
| line_mm | text | Myanmar translation |
| created_at | timestamptz | |

### 3.8 `essay_terms`
Difficult vocabulary words in essays.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| essay_id | uuid | FK essays ON DELETE CASCADE |
| term | text | Word/phrase in essay |
| definition_mm | text | Myanmar meaning |
| definition_en | text | English meaning |
| occurrence_line | integer | Which line it appears on |

### 3.9 `quiz_attempts`
Records every answer a user gives.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| question_id | uuid | FK questions |
| topic_id | uuid | FK topics (denormalized for fast query) |
| session_id | uuid | Groups attempts into one session |
| user_answer | text | What user typed/selected |
| is_correct | boolean | |
| time_taken_seconds | integer | nullable |
| attempt_number | integer | 1st, 2nd, 3rd time trying this question |
| created_at | timestamptz | default now() |

### 3.10 `user_progress`
Tracks progress per question for repetitive learning.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| question_id | uuid | FK questions |
| times_attempted | integer | default 0 |
| times_correct | integer | default 0 |
| consecutive_correct | integer | default 0 |
| last_attempted_at | timestamptz | |
| next_review_at | timestamptz | When to show again (repetitive learning) |
| mastery_level | integer | 0=unseen, 1=learning, 2=familiar, 3=mastered |
| is_in_mistake_bank | boolean | default false |
| UNIQUE | (user_id, question_id) | |

### 3.11 `sessions`
Quiz session metadata.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles (nullable for guests) |
| subject_id | uuid | FK subjects |
| topic_id | uuid | nullable (if mixed) |
| session_mode | text | 'practice' / 'review-mistakes' / 'exam' / 'guest' |
| questions_planned | integer | 10 or 20 |
| questions_completed | integer | default 0 |
| correct_count | integer | default 0 |
| score_earned | integer | default 0 |
| started_at | timestamptz | default now() |
| completed_at | timestamptz | nullable |

### 3.12 `rank_thresholds`
Configurable rank cutoffs.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| rank_name | text | Bronze, Silver, etc. |
| min_score | integer | |
| display_order | integer | |
| color | text | Hex color |
| icon | text | |

---

## 4. ROW LEVEL SECURITY (RLS) POLICIES

### `profiles`
- **SELECT own**: authenticated users can read their own row
- **SELECT all (admin)**: admins can read all rows
- **UPDATE own**: users can update their own (except `role`, `total_score`, `is_active`)
- **UPDATE all (admin)**: admins can update anyone
- **INSERT**: only via trigger (handle_new_user)

### `subjects`, `topics`, `questions`, `grammar_patterns`, `essays`, `essay_lines`, `essay_terms`, `rank_thresholds`
- **SELECT**: public (anon + authenticated) — anyone can read content
- **INSERT/UPDATE/DELETE**: admin only (check via `profiles.role = 'admin'`)

### `quiz_attempts`, `user_progress`, `sessions`
- **SELECT own**: users see their own
- **SELECT all (admin)**: admins see all
- **INSERT**: authenticated users (own user_id)
- **UPDATE own**: users can update their own
- **DELETE**: admin only

### Helper function for admin check
```sql
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;
```

---

## 5. TRIGGERS

### 5.1 On `auth.users` insert → create profile
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, display_name, is_guest)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'is_guest')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 5.2 On `quiz_attempts` insert → update progress + score
```sql
create or replace function public.handle_quiz_attempt()
returns trigger
language plpgsql
security definer
as $$
declare
  points int;
begin
  -- Determine points based on question_type
  select case q.question_type
    when 'essay-question' then 15
    when 'mcq' then 1
    when 'sentence-transform' then 1
    when 'simile-fill' then 1
    when 'idiom-transform' then 1
    when 'flashcard' then 1
    when 'truth-table' then 2
    when 'quantification' then 2
    else 1
  end into points
  from public.questions q where q.id = new.question_id;

  -- Upsert user_progress
  insert into public.user_progress (user_id, question_id, times_attempted, times_correct, consecutive_correct, last_attempted_at, is_in_mistake_bank)
  values (
    new.user_id,
    new.question_id,
    1,
    case when new.is_correct then 1 else 0 end,
    case when new.is_correct then 1 else 0 end,
    now(),
    not new.is_correct
  )
  on conflict (user_id, question_id) do update
  set
    times_attempted = user_progress.times_attempted + 1,
    times_correct = user_progress.times_correct + case when new.is_correct then 1 else 0 end,
    consecutive_correct = case when new.is_correct then user_progress.consecutive_correct + 1 else 0 end,
    last_attempted_at = now(),
    is_in_mistake_bank = case when new.is_correct and user_progress.consecutive_correct >= 2 then false else user_progress.is_in_mistake_bank end,
    mastery_level = case
      when new.is_correct and user_progress.consecutive_correct >= 2 then 3
      when new.is_correct then 2
      else 1
    end;

  -- Add score if correct (only for non-guest users — enforced at app level)
  if new.is_correct then
    update public.profiles
    set total_score = total_score + points,
        current_streak = current_streak + 1,
        longest_streak = greatest(longest_streak, current_streak + 1),
        updated_at = now()
    where id = new.user_id;
  else
    update public.profiles
    set current_streak = 0, updated_at = now()
    where id = new.user_id;
  end if;

  return new;
end;
$$;

create trigger on_quiz_attempt_created
  after insert on public.quiz_attempts
  for each row execute function public.handle_quiz_attempt();
```

### 5.3 Update `rank` on `total_score` change
```sql
create or replace function public.update_rank()
returns trigger
language plpgsql
as $$
begin
  new.rank := case
    when new.total_score >= 1000 then 'Diamond'
    when new.total_score >= 600 then 'Platinum'
    when new.total_score >= 300 then 'Gold'
    when new.total_score >= 100 then 'Silver'
    else 'Bronze'
  end;
  return new;
end;
$$;

create trigger on_profile_score_change
  before update of total_score on public.profiles
  for each row execute function public.update_rank();
```

---

## 6. REPETITIVE LEARNING ALGORITHM

**Goal:** Show a wrong question again after 3–4 other questions, then bring it back next session.

**Algorithm for building a session question queue:**

1. Start with a base list of questions from the chosen topic (or mixed).
2. **Mistake bank priority**: If user has questions in `user_progress` where `is_in_mistake_bank = true` AND `next_review_at <= now()`, include up to 40% of the session with those.
3. Fill the rest with fresh questions (never attempted or `mastery_level < 2`).
4. As user answers:
   - **Wrong answer**: insert into a "requeue" list, position = current_index + random(3, 4)
   - **Correct but slow/first-try**: don't requeue
   - **Correct after being requeued**: remove from requeue, mark progress
5. When session ends, any remaining requeued wrong answers go into `user_progress.is_in_mistake_bank = true` with `next_review_at = now() + interval '1 day'`.

**"Review Mistakes Only" mode**: session only pulls from `is_in_mistake_bank = true`.

**Mastery rule**: A question is "mastered" after 3 consecutive correct answers. Once mastered, it's removed from mistake bank permanently (unless missed again).

---

## 7. FEATURES BY MODULE

### 7.1 AUTHENTICATION
- Email/Password signup + login (Supabase Auth)
- Google OAuth login (via Supabase — requires VPN for Myanmar users, so Email/Password is primary)
- **Guest mode**: "Continue as Guest" button on login page → creates anonymous session (no DB persistence for progress)
- Logout
- Password reset (existing template page)

### 7.2 ENGLISH MODULE

#### 7.2.1 Common Abbreviations (Flashcard)
- Show abbreviation → user reveals answer (flip card)
- MCQ variant: show abbreviation, pick correct full form
- Both modes available; user chooses
- **Points**: 1 per correct

#### 7.2.2 Similes (Fill in the Blank)
- Sentence with blanks: "His words were as ___ as ___, filling her heart with joy."
- Text input with `acceptable_answers` array
- Show hint context
- **Points**: 1 per correct

#### 7.2.3 Idiomatic Expressions (Sentence Transform)
- Original sentence → rewrite using idiom
- Text input
- Show idiomatic expression after answer
- **Points**: 1 per correct

#### 7.2.4 Grammar (7 patterns)
For each pattern:
- **Learn mode**: Show grammar pattern explanation, trigger words, examples (from → to, with note)
- **Practice mode**: Given a question (sentence), user types the transformed answer
- **Feedback on answer**:
  - **Correct**: show which grammar pattern was used + transformation applied (v2 → v3 etc.)
  - **Wrong**: show the relevant grammar pattern as a hint + show correct answer
  - **Spelling error detected**: highlight the misspelled word ("You wrote 'beautifull' — did you mean 'beautiful'?")
  - **Whitespace normalized**: trim/normalize whitespace before comparing
- **Points**: 1 per correct

Grammar patterns to implement:
1. Third Person Singular
2. Interrogative
3. Modal Auxiliaries
4. Deduction
5. Causative Form
6. Tenses
7. Wish

#### 7.2.5 Essay (English subject)
- 2 essays total
- **View mode 1 (Full English)**: Essay in English; difficult words are clickable buttons; clicking shows popup with Myanmar meaning
- **View mode 2 (Line-by-line)**: Each line in English + Myanmar translation below it (toggle)
- No quiz on essay (reading only)

### 7.3 PHILO MAJOR MODULE

**4 subjects, 8 papers:**
1. Western Aesthetics (3101) + Eastern Aesthetics (3107)
2. Philosophy of History I (3103) + Philosophy of History II (3109)
3. Myanmar Culture & Man's Way of Thinking I (3104) + II (3110)
4. Ethics I - Theoretical Ethics (3106) + Ethics II - Applied Ethics (3112)

Each subject contains:
- **Memorization content (ကျက်စာ)**: 2 essays per paper, 4 essays per subject. Displayed like English essay (both modes: full + line-by-line, clickable terms with Myanmar meaning).
- **MCQ questions**: Per subject, no fixed count.
- No essay-writing question for Philo.

### 7.4 LOGIC MODULE (Philo)

#### 7.4.1 Propositional Logic — Truth Tables
- **Expression** given (e.g., `P v Q`)
- Two modes:
  - **Practice mode**: user fills cells one by one; app immediately validates each cell
  - **Exam mode**: fill all cells, then submit; validation on submit
- After completing the table:
  - User selects classification: Tautology / Contradiction / Contingency
  - Correct answer revealed with explanation
- **Points**: 2 per question
- **Truth table algorithm must be implemented in code** (not hardcoded answers) — parse expression, generate variable combinations (TTFF, TFTF...), evaluate.

#### 7.4.2 Quantification — Drag and Drop
- Given premises (e.g., `Mx`, `Hx`, `(x)[Mx → Hx]`)
- Available components displayed as draggable chips
- User drags components to build the answer
- Only need to select correct components (order NOT enforced)
- Single answer choice
- **Points**: 2 per question

### 7.5 USER DASHBOARD
- Total score, current streak (🔥 flame icon), longest streak
- Rank badge (Bronze/Silver/Gold/Platinum/Diamond) with color
- Progress per subject (circular progress ring)
- Progress per topic (bars)
- **History**: list of all sessions with date, subject, score, accuracy
- **Mistake review**: list of questions in mistake bank
- Recent activity feed

### 7.6 LEADERBOARD
- Top users by total_score
- Filter: All time / This week / This month
- Show rank badge, avatar (initials), streak flame
- Current user's position highlighted

### 7.7 ADMIN DASHBOARD (`/admin`)
- Only visible if `profiles.role = 'admin'`
- **Overview**: total users, active users, total questions, recent activity
- **Users**:
  - List all users (email, display_name, rank, score, streak, is_active, last_active)
  - Deactivate / reactivate user
  - Change user role (promote to admin)
  - View user's full history
- **Content Management** (CRUD):
  - Subjects: create/edit/delete
  - Topics: create/edit/delete
  - Questions: create/edit/delete, filter by topic/type
  - Grammar patterns: create/edit
  - Essays: create/edit, manage lines and terms
  - Rank thresholds: edit
- **Bulk import**: paste JSON → bulk insert questions

### 7.8 SETTINGS (User)
- Change display name
- Change theme (4 themes)
- Toggle dark mode
- Change password
- Delete account (with confirmation)

---

## 8. UI/UX SPEC

### 8.1 Design Language
- **Style**: Simple, Animated, Playful, Serious, Formal (blend — clean but lively)
- **Animation library**: Framer Motion (page transitions, card flips, button presses, score pops)
- **Sound**: soft, game-like. Correct = subtle "ding". Wrong = soft "thud". Not loud. Mute toggle.

### 8.2 Themes (4 theme colors, user-selectable)
1. **Default** — Blue/Indigo
2. **Forest** — Green/Teal
3. **Sunset** — Orange/Pink
4. **Mono** — Gray/Black

Each theme provides CSS variables. Dark mode toggles on top of any theme.

### 8.3 Language
- Interface: English (primary)
- Explanations: English + Myanmar (Myanmar shown only when needed, not always)
- All content can have `_mm` fields for Myanmar translations

### 8.4 Responsive (CRITICAL)

**Mobile-first design is the TOP priority.** The app must be optimized for mobile phones FIRST, then scale up to tablets and desktops.

**Design priority order:**
1. **Mobile (375px–767px)** — PRIMARY target. Most users will use phones.
2. **Tablet (768px–1023px)** — SECONDARY. Must work well.
3. **Desktop (1024px+)** — TERTIARY. Must be functional and look good, but not the design focus.

**Rules:**
- Design every component at 375px width FIRST, then scale up.
- Test every page at 375px, 768px, 1024px, 1440px widths.
- Touch targets minimum 44x44px (Apple HIG standard).
- Bottom navigation bar on mobile (thumb-friendly zone).
- Sidebar navigation on desktop/tablet (≥ 768px).
- Use Tailwind's `sm:`, `md:`, `lg:`, `xl:` breakpoints — never hardcode pixel widths.
- Font sizes: mobile 16px base minimum (prevents iOS zoom on input focus).
- Forms: use full-width inputs on mobile, side-by-side on desktop.
- Cards: stack vertically on mobile, grid on desktop.
- Modals: bottom-sheet style on mobile, centered on desktop.
- Tables: horizontal scroll on mobile OR convert to card list.
- Never rely on hover states (mobile has no hover) — always have tap/click alternative.
- Use `dvh` (dynamic viewport height) instead of `vh` for full-height layouts (handles mobile browser bars).
- Test with browser DevTools "iPhone 12 Pro" preset during development.

### 8.5 Key Screens
- `/` — Landing page (Hero, features, CTA to signup)
- `/auth/login`, `/auth/sign-up` — Auth pages (existing)
- `/dashboard` — User dashboard
- `/learn` — Subject/topic browser
- `/learn/[subject]` — Subject detail (topics list)
- `/learn/[subject]/[topic]` — Topic detail (modes, stats, start button)
- `/session/[topic]` — Active quiz session
- `/session/[topic]/results` — Session results
- `/leaderboard` — Leaderboard
- `/profile` — User profile + history
- `/admin` — Admin dashboard (protected)
- `/admin/users` — User management
- `/admin/questions` — Question management
- `/admin/essays` — Essay management

---

## 9. FILE STRUCTURE (proposed)

```
my-app/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                 # Landing
│   ├── auth/                        # (existing) — keep as-is
│   ├── (app)/
│   │   ├── layout.tsx               # App shell (nav, theme provider)
│   │   ├── dashboard/page.tsx
│   │   ├── learn/
│   │   │   ├── page.tsx
│   │   │   └── [subject]/
│   │   │       ├── page.tsx
│   │   │       └── [topic]/page.tsx
│   │   ├── session/
│   │   │   └── [topic]/
│   │   │       ├── page.tsx
│   │   │       └── results/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx               # Admin guard
│   │   ├── page.tsx
│   │   ├── users/page.tsx
│   │   ├── questions/page.tsx
│   │   ├── essays/page.tsx
│   │   └── import/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                          # shadcn (existing)
│   ├── auth/                        # (existing auth components)
│   ├── layout/                      # Nav, sidebar, footer
│   ├── quiz/
│   │   ├── QuestionRenderer.tsx
│   │   ├── FlashcardQuestion.tsx
│   │   ├── SentenceTransformQuestion.tsx
│   │   ├── MCQQuestion.tsx
│   │   ├── TruthTableQuestion.tsx
│   │   ├── QuantificationQuestion.tsx
│   │   ├── SimileFillQuestion.tsx
│   │   └── IdiomTransformQuestion.tsx
│   ├── essay/
│   │   ├── EssayFullView.tsx
│   │   └── EssayLineView.tsx
│   ├── grammar/
│   │   ├── PatternCard.tsx
│   │   └── PatternHint.tsx
│   ├── leaderboard/
│   ├── dashboard/
│   ├── admin/
│   └── shared/                      # ThemeToggle, SoundToggle, etc.
├── lib/
│   ├── supabase/                    # (existing)
│   ├── types/
│   │   └── database.ts              # TS types for all tables
│   ├── queries/
│   │   ├── profiles.ts
│   │   ├── questions.ts
│   │   ├── sessions.ts
│   │   ├── progress.ts
│   │   └── leaderboard.ts
│   ├── logic/
│   │   ├── truthTable.ts            # Truth table generator/evaluator
│   │   ├── answerCheck.ts           # Spelling, whitespace normalization
│   │   └── repetitiveLearning.ts    # Session queue algorithm
│   ├── data/                        # Seed data (TS files)
│   │   ├── subjects.ts
│   │   ├── topics.ts
│   │   ├── abbreviations.ts
│   │   ├── similes.ts
│   │   ├── idioms.ts
│   │   ├── grammarPatterns.ts
│   │   ├── grammarQuestions.ts
│   │   ├── essays.ts
│   │   ├── philoMcq.ts
│   │   └── logicQuestions.ts
│   ├── themes.ts                    # Theme definitions
│   └── utils.ts
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_triggers.sql
│       ├── 004_seed_subjects_topics.sql
│       ├── 005_seed_grammar_patterns.sql
│       ├── 006_seed_rank_thresholds.sql
│       └── 007_seed_content.sql     # Generated from lib/data/*.ts
├── project_spec.md                  # this file
├── PLAN.md                          # created by Cursor
└── ...
```

---

## 10. IMPLEMENTATION ORDER (Cursor must follow)

**Phase 1 — Database**
1. Create `supabase/migrations/001_initial_schema.sql` (all tables)
2. Create `002_rls_policies.sql`
3. Create `003_triggers.sql` (handle_new_user, handle_quiz_attempt, update_rank)
4. Create `004_seed_subjects_topics.sql`
5. Create `005_seed_grammar_patterns.sql`
6. Create `006_seed_rank_thresholds.sql`

**Phase 2 — Types & Logic**
7. `lib/types/database.ts` (TypeScript types for all tables)
8. `lib/logic/truthTable.ts` (truth table generator + tautology/contradiction check)
9. `lib/logic/answerCheck.ts` (spelling suggestions, whitespace normalization, Levenshtein)
10. `lib/logic/repetitiveLearning.ts` (session queue builder)

**Phase 3 — Data Layer**
11. `lib/queries/*.ts` (all Supabase queries)

**Phase 4 — Layout & Theme**
12. Theme provider + 4 themes + dark mode toggle
13. App shell (nav, sidebar, mobile bottom nav)
14. Sound provider

**Phase 5 — Auth Integration**
15. Ensure existing auth pages work
16. Add "Continue as Guest" flow
17. Add admin role check + `/admin` guard

**Phase 6 — Learning UI**
18. `/learn` subject browser
19. `/learn/[subject]` topic list
20. `/learn/[subject]/[topic]` topic detail
21. Question renderer + all question type components
22. Session page + queue logic
23. Results page

**Phase 7 — Essay UI**
24. Essay view (both modes)
25. Line-by-line toggle
26. Clickable terms with popup

**Phase 8 — Dashboard & Leaderboard**
27. User dashboard
28. History view
29. Leaderboard

**Phase 9 — Admin Dashboard**
30. `/admin` overview
31. User management
32. Content CRUD (subjects, topics, questions, essays, grammar patterns)
33. Bulk import (JSON paste → insert)

**Phase 10 — Polish**
34. Framer Motion animations everywhere
35. Sound effects
36. Loading states, error states, empty states
37. Mobile responsiveness audit

**Phase 11 — Seed Data**
38. Write `lib/data/*.ts` files with sample content (user will fill in bulk data later)
39. Create a script/page to convert `lib/data/*.ts` → SQL inserts

---

## 11. CONSTRAINTS & RULES

1. **No hardcoded content.** All questions, essays, patterns come from Supabase.
2. **No `any` type** in TypeScript unless absolutely necessary; prefer `unknown` + type guards.
3. **Reuse existing shadcn/ui components** wherever possible.
4. **All Supabase queries go through `lib/queries/*.ts`** — no direct `supabase.from()` calls in components.
5. **Server Components by default.** Use `'use client'` only when interactivity is needed.
6. **Handle loading + error + empty states** for every page.
7. **Mobile-first.** Test at 375px width.
8. **Accessibility**: focus rings, aria labels, keyboard navigation.
9. **Guest users**: `is_guest = true`, no data written to `quiz_attempts`, `user_progress`, `sessions`. Show a "Sign in to save progress" banner.
10. **Admin-only pages**: check `profiles.role = 'admin'` server-side; redirect non-admins to `/dashboard`.

---

## 12. DELIVERABLES

At the end, Cursor must produce:
- All SQL migration files (runnable in Supabase SQL editor)
- All TypeScript types
- All query helpers
- All UI components
- All pages
- A `README.md` explaining how to run
- A `SEED_DATA_GUIDE.md` explaining how to add content

**Do not skip steps. Do not merge phases. Ask before making architectural decisions not covered in this spec.**