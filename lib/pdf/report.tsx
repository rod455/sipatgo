import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatDateBR } from "../dates";
import { formatCpf } from "../cpf";
import type { reportSummary, attendance } from "../reports";
import type { ComplianceItem } from "../compliance";

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#0f172a" },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6 },
  muted: { color: "#64748b" },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#e2e8f0", paddingVertical: 3 },
  th: { fontFamily: "Helvetica-Bold", backgroundColor: "#f1f5f9" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  kpi: { width: "23%", borderWidth: 0.5, borderColor: "#cbd5e1", borderRadius: 4, padding: 6 },
  kpiV: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 16, left: 32, right: 32, fontSize: 7, color: "#94a3b8", flexDirection: "row", justifyContent: "space-between" },
});

type Header = { company: string; campaign: string; theme: string; start: string; end: string; color: string; generated: string; formatDate: (d: Date) => string };

function Footer({ h }: { h: Header }) {
  return (
    <View style={s.footer} fixed>
      <Text>{h.company} · {h.campaign} · gerado em {h.generated} · Feito com SipatGo</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
    </View>
  );
}

function Table({ cols, rows }: { cols: { label: string; w: string; align?: "right" }[]; rows: (string | number)[][] }) {
  return (
    <View>
      <View style={[s.row, s.th]}>{cols.map((c) => <Text key={c.label} style={{ width: c.w, textAlign: c.align ?? "left", paddingHorizontal: 2 }}>{c.label}</Text>)}</View>
      {rows.map((r, i) => (
        <View key={i} style={s.row} wrap={false}>{r.map((v, k) => <Text key={k} style={{ width: cols[k].w, textAlign: cols[k].align ?? "left", paddingHorizontal: 2 }}>{String(v)}</Text>)}</View>
      ))}
    </View>
  );
}

const pct = (n: number, d: number) => (d ? `${Math.round((100 * n) / d)}%` : "0%");

export type ReportExtra = {
  cipaApproval: string | null;
  compliance: ComplianceItem[];
  events: { name: string; starts_at: Date; checkins: number }[];
};

