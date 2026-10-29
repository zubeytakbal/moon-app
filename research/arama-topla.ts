/**
 * Arama toplama aracı (siteye ait değil, yalnız araştırma için).
 *
 * Google otomatik tamamlamasından bir konunun gerçekten aranan sorgularını toplar:
 * konunun kendisi, harf harf ("dolunay a", "dolunay b"...), soru kalıpları ("dolunay ne zaman"...) ve yıllar.
 * Sonra her sorguyu lunatlas.com'un yayındaki sayfalarıyla karşılaştırır: hangi sayfa cevaplıyor olabilir,
 * hangisi boşta kalıyor. Hacim vermez: hacim için çıkan listeyi Google Keyword Planner'a yapıştırın.
 *
 * Kullanım (kökten):
 *   node research/arama-topla.ts dolunay "kanlı ay"
 *   node research/arama-topla.ts --hepsi        (research/tohumlar.txt içindeki bütün konular)
 *   node research/arama-topla.ts --hizli dolunay (yalnız konu + soru kalıpları, harf taraması yok)
 *
 * Çıktı: research/sonuclar/<tarih>-<konu>.csv (Excel'de açılır) ve .txt (Keyword Planner'a yapıştırmak için).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "sonuclar");
const SITE = "https://lunatlas.com";
/** İstekler arası bekleme; Google'ı yormamak ve engellenmemek için. */
const DELAY_MS = 450;

const LETTERS = "abcçdefgğhıijklmnoöprsştuüvyz".split("");
const QUESTIONS = [
  "ne zaman",
  "nedir",
  "neden",
  "nasıl",
  "kaç",
  "hangi",
  "mi",
  "ne demek",
  "ne anlama gelir",
  "saat kaçta",
  "nerede",
  "görülecek mi",
  "takvimi",
  "türkiye",
  "istanbul",
];
const YEARS = ["2026", "2027"];
const STOPWORDS = new Set(
  "ve ile mi mı mu mü ne bir bu şu için de da ki gibi en çok daha olan olur nedir neden nasıl zaman kaç hangi ayın aya ayda ay".split(
    " ",
  ),
);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Türkçe küçük harf + aksan silme: "Dolunayın" ve "dolunayin" aynı sayılsın. */
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

