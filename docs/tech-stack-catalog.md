# AI Coordinate Phase 1 — 기술 스택 카탈로그

> Phase 1 MVP에서 사용하는 **모든 라이브러리·DB·프레임워크·서비스·도구**의 정체·작동 방식·선택 이유·대안을 한 문서에 정리.
>
> 시스템 그림은 [phase1-blueprint.md](./phase1-blueprint.md), 단계별 진화는 [mvp-roadmap.md](./mvp-roadmap.md) 참조.

---

## 0. 분류 안내 (큰 그림)

요리에 비유하면:

| 분류 | 비유 | 예시 |
|---|---|---|
| **① DB** | 창고·책장·포스트잇 | Postgres, Redis, DuckDB |
| **② 라이브러리** | 가전제품 (믹서기·전자레인지) | Celery, LangChain, pandas |
| **③ 프레임워크** | 주방 자체 | Next.js, FastAPI |
| **④ 서비스 (SaaS)** | 외식 식당 | AWS, Claude, BFL |
| **⑤ 확장** | 가전 부착품 | pgvector |
| **⑥ 개발 도구** | 망치·드라이버 | Docker, Git, GitHub Actions |

→ 새 도구를 만나면 **"이 6가지 중 어디?"**부터 분류.

### 0.1 오픈소스란?
- 소스 코드 공개 + 라이선스에 따라 사용·수정·재배포 가능
- 대부분 무료이지만 라이선스 종류에 따라 제약 다름

| 라이선스 | 특징 | 예시 |
|---|---|---|
| MIT / BSD | 거의 제약 없음, 상업적 사용 OK | FastAPI, Next.js |
| Apache 2.0 | MIT + 특허 보호 | Postgres, Kafka |
| GPL | 파생 작품도 오픈소스 강제 | Linux |
| AGPL | GPL + SaaS도 소스 공개 강제 | MongoDB(과거) |
| BSL | 일정 기간 후 오픈 (Redis 7.4+ 전환) | Redis 7.4+, Elastic |

→ 옷장 프로젝트 도구들(Postgres·FastAPI·Next.js)은 모두 자유 라이선스로 안심.

---

## ① DB (데이터 저장소) — 3개

### 1.1 PostgreSQL (RDS Postgres)

| 항목 | 내용 |
|---|---|
| **분류** | DB (관계형, 디스크 영속) |
| **무엇** | 가장 강력한 오픈소스 SQL DB |
| **저장 방식** | 디스크 (영구), 테이블·행·열 구조 |
| **속도** | 1~10ms |

**어떻게 작동**:
```sql
-- 옷 등록
INSERT INTO items (user_id, image_url, category, color_primary)
VALUES ('uuid-...', 's3://...', 'outer', 'beige');

-- 옷장 조회 (특정 사용자)
SELECT * FROM items WHERE user_id = 'uuid-...';
```

**왜 사용** (옷장 특화):
- 사용자·옷·추천 이력은 **정형 데이터** + **트랜잭션 필요** → 관계형 DB가 정답
- pgvector·PostGIS 같은 **확장 풍부**
- JSON 컬럼으로 **반정형도 처리** (preferences JSONB)
- 채용 시장 표준 (어느 회사든 씀)

**트랜잭션(ACID) — 옷장에서 왜 핵심**:

| 글자 | 의미 | 옷 등록 시나리오 |
|---|---|---|
| **A**tomicity | 전부 성공 or 전부 실패 | "옷+태그+조합" 중간 실패 시 전부 롤백 |
| **C**onsistency | DB 규칙·관계 항상 만족 | 외래키 위반 방지 (item 없는 tag X) |
| **I**solation | 동시 실행 격리 | 동시 옷 등록 시 꼬임 없음 |
| **D**urability | 커밋 후 영구 보존 | 디스크 실패에도 보존 |

```sql
-- 트랜잭션 없이 (위험)
INSERT INTO items VALUES (...);
-- 중간에 서버 다운! INSERT INTO item_tags 실행 안 됨
-- → Atomicity 깨짐 (옷만 있고 태그 없음)

-- 트랜잭션으로 보호
BEGIN;
    INSERT INTO items VALUES (...);
    INSERT INTO item_tags VALUES (...);
COMMIT;  -- 둘 다 성공해야 커밋, 중간 실패 → 전부 롤백
```

**복잡 쿼리 5단계** (옷장 적용):

| 레벨 | 종류 | 옷장 빈도 |
|---|---|---|
| 1 | 단순 CRUD | 매 요청 |
| 2 | 다중 JOIN | 자주 (추천+옷+태그) |
| 3 | **벡터 검색 + 메타 필터** (pgvector) | **매 추천마다** |
| 4 | 윈도우 함수·CTE | 분석 시 (가끔) |
| 5 | 재귀 CTE | 거의 X |

**정형 / 반정형 / 비정형 — 옷장 데이터**:

| 분류 | 정의 | 옷장 예시 | 저장 |
|---|---|---|---|
| **정형** | 엄격한 스키마 (행/열 고정) | items 테이블 (user_id, category) | Postgres 컬럼 |
| **반정형** | 유연한 스키마 (JSON·태그) | users.preferences JSONB | Postgres JSONB 컬럼 |
| **비정형** | 정해진 구조 없음 | 옷 이미지 | S3 (URL만 DB) |

→ **Postgres는 3가지 다 처리 가능** (JSONB로 반정형, URL로 비정형 참조).

**옷장에서 저장하는 것**:
- users, items, item_tags, recommendations, combos, agent_logs

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| MySQL | ❌ | Postgres가 기능·확장성 우월 |
| MongoDB (NoSQL) | ❌ | 옷장 데이터는 정형, SQL 필요 |
| DynamoDB (AWS) | ❌ | 단순 KV엔 좋지만 복잡 쿼리 약함 |
| Aurora Postgres | △ | 더 강력하지만 비쌈, 3단계 검토 |

**AWS 환경**: RDS Postgres (db.t4g.small 시작, ~$25/월)

---

### 1.2 Redis (ElastiCache Redis)

| 항목 | 내용 |
|---|---|
| **분류** | DB (Key-Value, **메모리 영속**) |
| **무엇** | RAM에 데이터를 저장하는 초고속 DB |
| **저장 방식** | RAM (휘발성, 옵션으로 디스크 백업) |
| **속도** | 0.1ms (Postgres보다 100배 빠름) |

**어떻게 작동**:
```python
# 간단한 KV
redis.set("user:123:wardrobe_count", "47")
count = redis.get("user:123:wardrobe_count")

# 큐 (FIFO)
redis.lpush("tasks", "register_clothing(img1)")
task = redis.brpop("tasks")  # 가장 먼저 들어온 것

# 카운터 + TTL (일일 합성 한도)
redis.incr("user:123:synth_count:2026-06-12")
redis.expire("user:123:synth_count:2026-06-12", 86400)  # 24h TTL → 자동 삭제
```

**왜 Postgres가 있는데 Redis도 필요? — 용도가 다름**:

| | Postgres | Redis |
|---|---|---|
| 저장 위치 | 디스크 (영구) | RAM (휘발성) |
| 속도 | 1~10ms | 0.1ms |
| 용도 | 영구 데이터 | 임시·빠른 작업 |
| 비유 | 책장 (책 영구 보관) | 책상 위 포스트잇 |

**왜 사용** (옷장 특화 4가지):
1. **Celery 메시지 브로커** (작업 큐 저장)
2. **옷장 조회 캐시** (Postgres 부담 ↓, 100배 빠른 응답)
3. **일일 합성 횟수 카운팅** (TTL 자동 만료)
4. **세션·임시 토큰** (TTL로 자동 정리)

