/**
 * Sitenin kaynakları: yalnız resmî ve birincil kaynaklar (NASA, USNO, IMO, Diyanet, TÜBİTAK, hakemli yayın).
 * Haber siteleri kaynak gösterilmez. Her bağlantı açılıp içeriği okunarak doğrulanır; yeni kaynak da öyle eklenir.
 * Sayfalarda metin içi [1] işaretiyle (`components/Sources.tsx`), Kaynaklar sayfasında topluca gösterilir.
 *
 * Numara kuralı (kullanıcı kararı, 1 Kasım 2026; Feriatlas'la aynı): her kaynağın sitenin bütününde tek ve kalıcı
 * bir numarası (`no`) vardır; NASA ay tutulması kataloğu her sayfada [1]'dir. Yeni kaynak en büyük numara + 1'i
 * alır; verilmiş numara değişmez, kaldırılan kaynağın numarası başkasına verilmez.
 */
export interface Source {
  /** Sitedeki kalıcı numarası: her sayfada ve Kaynaklar sayfasında aynı. */
  no: number;
  /** Kaynağın adı. */
  title: string;
  /** Yayımlayan kurum ya da yazar. */
  publisher: string;
  url: string;
  /** Bu kaynaktan hangi bilgiyi aldığımız (Kaynaklar sayfasında yazar). */
  note: string;
  group: SourceGroup;
}

export type SourceGroup = "tutulma" | "ay" | "takvim" | "gelenek";

export const SOURCE_GROUP_NAMES: Record<SourceGroup, string> = {
  tutulma: "Tutulmalar",
  ay: "Ay ve gökyüzü",
  takvim: "Takvim ve dinî günler",
  gelenek: "Gelenek ve astroloji",
};

export const SOURCES = {
  nasaLunarCatalog: {
    no: 1,
    title: "Five Millennium Catalog of Lunar Eclipses: 2001 to 2100",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/LEcat5/LE2001-2100.html",
    note: "Ay tutulmalarının tarihleri, türleri (tam, parçalı, yarı gölge) ve büyüklükleri; örneğin 2027'deki üç tutulmanın da yarı gölge tutulması olduğu, 18 Temmuz 2027'nin büyüklüğünün yalnız 0,0014 olduğu. Saatlerimizi bu katalogla karşılaştırıyoruz.",
    group: "tutulma",
  },
  nasaEclipseTypes: {
    no: 2,
    title: "Eclipse Types",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/eclipses/types/",
    note: "Ay tutulmasında Dünya'nın gölgesinin aya düşmesi ve ayın birkaç saat içinde kızıla dönmesi.",
    group: "tutulma",
  },
  nasaDanjon: {
    no: 3,
    title: "Danjon Scale of Lunar Eclipse Brightness",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/OH/Danjon.html",
    note: "Danjon ölçeğinin beş basamağı (L0-L4); atmosferin Güneş ışığını gölgeye kırması; büyük yanardağ patlamalarından sonra tutulmaların birkaç yıl çok karanlık geçmesi.",
    group: "tutulma",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

// Numaralar tekil olmalı: aynı numara iki kaynağa verilirse derleme anında hata verir.
{
  const seen = new Set<number>();
  for (const [id, s] of Object.entries(SOURCES) as [string, Source][]) {
    if (seen.has(s.no)) throw new Error(`Kaynak numarası tekrar ediyor: ${s.no} (${id})`);
    seen.add(s.no);
  }
}
