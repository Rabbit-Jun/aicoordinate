# 광고 시작 전 체크리스트 (Meta Spike Test) — 마네킹 v2 / 단일 가설

> **개정**: 2026-05-21 (마네킹 코디 피벗 + 단일 가설 A 반영)
> 이전 버전(듀얼 가설 A·B / 소재 4개 / utm 분기)은 폐기.
> SSOT: `LMF_Phase2_STEP8_LandingBlueprint.md`

---

## 코드 / 배포
- [ ] 작업 브랜치(`landing-v2-lmf` 등) → PR → main 머지
- [ ] Vercel production 배포 확인 (aicoordinate.vercel.app)
- [ ] production 빌드 에러 없음 (`pnpm build`)
- [ ] `web/public/mockup/`에 마네킹 코디 10장 배치 확인 (파일명 = 블루프린트 자산 목록과 일치)
- [ ] 랜딩 단일 페이지 정상 렌더 (가설 분기 없음 — utm 유무와 무관하게 동일 카피)

## 데이터 검증
- [ ] Supabase `waitlist` 테이블에 utm JSON 저장 확인 (1건 테스트)
  - 단일 가설이라 `utm_content` 가설 분기는 없지만, 소재 추적용으로 4개 파라미터는 계속 수집
- [ ] Supabase에 **지불의향 폴 응답 저장 확인** (PricingSection)
  - 저장 위치 결정 필요: `waitlist`에 컬럼 추가 vs 별도 기록 (→ Phase 2 명령에서 RLS-safe 방식 확정)
- [ ] Amplitude 이벤트 도착 확인:
  - landing_viewed
  - hero_cta_clicked
  - waitlist_submit_attempt
  - waitlist_submitted
  - waitlist_failed (실패 케이스)
  - **pricing_poll_voted** (신규 — props: choice = yes/maybe/no)
  - ※ hypothesis_variant_viewed 는 **제거** (단일 가설이라 불필요)
- [ ] Amplitude Session Replay 1건 재생 가능

## 개인정보 / 보안
- [ ] Session Replay에서 이메일 input 마스킹 확인
- [ ] 마스킹 안 되면 lib/analytics.ts에 maskAllInputs 옵션 추가
- [ ] 개인정보처리방침 (/privacy) 페이지 존재 확인 (Meta 광고 심사 요건)

## 광고 시스템
- [ ] Meta 광고 계정 생성 완료
- [ ] 결제 수단 등록 완료
- [ ] Meta 픽셀 설치 (선택 — Amplitude만으로 분석 가능하나 학습 가속 위해 권장)
- [ ] 인스타그램 비즈니스 계정 연결

## 비주얼 자산 (광고 소재) — 단일 가설, 2~3개
> 마네킹 코디 이미지(10장 확보)를 광고 소재로 직접 활용 가능.
- [ ] 소재 ①: "옷장에 100벌..." 헤드라인 + 마네킹 코디 격자 이미지
- [ ] 소재 ②: "상상 말고, 입은 모습으로" + flat lay vs 마네킹 대조 이미지
- [ ] (선택) 소재 ③: 캐러셀 — 마네킹 코디 4장 스와이프

## 캠페인 설정 (Spike Test 30만원)
- [ ] 캠페인 1개 / 광고세트 1개 / 소재 2~3개
- [ ] 일 예산 6만원 × 5일 = 30만원
- [ ] 타겟: 24~32세 여성, 패션·쇼핑·옷장정리·무신사·29CM 관심사 (단일 타겟)
  - ※ 듀얼 타겟(A 여성 / B 전체) 제거 — 단일 가설이라 타겟도 하나로 집중
- [ ] 광고 URL utm 파라미터 (소재 추적용, 가설 분기 아님):
  - 소재 ①: ?utm_source=meta&utm_campaign=spike02&utm_content=closet_grid
  - 소재 ②: ?utm_source=meta&utm_campaign=spike02&utm_content=mannequin_vs_flatlay
  - 소재 ③: ?utm_source=meta&utm_campaign=spike02&utm_content=carousel_cody

## 안전장치
- [ ] CPA 8,000원 넘으면 일시 정지 알람 설정 (Meta Ads Manager)
- [ ] 일 등록 10건 미만이면 카피·이미지 점검 트리거
- [ ] 매일 1회 Supabase, Amplitude 데이터 확인 일정

## 측정 목표 (단일 가설 + 지불의향)
- [ ] 1차 신호: **이메일 등록 전환율** (랜딩 CVR)
  - 🚨 등록 10명 이하 / ⚠️ 10~30명 / ✅ 30~60명 / 🚀 60명+
- [ ] 2차 신호: **지불의향 폴 "yes" 비율** (PricingSection)
  - 등록자 중 "그 가격이면 써볼래요" 선택 비율 = 지불의향 프록시
  - ⚠️ 인계 문서 핵심: 손익을 가르는 1순위 변수가 전환율(지불의향). 이 신호가 진짜 관문.

## 광고 시작 후 (D+1 ~ D+5)
- [ ] D+1: 첫 24시간 데이터 점검 (이상 신호 없는지)
- [ ] D+3: 중간 분석 (소재별 CTR·CPA / 지불의향 폴 분포)
- [ ] D+5: 캠페인 종료 → 분석:
  - 등록 전환율 + 지불의향 yes 비율로 "사람들이 원하고 돈 내나" 판단
  - → LMF Phase 3 (수렴 단계, `lmf-s3-s1-converge-check`) 시작
