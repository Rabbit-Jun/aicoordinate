import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  label?: string;
  emphasis?: boolean;
};

// 디자인 HTML .hero-phone / .hp-notch / .hp-screen / .co-ui scale 패턴 1:1 매핑.
// 폰 내부 UI는 자연 360×680 캔버스 가정, scale(0.6444 = 232/360)로 화면에 맞춤.
// 폰 "외부" 색은 디자인 토큰과 동일값(#1A1410 = --foreground)이라 var 사용.

export function PhoneFrame({ children, label, emphasis = false }: Props) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{
          width: 250,
          background: "var(--foreground)" /* #1A1410 */,
          borderRadius: 40,
          padding: 9,
          boxShadow: emphasis
            ? "0 16px 36px rgba(26,20,16,0.22), 0 0 0 4px var(--accent)"
            : "0 16px 36px rgba(26,20,16,0.22)",
        }}
      >
        {/* .hp-notch — top 9px, w 96px, h 22px, radius 0 0 14px 14px, z 3 */}
        <span
          aria-hidden
          className="absolute"
          style={{
            top: 9,
            left: "50%",
            transform: "translateX(-50%)",
            width: 96,
            height: 22,
            background: "var(--foreground)",
            borderRadius: "0 0 14px 14px",
            zIndex: 3,
          }}
        />
        {/* .hp-screen — 232×438, radius 32 */}
        <div
          className="relative overflow-hidden bg-white"
          style={{ width: 232, height: 438, borderRadius: 32 }}
        >
          {/* 360×680 자연 캔버스, scale(0.6444 = 232/360) */}
          <div
            className="absolute"
            style={{
              top: 0,
              left: 0,
              width: 360,
              height: 680,
              transform: "scale(0.6444)",
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
      {label && (
        <figcaption
          className={
            "text-xs sm:text-sm font-semibold " +
            (emphasis ? "text-accent" : "text-muted")
          }
        >
          {label}
        </figcaption>
      )}
    </figure>
  );
}
