/**
 * Başka diller için arama toplama aracı (siteye ait değil, yalnız araştırma için).
 *
 * Google otomatik tamamlamasından bir dilde gerçekten aranan sorguları toplar: konunun kendisi, soru kalıpları,
 * yıllar ve harf harf tarama. Türkçe sitedeki `arama-topla.ts`'nin dil seçilebilen hâli; site karşılaştırması yapmaz
 * (o dilde henüz sayfa yok).
 *
 * Kullanım (kökten):
 *   node research/arama-topla-dil.ts en "moon phase" "full moon"
 *   node research/arama-topla-dil.ts en --hepsi            (o dilin hazır konu listesi)
 *   node research/arama-topla-dil.ts de --hizli mondkalender (harf taraması yok)
 * Diller: en (ABD), de (Almanya), es (İspanya), pt (Brezilya). Ülke değiştirmek için --ulke=in (Hindistan), gb, au...
 *   node research/arama-topla-dil.ts en --ulke=in --hizli "sunrise time"
 * Çıktı: research/sonuclar/<tarih>-<dil>-<konu>.csv ve .txt (Keyword Planner için).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "sonuclar");
const DELAY_MS = 450;

type Lang = { hl: string; gl: string; letters: string; questions: string[]; years: string[]; seeds: string[] };

const LANGS: Record<string, Lang> = {
  en: {
    hl: "en",
    gl: "us",
    letters: "abcdefghijklmnopqrstuvwyz",
    questions: ["when", "what", "why", "how", "where", "tonight", "today", "time", "near me", "calendar", "meaning", "is", "can", "will"],
    years: ["2026", "2027"],
    seeds: [
      "moon phase",
      "full moon",
      "new moon",
      "moon tonight",
      "lunar calendar",
      "moonrise",
      "sunrise",
      "sunset",
      "solar eclipse",
      "lunar eclipse",
      "blood moon",
      "supermoon",
      "meteor shower",
      "northern lights",
      "aurora forecast",
      "winter solstice",
      "equinox",
      "moon sign",
      "void of course moon",
      "moon photography",
      "harvest moon",
      "golden hour",
      "day length",
      "dark side of the moon",
      "distance to the moon",
    ],
  },
  de: {
    hl: "de",
    gl: "de",
    letters: "abcdefghijklmnopqrstuvwzäöü",
    questions: ["wann", "was", "warum", "wie", "wo", "heute", "heute nacht", "uhrzeit", "kalender", "bedeutung"],
    years: ["2026", "2027"],
    seeds: ["mondkalender", "vollmond", "neumond", "mondphase", "sonnenaufgang", "sonnenuntergang", "sonnenfinsternis", "mondfinsternis", "sternschnuppen", "polarlichter"],
  },
  es: {
    hl: "es",
    gl: "es",
    letters: "abcdefghijlmnopqrstuvyz",
    questions: ["cuándo", "qué", "por qué", "cómo", "dónde", "hoy", "esta noche", "hora", "calendario", "significado"],
    years: ["2026", "2027"],
    seeds: ["luna", "luna llena", "fase lunar", "calendario lunar", "eclipse", "lluvia de estrellas", "auroras boreales", "salida del sol", "puesta de sol"],
  },
  pt: {
    hl: "pt-BR",
    gl: "br",
    letters: "abcdefghijlmnopqrstuvxz",
    questions: ["quando", "o que", "por que", "como", "onde", "hoje", "hoje à noite", "horário", "calendário", "significado"],
    years: ["2026", "2027"],
    seeds: ["lua", "lua cheia", "fase da lua", "calendário lunar", "eclipse", "chuva de meteoros", "aurora boreal", "nascer do sol", "pôr do sol"],
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function suggest(q: string, lang: Lang): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${lang.hl}&gl=${lang.gl}&ie=utf-8&oe=utf-8&q=${encodeURIComponent(q)}`;
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

const [code, ...rest] = process.argv.slice(2);
const baseLang = LANGS[code];
if (!baseLang) {
  console.error(`Dil kodu verin: ${Object.keys(LANGS).join(", ")}`);
  process.exit(1);
}
const country = rest.find((a) => a.startsWith("--ulke="))?.slice(7);
const lang: Lang = country ? { ...baseLang, gl: country } : baseLang;
const fast = rest.includes("--hizli");
const all = rest.includes("--hepsi");
const seeds = all ? lang.seeds : rest.filter((a) => !a.startsWith("--"));
if (!seeds.length) {
  console.error("Konu verin ya da --hepsi yazın.");
  process.exit(1);
}

const rows: { query: string; seed: string; asked: string }[] = [];
const seen = new Set<string>();
for (const seed of seeds) {
  const asks = [seed, ...lang.questions.map((q) => `${seed} ${q}`), ...lang.questions.map((q) => `${q} ${seed}`), ...lang.years.map((y) => `${seed} ${y}`)];
  if (!fast) asks.push(...lang.letters.split("").map((l) => `${seed} ${l}`));
  let added = 0;
  for (const asked of asks) {
    for (const s of await suggest(asked, lang)) {
      const k = s.toLocaleLowerCase(lang.hl);
      if (seen.has(k)) continue;
      seen.add(k);
      rows.push({ query: s, seed, asked });
      added++;
    }
    await sleep(DELAY_MS);
  }
  console.log(`${seed}: ${added} arama`);
}

mkdirSync(OUT_DIR, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const slug = all ? "hepsi" : seeds.join("_").toLowerCase().replace(/[^a-z0-9äöüçãõáéíóúâêôñ_]+/g, "-").slice(0, 80);
const base = join(OUT_DIR, `${date}-${code}${country ? `-${country}` : ""}-${slug}`);
const esc = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
writeFileSync(`${base}.csv`, "﻿arama;konu;sorulan\n" + rows.map((r) => [r.query, r.seed, r.asked].map(esc).join(";")).join("\n"));
writeFileSync(`${base}.txt`, rows.map((r) => r.query).join("\n"));
console.log(`Toplam ${rows.length} arama → ${base}.csv ve .txt`);
