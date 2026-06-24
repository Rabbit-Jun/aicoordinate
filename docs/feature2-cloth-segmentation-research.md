# 기능 2 조사 — 사진에서 상의/하의 식별 + 누끼(배경 제거) 추출 가능성

> **조사 범위(이 문서 한정)**: "착장(사람이 옷을 입은) 사진 → 상의/하의(및 아우터)를 구별하고, 각 옷을 배경·인물 없이(누끼) 추출할 수 있는가"
> **목적**: 구현 전 기술 가능성 판단(PoC 후보 선별). 구현 공수·비용·정확도 실측은 범위 밖.
> 조사 기준일: 2026-06-23. 출처는 벤더/프로젝트 공식 1차 문서. ✅ 가능 / △ 조건부 / ❌ 불가.
>
> **v2 (2026-06-23)**: 적대적 검증(inspector) 반영 — ① Gemini 다중 의류 인스턴스 분리 △ 강등, ② rembg 1순위에 "아우터 불필요" 조건 명시, ③ 누끼 합성 단계 "표준 기법·출처 미확인" 분리, ④ 휴먼파싱(SCHP/segformer) 경로 편입. SCHP-LIP만 아우터(Coat) 별도 분리됨을 1차 출처로 확인.

## 결론 요약

> **✅ 가능하다.** 능력을 (A)옷 식별/분류 → (B)픽셀 마스크 생성 → (C)누끼 후처리로 분해하면 각 단계가 공식 문서로 확인되고, **학습(파인튜닝) 없이도** 되는 경로가 여럿이다. 다만 **"아우터를 상의와 별도로 구별"이 요구냐**에 따라 1순위가 갈린다.
> - **아우터 구별 불필요** → **rembg `u2net_cloth_seg`**(상/하/전신 3분류, 무학습·경량)가 최경량 1순위.
> - **아우터까지 무학습으로 구별** → **SCHP(LIP 20클래스)** 휴먼파싱이 유력(`Upper-clothes`·`Coat` 별도 라벨, 사전학습 제공).
> - **자연어 라벨·API 한 방** → **Gemini 2.5**(검출+마스크, 무학습). 단 한 인물에 겹쳐 입은 옷을 *각각 독립 인스턴스로 분리*한다는 보장은 공식 문서에 없음(△).
> - **정밀 인스턴스·통제력 최상** → **YOLO-seg + DeepFashion2**(학습 필요).

핵심 개념 정리:
- **인스턴스 세그멘테이션**: 객체를 박스가 아닌 픽셀 마스크 단위로, **개체별로** 분리(같은 종류 2벌도 구분). 누끼의 기반.
- **시맨틱(휴먼) 파싱**: 픽셀을 **클래스별로**(upper/pants/coat…) 분할. 종류가 다르면 분리되나, **같은 종류 2개는 한 덩어리**(예: 셔츠 2벌). 한 사람의 1세트 착장(상1·하1·아우터1)엔 충분.
- **class-agnostic**: 사물이 무엇인지 모른 채 프롬프트(점·박스)로 마스크만 만드는 방식(SAM 2).
- **누끼(Cutout)**: 배경·인물을 제거하고 옷만 픽셀 단위로 남긴 결과물(보통 투명 PNG).

---

## 자료별 요약

### 능력 A — 식별/분류 (상의·하의·아우터 구별)

