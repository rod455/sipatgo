"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Settings2, CalendarDays, Users, Gift, PackageCheck, MessageSquareHeart, QrCode,
  ClipboardList, FileBarChart, Megaphone, Palette, Building2,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/campanha", label: "Campanha", icon: Settings2 },
  { href: "/admin/dias", label: "Dias e dinâmicas", icon: CalendarDays },
  { href: "/admin/participantes", label: "Participantes", icon: Users },
  { href: "/admin/brindes", label: "Brindes", icon: Gift },
  { href: "/admin/entregas", label: "Entregas", icon: PackageCheck },
  { href: "/admin/mural", label: "Mural", icon: MessageSquareHeart },
  { href: "/admin/eventos", label: "Eventos presenciais", icon: QrCode },
  { href: "/admin/presenca", label: "Presença", icon: ClipboardList },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/divulgacao", label: "Divulgação", icon: Megaphone },
  { href: "/admin/identidade", label: "Identidade", icon: Palette },
];

export function AdminNav({ superadmin, badges }: { superadmin: boolean; badges: Record<string, number> }) {
  const path = usePathname();
  const items = superadmin ? [...ITEMS, { href: "/super", label: "Super admin", icon: Building2 }] : ITEMS;
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        const n = badges[href];
        return (
          <Link key={href} href={href}
            className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              active ? "bg-brand text-brand-fg" : "text-slate-600 hover:bg-slate-100")}>
            <Icon className="h-4 w-4" />{label}
            {n ? <span className={cn("ml-auto rounded-full px-1.5 text-[11px] font-bold", active ? "bg-white/25" : "bg-red-500 text-white")}>{n}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
