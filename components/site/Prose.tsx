import Link from "next/link";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import type { Block } from "@/content/site/blocks";
import { slugify } from "@/content/site/blocks";
import { cn } from "@/lib/utils";
import { CtaButton } from "./CtaButton";

/** Renderiza **negrito** e [links](href) dentro de um texto. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-sg-navy-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const cls = "font-medium text-sg-navy-500 underline decoration-sg-orange-500/60 underline-offset-4 hover:decoration-sg-orange-500";
          return href.startsWith("/") || href.startsWith("#") ? (
            <Link key={i} href={href} className={cls}>
              {label}
            </Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
              {label}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const calloutStyles = {
  info: { box: "border-sg-navy-500/30 bg-white", icon: Info, iconCls: "text-sg-navy-500" },
  warning: { box: "border-sg-yellow-400 bg-[#FFF8E1]", icon: AlertTriangle, iconCls: "text-sg-navy-900" },
  tip: { box: "border-sg-orange-500/40 bg-white", icon: Lightbulb, iconCls: "text-sg-orange-500" },
} as const;

export function Prose({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cn("space-y-5 text-lg leading-8 text-sg-navy-900/85", className)}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={b.id ?? slugify(b.text)} className="scroll-mt-24 pt-6 font-display text-2xl font-extrabold text-sg-navy-900 md:text-3xl">
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 font-display text-xl font-bold text-sg-navy-900">
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2 pl-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span aria-hidden className="mt-3 size-2 shrink-0 rounded-full bg-sg-orange-500" />
                    <span>
                      <Inline text={it} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sg-navy-900 font-display text-sm font-bold text-white"
                    >
                      {j + 1}
                    </span>
                    <span>
                      <Inline text={it} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "callout": {
            const s = calloutStyles[b.tone ?? "info"];
            const Icon = s.icon;
            return (
              <aside key={i} className={cn("flex gap-4 rounded-2xl border-2 p-5 text-base leading-7", s.box)}>
                <Icon aria-hidden className={cn("mt-1 size-5 shrink-0", s.iconCls)} strokeWidth={2} />
                <div>
                  {b.title ? <p className="font-semibold text-sg-navy-900">{b.title}</p> : null}
                  <p>
                    <Inline text={b.text} />
                  </p>
                </div>
              </aside>
            );
          }
          case "quote":
            return (
              <blockquote key={i} className="border-l-4 border-sg-orange-500 pl-5 font-display text-xl font-bold text-sg-navy-900">
                “{b.text}”
                {b.cite ? <footer className="mt-2 font-sans text-base font-normal text-sg-gray-600">— {b.cite}</footer> : null}
              </blockquote>
            );
          case "cta":
            return (
              <div key={i} className="flex flex-col gap-4 rounded-2xl bg-sg-navy-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                <p className="font-display text-lg font-bold">{b.text}</p>
                <CtaButton href={b.href} arrow trackLabel={`prose_${b.label}`}>
                  {b.label}
                </CtaButton>
              </div>
            );
        }
      })}
    </div>
  );
}
