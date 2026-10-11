-- =============================================================================
-- Migration: 20260101000004_seed_grammar_patterns.sql
-- Purpose: Seed all 11 grammar patterns from Section 3.5, including
--          trigger_words arrays and transformation_rules JSONB.
-- Uses INSERT ... ON CONFLICT (slug) DO NOTHING for idempotent re-runs.
-- =============================================================================

INSERT INTO public.grammar_patterns (
  slug,
  name,
  category,
  trigger_words,
  target_auxiliary,
  transformation_rules,
  explanation_mm,
  explanation_en,
  examples
)
VALUES
  -- 1. Modal Auxiliaries
  (
    'modal-auxiliaries',
    'Modal Auxiliaries',
    'modal',
    ARRAY['perhaps', 'guess', 'possible', 'permit'],
    'may/might',
    '{
      "direction": "to_modal",
      "replace_triggers": true,
      "rules": [
        {"trigger": "perhaps", "auxiliary": "may/might", "note": "Possibility"},
        {"trigger": "guess", "auxiliary": "may/might", "note": "Guessed possibility"},
        {"trigger": "possible", "auxiliary": "may/might", "note": "It is possible that → may/might"},
        {"trigger": "permit", "auxiliary": "may/might", "note": "Permission"}
      ]
    }'::jsonb,
    'ဖြစ်နိုင်ခြေ သို့မဟုတ် ခွင့်ပြုချက်ကို may/might ဖြင့် ပြောင်းရေးပါ။',
    'Rewrite sentences expressing possibility or permission using may/might.',
    '[
      {"from": "Perhaps he will come tomorrow.", "to": "He may/might come tomorrow.", "note": "perhaps → may/might"},
      {"from": "It is possible that she is at home.", "to": "She may/might be at home.", "note": "possible → may/might"}
    ]'::jsonb
  ),

  -- 2. Ability
  (
    'ability',
    'Ability',
    'modal',
    ARRAY['be able to', 'ability to', 'allow', 'permit'],
    'can/could',
    '{
      "direction": "to_modal",
      "replace_triggers": true,
      "rules": [
        {"trigger": "be able to", "auxiliary": "can/could", "note": "Ability"},
        {"trigger": "ability to", "auxiliary": "can/could", "note": "Noun phrase → modal"},
        {"trigger": "allow", "auxiliary": "can/could", "note": "Permission/ability"},
        {"trigger": "permit", "auxiliary": "can/could", "note": "Permission"}
      ]
    }'::jsonb,
    'စွမ်းရည် သို့မဟုတ် ခွင့်ပြုချက်ကို can/could ဖြင့် ပြောင်းရေးပါ။',
    'Rewrite sentences expressing ability or permission using can/could.',
    '[
      {"from": "She is able to swim well.", "to": "She can swim well.", "note": "be able to → can"},
      {"from": "He had the ability to solve the problem.", "to": "He could solve the problem.", "note": "ability to → could"}
    ]'::jsonb
  ),

  -- 3. Future / Promise
  (
    'future-promise',
    'Future / Promise',
    'modal',
    ARRAY['promise', 'be going to'],
    'will/would',
    '{
      "direction": "to_modal",
      "replace_triggers": true,
      "rules": [
        {"trigger": "promise", "auxiliary": "will/would", "note": "Promise → will"},
        {"trigger": "be going to", "auxiliary": "will/would", "note": "Future intention → will"}
      ]
    }'::jsonb,
    'ကတိ သို့မဟုတ် အနာဂတ်ရည်ရွယ်ချက်ကို will/would ဖြင့် ပြောင်းရေးပါ။',
    'Rewrite promises and future intentions using will/would.',
    '[
      {"from": "I promise to help you.", "to": "I will help you.", "note": "promise → will"},
      {"from": "She is going to visit Yangon.", "to": "She will visit Yangon.", "note": "be going to → will"}
    ]'::jsonb
  ),

  -- 4. Advice / Obligation
  (
    'advice-obligation',
    'Advice / Obligation',
    'modal',
    ARRAY['advise', 'obligated to', 'ought to', 'advisable to'],
    'should',
    '{
      "direction": "to_modal",
      "replace_triggers": true,
      "rules": [
        {"trigger": "advise", "auxiliary": "should", "note": "Advice"},
        {"trigger": "obligated to", "auxiliary": "should", "note": "Soft obligation"},
        {"trigger": "ought to", "auxiliary": "should", "note": "Moral advice"},
        {"trigger": "advisable to", "auxiliary": "should", "note": "Recommendation"}
      ]
    }'::jsonb,
    'အကြံပြုချက် သို့မဟုတ် တာဝန်ကို should ဖြင့် ပြောင်းရေးပါ။',
    'Rewrite advice or soft obligation using should.',
    '[
      {"from": "I advise you to study hard.", "to": "You should study hard.", "note": "advise → should"},
      {"from": "It is advisable to arrive early.", "to": "You should arrive early.", "note": "advisable to → should"}
    ]'::jsonb
  ),

  -- 5. Necessity
  (
    'necessity',
    'Necessity',
    'modal',
    ARRAY['necessary', 'have to'],
    'must',
    '{
      "direction": "to_modal",
      "replace_triggers": true,
      "rules": [
        {"trigger": "necessary", "auxiliary": "must", "note": "Necessity"},
        {"trigger": "have to", "auxiliary": "must", "note": "Obligation/necessity"}
      ]
    }'::jsonb,
    'လိုအပ်ချက်ကို must ဖြင့် ပြောင်းရေးပါ။',
    'Rewrite necessity using must.',
    '[
      {"from": "It is necessary for you to leave now.", "to": "You must leave now.", "note": "necessary → must"},
      {"from": "They have to finish the work today.", "to": "They must finish the work today.", "note": "have to → must"}
    ]'::jsonb
  ),

  -- 6. Third Person Singular
  (
    'third-person-singular',
    'Third Person Singular',
    'third-person',
    ARRAY['he', 'she', 'it', 'singular'],
    NULL,
    '{
      "direction": "plural_to_singular",
      "rules": [
        {"change": "subject", "from": "plural", "to": "singular", "note": "Change plural subject to singular"},
        {"change": "verb", "from": "base/plural", "to": "third-person-s", "note": "Add -s/-es to verb"},
        {"change": "articles", "from": "a/an optional", "to": "match singular noun", "note": "Adjust articles and determiners"}
      ]
    }'::jsonb,
    'အများကိန်းမှ တစ်ဦးချင်း (third person singular) သို့ ပြောင်းရေးပါ။',
    'Rewrite plural statements into third person singular form.',
    '[
      {"from": "Igloos are circular snow houses used by Eskimos.", "to": "An igloo is a circular snow house used by an Eskimo.", "note": "plural → singular + verb agreement"},
      {"from": "Cats catch mice.", "to": "A cat catches mice.", "note": "Add -es to catch"}
    ]'::jsonb
  ),

  -- 7. Interrogative
  (
    'interrogative',
    'Interrogative',
    'interrogative',
    ARRAY['ask', 'question', 'whether', 'if'],
    NULL,
    '{
      "direction": "statement_to_question",
      "rules": [
        {"change": "word_order", "note": "Invert subject and auxiliary"},
        {"change": "do_support", "note": "Add do/does/did when no auxiliary is present"},
        {"change": "punctuation", "to": "?", "note": "End with question mark"}
      ]
    }'::jsonb,
    'ကြေညာဝါကျကို မေးခွန်းပုံစံသို့ ပြောင်းရေးပါ။',
    'Transform statements into interrogative (question) form.',
    '[
      {"from": "She lives in Mandalay.", "to": "Does she live in Mandalay?", "note": "do-support with does"},
      {"from": "They have finished the test.", "to": "Have they finished the test?", "note": "Invert have + subject"}
    ]'::jsonb
  ),

  -- 8. Deduction
  (
    'deduction',
    'Deduction',
    'deduction',
    ARRAY['certainly', 'surely', 'definitely', 'must be'],
    'must be',
    '{
      "direction": "to_deduction",
      "replace_triggers": true,
      "rules": [
        {"trigger": "certainly", "auxiliary": "must be", "note": "Logical certainty"},
        {"trigger": "surely", "auxiliary": "must be", "note": "Strong inference"},
        {"trigger": "definitely", "auxiliary": "must be", "note": "Definite conclusion"}
      ]
    }'::jsonb,
    'သေချာသော ကောက်ချက်ကို must be ဖြင့် ပြောင်းရေးပါ။',
    'Rewrite logical deductions using must be.',
    '[
      {"from": "He is certainly at home now.", "to": "He must be at home now.", "note": "certainly → must be"},
      {"from": "She is definitely the winner.", "to": "She must be the winner.", "note": "definitely → must be"}
    ]'::jsonb
  ),

  -- 9. Causative Form
  (
    'causative-form',
    'Causative Form',
    'causative',
    ARRAY['ask someone to', 'get someone to', 'make someone', 'have something done'],
    'have + object + past participle',
    '{
      "direction": "to_causative",
      "pattern": "have + object + V3",
      "rules": [
        {"from": "ask/get someone to do X", "to": "have someone do X / have X done", "note": "Causative have"},
        {"from": "make someone do X", "to": "have X done (passive causative)", "note": "Focus on result"}
      ]
    }'::jsonb,
    'သူတစ်ပါးအား လုပ်ခိုင်းခြင်းကို have + object + past participle ပုံစံဖြင့် ပြောင်းရေးပါ။',
    'Rewrite using causative have + object + past participle.',
    '[
      {"from": "I asked the mechanic to repair my car.", "to": "I had my car repaired.", "note": "have + object + V3"},
      {"from": "She got someone to paint the house.", "to": "She had the house painted.", "note": "causative result focus"}
    ]'::jsonb
  ),

  -- 10. Tenses
  (
    'tenses',
    'Tenses',
    'tense',
    ARRAY['yesterday', 'tomorrow', 'now', 'already', 'since', 'for'],
    NULL,
    '{
      "direction": "tense_shift",
      "rules": [
        {"from": "present_simple", "to": "past_simple", "triggers": ["yesterday"], "note": "Past time marker"},
        {"from": "present_simple", "to": "future_simple", "triggers": ["tomorrow"], "note": "Future time marker"},
        {"from": "present_simple", "to": "present_perfect", "triggers": ["already", "since", "for"], "note": "Completed/relevant past"},
        {"from": "present_simple", "to": "present_continuous", "triggers": ["now"], "note": "Action in progress"}
      ]
    }'::jsonb,
    'အချိန်ညွှန်းစကားလုံးအရ tense ကို ပြောင်းရေးပါ။',
    'Transform sentences across tenses based on time markers and context.',
    '[
      {"from": "She goes to school every day.", "to": "She went to school yesterday.", "note": "present → past"},
      {"from": "They finish the homework.", "to": "They have already finished the homework.", "note": "present → present perfect"}
    ]'::jsonb
  ),

  -- 11. Wish
  (
    'wish',
    'Wish',
    'wish',
    ARRAY['wish', 'if only', 'want', 'regret'],
    NULL,
    '{
      "direction": "to_wish",
      "rules": [
        {"from": "present_fact", "to": "wish + past_simple", "note": "Wish about present"},
        {"from": "past_fact", "to": "wish + past_perfect", "note": "Wish about past / regret"},
        {"from": "future_annoyance", "to": "wish + would", "note": "Wish someone would change behavior"}
      ]
    }'::jsonb,
    'ဆန္ဒ သို့မဟုတ် နောင်တကို wish / if only ပုံစံဖြင့် ပြောင်းရေးပါ။',
    'Rewrite desires and regrets using wish / if only constructions.',
    '[
      {"from": "I want to be taller.", "to": "I wish I were taller.", "note": "present wish → past form"},
      {"from": "I regret that I did not study.", "to": "I wish I had studied.", "note": "past regret → past perfect"}
    ]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
