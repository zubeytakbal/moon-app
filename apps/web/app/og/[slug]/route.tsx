import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { ogSlug } from "@/lib/og";
import { ALL_PAGES, GROUP_NAMES, HOME_PATH } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/**
 * Sayfaların paylaşım görseli (Open Graph, 1200x630), örn. `/og/tr_dolunay`. Başlık ve açıklama
 * `lib/pages.ts` sayfa listesinden gelir. Görseller derleme sırasında bir kez üretilir ve sabit dosya
 * olarak sunulur; bu yüzden yazı tipleri diskten yalnızca derlemede okunur (Cloudflare'de disk yok).
 */
export function generateStaticParams() {
  return [HOME_PATH, ...ALL_PAGES.map((p) => p.path)].map((path) => ({ slug: ogSlug(path) }));
}

export async function GET(_request: Request, { params }: RouteContext<"/og/[slug]">) {
  const { slug } = await params;
  // Listede olmayan adresler için görsel üretilmez (çalışırken disk okunamaz).
  if (slug !== ogSlug(HOME_PATH) && !ALL_PAGES.some((p) => ogSlug(p.path) === slug)) {
    return new Response("Bulunamadı", { status: 404 });
  }
  return new Response(await renderImage(slug), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}

/** Görseli üretir. Sonuç kalıcı önbelleğe alınır; derlemede bir kez çalışır, Cloudflare'de diske gerek kalmaz. */
async function renderImage(slug: string): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("max");

  const root = process.cwd();
  const [regular, bold, moon] = await Promise.all([
    readFile(join(root, "assets/fonts/Geist-Regular.ttf")),
    readFile(join(root, "assets/fonts/Geist-Bold.ttf")),
    readFile(join(root, "public/moon/full-moon-og.jpg")),
  ]);
  const moonSrc = `data:image/jpeg;base64,${moon.toString("base64")}`;
  const page = ALL_PAGES.find((p) => ogSlug(p.path) === slug);
  const eyebrow = page ? GROUP_NAMES[page.group] : "Ay rehberi";
  const title = page?.title ?? "Gökyüzündeki ay, bugün ve her gün";
  const description =
    page?.description ??
    "Ayın evresi, doğuş ve batış saatleri, dolunay tarihleri. Türkiye saatine göre, astronomik hesaplarla.";

  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#05070d",
        color: "white",
        fontFamily: "Geist",
        position: "relative",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={moonSrc}
        width={620}
        height={620}
        alt=""
        style={{ position: "absolute", right: -90, top: 5, opacity: 0.95 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "linear-gradient(90deg, #05070d 0%, #05070d 45%, rgba(5,7,13,0.2) 100%)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: 760, position: "relative" }}>
        {/* Görsel üretici büyük harfe çevirirken Türkçe kuralı (i → İ) uygulamaz; bu yüzden metin burada çevrilir. */}
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#a5b4fc" }}>{eyebrow.toLocaleUpperCase("tr-TR")}</div>
        <div style={{ marginTop: 22, fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        <div style={{ marginTop: 26, fontSize: 30, lineHeight: 1.35, color: "#d4d4d8" }}>{description}</div>
        <div style={{ marginTop: "auto", fontSize: 28, fontWeight: 700, color: "#e4e4e7" }}>{siteConfig.name}</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: regular, style: "normal", weight: 400 },
        { name: "Geist", data: bold, style: "normal", weight: 700 },
      ],
    },
  );
  return new Uint8Array(await image.arrayBuffer());
}
