import { CALENDAR_PATH } from "@/lib/ics";
import { siteConfig } from "@/site.config";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="12" cy="15.5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Ay olayları takvimine abonelik kutusu. Takvim uygulaması dosyayı günde bir yeniler;
 * tarihler kullanıcının takviminde kendiliğinden güncel kalır.
 */
export function CalendarSubscribe({
  path = CALENDAR_PATH,
  title = "Ay olaylarını takviminize ekleyin",
  text,
}: {
  path?: string;
  title?: string;
  text?: string;
} = {}) {
  const https = new URL(path, siteConfig.url);
  const webcal = `webcal://${https.host}${https.pathname}`;
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;
  const button =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";

  return (
    <section
      aria-labelledby="takvime-ekle"
      className="starfield mt-12 overflow-hidden rounded-3xl bg-[#0b0f1f] p-6 text-white sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="mt-1 shrink-0 text-indigo-300">
          <CalendarIcon />
        </span>
        <div>
          <h2 id="takvime-ekle" data-toc-skip className="text-xl font-semibold sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 text-zinc-300">
            {text ?? (
              <>
                Dolunay, yeni ay, ay tutulmaları ve Türkiye&apos;den görülecek güneş tutulmaları (görünürlük:{" "}
                {siteConfig.defaultLocation.name}) telefonunuzun takviminde görünsün. Saatler Türkiye saatidir; takvim
                kendiliğinden güncellenir.
              </>
            )}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={google} target="_blank" rel="noopener nofollow" className={`${button} bg-white text-zinc-900 hover:bg-zinc-200`}>
          Google Takvim&apos;e ekle
        </a>
        <a href={webcal} rel="nofollow" className={`${button} border border-white/25 hover:bg-white/10`}>
          iPhone / Mac / Outlook
        </a>
        <a href={path} download rel="nofollow" className={`${button} text-zinc-300 underline-offset-2 hover:underline`}>
          Dosyayı indir (.ics)
        </a>
      </div>
    </section>
  );
}
