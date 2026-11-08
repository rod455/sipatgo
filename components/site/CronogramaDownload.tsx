"use client";

import { Download, Printer } from "lucide-react";
import { SCHEDULE, SCHEDULE_COLUMNS } from "@/content/site/cronograma";
import { ctaClasses } from "./CtaButton";
import { track } from "./analytics";

function toCsv(): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = SCHEDULE_COLUMNS.map((c) => esc(c.label)).join(";");
  const rows = SCHEDULE.map((r) => SCHEDULE_COLUMNS.map((c) => esc(r[c.key])).join(";"));
  // BOM para o Excel reconhecer UTF-8; ";" é o separador padrão do Excel em pt-BR.
  return "﻿" + [header, ...rows].join("\r\n");
}

/** Botões "Baixar CSV" (data URL) e "Imprimir / PDF". */
export function CronogramaDownload({ tone = "light" }: { tone?: "light" | "dark" }) {
  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(toCsv())}`;
  return (
    <div className="no-print flex flex-col gap-3 sm:flex-row">
      <a
        href={href}
        download="cronograma-sipat-5-dias-sipatgo.csv"
        onClick={() => track("download", { file: "cronograma_csv" })}
        className={ctaClasses("primary", "lg")}
      >
        <Download aria-hidden className="size-5" /> Baixar (CSV / Excel)
      </a>
      <button
        type="button"
        onClick={() => {
          track("download", { file: "cronograma_print" });
          window.print();
        }}
        className={ctaClasses(tone === "dark" ? "ghost" : "outline", "lg")}
      >
        <Printer aria-hidden className="size-5" /> Imprimir ou salvar PDF
      </button>
    </div>
  );
}
