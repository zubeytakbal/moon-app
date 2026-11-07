import type { Metadata } from "next";
import Link from "next/link";
import { EnCorporatePage } from "@/components/en/EnCorporatePage";
import { Prose } from "@/components/Prose";
import { EN_PAGES } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.cookiePolicy;

export const metadata: Metadata = {
  title: `Cookie Policy | ${siteConfig.name}`,
  description: "Which cookies Lunatlas uses, who sets them, what they are for, how long they last and how to manage them.",
  alternates: { canonical: PAGE.path },
};

/** Çerez tablosu Türkçe sürümle aynı (aynı hizmetler); çerez adları ve süreleri değişirse ikisi birlikte güncellenir. */
const COOKIES: { group: string; rows: { name: string; owner: string; purpose: string; duration: string }[] }[] = [
  {
    group: "Strictly necessary",
    rows: [
      {
        name: "lunatlas_cerez (cookie choice)",
        owner: siteConfig.name,
        purpose: "Remembers the choice you made in the cookie notice.",
        duration: "Up to 13 months",
      },
      {
        name: "__cf_bm",
        owner: "Cloudflare",
        purpose: "Protects the site against automated attacks and malicious bots. Set only when needed.",
        duration: "30 minutes",
      },
    ],
  },
  {
    group: "Statistics (with your consent)",
    rows: [
      {
        name: "_ga, _ga_*",
        owner: "Google Analytics",
        purpose: "Counts visits and tells a returning browser apart by a random ID.",
        duration: "Up to 2 years",
      },
    ],
  },
  {
    group: "Advertising (with your consent)",
    rows: [
      {
        name: "__gads, __gpi, __eoi",
        owner: "Google AdSense",
        purpose: "Measures ad views and stops the same ad from being shown over and over.",
        duration: "6 to 13 months",
      },
      {
        name: "IDE and similar",
        owner: "Google (doubleclick.net)",
        purpose: "Lets ads be shown based on your interests.",
        duration: "Up to 13 months",
      },
    ],
  },
];

export default function CookiePage() {
  return (
    <EnCorporatePage
      page={PAGE}
      updated="2026-11-07"
      eyebrow="Legal"
      lead="Cookies are small text files saved in your browser when you visit a website. This page explains which ones we use and why."
    >
      <Prose>
        <h2>Why we use cookies</h2>
        <p>
          Our tools (moon phase, sunrise and sunset, full moons, eclipses) don&apos;t need cookies to work. We use cookies for
          three things: keeping the site secure, seeing which pages are read (Google Analytics) and showing ads (Google
          AdSense).
        </p>
        <p>
          Apart from strictly necessary cookies, cookies are used only if you allow them in the cookie notice shown on your
          first visit. If you don&apos;t, the site works exactly the same; ads may still appear, but they won&apos;t be
          personalized.
        </p>
        <h2>Cookies we use</h2>
      </Prose>
      <div className="mt-6 space-y-8">
        {COOKIES.map((g) => (
          <section key={g.group}>
            <h3 className="text-lg font-semibold">{g.group}</h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Cookie</th>
                    <th className="px-4 py-2.5 font-medium">Set by</th>
                    <th className="px-4 py-2.5 font-medium">Purpose</th>
                    <th className="px-4 py-2.5 font-medium">Lasts</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.name} className="border-t border-zinc-200 align-top dark:border-zinc-800">
                      <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
                      <td className="px-4 py-3">{r.owner}</td>
                      <td className="px-4 py-3">{r.purpose}</td>
                      <td className="whitespace-nowrap px-4 py-3">{r.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
      <Prose>
        <p>
          For Google&apos;s current list of cookies and how long they last, see{" "}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener">
            Google&apos;s cookie page
          </a>
          . Google may change cookie names and durations from time to time.
        </p>
        <h2>How to manage cookies</h2>
        <ul>
          <li>
            <strong>Cookie notice:</strong> change your choice at any time with the &quot;Cookie settings&quot; link at the
            bottom of every page.
          </li>
          <li>
            <strong>Browser settings:</strong> delete or block cookies in your browser&apos;s settings.
          </li>
          <li>
            <strong>Personalized ads:</strong> turn them off in{" "}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener">
              My Ad Center
            </a>
            .
          </li>
          <li>
            <strong>Google Analytics:</strong> the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">
              Google Analytics opt-out browser add-on
            </a>{" "}
            stops your visits from being counted.
          </li>
        </ul>
        <h2>More information</h2>
        <p>
          How your personal data is handled is explained in our <Link href={EN_PAGES.privacyPolicy.path}>Privacy Policy</Link>.
          Questions are welcome on our <Link href={EN_PAGES.contact.path}>Contact</Link> page.
        </p>
      </Prose>
    </EnCorporatePage>
  );
}