**TTL (Time To Live)란**:
- 데이터에 만료 시각 설정 → **자동으로 삭제**
- ```python
  redis.setex("session:user-1", 3600, "jwt-token")
  # 1시간 후 Redis가 자동 삭제 (수동 청소 불필요)
  ```
- 옷장에서: 일일 합성 카운터(24h), 세션(1h), 캐시(1분)

**"큐"의 두 가지 의미**:
- ① **자료구조 큐** = FIFO (선입선출)
- ② **Redis가 큐 역할** = Redis의 List 자료구조를 FIFO 큐로 사용
- Celery + Redis 조합에서 Redis가 "메시지 큐 저장소"

**핵심 자료구조 (Redis 지원)**:
- String, List(큐), Set, Hash, Sorted Set, Stream, Pub/Sub

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| Memcached | ❌ | KV만 됨, Redis는 자료구조 다양 |
| RabbitMQ | ❌ | 큐 전용 (캐시 안 됨), Redis 하나로 충분 |
| AWS SQS | △ | 큐 전용 관리형, 대안으로 가능 (Celery 대신 직접 사용 시) |

**AWS 환경**: ElastiCache Redis (cache.t4g.micro, ~$15/월)

---

### 1.3 DuckDB

| 항목 | 내용 |
|---|---|
| **분류** | DB (분석용 OLAP, 임베디드) |
| **무엇** | SQLite처럼 가볍지만 분석 쿼리 특화 |
| **저장 방식** | 단일 파일 또는 메모리 |
| **속도** | Pandas보다 10~100배 빠름 |

**⚠️ 흔한 오해 정정**:
- ❌ DuckDB는 **모니터링 DB가 아님** → 모니터링은 CloudWatch·Sentry·Amplitude
- ❌ Celery로 DuckDB에 로그 저장 X → 로그는 Postgres·CloudWatch가 저장
- ✅ DuckDB는 **분석가가 로컬에서 정형 데이터를 빠르게 쿼리하는 도구**

**어떻게 작동**:
```python
import duckdb

# S3 Parquet 파일을 직접 SQL로 쿼리 (다운로드 불필요)
duckdb.sql("""
    SELECT category, COUNT(*) as n, AVG(price) as avg_price
    FROM 's3://my-bucket/items/2026/*.parquet'
    WHERE color_primary = 'beige'
    GROUP BY category
""").df()  # → pandas DataFrame
```

**왜 사용** (옷장 특화):
- 분석가가 **로컬에서 ad-hoc 쿼리** (Jupyter·VS Code)
- Pandas보다 메모리 효율·속도 압도적
- S3 Parquet 직접 쿼리 (별도 ETL 없이)
- 1단계엔 분석 인프라(BigQuery·Snowflake) 과함

**Pandas vs DuckDB — 데이터 크기 기준** (16GB RAM 노트북):

| 데이터 크기 | 행 수 (예시) | 추천 |
|---|---|---|
| < 10MB | 1만 행 | Pandas |
| 10MB ~ 100MB | 10만~100만 행 | Pandas (편함), DuckDB도 OK |
| 100MB ~ 1GB | 100만~1,000만 행 | **DuckDB 권장** |
| 1GB ~ 10GB | 1,000만~1억 행 | **DuckDB 압도적** (Pandas 죽음) |
| 100GB+ | 10억+ 행 | **BigQuery/Snowflake** |

**옷장 데이터 크기 예측**:
| 단계 | 사용자 | 데이터 | 적합 도구 |
|---|---|---|---|
| 1단계 | 1,000명 | ~50MB | Pandas로 충분 |
| 2단계 | 10만 명 | ~5GB | DuckDB 진가 |
| 3단계 | 100만+ | 500GB+ | BigQuery/Snowflake |

**옷장에서 쓰는 사례**:
- "지난 30일 옷 등록량 추이"
- "사용자별 평균 옷장 사이즈"
- "Critic 거부율 일별 추세"
- 모두 운영 DB 영향 없이 S3 백업 데이터로

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| Pandas | △ | 작은 데이터엔 OK, 큰 데이터 느림 |
| BigQuery (AWS Athena) | ❌ | 1단계에 비용·복잡도 과함, 3단계 검토 |
| ClickHouse | ❌ | 대규모 분석 DB, 너무 무거움 |

**AWS 환경**: DuckDB는 로컬 도구. AWS 대안은 **Athena** (S3 직접 쿼리). 1단계엔 DuckDB 로컬로 충분.

---

## ② 라이브러리 (코드 도구) — 6개

### 2.1 Celery

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 (Python) — **DB 아님** |
| **무엇** | 분산 작업 큐 시스템 — 백그라운드 작업 관리 |
| **언어** | Python |

**어떻게 작동**:
```python
from celery import Celery
app = Celery('outfit', broker='redis://...')

@app.task
def register_clothing(image_url, user_id):
    # 시간 오래 걸리는 작업
    tags = vision_agent.analyze(image_url)
    save_to_db(tags)
    push_user(user_id, "완료!")

# API에서 비동기 실행
register_clothing.delay("https://...", "user-123")  # 즉시 리턴
```

**왜 사용** (옷장 특화):
- 옷 등록 = 8~15초 (AI 호출 多)
- API가 직접 처리하면 사용자 15초 대기 → UX 망함
- Celery로 백그라운드 처리, API는 즉시 응답
- **재시도·실패 처리·결과 추적** 자동

**3개 프로세스 협업 구조**:
```
┌─────────────────────────────────────────────┐
│ AWS ECS Fargate (3개 컨테이너)               │
├─────────────────────────────────────────────┤
│ 1. FastAPI (API 요청 받음)                   │
│ 2. Celery Beat (스케줄 시계 — 1개만)         │
│ 3. Celery Worker (작업 실행 — 1~N개 스케일)  │
└─────────────────────────────────────────────┘
       ↓ task 적재 / 꺼냄
[ElastiCache Redis] — 큐 (메시지 보관)
```

**Redis에 저장되는 메시지 구조 (작업 명세서)**:
```json
{
  "id": "task-uuid-xyz",
  "task": "register_clothing",      // 함수 이름
  "args": ["https://s3/abc.jpg"],   // 위치 인자
  "kwargs": {"user_id": "user-123"}, // 키워드 인자
  "retries": 0,
  "priority": 5
}
```

**백그라운드 UX 패턴 3가지** (옷장 적용):

| 패턴 | 작동 | 옷장 사용 |
|---|---|---|
| **폴링** | 클라이언트가 주기적으로 "끝났어?" 물음 | 코디 추천 결과 화면 |
| **푸시 알림** | 서버 → 모바일 알림 | 옷 등록 완료 |
| **WebSocket/SSE** | 양방향 실시간 | 1단계엔 과함 (2~3단계) |

**Celery Beat = cron 기능**:
```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    'daily-coordi': {
        'task': 'generate_daily_recommendation',  # 함수 이름
        'schedule': crontab(hour=5, minute=0),    # 매일 새벽 5시
    },
}
# Beat은 시간 되면 → Redis 큐에 task 적재 → Worker가 실행
```

**핵심 기능**:
- 작업 큐잉 (Redis 등에 메시지 저장)
- Worker 풀 (병렬 처리)
- 재시도 정책 (실패 시 자동)
- 정기 작업 (Celery beat — cron 같은 스케줄러)
- 결과 백엔드 (Redis·DB에 결과 저장)

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| RQ (Redis Queue) | △ | Celery보다 단순, 기능 적음 |
| Dramatiq | △ | Celery 대안, 적게 쓰임 |
| Temporal / Airflow | ❌ | 복잡한 워크플로우용, 1단계 과함 |
| AWS SQS + Lambda | △ | 서버리스 대안, 3단계 검토 |

