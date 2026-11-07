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
  /** İngilizce sayfalarda görünen ad, yayımcı ve not (yoksa `title`/`publisher` aynen kullanılır). */
  en?: { title?: string; publisher?: string; note: string };
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
    en: {
      publisher: "Fred Espenak, NASA Goddard Space Flight Center",
      note: "Dates, types (total, partial, penumbral) and magnitudes of every lunar eclipse from 2001 to 2100; all three lunar eclipses of 2027 are penumbral. We compare our times with this catalog.",
    },
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
    en: {
      publisher: "Fred Espenak, NASA Goddard Space Flight Center",
      note: "The five steps of the Danjon scale (L0 to L4) for how dark a total lunar eclipse is; Earth's atmosphere bends sunlight into the shadow; after big volcanic eruptions, eclipses can be very dark for a few years.",
    },
  },
  usnoMoonPhases: {
    no: 4,
    title: "Dates of Primary Phases of the Moon",
    publisher: "ABD Deniz Gözlemevi (USNO), Astronomical Applications Department",
    url: "https://aa.usno.navy.mil/data/MoonPhases",
    note: "Yeni ay, ilk dördün, dolunay ve son dördün anları (dünya saati, 1700-2100). Evre saatlerimizi bu tabloyla karşılaştırıyoruz.",
    group: "ay",
    en: {
      publisher: "U.S. Naval Observatory (USNO), Astronomical Applications Department",
      note: "Times of new moon, first quarter, full moon and last quarter (Universal Time, 1700-2100). We compare our phase times with these tables.",
    },
  },
  nasaPhaseCatalog: {
    no: 5,
    title: "Six Millennium Catalog of Phases of the Moon",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/phase/phasecat.html",
    note: "İki yeni ay arasının ortalama 29,530588 gün sürmesi ve tek tek döngülerin, Güneş'in çekimi yüzünden 29,26 ile 29,80 gün arasında değişmesi.",
    group: "ay",
    en: {
      publisher: "Fred Espenak, NASA Goddard Space Flight Center",
      note: "The time between new moons averages 29.530588 days, while individual cycles vary between about 29.26 and 29.80 days because of the Sun's pull.",
    },
  },
  nasaMoonFactSheet: {
    no: 6,
    title: "Moon Fact Sheet",
    publisher: "NASA Uzay Bilimi Veri Koordineli Arşivi (NSSDCA)",
    url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
    note: "Ayın temel sayıları: evre döngüsü (sinodik dönem) 29,53 gün, yörünge dönemi 27,32 gün, ortalama uzaklık 384.400 km, yakınberi 363.300 km ve uzakberi 405.500 km (ortalama), yörünge eğikliği 5,145°, Dünya'dan uzaklaşma hızı yılda 3,8 cm.",
    group: "ay",
    en: {
      publisher: "NASA Space Science Data Coordinated Archive (NSSDCA)",
      note: "Basic lunar numbers: synodic period (phase cycle) 29.53 days, orbital period 27.32 days, mean distance 384,400 km, average perigee 363,300 km and apogee 405,500 km, orbital inclination 5.145°, recession from Earth 3.8 cm per year.",
    },
  },
  nasaMoonPhases: {
    no: 7,
    title: "Moon Phases",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/moon/moon-phases/",
    note: "Güneş'in ayın her zaman yarısını aydınlatması; evrelerin bu aydınlık yarıyı farklı açılardan görmemizden doğması; sekiz evrenin adları ve döngünün yaklaşık 29,5 gün sürmesi.",
    group: "ay",
    en: {
      publisher: "NASA Science",
      note: "The Sun always lights half of the Moon; the phases come from seeing that lit half from different angles as the Moon orbits Earth; the names of the eight phases and the roughly 29.5-day cycle.",
    },
  },
  arliss2005: {
    no: 8,
    title: "The effect of the lunar cycle on frequency of births and birth complications",
    publisher: "Arliss, Kaplan ve Galvin; American Journal of Obstetrics and Gynecology, 2005 (PubMed)",
    url: "https://pubmed.ncbi.nlm.nih.gov/15902138/",
    note: "Kuzey Karolina'da 1997-2001 arasındaki 564.039 doğumda, ayın 8 evresi arasında doğum sayısı, doğum şekli ve komplikasyonlar bakımından anlamlı bir fark bulunmaması.",
    group: "ay",
    en: {
      publisher: "Arliss, Kaplan and Galvin; American Journal of Obstetrics and Gynecology, 2005 (PubMed)",
      note: "Among 564,039 births in North Carolina from 1997 to 2001, no significant difference across the 8 lunar phases in the number of births, mode of delivery or complications.",
    },
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
  diyanet2026: {
    // 46-48 İngilizce kolunda kullanıldı; numaralar çakışmasın diye 49.
    no: 49,
    title: "2026 Dinî Günler Listesi",
    publisher: "Diyanet İşleri Başkanlığı, Vakit Hesaplama",
    url: "https://vakithesaplama.diyanet.gov.tr/icerik.php?icerik=153",
    note: "2026'nın resmî dinî günleri. Aralık 2026: Üç Ayların başlangıcı ve Regaip Kandili 10 Aralık 2026 Perşembe (1 Recep 1448). Ümmülkurâ takvimiyle karşılaştırdık, aynı gün.",
    group: "takvim",
  },
  nasaSolarCatalog: {
    no: 11,
    title: "Five Millennium Catalog of Solar Eclipses: 2001 to 2100",
    publisher: "Fred Espenak, NASA Goddard Uzay Uçuş Merkezi",
    url: "https://eclipse.gsfc.nasa.gov/SEcat5/SE2001-2100.html",
    note: "Güneş tutulmalarının tarihleri ve türleri: 29 Mart 2006 tam, 2 Ağustos 2027 tam, 1 Haziran 2030 halkalı tutulma. Türkiye'den görünüşlerini kendi hesabımızla buluyoruz.",
    group: "tutulma",
    en: {
      publisher: "Fred Espenak, NASA Goddard Space Flight Center",
      note: "Dates and types of every solar eclipse from 2001 to 2100, including the total eclipse of August 2, 2027. How each one looks from a given city is our own calculation.",
    },
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
    en: {
      note: "Look at the Sun only through eclipse glasses or handheld solar viewers that meet the ISO 12312-2 standard; regular sunglasses, however dark, are not safe; never look through a camera lens, telescope or binoculars without a solar filter attached to the front; it is safe to look without protection only while no part of the Sun is visible during totality, and glasses go back on as soon as the bright Sun reappears; pinhole projection is a safe indirect way to watch.",
    },
  },
  nasaSupermoons: {
    no: 14,
    title: "Supermoons",
    publisher: "NASA Science",
    url: "https://science.nasa.gov/moon/supermoons/",
    note: "Süper ayın, dolunayın ayın Dünya'ya en yakın noktasına (yakınberi) denk gelmesi olarak tanımlanması; yakınberinin yaklaşık 363.300 km, uzakberinin yaklaşık 405.500 km olması.",
    group: "ay",
    en: {
      note: "A supermoon is a full moon when the Moon is at its closest point to Earth; at its closest, the full Moon can appear up to 14 percent bigger and 30 percent brighter than the faintest full moon of the year, at its farthest point.",
    },
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
    en: {
      publisher: "The Old Farmer's Almanac (published since 1792)",
      note: "Traditional full moon names and their meanings, drawn from Native American, Colonial American and other North American traditions.",
    },
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
  eclipsewise2027: {
    no: 32,
    title: "Total Solar Eclipse of 2027 Aug 02",
    publisher: "Fred Espenak, EclipseWise",
    url: "http://www.eclipsewise.com/solar/SEprime/2001-2100/SE2027Aug02Tprime.html",
    note: "2 Ağustos 2027 tutulmasının tam görüleceği ülkeler (Fas, İspanya, Cezayir, Libya, Mısır, Suudi Arabistan, Yemen, Somali), Avrupa'nın geri kalanından parçalı görülmesi, en büyük tutulmanın 10:06 UT'de Mısır'da (25,5° K, 33,2° D) olması.",
    group: "tutulma",
    en: {
      note: "Total eclipse visible from Morocco, Spain, Algeria, Libya, Egypt, Saudi Arabia, Yemen and Somalia; partial eclipse from Africa, Europe, the Middle East and west and south Asia; greatest eclipse at 10:06:37 UT1 at 25°30.2' N, 33°11.0' E, with totality lasting 6m23s.",
    },
  },
  diyanetAyTanim: {
    no: 33,
    title: "Yeni Ay Tanım Farkı (Sıkça Sorulan Sorular)",
    publisher: "Diyanet İşleri Başkanlığı, Vakit Hesaplama",
    url: "https://vakithesaplama.diyanet.gov.tr/ay_tanim.php",
    note: "\"İslam'da Hicri aylar hilalin ilk defa dünyanın herhangi bir yerinden görülmesi ile başlamaktadır.\" Diyanet'in ilan ettiği Hicri ay başlarının astronomi sitelerindeki yeni ay tarihlerinden neden farklı olduğu.",
    group: "takvim",
  },
  usnoSeasons: {
    no: 34,
    title: "Earth's Seasons and Apsides",
    publisher: "U.S. Naval Observatory",
    url: "https://aa.usno.navy.mil/data/Earth_Seasons",
    note: "Ekinoks ve gündönümü anları (UT): 2026'da 20 Mart 14:46, 21 Haziran 08:24, 23 Eylül 00:05, 21 Aralık 20:50; 2027'de 20 Mart 20:25, 21 Haziran 14:11, 23 Eylül 06:02, 22 Aralık 02:42. Kendi hesabımızla karşılaştırdık; fark en çok 1 dakika.",
    group: "takvim",
    en: {
      note: "Times of the equinoxes and solstices (UT): in 2026 March 20 14:46, June 21 08:24, September 23 00:05, December 21 20:50; in 2027 March 20 20:25, June 21 14:11, September 23 06:02, December 22 02:42.",
    },
  },
  nasaSeasons: {
    no: 35,
    title: "What Causes the Seasons?",
    publisher: "NASA Space Place",
    url: "https://spaceplace.nasa.gov/seasons/en/",
    note: "Mevsimlerin nedeni Dünya'nın ekseninin eğik olmasıdır; Güneş'e uzaklık mevsimlerin nedeni değildir (Dünya Güneş'e ocakta en yakın, temmuzda en uzaktır).",
    group: "takvim",
  },
  nasaEarthFactSheet: {
    no: 36,
    title: "Earth Fact Sheet",
    publisher: "NASA Goddard Uzay Uçuş Merkezi (NSSDCA)",
    url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html",
    note: "Dünya'nın eksen eğikliği (yörüngeye göre) 23,44°; tropikal yıl 365,242 gün.",
    group: "takvim",
  },
  geonames: {
    no: 37,
    title: "GeoNames coğrafi veritabanı",
    publisher: "GeoNames (CC BY 4.0)",
    url: "https://www.geonames.org/",
    note: "Gün doğumu sayfasındaki yer arama kutusunun şehir, ilçe ve kasaba listesi: adlar (Türkçe adlar dahil), koordinatlar ve saat dilimleri.",
    group: "yer",
    en: {
      title: "GeoNames geographical database",
      note: "The place list behind the city search: names, coordinates and time zones of about 46,000 towns and cities.",
    },
  },
  noaaAurora: {
    no: 38,
    title: "Aurora",
    publisher: "NOAA Uzay Hava Durumu Tahmin Merkezi (SWPC)",
    url: "https://www.spaceweather.gov/phenomena/aurora",
    note: "Kuzey ışıkları, elektronların atmosferin üst katmanlarına çarpmasıyla 80-500 km yükseklikte oluşur; en iyi 60-75° enlemleri arasındaki halka biçimli bölgede görülür; büyük olaylarda ABD, Avrupa ve Asya'ya kadar iner; görmek için gökyüzü açık ve karanlık olmalıdır, yazın gece yarısı güneşi gözlemi engeller.",
    group: "ay",
  },
  noaaScales: {
    no: 39,
    title: "NOAA Space Weather Scales",
    publisher: "NOAA Uzay Hava Durumu Tahmin Merkezi (SWPC)",
    url: "https://www.spaceweather.gov/noaa-scales-explanation",
    note: "Jeomanyetik fırtına ölçeği G1-G5: G3'te ışıklar tipik olarak 50°, G4'te 45°, G5'te (aşırı, Kp 9) 40° jeomanyetik enleme kadar görülür.",
    group: "ay",
  },
  nasaMay2024Storm: {
    no: 40,
    title: "How NASA Tracked the Most Intense Solar Storm in Decades",
    publisher: "NASA (16 Mayıs 2024)",
    url: "https://science.nasa.gov/science-research/heliophysics/how-nasa-tracked-the-most-intense-solar-storm-in-decades/",
    note: "10 Mayıs 2024'te başlayan fırtına G5 düzeyine ulaştı (2003'ten beri ilk kez); kuzey ışıkları alışılmadık derecede düşük enlemlerden, 26° manyetik enleme kadar görüldü.",
    group: "ay",
  },
  nasaAuroraSpacePlace: {
    no: 41,
    title: "What Is an Aurora?",
    publisher: "NASA Space Place",
    url: "https://spaceplace.nasa.gov/aurora/en/",
    note: "Güneş fırtınalarındaki parçacıklar Dünya'nın manyetik alanına takılır, kutuplara yakın alan çizgileri boyunca atmosfere iner; oksijen yeşil ve kırmızı, azot mavi ve mor ışık verir.",
    group: "ay",
  },
  noaaOvation: {
    no: 42,
    title: "Aurora - 30 Minute Forecast",
    publisher: "NOAA Uzay Hava Durumu Tahmin Merkezi (SWPC)",
    url: "https://www.spaceweather.gov/products/aurora-30-minute-forecast",
    note: "OVATION modeliyle kuzey ışıklarının yeri ve şiddeti için 30-90 dakikalık tahmin; parlak ışıklar 1.000 km uzaktan bile görülebilir. \"Bu gece görülecek mi?\" sorusu için resmî kaynak.",
    group: "ay",
  },
  ncieGeomagneticPoles: {
    no: 43,
    title: "Wandering of the Geomagnetic Poles",
    publisher: "NOAA Ulusal Çevre Bilgi Merkezleri (NCEI)",
    url: "https://www.ncei.noaa.gov/products/wandering-geomagnetic-poles",
    note: "WMM2025'e göre jeomanyetik kuzey kutbu 2025.0'da 80,85° K, 72,76° B. Türkiye'nin jeomanyetik enlemini (İstanbul ~38,6°, Antalya ~34,3°) bununla hesapladık.",
    group: "ay",
  },
  nasaPhotoGuide: {
    no: 44,
    title: "Lunar Photography Guide",
    publisher: "NASA",
    url: "https://science.nasa.gov/moon/photography-guide/",
    note: "Telefonla: flaşı kapatın, ayın üstüne dokunup odaklayın, ay beyaz değil gri görünsün diye parlaklığı düşürün, sarsıntı olmasın diye zamanlayıcı kullanın; ay gökyüzünden çok parlak değilken (alacakaranlıkta) çekin. Fotoğraf makinesiyle \"Looney 11\" kuralı: diyafram f/11, ISO ile pozlama süresi aynı; ISO 100 iyi bir başlangıç.",
    group: "ay",
  },
  samsungMoon: {
    no: 45,
    title: "How Galaxy cameras combine Super Resolution technologies with AI to produce high-quality images of the Moon",
    publisher: "Samsung (destek sayfası, 30 Nisan 2024)",
    url: "https://www.samsung.com/uk/support/mobile-devices/how-galaxy-cameras-combine-super-resolution-technologies-with-ai-to-produce-high-quality-images-of-the-moon/",
    note: "Galaxy S21 serisinden beri Scene Optimiser ayı tanır; 10'dan fazla kareyi birleştirir (Super Resolution) ve derin öğrenmeye dayalı yapay zekâ ayrıntı geliştirme motoruyla gürültüyü siler, ayrıntıyı artırır. Scene Optimiser kapatılarak yapay zekâsız çekilebilir.",
    group: "ay",
  },
  usnoRiseSetDefs: {
    no: 46,
    title: "Rise, Set, and Twilight Definitions",
    publisher: "U.S. Naval Observatory, Astronomical Applications Department",
    url: "https://aa.usno.navy.mil/faq/RST_defs",
    note: "Gün doğumu/batımı Güneş'in üst kenarının ufukta olduğu andır (merkez ufkun 50' altında: 16' yarıçap + 34' ortalama kırılma). Sivil, denizci ve astronomik alacakaranlık Güneş merkezinin 6°, 12° ve 18° altında olmasıdır; sivil alacakaranlıktan sonra dışarıdaki işler için yapay ışık gerekir.",
    group: "takvim",
    en: {
      note: "Sunrise and sunset are when the Sun's upper edge is on the horizon (its center 50′ below: 16′ radius plus 34′ average refraction). Civil, nautical and astronomical twilight end when the Sun's center is 6°, 12° and 18° below the horizon; after civil twilight, outdoor activities normally need artificial light.",
    },
  },
  wisdomlibBrahmaMuhurta: {
    no: 47,
    title: "Brahma-muhurta: definitions",
    publisher: "Wisdom Library (Śiva Purāṇa 2.1.11, Apte Sanskrit dictionary, Manusmṛti 4.92 ve diğerleri)",
    url: "https://www.wisdomlib.org/definition/brahma-muhurta",
    note: "Brahma muhurta: gün doğumundan önceki 4. ve 2. ghatika arası (1 ghatika 24 dk → doğuştan 96 ile 48 dk önce). Bazı gelenekler doğuştan önceki 48 dakikayı ya da 1,5 saati sayar.",
    group: "gelenek",
    en: {
      title: "Brahma-muhurta: definitions",
      publisher: "Wisdom Library (Śiva Purāṇa 2.1.11, Apte Sanskrit dictionary, Manusmṛti 4.92 and others)",
      note: "Brahma muhurta as the span between the 4th and 2nd ghatika before sunrise (one ghatika is 24 minutes, so 96 to 48 minutes before sunrise); other traditions count the 48 minutes or the hour and a half before sunrise.",
    },
  },
  wisdomlibRahukala: {
    no: 48,
    title: "Rahukala, Rāhu-kāla",
    publisher: "Wisdom Library (Alar Kannada-English dictionary)",
    url: "https://www.wisdomlib.org/definition/rahukala",
    note: "Rahu kalam: her gün farklı saatte başlayan, bir işe başlamak için uğursuz sayılan bir buçuk saat. 6:00-18:00 gündüzde Pazar 16:30-18:00, Pazartesi 07:30-09:00, Salı 15:00-16:30, Çarşamba 12:00-13:30, Perşembe 13:30-15:00, Cuma 10:30-12:00, Cumartesi 09:00-10:30 (gündüzün 8., 2., 7., 5., 6., 4., 3. sekizde biri).",
    group: "gelenek",
    en: {
      note: "Rahu kalam as a period of an hour and a half, starting at a different time each weekday, considered inauspicious for beginning anything. For a 6 am to 6 pm day: Sunday 4:30-6:00 pm, Monday 7:30-9:00 am, Tuesday 3:00-4:30 pm, Wednesday 12:00-1:30 pm, Thursday 1:30-3:00 pm, Friday 10:30 am-12:00 pm, Saturday 9:00-10:30 am (the 8th, 2nd, 7th, 5th, 6th, 4th and 3rd eighth of the daytime).",
    },
  },
  svsMoonPhase2026: {
    no: 50,
    title: "Moon Phase and Libration, 2026",
    publisher: "NASA Bilimsel Görselleştirme Stüdyosu (SVS)",
    url: "https://svs.gsfc.nasa.gov/5587",
    note: "2026'nın her saati için ayın Dünya'dan görünüşü (evre, sallanma, eksen eğikliği), kamu malı. Sitedeki evre görüntüleri bu karelerden alındı.",
    group: "ay",
    en: {
      publisher: "NASA Scientific Visualization Studio (SVS)",
      note: "The Moon as seen from Earth for every hour of 2026 (phase, libration and axis tilt), public domain. The phase images on this site are taken from these frames.",
    },
  },
  wisdomlibTithi: {
    no: 51,
    title: "Tithi: definitions",
    publisher: "Wisdom Library (Jyotisha ve Sanskrit sözlük tanımları)",
    url: "https://www.wisdomlib.org/definition/tithi",
    note: "Tithi, ayın Güneş'ten uzaklığının 12 derece artması için geçen süredir (ay döngüsünün otuzda biri); her yarım ay (paksha) 15 tithi; parlak yarının 15. tithisi dolunay (Purnima), karanlık yarınınki yeni ay (Amavasya); tithi süresi değişkendir.",
    group: "gelenek",
    en: {
      publisher: "Wisdom Library (Jyotisha and Sanskrit dictionary definitions)",
      note: "A tithi is the time it takes the Moon to increase its distance from the Sun by 12 degrees, one thirtieth of a lunation; each fortnight (paksha) has fifteen tithis; the fifteenth tithi of the bright fortnight is the full moon (Purnima), of the dark fortnight the new moon (Amavasya); the length of a tithi varies.",
    },
  },
  cajochen2013: {
    no: 52,
    title: "Evidence that the lunar cycle influences human sleep",
    publisher: "Cajochen ve diğerleri; Current Biology, 2013 (Europe PMC)",
    url: "https://europepmc.org/article/MED/23891110",
    note: "Laboratuvarda, ayı görmeyen gönüllülerde dolunay çevresinde derin uyku göstergesi (NREM delta etkinliği) %30 düştü, uykuya dalma 5 dakika uzadı, toplam uyku 20 dakika kısaldı; melatonin azaldı. Yazarlar ayın insan fizyolojisi ve davranışıyla tutarlı bir ilişkisinin bulunmadığını, çok sayıda halk inancı olduğunu belirtiyor.",
    group: "ay",
    en: {
      publisher: "Cajochen et al.; Current Biology, 2013 (Europe PMC)",
      note: "In a sleep laboratory, with volunteers unable to see the moon, deep sleep (NREM delta activity) fell by 30% around the full moon, falling asleep took 5 minutes longer and total sleep was 20 minutes shorter; melatonin was lower. The authors note there is much folklore but no consistent association of moon cycles with human physiology and behavior.",
    },
  },
  nasaEclipseMyths: {
    no: 53,
    title: "Eclipse Misconceptions",
    publisher: "NASA, Eclipse 2017 sitesi (Web Archive kopyası)",
    url: "https://web.archive.org/web/2017/https://eclipse2017.nasa.gov/eclipse-misconceptions",
    note: "Tutulmanın hamilelere ve bebeğe zarar verdiği, tutulma sırasında hazırlanan yemeğin zehirlendiği inançlarının yanlış olduğu; koronanın ışığının zararsız olduğu, asıl tehlikenin tam tutulmadan önce Güneş yüzeyine bakmak olduğu.",
    group: "tutulma",
    en: {
      publisher: "NASA, Eclipse 2017 website (Web Archive copy)",
      note: "The ideas that an eclipse harms pregnant women or the unborn baby, and that food prepared during an eclipse is poisoned, are false; the light of the corona is harmless, and the real danger is looking at the bright solar surface before totality.",
    },
  },
  nasaLunarEclipseGuide: {
    no: 54,
    title: "What You Need to Know about the Lunar Eclipse",
    publisher: "NASA, moon.nasa.gov (2019, Web Archive kopyası)",
    url: "https://web.archive.org/web/2019/https://moon.nasa.gov/news/172/what-you-need-to-know-about-the-lunar-eclipse/",
    note: "Ay tutulmasını izlemek için özel bir araç gerekmediği (dürbün ve teleskop görüntüyü ve kızıllığı güzelleştirir); ayın, ona ulaşan tek Güneş ışığı Dünya atmosferinden geçtiği için kızardığı, atmosferde toz ve bulut arttıkça daha kızıl görüneceği, \"dünyadaki bütün gün doğumları ve batımları aya yansıtılmış gibi\" olduğu.",
    group: "tutulma",
    en: {
      publisher: "NASA, moon.nasa.gov (2019, Web Archive copy)",
      note: "No special equipment is needed to watch a lunar eclipse, though binoculars or a telescope enhance the view and the red color; the Moon turns red because the only sunlight reaching it passes through Earth's atmosphere, and the more dust or clouds there are, the redder it looks: as if all the world's sunrises and sunsets were projected onto the Moon.",
    },
  },
  usnoRiseSetOneDay: {
    no: 55,
    title: "Sun and Moon Rise/Set/Transit Times for One Day",
    publisher: "ABD Deniz Gözlemevi (USNO), Astronomical Applications Department",
    url: "https://aa.usno.navy.mil/data/RS_OneDay",
    note: "Bir yer ve gün için Güneş ve ayın doğuş, batış, meridyen geçişi ve sivil alacakaranlık saatleri (dakikaya yuvarlanmış). Doğuş-batış hesaplarımızı bu verilerle karşılaştırıyoruz.",
    group: "takvim",
    en: {
      publisher: "U.S. Naval Observatory (USNO), Astronomical Applications Department",
      note: "Rise, set and transit times of the Sun and Moon and civil twilight for a given place and day, rounded to the minute. We compare our rise and set times with these data.",
    },
  },
  svsMoonPhaseGallery: {
    no: 56,
    title: "Moon Phase and Libration Gallery (Dial-A-Moon)",
    publisher: "NASA Bilimsel Görselleştirme Stüdyosu (SVS)",
    url: "https://svs.gsfc.nasa.gov/gallery/moonphase/",
    note: "Dial-A-Moon: bir an girilince ayın o andaki görünüşü; yıllık ay evresi görselleştirmeleri 2011-2026 yıllarını kapsıyor.",
    group: "ay",
    en: {
      publisher: "NASA Scientific Visualization Studio (SVS)",
      note: "Dial-A-Moon shows what the Moon looked like at a time you enter; the yearly Moon phase visualizations it draws on cover 2011 to 2026.",
    },
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
