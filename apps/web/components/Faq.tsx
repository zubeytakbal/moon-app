import Link from "next/link";
import type { FaqItem } from "@/lib/faqs";
import { JsonLd } from "./JsonLd";

/**
 * Sayfanın sonundaki "Sık sorulan sorular": yalnızca Google'da gerçekten sorulan ve sayfanın gövdesinde
 * cevaplanmamış sorular (bkz. `lib/faqs.ts`). Açılıp kapanan sorular; FAQPage yapılandırılmış verisiyle.
 */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <section aria-labelledby="sss" className="mt-14">
      <h2 id="sss" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Sık sorulan sorular
      </h2>
      <div className="mt-5 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 [&::-webkit-details-marker]:hidden">
              <h3 className="text-base">{item.q}</h3>
              <svg
                viewBox="0 0 12 12"
                width="12"
                height="12"
                aria-hidden="true"
                className="shrink-0 text-zinc-400 transition group-open:rotate-180"
              >
                <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-zinc-700 dark:text-zinc-300">
              {item.a}
              {item.link && (
                <>
                  {" "}
                  <Link href={item.link.href} className="font-medium text-indigo-600 hover:underline dark:text-indigo-300">
                    {item.link.label} →
                  </Link>
                </>
              )}
            </p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </section>
  );
}
