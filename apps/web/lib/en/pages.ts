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
  moonPhaseBirthday: {
    path: "/en/moon-phase-birthday",
    title: "Moon Phase on Your Birthday",
    navLabel: "Moon on Your Birthday",
    group: "moon",
    featured: true,
    description: "What the moon looked like on the day you were born, as seen from your birthplace, with a wallpaper to download and a partner comparison.",
    cardPhaseAngle: 135,
    tr: "/tr/dogdugum-gun-ay",
  },
  lunarEclipse: {
    path: "/en/lunar-eclipse",
    title: "Lunar Eclipses and Blood Moons",
    navLabel: "Lunar Eclipses",
    group: "eclipses",
    featured: true,
    description: "The next lunar eclipse and blood moon you can see from your city, with local times for every stage, and every lunar eclipse to 2030.",
    cardPhaseAngle: 180,
    tr: "/tr/ay-tutulmalari",
  },
  solarEclipse: {
    path: "/en/solar-eclipse",
    title: "Solar Eclipses",
    navLabel: "Solar Eclipses",
    group: "eclipses",
    featured: true,
    description: "The next solar eclipse you can see from your city, with local times and how much of the sun is covered, plus the total eclipse of August 2, 2027.",
    cardPhaseAngle: 0,
    tr: "/tr/gunes-tutulmasi",
  },
  fullMoon: {
    path: "/en/full-moon",
    title: "Next Full Moon",
    navLabel: "Full Moon",
    group: "moon",
    featured: true,
    description: "When the next full moon is in your time zone, what it's called, when to see it rise, and every full moon of this year and next.",
    cardPhaseAngle: 180,
    tr: "/tr/dolunay",
  },
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
  meteorShowers: {
    path: "/en/meteor-showers",
    title: "Meteor Showers",
    navLabel: "Meteor Showers",
    group: "night-sky",
    featured: true,
    description: "Is there a meteor shower tonight? The best time to watch from your city, how many meteors an hour to expect, where to look, and the full meteor shower calendar.",
    cardPhaseAngle: 30,
    tr: "/tr/meteor-yagmurlari",
  },
  about: {
    path: "/en/about",
    title: "About Lunatlas",
    navLabel: "About",
    group: "about",
    description: "Who makes Lunatlas, how the times and dates are calculated and checked, and how we handle science and tradition.",
    cardPhaseAngle: 90,
    tr: "/tr/hakkimizda",
  },
  author: {
    path: "/en/author",
    title: "About the Author",
    navLabel: "Author",
    group: "about",
    description: "Zübeyt Akbal, founder and editor of Lunatlas.",
    cardPhaseAngle: 90,
    tr: "/tr/yazar",
  },
  contact: {
    path: "/en/contact",
    title: "Contact",
    navLabel: "Contact",
    group: "about",
    description: "How to reach us with corrections, questions and suggestions.",
    cardPhaseAngle: 90,
    tr: "/tr/iletisim",
  },
  methodology: {
    path: "/en/methodology",
    title: "Methodology and Accuracy",
    navLabel: "Methodology",
    group: "about",
    description: "How we calculate every time and date, and how our results compare with NASA and the U.S. Naval Observatory.",
    cardPhaseAngle: 90,
    tr: "/tr/yontem-ve-dogruluk",
  },
  sources: {
    path: "/en/sources",
    title: "Sources",
    navLabel: "Sources",
    group: "about",
    description: "Every source behind the information on this site, each with its own permanent number.",
    cardPhaseAngle: 90,
    tr: "/tr/kaynaklar",
  },
  privacyPolicy: {
    path: "/en/privacy-policy",
    title: "Privacy Policy",
    navLabel: "Privacy",
    group: "about",
    description: "What information is processed when you use Lunatlas, why, and your rights.",
    cardPhaseAngle: 90,
    tr: "/tr/gizlilik-politikasi",
  },
  cookiePolicy: {
    path: "/en/cookie-policy",
    title: "Cookie Policy",
    navLabel: "Cookies",
    group: "about",
    description: "Which cookies Lunatlas uses, what for, and how to manage them.",
    cardPhaseAngle: 90,
    tr: "/tr/cerez-politikasi",
  },
} as const satisfies Record<string, EnSitePage>;

export const EN_ALL_PAGES: EnSitePage[] = Object.values(EN_PAGES);

type EnPageKey = keyof typeof EN_PAGES;

/** Her sayfanın altında önerilen ilgili sayfalar (elle seçilir). */
export const EN_RELATED: Record<EnPageKey, EnPageKey[]> = {
  lunarEclipse: ["solarEclipse", "fullMoon"],
  solarEclipse: ["lunarEclipse", "fullMoon"],
  moonPhaseBirthday: ["moonPhaseToday", "fullMoon"],
  fullMoon: ["moonPhaseToday", "solarEclipse"],
  moonPhaseToday: ["fullMoon", "sunriseSunset"],
  sunriseSunset: ["moonPhaseToday", "fullMoon"],
  meteorShowers: ["moonPhaseToday", "sunriseSunset"],
  about: [],
  author: [],
  contact: [],
  methodology: [],
  sources: [],
  privacyPolicy: [],
  cookiePolicy: [],
};
