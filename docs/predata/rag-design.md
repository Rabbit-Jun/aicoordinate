# AI Coordinate — RAG 시스템 단계별 설계

> 옷장 코디 서비스의 RAG 컴포넌트 설계. 사용자가 학습한 RAG 개념 9가지([1] 기본·[2] 인덱싱·[3] 청킹·[4] 임베딩·[5] 리트리벌·[6] 멀티모달·[7] Advanced RAG·[8] Self-RAG·[9] GraphRAG)를 옷장 도메인에 단계별로 적용한다.
>
> 본 문서는 [mvp-roadmap.md](./mvp-roadmap.md)의 RAG 영역을 깊게 다루는 보조 설계서다. [multi-agent-design.md](./multi-agent-design.md)와 함께 Phase 1+ 백엔드 설계의 양 축.

## 0. 왜 옷장 서비스에 RAG가 필수인가

### RAG 적용 판단 기준 ([1] 학습 내용)
> "범용 주제면 LLM 학습 데이터에 있으니 불필요, **폐쇄적 도메인 + 자주 업데이트되는 정보면 필수**."

| 데이터 영역 | RAG 필요? | 이유 |
|---|---|---|
| **사용자 옷장 (개인 데이터)** | ✅✅✅ 필수 | LLM이 절대 모름. 사용자별·실시간 |
| **사용자 추천 이력** | ✅✅✅ 필수 | 개인화·중복 방지 |
| **트렌드 정보** | ✅✅ 권장 | LLM 학습 시차 (1년+ 갭) |
| **시세 정보** | ✅✅ 권장 | 실시간 가격 변동 |
| **패션 일반 지식** | ❌ 불필요 | "트렌치 코트가 뭐냐" → LLM이 잘 앎 |
| **색·소재 기본 분류** | ❌ 불필요 | 범용 지식 |

→ 옷장 서비스의 핵심 가치는 **"내가 가진 옷에서 추천"** 인데, 이건 RAG 없이 절대 불가능. **RAG가 옷장 서비스의 척추**.

### 권장 접근 (사용자 학습 그대로)
> "먼저 RAG 없이 구현해보고, 사전 지식만으로 부족한 영역에 한해 RAG 구축"

옷장 서비스는 **첫 줄부터 RAG 필요** (LLM이 사용자 옷장을 모름). 단 RAG 단계는 **단순한 것부터** 시작.

---

## 1. 옷장 도메인의 RAG 시나리오 매트릭스

| 시나리오 | 데이터 소스 | RAG 강도 | 단계 |
|---|---|---|---|
| ① **옷장 옷 검색** (코디 추천 시) | Postgres `items` + 임베딩 | 기본 | 1단계 |
| ② **유사 옷 검색** (중복 검사·재추천) | pgvector | 기본 | 1단계 |
| ③ **추천 이력 검색** (중복·개인화) | 추천 로그 + 임베딩 | 기본 | 1단계 |
| ④ **트렌드 검색** (외부) | 크롤링/API → 벡터 DB | Advanced | 2단계 |
| ⑤ **사용자 선호 검색** (Memory) | 선호 프로파일 임베딩 | Advanced | 2단계 |
| ⑥ **멀티모달 검색** ("이런 옷 있어?") | CLIP 임베딩 | Advanced | 2단계 |
| ⑦ **옷-스타일-트렌드 관계 추론** | GraphRAG | 고도화 | 3단계 |
| ⑧ **자가 검증 (할루시네이션 방지)** | Self-RAG 루프 | 고도화 | 3단계 |

→ **3단계로 점진 도입**. 1단계는 ①②③에 집중.

---

## 2. 1단계 — 기본 RAG (MVP)

> 기본기만 탄탄히. ①②③ 시나리오를 단순 Dense 벡터 검색으로.

### 2.1 지식 베이스 구축 ([2] 학습 적용)

#### 데이터 소스 (1단계 한정)
| 소스 | 형태 | 처리 |
|---|---|---|
| 옷 등록 (사용자) | 이미지 + 메타데이터 | 자동 (옷 등록 워크플로우 안에서) |
| 코디 추천 이력 | 텍스트 (조합 + 이유) | 추천 생성 시 자동 인덱싱 |

#### Loader 전략
> 사용자 학습 → "PDF·Word는 LangChain 로더, 자기 데이터에 맞는 로더 실험으로 찾기"

옷장 도메인은 PDF·Word 없음. **자체 데이터 → 자체 변환 로직**:

