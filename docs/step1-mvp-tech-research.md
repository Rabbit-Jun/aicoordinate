# STEP1 MVP — 기능별 기술 조사 / PoC 가이드

> **목적**: 1단계 MVP 4개 기능 — ① 앨범 등록 → ② 옷 인식·매핑 → ③ DB 등록 → ④ 옷 추천 — 의
> **구현 가능성**과 **각 단계에 쓸 만한 기술**을 공식 문서 출처와 함께 정리한다.
> DB·임베딩·RAG 인프라의 상세는 [tech-stack-catalog.md](./tech-stack-catalog.md)에 이미 정리되어 있으므로,
> 이 문서는 **카탈로그에 없는 공백(이미지 피커·옷 인식·외부 시각 검색 API)**을 메우고 전체 흐름을 잇는 데 집중한다.

조사 기준일: 2026-06-22. 모든 "공식 문서" 링크는 1차 출처(벤더 공식)만 표기.

---

## 0. 사용자가 그린 흐름과 핵심 리스크

```
[기기 앨범의 "옷 입은 사진"]
        │  ① 앨범 등록 (이미지 피커)
        ▼
[옷 인식·크롭 + 정보 추출]
        │  ② 매핑 — 옷별 분리 + 속성 태깅 (+ 선택: 외부 시각 검색)
        ▼
[Postgres + pgvector]
        │  ③ DB 등록 (메타 + 임베딩)
        ▼
[AI 에이전트 RAG]
        │  ④ 추천
        ▼
   코디 추천 결과
```

### ⚠️ 가장 먼저 짚어야 할 리스크 — "Google 검색 API"

직접 조사를 요청하신 부분의 결론부터:

