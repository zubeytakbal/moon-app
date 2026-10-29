import type { Metadata } from "next";
import { Geist, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { RelatedPages } from "@/components/RelatedPages";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TableOfContents } from "@/components/TableOfContents";
import { CONTENT_ID } from "@/lib/content-id";
import { ALL_PAGES, relatedPages } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  // latin-ext: ğ, ş, ı, İ gibi Türkçe harfler için gerekli.
  subsets: ["latin", "latin-ext"],
});

/** Yalnız logodaki "LUNATLAS" yazısı için (bkz. components/Emblem.tsx). */
const brandFont = Josefin_Sans({
  variable: "--font-brand",
  weight: ["300", "400"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  robots: siteConfig.allowIndexing ? undefined : { index: false, follow: false },
  twitter: { card: "summary_large_image" },
};

const RELATED_BY_PATH = Object.fromEntries(ALL_PAGES.map((p) => [p.path, relatedPages(p.path)]));

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${brandFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div id={CONTENT_ID} className="flex-1">
          {children}
        </div>
        <TableOfContents />
        <RelatedPages byPath={RELATED_BY_PATH} />
        <SiteFooter />
      </body>
    </html>
  );
}
