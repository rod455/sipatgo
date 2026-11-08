import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/components/site/og";

export const alt = "SipatGo — A SIPAT que todo mundo quer jogar";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderOgImage({ title: "SIPAT online gamificada em 5 dias", eyebrow: "Vídeo · Desafio · Ranking ao vivo" });
}
