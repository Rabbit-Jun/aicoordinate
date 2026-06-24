# AI Coordinate — MVP 3단계 로드맵

> 옷장 코디 서비스의 백엔드·데이터·인프라 단계별 진화 계획.
> **1단계(MVP, 풀세트)** → **2단계(기능 확장)** → **3단계(기능 고도화)** 순서로 같은 도메인 안에서 깊이 파기.
>
> 본 문서는 [architecture.md](../architecture.md)와 [multi-agent-design.md](./multi-agent-design.md)의 청사진을 단계별 우선순위·기술 선택으로 구체화한 실행 로드맵이다.

## 0. 결정 사항 (사용자 답변 반영)

| 영역 | 결정 | 근거 |
|---|---|---|
| **MVP 범위** | **풀세트** — 옷 등록 + AI 태깅 + 마네킹 합성 + 추천 | 핵심 가치(마네킹 격자뷰) 한 번에 완성, V1 출시 |
| **플랫폼** | **Next.js + Capacitor** | 랜딩 스택, 웹·앱 동시, AI 코드 도구(v0.dev) 활용으로 학습 부담 최소 |
| **데이터 파이프라인** | **단계별 진화** (시작 → 성장 → 확장 라인업) | 트래픽·검증도에 맞춰 점진 도입, 조기 over-engineering 회피 |
| **클라우드** | **AWS (본 개발)** ← Supabase는 랜딩(Phase 0)까지만 | AI 엔지니어 채용 시장 표준, 장기 비용·세밀한 컨트롤·서비스 풍부 |

### 옷장 도메인의 특수성 (모든 결정의 기준)
- **사용자당 데이터 소량** (옷 수십~수백 벌) — 빅데이터 인프라 조기 도입 불필요
- **이미지 중심** — 스토리지·CDN·이미지 처리가 비용·성능 핵심
- **AI 호출이 메인 비용** (LLM·Vision·합성) — DB·서버 비용보다 압도적
- **트래픽 패턴**: 옷 등록 burst + 일상 추천 요청 (실시간 + batch 혼합)
- **합성 결과가 핵심 약속** — 1장 합성 = 사용자 신뢰의 결정적 순간
- **멀티에이전트 워크플로우** = 백엔드 핵심 ([multi-agent-design.md](./multi-agent-design.md) 기준)

---

## 1. 단계 1 — MVP (풀세트 출시) 

> "마네킹 코디 + 격자뷰"라는 핵심 가치를 **사용자가 실제로 경험**하는 최소 완성품.

### 1.1 기능 범위

| 기능 | 설명 | 우선순위 |
|---|---|---|
| **회원가입·로그인** | 이메일 + 소셜 (Google/Kakao) | P0 |
| **옷장 등록** | 사진 1장 업로드 → AI 자동 태깅 | P0 |
| **옷장 격자뷰** | 등록한 옷 카테고리별 표시 | P0 |
| **AI 코디 추천** | 옷장 옷으로 조합 N개 생성 (텍스트 + 마네킹 합성 이미지) | P0 |
| **마네킹 격자뷰** | 추천 조합을 마네킹 입은 모습 격자로 표시 | P0 |
| **합성 1일 한도** | 사용자당 일 5회 (비용 제어) | P0 |
| **결과 저장·공유** | 마음에 든 조합 저장, 링크 공유 | P1 |
| **푸시 알림** | "오늘의 코디" — 매일 새벽 1회 (선택) | P1 |

### 1.2 기술 스택 (MVP) — AWS 기반

| 영역 | 기술 | 옷장 적합성 이유 |
|---|---|---|
| **프론트엔드** | Next.js 14 + TypeScript + Tailwind | 랜딩 스택 참고, v0.dev로 UI 생성, Vercel 배포 |
| **모바일 패키징** | Capacitor | 웹 코드 그대로 앱스토어 등록 가능 |
| **백엔드 API** | FastAPI (Python) | AI/ML 생태계 풍부, async 강함 |
| **백엔드 호스팅** | **AWS ECS Fargate** (Docker) | 컨테이너 관리형, 오토 스케일링, EC2보다 운영 부담 ↓ |
| **DB** | **AWS RDS Postgres** (db.t4g.small 시작) | 관리형, 자동 백업·HA, pgvector 확장 직접 설치 |
| **인증** | **AWS Cognito** (또는 자체 JWT + RDS) | 사용자 풀·소셜 로그인·MFA 통합 |
| **이미지 스토리지** | **AWS S3 + CloudFront** | CDN 분리, 글로벌 캐시 |
| **백그라운드 큐 (브로커)** | **AWS ElastiCache Redis** (cache.t4g.small) | Celery 메시지 브로커, 관리형 |
| **백그라운드 워커** | **ECS Fargate (Celery worker)** | API와 동일 컨테이너 인프라 |
| **시크릿 관리** | **AWS Secrets Manager** | API 키·DB 비밀번호 안전 저장 |
| **로깅·모니터링** | **CloudWatch + Sentry** | 인프라 로그 + 에러 추적 분리 |
| **CI/CD** | **GitHub Actions → ECR → ECS** | 자동 빌드·배포 파이프라인 |
| **Docker 레지스트리** | **AWS ECR** | ECS와 통합 |
| **AI — LLM** | Anthropic Claude (Haiku + Sonnet) | tool_use 네이티브, 한국어 강함 |
| **AI — Vision** | Claude Vision (태깅) | LLM과 통합, 별도 모델 호스팅 X |
| **AI — 임베딩** | OpenAI text-embedding-3-small + CLIP | pgvector 호환 |
| **AI — 합성** | **BFL Flux Kontext** (1순위) 또는 Replicate IDM-VTON | 고품질 마네킹 합성, API 호출 |
| **벡터 검색** | **pgvector (RDS Postgres 확장)** | DB 1개 운영, 100만 벡터까지 충분 |
| **분석 (이벤트)** | Amplitude | 랜딩에서 이미 사용 |
| **분석 (내부 ad-hoc)** | DuckDB (로컬) | Parquet·CSV 직접 쿼리, 데이터 분석 빠름 |
| **내부 대시보드** | Streamlit (ECS 또는 Lightsail 호스팅) | Python 그대로, 운영 KPI 시각화 |