**비용**: 라이브러리는 무료. 인프라 (ElastiCache Redis ~$15/월)만.

---

### 2.2 LangChain (또는 LangGraph)

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 (Python) |
| **무엇** | LLM 앱 만드는 통합 도구함 (체인·에이전트·RAG·도구) |
| **언어** | Python (TypeScript도 있음) |

**어떻게 작동**:
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import PGVector

# 1. 청킹
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
chunks = splitter.split_text(text)

# 2. 임베딩 + 벡터 DB 저장
embeddings = OpenAIEmbeddings()
vectorstore = PGVector.from_texts(chunks, embeddings, connection_string=...)

# 3. 검색
results = vectorstore.similarity_search("쌀쌀한 가을 룩", k=12)
```

**왜 사용** (옷장 특화):
- RAG 컴포넌트(Splitter·Embedder·VectorStore·Retriever) 통합
- 멀티 모델 추상화 (Anthropic·OpenAI·Cohere)
- 에이전트·tool_use 패턴 지원
- 커뮤니티 풍부 (예제·튜토리얼 多)

**옷장에서 사용 예**:
- 트렌드 글 청킹 + 임베딩 (2단계)
- pgvector 통합
- EnsembleRetriever (Dense + BM25)
- 검색 결과 reranking

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| **LangGraph** | ✅ | LangChain의 멀티에이전트 특화 진화형, **권장** |
| LlamaIndex | △ | RAG 특화, LangChain과 보완 |
| Haystack | ❌ | NLP 특화, LLM 시대엔 LangChain 우세 |
| 직접 구현 | △ | 깊이 학습엔 좋지만 시간 ↑ |

**비용**: 무료 (단 LLM API 호출은 별도)

---

### 2.3 FastAPI

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 + 프레임워크 (Python) |
| **무엇** | 최신 비동기 웹 API 프레임워크 |
| **언어** | Python (3.8+) |

**어떻게 작동**:
```python
from fastapi import FastAPI, Depends

app = FastAPI()

@app.post("/api/wardrobe/items")
async def register_item(
    payload: ItemUpload,
    user_id: str = Depends(get_current_user)
):
    task = register_clothing.delay(payload.image_url, user_id)
    return {"task_id": task.id, "status": "processing"}

# 자동 문서화 (/docs)
# 자동 검증 (Pydantic 통합)
# 비동기 지원 (async/await)
```

**왜 사용** (옷장 특화):
- AI/ML 생태계가 Python — 백엔드도 Python으로 통일
- **async** 강력 → AI 호출(I/O) 효율적
- Pydantic 통합으로 타입 안전·자동 검증
- 자동 OpenAPI 문서 생성
- 빠름 (Node.js와 비슷한 성능)

**옷장에서 사용**:
- REST API 전체 (옷 등록·조회·추천)
- 인증 미들웨어 (Cognito JWT 검증)
- 비동기 외부 API 호출 (Claude·BFL)

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| Django | ❌ | 무겁고 Sync 위주, AI 백엔드엔 과함 |
| Flask | △ | 간단하지만 async·타입 약함 |
| Express (Node.js) | ❌ | AI 생태계는 Python 우세 |
| Litestar | △ | FastAPI 경쟁, 덜 성숙 |

**비용**: 무료

---

### 2.4 pandas

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 (Python) |
| **무엇** | 표(DataFrame) 형태 데이터 분석·조작 도구 |

**어떻게 작동**:
```python
import pandas as pd

df = pd.read_sql("SELECT * FROM items", connection)
df.groupby('category').size()
df['color_primary'].value_counts()
df.to_parquet('items.parquet')
```

**왜 사용** (옷장 특화):
- DB → 분석 변환의 표준 도구
- AI/데이터 사이언티스트 필수 스킬
- 1단계엔 가벼운 분석에 충분 (큰 데이터는 DuckDB)

**옷장에서 사용**:
- Streamlit 대시보드의 데이터 가공
- 분석 노트북 (Jupyter)
- Ragas 평가 결과 집계
- ETL 스크립트 (소규모)

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| **DuckDB** | 보완 | 큰 데이터엔 DuckDB가 빠름 |
| Polars | △ | 신흥 강자, Pandas보다 빠르지만 생태계 작음 |

**비용**: 무료

---

### 2.5 Pydantic

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 (Python) |
| **무엇** | 데이터 검증·타입 강제 도구 |

**어떻게 작동**:
```python
from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    email: EmailStr     # 자동 이메일 형식 검증
    password: str
    age: int            # 자동 int 변환·검증

# FastAPI에서 자동 사용
@app.post("/auth/signup")
async def signup(user: UserSignup):
    # 잘못된 형식이면 자동 422 에러
    ...
```

**왜 사용**:
- FastAPI와 통합 (요청·응답 자동 검증)
- LLM 출력 JSON 검증 (Agent SDK에 활용)
- 타입 안전성

**대안**: dataclasses (표준 라이브러리, 검증 약함), attrs

**비용**: 무료

---

### 2.6 pytest

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 (Python) |
| **무엇** | Python 단위·통합 테스트 프레임워크 |

**왜 사용**:
- Python 표준 (unittest보다 우세)
- fixture·parametrize·plugin 풍부
- AI 코드도 단위 테스트 가능 (mock LLM 응답)

**옷장에서**:
```python
def test_visual_critic_catches_wrong_color():
    response = critic.evaluate(
        image="trench_beige.jpg",
        tags={"color": "black"}  # 잘못된 태그
    )
    assert response.ok == False
