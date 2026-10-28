import { cacheLife } from "next/cache";
import {
  DAYTIME_MOON,
  findProvince,
  getDaytimeMoon,
  getMoonPhase,
  localDateParts,
  TURKEY_PROVINCES,
  zonedTimeToUtc,
} from "@moon-app/moon";
import { CitySelect } from "@/components/CitySelect";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { siteConfig } from "@/site.config";

const DAYS = 7;
const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
/** Pusula yönleri, bulunma ekiyle (kuzeyde, güneydoğuda...). */
const DIRECTIONS = ["kuzeyde", "kuzeydoğuda", "doğuda", "güneydoğuda", "güneyde", "güneybatıda", "batıda", "kuzeybatıda"];

const direction = (azimuth: number) => DIRECTIONS[Math.round(azimuth / 45) % 8];

/**
 * "Gündüz ayı nerede?": seçilen ilde bugün ve önümüzdeki günlerde ayın gündüz gökyüzünde görülebildiği
 * saatler, en iyi an, yön ve yükseklik. Dördün sayfalarının girişinin altında kullanılır.
 */
export function DaytimeMoonFinder({ slug, action }: { slug: string; action: string }) {
  return (
    <section className="bg-[#05070d] text-white" aria-labelledby="gunduz-ay">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="gunduz-ay" className="text-xl font-semibold">
                Gündüz ayı nerede?
              </h2>
              <p className="mt-1 max-w-xl text-sm text-zinc-400">
                Ayın gündüz gökyüzünde görülebildiği saatler, bakmanız gereken yön ve yükseklik.
              </p>
            </div>
            <div className="rounded-xl bg-white p-1 text-zinc-900">
              <CitySelect action={action} options={CITY_OPTIONS} selected={slug} />
            </div>
          </div>
          <DaytimeMoonDays slug={slug} />
        </div>
      </div>
    </section>
  );
}

/** Bugün ve önümüzdeki 6 gün. Saatte bir yenilenir. */
async function DaytimeMoonDays({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const timeZone = city.timeZone;
  const today = localDateParts(new Date(), timeZone);
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const dayLabel = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "short", weekday: "short" });
  const longDay = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });

  const days = Array.from({ length: DAYS }, (_, i) => {
    const noon = zonedTimeToUtc(today.year, today.month, today.day + i, 12, timeZone);
    return { noon, phase: getMoonPhase(noon, timeZone), moon: getDaytimeMoon(noon, city) };
  });
  const [first, ...rest] = days;
  const ranges = (w: { start: Date; end: Date }[]) => w.map((r) => `${time.format(r.start)} – ${time.format(r.end)}`);
  const reason = (illumination: number) =>
    illumination < DAYTIME_MOON.minIllumination ? "ay Güneş'e çok yakın, ince ve soluk" : "ay gündüz ufkun üzerine yeterince çıkmıyor";

  return (
    <>
      <div className="mt-6 flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
        <MoonPhaseIcon phaseAngle={first.phase.phaseAngle} size={48} title={first.phase.name} />
        <div className="min-w-0">
          <p className="text-sm text-zinc-400">
            Bugün ({longDay.format(first.noon)}) · {city.name}
          </p>
          {first.moon.best ? (
            <>
              <p className="mt-1 text-2xl font-bold text-emerald-300">
                ✓ Evet: {ranges(first.moon.windows).join(", ")}
              </p>
              <p className="mt-1 text-zinc-200">
                Saat {time.format(first.moon.best.date)}: ay {direction(first.moon.best.azimuth)}, ufkun{" "}
                {Math.round(first.moon.best.altitude)}° üzerinde, %{Math.round(first.moon.best.illumination * 100)}{" "}
                aydınlık.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-zinc-300">Bugün gündüz görülmez</p>
              <p className="mt-1 text-zinc-400">
                Bugün {reason(first.phase.illumination)}.
              </p>
            </>
          )}
        </div>
      </div>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">Önümüzdeki günler</h3>
      <ol className="mt-2 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
        {rest.map(({ noon, phase, moon }) => (
          <li key={noon.toISOString()} className="flex items-center gap-3 px-4 py-3">
            <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={28} title={phase.name} />
            <span className="w-20 shrink-0 text-sm sm:w-28">{dayLabel.format(noon)}</span>
            {moon.best ? (
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-medium tabular-nums text-white">{ranges(moon.windows).join(", ")}</span>
                <span className="block text-xs text-zinc-400 sm:ml-2 sm:inline">
                  saat {time.format(moon.best.date)}: {direction(moon.best.azimuth)}, {Math.round(moon.best.altitude)}°
                </span>
              </span>
            ) : (
              <span className="min-w-0 flex-1 text-sm text-zinc-500">Gündüz görülmez</span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-zinc-500">
        Ay ufkun en az {DAYTIME_MOON.minAltitude}° üzerinde, Güneş&apos;ten en az {DAYTIME_MOON.minElongation}° uzakta ve
        en az %{DAYTIME_MOON.minIllumination * 100} aydınlıkken &quot;görülebilir&quot; sayılır. Açık bir gökyüzü
        gerekir; Güneş&apos;e asla doğrudan bakmayın.
      </p>
    </>
  );
}

/** Adres parametresinden il. */
export function daytimeCity(il: string | string[] | undefined) {
  return findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
}
