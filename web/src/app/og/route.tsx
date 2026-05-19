import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 } as const;

export async function GET() {
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
          fontFamily: "system-ui, sans-serif",
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
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
            }}
          >
            <div style={{ display: "flex" }}>내 옷장으로,</div>
            <div style={{ display: "flex" }}>AI가 코디한다.</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 36,
              fontSize: 32,
              color: "#525866",
              lineHeight: 1.45,
              maxWidth: 900,
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
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, color: "#0a0a0a" }}>
            Coordi
          </div>
          <div style={{ display: "flex" }}>aicoordinate.vercel.app</div>
        </div>
      </div>
    ),
    SIZE,
  );
}
