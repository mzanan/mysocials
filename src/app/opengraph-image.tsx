import { ImageResponse } from "next/og";

export const alt = "Matias Zanan — All my socials in one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#a78bfa",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          links.itsmatias.com
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: 24,
          }}
        >
          Matias Zanan
        </div>
        <div
          style={{
            fontSize: 44,
            color: "#e9d5ff",
            marginTop: 16,
            fontWeight: 600,
          }}
        >
          All my socials in one place
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#cbd5e1",
            marginTop: 48,
            maxWidth: 1000,
            lineHeight: 1.35,
          }}
        >
          Personal · Dev
        </div>
      </div>
    ),
    { ...size },
  );
}
