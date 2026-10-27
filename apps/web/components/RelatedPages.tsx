"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SitePage } from "@/lib/pages";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

/**
 * Sayfanın altındaki "İlgili sayfalar" bölümü. Hangi sayfada olunduğunu adresten bulur;
 * eşleştirmeler sunucuda hazırlanıp `byPath` olarak gelir.
 */
export function RelatedPages({ byPath }: { byPath: Record<string, SitePage[]> }) {
  const pathname = usePathname();
  const related = byPath[pathname];
  if (!related?.length) return null;

  return (
    <section
      aria-labelledby="ilgili"
      className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <h2 id="ilgili" className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          İlgili sayfalar
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {related.map((p) => (
            <li key={p.path}>
              <Link
                href={p.path}
                className="group flex h-full gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="shrink-0 self-start rounded-full bg-[#05070d] p-1">
                  <MoonPhaseIcon phaseAngle={p.cardPhaseAngle} size={44} title="" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold group-hover:underline">{p.title}</span>
                  <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">{p.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
