import { cn } from "@/lib/utils";

type LogoVariant = "default" | "white" | "mono-white" | "mono-navy" | "symbol";

const NAVY = "#0B1F33";
const ORANGE = "#FF6A13";

/** Chevron duplo (») — ideia de avanço diário. */
function Chevrons({ x, y, scale = 1, color, faded }: { x: number; y: number; scale?: number; color: string; faded: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 0 L10 10 L0 20" stroke={faded} strokeWidth={5} />
      <path d="M12 0 L22 10 L12 20" stroke={color} strokeWidth={5} />
    </g>
  );
}

/** Logo SipatGo em SVG: wordmark "Sipat" + "Go" (laranja) + chevron duplo; ou só o símbolo. */
export function Logo({ variant = "default", className, title = "SipatGo" }: { variant?: LogoVariant; className?: string; title?: string }) {
  if (variant === "symbol") {
    return (
      <svg viewBox="0 0 40 40" role="img" aria-label={title} className={cn("h-8 w-8", className)}>
        <rect width="40" height="40" rx="10" fill={NAVY} />
        <Chevrons x={8} y={10} color={ORANGE} faded="#FFC628" />
      </svg>
    );
  }

  const sipat = variant === "white" || variant === "mono-white" ? "#FFFFFF" : NAVY;
  const go = variant === "mono-white" ? "#FFFFFF" : variant === "mono-navy" ? NAVY : ORANGE;
  const faded = variant === "mono-white" ? "rgba(255,255,255,.55)" : variant === "mono-navy" ? "rgba(11,31,51,.45)" : "#FFC628";

  return (
    <svg viewBox="0 0 196 40" role="img" aria-label={title} className={cn("h-8 w-auto", className)}>
      <text
        x="0"
        y="31"
        fontSize="32"
        fontWeight={800}
        textLength="152"
        lengthAdjust="spacingAndGlyphs"
        style={{ fontFamily: "var(--font-sora), var(--font-inter), system-ui, sans-serif", letterSpacing: "-0.02em" }}
      >
        <tspan fill={sipat}>Sipat</tspan>
        <tspan fill={go}>Go</tspan>
      </text>
      <Chevrons x={162} y={11} scale={0.9} color={go} faded={faded} />
    </svg>
  );
}
