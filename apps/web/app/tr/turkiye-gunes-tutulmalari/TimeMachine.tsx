import { cacheLife } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { findProvince, TURKEY_PROVINCES } from "@moon-app/moon";
import { EclipseDisc } from "@/components/EclipseDisc";
import { ShareButton } from "@/components/ShareButton";
import { TURKEY_MAP } from "@/lib/data/turkey-map";
import { PAGES } from "@/lib/pages";
import { durationText, isNotable, TURKEY_ECLIPSES, type LocalView } from "@/lib/turkey-eclipses";
import { siteConfig } from "@/site.config";

const PATH = PAGES.turkiyeTutulmalari.path;
const timeZone = siteConfig.defaultLocation.timeZone;
const LIFESPAN = 90;
/** Varsayılan seçili tutulma: en çok aranan, 11 Ağustos 1999. */
const DEFAULT_ID = "1999-08-11";
const KIND_TR = { total: "Tam", annular: "Halkalı", partial: "Parçalı" } as const;

/**
 * Örtülme yüzdesi. Yalnızca tam tutulma %100'dür: halkalıda Güneş'in kenarı açıkta kalır (örn. %88), şeridin
 * kıyısındaki parçalı tutulmada örtülme %99,9'u geçebilir ama tam değildir.
 */
function percent(v: LocalView) {
  if (v.kind === "total") return "%100";
  const p = v.obscuration * 100;
  return p >= 99.9 ? "%99,9'dan fazla" : `%${new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: p >= 99 ? 1 : 0 }).format(p)}`;
}

/** Adres: il, doğum yılı ve seçili tutulma; varsayılanlar yazılmaz. */
function href(il: string, dy: number | null, t: string) {
  const q = new URLSearchParams();
  if (il !== siteConfig.defaultLocation.slug) q.set("il", il);
  if (dy) q.set("dy", String(dy));
  if (t !== DEFAULT_ID) q.set("t", t);
  const s = q.toString();
  return s ? `${PATH}?${s}` : PATH;
}

export function parseInputs(sp: { il?: string | string[]; dy?: string | string[]; t?: string | string[] }) {
  const city = findProvince(typeof sp.il === "string" ? sp.il : undefined) ?? siteConfig.defaultLocation;
  const year = typeof sp.dy === "string" ? Number(sp.dy) : NaN;
  const birthYear = Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null;
  const id = typeof sp.t === "string" && TURKEY_ECLIPSES.some((e) => e.id === sp.t) ? sp.t : DEFAULT_ID;
  return { slug: city.slug, birthYear, id };
}

/**
 * Tutulma Zaman Makinesi: seçilen ilden hayat boyu görülen ve görülecek önemli güneş tutulmaları, seçili
 * tutulmanın o ilden gerçek oranlı görüntüsü ve 81 ildeki örtülme haritası. Sonuç girdilere ve "şu an"a
 * bağlıdır; saatte bir yenilenir.
 */
