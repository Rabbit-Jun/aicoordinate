# AI Coordinate Phase 1 — 시스템 설계도 (Blueprint)

> MVP 1단계(풀세트: 옷 등록 + AI 태깅 + 마네킹 합성 + 추천)의 **실제 시스템 그림·플로우·API·DB 스키마**.
> 추상적 로드맵([mvp-roadmap.md](./mvp-roadmap.md))이 "무엇을·언제"라면, 본 문서는 **"어떻게 동작하는가"**를 다룬다.
>
> 도구별 정체·선택 이유는 [tech-stack-catalog.md](./tech-stack-catalog.md) 참조.

---

## 0. 개요

### 1단계에서 만드는 것
사용자가 옷 사진 업로드 → AI가 자동 태깅 → 옷장 디지털화 → 옷장 내 옷으로 코디 추천 → **마네킹이 입은 모습 합성 이미지**로 표시.

### 핵심 검증 가설
> "내 옷장 옷으로 AI가 만든 마네킹 코디를 보면 사용자가 가치를 느끼는가?"

### 비즈니스 제약
- 사용자당 일일 합성 5회 (비용 제어)
- MVP 비용 < ₩600,000/월 — **추정치 (사용자 100명 기준)**
- 출시 목표 3개월 — **참고용 (1인 풀타임 가정)**

> **비용 추정 근거**: Claude (~₩300K) + BFL (~₩150K, 월 1,500장 합성) + AWS 인프라 (~₩140K). 사용자 수에 비례 증가.
> **3개월 일정 근거**: 멀티에이전트 4주 + 합성 4주 + 출시 준비 4주. 검증된 일정 아님 — 학습 곡선·이슈에 따라 6개월까지 연장 가능.
> **본격 착수 전 직접 재추정 권장**.

---

## 1. 시스템 아키텍처 (한 그림)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          사용자 (모바일/웹)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Vercel (Next.js 정적 호스팅 + Edge)                                  │
│ - 로그인·옷장·코디 추천 화면                                          │
│ - Capacitor로 모바일 앱 패키징 → 앱스토어 등록                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │ HTTPS REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ AWS Cognito (인증·세션)                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │ JWT 토큰
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ AWS ECS Fargate — FastAPI 백엔드 (컨테이너 2~3개)                    │
│ - REST API 처리                                                      │
│ - 인증 검증·요청 라우팅                                              │
│ - 큐에 작업 적재만 (실제 처리는 워커)                                 │
└─────────────────────────────────────────────────────────────────────┘
        │                          │                            │
        ▼                          ▼                            ▼
┌────────────────────┐  ┌─────────────────┐    ┌──────────────────────┐
│ AWS RDS Postgres   │  │ AWS ElastiCache │    │ AWS S3 + CloudFront  │
│ + pgvector         │  │ Redis           │    │ (이미지·합성 결과)    │
│                    │  │                 │    │                      │
│ - users            │  │ - 캐시 (옷장)   │    │ - 원본 옷 사진        │
│ - items + embedding│  │ - Celery 큐     │    │ - 마네킹 합성 이미지  │
│ - combos           │  │ - 세션          │    │                      │
│ - recommendations  │  │                 │    │ CloudFront로 CDN 캐싱 │
│ - agent_logs       │  └─────────────────┘    └──────────────────────┘
└────────────────────┘          │
        ▲                        │
        │                        ▼
        │              ┌─────────────────────────────────────┐
        │              │ AWS ECS Fargate — Celery Worker     │
        └──────────────│ (컨테이너 1~2개)                     │
                       │                                     │
                       │ 백그라운드 처리:                     │
                       │ - 옷 등록 워크플로우                 │
                       │ - 멀티에이전트 호출                  │
                       │ - 마네킹 합성 요청                   │
                       └─────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
        ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
        │ Claude API  │   │ BFL Flux API │   │ OpenAI       │
        │ (Anthropic) │   │              │   │ Embeddings   │
        │             │   │ 마네킹 합성   │   │              │
        │ Vision 태깅 │   │              │   │ 텍스트→벡터  │
        │ 추천 생성    │   │              │   │              │
        │ Critic 검증 │   │              │   │              │
        └─────────────┘   └──────────────┘   └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 외곽 — 모니터링·운영                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ CloudWatch (인프라 로그) │ Sentry (에러 추적) │ Amplitude (이벤트)    │
