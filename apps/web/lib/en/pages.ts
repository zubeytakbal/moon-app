/**
 * İngilizce sürümün elle tutulan sayfa listesi (Türkçe `lib/pages.ts`'in karşılığı). Aynı kural geçerli:
 * sayfa ancak içeriği tamamlanınca eklenir, hiçbir sayfa döngüyle üretilmez. Sayfalar Türkçeden çevrilmez;
 * İngilizce aramalara göre sıfırdan yazılır. Bir Türkçe sayfayla aynı soruya cevap veriyorsa `tr` alanı onun
 * yolunu taşır (dil seçici ve hreflang bu eşleşmeyi kullanır).
 */

export type EnPageGroup = "moon" | "sun" | "eclipses" | "night-sky" | "about";

/** Üst menünün bölümleri de bu sırayla dizilir. */
export const EN_GROUP_NAMES: Record<EnPageGroup, string> = {
  moon: "Moon",
  sun: "Sun",
  eclipses: "Eclipses",
  "night-sky": "Night Sky",
  about: "About",
};

export interface EnSitePage {
  path: string;
  title: string;
  navLabel: string;
  group: EnPageGroup;
  description: string;
  cardPhaseAngle: number;
  featured?: boolean;
  /** Aynı soruya cevap veren Türkçe sayfanın yolu (varsa). */
  tr?: string;
}

/** İngilizce ana sayfa. */
export const EN_HOME_PATH = "/en";

/**
 * İngilizce kurumsal sayfaların adresleri. Sayfalar İngilizce yayına açılmadan önce yazılır (About, Contact, Privacy,
 * Cookies, Author, Sources, Methodology); yazılınca `EN_PAGES`'e "about" grubuyla eklenir.
 */
export const EN_AUTHOR_PATH = "/en/author";
export const EN_SOURCES_PATH = "/en/sources";
export const EN_METHOD_PATH = "/en/methodology";

export const EN_PAGES = {
  moonPhaseToday: {
    path: "/en/moon-phase-today",
    title: "Moon Phase Today",
    navLabel: "Moon Phase Today",
    group: "moon",
    featured: true,
    description: "Tonight's moon for your city: phase, how it looks from where you are, moonrise and moonset with direction, and the next full moon.",
    cardPhaseAngle: 60,
    tr: "/tr/bugun-ay",
  },
  sunriseSunset: {
    path: "/en/sunrise-sunset",
    title: "Sunrise and Sunset Times",
    navLabel: "Sunrise & Sunset",
    group: "sun",
    featured: true,
    description: "Sunrise, sunset and what time it gets dark today, for any city, with day length and sun direction.",
    cardPhaseAngle: 180,
    tr: "/tr/gun-dogumu-gun-batimi",
  },
} as const satisfies Record<string, EnSitePage>;

export const EN_ALL_PAGES: EnSitePage[] = Object.values(EN_PAGES);

type EnPageKey = keyof typeof EN_PAGES;

/** Her sayfanın altında önerilen ilgili sayfalar (elle seçilir). */
export const EN_RELATED: Record<EnPageKey, EnPageKey[]> = {
  moonPhaseToday: ["sunriseSunset"],
  sunriseSunset: ["moonPhaseToday"],
};