#### Supabase에서 AWS로 변경된 부분 (랜딩 → 본 개발)
| 랜딩 (Phase 0) | 본 개발 (Phase 1+) | 변경 이유 |
|---|---|---|
| Supabase Postgres | RDS Postgres | 인스턴스 타입·확장 컨트롤 |
| Supabase Auth | Cognito | AWS 통합, 더 풍부한 정책 |
| Supabase Storage | S3 + CloudFront | CDN 분리, 비용 효율 |
| (랜딩엔 큐 없음) | ElastiCache Redis + Celery | AI 작업 비동기 처리 |
| Vercel (프론트) | Vercel 유지 | 정적 호스팅엔 Vercel이 여전히 베스트 |

### 1.3 데이터 파이프라인 — **시작 라인업 (AWS 기반)**

사용자가 정의한 "시작" 단계를 옷장 도메인 + AWS 환경에 맞춰 적용:

| 영역 | 도구 | 옷장·AWS 적합성 |
|---|---|---|
| **수집** | `requests`, `httpx` (Python) | 외부 트렌드·시세 사이트 단발 크롤링 |
| **저장 (운영)** | **AWS RDS Postgres** | 트랜잭션·동시성 필수, pgvector 확장 |
| **저장 (스토리지)** | **AWS S3** | 이미지·Parquet 파일·로그 백업 |
| **저장 (분석용)** | **DuckDB (로컬) → S3 Parquet 직접 쿼리** | 분석가가 EC2 또는 로컬에서 S3 데이터 ad-hoc 분석 |
| **가공** | Python + SQL | 1단계는 수동 분석 위주 |
| **스케줄** | **GitHub Actions** (cron) + **Celery beat** (앱 내) | GitHub Actions로 외부 데이터 수집·ETL, Celery beat로 앱 내 정기 작업 |
| **품질** | Python `assert` + pytest | 단위 테스트, AgentLog 무결성 검증 |
| **활용** | **Streamlit on ECS** (내부 대시보드) | Python 그대로, 운영 KPI 시각화, 사내만 접근 |

#### 1단계 데이터 흐름 예시
```
[사용자 행동] → Amplitude → 주 1회 export → S3
[운영 DB: RDS] → daily snapshot → S3 (parquet)
        ↓
[분석가가 EC2 또는 로컬에서]
  DuckDB로 S3 Parquet 직접 쿼리
        ↓
  Streamlit 대시보드로 시각화
```

### 1.4 멀티에이전트 워크플로우 (1단계)

[multi-agent-design.md](./multi-agent-design.md)의 **Week 1~4 로드맵 그대로**:
- Week 1: Orchestrator + Vision + Clothing Specialist
- Week 2: Critic 루프
- Week 3: Combo 협업 (Style/Color/Occasion + Curator)
- Week 4: 동적 라우팅 + 모니터링

이 위에 **합성 단계 추가**:
- Week 5~6: BFL/Replicate API 연동 + 마네킹 합성 큐
- Week 7~8: 푸시 알림·결과 저장·QA·런칭 준비

### 1.5 RAG 워크플로우 (1단계 — 기본 RAG)

상세는 [rag-design.md §2](./rag-design.md) 참고.

| 영역 | 1단계 결정 | 근거 |
|---|---|---|
| 인덱싱 | `item → Document` 변환, user_id 격리 메타데이터 | 옷장은 사용자 격리가 절대 원칙 |
| 청킹 | 옷 1벌 = 1 청크 (알고리즘 불필요) | 옷장 데이터의 자연 단위 |
| 임베딩 | OpenAI `text-embedding-3-small` + CLIP image | 저렴·다국어·pgvector 호환 |
| 벡터 DB | **pgvector (Supabase)** | DB 1개로 통합, 운영 부담 0 |
| 리트리벌 | Dense only (cosine) + Top-K 12 | 1단계는 단순화 우선, BM25는 2단계 |
| Pre/Post-Retrieval | 없음 | Critic으로 검증 충분 |
| 멀티모달 | 컬렉션 분리 (text·image 별도) | 1단계는 분리 운영, 통합은 2단계 |

**1단계 RAG 의도적 제외**: Query Rewrite, HyDE, Ensemble, MMR, Reranking, Self-RAG, GraphRAG → 모두 2~3단계.

### 1.5 비용 추정 (사용자 100명 기준 월) — AWS

