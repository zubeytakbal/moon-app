import Image from "next/image";
import type { SiteImage } from "@/lib/images";

/** Künye satırı: kim çekti, kaynağa bağlantı. */
function Credit({ image }: { image: SiteImage }) {
  return (
    <a href={image.sourceUrl} target="_blank" rel="noopener" className="whitespace-nowrap underline-offset-2 hover:underline">
      Görsel: {image.credit}
    </a>
  );
}

/**
 * Metin içinde, açıklama ve künyeyle gösterilen fotoğraf. Birden fazla görsel verilirse yan yana dizilir
 * (telefonda alt alta). `Prose` içinde de doğru görünür.
 */
export function NasaFigure({ images, className = "" }: { images: SiteImage[]; className?: string }) {
  const many = images.length > 1;
  return (
    <figure className={`mt-8 ${className}`}>
      <div className={many ? "grid gap-3 sm:grid-cols-2" : ""}>
        {images.map((image) => (
          <div key={image.src} className="overflow-hidden rounded-2xl bg-[#05070d] shadow-sm">
            <Image
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              sizes={many ? "(min-width: 640px) 384px, 100vw" : "(min-width: 768px) 768px, 100vw"}
              className="h-auto w-full"
            />
          </div>
        ))}
      </div>
      <figcaption className="mt-3 space-y-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {images.map((image) => (
          <span key={image.src} className="block">
            {image.caption} <span className="text-zinc-500">· </span>
            <span className="text-zinc-500">
              <Credit image={image} />
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Koyu giriş alanlarında arka plan fotoğrafı için künye (sağ alt köşe). */
export function HeroCredit({ image }: { image: SiteImage }) {
  return (
    <p className="absolute bottom-2 right-3 z-10 text-xs text-zinc-400/80">
      <Credit image={image} />
    </p>
  );
}
