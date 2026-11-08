"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "./analytics";
import { HONEYPOT_FIELD, leadSchema, MONTHS, type LeadFieldErrors } from "./lead-schema";

type Props = {
  /** short: nome, e-mail, empresa, pessoas, mês. full: + cargo e mensagem. */
  variant?: "short" | "full";
  origem: string;
  tone?: "light" | "dark";
  submitLabel?: string;
  className?: string;
  successTitle?: string;
  successText?: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export function LeadForm({
  variant = "short",
  origem,
  tone = "light",
  submitLabel = "Quero montar minha SIPAT",
  className,
  successTitle = "Recebemos! 🎉",
  successText = "Em até 1 dia útil alguém da SipatGo fala com você.",
}: Props) {
  const uid = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const dark = tone === "dark";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const plano = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("plano") : null;
    const values: Record<string, string> = { ...raw, origem: plano ? `${origem}:${plano}`.slice(0, 80) : origem };

    if (!values[HONEYPOT_FIELD]) {
      const parsed = leadSchema.safeParse(values);
      if (!parsed.success) {
        const next: LeadFieldErrors = {};
        for (const issue of parsed.error.issues) {
          const k = issue.path[0] as keyof LeadFieldErrors;
          if (k && !next[k]) next[k] = issue.message;
        }
        setErrors(next);
        setFormError("Confira os campos destacados.");
        const first = Object.keys(next)[0];
        if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
        return;
      }
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: LeadFieldErrors };
      if (!res.ok || !json.ok) {
        setErrors(json.fieldErrors ?? {});
        setFormError(json.error ?? "Não foi possível enviar agora. Tente de novo em instantes.");
        setStatus("error");
        return;
      }
      track("form_submit", { origem });
      setStatus("success");
      form.reset();
    } catch {
      setFormError("Sem conexão. Confira sua internet e tente de novo.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={cn("rounded-2xl p-6 text-center md:p-8", dark ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-white text-sg-navy-900 shadow-sm ring-1 ring-sg-navy-900/5", className)}
      >
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-sg-green-500" strokeWidth={2} />
        <p className="mt-3 font-display text-2xl font-extrabold">{successTitle}</p>
        <p className={cn("mt-2", dark ? "text-white/80" : "text-sg-gray-600")}>{successText}</p>
      </div>
    );
  }

  const label = cn("mb-1.5 block text-sm font-semibold", dark ? "text-white" : "text-sg-navy-900");
  const input = (hasError: boolean) =>
    cn(
      "block h-12 w-full rounded-xl border bg-white px-4 text-base text-sg-navy-900 placeholder:text-sg-gray-600/70",
      "focus:border-sg-navy-500 focus:ring-4 focus:ring-sg-navy-500/20 focus:outline-none",
      hasError ? "border-sg-red-500" : "border-sg-navy-900/15",
    );
  const errCls = cn("mt-1 text-sm font-medium", dark ? "text-[#FFB4B4]" : "text-[#B91C1C]");

  const field = (name: keyof LeadFieldErrors) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-err` : undefined,
  });
  const err = (name: keyof LeadFieldErrors) =>
    errors[name] ? (
      <p id={`${uid}-${name}-err`} className={errCls}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <form noValidate onSubmit={onSubmit} className={cn("relative grid gap-4 sm:grid-cols-2", className)} aria-label="Formulário de contato">
      <div>
        <label htmlFor={`${uid}-nome`} className={label}>
          Nome
        </label>
        <input {...field("nome")} autoComplete="name" required className={input(!!errors.nome)} placeholder="Seu nome" />
        {err("nome")}
      </div>
      <div>
        <label htmlFor={`${uid}-email`} className={label}>
          E-mail corporativo
        </label>
        <input {...field("email")} type="email" autoComplete="email" inputMode="email" required className={input(!!errors.email)} placeholder="voce@empresa.com.br" />
        {err("email")}
      </div>
      <div>
        <label htmlFor={`${uid}-empresa`} className={label}>
          Empresa
        </label>
        <input {...field("empresa")} autoComplete="organization" required className={input(!!errors.empresa)} placeholder="Nome da empresa" />
        {err("empresa")}
      </div>
      {variant === "full" ? (
        <div>
          <label htmlFor={`${uid}-cargo`} className={label}>
            Cargo <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <input {...field("cargo")} autoComplete="organization-title" className={input(!!errors.cargo)} placeholder="Ex.: Analista de RH, Técnico de Segurança" />
          {err("cargo")}
        </div>
      ) : null}
      <div>
        <label htmlFor={`${uid}-pessoas`} className={label}>
          Nº de pessoas
        </label>
        <input {...field("pessoas")} type="number" min={1} inputMode="numeric" required className={input(!!errors.pessoas)} placeholder="Ex.: 120" />
        {err("pessoas")}
      </div>
      <div>
        <label htmlFor={`${uid}-mes`} className={label}>
          Mês da SIPAT <span className="font-normal opacity-70">(opcional)</span>
        </label>
        <select {...field("mes")} defaultValue="" className={input(!!errors.mes)}>
          <option value="">Selecione</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {err("mes")}
      </div>
      {variant === "full" ? (
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-mensagem`} className={label}>
            Mensagem <span className="font-normal opacity-70">(opcional)</span>
          </label>
          <textarea
            {...field("mensagem")}
            rows={4}
            className={cn(input(!!errors.mensagem), "h-auto py-3")}
            placeholder="Conte sobre a sua SIPAT: unidades, turnos, tema, o que você precisa."
          />
          {err("mensagem")}
        </div>
      ) : null}

      {/* Honeypot: invisível para pessoas. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-hp`}>Não preencha</label>
        <input id={`${uid}-hp`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        {formError ? (
          <p role="alert" className={cn(errCls, "mb-3")}>
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-sg-orange-500 px-7 text-lg font-semibold text-sg-navy-900 shadow-[0_6px_20px_-6px_rgba(255,106,19,.7)] transition hover:bg-[#FF7D33] focus-visible:ring-4 focus-visible:ring-sg-yellow-400/70 focus-visible:outline-none disabled:opacity-70 sm:w-auto"
        >
          {status === "submitting" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : null}
          {status === "submitting" ? "Enviando..." : submitLabel}
        </button>
        <p className={cn("mt-3 text-xs", dark ? "text-white/70" : "text-sg-gray-600")}>
          Resposta em até 1 dia útil. Usamos seus dados só para falar sobre a sua SIPAT. Veja a{" "}
          <Link href="/privacidade" className="underline underline-offset-2">
            política de privacidade
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
