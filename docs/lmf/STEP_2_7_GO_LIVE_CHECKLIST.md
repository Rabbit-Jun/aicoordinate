# 광고 시작 전 체크리스트 (Meta Spike Test)

## 코드 / 배포
- [ ] feat/landing-v2-lmf 브랜치 → PR → main 머지
- [ ] Vercel production 배포 확인 (aicoordinate.vercel.app)
- [ ] production 빌드 에러 없음
- [ ] production /, /?utm_content=h1_fit 두 URL에서 가설 분기 정상

## 데이터 검증
- [ ] Supabase waitlist 테이블에 utm JSON 저장 확인 (1건 테스트)
- [ ] Amplitude에 6개 이벤트 도착 확인
  - landing_viewed
  - hypothesis_variant_viewed
  - hero_cta_clicked
  - waitlist_submit_attempt
  - waitlist_submitted
  - waitlist_failed (실패 케이스)
- [ ] Amplitude Session Replay 1건 재생 가능

## 개인정보 / 보안
- [ ] Session Replay에서 이메일 input 마스킹 확인
- [ ] 마스킹 안 되면 lib/analytics.ts에 maskAllInputs 옵션 추가
- [ ] 개인정보처리방침 (/privacy) 페이지 광고 가설에 맞게 업데이트 필요한지 검토

## 광고 시스템
- [ ] Meta 광고 계정 생성 완료
- [ ] 결제 수단 등록 완료
- [ ] Meta 픽셀 설치 (선택 — Amplitude만으로 분석 가능하나 Meta 학습 가속화 위해 권장)
- [ ] 인스타그램 비즈니스 계정 연결

## 비주얼 자산 (광고 소재)
- [ ] 소재 A1 (가설 A 정적): "옷장에 100벌..." 헤드라인 비주얼
- [ ] 소재 A2 (가설 A 캐러셀): 4장 카드 시퀀스
- [ ] 소재 B1 (가설 B 정적): 좌우 비교
- [ ] 소재 B2 (가설 B 정적): 백화점 사례

## 캠페인 설정 (Spike Test 30만원)
- [ ] 캠페인 1개 / 광고세트 1개 / 소재 4개
- [ ] 일 예산 6만원 × 5일 = 30만원
- [ ] 타겟 A (소재 A1·A2): 24~32세 여성, 패션 관심사
- [ ] 타겟 B (소재 B1·B2): 22~38세 모두, 패션/쇼핑 관심사
- [ ] 광고 URL utm 파라미터 정확히 설정
  - 소재 A1: ?utm_content=h1_closet_v1&utm_source=meta&utm_campaign=spike01
  - 소재 A2: ?utm_content=h3_closet_v2&utm_source=meta&utm_campaign=spike01
  - 소재 B1: ?utm_content=h1_fit_v1&utm_source=meta&utm_campaign=spike01
  - 소재 B2: ?utm_content=h3_fit_v2&utm_source=meta&utm_campaign=spike01

## 안전장치
- [ ] CPA 8,000원 넘으면 일시 정지 알람 설정 (Meta Ads Manager)
- [ ] 일 등록 10건 미만이면 카피·이미지 점검 트리거
- [ ] 매일 1회 Supabase, Amplitude 데이터 확인 일정

## 광고 시작 후 (D+1 ~ D+5)
- [ ] D+1: 첫 24시간 데이터 점검 (이상 신호 없는지)
- [ ] D+3: 중간 분석 (소재별 CTR, CPA 차이)
- [ ] D+5: 캠페인 종료 후 LMF Phase 3 (수렴 단계) 시작