- **Google에는 "이미지를 올리면 그 옷을 웹/쇼핑에서 찾아주는" 공식 공개 API가 없다.**
  Google Lens(역방향 이미지 검색)는 제품이지 API가 아니다. ([Google 공식 커뮤니티 답변](https://support.google.com/websearch/thread/298580848))
- 이름이 비슷한 **Google Cloud Vision "Product Search"는 "오픈 웹"이 아니라 "내가 직접 색인한 내 카탈로그"** 안에서만 시각 검색을 한다. 즉 무신사·쇼핑몰 상품을 찾아주는 게 아니라, 내가 미리 넣어둔 상품 세트에서 비슷한 걸 찾는 용도다. ([Vision Product Search 공식](https://cloud.google.com/vision/product-search/docs))
- **Google Custom Search JSON API**는 키워드 기반 이미지 검색(`searchType=image`)은 되지만 **역방향 이미지 검색(사진→상품)은 불가**, 하루 100쿼리 무료 한도. ([Custom Search 공식](https://developers.google.com/custom-search/v1/using_rest))

→ **따라서 "사진 → 정확한 그 상품 + 가격" 시나리오는 ②번 단계에서 가장 위험한 가정이다.** §3에서 현실적 대안 3가지를 제시한다.

**중요한 관점 전환**: 우리 서비스는 "마네킹 코디 + 옷장 활용"이지 "이 옷 어디서 파는지 쇼핑 검색"이 아니다.
따라서 ②번의 본질은 **"그 옷이 인터넷 어디 상품인지 찾기"가 아니라 "그 옷의 속성(카테고리·색·소재·패턴·핏)을 구조화해서 옷장 DB에 넣기"**다.
이건 **외부 검색 없이 Vision LLM + 세그멘테이션만으로 더 안정적으로** 된다(§2). 외부 시각 검색은 "선택적 보강"으로 두는 걸 권장한다.

---

## 1. 앨범 등록 — 이미지 피커 (웹/앱)

기기 갤러리에서 사진을 가져오는 단계. "웹/앱 둘 다"가 목표인데, **Phase 0에서 이미 Next.js를 쓰고 있으므로** 코드 재사용이 가장 큰 변수다.

### 추천: 웹 = File API / 앱 = Capacitor Camera (Next.js 재사용)

| 환경 | 추천 기술 | 이유 | 공식 문서 |
|---|---|---|---|
| **웹** | `<input type="file" accept="image/*" capture>` + File API | 무의존성, 모든 브라우저, 즉시 동작 | [MDN: input/file](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) · [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API) |
| **앱(권장)** | **Capacitor `Camera` 플러그인** | 기존 Next.js 웹 코드를 그대로 앱으로 래핑, 갤러리/카메라 단일 API | [Capacitor Camera 공식](https://capacitorjs.com/docs/apis/camera) |
| 앱(네이티브 대안) | Expo `ImagePicker` (React Native) | RN 진영 표준, 권한·크롭 내장. 단 Next.js 코드 재사용 불가 | [Expo ImagePicker 공식](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| 앱(네이티브 대안) | Flutter `image_picker` | Flutter 선택 시 표준 | [pub.dev image_picker 공식](https://pub.dev/packages/image_picker) |

**판단**: 카탈로그에도 "Next.js + Capacitor로 모바일 패키징"이 명시돼 있다([tech-stack-catalog.md §3.1](./tech-stack-catalog.md)). STEP1은 **새 프레임워크 학습 없이** Next.js + Capacitor 한 코드베이스로 웹·앱을 동시 커버하는 게 비용 최소다. Expo/Flutter는 "네이티브 UX가 핵심 차별점이 될 때" 재검토.

**PoC 체크리스트**
- [ ] 웹: 파일 선택 → 미리보기 → presigned URL로 S3 업로드까지
- [ ] 앱: Capacitor `Camera.getPhoto({ source: 'PHOTOS' })`로 갤러리 접근 + iOS/Android 권한 prompt
- [ ] EXIF 회전 보정, HEIC(아이폰) → JPEG 변환 확인
- [ ] 업로드 전 클라이언트 리사이즈(긴 변 ~1568px) — Vision API 토큰·비용 절감

---

## 2. 옷 인식·매핑 — 한 장의 "입은 사진"에서 옷별로 분리 + 속성 태깅

가장 기술 난도가 높은 단계. 두 하위 문제로 쪼갠다.
**(A) 어떤 옷이 어디에 있나(검출·분리)** + **(B) 그 옷이 뭔가(속성 추출)**.

### 추천 조합: Vision LLM(속성) + 세그멘테이션(분리), 둘 다 가능

| 하위 문제 | 1순위 | 대안 | 공식 문서 |
|---|---|---|---|
| **(B) 속성 추출** (카테고리·색·소재·패턴·핏 → JSON) | **Claude Vision** (`claude-opus-4-8` / 비용 민감 시 Haiku) | GPT-4o Vision, Gemini Vision | [Claude Vision 공식](https://platform.claude.com/docs/en/build-with-claude/vision) · [구조화 출력](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| **(A) 옷 검출/크롭** (상의·하의·아우터 영역 분리) | **Ultralytics YOLO** (DeepFashion2로 파인튜닝) | Google Vision 객체 위치(object localization) | [Ultralytics 공식](https://docs.ultralytics.com/tasks/segment/) · [DeepFashion2 데이터셋](https://github.com/switchablenorms/DeepFashion2) |
| **(A) 픽셀 단위 분리** (배경/사람 제거, 옷만) | **SAM 2 (Segment Anything 2, Meta)** | `rembg`(배경 제거), Cloud Vision | [SAM 2 공식](https://github.com/facebookresearch/sam2) |
| 모델 호스팅(자체 GPU 회피) | **Replicate** (YOLO/SAM/Fashion 모델 서빙) | Hugging Face Inference Endpoints | [Replicate 공식](https://replicate.com/docs) · [HF Inference 공식](https://huggingface.co/docs/inference-endpoints) |

**왜 이 순서인가 (현실적 판단)**
- STEP1에서 **(B) 속성 추출만으로도 옷장 등록·추천이 성립**한다. Claude Vision에 "입은 사진"을 주고 `{category, color, material, pattern, fit, style}` JSON을 받으면 끝. 별도 모델 학습·GPU 불필요 → **가장 빠른 PoC 경로**.
- **(A) 분리/크롭은 "한 장에 여러 옷"·"마네킹 합성용 깔끔한 크롭"이 필요해질 때** 추가한다. DeepFashion2(801K 라벨)로 YOLO를 파인튜닝하면 fashion 도메인 검출·세그가 강해진다([DeepFashion2 논문](https://arxiv.org/abs/1901.07973)). 그 전엔 SAM 2 + Vision LLM 박스 지정으로도 충분.
- 카탈로그의 멀티에이전트 설계(Vision Agent → Specialist → Critic)와 그대로 연결된다([tech-stack-catalog.md §5.1](./tech-stack-catalog.md)).

**PoC 체크리스트**
- [ ] Claude Vision으로 옷 1장 → 구조화 JSON 태깅, 자체 테스트셋 50~100장으로 정확도 측정
- [ ] "한 장에 상·하의 동시" 케이스: YOLO(DeepFashion2) 또는 Vision LLM 멀티옵션 검출 비교
- [ ] SAM 2로 옷만 크롭 → 마네킹 합성(BFL Flux Kontext, [카탈로그 §5.2](./tech-stack-catalog.md)) 입력 품질 확인
- [ ] 비용: Vision LLM 호출당 토큰 측정([토큰 카운팅 가이드](https://platform.claude.com/docs/en/build-with-claude/token-counting))

---

## 3. (선택) 외부 시각 검색 — "사진 → 실제 상품 정보"

§0에서 짚었듯 이건 **위험·선택 단계**다. 꼭 필요하다고 결론나면, Google 공식 API가 없으므로 아래 3가지가 현실적이다.

| 옵션 | 무엇 | 현실성 | 공식/1차 출처 |
|---|---|---|---|
| **SerpApi Google Lens API** | Google Lens 결과(시각 매치·쇼핑·가격)를 API로 | ✅ 가장 근접. 단 **비공식 스크래핑·유료·ToS 리스크** | [SerpApi Google Lens 공식](https://serpapi.com/google-lens-api) |
| **Bing Visual Search API (Microsoft)** | MS 공식 시각 검색 | △ Bing Search API는 **단계적 종료/전환 중** — 신규 채택 전 상태 확인 필수 | [Bing Visual Search 공식](https://learn.microsoft.com/en-us/bing/search-apis/bing-visual-search/overview) |
| **Google Cloud Vision Product Search** | 내가 색인한 **내 카탈로그** 안에서 시각 검색 | ✅ 공식·안정. 단 "오픈 웹 쇼핑 검색"이 **아님** | [Vision Product Search 공식](https://cloud.google.com/vision/product-search/docs) |

**권장 판단**
- STEP1에서는 **이 단계를 빼고** §2(Vision LLM 속성 추출)로 옷장을 채우는 걸 강력 권장. 마네킹/옷장 컨셉엔 "정확한 상품 매칭"이 불필요하다.
- "이 옷 어디 거예요?" 기능을 굳이 검증하려면 **SerpApi로 1주 PoC**만 돌려 가치·정확도를 측정하고, 코어 플로우엔 넣지 말 것.

---

## 4. DB 등록 — 메타 + 벡터 (카탈로그 재사용)

이 단계 인프라는 [tech-stack-catalog.md](./tech-stack-catalog.md)에 이미 상세하다. 요지만 연결한다.

| 저장 대상 | 기술 | 공식 문서 |
|---|---|---|
| 정형 메타(user/items/tags) | Postgres (RDS) | [PostgreSQL 공식](https://www.postgresql.org/docs/) |
| 벡터(옷 임베딩) | **pgvector** (메타 필터 + 벡터 검색 한 쿼리) | [pgvector 공식](https://github.com/pgvector/pgvector) |
| 이미지 원본/크롭/합성 | S3 (URL만 DB) | [tech-stack-catalog.md §4.4](./tech-stack-catalog.md) |

**STEP1 단순화 옵션**: 초기엔 AWS 풀스택 대신 **Supabase(Postgres+pgvector) 한 곳**으로 시작하면 운영 부담이 더 작다(랜딩에서 이미 Supabase 사용 중). 트래픽·제어 필요가 커지면 RDS로 이전.
- [Supabase pgvector 공식](https://supabase.com/docs/guides/database/extensions/pgvector) · [Supabase 벡터 컬럼 공식](https://supabase.com/docs/guides/ai/vector-columns)

**임베딩 모델 선택 (옷은 이미지 중심이라 중요)**

| 임베딩 | 특징 | 공식 문서 |
|---|---|---|
| **Voyage multimodal** (`voyage-multimodal-3`) | 이미지+텍스트 한 벡터, Anthropic 권장 | [Voyage 멀티모달 공식](https://docs.voyageai.com/docs/multimodal-embeddings) |
| **Fashion-CLIP** (자체 호스팅) | 패션 800K 학습, 도메인 특화 시각 유사도 | [Fashion-CLIP 모델 카드](https://huggingface.co/patrickjohncyh/fashion-clip) |
| OpenAI text-embedding-3 | 텍스트 태그만 임베딩 시 (저렴) | [tech-stack-catalog.md §5.3](./tech-stack-catalog.md) |

→ 옷장은 **시각 유사도가 핵심**이므로 텍스트 전용 임베딩보다 **멀티모달(Voyage) 또는 Fashion-CLIP**을 PoC에서 비교 권장.

---

## 5. 옷 추천 — AI 에이전트 RAG

"옷장 DB에서 상황(날씨·TPO)에 맞는 조합을 찾아 추천". RAG = pgvector로 후보 검색 → Claude가 조합·설명.

| 구성 | 추천 기술 | 공식 문서 |
|---|---|---|
| **추천 추론·조합 에이전트** | **Claude `claude-opus-4-8`** (tool_use로 옷장 조회·조합) | [Claude tool use 공식](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) |
| 검색(Retrieval) | pgvector 유사도 + 메타 필터(계절·카테고리) | [pgvector 공식](https://github.com/pgvector/pgvector) |
| RAG 오케스트레이션 | LangChain/LangGraph (또는 직접 구현) | [tech-stack-catalog.md §2.2](./tech-stack-catalog.md) |
| 검증(Critic) | Claude Haiku로 조합 적합성 검증 | [tech-stack-catalog.md §5.1](./tech-stack-catalog.md) |

**STEP1 권장 구현 형태 (간단부터)**
1. **단일 LLM 호출 + tool_use**로 시작: Claude가 `search_wardrobe(user_id, filters)` 툴을 호출 → pgvector 결과를 받아 조합 N개 생성. (멀티에이전트는 필요해지면 LangGraph로 확장)
2. 모델은 기본 `claude-opus-4-8`. 한국어·도메인 추론·구조화 JSON·tool_use 강점이 옷장에 맞는다([카탈로그 §5.1 비교표](./tech-stack-catalog.md)).
3. 추천 결과의 옷별 이미지·이유를 구조화 출력으로 반환 → 격자 UI에 그대로 연결.

**공식 출처(Claude 측)**
- [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) · [구조화 출력](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) · [모델·가격](https://platform.claude.com/docs/en/about-claude/models/overview)
- 임베딩 RAG 자동화 예: [Supabase automatic embeddings 공식](https://supabase.com/docs/guides/ai/automatic-embeddings)

---

## 6. STEP1 최소 구현 경로 (요약)

가장 빠른 검증 경로 — **외부 시각 검색·자체 GPU 모델을 모두 빼고** 시작:

```
웹: <input type=file>  /  앱: Capacitor Camera   →  S3 업로드
        ↓
Claude Vision → 옷 속성 JSON (카테고리·색·소재·패턴)
        ↓
Supabase(Postgres+pgvector): 메타 + (Voyage/Fashion-CLIP) 임베딩 저장
        ↓
Claude(opus-4-8) tool_use + pgvector 검색 → 코디 추천
```

이후 필요해지는 순서대로: YOLO/SAM 옷 분리 → 마네킹 합성(Flux Kontext) → 멀티에이전트(LangGraph) → (정말 필요하면) SerpApi 시각 검색.

### 각 기능 "구현 가능?" 한 줄 결론

| 기능 | 가능? | 핵심 근거 |
|---|---|---|
| ① 앨범 등록 | ✅ 즉시 | File API / Capacitor Camera, 무리 없음 |
| ② 옷 인식·매핑 | ✅ 가능 | Vision LLM 속성 추출이 안정적 경로. 분리/크롭은 YOLO+SAM로 확장 |
| ②’ 외부 시각 검색 | ⚠️ 조건부 | **Google 공식 API 없음**. SerpApi 등 우회 가능하나 코어에 넣지 말 것 |
| ③ DB 등록 | ✅ 검증됨 | Postgres+pgvector(또는 Supabase), 카탈로그에 설계 완료 |
| ④ 옷 추천 | ✅ 가능 | Claude tool_use + pgvector RAG, 단일 호출부터 시작 |

---

## 부록: 공식 문서 출처 모음

- 이미지 피커: [MDN input/file](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) · [Capacitor Camera](https://capacitorjs.com/docs/apis/camera) · [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) · [Flutter image_picker](https://pub.dev/packages/image_picker)
- 옷 인식: [Claude Vision](https://platform.claude.com/docs/en/build-with-claude/vision) · [Ultralytics YOLO Segment](https://docs.ultralytics.com/tasks/segment/) · [SAM 2](https://github.com/facebookresearch/sam2) · [DeepFashion2](https://github.com/switchablenorms/DeepFashion2) · [Fashion-CLIP](https://huggingface.co/patrickjohncyh/fashion-clip) · [Replicate](https://replicate.com/docs)
- 외부 시각 검색: [Google Vision Product Search](https://cloud.google.com/vision/product-search/docs) · [Google Custom Search JSON API](https://developers.google.com/custom-search/v1/using_rest) · [SerpApi Google Lens](https://serpapi.com/google-lens-api) · [Bing Visual Search](https://learn.microsoft.com/en-us/bing/search-apis/bing-visual-search/overview)
- DB·벡터: [pgvector](https://github.com/pgvector/pgvector) · [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector) · [Supabase 벡터 컬럼](https://supabase.com/docs/guides/ai/vector-columns) · [Voyage 멀티모달 임베딩](https://docs.voyageai.com/docs/multimodal-embeddings)
- 추천·RAG: [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) · [Claude 구조화 출력](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) · [Supabase automatic embeddings](https://supabase.com/docs/guides/ai/automatic-embeddings)
