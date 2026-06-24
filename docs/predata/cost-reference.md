# AI Coordinate — 비용 참고 (Cost Reference)

> 옷장 코디 서비스의 **모든 인프라·API·SaaS 비용을 한 문서에 정리**.
> 각 항목마다 **공식 가격 페이지 URL**을 함께 표기 — 가격은 자주 바뀌므로 결정 전 반드시 최신 확인.
>
> 다른 문서의 비용 추정값은 본 문서를 참조한다 ([mvp-roadmap.md](./mvp-roadmap.md), [phase1-blueprint.md](./phase1-blueprint.md), [multi-agent-design.md](./multi-agent-design.md)).

---

## 0. 개요 — 비용 카테고리

옷장 프로젝트의 비용은 **3가지로 분류**:

| 카테고리 | 특징 | 비중 (1,000명 기준) |
|---|---|---|
| **① AWS 인프라** | 사용량 비례, 고정비 大 | ~15% |
| **② AI API** | 호출당 과금, 변동비 大 | ~75% (메인) |
| **③ 외부 SaaS** | 정액제 또는 무료 tier | ~10% |

→ **옷장 도메인은 AI 호출이 압도적 메인 비용**. 인프라보다 LLM·합성 API가 5배 큼.

---

## 1. 단계별 비용 요약 (사용자 1,000명 기준 월)

| 단계 | 인프라 | AI API | SaaS | 합계 |
|---|---|---|---|---|
| **1단계** (MVP) | ~$100 | ~₩450K | $0 | **~₩580K** |
| **2단계** (성장 + 신발·가방·달력) | ~$150 | ~₩600K | $50 | **~₩820K** |
| **3단계** (자체 LLM, Spot 사용) | ~$520 (GPU 포함) | ~₩100K | $0 | **~₩640K** |
| **3단계** (자체 LLM, On-Demand) | ~$820 (GPU 포함) | ~₩100K | $0 | **~₩1.14M** |

> 위 추정은 **사용량 가정에 따라 변동**. 실제 운영 시작 후 1~2개월 측정 권장.

---

## 2. AWS 인프라 비용

> 💡 **공식 가격 페이지**: https://aws.amazon.com/pricing/
> 💡 **계산기**: https://calculator.aws/

### 2.1 EC2 (자체 호스팅 인스턴스)

| 인스턴스 | vCPU/RAM | 시간당 | 월 비용 (24/7) | 용도 |
|---|---|---|---|---|
| t4g.nano | 2 / 0.5GB | $0.0042 | ~$3 | 가벼운 봇 |
| t4g.small | 2 / 2GB | $0.0168 | ~$12 | 소형 백엔드 |
| t4g.medium | 2 / 4GB | $0.0336 | ~$24 | 중형 백엔드 |
| **g5.xlarge** | 4 / 16GB / **A10G 24GB GPU** | $1.006 | **~$724** | 3단계 vLLM |
| **g5.2xlarge** | 8 / 32GB / **A10G 24GB GPU** | $1.212 | **~$872** | 3단계 vLLM (큰 모델) |
| g4dn.xlarge | 4 / 16GB / T4 16GB GPU | $0.526 | ~$378 | GPU 저예산 옵션 |

> 출처: https://aws.amazon.com/ec2/pricing/on-demand/
> **Spot 인스턴스**로 30~70% 절감 가능 — https://aws.amazon.com/ec2/spot/pricing/

### 2.2 ECS Fargate (관리형 컨테이너)

가격 = (vCPU 시간) × $0.04048 + (GB 시간) × $0.004445

| 컨테이너 사양 | 시간당 | 월 비용 (24/7) |
|---|---|---|
| 0.25 vCPU + 0.5 GB | ~$0.014 | ~$10 |
| 0.5 vCPU + 1 GB | ~$0.025 | ~$18 |
| 1 vCPU + 2 GB | ~$0.049 | ~$36 |

> 출처: https://aws.amazon.com/fargate/pricing/

### 2.3 RDS Postgres (관리형 DB)

| 인스턴스 | vCPU/RAM | 시간당 | 월 비용 |
|---|---|---|---|
| db.t4g.micro | 2 / 1GB | $0.016 | ~$12 |
| **db.t4g.small** | 2 / 2GB | $0.033 | **~$24** (1단계 권장) |
| db.t4g.medium | 2 / 4GB | $0.067 | ~$48 |
| db.m6g.large | 2 / 8GB | $0.137 | ~$98 |

