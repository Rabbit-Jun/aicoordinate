# Phase 1 — 옷 등록 멀티에이전트 시스템 설계

> AI Coordinate **Phase 1 백엔드 핵심 워크플로우**. 사용자가 옷 사진 1장을 업로드하면 6+개 에이전트가 자동 분업해 등록·태깅·중복 검증·조합 예측까지 처리한다. 챗봇 UI 없이 백엔드 자동화로 동작.
>
> 본 문서는 [architecture.md](../architecture.md)의 **§3.2 (Wardrobe Service) + §3.3 (Coordi Service)** 구간을 멀티에이전트 패턴으로 재설계한 청사진이다. 구현 전 합의용.

## 0. 왜 멀티에이전트인가

### 단일 LLM 호출의 한계
"옷 1장을 등록하면 끝"이 아니다. 옷 1장 등록은 실제로는:
- 옷인지 아닌지 판별 (Phase 1은 옷만, 신발·가방은 Phase 2)
- 카테고리/색/소재/스타일 태깅
- 옷장에 이미 비슷한 옷이 있는지 검사
- 이 옷으로 만들 수 있는 신규 조합 미리 계산
- 부분 실패 허용 (태깅 실패해도 등록은 성공해야)

→ 한 번의 거대 프롬프트로 처리 시: 디버깅 불가, 부분 재시도 불가, 도메인 특화 어려움, 비용 최적화 불가.

### 멀티에이전트의 가치
| 가치 | 어떻게 |
|---|---|
| **분업** | 각 에이전트가 1가지만 잘함 → 프롬프트가 짧고 정확 |
| **병렬** | 독립 작업은 동시 실행 → 사용자 대기 시간 단축 |
| **품질** | Critic agent가 결과 거부 → 자동 재시도로 정확도 ↑ |
| **비용** | 단순 작업은 Haiku, 복잡 작업만 Sonnet → 호출당 비용 ↓ |
| **운영** | 단계별 로깅 → 어디서 실패했는지 즉시 진단 |

## 1. 전체 아키텍처

```
[사용자] 옷 사진 1장 업로드 (POST /api/wardrobe/items)
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ Orchestrator (FastAPI handler + Celery task)                  │
│ - 사용자 ID, 사진 URL 입력                                     │
│ - 결과 누적 + 다음 단계 동적 결정                              │
└──────────────────────────────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 1 — Vision Agent (Claude Haiku Vision)                   │
│ "이 사진이 옷인가? clothing / non_clothing"                    │
└──────────────────────────────────────────────────────────────┘
   │
   ▼ 단순 분기 (Phase 1)
   ├──────────────────────────┬──────────────────────────┐
   ▼                          ▼                          ▼
[Clothing Specialist]   [Failure Handler]      (Phase 2 추가 예정:
   │                    (사용자에 옷 사진          Footwear/Bag/
   │                     재업로드 요청)            Accessory Specialist
   │                                              + 동적 라우팅)
   ▼
┌──────────────────────────────────────────┐
│ STEP 2 — Tagger + Critic 루프 (팁 2)      │
│  Tagger → Critic → (불일치) Re-Tagger ×2  │
└──────────────────────────────────────────┘
                      │
                      ├────────────────────┐
                      ▼ (병렬)             ▼ (병렬)
   ┌──────────────────────┐   ┌──────────────────────────────┐
   │ STEP 3 — Duplicate    │   │ STEP 4 — Combo 협업 (팁 1)    │
   │ Detector              │   │  Style Theorist + Color      │
   │ (Embedding + pgvector)│   │  Matcher + Occasion Tagger   │
   │                       │   │  → Curator Aggregator        │
   └──────────────────────┘   └──────────────────────────────┘
                      │                    │
                      └──────────┬─────────┘
                                 ▼
   ┌──────────────────────────────────────────────────────────┐
   │ STEP 5 — Persist + Notify                                 │
   │  - Postgres INSERT (items + item_tags + new_combos)       │
   │  - Push: "등록 완료! 새 조합 N개 발견"                     │
   └──────────────────────────────────────────────────────────┘
```

