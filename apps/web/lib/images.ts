/**
 * Sitede kullanılan NASA fotoğrafları. Hepsi NASA çalışanlarının çektiği ya da NASA'nın ürettiği,
 * kamu malı görsellerdir; künyeleri NASA Image and Video Library'deki kayıtlarıyla tek tek kontrol edildi.
 * APOD gibi kaynaklardaki görseller çoğunlukla fotoğrafçıya aittir, buraya eklenmez.
 */
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Görselin altında gösterilen açıklama. */
  caption: string;
  /** Künye, NASA kaydındaki biçimiyle. */
  credit: string;
  /** Görselin kaynak kaydı. */
  sourceUrl: string;
}

const library = (id: string) => `https://images.nasa.gov/details/${id}`;

export const IMAGES = {
  farSide: {
    src: "/images/nasa/far-side-svs.webp",
    width: 1600,
    height: 900,
    alt: "Ayın arka yüzü tamamen aydınlık; arkasında küçük, uzak Dünya",
    caption:
      "Ayın arka yüzü, Lunar Reconnaissance Orbiter verileriyle oluşturulmuş görüntü. Ön yüzdeki büyük karanlık lekeler (denizler) burada neredeyse yok; yüzey kraterlerle kaplı.",
    credit: "NASA Scientific Visualization Studio",
    sourceUrl: "https://svs.gsfc.nasa.gov/11747",
  },
  artemisFarSide: {
    src: "/images/nasa/artemis-2-far-side.webp",
    width: 1600,
    height: 1067,
    alt: "Hilal halindeki ay ufku ve uzakta ince bir hilal halinde Dünya",
    caption:
      "Artemis II astronotları ayın arka yüzünü hilal halinde gördü; yukarıda ince bir hilal gibi Dünya parlıyor (6 Nisan 2026). Arka yüzün de gecesi ve gündüzü vardır.",
    credit: "NASA",
    sourceUrl: library("art002e015231"),
  },
  earthset: {
    src: "/images/nasa/earthset-artemis-2.webp",
    width: 1600,
    height: 1067,
    alt: "Ay ufkunun ardında batan, yarısı aydınlık Dünya",
    caption: "Artemis II astronotları ayın arkasından geçerken Dünya'nın ay ufkunda batışını görüntüledi (6 Nisan 2026).",
    credit: "NASA",
    sourceUrl: library("art002e021278"),
  },
  apollo11: {
    src: "/images/nasa/apollo-11-aldrin.webp",
    width: 1200,
    height: 1171,
    alt: "Ay yüzeyinde yürüyen, uzay giysili astronot ve ayak izleri",
    caption:
      "Apollo 11, 20 Temmuz 1969: Buzz Aldrin, Kartal iniş aracının yanında ay yüzeyinde. Fotoğrafı Neil Armstrong çekti; Aldrin'in kaskının camında Armstrong ve iniş aracı görünüyor.",
    credit: "NASA",
    sourceUrl: library("as11-40-5903"),
  },
  earthrise: {
    src: "/images/nasa/earthrise-apollo-8.webp",
    width: 1200,
    height: 938,
    alt: "Ay yüzeyinin üzerinde yükselen, yarısı gölgede Dünya",
    caption:
      "Apollo 8, 24 Aralık 1968: Ay yörüngesinden Dünya. Dünya da tıpkı ay gibi yarısı aydınlık görünüyor; aydan bakınca onun da evreleri vardır.",
    credit: "NASA",
    sourceUrl: library("as08-14-2383"),
  },
  lunarEclipseSequence: {
    src: "/images/nasa/lunar-eclipse-2025-sequence.webp",
    width: 1600,
    height: 400,
    alt: "Soldan sağa: dolunayın gölgeye girişi, ortada kızıl tam tutulma ve gölgeden çıkış",
    caption:
      "14 Mart 2025 tam ay tutulması, 11 karede. Ay soldan sağa Dünya'nın gölgesine girip kızarıyor, sonra yeniden aydınlanıyor.",
    credit: "NASA/GRC/Jordan Cochran",
    sourceUrl: library("GRC-2025-C-01605"),
  },
  bloodMoon: {
    src: "/images/nasa/blood-moon-2025.webp",
    width: 1400,
    height: 932,
    alt: "Tam ay tutulması sırasında bakır kırmızısı renkte ay",
    caption:
      "14 Mart 2025 tam ay tutulması. Gölgenin içinde kalan ayı, Dünya atmosferinden kırılarak geçen kızıl gün ışığı aydınlatıyor.",
    credit: "NASA/Jordan Cochran",
    sourceUrl: library("GRC-2025-C-01612"),
  },
  supermoonCapitol: {
    src: "/images/nasa/supermoon-capitol-2020.webp",
    width: 1400,
    height: 919,
    alt: "Washington'daki Kongre binasının yanında, bulutlar arasında yükselen süper ay",
    caption: "9 Mart 2020 süper ayı Washington'da yükselirken. Binanın yanında büyük görünmesi ufuk yanılsamasının da etkisi.",
    credit: "NASA/Joel Kowsky",
    sourceUrl: library("NHQ202003090003"),
  },
  supermoonHorizon: {
    src: "/images/nasa/supermoon-huntsville-2024.webp",
    width: 1400,
    height: 933,
    alt: "Ağaçların ardından doğan turuncu, iri dolunay",
    caption:
      "Ağustos 2024 dolunayı ağaçların ardından doğarken. Ufuktaki ay hem iri hem turuncu görünür; renk, ışığın havada uzun yol almasından gelir.",
    credit: "NASA/Michael DeMocker",
    sourceUrl: library("MAF_20240819_SuperBlueMoon01"),
  },
  solarCorona: {
    src: "/images/nasa/solar-eclipse-corona-2017.webp",
    width: 1200,
    height: 799,
    alt: "Tam güneş tutulmasında ayın kara diski çevresinde parlayan beyaz korona",
    caption: "Tam tutulma: Ay Güneş'i tamamen örtünce Güneş'in dış atmosferi (korona) görünür.",
    credit: "NASA/Carla Thomas",
    sourceUrl: library("AFRC2017-0233-005"),
  },
  solarDiamondRing: {
    src: "/images/nasa/solar-eclipse-diamond-ring-2017.webp",
    width: 1200,
    height: 800,
    alt: "Ayın kenarından sızan tek parlak ışık noktası: elmas yüzük",
    caption: "Elmas yüzük: tam tutulmanın bitişinde Güneş ışığı ayın kenarındaki vadilerden sızar.",
    credit: "NASA/Carla Thomas",
    sourceUrl: library("AFRC2017-0233-009"),
  },
  firstQuarterTerminator: {
    src: "/images/nasa/first-quarter-terminator.webp",
    width: 1400,
    height: 962,
    alt: "İlk dördünde aydınlık ile karanlık sınırında gölgeleri uzayan kraterler",
    caption:
      "İlk dördünde ayın güney yarısı. Sol taraftaki gölge sınırına yakın kraterlerin gölgeleri uzun, bu yüzden çukurlar kabartma gibi belirgin.",
    credit: "NASA Scientific Visualization Studio (LRO verisi)",
    sourceUrl: "https://svs.gsfc.nasa.gov/5587",
  },
} satisfies Record<string, SiteImage>;
