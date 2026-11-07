import type { ReactNode } from "react";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { EN_HOME_PATH, type EnSitePage } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

/**
 * İngilizce kurumsal sayfaların ortak düzeni (Türkçedeki `CorporatePage` ile aynı görünüm): koyu başlık, okunaklı metin
 * alanı ve son güncelleme tarihi.
 */
export function EnCorporatePage({
  page,
  lead,
  updated,
  children,
  eyebrow = "About",
}: {
  page: EnSitePage;
  lead: string;
  updated: string;
  children: ReactNode;
  eyebrow?: string;
}) {
  const updatedText = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${updated}T12:00:00Z`),
  );
  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 md:pb-14">
          <BreadcrumbTrail tone="dark" label="Breadcrumb" items={[{ name: "Home", path: EN_HOME_PATH }, { name: page.title, path: page.path }]} />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">{lead}</p>
        </div>
      </section>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        {children}
        <p className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800">
          Last updated: <time dateTime={updated}>{updatedText}</time>
        </p>
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          inLanguage: "en-US",
          dateModified: updated,
          url: new URL(page.path, siteConfig.url).toString(),
        }}
      />
    </>
  );
}
