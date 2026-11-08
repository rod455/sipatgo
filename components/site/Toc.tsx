import { cn } from "@/lib/utils";

/** Índice lateral (sticky no desktop, colapsável no mobile). */
export function Toc({ items, className, title = "Neste guia" }: { items: { id: string; title: string }[]; className?: string; title?: string }) {
  const list = (
    <ol className="space-y-1 text-sm">
      {items.map((it, i) => (
        <li key={it.id}>
          <a href={`#${it.id}`} className="flex gap-2 rounded-lg px-2 py-1.5 text-sg-gray-600 hover:bg-sg-sand-100 hover:text-sg-navy-900">
            <span className="w-5 shrink-0 font-semibold text-sg-navy-500 tabular">{i + 1}.</span>
            <span>{it.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <nav aria-label={title} className={cn("lg:sticky lg:top-24", className)}>
      <details className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sg-navy-900/5 lg:hidden">
        <summary className="cursor-pointer font-display font-bold text-sg-navy-900">{title}</summary>
        <div className="mt-3">{list}</div>
      </details>
      <div className="hidden lg:block">
        <p className="mb-3 px-2 text-xs font-semibold tracking-wide text-sg-navy-500 uppercase">{title}</p>
        {list}
      </div>
    </nav>
  );
}