```python
# 옷 1벌 → Document 변환 (LangChain Document 호환)
def item_to_document(item: Item) -> Document:
    return Document(
        page_content=f"""
        {item.category} · {item.subcategory}
        색상: {item.color}
        소재: {item.material}
        스타일: {', '.join(item.styles)}
        시즌: {item.season}
        설명: {item.description}
        """,
        metadata={
            "item_id": item.id,
            "user_id": item.user_id,
            "category": item.category,
            "color_main": item.color,
            "added_at": item.created_at.isoformat(),
            "last_worn": item.last_worn,  # 자주 안 입은 옷 우선 추천용
            "image_url": item.image_url,
            "embedding_model": "openai-3-small",  # 임베딩 버전 추적
        },
    )
```

#### 메타데이터 설계 ([2] 강조점)
> 사용자 학습 → "메타데이터는 나중에 서비스 화면·검색에 활용되므로 잘 설계"

**옷장 도메인 핵심 메타데이터**:
- `user_id`: **격리 필수** (다른 사용자 옷 절대 노출 X)
- `category` / `color_main`: 필터링 검색
- `last_worn`: "자주 안 입은 옷 우선 추천" 핸들링
- `added_at`: 신규 옷 우선 추천
- `season`: 계절 필터
- `embedding_model`: 모델 버전 변경 시 마이그레이션 관리

→ **메타데이터로 1차 필터 → 벡터 검색**으로 효율적.

### 2.2 청킹 전략 ([3] 학습 적용)

#### 옷장 데이터의 청크 단위
> 사용자 학습 → "RecursiveCharacterTextSplitter 권장, 토큰 단위, 청크 사이즈 트레이드오프"

**옷장 도메인의 특수성**: 옷 1벌 = 1 청크 (자연스러운 단위)
- 청킹 알고리즘 불필요 (한 옷의 메타데이터는 ~100토큰)
- "청크 사이즈 트레이드오프"가 옷장엔 무의미 — 옷 1벌이 곧 1 청크
- → **청킹 알고리즘은 외부 데이터(트렌드 글)에만 적용** (2단계)

#### 트렌드 텍스트 청킹 (2단계 미리보기)
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,          # 토큰 단위
    chunk_overlap=64,        # 10~20% 권장값 적용
    length_function=count_tokens,  # 글자 아닌 토큰
    separators=["\n\n", "\n", ". ", " "],  # 단락→문장→공백 순
)
chunks = splitter.split_text(trend_article)
```

→ 사용자 학습대로 **Recursive + 토큰 단위 + 오버랩 10~20%**.

### 2.3 임베딩 ([4] 학습 적용)

#### 1단계 임베딩 모델 선택
| 데이터 | 모델 | 이유 |
|---|---|---|
| **옷 메타데이터 텍스트** | OpenAI `text-embedding-3-small` | 저렴($0.02/M토큰), 한국어 OK, 1536차원 |
| **옷 이미지** | OpenAI CLIP / OpenCLIP | 멀티모달, pgvector 호환 |

#### 벡터 DB 선택 ([4] 학습 적용)
> 사용자 학습 → "학습 FAISS, 가벼운 Chroma, 큰 규모 Qdrant·Milvus"

**1단계 선택: pgvector (Supabase 통합)**
| 옵션 | 1단계 적합성 | 이유 |
|---|---|---|
| **pgvector** ⭐ | ✅✅✅ | Supabase에 이미 있음, DB 1개로 통합, 운영 부담 0 |
| Chroma | ✅ | 가볍지만 별도 운영 |
| FAISS | ❌ | 영속성 없음 (학습용) |
| Qdrant | ✅ | 강력하지만 1단계엔 과함 |
| Pinecone | △ | 좋지만 SaaS 비용 |

→ **pgvector는 옷장 도메인 1단계에 압도적 합리**. 사용자 100명~10만 명까지 충분.

```sql
-- Supabase에서 pgvector 활성화
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE items ADD COLUMN embedding vector(1536);
ALTER TABLE items ADD COLUMN image_embedding vector(512);  -- CLIP

CREATE INDEX ON items USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON items USING ivfflat (image_embedding vector_cosine_ops);
```

### 2.4 리트리벌 — Dense Only ([5] 1단계만)

> 사용자 학습 → "Dense vs Sparse, 앙상블 권장, 코사인 유사도"

#### 1단계는 Dense만 (단순화)
- BM25 같은 Sparse는 2단계에 도입
- 1단계 검증·디버깅 단순화 우선

```python
async def search_user_wardrobe(
    user_id: UUID, query: str, k: int = 12
) -> list[Item]:
    # 1. 질문도 동일한 임베딩 모델로 (★ 중요)
    query_embedding = await openai.embeddings.create(
        model="text-embedding-3-small",
        input=query,
    )
    
    # 2. 메타데이터 필터 + 벡터 검색 (코사인)
    return await db.execute("""
        SELECT *, 1 - (embedding <=> %s) AS similarity
        FROM items
        WHERE user_id = %s        -- ★ user_id 격리 필수
          AND archived = false
        ORDER BY embedding <=> %s  -- cosine distance
        LIMIT %s
    """, [query_embedding, user_id, query_embedding, k])
