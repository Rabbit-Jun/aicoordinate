import { Check } from "lucide-react";

const CHECKS = [
  "네 가지 방식으로 간편하게 옷 등록",
  "마네킹이 입은 모습으로 핏·실루엣까지 한눈에",
];

export function MannequinB() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance leading-[1.2] text-accent">
          상상하지 마세요.
          <br />
          직접 보세요
        </h2>
        <ul className="mt-10 flex flex-col gap-3 max-w-md mx-auto">
          {CHECKS.map((c) => (
            <li
              key={c}
              className="flex items-start gap-3 text-left text-base sm:text-lg text-foreground leading-relaxed"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 mt-0.5 shrink-0">
                <Check size={16} className="text-accent" aria-hidden />
              </span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