│ Streamlit on ECS (내부 운영 대시보드, 사내 접근만)                    │
│ GitHub Actions (CI/CD: 빌드 → ECR → ECS 배포)                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 구조 핵심 원칙
1. **API ≠ Worker 분리** — API는 빠른 응답, 무거운 작업은 큐로
2. **단일 모놀리스 (FastAPI)** — 마이크로서비스 분리는 3단계+
3. **외부 SaaS 적극 활용** — Claude·BFL·Cognito 직접 운영 X
4. **S3 분리** — DB에는 메타데이터만, 이미지는 S3+CDN

---

## 2. 컴포넌트별 책임

### 2.1 프론트엔드 (Next.js + Capacitor)
| 책임 | 예시 |
|---|---|
| UI 렌더링 | 옷장 격자뷰, 마네킹 격자뷰, 모달 |
| 사용자 입력 | 옷 사진 업로드, 코디 추천 요청 |
| 인증 토큰 관리 | Cognito JWT 저장·갱신 |
| 상태 관리 | 로컬 캐시, 낙관적 UI 업데이트 |
| 모바일 네이티브 연동 | 카메라 (Capacitor), 푸시 권한 |

### 2.2 백엔드 API (FastAPI on ECS)
| 책임 | 하지 않는 것 |
|---|---|
| ✅ HTTP 요청 받기 | ❌ AI 호출 (느림 — Worker가 함) |
| ✅ 인증 검증 | ❌ 이미지 처리 (Worker가 함) |
| ✅ DB CRUD | ❌ 합성 (Worker가 함) |
| ✅ Celery 큐에 작업 적재 | |
| ✅ 결과 조회·반환 | |

→ **API는 < 200ms 응답 목표**. 그 이상 걸리면 큐로.

### 2.3 Celery Worker (ECS Fargate)
| 책임 |
|---|
| 옷 등록 워크플로우 실행 ([multi-agent-design.md](./multi-agent-design.md)의 6단계) |
| **멀티에이전트 호출 조율 (1단계 핵심)** — Vision·Tagger·Critic·Combo·Curator 13개 에이전트 |
| 외부 API 호출 (Claude·BFL·OpenAI) |
| 결과 DB 저장 |
| 푸시 알림 발송 |

→ **워커는 시간 제약 없음**. 8~15초 걸려도 OK.

#### ⭐ 1단계는 옷(clothing) 전용 멀티에이전트 풀세트

옷 등록·추천 모두 **10개 에이전트 협업**으로 처리. 신발·가방·액세서리는 Phase 2 확장. 상세 설계 → [multi-agent-design.md](./multi-agent-design.md)

| 에이전트 | 모델 | 역할 |
|---|---|---|
| Orchestrator | (no LLM) | 전체 워크플로우 조율 |
| Vision Agent | Haiku V | **옷(clothing) / 옷 아님 분류** |
| Clothing Specialist | Sonnet V | 옷 정밀 태깅 |
| Critic | Haiku | 결과 검증 (Reflection 루프) |
| Re-Tagger | Sonnet V | Critic 거부 시 재시도 |
| Duplicate Detector | (no LLM) | 임베딩 + pgvector 중복 검사 |
| Style Theorist | Sonnet | 스타일 의견 |
| Color Matcher | Haiku | 색 매칭 |
| Occasion Tagger | Haiku | 자리 분류 |
| Curator | Sonnet | 3 의견 합의 → 최종 조합 |

> **Phase 2 추가 예정**: Footwear Specialist · Bag Specialist · Accessory Specialist + 동적 라우팅

→ **Week 1~4 구현 로드맵**: [multi-agent-design.md §9](./multi-agent-design.md) 참조.

### 2.4 DB (RDS Postgres + pgvector)
| 책임 |
|---|
| 사용자·옷·추천 영구 저장 |
| 트랜잭션 보장 |
| 벡터 유사도 검색 (pgvector) |
| 운영 데이터의 단일 진실 원천 |

### 2.5 Redis (ElastiCache)
| 책임 |
|---|
| Celery 메시지 브로커 (작업 큐) |
| 옷장 조회 캐싱 (Postgres 부담 ↓) |
| 사용자별 일일 합성 횟수 카운팅 (TTL 24h) |
| 세션 데이터 (옵션) |

### 2.6 S3 + CloudFront
| 책임 |
|---|
| 원본 옷 사진 영구 저장 |
| 마네킹 합성 결과 이미지 저장 |
| CloudFront로 글로벌 CDN 캐싱 |

