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

export const EN_PAGES = {} as const satisfies Record<string, EnSitePage>;

export const EN_ALL_PAGES: EnSitePage[] = Object.values(EN_PAGES);

type EnPageKey = keyof typeof EN_PAGES;

/** Her sayfanın altında önerilen ilgili sayfalar (elle seçilir). */
export const EN_RELATED: Record<EnPageKey, EnPageKey[]> = {};
