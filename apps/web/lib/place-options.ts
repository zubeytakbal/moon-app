import { ABROAD_CITIES, TURKEY_PROVINCES } from "@moon-app/moon";

/** Seçicideki 81 il. */
export const PROVINCE_OPTIONS = TURKEY_PROVINCES.map(({ slug, name }) => ({ slug, name }));

/** Seçicideki yurt dışı şehirler, ülkeye göre gruplu, ülke içinde alfabetik. */
export const ABROAD_OPTIONS = [...new Set(ABROAD_CITIES.map((c) => c.country))].map((country) => ({
  country,
  cities: ABROAD_CITIES.filter((c) => c.country === country)
    .map(({ slug, name }) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr-TR")),
}));

/** Sayfalardaki sabit "Avrupa'dan" tablolarında gösterilen büyük şehirler. */
export const FEATURED_ABROAD = ABROAD_CITIES.filter((c) => c.featured);

/** Cevap kutularında Almanya'yı temsil eden şehir (ülke aramalarının en çok geldiği ülke). */
export const BERLIN = ABROAD_CITIES.find((c) => c.slug === "berlin")!;
