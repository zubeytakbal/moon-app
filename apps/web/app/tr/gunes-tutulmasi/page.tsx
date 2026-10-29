import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { findProvince, getLocalSolarEclipse, TURKEY_PROVINCES, type LocalSolarEclipse } from "@moon-app/moon";
import { Faq } from "@/components/Faq";
import { FAQS } from "@/lib/faqs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { EclipseDisc } from "@/components/EclipseDisc";
import { CitySelect } from "@/components/CitySelect";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { NasaFigure } from "@/components/NasaFigure";
import { IMAGES } from "@/lib/images";
import { SolarEclipseDiagram } from "@/components/EclipseDiagrams";
import { CalendarSubscribe } from "@/components/CalendarSubscribe";
import { MobileCollapse } from "@/components/MobileCollapse";

const PAGE = PAGES.gunesTutulmasi;
const UPDATED = "2026-10-29";
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
/** 2 Ağustos 2027 tutulmasını yerel olarak aramaya başlanan an. */
const AUG_2027_SEARCH = new Date(Date.UTC(2027, 6, 25));
/** Telefonda 81 il tablosunun ilk gösterilen satır sayısı. */
const MOBILE_ROWS = 10;

export const metadata: Metadata = {
  title: `Güneş Tutulması Ne Zaman? 2027 ve 2030 Güneş Tutulmaları Türkiye | ${siteConfig.name}`,
  description:
    "Bir sonraki güneş tutulması ne zaman ve ilinizden ne kadarı görülecek? 2 Ağustos 2027 güneş tutulmasının 81 ildeki saatleri ve örtülme oranı, İstanbul'dan görülecek 1 Haziran 2030 halkalı tutulması, güvenli izleme kuralları.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const KIND_TR = { partial: "Parçalı", annular: "Halkalı", total: "Tam" } as const;

/**
 * Türkiye'de bir il merkezinden tam ya da halkalı görülecek güneş tutulmaları (2026-2100).
 * 81 il merkezi için getLocalSolarEclipse ile tek tek taranarak bulunmuştur (27 Ekim 2026).
 */
const CENTRAL_ECLIPSES = [
  {
    date: "2030-06-01",
    kind: "annular" as const,
    provinces:
      "İstanbul, Edirne, Tekirdağ, Kırklareli, Çanakkale, Balıkesir, Bursa, Yalova, Kocaeli, Sakarya, Düzce, Zonguldak, Bartın",
  },
  {
    date: "2060-04-30",
    kind: "total" as const,
    provinces:
      "Adana, Mersin, Hatay, Gaziantep, Şanlıurfa, Diyarbakır, Van ve Güneydoğu ile Doğu Anadolu'da toplam 21 il",
  },
  {
    date: "2081-09-03",
    kind: "total" as const,
    provinces:
      "İstanbul, Ankara, Kocaeli, Kayseri, Malatya, Gaziantep, Şanlıurfa ve İç Anadolu ile Batı Karadeniz'de toplam 22 il",
  },
  {
    date: "2088-04-21",
    kind: "total" as const,
    provinces:
      "İstanbul, Bursa, Çanakkale, Tekirdağ, Kocaeli, Sakarya, Zonguldak, Sinop ve Marmara ile Batı Karadeniz'de toplam 16 il",
  },
  {
    date: "2093-07-23",
    kind: "annular" as const,
    provinces: "Trabzon, Rize, Samsun, Erzurum, Van ve Karadeniz ile Doğu Anadolu'da toplam 19 il",
  },
];

export default function SolarEclipsePage({ searchParams }: PageProps<"/tr/gunes-tutulmasi">) {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>2 Ağustos 2027&apos;deki güneş tutulması bütün Türkiye&apos;den parçalı olarak görülecek.</li>
            <li>
              1 Haziran 2030&apos;da İstanbul ve Marmara&apos;dan halkalı tutulma, yani &quot;ateş halkası&quot;
              görülecek.
            </li>
            <li>
              Güneş&apos;e tutulma sırasında da asla korumasız bakılmamalıdır; yalnızca sertifikalı tutulma gözlüğü
              güvenlidir.
            </li>
          </QuickFacts>
        </div>

        <Suspense fallback={<CityEclipses slug={siteConfig.defaultLocation.slug} />}>
          <SelectedCity searchParams={searchParams} />
        </Suspense>

        <ProvinceTable />

        <section aria-labelledby="merkezi" className="mt-14">
          <h2 id="merkezi" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Türkiye&apos;den görülecek tam ve halkalı tutulmalar
          </h2>
          <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
            Ay&apos;ın Güneş&apos;i tamamen ya da halka bırakarak örttüğü tutulmalar yalnızca dar bir şeritten görülür.
            2100&apos;e kadar Türkiye&apos;de bir il merkezinden görülecek olanlar:
          </p>
          <ol className="mt-6 space-y-3">
            {CENTRAL_ECLIPSES.map((c) => (
              <li key={c.date} className="flex gap-4 rounded-2xl bg-[#05070d] p-5 text-white">
                <span className="shrink-0">
                  <EclipseDisc separation={0} ratio={c.kind === "total" ? 1.04 : 0.94} size={56} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    {KIND_TR[c.kind]} güneş tutulması
                  </p>
                  <p className="mt-0.5 text-lg font-semibold">{formatIso(c.date)}</p>
                  <p className="mt-1 text-sm text-zinc-300">{c.provinces}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Güneş tutulması nasıl olur?</h2>
            <p>
              Güneş tutulması, <Link href={PAGES.yeniAy.path}>yeni ayda</Link> Ay&apos;ın Dünya ile Güneş arasına girip
              Güneş&apos;i örtmesidir. Güneş, Ay&apos;dan yaklaşık 400 kat büyüktür ama yaklaşık 400 kat da uzaktadır.
              Bu tesadüf sayesinde ikisi gökyüzünde neredeyse aynı büyüklükte görünür ve Ay, Güneş&apos;i tam olarak
              örtebilir.
            </p>

            <SolarEclipseDiagram />
            <ul>
              <li>
                <strong>Tam tutulma:</strong> Ay Güneş&apos;i tamamen örter. Gündüz birkaç dakikalığına alacakaranlık
                olur, yıldızlar görünür ve Güneş&apos;in çevresindeki inci beyazı taç (korona) ortaya çıkar.
              </li>
              <li>
                <strong>Halkalı tutulma:</strong> Ay, Dünya&apos;dan uzak olduğu için Güneş&apos;i tamamen örtemez.
                Ortada karanlık bir disk, çevresinde parlak bir &quot;ateş halkası&quot; kalır.
              </li>
              <li>
                <strong>Parçalı tutulma:</strong> Güneş&apos;in yalnızca bir kısmı örtülür. Tam ya da halkalı tutulmanın
                geçtiği şeridin çevresindeki geniş bölgelerden tutulma böyle görülür.
              </li>
            </ul>
            <p>
              Ay&apos;ın gölgesi Dünya&apos;da yalnızca birkaç yüz kilometre genişliğinde bir şerit çizer. Bu yüzden tam
              tutulma, belirli bir yerden ortalama birkaç yüz yılda bir görülür. Türkiye son olarak 11 Ağustos
              1999&apos;da (Amasya, Tokat, Sivas, Elazığ ve çevresi) ve 29 Mart 2006&apos;da (Antalya ve çevresi) tam
              tutulmaya tanıklık etti.
            </p>

            <NasaFigure images={[IMAGES.solarCorona, IMAGES.solarDiamondRing]} />

            <h2>Güneş tutulması güvenli nasıl izlenir?</h2>
            <p>
              <strong>Güneş&apos;e tutulma sırasında da korumasız bakmak gözlere kalıcı zarar verebilir.</strong>{" "}
              Güneş&apos;in %90&apos;ı örtülse bile kalan ince hilal, retinayı yakacak kadar parlaktır. Üstelik bu hasar
              acı vermez; fark edildiğinde iş işten geçmiş olur.
            </p>
            <ul>
              <li>
                <strong>Yalnızca ISO 12312-2 standardına uygun tutulma gözlüğü kullanın.</strong> Gözlüğün çizik ya da
                delik olmadığını kontrol edin.
              </li>
              <li>
                <strong>Güneş gözlüğü, film negatifi, isli cam, röntgen filmi güvenli değildir.</strong> Ne kadar koyu
                olursa olsun.
              </li>
              <li>
                <strong>Dürbün, teleskop ya da fotoğraf makinesiyle</strong> önüne özel güneş filtresi takılmadan asla
                bakmayın; tutulma gözlüğü bu araçlar için yeterli değildir.
              </li>
              <li>
                <strong>İğne deliği yöntemi</strong> en kolay ve güvenli yoldur: bir kartona küçük bir delik açın ve
                Güneş ışığını yere ya da beyaz bir kâğıda düşürün. Güneş&apos;in hilal biçimindeki görüntüsünü
                görürsünüz. Ağaç yapraklarının arasından düşen ışık lekeleri de tutulma sırasında küçük hilallere
                dönüşür.
              </li>
              <li>
                <strong>Çocuklara özellikle dikkat edin.</strong> Tutulma gözlüğünü takmadan Güneş&apos;e bakmamaları
                gerektiğini önceden anlatın.
              </li>
            </ul>
            <p>
              Yalnızca tam tutulmanın kısa &quot;tam&quot; anında, Güneş tamamen örtülüyken gözlük çıkarılabilir. 2027
              ve 2030 tutulmaları Türkiye&apos;den parçalı ve halkalı görüleceği için bu tutulmalarda gözlük hiçbir an
              çıkarılmamalıdır. Halkalı tutulmada bile kalan ateş halkası doğrudan bakılamayacak kadar parlaktır.
            </p>

            <h2>Ay tutulmasından farkı</h2>
            <p>
              Ay tutulmasında Dünya&apos;nın gölgesi Ay&apos;a düşer ve Ay&apos;ın göründüğü her yerden izlenir; çıplak
              gözle bakmak tamamen güvenlidir. Güneş tutulmasında ise Ay&apos;ın küçük gölgesi Dünya&apos;ya düşer ve
              tutulma yalnızca belirli bölgelerden görülür. Ay tutulmaları için{" "}
              <Link href={PAGES.ayTutulmalari.path}>Ay Tutulmaları</Link> ve{" "}
              <Link href={PAGES.kanliAy.path}>Kanlı Ay</Link> sayfalarına bakabilirsiniz.
            </p>
          </Prose>
          <CalendarSubscribe />
          <Faq items={FAQS.gunesTutulmasi} />
          <ArticleFooter
            page={PAGE}
            headline="Güneş Tutulması Ne Zaman? 2027 ve 2030 Güneş Tutulmaları Türkiye"
            updated={UPDATED}
            sources={[
              { label: "NASA Science, Eclipse Safety", href: "https://science.nasa.gov/eclipses/safety/" },
              { label: "NASA Science, Eclipse Types", href: "https://science.nasa.gov/eclipses/types/" },
            ]}
          />
        </div>
      </main>
    </>
  );
}

function formatIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}


/** Giriş: Türkiye'den görülecek bir sonraki güneş tutulması (İstanbul'a göre). */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = getLocalSolarEclipse(now, siteConfig.defaultLocation);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const days = Math.ceil((next.peak.getTime() - now.getTime()) / DAY_MS);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1f1405] to-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-20">
        <div className="order-2 md:order-1">
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Tarihler</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Ay, Güneş&apos;in önünden geçtiğinde gündüz kararır. Bir sonraki güneş tutulması ne zaman, ilinizden ne
            kadarı görülecek?
          </p>
          <div className="mt-8 max-w-md rounded-2xl border border-amber-300/30 bg-amber-400/10 p-5">
            <p className="text-xs uppercase tracking-wider text-amber-200/80">
              Türkiye&apos;den görülecek bir sonraki tutulma
            </p>
            <p className="mt-1 text-2xl font-semibold">{date.format(next.peak)}</p>
            <p className="mt-0.5 text-zinc-300">
              İstanbul: en derin an {time.format(next.peak)} · örtülme oranı %{Math.round(next.obscuration * 100)}
            </p>
            <p className="mt-3 inline-block rounded-full bg-amber-400/20 px-3 py-1 text-sm font-medium text-amber-100">
              {days} gün sonra
            </p>
          </div>
        </div>
        <div className="order-1 flex justify-center md:order-2">
          <div className="w-[min(70vw,320px)]">
            <EclipseDisc separation={next.peakSeparation} ratio={next.moonToSunRadius} size={320} />
          </div>
        </div>
      </div>
    </section>
  );
}