```

#### 1단계 검색 파라미터
- `k = 12` (Top-K) → Curator Agent에 전달
- `user_id` 격리 (절대 다른 사용자 옷 누출 X)
- 코사인 유사도 (방향 기반, 길이 무관)

### 2.5 1단계 RAG 워크플로우 (옷 등록 + 코디 추천)

```
[옷 등록 시 인덱싱]
사용자 옷 1장 업로드
       ↓
Vision/Tagger Agent → 메타데이터 추출
       ↓
item_to_document() → page_content + metadata
       ↓
OpenAI Embedding API (텍스트 → 1536차원 벡터)
CLIP Embedding API (이미지 → 512차원 벡터)
       ↓
INSERT INTO items (..., embedding, image_embedding)


[코디 추천 시 리트리벌]
사용자 질문: "오늘 비 오는 날 룩"
       ↓
질문 임베딩 (동일 모델 ★)
       ↓
WHERE user_id = me              ← 격리
   + 코사인 유사도 검색
   → Top-12 옷
       ↓
Curator Agent 프롬프트의 context에 12 옷 주입
       ↓
LLM이 12 옷 안에서만 조합 N개 생성
```

### 2.6 1단계 한계 (의도적 — 2단계로 미룸)
- ❌ Query Rewrite·HyDE 없음
- ❌ 앙상블 (BM25) 없음
- ❌ Reranking 없음
- ❌ Compression 없음
- ❌ 멀티모달 통합 검색 ("이런 사진 같은 옷 찾기")
- ❌ Self-RAG 자가 검증 (Critic으로 일부 대체)
- ❌ GraphRAG

→ 1단계는 **단순 RAG로 충분히 좋은 답**이 나오는지 검증. 부족하면 2단계 Advanced.

---

## 3. 2단계 — Advanced RAG (Growth)

> 1단계 RAG 한계가 드러날 때 도입. [7] 학습 내용의 4영역(인덱싱·Pre-Retrieval·Retrieval·Post-Retrieval) 적용.

### 3.1 Pre-Retrieval — 쿼리 변환 ([7]B 학습 적용)

> "사용자 질문을 그대로 쓰지 말자"

#### Query Rewrite (RRR)
```python
# 사용자: "쌀쌀할 때 입을 옷"
# → 그대로 검색하면 "쌀쌀" 단어가 옷장 데이터엔 없음

rewrite_prompt = """
사용자 질문을 옷장 검색에 적합한 형태로 재작성:
- 계절·온도 → 구체 카테고리
- 감정적 표현 → 객관적 속성

사용자: "쌀쌀할 때 입을 옷"
재작성: "가을 코디, 자켓 또는 가디건, 긴팔, 무채색"
"""
rewritten = await haiku.complete(rewrite_prompt + user_query)
results = await retrieve(rewritten)
```

→ **Haiku 같은 저렴한 모델**로 재작성 (1회 ~₩5).

#### Multi-Query
```python
# 한 질문 → 여러 관점으로 분기
queries = await llm.generate_perspectives(
    "오늘 면접 룩",
    perspectives=["격식", "단정함", "신뢰감 주는 색"],
)
# → 3개 쿼리로 각각 검색 → 합집합·재순위
all_results = []
for q in queries:
    all_results.extend(await retrieve(q))
deduplicated = dedupe_by_item_id(all_results)
```

→ **다양한 관점 커버**, 단 비용 3배.

#### HyDE (Hypothetical Document Embeddings)
```python
# "오늘 비 오는 날 룩" → LLM이 가상의 답을 먼저 생성 → 그 답으로 검색
hypothetical = await llm.complete(
    f"가상 답: '{query}'에 어울리는 옷 설명을 1문단으로"
)
# 가상 답 임베딩으로 검색 (질문 임베딩보다 정확)
results = await retrieve_by_text(hypothetical)
```

→ 옷장 도메인에 **특히 효과적** (질문은 추상적, 옷 설명은 구체적이라 매칭 어려운데 HyDE가 격차 줄임).

#### Routing (의도 분기)
```python
# 질문 의도 → 적합한 데이터 소스로
intent = await classify_intent(query)
match intent:
    case "wardrobe_search":     retrieve_from(wardrobe_index)
    case "trend_query":         retrieve_from(trend_index)
    case "history_query":       retrieve_from(recommendation_history)
    case "shopping_advice":     retrieve_from(external_market_index)
