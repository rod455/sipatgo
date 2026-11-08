"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { HEADER_LINKS } from "@/content/site/nav";
import { cn } from "@/lib/utils";
import { CtaButton } from "./CtaButton";
import { Logo } from "./Logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-sg-navy-900/[.06] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sg-navy-900"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="SipatGo — página inicial" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo variant="symbol" className="size-8 min-[360px]:hidden" />
          <Logo className="hidden h-6 min-[360px]:block sm:h-7 md:h-8" />
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden xl:block">
          <ul className="flex items-center gap-1">
            {HEADER_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-semibold text-sg-navy-700 transition hover:bg-sg-sand-50 hover:text-sg-navy-900",
                    isActive(l.href) && "text-sg-navy-900 underline decoration-sg-orange-500 decoration-2 underline-offset-8",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="hidden rounded-lg px-3 py-2 text-[15px] font-semibold text-sg-navy-700 hover:text-sg-navy-900 xl:inline-block">
            Entrar
          </Link>
          <CtaButton href="/demo" variant="outline" size="sm" className="hidden md:inline-flex" trackLabel="header_ver_demo">
            Ver demo
          </CtaButton>
          <CtaButton href="/contato" size="sm" className="px-3 text-[13px] sm:px-4 sm:text-sm" trackLabel="header_monte_sua_sipat">
            Monte sua SIPAT
          </CtaButton>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-sg-navy-900 hover:bg-sg-sand-50 xl:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" strokeWidth={2} /> : <Menu className="size-6" strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-sg-navy-900/10 bg-white xl:hidden">
          <nav aria-label="Menu" className="mx-auto max-w-6xl px-4 py-4">
            <ul className="divide-y divide-sg-navy-900/10">
              {HEADER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-display text-lg font-bold text-sg-navy-900"
                  >
                    {l.label}
                    {isActive(l.href) ? <span aria-hidden className="size-2 rounded-full bg-sg-orange-500" /> : null}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sipat" onClick={() => setOpen(false)} className="flex py-4 font-display text-lg font-bold text-sg-navy-900">
                  Guia da SIPAT
                </Link>
              </li>
              <li>
                <Link href="/login" onClick={() => setOpen(false)} className="flex py-4 text-lg font-medium text-sg-navy-700">
                  Entrar
                </Link>
              </li>
            </ul>
            <div className="mt-6 grid gap-3" onClick={() => setOpen(false)}>
              <CtaButton href="/contato" size="lg" arrow trackLabel="menu_monte_sua_sipat">
                Monte sua SIPAT
              </CtaButton>
              <CtaButton href="/demo" variant="outline" size="lg" trackLabel="menu_ver_demo">
                Ver demo em 2 min
              </CtaButton>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
