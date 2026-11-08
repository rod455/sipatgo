import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";
import { Container } from "./Section";
import type { Crumb } from "./seo";

/** Hero navy das páginas internas, com breadcrumbs e H1. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
  className,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-sg-navy-900 text-white", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-[420px] rounded-full bg-sg-navy-500/30 blur-3xl"
      />
      <Container className="relative py-12 md:py-20">
        <Breadcrumbs crumbs={crumbs} />
        <div className={cn("mt-6", aside && "grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]")}>
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-sg-orange-500 uppercase">
                <span aria-hidden className="h-1.5 w-6 rounded-full bg-sg-orange-500" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-4xl leading-[44px] font-extrabold tracking-tight text-balance md:text-[56px] md:leading-[64px]">{title}</h1>
            {lead ? <p className="mt-5 max-w-2xl text-lg leading-7 text-pretty text-white/80">{lead}</p> : null}
            {children ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div> : null}
          </div>
          {aside ? <div className="min-w-0">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
