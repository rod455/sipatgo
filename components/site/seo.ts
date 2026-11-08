import type { Metadata } from "next";
import { absoluteUrl, CONTACT_EMAIL, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_LINKS } from "@/content/site/site";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Caminho de uma imagem OG específica; por padrão, /og com o título da página. */
  image?: string;
  /** Texto pequeno acima do título na imagem OG gerada. */
  ogEyebrow?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
};

/** Metadados padronizados das páginas públicas: canonical, Open Graph e Twitter. */
export function pageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const ogTitle = input.title.replace(/\s+[—|-]\s+SipatGo$/, "");
  const image =
    input.image ??
    `/og?title=${encodeURIComponent(ogTitle)}${input.ogEyebrow ? `&eyebrow=${encodeURIComponent(input.ogEyebrow)}` : ""}`;
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? "website",
      locale: "pt_BR",
      siteName: SITE_NAME,
      url,
      title: input.title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime ?? input.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    robots: input.noindex ? { index: false, follow: true } : undefined,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  const all = [{ name: "Início", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    email: CONTACT_EMAIL,
    slogan: "A SIPAT que todo mundo quer jogar.",
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web (navegador, celular e computador)",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    inLanguage: "pt-BR",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: "2200",
      highPrice: "3000",
      offerCount: 3,
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/precos"),
      description: "Por campanha: R$ 2.200 até 150 participantes, R$ 3.000 até 500, acima de 500 sob consulta.",
    },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  section?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: "pt-BR",
    articleSection: input.section,
    image: absoluteUrl(`/og?title=${encodeURIComponent(input.title)}`),
    author: { "@type": "Organization", name: input.author, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    },
  };
}