```

**비용**: 무료

---

## ③ 프레임워크 (앱 뼈대) — 2개

### 3.1 Next.js

| 항목 | 내용 |
|---|---|
| **분류** | 프레임워크 (JavaScript/TypeScript) |
| **무엇** | React 기반 풀스택 웹 프레임워크 |
| **언어** | JavaScript/TypeScript |

**어떻게 작동**:
- 페이지·라우팅·SSR·정적 생성·이미지 최적화 통합
- App Router (Next 13+)로 서버 컴포넌트 지원
- Vercel과 완벽 통합 (배포 1분)

**왜 사용** (옷장 특화):
- **랜딩 페이지에서 이미 사용** (Phase 0)
- SEO 친화 (검색 노출)
- 글로벌 CDN 무료 (Vercel)
- Capacitor로 모바일 앱 패키징 가능
- 풍부한 React 생태계

**Vercel vs AWS 배포 비교**:

| 항목 | Vercel | AWS (Amplify/S3+CloudFront) |
|---|---|---|
| Next.js 통합 | ✅✅✅ (만든 회사) | △ |
| 자동 이미지 최적화 | ✅ | ❌ 별도 설정 |
| Edge Functions·ISR | ✅ | △ 복잡 |
| 배포 속도 | Git 푸시 → 30초 | 더 오래 |
| 대량 트래픽 비용 | ❌ 비쌈 | ✅ 저렴 |
| 백엔드 컨트롤 | ❌ Serverless 제약 | ✅ 완전 |

→ **옷장 추천: 프론트=Vercel, 백엔드=AWS 하이브리드**.

**옷장에서**:
- 로그인·옷장 격자뷰·코디 표시 UI
- v0.dev 같은 AI 코드 도구로 UI 자동 생성

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| Streamlit | △ | MVP 가설 검증엔 OK, 출시 제품엔 부족 (디자인·모바일·인증·SEO 모두 약함) |
| Flutter | △ | 모바일 네이티브 경험 좋지만 학습 비용 5주+ |
| React Native | △ | Next.js와 다른 학습 |
| Vue/Nuxt | ❌ | React 생태계가 더 큼 |

**비용**: 무료 (Vercel Hobby tier 무료)

---

### 3.2 FastAPI

(라이브러리 섹션 2.3에서 이미 설명 — 라이브러리+프레임워크 양쪽 성격)

---

## ④ 서비스 (AWS) — 8개

### 4.1 AWS ECS Fargate

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 컨테이너 호스팅) |
| **무엇** | Docker 컨테이너를 서버 관리 없이 실행 |

**어떻게 작동**:
- Docker 이미지 → ECR 푸시 → ECS 실행
- EC2와 달리 **인스턴스 관리 불필요** (서버리스 컨테이너)
- 자동 스케일링·헬스 체크·롤링 배포

**왜 사용** (옷장 특화):
- FastAPI·Celery Worker 같은 Python 앱을 컨테이너로
- **EC2보다 운영 부담 ↓** (OS 패치 자동)
- 사용한 만큼만 과금
- AWS 다른 서비스와 통합 (CloudWatch·Secrets·IAM)

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| EC2 | △ | 직접 관리, 더 저렴할 수 있지만 운영 부담 ↑ |
| AWS Lambda | △ | 서버리스, 15분 시간 제한 (옷 등록엔 OK) |
| AWS App Runner | △ | 더 간단, 컨트롤 ↓ |
| Kubernetes (EKS) | ❌ | 3단계+ 검토 |

**비용**: 0.5 vCPU + 1GB × 2개 ~$20/월

---

### 4.2 AWS RDS Postgres

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 관리형 DB) |
| **무엇** | Postgres를 AWS가 자동 관리 |

**무엇이 관리되나**:
- 자동 백업 (매일·7일 보관)
- 자동 패치
- 다중 AZ 고가용성 (옵션)
- 모니터링 통합

**왜 사용**:
- 직접 Postgres 설치·운영 부담 X
- **자동 백업이 운영 신뢰성 핵심**
- pgvector 확장 직접 설치 가능

**대안**: Aurora Postgres (더 강력·비쌈), Supabase Postgres (관리형이지만 AWS 통합 약함)

**비용**: db.t4g.small ~$25/월

---

### 4.3 AWS ElastiCache Redis

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 관리형 Redis) |
| **무엇** | Redis를 AWS가 자동 관리 |

**왜 사용**:
- 직접 Redis 운영 부담 X
- 자동 백업·페일오버
- VPC 안에서 안전

**대안**: 직접 Redis on EC2 (저렴·운영 부담 ↑), Upstash Redis (서버리스 Redis)

**비용**: cache.t4g.micro ~$15/월

---

### 4.4 AWS S3 + CloudFront

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 스토리지 + CDN) |
| **무엇** | 무한 확장 파일 저장소 + 글로벌 캐시 |

**어떻게 작동**:
- 파일 업로드 → S3 (영구 저장)
- CloudFront가 전 세계 엣지에 캐싱
- 사용자는 가까운 엣지에서 빠르게 다운로드

**CloudFront 설정 방법 4가지** (yml 자동 X, IaC 도구 필요):

| 방법 | 설명 |
|---|---|
| AWS Console (웹 UI) | 클릭으로 설정 (처음엔 OK) |
| AWS CLI | 명령어 |
| **CloudFormation (yml)** | yml 파일로 IaC, AWS 표준 |
| **AWS CDK (Python·TS)** | 코드로 인프라 (AI 엔지니어 친화) |
| **Terraform (hcl)** | 멀티 클라우드 IaC, 가장 인기 |

```yaml
# CloudFormation yml 예시
Resources:
  MyDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: my-bucket.s3.amazonaws.com
            Id: S3Origin
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
        Enabled: true
