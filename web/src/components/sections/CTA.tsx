import { WaitlistFormBlock } from "./WaitlistFormBlock";
import type { Variant } from "@/lib/variant";

type CtaContent = {
  title: { before: string; highlight: string; after: string };
  subtext: string;
  ctaButtonText: string;
  disclaimer: string;
};

const CTA_CONTENT: Record<Variant, CtaContent> = {
  A: {
    title: {
      before: "내 옷장이 매일 새로워지는 경험,\n",
      highlight: "가장 먼저",
      after: " 받아보세요",
    },
    subtext:
      "베타 대기열에 이름을 올리면, 정식 출시 전에 무료로 사용해보실 수 있어요.\n입력은 이메일 1개만.",
    ctaButtonText: "베타 대기열 등록 (30초)",
    disclaimer:
      "이메일 외 어떤 정보도 받지 않습니다. 정식 출시 전 1회 안내 메일만 발송됩니다. 언제든 구독 해지 가능.",
  },
  B: {
    title: {
      before: "다음 옷,\n사기 전에 ",
      highlight: "내 모습",
      after: "으로 먼저 확인하세요",
    },
    subtext:
      "베타 대기열에 등록하면 정식 출시 전 무료로 가상 피팅을 사용해보실 수 있어요.\n사진 1장이면 시작.",
    ctaButtonText: "내 모습으로 입어보기 (베타 신청)",
    disclaimer:
      "내 사진은 본인만 볼 수 있고, 탈퇴 시 즉시 삭제됩니다. 외부 공유·판매는 절대 없습니다.",
  },
};

export function CTASection({ variant }: { variant: Variant }) {
  const content = CTA_CONTENT[variant];

  return (
    <section
      id="waitlist"
      className="bg-dark text-white"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-28 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold tracking-tight text-balance whitespace-pre-line leading-[1.2]">
          {content.title.before}
          <span className="text-accent">{content.title.highlight}</span>
          {content.title.after}
        </h2>
        <p className="mt-5 text-base sm:text-lg text-white/70 text-pretty whitespace-pre-line max-w-xl mx-auto">
          {content.subtext}
        </p>

        <div className="mt-9 flex justify-center">
          <WaitlistFormBlock
            variant={variant}
            ctaText={content.ctaButtonText}
          />
        </div>

        <p className="mt-6 text-xs text-white/50 leading-relaxed max-w-xl mx-auto">
          {content.disclaimer}
        </p>
      </div>
    </section>
  );
}
