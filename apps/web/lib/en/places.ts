import { ZONE_CITIES, type ZoneCity } from "./zone-cities";

/**
 * İngilizce sürümün yer sistemi (tarayıcıda da çalışır). Ziyaretçinin şehri cihazın saat diliminden tahmin edilir
 * (o dilimin en kalabalık şehri: Asia/Kolkata → Mumbai); ziyaretçi 46 bin yerleşimlik listeden arayabilir ya da
 * konumunu kullanabilir. Konum hiçbir yere gönderilmez. Google'ın gördüğü varsayılan şehir New York'tur.
 */

export interface EnPlace {
  /** GeoNames kimliği; konumdan gelen yerde 0. */
  id: number;
  name: string;
  /** İki harfli ülke kodu (konumda boş). */
  country: string;
  /** Eyalet / bölge (ayrıntılı ülkelerde; yoksa boş). */
  admin: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timeZone: string;
}

const fromZone = (timeZone: string, c: ZoneCity): EnPlace => ({
  id: c[0],
  name: c[1],
  country: c[2],
  admin: c[3],
  latitude: c[4],
  longitude: c[5],
  elevation: 0,
  timeZone,
});

export const DEFAULT_TIME_ZONE = "America/New_York";
export const DEFAULT_PLACE: EnPlace = fromZone(DEFAULT_TIME_ZONE, ZONE_CITIES[DEFAULT_TIME_ZONE]);

/** Eski IANA adları (tarayıcılar hâlâ verebiliyor) → listedeki güncel ad. */
const ZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Rangoon": "Asia/Yangon",
  "Europe/Kiev": "Europe/Kyiv",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "US/Eastern": "America/New_York",
  "US/Central": "America/Chicago",
  "US/Mountain": "America/Denver",
  "US/Pacific": "America/Los_Angeles",
};

/** Cihazın saat diliminden tahmin edilen şehir; tanınmazsa null. */
export function placeForTimeZone(timeZone: string | undefined): EnPlace | null {
  if (!timeZone) return null;
  const zone = ZONE_ALIASES[timeZone] ?? timeZone;
  const city = ZONE_CITIES[zone];
  return city ? fromZone(zone, city) : null;
}

/** Saat dilimi listesindeki şehirlerden kimliğe göre (paylaşılan bağlantı listeyi indirmeden açılsın diye). */
export function zonePlaceById(id: number): EnPlace | null {
  for (const [zone, c] of Object.entries(ZONE_CITIES)) if (c[0] === id) return fromZone(zone, c);
  return null;
}

const REGION = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export function countryName(code: string): string {
  if (!code) return "";
  if (code === "US") return "USA";
  if (code === "GB") return "UK";
  return REGION?.of(code) ?? code;
}

/** Bölgesi yazılan ülkeler: aynı adlı şehirler çok ("Springfield"). */
const WITH_ADMIN = new Set(["US", "CA", "AU", "IN"]);

/** "Chicago, Illinois" · "Mumbai, Maharashtra, India" · "London, UK" · "Your location". */
export function placeLabel(p: EnPlace): string {
  if (!p.country) return p.name;
  const parts = [p.name];
  if (WITH_ADMIN.has(p.country) && p.admin && p.admin !== p.name) parts.push(p.admin);
  const country = countryName(p.country);
  if (p.country !== "US" && country !== p.name) parts.push(country);
  return parts.join(", ");
}

/** Arama için sadeleştirme: küçük harf, aksansız (veri dosyasındaki anahtarlarla aynı kural). */
export function normalizeQuery(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Veri dosyası satırı: [id, ad, ülke, bölge sırası, enlem, boylam, saat dilimi sırası, ek anahtarlar?]. */
type CityRow = [number, string, string, number, number, number, number, string?];
interface CityFile {
  zones: string[];
  admins: string[];
  cities: CityRow[];
}
export interface WorldCities {
  places(i: number): EnPlace;
  count: number;
  keys: string[][];
  byId: Map<number, number>;
}

let loading: Promise<WorldCities> | null = null;

/** 46 bin yerleşimlik liste (GeoNames, CC BY 4.0); yalnız arama ya da paylaşılan bağlantı gerekince indirilir. */
export function loadWorldCities(): Promise<WorldCities> {
  loading ??= fetch("/data/world-cities-en.json")
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<CityFile>;
    })
    .then((d) => ({
      count: d.cities.length,
      keys: d.cities.map((c) => [normalizeQuery(c[1]), ...(c[7] ? c[7].split("|") : [])]),
      byId: new Map(d.cities.map((c, i) => [c[0], i])),
      places: (i: number) => {
        const c = d.cities[i];
        return {
          id: c[0],
          name: c[1],
          country: c[2],
          admin: c[3] >= 0 ? d.admins[c[3]] : "",
          latitude: c[4],
          longitude: c[5],
          elevation: 0,
          timeZone: d.zones[c[6]],
        };
      },
    }));
  loading.catch(() => {
    loading = null;
  });
  return loading;
}

/** Liste nüfusa göre sıralı; tam eşleşen ad öne alınır. */
export function searchCities(data: WorldCities, query: string, limit = 8): EnPlace[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];
  const found: { i: number; exact: boolean }[] = [];
  for (let i = 0; i < data.count && found.length < 60; i++) {
    const hit = data.keys[i].find((k) => k.startsWith(q) || k.includes(` ${q}`));
    if (hit) found.push({ i, exact: hit === q });
  }
  found.sort((a, b) => Number(b.exact) - Number(a.exact));
  return found.slice(0, limit).map((f) => data.places(f.i));
}
