# Moon App: Proje Notları

> Bu dosya projenin kalıcı hafızasıdır. Her oturumun başında okunur.
> **Kullanıcıya her zaman Türkçe cevap ver.** Teknik terimleri sade bir dille açıkla.

## 1. Proje

Ay konusunda uzmanlaşmış bir web sitesi, ileride de mobil uygulama.

- **Amaç:** "Ay konusunda en iyi kaynak" olmak.
- **Hedef:** Google'dan organik trafik almak, ileride AdSense.
- **Dil:** Önce Türkçe. Sonra Almanca, İspanyolca gibi diller eklenecek.
- **Marka ve domain:** Henüz belli değil. Geçici ad **"Moon App"**.
  - Site adı kodun içine sabit yazılmaz. Tek bir config dosyasından (`site.config.ts`) okunur.
  - Domain yayından **önce** kesinleşmeli. Yayından sonra domain değiştirmek SEO'ya pahalıya patlar.

## 2. Kapsam

**Astronomi (bilimsel):** evreler, ay takvimi, doğuş/batış saatleri, dolunay/yeniay tarihleri, tutulmalar, süper ay, hicri takvim ve hilal, eyyam-ı biyz, ay takvimine göre ekim.

**Aya bağlı astroloji (geleneksel takvim):** ay burcu, bugün ay hangi burçta, boşluktaki ay.
- Bunlar bilimsel gerçek gibi değil, **"geleneksel takvim"** olarak sunulur.
- Astronomi ve astroloji bölümleri ayrı tutulur, astroloji görsel olarak da hafifçe ayrışır.

**Kapsam dışı:** günlük burç yorumları, burç uyumu, yükselen burç, genel astroloji, tarot/rün vb.

## 3. Kırmızı çizgiler (çok önemli)

Kullanıcının önceki sitesi "şablonik içerik" nedeniyle AdSense'ten **4 kez reddedildi**, Google trafiği **bir günde %96 düştü**. Bu yüzden şu kurallar kesindir:

1. **Toplu veya kalıp sayfa üretilmez.** "12 Mart 2027 ay evresi" gibi her gün için ya da il × tarih kombinasyonlarıyla sayfa YOK.
2. **Sayfa listesi elle yazılır.** Hiçbir sayfa veritabanından ya da döngüyle (il × tarih, yıl × ay gibi) otomatik üretilmez. Her yeni sayfayı kullanıcı onaylar.
3. **Her sayfa farklı bir soruya cevap verir ve kendi yapısı olur.** Aynı iskelete metin doldurmak yok.
   - Örnek: 8 evre rehberi aynı şablon gibi görünmemeli. Dolunay sayfası isimler ve tutulmayla, hilal sayfası hicri takvim ve gözlemle, yeni ay sayfası "neden görünmez" sorusuyla öne çıkar.
   - Tarih listeleri sadece tablo olmaz, her birinde o yıla özgü notlar olur (hangi dolunay süper ay, hangisi tutulmayla çakışıyor vb.).
4. **Seçiciler yeni sayfa açmaz.** İl veya tarih seçmek aynı sayfada veriyi değiştirir. `/ankara` gibi adresler yok. Parametreli adresler (`?il=ankara`) canonical olarak ana sayfayı gösterir ya da `noindex` olur.
5. **Sitemap'te sadece elle onaylanmış sayfalar** yer alır.
6. **Yarım, boş veya "yakında" yazan sayfa yayına çıkmaz.** İçeriği tamamlanmamış sayfa derlenmez.
7. **Araç sayfaları "ince içerik" olmamalı.** Sadece rakam gösteren bir araç yetmez. Her aracın altında o soruya özgü gerçek bir açıklama olur.
8. **Metinler özgündür.** Başka sitelerden alınmış veya yeniden yazılmış (spin edilmiş) metin kullanılmaz. Sistem ve özellikler örnek alınabilir, metin ve görsel kimlik alınmaz.
9. **Diğer diller makine çevirisi olmaz.** Her dil kendi içeriğiyle açılır.

## 4. Teknik yapı

**Monorepo (npm workspaces):**

