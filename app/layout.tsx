import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || "https://www.sipatgo.com.br"),
  title: { default: "SipatGo — SIPAT online gamificada em 5 dias", template: "%s" },
  description: "A SIPAT que todo mundo quer jogar. Vídeo, desafio e ranking ao vivo em 5 dias, somados às ações presenciais da CIPA.",
  applicationName: "SipatGo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1F33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