→ DB에는 S3 URL만 저장, 실제 파일은 S3에.

---

### 2.7 RAG 컴포넌트 ⭐ (1단계 핵심)

상세는 [rag-design.md](./rag-design.md) §2 참조.

#### 옷장 도메인은 RAG가 필수
- 사용자 옷장 데이터는 **100% LLM 학습에 없는 폐쇄 도메인** → RAG 없이는 추천 불가능
- "LLM이 내 옷장을 알 리 없음" → 반드시 검색 후 컨텍스트 주입

#### Phase 1 RAG 흐름 (Curator Agent 안)

```
[사용자 추천 요청: occasion + season]
            ↓
   ┌─ R: Retrieval ─────────────────────────────┐
   │  Retriever (pgvector cosine)                │
   │  - user_id 격리                              │
   │  - 임베딩 비교 → Top-12 옷                   │
   │  - 일반 컬럼 필터 (category·season)          │
   └──────────────────────────────────────────────┘
            ↓
   ┌─ A: Augmented ──────────────────────────────┐
   │  컨텍스트 조립                                │
   │  - 옷장 12벌 메타데이터                       │
   │  - Style/Color/Occasion 에이전트 의견 3종    │
   │  - Curator system prompt                     │
   └──────────────────────────────────────────────┘
            ↓
   ┌─ G: Generation ─────────────────────────────┐
   │  Curator (Sonnet)                            │
   │  → 조합 3개 JSON 생성                        │
   │  → Wardrobe Fidelity 자가 검증 (없는 옷 X)  │
   └──────────────────────────────────────────────┘
```

#### Phase 1 RAG 결정사항 (상세 → rag-design.md)
| 영역 | 1단계 결정 |
|---|---|
| 인덱싱 | item → Document 변환, user_id 격리 메타데이터 필수 |
| 청킹 | 옷 1벌 = 1 청크 (알고리즘 불필요) |
| 임베딩 | OpenAI text-3-small + CLIP image |
| 벡터 DB | **pgvector (RDS Postgres 확장)** |
| 리트리벌 | Dense only (코사인), Top-K=12 |
| Pre/Post-Retrieval | 없음 (2단계에 Query Rewrite·MMR·Reranking 추가) |
| 멀티모달 | 컬렉션 분리 (text·image 별도) |
| 검증 | Critic + **Wardrobe Fidelity = 1.00** (없는 옷 추천 0건 절대) |

→ **Wardrobe Fidelity가 옷장 RAG의 킬러 메트릭** — 사용자 신뢰의 근간.

---

### 2.8 Data Pipeline ⭐ (1단계 시작 라인업)

상세는 [mvp-roadmap.md §1.3](./mvp-roadmap.md) 참조.

#### 1단계 데이터 흐름

```
[운영 — 실시간]
   사용자 행동 → Amplitude (자동)
   옷 등록·추천 → RDS Postgres (items, recommendations, agent_logs)
   AI 호출 로그 → agent_logs 테이블
            ↓
[일간 batch — GitHub Actions cron]
   RDS daily snapshot → S3 Parquet 백업
   Amplitude weekly export → S3 Parquet
            ↓
[분석 — ad-hoc]
   분석가 로컬에서 DuckDB로 S3 Parquet 직접 쿼리
   → Streamlit 대시보드 (운영 KPI 시각화)
            ↓
[알림]
   비용·에러 임계값 초과 → Slack
```

#### 1단계 Data Pipeline 라인업

| 영역 | 도구 | 역할 |
|---|---|---|
| **수집** | requests / httpx | 외부 트렌드 단발 크롤링 (수동) |
| **저장 (운영)** | RDS Postgres | 트랜잭션·동시성·pgvector |
| **저장 (스토리지)** | S3 | 이미지·Parquet 백업 |
| **저장 (분석)** | DuckDB (로컬) | S3 Parquet 직접 쿼리 |
| **가공** | Python + SQL | 1단계는 수동 분석 위주 |
| **스케줄** | GitHub Actions cron + Celery beat | 외부 ETL + 앱 내 정기 작업 |
| **품질** | Python assert + pytest | 단위·통합 테스트 |
| **활용** | Streamlit on ECS | 운영 KPI 대시보드 (사내) |
| **모니터링** | CloudWatch + Sentry + Amplitude | 인프라·에러·사용자 행동 |

