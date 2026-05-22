-- 0002_add_pricing_intent_device_pref.sql
-- waitlist 테이블에 지불의향(pricing_intent) + 플랫폼 선호(device_pref) 컬럼 추가
-- 실행 위치: Supabase 대시보드 → SQL Editor → 붙여넣고 Run
-- RLS 변경 없음 (컬럼만 추가, 기존 anon INSERT-only 정책 그대로 적용됨)

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS pricing_intent text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS device_pref text;

-- (선택) 값 제약을 두고 싶다면 아래 주석 해제 — 없어도 동작함
-- ALTER TABLE waitlist ADD CONSTRAINT pricing_intent_check
--   CHECK (pricing_intent IN ('yes','maybe','no') OR pricing_intent IS NULL);
-- ALTER TABLE waitlist ADD CONSTRAINT device_pref_check
--   CHECK (device_pref IN ('ios','android') OR device_pref IS NULL);

-- 확인용: 컬럼이 잘 추가됐는지
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'waitlist' ORDER BY ordinal_position;