| 항목 | 비용 |
|---|---|
| Vercel Hobby (프론트) | $0 |
| AWS ECS Fargate (백엔드·워커 2개 컨테이너) | ~$30 |
| AWS RDS Postgres (db.t4g.small) | ~$25 |
| AWS ElastiCache Redis (cache.t4g.micro) | ~$15 |
| AWS S3 + CloudFront (이미지 50GB) | ~$10 |
| AWS Cognito (사용자 1,000명) | $0 (무료 tier 50K MAU) |
| AWS Secrets Manager + CloudWatch | ~$5 |
| AWS Data Transfer + 기타 | ~$10 |
| Anthropic Claude (등록·추천) | ~₩300,000 |
| BFL Flux 합성 (월 1,500장) | ~₩150,000 |
| Amplitude / Sentry (Free) | $0 |
| **합계** | **~₩580,000** (≈$100/월 인프라 + ₩450K AI) |

> Supabase 대비 인프라 비용 ~$50 추가 (월). 학습·컨트롤·포트폴리오 가치로 정당화.

### 1.6 1단계 성공 지표
- 가입자 1,000명, 옷 등록 10,000장
- 옷 등록 평균 처리 시간 < 15초
- 마네킹 합성 만족도 ≥ 70% (사용자 설문)
- Wardrobe Fidelity = 1.00 (없는 옷 추천 0건)
- 월 운영 비용 < ₩1,000,000

### 1.7 1단계의 의도적 제외 (Out of Scope)
- ❌ 별도 데이터 웨어하우스
- ❌ 실시간 이벤트 스트리밍 (Kafka)
- ❌ 워크플로우 오케스트레이션 (Airflow)
- ❌ ML 학습 파이프라인 (학습은 외부 API에만 의존)
- ❌ 자체 GPU 인프라
- ❌ A/B 실험 플랫폼 (Amplitude 수동 비교로 충분)
- ❌ 자체 모델 fine-tuning

→ **2단계로 미루는 게 정석**. 사용자 100~1,000명 단계엔 over-engineering.

---

## 2. 단계 2 — 기능 확장 (Growth) [목표: 6~9개월]

> 1단계로 핵심 가치 검증 완료 후, **사용자 1만~10만 명 대응** + **AI 추천 품질 강화**.

### 2.1 추가 기능

| 기능 | 설명 | 가치 |
|---|---|---|
| **사용자 선호 학습** | "이 조합 좋아요/별로" 신호 누적 → 다음 추천 개인화 | 재방문 ↑ |
| **트렌드 통합** | 외부 트렌드 사이트 크롤링 → 추천에 반영 | 신선도 ↑ |
| **친구 공유·갤러리** | 다른 사용자 코디 보기, 좋아요 | 바이럴 |
| **계절·날씨 자동 반영** | 위치 기반 날씨 API → 추천 조정 | 실용성 ↑ |
| **쇼핑몰 연동 (수동)** | 부족한 옷 추천 → 외부 쇼핑몰 링크 | 수익화 시작 |
| **유료 구독** | 무료 한도 초과 시 결제 | 수익화 |
| **푸시 알림 고도화** | 매일 새벽 + 날씨 변동 + 이벤트 | 활성도 ↑ |
| **신발·가방·액세서리 카테고리 확장** | Footwear/Bag/Accessory Specialist + 동적 라우팅 추가 (Phase 1에서 미룬 작업) | 옷장 → 풀 워드로브로 확장 |
| **사용자 행동 분석 대시보드** | 어드민용 KPI 대시보드 | 의사결정 |
| **⭐ 직접 코디 만들기** | 사용자가 옷 선택(상의·하의 필수 + 아우터·가방·신발 선택) → 마네킹 합성으로 미리보기 | AI 추천 외 자유 코디, 사용자 주도성 ↑ |
| **⭐ 코디 달력 (Wear Log)** | 입은 코디를 달력에 기록·조회 → "지난주 뭐 입었지?" 회상 가능 + 중복 방지 추천 데이터 | 재방문 ↑, 추천 개인화 강화 |

### 2.2 기술 스택 진화 (시작 → 성장)

| 영역 | 1단계 | **2단계 (변경)** | 변경 이유 |
|---|---|---|---|
| **수집** | requests, httpx | **Airbyte 또는 Singer** | 정기 외부 데이터 연동 자동화 (트렌드·시세) |
| **저장 (운영)** | Supabase (Postgres) | **Postgres 그대로** + pgvector 확장 강화 | DB는 그대로, 인덱스·파티셔닝 튜닝 |
| **저장 (분석)** | DuckDB 로컬 | **Postgres read replica + DuckDB** | 분석 트래픽이 운영 영향 안 주도록 |
| **가공** | Python + SQL | **dbt** | 분석 쿼리 버전 관리·테스트·문서화 |
| **스케줄** | cron + GitHub Actions | **GitHub Actions (메인)** + Celery beat | dbt 실행·ETL을 GitHub Actions로 통합 |
| **품질** | assert | **Great Expectations + dbt test** | 데이터 품질 자동 검증 |
| **활용** | Streamlit | **Superset** | BI 도구로 비기술자도 대시보드 작성 |
| **A/B 실험** | Amplitude 수동 | **GrowthBook 또는 자체 split** | 실험 자동화 |
| **LLM Provider** | Claude 단독 | **+ 오픈소스 (vLLM Llama)** | 비용 폭증 대응, Critic만 자체 호스팅 |
| **모니터링** | Sentry + Amplitude | **+ Langfuse (LLM trace) + Helicone (LLM 게이트웨이)** | 평가·비용 통합 관측 |
| **인프라** | Fly.io | **+ AWS EC2 (배경 작업) + S3 (이미지)** | 합성 큐·이미지 스토리지 분리 |
| **이미지 처리** | 외부 API만 | **+ rembg 자체 호스팅 (배경 제거)** | API 비용 절감 |

