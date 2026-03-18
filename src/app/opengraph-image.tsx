import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "みちびき 導 - AIが見つける、最適な仕事と人材";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e0e7ff 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 700,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1,
          }}
        >
          導
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1e1b4b",
            marginTop: 16,
            letterSpacing: "0.1em",
          }}
        >
          みちびき
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            marginTop: 16,
          }}
        >
          AIが見つける、最適な仕事と人材
        </div>
      </div>
    ),
    { ...size }
  );
}
