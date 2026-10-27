import type { ReactNode } from "react";

/** Sayfanın başındaki "Kısaca" kutusu: sorunun cevabını 2-4 maddede verir. */
export function QuickFacts({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-labelledby="kisaca"
      className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 id="kisaca" className="text-sm font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
        Kısaca
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-zinc-800 marker:text-indigo-400 dark:text-zinc-200">
        {children}
      </ul>
    </aside>
  );
}
