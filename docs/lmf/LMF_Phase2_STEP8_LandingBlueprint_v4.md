# LMF Phase 2 STEP 8 — 랜딩 블루프린트 v4 (/b 전면 개편)

> v3.1 후속. **/b 라우트만** 적용된 전면 개편의 SSOT.
> /, /a는 v3.1 구조(LandingBody) 유지.
> 작성: 2026-06-05 (claude.ai 세션) / 구현: Claude Code 단계 1~4 + 정밀 교정 3회

---

## 0. 개편 배경 (데이터 근거)

- Session Replay(5건): Hero에서 CTA 클릭 → 이메일 단계에서 망설임 → 모달 닫고
  하단 섹션을 훑으며 "믿을 근거"를 찾다 이탈
- 퍼널(개편 전): /b 조회 77 → plan_selected 4 → submit_attempt 1 → 등록 1
- 진단: 병목은 ① 이메일 단계(가치·안심 부재), ② 하단 섹션의 설득력 부족
- 처방: 무료 단일 흐름 + 모달 가치 문구 + **실제 앱 화면 데모 중심의 본문 재구성**
  (Claude Design 제작 → React 포팅)

## 1. /b 페이지 구조 (확정)

```
HeroB        — h1 "옷장에 옷은 많은데, / 상상이 안 가서 또 그 조합?"
               sub "당신의 비서가 옷장 속 옷으로, / 매일 새롭게 코디해 드립니다."
               CTA "무료로 시작하기" (entry: "hero")
PainB        — h2 "매일 아침 옷 걱정 쉽지 않죠?" + 공감 인용 카드 3
               (옐로/블루/그린 = surface-yellow/blue/green 토큰)
CoordiDemo   — pill "옷장 속 옷들로 새롭게 코디하기" (코랄)
               폰 1 CoordiPhone: 자동 스크롤 → 선택 → 줌 loop
               폰 2 DetailPhone: 선택 코디 → 입은 옷 시퀀스
               폰 3 CategoryPhone: 전체→캐주얼→포멀→클래식→빈티지 순환 (1.4s)
               섹션 배경 --gallery-coordi-grad (민트→피치)
ClosetDemo   — pill "내 옷장 한눈에 보기" (#7C5CC4 보라)
               폰 1 ClosetPhone: "나의 옷장", 탭 전체/상의/하의/아우터/신발·벨트,
                 트렌치 코트 선택 시퀀스, +버튼(흰 배경)
               폰 2 CategoryPhone(옷장 주입): 카테고리 탭 순환 (1.8s)
               폰 3 ClosetAddPhone: + 펄스 → "옷장에 옷 추가하기" 시트 슬라이드업
                 옵션 4종: 앨범(다크)/카메라/WEB 검색/쇼핑몰 주문내역
               섹션 배경 --gallery-closet-grad (라벤더→피치)
MannequinB   — h2 "상상하지 마세요. / 직접 보세요" + 체크 2
ComparisonB  — h2 "같은 코디, 다른 느낌" + 폰 2대 비교 캐러셀(4쌍, 3s, 동시 전환)
               좌: SNS풍 크롬(15일 전/하트/탭바, 다크 프레임)
               우: 앱 크롬(9:41/나의 코디/✓선택한 코디 배지, 코랄 프레임)
               + 비교표 2행 (코디 표현 / 내 모습 반영)
FinalCtaB    — "지금 시작하면 코디 10개 무료 🎁" + CTA (entry: "final_cta")
Footer       — 기존 컴포넌트 재사용
```

## 2. 이메일 흐름 (무료 단일)

- 모든 CTA → EmailModal **이메일 단계 직행** (플랜 선택 단계 폐기)
- 이메일 단계 카피:
  - "출시되면 가장 먼저 알려드려요. 얼리버드 선물: **코디 10개 무료 🎁**"
  - "스팸 없어요. 출시 알림 1번만 보내드려요."
  - 버튼 "선물 받고 기다리기"
- pricing_intent는 항상 "free" 저장 (컬럼 이력: yes/maybe/no → free/subscribe → free)

## 3. 이벤트 (9종)

| 이벤트 | props | 비고 |
|---|---|---|
| landing_viewed | variant | |
| hero_cta_clicked | — | |
| plan_selected | plan:"free", entry: hero/pricing/final_cta | 퍼널 호환용 유지 |
| waitlist_submit_attempt/submitted/failed | (failed: reason) | |
| section_viewed | section 6종, variant | IO 0.5, 페이지뷰당 1회 |
| modal_step_viewed | step: email/done, entry | |
| modal_closed | step, entry | X/백드롭/ESC/done 닫기 |

section 6종: pain / coordi_demo / closet_demo / mannequin / comparison / final_cta

## 4. 의사결정 기록

| 결정 | 내용 | 근거/비고 |
|---|---|---|
| 구독 흐름 제거 | 구독 카드·플랜 선택 폐기, 무료 단일 | 리플레이: 이메일 단계 이탈. 지불의향 측정은 추후 재도입 가능 |
| "쇼핑몰 주문내역" 유지 | 옷 추가 옵션 4종에 포함 | 사용자 결정 (MVP 범위 외 기능 — 베타 시 기대 관리 필요) |
| "내 모습 반영" 비교 행 유지 | "나와 같은 체형의 마네킹" 표현 유지 | 사용자 결정 (v3.1 폐기 기능과 상충 — 베타 시 기대 관리 필요) |
| 폰 내부 UI 토큰 면제 | design HTML 정확값(hex/px) 직접 사용 | 앱 화면 "묘사"는 사이트 토큰 대상 아님. COLORS const + 출처 주석 |
| 오탈자 교정 5건 | 안 가서/쉽지 않죠/캐주얼/클래식/다른 느낌 | FIXES.md |
| 상태바 중립화 | U⁺ 제거 → 9:41 | FIXES.md #6 |

## 5. 기술 메모

- 신규 토큰: surface-yellow(#fbf3da)/blue(#e7f0fb)/green(#e2f3ea),
  --gallery-coordi-grad, --gallery-closet-grad, @keyframes add-pulse
- ⚠️ Tailwind alpha modifier(bg-X/10)는 hex형 CSS 변수와 비호환 — 옅은 톤은 전용 토큰으로
- 폰 데모: usePlayInView(IO 0.1, 이탈 시 타이머 정리+리셋) + useTween +
  usePrefersReducedMotion(정적 1컷 대체). 데모 본체는 next/dynamic 청크 분리
- 자산: design-ref/assets 56장 → public/app-mockup/ webp 292KB
- First Load JS: /b 280kB (개편 전 272kB 대비 +8kB, 데모 본체는 지연 청크)
- 디자인 원본: 레포 루트 design-ref/ (landing-b-design.html + FIXES.md + ASSET_MAP.md)

## 6. 측정 계획 (배포 후)

- 차트: ① 메인 퍼널 landing_viewed→plan_selected→attempt→submitted
  ② 모달 이탈 modal_step_viewed(email) vs modal_closed(email)
  ③ 섹션 도달 section_viewed 분해
- 공통 필터: Device = Android/iPhone, 기간 = 배포일 이후
- 판단 기준선(개편 전): 등록 전환율 1.3%(1/77), 모달 이메일 이탈 3/4
- 다음 결정: LP 조회 200+ 누적 후 전환율 비교 → /a 개편 착수 여부 판단
