# Landing Page (web/)

AI 코디 서비스의 가설 검증용 랜딩 페이지.

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase**: 베타 대기열 이메일 저장
- **Amplitude (Unified SDK)**: 페이지뷰/CTA 클릭/폼 제출 트래킹 + Session Replay
- **Vercel**: 정적/SSR 배포 타겟

## 디렉터리

```
web/
├── src/
│   ├── app/                  # Next.js App Router (layout, page, globals.css)
│   ├── components/
│   │   ├── AnalyticsProvider.tsx
│   │   └── sections/         # Hero, HowItWorks, Waitlist, Footer
│   └── lib/                  # env / supabase / waitlist / analytics 래퍼
├── .env.local.example        # 필수 환경변수 템플릿
└── tailwind.config.ts        # 디자인 토큰
```

외부 SDK는 `src/lib/` 한 겹으로 감싸므로, 추후 백엔드(FastAPI)로 옮길 때 호출부는 그대로 유지됩니다.

## 로컬 개발

```bash
cd web
pnpm install
cp .env.local.example .env.local   # 키 채우기
pnpm dev
```

http://localhost:3000 에서 확인.

## Supabase 설정

1. [supabase.com](https://supabase.com)에서 프로젝트 생성.
2. SQL Editor에서 `../supabase/migrations/0001_waitlist.sql` 실행.
3. **Settings > API**에서 다음을 `.env.local`에 채움:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

RLS로 anon 키는 INSERT만 가능 — 클라이언트가 키를 들고 있어도 이메일 목록은 조회 불가.

## Amplitude 설정

1. [amplitude.com](https://amplitude.com)에서 프로젝트 생성 (기본 default 프로젝트로 충분).
2. **Settings > Projects > (해당 프로젝트) > General**의 **API Key**를
   `NEXT_PUBLIC_AMPLITUDE_API_KEY`에 채움. (Secret Key 아님 주의)
3. Session Replay는 [src/lib/analytics.ts](src/lib/analytics.ts)에서 `sampleRate: 1`로
   100% 녹화 중. 트래픽이 늘어나면 0.1(10%) 등으로 낮추세요.

트래킹 이벤트:

| 이벤트 | 발생 시점 |
|---|---|
| `landing_viewed` | 페이지 진입 |
| `hero_cta_clicked` | Hero CTA 클릭 |
| `waitlist_submit_attempt` | 폼 제출 시도 |
| `waitlist_submitted` | 폼 제출 성공 |
| `waitlist_failed` | 폼 제출 실패 (`reason` 포함) |

## Vercel 배포

1. Vercel 대시보드에서 GitHub 저장소 import.
2. **Root Directory**를 `web`으로 지정.
3. **Environment Variables**에 다음 3개를 추가 (Production / Preview / Development 모두):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_AMPLITUDE_API_KEY`
4. Deploy.

`NEXT_PUBLIC_*` 접두사가 붙은 변수는 클라이언트 번들에 포함되며, Supabase anon 키와 Amplitude API 키는 공개되어도 안전한 키입니다.

## 빌드 / 린트

```bash
pnpm build   # 프로덕션 빌드
pnpm lint    # ESLint
```
