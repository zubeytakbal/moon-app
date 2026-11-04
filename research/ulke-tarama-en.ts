/**
 * İngilizce ülke taraması (siteye ait değil, yalnız araştırma için).
 *
 * İngilizce konuşulan ülkelerde ay ve gökyüzü konuları ülke ve şehir adıyla nasıl aranıyor? Google otomatik
 * tamamlamasına (hl=en, gl=<ülke>) "full moon uk", "sunrise time london", "solar eclipse india" gibi kalıplar sorulur;
 * yalnız ülke ya da şehir adı geçen öneriler tutulur. Türkçe `ulke-tarama.ts`'nin İngilizce karşılığı.
 *
 * Kullanım (kökten): node research/ulke-tarama-en.ts ["konu" ...]
 * Çıktı: research/sonuclar/<tarih>-en-ulke-tarama.csv
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "sonuclar");
const DELAY_MS = 450;

type Country = { names: string[]; gl: string; cities: string[] };

const COUNTRIES: Country[] = [
  { names: ["usa", "us", "america"], gl: "us", cities: ["new york", "los angeles", "chicago", "houston", "phoenix", "seattle", "denver", "miami", "boston", "dallas"] },
  { names: ["uk", "england", "scotland"], gl: "gb", cities: ["london", "manchester", "birmingham", "glasgow", "edinburgh", "leeds"] },
  { names: ["canada"], gl: "ca", cities: ["toronto", "vancouver", "montreal", "calgary", "ottawa"] },
  { names: ["australia"], gl: "au", cities: ["sydney", "melbourne", "brisbane", "perth", "adelaide"] },
  { names: ["india"], gl: "in", cities: ["delhi", "mumbai", "bangalore", "hyderabad", "chennai", "kolkata"] },
  { names: ["ireland"], gl: "ie", cities: ["dublin", "cork"] },
  { names: ["new zealand", "nz"], gl: "nz", cities: ["auckland", "wellington", "christchurch"] },
  { names: ["south africa"], gl: "za", cities: ["johannesburg", "cape town", "durban"] },
  { names: ["philippines"], gl: "ph", cities: ["manila", "cebu"] },
  { names: ["nigeria"], gl: "ng", cities: ["lagos", "abuja"] },
  { names: ["singapore"], gl: "sg", cities: ["singapore"] },
];

const DEFAULT_TOPICS = ["sunrise", "sunset", "moon phase", "full moon", "solar eclipse", "lunar eclipse", "northern lights", "meteor shower"];
const ARGS = process.argv.slice(2);
const TOPICS = ARGS.length ? ARGS : DEFAULT_TOPICS;
/** Şehirlerle yalnız yere en bağlı konular taranır (istek sayısını makul tutmak için). */
const CITY_TOPICS = TOPICS.filter((t) => ["sunrise", "sunset", "moon phase", "full moon", "northern lights", "solar eclipse"].includes(t));
const INTENTS = ["today", "tonight", "time", "when", "2026", "2027"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function suggest(q: string, gl: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=${gl}&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.status === 429) {
        console.log("  Google yavaşla dedi, 30 sn bekleniyor...");
        await sleep(30_000);
        continue;
      }
      const json = (await res.json()) as [string, string[]];
      return json[1] ?? [];
    } catch {
      await sleep(2000);
    }
  }
  return [];
}

type Row = { country: string; place: string; topic: string; asked: string; suggestion: string };
const rows: Row[] = [];
const seen = new Set<string>();

async function probe(c: Country, place: string, topic: string, asked: string, mustContain: string[]) {
  const out = await suggest(asked, c.gl);
  await sleep(DELAY_MS);
  for (const s of out) {
    const n = s.toLowerCase();
    if (!mustContain.some((m) => new RegExp(`\\b${m}\\b`).test(n))) continue;
    const key = c.names[0] + "|" + n;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ country: c.names[0], place, topic, asked, suggestion: s });
  }
}

let done = 0;
for (const c of COUNTRIES) {
  const before = rows.length;
  const placeWords = [...c.names, ...c.cities];
  for (const topic of TOPICS) {
    for (const name of c.names) {
      const patterns = [`${topic} ${name}`, `${topic} in ${name}`, `${name} ${topic}`, ...INTENTS.map((i) => `${topic} ${i} ${name}`)];
      for (const p of patterns) await probe(c, name, topic, p, placeWords);
    }
  }
  for (const city of c.cities) {
    for (const topic of CITY_TOPICS) {
      await probe(c, city, topic, `${topic} ${city}`, [city]);
      await probe(c, city, topic, `${topic} time ${city}`, [city]);
    }
  }
  done++;
  console.log(`${done}/${COUNTRIES.length} ${c.names[0]}: ${rows.length - before} öneri`);
}

mkdirSync(OUT_DIR, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const file = join(OUT_DIR, `${date}-en-ulke-tarama.csv`);
const esc = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(
  file,
  "﻿ülke;yer;konu;sorulan;öneri\n" +
    rows.map((r) => [r.country, r.place, r.topic, r.asked, r.suggestion].map(esc).join(";")).join("\n"),
);
console.log(`Bitti: ${rows.length} öneri → ${file}`);