async function SelectedCity({ searchParams }: Pick<PageProps<"/tr/gunes-tutulmasi">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <CityEclipses slug={city.slug} />;
}

/** Seçilen ilden görülecek önümüzdeki üç güneş tutulması. Günde bir yenilenir. */
async function CityEclipses({ slug }: { slug: string }) {
  "use cache";
  cacheLife("days");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const list: LocalSolarEclipse[] = [];
  let t = new Date();
  for (let i = 0; i < 3; i++) {
    const e = getLocalSolarEclipse(t, city);
    list.push(e);
    t = new Date(e.peak.getTime() + DAY_MS);
  }
  const date = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  return (
    <section className="mt-12" aria-labelledby="ilden">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">İlinizden görülecek tutulmalar</p>
          <h2
            id="ilden"
            data-toc-label="İlinizden görülecek tutulmalar"
            className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {city.name}
          </h2>
        </div>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} selected={city.slug} />
      </div>
      <ol className="mt-6 space-y-3">
        {list.map((e) => (
          <li
            key={e.peak.toISOString()}
            className="flex flex-wrap items-center gap-5 rounded-2xl bg-[#05070d] p-5 text-white"
          >
            <EclipseDisc separation={e.peakSeparation} ratio={e.moonToSunRadius} size={88} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{KIND_TR[e.kind]} tutulma</p>
              <p className="mt-0.5 text-xl font-semibold">{date.format(e.peak)}</p>
              <p className="mt-1 text-sm tabular-nums text-zinc-300">
                {time.format(e.begin)} başlar · {time.format(e.peak)} en derin · {time.format(e.end)} biter
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-light tabular-nums">%{Math.round(e.obscuration * 100)}</p>
              <p className="text-xs text-zinc-400">örtülme</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-zinc-500">
        Çizimlerde Ay&apos;ın Güneş&apos;in hangi yanından geçtiği temsilidir; örtülen miktar gerçek oranına göredir.
      </p>
    </section>
  );
}

/** 2 Ağustos 2027 tutulmasının 81 il merkezindeki görünüşü. Haftada bir yenilenir. */
async function ProvinceTable() {
  "use cache";
  cacheLife("weeks");

  const rows = TURKEY_PROVINCES.map((p) => ({ p, e: getLocalSolarEclipse(AUG_2027_SEARCH, p) })).sort(
    (a, b) => b.e.obscuration - a.e.obscuration,
  );
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  return (
    <section className="mt-14" aria-labelledby="iller">
      <h2 id="iller" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        2 Ağustos 2027 güneş tutulması: 81 il
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Güneş&apos;in en derin anda örtülecek kısmı ve tutulmanın saatleri (Türkiye saati), en çok örtülen ilden en aza
        doğru.
      </p>
      <MobileCollapse
        hiddenCount={rows.length - MOBILE_ROWS}
        noun="il"
        className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2.5 font-medium">İl</th>
              <th className="px-4 py-2.5 font-medium">Örtülme</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Başlangıç</th>
              <th className="px-4 py-2.5 font-medium">En derin</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Bitiş</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map(({ p, e }, i) => {
              const pct = Math.round(e.obscuration * 100);
              return (
                <tr key={p.slug} data-extra={i >= MOBILE_ROWS || undefined}>
                  <td className="px-4 py-2 font-medium">
                    <Link href={`${PAGE.path}?il=${p.slug}`} rel="nofollow" scroll={false} className="hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 sm:block dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="tabular-nums">%{pct}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-2 tabular-nums sm:table-cell">{time.format(e.begin)}</td>
                  <td className="px-4 py-2 tabular-nums">{time.format(e.peak)}</td>
                  <td className="hidden px-4 py-2 tabular-nums sm:table-cell">{time.format(e.end)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </MobileCollapse>
    </section>
  );
}