| # | 기술 | 카테고리 구별 | 학습 없이 | 핵심 내용(조건/한계) | 출처(공식) |
|---|---|---|---|---|---|
| 1 | **rembg `u2net_cloth_seg`** | △ 상/하/전신 3분류 | ✅ | Upper/Lower/Full body 파싱. **아우터를 상의와 못 나눔**(Upper에 병합). 시맨틱(같은 종류 2벌 구분 X) | [rembg README](https://github.com/danielgatis/rembg) |
| 2 | **SCHP (LIP 20클래스)** | ✅ **Upper-clothes·Coat 별도** + Pants·Skirt·Dress | ✅ 사전학습 제공 | 휴먼파싱. **무학습으로 아우터(Coat) 분리 가능**. 시맨틱(인스턴스 아님) | [SCHP](https://github.com/GoGoDuck912/Self-Correction-Human-Parsing) |
| 3 | **segformer_b2_clothes (ATR 18클래스)** | △ Upper/Pants/Skirt/Dress 분리, **Coat 라벨 없음** | ✅ 사전학습 제공 | Transformers로 즉시 사용. **아우터는 Upper-clothes에 병합**(rembg와 동일 한계). 시맨틱 | [segformer_b2_clothes](https://huggingface.co/mattmdjaga/segformer_b2_clothes) |
| 4 | **Gemini 2.5 (검출/세그)** | ✅ 임의 라벨(자연어) | ✅ | "상의/하의/아우터" 라벨을 프롬프트로 지정해 검출. **단 다중 의류 인스턴스 분리 보장은 문서에 없음** | [Gemini Image Understanding](https://ai.google.dev/gemini-api/docs/image-understanding) |
| 5 | **YOLO-seg (기본 가중치)** | ❌ COCO엔 옷 클래스 없음 | ✅(옷은 못함) | 기본 weight는 COCO 사전학습 → 셔츠·바지·아우터 미포함 | [Ultralytics Segment](https://docs.ultralytics.com/tasks/segment/) |
| 6 | **YOLO-seg + DeepFashion2** | ✅ 13종(short/long sleeve outwear 포함) | ❌ 파인튜닝 필요 | per-pixel mask 라벨 보유 → 학습 시 정밀 인스턴스 분류 | [DeepFashion2](https://github.com/switchablenorms/DeepFashion2) |
| 7 | **SAM 2** | ❌ 라벨 없음(class-agnostic) | ✅ | 마스크만 출력, "무엇인지"는 모름 → 외부 검출기/라벨 필요 | [SAM 2](https://github.com/facebookresearch/sam2) |

### 능력 B — 핵심 처리 (픽셀 마스크 생성)

| # | 기술 | 픽셀 마스크 | 인스턴스 분리 | 핵심 내용 | 출처(공식) |
|---|---|---|---|---|---|
| 1 | **rembg `u2net_cloth_seg`** | ✅ 3영역 | △ 시맨틱(종류별) | 옷 파싱 마스크 자동 산출 | [rembg](https://github.com/danielgatis/rembg) |
| 2 | **SCHP / segformer 휴먼파싱** | ✅ 클래스별 | △ 시맨틱(종류별) | 클래스 픽셀맵 출력 | [SCHP](https://github.com/GoGoDuck912/Self-Correction-Human-Parsing) · [segformer](https://huggingface.co/mattmdjaga/segformer_b2_clothes) |
| 3 | **Gemini 2.5 세그** | ✅ base64 PNG 확률맵(0–255) | △ **미검증**(겹쳐 입은 옷 독립 분리 보장 없음) | 박스 내 contour 마스크, **2.5부터** 지원 | [Gemini](https://ai.google.dev/gemini-api/docs/image-understanding) |
| 4 | **SAM 2** | ✅ 고품질 마스크 | ✅ promptable(박스/점당 1마스크) | foundation model, 정밀 마스크 | [SAM 2](https://github.com/facebookresearch/sam2) |
| 5 | **YOLO-seg** | ✅ 인스턴스 마스크 | ✅ | 검출+세그 동시, 클래스는 학습 데이터 의존 | [Ultralytics](https://docs.ultralytics.com/tasks/segment/) |

### 능력 C — 후처리 (마스크 → 누끼 PNG)

| # | 기술 | 역할 | 핵심 내용 | 출처 |
|---|---|---|---|---|
| 1 | **rembg** | 배경 제거 | 라이브러리 본 목적이 배경 제거(마스크로 인물·배경 제거) | [rembg](https://github.com/danielgatis/rembg) |
| 2 | **마스크 → 알파 합성** | 누끼화 | 능력 B 마스크를 알파 채널로 적용해 투명 PNG 생성. **표준 기법이나 본 조사에서 1차 출처 미확인(범위 밖)** — PIL/OpenCV 후보, "다음 검증" 참조 | (미확인 — 다음 검증) |

---

## 가능한 파이프라인 (난이도순)

| 경로 | 능력 A(분류) | 능력 B(마스크) | 학습 필요? | 무게 | 비고(PoC 우선순위) |
|---|---|---|---|---|---|
| **P1** rembg `u2net_cloth_seg` 단독 | △ 상/하/전신 (아우터 X) | ✅ 시맨틱 | ❌ | 가벼움(CPU 가능) | **아우터 구별 불필요 시 1순위** — 최경량·무학습. 아우터 필요하면 부적합 |
| **P1b** SCHP(LIP) 휴먼파싱 | ✅ **아우터(Coat) 분리** | ✅ 시맨틱 | ❌ 사전학습 | 보통(GPU 권장) | **아우터까지 무학습 구별 필요 시 1순위** — 1세트 착장에 충분(인스턴스 아님) |
| **P2** Gemini 2.5 (검출+세그) | ✅ 자연어 라벨 | △ **인스턴스 분리 미검증** | ❌ | API(클라우드) | 라벨 유연·무학습 API. **겹쳐 입은 옷 독립 분리는 PoC로 실측 필요** |
| **P3** 검출기 박스 → SAM 2 | ✅(검출기 라벨) | ✅ 고정밀 인스턴스 | ❌(SAM2 학습X) | 검출+SAM2 GPU | 마스크 품질 최상. 박스 프롬프트로 옷별 분리 |
| **P4** YOLO-seg + DeepFashion2 | ✅ 13종 정밀(아우터 포함) | ✅ 인스턴스 | ⚠️ 파인튜닝 | 학습 GPU | 정밀 인스턴스·통제력 최상. 학습 비용↑ |

표준 흐름:
```
[착장 사진]
   ├─ P1  : rembg(cloth_seg) ─→ 상/하/전신 마스크 ───────┐
   ├─ P1b : SCHP(LIP) ─→ upper/coat/pants… 클래스 마스크 ─┤
   ├─ P2  : Gemini2.5 ─→ 라벨+box+mask(base64) ──────────┼─→ [마스크→알파합성*]
   ├─ P3  : [검출기 box]──prompt──>SAM2 ─→ 고정밀 마스크 ─┤      → 옷별 누끼 PNG
   └─ P4  : YOLO-seg(DeepFashion2) ─→ 13클래스 인스턴스 ─┘
                                           (* 후처리 출처 미확인 — 다음 검증)
```

---

## 다음 검증 (이 문서 범위 밖, 후속 조사 메모)

- **누끼 합성 후처리(마스크→알파 PNG, 경계 정제)** 1차 문서 확인(PIL/OpenCV) 및 엣지 품질 — 본 조사에서 출처 미확인.
- **P2 Gemini**: 한 인물에 겹쳐 입은 상/하/아우터의 **다중 의류 인스턴스 분리** 신뢰도 실측 + 호출 비용·지연.
- **P1/P1b/P3 시맨틱 한계**: 같은 종류 2벌(셔츠 2개) 분리 필요 여부 — 필요하면 인스턴스 경로(P3/P4)로.
- **P1b SCHP**: LIP vs ATP 라벨셋별 아우터 분리 정확도, 사전학습 모델 라이선스(상업적 사용 가능 여부).
- **P4 DeepFashion2 라이선스**(연구용 한정 여부) 및 상업적 사용 가능성.
- 단일 사진 내 **여러 사람·겹침(occlusion)**, 가려진 옷 영역 처리.
- 출력 마스크의 **해상도/경계 정밀도**가 누끼 품질 기준을 만족하는지(정확도 실측).
- (인접·제외) 비스듬한 착장 **정면화**, 색·소재·패턴 등 카테고리 외 속성 추출.
