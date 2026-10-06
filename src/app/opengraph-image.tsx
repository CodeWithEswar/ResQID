import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "ResQ — Biometric Face Search & Lead Verification";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#07070a",
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(124, 58, 237, 0.28) 0%, transparent 55%), radial-gradient(circle at 85% 82%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)",
          padding: "56px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #a78bfa, #7c3aed, #4c1d95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.45)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                ResQ
              </span>
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  color: "#c4b5fd",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                Biometric Rescue Workspace
              </span>
            </div>
          </div>

          {/* Operational Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 18px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34d399",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <span>Operational · Ready</span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "980px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#c4b5fd",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Critical Search & Reunification System
          </div>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              color: "#fafafa",
              margin: 0,
            }}
          >
            Biometric Face Search & Lead Verification
          </h1>
          <p
            style={{
              fontSize: "21px",
              lineHeight: 1.45,
              color: "#a1a1aa",
              margin: 0,
              maxWidth: "840px",
            }}
          >
            Bring missing-person registry cases, YuNet face alignment, pretrained SFace recognition, and verified human audit workflows together in one unified workspace.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                color: "#e4e4e7",
                fontWeight: 600,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#a78bfa">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>SFace Neural Biometrics</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                color: "#e4e4e7",
                fontWeight: 600,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#a78bfa">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>Real-time Live Camera</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                color: "#e4e4e7",
                fontWeight: 600,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#a78bfa">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>Independent Review Queue</span>
            </div>
          </div>

          <div
            style={{
              fontSize: "14px",
              color: "#71717a",
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            resq.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
