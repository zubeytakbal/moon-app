import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  CRESCENT_MIN_ALTITUDE,
  CRESCENT_MIN_ELONGATION,
  findProvince,
  getCrescentEvenings,
  getUpcomingPrincipalPhases,
  TURKEY_PROVINCES,
  type CrescentEvening,
} from "@moon-app/moon";
import { CitySelect } from "@/components/CitySelect";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { pageOpenGraph } from "@/lib/og";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.hilalGozlemi;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));

export const metadata: Metadata = {
  title: `Hilal Gözlemi Nasıl Yapılır? Yeni Hilal Ne Zaman, Nerede Görülür? | ${siteConfig.name}`,
  description:
    "Yeni hilali görmek için ne zaman ve nereye bakmalı? İlinize göre önümüzdeki akşamların gün batımı, ay batışı, hilalin yüksekliği ve yönü. Hilal gözlemi için pratik ipuçları ve güvenlik uyarıları.",
  // İl seçimi (?il=...) ayrı sayfa sayılmasın.
  alternates: { canonical: PAGE.path },
  openGraph: pageOpenGraph(PAGE),
};

export default function CrescentWatchPage({ searchParams }: PageProps<"/tr/hilal-gozlemi">) {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={25}
        eyebrow="Hicri"
        lead="Yeni aydan sonra batı ufkunda beliren ince hilal, gökyüzünün en zarif ve en zor görüntülerinden biridir. Ne zaman ve nereye bakacağınızı bilirseniz bulmak çok daha kolaydır."
        aside={
          <div className="rounded-2xl border border-white/15 bg-black/40 p-5 text-sm text-zinc-200 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Kısaca nasıl?</p>
            <p className="mt-1">
              Gün battıktan 15-30 dakika sonra, Güneş&apos;in battığı noktanın biraz soluna ve yukarısına bakın.
            </p>
          </div>
        }
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Yeni hilal yalnızca akşam, gün batımından kısa süre sonra ve batı ufkunda görülür.</li>
            <li>
              Yeni aydan sonraki ilk akşam hilal genellikle görülemez; ikinci ya da üçüncü akşam çok daha kolaydır.
            </li>
            <li>Güneş tamamen batmadan dürbünle batı ufkuna bakmayın; gözlere kalıcı zarar verebilir.</li>
          </QuickFacts>
        </div>

        <Suspense fallback={<Evenings slug={siteConfig.defaultLocation.slug} />}>
          <SelectedCity searchParams={searchParams} />
        </Suspense>

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Ne zaman bakmalı?</h2>
            <p>
              Hilal, Güneş&apos;e çok yakın ve çok soluk olduğu için gün batımında gökyüzü hâlâ fazla aydınlıktır. En
              iyi zaman, Güneş battıktan <strong>15-30 dakika sonrasıdır</strong>: gökyüzü yeterince kararmış, ama hilal
              henüz batmamıştır. Yukarıdaki kartlarda her akşamın gün batımı ve ay batışı saatleri, yani gözlem
              pencereniz yer alıyor. Ay, gün batımından kısa süre sonra batıyorsa pencere çok dardır.
            </p>

            <h2>Nereye bakmalı?</h2>
            <p>
              Önce Güneş&apos;in battığı noktayı not edin. Yeni hilal bu noktanın biraz yukarısında ve genellikle biraz
              solunda (güneyinde) durur. Kartlarda, hilalin gün batımı noktasına göre konumu derece olarak verildi.
              Dereceyi ölçmenin kolay bir yolu var:{" "}
              <strong>
                kolunuzu tam uzatıp yumruk yaptığınızda, yumruğunuzun genişliği gökyüzünde yaklaşık 10 derecedir.
              </strong>{" "}
              Parmak genişliği ise yaklaşık 1-2 derecedir.
            </p>
            <p>
              Hilalin boynuzları yukarıya, Güneş&apos;in tersine bakar. Çok ince olduğu için bir bulut kenarı ya da uçak
              izi sanılabilir; birkaç dakika boyunca aynı yerde, ufka doğru yavaşça indiğini görürseniz hilaldir.
            </p>

            <h2>Nasıl bir yer seçmeli?</h2>
            <ul>
              <li>
                <strong>Batı ufku açık olmalı.</strong> Hilal ufka çok yakın olduğu için binalar, ağaçlar ve tepeler onu
                kolayca gizler. Deniz kıyısı, yüksek bir tepe ya da düz bir ova idealdir.
              </li>
              <li>
                <strong>Hava berrak olmalı.</strong> Ufka yakın pus ve toz, ince hilali tamamen yok edebilir. Yağmurdan
                sonraki açık akşamlar en iyisidir.
              </li>
              <li>
                <strong>Şehir ışıklarından uzaklaşın.</strong> Batı yönündeki ışık kirliliği alacakaranlığı daha da
                aydınlatır.
              </li>
            </ul>

            <h2>Dürbün kullanımı ve güvenlik</h2>
            <p>
              Dürbün, çok ince bir hilali bulmayı büyük ölçüde kolaylaştırır. Hilali önce dürbünle bulup sonra çıplak
              gözle aramak iyi bir yöntemdir. Ama bir kural kesindir:{" "}
              <strong>Güneş tamamen batmadan dürbünü ya da teleskopu batı ufkuna çevirmeyin.</strong> Güneş&apos;in
              görüş alanına girmesi bir saniyede bile kalıcı göz hasarına yol açabilir.
            </p>

            <h2>Neden bazı aylar daha zor?</h2>
            <p>
              Hilalin akşam ne kadar yüksekte kalacağı, mevsime göre değişir. İlkbahar akşamlarında ayın gökyüzündeki
              yolu ufka dik olduğu için hilal hızla yükselir ve kolay görülür. Sonbahar akşamlarında ise yol ufka
              yatıktır; hilal ufka yakın kalır ve görülmesi bir iki akşam gecikebilir. Bunu{" "}
              <Link href={PAGES.hilal.path}>Hilal</Link> sayfasında ayrıntılı anlattık.
            </p>

            <h2>Rekorlar</h2>
            <p>
              Çıplak gözle görülen en genç hilal, yeni aydan yalnızca 15,5 saat sonra gözlenmiştir; bu, deneyimli
              gözlemcilerin özel koşullarda ulaştığı bir sınırdır. Çoğu insan için hilal, yeni aydan en az bir gün sonra
              görünür hale gelir. Günümüzde özel tekniklerle, ayın tam yeni ay anındaki ince kenarı bile
              fotoğraflanabilmektedir.
            </p>

            <h2>Hilal gözlemi ve Hicri takvim</h2>
            <p>
              Hilal gözlemi, Hicri ayların başlangıcını belirlemek için yüzyıllardır yapılır. Türkiye&apos;de ise Hicri
              ay başları astronomik hesaplarla belirlenir. Ay başlarının nasıl hesaplandığını ve önümüzdeki ayların
              tahmini başlangıçlarını <Link href={PAGES.hicriTakvim.path}>Hicri Takvim</Link> sayfasında bulabilirsiniz.
            </p>
          </Prose>
          <ArticleFooter
            page={PAGE}
            headline="Hilal Gözlemi Nasıl Yapılır? Yeni Hilal Ne Zaman, Nerede Görülür?"
            updated={UPDATED}
            sources={[
              { label: "NASA Science, Moon Phases", href: "https://science.nasa.gov/moon/moon-phases/" },
              {
                label: "NASA Science, Eclipse Safety (Güneş'e bakma güvenliği)",
                href: "https://science.nasa.gov/eclipses/safety/",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
}

async function SelectedCity({ searchParams }: Pick<PageProps<"/tr/hilal-gozlemi">, "searchParams">) {
  const { il } = await searchParams;
  const city = findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
  return <Evenings slug={city.slug} />;
}

type Difficulty = { label: string; tone: "none" | "hard" | "binocular" | "naked" | "easy" };

/** Kaba kolaylık tahmini. Eşikler gözlem deneyimine dayalı yaklaşık değerlerdir. */
function difficulty(e: CrescentEvening): Difficulty {
  if (e.ageHours <= 0) return { label: "Yeni ay henüz olmadı", tone: "none" };
  if (!e.moonSetsAfterSun || e.moonAltitude <= 0)
    return { label: "Görülemez: ay Güneş'ten önce batıyor", tone: "none" };
  if (!e.meetsCriteria) return { label: "Görülmesi beklenmez: ay çok alçakta", tone: "none" };
  if (e.moonAltitude < 8 || e.elongation < 12) return { label: "Çok zor: dürbünle denenebilir", tone: "hard" };
  if (e.moonAltitude < 12) return { label: "Çıplak gözle görülebilir, dikkatli bakın", tone: "naked" };
  return { label: "Kolayca görülür", tone: "easy" };
}

const TONE: Record<Difficulty["tone"], string> = {
  none: "bg-white/10 text-zinc-300",
  hard: "bg-amber-500/20 text-amber-200",
  binocular: "bg-amber-500/20 text-amber-200",
  naked: "bg-emerald-500/20 text-emerald-200",
  easy: "bg-emerald-500/30 text-emerald-100",
};

/** Bir ilde, ilgili yeni aydan sonraki dört akşamın hilal koşulları. Saatte bir yenilenir. */
async function Evenings({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const now = new Date();
  // Son dört gün içinde yeni ay olduysa onu, yoksa bir sonrakini göster.
  const newMoon = getUpcomingPrincipalPhases(new Date(now.getTime() - 4 * DAY_MS), 6).find(
    (p) => p.key === "new-moon",
  )!;
  const evenings = getCrescentEvenings(newMoon.date, city);

  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });
  const dateLong = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const nf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 0 });

  return (
    <section className="mt-12" aria-labelledby="aksamlar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Önümüzdeki hilal akşamları</p>
          <h2 id="aksamlar" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {city.name} için
          </h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Yeni ay: {dateLong.format(newMoon.date)}, saat {time.format(newMoon.date)}
          </p>
        </div>
        <CitySelect action={PAGE.path} options={CITY_OPTIONS} selected={city.slug} />
      </div>

      <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {evenings.map((e) => {
          const d = difficulty(e);
          const offset = e.moonAzimuth - e.sunAzimuth;
          const side = offset < 0 ? "solunda" : "sağında";
          const windowMin = e.moonSet ? Math.round((e.moonSet.getTime() - e.sunset.getTime()) / 60_000) : 0;
          return (
            <li key={e.sunset.toISOString()} className="rounded-2xl bg-[#05070d] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{date.format(e.sunset)}</p>
                  <p className="text-sm text-zinc-400">
                    Ay yaşı: {e.ageHours > 0 ? `${nf.format(e.ageHours)} saat` : "yeni ay henüz olmadı"}
                  </p>
                </div>
                <MoonPhaseIcon phaseAngle={Math.max(4, Math.min(e.elongation, 60))} size={48} title="Hilal" />
              </div>
              <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${TONE[d.tone]}`}>
                {d.label}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-zinc-400">Gün batımı</dt>
                  <dd className="font-medium tabular-nums">{time.format(e.sunset)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">Ay batışı</dt>
                  <dd className="font-medium tabular-nums">
                    {e.moonSet ? time.format(e.moonSet) : "-"}
                    {windowMin > 0 && <span className="text-zinc-400"> ({windowMin} dk sonra)</span>}
                  </dd>
                </div>
                {e.moonAltitude > 0 && e.moonSetsAfterSun && (
                  <div className="col-span-2">
                    <dt className="text-zinc-400">Nereye bakmalı (gün batımı anında)</dt>
                    <dd className="font-medium">
                      Gün batımı noktasının {nf.format(Math.abs(offset))}° {side}, ufuktan {nf.format(e.moonAltitude)}°
                      yukarıda
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-sm text-zinc-500">
        Kolaylık tahmini kabadır: gün batımında ayın yüksekliği ve Güneş&apos;ten uzaklığına bakar (en az{" "}
        {CRESCENT_MIN_ALTITUDE}° yükseklik ve {CRESCENT_MIN_ELONGATION}° açı olmadan &quot;görülmesi beklenmez&quot;).
        Hava, ufuk ve gözlemcinin deneyimi sonucu büyük ölçüde değiştirir.
      </p>
    </section>
  );
}
