import { siteConfig } from "@/site.config";

/** Lunatlas amblemi: gerçek ay fotoğrafından "Dünya ışığı" hilali (stil `globals.css` içinde `.emblem`). */
export function Emblem({ size, glow = false }: { size: number; glow?: boolean }) {
  return (
    <span aria-hidden="true" className={`emblem block ${glow ? "emblem-glow" : ""}`} style={{ width: size, height: size }} />
  );
}

/** Amblem ve geniş aralıklı ad; altında kısa açıklama. Üst menünün ortasında kullanılır. */
export function BrandLockup() {
  return (
    <span className="flex items-center gap-2.5 sm:gap-3">
      <span className="sm:hidden">
        <Emblem size={30} glow />
      </span>
      <span className="hidden sm:block">
        <Emblem size={40} glow />
      </span>
      <span className="flex flex-col items-center" style={{ fontFamily: "var(--font-brand)" }}>
        <span className="pl-[0.38em] text-[1.0625rem] font-light leading-none tracking-[0.38em] sm:text-[1.3125rem]">
          {siteConfig.name.toLocaleUpperCase("tr-TR")}
        </span>
        <span className="mt-1.5 hidden pl-[0.5em] text-[0.625rem] leading-none tracking-[0.5em] text-indigo-200/80 sm:block">
          {siteConfig.tagline.toLocaleUpperCase("tr-TR")}
        </span>
      </span>
    </span>
  );
}