#### 1단계 의도적 제외 (2단계로 미룸)
- ❌ Kafka 이벤트 스트리밍 (2~3단계)
- ❌ Airflow / Dagster DAG (2단계 GitHub Actions로 충분)
- ❌ dbt 변환 (2단계 — 분석 쿼리 10+ 시)
- ❌ Great Expectations 데이터 품질 (2단계)
- ❌ BigQuery / Snowflake (3단계)
- ❌ Spark (3단계)

→ **1단계는 "최소 데이터 파이프라인"으로 운영 가능성·비용 효율 우선**.

#### 1단계 데이터 파이프라인 의도
| 의도 | 도구 |
|---|---|
| "운영 데이터 안전 보관" | RDS 자동 백업 + S3 |
| "분석가가 빠른 ad-hoc 쿼리" | DuckDB + Parquet |
| "운영자 KPI 즉시 확인" | Streamlit 대시보드 |
| "비기술자도 퍼널 분석" | Amplitude |
| "에러·비용 알림 자동" | Sentry + CloudWatch + Slack |
| "사고 진단 빠르게" | 통합 로깅 |

→ **본격 데이터 인프라(Kafka·Airflow·Spark)는 사용자 1만+ 단계에 도입**. 1단계는 GitHub Actions cron으로 충분.

---

## 3. 주요 워크플로우

### 3.1 워크플로우 — 회원가입·로그인

```
[사용자] 이메일·비밀번호 입력
       ↓
[Next.js] AWS Cognito SDK 호출
       ↓
[Cognito] 검증 → JWT 발급
       ↓
[Next.js] JWT를 모든 API 요청 헤더에 첨부
       ↓
[FastAPI] JWT 검증 (Cognito 공개키로)
       → user_id 추출 → 요청 처리
```

### 3.2 워크플로우 — 옷 등록 (★ 핵심)

```
1. [사용자] 카메라로 옷 사진 촬영
   - Capacitor 카메라 플러그인
   
2. [Next.js] 사진을 S3에 직접 업로드 (presigned URL 방식)
   - 백엔드 경유 없이 S3로 바로 → 백엔드 부담 ↓
   
3. [Next.js] 업로드 완료 후 백엔드에 알림
   POST /api/wardrobe/items
   { image_url: "https://cdn.../abc.jpg" }
   
4. [FastAPI] 검증 + Celery 큐에 작업 적재
   register_clothing.delay(user_id, image_url)
   → 즉시 응답: { item_id: "pending-xyz", status: "processing" }
   
5. [Next.js] 처리 중 인디케이터 표시 (사용자는 다른 작업 가능)
   
6. [Celery Worker] 큐에서 작업 꺼냄
   ↓
   ┌─ Vision Agent (Claude Vision)
   │    이미지 → "베이지 트렌치 코트" 식별
   ↓
   ┌─ Clothing Specialist + Critic 루프
   │    카테고리·색·소재·스타일 태깅
   ↓
   ┌─ Embedding (OpenAI text-3-small)
   │    옷 메타데이터 → 1536차원 벡터
   ↓
   ┌─ DB INSERT
   │    items (image_url, metadata, embedding)
   ↓
   ┌─ Combo Predictor (이 옷으로 만들 수 있는 신규 조합 N개)
   ↓
   ┌─ Push 알림: "등록 완료! 새 조합 N개 발견"
   
7. [Next.js] 푸시 받으면 → 옷장 화면 갱신
   GET /api/wardrobe/items
```

**예상 시간**: 8~15초 (사용자는 푸시로 알림 받음)

### 3.3 워크플로우 — 코디 추천 받기 (옵션·버튼 기반)

> **챗봇/자연어 질문 없음**. 옵션 선택·버튼 클릭으로 추천 요청.

#### 추천 요청 UI 패턴
사용자는 다음 중 선택:
- **빠른 추천**: "✨ 오늘 뭐 입지?" 버튼 (날씨·시즌 자동 반영)
- **자리별 추천**: [출근] [데이트] [면접] [캐주얼] [운동] 버튼
- **시즌별**: [봄] [여름] [가을] [겨울] (현재 시즌 기본 선택)
- **선택 옷 기반**: 옷장에서 옷 1개 탭 → "이걸로 코디 추천" 버튼

→ **자연어 입력 없음** = 챗봇 X. 버튼·옵션만으로 요청 명세 완성.

