import type { ReactNode } from "react";
import type { PainCard } from "@/components/sections/b/PainB";

// A 카피 — FIXES_A 6건 교정 반영. /a 와 /a/dev 양쪽에서 import.

export const HEADLINE_A: ReactNode = (
  <>
    옷장에 옷은 많은데,
    <br />
    <span className="text-accent">어떤 옷들이 있었더라?</span>
  </>
);

export const SUB_A: ReactNode = (
  <>
    당신의 비서가 옷장 속 수많은 옷을,
    <br />
    기록하고 보여드립니다.
  </>
);

export const PAIN_HEADLINE_A: ReactNode = "수많은 옷, 기억하기 쉽지 않죠?";

export const PAIN_CARDS_A: ReadonlyArray<PainCard> = [
  {
    tone: "yellow",
    lead: "“옷장엔 쌓아두고, 머릿속엔 비워두고”",
    body: "옷장에 옷을 쌓아두다 정리할 때가 와서야 ‘아 맞다 이런 옷이 있었지!’",
  },
  {
    tone: "blue",
    lead: "“쇼핑한 옷들이 내 옷들과 맞을지 걱정이에요”",
    body: "즐겁게 구경하다가도 막상 구매하려 하면 집에 있는 내 옷들과 어울릴지 걱정이에요ㅠ.ㅜ",
  },
  {
    tone: "green",
    lead: "“옷장 정리하자는 다짐만 수십 번인가요?”",
    body: "안 입는 옷은 버리거나 중고거래하고 싶은데 너무 많은 옷에 정리할 엄두가 안 나요",
  },
];
