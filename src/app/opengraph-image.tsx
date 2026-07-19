import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0f1512 0%, #0a2e22 55%, #0a6b4c 100%)",
        padding: "64px 72px",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "#12946a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          SV
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>Stekkerbatterij Vergelijker</div>
          <div style={{ fontSize: 20, color: "#8fd8bd", letterSpacing: 2 }}>
            ONAFHANKELIJK · NEDERLAND
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
          Vergelijk stekkerbatterijen op prijs en specs
        </div>
        <div style={{ fontSize: 28, color: "#c8e9dc", maxWidth: 920 }}>
          Capaciteit, vermogen, garantie en actuele aanbieders. Zo kies je met vertrouwen.
        </div>
      </div>

      <div style={{ display: "flex", gap: 36, fontSize: 24, color: "#a7dcc8" }}>
        <span>Actuele prijzen</span>
        <span>Beslishulp</span>
        <span>Onafhankelijk</span>
      </div>
    </div>,
    { ...size },
  );
}
