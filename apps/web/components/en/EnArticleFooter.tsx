import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { AllSourcesLink, SourceList, type PageSources } from "@/components/Sources";
import { EN_AUTHOR_PATH, EN_METHOD_PATH, type EnSitePage } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

/** İngilizce makalenin sonu: numaralı kaynaklar, hesap notu, güncelleme tarihi ve Article yapılandırılmış verisi. */
export function EnArticleFooter({
  page,
  headline,
  updated,
  src,
  calcNote = "Times are calculated with Astronomy Engine for each place's own time zone",
}: {
  page: EnSitePage;
  headline: string;
  updated: string;
  src: PageSources;
  calcNote?: string;
}) {
  const updatedText = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${updated}T12:00:00Z`),
  );
  return (
    <>
      <section
        aria-labelledby="sources"
        className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
      >
        <h2 id="sources" data-toc-skip className="font-semibold text-zinc-900 dark:text-white">
          Sources
        </h2>
        <SourceList src={src} lang={src.lang} />
        <ul className="mt-4 list-disc space-y-1 pl-5">
          <li>
            {calcNote} (
            <Link href={EN_METHOD_PATH} className="underline underline-offset-2">
              how we check our numbers
            </Link>
            ).
          </li>
        </ul>
        <AllSourcesLink lang="en" />
        <p className="mt-4">
          Last updated: <time dateTime={updated}>{updatedText}</time>
        </p>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline,
          inLanguage: "en-US",
          dateModified: updated,
          author: {
            "@type": "Person",
            name: siteConfig.author.name,
            url: new URL(EN_AUTHOR_PATH, siteConfig.url).toString(),
          },
          mainEntityOfPage: new URL(page.path, siteConfig.url).toString(),
        }}
      />
    </>
  );
}