**스토리지 추가**: gp3 SSD $0.115/GB/월
**자동 백업**: 무료 (할당 스토리지 크기까지)

> 출처: https://aws.amazon.com/rds/postgresql/pricing/

### 2.4 ElastiCache Redis

| 인스턴스 | RAM | 시간당 | 월 비용 |
|---|---|---|---|
| **cache.t4g.micro** | 0.5GB | $0.013 | **~$9** (1단계 권장) |
| cache.t4g.small | 1.4GB | $0.027 | ~$19 |
| cache.t4g.medium | 3.1GB | $0.054 | ~$39 |

> 출처: https://aws.amazon.com/elasticache/pricing/

### 2.5 S3 + CloudFront

#### S3 Standard
- 저장: $0.023/GB/월
- PUT/POST 요청: $0.005/1,000건
- GET 요청: $0.0004/1,000건
- Data Transfer Out: $0.09/GB (CloudFront 통하면 무료)

> 출처: https://aws.amazon.com/s3/pricing/

#### CloudFront
- Data Transfer Out (첫 10TB/월): $0.085/GB
- HTTP/HTTPS 요청: $0.0075~$0.0090/10,000건

> 출처: https://aws.amazon.com/cloudfront/pricing/

**옷장 예상 (1,000명, 옷 사진 50GB)**:
- S3 저장: ~$1.15/월
- CloudFront 전송 (월 100GB): ~$8.5/월
- 합계: ~**$10/월**

### 2.6 Cognito (인증)

| 항목 | 가격 |
|---|---|
| MAU (Monthly Active Users) 50,000명까지 | **무료** |
| 50K 초과 시 (50K~100K) | $0.0055/MAU |
| Advanced Security (선택) | $0.05/MAU |

> 출처: https://aws.amazon.com/cognito/pricing/

→ 옷장 1~2단계 (10K MAU 이하) **완전 무료**.

### 2.7 기타 AWS 서비스

| 서비스 | 가격 |
|---|---|
| **Secrets Manager** | $0.40/시크릿/월 + $0.05/만 API 호출 |
| **CloudWatch Logs** | 수집: $0.50/GB / 저장: $0.03/GB/월 |
| **CloudWatch 메트릭** | 처음 10개 무료, 이후 $0.30/지표/월 |
| **ECR (Docker 레지스트리)** | $0.10/GB/월 |
| **NAT Gateway** | $0.045/시간 + $0.045/GB |
| **Data Transfer** | 인바운드 무료, AWS 외부로 아웃바운드 $0.09/GB |

> 출처:
> - Secrets Manager: https://aws.amazon.com/secrets-manager/pricing/
> - CloudWatch: https://aws.amazon.com/cloudwatch/pricing/
> - ECR: https://aws.amazon.com/ecr/pricing/

### 2.8 EC2 GPU (3단계 자체 LLM)

3단계 자체 LLM 호스팅 시 핵심 비용:

| 인스턴스 | GPU | RAM | 시간당 | 월 비용 (24/7) | Spot (60% 절감) |
|---|---|---|---|---|---|
| **g4dn.xlarge** | T4 16GB | 16GB | $0.526 | ~$378 | ~$150 |
| **g5.xlarge** | A10G 24GB | 16GB | $1.006 | ~$724 | ~$290 |
| **g5.2xlarge** | A10G 24GB | 32GB | $1.212 | ~$872 | ~$350 |
| **g5.12xlarge** | 4×A10G 96GB | 192GB | $5.672 | ~$4,084 | ~$1,634 |
| p4d.24xlarge | 8×A100 320GB | 1152GB | $32.77 | ~$23,594 | ~$9,438 |

> 출처: https://aws.amazon.com/ec2/instance-types/g5/
> Spot 가격: https://aws.amazon.com/ec2/spot/pricing/

**옷장 3단계 추천**: g5.xlarge (Llama 3.1-8B·Qwen 7B 동시) — On-Demand $724 또는 Spot $290.

---

## 3. AI API 비용 (가장 큰 변동비)

### 3.1 Anthropic Claude

| 모델 | Input (1M tokens) | Output (1M tokens) | 이미지 1장 (~1.5K) |
|---|---|---|---|
| **Claude Haiku 4.5** | $0.25 | $1.25 | ~$0.0004 (₩0.5) |
| **Claude Sonnet 4** | $3 | $15 | ~$0.005 (₩6.5) |
| **Claude Sonnet 4 Vision** | $3 | $15 | ~$0.015 (₩20) |
| **Claude Opus 4** | $15 | $75 | ~$0.025 |