### 2.3 데이터 파이프라인 — **성장 라인업**

```
[운영 DB: Postgres]
       ↓ Airbyte CDC
[S3 Raw Lake] ─────┬─→ [dbt 변환 (Postgres staging schema)] ─→ [Superset 대시보드]
                   │                ↑
[Amplitude Export] ┘            GitHub Actions 일별 스케줄
                                + Great Expectations 품질 검증
```

#### 도입 시점 명확화
| 도구 | 도입 트리거 |
|---|---|
| **Airbyte** | 외부 데이터 소스 3개 이상 정기 연동 필요 시 |
| **dbt** | 분석 쿼리 10개 이상, 여러 사람이 SQL 작성 시 |
| **GitHub Actions ETL** | cron 작업 5개 이상, 실패 알림 필요 시 |
| **Great Expectations** | 데이터 무결성 사고 1회 발생 시 즉시 |
| **Superset** | 비기술자가 대시보드 보고 싶다 요청 시 |

### 2.4 멀티에이전트 진화 (2단계)

- **시나리오 B 도입**: 매일 새벽 cron으로 모든 사용자에 코디 자동 생성
- **사용자 피드백 학습**: "좋아요" 신호 → Style Theorist 프롬프트에 사용자 선호 주입
- **Memory 모듈 강화**: 사용자별 장기 기억 (압축된 선호 프로파일)
- **A/B 실험**: Curator 변종 비교 (창의적 vs 보수적 추천)
- **평가 자동화**: Ragas + GPT-4V judge로 매주 회귀 평가

### 2.5 RAG 진화 (2단계 — Advanced RAG)

상세는 [rag-design.md §3](./rag-design.md) 참고.

| 영역 | 2단계 도입 | 효과 |
|---|---|---|
| **Pre-Retrieval** | Query Rewrite (RRR) + HyDE + Multi-Query + Routing | 추상적 질문 → 정확한 검색 |
| **Retrieval** | **Dense + BM25 EnsembleRetriever (0.4/0.6)** + MMR | "베이지 트렌치" 같은 정확 매칭 + 다양성 |
| **Post-Retrieval** | Cross-Encoder Reranking (30→5) + Compression (긴 텍스트만) | LLM 비용 ↓·정확도 ↑ |
| **인덱싱 개선** | 계층 메타데이터 + Multi-level (Small-to-Big) | 카테고리 필터 → 벡터 검색 |
| **멀티모달 통합** | CLIP 텍스트↔이미지 통합 검색 | "이런 사진 같은 옷" 가능 |
| **이미지 캡셔닝** | Vision LLM → 자동 캡션 → 텍스트 검색 풍부화 | 멀티에이전트와 RAG 결합 |

**2단계 RAG 도입 트리거**:
- 사용자 "검색 부정확" 신호 30%+
- Critic 통과율 < 85%
- 외부 데이터 (트렌드·시세) 도입 결정

### 2.5 비용 추정 (사용자 1만 명 기준 월)

| 항목 | 비용 |
|---|---|
| Vercel Pro | $20 |
| AWS EC2 (백엔드·워커) | ~$200 |
| S3 + CloudFront | ~$50 |
| Supabase Pro | $25 |
| Anthropic Claude | ~₩5,000,000 |
| BFL 합성 (월 50,000장) | ~₩5,000,000 |
| Langfuse Cloud | $59 |
| 기타 SaaS | ~$100 |
| **합계** | **~₩11,000,000** |

→ 유료 구독 ARPU ₩5,000 × 사용자 5% 전환 = 매출 ₩2,500,000 → 추가 광고·제휴 필요.

### 2.6 2단계 성공 지표
- MAU 10,000명, 옷 등록 200,000장
- 추천 만족도 ≥ 80%
- D30 retention ≥ 30%
- 유료 전환율 ≥ 5%
- LLM 비용 / 추천 1건 < ₩300

---

## 3. 단계 3 — 기술 고도화 (자체 LLM 호스팅) [목표: 6~9개월]

> **사용자 1,000명 가정** — 대규모 스케일링 도구는 의도적으로 제외.
> **단일 미션**: 외부 LLM API 비용 절감 + 프라이버시 확보를 위해 **HuggingFace 오픈소스 모델을 AWS에 자체 호스팅**하여 멀티에이전트의 LLM Provider를 교체.

### 3.1 핵심 변경 — LLM Provider 교체

#### Before (2단계)
```
멀티에이전트 → Anthropic Claude API 호출 (외부)
            → OpenAI Embeddings API (외부)
            → BFL Flux API (외부)
```

#### After (3단계)
```
멀티에이전트 → 자체 호스팅 LLM (vLLM on AWS EC2 GPU)
            → HuggingFace에서 모델 다운로드 (Llama·Qwen·BGE 등)
            → OpenAI 호환 API 노출 → 기존 코드 거의 변경 없이 교체
```

### 3.2 추가 기능

**기능 추가는 최소**. 대신 백엔드 기술이 자체 모델로 전환.

| 기능 | 설명 |
|---|---|
| **자체 LLM 추론 API** | OpenAI 호환 엔드포인트 (`/v1/chat/completions`) — Claude·OpenAI 교체 |
| **자체 임베딩 API** | BGE-M3 또는 SigLIP 자체 호스팅 — OpenAI Embeddings 교체 |
| **자체 이미지 모델 (선택)** | Flux Dev (오픈소스) 자체 호스팅 — BFL 비용 절감 |
| **모델 버전 관리** | HuggingFace에서 모델 갱신 → AWS 재배포 자동화 |

