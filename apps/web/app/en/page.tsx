import type { Metadata } from "next";
import { MoonPhaseIcon } from "@/components/MoonPhaseIcon";

/**
 * TASLAK: İngilizce iskeleti (menü, alt bilgi, dil seçici) denemek için geçici ana sayfa. İngilizce yayına
 * açılmadan önce gerçek ana sayfayla değiştirilmeli (kırmızı çizgi 6: yarım sayfa yayına çıkmaz). Dil
 * `published: false` olduğu sürece `noindex`'tir ve dil seçicide görünmez.
 */
export const metadata: Metadata = {
  title: "Lunatlas: Moon guide",
};

export default function EnglishHome() {
  return (
    <main className="starfield bg-[#05070d] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center">
        <MoonPhaseIcon phaseAngle={120} size={200} glow title="Moon" />
        <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-6xl">Lunatlas</h1>
        <p className="mt-4 max-w-lg text-lg text-zinc-300">English edition in preparation.</p>
      </div>
    </main>
  );
}
