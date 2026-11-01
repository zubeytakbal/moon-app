import Link from "next/link";
import { PAGES } from "@/lib/pages";
import { SOURCES, type SourceId } from "@/lib/sources";

/**
 * Sayfanın kaynakları (Vikipedi kaynakçası gibi). Sayfa kullandığı kaynakları verir:
 *   const src = pageSources("nasaLunarCatalog", "nasaDanjon");
 *   … 2027'de kanlı ay yoktur.{src.ref("nasaLunarCatalog")}
 *   <ArticleFooter … src={src} />
 * Metindeki [1] işareti sayfanın altındaki "Kaynaklar" listesine bağlanır; listedeki her kaynak asıl belgeye gider.
 * Numara sayfaya göre değil kaynağa göredir: her kaynağın sitede tek, kalıcı numarası vardır (`lib/sources.ts` `no`).
 * Yalnız kanıt gereken bilgiye (tarih, sayı, tanım, ölçek) kaynak konur.
 */
export function pageSources(...ids: SourceId[]) {
  return {
    ids,
    ref(id: SourceId) {
      if (!ids.includes(id)) throw new Error(`Kaynak sayfa listesinde yok: ${id}`);
      const n = SOURCES[id].no;
      return (
        <sup className="ml-0.5 text-[0.7em] leading-none">
          <a
            href={`#kaynak-${n}`}
            className="!no-underline text-indigo-700 hover:!underline dark:text-indigo-300"
            aria-label={`Kaynak ${n}`}
          >
            [{n}]
          </a>
        </sup>
      );
    },
  };
}

export type PageSources = ReturnType<typeof pageSources>;

/** Sayfa sonundaki numaralı kaynak listesi. `ArticleFooter` içinde kullanılır. */
export function SourceList({ src }: { src: PageSources }) {
  return (
    <ol className="mt-3 space-y-2.5">
      {[...src.ids]
        .sort((a, b) => SOURCES[a].no - SOURCES[b].no)
        .map((id) => {
          const s = SOURCES[id];
          return (
            <li key={id} id={`kaynak-${s.no}`} className="flex scroll-mt-32 gap-3">
              <span className="w-8 shrink-0 tabular-nums text-zinc-500">[{s.no}]</span>
              <span>
                <a href={s.url} target="_blank" rel="noopener" className="font-medium text-zinc-900 underline underline-offset-2 dark:text-white">
                  {s.title}
                </a>
                <span className="block text-zinc-500">{s.publisher}</span>
              </span>
            </li>
          );
        })}
    </ol>
  );
}

/** Kaynaklar sayfasına bağlantı (liste altında). */
export function AllSourcesLink() {
  return (
    <p className="mt-3">
      Sitedeki bütün kaynaklar ve hangi bilgiyi nereden aldığımız:{" "}
      <Link href={PAGES.kaynaklar.path} className="underline underline-offset-2">
        Kaynaklar
      </Link>
      .
    </p>
  );
}
