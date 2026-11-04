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
  /** Sayfalardaki sabit ülke tablolarında gösterilen büyük şehirlerden mi (her ülkeden 1-6). */
  featured: boolean;
}

/** Seçicide gösterilen konum: ya bir il ya da yurt dışı şehir. */
export type Place = Province | AbroadCity;

/**
 * Yurt dışı şehirler (elle seçildi, 4 Kasım 2026 ülke taramasına göre: Türkçe aramalarda en çok geçen ülkeler ve
 * bu ülkelerde Türkçe konuşanların yoğun yaşadığı şehirler). Koordinatlar şehir merkezinin yaklaşık konumudur.
 * Saat dilimi IANA adıdır; yaz saati uygulaması hesaplarda kendiliğinden işler.
 * Kuzey Kıbrıs için Asia/Famagusta (KKTC 2017'den beri Güney Kıbrıs ile aynı saati kullanır).
 */
/** Şehir: [adres adı, ad, enlem, boylam, tablolarda öne çıkan mı, (isteğe bağlı) kendi saat dilimi ve etiketi]. */
type CityRow = [slug: string, name: string, lat: number, lon: number, featured: 0 | 1, timeZone?: string, zoneLabel?: string];

const COUNTRIES: [country: string, timeZone: string, zoneLabel: string, cities: CityRow[]][] = [
  [
    "Almanya",
    "Europe/Berlin",
    "Almanya saati",
    [
      ["berlin", "Berlin", 52.52, 13.405, 1],
      ["koln", "Köln", 50.9375, 6.9603, 1],
      ["munih", "Münih", 48.1351, 11.582, 1],
      ["hamburg", "Hamburg", 53.5511, 9.9937, 1],
      ["frankfurt", "Frankfurt", 50.1109, 8.6821, 1],
      ["stuttgart", "Stuttgart", 48.7758, 9.1829, 1],
      ["dusseldorf", "Düsseldorf", 51.2277, 6.7735, 0],
      ["dortmund", "Dortmund", 51.5136, 7.4653, 0],
      ["duisburg", "Duisburg", 51.4344, 6.7623, 0],
      ["essen", "Essen", 51.4556, 7.0116, 0],
      ["nurnberg", "Nürnberg", 49.4521, 11.0767, 0],
      ["mannheim", "Mannheim", 49.4875, 8.466, 0],
      ["hannover", "Hannover", 52.3759, 9.732, 0],
      ["bremen", "Bremen", 53.0793, 8.8017, 0],
    ],
  ],
  [
    "Hollanda",
    "Europe/Amsterdam",
    "Hollanda saati",
    [
      ["amsterdam", "Amsterdam", 52.3676, 4.9041, 1],
      ["rotterdam", "Rotterdam", 51.9244, 4.4777, 1],
      ["lahey", "Lahey", 52.0705, 4.3007, 0],
      ["utrecht", "Utrecht", 52.0907, 5.1214, 0],
    ],
  ],
  [
    "Belçika",
    "Europe/Brussels",
    "Belçika saati",
    [
      ["bruksel", "Brüksel", 50.8503, 4.3517, 1],
      ["anvers", "Anvers", 51.2194, 4.4025, 0],
      ["gent", "Gent", 51.0543, 3.7174, 0],
      ["liege", "Liège", 50.6326, 5.5797, 0],
    ],
  ],
  [
    "Fransa",
    "Europe/Paris",
    "Fransa saati",
    [
      ["paris", "Paris", 48.8566, 2.3522, 1],
      ["lyon", "Lyon", 45.764, 4.8357, 0],
      ["strazburg", "Strazburg", 48.5734, 7.7521, 0],
      ["marsilya", "Marsilya", 43.2965, 5.3698, 0],
    ],
  ],
  [
    "Avusturya",
    "Europe/Vienna",
    "Avusturya saati",
    [
      ["viyana", "Viyana", 48.2082, 16.3738, 1],
      ["linz", "Linz", 48.3069, 14.2858, 0],
      ["salzburg", "Salzburg", 47.8095, 13.055, 0],
      ["innsbruck", "Innsbruck", 47.2692, 11.4041, 0],
    ],
  ],
  [
    "İsviçre",
    "Europe/Zurich",
    "İsviçre saati",
    [
      ["zurih", "Zürih", 47.3769, 8.5417, 1],
      ["basel", "Basel", 47.5596, 7.5886, 0],
      ["cenevre", "Cenevre", 46.2044, 6.1432, 0],
      ["bern", "Bern", 46.948, 7.4474, 0],
    ],
  ],
  [
    "İngiltere",
    "Europe/London",
    "İngiltere saati",
    [
      ["londra", "Londra", 51.5074, -0.1278, 1],
      ["manchester", "Manchester", 53.4808, -2.2426, 0],
    ],
  ],
  [
    "Bulgaristan",
    "Europe/Sofia",
    "Bulgaristan saati",
    [
      ["sofya", "Sofya", 42.6977, 23.3219, 1],
      ["kircaali", "Kırcaali", 41.6338, 25.3777, 0],
      ["filibe", "Filibe", 42.1354, 24.7453, 0],
    ],
  ],
  [
    "KKTC",
    "Asia/Famagusta",
    "Kıbrıs saati",
    [
      ["lefkosa", "Lefkoşa", 35.1856, 33.3823, 1],
      ["girne", "Girne", 35.3364, 33.3199, 0],
      ["gazimagusa", "Gazimağusa", 35.125, 33.9417, 0],
      ["guzelyurt", "Güzelyurt", 35.1983, 32.9928, 0],
      ["iskele", "İskele", 35.2867, 33.8917, 0],
    ],
  ],
  [
    "Azerbaycan",
    "Asia/Baku",
    "Azerbaycan saati",
    [
      ["baku", "Bakü", 40.4093, 49.8671, 1],
      ["gence", "Gence", 40.6828, 46.3606, 0],
      ["nahcivan", "Nahçıvan", 39.2089, 45.4122, 0],
    ],
  ],
  // 4 Kasım 2026 gün doğumu taramasıyla eklenenler (tablolarda öne çıkmaz; seçicide ve "dünyada" tablolarında görünür).
  ["Danimarka", "Europe/Copenhagen", "Danimarka saati", [["kopenhag", "Kopenhag", 55.6761, 12.5683, 0]]],
  ["İsveç", "Europe/Stockholm", "İsveç saati", [["stockholm", "Stockholm", 59.3293, 18.0686, 0]]],
  ["Norveç", "Europe/Oslo", "Norveç saati", [["oslo", "Oslo", 59.9139, 10.7522, 0]]],
  ["Makedonya", "Europe/Skopje", "Makedonya saati", [["uskup", "Üsküp", 41.9981, 21.4254, 0]]],
  [
    "Kosova",
    "Europe/Belgrade",
    "Kosova saati",
    [
      ["pristine", "Priştine", 42.6629, 21.1655, 0],
      ["prizren", "Prizren", 42.2139, 20.7397, 0],
    ],
  ],
  ["Irak", "Asia/Baghdad", "Irak saati", [["erbil", "Erbil", 36.1911, 44.0092, 0]]],
  [
    "ABD",
    "America/New_York",
    "ABD doğu saati",
    [
      ["new-york", "New York", 40.7128, -74.006, 0],
      ["chicago", "Chicago", 41.8781, -87.6298, 0, "America/Chicago", "ABD orta saati"],
    ],
  ],
  ["Kanada", "America/Toronto", "Kanada doğu saati", [["toronto", "Toronto", 43.6532, -79.3832, 0]]],
  [
    "Avustralya",
    "Australia/Sydney",
    "Avustralya doğu saati",
    [
      ["sidney", "Sidney", -33.8688, 151.2093, 0],
      ["melbourne", "Melbourne", -37.8136, 144.9631, 0, "Australia/Melbourne"],
    ],
  ],
];

/** Yurt dışı şehirler, listedeki sırayla (ülkeler bir arada, her ülkede önce öne çıkanlar). */
export const ABROAD_CITIES: readonly AbroadCity[] = COUNTRIES.flatMap(([country, timeZone, zoneLabel, cities]) =>
  cities.map(([slug, name, latitude, longitude, featured, cityZone, cityLabel]) => ({
    slug,
    name,
    country,
    latitude,
    longitude,
    elevation: 0,
    timeZone: cityZone ?? timeZone,
    zoneLabel: cityLabel ?? zoneLabel,
    featured: featured === 1,
  })),
);

export function isAbroad(place: Place): place is AbroadCity {
  return "country" in place;
}

/** İl ya da yurt dışı şehir; ikisi de değilse undefined. */
export function findPlace(slug: string | undefined): Place | undefined {
  if (!slug) return undefined;
  return TURKEY_PROVINCES.find((p) => p.slug === slug) ?? ABROAD_CITIES.find((c) => c.slug === slug);
}
