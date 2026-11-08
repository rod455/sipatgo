import { getCertificate } from "@/lib/certificates";
import { renderCertificatePdf } from "@/lib/pdf/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const c = await getCertificate((await params).code);
  if (!c) return new Response("Certificado não encontrado", { status: 404 });
  const pdf = await renderCertificatePdf(c);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="certificado-${c.code}.pdf"`,
      "cache-control": "private, max-age=300",
    },
  });
}
