import type { Metadata } from "next";
import Link from "next/link";
import {
  findProvince,
  getLocalSolarEclipse,
  getNextFullMoon,
  getNextNewMoon,
  getUpcomingLunarEclipses,
  getUpcomingSolarEclipses,
  getVoidOfCoursePeriods,
} from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ArticleFooter } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { toHijri } from "@/lib/hijri";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.yontem;
const UPDATED = "2026-10-28";
const timeZone = siteConfig.defaultLocation.timeZone;
const NF = new Intl.NumberFormat("tr-TR");

export const metadata: Metadata = {
  title: `Yöntem ve Doğruluk: Hesaplarımızı Nasıl Doğruluyoruz? | ${siteConfig.name}`,
  description:
    "Ay evresi, tutulma, doğuş-batış ve Hicri tarih hesaplarımız nasıl yapılıyor? NASA, USNO ve Diyanet verileriyle karşılaştırma tablosu, kendi tanımlarımız ve bilinen sınırlar.",
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

const SOURCES = {
  usno: { label: "USNO, Moon Phases", href: "https://aa.usno.navy.mil/data/MoonPhases" },
  nasaLunar: { label: "NASA Eclipse Web Site, ay tutulmaları", href: "https://eclipse.gsfc.nasa.gov/lunar.html" },
  nasaSolar: { label: "NASA Eclipse Web Site, güneş tutulmaları", href: "https://eclipse.gsfc.nasa.gov/solar.html" },
  diyanet: { label: "Diyanet, Dinî Günler", href: "https://vakithesaplama.diyanet.gov.tr/dini_gunler.php" },
  voc: { label: "Authority Astrology, Void of Course Moon", href: "https://www.authorityastrology.com/void-of-course-moon/" },
} as const;

interface Check {
  topic: string;
  source: keyof typeof SOURCES;
  reference: string;
  ours: string;
  /** Kaynakla aramızdaki fark, insan diliyle. */
  result: string;
  ok: boolean;
  usedOn: { href: string; label: string };
}

/** Ekranda görünen (saniyesi atılmış) dakikalar arasındaki fark. */
function minutesApart(a: Date, b: Date) {
  return Math.abs(Math.floor(a.getTime() / 60_000) - Math.floor(b.getTime() / 60_000));
}

function timeResult(minutes: number) {
  return minutes === 0 ? "Aynı dakika" : `${minutes} dakika fark`;
}

/**
 * Karşılaştırma tablosu. Kaynak değerleri yayımlanmış tablolardan elle alındı;
 * "bizim hesap" sütunu sayfa derlenirken sitenin kullandığı fonksiyonlarla yeniden hesaplanır.
 * Böylece hesap kodu değişirse tablo da kendiliğinden değişir.
 */
function buildChecks(): Check[] {
  const dt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const checks: Check[] = [];

  const timed = (
    topic: string,
    source: keyof typeof SOURCES,
    referenceIso: string,
    ours: Date,
    usedOn: Check["usedOn"],
  ) => {
    const ref = new Date(referenceIso);
    const minutes = minutesApart(ref, ours);
    checks.push({
      topic,
      source,
      reference: dt.format(ref),
      ours: dt.format(ours),
      result: timeResult(minutes),
      ok: minutes <= 2,
      usedOn,
    });
  };

  const from = (iso: string) => new Date(`${iso}T00:00:00Z`);
  const dolunay = { href: PAGES.dolunay.path, label: "Dolunay" };
  const yeniAy = { href: PAGES.yeniAy.path, label: "Yeni Ay" };
  const tutulma = { href: PAGES.ayTutulmalari.path, label: "Ay Tutulmaları" };
  const gunes = { href: PAGES.gunesTutulmasi.path, label: "Güneş Tutulması" };

  timed("Dolunay anı", "usno", "2026-11-24T14:53:00Z", getNextFullMoon(from("2026-11-01")), dolunay);
  timed("Yeni ay anı", "usno", "2026-11-09T07:02:00Z", getNextNewMoon(from("2026-11-01")), yeniAy);
  timed(
    "Tam ay tutulması, en derin an",
    "nasaLunar",
    "2025-09-07T18:11:00Z",
    getUpcomingLunarEclipses(from("2025-09-01"), 1)[0].peak,
    { href: PAGES.kanliAy.path, label: "Kanlı Ay" },
  );
  timed(
    "Tam ay tutulması, en derin an",
    "nasaLunar",
    "2026-03-03T11:33:00Z",
    getUpcomingLunarEclipses(from("2026-02-20"), 1)[0].peak,
    tutulma,
  );
  timed(
    "Tam güneş tutulması, en büyük an",
    "nasaSolar",
    "2027-08-02T10:07:00Z",
    getUpcomingSolarEclipses(from("2027-07-01"), 1)[0].peak,
    gunes,
  );

  // Türkiye'den görülen iki tam güneş tutulması: o ilden "tam" görünüyor mu?
  for (const [iso, slug, refText] of [
    ["1999-08-01", "sivas", "11 Ağustos 1999: Sivas tam tutulma şeridinde"],
    ["2006-03-20", "antalya", "29 Mart 2006: Antalya tam tutulma şeridinde"],
  ] as const) {
    const province = findProvince(slug)!;
    const local = getLocalSolarEclipse(from(iso), province);
    const total = local.kind === "total";
    checks.push({
      topic: "Tarihî tam güneş tutulması",
      source: "nasaSolar",
      reference: refText,
      ours: `${day.format(local.peak)}: ${province.name} için ${total ? "tam tutulma" : "tam değil"}`,
      result: total ? "Uyuşuyor" : "Uyuşmuyor",
      ok: total,
      usedOn: gunes,
    });
  }

  const ramadan = toHijri(new Date("2027-02-08T09:00:00Z"), timeZone);
  const ramadanOk = ramadan.monthName === "Ramazan" && ramadan.day === 1;
  checks.push({
    topic: "Ramazan'ın ilk günü (1448)",
    source: "diyanet",
    reference: "8 Şubat 2027",
    ours: `8 Şubat 2027 = ${ramadan.day} ${ramadan.monthName} ${ramadan.year}`,
    result: ramadanOk ? "Aynı gün" : "Farklı gün",
    ok: ramadanOk,
    usedOn: { href: PAGES.hicriTakvim.path, label: "Hicri Takvim" },
  });

  const voc = getVoidOfCoursePeriods(from("2026-11-04"), 1)[0];
  const vocHours = (voc.end.getTime() - voc.start.getTime()) / 3_600_000;
  checks.push({
    topic: "Boşluktaki ay, Başak → Terazi",
    source: "voc",
    reference: "4-5 Kasım 2026, 31,7 saat",
    ours: `${day.format(voc.start)}, ${NF.format(Math.round(vocHours * 10) / 10)} saat`,
    result: Math.abs(vocHours - 31.7) < 0.1 ? "Aynı süre" : `${NF.format(Math.round(Math.abs(vocHours - 31.7) * 10) / 10)} saat fark`,
    ok: Math.abs(vocHours - 31.7) < 0.2,
    usedOn: { href: PAGES.aybosluk.path, label: "Ay Boşlukta Takvimi" },
  });

  return checks;
}

export default function MethodPage() {
  const checks = buildChecks();
  const passed = checks.filter((c) => c.ok).length;

  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-16">
          <Breadcrumb page={PAGE} tone="dark" />
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Şeffaflık</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{PAGE.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-200">
            Sitedeki her tarih ve saat hesapla bulunur. Bu sayfada hesabı nasıl yaptığımızı, sonuçları hangi resmî
            kaynaklarla karşılaştırdığımızı ve nerede fark çıkabileceğini anlatıyoruz.
          </p>
          <div className="mt-8 inline-flex items-baseline gap-3 rounded-2xl border border-white/15 bg-black/40 px-5 py-4">
            <span className="text-4xl font-extralight tabular-nums">
              {passed}/{checks.length}
            </span>
            <span className="text-zinc-300">karşılaştırma kaynakla uyuşuyor</span>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <QuickFacts>
          <li>Ay ve Güneş konumları, açık kaynaklı Astronomy Engine kütüphanesiyle sitenin kendi sunucusunda hesaplanır.</li>
          <li>Sonuçlar NASA, ABD Deniz Gözlemevi (USNO) ve Diyanet&apos;in yayımladığı tarihlerle karşılaştırıldı.</li>
          <li>Hicri tarihler ve bayramlar için resmî kaynak Diyanet&apos;tir; site yalnızca bilgi verir.</li>
        </QuickFacts>

        <Prose>
          <h2>Hesaplar nasıl yapılıyor?</h2>
          <p>
            Ayın ve Güneş&apos;in gökyüzündeki konumunu{" "}
            <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">
              Astronomy Engine
            </a>{" "}
            adlı açık kaynaklı bir kütüphaneyle hesaplıyoruz. Kütüphanenin kodu herkese açıktır ve internete bağlanmadan
            çalışır. Yani sitedeki tarihler başka bir sitenin verisinden kopyalanmaz, her sayfa açıldığında ya da
            sayfa yenilendiğinde yeniden hesaplanır.
          </p>
          <p>
            Hesaplar Türkiye saatine (Europe/Istanbul) göre yapılır. Konum seçilmeyen sayfalarda varsayılan konum
            İstanbul&apos;dur. Doğuş ve batış gibi yere bağlı bilgiler 81 ilin her biri için ayrı ayrı hesaplanır.
          </p>
        </Prose>

        <section aria-labelledby="karsilastirma" className="mt-12">
          <h2 id="karsilastirma" className="text-2xl font-semibold tracking-tight">
            Resmî kaynaklarla karşılaştırma
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Soldaki değerleri kaynaklardan aldık. &quot;Bizim hesap&quot; sütunu ise sitenin kullandığı kodla, bu sayfa
            her derlendiğinde yeniden hesaplanır. Saatler Türkiye saatidir.
          </p>
          <ul className="mt-6 space-y-3">
            {checks.map((c) => (
              <li
                key={`${c.topic}-${c.reference}`}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{c.topic}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                      c.ok
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                    }`}
                  >
                    {c.ok ? "✓ " : "✗ "}
                    {c.result}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-zinc-500">Kaynak</dt>
                    <dd className="mt-0.5">{c.reference}</dd>
                    <dd className="mt-0.5">
                      <a
                        href={SOURCES[c.source].href}
                        target="_blank"
                        rel="noopener"
                        className="text-zinc-500 underline underline-offset-2"
                      >
                        {SOURCES[c.source].label}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-zinc-500">Bizim hesap</dt>
                    <dd className="mt-0.5">{c.ours}</dd>
                    <dd className="mt-0.5 text-zinc-500">
                      Kullanıldığı sayfa:{" "}
                      <Link href={c.usedOn.href} className="underline underline-offset-2">
                        {c.usedOn.label}
                      </Link>
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Bir dakikalık farklar yuvarlamadan gelir: kaynaklar saati dakikaya yuvarlayarak yayımlar, NASA&apos;nın
            tutulma tabloları da biraz farklı bir zaman ölçeği kullanır. Gözlem açısından bu fark önemsizdir.
          </p>
        </section>

        <Prose>
          <h2>Nerede fark çıkabilir?</h2>
          <p>Hesap ne kadar doğru olursa olsun, bazı konularda gerçek hayattaki sonuç başka etkenlere de bağlıdır:</p>
          <ul>
            <li>
              <strong>Doğuş ve batış saatleri:</strong> Ayın üst kenarının düz bir ufka değdiği an hesaplanır, havanın
              ışığı kırması da hesaba katılır. Dağ, bina ya da sis varsa ayı birkaç dakika geç görürsünüz. İl için
              verilen saat, ilin merkezine göredir.
            </li>
            <li>
              <strong>Hilal ve Hicri ay başları:</strong> Hilalin görülüp görülmeyeceğini önceden kesin bilmek mümkün
              değildir. Bizim Ankara için kullandığımız ölçüt (gün batımında ay en az 5° yüksekte, Güneş&apos;ten en
              az 8° uzakta) çoğu ay, Diyanet&apos;in takviminden bir gün sonrasını gösterir. Bu yüzden{" "}
              <Link href={PAGES.hicriTakvim.path}>Hicri tarihleri</Link> Ümmülkurâ takvimiyle veriyoruz. Bu takvim
              Diyanet&apos;in 2027 dinî günlerinden dokuzuyla aynı güne düşüyor: Miraç, Berat, Kadir ve Mevlid
              kandilleri, Ramazan başı, iki bayram, Hicri yılbaşı ve Aşure. Yine de resmî tarih için her zaman Diyanet&apos;e bakın.
            </li>
            <li>
              <strong>Tutulmanın görünmesi:</strong> Hesap, tutulmanın o anda gökyüzünde olup olmadığını söyler. Bulut
              ve ufuk durumunu söyleyemez.
            </li>
          </ul>

          <h2>Kendi tanımlarımız</h2>
          <p>
            Bazı kavramların herkesin kabul ettiği tek bir tanımı yoktur. Bu durumlarda hangi tanımı kullandığımızı
            açıkça yazıyoruz:
          </p>
          <ul>
            <li>
              <strong>Evre adı:</strong> Yeni ay, ilk dördün, dolunay ve son dördün bir andır. O anın düştüğü günün
              tamamına bu adı veriyoruz; diğer günlere ayın Güneş&apos;e göre açısına göre ad veriyoruz.
            </li>
            <li>
              <strong>Süper ay:</strong> Dolunay anında Dünya&apos;ya uzaklığı {NF.format(SUPERMOON_KM)} km&apos;den
              az olan dolunay. Ayrıntısı <Link href={PAGES.superAy.path}>Süper Ay</Link> sayfasında.
            </li>
            <li>
              <strong>Ay burcu:</strong> Batı astrolojisinin kullandığı tropikal burçlar (Koç burcu ilkbahar
              noktasından başlar). Gökyüzündeki takımyıldızlarla aynı değildir; farkı{" "}
              <Link href={PAGES.ayHangiBurcta.path}>Bugün Ay Hangi Burçta</Link> sayfasında gösteriyoruz.
            </li>
            <li>
              <strong>Boşluktaki ay:</strong> Güneş&apos;ten Plüton&apos;a dokuz gök cismi ve beş klasik açı.
              Kullanılan cisim listesi değişirse süreler de değişir.
            </li>
          </ul>

          <h2>Astroloji ve gelenek sayfaları</h2>
          <p>
            Ay burcu, boşluktaki ay, saç kesimi ve ekim-dikim sayfalarında ayın konumu bilimsel olarak hesaplanır ama
            bu konuma yüklenen anlam geleneğe dayanır. Bu sayfaları &quot;geleneksel takvim&quot; olarak sunuyoruz;
            bilimsel bir etkisi kanıtlanmış gibi yazmıyoruz. Her birinde &quot;bilim ne diyor&quot; bölümü bulunur.
          </p>

          <h2>Görseller</h2>
          <p>
            Ay fotoğrafları NASA&apos;nın kamu malı görselleridir; her birinin altında çeken kişi ya da birim ve
            kaynak kaydı yazılıdır. Evre gölgeleri ve tutulma çizimleri bu site için hesapla çizilmiştir. Sitenin
            NASA ile bir bağı yoktur.
          </p>
        </Prose>

        <ArticleFooter
          page={PAGE}
          headline="Yöntem ve Doğruluk: Hesaplarımızı Nasıl Doğruluyoruz?"
          updated={UPDATED}
          sources={[
            { label: "Astronomy Engine (açık kaynak kodu)", href: "https://github.com/cosinekitty/astronomy" },
            SOURCES.usno,
            SOURCES.nasaLunar,
            SOURCES.nasaSolar,
            SOURCES.diyanet,
          ]}
        />
      </main>
    </>
  );
}
