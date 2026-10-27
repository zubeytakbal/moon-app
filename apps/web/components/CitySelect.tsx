"use client";

import Form from "next/form";

interface CitySelectProps {
  /** Formun gönderileceği sayfa, örn. "/tr/bugun-ay". */
  action: string;
  options: { slug: string; name: string }[];
  selected: string;
}

/**
 * İl seçici. Seçim yeni bir sayfa açmaz, aynı sayfaya `?il=...` ile döner.
 * JavaScript kapalıysa "Göster" butonuyla yine çalışır.
 */
export function CitySelect({ action, options, selected }: CitySelectProps) {
  return (
    <Form action={action} replace scroll={false} className="flex items-center gap-2">
      <label htmlFor="il" className="text-sm text-zinc-600 dark:text-zinc-400">
        İl
      </label>
      <select
        id="il"
        name="il"
        key={selected}
        defaultValue={selected}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
      >
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="rounded-lg border px-3 py-2">
          Göster
        </button>
      </noscript>
    </Form>
  );
}
