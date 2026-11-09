"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button } from "@/components/ui";
import type { ActionResult } from "@/lib/admin-guard";

type Action = (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;

export function ActionForm({ action, children, submitLabel = "Salvar", className, resetOnSuccess, confirm, variant, submitSize }: {
  action: Action; children?: React.ReactNode; submitLabel?: string; className?: string; resetOnSuccess?: boolean; confirm?: string;
  variant?: "primary" | "outline" | "danger" | "secondary" | "accent"; submitSize?: "sm" | "md";
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}
      onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Submit label={submitLabel} variant={variant} size={submitSize} />
        {state && (state.ok ? <span className="text-sm text-green-700">{state.message}</span> : <Alert>{state.error}</Alert>)}
      </div>
    </form>
  );
}

function Submit({ label, variant, size }: { label: string; variant?: "primary" | "outline" | "danger" | "secondary" | "accent"; size?: "sm" | "md" }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} size={size} disabled={pending}>{pending ? "Salvando..." : label}</Button>;
}

/** Botão de ação única (ex.: aprovar, excluir). */
export function ActionButton({ action, label, variant = "outline", confirm, size = "sm", fields }: {
  action: Action; label: string; variant?: "primary" | "outline" | "danger" | "secondary" | "ghost" | "accent"; confirm?: string; size?: "sm" | "md";
  fields?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="inline-flex items-center gap-2" onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      {fields && Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <SubmitSmall label={label} variant={variant} size={size} />
      {state && !state.ok && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

function SubmitSmall({ label, variant, size }: { label: string; variant: "primary" | "outline" | "danger" | "secondary" | "ghost" | "accent"; size: "sm" | "md" }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} size={size} disabled={pending}>{pending ? "..." : label}</Button>;
}
