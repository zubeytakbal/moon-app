import type { ReactNode } from "react";

/** Sayfanın başındaki "Kısaca" kutusu: sorunun cevabını 2-4 maddede verir. */
export function QuickFacts({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-labelledby="kisaca"
      className="rounded-xl border-l-4 border-amber-400 bg-amber-50 px-5 py-4 dark:border-amber-300 dark:bg-amber-950/30"
    >
      <h2 id="kisaca" className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-200">
        Kısaca
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-800 dark:text-zinc-200">{children}</ul>
    </aside>
  );
}