```

→ 단계별로 인덱스가 늘면서 라우터 필수.

### 3.2 Retrieval — 앙상블 + MMR ([7]C)

#### Dense + Sparse 앙상블 ([5][7])
> 사용자 학습 → "팩트 체킹·의료엔 BM25 유리, 앙상블 EnsembleRetriever 가중치 0.4/0.6"

옷장 도메인에서 BM25의 가치:
- **정확한 카테고리·색 매칭**에 강함 (사용자가 "베이지 트렌치"라 하면 BM25가 정확)
- Dense는 의미는 잘 잡지만 정확한 단어 매칭에 약함

```python
from langchain.retrievers import EnsembleRetriever, BM25Retriever

# Sparse: BM25
bm25 = BM25Retriever.from_documents(wardrobe_docs)

# Dense: pgvector
dense = PgvectorRetriever(...)

# 앙상블 (사용자 학습값: 0.4/0.6)
ensemble = EnsembleRetriever(
    retrievers=[bm25, dense],
    weights=[0.4, 0.6],  # Dense 약간 우세
)

results = await ensemble.aget_relevant_documents(query, k=15)
```

#### MMR (다양성 확보)
> "꺼낸 문서들끼리 서로 다르게"

옷장 추천에서 MMR이 핵심:
```python
# ❌ 단순 Top-K — 비슷한 셔츠만 12벌 나옴
results = await retrieve(query, k=12)
# → 셔츠1, 셔츠2, 셔츠3, ... (단조)

# ✅ MMR — 다양한 카테고리 보장
results = await retrieve(query, k=12, search_type="mmr",
                          fetch_k=30, lambda_mult=0.5)
# → 셔츠, 슬랙스, 자켓, 신발, 가방 (조합 가능)
```

→ Curator가 12 옷으로 **조합** 만들려면 다양성 필수.

### 3.3 Post-Retrieval — Reranking + Compression ([7]D)

#### Cross-Encoder Reranking
> "Lost in the Middle 때문에 필요"

```python
# 1차 검색: 30개 (Recall 우선)
candidates = await retrieve(query, k=30)

# 2차 Reranking: Cross-Encoder로 정확도 (Precision 우선)
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
scores = reranker.predict([(query, doc.page_content) for doc in candidates])

# Top-5만 LLM에 전달 (LLM 컨텍스트 절약)
top5 = sorted(zip(candidates, scores), key=lambda x: -x[1])[:5]
```

→ **30 → 5 압축**으로 LLM 비용 ↓, 품질 ↑.

#### Context Compression
> "30~40% 압축까지 정확도 손실 거의 없음"

```python
from langchain.retrievers.document_compressors import LLMChainExtractor

# 각 문서에서 질문 관련 부분만 추출
compressor = LLMChainExtractor.from_llm(haiku_llm)
compressed = compressor.compress_documents(top5, query)

# 30~40% 압축 (옷 설명 중 관련 속성만)
```

→ 옷장 도메인엔 효과 작음 (옷 메타데이터는 이미 짧음). **트렌드 글 같은 긴 문서에 효과적**.

### 3.4 인덱싱 개선 ([7]A)

#### 계층적 메타데이터 (옷장 특화)
```python
metadata = {
    "user_id": ...,
    "category": "outer",                  # 최상위
    "subcategory": "trench",              # 중간
    "fine_type": "double-breasted trench", # 세부
    "tags": ["classic", "office", "fall"], # 다중 태그
    "color_palette": {                    # 색 정보
        "primary": "beige",
        "secondary": ["brown"],
        "tone": "warm",
    },
    "style_vector": [...],                # 별도 임베딩
}
```

→ **계층별 필터링** 후 벡터 검색 가능.

#### Multi-level (Small-to-Big)
```python
# Small: 옷 한 벌 (검색 단위)
# Big: 옷 + 자주 입는 조합 + 사용자 선호 (LLM 컨텍스트)

# 검색은 Small로 정확히, LLM에는 Big으로 풍부하게
matched_items = await retrieve_small(query)
for item in matched_items:
    item.context = await fetch_big_context(item.id)  # 조합·이력 추가
