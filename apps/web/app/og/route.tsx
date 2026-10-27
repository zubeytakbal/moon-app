import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { ALL_PAGES, GROUP_NAMES, HOME_PATH } from "@/lib/pages";
import { siteConfig } from "@/site.config";

/**
 * Sayfaların paylaşım görseli (Open Graph, 1200x630). `?p=/tr/dolunay` gibi sayfa yolunu alır;
 * başlık ve açıklama `lib/pages.ts` sayfa listesinden gelir.
 */
const root = process.cwd();
const [regular, bold, moon] = await Promise.all([
  readFile(join(root, "assets/fonts/Geist-Regular.ttf")),
  readFile(join(root, "assets/fonts/Geist-Bold.ttf")),
  readFile(join(root, "public/moon/full-moon-og.jpg")),
]);
const moonSrc = `data:image/jpeg;base64,${moon.toString("base64")}`;

export function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("p") ?? HOME_PATH;
  const page = ALL_PAGES.find((p) => p.path === path);
  const eyebrow = page ? GROUP_NAMES[page.group] : "Ay rehberi";
  const title = page?.title ?? "Gökyüzündeki ay, bugün ve her gün";
  const description =
    page?.description ??
    "Ayın evresi, doğuş ve batış saatleri, dolunay tarihleri. Türkiye saatine göre, astronomik hesaplarla.";

  return new ImageResponse(
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
}
