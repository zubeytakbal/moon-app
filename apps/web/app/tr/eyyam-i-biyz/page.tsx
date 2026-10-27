import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ArticleFooter, PhaseHero } from "@/components/phase/PhaseParts";
import { Prose } from "@/components/Prose";
import { QuickFacts } from "@/components/QuickFacts";
import { getUpcomingEyyamiBiyz, type BiyzMonth } from "@/lib/hijri";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const PAGE = PAGES.eyyamiBiyz;
const UPDATED = "2026-10-27";
const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;

export const metadata: Metadata = {
  title: `Eyyam-ı Biyz Orucu Ne Zaman? Eyyam-ı Biyz Günleri | ${siteConfig.name}`,
  description:
    "Eyyam-ı biyz günleri ve eyyam-ı biyz orucu ne zaman? Hicri ayların 13, 14 ve 15. günlerinin önümüzdeki aylar için Miladi tarihleri, o gecelerde ayın görünüşü. Kesin tarihler için Diyanet takvimine bakınız.",
  alternates: { canonical: PAGE.path },
};

function noteFor(m: BiyzMonth): string | null {
  if (m.monthName === "Ramazan") return "Ramazan ayı içinde: bu günler zaten oruçla geçer.";
  if (m.monthName === "Zilhicce")
    return "13 Zilhicce, Kurban Bayramı'nın dördüncü günüdür; bayram günlerinde oruç tutulmaz.";
  return null;
}

export default function EyyamiBiyzPage() {
  return (
    <>
      <PhaseHero
        page={PAGE}
        angle={175}
        eyebrow="Hicri ve gelenek"
        lead="Hicri ayların 13, 14 ve 15. günlerine eyyam-ı biyz, yani “beyaz günler” denir. Adını, ayın dolunaya yaklaşıp geceleri ışıl ışıl aydınlattığı bu günlerden alır."
        aside={<NextBiyz />}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <QuickFacts>
            <li>Eyyam-ı biyz, her Hicri ayın 13, 14 ve 15. günleridir; her ay tekrar eder.</li>
            <li>Bu günlerde oruç tutmak, İslam geleneğinde tavsiye edilen (sünnet) bir ibadettir.</li>
            <li>
              Tarihler hesaplı Hicri takvime göredir.{" "}
              <strong>Kesin dinî tarihler için Diyanet takvimini esas alın.</strong>
            </li>
          </QuickFacts>
        </div>

        <h2 className="mt-12 text-2xl font-semibold tracking-tight sm:text-3xl">Önümüzdeki eyyam-ı biyz günleri</h2>
        <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">
          Her ayın 13, 14 ve 15. günlerinin Miladi tarihleri. Ay görselleri o günlerin akşamındaki gerçek görünümdür.
        </p>
        <BiyzList />

        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Eyyam-ı biyz ne demek?</h2>
            <p>
              &quot;Eyyam&quot; Arapçada &quot;günler&quot;, &quot;biyz&quot; ise &quot;beyazlar&quot; demektir. Eyyam-ı
              biyz, &quot;beyaz günler&quot; anlamına gelir. Hicri aylar ince bir{" "}
              <Link href={PAGES.hilal.path}>hilalin</Link> görülmesiyle başladığı için ay, her Hicri ayın ortasında{" "}
              <Link href={PAGES.dolunay.path}>dolunaya</Link> ulaşır. Ayın 13, 14 ve 15. gecelerinde gökyüzü ay ışığıyla
              aydınlanır; bu günlerin adı da buradan gelir.
            </p>
            <p>
              Türkçedeki &quot;ayın on dördü gibi&quot; deyimi de aynı kaynaktan doğar: Hicri ayın 14. gecesinde ay en
              parlak, en yuvarlak halindedir.
            </p>

            <h2>Eyyam-ı biyz orucu</h2>
            <p>
              Hz. Peygamber&apos;in her ay bu üç gün oruç tuttuğu ve bunu tavsiye ettiği rivayet edilir. Bu yüzden
              eyyam-ı biyz orucu, İslam geleneğinde nafile (gönüllü) oruçların en bilinenlerinden biridir. Orucun nasıl
              tutulacağı, niyet ve diğer dinî hükümler için Diyanet İşleri Başkanlığı&apos;nın kaynaklarına başvurmanızı
              öneririz.
            </p>
            <p>
              İki özel durum vardır. Ramazan ayındaki eyyam-ı biyz günleri zaten oruçla geçer. Zilhicce ayının 13. günü
              ise Kurban Bayramı&apos;nın dördüncü günüdür; bayram günlerinde oruç tutulmadığı için bu ay yalnızca 14 ve
              15. günler kalır. Listede bu aylar ayrıca belirtilmiştir.
            </p>

            <h2>Hicri gün akşam başlar</h2>
            <p>
              Hicri takvimde gün gün batımıyla başlar. Yani Hicri ayın 13. gecesi, Miladi takvimde 13. günden önceki
              akşamdır. Oruç ise gündüz tutulduğu için listedeki Miladi tarihler, orucun tutulacağı günleri gösterir.
            </p>

            <h2>Ay bu günlerde gerçekten dolunay mı?</h2>
            <p>
              Çoğu zaman yakındır ama tam değil. Astronomik <Link href={PAGES.dolunay.path}>dolunay</Link> tek bir andır
              ve Hicri ayın 13 ile 16. günleri arasında herhangi bir güne denk gelebilir. Listede her günün akşamındaki
              ayın gerçek görünümü ve aydınlık oranı yer alıyor; görüldüğü gibi bu üç gece boyunca ay yüzde 90&apos;ın
              üzerinde aydınlıktır.
            </p>

            <h2>Tarihler nasıl hesaplanıyor?</h2>
            <p>
              Hicri tarihler, Suudi Arabistan&apos;ın resmî hesaplı takvimi olan Ümmülkurâ takvimine göre
              belirlenmiştir. Bu takvimi Diyanet&apos;in 2027 yılı dinî günleriyle (Ramazan başlangıcı, bayramlar,
              kandiller, Hicri yılbaşı, Aşure) karşılaştırdık ve hepsinin aynı güne denk geldiğini gördük. Yine de iki
              takvim farklı ölçütlere dayandığı için nadiren bir gün fark çıkabilir; kesin tarih için Diyanet takvimine
              bakın. Hicri takvimin nasıl işlediğini <Link href={PAGES.hicriTakvim.path}>Hicri Takvim</Link> sayfasında
              anlattık.
            </p>
          </Prose>
          <ArticleFooter
            page={PAGE}
            headline="Eyyam-ı Biyz Orucu Ne Zaman? Eyyam-ı Biyz Günleri"
            updated={UPDATED}
            sources={[
              {
                label: "Diyanet İşleri Başkanlığı, Dinî Günler",
                href: "https://vakithesaplama.diyanet.gov.tr/dini_gunler.php",
              },
              {
                label: "Diyanet İşleri Başkanlığı, 2027 Dinî Günler Listesi",
                href: "https://vakithesaplama.diyanet.gov.tr/icerik.php?icerik=154",
              },
            ]}
          />
        </div>
      </main>
    </>
  );
}