```
1. [사용자] 옵션 선택 + "추천 받기" 버튼 탭
   POST /api/recommendations
   {
     occasion: "interview",     // 자리 (enum)
     season: "fall",            // 시즌 (자동 또는 선택)
     weather_aware: true,       // 위치 기반 날씨 반영 여부
     count: 3                   // 추천 개수
   }
   
2. [FastAPI] 큐에 작업 적재
   generate_recommendation.delay(user_id, occasion, season, ...)
   → 즉시 응답: { recommendation_id: "rec-abc", status: "processing" }
   
3. [Celery Worker]
   ↓
   ┌─ 컨텍스트 조립
   │    occasion·season → 검색 키워드 자동 생성
   │    예: occasion="interview" + season="fall" + 비
   │       → "격식, 단정, 가을, 비 대비, 무채색"
   ↓
   ┌─ Retriever (pgvector cosine)
   │    user_id 격리 + 위 키워드 임베딩 → Top-12 옷
   ↓
   ┌─ Combo Collaboration (multi-agent)
   │    Style + Color + Occasion 3 agent 병렬
   │    → Curator가 합의 → 조합 3개
   ↓
   ┌─ DB INSERT
   │    recommendations (combos, reasoning)
   ↓
   ┌─ 합성 한도 체크 (Redis: daily_synth_count)
   │    초과 시 → 텍스트만 반환
   │    여유 → 마네킹 합성 워크플로우 시작
   ↓
   ┌─ BFL Flux (또는 GPT) API 호출 (각 조합당 1회)
   │    ★ 1주 PoC로 GPT vs BFL 직접 비교 후 선택 (§12 참조)
   │    옷 이미지 N장 + 마네킹 → 합성 이미지
   ↓
   ┌─ 합성 결과 S3 업로드 → URL DB 저장
   ↓
   ┌─ Push 알림: "코디 3개 완성!"
   
4. [Next.js] 푸시 받으면 → 결과 화면 표시
   GET /api/recommendations/{rec-id}
```

**예상 시간**: 15~25초 (3개 합성 포함)

### 3.4 워크플로우 — 마네킹 합성 결과 보기 (지연 로드)

```
사용자가 코디 카드 탭
       ↓
GET /api/recommendations/{rec-id}/combos/{combo-id}
       ↓
[FastAPI] DB 조회 → S3 URL 반환
       ↓
[Next.js] <Image src="https://cdn.../mannequin-xyz.webp"/>
       ↓
[CloudFront CDN] 캐시된 이미지 즉시 응답
```

→ **합성 자체는 추천 시점에 끝남**, 보는 건 CDN 캐시에서 즉시.

---

## 4. 데이터 모델 (DB 스키마)

### 4.1 핵심 테이블

```sql
-- 사용자 (Cognito user_id와 매핑)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_sub TEXT UNIQUE NOT NULL,  -- Cognito 사용자 ID
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    preferences JSONB DEFAULT '{}',     -- 사용자 선호 누적
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 옷장 옷
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,            -- S3 원본
    image_url_processed TEXT,           -- 배경 제거된 버전
    category TEXT NOT NULL,             -- outer/top/bottom (Phase 1: 옷만. shoes/bag/accessory는 Phase 2)
    subcategory TEXT,                   -- trench/cardigan/slacks ...
    color_primary TEXT,
    color_secondary TEXT[],
    materials TEXT[],
    styles TEXT[],                      -- casual/formal/vintage ...
    seasons TEXT[],                     -- spring/summer/fall/winter
    description TEXT,                   -- Vision LLM 캡션
    embedding vector(1536),             -- pgvector 텍스트 임베딩
    image_embedding vector(512),        -- pgvector CLIP 이미지 임베딩
    added_at TIMESTAMPTZ DEFAULT NOW(),
    last_worn_at TIMESTAMPTZ,
    archived BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_items_user ON items(user_id) WHERE archived = FALSE;
CREATE INDEX idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops);

-- 옷 태그 (다중 태그)
CREATE TABLE item_tags (
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    tag_value TEXT,
    confidence FLOAT,
    source TEXT,                        -- 'auto' | 'manual'
    PRIMARY KEY (item_id, tag_name, tag_value)
);

-- 추천 요청
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    status TEXT NOT NULL,               -- 'processing' | 'completed' | 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 추천 조합 (한 추천에 N개 조합)
CREATE TABLE combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
    item_ids UUID[] NOT NULL,           -- 옷장 옷 ID들
    style_score FLOAT,
    occasions TEXT[],
    reasoning TEXT,                     -- Curator가 작성한 이유
    mannequin_image_url TEXT,           -- 합성 결과 S3 URL
    synthesis_status TEXT,              -- 'pending' | 'completed' | 'skipped'
    user_feedback TEXT,                 -- 'liked' | 'disliked' | NULL
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 에이전트 실행 로그 (모니터링용)
CREATE TABLE agent_logs (
    id BIGSERIAL PRIMARY KEY,
    workflow_id UUID NOT NULL,          -- 한 옷 등록·추천 단위
    user_id UUID,
    agent_name TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    duration_ms INT,
    input_tokens INT,
    output_tokens INT,
    cost_krw NUMERIC(10, 4),
    success BOOLEAN,
    error TEXT,
    retry_count INT DEFAULT 0
);
CREATE INDEX idx_agent_logs_workflow ON agent_logs(workflow_id);
CREATE INDEX idx_agent_logs_created ON agent_logs(started_at DESC);
```

