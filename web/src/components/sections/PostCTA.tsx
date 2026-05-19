import { Check } from "lucide-react";
import type { Variant } from "@/lib/variant";

const DELIGHTER: Record<Variant, string> = {
  A: "기다리는 동안 옷장 사진 미리 정리해두시면 출시 직후 바로 시작할 수 있어요. 👕",
  B: "기다리는 동안 사고 싶은 옷의 사진을 모아두세요. 출시 직후 첫 미리보기에 쓰실 수 있어요. 📸",
};

const REASSURANCE = [
  "정식 출시 시 가장 먼저 안내 메일을 보내드립니다.",
  "베타는 100% 무료. 카드 정보는 받지 않습니다.",
  "기다리는 동안 추가로 받을 메일은 없습니다.",
];

const NEXT_STEPS: ReadonlyArray<{ icon: string; text: string }> = [
  {
    icon: "📧",
    text: "입력하신 이메일로 등록 확인 메일을 보냈어요. 받은편지함을 확인해주세요.",
  },
  {
    icon: "📱",
    text: "정식 출시까지 약 6~8주 예상. 그때 다시 만나요.",
  },
];

export function PostCTA({ variant }: { variant: Variant }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 text-left text-white"
    >
      <div className="text-center">
        <p className="text-2xl font-bold">🎉 등록 완료!</p>
        <p className="mt-1.5 text-sm text-white/70">
          베타 슬롯이 배정되었어요.
        </p>
      </div>

      <Divider />

      <ul className="space-y-2.5">
        {REASSURANCE.map((r) => (
          <li
            key={r}
            className="flex items-start gap-2.5 text-sm text-white/85"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 mt-0.5 shrink-0">
              <Check size={12} className="text-accent" aria-hidden />
            </span>
            <span className="leading-relaxed">{r}</span>
          </li>
        ))}
      </ul>

      <Divider />

      <ul className="space-y-2.5">
        {NEXT_STEPS.map((s) => (
          <li
            key={s.text}
            className="flex items-start gap-2.5 text-sm text-white/85"
          >
            <span aria-hidden className="shrink-0 leading-snug">
              {s.icon}
            </span>
            <span className="leading-relaxed">{s.text}</span>
          </li>
        ))}
      </ul>

      <Divider />

      <p className="text-sm text-accent leading-relaxed">
        {DELIGHTER[variant]}
      </p>
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="my-5 h-px bg-white/10" />;
}
