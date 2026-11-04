/**
 * İngilizce sürümün şehir verisini üretir (siteye ait iki dosya):
 *   apps/web/public/data/world-cities-en.json   şehir arama kutusu (yalnız kutu kullanılınca indirilir)
 *   apps/web/lib/en/zone-cities.ts              saat dilimi → o dilimin en kalabalık şehri (ziyaretçinin şehrini
 *                                               tahmin etmek ve dünya tablosu için; sayfaya gömülür)
 *
 * Kaynak: GeoNames (https://www.geonames.org), CC BY 4.0. İndirilen dosyalar projeye konmaz; yolları argümanla verilir:
 *   node apps/web/scripts/build-world-cities-en.ts <cities5000.txt> <cities15000.txt> <admin1CodesASCII.txt>
 * (https://download.geonames.org/export/dump/ adresinden indirilip açılır.)
 *
 * Seçim: İngilizce konuşulan ve İngilizce aramaların yoğun geldiği ülkelerde (4 Kasım 2026 Keyword Planner ve ülke
 * taraması) nüfusu 5.000'i, dünyanın geri kalanında 15.000'i geçen yerleşimler. Görünen ad GeoNames'in ana adıdır
 * (İngilizce yazımı: "Munich", "Delhi"); arama anahtarları ad, ASCII ad ve nüfusu 1 milyonu geçen şehirlerde diğer
 * Latin harfli adlar ("Bangalore" → Bengaluru). Eyalet/bölge adı aynı adlı şehirleri ayırmak için tutulur.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [file5000, file15000, fileAdmin] = process.argv.slice(2);
if (!fileAdmin) {
  console.error("Kullanım: node apps/web/scripts/build-world-cities-en.ts <cities5000.txt> <cities15000.txt> <admin1CodesASCII.txt>");
  process.exit(1);
}

const DETAILED = new Set(["US", "GB", "IN", "CA", "AU", "NZ", "IE", "ZA", "PH", "SG", "NG", "PK", "KE", "GH", "MY"]);
const SKIP_CODES = new Set(["PPLH", "PPLQ", "PPLW", "PPLCH"]);
const LATIN = /^[A-Za-zÀ-ɏḀ-ỿ'’. -]{2,40}$/;
const ALIAS_POPULATION = 1_000_000;

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const admin1 = new Map<string, string>();
for (const line of readFileSync(fileAdmin, "utf8").split("\n")) {
  const f = line.split("\t");
  if (f.length >= 3) admin1.set(f[0], f[2]);
}

interface City {
  id: number;
  name: string;
  country: string;
  admin: string;
  lat: number;
  lon: number;
  zone: string;
  population: number;
  keys: string[];
}

const byId = new Map<number, City>();
function read(file: string, keep: (country: string, population: number) => boolean) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const f = line.split("\t");
    if (f.length < 18 || f[6] !== "P" || SKIP_CODES.has(f[7])) continue;
    const id = Number(f[0]);
    const population = Number(f[14]) || 0;
    if (byId.has(id) || !keep(f[8], population)) continue;
    const name = f[1];
    const keys = new Set([norm(name), norm(f[2])]);
    if (population >= ALIAS_POPULATION) {
      for (const alt of f[3].split(",")) if (LATIN.test(alt)) keys.add(norm(alt));
    }
    keys.delete("");
    byId.set(id, {
      id,
      name,
      country: f[8],
      admin: admin1.get(`${f[8]}.${f[10]}`) ?? "",
      lat: Math.round(Number(f[4]) * 1e4) / 1e4,
      lon: Math.round(Number(f[5]) * 1e4) / 1e4,
      zone: f[17],
      population,
      keys: [...keys],
    });
  }
}
read(file5000, (c, p) => DETAILED.has(c) && p >= 5000);
read(file15000, (c, p) => p >= 15000);

const cities = [...byId.values()].sort((a, b) => b.population - a.population);
const zones = [...new Set(cities.map((c) => c.zone))].sort();
const zoneIndex = new Map(zones.map((z, i) => [z, i]));
// Bölge adları ("Maharashtra") bir kez yazılır, satırda sıra numarası durur; yalnız ayrıntılı ülkelerde tutulur.
const admins = [...new Set(cities.filter((c) => DETAILED.has(c.country)).map((c) => `${c.country}|${c.admin}`))].sort();
const adminIndex = new Map(admins.map((a, i) => [a, i]));

/**
 * Liste nüfusa göre sıralıdır (arama sonuçları bu sırayla). Satır: [id, ad, ülke, bölge sırası (-1 yok), enlem,
 * boylam, saat dilimi sırası, ek anahtarlar ("|" ile; yoksa satır 8 öğe)].
 */
const rows = cities.map((c) => {
  const main = norm(c.name);
  const extra = c.keys.filter((k) => k !== main).join("|");
  const row: (string | number)[] = [c.id, c.name, c.country, adminIndex.get(`${c.country}|${c.admin}`) ?? -1, c.lat, c.lon, zoneIndex.get(c.zone)!];
  if (extra) row.push(extra);
  return row;
});

const HERE = dirname(fileURLToPath(import.meta.url));
const publicDir = join(HERE, "..", "public", "data");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "world-cities-en.json"), JSON.stringify({ zones, admins: admins.map((a) => a.split("|")[1]), cities: rows }));

// Saat dilimi başına en kalabalık şehir (liste nüfusa göre sıralı olduğundan ilk görülen).
const zoneCity = new Map<string, City>();
for (const c of cities) if (!zoneCity.has(c.zone)) zoneCity.set(c.zone, c);
const zoneLines = [...zoneCity.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([z, c]) => `  ${JSON.stringify(z)}: [${c.id}, ${JSON.stringify(c.name)}, ${JSON.stringify(c.country)}, ${JSON.stringify(c.admin)}, ${c.lat}, ${c.lon}],`);
writeFileSync(
  join(HERE, "..", "lib", "en", "zone-cities.ts"),
  `/**
 * Saat dilimi → o dilimdeki en kalabalık şehir: [GeoNames id, ad, ülke kodu, bölge, enlem, boylam].
 * Ziyaretçinin şehrini cihazın saat diliminden tahmin etmek için. Kaynak: GeoNames (CC BY 4.0).
 * Elle düzenlenmez; scripts/build-world-cities-en.ts üretir.
 */
export type ZoneCity = [id: number, name: string, country: string, admin: string, lat: number, lon: number];

export const ZONE_CITIES: Record<string, ZoneCity> = {
${zoneLines.join("\n")}
};
`,
);

console.log(`${rows.length} şehir, ${zones.length} saat dilimi`);
