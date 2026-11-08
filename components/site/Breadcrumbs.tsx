import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd, type Crumb } from "./seo";

/** Trilha visível + schema BreadcrumbList. "Início" é adicionado automaticamente. */
export function Breadcrumbs({ crumbs, tone = "dark", className }: { crumbs: Crumb[]; tone?: "light" | "dark"; className?: string }) {
  const all = [{ name: "Início", path: "/" }, ...crumbs];
  const dark = tone === "dark";
  return (
    <>
      <nav aria-label="Você está em" className={cn("text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className={dark ? "text-white" : "text-sg-navy-900"}>
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className={cn("hover:underline", dark ? "text-white/70" : "text-sg-gray-600")}>
                    {c.name}
                  </Link>
                )}
                {!last ? <ChevronRight aria-hidden className={cn("size-3.5", dark ? "text-white/40" : "text-sg-gray-600/60")} /> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
