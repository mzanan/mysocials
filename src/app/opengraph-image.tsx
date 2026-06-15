import { ImageResponse } from "next/og";

export const alt = "mySocials — Your whole world, one link";
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
          padding: "90px",
          background:
            "linear-gradient(135deg, #1a1730 0%, #3b2f7a 48%, #1a1730 100%)",
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
            fontSize: 116,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: 24,
            color: "#ffffff",
          }}
        >
          mySocials
        </div>
        <div
          style={{
            fontSize: 46,
            color: "#e9d5ff",
            marginTop: 20,
            fontWeight: 600,
          }}
        >
          Your whole world, one link.
        </div>
      </div>
    ),
    { ...size },
  );
}
