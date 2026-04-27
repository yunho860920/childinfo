-- ============================================================
-- Supabase RLS (Row Level Security) 설정 (보안 강화 버전)
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

-- 기존 정책 삭제 (존재할 경우)
DROP POLICY IF EXISTS "allow_read_all" ON consultations;
DROP POLICY IF EXISTS "allow_insert_with_user_id" ON consultations;
DROP POLICY IF EXISTS "allow_delete_all" ON consultations;
DROP POLICY IF EXISTS "auth_read_own" ON consultations;
DROP POLICY IF EXISTS "auth_insert_own" ON consultations;
DROP POLICY IF EXISTS "auth_delete_own" ON consultations;
DROP POLICY IF EXISTS "admin_full_access" ON consultations;

-- 2. 읽기: 본인의 메시지만 조회 가능
CREATE POLICY "auth_read_own" ON consultations
  FOR SELECT USING (user_id = auth.uid()::text);

-- 3. 삽입: 본인의 UID로만 삽입 가능
CREATE POLICY "auth_insert_own" ON consultations
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- 4. 삭제: 본인의 메시지만 삭제 가능
CREATE POLICY "auth_delete_own" ON consultations
  FOR DELETE USING (user_id = auth.uid()::text);

-- 5. 관리자: 모든 데이터에 대한 전체 권한 (Service Role 또는 특정 메타데이터 기준)
--    참고: Supabase Dashboard의 'Service Role' 키는 RLS를 우회하므로, 
--    여기서는 앱 내 관리자 UID를 수동으로 지정하거나 메타데이터를 활용할 수 있습니다.
CREATE POLICY "admin_full_access" ON consultations
  FOR ALL USING (
    (auth.jwt() ->> 'email' = 'admin@childinfo.app') OR
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  );
