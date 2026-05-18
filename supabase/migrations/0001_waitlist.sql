-- 대기열 등록 테이블
-- Supabase SQL Editor에서 그대로 실행하면 됨.

create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

-- RLS: 익명 사용자는 INSERT만 가능, SELECT는 차단 (이메일 목록 유출 방지)
alter table public.waitlist enable row level security;

drop policy if exists "anon can insert waitlist" on public.waitlist;
create policy "anon can insert waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- service_role(서버 측 키)만 조회/관리 가능. anon에는 select 권한을 주지 않는다.
