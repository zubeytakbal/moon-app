import type { GeoLocation } from "./location.ts";
import { TURKEY_PROVINCES, type Province } from "./provinces-tr.ts";

/** Türkiye dışında, Türkçe konuşanların yoğun yaşadığı bir şehir. */
export interface AbroadCity extends GeoLocation {
  /** Adres çubuğunda kullanılan ad, örn. "koln". 81 ilin adlarıyla çakışmaz. */
  slug: string;
  /** Ülke adı, örn. "Almanya". */
  country: string;
  /** Ekranda saatin yanına yazılan ad, örn. "Almanya saati". */
  zoneLabel: string;
}

/** Seçicide gösterilen konum: ya bir il ya da yurt dışı şehir. */
export type Place = Province | AbroadCity;

/**
 * Yurt dışı şehirler (elle seçildi, 4 Kasım 2026 ülke taramasına göre: Türkçe aramalarda en çok geçen ülkeler,
 * her birinden başkent ya da en büyük 1-2 şehir). Koordinatlar şehir merkezinin yaklaşık konumudur.
 * Saat dilimi IANA adıdır; yaz saati uygulaması hesaplarda kendiliğinden işler.
 * Kuzey Kıbrıs için Asia/Famagusta (KKTC 2017'den beri Güney Kıbrıs ile aynı saati kullanır).
 */
const DATA: [slug: string, name: string, country: string, lat: number, lon: number, tz: string, zoneLabel: string][] = [
  ["berlin", "Berlin", "Almanya", 52.52, 13.405, "Europe/Berlin", "Almanya saati"],
  ["koln", "Köln", "Almanya", 50.9375, 6.9603, "Europe/Berlin", "Almanya saati"],
  ["munih", "Münih", "Almanya", 48.1351, 11.582, "Europe/Berlin", "Almanya saati"],
  ["hamburg", "Hamburg", "Almanya", 53.5511, 9.9937, "Europe/Berlin", "Almanya saati"],
  ["frankfurt", "Frankfurt", "Almanya", 50.1109, 8.6821, "Europe/Berlin", "Almanya saati"],
  ["amsterdam", "Amsterdam", "Hollanda", 52.3676, 4.9041, "Europe/Amsterdam", "Hollanda saati"],
  ["rotterdam", "Rotterdam", "Hollanda", 51.9244, 4.4777, "Europe/Amsterdam", "Hollanda saati"],
  ["bruksel", "Brüksel", "Belçika", 50.8503, 4.3517, "Europe/Brussels", "Belçika saati"],
  ["paris", "Paris", "Fransa", 48.8566, 2.3522, "Europe/Paris", "Fransa saati"],
  ["viyana", "Viyana", "Avusturya", 48.2082, 16.3738, "Europe/Vienna", "Avusturya saati"],
  ["zurih", "Zürih", "İsviçre", 47.3769, 8.5417, "Europe/Zurich", "İsviçre saati"],
  ["londra", "Londra", "İngiltere", 51.5074, -0.1278, "Europe/London", "İngiltere saati"],
  ["lefkosa", "Lefkoşa", "KKTC", 35.1856, 33.3823, "Asia/Famagusta", "Kıbrıs saati"],
  ["baku", "Bakü", "Azerbaycan", 40.4093, 49.8671, "Asia/Baku", "Azerbaycan saati"],
];

/** Yurt dışı şehirler, listedeki sırayla (ülkeler bir arada). */
export const ABROAD_CITIES: readonly AbroadCity[] = DATA.map(([slug, name, country, latitude, longitude, timeZone, zoneLabel]) => ({
  slug,
  name,
  country,
  latitude,
  longitude,
  elevation: 0,
  timeZone,
  zoneLabel,
}));

export function isAbroad(place: Place): place is AbroadCity {
  return "country" in place;
}

/** İl ya da yurt dışı şehir; ikisi de değilse undefined. */
export function findPlace(slug: string | undefined): Place | undefined {
  if (!slug) return undefined;
  return TURKEY_PROVINCES.find((p) => p.slug === slug) ?? ABROAD_CITIES.find((c) => c.slug === slug);
}
