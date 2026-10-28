import type { ReactNode } from "react";
import type { SitePage } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { Breadcrumb } from "./Breadcrumb";
import { JsonLd } from "./JsonLd";

/**
 * Kurumsal sayfaların (Hakkımızda, İletişim, Gizlilik, Çerez) ortak düzeni: sade koyu başlık,
 * okunaklı metin alanı ve son güncelleme tarihi.
 */
export function CorporatePage({
  page,
  lead,
  updated,
  children,
}: {
  page: SitePage;
  lead: string;
  updated: string;
  children: ReactNode;
}) {
  const updatedText = new Intl.DateTimeFormat(siteConfig.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${updated}T12:00:00Z`));

  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 md:pb-14">
          <Breadcrumb page={page} tone="dark" />
          <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">{lead}</p>
        </div>
      </section>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        {children}
        <p className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800">
          Son güncelleme: <time dateTime={updated}>{updatedText}</time>
        </p>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          inLanguage: "tr-TR",
          dateModified: updated,
          url: new URL(page.path, siteConfig.url).toString(),
        }}
      />
    </>
  );
}
