import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { isLanguagePublished } from "@/lib/shell";
import { siteConfig } from "@/site.config";

/** İngilizce yayına açılana kadar bütün İngilizce sayfalar arama motorlarına kapalıdır. */
const indexable = siteConfig.allowIndexing && isLanguagePublished("en");

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  robots: indexable ? undefined : { index: false, follow: false },
  twitter: { card: "summary_large_image" },
  // AdSense sahiplik etiketi (yalnız meta; kod yok). Hiçbir sayfa kendi `other` alanını tanımlamamalı, yoksa bu ezilir.
  other: { "google-adsense-account": siteConfig.adsenseClient },
};

/** İngilizce sürümün kök düzeni (Amerikan İngilizcesi; bkz. CLAUDE.md). */
export default function EnglishLayout({ children }: LayoutProps<"/en">) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