| Klasör | İçerik | Durum |
|---|---|---|
| `apps/web` | Next.js 16 (App Router, TypeScript, Tailwind v4, Turbopack) | create-next-app ile kuruldu (Next 16.4.3, React 19.3) |
| `packages/moon` | Ortak ay hesaplama paketi (TypeScript). Web ve mobil birlikte kullanır | Henüz yok |
| `apps/mobile` | İleride Expo (React Native) | **Şimdilik oluşturma** |

**Ay hesapları:**
- Kütüphane: **astronomy-engine** (MIT lisanslı, internetsiz çalışır, hassasiyeti yeterli).
- Hesaplar sunucuda veya cihazda yapılır. **Dış API'ye bağımlılık yok.**
- Varsayılan konum **İstanbul**, saat dilimi **Europe/Istanbul**. Kullanıcı il seçebilir.
- Güney yarımkürede ayın ters görünmesi gibi konum farkları ileride desteklenebilecek şekilde tasarlanır.

**Next.js kuralları:**
- Server Components varsayılandır. `"use client"` sadece etkileşimli parçalarda kullanılır.
- Bu Next.js sürümünde değişiklikler var. Kod yazmadan önce `apps/web/node_modules/next/dist/docs/` içindeki ilgili rehberi oku (bkz. `apps/web/AGENTS.md`).
- Bilgi yazıları şimdilik TSX içinde `Prose` bileşeniyle yazılıyor (metni Claude yazdığı için MDX'e gerek kalmadı). Statik üretilir.

**"Bugün" sayfaları (karar verildi):**
- Tek sayfa, sabit adres (örn. `/tr/bugun-ay`). İçerik her gün kendiliğinden yenilenir, yeni sayfa oluşmaz.
- Veri sunucuda, o anki tarihe göre (Europe/Istanbul) hesaplanır ve **1 saat** önbellekte tutulur (revalidate). Google her zaman dolu ve güncel sayfa görür.
- İsteğe bağlı olarak tarayıcıda küçük canlı güncellemeler eklenebilir (yüzde, geri sayım).
- Sayfada "Son güncelleme" tarihi gösterilir, yapılandırılmış veride `dateModified` olarak da yazılır.
- Aynı mantık şu sayfalar için de geçerli: bir sonraki dolunay, bugün ay hangi burçta, ay takvimi (varsayılan olarak içinde bulunulan ay), ay yaşı.
- Tarih listesi sayfaları (2027 dolunayları vb.) sabittir, sadece "sıradaki" vurgusu otomatik kayar.

**Çok dil:** URL yapısı `/tr/`, `/de/`, `/es/`. Şimdilik sadece Türkçe, ama yapı yeni dile hazır olsun.

**SEO:**
- Her sayfada düzgün `title` ve `description`.
- `sitemap.xml`, `robots.txt`, uygun yerlerde yapılandırılmış veri.
- **Yayına alınana kadar `robots.txt` taramayı engeller.**

**Performans:** Mobilde hızlı olmalı. PageSpeed'de yeşil hedefleniyor.

## 5. Hassas konular

- **Hicri takvim:** Diyanet hesaba dayalı bir takvim kullanır, bazı gruplar çıplak gözle hilal gözlemini esas alır. Site "astronomik hesap şunu söylüyor, resmi takvim için Diyanet'e bakın" çizgisinde durur. Bayram tarihlerini kesin hüküm gibi sunma.
- **Eski site:** Eski sayfalar taşınmaz, 301 yönlendirmesi yapılmaz (eski sitenin kalite cezası yeni siteye geçebilir). Kullanıcının kendi yazdığı özgün yazılar elden geçirilip yeniden kullanılabilir. Bu durumda eski sitedeki kopya kaldırılmalı ya da `noindex` yapılmalı. Şablonla üretilmiş eski sayfaların hiçbir parçası alınmaz.
- **Görseller:** NASA görselleri çoğunlukla kaynak gösterilerek kullanılabilir, ama her görselin künyesi tek tek kontrol edilir. NASA logosu kullanılmaz, "NASA onaylı" gibi bir izlenim verilmez.

## 6. Tasarım ilkeleri

> **Kullanıcı geri bildirimi (27 Ekim 2026):** İlk sade tasarımı "çok kötü" buldu; birimceviri.app'teki ay sayfasını çok daha profesyonel buluyor. Beklenti: gerçekçi, görsel olarak güçlü sayfalar. Düz renkli çizimler, küçük yazılar ve "form gibi" kutular kullanma.

**Uygulanan görsel dil:**
- Koyu, tam genişlik giriş alanı (`bg-[#05070d]` + `.starfield`), üst menü ve alt bilgi de aynı koyu ton. İçerik alanı açık renkli, `max-w-3xl`.
- **Gerçek ay fotoğrafı:** NASA SVS "Moon Phase and Libration, 2026" (svs.gsfc.nasa.gov/5587), 5760px "plain" kare 7157 (26 Ekim 2026 dolunayı), kamu malı; künye: "NASA Scientific Visualization Studio". `public/moon/` altında 160 / 800 / 2000 px WebP. `MoonPhaseIcon` gösterim boyutuna göre dosyayı seçer, evre gölgesini hesaplayıp yumuşatarak bindirir.
- **Referans:** Kullanıcı NASA'nın science.nasa.gov/moon sayfasını örnek gösterdi: iki katlı menü (üstte logo/araçlar, altta ortalı kalın bölüm menüsü), ekranı kaplayan sinematik ay görseli üzerinde dev başlık. Ana sayfa girişi bu tarzda (dev ay yayı + başlık).
- İri, ince rakamlar (`font-extralight`, `tabular-nums`), bölüm başlıklarının üstünde küçük büyük harfli etiketler, `rounded-2xl` gölgeli kartlar, vurgu rengi indigo.
- 7 günlük evre şeridi, geri sayım çipleri gibi zengin bilgi kutuları.


Ana ilham kaynağı: [NASA, Weather on the Moon](https://science.nasa.gov/moon/weather-on-the-moon/). Düzenden ilham alınır, görsel kimlik bize ait olur.

- **Genel stil:** temiz, editoryal, bilimsel. Koyu uzay temalı başlık alanları, açık ve okunaklı metin alanları.
- **Breadcrumb:** `Ana Sayfa › Ay Evreleri › Dolunay`
- **Gruplu menü:** Araçlar / Evreler / Tarihler / Hicri ve Gelenek / Bilgi
- **"Kısaca" kutusu:** her sayfanın başında 2-3 maddelik özet (öne çıkan snippet'ler için de faydalı)
- Net H2/H3 başlıklar, kısa paragraflar
- **Yazar kutusu ve "Kaynaklar" bölümü** (Google'ın E-E-A-T değerlendirmesi için)
- **"İlgili konular" kartları** (iç linkleme)
- **"Son güncelleme" tarihi**
- Mobil uygulama için referanslar: Moonly (konu olarak en yakın), Co-Star (minimal siyah-beyaz tasarım).

## 7. Lansman sayfaları (30 + 4)

> Bugün 27 Ekim 2026. 2026 sayfalarının ömrü kısa, **2027 sayfaları öncelikli.**

**Araçlar (8)**
1. Bugün ay nasıl
2. Ay takvimi (aylık görünüm)
3. Ay doğuş ve batış saatleri (il seçmeli)
4. Doğduğum gün ay nasıldı
5. Ay yaşı hesaplama
6. Bir sonraki dolunay ne zaman
7. Ay burcu hesaplama *(geleneksel takvim)*
8. Bugün ay hangi burçta / boşlukta mı *(geleneksel takvim)*

**Evre rehberleri (8)**
9. Ay evreleri nedir (ana rehber)
10. Yeni ay
11. Hilal
12. İlk dördün
13. Büyüyen şişkin ay
14. Dolunay
15. Küçülen şişkin ay
16. Son dördün

**Tarih listeleri (6)**
17. 2026 dolunay tarihleri
18. 2027 dolunay tarihleri
19. 2026-2027 yeniay tarihleri
20. Süper ay nedir, 2027 süper ay tarihleri
21. 2026-2027 ay tutulmaları
22. Dolunay isimleri (Kurt Ayı, Hasat Ayı vb.)

**Hicri ve gelenek (4)**
23. Hicri takvim ve ay başları
24. Hilal gözlemi nasıl yapılır
25. Eyyam-ı biyz günleri
26. Ay takvimine göre ekim

**Bilgi (4)**
27. Ay neden şekil değiştirir
28. Ayın karanlık yüzü gerçekten karanlık mı
29. Ay ve gelgit ilişkisi
30. Kanlı ay neden kırmızı görünür

**Zorunlu sayfalar (4):** Hakkımızda, İletişim, Gizlilik politikası, Çerez bilgilendirmesi.

## 8. Çalışma şekli

- Adım adım ilerle. **Büyük bir yapısal karar vermeden önce kullanıcıya sor.**
- Her adımdan sonra ne yapıldığını kısaca ve sade bir dille özetle, nasıl test edileceğini söyle.
- Kullanıcı teknik değil. Jargonu açıkla, gereksiz teknik ayrıntıya girme.
- Ortam: Windows, proje `C:\dev\moon-app`, terminal PowerShell.
- **Git:** Repo kök klasörde (`C:\dev\moon-app`), branch `main`, remote `https://github.com/zubeytakbal/moon-app`. Commit ve push kullanıcının onayıyla yapılır.

## 9. Kullanıcının diğer sitesi: birimceviri.app

> **Bu, AdSense'ten reddedilen ve trafiği düşen eski sitedir** (kullanıcı 27 Ekim 2026'da doğruladı). Yeni siteyle arasında **teknik bağ kurulmaz:** 301 yönlendirmesi, karşılıklı bağlantı, ortak metin yok.

- Kullanıcının mevcut sitesi. 500+ dönüşüm ve 260+ hesaplayıcı sayfası var. `/ay-evreleri` sayfası tek sayfada evre, 81 il doğuş/batış, takvim, burç, süper ay, tutulma ve SSS topluyor (astronomy-engine kullanıyor).
- **Metin oradan kopyalanmaz.** İki site aynı aramalarda yarışır, Google kopyayı cezalandırır. Fikir ve özellik alınabilir (kullanıcının kendi işi).
- Oradan alınabilecek özellik fikirleri: 7 günlük evre şeridi, tarih seçici (geçmiş/gelecek gün), dolunay takvim aboneliği (.ics / Google Takvim), "Türkiye'den bakınca ay sağdan dolar, sağdan boşalır" ipucu, konum kullanma, sonraki ana evreye geri sayım.
- Yeni site yayına çıkınca birimceviri'deki ay sayfasının durumu (kaldırma ya da noindex; **yönlendirme değil**) kullanıcıyla kararlaştırılacak.

## 9b. Arama talebi sinyalleri (Google otomatik tamamlama, 27 Ekim 2026)

Hacim değil, yalnızca aranıp aranmadığını gösterir. Gerçek hacim için yayından sonra Search Console, önce Keyword Planner.
- **Güçlü:** bugün ay hangi evrede · doğduğum gün ay nasıldı (çok güçlü) · ay evreleri (takvimi 2026) · ay takvimi · dolunay/yeni ay ne zaman · ilk/son dördün, şişkin ay (öğrenci) · 2027 dolunay takvimi / "dolunay ve yeniaylar" · ay tutulması ne zaman, kanlı ay tutulması · dolunay isimleri · hicri takvimde bugün / bugün ayın kaçı · ay burcu hesaplama · ay hangi burçta bugün · ay boşlukta takvimi 2026 · güneş tutulması 2 ağustos 2027 türkiye · ay takvimine göre ekim dikim işleri 2026 (ay ay) · eyyam-ı biyz **orucu** ne zaman.
- **Zayıf/karışık:** hilal gözlemi (az) · "süper ay" ("Süper Ayı" oyunuyla karışıyor) · ay yaşı (insanlar bebek yaşını ay olarak arıyor; sayfa yapılmadı, doğru karar).
- **Listede olmayan fırsatlar:** "ay takvimine göre saç kesim günleri (2026)" (ay takvimi aramasında en üstte; kapsam kararı kullanıcıda) · 2 Ağustos 2027 güneş tutulmasına özel sayfa.

## 10. Açık sorular

- Araç sayfalarının altındaki açıklama metinlerini kim yazacak?
- Eski site (birimceviri.app): Search Console'da manuel işlem var mı?
- Tasarım ilkelerinin (bölüm 6) kesin onayı.
- Marka adı ve domain.
- "Ay takvimine göre saç kesim günleri" kapsama alınacak mı? (yüksek talep, geleneksel uygulama)

## 11. Yol haritası

**İlk görev:**
1. ✅ CLAUDE.md
2. ✅ Kökte npm workspaces, `packages/moon` paketi (`@moon-app/moon`), `apps/web`'e bağlı
3. ✅ `packages/moon`: `getMoonPhase`, `getMoonRiseSet`, `getNextFullMoon`, `getNextNewMoon` + testler
4. ✅ `/tr/bugun-ay` sayfası (iskelet; tasarım ve açıklama metni henüz yok, yayına hazır değil)

5. ✅ İl seçici: 81 il (`TURKEY_PROVINCES`), `?il=...` aynı sayfada, canonical tek adres
6. ✅ Site düzeni: üst menü, alt bilgi (site haritası), breadcrumb (+JSON-LD), "Kısaca" kutusu, WebPage `dateModified`

7. 🟡 "Bugün ay" açıklama metni yazıldı (`app/tr/bugun-ay/Explainer.tsx`), kullanıcı onayı bekliyor

8. 🟡 `/tr/ay-evreleri` ana rehber: yörünge çizimi (`OrbitDiagram`), 8 evre listesi, önümüzdeki ana evreler, açıklama metni. Kullanıcı onayı bekliyor. Sıradaki: 7 evre sayfası (yeni ay, hilal, ilk dördün, büyüyen şişkin, dolunay, küçülen şişkin, son dördün). Her biri farklı soruya odaklanmalı, aynı iskelet olmamalı.

9. ✅ Yeni tasarım (gerçek ay fotoğrafı, koyu hero) iki sayfaya uygulandı
10. ✅ Ana sayfa `/tr` (`/` buraya yönlenir): bugünün ayı, bu ayın döngüsü zaman çizelgesi (`getLunation`), Keşfet kartları (`lib/pages.ts` içindeki `description` ve `cardPhaseAngle` alanlarından), "nasıl hesaplıyoruz"
11. ✅ Dil seçici (`LanguageSwitcher`, `siteConfig.languages`). Şimdilik sadece Türkçe.

12. ✅ 7 evre sayfası: `/tr/yeni-ay`, `/tr/hilal` (büyüyen + küçülen), `/tr/ilk-dordun`, `/tr/buyuyen-siskin-ay`, `/tr/dolunay`, `/tr/kuculen-siskin-ay`, `/tr/son-dordun`. Ortak parçalar `components/phase/PhaseParts.tsx` (hero, sonraki evre/dönem kutusu, tarih tabloları, önceki/sonraki geçişi, kaynaklar). Her sayfanın soruları ve yapısı farklı; dolunayda İstanbul'da gece en yüksek konum tablosu (`getMoonAltitude`), büyüyen şişkinde gün gün aydınlık oranı. Kullanıcı en sonda toplu düzeltme yapacağını söyledi.

13. ✅ `/tr/ay-takvimi`: aylık takvim (masaüstü ızgara, telefonda liste), `?ay=YYYY-MM` aynı sayfada (canonical tek adres, ay bağlantıları `rel="nofollow"`), mavi ay ve 19 yıllık Meton döngüsü örneği hesaplanıyor (`getMonthCalendar`, `getNextBlueMoon`).
- Not: Yeni rota eklenince `PageProps<"/tr/...">` tipi için önce `npx next typegen` (ya da build) çalıştırılmalı.

14. ✅ `/tr/dogdugum-gun-ay`: tarih (+isteğe bağlı saat) formu (`next/form`, `?tarih=YYYY-MM-DD&saat=HHMM`, canonical tek adres, örnek bağlantılar nofollow), sonuç kartı, geçen dolunay/tur sayısı, 19/38/57. yaş günü (Meton), paylaş düğmesi (`ShareButton`).
- "Bir sonraki dolunay ne zaman" için ayrı sayfa yapılmadı: Dolunay sayfasıyla aynı soru (yamyamlık riski). Listedeki 30 sayfadan bu düşüldü.

15. ✅ `/tr/2027-dolunay-tarihleri`: 2026'nın kalan dolunayları + 2027'nin 12 dolunayı (ad, saat, İstanbul doğuşu, uzaklık, süper/mikro ay, tutulma ve Türkiye'den görünürlüğü). Süper ay eşiği 362.500 km (Nolle'ye yakın, sayfada açıkça yazıyor). Geleneksel adlar `lib/full-moon-names.ts` (Kuzey Amerika kökenli, Hasat/Avcı/Mavi Ay kuralları). Tutulma, uzaklık, mevsim fonksiyonları `packages/moon/src/events.ts`.
- Karar: "2026 dolunay tarihleri" ayrı sayfa yapılmadı (yalnız yıl değişen şablon sayfa olurdu, 2 dolunayı kalmıştı); 2027 sayfasına bölüm olarak eklendi.

16. ✅ `/tr/2026-2027-yeniay-tarihleri`: iki yılın yeni ayları (tutulma ve kara ay notları), 2026-2027 güneş tutulmaları (bölge açıklamaları elle, `ECLIPSE_REGIONS`), 2 Ağustos 2027 tutulmasının 8 ilden örtülme oranı ve saatleri (`getLocalSolarEclipse`), göz güvenliği uyarısı.

17. ✅ `/tr/super-ay`: süper ay nedir, tanım tartışması, gerçek oranlı süper/mikro ay karşılaştırması, 2026-2030 süper ayları, "süper ay deprem tetikler mi?" (kanıt yok, deprem tahmini yapılamaz). Eşik `lib/supermoon.ts` içinde ortak (`SUPERMOON_KM`).

18. ✅ `/tr/ay-tutulmalari`: 2026-2029 ay tutulmaları, her biri için evre zaman çizelgesi (ayın İstanbul'da ufkun altında kaldığı süre taralı), Türkiye'den görünürlük (tamamı/bir kısmı/görülmez), Türkiye'den görülecek bir sonraki tutulma, 31 Aralık 2028 yılbaşı tam tutulması (aynı zamanda mavi ay), Saros örneği (12 Ocak 2047).
- NASA kaynak bağlantılarını eklemeden önce erişilebilir olduklarını kontrol et (süper ay bağlantısı 404'tü, `/moon/supermoons/` olarak düzeltildi).

19. ✅ `/tr/dolunay-isimleri`: 12 ay + Hasat Ayı kartları (anlam + bir sonraki tarih, `nameFullMoons`), özel isimler (Mavi Ay, Süper Ay, Kanlı Ay), kökeni (Old Farmer's Almanac, Kuzey Amerika; Türk geleneği değil), "ayın on dördü gibi" deyimi. Tarihler grubu tamamlandı.

20. ✅ `/tr/hicri-takvim`: Hicri aylar (şu anki ay işaretli), bugünün yaklaşık Hicri tarihi (Intl `islamic-umalqura`, "Diyanet'le bir gün fark olabilir" notuyla), önümüzdeki 6 ay başının astronomik tahmini (`getCrescentEvenings`, Ankara gün batımı, yükseklik ≥5°, açı ≥8°).
- Doğrulama: Diyanet 2027 takvimiyle (vakithesaplama.diyanet.gov.tr) Ramazan başı aynı (8 Şubat 2027); Recep, Şaban, Şevval'de bizim tahmin bir gün sonra. Sayfada "resmî ay başı çoğu zaman bir gün öncedir" yazıyor. Asla resmî tarih gibi sunma.

21. ✅ `/tr/hilal-gozlemi`: il seçici (`?il=`), ilgili yeni aydan sonraki 4 akşam için gün batımı, ay batışı (gözlem penceresi), nereye bakılacağı (gün batımı noktasına göre derece, `moonAzimuth`/`sunAzimuth`), kaba kolaylık tahmini; gözlem rehberi, dürbün güvenliği, rekor (15,5 saat).

22. ✅ `/tr/bugun-ay-hangi-burcta` (yeni grup "Ay ve Burçlar", `burclar`): şu anki ay burcu ve derecesi, burca giriş/çıkış saatleri, önümüzdeki 10 burç geçişi, astrolojik burç ile IAU takımyıldızı karşılaştırması (presesyon ~24°), "geleneksel takvim" etiketi ve mor/altın görsel dil. Hesaplar `packages/moon/src/zodiac.ts` (tropikal, `EclipticGeoMoon`). Burç yorumu yapılmaz.
- Not: Kullanıcı bazen kendi `npm run dev` sunucusunu açık tutuyor. Onun süreçlerine dokunma; `next build` uzun sürerse arka planda bitmesini bekle.

**Kullanıcının yol haritası (27 Ekim 2026, Keyword Planner verisiyle):** ~30 sayfaya ulaşınca içerik üretimi durur → site düzeni ve konu sistemi toplu düzeltme → "app'de gözükme" (anlamı netleştirilecek: Google'da görünürlük mü, mobil uygulama mı) → AdSense başvurusu.
Kalan içerik sırası (aylık arama hacmi): 1) Bugün ay hangi burçta (10-100B) 2) Ay burcu hesaplama (10-100B) 3) Kanlı ay, yalnız tam tutulmalar (10-100B) 4) Güneş tutulması, genel sayfa + 2 Ağustos 2027 Türkiye ("güneş tutulması 2027" ~100, "güneş tutulması" 10-100B) 5) Ay takvimine göre saç kesim günleri (1-10B, kullanıcı onayladı) 6) Boşlukta ay takvimi (1-10B) 7) Ay takvimine göre ekim dikim (100-1B) 8) Eyyam-ı biyz (100-1B). Ardından 4 zorunlu sayfa.
Mevcutlardan: ay evreleri 10-100B, dolunay ne zaman 10-100B, doğduğum gün ay nasıldı ~1B.

