import type { PlatformDynamic } from "@/content/site/dynamics";
import { cn } from "@/lib/utils";

/** Mini prévia animada de cada dinâmica (no lugar de GIF, em HTML/CSS). */
function Preview({ slug }: { slug: string }) {
  switch (slug) {
    case "fato-ou-fake":
      return (
        <div className="flex gap-2">
          <span className="flex-1 rounded-lg bg-white py-2 text-center text-xs font-bold text-sg-navy-900 ring-1 ring-sg-navy-900/10">Fato</span>
          <span className="flex-1 rounded-lg bg-sg-green-500 py-2 text-center text-xs font-bold text-sg-navy-900 motion-safe:animate-pulse">Fake ✓</span>
        </div>
      );
    case "acerte-em-tempo":
      return (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-sg-navy-900/10">
            <div className="h-full w-full origin-left rounded-full bg-sg-navy-500 motion-safe:animate-[sg-countdown_4s_linear_infinite]" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {["A", "B", "C", "D"].map((l) => (
              <span key={l} className={cn("rounded-md py-1 text-center text-[11px] font-bold", l === "C" ? "bg-sg-navy-900 text-white" : "bg-white text-sg-navy-900 ring-1 ring-sg-navy-900/10")}>
                {l}
              </span>
            ))}
          </div>
        </div>
      );
    case "encontre-os-erros":
      return (
        <div className="relative h-16 overflow-hidden rounded-lg bg-[linear-gradient(135deg,#dbe7f3,#f1ebe1)]">
          <span className="absolute top-2 left-3 h-8 w-10 rounded bg-sg-navy-500/30" />
          <span className="absolute right-4 bottom-2 h-6 w-14 rounded bg-sg-navy-900/20" />
          <span className="absolute top-3 left-6 size-6 rounded-full border-2 border-sg-red-500 motion-safe:animate-ping" />
          <span className="absolute right-8 bottom-3 size-5 rounded-full border-2 border-sg-green-500" />
        </div>
      );
    case "ligue-os-pares":
      return (
        <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-1 text-[11px] font-semibold">
          <span className="rounded-md bg-white px-2 py-1 text-sg-navy-900 ring-1 ring-sg-navy-900/10">Ruído</span>
          <span className="h-0.5 bg-sg-orange-500" />
          <span className="rounded-md bg-white px-2 py-1 text-sg-navy-900 ring-1 ring-sg-navy-900/10">Protetor</span>
          <span className="rounded-md bg-white px-2 py-1 text-sg-navy-900 ring-1 ring-sg-navy-900/10">Queda</span>
          <span className="h-0.5 bg-sg-navy-900/20" />
          <span className="rounded-md bg-white px-2 py-1 text-sg-navy-900 ring-1 ring-sg-navy-900/10">Cinto</span>
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          {["Ignorar e seguir", "Parar e avisar o líder", "Resolver sozinho"].map((o, i) => (
            <span key={o} className={cn("block rounded-md px-2 py-1 text-[11px] font-semibold", i === 1 ? "bg-sg-navy-900 text-white" : "bg-white text-sg-navy-900 ring-1 ring-sg-navy-900/10")}>
              {o}
            </span>
          ))}
        </div>
      );
  }
}

export function DynamicCard({ dynamic, className }: { dynamic: PlatformDynamic; className?: string }) {
  const Icon = dynamic.icon;
  return (
    <article className={cn("flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5", className)}>
      <div className="flex items-center justify-between">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-sg-sand-100">
          <Icon aria-hidden className="size-6 text-sg-orange-500" strokeWidth={2} />
        </span>
        <span className="text-xs font-semibold tracking-wide text-sg-gray-600 uppercase">{dynamic.day}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-sg-navy-900">{dynamic.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-6 text-sg-gray-600">{dynamic.oneLiner}</p>
      <div className="mt-4 rounded-xl bg-sg-sand-50 p-3" aria-hidden>
        <Preview slug={dynamic.slug} />
      </div>
    </article>
  );
}
