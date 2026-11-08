import { GoogleAnalytics } from "@/components/site/GoogleAnalytics";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-white text-sg-navy-900">
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
      <GoogleAnalytics />
    </div>
  );
}