const fmt = () => ({
  date: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" }),
  short: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" }),
  weekday: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" }),
});

/** Bir sonraki eyyam-ı biyz. Saatte bir yenilenir. */
async function NextBiyz() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const [next] = getUpcomingEyyamiBiyz(now, 1, timeZone);
  const f = fmt();
  const first = next.days[0].date;
  const last = next.days.at(-1)!.date;
  const ongoing = first.getTime() - 12 * 3_600_000 <= now.getTime();
  const days = Math.ceil((first.getTime() - 12 * 3_600_000 - now.getTime()) / DAY_MS);

  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">
        {ongoing ? "Şu an eyyam-ı biyz günlerindeyiz" : "Bir sonraki eyyam-ı biyz"}
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {f.short.format(first)} – {f.date.format(last)}
      </p>
      <p className="mt-0.5 text-zinc-300">
        {next.monthName} {next.hijriYear} · Hicri {next.days.map((d) => d.hijriDay).join(", ")}
      </p>
      {!ongoing && (
        <p className="mt-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-200">
          {days} gün sonra
        </p>
      )}
    </div>
  );
}

/** Önümüzdeki 12 Hicri ayın eyyam-ı biyz günleri. Saatte bir yenilenir. */
async function BiyzList() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const list = getUpcomingEyyamiBiyz(now, 12, timeZone);
  const f = fmt();

  return (
    <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {list.map((m, i) => {
        const note = noteFor(m);
        return (
          <li
            key={`${m.hijriYear}-${m.monthName}`}
            className={`rounded-2xl bg-[#05070d] p-5 text-white ${i === 0 ? "ring-2 ring-indigo-400" : ""}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              {m.monthName} {m.hijriYear}
              {i === 0 && <span className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 text-white">Sıradaki</span>}
            </p>
            <ul className="mt-3 space-y-2">
              {m.days.map((d) => {
                const skip = m.monthName === "Zilhicce" && d.hijriDay === 13;
                return (
                  <li key={d.date.toISOString()} className={`flex items-center gap-3 ${skip ? "opacity-50" : ""}`}>
                    <MoonPhaseIcon phaseAngle={d.phaseAngle} size={32} title="" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        <time dateTime={d.date.toISOString().slice(0, 10)}>{f.date.format(d.date)}</time>
                      </span>
                      <span className="block text-sm text-zinc-400">
                        {f.weekday.format(d.date)} · Hicri {d.hijriDay}
                        {skip && " · bayram günü"}
                      </span>
                    </span>
                    <span className="text-sm tabular-nums text-zinc-400">%{Math.round(d.illumination * 100)}</span>
                  </li>
                );
              })}
            </ul>
            {note && <p className="mt-3 text-sm text-amber-200">{note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
