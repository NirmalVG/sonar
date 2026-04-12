import { ImageResponse } from "next/og"
import { siteConfig } from "./site-config"

export const alt = siteConfig.ogAlt
export const size = {
  width: 1200,
  height: 600,
}

export const contentType = "image/png"

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "44px 56px",
          background:
            "radial-gradient(circle at 28% 45%, rgba(0,216,255,0.34), transparent 28%), linear-gradient(135deg, #0d1020 0%, #071019 100%)",
          color: "#f5fbff",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 700,
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 7, color: "#7be7ff" }}>
            SONAR
          </div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.04 }}>
            Particle Universe
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(245,251,255,0.82)",
            }}
          >
            Hand-tracked particle control with responsive 3D motion.
          </div>
        </div>

        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 999,
            border: "2px solid rgba(123,231,255,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 70px rgba(0,216,255,0.24)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#f5fbff",
              boxShadow:
                "0 0 0 24px rgba(0,216,255,0.18), 0 0 0 60px rgba(123,231,255,0.11), 0 0 0 98px rgba(0,216,255,0.08)",
            }}
          />
        </div>
      </div>
    ),
    size,
  )
}
