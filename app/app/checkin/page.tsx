import { requireViewer } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { CheckinForm } from "./CheckinForm";

export default async function CheckinPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  await requireViewer();
  const { t } = await searchParams;
  return (
    <div>
      <PageTitle title="Check-in presencial" subtitle="Escaneie o QR code do evento ou digite o código de 6 letras. Vale 100 pontos!" />
      <CheckinForm initialToken={t} />
    </div>
  );
}
