-- =============================================================================
-- Migration: 20260101000030_essay_content_mm
-- Purpose: Support exam question text + Myanmar-only essay content.
-- =============================================================================

ALTER TABLE public.essays
  ADD COLUMN IF NOT EXISTS question text,
  ADD COLUMN IF NOT EXISTS content_mm text;

ALTER TABLE public.essays
  ALTER COLUMN content_en DROP NOT NULL;
