import { Geist, Josefin_Sans } from "next/font/google";
import "@/app/globals.css";
import { CookieConsent } from "@/components/CookieConsent";
import { RelatedPages } from "@/components/RelatedPages";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TableOfContents } from "@/components/TableOfContents";
import { CONTENT_ID } from "@/lib/content-id";
import type { Lang } from "@/lib/i18n";
import { getShell } from "@/lib/shell";

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

/**
 * Bütün dillerin ortak sayfa iskeleti: <html>, üst menü, içerik, İçindekiler, ilgili sayfalar, alt bilgi ve
 * çerez bildirimi. Her dilin kök düzeni (`app/tr/layout.tsx`, `app/en/layout.tsx`) bunu kendi diliyle çağırır;
 * tasarım her dilde aynıdır.
 */
export function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const shell = getShell(lang);

  return (
    <html lang={lang} className={`${geistSans.variable} ${brandFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader lang={lang} />
        <div id={CONTENT_ID} className="flex-1">
          {children}
        </div>
        <TableOfContents lang={lang} />
        <RelatedPages byPath={shell.related} lang={lang} />
        <SiteFooter lang={lang} />
        <CookieConsent lang={lang} policyPath={shell.cookiePolicyPath} />
      </body>
    </html>
  );
}
