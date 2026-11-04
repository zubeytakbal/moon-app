import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import {
  ABROAD_CITIES,
  findPlace,
  getDayLength,
  getMonthSunDays,
  getSeasons,
  getSunDay,
  isAbroad,
  localDateParts,
  TURKEY_PROVINCES,
  zonedTimeToUtc,
  type Place,
  type SunDay,
} from "@moon-app/moon";
import { AnswerBox, DataTable } from "@/components/InfoTables";
import { MobileCollapse } from "@/components/MobileCollapse";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { Faq } from "@/components/Faq";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { SunHere } from "@/components/SunHere";
import { pageSources } from "@/components/Sources";
import { FAQS } from "@/lib/faqs";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { ABROAD_OPTIONS, BERLIN, PROVINCE_OPTIONS } from "@/lib/place-options";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.gunDogumuBatimi;
const UPDATED = "2026-11-04";
const src = pageSources("geonames");
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
const DIRECTIONS = ["kuzey", "kuzeydoğu", "doğu", "güneydoğu", "güney", "güneybatı", "batı", "kuzeybatı"];
const direction = (azimuth: number | null) => (azimuth === null ? "" : DIRECTIONS[Math.round(azimuth / 45) % 8]);
const NICOSIA = ABROAD_CITIES.find((c) => c.slug === "lefkosa")!;
const KKTC = ABROAD_CITIES.filter((c) => c.country === "KKTC");

export const metadata: Metadata = {
  title: `Gün Doğumu ve Gün Batımı Saatleri (81 İl): Bugün Güneş Kaçta Doğuyor? | ${siteConfig.name}`,
  description:
    "Bugün güneş kaçta doğuyor, kaçta batıyor? 81 il, KKTC ve Almanya, Hollanda, Londra gibi dünya şehirleri için gün doğumu ve batımı saatleri, yönü, hava kaçta kararır, altın saat ve aylık gün batımı takvimi. Tarih seçin ya da konumunuzu kullanın.",
  // Yer ve tarih seçimi (?il=, ?tarih=) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

function hm(minutes: number) {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}
const timeIn = (tz: string) => new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" });
const zoneOf = (p: Place) => (isAbroad(p) ? p.zoneLabel : "Türkiye saati");
const placeName = (p: Place) => (isAbroad(p) ? `${p.name}, ${p.country}` : p.name);

/** "2026-11-04" → o günün yerel öğlesi (yerin saat dilimiyle); geçersizse null. */
function parseDate(value: unknown, tz: string): Date | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > new Date(Date.UTC(y, mo, 0)).getUTCDate()) return null;
  return zonedTimeToUtc(y, mo, d, 12, tz);
}

