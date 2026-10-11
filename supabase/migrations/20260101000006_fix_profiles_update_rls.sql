-- =============================================================================
-- Migration: 20260101000006_fix_profiles_update_rls.sql
-- Purpose: Fix infinite recursion in profiles_update_own RLS policy.
--          Subqueries on public.profiles inside WITH CHECK caused
--          "infinite recursion detected in policy for relation profiles".
--          Replace with a simple ownership check + a BEFORE UPDATE trigger
--          that locks sensitive columns for non-admins (via is_admin()).
-- =============================================================================

-- 1. Drop the broken policy
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- 2. Recreate with a simple ownership check only (no profiles subqueries)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Prevent non-admins from modifying privileged / score columns
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
    NEW.total_score := OLD.total_score;
    NEW.is_active := OLD.is_active;
    NEW.is_guest := OLD.is_guest;
    NEW.current_streak := OLD.current_streak;
    NEW.longest_streak := OLD.longest_streak;
    NEW.rank := OLD.rank;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Attach the privilege-check trigger
DROP TRIGGER IF EXISTS on_profile_privilege_check ON public.profiles;
CREATE TRIGGER on_profile_privilege_check
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
