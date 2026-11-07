import type { Metadata } from "next";
import Link from "next/link";
import { EnCorporatePage } from "@/components/en/EnCorporatePage";
import { EN_PAGES } from "@/lib/en/pages";
import { SOURCES, type Source, type SourceGroup } from "@/lib/sources";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.sources;

export const metadata: Metadata = {
  title: `Sources: Where Our Information Comes From | ${siteConfig.name}`,
  description:
    "Every source behind Lunatlas: NASA eclipse catalogs, the U.S. Naval Observatory and other primary sources, each with the permanent number used in the [n] marks on our pages.",
  alternates: { canonical: PAGE.path },
};

const GROUP_NAMES: Record<SourceGroup, string> = {
  tutulma: "Eclipses",
  ay: "The moon and the sky",
  uzay: "Space missions",
  takvim: "Calendars and time",
  gelenek: "Traditions",
  yer: "Places",
};

/**
 * İngilizce sayfalarda kullanılan kaynaklar (İngilizce notu olanlar), sitenin bütününde kalıcı numaralarıyla. Numara
 * aralıkları normaldir: bazı kaynaklar yalnız Türkçe sayfalarda kullanılıyor.
 */
export default function SourcesPage() {
  const all = (Object.values(SOURCES) as Source[]).filter((s) => s.en);
  const groups = (Object.keys(GROUP_NAMES) as SourceGroup[])
    .map((g) => ({ g, items: all.filter((s) => s.group === g).sort((a, b) => a.no - b.no) }))
    .filter((x) => x.items.length > 0);

  return (
    <EnCorporatePage
      page={PAGE}
      updated="2026-11-07"
      lead="Where the information on this site comes from. Each source has one permanent number across the whole site, so a [1] mark on any page always points to the same source."
    >
      <div className="space-y-4 text-[1.0625rem] leading-relaxed text-zinc-800 dark:text-zinc-200">
        <p>
          We rely only on official and primary sources: catalogs from scientific institutions such as NASA, observatory
          data and reference works. We don&apos;t cite news sites. We write everything in our own words, and every link is
          opened and read before it is added.
        </p>
        <p>
          Dates and times are our own calculations (with the open-source Astronomy Engine library). How they compare with
          these sources is shown on the{" "}
          <Link href={EN_PAGES.methodology.path} className="underline underline-offset-2">
            Methodology and Accuracy
          </Link>{" "}
          page. Gaps in the numbering are sources used only in our Turkish pages.
        </p>
      </div>

      {groups.map(({ g, items }) => (
        <section key={g} aria-labelledby={`group-${g}`} className="mt-10">
          <h2 id={`group-${g}`} className="text-2xl font-semibold tracking-tight">
            {GROUP_NAMES[g]}
          </h2>
          <ol className="mt-4 space-y-5">
            {items.map((s) => (
              <li key={s.no} id={`kaynak-${s.no}`} className="flex scroll-mt-32 gap-3">
                <span className="w-10 shrink-0 font-semibold tabular-nums text-zinc-500">[{s.no}]</span>
                <span>
                  <a href={s.url} target="_blank" rel="noopener" className="font-semibold text-zinc-950 underline underline-offset-2 dark:text-white">
                    {s.en?.title ?? s.title}
                  </a>
                  <span className="block text-sm text-zinc-500">{s.en?.publisher ?? s.publisher}</span>
                  <span className="mt-1 block text-zinc-700 dark:text-zinc-300">{s.en!.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </EnCorporatePage>
  );
}
