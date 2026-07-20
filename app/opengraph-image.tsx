import { ImageResponse } from "next/og"

export const alt = "Solum Safety Consulting — Building Safety from the Ground Up."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#2c3829",
          backgroundImage:
            "radial-gradient(900px 500px at 82% -10%, rgba(215,178,94,0.22), transparent), linear-gradient(150deg, #2c3829 0%, #24301f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2c3829, #6b7350)",
              color: "#d7b25e",
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 4,
                color: "#fbf7ee",
              }}
            >
              SOLUM SAFETY
            </span>
            <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: 8, color: "#d7b25e" }}>
              CONSULTING
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 4, background: "#b05b38", borderRadius: 2 }} />
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, color: "#d7b25e" }}>
              WHS &amp; OHS CONSULTANTS · AUSTRALIA
            </span>
          </div>
          <span
            style={{
              fontSize: 74,
              fontWeight: 800,
              color: "#fbf7ee",
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            Building Safety from the Ground Up.
          </span>
        </div>

        {/* Footer strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 26, color: "#c4c7b4" }}>
            Gap analysis · System development · Licensed WHS templates
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