## 2. 에이전트 카탈로그

> **Phase 1은 옷(clothing)만 처리**. 신발·가방·액세서리는 Phase 2로.

### Phase 1 에이전트 (10개)

| # | 에이전트 | 모델 | 책임 | 도구 (tool_use) |
|---|---|---|---|---|
| 1 | **Orchestrator** | (no LLM) | 전체 라우팅·상태 누적·재시도 | 없음 (오케스트레이션만) |
| 2 | **Vision Agent** | Haiku Vision | 사진 1장 → `{type: "clothing"\|"non_clothing", confidence}` | `analyze_image(url)` |
| 3 | **Clothing Specialist** | Sonnet Vision | 옷 카테고리/스타일 1차 태깅 | `analyze_image`, `lookup_taxonomy` |
| 4 | **Critic** | Haiku | Specialist 결과 vs 원본 이미지 일관성 검증 | `analyze_image`, 받은 태그 비교 |
| 5 | **Re-Tagger** | Sonnet Vision | Critic 거부 시 재태깅 (다른 프롬프트) | 동일 |
| 6 | **Duplicate Detector** | (no LLM) | 임베딩 후 pgvector 검색으로 중복 후보 | `embed_image`, `vector_search` |
| 7 | **Style Theorist** | Sonnet | "이 옷의 스타일 정체성" (캐주얼/포멀/스트릿) | `get_user_style_profile` |
| 8 | **Color Matcher** | Haiku | 옷장 색조와의 조화 | `query_wardrobe_colors` |
| 9 | **Occasion Tagger** | Haiku | "이 조합 어떤 자리에 어울리나" | `query_occasion_taxonomy` |
| 10 | **Curator** | Sonnet | 3 의견 합의 → Top-N 조합 확정 | `save_combo_predictions` |

### Phase 2 추가 에이전트 (도메인 확장)

| # | 에이전트 | 추가 시점 |
|---|---|---|
| P2-1 | **Footwear Specialist** (신발: 굽 높이·발끝 모양) | Phase 2 |
| P2-2 | **Bag Specialist** (가방: 사이즈·용도·소재) | Phase 2 |
| P2-3 | **Accessory Specialist** (액세서리) | Phase 2 |

→ Phase 1 검증 후 옷장 만족도가 충분하면 Phase 2로 도메인 확장.

> **에이전트 = LLM 호출 + 도구 세트 + 시스템 프롬프트**. Orchestrator/Duplicate Detector는 LLM 없는 deterministic 모듈이지만, 같은 인터페이스로 호출되므로 에이전트 풀에 포함.

## 3. 워크플로우 상세

### 3.1 입력 게이트 (Orchestrator)
```python
async def handle_upload(user_id: UUID, image_url: str) -> Result:
    state = WorkflowState(user_id=user_id, image_url=image_url)

    # STEP 1
    vision_result = await vision_agent.run(state)
    state.vision = vision_result

    if vision_result.type == "unknown" or vision_result.confidence < 0.6:
        return FailureResult("재업로드 필요")

    # STEP 2 (동적 라우팅 - 팁 3)
    specialist = ROUTING_TABLE[vision_result.type]
    tagged = await with_critic_loop(specialist, state, max_retries=2)
    state.tags = tagged

    # STEP 3 + 4 병렬
    duplicate, combos = await asyncio.gather(
        duplicate_detector.run(state),
        run_combo_collaboration(state),
    )
    state.duplicate = duplicate
    state.combos = combos

    # STEP 5
    return await persist_and_notify(state)
```

### 3.2 단순 분기 (Phase 1) → 동적 라우팅 (Phase 2)

**Phase 1 — 단순 분기**:
```python
# Phase 1: clothing만 처리
if vision_result.type == "clothing":
    tagged = await with_critic_loop(clothing_specialist, state)
else:
    return FailureResult("옷 사진을 업로드해주세요")
```

