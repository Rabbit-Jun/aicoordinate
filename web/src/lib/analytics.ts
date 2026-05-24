import * as amplitude from "@amplitude/unified";
import { getPublicEnv } from "./env";

export type LandingVariant = "default" | "a" | "b";

export type AnalyticsEvent =
  | { name: "landing_viewed"; props?: { variant?: LandingVariant } }
  | { name: "hero_cta_clicked"; props?: Record<string, unknown> }
  | { name: "waitlist_submit_attempt"; props?: Record<string, unknown> }
  | { name: "waitlist_submitted"; props?: Record<string, unknown> }
  | { name: "waitlist_failed"; props: { reason: string } }
  | { name: "plan_selected"; props: { plan: "free" | "subscribe" } };

let initialized = false;

export function initAnalytics(): void {
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
  if (!initialized) return;
  amplitude.track(event.name, event.props);
}
