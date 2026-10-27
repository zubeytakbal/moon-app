import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import {
  getMoonPhase,
  getMoonRiseSet,
  getNextFullMoon,
  getNextNewMoon,
  isSouthernHemisphere,
} from "@moon-app/moon";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: `Bugün Ay Nasıl? Ayın Evresi ve Doğuş-Batış Saatleri | ${siteConfig.name}`,
  description:
    "Bugün ay hangi evrede, yüzde kaçı aydınlık, kaç günlük? İstanbul için ayın doğuş ve batış saatleri ve bir sonraki dolunay tarihi.",
};

export default function TodayMoonPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bugün Ay Nasıl?</h1>
      <TodayMoon />
    </main>
  );
}

/**
 * Ay verisi sunucuda hesaplanır ve saatlik önbelleğe alınır ("hours" profili:
 * en geç 1 saatte bir yenilenir). Böylece sayfa her gün kendiliğinden güncellenir.
 */
async function TodayMoon() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const location = siteConfig.defaultLocation;
  const phase = getMoonPhase(now, location.timeZone);
  const { rise, set } = getMoonRiseSet(now, location);
  const nextFull = getNextFullMoon(now);
  const nextNew = getNextNewMoon(now);

  const dateFmt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: location.timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const timeFmt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: location.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateTimeFmt = new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: location.timeZone,
    day: "numeric",
    month: "long",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  const percent = new Intl.NumberFormat(siteConfig.locale, { style: "percent", maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: 1 });

  return (
    <>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        <time dateTime={now.toISOString()}>{dateFmt.format(now)}</time>, {location.name}
      </p>

      <section className="mt-8 flex flex-col items-center gap-6 rounded-2xl bg-[#0b1020] px-6 py-10 text-white sm:flex-row sm:gap-10 sm:px-10">
        <MoonPhaseIcon
          phaseAngle={phase.phaseAngle}
          size={180}
          southern={isSouthernHemisphere(location)}
          title={`${phase.name}, yüzde ${Math.round(phase.illumination * 100)} aydınlık`}
        />
        <div className="text-center sm:text-left">
          <p className="text-sm uppercase tracking-widest text-zinc-400">Ayın evresi</p>
          <p className="mt-1 text-3xl font-semibold">{phase.name}</p>
          <p className="mt-3 text-zinc-300">
            {percent.format(phase.illumination)} aydınlık · {decimal.format(phase.ageDays)} günlük ·{" "}
            {phase.isWaxing ? "büyüyor" : "küçülüyor"}
          </p>
        </div>
      </section>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Fact label={`Ay doğuşu (${location.name})`} value={rise ? timeFmt.format(rise) : "Bugün ay doğmuyor"} />
        <Fact label={`Ay batışı (${location.name})`} value={set ? timeFmt.format(set) : "Bugün ay batmıyor"} />
        <Fact label="Bir sonraki dolunay" value={dateTimeFmt.format(nextFull)} />
        <Fact label="Bir sonraki yeni ay" value={dateTimeFmt.format(nextNew)} />
      </dl>

      <p className="mt-10 text-sm text-zinc-500">
        Son güncelleme: <time dateTime={now.toISOString()}>{dateTimeFmt.format(now)}</time>
      </p>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
    </div>
  );
}
