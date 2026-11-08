import { BarChart3, FileCheck2, Gamepad2, Headset, Megaphone, ShieldCheck, Trophy } from "lucide-react";
import { Logo } from "./Logo";

const ITEMS = [
  { icon: null, text: "Método SipatGo de 5 dias, integrado às ações presenciais da CIPA" },
  { icon: Gamepad2, text: "5 dinâmicas e games da família prontos para editar" },
  { icon: BarChart3, text: "Painel para o RH conduzir a campanha e app para os trabalhadores" },
  { icon: Megaphone, text: "Kit de divulgação completo: cartaz, banner e post com QR" },
  { icon: Trophy, text: "Ranking ao vivo individual e por setor, roleta de brindes" },
  { icon: FileCheck2, text: "Lista de presença e relatório final para a documentação da CIPA" },
  { icon: Headset, text: "Suporte técnico e operacional durante a semana" },
  { icon: ShieldCheck, text: "Dados protegidos e consentimento conforme a LGPD" },
];

/** Divisórias: 1 coluna (mobile), 2 (sm) e 4 (lg). */
function dividers(i: number) {
  const c: string[] = [];
  if (i === 1) c.push("border-t sm:border-t-0");
  else if (i >= 2) c.push("border-t");
  if (i % 2 === 1) c.push("sm:border-l");
  c.push(i % 4 !== 0 ? "lg:border-l" : "lg:border-l-0");
  c.push(i >= 4 ? "lg:border-t" : "lg:border-t-0");
  return c.join(" ");
}

/** Painel "tudo incluso": grade 4×2 com ícones de traço e divisórias finas. */
export function IncludedPanel() {
  return (
    <div className="rounded-[40px] bg-[#EEF0FA] px-4 py-6 md:px-10 md:py-10">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <li
            key={it.text}
            className={`flex flex-col items-center gap-5 border-sg-navy-900/10 px-6 py-8 text-center ${dividers(i)}`}
          >
            {it.icon ? (
              <it.icon aria-hidden className="size-14 text-sg-navy-700" strokeWidth={1.5} />
            ) : (
              <Logo variant="symbol" className="size-14" />
            )}
            <p className="max-w-[230px] text-[17px] leading-7 text-sg-navy-900">{it.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
