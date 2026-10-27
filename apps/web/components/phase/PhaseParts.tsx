import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { getUpcomingPrincipalPhases, PHASE_NAMES_TR } from "@moon-app/moon";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { PAGES, type SitePage } from "@/lib/pages";
import { siteConfig } from "@/site.config";

const timeZone = siteConfig.defaultLocation.timeZone;
const DAY_MS = 86_400_000;

type PrincipalKey = "new-moon" | "first-quarter" | "full-moon" | "last-quarter";

/** Evre sayfalarının döngü sırası; önceki/sonraki geçişi bu sırayla yapılır. */
const CYCLE: { page: SitePage; angle: number }[] = [
  { page: PAGES.yeniAy, angle: 0 },
  { page: PAGES.hilal, angle: 40 },
  { page: PAGES.ilkDordun, angle: 90 },
  { page: PAGES.buyuyenSiskinAy, angle: 135 },
  { page: PAGES.dolunay, angle: 180 },
  { page: PAGES.kuculenSiskinAy, angle: 225 },
  { page: PAGES.sonDordun, angle: 270 },
];

function fmt() {
  return {
    date: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", year: "numeric" }),
    weekday: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, weekday: "long" }),
    time: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" }),
    short: new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long" }),
  };
}

function countdown(ms: number): string {
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / 3_600_000);
  if (days === 0) return `${hours} saat`;
  return hours === 0 ? `${days} gün` : `${days} gün ${hours} saat`;
}

/** Evre sayfasının koyu giriş alanı: büyük ay görseli, başlık ve sağdaki canlı bilgi kutusu. */
export function PhaseHero({
  page,
  angle,
  eyebrow,
  lead,
  aside,
}: {
  page: SitePage;
  angle: number;
  eyebrow: string;
  lead: string;
  aside: ReactNode;
}) {
  return (
    <section className="starfield relative overflow-hidden bg-[#05070d] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[22%] top-1/2 w-[min(85vw,640px)] -translate-y-1/2 opacity-90 md:right-[2%]"
      >
        <MoonPhaseIcon phaseAngle={angle} size={760} title="" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070d] via-[#05070d]/80 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-6 md:pb-20">
        <Breadcrumb page={page} tone="dark" />
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">{eyebrow}</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-7xl">{page.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-zinc-200 md:text-xl">{lead}</p>
        <div className="mt-8 max-w-md">{aside}</div>
      </div>
    </section>
  );
}

/** Bir ana evrenin bir sonraki anı ve kalan süre. Saatte bir yenilenir. */
export async function NextPrincipal({ phase }: { phase: PrincipalKey }) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const next = getUpcomingPrincipalPhases(now, 4).find((p) => p.key === phase)!;
  const f = fmt();

  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">
        Bir sonraki {PHASE_NAMES_TR[phase].toLocaleLowerCase("tr-TR")}
      </p>
      <p className="mt-1 text-2xl font-semibold">
        <time dateTime={next.date.toISOString()}>{f.date.format(next.date)}</time>
      </p>
      <p className="mt-0.5 text-zinc-300">
        {f.weekday.format(next.date)}, saat {f.time.format(next.date)} (Türkiye saati)
      </p>
      <p className="mt-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-200">
        {countdown(next.date.getTime() - now.getTime())} sonra
      </p>
    </div>
  );
}

/** İki ana evre arasındaki ara dönem (örn. yeni aydan ilk dördüne kadar: büyüyen hilal). */
export async function NextPeriod({ from, to, label }: { from: PrincipalKey; to: PrincipalKey; label: string }) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const periods = getPeriods(now, from, to, 2);
  const f = fmt();
  const current = periods.find((p) => p.start <= now && now < p.end);
  const next = periods.find((p) => p.start > now)!;
  const shown = current ?? next;

  return (
    <div className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-zinc-400">
        {current ? `Şu an ${label}` : `Bir sonraki ${label}`}
      </p>
      <p className="mt-1 text-2xl font-semibold">
        {f.short.format(shown.start)} – {f.short.format(shown.end)}
      </p>
      <p className="mt-0.5 text-zinc-300">
        {PHASE_NAMES_TR[from]} ile {PHASE_NAMES_TR[to].toLocaleLowerCase("tr-TR")} arası
      </p>
      <p className="mt-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-200">
        {current
          ? `${countdown(shown.end.getTime() - now.getTime())} daha sürecek`
          : `${countdown(shown.start.getTime() - now.getTime())} sonra başlıyor`}
      </p>
    </div>
  );
}

function getPeriods(now: Date, from: PrincipalKey, to: PrincipalKey, count: number) {
  // Şu an bir dönemin içinde olabileceğimiz için aramaya bir döngü öncesinden başlarız.
  const phases = getUpcomingPrincipalPhases(new Date(now.getTime() - 30 * DAY_MS), 4 * (count + 2));
  const periods: { start: Date; end: Date }[] = [];
  for (let i = 0; i < phases.length - 1; i++) {
    if (phases[i].key === from && phases[i + 1].key === to)
      periods.push({ start: phases[i].date, end: phases[i + 1].date });
  }
  return periods.filter((p) => p.end > now).slice(0, count);
}

