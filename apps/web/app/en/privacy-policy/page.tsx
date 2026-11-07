import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Link from "next/link";
import { EnCorporatePage } from "@/components/en/EnCorporatePage";
import { Prose } from "@/components/Prose";
import { EN_PAGES } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.privacyPolicy;

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description:
    "What information is processed when you use Lunatlas, why, who it is shared with, how long it is kept, and your rights under GDPR and US state privacy laws.",
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};

/** İngilizce gizlilik politikası: Türkçe sürümle aynı hizmetler; KVKK yerine GDPR ve ABD eyalet yasaları anlatılır. */
export default function PrivacyPage() {
  const email = siteConfig.contactEmailEn;
  const name = siteConfig.name;
  return (
    <EnCorporatePage page={PAGE} updated="2026-11-07" eyebrow="Legal" lead="This page explains what information is processed when you use our site, why, and what your rights are.">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 text-[1.0625rem] dark:border-indigo-900 dark:bg-indigo-950/30">
        <p className="font-semibold">In short</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>No accounts: we never ask for your name, phone number or address.</li>
          <li>We use Google Analytics for visit statistics and may use Google AdSense for ads; both use cookies, and analytics only runs if you agree.</li>
          <li>The tools calculate in your browser. If you use &quot;Use my location&quot;, your location stays on your device.</li>
        </ul>
      </div>

      <Prose>
        <h2>Who is responsible</h2>
        <p>
          This site is operated by {name} (&quot;we&quot;). For anything about your personal data, contact us at{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>

        <h2>What information is processed</h2>
        <h3>Technical information</h3>
        <p>
          When you open a page, your browser sends some technical information to the servers of Cloudflare, which hosts
          our site: your IP address, browser and device type, the time of the visit and the address of the page. This is
          needed to deliver the site and protect it against attacks and abuse.
        </p>

        <h3>Visit statistics (Google Analytics)</h3>
        <p>
          To see which pages are read, where visitors come from and which devices they use, we use Google Analytics. It
          uses cookies and identifies your browser by a random ID, not by your name. According to Google, Google
          Analytics 4 does not log or store IP addresses. We use these statistics only to improve the site. Google
          Analytics is loaded only if you accept it in the cookie notice; if you decline, it isn&apos;t loaded at all and
          nothing about your visit is sent to Google.
        </p>

        <h3>Advertising (Google AdSense)</h3>
        <p>Pages may show ads served by Google AdSense. In that case:</p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites.</li>
          <li>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visits
            to this site and/or other sites on the internet.
          </li>
          <li>
            You can opt out of personalized advertising in{" "}
            <a href="https://myadcenter.google.com/" target="_blank" rel="noopener">
              My Ad Center
            </a>
            , and manage other vendors&apos; cookies at{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">
              aboutads.info
            </a>
            .
          </li>
        </ul>
        <p>
          How Google uses this information is described in{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">
            How Google uses information from sites or apps that use its services
          </a>
          .
        </p>

        <h3>What you enter in the tools</h3>
        <p>
          Our tools (moon phase, sunrise and sunset, full moons, eclipses) calculate everything in your browser. When you
          choose a city or a date, it is added to the page address (for example <code>?place=…&amp;date=…</code>) so you
          can bookmark or share the result. We don&apos;t store these choices in a database or link them to you, but a page
          address can appear in the technical logs and visit statistics described above. The list of cities you search is
          downloaded to your browser; your search itself is not sent to us.
        </p>

        <h3>Location</h3>
        <p>
          If you press &quot;Use my location&quot;, your browser asks for permission. If you allow it, your coordinates are
          used only on your device to calculate times for where you are. They are not sent to us or anyone else, and they
          are not stored.
        </p>

        <h3>Email</h3>
        <p>If you email us, we use your address and message only to reply and to look into what you reported.</p>

        <h2>Who it is shared with</h2>
        <p>
          We don&apos;t sell your information. Only the service providers described above process it: Cloudflare (hosting
          and security) and Google (Google Analytics and Google AdSense). Their servers may be outside your country, mainly
          in the United States, so your information may be transferred abroad; these providers use safeguards recognized
          under the GDPR, such as standard contractual clauses. We may disclose information if the law requires it.
        </p>

        <h2>How long it is kept</h2>
        <ul>
          <li>Google Analytics data is kept for at most 14 months, then deleted.</li>
          <li>Technical logs are kept only as long as our hosting provider needs them for security.</li>
          <li>Emails are not kept longer than needed once the matter is resolved.</li>
        </ul>

        <h2>Legal basis (for visitors in the EU, EEA and UK)</h2>
        <ul>
          <li>Technical information: our legitimate interest in running a secure website.</li>
          <li>Google Analytics and personalized ads: your consent, which you can withdraw at any time.</li>
          <li>Emails: our legitimate interest in answering you.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          Under the GDPR you have the right to access the personal data we hold about you, to have it corrected or deleted,
          to restrict or object to its processing, to data portability, and to withdraw your consent at any time. You can
          also complain to your local data protection authority.
        </p>
        <p>
          If you live in a US state with a consumer privacy law, such as California, you have the right to know what
          personal information is collected, to ask for it to be deleted or corrected, and to opt out of targeted
          advertising. We don&apos;t sell personal information. You can turn off personalized ads at any time in{" "}
          <a href="https://myadcenter.google.com/" target="_blank" rel="noopener">
            My Ad Center
          </a>
          .
        </p>
        <p>
          To use any of these rights, email <a href={`mailto:${email}`}>{email}</a>. We reply within 30 days.
        </p>

        <h2>Children</h2>
        <p>Our site is meant for a general audience and doesn&apos;t knowingly collect personal information from children under 13.</p>

        <h2>Cookies</h2>
        <p>
          Which cookies are used and how to manage them is explained in detail in our{" "}
          <Link href={EN_PAGES.cookiePolicy.path}>Cookie Policy</Link>.
        </p>

        <h2>Changes</h2>
        <p>
          We update this policy when we start using a new service or when the law changes. The current version is always on
          this page, with its date below.
        </p>
      </Prose>
    </EnCorporatePage>
  );
}
