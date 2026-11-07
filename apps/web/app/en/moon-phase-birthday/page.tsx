import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { BreadcrumbTrail } from "@/components/Breadcrumb";
import { Byline } from "@/components/Byline";
import { EnArticleFooter } from "@/components/en/EnArticleFooter";
import { Faq } from "@/components/Faq";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";
import { Prose } from "@/components/Prose";
import { QuickLinks } from "@/components/QuickLinks";
import { enPageSources } from "@/components/Sources";
import { EN_FAQS } from "@/lib/en/faqs";
import { EN_GROUP_NAMES, EN_HOME_PATH, EN_PAGES } from "@/lib/en/pages";
import { enPageOpenGraph } from "@/lib/og";
import { siteConfig } from "@/site.config";
import { BirthdayExplorer } from "./BirthdayExplorer";

const PAGE = EN_PAGES.moonPhaseBirthday;
const UPDATED = "2026-11-07";
const src = enPageSources("nasaMoonFactSheet", "nasaPhaseCatalog", "svsMoonPhaseGallery", "svsMoonPhase2026", "almanacFullMoonNames", "arliss2005", "geonames");

export const metadata: Metadata = {
  title: `Moon Phase on Your Birthday or Any Date: What Did the Moon Look Like? | ${siteConfig.name}`,
  description:
    "See the moon on the day you were born, or on any special date like an anniversary or wedding, as it looked from that place, for any date from 1900 to 2100. Free wallpaper and printable poster, partner comparison and your birth full moon's name.",
  alternates: { canonical: PAGE.path },
  openGraph: enPageOpenGraph(PAGE),
};

export default function BirthdayPage() {
  return (
    <>
      <section className="starfield bg-[#05070d] text-white">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-8 px-4 pb-14 pt-6 md:grid-cols-[1fr_auto] md:pb-16">
          <div>
            <BreadcrumbTrail
              tone="dark"
              label="Breadcrumb"
              items={[{ name: "Home", path: EN_HOME_PATH }, { name: EN_GROUP_NAMES[PAGE.group] }, { name: PAGE.title, path: PAGE.path }]}
            />
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Tool</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">What Did the Moon Look Like on Your Birthday?</h1>
            <p className="mt-5 max-w-2xl text-lg text-zinc-200">
              Pick your birthday and birthplace, or any date that matters to you, like an anniversary or a wedding, to see
              the moon exactly as it looked that night. Save it as a free wallpaper or printable poster, or compare it with
              someone else&apos;s.
            </p>
            <Byline updated={UPDATED} lang="en" />
          </div>
          <div className="hidden md:block">
            <MoonPhaseIcon phaseAngle={135} size={220} glow title="A waxing gibbous moon" />
          </div>
        </div>
      </section>
      <QuickLinks
        lang="en"
        links={[
          { href: "#result", label: "Your birthday moon" },
          { href: "#partner", label: "Partner" },
          { href: "#next-birthdays", label: "Next birthdays" },
          { href: "#metonic", label: "19-year cycle" },
          { href: "#why-different", label: "Why it changes" },
          { href: "#faq", label: "FAQ" },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
        <Explorer />
        <div className="mx-auto max-w-3xl">
          <Explainer />
          <div id="faq" className="scroll-mt-32">
            <Faq items={EN_FAQS.moonPhaseBirthday} lang="en" />
          </div>
          <EnArticleFooter page={PAGE} headline="What Did the Moon Look Like on Your Birthday?" updated={UPDATED} src={src} />
        </div>
      </main>
    </>
  );
}

/** Araç: sunucu (ve Google) bugünün ayını New York için hazır üretir. */
async function Explorer() {
  "use cache";
  cacheLife("hours");
  return <BirthdayExplorer initialNow={new Date().toISOString()} />;
}

function Explainer() {
  return (
    <Prose>
      <h2 id="why-different">Why the moon is different on every birthday</h2>
      <p>
        The moon goes through its phases every 29.53 days on average,{src.ref("nasaMoonFactSheet")} so a year of 365 days
        holds about 12.4 lunar cycles. After one year the moon is roughly 11 days further along its cycle than it was on
        your last birthday: a full moon one year turns into a waning crescent the next. Individual cycles also vary by
        several hours,{src.ref("nasaPhaseCatalog")} which is why the pattern is never perfectly regular.
      </p>
      <p>
        The exception is the 19-year cycle. Nineteen years come to within a couple of hours of 235 lunar cycles, so the
        phases repeat on almost the same calendar dates. Ancient calendar makers used this rhythm, and it means your 19th,
        38th and 57th birthdays bring back nearly the same moon you were born under.
      </p>

      <h2 id="time-zone">Why your birthplace and time matter</h2>
      <p>
        The phase itself is <a href={EN_PAGES.moonPhaseToday.path}>the same everywhere</a> at a given moment, but the date isn&apos;t: if you were born late at night,
        the moon a few hours later might belong to the next calendar day. The moon also looks turned differently depending
        on where you are: in the Northern Hemisphere a growing moon is lit on the right, in the Southern Hemisphere on the
        left. That&apos;s why this tool asks for your birthplace and, if you know it, your time of birth.
      </p>

      <h2 id="nasa">What about NASA&apos;s moon tool?</h2>
      <p>
        NASA&apos;s Dial-A-Moon shows the moon for a time you choose, using NASA&apos;s yearly moon visualizations, which
        cover 2011 to 2026.{src.ref("svsMoonPhaseGallery")} If you were born earlier, this page fills the gap: it works for
        any date from 1900 to 2100. The moon pictures here are NASA&apos;s own renderings of each phase,
        {src.ref("svsMoonPhase2026")} turned to match the sky over your birthplace.
      </p>

      <h2 id="names">Your birth full moon</h2>
      <p>
        Each month&apos;s <a href={EN_PAGES.fullMoon.path}>full moon</a> has a traditional North American name, from the Wolf Moon in January to the Cold Moon in
        December, with the Harvest Moon nearest the September equinox.{src.ref("almanacFullMoonNames")} We show the full
        moon closest to your birthday, before or after it, and its name.
      </p>

      <h2 id="science">Does the moon phase at birth say anything about you?</h2>
      <p>
        There&apos;s no scientific evidence that it does, and we don&apos;t offer personality readings. A common related
        belief, that more babies are born around the full moon, has been tested: a study of 564,039 births in North
        Carolina found no difference across the eight phases of the moon.{src.ref("arliss2005")} The moon on your birthday
        is simply a lovely piece of personal history.
      </p>
    </Prose>
  );
}