**Phase 2 — 동적 라우팅 (도메인 확장 시)**:
```python
# Phase 2: 신발·가방·액세서리 도메인 추가
ROUTING_TABLE: dict[str, Agent] = {
    "clothing": clothing_specialist,
    "footwear": footwear_specialist,  # ← Phase 2 추가
    "bag": bag_specialist,             # ← Phase 2 추가
    "accessory": accessory_specialist, # ← Phase 2 추가
}
specialist = ROUTING_TABLE[vision_result.type]
tagged = await with_critic_loop(specialist, state)
```

**왜 Phase 2로 미루는가**: Phase 1은 옷장 가치 검증이 최우선. 신발·가방까지 같이 만들면 출시 지연. 옷만으로 가치 검증 후 도메인 확장.

**Phase 2에서 왜 중요한가**: 옷 vs 신발 vs 가방은 태그 스키마가 다르다. 단일 거대 프롬프트로 처리 시 신발의 굽 높이 같은 도메인 디테일을 놓침. Specialist가 각자 도메인 taxonomy를 갖고 짧은 프롬프트로 정확하게 태깅.

### 3.3 Critic 루프 (팁 2)
```python
async def with_critic_loop(
    specialist: Agent, state: WorkflowState, max_retries: int = 2
) -> Tags:
    tags = await specialist.run(state)
    for attempt in range(max_retries):
        verdict = await critic.evaluate(image_url=state.image_url, tags=tags)
        if verdict.ok:
            return tags
        # Critic이 어디가 틀렸는지 알려주면 그 피드백을 다음 프롬프트에 주입
        tags = await re_tagger.run(
            state, prior_tags=tags, critic_feedback=verdict.reason
        )
    # 2회 재시도 실패 → 사람 검토 큐로
    await human_review_queue.enqueue(state, last_tags=tags)
    return tags  # 일단 저장 (사람 검토 후 수정 예정)
```

**Critic 프롬프트 예시**:
```
원본 이미지 + Tagger가 매긴 태그:
{category: "casual_shirt", color: "beige", material: "cotton"}

다음을 확인하라:
1. 이미지에 실제로 보이는 옷과 카테고리가 일치하는가?
2. 색상이 정확한가?
3. 소재 추정이 합리적인가?

JSON으로 답: {ok: bool, reason: string | null, suggested_fixes: object | null}
```

**왜 중요한가**: Vision API는 가끔 격식 셔츠를 캐주얼로 잘못 분류한다. 단일 호출이면 그대로 저장. Critic이 거부하면 "Tagger야, 너 격식인지 캐주얼인지 다시 봐"라는 피드백 받아 재시도. **Reflection 루프 = 멀티에이전트의 진짜 가치**.

### 3.4 Combo 협업 (팁 1)
```python
async def run_combo_collaboration(state: WorkflowState) -> list[Combo]:
    # 3 전문가가 병렬로 의견 생성
    style_opinion, color_opinion, occasion_opinion = await asyncio.gather(
        style_theorist.run(state),       # "트렌치 + 슬랙스 = 미니멀 캐주얼 격식"
        color_matcher.run(state),         # "옷장 무채색 70%와 매칭, 베이지 강조 가능"
        occasion_tagger.run(state),       # "오피스 / 카페 / 데이트"
    )

    # Curator가 3 의견을 받아 Top-N 조합 합의
    combos = await curator.run(
        state=state,
        style=style_opinion,
        color=color_opinion,
        occasion=occasion_opinion,
        top_n=10,
    )
    return combos
```

**Curator 프롬프트 예시**:
```
당신은 3명의 스타일리스트 의견을 받아 최종 추천 조합을 만드는 큐레이터다.

옷장 보유 옷: [...]
신규 등록 옷: 트렌치 코트 (베이지)

전문가 1 (Style): "트렌치는 오버사이즈가 트렌드. 슬림 핏 슬랙스와 매칭 추천."
전문가 2 (Color): "옷장의 네이비/그레이/화이트와 조화. 블랙은 무거움."
전문가 3 (Occasion): "비즈니스 캐주얼·주말 카페·가벼운 데이트"

위 3 의견을 종합해, 보유 옷장 안에서만 만들 수 있는 신규 조합 10개를 score 순으로 반환.
각 조합에 어떤 전문가 의견을 반영했는지 명시.
```

