"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Image as ImageIcon, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/ranking", label: "Ranking", icon: Trophy },
  { href: "/app/mural", label: "Mural", icon: ImageIcon },
  { href: "/app/familia", label: "Família", icon: Users },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  if (/\/app\/dia\/\d+\/(dinamica|roleta)/.test(path)) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/app" ? path === "/app" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-brand" : "text-slate-500")}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
