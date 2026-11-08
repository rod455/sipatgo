import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Gamepad2, Lightbulb, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/sipat", icon: BookOpen, title: "Guia completo da SIPAT", text: "O que é, quem organiza e como montar." },
  { href: "/sipat/temas", icon: Lightbulb, title: "Temas para SIPAT", text: "50+ temas por categoria." },
  { href: "/sipat/dinamicas", icon: Gamepad2, title: "Dinâmicas para SIPAT", text: "20 ideias online e presenciais." },
  { href: "/sipat/cronograma", icon: CalendarDays, title: "Cronograma de 5 dias", text: "Modelo pronto para baixar." },
  { href: "/sipat/nr-5", icon: Scale, title: "SIPAT e NR-5", text: "O que a norma exige e como comprovar." },
];

/** Links cruzados do hub /sipat (exclui a página atual). */
export function SipatHubLinks({ current, className }: { current: string; className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {LINKS.filter((l) => l.href !== current).map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sg-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <l.icon aria-hidden className="size-6 text-sg-navy-500" strokeWidth={2} />
            <span className="mt-3 font-display font-bold text-sg-navy-900">{l.title}</span>
            <span className="mt-1 flex-1 text-sm text-sg-gray-600">{l.text}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sg-navy-500 group-hover:underline">
              Ler <ArrowRight aria-hidden className="size-4" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
