import { Prose } from "@/components/Prose";

/**
 * "Bugün Ay Nasıl?" sayfasının açıklama metni.
 * Odak: ekrandaki bilgileri okumak ve ayı ne zaman görebileceğini bilmek.
 * Evrelerin genel anlatımı "Ay evreleri nedir" sayfasının konusu, burada tekrar edilmez.
 */
export function Explainer() {
  return (
    <article className="mt-14 border-t border-zinc-200 pt-2 dark:border-zinc-800">
      <Prose>
        <h2>Bu sayfadaki bilgiler ne anlama geliyor?</h2>
        <p>
          Yukarıdaki kutularda ayın bugünkü durumunu dört bilgiyle özetliyoruz. Her biri ayın başka bir yönünü anlatır.
        </p>
        <ul>
          <li>
            <strong>Evre:</strong> Ayın Dünya&apos;dan bakınca ne kadarının ve hangi tarafının aydınlık göründüğünü
            anlatan ad. Yeni ay, ilk dördün, dolunay ve son dördün aslında tek bir andır. Biz, takvimlerde olduğu gibi o
            anın düştüğü günün tamamına o evrenin adını veriyoruz. Aradaki günlere hilal ya da şişkin ay deniyor.
          </li>
          <li>
            <strong>Aydınlık oranı:</strong> Ay diskinin yüzde kaçının Güneş ışığıyla aydınlandığı. İlk ve son
            dördünde bu oran yaklaşık %50&apos;dir. Dolunayda bile çoğu zaman tam %100&apos;e ulaşmaz, çünkü ay
            Güneş&apos;in tam karşısına nadiren denk gelir. Denk geldiğinde ay tutulması olur.
          </li>
          <li>
            <strong>Ay yaşı:</strong> Son yeni aydan bu yana geçen gün sayısı. Bir ay döngüsü ortalama 29,5 gün sürer.
            Yaşı 7-8 gün olan ay ilk dördüne, 14-15 gün olan ay dolunaya yakındır.
          </li>
          <li>
            <strong>Büyüyor mu, küçülüyor mu?</strong> Yeni aydan dolunaya kadar aydınlık kısım her gün artar (büyüyen
            ay), dolunaydan sonra azalır (küçülen ay). Kuzey yarımkürede büyüyen ayın sağ tarafı, küçülen ayın sol
            tarafı aydınlıktır.
          </li>
        </ul>

        <h2>Ayı bugün ne zaman görebilirim?</h2>
        <p>
          Ayın gökyüzünde ne zaman bulunacağı evresine bağlıdır. Ay, evresine göre günün farklı saatlerinde doğar.
          Doğuş ve batış saatlerine bakarak ayı ne zaman arayacağınızı kabaca tahmin edebilirsiniz:
        </p>
        <table>
          <thead>
            <tr>
              <th>Evre</th>
              <th>Yaklaşık doğuş</th>
              <th>En iyi görüldüğü zaman</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Yeni ay</td>
              <td>Güneşle birlikte, sabah</td>
              <td>Görünmez, Güneş&apos;e çok yakındır</td>
            </tr>
            <tr>
              <td>Büyüyen hilal</td>
              <td>Öğleden önce</td>
              <td>Gün batımından sonra, batı ufkunda</td>
            </tr>
            <tr>
              <td>İlk dördün</td>
              <td>Öğle saatleri</td>
              <td>Öğleden sonra ve akşamın ilk yarısı</td>
            </tr>
            <tr>
              <td>Dolunay</td>
              <td>Gün batımına yakın</td>
              <td>Bütün gece</td>
            </tr>
            <tr>
              <td>Son dördün</td>
              <td>Gece yarısına yakın</td>
              <td>Gece yarısından sabaha kadar</td>
            </tr>
            <tr>
              <td>Küçülen hilal</td>
              <td>Sabaha karşı</td>
              <td>Gün doğumundan önce, doğu ufkunda</td>
            </tr>
          </tbody>
        </table>
        <p>
          İlk dördün civarında ayı gündüz, mavi gökyüzünde görmek de mümkündür. Bu ay dönemlerinde öğleden sonra doğu
          ya da güney yönüne bakmanız yeterli.
        </p>

        <h2>Ay neden her gün daha geç doğuyor?</h2>
        <p>
          Ay, Dünya&apos;nın etrafında bir turunu yaklaşık 27,3 günde tamamlar. Bu yüzden her gün gökyüzünde yaklaşık
          13 derece doğuya kayar. Dünya kendi etrafında bir tur döndüğünde ay aynı yere gelmemiş olur. Dünya&apos;nın
          ayı yakalamak için biraz daha dönmesi gerekir. Bu fark, ayın her gün ortalama 50 dakika kadar geç doğmasına
          yol açar.
        </p>
        <p>
          Bu süre her gün aynı değildir. Mevsime ve ayın yörüngesindeki konumuna göre yarım saatin altına inebilir ya
          da bir saati geçebilir. Sonbaharda dolunay civarında ay birkaç gün üst üste yalnızca 20-30 dakika gecikmeyle doğar. Böylece akşamlar gün batımından hemen sonra aydınlık kalır.
          Eskiden çiftçilerin akşamları hasat yapmasına yardım ettiği için bu dolunaya &quot;hasat ayı&quot; denir.
        </p>

        <h2>Neden bazı günler &quot;ay doğmuyor&quot; yazıyor?</h2>
        <p>
          Ay her gün yaklaşık 50 dakika geç doğduğu için, doğuş saati bir gün gece yarısından hemen önceye denk gelirse
          ertesi gün ancak gece yarısından sonraya kalır. Aradaki takvim gününde ay hiç doğmamış olur. Aynı şey
          batış için de geçerlidir. Bu yüzden her ay döngüsünde ayın doğmadığı bir gün ve batmadığı bir gün vardır.
          Bu bir hata değildir, ayın hareketinin doğal sonucudur.
        </p>

        <h2>Doğuş saatleri illere göre neden farklı?</h2>
        <p>
          Türkiye batıdan doğuya yaklaşık 19 boylam genişliğindedir ama tek bir saat dilimi kullanır. Gökyüzündeki
          olaylar ise doğuda daha erken yaşanır: her boylam derecesi yaklaşık 4 dakikalık fark demektir. Bu yüzden ay,
          Van ya da Iğdır&apos;da Edirne&apos;ye göre bir saate yakın daha erken doğar. Enlem de doğuş saatini
          etkiler. Kuzeydeki ve güneydeki iller arasında, aynı boylamda olsalar bile birkaç dakikadan yarım saate
          yakın farklar görülebilir.
        </p>
        <p>
          Bulunduğunuz ili yukarıdaki listeden seçerek o ile ait saatleri görebilirsiniz.
        </p>

        <h2>Hesaplamalar nasıl yapılıyor?</h2>
        <p>
          Bu sayfadaki bütün değerler, ayın ve Güneş&apos;in konumunu yüksek hassasiyetle hesaplayan astronomik
          modellerle bulunur. Bunun için açık kaynaklı{" "}
          <a href="https://github.com/cosinekitty/astronomy" rel="noopener" target="_blank">
            Astronomy Engine
          </a>{" "}
          kütüphanesini kullanıyoruz. Sonuçlarını NASA&apos;nın yayımladığı ay evresi tablolarıyla karşılaştırdık.
          Dolunay ve yeni ay anlarında dakika düzeyinde uyum var.
        </p>
        <ul>
          <li>Saatler Türkiye saatiyle (UTC+3) verilir.</li>
          <li>
            Doğuş, ay diskinin üst kenarının ufukta göründüğü an, batış ise tamamen kaybolduğu andır. Hesapta
            atmosferin ışığı kırarak ayı olduğundan biraz yüksek göstermesi de hesaba katılır.
          </li>
          <li>
            Saatler il merkezi için ve düz, açık bir ufuk varsayılarak hesaplanır. Dağlar, binalar ya da hava koşulları
            nedeniyle ayı birkaç dakika geç görebilirsiniz.
          </li>
          <li>Sayfa saatte bir kendiliğinden güncellenir.</li>
        </ul>
      </Prose>
    </article>
  );
}