```

### 3.5 멀티모달 RAG ([6] 학습 적용)

> "텍스트·이미지 임베딩 사상이 달라 컬렉션 분리 1차 검토, CLIP 통합 가능"

#### 옷장 도메인 멀티모달 시나리오
1. **이미지로 옷 찾기**: "이런 사진 같은 옷 우리 옷장에 있어?"
2. **텍스트로 이미지 찾기**: "베이지 캐주얼" → 이미지 결과
3. **이미지로 코디 검색**: 핀터레스트 사진 → 비슷한 조합

#### 1단계 (이미 도입): 컬렉션 분리
```python
# items 테이블 안에 두 임베딩 분리
items.embedding = openai.text_embed(metadata_text)   # 텍스트용
items.image_embedding = clip.image_embed(image_url)  # 이미지용
```

#### 2단계: CLIP 통합 (텍스트↔이미지)
```python
# CLIP은 텍스트와 이미지를 같은 벡터 공간
clip_text_emb = clip.encode_text("베이지 트렌치 코트")
clip_image_emb = clip.encode_image(query_image)

# 텍스트로 이미지 검색, 이미지로 텍스트 검색 모두 가능
results = await pgvector.search(
    "items.image_embedding <=> $clip_text_emb",  # ★
    k=10,
)
```

#### 이미지 캡셔닝 (Vision LLM 활용)
```python
# 옷 사진 등록 시 자동 캡션 생성 → 텍스트 임베딩에도 포함
caption = await claude_vision.generate(
    image_url,
    prompt="이 옷을 한 문단으로 묘사 (색·실루엣·소재·핏·스타일)"
)
item.description = caption  # 임베딩 풍부화
```

→ **Vision LLM이 자동 캡션 → 텍스트 검색에도 강해짐**. 이게 멀티에이전트와 RAG의 자연스러운 결합.

### 3.6 2단계 RAG 워크플로우 (Advanced)

```
[사용자 질문]
     ↓
Pre-Retrieval
  ├─ Routing (의도 분기)
  ├─ Query Rewrite (HyDE)
  └─ Multi-Query (관점 분기)
     ↓
Retrieval
  ├─ Dense (pgvector cosine)
  ├─ Sparse (BM25)
  ├─ EnsembleRetriever (0.4/0.6)
  └─ MMR (다양성)
     ↓ 30 후보
Post-Retrieval
  ├─ Cross-Encoder Reranking → Top-5
  └─ Context Compression (긴 텍스트만)
     ↓ 5 정제된 문서
LLM 프롬프트에 주입 → 답 생성
```

→ **이게 production-grade RAG**. 1단계의 단순 검색에서 큰 도약.

---

## 4. 3단계 — Self-RAG + GraphRAG (Scale)

> 답변 품질·할루시네이션 완전 차단 + 관계 추론까지.

### 4.1 Self-RAG ([8] 학습 적용)

> "전문가와 초보자 차이 = 검증 단계의 유무. 답변 직전 자가 검증, 기준 미달 시 루프, 최대 3회"

#### Self-RAG 루프 (옷장 추천 적용)
```python
async def self_rag_recommend(query: str, user_id: UUID, max_retry: int = 3):
    for attempt in range(max_retry):
        # 1. 검색 필요 여부 판단 (Retrieve / No-Retrieve)
        need_retrieval = await llm.judge_retrieval_need(query)
        
        if need_retrieval:
            retrieved = await advanced_retrieve(query, user_id)
        else:
            retrieved = []
        
        # 2. 생성
        answer = await curator.generate(query, context=retrieved)
        
        # 3. 자가 검증 (0~1 점수)
        eval_scores = {
            "relevance": await llm.score_relevance(query, answer),
            "groundedness": await llm.score_groundedness(answer, retrieved),
            "wardrobe_fidelity": check_no_phantom_items(answer, user_id),
            "diversity": calc_combo_diversity(answer),
        }
        
        # 4. 통과 시 반환
        if all(s >= 0.8 for s in eval_scores.values()):
            return answer, eval_scores
        
        # 5. 실패 분석 → 쿼리 재변환 후 재시도
        query = await llm.refine_query(query, eval_scores, answer)
    
    # 최대 시도 초과 → 사람 검토 큐 + 마지막 답 반환
    await human_review_queue.add(query, last_answer=answer)
    return answer, eval_scores
```

#### 옷장 도메인에서 Self-RAG 평가 메트릭
| 메트릭 | 측정 |
|---|---|
| **Relevance** | 답이 질문에 답하는가 |
| **Groundedness** | 답이 검색된 옷에 근거 있는가 |
| **Wardrobe Fidelity** ⭐ | **없는 옷 추천 0건** (1.00 절대 목표) |
| **Diversity** | N개 조합이 너무 비슷하지 않은가 |
| **Style Coherence** | 조합이 일관된 스타일인가 |

→ **Wardrobe Fidelity가 옷장 RAG의 킬러 메트릭**. 0.99도 안 됨 — 무조건 1.00.

### 4.2 GraphRAG ([9] 학습 적용)

> "엔티티·관계 그래프, 간접 연결로 숨은 인사이트. 단 실패담 많음. 하이브리드 권장."

#### 옷장 도메인의 그래프 구조

```
[노드 타입]                 [관계 타입]
─────────────────           ─────────────────
User (사용자)               OWNS (소유)
Item (옷)                   PAIRED_WITH (코디됨)
Combo (조합)                BELONGS_TO (속함)
Style (스타일)              MATCHES (어울림)
Occasion (자리)             AVOIDS (피함)
Brand (브랜드)              SIMILAR_TO (유사)
Trend (트렌드)              INFLUENCED_BY (영향받음)