→ **사용자 가시 기능 변화 없음**. 백엔드만 자체 모델로 전환.

### 3.3 기술 스택 변경 (2단계 → 3단계)

오직 **LLM 인프라**만 변경. 나머지(DB·큐·프론트·CI/CD)는 2단계 그대로.

| 영역 | 2단계 | **3단계 (변경)** | 변경 이유 |
|---|---|---|---|
| **LLM (텍스트)** | Anthropic Claude API | **vLLM + Llama 3.x 또는 Qwen 2.5** (HuggingFace 다운로드) | 호출 비용 절감 |
| **LLM 추론 인프라** | (없음 — 외부 API만) | **AWS EC2 GPU (g5.xlarge ~ g5.2xlarge)** | 자체 호스팅 GPU 필요 |
| **API 호환** | Anthropic SDK | **OpenAI 호환 엔드포인트** (vLLM 기본 제공) | 코드 변경 최소 |
| **임베딩** | OpenAI text-embedding-3-small | **BGE-M3 자체 호스팅** (또는 OpenAI 유지) | 비용 0 |
| **합성 (선택)** | BFL Flux API | **Flux Dev 자체 호스팅** (또는 BFL 유지) | 비용 절감 |
| **모델 저장소** | (없음) | **AWS S3 (HuggingFace 모델 캐시)** | 빠른 EC2 부팅 |
| **모델 배포** | (없음) | **Docker 이미지 + ECR + EC2 GPU** | 표준 컨테이너 배포 |

→ **그 외 모든 인프라(ECS·RDS·Redis·S3·Vercel·GitHub Actions·Streamlit·Sentry·Amplitude)는 2단계 그대로 유지**.

### 3.4 자체 LLM 호스팅 구조 (vLLM on AWS)

```
┌─────────────────────────────────────────────────────────┐
│ HuggingFace Hub                                          │
│   - meta-llama/Llama-3.1-8B-Instruct                     │
│   - Qwen/Qwen2.5-7B-Instruct                             │
│   - BAAI/bge-m3 (임베딩)                                  │
│   - black-forest-labs/FLUX.1-dev (이미지, 선택)           │
└─────────────────────────────────────────────────────────┘
                        │ 다운로드 (1회)
                        ▼
┌─────────────────────────────────────────────────────────┐
│ AWS S3 (모델 가중치 캐시)                                  │
│   models/llama-3.1-8b/  …                                │
└─────────────────────────────────────────────────────────┘
                        │ EC2 부팅 시 마운트
                        ▼
┌─────────────────────────────────────────────────────────┐
│ AWS EC2 g5.xlarge (GPU: A10G 24GB)                       │
│   - vLLM 서버 (Docker 컨테이너)                            │
│   - OpenAI 호환 API: http://internal-vllm:8000/v1/...    │
│   - 1대로 Llama 3.1 8B 동시 사용자 ~50명 가능              │
└─────────────────────────────────────────────────────────┘
                        ▲ HTTP (VPC 내부)
                        │
┌─────────────────────────────────────────────────────────┐
│ ECS Fargate (멀티에이전트 Worker)                          │
│   기존 코드:                                               │
│     client = OpenAI(base_url="http://internal-vllm:8000")│
│     response = client.chat.completions.create(...)       │
│   → 코드 거의 변경 없이 자체 모델 호출                       │
└─────────────────────────────────────────────────────────┘
```

#### vLLM 작동 원리
- HuggingFace 모델을 받아서 **고성능 추론 서버**로 실행
- OpenAI 호환 API 자동 제공 (`/v1/chat/completions`, `/v1/embeddings`)
- 연속 배칭(continuous batching)으로 동시 요청 효율적 처리

#### 모델 선택 가이드 (1,000명 규모)
| 작업 | 추천 모델 | GPU |
|---|---|---|
| Vision Agent (옷 분류) | Qwen 2.5-VL-7B | g5.xlarge ($1/h) |
| Tagger·Critic | Llama 3.1-8B | g5.xlarge ($1/h) |
| Curator (조합 생성) | Qwen 2.5-14B 또는 Llama 3.1-70B-Q4 | g5.2xlarge ($1.2/h) |
| 임베딩 | BGE-M3 | 같은 g5.xlarge에 공유 |

### 3.5 데이터 파이프라인 — **2단계 라인업 유지**

> **변경 없음**. 1,000명 규모엔 2단계의 dbt + GitHub Actions + Superset으로 충분.

**의도적 제외 (사용자 명령)**:
- ❌ Kafka 이벤트 스트리밍 — 1,000명엔 과함
- ❌ Spark·Flink — 데이터 양 작아 불필요
- ❌ Airflow / Dagster — GitHub Actions cron으로 충분
- ❌ BigQuery / Snowflake — DuckDB·Postgres replica로 충분
- ❌ Fivetran·Debezium CDC — Airbyte로 충분
- ❌ Soda·Monte Carlo — Great Expectations로 충분
- ❌ Looker·Tableau — Superset으로 충분

### 3.6 멀티에이전트 변경 — Provider만 교체

[multi-agent-design.md](./multi-agent-design.md)의 13개 에이전트(Phase 2 기준) 구조 그대로.
**오직 LLM Runtime만 자체 모델로 교체**.

