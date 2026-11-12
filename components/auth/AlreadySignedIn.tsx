import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

/** Já há alguém conectado neste aparelho: continuar ou sair para entrar com outra conta. */
export function AlreadySignedIn({ name, company, dest, here }: { name: string; company: string; dest: string; here: string }) {
  const panel = dest.startsWith("/admin");
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
        Você já está conectado como <b>{name}</b> · {company}{panel ? " (painel da empresa)" : ""}.
      </div>
      <Link href={dest} className="flex h-12 w-full items-center justify-center rounded-xl bg-brand font-semibold text-brand-fg hover:brightness-110">
        Continuar {panel ? "no painel" : "como colaborador"}
      </Link>
      <LogoutButton to={here} label="Sair e entrar com outra conta"
        className="h-12 w-full justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" />
    </div>
  );
}
