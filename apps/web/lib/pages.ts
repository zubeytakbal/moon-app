/**
 * Sitedeki sayfaların elle tutulan listesi. Menü, alt bilgi, breadcrumb ve ileride
 * sitemap buradan okunur. Kural: sayfa ancak içeriği tamamlanınca buraya eklenir
 * (bkz. CLAUDE.md, kırmızı çizgiler). Hiçbir sayfa döngüyle üretilmez.
 */

export type PageGroup = "araclar" | "evreler" | "tarihler" | "hicri-gelenek" | "burclar" | "bilgi" | "kurumsal";

export const GROUP_NAMES: Record<PageGroup, string> = {
  araclar: "Araçlar",
  evreler: "Ay Evreleri",
  tarihler: "Tarihler",
  "hicri-gelenek": "Hicri ve Gelenek",
  burclar: "Ay ve Burçlar",
  bilgi: "Bilgi",
  kurumsal: "Kurumsal",
};

export interface SitePage {
  path: string;
  /** Breadcrumb'da ve kartlarda görünen ad. */
  title: string;
  /** Üst menüdeki kısa ad. */
  navLabel: string;
  group: PageGroup;
  /** Ana sayfadaki kartta görünen tek cümlelik açıklama. */
  description: string;
  /** Kart görselindeki ayın evre açısı (0 yeni ay, 180 dolunay). */
  cardPhaseAngle: number;
  /** Üst menüde gösterilsin mi? */
  inHeader?: boolean;
  /** Ana sayfadaki "Keşfet" kartlarında gösterilsin mi? */
  featured?: boolean;
}

/** Türkçe ana sayfa. Sayfa listesinin dışında tutulur, çünkü breadcrumb'ın kökü odur. */
export const HOME_PATH = "/tr";

