/**
 * Ülke taraması (siteye ait değil, yalnız araştırma için).
 *
 * Yurt dışında yaşayan Türkçe konuşanlar ay/tutulma konularını kendi ülke ve şehirleriyle nasıl arıyor?
 * Google otomatik tamamlamasına (hl=tr, gl=<ülke>) "dolunay almanya", "almanyada ay tutulması saat kaçta",
 * "köln dolunay" gibi kalıplar sorulur; yalnız ülke ya da şehir adı geçen öneriler tutulur.
 *
 * Kullanım (kökten): node research/ulke-tarama.ts
 * Çıktı: research/sonuclar/<tarih>-ulke-tarama.csv
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "sonuclar");
const DELAY_MS = 450;

type Country = { name: string; loc: string; gl: string; cities: string[]; extra?: string[] };

/** loc: "-da/-de" ekli yazım (Google aramalarında kesme işaretsiz yaygın). */
const COUNTRIES: Country[] = [
  { name: "almanya", loc: "almanyada", gl: "de", cities: ["berlin", "köln", "münih", "frankfurt", "hamburg", "stuttgart", "düsseldorf", "dortmund", "duisburg", "essen", "nürnberg", "mannheim"] },
  { name: "hollanda", loc: "hollandada", gl: "nl", cities: ["amsterdam", "rotterdam", "lahey", "utrecht"] },
  { name: "belçika", loc: "belçikada", gl: "be", cities: ["brüksel", "anvers", "gent", "liege"] },
  { name: "avusturya", loc: "avusturyada", gl: "at", cities: ["viyana", "linz", "salzburg", "innsbruck"] },
  { name: "fransa", loc: "fransada", gl: "fr", cities: ["paris", "lyon", "strazburg", "marsilya"] },
  { name: "isviçre", loc: "isviçrede", gl: "ch", cities: ["zürih", "basel", "cenevre", "bern"] },
  { name: "ingiltere", loc: "ingilterede", gl: "gb", cities: ["londra", "manchester"] },
  { name: "kıbrıs", loc: "kıbrısta", gl: "cy", cities: ["lefkoşa", "girne", "gazimağusa", "güzelyurt"], extra: ["kktc", "kktcde"] },
  { name: "azerbaycan", loc: "azerbaycanda", gl: "az", cities: ["bakü", "gence", "nahçıvan"] },
  { name: "amerika", loc: "amerikada", gl: "us", cities: ["new york", "chicago", "new jersey", "houston"], extra: ["abd", "abdde"] },
  { name: "bulgaristan", loc: "bulgaristanda", gl: "bg", cities: ["sofya", "kırcaali", "filibe", "şumnu"] },
  { name: "isveç", loc: "isveçte", gl: "se", cities: ["stockholm", "göteborg"] },
  { name: "danimarka", loc: "danimarkada", gl: "dk", cities: ["kopenhag"] },
  { name: "norveç", loc: "norveçte", gl: "no", cities: ["oslo"] },
  { name: "kanada", loc: "kanadada", gl: "ca", cities: ["toronto", "montreal"] },
  { name: "avustralya", loc: "avustralyada", gl: "au", cities: ["sidney", "melbourne"] },
  { name: "irak", loc: "irakta", gl: "iq", cities: ["kerkük", "erbil"] },
  { name: "makedonya", loc: "makedonyada", gl: "mk", cities: ["üsküp"] },
  { name: "kosova", loc: "kosovada", gl: "xk", cities: ["prizren", "priştine"] },
];

/** Ülkeyle birlikte taranan konular (sitemizde karşılığı olanlar). */
const TOPICS = [
  "ay tutulması",
  "güneş tutulması",
  "kanlı ay",
  "dolunay",
  "yeni ay",
  "hilal",
  "ay doğuşu",
  "ay takvimi",
  "hicri takvim",
  "ramazan hilali",
  "meteor yağmuru",
  "süper ay",
  "eyyam-ı biyz",
  "ay evreleri",
];
/** Şehirlerle yalnız en güçlü konular taranır (istek sayısını makul tutmak için). */
const CITY_TOPICS = ["ay tutulması", "güneş tutulması", "dolunay", "hilal", "ay doğuşu"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function norm(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function suggest(q: string, gl: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=tr&gl=${gl}&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`;
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
  const keys = mustContain.map((m) => norm(m).slice(0, Math.max(4, norm(m).length - 2)));
  for (const s of out) {
    const n = norm(s);
    if (!keys.some((k) => n.includes(k))) continue;
    const key = c.name + "|" + n;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ country: c.name, place, topic, asked, suggestion: s });
  }
}

let done = 0;
for (const c of COUNTRIES) {
  const names = [c.name, ...(c.extra ?? [])];
  const before = rows.length;
  for (const topic of TOPICS) {
    const patterns = [
      `${topic} ${c.name}`,
      `${c.name} ${topic}`,
      `${c.loc} ${topic}`,
      `${topic} ${c.loc}`,
      `${topic} ${c.loc} saat kaçta`,
      `${topic} ${c.name} görülecek mi`,
    ];
    for (const e of c.extra ?? []) patterns.push(`${topic} ${e}`);
    for (const p of patterns) await probe(c, c.name, topic, p, [...names, ...c.cities]);
  }
  for (const city of c.cities) {
    for (const topic of CITY_TOPICS) {
      await probe(c, city, topic, `${topic} ${city}`, [city]);
      await probe(c, city, topic, `${city} ${topic}`, [city]);
    }
  }
  done++;
  console.log(`${done}/${COUNTRIES.length} ${c.name}: ${rows.length - before} öneri`);
}

mkdirSync(OUT_DIR, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const file = join(OUT_DIR, `${date}-ulke-tarama.csv`);
const esc = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(
  file,
  "﻿ülke;yer;konu;sorulan;öneri\n" +
    rows.map((r) => [r.country, r.place, r.topic, r.asked, r.suggestion].map(esc).join(";")).join("\n"),
);
console.log(`Bitti: ${rows.length} öneri → ${file}`);
