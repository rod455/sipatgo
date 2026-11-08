import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  /** Use "dark" sobre fundo navy. */
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
  id?: string;
};

/** Eyebrow + H2 + lead. O eyebrow tem um detalhe laranja (cor só em detalhes). */
export function SectionHeading({ eyebrow, title, lead, align = "left", tone = "light", as = "h2", className, id }: SectionHeadingProps) {
  const Tag = as;
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto max-w-4xl text-center", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase",
            dark ? "text-sg-orange-500" : "text-sg-navy-500",
          )}
        >
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-sg-orange-500" />
          {eyebrow}
        </p>
      ) : null}
      <Tag
        id={id}
        className={cn(
          "font-display font-extrabold tracking-tight text-balance",
          as === "h1" ? "text-[40px] leading-[1.05] md:text-[64px]" : "text-[32px] leading-[1.08] md:text-[48px]",
          dark ? "text-white" : "text-sg-navy-900",
        )}
      >
        {title}
      </Tag>
      {lead ? (
        <p className={cn("mt-5 text-lg leading-8 text-pretty md:text-xl", dark ? "text-white/80" : "text-sg-navy-700/80")}>{lead}</p>
      ) : null}
    </div>
  );
}
