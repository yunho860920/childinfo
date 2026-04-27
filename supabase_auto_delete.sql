-- ============================================================
-- [추가] 3차 방어선: 데이터 최소화 (14일 경과 데이터 자동 파기)
-- pg_cron 익스텐션 활성화 및 스케줄 등록
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- ============================================================

-- 1. pg_cron 익스텐션 활성화 (Supabase Dashboard > Database > Extensions 에서 수동으로 켤 수도 있음)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 매일 자정(UTC 기준)에 생성된 지 14일이 지난 데이터를 자동 삭제하는 크론 잡 등록
SELECT cron.schedule(
  'delete_old_consultations',
  '0 0 * * *', -- 매일 자정(UTC)
  $$
    DELETE FROM consultations
    WHERE created_at < NOW() - INTERVAL '14 days';
  $$
);
