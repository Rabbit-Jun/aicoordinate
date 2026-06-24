# 1 Phase MVP 기술 리서치 — 기능별 구현 가능 기술 목록

> 1단계 MVP의 4개 기능에 대해 **구현 가능성이 있는 기술 후보들을 출처와 함께 나열**한다.
> 단일 추천이 아니라 "선택지 목록"이다. 비교·판단·PoC 흐름은 [step1-mvp-tech-research.md](./step1-mvp-tech-research.md),
> DB·임베딩·RAG 인프라 상세는 [tech-stack-catalog.md](./tech-stack-catalog.md) 참조.

조사 기준일: 2026-06-22. 출처는 벤더/프로젝트 공식 1차 문서만 표기. ✅ 안정·공식 / △ 조건부·주의 / ⚠️ 리스크.

---

## 기능 1. 앨범 등록 (기기 갤러리 → 이미지 업로드)

| # | 기술 | 환경 | 비고 | 출처(공식) |
|---|---|---|---|---|
| 1 | **HTML File API** `<input type="file" accept="image/*">` | 웹 | ✅ 무의존성·전 브라우저 | [MDN input/file](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) · [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API) |
| 2 | **Capacitor Camera 플러그인** | 앱(웹코드 재사용) | ✅ Next.js 그대로 앱 래핑, 갤러리/카메라 단일 API | [Capacitor Camera](https://capacitorjs.com/docs/apis/camera) |

| 6 | **File System Access API** | 웹(PWA) | △ 크롬 계열 중심, 호환성 확인 | [MDN File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) |

보조: HEIC(아이폰)→JPEG 변환, EXIF 회전 보정, 업로드 전 리사이즈.

---

## 기능 2. 옷 인식·매핑

### 2-A. 옷 속성 추출 (카테고리·색·소재·패턴·핏 → 구조화 JSON)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **Claude Vision** (`claude-opus-4-8` / Haiku) | ✅ 도메인 추론·구조화 출력·한국어 강점 | [Claude Vision](https://platform.claude.com/docs/en/build-with-claude/vision) · [구조화 출력](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) |
| 2 | **OpenAI GPT-4o Vision** | ✅ 범용 이미지 이해 우수 | [OpenAI Vision](https://platform.openai.com/docs/guides/images-vision) |
| 3 | **Google Gemini Vision** | ✅ 멀티모달 강함 | [Gemini Vision](https://ai.google.dev/gemini-api/docs/image-understanding) |

### 2-B. 옷 검출 / 크롭 (상·하의·아우터 영역 분리)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **Ultralytics YOLO** (Detect/Segment) | ✅ DeepFashion2로 파인튜닝 시 패션 검출 강함 | [Ultralytics YOLO](https://docs.ultralytics.com/tasks/segment/) |
| 2 | **DeepFashion2 데이터셋** | ✅ 옷 검출·세그·랜드마크 801K 라벨(학습용) | [DeepFashion2](https://github.com/switchablenorms/DeepFashion2) · [논문](https://arxiv.org/abs/1901.07973) |
| 3 | **Google Cloud Vision — Object Localization** | ✅ 공식·무학습, 일반 객체 위치 | [Object Localization](https://cloud.google.com/vision/docs/object-localizer) |
| 4 | **Detectron2 (Mask R-CNN)** | △ 커스텀 학습 시 강력, 운영 부담 ↑ | [Detectron2](https://detectron2.readthedocs.io/) |

### 2-C. 픽셀 단위 분리 (사람·배경 제거, 옷만 추출)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **SAM 2 (Segment Anything 2, Meta)** | ✅ 범용 세그멘테이션 SOTA | [SAM 2](https://github.com/facebookresearch/sam2) |
| 2 | **rembg** | ✅ 배경 제거 경량 라이브러리 | [rembg](https://github.com/danielgatis/rembg) |
| 3 | **Fashion-CLIP** | ✅ 패션 800K 학습, 시각 유사도·분류 | [Fashion-CLIP](https://huggingface.co/patrickjohncyh/fashion-clip) |

### 2-D. 모델 호스팅 (자체 GPU 회피)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **Replicate** | ✅ YOLO/SAM/Fashion 모델 API 서빙 | [Replicate](https://replicate.com/docs) |
| 2 | **Hugging Face Inference Endpoints** | ✅ 오픈모델 매니지드 서빙 | [HF Inference Endpoints](https://huggingface.co/docs/inference-endpoints) |
| 3 | **Roboflow** | ✅ 검출·세그 학습·배포 통합 | [Roboflow](https://docs.roboflow.com/) |

---

## 기능 2'. (선택) 외부 시각 검색 — "사진 → 실제 상품 정보"

> ⚠️ **Google 공식 공개 API 없음** (Lens는 제품, API 아님 — [Google 공식 답변](https://support.google.com/websearch/thread/298580848)). 코어 플로우 제외 권장.

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **SerpApi Google Lens API** | ⚠️ Lens 결과(시각매치·쇼핑·가격) 우회 제공, 비공식·유료·ToS 리스크 | [SerpApi Google Lens](https://serpapi.com/google-lens-api) |
| 2 | **Google Cloud Vision — Product Search** | △ "오픈 웹"이 아니라 **내가 색인한 내 카탈로그** 안에서만 검색 | [Vision Product Search](https://cloud.google.com/vision/product-search/docs) |
| 3 | **Google Custom Search JSON API** | △ 키워드 이미지 검색만(역방향 불가), 하루 100쿼리 무료 | [Custom Search JSON API](https://developers.google.com/custom-search/v1/using_rest) |
| 4 | **Bing Visual Search API (Microsoft)** | △ Bing Search API 단계적 종료/전환 중 — 상태 확인 필수 | [Bing Visual Search](https://learn.microsoft.com/en-us/bing/search-apis/bing-visual-search/overview) |
| 5 | **TinEye MatchEngine** | △ 근접·중복 이미지 매칭(쇼핑 정보 아님) | [TinEye API](https://services.tineye.com/MatchEngine) |

---

## 기능 3. DB 등록 (메타 + 벡터)

### 3-A. 데이터베이스

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **PostgreSQL** | ✅ 정형 메타·트랜잭션 표준 | [PostgreSQL Docs](https://www.postgresql.org/docs/) |
| 2 | **pgvector (Postgres 확장)** | ✅ 메타 필터 + 벡터 검색 한 쿼리 | [pgvector](https://github.com/pgvector/pgvector) |
| 3 | **Supabase (Postgres + pgvector)** | ✅ 초기 운영 부담 최소(랜딩에서 이미 사용) | [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector) · [벡터 컬럼](https://supabase.com/docs/guides/ai/vector-columns) |
| 4 | **AWS RDS Postgres** | ✅ 제어·확장 필요 시 | [RDS Postgres](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html) |
| 5 | 전용 벡터 DB (Pinecone / Qdrant / Weaviate) | △ 규모↑ 시 검토, 시스템 2개 부담 | [Pinecone](https://docs.pinecone.io/) · [Qdrant](https://qdrant.tech/documentation/) · [Weaviate](https://weaviate.io/developers/weaviate) |

### 3-B. 임베딩 모델 (옷=이미지 중심)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **Voyage multimodal** (`voyage-multimodal-3`) | ✅ 이미지+텍스트 한 벡터, Anthropic 권장 | [Voyage 멀티모달](https://docs.voyageai.com/docs/multimodal-embeddings) |
| 2 | **Fashion-CLIP** (자체 호스팅) | ✅ 패션 도메인 시각 유사도 | [Fashion-CLIP](https://huggingface.co/patrickjohncyh/fashion-clip) |
| 3 | **OpenAI text-embedding-3** | ✅ 텍스트 태그 임베딩 시 저렴 | [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) |
| 4 | **Cohere Embed v4 (멀티모달)** | △ 멀티모달 대안 | [Cohere Embed](https://docs.cohere.com/docs/multimodal-embeddings) |

### 3-C. 이미지 원본/크롭/합성 저장

| # | 기술 | 출처(공식) |
|---|---|---|
| 1 | **AWS S3 + CloudFront** | [S3](https://docs.aws.amazon.com/s3/) |
| 2 | **Cloudflare R2** (Egress 무료) | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| 3 | **Supabase Storage** | [Supabase Storage](https://supabase.com/docs/guides/storage) |

---

## 기능 4. 옷 추천 (AI 에이전트 RAG)

### 4-A. 추천 추론·조합 (LLM)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **Claude `claude-opus-4-8`** (tool_use) | ✅ 도메인 추론·tool_use·구조화·한국어 강점 | [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) · [모델](https://platform.claude.com/docs/en/about-claude/models/overview) |
| 2 | **OpenAI GPT-4o / function calling** | ✅ 대안 | [OpenAI Function calling](https://platform.openai.com/docs/guides/function-calling) |
| 3 | **Google Gemini function calling** | ✅ 대안 | [Gemini Function calling](https://ai.google.dev/gemini-api/docs/function-calling) |

### 4-B. 검색(Retrieval)

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **pgvector 유사도 + 메타 필터** | ✅ 한 쿼리에 계절·카테고리 필터 + 벡터 | [pgvector](https://github.com/pgvector/pgvector) |
| 2 | **Supabase automatic embeddings** | ✅ 임베딩 생성·갱신 자동화 | [Supabase auto embeddings](https://supabase.com/docs/guides/ai/automatic-embeddings) |

### 4-C. RAG / 에이전트 오케스트레이션

| # | 기술 | 비고 | 출처(공식) |
|---|---|---|---|
| 1 | **단일 LLM 호출 + tool_use** | ✅ STEP1 권장(가장 단순) | [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) |
| 2 | **LangGraph** | ✅ 멀티에이전트 확장 시 | [LangGraph](https://langchain-ai.github.io/langgraph/) |
| 3 | **LangChain** | ✅ RAG 컴포넌트 통합 | [LangChain](https://python.langchain.com/docs/introduction/) |
| 4 | **LlamaIndex** | △ RAG 특화 대안 | [LlamaIndex](https://docs.llamaindex.ai/) |

---

## 한 줄 구현 가능성 요약

| 기능 | 가능성 | 비고 |
|---|---|---|
| 1. 앨범 등록 | ✅ 즉시 | File API / Capacitor / Expo / Flutter 중 택1 |
| 2. 옷 인식·매핑 | ✅ 가능 | Vision LLM(속성) 안정 경로, 분리는 YOLO+SAM 확장 |
| 2'. 외부 시각 검색 | ⚠️ 조건부 | **Google 공식 API 없음**, SerpApi 등 우회만 — 코어 제외 권장 |
| 3. DB 등록 | ✅ 검증됨 | Postgres+pgvector / Supabase, 멀티모달 임베딩 |
| 4. 옷 추천 | ✅ 가능 | Claude tool_use + pgvector RAG, 단일 호출부터 |