예시:
User_A --OWNS--> Trench_001 --PAIRED_WITH--> Slacks_002
                       │                            │
                  BELONGS_TO                    BELONGS_TO
                       ↓                            ↓
                  Style_classic              Style_classic
                       ↑
              INFLUENCED_BY
                       │
                 Trend_minimal_2026
```

#### GraphRAG가 옷장에서 가능한 것
1. **숨은 조합 발견**: "User_A가 가진 트렌치 + 비슷한 스타일 슬랙스 = 추천"
2. **트렌드-옷 연결**: "최근 트렌드 X → 사용자 옷장에서 매칭되는 옷"
3. **사용자 선호 추론**: "친구들이 좋아한 조합 → 사용자도 좋아할 가능성"

#### 사용자 학습대로 — 하이브리드 적용
> "큰 검색은 그래프, 좁혀진 후 디테일은 전통 RAG"

```python
async def hybrid_rag_recommend(query: str, user_id: UUID):
    # 1. GraphRAG로 큰 그림 — 관련 스타일·트렌드·자리 파악
    graph_context = await graphrag.query(
        f"{query}와 관련된 스타일·트렌드 노드들",
        depth=2,  # 2-hop 관계까지
    )
    # 결과: ["classic", "minimal", "office-casual"] 같은 컨셉
    
    # 2. 전통 RAG로 디테일 — 위 컨셉에 맞는 사용자 실제 옷
    candidates = await advanced_retrieve(
        query=f"{query} {' '.join(graph_context)}",
        user_id=user_id,
        k=12,
    )
    
    # 3. Curator에 둘 다 전달
    return await curator.generate(
        query=query,
        graph_insights=graph_context,
        wardrobe_items=candidates,
    )
```

#### 도구 선택 ([9] 학습)
> "MS GraphRAG 추천 (LLM API 연결 시 변환·시각화까지 통합)"

- **3단계 도입 시 MS GraphRAG 우선 검토**
- Neo4j (전통적 그래프 DB) vs MS GraphRAG (LLM 기반 자동 구축)
- 옷장 데이터는 LLM 자동 구축이 효과적 (구조 패턴이 다양)

#### 의도적 제약 (사용자 학습 따라)
> "실패담 많으며, 처음부터 그래프만 쓰면 위험"

- 3단계까지 GraphRAG 도입 보류
- 2단계까지는 전통 RAG로 검증
- 3단계 진입 시점에 **PoC 2주** 권장 (실패 시 보류)

---

## 5. 옷장 도메인 RAG 사례 분석

### 5.1 사례 ① — 사용자 옷장 검색 (가장 빈번, 1단계 핵심)

```
사용자: "오늘 비 오는 날 면접 룩"
       ↓
[1단계 RAG]
  - 그대로 임베딩 → pgvector cosine → Top-12 옷
  → 결과 OK지만 "면접용" 정확히 매칭 못할 수 있음

[2단계 RAG]
  - Query Rewrite: "격식, 단정, 무채색, 비 대비 (트렌치·신발)"
  - Routing: 옷장 인덱스 + 최근 입은 옷 인덱스 분기
  - Ensemble: BM25 (정확 카테고리) + Dense (의미)
  - MMR: 셔츠·하의·아우터·신발 다양
  - Reranking: Cross-Encoder로 Top-5
  → 더 정확한 면접·비 대응 옷

[3단계 RAG]
  - GraphRAG: "면접 → formal → classic → trench·slacks" 컨셉 추출
  - + 전통 RAG로 디테일
  - Self-RAG 자가 검증 (Wardrobe Fidelity 1.00 보장)
  → Production-grade
```

### 5.2 사례 ② — 트렌드 검색 (2단계+)

```
트렌드 글 크롤링 (Musinsa·인스타그램)
       ↓
RecursiveCharacterTextSplitter (chunk 512, overlap 64)
       ↓
임베딩 → 별도 trend_index 컬렉션
       ↓
주간 cron으로 인덱스 업데이트
       ↓