**왜 중요한가**: 한 에이전트가 모든 관점을 다 들면 프롬프트가 비대해지고 출력 품질이 떨어진다. **각 전문가가 자기 관점에만 집중 → Curator가 합의**. 실제 인간 스타일링 팀의 작업 방식과 동일.

### 3.5 Duplicate Detector (병렬)
- LLM 없음 — 이미지 임베딩 후 pgvector cosine similarity
- 결과: `{has_duplicate: bool, similar_items: [item_id], similarity: 0.0~1.0}`
- 0.85 이상 → "이 옷 이미 등록되어 있어요. 정말 추가하시겠어요?" 모달

### 3.6 Persist + Notify
```python
async def persist_and_notify(state: WorkflowState) -> Result:
    async with db.transaction():
        item_id = await db.items.insert({
            "user_id": state.user_id,
            "image_url": state.image_url,
            "type": state.vision.type,
            "embedding": state.embedding,
        })
        await db.item_tags.insert_many(state.tags.to_rows(item_id))
        await db.combo_predictions.insert_many(
            [c.to_row(item_id) for c in state.combos]
        )

    await push_service.send(
        state.user_id,
        f"등록 완료! {state.tags.category} 추가 + 새 조합 {len(state.combos)}개 발견"
    )
    return SuccessResult(item_id=item_id, new_combos=len(state.combos))
```

## 4. 데이터 흐름 (State 객체)

```python
@dataclass
class WorkflowState:
    # 입력
    user_id: UUID
    image_url: str

    # 단계별 누적
    vision: VisionResult | None = None       # STEP 1
    tags: Tags | None = None                 # STEP 2 (Critic 통과 후)
    embedding: list[float] | None = None     # STEP 3 산물
    duplicate: DuplicateResult | None = None # STEP 3
    combos: list[Combo] | None = None        # STEP 4

    # 메타
    started_at: datetime
    agent_logs: list[AgentLog] = field(default_factory=list)
    # 각 단계 실행 시간·토큰 수·실패 횟수 누적 (모니터링용)
```

**모든 에이전트는 State를 읽고, 자기 결과를 State에 덧붙인다.** 함수형 — 에이전트는 stateless, State는 worker task 안에서만 살아있음.

## 5. 도구 (Tools) 명세

Claude Agent SDK 또는 Anthropic SDK의 tool_use API로 정의:

```python
TOOLS = {
    "analyze_image": {
        "input": {"url": "string"},
        "output": {"description": "string", "objects": "list"},
        "impl": lambda url: claude_vision_call(url),
    },
    "lookup_taxonomy": {
        "input": {"domain": "clothing"},  # Phase 2부터 "footwear"|"bag"|"accessory" 추가
        "output": {"valid_tags": "object"},
        "impl": lambda domain: TAXONOMY[domain],
    },
    "embed_image": {
        "input": {"url": "string"},
        "output": {"vector": "list[float]"},
        "impl": lambda url: openai_clip_embed(url),
    },
    "vector_search": {
        "input": {"user_id": "uuid", "vector": "list[float]", "top_k": "int"},
        "output": {"matches": "list"},
        "impl": lambda *a: pgvector_search(*a),
    },
    "query_wardrobe_colors": {
        "input": {"user_id": "uuid"},
        "output": {"color_distribution": "object"},
        "impl": lambda uid: db.query(...),
    },
    # ... 등
}
```

## 6. 모델 선택 / 비용

| 에이전트 | 모델 | 호출당 비용 (추정) | 이유 |
|---|---|---|---|
| Vision (분류) | Haiku Vision | ₩15 | 단순 분류만, 정확도 충분 |
| Specialist (태깅) | Sonnet Vision | ₩80 | 복잡한 태그 스키마, Vision 정확도 필요 |
| Critic | Haiku | ₩10 | 가벼운 검증 |
| Re-Tagger | Sonnet Vision | ₩80 | 재시도는 가장 정확한 모델로 |
| Style Theorist | Sonnet | ₩50 | 추론 깊이 필요 |
| Color Matcher | Haiku | ₩10 | 색 분류는 단순 |
| Occasion Tagger | Haiku | ₩10 | 분류 작업 |
| Curator | Sonnet | ₩70 | 합의가 핵심 |
| Duplicate Detector | — | ₩2 | OpenAI CLIP 임베딩 + pgvector |

