---
name: arama-arastirmasi
description: Bir ay konusunda Google'da gerçekten aranan sorguları (otomatik tamamlama) toplar, Lunatlas sayfalarıyla karşılaştırır ve fırsatları (cevaplanmayan sorular, yeni sayfa adayları) Türkçe rapor eder. Kullanıcı "/arama-arastirmasi dolunay", "arama araştırması yap", "ne aranıyor", "anahtar kelime fırsatları" dediğinde kullan.
---

# Arama araştırması (Lunatlas)

Kullanıcı teknik değil; raporu **Türkçe ve sade** yaz. Bu araştırmadır: siteye hiçbir şey ekleme, sayfa açma, metin değiştirme. Öneriler kullanıcının onayına sunulur (CLAUDE.md kırmızı çizgileri geçerli).

## 1. Toplama

Argüman bir ya da birkaç konu olabilir ("dolunay", "kanlı ay"). Argüman yoksa kullanıcıya hangi konu olduğunu sor ya da `--hepsi` öner (research/tohumlar.txt, ~35 konu, uzun sürer: konu başına ~1 dk).

Kökten çalıştır (çıktıyı dosyaya yönlendir, `tail` ile boru kurma; uzun sürerse arka planda çalıştır):

```
node research/arama-topla.ts "<konu1>" "<konu2>" > research/sonuclar/son-calisma.log 2>&1
```

- Varsayılan: konu + soru kalıpları + yıllar + harf harf tarama (konu başına ~50 sorgu, ~40-60 sn).
- `--hizli`: harf taraması yok (~15 sn/konu).
- Çıktı: `research/sonuclar/<tarih>-<konu>.csv` (arama; konu; bulunduğu sorgu; en yakın sayfamız; eşleşme %) ve `.txt` (yalnız aramalar, Keyword Planner için).
- Google 429 verirse araç kendisi bekler. Aynı gün aynı konuyu tekrar tekrar tarama.

## 2. Ayıklama (senin işin, araç yapmaz)

CSV'yi oku. "En yakın sayfamız" sütunu kaba bir ipucudur (kelime eşleşmesi); kararı sen ver. Şunları **gürültü** say ve rapora alma:
- Konuyla aynı adı taşıyan diziler, filmler, kitaplar, kişi adları, işletmeler, mahalleler, oyun eşyaları ("dolunay migros", "dolunay nereden düşer" oyunda eşya vb.).
- Rüya tabirleri, fal, burç yorumları, kapsam dışı astroloji (CLAUDE.md §2).
- Geçmiş yıllar (2024, 2025) yalnız "insanlar yıllık tablo arıyor" sinyali olarak not edilir.

Kalanları **niyetlere** grupla (örn. "ne zaman / tarih", "neden / bilim", "nasıl izlenir", "anlamı / isimler", "sağlık-uyku etkisi", "il bazlı").

## 3. Sitemizle karşılaştırma

Sayfa listesi `apps/web/lib/pages.ts`, SSS'ler `apps/web/lib/faqs.ts`. Gerekirse ilgili sayfanın `page.tsx` dosyasında başlıklara bak. Her niyet grubu için:
- **Karşılanıyor:** hangi sayfa, hangi bölüm.
- **Kısmen:** sayfa var ama bu soru açıkça cevaplanmıyor → mevcut sayfaya bölüm ya da SSS önerisi (SSS kuralı: yalnız gerçekten sorulan, sayfada cevaplanmamış soru; her sayfada farklı).
- **Boşluk:** hiçbir sayfa cevaplamıyor → yeni sayfa adayı mı, mevcut sayfaya bölüm mü? Yeni sayfa ancak farklı bir soruya cevap veriyor ve bir araç sunabiliyorsa önerilir (kullanıcı kararı: "düz yazı bilgi demode", her sayfada araç olmalı). İl × tarih gibi kalıp sayfa ASLA önerilmez (kırmızı çizgi 1-4).

## 4. Rapor (sohbete, Türkçe)

Kısa tut, tablo kullan:
1. Kaç arama toplandı, kaçı gürültü çıktı.
2. **En güçlü fırsatlar** (en fazla 5-7): soru örnekleri → ne yapılabilir (SSS / bölüm / araç / yeni sayfa) → hangi sayfa.
3. Zaten iyi karşıladıklarımız (bir cümle).
4. Hacim için: `.txt` dosyasının tam yolunu ver ve kullanıcıya anlat: Google Ads → Araçlar → Anahtar Kelime Planlayıcı → "Arama hacmini ve tahminleri alın" → listeyi yapıştır → Konum: Türkiye, Dil: Türkçe → sonuçları indir (CSV) → dosyayı `research/sonuclar/` klasörüne koyup haber versin. Keyword Planner tek seferde ~2500 kelime alır.
5. Kullanıcı Keyword Planner dosyası getirirse: hacimleri CSV'deki aramalarla birleştir, fırsat listesini hacme göre yeniden sırala.

Raporun sonunda hangi önerinin uygulanmasını istediğini sor; onaysız uygulama yapma.
