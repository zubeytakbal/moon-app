"use client";

import { useEffect, useRef, useState } from "react";
import { zonedTimeToUtc } from "@moon-app/moon";
import {
  DEFAULT_PLACE,
  loadWorldCities,
  placeForTimeZone,
  placeLabel,
  searchCities,
  zonePlaceById,
  type EnPlace,
  type WorldCities,
} from "@/lib/en/places";

/**
 * İngilizce araçların ortak yer ve tarih seçimi. Sunucu (ve Google) varsayılan şehri (New York) görür; tarayıcıda
 * adresteki ?place=<GeoNames id>&date=YYYY-MM-DD, yoksa cihazın saat dilimi şehri belirler. Seçimler adrese yazılır
 * (paylaşılabilir), sayfanın tek adresi (canonical) değişmez.
 */

export type PlaceSource = "default" | "guess" | "link" | "search" | "location";

export function usePlaceAndDate(initialNow: string) {
  const [place, setPlace] = useState<EnPlace>(DEFAULT_PLACE);
  const [source, setSource] = useState<PlaceSource>("default");
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date(initialNow));
  const [locale, setLocale] = useState("en-US");

  // İlk açılış: adresteki yer/tarih, yoksa cihazın saat diliminden tahmin; saat biçimi cihazın diline göre.
  useEffect(() => {
    setNow(new Date());
    const lang = navigator.language;
    if (lang?.toLowerCase().startsWith("en")) setLocale(lang);
    const params = new URLSearchParams(location.search);
    const date = params.get("date");
    const id = Number(params.get("place"));
    const applyDate = (p: EnPlace) => {
      const m = date && /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      if (m) setDateIso(zonedTimeToUtc(Number(m[1]), Number(m[2]), Number(m[3]), 12, p.timeZone).toISOString());
    };
    if (id) {
      const quick = zonePlaceById(id);
      if (quick) {
        setPlace(quick);
        setSource("link");
        applyDate(quick);
        return;
      }
      loadWorldCities()
        .then((d) => {
          const i = d.byId.get(id);
          if (i === undefined) return;
          const p = d.places(i);
          setPlace(p);
          setSource("link");
          applyDate(p);
        })
        .catch(() => {});
      return;
    }
    const guess = placeForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (guess) {
      setPlace(guess);
      setSource("guess");
      applyDate(guess);
    } else applyDate(DEFAULT_PLACE);
  }, []);

  // "Şu an" dakikada bir ilerler.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  return {
    place,
    source,
    now,
    locale,
    dateIso,
    isToday: !dateIso,
    choose(p: EnPlace, how: PlaceSource) {
      setPlace(p);
      setSource(how);
      setDateIso(null);
      writeUrl(p, null);
    },
    setDateInput(iso: string) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
      if (!m) return;
      setDateIso(zonedTimeToUtc(Number(m[1]), Number(m[2]), Number(m[3]), 12, place.timeZone).toISOString());
      writeUrl(place, iso);
    },
    backToToday() {
      setDateIso(null);
      writeUrl(place, null);
    },
  };
}

function writeUrl(p: EnPlace, date: string | null) {
  const params = new URLSearchParams();
  if (p.id) params.set("place", String(p.id));
  if (date) params.set("date", date);
  const q = params.toString();
  history.replaceState(history.state, "", q ? `?${q}` : location.pathname);
}

/** Şehir arama (46 bin yerleşim), "Use my location" ve tarih. */
export function PlacePicker({
  place,
  label,
  source,
  dateKey,
  isToday,
  onPlace,
  onDate,
  onToday,
  dateLabel = "Date",
}: {
  dateLabel?: string;
  place: EnPlace;
  label: string;
  source: PlaceSource;
  dateKey: string;
  isToday: boolean;
  onPlace: (p: EnPlace, how: PlaceSource) => void;
  onDate: (iso: string) => void;
  onToday: () => void;
}) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WorldCities | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const box = useRef<HTMLDivElement>(null);

  const ensure = () => {
    if (data || loading) return;
    setLoading(true);
    loadWorldCities()
      .then(setData)
      .catch(() => setMessage("The city list couldn't be loaded. Please refresh and try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = data ? searchCities(data, query) : [];

  const pick = (p: EnPlace) => {
    onPlace(p, "search");
    setQuery("");
    setOpen(false);
    setMessage("");
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setMessage("Your browser doesn't support location sharing.");
      return;
    }
    setMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPlace(
          {
            id: 0,
            name: "Your location",
            country: "",
            admin: "",
            latitude: Math.round(pos.coords.latitude * 1e4) / 1e4,
            longitude: Math.round(pos.coords.longitude * 1e4) / 1e4,
            elevation: 0,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          },
          "location",
        );
        setMessage("");
      },
      () => setMessage("We couldn't get your location. Check your browser's permission, or type a city instead."),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 600_000 },
    );
  };

  const why =
    source === "guess"
      ? "picked from your device's time zone"
      : source === "default"
        ? "default city"
        : source === "location"
          ? "your location stays on your device"
          : null;

  return (
    <section aria-label="Choose a place and date" className="rounded-2xl bg-[#05070d] p-5 text-white sm:p-6">
      <p className="text-sm text-zinc-400">
        Showing <span className="font-semibold text-white">{label}</span>
        {why && <span> · {why}</span>}
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div ref={box} className="relative min-w-60 flex-[2]">
          <label htmlFor="city-search" className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            City or town
          </label>
          <input
            id="city-search"
            type="search"
            autoComplete="off"
            placeholder="Type a city, e.g. Chicago or Pune"
            value={query}
            onFocus={() => {
              ensure();
              setOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              ensure();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                pick(results[0]);
              }
              if (e.key === "Escape") setOpen(false);
            }}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-base text-white placeholder:text-zinc-500 focus:border-white/40 focus:outline-none"
          />
          {open && query.trim().length >= 2 && (
            <ul className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-[#0d111c] py-1 shadow-2xl">
              {loading && <li className="px-3 py-2 text-sm text-zinc-400">Loading the city list…</li>}
              {!loading && data && results.length === 0 && (
                <li className="px-3 py-2 text-sm text-zinc-400">No match. Try a larger town nearby.</li>
              )}
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                  >
                    {placeLabel(p)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={locate}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10"
        >
          Use my location
        </button>
        <label className="flex flex-col text-xs font-semibold uppercase tracking-wider text-amber-300">
          {dateLabel}
          <input
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={dateKey}
            onChange={(e) => onDate(e.target.value)}
            className="mt-1 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-base font-normal normal-case tracking-normal text-white [color-scheme:dark]"
          />
        </label>
        {!isToday && (
          <button type="button" onClick={onToday} className="rounded-xl px-3 py-2.5 text-sm text-amber-300 hover:bg-white/10">
            Back to today
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
      <p className="mt-3 text-xs text-zinc-500">
        {place.id === 0
          ? "Times are calculated in your browser; your location isn't sent anywhere."
          : "Place list: GeoNames (CC BY 4.0). Times are for the city center and a flat horizon."}
      </p>
    </section>
  );
}
