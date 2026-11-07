import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Link from "next/link";
import { EnCorporatePage } from "@/components/en/EnCorporatePage";
import { JsonLd } from "@/components/JsonLd";
import { EN_PAGES } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.author;
const { name, initials } = siteConfig.author;
const ROLE = "Founder and editor";

export const metadata: Metadata = {
  title: `${name}, Founder and Editor of Lunatlas | ${siteConfig.name}`,
  description: `${name} writes and builds Lunatlas, an independent guide to the moon and the sky. Background, why the site exists and how to get in touch.`,
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};

/**
 * Yazar sayfası (Türkçe /tr/yazar ile aynı bilgiler, İngilizce okura göre yazıldı). Fotoğraf yok. Alıntı kullanıcının
 * Türkçe sayfada onayladığı sözlerin İngilizcesidir; metin değişikliği kullanıcı onayıyla yapılır.
 */
export default function AuthorPage() {
  const email = siteConfig.contactEmailEn;
  return (
    <EnCorporatePage page={PAGE} updated="2026-11-07" lead={`${name} is the founder and editor of ${siteConfig.name}.`}>
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-indigo-700 text-xl font-semibold text-white">
          {initials}
        </span>
        <p>
          <strong className="block text-xl text-zinc-950 dark:text-white">{name}</strong>
          <span className="text-zinc-500">{ROLE}</span>
        </p>
      </div>

      <div className="mt-8 space-y-4 text-[1.0625rem] leading-relaxed text-zinc-800 dark:text-zinc-200 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-zinc-950 dark:[&_h2]:text-white">
        <h2>Background</h2>
        <p>
          {name} graduated in Chemical Engineering from Beykent University in Istanbul. An engineer&apos;s habit of careful
          measurement and calculation carries over into this work: building sites that give accurate, clearly sourced
          answers to questions that need a calculation.
        </p>

        <h2>Why {siteConfig.name}?</h2>
        <p>
          Questions like &quot;what phase is the moon tonight?&quot; or &quot;will I see the next eclipse from here?&quot;
          deserve a direct answer for the place you live. Yet much of what&apos;s online gives one time for the whole world,
          rarely says how it was worked out, and seldom names its sources. Every time and date on {siteConfig.name} is
          calculated for the location you choose and checked against data from NASA and the U.S. Naval Observatory. How we
          calculate is explained on the <Link href={EN_PAGES.methodology.path}>Methodology and Accuracy</Link> page, and
          where each fact comes from on the <Link href={EN_PAGES.sources.path}>Sources</Link> page.
        </p>
        <blockquote className="border-l-4 border-indigo-300 pl-4 italic">
          <p>
            &quot;The answer to a question like &apos;what is the moon doing tonight?&apos; should be simple. I&apos;m
            building {siteConfig.name} to give that answer at a glance, accurately and with its source. If you find a
            mistake, please write to me; I see correcting it as a responsibility.&quot;
          </p>
          <p className="not-italic">
            <strong>{name}</strong>, {ROLE.toLowerCase()}
          </p>
        </blockquote>

        <h2>Other work</h2>
        <ul className="list-disc pl-6">
          <li>
            <a href="https://feriatlas.com" rel="noopener">
              Feriatlas
            </a>
            : a Turkish-language guide to public holidays in Turkey and planning time off.
          </li>
        </ul>
        <p>
          Corrections and questions: <a href={`mailto:${email}`}>{email}</a>.
        </p>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: new URL(PAGE.path, siteConfig.url).toString(),
          mainEntity: {
            "@type": "Person",
            name,
            jobTitle: ROLE,
            alumniOf: { "@type": "CollegeOrUniversity", name: "Beykent University" },
            worksFor: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          },
        }}
      />
    </EnCorporatePage>
  );
}
