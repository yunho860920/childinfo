-- ============================================================
-- Supabase RLS (Row Level Security) 설정
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- ============================================================

-- 0. 테이블 생성 (이미 존재하면 건너뜀)
CREATE TABLE IF NOT EXISTS consultations (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     text NOT NULL,
  text        text NOT NULL,
  type        text NOT NULL DEFAULT 'question',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 1. RLS 활성화
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 2. 읽기: 모든 사용자가 조회 가능 (anon key)
--    → Supabase Auth 도입 후 auth.uid() 기반으로 강화 권장
CREATE POLICY "allow_read_all" ON consultations
  FOR SELECT
  USING (true);

-- 3. 삽입: user_id가 비어있지 않아야 삽입 허용
CREATE POLICY "allow_insert_with_user_id" ON consultations
  FOR INSERT
  WITH CHECK (
    user_id IS NOT NULL
    AND length(user_id) > 0
  );

-- 4. 삭제: 모든 사용자가 삭제 가능 (현재 anon 기반이므로)
--    → Supabase Auth 도입 후 자기 메시지만 삭제하도록 강화 권장
CREATE POLICY "allow_delete_all" ON consultations
  FOR DELETE
  USING (true);

-- ============================================================
-- [향후 강화] Supabase Auth 도입 후 아래 정책으로 교체
-- ============================================================
-- DROP POLICY "allow_read_all" ON consultations;
-- DROP POLICY "allow_insert_with_user_id" ON consultations;
-- DROP POLICY "allow_delete_all" ON consultations;
--
-- CREATE POLICY "auth_read_own" ON consultations
--   FOR SELECT USING (user_id = auth.uid()::text);
--
-- CREATE POLICY "auth_insert_own" ON consultations
--   FOR INSERT WITH CHECK (user_id = auth.uid()::text);
--
-- CREATE POLICY "auth_delete_own" ON consultations
--   FOR DELETE USING (user_id = auth.uid()::text);
--
-- CREATE POLICY "admin_full_access" ON consultations
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin')
--   );