**Lansman sırası (kullanıcıyla kararlaştırıldı):** bugün ay → ay evreleri ana rehberi + 7 evre → diğer araçlar → tarih listeleri (önce 2027) → hicri/gelenek + bilgi → zorunlu sayfalar. Metinleri Claude yazar, kullanıcı okuyup onaylar ve küçük kişisel bilgi/fotoğraf ekler.

**Sıradaki adaylar:**, ana sayfa (`/` şimdilik `/tr/bugun-ay`'a yönlendiriyor), sıradaki araç sayfaları.

## 12. Teknik notlar

- **Komutlar (kökten):** `npm run dev` (geliştirme sunucusu), `npm run build`, `npm test` (ay paketi testleri).
- `packages/moon` derlenmeden, doğrudan TypeScript olarak kullanılır. Node 24 testleri tip silme ile çalıştırır, bu yüzden paket içi importlar `.ts` uzantılıdır ve sadece silinebilir TS sözdizimi kullanılır (enum yok). `apps/web/tsconfig.json` bu yüzden `allowImportingTsExtensions` içerir.
- **Evre adı kuralı:** Ana evreler (yeni ay, ilk dördün, dolunay, son dördün) anlıktır. O anın düştüğü **yerel günün tamamı** o evrenin adını alır. Diğer günlerde ad evre açısına göre verilir.
- **Doğuş/batış:** Ayda bir gün ay doğmaz, bir gün batmaz. Fonksiyon bu günlerde `null` döner, arayüz bunu açıkça yazar.
- **Önbellek:** "Bugün" sayfaları `"use cache"` + `cacheLife("hours")` ile en geç saatte bir yenilenir (`cacheComponents` açık).
- **Sayfa listesi:** `apps/web/lib/pages.ts`. Menü, alt bilgi ve breadcrumb buradan okunur. Yeni sayfa ancak içeriği tamamlanınca buraya eklenir.
- **Türkçe ekler:** Saat, yüzde ve il adlarına ek getirmekten kaçın (18:33'te / 09:00'da, İstanbul'da / Van'da değişir). "İstanbul: ay doğuşu 18:33" gibi eksiz yaz.
- **Yayın öncesi kontrol listesi:** `site.config.ts` içinde `url` gerçek domain olmalı, `allowIndexing: true` yapılmalı, `/` → `/tr` yönlendirmesi çok dil gelince dil algılamaya çevrilebilir.
- `apps/web/node_modules` create-next-app'ten kaldı (Windows taşımaya izin vermedi). Kökteki `node_modules` ile birlikte çalışıyor. Sorun çıkarsa silinip kökten `npm install` yapılabilir.

> Her yeni adımda kod yazmadan önce kullanıcıya kısa bir plan sun ve onayını bekle.