**Prompt Caching** (5분 캐시): 입력 토큰 90% 할인
**Batch API**: 50% 할인 (24h 지연 OK)

> 출처: https://www.anthropic.com/pricing
> 모델 상세: https://docs.anthropic.com/en/docs/about-claude/models

### 3.2 OpenAI

| 모델 | Input | Output |
|---|---|---|
| **GPT-4o** | $2.50/M | $10/M |
| **GPT-4o mini** | $0.15/M | $0.60/M |
| GPT-4 Turbo | $10/M | $30/M |
| o1 | $15/M | $60/M |

**이미지 입력** (GPT-4o): 텍스트 토큰 환산, 이미지당 ~$0.012

**임베딩**:
| 모델 | 가격 |
|---|---|
| text-embedding-3-small | $0.02/M tokens |
| text-embedding-3-large | $0.13/M tokens |
| text-embedding-ada-002 | $0.10/M tokens (구) |

**DALL-E 3 (이미지 생성)**:
| 해상도·품질 | 가격 |
|---|---|
| 1024×1024 standard | $0.040/장 |
| 1024×1024 HD | $0.080/장 |
| 1792×1024 또는 1024×1792 | $0.080/장 |

> 출처: https://openai.com/api/pricing/

### 3.3 BFL Flux (마네킹 합성)

| 모델 | 가격/장 |
|---|---|
| **Flux Pro 1.1** | $0.04 |
| **Flux Pro Ultra** | $0.06 |
| **Flux Kontext Pro** (편집·합성) | $0.04 |
| **Flux Kontext Max** | $0.08 |
| **Flux Dev** | **무료** (오픈소스, 자체 호스팅) |
| **Flux Schnell** | $0.003 (빠름·저렴) |

> 출처: https://docs.bfl.ai/pricing
> 모델 카탈로그: https://blackforestlabs.ai/

### 3.4 Replicate (대안 — 가상 피팅 특화)

| 모델 | 가격 |
|---|---|
| **IDM-VTON** (가상 피팅) | ~$0.05/실행 |
| **OOTDiffusion** | ~$0.04/실행 |
| **CatVTON** | ~$0.03/실행 |
| 일반 모델 | $0.000725/초 (CPU) ~ $0.001525/초 (A100) |

> 출처: https://replicate.com/pricing
> 가상 피팅 모델 모음: https://replicate.com/collections/virtual-try-on

### 3.5 Google Gemini (대안)

| 모델 | Input | Output |
|---|---|---|
| **Gemini 2.0 Flash** | $0.10/M | $0.40/M |
| **Gemini 2.0 Pro** | $1.25/M | $5/M |
| **Gemini 1.5 Flash 8B** | $0.0375/M | $0.15/M |

> 출처: https://ai.google.dev/pricing

### 3.6 Cohere (대안 — 임베딩)

| 모델 | 가격 |
|---|---|
| **embed-v4.0** (멀티모달) | $0.12/M tokens |
| embed-v3.0 | $0.10/M tokens |

> 출처: https://cohere.com/pricing

### 3.7 HuggingFace Inference

| 옵션 | 가격 |
|---|---|
| **Inference API (Serverless)** | 무료 tier + 사용량 과금 |
| **Inference Endpoints (Dedicated)** | GPU 인스턴스 시간당 ($0.50~$13) |
| **HF Spaces** | 무료~유료 |

> 출처: https://huggingface.co/pricing

→ 3단계 자체 호스팅은 **AWS EC2 + vLLM**이 더 저렴·유연.

---

## 4. 외부 SaaS 비용

### 4.1 Vercel (Next.js 호스팅)

| 플랜 | 가격 | 한도 |
|---|---|---|
| **Hobby** | **무료** | 개인 프로젝트, 100GB 대역폭 |
| **Pro** | $20/월 | 1TB 대역폭, 팀 |
| Enterprise | 협상 | 대규모 |

> 출처: https://vercel.com/pricing

→ 옷장 랜딩·1단계 무료 충분.

### 4.2 Sentry (에러 추적)

| 플랜 | 가격 | 한도 |
|---|---|---|
| **Developer** | **무료** | 5K errors/월 |
| **Team** | $26/월 | 50K errors/월 |
| Business | $80/월 | 500K errors/월 |

> 출처: https://sentry.io/pricing/

### 4.3 Amplitude (사용자 행동 분석)

