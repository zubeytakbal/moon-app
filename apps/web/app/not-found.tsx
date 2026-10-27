import type { Metadata } from "next";
import Link from "next/link";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { ALL_PAGES, HOME_PATH } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
};

const SUGGESTED = ALL_PAGES.filter((p) => p.featured).slice(0, 6);

export default function NotFound() {
  return (
    <main className="starfield bg-[#05070d] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center">
        <MoonPhaseIcon phaseAngle={4} size={160} glow title="Yeni ay" />
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Bu sayfa yeni ay gibi: görünmüyor</h1>
        <p className="mt-4 max-w-lg text-lg text-zinc-300">
          Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Belki şunlardan biri işinize yarar:
        </p>
        <ul className="mt-8 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {SUGGESTED.map((p) => (
            <li key={p.path}>
              <Link
                href={p.path}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-white/25 hover:bg-white/10"
              >
                <MoonPhaseIcon phaseAngle={p.cardPhaseAngle} size={36} title="" />
                <span className="font-medium">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={HOME_PATH}
          className="mt-10 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05070d] hover:bg-zinc-200"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
