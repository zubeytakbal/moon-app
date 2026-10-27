import type { ReactNode } from "react";

/** Uzun metinler için okunaklı yazı düzeni (başlıklar, paragraflar, listeler, tablolar). */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div
      className={[
        "text-[1.0625rem] leading-relaxed text-zinc-800 dark:text-zinc-200",
        "[&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-zinc-950 dark:[&_h2]:text-white",
        "[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-950 dark:[&_h3]:text-white",
        "[&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        "[&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold",
        "[&_table]:mt-4 [&_table]:w-full [&_table]:text-left [&_table]:text-base",
        "[&_th]:border-b [&_th]:border-zinc-300 [&_th]:py-2 [&_th]:pr-4 [&_th]:font-semibold dark:[&_th]:border-zinc-700",
        "[&_td]:border-b [&_td]:border-zinc-200 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top dark:[&_td]:border-zinc-800",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
