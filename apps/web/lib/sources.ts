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

export type SourceGroup = "tutulma" | "ay" | "takvim" | "gelenek" | "yer";

export const SOURCE_GROUP_NAMES: Record<SourceGroup, string> = {
  tutulma: "Tutulmalar",
  ay: "Ay ve gökyüzü",
  takvim: "Takvim ve dinî günler",
  gelenek: "Gelenek ve astroloji",
  yer: "Yer bilimleri",
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
  usnoMoonPhases: {
    no: 4,
    title: "Dates of Primary Phases of the Moon",
    publisher: "ABD Deniz Gözlemevi (USNO), Astronomical Applications Department",
    url: "https://aa.usno.navy.mil/data/MoonPhases",
    note: "Yeni ay, ilk dördün, dolunay ve son dördün anları (dünya saati, 1700-2100). Evre saatlerimizi bu tabloyla karşılaştırıyoruz.",
    group: "ay",
  },
  nasaPhaseCatalog: {
    no: 5,
    title: "Six Millennium Catalog of Phases of the Moon",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/phase/phasecat.html",
    note: "İki yeni ay arasının ortalama 29,530588 gün sürmesi ve tek tek döngülerin, Güneş'in çekimi yüzünden 29,26 ile 29,80 gün arasında değişmesi.",
    group: "ay",
  },
  nasaMoonFactSheet: {
    no: 6,
    title: "Moon Fact Sheet",
    publisher: "NASA Uzay Bilimi Veri Koordineli Arşivi (NSSDCA)",
    url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
    note: "Ayın temel sayıları: evre döngüsü (sinodik dönem) 29,53 gün, yörünge dönemi 27,32 gün, ortalama uzaklık 384.400 km, yörünge eğikliği 5,145°.",
    group: "ay",
  },
  nasaMoonPhases: {
    no: 7,
    title: "Moon Phases",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/moon/moon-phases/",
    note: "Güneş'in ayın her zaman yarısını aydınlatması; evrelerin bu aydınlık yarıyı farklı açılardan görmemizden doğması; sekiz evrenin adları ve döngünün yaklaşık 29,5 gün sürmesi.",
    group: "ay",
  },
  arliss2005: {
    no: 8,
    title: "The effect of the lunar cycle on frequency of births and birth complications",
    publisher: "Arliss, Kaplan ve Galvin; American Journal of Obstetrics and Gynecology, 2005 (PubMed)",
    url: "https://pubmed.ncbi.nlm.nih.gov/15902138/",
    note: "Kuzey Karolina'da 1997-2001 arasındaki 564.039 doğumda, ayın 8 evresi arasında doğum sayısı, doğum şekli ve komplikasyonlar bakımından anlamlı bir fark bulunmaması.",
    group: "ay",
  },
  nasaSaros: {
    no: 9,
    title: "Eclipses and the Saros",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/SEsaros/SEsaros.html",
    note: "Saros döngüsünün yaklaşık 6.585,3 gün (18 yıl 11 gün 8 saat) sürmesi, Keldani (Babil) gökbilimcilerince bilinmesi ve bir Saros arayla gelen tutulmaların birbirine çok benzemesi.",
    group: "tutulma",
  },
  diyanet2027: {
    no: 10,
    title: "2027 Dinî Günler Listesi",
    publisher: "Diyanet İşleri Başkanlığı, Vakit Hesaplama",
    url: "https://vakithesaplama.diyanet.gov.tr/icerik.php?icerik=154",
    note: "2027'nin resmî dinî günleri: 1 Ramazan 1448 = 8 Şubat 2027, Ramazan Bayramı 1. günü (1 Şevval) = 9 Mart 2027 ve diğerleri. Ümmülkurâ takvimiyle karşılaştırdık; Ramazan, bayramlar ve kandiller aynı günlere düşüyor.",
    group: "takvim",
  },
  nasaSolarCatalog: {
    no: 11,
    title: "Five Millennium Catalog of Solar Eclipses: 2001 to 2100",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/SEcat5/SE2001-2100.html",
    note: "Güneş tutulmalarının tarihleri ve türleri: 29 Mart 2006 tam, 2 Ağustos 2027 tam, 1 Haziran 2030 halkalı tutulma. Türkiye'den görünüşlerini kendi hesabımızla buluyoruz.",
    group: "tutulma",
  },
  nasaSolarCatalog1900: {
    no: 12,
    title: "Five Millennium Catalog of Solar Eclipses: 1901 to 2000",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/SEcat5/SE1901-2000.html",
    note: "20. yüzyılın güneş tutulmaları; Türkiye'den görülen 11 Ağustos 1999 tam tutulması.",
    group: "tutulma",
  },
  nasaEclipseSafety: {
    no: 13,
    title: "Eclipse Safety",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/eclipses/safety/",
    note: "Güneş'e yalnızca ISO 12312-2 standardına uygun tutulma gözlüğüyle bakılması, çizik ya da hasarlı gözlüğün atılması, iğne deliği yöntemiyle güvenli izleme.",
    group: "tutulma",
  },
  nasaSupermoons: {
    no: 14,
    title: "Supermoons",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/moon/supermoons/",
    note: "Süper ayın, dolunayın ayın Dünya'ya en yakın noktasına (yakınberi) denk gelmesi olarak tanımlanması; yakınberinin yaklaşık 363.300 km, uzakberinin yaklaşık 405.500 km olması.",
    group: "ay",
  },
  nolleSupermoon: {
    no: 15,
    title: "SuperMoon",
    publisher: "Richard Nolle (astrolog), astropro.com",
    url: "http://www.astropro.com/features/articles/supermoon/",
    note: "\"Süper ay\" teriminin ilk kez 1979'da Nolle tarafından bir astroloji dergisinde kullanılması ve özgün tanımı (ayın yörüngedeki en yakın noktasının %90'ı içinde olması). Yalnız terimin kökeni için kaynak gösteriyoruz.",
    group: "ay",
  },
  usgsMoonSeismicity: {
    no: 16,
    title: "Can the position of the moon or the planets affect seismicity?",
    publisher: "ABD Jeoloji Araştırmaları Kurumu (USGS), sık sorulan sorular",
    url: "https://www.usgs.gov/faqs/can-position-moon-or-planets-affect-seismicity-are-there-more-earthquakes-morningin-eveningat",
    note: "Eski çalışmaların çoğunun ay ile deprem sıklığı arasında anlamlı ilişki bulmaması; bazı yeni çalışmalarda yüksek gelgitlerde sığ bindirme faylarında küçük bir etki görülmesi; buna karşın belirli bir yerde ve yılda deprem olasılığının zaten çok düşük (yüzde birin kesirleri) kalması.",
    group: "yer",
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
