import { cacheLife } from "next/cache";
import Link from "next/link";
import { GROUP_NAMES, HOME_PATH, PAGES, type PageGroup, type SitePage } from "@/lib/pages";
import { siteConfig } from "@/site.config";
import { Emblem } from "./Emblem";

/**
 * Alt bilgide her bölümün yalnız en önemli sayfaları. Bütün sayfalar üst menüde ve ana sayfanın
 * "Bütün sayfalar" bölümünde zaten var; burada tekrar listelenmez.
 */
const FOOTER_SECTIONS: { group: PageGroup; pages: SitePage[] }[] = [
  { group: "evreler", pages: [PAGES.ayEvreleri, PAGES.dolunay, PAGES.yeniAy, PAGES.hilal, PAGES.dogdugumGun] },
  { group: "takvim", pages: [PAGES.bugunAy, PAGES.ayTakvimi, PAGES.dolunayTarihleri, PAGES.superAy] },
  { group: "tutulmalar", pages: [PAGES.ayTutulmalari, PAGES.kanliAy, PAGES.gunesTutulmasi] },
  { group: "hicri", pages: [PAGES.hicriTakvim, PAGES.hilalGozlemi, PAGES.eyyamiBiyz] },
  { group: "gelenek-burclar", pages: [PAGES.ayHangiBurcta, PAGES.ayBurcu, PAGES.sacKesim, PAGES.aybosluk] },
];

/** Her sayfanın en altında, hep aynı yerde duran kurumsal bağlantılar. */
const CORPORATE = [PAGES.hakkimizda, PAGES.iletisim, PAGES.gizlilik, PAGES.cerez, PAGES.yontem];

/** Üç katlı alt bilgi: marka ve seçili sayfalar, görsel künyesi, telif ve kurumsal bağlantılar. */
export async function SiteFooter() {
  "use cache";
  cacheLife("days");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-[#05070d] text-zinc-300">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-10 pt-14 lg:grid-cols-[1fr_2.6fr] lg:gap-14">
        <div>
          <Link href={HOME_PATH} className="inline-flex items-center gap-3" aria-label={`${siteConfig.name} ana sayfa`}>
            <Emblem size={44} glow />
            <span className="flex flex-col" style={{ fontFamily: "var(--font-brand)" }}>
              <span className="text-xl font-light leading-none tracking-[0.38em] text-white">
                {siteConfig.name.toLocaleUpperCase("tr-TR")}
              </span>
              <span className="mt-1.5 text-[0.625rem] leading-none tracking-[0.5em] text-indigo-200/80">
                {siteConfig.tagline.toLocaleUpperCase("tr-TR")}
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">
            Ayın evresi, doğuş-batış saatleri, dolunaylar ve tutulmalar. Hepsi Türkiye saatine göre, astronomik hesapla.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-zinc-300 hover:text-white hover:underline">
                {siteConfig.contactEmail}
              </a>
            </li>
            <li>
              <Link href={PAGES.yontem.path} className="text-indigo-300 hover:text-indigo-200 hover:underline">
                Nasıl hesaplıyoruz? →
              </Link>
            </li>
          </ul>
        </div>

        <nav aria-label="Öne çıkan sayfalar">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {FOOTER_SECTIONS.map(({ group, pages }) => (
              <div key={group}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{GROUP_NAMES[group]}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {pages.map((p) => (
                    <li key={p.path}>
                      <Link href={p.path} className="text-zinc-300 hover:text-white hover:underline">
                        {p.navLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link
            href={`${HOME_PATH}#kesfet`}
            className="mt-8 inline-block text-sm font-medium text-indigo-300 hover:text-indigo-200 hover:underline"
          >
            Bütün sayfalar →
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs leading-relaxed text-zinc-500">
          Ay fotoğrafları: NASA Scientific Visualization Studio ve NASA görsel arşivi (kamu malı). Lunatlas, NASA ile
          bağlantılı değildir ve NASA tarafından onaylanmamıştır. Saatler Türkiye saatine (UTC+3) göredir.
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">
            © {year} {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {CORPORATE.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="text-zinc-400 hover:text-white hover:underline">
                  {p.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