```python
# Before (2단계)
client = anthropic.Anthropic(api_key="...")
response = client.messages.create(model="claude-sonnet-4", ...)

# After (3단계)
client = openai.OpenAI(
    base_url="http://internal-vllm:8000/v1",
    api_key="dummy"  # vLLM은 인증 옵션
)
response = client.chat.completions.create(model="llama-3.1-8b", ...)
```

→ **에이전트 로직·프롬프트·도구 모두 동일**. Runtime만 교체.

### 3.7 의도적 제외 (사용자 명령 — 1,000명 규모 가정)

대규모 스케일링·B2B·플랫폼화 도구 모두 보류:

| 항목 | 왜 제외 |
|---|---|
| ~~B2B 패션 브랜드 도구~~ | 1,000명 규모엔 불필요 |
| ~~글로벌 확장~~ | 한국만 |
| ~~다중 도메인 확장 (인테리어·뷰티)~~ | 옷장에 집중 |
| ~~EKS / Kubernetes~~ | ECS Fargate로 충분 |
| ~~Postgres 샤딩~~ | 1,000명 데이터 < 5GB |
| ~~자체 fine-tuning~~ | HuggingFace 모델 그대로 사용 |
| ~~Self-RAG (Phase 2의 Critic으로 충분)~~ | 1,000명 운영엔 과함 |
| ~~GraphRAG~~ | 1,000명엔 ROI 낮음 |
| ~~플랫폼화·코어 추출~~ | 단일 도메인 유지 |

→ **"기능 고도화" → "기술 고도화 (자체 LLM)"** 으로 단순화.

### 3.8 비용 추정 (사용자 1,000명 기준 월)

| 항목 | 비용 |
|---|---|
| 2단계 인프라 그대로 (ECS·RDS·Redis·S3 등) | ~$100 (~₩140K) |
| **EC2 g5.xlarge × 1대** (vLLM, 24/7) | **~$720 (~₩1M)** |
| 또는 EC2 Spot 활용 (50% 절감) | ~$360 (~₩500K) |
| HuggingFace 모델 다운로드·S3 저장 | 거의 무료 (~$5) |
| Vercel·Amplitude·Sentry·GitHub Actions | 무료 tier |
| **합계 (Spot 사용 시)** | **~₩640K** |
| **합계 (On-Demand)** | **~₩1.14M** |

→ 외부 LLM API 비용 (~₩300K~₩1M 감소 가능) vs GPU 호스팅 (~₩500K~₩1M)이 **균형점**.
→ **사용자 1,000명 규모에선 자체 호스팅 ROI 명확하지 않음**. 실제 비용 측정 후 판단 권장.

### 3.9 3단계 성공 지표 (1,000명 가정)

- MAU 1,000명 안정 운영
- **자체 LLM이 외부 API와 품질 차이 < 10%** (Ragas 평가)
- API 비용 절감 (외부 API 대비 ≥ 30% 감소)
- 응답 시간 외부 API 대비 ±20% 이내
- 다운타임 < 1%/월

### 3.10 3단계의 진짜 가치 — 학습·포트폴리오 관점

사용자 1,000명에 비용 정당화가 약하더라도, 3단계는 다음 가치를 가짐:
- **HuggingFace 모델 운영 경험** (AI 엔지니어 채용 시장 핵심 스킬)
- **vLLM·GPU 인프라** 학습
- **OpenAI 호환 API** 패턴 익히기
- **모델 버전·롤백 관리** 실전 경험
- **데이터 프라이버시** (사용자 데이터 외부 송신 0)
- **사용자 10K+ 도달 시 즉시 비용 우위**로 전환 가능

---

## 4. 단계별 비교표

### 기술 스택 한눈에

| 영역 | 1단계 (시작) | 2단계 (성장) | 3단계 (기술 고도화) |
|---|---|---|---|
| 프론트 | Next.js + Capacitor (v0.dev) | + PWA 강화 + 직접 코디·달력 | 2단계 그대로 |
| 백엔드 | FastAPI on **ECS Fargate** | FastAPI + 분리 워커 풀 | 2단계 그대로 |
| DB | **RDS Postgres + pgvector** | + read replica | 2단계 그대로 |
| 인증 | **AWS Cognito** | Cognito + 권한 정책 강화 | 2단계 그대로 |
| 스토리지 | **S3 + CloudFront** | + 멀티 리전 | 2단계 그대로 + S3에 모델 가중치 |
| 큐 | **ElastiCache Redis + Celery** | Celery + 워커 풀 분리 | 2단계 그대로 |
| 수집 | requests/httpx | Airbyte | 2단계 그대로 |
| 가공 | Python + SQL | dbt | 2단계 그대로 |
| 스케줄 | cron + GitHub Actions | GitHub Actions | 2단계 그대로 |
| 품질 | assert + pytest | Great Expectations | 2단계 그대로 |
| 활용 | Streamlit | Superset | 2단계 그대로 |
| **LLM** | Claude 단독 | Claude (모두) | **vLLM + Llama/Qwen 자체 호스팅** ⭐ |
| **LLM 인프라** | 외부 API만 | 외부 API만 | **AWS EC2 GPU (g5.xlarge)** ⭐ |
| 임베딩 | OpenAI 3-small | OpenAI 3-small | **BGE-M3 자체 (선택)** |
| 합성 | BFL/Replicate | BFL/Replicate | **Flux Dev 자체 호스팅 (선택)** |
| **RAG — 인덱싱** | item → Document, pgvector | + 계층 메타데이터 | 2단계 그대로 |
| **RAG — Retrieval** | Dense only | Ensemble (Dense+BM25) + MMR | 2단계 그대로 |
| **RAG — Pre/Post** | 없음 | Query Rewrite + HyDE + Reranking | 2단계 그대로 |
| **RAG — 멀티모달** | 컬렉션 분리 | CLIP 통합 + 이미지 캡셔닝 | 2단계 그대로 |