### 4.2 RLS (Row Level Security) — 사용자 격리
```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_items_isolation ON items
    USING (user_id = current_setting('app.current_user_id')::uuid);
-- → 다른 사용자 옷 절대 노출 불가
```

---

## 5. API 엔드포인트 (REST)

### 5.1 인증 (Cognito 직접 사용)
```
POST   /auth/signup              { email, password } → Cognito 등록
POST   /auth/login               { email, password } → JWT 토큰
POST   /auth/refresh             { refresh_token }  → 새 JWT
DELETE /auth/logout
```

### 5.2 옷장
```
POST   /api/wardrobe/items/upload-url      → S3 presigned URL
POST   /api/wardrobe/items                 { image_url } → 등록 task 큐 적재
GET    /api/wardrobe/items                 → 사용자 옷장 전체
GET    /api/wardrobe/items/{item_id}       → 옷 상세
PATCH  /api/wardrobe/items/{item_id}       → 태그 수정 (사용자가)
DELETE /api/wardrobe/items/{item_id}       → 옷 삭제 (soft delete)
```

### 5.3 추천 (옵션·버튼 기반 — 자연어 query 없음)
```
POST   /api/recommendations
       {
         occasion: "interview"|"date"|"office"|"casual"|"sport"|"home",
         season:   "spring"|"summer"|"fall"|"winter",  // 자동/수동
         weather_aware: true|false,                     // 위치 기반 날씨 반영
         base_item_id: "uuid-optional",                 // 옷장 옷 1개 기반 추천 (선택)
         count: 1~5
       }
       → 추천 task 큐 적재
GET    /api/recommendations/{rec_id}       → 추천 상태·결과
GET    /api/recommendations                → 최근 추천 이력
POST   /api/recommendations/{rec_id}/combos/{combo_id}/feedback
                                            { feedback: 'liked'|'disliked' }
```

> **자연어 입력 폐기 이유**: 챗봇 기능 안 만듦. enum + boolean으로 검색 명세 정확히 전달.
> 2단계+에서 NLU 기능 추가 검토.

### 5.4 운영 (관리자)
```
GET    /admin/users                        → 가입자 통계
GET    /admin/workflows/{workflow_id}      → 디버깅용 trace
GET    /admin/costs                        → 비용 모니터링
```

---

## 6. 인프라 토폴로지 (AWS)

```
┌─────────────────────────────────────────────────────────────────┐
│ AWS Region: ap-northeast-2 (서울)                                │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ VPC                                                         │ │
│ │  ┌──────────────────┐    ┌──────────────────────────────┐ │ │
│ │  │ Public Subnet    │    │ Private Subnet               │ │ │
│ │  │                  │    │                              │ │ │
│ │  │ - ALB (Load Bal) │───→│ - ECS Fargate (FastAPI ×2)   │ │ │
│ │  │ - NAT Gateway    │    │ - ECS Fargate (Celery ×1~2)  │ │ │
│ │  └──────────────────┘    │ - RDS Postgres               │ │ │
│ │                          │ - ElastiCache Redis          │ │ │
│ │                          └──────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 글로벌 서비스 (VPC 밖):                                          │
│  - S3 + CloudFront                                              │
│  - Cognito                                                       │
│  - Secrets Manager                                              │
│  - CloudWatch                                                   │
│  - ECR (Docker 레지스트리)                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↑
                            │ HTTPS
                            │
┌─────────────────────────────────────────────────────────────────┐
│ Vercel (글로벌 엣지) — Next.js 프론트                              │
└─────────────────────────────────────────────────────────────────┘
```

