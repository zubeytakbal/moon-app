import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Link from "next/link";
import { EnCorporatePage } from "@/components/en/EnCorporatePage";
import { Prose } from "@/components/Prose";
import { EN_PAGES } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.contact;

export const metadata: Metadata = {
  title: `Contact Lunatlas | ${siteConfig.name}`,
  description: "Found a mistake, have a question or a suggestion? How to reach the Lunatlas team by email.",
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};

export default function ContactPage() {
  const email = siteConfig.contactEmailEn;
  return (
    <EnCorporatePage page={PAGE} updated="2026-11-07" lead="Corrections, questions and suggestions are all welcome. The quickest way to reach us is by email.">
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-3 rounded-2xl bg-[#05070d] px-6 py-4 text-lg font-semibold text-white hover:bg-[#121729]"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
        {email}
      </a>
      <Prose>
        <h2>Reporting a mistake</h2>
        <p>
          If a time or date looks wrong, it helps to include the page address, the city you selected and the value you
          expected (and where it came from, if you can). We check every report against our calculations and official data,
          and correct the page if we&apos;re wrong. Our comparisons with official sources are on the{" "}
          <Link href={EN_PAGES.methodology.path}>Methodology and Accuracy</Link> page.
        </p>

        <h2>What we can&apos;t help with</h2>
        <p>
          We can&apos;t give the official start of Ramadan or Eid in your country, panchang rulings, or horoscope
          readings; for those, please ask your local religious authority or community. We also don&apos;t accept paid
          articles or links.
        </p>

        <h2>Response time</h2>
        <p>
          We usually reply within a few days. Your email address is used only to answer you; see our{" "}
          <Link href={EN_PAGES.privacyPolicy.path}>Privacy Policy</Link>.
        </p>
      </Prose>
    </EnCorporatePage>
  );
}
