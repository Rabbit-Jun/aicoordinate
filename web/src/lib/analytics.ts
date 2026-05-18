import * as amplitude from "@amplitude/analytics-browser";
import { getPublicEnv } from "./env";

export type AnalyticsEvent =
  | { name: "landing_viewed"; props?: Record<string, unknown> }
  | { name: "hero_cta_clicked"; props?: Record<string, unknown> }
  | { name: "waitlist_submit_attempt"; props?: Record<string, unknown> }
  | { name: "waitlist_submitted"; props?: Record<string, unknown> }
  | { name: "waitlist_failed"; props: { reason: string } };

let initialized = false;

export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  try {
    const env = getPublicEnv();
    amplitude.init(env.amplitudeApiKey, {
      autocapture: { pageViews: true, sessions: true },
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
