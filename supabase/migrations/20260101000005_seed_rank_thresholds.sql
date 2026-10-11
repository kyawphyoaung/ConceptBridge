-- =============================================================================
-- Migration: 20260101000005_seed_rank_thresholds.sql
-- Purpose: Seed rank thresholds from Section 3.1 / 3.12:
--   Bronze (0–99), Silver (100–299), Gold (300–599),
--   Platinum (600–999), Diamond (1000+)
-- Includes color hex codes and icon names.
-- Uses INSERT ... ON CONFLICT (rank_name) DO NOTHING for idempotent re-runs.
-- =============================================================================

INSERT INTO public.rank_thresholds (rank_name, min_score, display_order, color, icon)
VALUES
  ('Bronze',   0,    1, '#CD7F32', 'medal'),
  ('Silver',   100,  2, '#C0C0C0', 'award'),
  ('Gold',     300,  3, '#FFD700', 'trophy'),
  ('Platinum', 600,  4, '#E5E4E2', 'gem'),
  ('Diamond',  1000, 5, '#B9F2FF', 'diamond')
ON CONFLICT (rank_name) DO NOTHING;
