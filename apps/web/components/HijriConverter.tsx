"use client";

import { useEffect, useId, useState } from "react";
import {
  fromHijri,
  HIJRI_MAX_YEAR,
  HIJRI_MIN_YEAR,
  HIJRI_MONTHS,
  hijriMonthLength,
  toHijri,
} from "@/lib/hijri-calendar";

const LONG = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
const WEEKDAY = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "long" });

const field =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
const label = "text-xs font-medium uppercase tracking-wider text-zinc-500";

/** Türkiye'de bugünün tarihi, YYYY-MM-DD. */
function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}

function Result({ main, sub }: { main: string; sub: string }) {
  return (
    <div className="mt-5 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-500/10" aria-live="polite">
      <p className="text-2xl font-semibold tracking-tight text-indigo-950 dark:text-indigo-100">{main}</p>
      <p className="mt-1 text-sm text-indigo-900/70 dark:text-indigo-200/70">{sub}</p>
    </div>
  );
}

/** Miladi → Hicri ve Hicri → Miladi çevirici. Tamamen tarayıcıda çalışır, adres değişmez. */
export function HijriConverter() {
  const id = useId();
  const [gregorian, setGregorian] = useState("");
  const [hDay, setHDay] = useState(1);
  const [hMonth, setHMonth] = useState(9);
  const [hYear, setHYear] = useState(1448);

  // "Bugün" yalnız tarayıcıda bilinir; sunucu çıktısıyla çakışmasın diye ilk açılışta doldurulur.
  useEffect(() => {
    const today = todayIso();
    setGregorian(today);
    const h = toHijri(new Date(`${today}T12:00:00Z`), "UTC");
    setHYear(h.year);
    setHMonth(h.month);
  }, []);

  const gDate = /^\d{4}-\d{2}-\d{2}$/.test(gregorian) ? new Date(`${gregorian}T12:00:00Z`) : null;
  const gYear = gDate?.getUTCFullYear() ?? 0;
  const gInRange = gYear >= 1883 && gYear <= 2076;
  const gResult = gDate && gInRange ? toHijri(gDate, "UTC") : null;

  const yearOk = hYear >= HIJRI_MIN_YEAR && hYear <= HIJRI_MAX_YEAR;
  const monthLength = yearOk ? hijriMonthLength(hYear, hMonth) : 30;
  const hResult = yearOk ? fromHijri(hYear, hMonth, hDay) : null;

  return (
    <section
      aria-labelledby={`${id}-baslik`}
      className="mt-12 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <p className="text-sm font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Araç</p>
      <h2 id={`${id}-baslik`} className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        Hicri ↔ Miladi tarih çevirici
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Ümmülkurâ takvimine göre. Hicri {HIJRI_MIN_YEAR}-{HIJRI_MAX_YEAR} (Miladi 1882-2077) yılları arasında çalışır.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <h3 className="text-lg font-semibold">Miladi → Hicri</h3>
          <label htmlFor={`${id}-miladi`} className={`mt-4 block ${label}`}>
            Miladi tarih
          </label>
          <input
            id={`${id}-miladi`}
            type="date"
            min="1883-01-01"
            max="2076-12-31"
            value={gregorian}
            onChange={(e) => setGregorian(e.target.value)}
            className={`mt-1 ${field}`}
          />
          {gResult && gDate ? (
            <Result
              main={`${gResult.day} ${gResult.monthName} ${gResult.year}`}
              sub={`${WEEKDAY.format(gDate)}. Bu Hicri gün, bir önceki akşam gün batımında başlar.`}
            />
          ) : (
            gregorian && <Result main="Aralık dışında" sub="1883 ile 2076 arasında bir tarih seçin." />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">Hicri → Miladi</h3>
          <div className="mt-4 grid grid-cols-[5rem_1fr] gap-2">
            <div>
              <label htmlFor={`${id}-gun`} className={label}>
                Gün
              </label>
              <select
                id={`${id}-gun`}
                value={hDay}
                onChange={(e) => setHDay(Number(e.target.value))}
                className={`mt-1 ${field}`}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-ay`} className={label}>
                Ay
              </label>
              <select
                id={`${id}-ay`}
                value={hMonth}
                onChange={(e) => setHMonth(Number(e.target.value))}
                className={`mt-1 ${field}`}
              >
                {HIJRI_MONTHS.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor={`${id}-yil`} className={label}>
                Yıl
              </label>
              <input
                id={`${id}-yil`}
                type="number"
                inputMode="numeric"
                min={HIJRI_MIN_YEAR}
                max={HIJRI_MAX_YEAR}
                value={hYear || ""}
                onChange={(e) => setHYear(Number(e.target.value))}
                className={`mt-1 ${field}`}
              />
            </div>
          </div>
          {!yearOk ? (
            <Result main="Aralık dışında" sub={`Hicri yıl ${HIJRI_MIN_YEAR} ile ${HIJRI_MAX_YEAR} arasında olmalı.`} />
          ) : hResult ? (
            <Result
              main={LONG.format(hResult)}
              sub={`${WEEKDAY.format(hResult)}. ${HIJRI_MONTHS[hMonth - 1]} ${hYear}, ${monthLength} gün çekiyor.`}
            />
          ) : (
            <Result
              main="Bu tarih yok"
              sub={`${HIJRI_MONTHS[hMonth - 1]} ${hYear} ${monthLength} gün çekiyor; 30. gün bir sonraki ayın ilk günüdür.`}
            />
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
        Ümmülkurâ, Diyanet&apos;in 2027 dinî günleriyle aynı sonucu veriyor; yine de ay başlarında bir gün fark
        olabilir. Ramazan, bayram ve kandil tarihleri için Diyanet takvimine bakın.
      </p>
    </section>
  );
}