function tokens(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

async function suggest(q: string): Promise<string[]> {
  const url =
    "https://suggestqueries.google.com/complete/search?client=firefox&hl=tr&gl=tr&ie=utf-8&oe=utf-8&q=" +
    encodeURIComponent(q);
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

type SitePage = { path: string; title: string; text: string; tokens: Set<string> };

/** Yayındaki sayfaların başlık, açıklama, ara başlık ve SSS sorularını toplar (site haritasından). */
async function loadSite(): Promise<SitePage[]> {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // Sayfalar 6'şar 6'şar, aynı anda indirilir.
  const htmls: string[] = [];
  for (let i = 0; i < urls.length; i += 6) {
    const batch = urls.slice(i, i + 6).map((u) =>
      fetch(u, { signal: AbortSignal.timeout(20_000) })
        .then((r) => r.text())
        .catch(() => ""),
    );
    htmls.push(...(await Promise.all(batch)));
  }
  const pages: SitePage[] = [];
  for (const [n, url] of urls.entries()) {
    const html = htmls[n];
    const pick = (re: RegExp) => [...html.matchAll(re)].map((m) => m[1].replace(/<[^>]+>/g, " "));
    const title = pick(/<title>([^<]*)<\/title>/g)[0] ?? "";
    const parts = [
      title,
      ...pick(/<meta name="description" content="([^"]*)"/g),
      ...pick(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g),
    ].map((s) => s.replace(/&#x27;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"'));
    const text = parts.join(" | ");
    pages.push({ path: url.replace(SITE, ""), title, text, tokens: new Set(tokens(text)) });
  }
  return pages;
}

/** "dolunayi" ile "dolunay" eşleşsin diye kelimeler ilk 5 harfle (kaba kök) karşılaştırılır. */
const stem = (t: string) => t.slice(0, 5);

/**
 * Sorguya en yakın sayfa. Konunun kendi kelimesi (örn. "dolunay") her sayfada geçtiği için sayılmaz;
 * sorguyu ayırt eden kelimelerin ("baş ağrısı", "renk"...) kaçının sayfada geçtiğine bakılır.
 * Eşitlikte başlığında konu geçen sayfa öne çıkar. Bu yalnız bir ipucudur; son kararı insan (ya da Claude) verir.
 */
function bestPage(query: string, seed: string, pages: SitePage[]): { page?: SitePage; score: number } {
  const seedStems = new Set(tokens(seed).map(stem));
  const all = tokens(query);
  const distinctive = all.filter((t) => !seedStems.has(stem(t)));
  const titleHasSeed = (p: SitePage) => tokens(p.title).some((t) => seedStems.has(stem(t)));
  let best: { page?: SitePage; score: number; bonus: number } = { score: 0, bonus: -1 };
  for (const p of pages) {
    const stems = new Set([...p.tokens].map(stem));
    const words = distinctive.length ? distinctive : all;
    const score = words.length ? words.filter((t) => stems.has(stem(t))).length / words.length : 0;
    const bonus = (titleHasSeed(p) ? 2 : 0) + (tokens(p.title).filter((t) => all.some((q) => stem(q) === stem(t))).length > 0 ? 1 : 0);
    if (score > best.score || (score === best.score && bonus > best.bonus)) best = { page: p, score, bonus };
  }
  return { page: best.page, score: best.score };
}

async function collect(seed: string, fast: boolean): Promise<Map<string, string>> {
  const found = new Map<string, string>(); // sorgu -> hangi tohum ifadeden geldi
  const probes = [seed, ...QUESTIONS.map((q) => `${seed} ${q}`), ...YEARS.map((y) => `${seed} ${y}`)];
  if (!fast) probes.push(...LETTERS.map((l) => `${seed} ${l}`));
  let i = 0;
  for (const probe of probes) {
    i++;
    process.stdout.write(`\r  ${seed}: ${i}/${probes.length} sorgu, ${found.size} arama bulundu   `);
    for (const s of await suggest(probe)) {
      const key = s.toLocaleLowerCase("tr-TR").trim();
      if (!found.has(key)) found.set(key, probe);
    }
    await sleep(DELAY_MS);
  }
  process.stdout.write("\n");
  return found;
}

function csvCell(s: string | number): string {
  const v = String(s);
  return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

async function main() {
  const args = process.argv.slice(2);
  const fast = args.includes("--hizli");
  let seeds = args.filter((a) => !a.startsWith("--"));
  if (args.includes("--hepsi")) {
    seeds = readFileSync(join(HERE, "tohumlar.txt"), "utf8")
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("#"));
  }
  if (seeds.length === 0) {
    console.log('Kullanım: node research/arama-topla.ts dolunay "kanlı ay"   ya da   --hepsi');
    process.exit(1);
  }

  console.log("Sitenin sayfaları okunuyor...");
  const pages = await loadSite();
  console.log(`  ${pages.length} sayfa.`);

  const rows: { query: string; seed: string; probe: string; page: string; score: number }[] = [];
  const seen = new Set<string>();
  for (const seed of seeds) {
    const found = await collect(seed, fast);
    for (const [query, probe] of found) {
      if (seen.has(query)) continue;
      seen.add(query);
      const { page, score } = bestPage(query, seed, pages);
      rows.push({ query, seed, probe, page: score >= 0.5 && page ? page.path : "", score: Math.round(score * 100) });
    }
  }

  // Önce boşluklar (sitede karşılığı zayıf olanlar), sonra eşleşenler.
  rows.sort((a, b) => a.score - b.score || a.seed.localeCompare(b.seed, "tr") || a.query.localeCompare(b.query, "tr"));

  mkdirSync(OUT_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const name = `${date}-${args.includes("--hepsi") ? "hepsi" : seeds.map((s) => norm(s).replace(/ /g, "-")).join("_")}`;
  const csv = [
    ["arama", "konu", "bulunduğu sorgu", "en yakın sayfamız", "eşleşme %"].join(";"),
    ...rows.map((r) => [r.query, r.seed, r.probe, r.page || "(yok, boşluk olabilir)", r.score].map(csvCell).join(";")),
  ].join("\n");
  // BOM: Excel Türkçe karakterleri doğru açsın.
  writeFileSync(join(OUT_DIR, `${name}.csv`), "﻿" + csv);
  writeFileSync(join(OUT_DIR, `${name}.txt`), rows.map((r) => r.query).join("\n"));

  const gaps = rows.filter((r) => !r.page);
  console.log(`\nToplam ${rows.length} farklı arama. Sitede karşılığı zayıf görünen: ${gaps.length}.`);
  console.log(`Dosyalar: research/sonuclar/${name}.csv ve .txt`);
}

await main();
