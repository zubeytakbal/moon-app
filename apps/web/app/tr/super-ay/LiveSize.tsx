import { cacheLife } from "next/cache";
import {
  getFullMoonsOfYear,
  getMoonDistanceKm,
  getMoonPhase,
  getUpcomingLunarApsides,
  localDateParts,
} from "@moon-app/moon";
import { AddToCalendar } from "@/components/AddToCalendar";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { icsTime } from "@/lib/ics";
import { PAGES } from "@/lib/pages";
import { SUPERMOON_KM } from "@/lib/supermoon";
import { siteConfig } from "@/site.config";

/** Ayın Dünya'ya ortalama uzaklığı (km). */
const MEAN_KM = 384_400;
const DAY_MS = 86_400_000;
const timeZone = siteConfig.defaultLocation.timeZone;

/**
 * "Ay şu an ne kadar büyük?": canlı uzaklık, ortalamaya göre görünen boyut, ortalama ay, şu anki ay ve
 * bir sonraki süper ayın gerçek oranlı karşılaştırması, sıradaki yakınberi ve uzakberi. Saatte bir yenilenir.
 */
export async function LiveSize() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const km = getMoonDistanceKm(now);
  const phase = getMoonPhase(now, timeZone);
  const { year } = localDateParts(now, timeZone);
  const nextSuper = [...getFullMoonsOfYear(year), ...getFullMoonsOfYear(year + 1), ...getFullMoonsOfYear(year + 2)]
    .map((p) => ({ date: p.date, km: getMoonDistanceKm(p.date) }))
    .find((m) => m.date > now && m.km < SUPERMOON_KM);
  const apsides = getUpcomingLunarApsides(now, 2);

  const nf = new Intl.NumberFormat(siteConfig.locale);
  const pf = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 });
  const dateTime = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const diff = (MEAN_KM / km - 1) * 100;

  // Görünen boyut uzaklıkla ters orantılıdır; en büyük disk 150 px.
  const discs = [
    { label: "Ortalama", km: MEAN_KM, angle: 180, note: `${nf.format(MEAN_KM)} km` },
    { label: "Şu an", km, angle: phase.phaseAngle, note: `${nf.format(Math.round(km))} km` },
    ...(nextSuper
      ? [{ label: "Süper ay", km: nextSuper.km, angle: 180, note: `${nf.format(Math.round(nextSuper.km))} km` }]
      : []),
  ];
  const nearest = Math.min(...discs.map((d) => d.km));
  const sizeOf = (d: number) => Math.round((150 * nearest) / d);

  return (
    <section className="bg-[#05070d] text-white" aria-labelledby="canli-boyut">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <h2 id="canli-boyut" className="text-xl font-semibold">
            Ay şu an ne kadar büyük?
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Ayın Dünya&apos;ya uzaklığı her an değişir. Daireler gökyüzündeki görünen boyutla aynı oranda çizilmiştir.
          </p>

          <div className="mt-6 grid grid-cols-3 items-end gap-2 sm:gap-6">
            {discs.map((d) => (
              <figure key={d.label} className="flex flex-col items-center text-center">
                <div style={{ width: `${(sizeOf(d.km) / 150) * 100}%`, maxWidth: sizeOf(d.km) }}>
                  <MoonPhaseIcon phaseAngle={d.angle} size={sizeOf(d.km)} title={d.label} />
                </div>
                <figcaption className="mt-3 leading-tight">
                  <span className={`block text-sm font-semibold ${d.label === "Şu an" ? "text-indigo-200" : ""}`}>
                    {d.label}
                  </span>
                  <span className="block text-xs tabular-nums text-zinc-400">{d.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase tracking-wider text-zinc-400">Şu anki uzaklık</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{nf.format(Math.round(km))} km</dd>
              <dd className="mt-0.5 text-sm text-zinc-300">
                Ortalamadan %{pf.format(Math.abs(diff))} {diff >= 0 ? "büyük" : "küçük"} görünüyor
              </dd>
            </div>
            {/* Sıradaki yakınberi ve uzakberi, tarih sırasıyla. */}
            {apsides.map((x) => (
              <div key={x.kind} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <dt className="text-xs uppercase tracking-wider text-zinc-400">
                  {x.kind === "perigee" ? "En yakın an (yakınberi)" : "En uzak an (uzakberi)"}
                </dt>
                <dd className="mt-1 text-lg font-semibold">{dateTime.format(x.date)}</dd>
                <dd className="mt-0.5 text-sm tabular-nums text-zinc-300">{nf.format(Math.round(x.km))} km</dd>
              </div>
            ))}
          </dl>

          {nextSuper && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-indigo-300/30 bg-indigo-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="block text-xs uppercase tracking-wider text-indigo-200/80">Bir sonraki süper ay</span>
                <span className="text-lg font-semibold">{date.format(nextSuper.date)}</span>
                <span className="ml-2 text-sm text-zinc-300">
                  {Math.ceil((nextSuper.date.getTime() - now.getTime()) / DAY_MS)} gün sonra
                </span>
              </p>
              <AddToCalendar
                fileName={`super-ay-${nextSuper.date.toISOString().slice(0, 10)}.ics`}
                event={{
                  uid: `super-ay-${nextSuper.date.toISOString().slice(0, 10)}`,
                  summary: "Süper ay (dolunay)",
                  description: `Dolunay anı, ay Dünya'ya ${nf.format(Math.round(nextSuper.km))} km uzaklıkta. Ay doğarken doğu ufkuna bakın.`,
                  url: new URL(PAGES.superAy.path, siteConfig.url).toString(),
                  start: icsTime(nextSuper.date),
                  end: icsTime(new Date(nextSuper.date.getTime() + 3_600_000)),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
