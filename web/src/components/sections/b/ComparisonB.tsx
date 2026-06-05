import dynamic from "next/dynamic";
import { Check, X } from "lucide-react";

// 폰 캐러셀은 lazy 청크 분할로 First Load JS 감소.
// server component에서는 ssr:false 지정 불가 — SSR 시 정적 첫 프레임 렌더 후 client에서 interactive 시작.
const ComparisonBCarousel = dynamic(() => import("./ComparisonBCarousel"));

type Row = {
  label: string;
  old: string;
  ours: string;
};

const ROWS: ReadonlyArray<Row> = [
  {
    label: "코디 표현",
    old: "쇼핑몰 모델 사진 그대로",
    ours: "마네킹에 일관되게",
  },
  {
    label: "내 모습 반영",
    old: "남의 모델 사진뿐",
    ours: "나와 같은 체형의 마네킹",
  },
];

export function ComparisonB() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground text-center leading-[1.2]">
          <span className="text-accent">같은 코디,</span> 다른 느낌
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted text-pretty max-w-xl mx-auto text-center">
          뒤죽박죽 상상이 안 가는 코디는 이제 그만
          <br />
          눈으로 보고 한번에 딱!
        </p>

        <ComparisonBCarousel />

        <div className="mt-12 max-w-2xl mx-auto rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted w-24">
                  항목
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted">
                  기존 코디 앱
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-accent">
                  AI Coordinate
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={r.label}
                  className={i > 0 ? "border-t border-border" : ""}
                >
                  <td className="px-4 py-4 text-xs text-muted align-top">
                    {r.label}
                  </td>
                  <td className="px-4 py-4 align-top text-foreground/70 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <X
                        size={14}
                        className="mt-0.5 text-muted shrink-0"
                        aria-hidden
                      />
                      <span>{r.old}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-foreground font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 text-accent shrink-0"
                        aria-hidden
                      />
                      <span>{r.ours}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
