import { ImageResponse } from "next/og"
import { siteConfig } from "./site-config"

export const alt = siteConfig.ogAlt
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at 50% 35%, rgba(0,216,255,0.32), transparent 38%), linear-gradient(180deg, #131a2d 0%, #090a16 58%, #03050a 100%)",
          color: "#f5fbff",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              border: "2px solid rgba(123,231,255,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(0,216,255,0.28)",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: "#f5fbff",
                boxShadow:
                  "0 0 0 18px rgba(0,216,255,0.18), 0 0 0 40px rgba(0,216,255,0.1)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, letterSpacing: 8, color: "#7be7ff" }}>
              SONAR
            </div>
            <div style={{ fontSize: 20, color: "rgba(245,251,255,0.72)" }}>
              Particle Universe
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 920,
          }}
        >
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02 }}>
            Gesture-controlled particles with cinematic depth
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(245,251,255,0.8)",
            }}
          >
            Interactive 3D particle motion, hand tracking, and immersive controls
            built with Next.js and Three.js.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "rgba(245,251,255,0.66)",
          }}
        >
          <div>visionary particle interface</div>
          <div>sonar experience</div>
        </div>
      </div>
    ),
    size,
  )
}