| 플랜 | 가격 | 한도 |
|---|---|---|
| **Starter** | **무료** | 10M events/월 |
| Plus | $49/월부터 | 추가 기능 |
| Growth | 협상 | 대규모 |

> 출처: https://amplitude.com/pricing

→ 옷장 1~2단계 무료 충분.

### 4.4 GitHub Actions (CI/CD)

| 항목 | 한도 (개인 무료) |
|---|---|
| **무료** | 2,000분/월 (퍼블릭 무제한) |
| 추가 분 (Linux) | $0.008/분 |
| 추가 분 (Mac) | $0.08/분 (10배) |

> 출처: https://github.com/pricing

### 4.5 Supabase (랜딩 Phase 0)

| 플랜 | 가격 | 한도 |
|---|---|---|
| **Free** | **무료** | 500MB DB, 1GB Storage, 50MAU |
| **Pro** | $25/월 | 8GB DB, 100GB Storage, 100K MAU |

> 출처: https://supabase.com/pricing

→ 랜딩 페이지만 사용 (본 개발은 AWS 전환).

### 4.6 v0.dev (AI UI 생성)

| 플랜 | 가격 |
|---|---|
| **Free** | 무료 (제한적) |
| **Premium** | $20/월 |
| Team | $30/월/시트 |

> 출처: https://v0.dev/pricing

### 4.7 Langfuse (LLM 관측, 2단계+)

| 플랜 | 가격 | 한도 |
|---|---|---|
| **Hobby** | **무료** | 50K observations/월 |
| **Core** | $59/월 | 100K observations |
| Pro | $199/월 | 1M observations |

> 출처: https://langfuse.com/pricing

### 4.8 Helicone (LLM 비용 추적, 선택)

| 플랜 | 가격 | 한도 |
|---|---|---|
| **Free** | **무료** | 100K requests/월 |
| Pro | $20/월 | 1M requests |

> 출처: https://www.helicone.ai/pricing

---

## 5. 단계별 시나리오 비용 계산

### 5.1 1단계 (사용자 100~1,000명)

**가정**:
- 사용자 1,000명
- 옷 등록: 10,000장/월 (1인당 10장)
- 합성: 1,500장/월 (1인당 1.5장)
- 추천 요청: 30,000건/월 (1인당 30건)

| 항목 | 비용 |
|---|---|
| ECS Fargate (API + Worker 2개) | ~$30 |
| RDS Postgres (db.t4g.small) | ~$25 |
| ElastiCache Redis (cache.t4g.micro) | ~$15 |
| S3 + CloudFront (50GB) | ~$10 |
| Cognito (1K MAU) | $0 |
| 기타 AWS (Secrets·CloudWatch·NAT) | ~$15 |
| Claude API (Haiku + Sonnet 혼합) | ~₩300K |
| BFL Flux (1,500장 × $0.04) | ~$60 (~₩84K) |
| OpenAI Embeddings (10K 옷 × 1.5K 토큰) | ~$0.3 |
| Vercel·Sentry·Amplitude·GHA | $0 |
| **합계** | **~$155 + ₩384K** ≈ **~₩600K** |

### 5.2 2단계 (사용자 1,000명 + 기능 확장)

**가정**:
- 같은 사용자 1,000명, 활동 증가
- 직접 코디·달력 기능 추가
- 신발·가방 카테고리 확장

| 항목 | 비용 |
|---|---|
| 1단계 인프라 (그대로) | ~$100 |
| 추가 ECS Worker (직접 코디 합성) | ~$30 |
| RDS 업그레이드 (db.t4g.medium) | ~$48 |
| Claude API (사용량 증가) | ~₩450K |
| BFL Flux (직접 코디 추가, ~3,000장) | ~$120 (~₩168K) |
| Langfuse Hobby | $0 |
| **합계** | **~$300 + ₩450K** ≈ **~₩870K** |

### 5.3 3단계 (사용자 1,000명, 자체 LLM)

**가정 (Spot 인스턴스 사용)**:
- 2단계 기능 그대로
- LLM Provider만 자체 호스팅으로 교체

| 항목 | 비용 |
|---|---|
| 2단계 인프라 (그대로) | ~$220 |
| **EC2 g5.xlarge Spot** (vLLM, 24/7) | **~$290** |
| HuggingFace 모델 다운로드·S3 저장 | ~$5 |
| Claude API (감소 — Vision만 유지) | ~₩50K |
| BFL Flux (그대로) | ~$120 |
| **합계 (Spot)** | **~$635 + ₩50K** ≈ **~₩930K** |