**옷 1장 등록 평균 비용** (재시도 0회 기준): ₩15 + ₩80 + ₩10 + ₩2 + (₩50+₩10+₩10+₩70) = **약 ₩247/장**
- 재시도 1회 발생 시: +₩90 (Critic + Re-Tagger)
- 사용자당 평균 20벌 등록 시: ₩5,000 ± ₩2,000

> [architecture.md §3.2](../architecture.md#L113)의 "Claude Vision 1회 호출 50~100원" 추정 대비 약 3배. 멀티에이전트화 비용 트레이드오프. Critic 루프로 정확도 ↑ + 사용자 만족도 ↑로 정당화 가능.

### 비용 절감 옵션
- **캐싱**: 같은 이미지 URL 재처리 방지 (Redis)
- **배칭**: 같은 사용자의 여러 옷 동시 업로드 시 Curator만 1번 호출
- **Skip 정책**: Duplicate가 0.95+ 발견 시 STEP 2~4 스킵 (이미 등록된 옷)
- **신뢰 점수 기반 Critic 스킵**: Vision confidence 0.95+ 시 Critic 생략

## 7. 에러 처리·재시도

| 실패 지점 | 정책 |
|---|---|
| Vision Agent 타임아웃 | 1회 재시도 → 실패 시 사용자에게 "이미지를 다시 업로드해주세요" |
| Specialist API 에러 | 1회 재시도 → 실패 시 태그 없이 등록 (사용자가 수동 태깅 가능) |
| Critic 2회 거부 | human_review_queue 적재 + 잠정 태그로 등록 (관리자가 후속 수정) |
| Duplicate Detector 실패 | 무시하고 등록 진행 (중복 검사는 nice-to-have) |
| Combo 협업 부분 실패 | 성공한 에이전트 의견만으로 Curator 호출 (예: Style 실패 → Color+Occasion만) |
| Persist DB 에러 | 전체 트랜잭션 롤백 + Celery retry (지수 백오프) |

**원칙**: 사용자에게 가장 중요한 건 "옷 등록 성공". 부가 기능(태깅·조합)은 부분 실패 허용. **Graceful degradation**.

## 8. 모니터링·로깅

```python
@dataclass
class AgentLog:
    agent_name: str
    started_at: datetime
    duration_ms: int
    input_tokens: int
    output_tokens: int
    cost_krw: float
    success: bool
    error: str | None
    retry_count: int
```

**State에 누적 → 워크플로우 종료 시 한 번에 DB(`workflow_runs` 테이블) + 외부 모니터링(Datadog/Sentry) 발사**.

### 대시보드 KPI
- 평균 워크플로우 처리 시간 (목표: < 8초)
- Critic 재시도율 (목표: < 15%)
- Specialist별 실패율
- 옷 1장당 평균 비용
- human_review_queue 누적량

## 9. 구현 단계 (4주 로드맵)

### Week 1 — 골격 + Sequential 파이프라인
- [ ] Orchestrator + State 정의
- [ ] Vision Agent + Clothing Specialist (Footwear/Bag/Accessory는 Phase 2로 분리)
- [ ] Persist + Notify
- [ ] **체크포인트**: 옷 사진 1장 → DB에 태그까지 저장 성공

### Week 2 — Critic 루프 (팁 2)
- [ ] Critic 에이전트 + Re-Tagger
- [ ] human_review_queue
- [ ] 재시도 로직
- [ ] **체크포인트**: 의도적으로 잘못된 태그 주입 시 Critic이 거부 후 재태깅 성공

### Week 3 — Combo 협업 (팁 1) + 병렬화
- [ ] Style Theorist, Color Matcher, Occasion Tagger
- [ ] Curator
- [ ] STEP 3 + 4 병렬화 (asyncio.gather)
- [ ] **체크포인트**: 옷 1장 등록 시 신규 조합 10개 자동 생성

### Week 4 — 모니터링 + 비용 절감
- [ ] AgentLog 적재 + 대시보드
- [ ] 비용 절감 옵션 (캐싱·Skip)
- [ ] human_review_queue 운영 UI
- [ ] 통합 테스트 (옷 100장 시나리오)
- [ ] **체크포인트**: 1단계 출시 가능 상태 (옷 등록 + 추천 + 합성)

> **Phase 2로 미룬 작업**: Footwear/Bag/Accessory Specialist + 동적 라우팅 (옷장 검증 후 도메인 확장)

## 10. 향후 확장 (Phase 2+)

### 이 시스템에 자연스럽게 추가 가능
| 확장 | 어떻게 |
|---|---|
| **시나리오 B (매일 새벽 코디 생성)** | Combo 협업 모듈을 cron task에서 재사용. Style/Color/Occasion + Weather Agent 추가 |
| **챗봇 인터페이스** | 같은 에이전트 풀에 Conversation Agent만 추가, tool로 기존 에이전트 호출 |
| **A/B 추천 알고리즘 비교** | Curator를 여러 변종으로 실행 → 사용자 행동으로 winner 선정 |
| **사용자 피드백 학습** | "이 조합 별로" 신호 → Style Theorist 프롬프트에 사용자별 선호 주입 |

### 의도적으로 제외 (Phase 1 범위 밖)
- 자체 모델 fine-tuning
- 멀티턴 대화 컨텍스트 관리
- 실시간 스트리밍 응답 (백그라운드 작업이므로 불필요)

## 11. 핵심 학습 포인트 (포트폴리오 관점)

이 시스템을 만들면 다음을 **실서비스 운영 수준**으로 경험:

| 패턴 | 어디서 |
|---|---|
| Tool use / function calling | 모든 LLM 에이전트 |
| Sequential pipeline | STEP 1 → 2 → 5 |
| Parallel fan-out/in | STEP 3 ∥ STEP 4 |
| Dynamic routing | Vision → Specialist 분기 |
| Reflection / Critic loop | Tagger ↔ Critic |
| Agent collaboration + aggregation | Style/Color/Occasion → Curator |
| Graceful degradation | 부분 실패 허용 정책 |
| 비용 최적화 | Haiku/Sonnet 혼용, 캐싱, Skip |
| 모니터링·디버깅 | AgentLog 누적 + 대시보드 |

→ "옷 등록 1회에 6+개 에이전트가 자동 분업하는 백엔드를 설계·운영·튜닝했다"는 강력한 임팩트. **챗봇 없이도 멀티에이전트 풀세트.**

## 12. 결정 사항 / 미정 사항

### 결정됨
- 챗봇 UI 없음. 백엔드 자동화로 동작.
- Claude API 우선 (Anthropic SDK 또는 Claude Agent SDK 둘 다 검토 가능).
- 임베딩은 OpenAI CLIP 또는 Cohere Embed (pgvector와 호환되는 것 중 선택).
- DB는 architecture.md 그대로 Postgres + pgvector 확장.

### 미정 (Phase 1 착수 시 결정)
- [ ] Claude Agent SDK vs Anthropic SDK 직접 호출 → 첫 주 PoC로 결정
- [x] ~~Footwear/Bag/Accessory Specialist를 Phase 1에 모두 만들지~~ → **Phase 2로 결정** (옷만 먼저 출시)
- [ ] human_review_queue를 사람이 직접 보는 UI까지 만들지, Slack 알림만으로 갈지
- [ ] 비용 ₩247/장 → 무료 등록 횟수 제한 정책 (가입 시 N장 무료 → 이후 결제)

---

**문서 버전**: v0.1 (2026-06-08 초안)
**관련 문서**: [architecture.md](../architecture.md), [CLAUDE.md](../CLAUDE.md)