```

→ "**yml/코드 정의 → 한 번 실행 → AWS 자동 생성**" 패턴 (IaC).

**왜 사용** (옷장 특화):
- 이미지 위주 도메인 → 스토리지·CDN 핵심
- **사용자가 옷 사진을 자주 봄** → CDN 캐싱 효과 큼
- 비용 저렴 ($0.023/GB/월)
- Presigned URL로 보안 (1시간 유효)

**옷장에서**:
- 옷 원본 사진
- 마네킹 합성 결과
- 백업 Parquet

**대안**: Cloudflare R2 (Egress 무료, 더 저렴), Google Cloud Storage

**비용**: 50GB ~$10/월

---

### 4.5 AWS Cognito

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 인증) |
| **무엇** | 사용자 풀·로그인·세션 관리 |

**왜 사용**:
- 자체 구현 부담 ↓ (비밀번호 해싱·검증·재설정 등)
- 소셜 로그인 (Google·Kakao) 통합
- MFA·이메일 인증 내장
- JWT 표준

**50K MAU 무료 — 어느 정도?**:

| 비교 | MAU |
|---|---|
| 카카오톡 한국 | ~5,000만 |
| 무신사 | ~수백만 |
| 중간 규모 스타트업 | ~10만~100만 |
| **Cognito 무료 한도** | **50,000** |
| 옷장 1단계 목표 | ~10,000 |

→ **옷장 1~2단계 모두 무료 tier 충분**. 50K MAU 넘으면 1K MAU당 ~$5.

**Cognito vs Cloudflare — 완전 다른 역할**:

| | AWS Cognito | Cloudflare |
|---|---|---|
| **역할** | 인증 (로그인·회원관리) | CDN + 방화벽 + DDoS 방어 |
| **비유** | 신분증 발급소 | 건물 입구 경비 |

→ 둘 다 같이 쓸 수 있음 (Cloudflare는 방어, Cognito는 인증).

**대안**: 자체 JWT + RDS (학습엔 좋지만 보안 책임 ↑), Auth0 (강력·비쌈), Supabase Auth

**비용**: 무료 (50K MAU까지)

---

### 4.6 AWS ECR (Elastic Container Registry)

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, Docker 이미지 저장소) |
| **무엇** | AWS의 Docker Hub |

**왜 사용**: ECS와 통합 쉬움, 프라이빗 (외부 공개 X)

**대안**: Docker Hub (공개), GitHub Container Registry

**비용**: $0.10/GB/월 (~$1)

---

### 4.7 AWS Secrets Manager

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 시크릿 저장) |
| **무엇** | API 키·DB 비밀번호 안전 저장·자동 회전 |

**왜 사용**:
- 코드·환경변수에 평문 절대 X (보안 사고 방지)
- ECS가 IAM Role로 자동 접근
- 회전 정책

**옷장에서**: Anthropic·BFL·OpenAI API 키, RDS 비밀번호

**대안**: Parameter Store (더 저렴, 회전 약함), HashiCorp Vault

**비용**: 시크릿 1개당 $0.40/월 (~$5)

---

### 4.8 AWS CloudWatch

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AWS, 로깅·모니터링) |
| **무엇** | 인프라·앱 로그·메트릭 수집·알람 |

**왜 사용**:
- ECS 컨테이너 stdout → 자동 수집
- 알람 (CPU·메모리·에러율)
- 다른 AWS 서비스와 통합

**대안**: Datadog (더 강력·비쌈), Grafana + Loki

**비용**: 무료 tier 충분 (~$5)

---

## ⑤ 서비스 (외부 SaaS) — 8개

### 5.1 Anthropic Claude

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (외부 API) |
| **무엇** | Anthropic의 LLM (Haiku·Sonnet·Opus) |

**왜 사용** (옷장 특화):
- tool_use 네이티브 지원 (멀티에이전트에 강함)
- 한국어 강함
- Vision 모달 (이미지 분석)
- 가격 합리적 (Haiku $0.25/$1.25 per M tokens)

**옷장에서 사용**:
- Vision Agent (Haiku V — 옷 분류)
- Specialist (Sonnet V — 정밀 태깅)
- Curator (Sonnet — 조합 생성)
- Critic (Haiku — 검증)

**Claude vs GPT — 이미지 분석 비교** (2026 초 일반론):

| 작업 | Claude Sonnet V | GPT-4o V | Gemini V | 옷장 |
|---|---|---|---|---|
| 일반 이미지 묘사 | ★★★★ | ★★★★★ | ★★★★ | 보통 |
| **도메인 추론** (옷 카테고리·스타일) | ★★★★★ | ★★★★ | ★★★★ | ⭐ |
| OCR | ★★★★ | ★★★★★ | ★★★★ | 보통 |
| 색·소재 인식 | ★★★★★ | ★★★★ | ★★★★ | ⭐ |
| **JSON 구조화 출력** | ★★★★★ | ★★★★ | ★★★★ | ⭐ |
| 한국어 | ★★★★★ | ★★★★ | ★★★★ | ⭐ |
| **Tool use (멀티에이전트)** | ★★★★★ | ★★★★ | ★★★★ | ⭐ |

→ **옷장 도메인엔 Claude가 미세 우위**. 단 **자체 테스트셋 50~100장으로 직접 비교** 권장 (벤치마크는 일반 작업 기준).

**비용 비교 (1M tokens)**:
| 모델 | Input | Output |
|---|---|---|
| Claude Haiku 4.5 | $0.25 | $1.25 |
| Claude Sonnet 4 | $3 | $15 |
| GPT-4o | $2.50 | $10 |

**참고 벤치마크 사이트**:
- Vellum AI LLM Leaderboard
- Artificial Analysis
- LMSYS Chatbot Arena

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| OpenAI GPT | △ | 비슷한 수준, 분기마다 비교 권장 |
| Google Gemini | △ | 멀티모달 강함, 한국어 OK |
| 자체 호스팅 Llama | 3단계 | 비용 절감 시점 |

**비용**: 옷 1장 등록 ~₩235

---

### 5.2 BFL Flux (Black Forest Labs)

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (외부 API) |
| **무엇** | 독일의 이미지 생성·편집 AI 스타트업 (2024 창업) |

**회사 배경**:
- **Stable Diffusion 만든 핵심 연구자들**이 Stability AI에서 나와 창업
- 대표 모델: **Flux 시리즈**

**Flux 모델 라인업**:
| 모델 | 용도 | 가격 |
|---|---|---|
| **Flux Pro** | 최고 품질 생성 | $0.05/장 |
| **Flux Dev** | 오픈소스 (자체 호스팅) | 무료 |
| **Flux Schnell** | 빠르고 저렴 | $0.003/장 |
| **Flux Kontext** ⭐ | **이미지 + 텍스트 → 편집** (옷장 핵심) | $0.04/장 |

**왜 사용** (옷장 특화):
- 마네킹 합성 (사용자 옷 + 마네킹 → 입은 모습)
- 자체 GPU 없이 즉시 운영
- 고품질 (Stable Diffusion 만든 사람들의 신작)

**GPT(DALL-E) vs Flux — 옷장 마네킹 합성용**:

| 작업 | DALL-E 3 (GPT) | Flux Kontext | 옷장 적합도 |
|---|---|---|---|
| 텍스트 → 새 이미지 생성 | ✅ 창의적 | ✅ 사실적 | (옷장엔 불필요) |
| **이미지 편집·합성** | ⚠️ 약함 | ✅ **특화** | ⭐ 핵심 |
| **일관된 마네킹** | ⚠️ 매번 다름 | ✅ 일관성 ↑ | ⭐ 핵심 |
| **다중 옷 합성** | ⚠️ 어려움 | ✅ 가능 | ⭐ 핵심 |
| **사용자 옷 그대로 재현** | ⚠️ 다른 옷 그릴 수 | ✅ 입력 이미지 기반 | ⭐ 핵심 |

→ **옷장엔 Flux Kontext가 우세** (편집·합성 특화).

**API 호출 패턴**:
```python
import httpx

# 1. 합성 요청
response = httpx.post(
    "https://api.bfl.ai/v1/flux-kontext/generate",
    headers={"x-key": BFL_API_KEY},
    json={
        "prompt": "마네킹이 트렌치와 슬랙스를 입은 모습",
        "input_image": image_url_or_base64,
        "width": 768, "height": 1024,
    }
)
task_id = response.json()["id"]

# 2. 결과 polling (비동기)
while True:
    result = httpx.get(f"https://api.bfl.ai/v1/get_result?id={task_id}")
    if result.json()["status"] == "ready":
        image_url = result.json()["result"]["sample"]
        break
    await asyncio.sleep(1)

# 3. 결과 → S3 저장
```

→ 옷장에선 이걸 **Celery Worker가 비동기로 처리**.

**대안 비교** (옷장 마네킹 합성용):
| 모델 | 추천도 |
|---|---|
| **BFL Flux Kontext** | ⭐⭐⭐⭐⭐ 1순위 |
| **Replicate IDM-VTON** | ⭐⭐⭐⭐ 가상 피팅 특화 |
| **OOTDiffusion** | ⭐⭐⭐ 오픈소스 |
| **DALL-E 3 (GPT)** | ⭐⭐ 일반 생성용, 편집 약함 |
| **자체 Stable Diffusion** | ⭐⭐ GPU 인프라 필요 (3단계) |

→ **1주 PoC로 BFL Flux vs Replicate IDM-VTON 직접 비교** 권장.

**비용**: 1장 합성 ~₩70~140

---

### 5.3 OpenAI Embeddings (text-embedding-3-small)

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (외부 API) |
| **무엇** | 텍스트를 벡터로 변환 |

**왜 사용**:
- 저렴 ($0.02/M tokens)
- 한국어 OK
- 1536차원 (pgvector 호환)

**대안**: Cohere Embed-v4 (멀티모달), 자체 BGE-M3 (오픈소스, GPU 필요)

**비용**: 옷 1만 장 임베딩 ~₩5,000

---

### 5.4 Vercel

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (외부 SaaS, 호스팅) |
| **무엇** | Next.js 최적화된 정적·서버리스 호스팅 |

**왜 사용**:
- Next.js 만든 회사 → 통합 완벽
- Git 푸시 → 자동 배포
- 글로벌 엣지 CDN
- 무료 tier 충분 (Hobby)

**Vercel vs AWS — 영역별 비교**:

| 영역 | Vercel | AWS |
|---|---|---|
| Next.js 호스팅 | ✅✅✅ | △ (Amplify) |
| 정적 사이트 | ✅✅ | ✅ S3+CloudFront |
| 백엔드 API | △ (Serverless 제약) | ✅✅✅ ECS·Lambda |
| DB | ❌ | ✅✅✅ RDS·DynamoDB |
| 대량 트래픽 비용 | ❌ 비쌈 | ✅ 저렴 |
| **컨트롤 수준** | ⚠️ 제약 多 | ✅ 무한 |

→ **옷장 추천: 프론트=Vercel, 백엔드=AWS 하이브리드**.

**대안**: Netlify, AWS Amplify, Cloudflare Pages

**비용**: 무료 (Hobby)

---

### 5.5 Amplitude

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (외부 SaaS, 분석) |
| **무엇** | 사용자 행동 이벤트 분석 |

**왜 사용**:
- 랜딩 페이지에서 이미 사용
- 퍼널·리텐션·코호트 분석
- 무료 tier 넉넉 (10M events/month)
- Session Replay 강력

**Amplitude vs DuckDB — 다른 역할**:

| | Amplitude | DuckDB |
|---|---|---|
| **목적** | 자동 이벤트 수집·UI 분석 | 데이터 ad-hoc 쿼리 |
| **사용자** | 비기술자 (PM·디자이너) | 데이터 분석가 |
| **인터페이스** | UI (차트·퍼널·코호트) | SQL |
| **자동화** | 이벤트 자동 수집 | 수동 쿼리 |
| **비유** | 차 계기판 (즉시 확인) | 정비소 진단 도구 (깊이 분석) |

→ **둘 다 필요. 역할이 다름**.
- Amplitude: "이번 주 가입 → 옷 등록 전환율" 빠른 확인
- DuckDB: "왜 그렇게 됐는지" 깊이 파보기

**대안**: Mixpanel, PostHog (오픈소스)

**비용**: 무료 (Starter)

---

### 5.6 Sentry

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (외부 SaaS, 에러 추적) |
| **무엇** | 앱·서버 에러 자동 수집·알림 |

**왜 사용** — 자체 구현 vs Sentry:

**Sentry 없이 (Celery로 자체 구현)**:
```python
@app.task
def register_clothing(image_url, user_id):
    try:
        # 로직...
    except Exception as e:
        slack.send(f"에러: {e}")    # 1. 슬랙 알림
        db.insert("errors", {...}) # 2. 로그 저장
        raise