사용자 추천 시:
  Routing → wardrobe_index + trend_index 둘 다
  Ensemble로 합치고 MMR로 다양화
  → "최근 트렌드 + 내 옷장" 융합 추천
```

### 5.3 사례 ③ — 멀티모달 검색 (2단계+)

```
사용자: 핀터레스트 사진 1장 업로드 + "이런 룩 우리 옷장으로 따라하기"
       ↓
CLIP 이미지 임베딩
       ↓
items.image_embedding <=> CLIP_query (cosine)
       ↓
Top-10 시각적으로 유사한 옷
       ↓
+ 텍스트 RAG로 보강 (Vision LLM 캡셔닝 → 텍스트 검색 병행)
       ↓
Curator: "참고 사진 X + 사용자 옷장의 Y → 이렇게 따라하기"
```

### 5.4 사례 ④ — 추천 이력 검색 (개인화·1단계)

```
사용자가 받은 추천 N개 → 추천 이력 인덱스 저장
       ↓
새 추천 생성 시:
  최근 30일 추천 이력 검색 → 비슷한 것 제외 (다양성)
  사용자 "좋아요" 신호 강한 조합 → 비슷한 패턴 강화
```

→ **이력 RAG가 개인화의 핵심**. Memory 모듈과 결합.

---

## 6. 평가 (RAG 한정)

### Retrieval 메트릭 (Ragas 활용)
| 메트릭 | 측정 | 목표 |
|---|---|---|
| **Context Precision** | 검색 결과 중 관련 비율 | > 0.80 |
| **Context Recall** | 정답에 필요한 정보 검색율 | > 0.85 |
| **Context Relevance** | 검색 결과 적절성 | > 0.85 |

### 옷장 도메인 자체 메트릭
| 메트릭 | 측정 | 목표 |
|---|---|---|
| **Wardrobe Fidelity** | 추천에 없는 옷 0건 | **1.00 (절대)** |
| **Combo Diversity** | 추천 N개 중복도 | > 0.70 |
| **Style Coherence** | 조합 일관성 | > 0.80 |
| **Latency p95** | 검색 응답 시간 | < 200ms |

### 평가 방법
- **Offline**: Ragas + 100~500 라벨링 샘플
- **Online**: 운영 trace에서 10% 샘플링 → Langfuse score attach
- **Critic**: 매 답변마다 자가 검증 (Wardrobe Fidelity는 deterministic 100%)

---

## 7. 비용·성능

### 1단계 (1,000명 / 옷 10,000장)
| 항목 | 비용 |
|---|---|
| 임베딩 텍스트 (OpenAI 3-small) | ~₩50,000/월 |
| 임베딩 이미지 (CLIP, 자체 또는 OpenAI) | ~₩100,000/월 |
| pgvector (Supabase 포함) | $0 |
| **합계** | **~₩150,000/월** |

### 2단계 (10,000명 / 옷 200,000장)
| 항목 | 비용 |
|---|---|
| 임베딩 텍스트·이미지 | ~₩2M/월 |
| Reranking (Cross-Encoder, 자체 호스팅) | ~₩300K/월 (GPU) |
| Query Rewrite·HyDE LLM (Haiku) | ~₩500K/월 |
| pgvector → Qdrant 이전 검토 | ~$50/월 |
| **합계** | **~₩3M/월** |

### 3단계 (1M+)
| 항목 | 비용 |
|---|---|
| 임베딩 자체 모델 (오픈소스) | GPU 비용으로 전환 |
| GraphRAG (MS) | ~$500/월 |
| 자체 Qdrant 클러스터 | ~$1,000/월 |
| Self-RAG 추가 LLM 호출 | ~₩5M/월 |
| **합계** | **~₩15M/월** |

---

## 8. 안티패턴 (사용자 학습 반영 + 옷장 특화)

| 안티패턴 | 왜 피하나 | 옷장 관점 |
|---|---|---|
| **SemanticChunker 1단계 도입** | 사용자 학습: "비용·시간 부담, 실무 사용 빈도 낮음" | 옷장은 청크 단위 명확 → 불필요 |
| **모든 작업에 HyDE** | 비용 폭증 | 단순 검색엔 과함, 복잡한 질문에만 |
| **GraphRAG 1·2단계 도입** | 사용자 학습: "실패담 많음" | 옷장 데이터 변환 손실 위험 |
| **Sparse 무시** | "팩트 체킹엔 BM25 유리" | "베이지 트렌치" 정확 매칭엔 BM25가 더 좋음 |
| **Reranking 1단계 도입** | 1단계엔 Top-12로 충분 | 2단계 사용자 증가 시 도입 |
| **user_id 격리 누락** | **다른 사용자 옷 노출 = 서비스 사망** | 1단계부터 무조건 격리 |
| **임베딩 모델 무계획 변경** | 기존 데이터 재인덱싱 필요 | metadata에 `embedding_model` 버전 추적 |
| **Self-RAG 1단계 도입** | LLM 비용 N배 증가 | Critic으로 1단계는 충분 |

---

## 9. 단계별 RAG 결정 매트릭스 요약

```
                1단계 (MVP)            2단계 (Growth)           3단계 (Scale)
