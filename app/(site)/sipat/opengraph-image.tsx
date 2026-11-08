import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/components/site/og";

export const alt = "O que é SIPAT e como organizar — guia completo SipatGo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({ title: "O que é SIPAT e como organizar em 2026", eyebrow: "Guia completo" });
}