### 비용 추이 (사용자 명령 — 1,000명 가정)

| 단계 | 사용자 | 월 비용 | LLM 비중 |
|---|---|---|---|
| 1단계 | 100~1,000명 | ~₩600K | ~60% (외부 API) |
| 2단계 | 1,000명 (성장 기능 추가) | ~₩800K | ~65% (외부 API) |
| 3단계 | 1,000명 (LLM 자체 호스팅) | ~₩640K (Spot) ~ ₩1.14M (On-Demand) | **EC2 GPU 호스팅이 메인** |

> **3단계가 항상 더 비싸지 않음**. 사용자 1만+ 부터 자체 호스팅 ROI 명확.
> **1,000명 규모는 비용 차이 작음 — 학습·포트폴리오·프라이버시 가치로 정당화**.

---

## 5. 옷장 서비스 적합성 점검 (각 결정의 정당화)

> 사용자가 명시적으로 요청 — "옷장 서비스에 잘 맞는지 대입하고 판단".

### 1단계 결정 점검

| 결정 | 옷장 서비스 적합성 | 점수 |
|---|---|---|
| Next.js + Capacitor + v0.dev | AI 코드 도구로 학습 부담 ↓, 웹·앱 동시 | ✅✅ |
| **AWS ECS Fargate** | EC2보다 운영 부담 ↓, 컨테이너로 워커·API 동일 인프라 | ✅✅✅ |
| **AWS RDS Postgres + pgvector** | 옷 데이터 소량, pgvector 100만까지 충분, 운영 부담 ↓ | ✅✅✅ |
| **ElastiCache Redis + Celery** | 옷 등록 8~15초 비동기 처리 필수, 관리형 Redis | ✅✅✅ |
| **S3 + CloudFront** | 이미지 위주 도메인엔 CDN 분리 필수 | ✅✅✅ |
| Claude 단독 | tool_use 강함, 멀티에이전트 친화 | ✅✅✅ |
| BFL Flux 외부 합성 | 자체 GPU 없이 즉시 운영, 비용 변동만 관리 | ✅✅✅ |
| Streamlit on ECS 내부 대시보드 | Python 그대로, 빠른 구축, 사내 인증으로 접근 제한 | ✅✅✅ |
| DuckDB + S3 Parquet | 분석가 로컬에서 ad-hoc 쿼리, Pandas보다 빠름 | ✅✅✅ |
| GitHub Actions CI/CD | 무료 2,000분, ECR·ECS 통합 쉬움 | ✅✅✅ |
| **Kafka 미도입** | 옷 등록은 burst라도 초당 수 건, 스트리밍 불필요 | ✅✅✅ |
| **Airflow 미도입** | 1단계 cron job 5개 이하, GitHub Actions로 충분 | ✅✅✅ |
| **자체 모델 미도입** | 사용자 1,000명 단계엔 API가 압도적 저렴 | ✅✅✅ |
| **Supabase 미사용 (본 개발)** | AWS가 채용 시장 표준 + 장기 확장성 | ✅✅✅ |

→ **모든 결정이 옷장 도메인 특수성(데이터 소량·burst 트래픽·이미지 중심·AI 비용 메인)과 부합.**

### 2단계 진입 트리거 (각 도구 도입 결정 기준)

| 도구 | 도입 트리거 |
|---|---|
| dbt | 분석 SQL 10+ 작성, 여러 사람 협업 시 |
| Airbyte | 외부 데이터 소스 3+ 정기 연동 필요 |
| Langfuse | LLM 호출 일일 1,000+ 또는 평가 자동화 필요 |
| vLLM 자체 호스팅 | Claude API 월 ₩3M+ 도달 시 (자체 GPU 손익분기) |
| rembg 자체 | 배경 제거 API 월 ₩500K+ 도달 시 |
| S3 분리 | 이미지 100GB+ 또는 Supabase Storage 한계 도달 |

→ **사용자 수가 아닌 사용량·비용 트리거 기준**. Over-engineering 방지.

### 3단계 진입 트리거 (1,000명 가정)

3단계는 사용자 명령으로 **단일 미션 = 자체 LLM 호스팅**. 다른 대규모 도구는 의도적 제외.

| 도입 항목 | 트리거 |
|---|---|
| **vLLM + 자체 LLM 호스팅** | 외부 API 비용 월 ₩500K+ 도달 또는 **학습·프라이버시 가치 추구** |
| 자체 임베딩 (BGE-M3) | OpenAI 임베딩 비용 월 ₩100K+ |
| 자체 합성 (Flux Dev) | BFL 비용 월 ₩500K+ |
| ~~Kafka·Airflow·Spark·BigQuery·EKS~~ | **1,000명 규모엔 보류** — 의도적 제외 |

→ **사용자 1만+ 시점에 위 대규모 도구 재검토**. 1,000명 단계엔 자체 LLM 호스팅만 집중.

---

## 6. 의도적으로 피하는 안티패턴

### 1단계에서 피하기
| 안티패턴 | 왜 피하나 |
|---|---|
| AWS EKS·복잡 인프라 | 사용자 100명 단계엔 over-engineering |
| Kafka·Airflow 조기 도입 | 가설 검증 전 인프라 부담 |
| 자체 GPU·모델 학습 | API가 압도적으로 저렴·빠름 |
| 마이크로서비스 분리 | 모놀리스로 시작이 정석 |
| 자체 BI·로깅 인프라 | SaaS(Amplitude·Sentry)로 시작 |

