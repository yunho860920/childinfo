-- ============================================================
-- Optional Supabase retention job: delete consultation messages
-- older than 14 days. Run in Supabase Dashboard > SQL Editor.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete_old_consultations',
  '0 0 * * *',
  $$
    DELETE FROM public.consultations
    WHERE created_at < NOW() - INTERVAL '14 days';
  $$
);