### 인스턴스 사이즈 (1단계 시작)
| 리소스 | 사이즈 | 월 비용 |
|---|---|---|
| ECS Fargate (FastAPI) | 0.5 vCPU / 1GB × 2개 | ~$20 |
| ECS Fargate (Worker) | 1 vCPU / 2GB × 1개 | ~$15 |
| RDS Postgres | db.t4g.small | ~$25 |
| ElastiCache Redis | cache.t4g.micro | ~$15 |
| S3 (50GB) + CloudFront | | ~$10 |
| Cognito (1K MAU) | 무료 tier | $0 |
| 기타 (CloudWatch·Secrets·NAT) | | ~$15 |
| **합계** | | **~$100** |

---

## 7. 데이터 플로우 — 옷 1장 등록부터 추천까지

```
[사용자]
   │ 1. 옷 사진 촬영 (Capacitor 카메라)
   ▼
[Next.js (Vercel)]
   │ 2. S3 presigned URL 요청
   ▼
[FastAPI (ECS)] → presigned URL 발급 (S3 직접 업로드용)
   │
   │ 3. Next.js가 S3에 직접 업로드 (백엔드 부담 X)
   ▼
[S3] 원본 사진 저장 → CloudFront 자동 캐싱
   │
   │ 4. Next.js → 백엔드 알림 "업로드 완료"
   ▼
[FastAPI] → Celery 큐에 register_clothing task 적재
   │
   │ 5. Redis에 task 메시지 저장
   ▼
[ElastiCache Redis] (FIFO 큐)
   │
   │ 6. Worker가 큐에서 꺼냄
   ▼
[Celery Worker (ECS)]
   │ 7. Claude Vision으로 분석 (외부 API)
   │ 8. OpenAI 임베딩 (외부 API)
   │ 9. RDS에 items INSERT
   │ 10. Combo Predictor → combos INSERT
   ▼
[RDS Postgres + pgvector]
   │
   │ 11. Worker → 푸시 알림 발송
   ▼
[Firebase/SNS] → [사용자 모바일]
   │
   │ 12. 사용자가 추천 요청
   ▼
[FastAPI] → Celery 큐에 generate_recommendation task 적재
   │
   │ 13~17. 위와 비슷한 흐름 + BFL Flux 합성 호출
   ▼
[합성 이미지 S3 저장 → DB URL 업데이트 → 푸시]
```

---

## 8. 보안·인증

### 8.1 인증 흐름 (Cognito)
```
[로그인]
사용자 → Cognito (이메일+비밀번호)
     ← JWT (access_token, id_token, refresh_token)

[API 호출]
Next.js → FastAPI [Authorization: Bearer <access_token>]
FastAPI → Cognito JWKS로 토큰 검증 (캐시된 공개키)
       → user_id 추출 → 요청 처리
```

### 8.2 RLS — 다른 사용자 데이터 절대 노출 X
- DB level: Postgres RLS 정책
- API level: 모든 쿼리에 `WHERE user_id = ?` 강제
- 두 layer 방어

### 8.3 시크릿 관리
- DB 비밀번호, API 키 → **Secrets Manager**
- 코드·환경변수에 평문 절대 X
- ECS 컨테이너가 IAM Role로 Secrets Manager 자동 접근

### 8.4 이미지 접근 제어
- S3 버킷은 private
- 사용자가 자기 이미지 보려면 presigned URL (1시간 유효)
- CloudFront 서명 URL로 일부 공개 (선택)

---

## 9. 모니터링·로깅

### 9.1 인프라 (CloudWatch)
- ECS 컨테이너 stdout/stderr → CloudWatch Logs
- RDS 슬로우 쿼리·CPU·연결 수
- ElastiCache 메모리·히트율
- 알람: CPU > 80%, 에러율 > 5%

### 9.2 에러 추적 (Sentry)
- FastAPI·Worker의 unhandled exception 자동 전송
- 사용자 영향 분석
- 슬랙 알림 연동

### 9.3 사용자 행동 (Amplitude)
- 옷 등록·추천 요청·합성 만족도 이벤트
- 퍼널·리텐션 분석
- 랜딩 페이지에서 이미 사용 중

### 9.4 LLM 호출 (자체 AgentLog + 향후 Langfuse)
- 모든 LLM 호출 → agent_logs 테이블
- 토큰·비용·성공률·재시도율 추적
- Streamlit 대시보드에서 일별 시각화

