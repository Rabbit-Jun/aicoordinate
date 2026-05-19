import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 } as const;

const FONT_BOLD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf";
const FONT_REGULAR =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Regular.otf";

// 폰트 fetch는 실패해도 OG 자체는 동작해야 한다 (system-ui로 폴백).
// 한 번 fetch하면 Edge cache에 남아 다음 요청부터 빠르다.
async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const r = await fetch(url, { cache: "force-cache" });
    if (!r.ok) return null;
    return await r.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET() {
  const [fontBold, fontRegular] = await Promise.all([
    loadFont(FONT_BOLD),
    loadFont(FONT_REGULAR),
  ]);

  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }> = [];
  if (fontBold)
    fonts.push({
      name: "Pretendard",
      data: fontBold,
      weight: 700,
      style: "normal",
    });
  if (fontRegular)
    fonts.push({
      name: "Pretendard",
      data: fontRegular,
      weight: 400,
      style: "normal",
    });

  const fontFamily =
    fonts.length > 0
      ? "Pretendard, system-ui, sans-serif"
      : "system-ui, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 96,
          background:
            "linear-gradient(135deg, #fafafa 0%, #ffffff 55%, #eef0ff 100%)",
          fontFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 22px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "#4f46e5",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            베타 사용자 모집 중
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 32,
              color: "#0a0a0a",
              fontSize: 108,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
            }}
          >
            <div style={{ display: "flex" }}>내 옷장으로,</div>
            <div style={{ display: "flex" }}>AI가 코디한다.</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 40,
              fontSize: 34,
              color: "#525866",
              lineHeight: 1.45,
              maxWidth: 920,
            }}
          >
            <div style={{ display: "flex" }}>
              내 옷 사진을 올리면, AI가 어울리는 코디를
            </div>
            <div style={{ display: "flex" }}>합성해서 보여줍니다.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#6b7280",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, color: "#0a0a0a" }}>
            Coordi
          </div>
          <div style={{ display: "flex" }}>aicoordinate.vercel.app</div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts,
    },
  );
}
