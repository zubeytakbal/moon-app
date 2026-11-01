import type { ReactNode } from "react";
import { InlineToc } from "./InlineToc";

/**
 * Sayfa içi bilgi sunuşu, timeanddate düzeninde (1 Kasım 2026, kullanıcı kararı: sitenin görünümü aynı kalır,
 * yalnız içerik alanındaki bilgi timeanddate gibi sunulur):
 * - `AnswerBox`: sayfanın sorusunun cevabı en üstte, büyük ve düz bir cümleyle; altında "Etiket: Değer" satırları.
 * - `FactTable`: "Bilgi | Değer | Açıklama" tablosu.
 * - `DataTable`: sütun başlıklı, zebra satırlı veri tablosu; vurgulanan satır (sıradaki) belirgin.
 * Renkle anlatılan her şeyin yanında kelime de yazar (60 yaşındaki biri de anlamalı).
 */

export interface AnswerRow {
  label: ReactNode;
  value: ReactNode;
}

/** "Kısaca" kutusunun yerini alır: soru, büyük cevap ve kısa bilgi satırları. Altında dar ekranda içindekiler durur. */
export function AnswerBox({
  question,
  answer,
  rows,
  note,
}: {
  question: string;
  answer: ReactNode;
  rows: AnswerRow[];
  note?: ReactNode;
}) {
  return (
    <>
      <section
        aria-labelledby="cevap"
        className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="border-b border-zinc-200 px-5 py-4 sm:px-6 dark:border-zinc-800">
          {/* Her sayfada aynı işi gördüğü için içindekilere alınmaz. */}
          <h2 id="cevap" data-toc-skip className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {question}
          </h2>
          <p className="mt-1 text-xl font-semibold leading-snug text-zinc-950 sm:text-2xl dark:text-white">{answer}</p>
        </div>
        <table className="w-full text-left text-[0.9375rem]">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <th scope="row" className="w-[42%] px-5 py-2.5 align-top font-medium text-zinc-600 sm:px-6 dark:text-zinc-400">
                  {r.label}
                </th>
                <td className="px-5 py-2.5 align-top text-zinc-900 sm:px-6 dark:text-zinc-100">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {note && (
          <p className="border-t border-zinc-200 px-5 py-3 text-sm text-zinc-500 sm:px-6 dark:border-zinc-800">{note}</p>
        )}
      </section>
      <InlineToc />
    </>
  );
}

const TABLE_WRAP = "mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800";
const TABLE = "w-full min-w-[32rem] text-left text-[0.9375rem]";
const TH = "bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
const TD = "px-4 py-2.5 align-top";

/** "Bilgi | Değer | Açıklama" tablosu (timeanddate "Quick Facts"). */
export function FactTable({ rows, caption }: { rows: { label: string; value: ReactNode; comment: ReactNode }[]; caption?: ReactNode }) {
  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        {caption && <caption className="px-4 pt-3 text-left text-sm text-zinc-500">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col" className={TH}>Bilgi</th>
            <th scope="col" className={TH}>Değer</th>
            <th scope="col" className={TH}>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-zinc-200 even:bg-zinc-50 dark:border-zinc-800 dark:even:bg-zinc-900">
              <th scope="row" className={`${TD} font-medium text-zinc-900 dark:text-white`}>{r.label}</th>
              <td className={`${TD} whitespace-nowrap font-semibold tabular-nums text-zinc-900 dark:text-white`}>{r.value}</td>
              <td className={`${TD} text-zinc-600 dark:text-zinc-400`}>{r.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sütun başlıklı veri tablosu. `highlight` satırı vurgulanır ve başına `highlightLabel` yazılır. */
export function DataTable({
  columns,
  rows,
  highlight,
  dim,
}: {
  columns: string[];
  rows: { key: string; cells: ReactNode[] }[];
  /** Vurgulanacak satırın anahtarı (ör. sıradaki tutulma). */
  highlight?: string;
  /** Soluk gösterilecek satırlar (ör. geçmişte kalanlar). */
  dim?: (key: string) => boolean;
}) {
  return (
    <div className={TABLE_WRAP}>
      <table className={TABLE}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className={TH}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.key}
              className={`border-t border-zinc-200 dark:border-zinc-800 ${
                r.key === highlight
                  ? "bg-indigo-50 dark:bg-indigo-950/40"
                  : "even:bg-zinc-50 dark:even:bg-zinc-900"
              } ${dim?.(r.key) ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"}`}
            >
              {r.cells.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className={`${TD} font-medium`}>{c}</th>
                ) : (
                  <td key={i} className={TD}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