### 9.5 내부 운영 대시보드 (Streamlit on ECS)
| 위젯 |
|---|
| 일별 가입자·옷 등록량 |
| Critic 통과율 |
| 평균 추천 처리 시간 |
| LLM 비용 (Claude/OpenAI/BFL) |
| Human Review Queue 대기 건수 |
| 에러 로그 (Sentry 링크) |

---

## 10. 배포·CI/CD

### 10.1 GitHub Actions 파이프라인

```yaml
# .github/workflows/deploy.yml (간략화)
on: push: [main]
jobs:
  test:
    - pytest (단위·통합 테스트)
    - ruff (lint)
    - mypy (타입 체크)
  
  build:
    needs: test
    - docker build -t app .
    - aws ecr push
  
  deploy:
    needs: build
    - aws ecs update-service (롤링 배포)
    - 헬스 체크 통과 시 트래픽 전환
    - 실패 시 자동 롤백
```

### 10.2 환경 분리
| 환경 | 호스팅 | 용도 |
|---|---|---|
| **local** | Docker Compose | 개발자 로컬 |
| **dev** | AWS ECS (별도 클러스터) | 개발팀 통합 테스트 |
| **prod** | AWS ECS | 실사용자 |

### 10.3 DB 마이그레이션
- Alembic (SQLAlchemy 마이그레이션 도구)
- GitHub Actions에서 자동 실행 또는 수동 (위험한 변경)

---

## 11. 성능·확장 고려

### 11.1 부하 시 동작
- **트래픽 ↑ → ECS 자동 스케일링** (CPU 70% 초과 시 컨테이너 증가)
- **DB 부하 ↑ → Read Replica** (2단계)
- **Redis 부하 ↑ → 클러스터 모드** (3단계)

### 11.2 SLO (1단계 목표)
| 지표 | 목표 |
|---|---|
| API p95 응답 시간 | < 500ms |
| 옷 등록 처리 시간 (e2e) | < 15초 |
| 추천 처리 시간 (합성 포함) | < 25초 |
| 가동률 | 99% (월 7시간 다운타임 허용) |

### 11.3 비용 절감 트리거
| 비용 | 조치 |
|---|---|
| Claude > ₩500K/월 | Critic을 Haiku로 강제 |
| BFL > ₩500K/월 | 합성 한도 강화 (일 3회로 감소) |
| RDS CPU > 70% | Read Replica 또는 인스턴스 업그레이드 |

---

## 12. 1단계 출시 체크리스트

### 출시 전 필수
- [ ] **합성 모델 PoC** — GPT (DALL-E 3) vs BFL Flux Kontext 1주 비교 (사용자 옷 5세트 × 3회 합성, 일관성·정확도·비용 평가)
- [ ] **멀티에이전트 13개 구현** — [multi-agent-design.md](./multi-agent-design.md) Week 1~4 로드맵 완료
- [ ] AWS 인프라 IaC (CDK 또는 Terraform)
- [ ] CI/CD 파이프라인
- [ ] 로깅·모니터링·알람 설정 (CloudWatch + Sentry)
- [ ] 시크릿 관리 (Secrets Manager)
- [ ] DB 백업 자동화 (RDS 자동 백업)
- [ ] 개인정보 처리방침·이용약관 (법률 검토)
- [ ] 합성 한도 강제 (비용 폭주 방지, 일 5회)
- [ ] human_review_queue 운영 프로세스
- [ ] 베타 테스터 모집 (5~10명)

### 출시 후 1주 모니터링
- [ ] 일일 비용 모니터링 (Slack 알림)
- [ ] Sentry 에러 0건 유지
- [ ] 사용자 인터뷰 (5명, 첫 사용 경험)
- [ ] Critic Pass Rate, Wardrobe Fidelity 추적

---

## 13. 관련 문서

- [mvp-roadmap.md](./mvp-roadmap.md) — 1·2·3단계 전체 로드맵
- [tech-stack-catalog.md](./tech-stack-catalog.md) — 사용 도구별 상세 설명
- [multi-agent-design.md](./multi-agent-design.md) — 옷 등록 멀티에이전트 상세
- [rag-design.md](./rag-design.md) — RAG 시스템 단계별 설계
- [**cost-reference.md**](./cost-reference.md) — **모든 비용 + 공식 출처 URL** ⭐
- [architecture.md](../architecture.md) — 원본 시스템 아키텍처

---

**문서 버전**: v0.1 (2026-06-12 초안)
