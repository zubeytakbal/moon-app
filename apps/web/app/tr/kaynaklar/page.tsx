import type { Metadata } from "next";
import Link from "next/link";
import { CorporatePage } from "@/components/CorporatePage";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { SOURCE_GROUP_NAMES, SOURCES, type Source, type SourceGroup } from "@/lib/sources";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.kaynaklar;

export const metadata: Metadata = {
  title: `Kaynaklar | ${siteConfig.name}`,
  description:
    "Lunatlas'taki bilgilerin kaynakları kalıcı numaralarıyla: NASA tutulma katalogları ve diğer resmî kaynaklar; her birinden hangi bilgiyi aldığımız.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

/** Bütün kaynaklar, kalıcı numaralarıyla (sayfalardaki [n] işaretleriyle aynı). Gruplara ayrılır, grup içinde numara sırası. */
export default function SourcesPage() {
  const all = Object.values(SOURCES) as Source[];
  const groups = (Object.keys(SOURCE_GROUP_NAMES) as SourceGroup[])
    .map((g) => ({ g, items: all.filter((s) => s.group === g).sort((a, b) => a.no - b.no) }))
    .filter((x) => x.items.length > 0);

  return (
    <CorporatePage
      page={PAGE}
      updated="2026-11-01"
      lead="Sitedeki bilgilerin nereden geldiği. Her kaynağın sitenin bütününde tek bir numarası var: sayfalardaki [1] işareti her yerde aynı kaynağı gösterir."
    >
      <div className="space-y-4 text-[1.0625rem] leading-relaxed text-zinc-800 dark:text-zinc-200">
        <p>
          Yalnız resmî ve birincil kaynaklara başvuruyoruz: NASA gibi bilim kurumlarının katalogları, gözlemevlerinin
          verileri, Diyanet takvimi. Haber sitelerini kaynak göstermiyoruz. Bilgiyi kendi cümlelerimizle yazıyoruz; her
          bağlantı eklenmeden önce açılıp okunuyor.
        </p>
        <p>
          Tarih ve saatleri kendimiz hesaplıyoruz (Astronomy Engine). Bu hesapları kaynaklarla nasıl karşılaştırdığımız{" "}
          <Link href={PAGES.yontem.path} className="underline underline-offset-2">
            Yöntem ve Doğruluk
          </Link>{" "}
          sayfasında.
        </p>
      </div>

      {groups.map(({ g, items }) => (
        <section key={g} aria-labelledby={`grup-${g}`} className="mt-10">
          <h2 id={`grup-${g}`} className="text-2xl font-semibold tracking-tight">
            {SOURCE_GROUP_NAMES[g]}
          </h2>
          <ol className="mt-4 space-y-5">
            {items.map((s) => (
              <li key={s.no} id={`kaynak-${s.no}`} className="flex scroll-mt-32 gap-3">
                <span className="w-10 shrink-0 font-semibold tabular-nums text-zinc-500">[{s.no}]</span>
                <span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    className="font-semibold text-zinc-950 underline underline-offset-2 dark:text-white"
                  >
                    {s.title}
                  </a>
                  <span className="block text-sm text-zinc-500">{s.publisher}</span>
                  <span className="mt-1 block text-zinc-700 dark:text-zinc-300">{s.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </CorporatePage>
  );
}
