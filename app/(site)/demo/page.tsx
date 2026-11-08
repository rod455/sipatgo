import type { Metadata } from "next";
import { DemoPlayer } from "@/components/site/DemoPlayer";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/site/Section";
import { pageMetadata } from "@/components/site/seo";

export const metadata: Metadata = pageMetadata({
  title: "Demo jogável — experimente a SIPAT gamificada",
  description: "Jogue um dia de SIPAT em 2 minutos, sem login: vídeo, Fato ou Fake com bônus de velocidade, roleta de brindes e ranking ao vivo.",
  path: "/demo",
  keywords: ["demo sipat", "sipat online demonstração", "sipat gamificada exemplo"],
});

export default function DemoPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Demo", path: "/demo" }]}
        eyebrow="Demo jogável"
        title="Jogue um dia de SIPAT"
        lead="É assim que seus colaboradores vão viver cada dia da semana. Sem login, sem cadastro, em 2 minutos."
      />
      <section className="bg-white py-10 md:py-16">
        <Container className="max-w-3xl">
          <DemoPlayer />
        </Container>
      </section>
    </>
  );
}
