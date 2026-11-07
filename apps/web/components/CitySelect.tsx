"use client";

import Form from "next/form";

interface CitySelectProps {
  /** Formun gönderileceği sayfa, örn. "/tr/bugun-ay". */
  action: string;
  options: { slug: string; name: string }[];
  selected: string;
  /** Yurt dışı şehirler, ülkeye göre gruplu (yalnız yurt dışını destekleyen sayfalarda). */
  abroad?: { country: string; cities: { slug: string; name: string }[] }[];
  /** Aynı sayfada ikinci bir seçici varsa farklı kimlik verilir (aynı `id` iki kez olamaz). */
  id?: string;
  /** Koyu zemin (giriş alanı kartı) üzerinde. */
  tone?: "light" | "dark";
}

/**
 * İl seçici. Seçim yeni bir sayfa açmaz, aynı sayfaya `?il=...` ile döner.
 * JavaScript kapalıysa "Göster" butonuyla yine çalışır.
 */
export function CitySelect({ action, options, selected, abroad, id = "il", tone = "light" }: CitySelectProps) {
  const dark = tone === "dark";
  return (
    <Form action={action} replace scroll={false} className="flex items-center gap-2">
      <label htmlFor={id} className={`text-sm ${dark ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}`}>
        {abroad ? "İl / şehir" : "İl"}
      </label>
      <select
        id={id}
        name="il"
        key={selected}
        defaultValue={selected}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={
          dark
            ? "rounded-lg border border-white/25 bg-[#0d111c] px-3 py-2 text-base text-white"
            : "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        }
      >
        {abroad ? (
          <>
            <optgroup label="Türkiye">
              {options.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
            {abroad.map((g) => (
              <optgroup key={g.country} label={g.country}>
                {g.cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </>
        ) : (
          options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))
        )}
      </select>
      <noscript>
        <button type="submit" className="rounded-lg border px-3 py-2">
          Göster
        </button>
      </noscript>
    </Form>
  );
}