**On-Demand 시**: g5.xlarge $724 → 합계 **~₩1.4M**

→ **사용자 1,000명 규모에선 자체 호스팅이 외부 API보다 비쌀 수 있음**. 학습·프라이버시 가치로 정당화.

---

## 6. 비용 절감 옵션

### 6.1 AWS 절감

| 옵션 | 절감률 | 적용처 |
|---|---|---|
| **Spot Instances** | 30~70% | EC2 (워커·GPU) |
| **Savings Plans** | ~40% | 1년 약정 시 |
| **Reserved Instances** | ~50% | 3년 약정 (큰 약정) |
| **S3 Intelligent-Tiering** | 30~95% | 오래된 파일 자동 이동 |
| **CloudFront 캐싱 강화** | 50%+ | Cache TTL ↑ |
| **Free tier 활용** (첫 12개월) | 다양 | t2.micro·5GB S3 등 |

> 출처: https://aws.amazon.com/savingsplans/
> Free tier: https://aws.amazon.com/free/

### 6.2 LLM API 절감

| 옵션 | 절감률 | 적용처 |
|---|---|---|
| **Prompt Caching** (Anthropic) | 90% input | 시스템 프롬프트 반복 |
| **Batch API** (Anthropic/OpenAI) | 50% | 비실시간 작업 |
| **모델 선택** (Haiku/Mini) | 5~10배 | 단순 작업 |
| **출력 토큰 제한** | 30~50% | max_tokens 조정 |
| **컨텍스트 압축** | 40~70% | 긴 RAG 결과 요약 |

> 출처: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

### 6.3 합성 비용 절감

| 옵션 | 절감률 | 적용처 |
|---|---|---|
| **일일 한도** (5회/사용자) | 직접 통제 | 비용 폭주 방지 |
| **Flux Schnell** (저화질 옵션) | 92% (Schnell vs Pro) | 미리보기용 |
| **자체 Flux Dev 호스팅** | 100% API 비용 0 | GPU 비용으로 전환 |
| **결과 캐싱** | 변동 | 같은 옷 조합 재합성 방지 |

---

## 7. 가격 변동 추적

AI API·SaaS 가격은 **자주 변동**. 권장:

### 추적 주기
- **분기별 1회**: 주요 모델 가격 재확인 (Claude·GPT·BFL)
- **신모델 출시 시**: 즉시 비교 (보통 신모델이 더 저렴)
- **사용량 변경 시**: 시뮬레이션 재계산

### 추적 도구·사이트
| 사이트 | 용도 |
|---|---|
| **Artificial Analysis** | LLM 가격·성능 비교 (실시간 갱신) — https://artificialanalysis.ai/ |
| **Vellum AI Leaderboard** | LLM 가격·벤치마크 — https://www.vellum.ai/llm-leaderboard |
| **Helicone Pricing Calculator** | LLM 비용 계산기 — https://www.helicone.ai/llm-cost |
| **AWS Pricing Calculator** | AWS 인프라 견적 — https://calculator.aws/ |
| **GPUList.ai** | GPU 인스턴스 가격 비교 — https://www.gpulist.ai/ |

### 가격 변동 알림
- AWS: AWS News Blog — https://aws.amazon.com/blogs/aws/
- Anthropic: 공식 트위터·Discord
- OpenAI: https://openai.com/blog
- BFL: https://blackforestlabs.ai/announcements/

---

## 8. 공식 가격 페이지 모음 (출처 한눈에)

### AWS
| 서비스 | URL |
|---|---|
| 전체 | https://aws.amazon.com/pricing/ |
| EC2 | https://aws.amazon.com/ec2/pricing/on-demand/ |
| EC2 Spot | https://aws.amazon.com/ec2/spot/pricing/ |
| Fargate | https://aws.amazon.com/fargate/pricing/ |
| RDS Postgres | https://aws.amazon.com/rds/postgresql/pricing/ |
| ElastiCache | https://aws.amazon.com/elasticache/pricing/ |
| S3 | https://aws.amazon.com/s3/pricing/ |
| CloudFront | https://aws.amazon.com/cloudfront/pricing/ |
| Cognito | https://aws.amazon.com/cognito/pricing/ |
| Secrets Manager | https://aws.amazon.com/secrets-manager/pricing/ |
| CloudWatch | https://aws.amazon.com/cloudwatch/pricing/ |
| ECR | https://aws.amazon.com/ecr/pricing/ |
| **계산기** | https://calculator.aws/ |

