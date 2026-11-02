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

export type SourceGroup = "tutulma" | "ay" | "uzay" | "takvim" | "gelenek" | "yer";

export const SOURCE_GROUP_NAMES: Record<SourceGroup, string> = {
  tutulma: "Tutulmalar",
  ay: "Ay ve gökyüzü",
  uzay: "Uzay görevleri",
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
    note: "Ayın temel sayıları: evre döngüsü (sinodik dönem) 29,53 gün, yörünge dönemi 27,32 gün, ortalama uzaklık 384.400 km, yakınberi 363.300 km ve uzakberi 405.500 km (ortalama), yörünge eğikliği 5,145°, Dünya'dan uzaklaşma hızı yılda 3,8 cm.",
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
  almanacFullMoonNames: {
    no: 17,
    title: "Full Moon Names",
    publisher: "The Old Farmer's Almanac (1792'den beri yayımlanan Kuzey Amerika çiftçi almanağı)",
    url: "https://www.almanac.com/full-moon-names",
    note: "Dolunayların geleneksel adları ve anlamları; adların Kuzey Amerika yerli halkları, sömürge dönemi Amerikası ve diğer Kuzey Amerika geleneklerinden derlenmesi.",
    group: "gelenek",
  },
  iauConstellations: {
    no: 18,
    title: "The Constellations",
    publisher: "Uluslararası Astronomi Birliği (IAU)",
    url: "https://www.iau.org/IAU/IAU/Astronomy-FAQs/Constellations.aspx",
    note: "Gökyüzünün 88 resmî takımyıldıza bölünmesi (1922); takımyıldız sınırlarının Eugène Delporte tarafından sağ açıklık ve dik açıklık çizgileri boyunca çizilmesi, 1928'de onaylanıp 1930'da yayımlanması.",
    group: "ay",
  },
  nasaConstellations: {
    no: 19,
    title: "What Are Constellations?",
    publisher: "NASA Space Place",
    url: "https://spaceplace.nasa.gov/starfinder2/en/",
    note: "Astrolojinin astronomiyle aynı şey olmadığı; astronominin kanıt ve veriye dayanan bir bilim olduğu, astrolojinin iddialarının ise bilimsel kanıta dayanmadığı.",
    group: "gelenek",
  },
  imoCalendar2026: {
    no: 20,
    title: "Meteor Shower Calendar 2026",
    publisher: "Uluslararası Meteor Örgütü (IMO), Jürgen Rendtel",
    url: "https://www.imo.net/files/meteor-shower/cal2026.pdf",
    note: "Meteor yağmurlarının etkinlik dönemleri, doruk anlarının Güneş boylamı, radyant konumları, hızları, nüfus indeksleri ve saatlik zenit sayıları (Tablo 5); ZHR'nin tanımı (radyant tepedeyken, +6,5 kadirlik kusursuz gökyüzünde bir gözlemcinin saatte göreceği meteor sayısı).",
    group: "ay",
  },
  imoCalendar2027: {
    no: 21,
    title: "Meteor Shower Calendar 2027",
    publisher: "Uluslararası Meteor Örgütü (IMO)",
    url: "https://www.imo.net/meteor-shower-calendar-2027/",
    note: "2027 meteor yağmuru takvimi; hesapladığımız 2027 doruk saatlerinin karşılaştırıldığı kaynak.",
    group: "ay",
  },
  nasaMeteors: {
    no: 22,
    title: "Meteors and Meteorites",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/solar-system/meteors-meteorites/",
    note: "Meteor yağmurlarının, Dünya bir kuyruklu yıldızın bıraktığı toz şeridinden geçerken her yıl görülmesi; atmosfere giren parçacıkların yanması; Perseidlerin Swift-Tuttle kuyruklu yıldızından gelmesi.",
    group: "ay",
  },
  nasaGeminids: {
    no: 23,
    title: "Geminids",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/solar-system/meteors-meteorites/geminids/",
    note: "İkizler yağmurunun kuyruklu yıldızdan değil, 3200 Phaethon asteroidinden gelmesi; izlemek için şehir ışıklarından uzak bir yer seçilmesi.",
    group: "ay",
  },
  nasaMoonFacts: {
    no: 24,
    title: "Moon Facts",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/moon/facts/",
    note: "Arka yüze \"karanlık yüz\" demenin yanıltıcı olması ve yeni ayda arka yüzün tamamen Güneş alması; ayın kendi ekseni çevresinde Dünya çevresindeki dolanımıyla aynı hızda dönmesi (eş zamanlı dönme); kabuğun ön yüzde yaklaşık 40, arka yüzde 60 kilometreye varan kalınlığı; arka yüzün ilk kez 1959'da görülmesi.",
    group: "ay",
  },
  svsFarSidePhases: {
    no: 25,
    title: "Moon Phase and Libration, from the Other Side",
    publisher: "NASA Bilimsel Görselleştirme Stüdyosu (SVS)",
    url: "https://svs.gsfc.nasa.gov/4253",
    note: "Arka yüzün de ön yüz gibi evrelerden geçmesi; ön yüzdeki büyük karanlık ovaların (ay denizleri) arka yüzde bulunmaması; Güney Kutbu-Aitken havzası; arka yüzün ilk kez Ekim 1959'da Luna 3'ün görüntüleriyle görülmesi.",
    group: "ay",
  },
  nasaApollo11: {
    no: 26,
    title: "Apollo 11 Mission Overview",
    publisher: "NASA",
    url: "https://www.nasa.gov/history/apollo-11-mission-overview/",
    note: "Apollo 11'in 16 Temmuz 1969'da fırlatılması, 19 Temmuz'da ay yörüngesine girmesi ve 20 Temmuz'da inmesi; Armstrong ile Aldrin'in ay yüzeyinde 21 saat 36 dakika kalması, yüzey yürüyüşünün iki buçuk saati aşması.",
    group: "uzay",
  },
  svsLroApollo: {
    no: 27,
    title: "New LRO Images Offer Sharper Views of Apollo 12, 14, and 17 Sites",
    publisher: "NASA Goddard, Bilimsel Görselleştirme Stüdyosu (SVS)",
    url: "https://svs.gsfc.nasa.gov/10818",
    note: "NASA'nın LRO uydusunun Apollo 12, 14 ve 17 iniş yerlerini fotoğraflaması; görüntülerde iniş araçlarının yüzeyde kalan bölümlerinin ve astronotların yürüyüş izlerinin seçilmesi (2011).",
    group: "uzay",
  },
  nasaLunarSamples: {
    no: 28,
    title: "The Lunar Sample Collection",
    publisher: "NASA Johnson Uzay Merkezi, Charles Meyer Jr.",
    url: "https://astromaterials.jsc.nasa.gov/education/_documents/The%20Lunar%20Sample%20Collection.pdf",
    note: "Apollo koleksiyonunun 382 kilogram kayaç ve topraktan oluşması; aya yürüyen 12 astronotun 80 saatlik keşifte 2.196 örnek toplaması; örneklerde canlı, organik molekül ve su bulunmaması.",
    group: "uzay",
  },
  nasaArtemis2: {
    no: 29,
    title: "Artemis II Mission Milestones: An Image and Video Recap",
    publisher: "NASA Johnson Uzay Merkezi",
    url: "https://www.nasa.gov/centers-and-facilities/johnson/artemis-ii-mission-milestones-an-image-and-video-recap/",
    note: "Artemis II'nin 1 Nisan 2026'da fırlatılıp 10 Nisan'da Pasifik Okyanusu'na inmesi; mürettebat (Wiseman, Glover, Koch, Hansen); görevin 6. gününde ayın arka yüzünün arkasından geçilmesi; Apollo 13'ün 1970'teki insanların Dünya'dan en uzak mesafesi rekorunun kırılması.",
    group: "uzay",
  },
  nasaArtemis3: {
    no: 30,
    title: "Artemis III News and Updates",
    publisher: "NASA",
    url: "https://www.nasa.gov/artemis-iii-news-and-updates/",
    note: "Artemis III'ün 2027'de Dünya yörüngesinde, ticari ay iniş araçlarıyla buluşma ve kenetlenme denemesi olarak uçması; ilk Artemis ay inişinin 2028 başı için hedeflenmesi (23 Ekim 2026 güncellemesi).",
    group: "uzay",
  },
  tubitakLunar: {
    no: 31,
    title: "Integration Activities Completed for Türkiye's First Lunar Spacecraft",
    publisher: "TÜBİTAK (6 Ekim 2026)",
    url: "https://tubitak.gov.tr/en/node/19226",
    note: "Türkiye'nin ilk ay aracının üretim, montaj ve entegrasyonunun tamamlanması; yaklaşık 3,5 ton ağırlık; 65 kritik bileşenden 56'sının yerli üretimi; çevresel testler, Kennedy Uzay Merkezi'nden 2027'nin ilk yarısında fırlatma hedefi; yaklaşık iki aylık yolculuktan sonra ayın 100 km üzerindeki kutupsal yörünge; dört bilimsel yük; yerli hibrit roket motoru.",
    group: "uzay",
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
