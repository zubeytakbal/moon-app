import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";
import { SiteShell } from "@/components/SiteShell";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Sayfa bulunamadı",
};

/**
 * Hiçbir rotaya uymayan adresler için 404. Sitenin her dilde ayrı kök düzeni olduğundan (`app/tr`, `app/en`)
 * ortak bir düzen yok; bu sayfa kendi <html>'ini SiteShell ile kurar. Adres bilinmediği için Türkçe gösterilir.
 */
export default function GlobalNotFound() {
  return (
    <SiteShell lang="tr">
      <NotFoundContent lang="tr" />
    </SiteShell>
  );
}
