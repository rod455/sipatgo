"use client";

import { useTransition } from "react";
import { selectCampaign, selectCompany } from "@/app/admin/context-actions";

export function ContextSwitcher({ campaigns, campaignId, companies, companyId }: {
  campaigns: { id: string; name: string; status: string }[]; campaignId: string | null;
  companies?: { id: string; name: string }[]; companyId: string;
}) {
  const [pending, start] = useTransition();
  const STATUS: Record<string, string> = { draft: "rascunho", scheduled: "agendada", active: "ativa", closed: "encerrada" };
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {companies && (
        <select disabled={pending} value={companyId} onChange={(e) => start(() => selectCompany(e.target.value))}
          className="h-9 max-w-48 rounded-lg border border-slate-300 bg-white px-2">
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      {campaigns.length > 0 && (
        <select disabled={pending} value={campaignId ?? ""} onChange={(e) => start(() => selectCampaign(e.target.value))}
          className="h-9 max-w-64 rounded-lg border border-slate-300 bg-white px-2">
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name} ({STATUS[c.status] ?? c.status})</option>)}
        </select>
      )}
    </div>
  );
}
