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
        padding: "72px",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: "linear-gradient(135deg, #12946a, #0a6b4c)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
          }}
        >
          ⚡
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Stekkerbatterij Vergelijker</div>
          <div style={{ fontSize: 22, color: "#8fd8bd", letterSpacing: 4 }}>
            ONAFHANKELIJK VERGELIJKEN
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 960 }}>
          Vind de beste stekkerbatterij voor jouw situatie
        </div>
        <div style={{ fontSize: 30, color: "#c8e9dc", maxWidth: 900 }}>
          Vergelijk plug-and-play thuisbatterijen op prijs, capaciteit, vermogen en garantie.
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#a7dcc8" }}>
        <span>Onafhankelijk</span>
        <span>Actuele prijzen</span>
        <span>Prijshistorie</span>
      </div>
    </div>,
    { ...size },
  );
}