export const PAGES = {
  bugunAy: {
    path: "/tr/bugun-ay",
    title: "Bugün Ay Nasıl?",
    navLabel: "Bugün Ay",
    group: "araclar",
    inHeader: true,
    featured: true,
    description: "Ayın bugünkü evresi, aydınlık oranı ve 81 il için doğuş-batış saatleri.",
    cardPhaseAngle: 120,
  },
  ayTakvimi: {
    path: "/tr/ay-takvimi",
    title: "Ay Takvimi",
    navLabel: "Ay Takvimi",
    group: "araclar",
    inHeader: true,
    featured: true,
    description: "Aylık ay takvimi: her günün ay evresi ve aydınlık oranı, dolunay ve yeni ay saatleri.",
    cardPhaseAngle: 300,
  },
  dogdugumGun: {
    path: "/tr/dogdugum-gun-ay",
    title: "Doğduğum Gün Ay Nasıldı?",
    navLabel: "Doğduğum Gün Ay",
    group: "araclar",
    inHeader: true,
    featured: true,
    description: "Doğum tarihinizi girin: o gün ay hangi evredeydi, ne kadar aydınlıktı, kaç günlüktü?",
    cardPhaseAngle: 160,
  },
  ayEvreleri: {
    path: "/tr/ay-evreleri",
    title: "Ay Evreleri Nedir?",
    navLabel: "Ay Evreleri",
    group: "evreler",
    inHeader: true,
    featured: true,
    description: "Ay neden şekil değiştirir? Yeni aydan dolunaya 8 evrenin adı, sırası ve anlamı.",
    cardPhaseAngle: 90,
  },
  dolunay2027: {
    path: "/tr/2027-dolunay-tarihleri",
    title: "2027 Dolunay Tarihleri",
    navLabel: "2027 Dolunay Tarihleri",
    group: "tarihler",
    inHeader: true,
    featured: true,
    description: "2027'nin 12 dolunayı saatleriyle: süper ay, mikro ay, tutulmalar ve geleneksel adları.",
    cardPhaseAngle: 180,
  },
  yeniAy20262027: {
    path: "/tr/2026-2027-yeniay-tarihleri",
    title: "2026-2027 Yeni Ay Tarihleri",
    navLabel: "2026-2027 Yeni Ay Tarihleri",
    group: "tarihler",
    inHeader: true,
    description:
      "2026 ve 2027'nin yeni ayları saatleriyle; güneş tutulmaları ve 2 Ağustos 2027 tutulmasının Türkiye'den görünüşü.",
    cardPhaseAngle: 0,
  },
  superAy: {
    path: "/tr/super-ay",
    title: "Süper Ay Nedir?",
    navLabel: "Süper Ay",
    group: "tarihler",
    inHeader: true,
    description: "Süper ay ne kadar büyük görünür, neden tek bir tanımı yok? 2026-2030 süper ay tarihleri.",
    cardPhaseAngle: 180,
  },
  ayTutulmalari: {
    path: "/tr/ay-tutulmalari",
    title: "Ay Tutulmaları",
    navLabel: "Ay Tutulmaları",
    group: "tarihler",
    inHeader: true,
    featured: true,
    description: "2026-2029 ay tutulmaları: saatleri, evreleri ve Türkiye'den görülüp görülmeyeceği.",
    cardPhaseAngle: 180,
  },
  dolunayIsimleri: {
    path: "/tr/dolunay-isimleri",
    title: "Dolunay İsimleri",
    navLabel: "Dolunay İsimleri",
    group: "tarihler",
    inHeader: true,
    description: "Kurt Ayı, Çilek Ayı, Hasat Ayı... Dolunay isimlerinin anlamı, kökeni ve bir sonraki tarihleri.",
    cardPhaseAngle: 180,
  },
  hicriTakvim: {
    path: "/tr/hicri-takvim",
    title: "Hicri Takvim ve Ay Başları",
    navLabel: "Hicri Takvim",
    group: "hicri-gelenek",
    inHeader: true,
    featured: true,
    description: "Hicri takvim nasıl işler, aylar ne zaman başlar? Önümüzdeki Hicri ay başlarının astronomik tahmini.",
    cardPhaseAngle: 35,
  },
  hilalGozlemi: {
    path: "/tr/hilal-gozlemi",
    title: "Hilal Gözlemi Nasıl Yapılır?",
    navLabel: "Hilal Gözlemi",
    group: "hicri-gelenek",
    inHeader: true,
    description:
      "Yeni hilali ne zaman, nereye bakarak görebilirsiniz? İlinize göre önümüzdeki akşamların hilal koşulları.",
    cardPhaseAngle: 25,
  },
  ayHangiBurcta: {
    path: "/tr/bugun-ay-hangi-burcta",
    title: "Bugün Ay Hangi Burçta?",
    navLabel: "Bugün Ay Hangi Burçta?",
    group: "burclar",
    inHeader: true,
    featured: true,
    description:
      "Ay şu an hangi burçta, ne zaman burç değiştirecek? Önümüzdeki günlerin ay burçları, Türkiye saatiyle.",
    cardPhaseAngle: 60,
  },
  ayBurcu: {
    path: "/tr/ay-burcu-hesaplama",
    title: "Ay Burcu Hesaplama",
    navLabel: "Ay Burcu Hesaplama",
    group: "burclar",
    inHeader: true,
    featured: true,
    description: "Doğum tarihinizi ve saatinizi girin, doğduğunuz anda ayın hangi burçta olduğunu öğrenin.",
    cardPhaseAngle: 120,
  },
  kanliAy: {
    path: "/tr/kanli-ay",
    title: "Kanlı Ay",
    navLabel: "Kanlı Ay",
    group: "tarihler",
    inHeader: true,
    featured: true,
    description: "Bir sonraki kanlı ay ne zaman, Türkiye'den görülecek mi? Ay tutulmada neden kırmızıya döner?",
    cardPhaseAngle: 180,
  },
  yeniAy: {
    path: "/tr/yeni-ay",
    title: "Yeni Ay",
    navLabel: "Yeni Ay",
    group: "evreler",
    description: "Yeni ay neden görünmez, Hicri ayın başlangıcından farkı ne? Önümüzdeki yeni ay tarihleri.",
    cardPhaseAngle: 0,
  },
  hilal: {
    path: "/tr/hilal",
    title: "Hilal",
    navLabel: "Hilal",
    group: "evreler",
    description: "Büyüyen ve küçülen hilal, ne zaman ve nerede görülür? Ayın karanlık kısmındaki soluk ışık.",
    cardPhaseAngle: 40,
  },
  ilkDordun: {
    path: "/tr/ilk-dordun",
    title: "İlk Dördün",
    navLabel: "İlk Dördün",
    group: "evreler",
    description: "Yarım aya neden dördün denir? Gündüz görülen ay ve kraterleri izlemenin en iyi zamanı.",
    cardPhaseAngle: 90,
  },
  buyuyenSiskinAy: {
    path: "/tr/buyuyen-siskin-ay",
    title: "Büyüyen Şişkin Ay",
    navLabel: "Büyüyen Şişkin Ay",
    group: "evreler",
    description: "Dolunaydan nasıl ayırt edilir? Ay dolunaya yaklaştıkça neden hızla parlaklaşır?",
    cardPhaseAngle: 135,
  },
  dolunay: {
    path: "/tr/dolunay",
    title: "Dolunay",
    navLabel: "Dolunay",
    group: "evreler",
    featured: true,
    description: "Bir sonraki dolunay ne zaman? Dolunay neden kışın yüksekte, ufukta neden büyük görünür?",
    cardPhaseAngle: 180,
  },
  kuculenSiskinAy: {
    path: "/tr/kuculen-siskin-ay",
    title: "Küçülen Şişkin Ay",
    navLabel: "Küçülen Şişkin Ay",
    group: "evreler",
    description: "Dolunaydan sonraki günler: ay neden gece geç doğar, sabah gökyüzünde görülür?",
    cardPhaseAngle: 225,
  },
  sonDordun: {
    path: "/tr/son-dordun",
    title: "Son Dördün",
    navLabel: "Son Dördün",
    group: "evreler",
    description: "Gece yarısı doğan yarım ay: sabah gökyüzünde görülür, sol yarısı aydınlıktır.",
    cardPhaseAngle: 270,
  },
} as const satisfies Record<string, SitePage>;

export const ALL_PAGES: SitePage[] = Object.values(PAGES);

/** Sayfaları gruplarına göre, GROUP_NAMES sırasıyla döner. Boş gruplar atlanır. */
export function pagesByGroup(): { group: PageGroup; name: string; pages: SitePage[] }[] {
  return (Object.keys(GROUP_NAMES) as PageGroup[])
    .map((group) => ({ group, name: GROUP_NAMES[group], pages: ALL_PAGES.filter((p) => p.group === group) }))
    .filter((g) => g.pages.length > 0);
}