/** Bir ana evrenin önümüzdeki tarihleri. Saatte bir yenilenir. */
export async function UpcomingPrincipalTable({ phase, count }: { phase: PrincipalKey; count: number }) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const list = getUpcomingPrincipalPhases(now, count * 4 + 4)
    .filter((p) => p.key === phase)
    .slice(0, count);
  const f = fmt();

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left">
        <thead className="bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
          <tr>
            <th className="px-5 py-3 font-medium">Tarih</th>
            <th className="px-5 py-3 font-medium">Gün</th>
            <th className="px-5 py-3 font-medium">Saat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {list.map((p, i) => (
            <tr key={p.date.toISOString()} className={i === 0 ? "bg-indigo-50/60 dark:bg-indigo-950/30" : undefined}>
              <td className="px-5 py-3 font-medium">
                <time dateTime={p.date.toISOString()}>{f.date.format(p.date)}</time>
              </td>
              <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{f.weekday.format(p.date)}</td>
              <td className="px-5 py-3 tabular-nums">{f.time.format(p.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Ara evre dönemlerinin önümüzdeki tarihleri. */
export async function UpcomingPeriodTable({
  from,
  to,
  count,
}: {
  from: PrincipalKey;
  to: PrincipalKey;
  count: number;
}) {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const periods = getPeriods(now, from, to, count);
  const f = fmt();

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left">
        <thead className="bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
          <tr>
            <th className="px-5 py-3 font-medium">Başlangıç ({PHASE_NAMES_TR[from]})</th>
            <th className="px-5 py-3 font-medium">Bitiş ({PHASE_NAMES_TR[to]})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {periods.map((p, i) => (
            <tr key={p.start.toISOString()} className={i === 0 ? "bg-indigo-50/60 dark:bg-indigo-950/30" : undefined}>
              <td className="px-5 py-3">
                <time dateTime={p.start.toISOString()}>{f.short.format(p.start)}</time>{" "}
                <span className="text-zinc-500 tabular-nums">{f.time.format(p.start)}</span>
              </td>
              <td className="px-5 py-3">
                <time dateTime={p.end.toISOString()}>{f.short.format(p.end)}</time>{" "}
                <span className="text-zinc-500 tabular-nums">{f.time.format(p.end)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Önceki ve sonraki evre sayfasına geçiş kartları. */
export function PhaseNav({ current }: { current: SitePage }) {
  const i = CYCLE.findIndex((c) => c.page.path === current.path);
  const prev = CYCLE[(i - 1 + CYCLE.length) % CYCLE.length];
  const next = CYCLE[(i + 1) % CYCLE.length];

  return (
    <nav aria-label="Evreler arasında geçiş" className="mt-14 grid grid-cols-2 gap-3 sm:gap-4">
      {[
        { label: "Önceki evre", item: prev, align: "items-start text-left" },
        { label: "Sonraki evre", item: next, align: "items-end text-right" },
      ].map(({ label, item, align }) => (
        <Link
          key={label}
          href={item.page.path}
          className={`group flex flex-col gap-3 rounded-2xl bg-[#05070d] p-5 text-white transition hover:bg-[#0d111c] ${align}`}
        >
          <MoonPhaseIcon phaseAngle={item.angle} size={56} title="" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-zinc-400">{label}</span>
            <span className="mt-0.5 block text-lg font-semibold">{item.page.title}</span>
          </span>
        </Link>
      ))}
      <Link
        href={PAGES.ayEvreleri.path}
        className="col-span-2 rounded-2xl border border-zinc-200 px-5 py-4 text-center text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        Bütün evreler: {PAGES.ayEvreleri.title} →
      </Link>
    </nav>
  );
}

/** Evre sayfası makalesinin sonu: kaynaklar, güncelleme tarihi ve yapılandırılmış veri. */
export function ArticleFooter({
  page,
  headline,
  updated,
  sources,
}: {
  page: SitePage;
  headline: string;
  updated: string;
  sources: { label: string; href: string }[];
}) {
  const updatedText = new Intl.DateTimeFormat(siteConfig.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${updated}T12:00:00Z`));
  return (
    <>
      <section
        aria-labelledby="kaynaklar"
        className="mt-12 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
      >
        <h2 id="kaynaklar" className="font-semibold text-zinc-900 dark:text-white">
          Kaynaklar
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {sources.map((s) => (
            <li key={s.href}>
              <a href={s.href} rel="noopener" target="_blank" className="underline underline-offset-2">
                {s.label}
              </a>
            </li>
          ))}
          <li>Tarih ve saatler: Astronomy Engine ile Türkiye saatine göre hesaplanmıştır.</li>
          <li>Ay görseli: NASA Scientific Visualization Studio.</li>
        </ul>
        <p className="mt-4">
          Son güncelleme: <time dateTime={updated}>{updatedText}</time>
        </p>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline,
          inLanguage: "tr-TR",
          dateModified: updated,
          mainEntityOfPage: new URL(page.path, siteConfig.url).toString(),
        }}
      />
    </>
  );
}
