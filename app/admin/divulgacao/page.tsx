import { requireAdminCampaign } from "@/lib/auth";
import { qrPngDataUrl, qrSvg } from "@/lib/qr";
import { campaignUrl } from "@/lib/utils";
import { formatDateBR } from "@/lib/dates";
import { PageTitle } from "@/components/ui";
import { PromoKit } from "@/components/admin/PromoKit";

export default async function PromoPage() {
  const { campaign, adminCompany: c } = await requireAdminCampaign();
  const url = campaignUrl(c.slug);
  const [svg, png] = await Promise.all([qrSvg(url, "#0f172a"), qrPngDataUrl(url)]);
  return (
    <div className="space-y-5">
      <PageTitle title="Kit de divulgação" subtitle="Link, QR code e peças prontas com a marca da empresa." />
      <PromoKit
        url={url} qrSvg={svg} qrPng={png}
        company={{ name: c.name, logo: c.logo_url, primary: c.primary_color, secondary: c.secondary_color, accent: c.accent_color, slug: c.slug }}
        campaign={{ name: campaign.name, theme: campaign.theme, period: `${formatDateBR(campaign.start_date).slice(0, 5)} a ${formatDateBR(campaign.end_date)}`, time: campaign.release_time.slice(0, 5) }}
      />
    </div>
  );
}
