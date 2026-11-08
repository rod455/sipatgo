import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || "https://sipatgo.com.br"),
  title: { default: "SipatGo — SIPAT online gamificada em 5 dias", template: "%s" },
  description: "A SIPAT que todo mundo quer jogar. Vídeo, desafio e ranking ao vivo em 5 dias, com registro automático para a NR-5.",
  applicationName: "SipatGo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1F33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
