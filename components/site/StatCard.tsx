import { cn } from "@/lib/utils";

export function StatCard({
  value,
  label,
  note,
  tone = "light",
  className,
}: {
  value: string;
  label: string;
  note?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("rounded-2xl p-5", dark ? "bg-white/5 ring-1 ring-white/10" : "bg-white shadow-sm ring-1 ring-sg-navy-900/5", className)}>
      <p className={cn("font-display text-3xl font-extrabold tabular md:text-4xl", dark ? "text-sg-yellow-400" : "text-sg-navy-900")}>{value}</p>
      <p className={cn("mt-1 text-sm font-semibold", dark ? "text-white" : "text-sg-navy-900")}>{label}</p>
      {note ? <p className={cn("mt-1 text-xs", dark ? "text-white/60" : "text-sg-gray-600")}>{note}</p> : null}
    </div>
  );
}
