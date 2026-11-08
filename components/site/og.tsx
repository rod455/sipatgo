import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Imagem Open Graph no padrão da marca (navy + laranja). */
export function renderOgImage({ title, eyebrow = "sipatgo.com.br" }: { title: string; eyebrow?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B1F33",
          padding: "64px 72px",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#13385C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF6A13",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            »
          </div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 800, letterSpacing: -1 }}>
            <span>Sipat</span>
            <span style={{ color: "#FF6A13" }}>Go</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#FF6A13", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{eyebrow}</div>
          <div style={{ display: "flex", fontSize: title.length > 48 ? 60 : 72, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26, color: "rgba(255,255,255,.75)" }}>
          <span>A SIPAT que todo mundo quer jogar.</span>
          <div style={{ display: "flex", gap: 10 }}>
            {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d, i) => (
              <div
                key={d}
                style={{
                  display: "flex",
                  padding: "8px 14px",
                  borderRadius: 12,
                  background: i === 0 ? "#FF6A13" : "rgba(255,255,255,.1)",
                  color: i === 0 ? "#0B1F33" : "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
