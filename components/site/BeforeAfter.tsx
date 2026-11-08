import { CheckCircle2, XCircle } from "lucide-react";

const BEFORE = [
  "Palestra única no auditório",
  "Lista de presença no papel",
  "Adesão baixa, muitas vezes perto de 30%",
  "Ninguém lembra na semana seguinte",
  "Outros turnos ficam de fora",
];

const AFTER = [
  "5 dias no celular, 5 minutos por dia",
  "Presença registrada automaticamente",
  "Meta de 80%+ de adesão com ranking por setor",
  "Aprendizado medido pergunta a pergunta",
  "Todos os turnos e unidades jogam",
];

export function BeforeAfter() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-sg-navy-900/10 md:p-8">
        <p className="text-sm font-semibold tracking-wide text-sg-gray-600 uppercase">SIPAT de sempre</p>
        <ul className="mt-5 space-y-4">
          {BEFORE.map((b) => (
            <li key={b} className="flex gap-3 text-base text-sg-gray-600">
              <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-sg-red-500" strokeWidth={2} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-sg-navy-900 p-6 text-white shadow-xl md:p-8">
        <p className="text-sm font-semibold tracking-wide text-sg-orange-500 uppercase">SIPAT com SipatGo</p>
        <ul className="mt-5 space-y-4">
          {AFTER.map((a) => (
            <li key={a} className="flex gap-3 text-base font-medium">
              <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-sg-green-500" strokeWidth={2} />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
