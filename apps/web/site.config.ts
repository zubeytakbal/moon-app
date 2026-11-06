import { findProvince, type Province } from "@moon-app/moon";

/**
 * Sitenin marka ve genel ayarları. Site adı, domain vb. sadece buradan okunur.
 * Marka adı kesinleşince tek değişiklik burada yapılır.
 */
export const siteConfig = {
  name: "Lunatlas",
  /** Adın yanında görünen kısa Türkçe açıklama; ad yabancı olduğu için sitenin ne olduğunu söyler. */
  tagline: "Ay rehberi",
  /** Sitenin tam adresi (canonical adresler, site haritası ve paylaşım görselleri buna göre üretilir). */
  url: "https://lunatlas.com",
  /** İletişim adresi. Domain alınınca Gmail'e yönlendirme kurulacak. */
  contactEmail: "iletisim@lunatlas.com",
  /** İçerik sayfalarının imzası ("… tarafından") ve yazar sayfası. İsim yalnız burada yazılır (1 Kasım 2026, kullanıcı kararı). */
  author: { name: "Zübeyt Akbal", initials: "ZA", role: "Kurucu ve Editör" },
  /** Arama motorlarına açık mı? false olursa robots.txt ve noindex tüm taramayı engeller. Yayında: 28 Ekim 2026. */
  allowIndexing: true,
  /** Google Analytics 4 ölçüm kimliği (ayrı "Lunatlas" hesabı). Yalnız çerez izni verilince yüklenir. */
  gaMeasurementId: "G-NWEWD8EVVL",
  /**
   * AdSense yayıncı kimliği. Sayfalara yalnız sahiplik etiketi olarak yazılır (<meta name="google-adsense-account">):
   * kod çalıştırmaz, çerez koymaz, reklam göstermez. Reklam kodu onaydan sonra çerez izniyle birlikte eklenecek.
   */
  adsenseClient: "ca-pub-4103878788447160",
  locale: "tr-TR",
  /**
   * Sitenin dilleri (makine çevirisi yok, bkz. CLAUDE.md). `published: false` olan dil hazırlanıyor demektir:
   * dil seçicide, site haritasında ve hreflang bağlarında görünmez, sayfaları `noindex` olur. Geliştirmede
   * (`npm run dev`) ya da `LUNATLAS_DRAFTS=1` ile başlatılan sunucuda seçicide görünür.
   */
  languages: [
    { code: "tr", label: "Türkçe", home: "/tr", locale: "tr-TR", tagline: "Ay rehberi", published: true },
    { code: "en", label: "English", home: "/en", locale: "en-US", tagline: "Moon guide", published: false },
  ],
  defaultLocation: findProvince("istanbul") as Province,
} as const;