─────────────────────────────────────────────────────────────────────────────
인덱싱          item → Document         + 계층 메타데이터        + GraphRAG 노드/관계
                pgvector                + Multi-level            
청킹            (옷 1벌 = 1 청크)        Recursive (트렌드용)     계층적 청킹
임베딩          OpenAI 3-small + CLIP    + 자체 호스팅 검토       자체 fine-tuned
벡터 DB         pgvector                pgvector → Qdrant 검토   Qdrant 클러스터
Pre-Retrieval   (없음 — 그대로 사용)     Query Rewrite, HyDE,     + 동적 Multi-Query
                                       Multi-Query, Routing      자가 학습 최적화
Retrieval       Dense only (cosine)     Ensemble (BM25+Dense)    + GraphRAG 하이브리드
                                       + MMR
Post-Retrieval  (없음)                  Cross-Encoder Reranking  + 컨텍스트 동적 압축
                                       + Compression (long doc)
멀티모달        컬렉션 분리              CLIP 통합 검색           이미지·텍스트·관계 통합
                Vision LLM 캡셔닝       (texts↔images)
검증            Critic 1회               + Ragas 자동 평가         Self-RAG 루프 (최대 3회)
                Wardrobe Fidelity        + Langfuse 모니터링       모든 답변 자가 검증
비용/월         ~₩150K                  ~₩3M                     ~₩15M
응답 시간 p95   ~300ms                   ~500ms                    ~800ms (품질 우선)
```

---

## 10. 결정 트리 — "내 옷장 서비스에 어떤 RAG 기술을 언제 도입?"

### 1단계 → 2단계 진입 트리거
- [ ] 사용자가 "검색이 부정확하다" 신호 30% 이상
- [ ] Critic 통과율 < 85%
- [ ] 사용자 수 1,000+ (RAG 비용 증가 감당)
- [ ] 외부 데이터(트렌드·시세) 도입 결정

### 2단계 → 3단계 진입 트리거
- [ ] Wardrobe Fidelity < 1.00 사고 발생 (Self-RAG 즉시 도입)
- [ ] 추천 다양성·창의성 한계 (GraphRAG PoC)
- [ ] LLM 비용 월 ₩5M+ (자체 모델 검토)
- [ ] B2B 파트너 요구 (관계 추론 필요)

---

## 11. 관련 문서

- [mvp-roadmap.md](./mvp-roadmap.md) — 전체 단계별 로드맵 (RAG 포함)
- [multi-agent-design.md](./multi-agent-design.md) — Phase 1 멀티에이전트 (RAG가 Curator의 도구)
- [architecture.md](../architecture.md) — 전체 시스템

---

## 12. 핵심 요약 (한 페이지)

### 9가지 RAG 개념 → 옷장 적용 한 줄
1. **RAG 기본·필요성** → 옷장은 100% 폐쇄 도메인, RAG 필수
2. **인덱싱** → item → Document 변환, user_id 격리 메타데이터 필수
3. **청킹** → 옷 1벌 = 1청크 (단순), 트렌드 글은 Recursive
4. **임베딩** → OpenAI text + CLIP image, pgvector
5. **리트리벌** → 1단계 Dense, 2단계 Ensemble (BM25+Dense)
6. **멀티모달** → 컬렉션 분리 (1단계) → CLIP 통합 (2단계)
7. **Advanced RAG** → Query Rewrite·MMR·Reranking (2단계 핵심)
8. **Self-RAG** → 자가 검증 + Wardrobe Fidelity 1.00 (3단계)
9. **GraphRAG** → 옷-스타일-트렌드 관계 추론 (3단계, 하이브리드)

### 단계별 핵심 결정
- **1단계**: Dense + pgvector + Critic. 단순하게.
- **2단계**: Pre·Post-Retrieval 강화 + 멀티모달 통합.
- **3단계**: Self-RAG + GraphRAG 하이브리드.

### 절대 원칙
- **user_id 격리 100%** (1단계부터)
- **Wardrobe Fidelity = 1.00** (없는 옷 추천 절대 X)
- **단계별 트리거 기반 도입** (over-engineering 회피)

---

**문서 버전**: v0.1 (2026-06-12 초안 — 사용자 학습 노트 반영)
