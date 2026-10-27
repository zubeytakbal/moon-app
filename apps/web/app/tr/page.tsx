import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";
import { getLunation, getMoonPhase, type PhaseKey } from "@moon-app/moon";
import { JsonLd } from "@/components/JsonLd";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ALL_PAGES, HOME_PATH, PAGES } from "@/lib/pages";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: `${siteConfig.name}: Ay Evreleri, Ay Takvimi ve Doğuş-Batış Saatleri`,
  description:
    "Ayın bugünkü evresi, bu ayın dolunay ve yeni ay tarihleri, 81 il için ay doğuş-batış saatleri ve ay evrelerinin anlatımı. Hesaplar Türkiye saatine göre.",
  alternates: { canonical: HOME_PATH },
};

const PHASE_ANGLE: Record<PhaseKey, number> = {
  "new-moon": 0,
  "waxing-crescent": 45,
  "first-quarter": 90,
  "waxing-gibbous": 135,
  "full-moon": 180,
  "waning-gibbous": 225,
  "last-quarter": 270,
  "waning-crescent": 315,
};

const timeZone = siteConfig.defaultLocation.timeZone;

export default function HomePage() {
  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-5xl px-4">
        <LunationTimeline />
        <Explore />
        <About />
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: new URL(HOME_PATH, siteConfig.url).toString(),
          inLanguage: "tr-TR",
        }}
      />
    </>
  );
}

/** Giriş: bu geceki ay. Saatte bir yenilenir. */
async function Hero() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const phase = getMoonPhase(now, timeZone);
  const illumination = Math.round(phase.illumination * 100);
  const date = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "long", weekday: "long" });

  return (
    <section className="starfield relative flex min-h-[640px] flex-col justify-end overflow-hidden bg-[#05070d] text-white md:min-h-[min(88vh,860px)]">
      {/* Dev ay: yalnızca üst yayı görünür, evre gölgesi o anki evreye göre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[34%] w-[max(900px,125vw)] -translate-x-1/2 md:top-[24%] md:w-[min(125vw,1900px)]"
      >
        <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={1600} title="" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#05070d] via-[#05070d]/70 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 md:pb-20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Ay rehberi</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl md:text-[5.25rem]">
          Gökyüzündeki ay, bugün ve her gün
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-200 md:text-xl">
          Ayın evresi, doğuş ve batış saatleri, dolunay tarihleri. Hepsi Türkiye saatine göre, astronomik hesaplarla.
        </p>

        <Link
          href={PAGES.bugunAy.path}
          className="group mt-8 flex max-w-md items-center gap-4 rounded-2xl border border-white/15 bg-black/40 p-4 backdrop-blur-sm transition hover:border-white/30 hover:bg-black/55"
        >
          <span className="shrink-0">
            <MoonPhaseIcon phaseAngle={phase.phaseAngle} size={56} title={phase.name} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs uppercase tracking-wider text-zinc-400">
              Bu gece · <time dateTime={now.toISOString()}>{date.format(now)}</time>
            </span>
            <span className="mt-0.5 block text-lg font-semibold">
              {phase.name} <span className="font-light text-zinc-300">· %{illumination}</span>
            </span>
            <span className="text-sm text-indigo-300">Bugünün ayrıntıları</span>
          </span>
          <span
            aria-hidden="true"
            className="text-xl text-zinc-400 transition group-hover:translate-x-1 group-hover:text-white"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

/** Bu ayın döngüsü: yeni aydan bir sonraki yeni aya, bugünün yeri işaretli. */
async function LunationTimeline() {
  "use cache";
  cacheLife("hours");

  const now = new Date();
  const { start, end, phases } = getLunation(now);
  const progress = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  const points = [{ key: "new-moon" as PhaseKey, name: "Yeni Ay", date: start }, ...phases];
  const day = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, day: "numeric", month: "short" });
  const time = new Intl.DateTimeFormat(siteConfig.locale, { timeZone, hour: "2-digit", minute: "2-digit" });

  return (
    <section aria-labelledby="dongu" className="py-14 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Bu ayın döngüsü</p>
      <h2 id="dongu" className="mt-1 text-3xl font-semibold tracking-tight">
        Yeni aydan yeni aya
      </h2>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Ay, {day.format(start)} yeni ayından bu yana döngünün yüzde {Math.round(progress * 100)} kadarını tamamladı. Ana
        evrelerin tarihleri Türkiye saatiyle:
      </p>

      <div className="mt-10">
        <div className="relative h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-500 shadow"
            style={{ left: `${progress * 100}%` }}
          >
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-indigo-500 px-2 py-0.5 text-xs font-semibold text-white">
              Bugün
            </span>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-5 gap-1 sm:gap-4">
          {points.map((p) => {
            const past = p.date.getTime() < now.getTime();
            return (
              <li key={p.date.toISOString()} className="flex flex-col items-center text-center">
                <span className="rounded-full bg-[#05070d] p-1 sm:p-1.5">
                  <MoonPhaseIcon phaseAngle={PHASE_ANGLE[p.key]} size={52} title={p.name} />
                </span>
                <span className={`mt-2 text-xs font-semibold leading-tight sm:text-sm ${past ? "text-zinc-400" : ""}`}>
                  {p.name}
                </span>
                <time dateTime={p.date.toISOString()} className="text-xs text-zinc-500 sm:text-sm">
                  {day.format(p.date)}
                  <span className="hidden sm:inline"> · {time.format(p.date)}</span>
                </time>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Explore() {
  return (
    <section aria-labelledby="kesfet" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Keşfet</p>
      <h2 id="kesfet" className="mt-1 text-3xl font-semibold tracking-tight">
        Ay hakkında
      </h2>
      <ul className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 ${ALL_PAGES.length > 2 ? "lg:grid-cols-3" : ""}`}>
        {ALL_PAGES.map((page) => (
          <li key={page.path}>
            <Link
              href={page.path}
              className="group block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="starfield flex h-40 items-center justify-center bg-[#05070d]">
                <MoonPhaseIcon phaseAngle={page.cardPhaseAngle} size={110} glow title="" />
              </div>
              <div className="p-5">
                <p className="text-lg font-semibold">{page.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{page.description}</p>
                <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-300">
                  Sayfaya git{" "}
                  <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function About() {
  return (
    <section aria-labelledby="hakkinda" className="border-t border-zinc-200 py-14 dark:border-zinc-800 sm:py-20">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">Nasıl hesaplıyoruz?</p>
          <h2 id="hakkinda" className="mt-1 text-2xl font-semibold tracking-tight">
            Tahmin değil, hesap
          </h2>
        </div>
        <div className="grid gap-6 text-zinc-700 dark:text-zinc-300 sm:grid-cols-3 md:col-span-2">
          <Fact title="Astronomik model">
            Ayın ve Güneş&apos;in konumu yüksek hassasiyetli modellerle hesaplanır, NASA tablolarıyla karşılaştırılır.
          </Fact>
          <Fact title="Türkiye saati">Bütün tarih ve saatler Türkiye saatiyle (UTC+3) verilir.</Fact>
          <Fact title="81 il">Doğuş ve batış saatleri her il merkezi için ayrı ayrı hesaplanır.</Fact>
        </div>
      </div>
    </section>
  );
}

function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-zinc-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
