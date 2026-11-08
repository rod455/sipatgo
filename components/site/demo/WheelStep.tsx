"use client";

import { useRef, useState } from "react";
import { Gift } from "lucide-react";
import { DEMO_CLIENT } from "@/content/site/demo-client";
import { WHEEL_SLICES } from "./config";

const COLORS = [DEMO_CLIENT.primary, DEMO_CLIENT.secondary, DEMO_CLIENT.accent, "#0F172A"];
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function fakeCode(): string {
  const pick = () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `DEMO-${pick()}${pick()}${pick()}${pick()}`;
}

function Wheel({ rotation, spinning }: { rotation: number; spinning: boolean }) {
  const r = 100;
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <span
        aria-hidden
        className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 border-x-[14px] border-t-[26px] border-x-transparent border-t-sg-navy-900 drop-shadow"
      />
      <svg
        viewBox="-110 -110 220 220"
        className="w-full drop-shadow-xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
        }}
        aria-hidden
      >
        <circle r="108" fill="#fff" />
        {Array.from({ length: WHEEL_SLICES }).map((_, i) => {
          const a0 = (i / WHEEL_SLICES) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((i + 1) / WHEEL_SLICES) * Math.PI * 2 - Math.PI / 2;
          const mid = (a0 + a1) / 2;
          const fill = COLORS[i % COLORS.length];
          const textFill = fill === DEMO_CLIENT.accent ? "#0F172A" : "#fff";
          return (
            <g key={i}>
              <path
                d={`M0 0 L${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)} Z`}
                fill={fill}
              />
              <text
                x={(62 * Math.cos(mid)).toFixed(2)}
                y={(62 * Math.sin(mid)).toFixed(2)}
                fill={textFill}
                fontSize="12"
                fontWeight={800}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${((mid * 180) / Math.PI + 90).toFixed(2)} ${(62 * Math.cos(mid)).toFixed(2)} ${(62 * Math.sin(mid)).toFixed(2)})`}
              >
                Brinde {i + 1}
              </text>
            </g>
          );
        })}
        <circle r="18" fill="#fff" stroke="#0F172A" strokeWidth="3" />
      </svg>
    </div>
  );
}

/** Passo 3: roleta falsa. Todo giro ganha; mostra só o código, nunca o nome do brinde. */
export function WheelStep({ onDone }: { onDone: (code: string) => void }) {
  const [rotation, setRotation] = useState(0);
  const [state, setState] = useState<"idle" | "spinning" | "won">("idle");
  const [code, setCode] = useState("");
  const fired = useRef(false);
  const spinningRef = useRef(false);

  function spin() {
    if (state !== "idle") return;
    const slice = Math.floor(Math.random() * WHEEL_SLICES);
    const sliceAngle = 360 / WHEEL_SLICES;
    // Gira 5 voltas e para com o centro da casa sorteada sob o ponteiro (topo).
    const target = 360 * 5 + (360 - (slice * sliceAngle + sliceAngle / 2));
    setCode(fakeCode());
    setState("spinning");
    spinningRef.current = true;
    requestAnimationFrame(() => setRotation(target));
    // Garantia caso o transitionend não dispare (aba em segundo plano etc.).
    window.setTimeout(() => void onEnd(), 4800);
  }

  async function onEnd() {
    if (!spinningRef.current || fired.current) return;
    fired.current = true;
    setState("won");
    try {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: [DEMO_CLIENT.primary, DEMO_CLIENT.secondary, "#FFC628", "#FF6A13"] });
      }
    } catch {
      /* confete é opcional */
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold text-sg-navy-900">Roleta de brindes</h2>
      <p className="mt-1 text-sg-gray-600">Concluiu a dinâmica nos dias de roleta? Gira e sempre ganha.</p>

      <div className="mt-6" onTransitionEnd={onEnd}>
        <Wheel rotation={rotation} spinning={state !== "idle"} />
      </div>

      <div className="mt-6 text-center" aria-live="polite">
        {state === "won" ? (
          <div className="animate-pop mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-md ring-1 ring-sg-navy-900/10">
            <Gift aria-hidden className="mx-auto size-8 text-sg-orange-500" />
            <p className="mt-2 font-display text-2xl font-extrabold text-sg-navy-900">Você ganhou um brinde!</p>
            <p className="mt-1 text-sm text-sg-gray-600">Retire no RH apresentando este código:</p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-sg-navy-900 tabular">{code}</p>
            <p className="mt-2 text-xs text-sg-gray-600">Código fictício da demo. Na campanha real, o RH é avisado na hora.</p>
            <button
              type="button"
              onClick={() => onDone(code)}
              className="mt-5 inline-flex h-12 items-center rounded-xl px-6 font-semibold text-white"
              style={{ background: DEMO_CLIENT.primary }}
            >
              Ver o ranking
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={spin}
            disabled={state === "spinning"}
            className="inline-flex h-14 items-center rounded-2xl bg-sg-yellow-400 px-10 font-display text-xl font-extrabold text-sg-navy-900 shadow-md transition hover:-translate-y-0.5 disabled:opacity-70"
          >
            {state === "spinning" ? "Girando..." : "Girar"}
          </button>
        )}
      </div>
    </div>
  );
}