export async function renderFinalReport(h: Header, r: Awaited<ReturnType<typeof reportSummary>>, att: Awaited<ReturnType<typeof attendance>>, x: ReportExtra) {
  const { s: t } = r;
  const STATUS: Record<string, string> = { done: "Sim", makeup: "Rec.", none: "—" };
  const doc = (
    <Document title={`Relatório final — ${h.campaign}`} author={h.company}>
      <Page size="A4" style={s.page}>
        <Text style={[s.h1, { color: h.color }]}>Relatório final da SIPAT</Text>
        <Text style={{ fontSize: 12, marginTop: 2 }}>{h.company} — {h.campaign}{h.theme ? ` · ${h.theme}` : ""}</Text>
        <Text style={s.muted}>Período: {formatDateBR(h.start)} a {formatDateBR(h.end)}</Text>
        <Text style={{ marginTop: 4 }}>Programação definida pela CIPA (NR-5, item 5.3.1, alínea “i”): {x.cipaApproval?.trim() || "não informada"}</Text>

        <Text style={s.h2}>Conformidade com a NR-5</Text>
        <Table cols={[{ label: "Item", w: "40%" }, { label: "Referência", w: "28%" }, { label: "Situação", w: "32%" }]}
          rows={x.compliance.map((c) => [c.label, c.reference, c.level === "lembrete" ? "Lembrete" : c.ok ? "Atendido" : c.level === "obrigatorio" ? "PENDENTE" : "Não realizado (recomendado)"])} />

        {x.events.length > 0 && (
          <>
            <Text style={s.h2}>Ações presenciais (check-in)</Text>
            <Table cols={[{ label: "Ação", w: "60%" }, { label: "Data", w: "22%" }, { label: "Check-ins", w: "18%", align: "right" }]}
              rows={x.events.map((e) => [e.name, h.formatDate(e.starts_at), e.checkins])} />
          </>
        )}

        <Text style={s.h2}>Adesão e engajamento</Text>
        <View style={s.grid}>
          {[["Participantes", t.people], ["Participaram (≥1 dia)", `${t.active} (${pct(t.active, t.people)})`], ["Dias concluídos", t.completions], ["Em recuperação", t.makeups],
            ["Acerto 1ª tentativa", pct(t.first_try, t.correct)], ["Check-ins presenciais", t.checkins], ["Posts no mural", t.posts], ["Games da família", t.family],
            ["Brindes sorteados", t.prizes], ["Brindes entregues", t.delivered], ["Certificados", t.certs]].map(([k, v]) => (
            <View key={String(k)} style={s.kpi}><Text style={s.muted}>{k}</Text><Text style={s.kpiV}>{String(v)}</Text></View>
          ))}
        </View>

        <Text style={s.h2}>Adesão por dia</Text>
        <Table cols={[{ label: "Dia", w: "10%" }, { label: "Título", w: "50%" }, { label: "No dia", w: "13%", align: "right" }, { label: "Recuperação", w: "14%", align: "right" }, { label: "Adesão", w: "13%", align: "right" }]}
          rows={r.perDay.map((d) => [d.day_index, d.title, d.done, d.makeup, pct(d.done + d.makeup, t.people)])} />

        <Text style={s.h2}>Ranking por setor</Text>
        <Table cols={[{ label: "#", w: "8%" }, { label: "Setor", w: "50%" }, { label: "Pessoas", w: "14%", align: "right" }, { label: "Adesão", w: "14%", align: "right" }, { label: "Média pts", w: "14%", align: "right" }]}
          rows={r.sectors.map((x) => [x.position, x.sector, x.members, `${x.adhesion_pct}%`, x.avg_points])} />

        <Text style={s.h2}>Top 10 individual</Text>
        <Table cols={[{ label: "#", w: "8%" }, { label: "Nome", w: "52%" }, { label: "Setor", w: "25%" }, { label: "Pontos", w: "15%", align: "right" }]}
          rows={r.top.map((x) => [x.position, x.name, x.sector, x.total_points])} />
        <Footer h={h} />
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Aprendizado — acerto na 1ª tentativa por item</Text>
        <Table cols={[{ label: "Dia", w: "7%" }, { label: "Dinâmica", w: "16%" }, { label: "Item", w: "55%" }, { label: "Resp.", w: "10%", align: "right" }, { label: "% 1ª", w: "12%", align: "right" }]}
          rows={r.learning.map((x) => [x.day_index, x.type, `${x.item}. ${x.label}`, x.answered, x.rate === null ? "—" : `${x.rate}%`])} />
        <Text style={[s.muted, { marginTop: 12 }]}>Guarde este relatório, a lista de presença e as atas da CIPA no estabelecimento por no mínimo 5 anos (NR-5, item 5.9.2).</Text>
        <Footer h={h} />
      </Page>

      <Page size="A4" orientation="landscape" style={s.page}>
        <Text style={s.h2}>Lista de presença (registro da SIPAT)</Text>
        <Text style={[s.muted, { marginBottom: 6 }]}>Sim = concluiu no dia · Rec. = concluiu na recuperação · — = não realizou</Text>
        <Table cols={[{ label: "Nome", w: "32%" }, { label: "CPF", w: "14%" }, { label: "Setor", w: "19%" }, ...att.days.map((d) => ({ label: `Dia ${d}`, w: "6%", align: "right" as const })), { label: "Total", w: "5%", align: "right" }]}
          rows={att.people.map((p) => [p.name, formatCpf(p.cpf), p.sector, ...att.days.map((d) => STATUS[p.days[d] ?? "none"]), Object.values(p.days).filter((x) => x !== "none").length])} />
        <Footer h={h} />
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