export default function SunrisePage({ searchParams }: PageProps<"/tr/gun-dogumu-gun-batimi">) {
  return (
    <>
      <Hero />
      <QuickLinks
        links={[
          { href: "#cevap", label: "Bugün" },
          { href: "#hesapla", label: "Hesapla" },
          { href: "#aylik", label: "Aylık takvim" },
          { href: "#iller", label: "81 il" },
          { href: "#dunyada", label: "Dünyada" },
          { href: "#kktc", label: "KKTC" },
          { href: "#neden", label: "Neden değişir?" },
          { href: "#sss", label: "Sık sorulanlar" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <SunAnswer />
        </div>

        <Suspense fallback={<SunTool slug={siteConfig.defaultLocation.slug} dateIso={null} />}>
          <SelectedTool searchParams={searchParams} />
        </Suspense>

        <SunHere />

        <ProvinceTable />
        <WorldTable />
        <KktcTable />

        <div className="mx-auto max-w-3xl">
          <YearFacts />
          <Prose>
            <h2>Gün batımı neden kırmızı görünür?</h2>
            <p>
              Güneş ışığı bütün renklerin karışımıdır. Hava molekülleri mavi ışığı kırmızıdan çok daha fazla saçar;
              gündüz gökyüzünün mavi görünmesinin nedeni budur. Gün doğumunda ve batımında Güneş ufka yakın olduğu için
              ışığı bize ulaşmak için havanın içinde çok daha uzun yol alır. Bu yolda mavi ışığın neredeyse tamamı yana
              saçılır, geriye turuncu ve kırmızı kalır. Havada toz, deniz tuzu ya da duman varsa renkler daha da koyulaşır.
            </p>

            <h2>Namaz vakitlerindeki &quot;Güneş&quot; vakti neden farklı?</h2>
            <p>
              Bu sayfadaki gün doğumu, Güneş&apos;in üst kenarının düz bir ufukta göründüğü andır ve astronomik olarak
              hesaplanır. Namaz vakitleri çizelgelerindeki vakitler ise dinî ölçütlere göre belirlenir ve bu saatten
              birkaç dakika farklı olabilir. Namaz ve oruç vakitleri için Diyanet İşleri Başkanlığı&apos;nın vakit
              çizelgelerini esas alın.
            </p>

            <h2>Bu saatler nasıl hesaplanıyor?</h2>
            <p>
              Saatler, il merkezinin (yurt dışında şehir merkezinin) koordinatlarına göre, düz bir ufuk varsayılarak
              hesaplanır; ışığın havada kırılması hesaba katılır. Dağlık bir yerde ya da önünüzde yüksek binalar varsa
              Güneş birkaç dakika geç doğar ve erken batar gibi görünür. İlçeler il merkezinden birkaç dakika farklı
              olabilir; ilçeniz için yukarıdaki arama kutusuna yer adını yazın ya da &quot;Konumumu kullan&quot; düğmesine basın. Yılın en uzun ve en
              kısa günleri için <Link href={PAGES.ekinoksGundonumu.path}>Ekinoks ve Gündönümü</Link> sayfasına bakın.
            </p>
          </Prose>
          <Faq items={FAQS.gunDogumuBatimi} />
          <ArticleFooter
            page={PAGE}
            headline="Gün Doğumu ve Gün Batımı Saatleri: Bugün Güneş Kaçta Doğuyor?"
            updated={UPDATED}
            src={src}
          />
        </div>
      </main>
    </>
  );
}

/** Giriş: İstanbul'da bugün. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const today = getSunDay(new Date(), siteConfig.defaultLocation);
  const t = timeIn(timeZone);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2a1406] to-[#05070d] text-white">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-20">
        <div>
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Gökyüzü takvimi</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-200">
            Bugün güneş kaçta doğuyor, kaçta batıyor? 81 il ve dünya şehirleri için saatler, yön ve aylık takvim.
          </p>
          <Byline updated={UPDATED} />
        </div>
        <div className="grid grid-cols-2 gap-6 md:text-right">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">İstanbul gün doğumu</p>
            <p className="mt-1 text-5xl font-extralight tabular-nums">{today.rise ? t.format(today.rise) : "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Gün batımı</p>
            <p className="mt-1 text-5xl font-extralight tabular-nums">{today.set ? t.format(today.set) : "-"}</p>
          </div>
          <p className="col-span-2 text-sm text-zinc-400">
            Gündüz {hm(today.minutes)} · hava {today.civilDusk ? t.format(today.civilDusk) : "-"} civarı kararır
          </p>
        </div>
      </div>
    </section>
  );
}

/** Sayfanın sorusunun cevabı, en üstte: bugün İstanbul, Ankara, İzmir, Almanya ve KKTC. Saatte bir yenilenir. */
async function SunAnswer() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const ist = getSunDay(now, siteConfig.defaultLocation);
  const t = timeIn(timeZone);
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric", weekday: "long" });
  const line = (p: Place) => {
    const s = getSunDay(now, p);
    const tt = timeIn(p.timeZone);
    return `Doğuş ${s.rise ? tt.format(s.rise) : "-"}, batış ${s.set ? tt.format(s.set) : "-"}${isAbroad(p) ? ` (${p.zoneLabel})` : ""}`;
  };

  return (
    <AnswerBox
      question="Bugün güneş kaçta doğuyor, kaçta batıyor?"
      answer={`Bugün (${day.format(now)}) İstanbul'da güneş ${ist.rise ? t.format(ist.rise) : "-"}'de doğuyor, ${ist.set ? t.format(ist.set) : "-"}'de batıyor.`.replace(/(\d)'de/g, "$1")}
      rows={[
        { label: "Gündüz süresi (İstanbul)", value: hm(ist.minutes) },
        { label: "Hava kaçta kararır? (İstanbul)", value: ist.civilDusk ? t.format(ist.civilDusk) : "-" },
        { label: "Ankara", value: line(findPlace("ankara")!) },
        { label: "İzmir", value: line(findPlace("izmir")!) },
        { label: `Almanya (${BERLIN.name})`, value: line(BERLIN) },
        { label: `KKTC (${NICOSIA.name})`, value: line(NICOSIA) },
      ]}
      note={
        <>
          İliniz, yurt dışındaki şehriniz ya da başka bir tarih için{" "}
          <a href="#hesapla" className="underline underline-offset-2">
            aşağıdan seçin
          </a>
          ; ilçe, tatil yeri ya da dünyadaki herhangi bir şehir için arama kutusunu kullanın.
        </>
      }
    />
  );
}

async function SelectedTool({ searchParams }: Pick<PageProps<"/tr/gun-dogumu-gun-batimi">, "searchParams">) {
  const { il, tarih } = await searchParams;
  const place = findPlace(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  const date = parseDate(tarih, place.timeZone);
  return <SunTool slug={place.slug} dateIso={date ? date.toISOString() : null} />;
}

/**
 * Ana araç: seçilen yer ve tarih (varsayılan bugün) için doğuş, batış, yönleri, öğle, alacakaranlık, altın saat;
 * altında o ayın günlük tablosu. Saatler seçilen yerin kendi saatiyle. Saatte bir yenilenir.
 */
async function SunTool({ slug, dateIso }: { slug: string; dateIso: string | null }) {
  "use cache";
  cacheLife("hours");

  const place = findPlace(slug) ?? siteConfig.defaultLocation;
  const tz = place.timeZone;
  const date = dateIso ? new Date(dateIso) : new Date();
  const sun = getSunDay(date, place);
  const t = timeIn(tz);
  const dayFmt = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, day: "numeric", month: "long", year: "numeric", weekday: "long" });
  const p = localDateParts(date, tz);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateValue = `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  const isToday = !dateIso;

  return (
    <section aria-labelledby="hesapla" className="mt-12">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Gün doğumu ve batımı hesaplayıcı</p>
      <h2 id="hesapla" data-toc-label="Yer ve tarih seçin" className="mt-1 scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        {placeName(place)}: {isToday ? "bugün" : dayFmt.format(sun.noon)}
      </h2>

      <Form action={PAGE.path} scroll={false} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          İl / şehir
          <select
            name="il"
            defaultValue={place.slug}
            key={place.slug}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          >
            <optgroup label="Türkiye">
              {PROVINCE_OPTIONS.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
            {ABROAD_OPTIONS.map((g) => (
              <optgroup key={g.country} label={g.country}>
                {g.cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          Tarih
          <input
            type="date"
            name="tarih"
            min="1900-01-01"
            max="2100-12-31"
            defaultValue={dateValue}
            key={dateValue}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button type="submit" className="rounded-lg bg-[#05070d] px-5 py-2.5 font-semibold text-white hover:bg-zinc-800">
          Göster
        </button>
      </Form>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card label="Gün doğumu" value={sun.rise ? t.format(sun.rise) : polarText(sun)} sub={sun.riseAzimuth !== null ? `${direction(sun.riseAzimuth)} (${Math.round(sun.riseAzimuth)}°)` : undefined} />
        <Card label="Gün batımı" value={sun.set ? t.format(sun.set) : polarText(sun)} sub={sun.setAzimuth !== null ? `${direction(sun.setAzimuth)} (${Math.round(sun.setAzimuth)}°)` : undefined} />
        <Card label="Gündüz süresi" value={hm(sun.minutes)} />
        <Card label="Öğle (Güneş en yüksekte)" value={t.format(sun.transit)} sub={`ufuktan ${Math.round(sun.transitAltitude)}°`} />
        <Card
          label="Hava ağarır / kararır"
          value={`${sun.civilDawn ? t.format(sun.civilDawn) : "-"} / ${sun.civilDusk ? t.format(sun.civilDusk) : "-"}`}
          sub="sivil alacakaranlık"
        />
        <Card
          label="Altın saat (akşam)"
          value={sun.goldenEveningStart && sun.set ? `${t.format(sun.goldenEveningStart)} - ${t.format(sun.set)}` : "-"}
          sub="fotoğraf için yumuşak ışık"
        />
      </div>
      <p className="mt-3 text-sm text-zinc-500">
        Saatler {zoneOf(place)}dir; {isAbroad(place) ? "şehir" : "il"} merkezinin koordinatına ve düz ufka göre.
        Yön, Güneş&apos;in ufukta doğduğu ve battığı noktadır (kuzey 0°, doğu 90°).
      </p>

      <MonthTable slug={place.slug} year={p.year} month={p.month} />
    </section>
  );
}

function polarText(sun: SunDay) {
  return sun.polar === "day" ? "batmıyor" : sun.polar === "night" ? "doğmuyor" : "-";
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-[#05070d] p-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{label}</p>
      <p className="mt-1 text-2xl font-light tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

/** Seçilen yerin seçilen aydaki gün doğumu ve batımı takvimi (her gün). Günde bir yenilenir. */
async function MonthTable({ slug, year, month }: { slug: string; year: number; month: number }) {
  "use cache";
  cacheLife("days");

  const place = findPlace(slug) ?? siteConfig.defaultLocation;
  const tz = place.timeZone;
  const days = getMonthSunDays(year, month, place);
  const t = timeIn(tz);
  const dm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: tz, day: "numeric", month: "long", weekday: "short" });
  const monthName = new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 15)),
  );
  const today = localDateParts(new Date(), tz);
  const todayKey = today.year === year && today.month === month ? String(today.day) : undefined;

  return (
    <div className="mt-10">
      <h3 id="aylik" className="scroll-mt-32 text-xl font-semibold">
        {placeName(place)}: {monthName} gün doğumu ve gün batımı takvimi
      </h3>
      <DataTable
        columns={["Gün", "Gün doğumu", "Gün batımı", "Gündüz"]}
        highlight={todayKey}
        rows={days.map((d, i) => ({
          key: String(i + 1),
          cells: [dm.format(d.noon), d.rise ? t.format(d.rise) : "-", d.set ? t.format(d.set) : "-", hm(d.minutes)],
        }))}
      />
      <p className="mt-2 text-sm text-zinc-500">Saatler {zoneOf(place)}; bugünün satırı vurgulu.</p>
    </div>
  );
}

/** Telefonda tabloların ilk açık duran satır sayısı (gerisi "+ daha göster"; HTML'de durur, Google okur). */
const MOBILE_ROWS = 10;

/** Gün doğumu / batımı tablosu: telefonda ilk satırlar açık, gerisi "+ daha göster" arkasında. */
function PlaceSunTable({ places, noun, now }: { places: readonly Place[]; noun: string; now: Date }) {
  return (
    <MobileCollapse
      hiddenCount={places.length - MOBILE_ROWS}
      noun={noun}
      className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-950">
          <tr>
            <th className="px-4 py-2.5 font-medium">{noun === "il" ? "İl" : "Şehir"}</th>
            <th className="px-4 py-2.5 font-medium">Gün doğumu</th>
            <th className="px-4 py-2.5 font-medium">Gün batımı</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Gündüz</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {places.map((p, i) => {
            const d = getDayLength(now, p);
            const t = timeIn(p.timeZone);
            return (
              <tr key={p.slug} data-extra={i >= MOBILE_ROWS || undefined}>
                <td className="px-4 py-2">
                  <Link href={`${PAGE.path}?il=${p.slug}`} rel="nofollow" scroll={false} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  {isAbroad(p) && <span className="ml-1.5 text-zinc-500">{p.country}</span>}
                </td>
                <td className="px-4 py-2 tabular-nums">{d.rise ? t.format(d.rise) : d.polar === "night" ? "doğmuyor" : "-"}</td>
                <td className="px-4 py-2 tabular-nums">{d.set ? t.format(d.set) : d.polar === "day" ? "batmıyor" : "-"}</td>
                <td className="hidden px-4 py-2 tabular-nums sm:table-cell">{hm(d.minutes)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </MobileCollapse>
  );
}

/**
 * "Bugün 81 ilde gün doğumu ve gün batımı": her il bir satır. "bursa güneş doğuşu saat kaçta" gibi aramaların cevabı
 * sayfa metninde dursun diye (il başına ayrı sayfa yok, kırmızı çizgi 1). Saatte bir yenilenir.
 */
async function ProvinceTable() {
  "use cache";
  cacheLife("hours");

  return (
    <section aria-labelledby="iller" className="mt-14">
      <h2 id="iller" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Bugün 81 ilde gün doğumu ve gün batımı saatleri
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        İl merkezlerinde bugünün saatleri (Türkiye saati), alfabetik sırayla. Başka bir gün ya da ayın tamamı için ilin
        adına dokunun.
      </p>
      <PlaceSunTable places={TURKEY_PROVINCES} noun="il" now={new Date()} />
    </section>
  );
}

/**
 * "Bugün dünyada güneş kaçta doğuyor?": yurt dışındaki bütün şehirler, ülkelere göre, yerel saatle; altında yalnız
 * gerçekten farklı bilgi taşıyan ülkeler için elle yazılmış kısa notlar. Saatte bir yenilenir.
 */
async function WorldTable() {
  "use cache";
  cacheLife("hours");

  return (
    <section aria-labelledby="dunyada" className="mt-14">
      <h2 id="dunyada" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Bugün dünyada güneş kaçta doğuyor, kaçta batıyor?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Almanya&apos;dan Avustralya&apos;ya, Türkçe konuşanların çok yaşadığı ülkelerin şehirleri; saatler her şehrin
        kendi yerel saatiyle. Başka bir gün ya da ayın tamamı için şehrin adına dokunun.
      </p>
      <PlaceSunTable places={ABROAD_CITIES} noun="şehir" now={new Date()} />
      <div className="mx-auto max-w-3xl">
        <Prose>
          <p>
            <strong>Almanya:</strong> Ülkenin tamamı tek saat dilimini kullanır, ama batıdaki Köln&apos;de Güneş
            doğudaki Berlin&apos;den kışın yaklaşık 20 dakika, yazın yarım saatten fazla geç doğar. Almanya
            Türkiye&apos;nin kuzeyinde olduğu için kış günleri belirgin biçimde kısadır: aralıkta Berlin&apos;de gündüz 8
            saati bulmaz, haziranda ise 16,5 saati geçer.
          </p>
          <p>
            <strong>İsveç, Norveç ve Danimarka:</strong> Kuzeye gidildikçe fark büyür. Oslo&apos;da aralıkta Güneş
            sabah 9&apos;dan sonra doğup öğleden sonra 3 civarı batar. Kuzey Kutup Dairesi&apos;nin ötesinde kışın
            Güneş hiç doğmaz, yazın hiç batmaz.
          </p>
          <p>
            <strong>ABD, Kanada ve Avustralya:</strong> Bu ülkeler birden fazla saat dilimine bölünür; tablodaki saatler
            her şehrin kendi dilimine göredir. Avustralya güney yarımkürede olduğu için mevsimler terstir:
            Türkiye&apos;de günler kısalırken Sidney&apos;de uzar.
          </p>
        </Prose>
      </div>
    </section>
  );
}

/** KKTC: Lefkoşa, Girne, Gazimağusa, Güzelyurt, İskele için bugün. Saatte bir yenilenir. */
async function KktcTable() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const t = timeIn(NICOSIA.timeZone);
  return (
    <section aria-labelledby="kktc" className="mt-14">
      <h2 id="kktc" className="scroll-mt-32 text-2xl font-semibold tracking-tight sm:text-3xl">
        Kıbrıs&apos;ta (KKTC) güneş kaçta doğuyor, kaçta batıyor?
      </h2>
      <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
        Bugün KKTC şehirlerinde, Kıbrıs saatiyle. Kıbrıs, Türkiye&apos;nin güneyinde olduğu için kışın gündüz biraz daha
        uzun, yazın biraz daha kısadır; kış aylarında saati Türkiye&apos;den 1 saat geridedir.
      </p>
      <DataTable
        columns={["Şehir", "Gün doğumu", "Gün batımı", "Hava kararır", "Gündüz"]}
        rows={KKTC.map((c) => {
          const s = getSunDay(now, c);
          return {
            key: c.slug,
            cells: [
              c.name,
              s.rise ? t.format(s.rise) : "-",
              s.set ? t.format(s.set) : "-",
              s.civilDusk ? t.format(s.civilDusk) : "-",
              hm(s.minutes),
            ],
          };
        })}
      />
    </section>
  );
}

/**
 * "Güneş neden her gün farklı saatte ve farklı yerden doğar?": İstanbul için bu yılın hesaplanmış değerleri
 * (yön değişimi, en erken gün batımı, en geç gün doğumu) ve Van-Edirne farkı. Günde bir yenilenir.
 */
async function YearFacts() {
  "use cache";
  cacheLife("days");

  const now = new Date();
  const year = localDateParts(now, timeZone).year;
  const ist = siteConfig.defaultLocation;
  const s = getSeasons(year);
  const june = getSunDay(s.juneSolstice, ist);
  const dec = getSunDay(s.decemberSolstice, ist);
  const minutesOfDay = (d: Date) => {
    const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .format(d)
      .split(":");
    return Number(h) * 60 + Number(m);
  };
  let earliestSet: SunDay | null = null;
  let latestRise: SunDay | null = null;
  // En erken batış Aralık başında, en geç doğuş Ocak başında: bu yılın 1 Kasım'ından gelecek yılın 31 Ocak'ına bakılır.
  for (let t = Date.UTC(year, 10, 1, 12); t < Date.UTC(year + 1, 1, 1); t += DAY_MS) {
    const d = getSunDay(new Date(t), ist);
    if (d.set && (!earliestSet || minutesOfDay(d.set) < minutesOfDay(earliestSet.set!))) earliestSet = d;
    if (d.rise && (!latestRise || minutesOfDay(d.rise) > minutesOfDay(latestRise.rise!))) latestRise = d;
  }
  const van = getSunDay(now, findPlace("van")!);
  const edirne = getSunDay(now, findPlace("edirne")!);
  const gap = van.rise && edirne.rise ? Math.round((edirne.rise.getTime() - van.rise.getTime()) / 60_000) : 0;
  const t = timeIn(timeZone);
  const dm = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" });

  return (
    <Prose>
      <h2 id="neden">Güneş neden her gün farklı saatte ve farklı yerden doğar?</h2>
      <p>
        Güneş yalnızca ekinoks günlerinde tam doğudan doğar ve tam batıdan batar. Yazın doğuş noktası kuzeye, kışın
        güneye kayar: İstanbul&apos;da Haziran gündönümünde Güneş kuzeydoğudan ({Math.round(june.riseAzimuth ?? 0)}°)
        doğup kuzeybatıdan ({Math.round(june.setAzimuth ?? 0)}°) batar ve öğlen ufuktan {Math.round(june.transitAltitude)}°
        yükselir; Aralık gündönümünde güneydoğudan ({Math.round(dec.riseAzimuth ?? 0)}°) doğar ve öğlen ancak{" "}
        {Math.round(dec.transitAltitude)}° yükselir. Bunun nedeni Dünya&apos;nın eksen eğikliğidir; ayrıntısı{" "}
        <Link href={PAGES.ekinoksGundonumu.path}>Ekinoks ve Gündönümü</Link> sayfasında.
      </p>
      {earliestSet && latestRise && (
        <p>
          İlginç bir ayrıntı: yılın en kısa günü 21-22 Aralık olsa da en erken gün batımı ondan önce, en geç gün doğumu
          ondan sonra gelir. Bu kış İstanbul&apos;da en erken gün batımı {dm.format(earliestSet.noon)} (
          {t.format(earliestSet.set!)}), en geç gün doğumu {dm.format(latestRise.noon)} ({t.format(latestRise.rise!)}).
          Bunun nedeni, Dünya&apos;nın Güneş çevresindeki yörüngesinin tam daire olmaması ve ekseninin eğik olmasıdır:
          Güneş&apos;in en yüksekten geçtiği &quot;öğle&quot; anı aralık ayı boyunca her gün yarım dakika kadar ileri kayar. Aralık
          başında akşamlar, ocak başında ise sabahlar en karanlıktır.
        </p>
      )}
      <p>
        Türkiye boydan boya tek bir saat dilimini kullanır, ama doğusu ile batısı arasında yaklaşık 19 boylam derecesi
        fark vardır. Bu yüzden bugün Van&apos;da Güneş, Edirne&apos;den {gap} dakika önce doğuyor. Doğudaki illerde
        sabahlar erken aydınlanır, akşamlar erken kararır.
      </p>
    </Prose>
  );
}
