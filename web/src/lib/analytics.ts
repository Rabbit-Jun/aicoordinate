import * as amplitude from "@amplitude/unified";
import { getPublicEnv } from "./env";

export type LandingVariant = "default" | "a" | "b";
// "pricing"은 2026-06-04~05 사이 발사 후 제거(구독 흐름 폐기 + Pricing 섹션 삭제).
// 과거 Amplitude 데이터에 존재하므로 차트 조회 시 참고.
export type ModalEntry =
  | "hero"
  | "final_cta"
  | "coordi_demo"
  | "closet_demo";
export type SectionName =
  | "pain"
  | "coordi_demo"
  | "closet_demo"
  | "mannequin"
  | "comparison"
  | "final_cta";
export type ModalStep = "email" | "done";

export type AnalyticsEvent =
  | { name: "landing_viewed"; props?: { variant?: LandingVariant } }
  | { name: "hero_cta_clicked"; props?: Record<string, unknown> }
  | { name: "waitlist_submit_attempt"; props?: Record<string, unknown> }
  | { name: "waitlist_submitted"; props?: Record<string, unknown> }
  | { name: "waitlist_failed"; props: { reason: string } }
  // 구독 흐름 폐기(2026-06-01). plan은 항상 "free", entry는 CTA 출처. 기존 퍼널 차트 호환 위해 이벤트명 유지.
  | { name: "plan_selected"; props: { plan: "free"; entry: ModalEntry } }
  // /b 분석 이벤트 (단계 4)
  | { name: "section_viewed"; props: { section: SectionName; variant: LandingVariant } }
  | { name: "section_time"; props: { section: SectionName; variant: LandingVariant; seconds: number } }
  | { name: "modal_step_viewed"; props: { step: ModalStep; entry: ModalEntry } }
  | { name: "modal_closed"; props: { step: ModalStep; entry: ModalEntry } };

let initialized = false;
let trackingDisabled = false;

// 명시적 킬스위치. 호출 즉시 모든 후속 init/track 차단.
export function setTrackingDisabled(disabled: boolean): void {
  trackingDisabled = disabled;
}

// pathname 자동 차단 — /a/dev, /b/dev 등 내부 열람용 라우트에서
// AnalyticsProvider가 우연히 포함되더라도 SDK init / 이벤트 발사 모두 차단.
function isOnDevRoute(): boolean {
  if (typeof window === "undefined") return false;
  return /\/dev(?:\/|$)/.test(window.location.pathname);
}

function isTrackingDisabled(): boolean {
  return trackingDisabled || isOnDevRoute();
}

export function initAnalytics(): void {
  if (isTrackingDisabled()) {
    console.debug("[dev] Amplitude init skipped (dev route or killswitch)");
    return;
  }
  if (initialized || typeof window === "undefined") return;
  try {
    const env = getPublicEnv();
    // initAll은 Promise를 반환하지만 SDK가 내부적으로 이벤트 큐잉을 처리하므로 await 불필요.
    amplitude.initAll(env.amplitudeApiKey, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
    initialized = true;
  } catch (e) {
    // 환경변수 누락 시에도 페이지는 동작해야 한다.
    console.warn("Amplitude 초기화 실패:", e);
  }
}

export function track(event: AnalyticsEvent): void {
  if (isTrackingDisabled()) {
    console.debug("[dev] event:", event.name, event.props);
    return;
  }
  if (!initialized) return;
  amplitude.track(event.name, event.props);
}

// 이탈 직전 이벤트 큐를 강제 전송. visibilitychange(hidden) / pagehide에서 호출.
// SDK 표면이 모듈별로 다를 수 있어 안전하게 옵셔널 호출.
export function flushAnalytics(): void {
  if (isTrackingDisabled() || !initialized) return;
  try {
    const sdk = amplitude as unknown as { flush?: () => void | Promise<unknown> };
    sdk.flush?.();
  } catch (e) {
    console.warn("Amplitude flush 실패:", e);
  }
}
