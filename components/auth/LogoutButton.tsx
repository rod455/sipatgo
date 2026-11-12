"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { cn } from "@/lib/utils";

/** Encerra a sessão e volta para a tela de login. */
export function LogoutButton({ className, label = "Sair", to = "/login", iconOnly }: { className?: string; label?: string; to?: string; iconOnly?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" disabled={busy} aria-label={label}
      onClick={async () => {
        setBusy(true);
        try { await api("/api/auth/logout", {}); } catch { /* segue mesmo assim */ }
        router.replace(to);
        router.refresh();
      }}
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-60", className)}>
      <LogOut className="h-4 w-4" />{iconOnly ? null : <span>{busy ? "Saindo..." : label}</span>}
    </button>
  );
}
