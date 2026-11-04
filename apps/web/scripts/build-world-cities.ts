/**
 * Şehir arama kutusunun veri dosyasını üretir: apps/web/public/data/dunya-sehirleri.json
 *
 * Kaynak: GeoNames (https://www.geonames.org), CC BY 4.0. İndirilen dosyalar projeye konmaz; yolları argümanla verilir:
 *   node apps/web/scripts/build-world-cities.ts <cities1000.txt> <cities5000.txt> <cities15000.txt> <alt-tr.txt>
 * (https://download.geonames.org/export/dump/ adresinden indirilip açılır. alt-tr.txt: alternateNamesV2.txt içinden
 * yalnız dili "tr" olan satırlar: awk -F'\t' '$3=="tr"' alternateNamesV2.txt > alt-tr.txt)
 *
 * Seçim: Türkiye ve Kıbrıs'ta nüfusu 1.000'i, Türkçe konuşanların çok yaşadığı ülkelerde 5.000'i, dünyanın geri
 * kalanında 15.000'i geçen yerleşimler. Görünen ad GeoNames'in Türkçe adıdır (varsa: "Floransa", "Münih"); arama
 * anahtarları asıl ad, ASCII ad ve Türkçe adlar; nüfusu 1 milyonu geçen şehirlerde Latin harfli bütün diğer adlar da
 * ("Firenze" gibi). Büyük harf, aksan ve ı-i farkı aramada yok sayılır.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [file1000, file5000, file15000, fileTr] = process.argv.slice(2);
if (!fileTr) {
  console.error("Kullanım: node apps/web/scripts/build-world-cities.ts <cities1000.txt> <cities5000.txt> <cities15000.txt> <alt-tr.txt>");
  process.exit(1);
}

/** geonameid → Türkçe adlar (önce "tercih edilen", tarihî ve halk ağzı adlar hariç). */
const turkish = new Map<string, string[]>();
for (const line of readFileSync(fileTr, "utf8").split("\n")) {
  const f = line.split("\t");
  if (f.length < 4 || f[2] !== "tr" || f[6] === "1" || f[7] === "1") continue;
  const list = turkish.get(f[1]) ?? [];
  if (f[4] === "1") list.unshift(f[3]);
  else list.push(f[3]);
  turkish.set(f[1], list);
}

const DETAILED = new Set(["TR", "CY"]);
const DIASPORA = new Set(["DE", "NL", "BE", "AT", "CH", "FR", "GB", "DK", "SE", "NO", "BG", "MK", "XK", "AZ", "GR", "GE", "IQ"]);
const LATIN = /^[A-Za-zÀ-ɏḀ-ỿ'’. -]{2,40}$/;
const AIRPORT = /^[A-Z]{3,4}$/;

function norm(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Row = { id: string; name: string; keys: string[]; lat: number; lon: number; cc: string; tz: string; pop: number };
const BIG_CITY = 1_000_000;

function read(file: string, keep: (cc: string) => boolean): Row[] {
  const rows: Row[] = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const f = line.split("\t");
    if (f.length < 18) continue;
    const cc = f[8];
    if (!keep(cc)) continue;
    const pop = Number(f[14]) || 0;
    const tr = turkish.get(f[0]) ?? [];
    const alternates = pop >= BIG_CITY && f[3] ? f[3].split(",") : [];
    const keys = new Set<string>();
    for (const n of [f[1], f[2], ...tr, ...alternates]) {
      if (!n || AIRPORT.test(n) || !LATIN.test(n)) continue;
      const k = norm(n);
      if (k.length >= 2) keys.add(k);
    }
    rows.push({
      id: f[0],
      // Türkçe adı varsa o görünür (Türkiye'deki yerleşimlerde asıl ad zaten Türkçedir).
      // "New York kenti" gibi eklerin sonundaki "kenti/şehri" atılır.
      name: cc === "TR" ? f[1] : (tr[0] ?? f[1]).replace(/ (kenti|şehri)$/u, ""),
      keys: [...keys],
      lat: Number(f[4]),
      lon: Number(f[5]),
      cc,
      tz: f[17],
      pop,
    });
  }
  return rows;
}

const all = new Map<string, Row>();
for (const r of read(file15000, () => true)) all.set(r.id, r);
for (const r of read(file5000, (cc) => DIASPORA.has(cc) || DETAILED.has(cc))) all.set(r.id, r);
for (const r of read(file1000, (cc) => DETAILED.has(cc))) all.set(r.id, r);

const rows = [...all.values()].filter((r) => r.tz).sort((a, b) => b.pop - a.pop);
const zones = [...new Set(rows.map((r) => r.tz))].sort();
const zoneIndex = new Map(zones.map((z, i) => [z, i]));

// [ad, ülke kodu, enlem, boylam, saat dilimi sırası, nüfus (bin), arama anahtarları "|" ile]
const cities = rows.map((r) => [
  r.name,
  r.cc,
  Math.round(r.lat * 1000) / 1000,
  Math.round(r.lon * 1000) / 1000,
  zoneIndex.get(r.tz)!,
  Math.round(r.pop / 1000),
  r.keys.filter((k) => k !== norm(r.name)).join("|"),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "data", "dunya-sehirleri.json");
mkdirSync(dirname(out), { recursive: true });
const json = JSON.stringify({ kaynak: "GeoNames (geonames.org), CC BY 4.0", zones, cities });
writeFileSync(out, json);
console.log(`${cities.length} yerleşim, ${zones.length} saat dilimi, ${(json.length / 1024 / 1024).toFixed(2)} MB → ${out}`);
