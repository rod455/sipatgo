import type { Feature } from "@/content/site/features";
import { cn } from "@/lib/utils";

/** Grade de recursos com ícone lucide (stroke 2, navy-500 ou orange-500). */
export function FeatureGrid({
  features,
  columns = 3,
  tone = "light",
  iconColor = "navy",
  compact = false,
  className,
}: {
  features: Feature[];
  columns?: 2 | 3 | 4;
  tone?: "light" | "dark";
  iconColor?: "navy" | "orange";
  compact?: boolean;
  className?: string;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  const dark = tone === "dark";
  return (
    <ul className={cn("grid gap-4", cols, className)}>
      {features.map((f) => (
        <li
          key={f.title}
          className={cn(
            "flex gap-4 rounded-2xl",
            compact ? "p-4" : "p-6",
            dark ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-sm ring-1 ring-sg-navy-900/5",
            !compact && "flex-col",
          )}
        >
          <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-xl", dark ? "bg-white/10" : "bg-sg-sand-100")}>
            <f.icon
              aria-hidden
              strokeWidth={2}
              className={cn("size-6", iconColor === "orange" || dark ? "text-sg-orange-500" : "text-sg-navy-500")}
            />
          </span>
          <div>
            <h3 className={cn("font-display font-bold", compact ? "text-base" : "text-lg", dark ? "text-white" : "text-sg-navy-900")}>{f.title}</h3>
            <p className={cn("mt-1 text-sm leading-6", dark ? "text-white/75" : "text-sg-gray-600")}>{f.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