```
→ 모든 함수에 try/except, 누락 위험·중복 코드.

**Sentry 사용**:
```python
import sentry_sdk
sentry_sdk.init(dsn="...")  # ← 한 줄로 끝

@app.task
def register_clothing(image_url, user_id):
    # 로직... try/except 불필요
    ...
# → unhandled exception 자동으로 Sentry에 전송
```

**Sentry가 자동으로 해주는 것**:
| 기능 | 자체 구현 시 |
|---|---|
| 스택 트레이스 캡처 | 직접 traceback 처리 |
| 같은 에러 그룹핑 | 직접 해시·중복 제거 |
| 빈도·트렌드 차트 | 직접 시각화 |
| 사용자 컨텍스트 | 직접 첨부 |
| 환경별 분리 | 직접 구분 |
| 슬랙 알림 | 직접 통합 |
| 해결됨·재발생 추적 | 직접 상태 관리 |
| 릴리즈 추적 | 직접 매핑 |

→ Sentry는 **에러 추적·관리 전체 시스템**. 자체 구현 = 1~2주, Sentry = 30분.

**학습 비용**: **30분~1시간** (init 한 줄 + UI 직관적)

**대안**: Rollbar, Honeybadger

**비용**: 무료 tier 충분 (5K errors/month)

---

### 5.7 GitHub Actions

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (GitHub, CI/CD) |
| **무엇** | 코드 푸시 → 자동 빌드·테스트·배포 |

**왜 사용**:
- GitHub 기본 통합
- 무료 2,000분/월
- Docker·AWS 통합 쉬움
- 정기 cron 작업도 가능

**GitHub Actions vs Vercel — 다른 역할**:

| 항목 | Vercel | GitHub Actions |
|---|---|---|
| **목적** | Next.js 프론트 호스팅·배포 | 범용 CI/CD 자동화 |
| **배포 대상** | Next.js·정적 사이트 | 무엇이든 (백엔드·DB·앱) |
| **설정** | Git 연결만 (자동) | yaml 파일로 정의 |
| **테스트 실행** | △ 제한적 | ✅ 메인 용도 |
| **다양한 워크플로우** | ❌ | ✅ |

→ **옷장은 둘 다 사용**:
- Vercel: 프론트만 자동 배포 (별도 설정 없음)
- GitHub Actions: 백엔드 Docker → ECR → ECS, 테스트, cron 작업

```
[Git 푸시]
       ├─→ [Vercel 자동 감지] — 프론트만
       │     Next.js 빌드·배포
       └─→ [GitHub Actions 트리거] — 백엔드·기타
             - pytest, mypy, ruff (테스트·lint)
             - Docker 빌드 → ECR 푸시
             - ECS 배포
             - Slack 알림
```

**옷장에서 GitHub Actions의 추가 사용처**:
| 작업 | Vercel 가능? | GH Actions로 |
|---|---|---|
| Next.js 배포 | ✅ | (Vercel 위임) |
| FastAPI Docker → ECS | ❌ | ✅ |
| 테스트 자동 실행 | ❌ | ✅ |
| 매일 새벽 ETL cron | ❌ | ✅ |
| PR 자동 코드 리뷰 | ❌ | ✅ |

**대안**: GitLab CI, CircleCI, AWS CodePipeline

**비용**: 무료

---

### 5.8 Streamlit

| 항목 | 내용 |
|---|---|
| **분류** | 라이브러리 (Python, UI) |
| **무엇** | Python으로 빠르게 데이터 앱 만드는 도구 |

**어떻게 작동**:
```python
import streamlit as st

st.title("옷장 운영 대시보드")
st.metric("일일 가입자", 42)
st.line_chart(daily_data)
```

**왜 사용** (옷장 특화):
- **내부 운영 대시보드** 빠른 구축
- AI 데모·테스트 UI
- Python 그대로 (백엔드와 같은 언어)

**출시 제품에 부족한 이유**:
| 영역 | Streamlit 한계 | 옷장 영향 |
|---|---|---|
| 디자인 자유도 | 모두 비슷한 룩, CSS 약함 | "데모 같다" 느낌 |
| **모바일 UX** | 반응형 약함, 터치 어색 | 옷장은 모바일 핵심 → 치명적 |
| 인증·권한 | 자체 미지원 | 회원관리 어려움 |
| 상태 관리 | 매번 새로고침 패턴 | 격자 클릭마다 깜빡임 |
| SEO | 검색엔진 색인 불가 | 마케팅·유입 X |
| 로딩 속도 | 첫 로딩 느림 | 사용자 이탈 |

→ **MVP 가설 검증·내부 도구엔 OK**, 출시 제품엔 Next.js.

**대안**: Gradio (AI 데모 특화), Retool (no-code)

**비용**: 무료 (ECS 호스팅비만)

---

## ⑥ 확장 (Extension) — 1개

### 6.1 pgvector

| 항목 | 내용 |
|---|---|
| **분류** | 확장 (Postgres 부가 기능) — **SQL 아님** |
| **무엇** | Postgres에 벡터 데이터·유사도 검색 추가 |

**두 가지 형태로 존재**:

#### ① Postgres 안의 확장 (SQL)
```sql
-- DB에서 한 줄로 활성화
CREATE EXTENSION vector;

-- vector 타입 사용 가능
ALTER TABLE items ADD COLUMN embedding vector(1536);

-- 코사인 유사도 검색
SELECT * FROM items ORDER BY embedding <=> '[...]'::vector LIMIT 12;
```

#### ② Python 클라이언트 라이브러리
```bash
pip install pgvector
```
```python
from pgvector.sqlalchemy import Vector  # ← 이게 import
# Postgres의 vector 타입을 Python에서 쉽게 다루도록
```

→ **둘 다 필요**. DB에서 확장 활성화 + Python에서 클라이언트 사용.

**Postgres DB 안에서 동작 — 검색 흐름**:

```
┌─────────────────────────────────────────────┐
│ Postgres DB                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ items 테이블 (벡터 + 일반 컬럼 함께)     │ │
│ │ id │ user_id │ category │ embedding     │ │
│ │ 1  │ A       │ outer    │ [0.1, ...]   │ │
│ │ 2  │ A       │ top      │ [0.5, ...]   │ │
│ │                                          │ │
│ │ + pgvector 인덱스 (IVF/HNSW)             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
       ↑ 검색