### 단계 전반 피하기
| 안티패턴 | 왜 피하나 |
|---|---|
| 사용자 수 기준 도구 도입 | 진짜 트리거는 사용량·비용 |
| 트렌디 기술 따라가기 | 옷장 도메인 적합성 우선 |
| 모든 단계에서 같은 스택 고수 | 단계마다 최적해가 다름 |
| 처음부터 플랫폼화 시도 | 한 도메인 검증 먼저, 플랫폼화는 3단계+ |

### 3단계에서 피하기 (사용자 명령 — 1,000명 가정)
| 안티패턴 | 왜 피하나 |
|---|---|
| Kafka·Airflow·Spark 도입 | 1,000명 규모엔 over-engineering |
| BigQuery·Snowflake 도입 | DuckDB·Postgres replica로 충분 |
| EKS·Kubernetes | ECS Fargate로 1,000명 충분 |
| 자체 fine-tuning | HuggingFace 모델 그대로 사용 (학습 비용·시간 ↑) |
| GraphRAG·다중 도메인 | 옷장에 집중, 1,000명엔 ROI 없음 |
| B2B·글로벌 확장 | 단일 시장·B2C 집중 |

---

## 7. Phase별 결정 매트릭스 요약

```
            1단계 (MVP)         2단계 (성장)        3단계 (기술 고도화)
──────────────────────────────────────────────────────────────────────
검증 대상   핵심 가치 (마네킹)   사용자 retention    LLM 자체 호스팅 운영력
사용자       100~1,000          1,000              1,000 (그대로)
비용/월     ₩600K              ₩800K              ₩640K~1.14M (GPU)
의사결정    빠른 출시 우선       기능 확장·UX 강화    기술 학습·프라이버시
인프라     단일 모놀리스        + 직접 코디·달력     + 자체 GPU LLM (vLLM)
LLM        외부 API 100%       외부 API 100%      자체 호스팅 (Llama/Qwen)
멀티에이전트 옷 전용 10개         + 신발·가방·액세서리 13개 (Runtime만 교체)
RAG        Dense + pgvector    Ensemble + 멀티모달  2단계 그대로
데이터     시작 라인업           성장 라인업         성장 라인업 (그대로)
의도적 제외 Kafka·Airflow       대규모 도구          B2B·글로벌·플랫폼화·EKS
```

---

## 8. 미정 사항 / 다음 결정

### 1단계 착수 전 결정 필요
- [ ] AWS 리전 (ap-northeast-2 서울 vs ap-northeast-1 도쿄)
- [ ] ECS Fargate vs EC2 (트래픽 패턴 확인 후)
- [ ] Cognito vs 자체 JWT (소셜 로그인 필요 시 Cognito 우세)
- [ ] 합성 모델 — BFL Flux vs Replicate IDM-VTON (PoC 1주)
- [ ] 결제 시스템 (2단계 진입 전) — 토스페이먼츠 vs Stripe
- [ ] 푸시 알림 — Firebase vs AWS SNS
- [ ] Terraform/CDK 도입 여부 (IaC) — 권장 (CDK는 Python 가능)

### 2단계 진입 시 결정
- [ ] dbt 도입 시점 결정 (분석 쿼리 수 기준)
- [ ] vLLM 자체 호스팅 GPU 선택 (RTX 4090 vs A100)
- [ ] 데이터 분석가 채용 또는 외주 (대시보드 운영자)

### 3단계 진입 시 결정 (1,000명 가정 — 자체 LLM 호스팅)
- [ ] **HuggingFace 모델 선택** — Llama 3.1-8B vs Qwen 2.5-7B vs Qwen 2.5-VL-7B (작업별)
- [ ] **GPU 인스턴스** — g5.xlarge (A10G 24GB) vs g5.2xlarge (A10G + RAM↑) vs g4dn (T4, 더 저렴·약함)
- [ ] **EC2 On-Demand vs Spot** — Spot 50% 절감하지만 중단 위험
- [ ] **임베딩 자체 호스팅 여부** — BGE-M3 자체 vs OpenAI 유지
- [ ] **이미지 합성 자체 호스팅 여부** — Flux Dev 자체 vs BFL 유지
- [ ] **모델 갱신 주기** — HuggingFace 신모델 출시 시 즉시 vs 분기별

---

## 9. 관련 문서

- [architecture.md](../architecture.md) — 전체 시스템 아키텍처 청사진
- [multi-agent-design.md](./multi-agent-design.md) — Phase 1 옷 등록 멀티에이전트 상세 설계
- [rag-design.md](./rag-design.md) — RAG 시스템 단계별 설계 (9가지 RAG 개념의 옷장 적용)
- [phase1-blueprint.md](./phase1-blueprint.md) — 1단계 시스템 설계도
- [tech-stack-catalog.md](./tech-stack-catalog.md) — 모든 도구의 정체·선택 이유
- [**cost-reference.md**](./cost-reference.md) — **모든 인프라·API·SaaS 비용 + 공식 출처 URL** ⭐
- [CLAUDE.md](../CLAUDE.md) — 현재 랜딩 페이지(Phase 0) 컨벤션

---

**문서 버전**: v0.1 (2026-06-12 초안)
**다음 갱신**: 1단계 착수 시 (위 미정 사항 4개 결정 반영)
