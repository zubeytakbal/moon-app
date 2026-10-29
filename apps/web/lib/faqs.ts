import { PAGES } from "@/lib/pages";

/**
 * Sayfalara özgü sık sorulan sorular. Sorular Google otomatik tamamlamasından ve Trends'ten alındı
 * (29 Ekim 2026); sayfanın gövdesinde zaten cevaplanan sorular alınmadı. Dinî hüküm ve burç yorumu
 * soruları bilerek dışarıda bırakıldı. Her sayfanın soruları kendine özgüdür; kalıp SSS yoktur.
 */
export interface FaqItem {
  q: string;
  a: string;
  link?: { href: string; label: string };
}

export const FAQS = {
  ayEvreleri: [
    {
      q: "Ay kendi etrafında döner mi, kaç günde döner?",
      a: "Evet. Ay kendi ekseni etrafında yaklaşık 27,3 günde bir tur atar. Bu süre, Dünya etrafındaki bir turuyla neredeyse aynıdır; bu yüzden aydan hep aynı yüzü görürüz. Buna eş zamanlı dönme denir: Dünya'nın çekimi milyarlarca yıl içinde ayın dönüşünü bu hıza kilitlemiştir.",
    },
    {
      q: "Ay Dünya etrafında kaç günde döner?",
      a: "Yıldızlara göre 27 gün 7 saat 43 dakikada bir tur atar. Evrelerin tekrarı ise 29 gün 12 saat 44 dakika sürer: ay bir turunu tamamlarken Dünya da Güneş etrafında ilerlediği için, ayın Güneş'e göre aynı konuma gelmesi iki gün daha sürer. Takvimlerdeki \"ay\" bu ikinci süredir.",
    },
    {
      q: "Ay kaç günde bir evre değiştirir?",
      a: "Dört ana evre (yeni ay, ilk dördün, dolunay, son dördün) arasında ortalama 7,4 gün vardır. Hilal ve şişkin ay ise bu ana evreler arasındaki dönemlerdir. Ayın görünüşü aslında her gün biraz değişir; evre değişimi kesintisiz bir süreçtir.",
    },
    {
      q: "Bir evreden bir hafta ya da iki hafta sonra hangi evre gelir?",
      a: "Ana evreler yaklaşık birer hafta arayla sırayla gelir: yeni ay, ilk dördün, dolunay, son dördün ve yeniden yeni ay. Yani ilk dördünden bir hafta sonra dolunay, iki hafta sonra son dördün gelir; dolunaydan bir hafta sonra son dördün, iki hafta sonra yeni ay gelir. Ara evrelerde de sıra aynıdır: büyüyen hilalden bir hafta sonra büyüyen şişkin ay görülür.",
    },
  ],
  ayTutulmalari: [
    {
      q: "Ay tutulması kaç yılda bir olur?",
      a: "Her yıl olur: yarı gölge tutulmaları dahil yılda en az iki, en çok beş ay tutulması yaşanır. Ama her tutulma her yerden görülmez; yalnızca o sırada ayın ufkun üzerinde olduğu yerlerden izlenir. Türkiye'den tam ay tutulması ortalama birkaç yılda bir görülür.",
    },
    {
      q: "Ay tutulması ne kadar sürer?",
      a: "Yarı gölge evresi dahil bütün tutulma 5-6 saate kadar sürebilir. Ayın gölgeye girdiği kısım en fazla 3,5 saat kadar, ayın tamamen gölgede kaldığı tam tutulma ise en fazla 1 saat 47 dakika sürer. Yukarıdaki listede her tutulmanın kendi süreleri var.",
    },
    {
      q: "Ay tutulması neden güneş tutulmasından uzun sürer?",
      a: "Ay tutulmasında ay, Dünya'nın gölgesinin içinden geçer; bu gölge ayın bulunduğu uzaklıkta ayın yaklaşık 2,7 katı genişliktedir. Güneş tutulmasında ise ayın Dünya'ya düşen küçük gölgesi yeryüzünde çok hızlı ilerler; bir noktada tam tutulma en fazla 7,5 dakika sürer.",
    },
    {
      q: "Ay tutulmasında deprem olur mu?",
      a: "Ay tutulmasının depreme yol açtığını gösteren bir kanıt yoktur. Tutulma, ayın Dünya'ya uzaklığını ya da çekimini değiştirmez; ay o gece herhangi bir dolunaydakiyle aynı kuvveti uygular. Gelgit kuvvetleri ve deprem ilişkisini Süper Ay sayfasında ayrıntılı ele aldık.",
      link: { href: PAGES.superAy.path, label: "Süper ay deprem tetikler mi?" },
    },
  ],
  gunesTutulmasi: [
    {
      q: "Güneş tutulması kaç yılda bir olur?",
      a: "Dünya'nın bir yerinde her yıl en az iki, en çok beş güneş tutulması olur. Ama tam tutulma çok dar bir şeritten görülür; aynı noktadan tam güneş tutulması ortalama 375 yılda bir görülür. Parçalı tutulmalar ise Türkiye'den birkaç yılda bir izlenebilir.",
    },
    {
      q: "Güneş tutulması ne kadar sürer?",
      a: "Ayın Güneş'in önünden geçişi baştan sona 2-3 saat kadar sürer. Tam ya da halkalı evre ise çok kısadır: tam tutulma bir noktada en fazla 7,5 dakika, çoğu zaman 2-4 dakika sürer. Sayfadaki il tablosunda tutulmanın başlangıç, en derin an ve bitiş saatleri yer alıyor.",
    },
    {
      q: "Güneş tutulması neden her yeni ayda olmaz?",
      a: "Çünkü ayın yörüngesi, Dünya'nın Güneş etrafındaki yörüngesine göre yaklaşık 5 derece eğiktir. Çoğu yeni ayda ay, Güneş'in biraz üstünden ya da altından geçer. Tutulma, yeni ay iki yörüngenin kesiştiği noktalara yakın olduğunda yaşanır; bu da yılda iki kez gelen tutulma dönemlerinde olur.",
      link: { href: PAGES.yeniAy.path, label: "Yeni ay ve tutulmalar" },
    },
    {
      q: "Güneş tutulmasında ay hangi evrededir?",
      a: "Yeni ay evresindedir. Ay, Dünya ile Güneş'in arasındadır ve aydınlık yüzü bize ters bakar; bu yüzden tutulma sırasında Güneş'in önünde kara bir disk olarak görülür. Ay tutulmasında ise ay dolunay evresindedir.",
    },
  ],
  dolunay: [
    {
      q: "Dolunay kaç günde bir olur?",
      a: "Ortalama 29,5 günde bir (29 gün 12 saat 44 dakika). Ayın yörüngesi elips olduğu için bu süre 29 gün 6 saat ile 29 gün 20 saat arasında değişir. Bir yıl 365 gün olduğundan bazı yıllara 13 dolunay sığar.",
    },
    {
      q: "Dolunay neden turuncu ya da sarı görünür?",
      a: "Ufka yakınken ayın ışığı havada çok daha uzun yol alır. Bu sırada mavi ışık havadaki moleküllere çarpıp saçılır, kırmızı ve turuncu ışık ise bize ulaşır; gün batımında Güneş'in kızarması da aynı sebeptendir. Ay yükseldikçe yeniden beyazlaşır. Havadaki toz, duman ve nem rengi daha da koyulaştırır. Ay tutulmasındaki kızıllık ise başka bir olaydır.",
      link: { href: PAGES.kanliAy.path, label: "Kanlı ay neden kırmızı?" },
    },
    {
      q: "Dolunay uykuyu etkiler mi?",
      a: "Araştırmalar karışık sonuç veriyor. 2021'de Science Advances dergisinde yayımlanan bir çalışma, Arjantin'deki topluluklarda ve ABD'deki üniversite öğrencilerinde dolunaydan önceki gecelerde insanların daha geç yatıp daha kısa uyuduğunu buldu; araştırmacılar bunu akşam saatlerindeki ay ışığıyla ilişkilendirdi. Başka çalışmalar ise belirgin bir etki bulamadı. Kesin bir şey söylemek için kanıt henüz yeterli değil.",
    },
    {
      q: "Dolunaydan sonra hangi evre gelir?",
      a: "Küçülen şişkin ay gelir. Türkiye'den bakınca ay sağ kenarından eksilmeye başlar ve yaklaşık bir hafta sonra yarısı aydınlık son dördüne ulaşır.",
      link: { href: PAGES.kuculenSiskinAy.path, label: "Küçülen şişkin ay" },
    },
  ],
  yeniAy: [
    {
      q: "Yeni ay kaç gün sürer?",
      a: "Astronomik yeni ay tek bir andır: ayın Güneş ile aynı boylama geldiği dakika. Ama ay bu anın bir iki gün öncesinde ve sonrasında da Güneş'e çok yakın olduğu için görülmez; genellikle iki üç gece hiç görünmez. Takvimlerde yeni ay, o anın düştüğü günün adıyla gösterilir.",
    },
    {
      q: "Yeni ay kaç günde bir olur?",
      a: "Ortalama 29,5 günde bir. İki yeni ay arasındaki süre bir ay döngüsüdür; Hicri ayların 29 ya da 30 gün çekmesi de bu yüzdendir.",
    },
    {
      q: "Yeni aydan önce hangi evre gelir?",
      a: "Küçülen hilal gelir: sabah gün doğmadan doğu ufkunda görülen ince bir yay. Yeni aydan önceki son ana evre ise son dördündür; son dördünden yaklaşık bir hafta sonra yeni ay olur.",
      link: { href: `${PAGES.hilal.path}#kuculen-hilal`, label: "Küçülen hilal" },
    },
  ],
  kanliAy: [
    {
      q: "Kanlı ay ne kadar sürer?",
      a: "Ayın tamamen kızıl göründüğü tam tutulma evresi birkaç dakikadan en fazla 1 saat 47 dakikaya kadar sürer. Öncesinde ve sonrasında ay, gölgeye girip çıkarken yaklaşık birer saat kısmen kararmış görünür. Yukarıdaki listede her kanlı ayın kızıllık süresi var.",
    },
    {
      q: "Kanlı ayda deprem olur mu?",
      a: "Kanlı ayın depreme yol açtığını gösteren bir kanıt yoktur. Kızıl renk yalnızca Dünya atmosferinden süzülen ışıktan gelir; tutulma ayın çekimini değiştirmez. Ay o gece herhangi bir dolunaydakiyle aynı kuvveti uygular.",
      link: { href: PAGES.superAy.path, label: "Süper ay deprem tetikler mi?" },
    },
  ],
  hicriTakvim: [
    {
      q: "Hicri takvim neden her yıl 10-11 gün geri gelir?",
      a: "Hicri yıl 12 ay döngüsünden oluşur ve 354 ya da 355 gündür; Miladi yıl ise 365 ya da 366 gündür. Aradaki 10-11 günlük fark yüzünden Ramazan ve bayramlar her yıl Miladi takvimde 10-11 gün öne kayar ve yaklaşık 33 yılda bütün mevsimleri dolaşır.",
    },
    {
      q: "Hicri yıl kaç gündür?",
      a: "354 ya da 355 gündür. Hicri aylar 29 ya da 30 gün çeker; bir ayın kaç gün olacağı hilalin görülmesine ya da hesaba göre belirlenir. Hesaplı takvimlerde 30 yıllık bir döngünün 11 yılı 355 gündür.",
    },
    {
      q: "Hicri takvim ne zaman başladı?",
      a: "Başlangıç noktası, Hz. Muhammed'in Mekke'den Medine'ye hicretinin yaşandığı yıldır (Miladi 622). Takvim, Hz. Ömer döneminde, hicretten yaklaşık 17 yıl sonra bu yıl esas alınarak düzenlendi. Hicri 1 Muharrem 1, Miladi takvimde genellikle 16 Temmuz 622'ye karşılık gelir.",
    },
  ],
  ayBurcu: [
    {
      q: "Ay burcu ile güneş burcu arasındaki fark ne?",
      a: "Güneş burcu, doğduğunuzda Güneş'in bulunduğu burçtur; Güneş bir burçta yaklaşık bir ay kaldığı için doğum tarihinden bilinir. Ay burcu ise ayın o anda bulunduğu burçtur; ay bir burcu yaklaşık iki buçuk günde geçtiği için doğum günü, mümkünse saati gerekir. Geleneksel astrolojide güneş burcu kişiliğin dışa dönük yanıyla, ay burcu duygularla ilişkilendirilir.",
    },
    {
      q: "Ay burcu yükselen burç mu?",
      a: "Hayır, ikisi farklıdır. Yükselen burç, doğum anında doğu ufkunda yükselen burçtur; yaklaşık iki saatte bir değiştiği için doğum saatinin ve yerinin bilinmesi gerekir. Ay burcu ise ayın gökyüzündeki konumuna bağlıdır ve doğum yerinden bağımsızdır. Bu sitede yalnızca ay burcu hesaplanır.",
    },
  ],
  ayTakvimi: [
    {
      q: "Ay takvimi neden 354 gündür?",
      a: "Ay takvimi 12 ay döngüsünden oluşur ve bir döngü ortalama 29,53 gündür: 12 × 29,53 yaklaşık 354,4 gün eder. Bu yüzden ay takvimine göre bir yıl 354 ya da 355 gün sürer ve Güneş yılından 11 gün kadar kısadır. Hicri takvim böyle bir takvimdir.",
      link: { href: PAGES.hicriTakvim.path, label: "Hicri takvim" },
    },
  ],
  sacKesim: [
    {
      q: "Dolunayda saç kesilir mi?",
      a: "Geleneğin kuralları dolunay gününe özel bir şey söylemez; dolunay, büyüyen ay ile küçülen ay arasındaki sınırdır. Dolunaydan önceki günler \"uzama\", sonraki günler \"şeklini koruma\" günleri sayılır. Takvimde dolunay günü ayrıca işaretlidir. Ayın evresinin saç üzerinde bir etkisi olduğu bilimsel olarak gösterilmemiştir.",
    },
    {
      q: "Ay takvimine göre saç boyama ne zaman yapılır?",
      a: "Saç boyama için gelenekte yaygın ve tutarlı bir kural yoktur; internette yayımlanan \"boyama günleri\" kaynaktan kaynağa değişir. Bu sayfada yalnızca saç kesimi için en yaygın kurallar uygulanır.",
    },
  ],
  ekimDikim: [
    {
      q: "Ay takvimine göre ağaç budama ne zaman yapılır?",
      a: "Gelenekte budama küçülen ayda, yani dolunaydan yeni aya kadar olan dönemde yapılır; bu dönemde özsuyun köklere çekildiğine inanılır. Ama asıl belirleyici mevsimdir: meyve ağaçları çoğunlukla kış sonunda, ağaçlar dinlenmedeyken ve şiddetli donlar geçtikten sonra budanır. Sayfanın başındaki araçta \"Budama\"yı seçerek önümüzdeki uygun günleri görebilirsiniz.",
    },
    {
      q: "Ay takvimine göre fide ne zaman dikilir?",
      a: "Gelenekte domates, biber, patlıcan gibi ürünü toprak üstünde olan sebzelerin fideleri büyüyen ayda dikilir. Ama sıcak seven bu fideler ancak don tehlikesi geçince toprağa çıkarılabilir; bu da çoğu bölgede nisan ile mayıs arasıdır. Önce mevsimi, sonra ay takviminden günü seçmek gerekir.",
    },
  ],
  turkiyeTutulmalari: [
    {
      q: "1999 güneş tutulması kaç dakika sürdü?",
      a: "Ayın Güneş'i tamamen örttüğü tam evre, şeridin geçtiği il merkezlerinde 1 dakika 20 saniye ile 2 dakika 21 saniye arasında sürdü: en uzunu Kastamonu'da 2 dakika 21 saniye, Sivas'ta 2 dakika 9 saniyeydi. Parçalı evreler dahil bütün tutulma ise yaklaşık üç saat sürdü; Sivas'ta 13:06'da başlayıp 15:49'da bitti.",
    },
    {
      q: "1999 güneş tutulması Türkiye'den görüldü mü?",
      a: "Evet, Türkiye'nin her yerinden görüldü. Tam tutulma şeridi Bartın ve Kastamonu'dan girip Çorum, Amasya, Tokat, Sivas, Tunceli, Elazığ, Diyarbakır, Batman ve Siirt üzerinden Şırnak'a uzanan 12 il merkezini kapsadı. Şeridin dışında kalan illerde de Güneş'in en az %80'i örtüldü; en az örtülme Muğla'daydı (%82).",
    },
    {
      q: "Türkiye'de bir sonraki tam güneş tutulması ne zaman?",
      a: "30 Nisan 2060'ta. Tam tutulma Adana, Gaziantep, Şanlıurfa, Diyarbakır ve Van gibi Güneydoğu ve Doğu Anadolu'daki 21 il merkezinden görülecek. Ondan önce, 1 Haziran 2030'da İstanbul dahil 13 ilden halkalı tutulma izlenecek: Ay Güneş'in tam önüne geçecek ama kenarında parlak bir halka kalacak. İstanbul'dan tam tutulma için 3 Eylül 2081'i beklemek gerekiyor.",
    },
    {
      q: "2006 güneş tutulması saat kaçta oldu?",
      a: "29 Mart 2006'da tutulma Türkiye'de öğleden sonra yaşandı. Antalya'da 12:37'de başladı, tam evre 13:56 civarında 3 dakika 18 saniye sürdü ve tutulma 15:12'de bitti. İl merkezleri arasında en uzun tam tutulma Konya'da, 3 dakika 40 saniye sürdü.",
    },
  ],
  meteorYagmurlari: [
    {
      q: "Meteor yağmuru tehlikeli mi, Dünya'ya zarar verir mi?",
      a: "Hayır. Meteor yağmurundaki parçacıkların çoğu kum tanesi, hatta toz boyutundadır. Saniyede 20-70 kilometre hızla atmosfere girer ve 70-100 kilometre yükseklikte yanıp tükenirler; gördüğümüz parlak iz, bu yanmanın ışığıdır. Yağmurlardan yere ulaşan bir parça neredeyse hiç görülmemiştir. İzlemek tamamen güvenlidir.",
    },
    {
      q: "Göktaşı yağmuru ile meteor yağmuru aynı şey mi?",
      a: "Günlük dilde evet, ikisi aynı olayı anlatır. Bilimsel olarak gökyüzünde gördüğümüz ışık izine meteor (halk arasında yıldız kayması), uzayda dolaşan parçacığa meteoroit, atmosferde yanıp bitmeyip yere düşen taşa ise göktaşı ya da meteorit denir. Meteor yağmurlarındaki parçacıklar yere ulaşamayacak kadar küçük olduğu için 'meteor yağmuru' daha doğru bir addır.",
    },
    {
      q: "Meteor yağmuru neden olmadı, neden hiç göremedim?",
      a: "Genellikle beş sebepten biri vardır: şehir ışıkları sönük meteorları siler; ay ufkun üzerindeyse gökyüzünü aydınlatır; akşam erken saatlerde yağmurun geldiği nokta henüz alçaktadır; gözler karanlığa alışmadan (en az 20 dakika) ve telefona bakılırken sönük meteorlar görülmez; bir de bulutlar. Haberlerde geçen 'saatte 100 meteor', kusursuz karanlık bir gökyüzü içindir. Yukarıdaki hesaplayıcı, sizin koşullarınızda gerçekçi sayıyı gösterir.",
    },
    {
      q: "Meteor yağmurunu izlerken hangi yöne bakmalıyım?",
      a: "Belirli bir yöne bakmak gerekmez; meteorlar gökyüzünün her yerinde görünür. En iyisi, ufku açık bir yerde sırt üstü uzanıp gökyüzünün en karanlık ve en yüksek kısmına bakmaktır. Meteorların geldiği noktadan (radyant) yaklaşık 40-60 derece uzağa bakmak, uzun izli meteorları görme şansını artırır.",
    },
    {
      q: "Meteor yağmuru teleskopla ya da dürbünle izlenir mi?",
      a: "Hayır, en iyisi çıplak gözdür. Meteorlar gökyüzünün herhangi bir yerinde bir saniyeden kısa sürede belirip kaybolur. Teleskop ve dürbün gökyüzünün çok küçük bir parçasını gösterdiği için meteorların çoğu görüş alanının dışında kalır.",
    },
  ],
  ayinKaranlikYuzu: [
    {
      q: "Ayın karanlık yüzü kaç derece, ne kadar soğuk?",
      a: "Arka yüz de ön yüz gibi yaklaşık iki hafta gündüz, iki hafta gece yaşar. Havası olmadığı için sıcaklık farkı çok büyüktür: gündüz ekvator bölgesinde 120 °C'ye kadar çıkar, gece −170 °C'nin altına iner. Yani 'karanlık yüz' sürekli soğuk değildir; sıcaklığı, o sırada orada gündüz mü gece mi olduğuna bağlıdır.",
    },
    {
      q: "Ayın karanlık yüzü hangi renktedir?",
      a: "Ön yüz gibi gridir; hatta biraz daha açık görünür. Ön yüzdeki koyu lekeler, eski lav akıntılarının doldurduğu ovalardır (ay denizleri). Arka yüzde bu ovalar çok azdır; yüzeyin çoğu açık renkli, kraterlerle kaplı dağlık arazidir.",
    },
    {
      q: "Ayın karanlık yüzünde yaşayan var mı?",
      a: "Hayır. Ayın havası, sıvı suyu ve manyetik kalkanı yoktur; arka yüz de ön yüz kadar canlılık için elverişsizdir. Arka yüzdeki tek 'sakinler', Çin'in 2019'da indirdiği Chang'e 4 aracı ve Yutu-2 adlı gezginidir.",
    },
    {
      q: "Ayın arka yüzündeki araçlarla nasıl haberleşiliyor?",
      a: "Arka yüzden Dünya hiç görünmediği için araçlar Dünya'ya doğrudan sinyal gönderemez. Bu yüzden ayın arkasını gören bir yörüngeye aktarma uydusu yerleştirilir: Chang'e 4 ve Chang'e 6 görevleri, Çin'in Queqiao adlı aktarma uyduları sayesinde Dünya'yla haberleşti. Aynı sebeple Artemis II astronotları da ayın arkasından geçerken bir süre Dünya'yla bağlantısız kaldı.",
    },
  ],
  ayUzaklik: [
    {
      q: "Ay ile Dünya arası kaç ışık yılı?",
      a: "Bir ışık yılının çok küçük bir kesri: ortalama uzaklık yaklaşık 1,28 ışık saniyesidir. Işık yılı cinsinden yazılırsa yaklaşık 0,00000004 ışık yılı eder. Ay için ışık yılı yerine ışık saniyesi kullanmak çok daha anlaşılırdır; en yakın yıldız Proxima Centauri ise 4,2 ışık yılı uzaktadır.",
    },
    {
      q: "Dünya ile ay arası bilimsel gösterimle nasıl yazılır?",
      a: "Ortalama uzaklık 384.400 km'dir; bilimsel gösterimle 3,844 × 10⁵ km olarak yazılır. Metre cinsinden 3,844 × 10⁸ m, santimetre cinsinden 3,844 × 10¹⁰ cm eder. Bilimsel gösterimde virgülden önce tek basamak bırakılır ve 10'un kuvveti, virgülün kaç basamak kaydırıldığını gösterir.",
    },
    {
      q: "Ay bir gün Dünya'dan kaçıp gidecek mi?",
      a: "Hayır. Ay uzaklaşmaya devam edecek ama uzaklaşma giderek yavaşlayacak ve ay Dünya'nın çekiminden hiçbir zaman kurtulamayacak. Hesaplara göre Dünya ve ay, on milyarlarca yıl sonra birbirine karşı aynı yüzü gösteren bir dengeye ulaşırdı; ama Güneş, yaklaşık 5 milyar yıl sonra kızıl dev evresine geçeceği için bu son hiçbir zaman gelmeyecek.",
    },
  ],
  ayaYolculuk: [
    {
      q: "Aya ilk ayak basan Türk var mı?",
      a: "Henüz yok. Aya bugüne kadar yalnızca Apollo programındaki 12 Amerikalı astronot ayak bastı. Türkiye'nin ilk astronotu Alper Gezeravcı Ocak 2024'te Uluslararası Uzay İstasyonu'na gitti; Tuva Cihangir Atasever ise Haziran 2024'te uzayın sınırına kısa bir uçuş yaptı. Türkiye'nin aya ilk teması, insansız ay aracıyla olacak.",
    },
    {
      q: "Aya hayvan gitti mi? Aya ilk giden canlı hangisi?",
      a: "Aya hiçbir hayvan ayak basmadı. Ayın çevresini dolaşıp Dünya'ya canlı dönen ilk canlılar, Eylül 1968'de Sovyet Zond 5 aracıyla gönderilen iki kaplumbağaydı; araçta böcekler ve tohumlar da vardı. Üç ay sonra Apollo 8 astronotları ayın çevresinde dolaşan ilk insanlar oldu.",
    },
    {
      q: "Aydaki bayraklar hâlâ duruyor mu?",
      a: "Ay yörüngesindeki LRO uydusunun fotoğraflarında Apollo 12, 16 ve 17'nin bayraklarının gölgeleri görülüyor; yani bu bayraklar hâlâ dikili. Apollo 11'in bayrağı ise Aldrin'in anlattığına göre iniş aracı kalkarken motorun püskürttüğü gazla devrildi. Havasız ortamda yıllarca güneş ışığı alan bayrakların renklerinin solduğu düşünülüyor.",
    },
    {
      q: "Aydaki bayrak ya da iniş aracı teleskopla görülür mü?",
      a: "Hayır, hiçbir teleskopla görülemez. Hubble Uzay Teleskobu bile ay yüzeyinde ancak 90 metre kadar büyük ayrıntıları seçebilir; iniş araçlarının ayda kalan alt kısmı ise 4 metre kadardır, bayraklar daha da küçüktür. İniş yerleri ancak ayın çevresinde, 50 kilometre yükseklikte dönen LRO uydusunun kameralarıyla fotoğraflanabildi. Ama iniş yerlerinin bulunduğu denizleri çıplak gözle bile görebilirsiniz: sayfanın başındaki haritada hangisinin şu an güneş aldığı yazıyor.",
    },
    {
      q: "Aya en son ne zaman gidildi?",
      a: "Ay yüzeyine en son Aralık 1972'de Apollo 17 astronotları indi; Eugene Cernan, 14 Aralık 1972'de aydan ayrılan son insandı. Nisan 2026'da Artemis II'nin dört astronotu ayın çevresinden dolaştı ama iniş yapmadı. Bir sonraki insanlı inişin 2028'de olması hedefleniyor.",
    },
  ],
  aybosluk: [
    {
      q: "Ay boşluktayken saç kesilir mi, alışveriş yapılır mı?",
      a: "Gelenekte boşluk dönemi yeni bir işe başlamak, önemli bir karar vermek ya da büyük bir satın alma yapmak için uygun görülmez. Rutin işler, örneğin sıradan alışveriş, saç kesimi ya da temizlik, sakıncalı sayılmaz. Bu bir inanıştır; ayın konumunun bu işler üzerinde bir etkisi olduğu gösterilmemiştir.",
    },
  ],
} as const satisfies Partial<Record<keyof typeof PAGES, FaqItem[]>>;
