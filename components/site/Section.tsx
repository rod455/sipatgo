import { cn } from "@/lib/utils";

type Tone = "white" | "sand" | "navy";

const tones: Record<Tone, string> = {
  white: "bg-white",
  sand: "bg-sg-sand-50",
  navy: "bg-sg-navy-900 text-white",
};

/** Seção com fundo da marca (alternar sand-50 e branco; navy só em hero/CTA final). */
export function Section({
  tone = "white",
  className,
  containerClassName,
  children,
  id,
  ...rest
}: { tone?: Tone; className?: string; containerClassName?: string; children: React.ReactNode; id?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} className={cn(tones[tone], "py-16 md:py-24", className)} {...rest}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Container com gutter de 16px no mobile. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
