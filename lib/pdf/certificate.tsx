import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { CertificateData } from "../certificates";
import { formatDateBR } from "../dates";
import { maskCpf } from "../cpf";
import { appBaseUrl } from "../utils";

const s = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica", color: "#0f172a" },
  frame: { margin: 24, flexGrow: 1, borderWidth: 3, padding: 40, alignItems: "center", justifyContent: "space-between" },
  logo: { height: 56, objectFit: "contain", marginBottom: 8 },
  company: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  title: { fontSize: 40, fontFamily: "Helvetica-Bold", letterSpacing: 4, marginTop: 10 },
  sub: { fontSize: 12, letterSpacing: 2, color: "#475569", marginTop: 2 },
  body: { fontSize: 14, textAlign: "center", lineHeight: 1.6, maxWidth: 620 },
  name: { fontSize: 28, fontFamily: "Helvetica-Bold", marginVertical: 10, textAlign: "center" },
  footer: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "flex-end" },
  small: { fontSize: 9, color: "#475569" },
  code: { fontSize: 12, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
});

export async function renderCertificatePdf(c: CertificateData): Promise<Buffer> {
  const logoOk = c.logo_url && /\.(png|jpe?g)(\?|$)/i.test(c.logo_url);
  const doc = (
    <Document title={`Certificado — ${c.name}`} author={c.company_name}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={[s.frame, { borderColor: c.primary_color }]}>
          <View style={{ alignItems: "center" }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {logoOk ? <Image src={c.logo_url!} style={s.logo} /> : <Text style={s.company}>{c.company_name}</Text>}
            <Text style={[s.title, { color: c.primary_color }]}>CERTIFICADO</Text>
            <Text style={s.sub}>DE PARTICIPAÇÃO</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={s.body}>Certificamos que</Text>
            <Text style={s.name}>{c.name}</Text>
            <Text style={s.body}>
              participou da {c.campaign_name}{c.theme ? ` — "${c.theme}"` : ""}, Semana Interna de Prevenção de Acidentes do Trabalho
              promovida por {c.company_name}, realizada de {formatDateBR(c.start_date)} a {formatDateBR(c.end_date)},
              concluindo {c.days_completed} de 5 dias de atividades, com carga horária estimada de {String(c.hours).replace(".", ",")} hora(s).
            </Text>
          </View>
          <View style={s.footer}>
            <View>
              <Text style={s.small}>CPF {maskCpf(c.cpf)} · {c.sector}</Text>
              <Text style={s.small}>Emitido em {new Intl.DateTimeFormat("pt-BR", { timeZone: c.timezone }).format(new Date(c.issued_at))}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.small}>Código de verificação</Text>
              <Text style={[s.code, { color: c.primary_color }]}>{c.code}</Text>
              <Text style={s.small}>{appBaseUrl()}/verify/{c.code}</Text>
              <Text style={[s.small, { marginTop: 4 }]}>Feito com SipatGo</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
