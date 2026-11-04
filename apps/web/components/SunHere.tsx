"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SunDay } from "@moon-app/moon";

const DIRECTIONS = ["kuzey", "kuzeydoğu", "doğu", "güneydoğu", "güney", "güneybatı", "batı", "kuzeybatı"];
const direction = (azimuth: number | null) => (azimuth === null ? "" : DIRECTIONS[Math.round(azimuth / 45) % 8]);
const COUNTRY = new Intl.DisplayNames(["tr"], { type: "region" });
const MAX_RESULTS = 8;

function hm(minutes: number) {
  const m = Math.round(minutes);
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

/** Arama için sadeleştirme: küçük harf, aksansız, ı → i (veri dosyasındaki anahtarlarla aynı kural). */
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

/** Veri dosyasındaki bir yerleşim: [ad, ülke kodu, enlem, boylam, saat dilimi sırası, nüfus (bin), anahtarlar]. */
type CityRow = [string, string, number, number, number, number, string];
type CityData = { zones: string[]; cities: CityRow[]; keys: string[][] };

let dataPromise: Promise<CityData> | null = null;
/** Şehir listesi yalnız arama kutusu ilk kez kullanılınca indirilir (sayfayı yavaşlatmasın). */
function loadCities(): Promise<CityData> {
  dataPromise ??= fetch("/data/dunya-sehirleri.json")
    .then((r) => r.json() as Promise<{ zones: string[]; cities: CityRow[] }>)
    .then((d) => ({ ...d, keys: d.cities.map((c) => [norm(c[0]), ...(c[6] ? c[6].split("|") : [])]) }));
  return dataPromise;
}

type Place = { label: string; latitude: number; longitude: number; timeZone: string };

/**
 * "Dünyanın her yerinde": yer adıyla arama (GeoNames, ~43 bin yerleşim; ilçeler, tatil yerleri, dünya şehirleri) ya da
 * "Konumumu kullan". Seçilen yerde bugün gün doğumu ve batımı, o yerin kendi saat dilimiyle. Hesap tarayıcıda yapılır;
 * konum cihazdan dışarı gönderilmez.
 */
export function SunHere() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [sun, setSun] = useState<SunDay | null>(null);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ensureData = useCallback(() => {
    if (data || loading) return;
    setLoading(true);
    loadCities()
      .then(setData)
      .catch(() => setMessage("Şehir listesi yüklenemedi. Sayfayı yenileyip tekrar deneyin."))
      .finally(() => setLoading(false));
  }, [data, loading]);

  const results = useMemo(() => {
    const q = norm(query);
    if (!data || q.length < 2) return [];
    const found: { row: CityRow; matched: string }[] = [];
    for (let i = 0; i < data.cities.length && found.length < 60; i++) {
      const keys = data.keys[i];
      const hit = keys.find((k) => k.startsWith(q) || k.includes(` ${q}`));
      if (hit) found.push({ row: data.cities[i], matched: hit });
    }
    // Liste nüfusa göre sıralı; tam eşleşenler öne alınır.
    found.sort((a, b) => Number(b.matched === q) - Number(a.matched === q));
    return found.slice(0, MAX_RESULTS);
  }, [data, query]);

  // Seçilen yer değişince hesap: kütüphane ilk kullanımda yüklenir.
  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    import("@moon-app/moon").then((lib) => {
      if (cancelled) return;
      setSun(lib.getSunDay(new Date(), { name: place.label, latitude: place.latitude, longitude: place.longitude, elevation: 0, timeZone: place.timeZone }));
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  const choose = (row: CityRow) => {
    if (!data) return;
    const label = `${row[0]}, ${row[1] === "TR" ? "Türkiye" : (COUNTRY.of(row[1]) ?? row[1])}`;
    setPlace({ label, latitude: row[2], longitude: row[3], timeZone: data.zones[row[4]] });
    setQuery(row[0]);
    setOpen(false);
    setMessage("");
  };

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage("Tarayıcınız konum paylaşmayı desteklemiyor.");
      return;
    }
    setMessage("Konum alınıyor…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPlace({
          label: "Konumunuz",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul",
        });
        setMessage("");
      },
      () => setMessage("Konum alınamadı. Tarayıcı izinlerini kontrol edin ya da bir yer adı yazın."),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  }, []);

  const t = (d: Date | null) =>
    d && place ? new Intl.DateTimeFormat("tr-TR", { timeZone: place.timeZone, hour: "2-digit", minute: "2-digit" }).format(d) : "-";

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-semibold">Dünyanın her yerinde: ilçe, tatil yeri ya da şehir</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Bodrum, Bozcaada, Floransa, Tokyo… Yer adını yazın ya da bulunduğunuz yer için konumunuzu kullanın. Saatler o
        yerin kendi saatiyle.
      </p>
      <div className="relative mt-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="sehir-ara" className="sr-only">
            Yer adı
          </label>
          <input
            id="sehir-ara"
            ref={inputRef}
            type="search"
            autoComplete="off"
            placeholder="Yer adı yazın (ör. Bodrum)"
            value={query}
            onFocus={() => {
              ensureData();
              setOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              ensureData();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                choose(results[0].row);
              }
              if (e.key === "Escape") setOpen(false);
            }}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base dark:border-zinc-700 dark:bg-zinc-950"
          />
          {open && query.length >= 2 && (
            <ul className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {loading && <li className="px-3 py-2 text-sm text-zinc-500">Liste yükleniyor…</li>}
              {!loading && data && results.length === 0 && (
                <li className="px-3 py-2 text-sm text-zinc-500">Bulunamadı. Daha büyük bir yakın şehir deneyin.</li>
              )}
              {results.map(({ row }) => (
                <li key={`${row[0]}-${row[2]}-${row[3]}`}>
                  <button
                    type="button"
                    onClick={() => choose(row)}
                    className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="font-medium">{row[0]}</span>
                    <span className="text-xs text-zinc-500">{row[1] === "TR" ? "Türkiye" : COUNTRY.of(row[1])}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={locate}
          className="rounded-xl bg-[#05070d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Konumumu kullan
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
      {place && sun && (
        <>
          <p className="mt-4 text-sm font-semibold">{place.label}: bugün</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-zinc-500">Gün doğumu</dt>
              <dd className="text-lg font-semibold tabular-nums">{sun.rise ? t(sun.rise) : sun.polar === "night" ? "doğmuyor" : "-"}</dd>
              <dd className="text-xs text-zinc-500">{direction(sun.riseAzimuth)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Gün batımı</dt>
              <dd className="text-lg font-semibold tabular-nums">{sun.set ? t(sun.set) : sun.polar === "day" ? "batmıyor" : "-"}</dd>
              <dd className="text-xs text-zinc-500">{direction(sun.setAzimuth)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Hava kararır</dt>
              <dd className="text-lg font-semibold tabular-nums">{t(sun.civilDusk)}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Gündüz</dt>
              <dd className="text-lg font-semibold tabular-nums">{hm(sun.minutes)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-zinc-500">
            Saatler {place.timeZone} saat dilimiyle.{" "}
            {place.label === "Konumunuz" ? "Konumunuz hiçbir yere gönderilmez." : "Yer listesi: GeoNames (CC BY 4.0)."}
          </p>
        </>
      )}
    </div>
  );
}