[Python] WHERE user_id + ORDER BY embedding ← 한 쿼리에 메타+벡터
```

**한 쿼리로 메타 필터 + 벡터 검색 (pgvector 강점)**:
```sql
SELECT *, 1 - (embedding <=> $1::vector) AS similarity
FROM items
WHERE user_id = $2          -- 일반 컬럼 필터
  AND category = 'outer'    -- 일반 컬럼 필터
ORDER BY embedding <=> $1   -- 벡터 검색
LIMIT 12;
```

**별도 벡터 DB(Pinecone) 사용 시 vs pgvector**:

| | pgvector (통합) | 별도 벡터 DB |
|---|---|---|
| 시스템 수 | 1개 | 2개 |
| 쿼리 복잡도 | 한 SQL로 끝 | 두 시스템 왕복 |
| 메타 필터 + 벡터 | ✅ 한 쿼리 | ❌ 두 단계 |
| JOIN | ✅ 자유 | ❌ 어려움 |
| 트랜잭션 | ✅ 한 번에 | ❌ 동기화 부담 |
| 운영 부담 | DB 1개 | 2개 |

**벡터 DB·인덱스 알고리즘 — ANN**:

- **ANN** (Approximate Nearest Neighbors): 근사·빠름 (실서비스 표준)
- **KNN** (K-Nearest Neighbors): 정확·느림 (작은 데이터)
- pgvector 알고리즘: **IVF, HNSW**

| 항목 | KNN | ANN |
|---|---|---|
| 동작 | 모든 데이터 거리 계산 | 인덱스로 빠르게 근사 |
| 속도 | O(N) — 100만 ~1초 | O(log N) — 100만 ~1ms |
| 정확도 | 100% | 95~99% |

**왜 사용** (옷장 특화):
- 별도 벡터 DB 없이 Postgres 하나로 통합
- 운영 부담 0, 트랜잭션 일관성
- 1만~100만 벡터까지 충분

**한계**: 100만+ 벡터 시 성능 저하 → Qdrant 검토 (2~3단계)

**대안 비교**:
| | 채택? | 이유 |
|---|---|---|
| **pgvector** | ✅ 1단계 | DB 통합, 운영 부담 ↓ |
| Pinecone | ❌ | SaaS 비용, 1단계 과함 |
| Qdrant | 2단계+ | 확장성 ↑, 운영 부담 ↑ |
| Milvus | ❌ | 너무 무거움 |
| Chroma | △ | 학습용 OK, **운영 부족** (수십 명 동시 한계) |

**비용**: 무료 (Postgres에 포함)

---

## ⑦ 개발 도구 — 4개

### 7.1 Docker

| 항목 | 내용 |
|---|---|
| **분류** | 도구 (컨테이너) |
| **무엇** | 앱 + 의존성을 하나의 이미지로 묶음 |

**왜 사용**:
- "내 컴퓨터에선 되는데..." 문제 해결
- 로컬·dev·prod 환경 동일
- ECS 배포의 필수 입력

**옷장에서**:
- FastAPI Docker 이미지
- Celery Worker Docker 이미지
- 로컬 개발 docker-compose

**비용**: 무료

---

### 7.2 Git + GitHub

| 항목 | 내용 |
|---|---|
| **분류** | 도구 (버전 관리) |
| **무엇** | 코드 이력·협업 관리 |

**비용**: 무료 (개인 프라이빗 리포지토리 무제한)

---

### 7.3 v0.dev (Vercel)

| 항목 | 내용 |
|---|---|
| **분류** | 서비스 (AI UI 생성) |
| **무엇** | 텍스트 설명 → React UI 코드 자동 생성 |

**왜 사용** (옷장 특화):
- AI 엔지니어 트랙 → 프론트 학습 시간 절약
- Next.js 코드 출력 (그대로 사용)
- 1시간이면 화면 디자인 완성

**대안**: Cursor, Lovable, Bolt (모두 AI 코드 생성)

**비용**: $20/월 (Pro)

---

## 8. 한눈에 보는 전체 카탈로그

### 분류별 요약 표

| 분류 | 도구 | 핵심 역할 |
|---|---|---|
| **DB** | Postgres (RDS) | 운영 데이터 영구 저장 |
| **DB** | Redis (ElastiCache) | 큐·캐시 (메모리) |
| **DB** | DuckDB | 분석가 로컬 ad-hoc 쿼리 |
| **확장** | pgvector | Postgres에 벡터 검색 추가 |
| **라이브러리** | Celery | 백그라운드 작업 관리 |
| **라이브러리** | LangChain/LangGraph | LLM·RAG 통합 도구 |
| **라이브러리** | pandas | 데이터 분석·조작 |
| **라이브러리** | Pydantic | 데이터 검증·타입 |
| **라이브러리** | pytest | 테스트 |
| **프레임워크** | Next.js | 웹·모바일 프론트 |
| **프레임워크** | FastAPI | 백엔드 API |
| **AWS** | ECS Fargate | 컨테이너 호스팅 |
| **AWS** | RDS Postgres | 관리형 DB |
| **AWS** | ElastiCache Redis | 관리형 Redis |
| **AWS** | S3 + CloudFront | 이미지 + CDN |
| **AWS** | Cognito | 인증 |
| **AWS** | ECR | Docker 레지스트리 |
| **AWS** | Secrets Manager | 시크릿 |
| **AWS** | CloudWatch | 로깅·모니터링 |
| **외부 SaaS** | Anthropic Claude | LLM (Vision + 추론) |
| **외부 SaaS** | BFL Flux | 마네킹 합성 |
| **외부 SaaS** | OpenAI Embeddings | 텍스트 벡터화 |
| **외부 SaaS** | Vercel | Next.js 호스팅 |
| **외부 SaaS** | Amplitude | 사용자 행동 분석 |
| **외부 SaaS** | Sentry | 에러 추적 |
| **외부 SaaS** | GitHub Actions | CI/CD |
| **외부 SaaS** | Streamlit | 내부 대시보드 |
| **외부 SaaS** | v0.dev | AI UI 생성 |
| **도구** | Docker | 컨테이너 |
| **도구** | Git/GitHub | 버전 관리 |

### 비용 한눈에 (사용자 1,000명 기준 월)

| 카테고리 | 비용 |
|---|---|
| AWS 인프라 (ECS·RDS·Redis·S3·기타) | ~$100 (~₩140K) |
| Anthropic Claude | ~₩300K |
| BFL Flux 합성 | ~₩150K |
| 기타 SaaS (Vercel·Amplitude·Sentry·GHA) | 무료 tier |
| v0.dev (선택) | $20 (~₩28K) |
| **합계** | **~₩620K/월** |

---

## 9. 학습 순서 추천 (AI 엔지니어 트랙)

| 순서 | 우선 학습 | 기간 |
|---|---|---|
| 1 | Python + FastAPI 기본 | 1주 |
| 2 | Docker 기본 | 3일 |
| 3 | Postgres + SQL | 1주 |
| 4 | Celery + Redis | 3일 |
| 5 | AWS 기본 (IAM·ECS·RDS·S3) | 1주 |
| 6 | LangChain/LangGraph | 1주 |
| 7 | pgvector + RAG | 1주 |
| 8 | Anthropic SDK + tool_use | 3일 |
| 9 | CI/CD (GitHub Actions) | 3일 |
| 10 | Streamlit (분석 대시보드) | 1일 |

**총 ~5~6주**로 1단계 운영 가능 수준 도달.

---

## 10. 관련 문서

- [phase1-blueprint.md](./phase1-blueprint.md) — 1단계 시스템 설계도
- [mvp-roadmap.md](./mvp-roadmap.md) — 단계별 진화 로드맵
- [multi-agent-design.md](./multi-agent-design.md) — 옷 등록 멀티에이전트 상세
- [rag-design.md](./rag-design.md) — RAG 시스템 단계별 설계
- [**cost-reference.md**](./cost-reference.md) — **각 도구별 비용 + 공식 가격 페이지 URL** ⭐

---

## 11. 심화 Q&A — 자주 묻는 질문 모음

학습 과정에서 자주 부딪히는 질문들을 한 곳에 정리. 본문 보강의 핵심만 요약.

### 11.1 분류·기본 개념

| Q | A |
|---|---|
| 오픈소스 = 무료 + 커스텀 가능? | 거의 — 소스 공개 + 라이선스에 따라 가능. 대부분 무료지만 GPL·BSL 같은 제약 라이선스도 |
| DB·라이브러리·프레임워크 구분? | DB=창고, 라이브러리=가전, 프레임워크=주방, 서비스=식당, 확장=가전 부착품, 도구=망치 |

### 11.2 Postgres / 트랜잭션

| Q | A |
|---|---|
| 트랜잭션은 모든 DB의 기본? | ❌ — Postgres·MySQL 강함, Redis·Cassandra 약함 |
| 데이터 일관성 = Atomicity? | 거의 — Atomicity가 주범, 결과적으로 Consistency도 깨짐 |
| 반정형을 정형 컬럼으로? | 가능하지만 컬럼 폭발·NULL 가득. JSON이 더 단순 |
| 자유 중첩 = 키가 또 키-값? | ✅ JSON 객체 안에 객체 |
| 사용자 선호를 그냥 테이블로? | 단순엔 OK. 복잡(점수·다중 차원)엔 JSON이 압도적. 옷장은 hybrid 권장 |
| 복잡 쿼리는 옷장에 어느 수준? | Level 3 (벡터+필터+JOIN)이 일상, Level 4(윈도우·CTE)는 분석용 |

### 11.3 Redis

| Q | A |
|---|---|
| Celery가 DB? | ❌ — Python **라이브러리** (작업 큐 관리) |
| Redis (큐)에서 큐 = FIFO? | ✅ 자료구조 큐의 FIFO. Redis가 그걸 구현 |
| Postgres 있는데 왜 Redis? | 용도 다름 — 영구 vs 임시, 큐·캐시·TTL은 Redis 자연 |
| TTL이 뭐야? | Time To Live — 만료 시각 설정, **자동 삭제** |

### 11.4 Celery

| Q | A |
|---|---|
| 백그라운드 = UI 먼저 + 알림? | ✅ 3가지 패턴 (폴링·푸시·WebSocket) |
| Celery가 Redis에 뭘 저장? | **작업 명세서 JSON** (task 이름·인자·재시도 정보) |
| 정기 작업 = cron? | ✅ Celery Beat이 그 역할, Python 함수로 cron 패턴 |
| beat_schedule = Redis 저장? | ❌ 코드에 정의, Beat이 시간 되면 Redis 큐에 적재 |

### 11.5 pgvector / 벡터 DB

| Q | A |
|---|---|
| pgvector를 `from postgresql import`? | ❌ — DB에 `CREATE EXTENSION vector` + Python 클라이언트 별도 |
| pgvector는 Postgres 안에서 동작? | ✅ — 벡터 컬럼도 일반 컬럼, 인덱스도 Postgres 안에 |
| 검색 = Postgres 데이터 검색? | ✅ — 한 SQL로 메타 필터 + 벡터 검색 한 번에 |
| 벡터 DB = 유사도로 저장? | △ — 저장은 평범, **빠른 유사도 검색이 진짜 차이** |
| ANN ≒ KNN? | 같은 가족 — **KNN 정확·느림**, **ANN 근사·빠름** (실서비스 표준) |
| Chroma 부족? | 단일 노드 수십 명 한계 — 1단계 옷장엔 **pgvector가 정답** |

### 11.6 DuckDB

| Q | A |
|---|---|
| DuckDB = 모니터링 DB? | ❌ — 분석 도구. 모니터링은 CloudWatch·Sentry·Amplitude |
| Celery로 로그를 DuckDB에? | ❌ — 로그는 Postgres·CloudWatch가 저장, DuckDB는 그걸 읽어서 분석 |
| 정형? | ✅ — 컬럼형 정형 (OLAP) |
| 초기 Pandas → 후기 DuckDB? | 정확히는 **데이터 크기로 선택** — ~100MB 이하 Pandas, 그 이상 DuckDB |
| "큰 데이터" 기준? | 노트북 16GB RAM 기준 ~100MB부터 DuckDB 진가. 옷장 1단계(~50MB)는 Pandas로 충분 |

### 11.7 Next.js / 프론트

| Q | A |
|---|---|
| Vercel vs AWS? | **프론트=Vercel 압승, 백엔드=AWS**. 옷장은 하이브리드 |
| Streamlit 출시 부족 근거? | 모바일 UX·디자인·인증·SEO 모두 약함 — 데모용은 OK |

### 11.8 AWS Cognito / CloudFront

| Q | A |
|---|---|
| CloudFront yml 자동? | ❌ — CloudFormation·CDK·Terraform 같은 **IaC 도구**로 정의 |
| Cognito 50K MAU 어느 정도? | 옷장 1~2단계 충분히 커버 (카카오톡 ~5천만 MAU, 옷장 출시 초기 ~100명) |
| Cognito = Cloudflare? | ❌ — **Cognito=인증(신분증), Cloudflare=CDN·방어(경비)** |

### 11.9 BFL Flux

| Q | A |
|---|---|
| BFL이 뭐? | Stable Diffusion 만든 사람들의 새 스타트업 (독일), **Flux 모델** |
| GPT(DALL-E)보다 좋아? | **이미지 편집·합성·일관된 마네킹**엔 Flux Kontext 우세. DALL-E는 텍스트→새 이미지 생성 강함 |
| API 그냥 호출? | ✅ REST API + polling 패턴 (비동기 long-running) |

### 11.10 Anthropic Claude vs GPT

| Q | A |
|---|---|
| 이미지 분석 GPT가 더 잘? | 작업마다 다름 — **도메인 추론·tool_use·한국어는 Claude 우세**, OCR·일반 묘사는 GPT-4o 약간 |
| 성능 비교표? | Vellum AI Leaderboard, Artificial Analysis, LMSYS Arena 참고. **옷장은 자체 테스트셋으로 직접 비교** 권장 |

### 11.11 Amplitude vs DuckDB

| Q | A |
|---|---|
| DuckDB 있는데 Amplitude 필요? | ✅ 다른 역할 — Amplitude=자동 수집·UI 분석, DuckDB=ad-hoc SQL |

### 11.12 Sentry

| Q | A |
|---|---|
| Celery로 알림 vs Sentry? | Sentry **압도적으로 편함** (자동 캡처·그룹핑·UI), 자체 구현 1~2주 vs Sentry 30분 |
| 학습 비용? | **30분~1시간** (한 줄 init) |

### 11.13 GitHub Actions

| Q | A |
|---|---|
| Vercel과 다른 점? | Vercel=프론트 특화, **GitHub Actions=범용 자동화** (백엔드·테스트·cron) |

---

**문서 버전**: v0.2 (2026-06-13 — 심화 Q&A 추가 + 본문 보강)
**갱신 내역**:
- v0.1: 초안
- v0.2: 모든 도구 섹션에 트랜잭션·반정형·TTL·UX 패턴·MAU·비교 보강 + §11 심화 Q&A 모음 추가
