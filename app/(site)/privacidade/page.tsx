import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/components/site/seo";
import { LEGAL_UPDATED_AT, PRIVACY_SECTIONS } from "@/content/site/legal";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidade — SipatGo",
  description: "Como a SipatGo trata dados pessoais no site e na plataforma de campanhas, em conformidade com a LGPD.",
  path: "/privacidade",
});

export default function PrivacidadePage() {
  return <LegalPage title="Política de privacidade" path="/privacidade" updatedAt={LEGAL_UPDATED_AT} sections={PRIVACY_SECTIONS} />;
}
