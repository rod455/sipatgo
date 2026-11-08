import Link from "next/link";
import { FOOTER_COLUMNS } from "@/content/site/nav";
import { CNPJ, CONTACT_EMAIL, COPYRIGHT_YEAR, SOCIAL_LINKS, TAGLINE } from "@/content/site/site";
import { Container } from "./Section";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print bg-sg-navy-900 text-white">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo variant="white" className="h-8" />
            <p className="mt-4 font-display text-lg font-bold">{TAGLINE}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Sua SIPAT em 5 dias, 100% digital. Vídeo, desafio e ranking ao vivo, com registro automático para a NR-5.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-block text-sm font-medium text-sg-orange-500 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase">{col.title}</h2>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-white/70 transition hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © SipatGo {COPYRIGHT_YEAR} · {CNPJ}
          </p>
          <ul className="flex flex-wrap gap-4">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
