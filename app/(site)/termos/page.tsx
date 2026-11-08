import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/components/site/seo";
import { LEGAL_UPDATED_AT, TERMS_SECTIONS } from "@/content/site/legal";

export const metadata: Metadata = pageMetadata({
  title: "Termos de uso — SipatGo",
  description: "Termos de uso do site e da plataforma SipatGo.",
  path: "/termos",
});

export default function TermosPage() {
  return <LegalPage title="Termos de uso" path="/termos" updatedAt={LEGAL_UPDATED_AT} sections={TERMS_SECTIONS} />;
}
