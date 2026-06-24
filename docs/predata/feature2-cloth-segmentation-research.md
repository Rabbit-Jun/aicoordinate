# 기능 2 조사 — 사진에서 상의/하의 식별 + 누끼(배경 제거) 추출 가능성

> **조사 범위(이 문서 한정)**: "사용자 착장 사진 → 상의/하의를 구별하고, 각 옷을 배경 없이(누끼) 추출할 수 있는가"
> **목적**: 구현 전 기술 가능성 판단(PoC 후보 선별). 구현 결정·비용 산정은 별도.
> 조사 기준일: 2026-06-23. 출처는 벤더/프로젝트 공식 1차 문서. ✅ 가능 / △ 조건부 / ❌ 불가.

## 결론 요약

> **상의/하의 구별 + 누끼 추출은 둘 다 가능하다.** 특히 **학습(파인튜닝) 없이도** 되는 경로가 둘 있다 — **rembg(`u2net_cloth_seg`)** 와 **Gemini 2.5**. 정밀 통제가 필요하면 YOLO-seg + DeepFashion2 학습, 윤곽 품질을 더 올리려면 SAM 2를 보강.

핵심 개념 정리:
- **식별(카테고리)** = "이게 상의/하의다" 라벨 → 객체 검출/분류 영역
- **누끼** = 배경 제거 → "마스크(픽셀 단위 옷 모양)"가 있어야 가능. 네모 박스만으론 배경이 같이 남음
- **마스크 → 실제 PNG 변환** = PIL/OpenCV 같은 이미지 처리 코드(모델 아님)

---

## 자료별 요약

### 옷 식별(카테고리) — "이게 상의/하의다"

| # | 기술 | 식별 | 위치/마스크 | 핵심 내용 | 출처(공식) |
|---|---|---|---|---|---|
| 1 | **OpenAI Vision** | △ 설명 기반 | ❌ 없음 | 이미지를 **설명**하는 도구. 옷 종류·색은 인식하나 **객체 검출·세그 기능 없음**. 상/하의 구분은 **구조화 출력(JSON) 프롬프트**로 받아야 함 | [OpenAI Images & Vision](https://platform.openai.com/docs/guides/images-vision) |
| 2 | **Gemini** | ✅ (프롬프트) | ✅ 박스+마스크 | **검출+세그 모두 지원**. 박스 좌표(`[ymin,xmin,ymax,xmax]`), **2.5부터 윤곽 마스크(base64 PNG)** 출력. "상/하의 박스 보여줘" 커스텀 지시 가능. **파인튜닝 불필요** | [Gemini Image Understanding](https://ai.google.dev/gemini-api/docs/image-understanding) |
| 3 | **YOLO-seg** | ✅ (학습 시) | ✅ 마스크+라벨 | 인스턴스 세그로 **마스크(`masks.data`)+클래스(`boxes.cls`)** 출력. 단 기본은 **COCO(옷 카테고리 없음)** → 옷엔 **커스텀 학습(DeepFashion2 등) 필수** | [Ultralytics Segment](https://docs.ultralytics.com/tasks/segment/) |

### 누끼(마스크/배경 제거)

| # | 기술 | 누끼 | 카테고리 | 핵심 내용 | 출처(공식) |
|---|---|---|---|---|---|
| 4 | **SAM 2** | ✅ 최정밀 | ❌ class-agnostic | **지목형(박스·점·마스크 프롬프트)**, 처음 보는 객체도 zero-shot 분리. 라벨은 안 줌 → "어디를 오릴지" 외부에서 가리켜야 함 | [Ultralytics SAM 2](https://docs.ultralytics.com/models/sam-2/) |
| 5 | **rembg** | ✅ | ✅ 상/하/전신 | 배경 제거 도구(CLI·Python·HTTP 서버·Docker). **옷 전용 모델 `u2net_cloth_seg`** 가 옷을 **Upper / Lower / Full body 3종 파싱**. → **학습 없이 상의/하의 구분 + 누끼 동시** | [rembg (GitHub)](https://github.com/danielgatis/rembg) |

### 누끼 → 실제 이미지 파일

| # | 기술 | 역할 | 핵심 내용 | 출처(공식) |
|---|---|---|---|---|
| 6 | **Pillow (PIL)** | 마무리 | 자르기(crop)·마스크 적용·**투명 PNG(알파) 저장**. 마스크를 실제 누끼 파일로 만드는 단계 | [Pillow Image](https://pillow.readthedocs.io/en/stable/reference/Image.html) |
| 7 | **OpenCV** | 네모 자르기 | numpy 슬라이싱 `img[y1:y2, x1:x2]` = **직사각형 크롭**. 박스 좌표로 잘라낼 때(모양대로 오리는 건 아님 → 누끼는 마스크+PIL 필요) | [LearnOpenCV Cropping](https://learnopencv.com/cropping-an-image-using-opencv/) |

---

## 가능한 파이프라인 (난이도순)

| 경로 | 상의/하의 식별 | 누끼 | 학습 필요? | 무게 | 비고 |
|---|---|---|---|---|---|
| **rembg `u2net_cloth_seg`** | ✅ 상/하/전신 | ✅ | ❌ 불필요 | 가벼움 | **MVP 1순위 후보** — 학습 없이 식별+누끼 한 번에 |
| **Gemini 2.5** | ✅ (프롬프트) | ✅ 마스크 | ❌ 불필요 | API | 호출 한 방, 정밀도 실측 검증 필요 |
| **YOLO-seg + DeepFashion2** | ✅ | ✅ | ⚠️ 필요 | GPU | 통제력·정확도 최상, 학습 비용↑ |
| **(보강) + SAM 2** | — | ✅ 최정밀 | ❌ | 무거움 | 윤곽 품질 더 필요할 때 얹기 |
| **마무리: PIL** | — | ✅ PNG화 | ❌ | 가벼움 | 모든 경로 공통 마지막 단계 |

표준 흐름:
```
착장 사진
  → [식별+마스크]  rembg cloth_seg  /  Gemini 2.5  /  YOLO-seg(학습)
  → [정밀 보강]    (선택) SAM 2
  → [PNG 변환]     PIL  →  상의.png / 하의.png (배경 투명)
```

---

## 다음 검증(이 문서 범위 밖, 후속 조사 메모)

- rembg `u2net_cloth_seg` **실제 정확도** PoC (상/하의 경계, 윤곽 품질)
- Gemini 2.5 세그 마스크 **정밀도·비용** 실측
- DeepFashion2 파인튜닝 **실제 공수**(데이터·시간·GPU) — 학습 경로 갈 경우만
- 정면화(비스듬한 착장 → 정면 뷰)·카테고리 외 속성(색·소재·패턴) 추출은 별도 조사
