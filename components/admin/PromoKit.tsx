"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button, Card, Input } from "@/components/ui";
import { readableOn } from "@/lib/theme";
import { Copy, Download } from "lucide-react";

type Props = {
  url: string; qrSvg: string; qrPng: string;
  company: { name: string; logo: string | null; primary: string; secondary: string; accent: string; slug: string };
  campaign: { name: string; theme: string; period: string; time: string };
};

export function PromoKit({ url, qrSvg, qrPng, company, campaign }: Props) {
  const [copied, setCopied] = useState(false);
  const poster = useRef<HTMLDivElement>(null), banner = useRef<HTMLDivElement>(null), square = useRef<HTMLDivElement>(null);
  const fg = readableOn(company.primary);
  const accentFg = readableOn(company.accent);

  async function download(el: HTMLDivElement | null, name: string) {
    if (!el) return;
    const data = await toPng(el, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a"); a.href = data; a.download = `${company.slug}-${name}.png`; a.click();
  }
  const save = (data: string, name: string) => { const a = document.createElement("a"); a.href = data; a.download = name; a.click(); };

  const Logo = ({ size = 48 }: { size?: number }) => company.logo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={company.logo} alt="" crossOrigin="anonymous" style={{ height: size, width: "auto", background: "#fff", borderRadius: 8, padding: 4 }} />
    : <span style={{ fontWeight: 800, fontSize: size * 0.5 }}>{company.name}</span>;
  const Qr = ({ size }: { size: number }) => <div style={{ width: size, height: size, background: "#fff", padding: 8, borderRadius: 12 }} className="[&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-4">
        <div className="w-28 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
        <div className="min-w-64 flex-1 space-y-2">
          <p className="text-sm font-semibold">Link da campanha</p>
          <div className="flex gap-2"><Input readOnly value={url} /><Button variant="outline" onClick={() => { void navigator.clipboard.writeText(url); setCopied(true); }}><Copy className="h-4 w-4" />{copied ? "Copiado" : "Copiar"}</Button></div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => save(qrPng, `${company.slug}-qrcode.png`)}><Download className="h-4 w-4" /> QR PNG</Button>
            <Button size="sm" variant="outline" onClick={() => save(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`, `${company.slug}-qrcode.svg`)}><Download className="h-4 w-4" /> QR SVG</Button>
          </div>
        </div>
      </Card>

      <Section title="Cartaz A4" onDownload={() => download(poster.current, "cartaz-a4")}>
        <div className="origin-top-left scale-[.42] sm:scale-50" style={{ width: 794, height: 1123 }}>
          <div ref={poster} style={{ width: 794, height: 1123, background: `linear-gradient(160deg, ${company.primary}, ${company.secondary})`, color: fg, fontFamily: "var(--font-sora), sans-serif", padding: 64, display: "flex", flexDirection: "column" }}>
            <Logo size={72} />
            <p style={{ marginTop: 80, fontSize: 28, fontWeight: 700, opacity: .85, letterSpacing: 2, textTransform: "uppercase" }}>{campaign.name}</p>
            <p style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 16 }}>{campaign.theme || "Segurança que vira jogo"}</p>
            <p style={{ fontSize: 30, marginTop: 32, opacity: .9 }}>5 dias · vídeo + desafio + ranking ao vivo · roleta de brindes</p>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
              <div>
                <p style={{ display: "inline-block", background: company.accent, color: accentFg, borderRadius: 16, padding: "12px 24px", fontSize: 34, fontWeight: 800 }}>{campaign.period}</p>
                <p style={{ fontSize: 24, marginTop: 20 }}>Todo dia às {campaign.time}. Entre com seu CPF:</p>
                <p style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{url.replace(/^https?:\/\//, "")}</p>
              </div>
              <Qr size={240} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Banner de e-mail (600×200)" onDownload={() => download(banner.current, "banner-email")}>
        <div ref={banner} style={{ width: 600, height: 200, background: company.primary, color: fg, fontFamily: "var(--font-sora), sans-serif", display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, opacity: .85, textTransform: "uppercase", letterSpacing: 1 }}>{campaign.name} · {campaign.period}</p>
            <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginTop: 6 }}>{campaign.theme || "A SIPAT começou!"}</p>
            <p style={{ display: "inline-block", marginTop: 12, background: company.accent, color: accentFg, borderRadius: 999, padding: "6px 16px", fontSize: 14, fontWeight: 800 }}>Jogue agora →</p>
          </div>
          <Qr size={150} />
        </div>
      </Section>

      <Section title="Post quadrado (1080×1080)" onDownload={() => download(square.current, "post")}>
        <div className="origin-top-left scale-[.3] sm:scale-[.45]" style={{ width: 1080, height: 1080 }}>
          <div ref={square} style={{ width: 1080, height: 1080, background: `radial-gradient(circle at 30% 20%, ${company.secondary}, ${company.primary})`, color: fg, fontFamily: "var(--font-sora), sans-serif", padding: 80, display: "flex", flexDirection: "column" }}>
            <Logo size={80} />
            <p style={{ fontSize: 110, fontWeight: 800, lineHeight: 1, marginTop: 90 }}>Vem jogar a SIPAT!</p>
            <p style={{ fontSize: 44, marginTop: 30, opacity: .9 }}>{campaign.theme}</p>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <p style={{ background: company.accent, color: accentFg, borderRadius: 24, padding: "18px 36px", fontSize: 48, fontWeight: 800 }}>{campaign.period}</p>
              <Qr size={260} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, onDownload, children }: { title: string; onDownload: () => void; children: React.ReactNode }) {
  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="flex items-center justify-between"><h2 className="font-display font-bold">{title}</h2><Button size="sm" onClick={onDownload}><Download className="h-4 w-4" /> Baixar PNG</Button></div>
      <div className="max-h-[560px] overflow-hidden rounded-xl bg-slate-100 p-3">{children}</div>
    </Card>
  );
}
