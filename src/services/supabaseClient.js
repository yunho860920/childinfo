import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 방어 코드: 환경 변수 누락 시 더미 클라이언트 대신 에러를 잡아 앱 중단 방지
let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("SHIELD Agent: Supabase environment variables are missing. Consultation features will be disabled.");
    supabase = null;
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("SHIELD Agent: Critical failure during Supabase initialization:", e);
  supabase = null;
}

export { supabase };
