import type { Metadata } from "next";
import { enPageOpenGraph } from "@/lib/og";
import Link from "next/link";
import { EnCorporatePage } from "@/components/en/EnCorporatePage";
import { Prose } from "@/components/Prose";
import { EN_PAGES } from "@/lib/en/pages";
import { siteConfig } from "@/site.config";

const PAGE = EN_PAGES.about;

export const metadata: Metadata = {
  title: `About Lunatlas: Who We Are and How We Work | ${siteConfig.name}`,
  description:
    "Lunatlas is an independent guide to the moon and the sky. Who makes it, how every time and date is calculated and checked against NASA and the U.S. Naval Observatory, and how we treat tradition.",
  alternates: { canonical: PAGE.path },
    openGraph: enPageOpenGraph(PAGE),
};

export default function AboutPage() {
  return (
    <EnCorporatePage
      page={PAGE}
      updated="2026-11-07"
      lead={`${siteConfig.name} is an independent guide to the moon and the sky above you: what it's doing tonight, when the next full moon or eclipse is, and what it all means, worked out for wherever you are.`}
    >
      <Prose>
        <h2>What we do</h2>
        <p>
          Most moon and sky information online gives a single time for the whole world, or for one country. We calculate
          everything for the place you choose: tonight&apos;s moon phase and how it looks from your city, moonrise and
          moonset with their direction, sunrise, sunset and when it gets dark, full moons, and solar and lunar eclipses with
          the local time of every stage. You can pick any of about 46,000 towns and cities, or let the page use your
          device&apos;s time zone or location.
        </p>
        <p>
          A number on its own is only half an answer, so every tool comes with a plain-language explanation of what it
          shows and why: why the moon rises later each day, why a blood moon is red, why your city may wait decades for a
          total solar eclipse.
        </p>

        <h2>How our content is made</h2>
        <ul>
          <li>
            <strong>Calculated, not copied.</strong> The positions of the sun and moon come from an open-source astronomy
            library, worked out for the exact coordinates of each place. We don&apos;t copy dates or times from other sites.
          </li>
          <li>
            <strong>Checked against official data.</strong> We compare our results with NASA&apos;s eclipse catalogs and the
            U.S. Naval Observatory&apos;s tables. The comparisons are published on our{" "}
            <Link href={EN_PAGES.methodology.path}>Methodology and Accuracy</Link> page.
          </li>
          <li>
            <strong>Sourced.</strong> Facts that don&apos;t come from our own calculations are linked to official or primary
            sources, numbered at the end of each page and collected on the <Link href={EN_PAGES.sources.path}>Sources</Link>{" "}
            page. We open and read every source before citing it.
          </li>
          <li>
            <strong>Kept current.</strong> &quot;Today&quot; pages update themselves, and pages about a particular year move
            on to the next one each autumn.
          </li>
        </ul>

        <h2>Science and tradition</h2>
        <p>
          Most of the site is astronomy. Where the moon matters to a tradition, such as the Hindu tithi, Purnima and Amavasya
          or the Islamic Hijri calendar and new crescent, we give the astronomical facts and leave the rules of the
          tradition to its own authorities: your panchang, temple, mosque or moon sighting committee. We don&apos;t publish
          horoscopes.
        </p>

        <h2>Who we are</h2>
        <p>
          {siteConfig.name} is written and built by {siteConfig.author.name} (<Link href={EN_PAGES.author.path}>about the author</Link>
          ). We are not affiliated with any company, government body or space agency; NASA and the U.S. Naval Observatory
          are sources of information for us, nothing more.
        </p>
        <p>
          Pages may show advertising to cover the cost of running the site. Advertising has no influence on the content: no
          date, time or explanation is written to suit an advertiser.
        </p>

        <h2>Get in touch</h2>
        <p>
          If you spot a mistake or have a suggestion, please <Link href={EN_PAGES.contact.path}>contact us</Link>. We take
          corrections seriously and fix every confirmed error.
        </p>
      </Prose>
    </EnCorporatePage>
  );
}
