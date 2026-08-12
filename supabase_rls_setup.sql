-- ============================================================
-- Supabase RLS setup for consultation messages
-- Run in Supabase Dashboard > SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consultations (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     text NOT NULL,
  text        text NOT NULL,
  type        text NOT NULL DEFAULT 'question',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_consultation_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

REVOKE ALL ON FUNCTION public.is_consultation_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_consultation_admin() TO authenticated;

DROP POLICY IF EXISTS "allow_read_all" ON public.consultations;
DROP POLICY IF EXISTS "allow_insert_with_user_id" ON public.consultations;
DROP POLICY IF EXISTS "allow_delete_all" ON public.consultations;
DROP POLICY IF EXISTS "auth_read_own" ON public.consultations;
DROP POLICY IF EXISTS "auth_insert_own" ON public.consultations;
DROP POLICY IF EXISTS "auth_delete_own" ON public.consultations;
DROP POLICY IF EXISTS "admin_full_access" ON public.consultations;
DROP POLICY IF EXISTS "consultations_select_own_or_admin" ON public.consultations;
DROP POLICY IF EXISTS "consultations_insert_own_question_or_admin" ON public.consultations;
DROP POLICY IF EXISTS "consultations_delete_own_or_admin" ON public.consultations;

CREATE POLICY "consultations_select_own_or_admin"
  ON public.consultations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR public.is_consultation_admin()
  );

CREATE POLICY "consultations_insert_own_question_or_admin"
  ON public.consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid()::text AND type = 'question')
    OR public.is_consultation_admin()
  );

CREATE POLICY "consultations_delete_own_or_admin"
  ON public.consultations
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()::text
    OR public.is_consultation_admin()
  );

CREATE INDEX IF NOT EXISTS consultations_user_id_created_at_idx
  ON public.consultations (user_id, created_at);
