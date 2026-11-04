import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  robots: siteConfig.allowIndexing ? undefined : { index: false, follow: false },
  twitter: { card: "summary_large_image" },
};

/** Türkçe sürümün kök düzeni. Her dilin kendi kök düzeni var, böylece <html lang> doğru olur. */
export default function TurkishLayout({ children }: LayoutProps<"/tr">) {
  return <SiteShell lang="tr">{children}</SiteShell>;
}
