import Link from "next/link";
import { cn } from "@/lib/utils";

/** Assinatura discreta da SipatGo dentro da campanha. */
export function MadeWith({ light, className }: { light?: boolean; className?: string }) {
  return (
    <p className={cn("text-center text-xs", light ? "text-white/70" : "text-brand-muted", className)}>
      Feito com{" "}
      <Link href="https://www.sipatgo.com.br" target="_blank" className="font-display font-extrabold">
        Sipat<span className="text-[#FF6A13]">Go</span>
      </Link>
    </p>
  );
}