### AI API
| 서비스 | URL |
|---|---|
| Anthropic Claude | https://www.anthropic.com/pricing |
| OpenAI | https://openai.com/api/pricing/ |
| Google Gemini | https://ai.google.dev/pricing |
| BFL Flux | https://docs.bfl.ai/pricing |
| Replicate | https://replicate.com/pricing |
| Cohere | https://cohere.com/pricing |
| HuggingFace | https://huggingface.co/pricing |

### 외부 SaaS
| 서비스 | URL |
|---|---|
| Vercel | https://vercel.com/pricing |
| Sentry | https://sentry.io/pricing/ |
| Amplitude | https://amplitude.com/pricing |
| GitHub | https://github.com/pricing |
| Supabase | https://supabase.com/pricing |
| v0.dev | https://v0.dev/pricing |
| Langfuse | https://langfuse.com/pricing |
| Helicone | https://www.helicone.ai/pricing |

### 비교·계산 도구
| 사이트 | 용도 |
|---|---|
| https://artificialanalysis.ai/ | LLM 가격·성능 실시간 비교 |
| https://www.vellum.ai/llm-leaderboard | LLM 종합 평가 |
| https://www.helicone.ai/llm-cost | LLM 비용 계산기 |
| https://calculator.aws/ | AWS 견적 |
| https://www.gpulist.ai/ | GPU 가격 비교 (AWS·GCP·Lambda Labs 등) |

---

## 9. 비용 모니터링 권장 셋업

### 9.1 AWS 비용 알림
- **AWS Budgets**: 월 예산 임계값 설정 → 80% 도달 시 이메일
- **Cost Explorer**: 일별·서비스별 비용 그래프
- 출처: https://aws.amazon.com/aws-cost-management/aws-budgets/

### 9.2 LLM 비용 모니터링
- **Helicone** 또는 **Langfuse**: LLM 호출 게이트웨이로 통합
- **자체 AgentLog**: agent_logs 테이블에 토큰·비용 누적 (multi-agent-design.md §8)

### 9.3 일일 점검 자동화
```yaml
# .github/workflows/cost-check.yml
on:
  schedule:
    - cron: '0 9 * * *'  # 매일 오전 9시
jobs:
  check:
    - aws ce get-cost-and-usage --time-period ...
    - if 일일 비용 > $50 → Slack 알림
```

---

## 10. 자주 묻는 질문

### Q. 가격이 자주 바뀌나요?
- AI API: **분기마다 변동** (신모델 출시 시 가격 하락 trend)
- AWS: 변동 적음 (가끔 인하)
- SaaS: 분기~연간 단위

### Q. 한국 결제는?
- AWS·Anthropic·OpenAI·BFL 모두 **USD 결제** (카드)
- 환율 영향 있음 (1$ ≈ ₩1,400 기준)

### Q. 무료 tier로 어디까지?
- AWS 첫 12개월: t2.micro EC2·5GB S3·750h RDS 무료
- Claude/OpenAI: 무료 tier 없음 (잔액 충전 필수)
- BFL: 가입 시 일부 크레딧 (변동)
- Vercel·Sentry·Amplitude·GHA: 영구 무료 tier 충분

### Q. 환불·보장은?
- AWS: 미사용 분 환불 (RI는 변경 가능)
- AI API: 환불 어려움 (사용분만 과금)
- SaaS: 보통 월 단위 해지

---

## 11. 관련 문서

- [phase1-blueprint.md](./phase1-blueprint.md) — 1단계 시스템 설계
- [mvp-roadmap.md](./mvp-roadmap.md) — 단계별 진화 (비용 추정 본 문서 참조)
- [tech-stack-catalog.md](./tech-stack-catalog.md) — 도구별 상세
- [multi-agent-design.md](./multi-agent-design.md) — 멀티에이전트 비용

---

## ⚠️ 주의 사항

- **본 문서의 가격은 2026-06 기준 추정치**. 실제 결제 전 **공식 사이트 확인 필수**.
- **환율·세금·지역별 가격 차이** 존재 (한국·미국·유럽 다름).
- **무료 tier·프로모션**은 변경되거나 종료될 수 있음.
- **사용량 추정**은 가정에 따라 크게 변동 — 운영 1~2개월 후 실측 권장.

---

**문서 버전**: v0.1 (2026-06-13 초안)
**다음 갱신**: 분기 1회 권장 또는 주요 가격 변동 시
