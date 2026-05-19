export type Variant = "A" | "B";

type SearchParamsLike =
  | { utm_content?: string | string[] }
  | undefined;

function firstValue(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

// utm_content에 "fit"이 포함되면 B, 그 외(closet 포함하거나 미지정)는 A.
// 클라이언트와 서버 어느 쪽에서 호출하든 동일한 결과를 보장하기 위해 같은 함수를 공유한다.
export function resolveVariant(searchParams: SearchParamsLike): Variant {
  if (!searchParams) return "A";
  const raw = firstValue(searchParams.utm_content);
  if (!raw) return "A";
  if (raw.toLowerCase().includes("fit")) return "B";
  return "A";
}
