# UTM 캠페인 URL 가이드

광고·SNS·메신저 등 외부 채널에서 랜딩 페이지로 유입되는 트래픽을 추적·분석하기 위한 utm 파라미터 사용 규칙.

> **TL;DR**: 광고 URL 끝에 `?utm_source=<명명규칙>` 만 붙이면 된다. Supabase `waitlist.source` 컬럼에 자동 저장되고, SQL 한 줄로 채널별 등록률 비교 가능.

---

## 1. 명명 규칙

`utm_source` 한 값에 모든 정보를 담는다. 형식:

```
<platform>_<type>_<variant>
```

| 부분 | 의미 | 예시 값 |
|---|---|---|
| `platform` | 광고/유입 플랫폼 | `meta`, `google`, `kakao`, `naver`, `ig` (Instagram organic) |
| `type` | 광고 형식 | `image`, `video`, `carousel`, `search`, `story`, `reels`, `post` |
| `variant` | 크리에이티브 버전 | `v1`, `v2`, `v3` ... |

### 좋은 예시

```
meta_image_v1
meta_image_v2
meta_video_v1
meta_carousel_v1
kakao_image_v1
ig_post_v1
```

### 피해야 할 패턴

- ❌ `메타광고1` (한글, 일관성 떨어짐, URL 인코딩 필요)
- ❌ `Meta_Image_V1` (대소문자 섞임 — 모두 소문자)
- ❌ `meta ad 1` (공백, URL 인코딩 필요)
- ❌ `facebook_ad_1` (메타가 정식 명. 일관되게 `meta` 사용)

---

## 2. 캠페인별 URL 만들기

기본 URL: `https://aicoordinate.vercel.app/`

| 캠페인 | 만들 URL |
|---|---|
| 메타 이미지 광고 v1 | `https://aicoordinate.vercel.app/?utm_source=meta_image_v1` |
| 메타 동영상 광고 v1 | `https://aicoordinate.vercel.app/?utm_source=meta_video_v1` |
| 카카오 디스플레이 v1 | `https://aicoordinate.vercel.app/?utm_source=kakao_image_v1` |
| 인스타그램 자연 게시물 | `https://aicoordinate.vercel.app/?utm_source=ig_post_v1` |

메타 광고 매니저에서 광고 만들 때 **"웹사이트 URL"** 필드에 위 URL을 입력하면 끝.

---

## 3. Supabase에서 결과 분석

대시보드 > SQL Editor에 그대로 붙여넣기:

### 채널별 등록 수

```sql
SELECT
  COALESCE(source, '직접 진입') AS 캠페인,
  COUNT(*) AS 등록수
FROM waitlist
GROUP BY 1
ORDER BY 2 DESC;
```

### 플랫폼별 등록 수 (meta / google / kakao 등)

```sql
SELECT
  COALESCE(SPLIT_PART(source, '_', 1), '직접 진입') AS 플랫폼,
  COUNT(*) AS 등록수
FROM waitlist
GROUP BY 1
ORDER BY 2 DESC;
```

### 일자별 채널별 등록 수 (시계열)

```sql
SELECT
  DATE(created_at) AS 날짜,
  COALESCE(source, '직접 진입') AS 캠페인,
  COUNT(*) AS 등록수
FROM waitlist
GROUP BY 1, 2
ORDER BY 1 DESC, 3 DESC;
```

### 모바일 vs 데스크톱 비율 (채널별)

```sql
SELECT
  COALESCE(source, '직접 진입') AS 캠페인,
  CASE
    WHEN user_agent ILIKE '%mobile%' THEN '📱 모바일'
    ELSE '💻 데스크톱'
  END AS 디바이스,
  COUNT(*) AS 등록수
FROM waitlist
GROUP BY 1, 2
ORDER BY 1, 3 DESC;
```

---

## 4. 가설 검증 단계의 분석 우선순위

가설 검증 1차에서는 **클릭 → 등록 전환율**이 핵심이다. 광고 플랫폼이 "클릭 수"를 알려주고, Supabase가 "등록 수"를 알려준다. 두 값을 나누면 전환율.

- 광고 매니저에서 캠페인별 클릭 수 확보
- Supabase에서 캠페인별 등록 수 확보
- 전환율 = 등록 ÷ 클릭

**광고 캠페인 단위로 동시 운영하는 변형은 3~5개로 제한**한다. 너무 많으면 통계적 유의미한 결과가 나오기 전에 예산 소진.

---

## 5. utm 추적의 한계 (현재 단계)

- `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`은 **저장하지 않는다.** 가설 검증 1차에서는 과도한 차원.
- 같은 사용자가 여러 광고를 클릭한 뒤 등록하면 **마지막 진입 시점의 source만 저장**된다 (last-touch attribution).
- 추후 확장 시 `waitlist` 테이블에 `medium`, `campaign` 컬럼 추가 + `lib/waitlist.ts`의 수집 로직 확장.
