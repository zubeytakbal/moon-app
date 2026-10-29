import { cacheLife } from "next/cache";
import { findProvince, getFullMoonRise, getUpcomingPrincipalPhases, TURKEY_PROVINCES } from "@moon-app/moon";
import { AddToCalendar } from "@/components/AddToCalendar";
import { CitySelect } from "@/components/CitySelect";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { icsTime } from "@/lib/ics";
import { PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const CITY_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));
/** Pusula yönleri, bulunma ekiyle. */
const DIRECTIONS = ["kuzeyde", "kuzeydoğuda", "doğuda", "güneydoğuda", "güneyde", "güneybatıda", "batıda", "kuzeybatıda"];
/** Ay gün batımına bu kadar yakın doğarsa gökyüzü alacakaranlıktır: manzarayla birlikte fotoğraf için en güzel an. */
const GOLDEN_MINUTES = 45;

const direction = (azimuth: number) => DIRECTIONS[Math.round(azimuth / 45) % 8];

/** Ayın doğacağı yönü gösteren küçük pusula. */
function Compass({ azimuth }: { azimuth: number }) {
  const rad = ((azimuth - 90) * Math.PI) / 180;
  const x = 60 + 44 * Math.cos(rad);
  const y = 60 + 44 * Math.sin(rad);
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={`Ay ${Math.round(azimuth)}° yönünde doğar`}>
      <circle cx="60" cy="60" r="52" fill="#0d111c" stroke="rgba(255,255,255,0.15)" />
      {["K", "D", "G", "B"].map((l, i) => {
        const a = ((i * 90 - 90) * Math.PI) / 180;
        return (
          <text
            key={l}
            x={60 + 40 * Math.cos(a)}
            y={60 + 40 * Math.sin(a) + 4}
            textAnchor="middle"
            fontSize="11"
            fill={l === "K" ? "#fca5a5" : "#a1a1aa"}
          >
            {l}
          </text>
        );
      })}
      <line x1="60" y1="60" x2={x} y2={y} stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={x} cy={y} r="7" fill="#f4f4f5" />
      <circle cx="60" cy="60" r="3" fill="#a5b4fc" />
    </svg>
  );
}

/** Dolunay doğuşunu nereden izlerim? Başlık, il seçici ve önümüzdeki üç dolunayın doğuşu. */
export function FullMoonRiseFinder({ slug }: { slug: string }) {
  return (
    <section className="bg-[#05070d] text-white" aria-labelledby="dolunay-dogusu">
      <div className="mx-auto w-full max-w-5xl px-4 pb-14 pt-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="dolunay-dogusu" className="text-xl font-semibold">
                Dolunay doğuşunu nereden izlerim?
              </h2>
              <p className="mt-1 max-w-xl text-sm text-zinc-400">
                Dolunayın doğacağı saat, ufukta hangi yöne bakmanız gerektiği ve o akşamın gün batımı.
              </p>
            </div>
            <div className="rounded-xl bg-white p-1 text-zinc-900">
              <CitySelect action={PAGES.dolunay.path} options={CITY_OPTIONS} selected={slug} />
            </div>
          </div>
          <FullMoonRises slug={slug} />
        </div>
      </div>
    </section>
  );
}

/** Önümüzdeki üç dolunayın seçilen ildeki doğuşu. Saatte bir yenilenir. */
async function FullMoonRises({ slug }: { slug: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const timeZone = city.timeZone;
  const now = new Date();
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });
  const fullMoons = getUpcomingPrincipalPhases(now, 16)
    .filter((p) => p.key === "full-moon")
    .slice(0, 3)
    .map((p) => ({ full: p.date, ...getFullMoonRise(p.date, city) }));
  const [first, ...rest] = fullMoons;

  const sunsetNote = (rise: Date, sunset: Date | null) => {
    if (!sunset) return null;
    const minutes = Math.round((rise.getTime() - sunset.getTime()) / 60_000);
    const text =
      minutes === 0
        ? "gün batımıyla aynı anda"
        : `gün batımından ${Math.abs(minutes)} dakika ${minutes > 0 ? "sonra" : "önce"}`;
    return { text, golden: Math.abs(minutes) <= GOLDEN_MINUTES };
  };
  const firstNote = sunsetNote(first.rise, first.sunset);

  return (
    <>
      <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-4">
          <Compass azimuth={first.azimuth} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-400">
            Sıradaki dolunay · {city.name}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {day.format(first.rise)}, {time.format(first.rise)}
          </p>
          <p className="mt-1 text-zinc-200">
            Ay {direction(first.azimuth)} ({Math.round(first.azimuth)}°) doğar.
            {first.sunset && <> Gün batımı {time.format(first.sunset)}.</>}
          </p>
          {firstNote && (
            <p className="mt-2 text-sm">
              <span className="text-zinc-300">Ay {firstNote.text} doğuyor.</span>
              {firstNote.golden && (
                <span className="ml-2 rounded-full bg-amber-300/15 px-2 py-0.5 text-amber-200">
                  Fotoğraf için ideal: gökyüzü henüz aydınlık
                </span>
              )}
            </p>
          )}
          <div className="mt-4">
            <AddToCalendar
              fileName={`dolunay-dogusu-${first.rise.toISOString().slice(0, 10)}.ics`}
              event={{
                uid: `dolunay-dogusu-${first.rise.toISOString().slice(0, 10)}-${city.slug}`,
                summary: "Dolunay doğuşu",
                description: `Ay ${direction(first.azimuth)} (${Math.round(first.azimuth)}°) doğar (${city.name}). Doğu ufku açık, yüksek bir yer seçin.`,
                url: new URL(PAGES.dolunay.path, siteConfig.url).toString(),
                start: icsTime(new Date(first.rise.getTime() - 10 * 60_000)),
                end: icsTime(new Date(first.rise.getTime() + 50 * 60_000)),
              }}
            />
          </div>
        </div>
      </div>

      <ol className="mt-3 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
        {rest.map((m) => {
          const note = sunsetNote(m.rise, m.sunset);
          return (
            <li key={m.full.toISOString()} className="flex items-center gap-3 px-4 py-3">
              <MoonPhaseIcon phaseAngle={180} size={28} title="" />
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-medium text-white">
                  {day.format(m.rise)}, {time.format(m.rise)}
                </span>
                <span className="block text-xs text-zinc-400">
                  {direction(m.azimuth)} ({Math.round(m.azimuth)}°){note && ` · ${note.text}`}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-zinc-500">
        Doğuş saati, ayın üst kenarının düz bir ufukta görünmeye başladığı andır. Önünüzde dağ ya da bina varsa ay
        birkaç dakika geç görünür.
      </p>
    </>
  );
}

/** Adres parametresinden il. */
export function fullMoonCity(il: string | string[] | undefined) {
  return findProvince(typeof il === "string" ? il : undefined) ?? siteConfig.defaultLocation;
}