export async function TimeMachine({ slug, birthYear, id }: { slug: string; birthYear: number | null; id: string }) {
  "use cache";
  cacheLife("hours");

  const city = findProvince(slug) ?? siteConfig.defaultLocation;
  const index = TURKEY_PROVINCES.findIndex((p) => p.slug === city.slug);
  const now = new Date();
  const thisYear = now.getUTCFullYear();
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  const fromYear = birthYear ?? 1900;
  const toYear = birthYear ? Math.min(2100, birthYear + LIFESPAN) : 2100;
  const list = TURKEY_ECLIPSES.flatMap((e) => {
    const v = e.local[index];
    const year = e.peak.getUTCFullYear();
    return isNotable(v) && year >= fromYear && year <= toYear ? [{ e, v }] : [];
  });
  const selected = TURKEY_ECLIPSES.find((e) => e.id === id) ?? TURKEY_ECLIPSES.find((e) => e.id === DEFAULT_ID)!;
  const sv = selected.local[index];

  const past = list.filter((x) => x.e.peak < now);
  const future = list.filter((x) => x.e.peak >= now);
  const central = (xs: typeof list) => xs.filter((x) => x.v.kind !== "partial");
  const summary = birthYear
    ? `Doğduğunuz ${birthYear} yılından bu yana bu ilden ${past.length} önemli güneş tutulması görüldü` +
      (central(past).length ? `, ${central(past).length} tanesi tam ya da halkalı` : "") +
      `. ${Math.min(2100, birthYear + LIFESPAN)} yılına kadar ${future.length} tane daha var` +
      (central(future).length ? `; ${central(future).length} tanesi tam ya da halkalı.` : `; hiçbiri tam değil.`)
    : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
      <h2 id="zaman-makinesi" className="text-xl font-semibold">
        Tutulma zaman makinesi
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-zinc-400">
        İlinizi ve isterseniz doğum yılınızı seçin: o ilden görülen ve görülecek bütün önemli güneş tutulmaları (örtülmenin
        %40&apos;ı geçtiği ya da tam veya halkalı olduğu tutulmalar), 1900-2100.
      </p>

      <Form action={PATH} scroll={false} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm text-zinc-300 sm:max-w-xs">
          İl
          <select
            name="il"
            defaultValue={city.slug}
            key={city.slug}
            className="rounded-xl border border-white/15 bg-[#0d111c] px-3 py-2.5 text-base text-white"
          >
            {TURKEY_PROVINCES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-40 flex-col gap-1 text-sm text-zinc-300">
          Doğum yılı (isteğe bağlı)
          <input
            type="number"
            name="dy"
            min={1900}
            max={thisYear}
            inputMode="numeric"
            placeholder="örn. 1985"
            defaultValue={birthYear ?? ""}
            key={birthYear ?? "yok"}
            className="rounded-xl border border-white/15 bg-[#0d111c] px-3 py-2.5 text-base text-white [color-scheme:dark]"
          />
        </label>
        <button type="submit" className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-[#1f1405] transition hover:bg-amber-300">
          Göster
        </button>
      </Form>

      {summary && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] p-4 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 text-zinc-100">
            <span className="text-sm text-amber-200/80">İl: {city.name}</span>
            <span className="block">{summary}</span>
          </p>
          <ShareButton title="Hayatımdaki güneş tutulmaları" text={`${city.name}: ${summary}`} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {city.name} · {fromYear}-{toYear}
          </h3>
          {list.length ? (
            <ol className="mt-2 max-h-[34rem] divide-y divide-white/10 overflow-y-auto rounded-2xl border border-white/10">
              {list.map(({ e, v }) => {
                const isSel = e.id === selected.id;
                return (
                  <li key={e.id}>
                    <Link
                      href={href(city.slug, birthYear, e.id)}
                      rel="nofollow"
                      scroll={false}
                      aria-current={isSel ? "true" : undefined}
                      className={`flex items-center gap-3 px-4 py-2.5 transition ${isSel ? "bg-amber-300/10" : "hover:bg-white/5"}`}
                    >
                      <EclipseDisc separation={v.separation} ratio={v.ratio} size={32} />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block font-medium text-white">{date.format(v.peak)}</span>
                        <span className={`block text-xs ${v.kind !== "partial" ? "text-amber-300" : "text-zinc-400"}`}>
                          {KIND_TR[v.kind]} · {percent(v)}
                          {v.centralSeconds > 0 && ` · ${durationText(v.centralSeconds)}`}
                        </span>
                      </span>
                      <span className={`shrink-0 text-xs ${e.peak < now ? "text-zinc-500" : "text-emerald-300"}`}>
                        {e.peak < now ? "geçti" : "gelecek"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">Bu aralıkta bu ilden önemli bir güneş tutulması yok.</p>
          )}
        </div>

        <div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
            <p className="text-sm text-zinc-400">
              {date.format(selected.peak)} · {city.name}
            </p>
            {sv && sv.sunAltitude > 0 ? (
              <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <div className="w-40 shrink-0">
                  <EclipseDisc separation={sv.separation} ratio={sv.ratio} size={160} />
                </div>
                <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="col-span-2">
                    <dt className="text-zinc-400">Bu ilden</dt>
                    <dd className={`text-xl font-semibold ${sv.kind !== "partial" ? "text-amber-300" : ""}`}>
                      {KIND_TR[sv.kind]} tutulma · {percent(sv)}
                    </dd>
                  </div>
                  {sv.centralSeconds > 0 && (
                    <div className="col-span-2">
                      <dt className="text-zinc-400">{sv.kind === "total" ? "Tam tutulma süresi" : "Halkalı evre süresi"}</dt>
                      <dd className="font-medium">{durationText(sv.centralSeconds)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-zinc-400">Başlangıç</dt>
                    <dd className="font-medium tabular-nums">{time.format(sv.begin)}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">En derin an</dt>
                    <dd className="font-medium tabular-nums">{time.format(sv.peak)}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">Bitiş</dt>
                    <dd className="font-medium tabular-nums">{time.format(sv.end)}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">Güneş&apos;in yüksekliği</dt>
                    <dd className="font-medium">{sv.sunAltitude}°</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="mt-3 text-zinc-300">Bu tutulma bu ilden görülmedi ya da Güneş o sırada ufkun altındaydı.</p>
            )}
          </div>

          <TurkeyEclipseMap eclipseIndex={TURKEY_ECLIPSES.indexOf(selected)} selected={index} />
        </div>
      </div>
    </div>
  );
}

/** Seçili tutulmada 81 il merkezindeki örtülme: tam/halkalı görülen iller altın rengi, seçili il halkalı. */
function TurkeyEclipseMap({ eclipseIndex, selected }: { eclipseIndex: number; selected: number }) {
  const e = TURKEY_ECLIPSES[eclipseIndex];
  const fill = (v: LocalView | null) => {
    if (!v || v.sunAltitude <= 0) return "#2a3142";
    if (v.kind !== "partial") return "#fbbf24";
    // %40 → koyu mavi, %99 → açık: örtülme arttıkça aydınlanır.
    const t = Math.max(0, Math.min(1, (v.obscuration - 0.4) / 0.6));
    return `rgb(${Math.round(70 + 150 * t)}, ${Math.round(85 + 125 * t)}, ${Math.round(140 + 80 * t)})`;
  };
  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 ${TURKEY_MAP.width} ${TURKEY_MAP.height}`} role="img" aria-label="İllere göre örtülme haritası" className="h-auto w-full">
        <path d={TURKEY_MAP.path} fill="#141a2b" stroke="#475569" strokeWidth="1" />
        {TURKEY_PROVINCES.map((p, i) => {
          const { x, y } = TURKEY_MAP.project(p.latitude, p.longitude);
          const v = e.local[i];
          return (
            <g key={p.slug}>
              <title>{`${p.name}: ${v && v.sunAltitude > 0 ? `${KIND_TR[v.kind].toLocaleLowerCase("tr-TR")}, ${percent(v)}` : "görülmedi"}`}</title>
              {i === selected && <circle cx={x} cy={y} r="9" fill="none" stroke="#ffffff" strokeWidth="2" />}
              <circle cx={x} cy={y} r="5" fill={fill(v)} />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Tam ya da halkalı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-8 rounded-full" style={{ background: "linear-gradient(to right, rgb(70,85,140), rgb(220,210,220))" }} />{" "}
          Parçalı, %40 → %99
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" /> Seçili il
        </span>
      </figcaption>
    </figure>
  );
}
