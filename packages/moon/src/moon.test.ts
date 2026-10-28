import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findProvince,
  getVoidOfCoursePeriods,
  getCurrentSignIngress,
  getMoonSign,
  getMoonSignIngresses,
  getSunSign,
  getCrescentEvenings,
  getLocalSolarEclipse,
  getUpcomingSolarEclipses,
  getFullMoonsOfYear,
  getMoonDistanceKm,
  getUpcomingLunarEclipses,
  getMonthCalendar,
  getNextBlueMoon,
  getDarkNight,
  getDaytimeMoon,
  getMoonAltitude,
  getMoonPosition,
  getNextMoonEvent,
  getLunation,
  getMoonPhase,
  getMoonRiseSet,
  getNextFullMoon,
  getNextNewMoon,
  getUpcomingPrincipalPhases,
  ISTANBUL,
  TURKEY_PROVINCES,
} from "./index.ts";
import { localDayRange } from "./time.ts";

const TZ = "Europe/Istanbul";
const MINUTE = 60_000;

/** Beklenen anlarla en fazla `minutes` dakika fark olmalı. */
function assertNear(actual: Date, expectedIso: string, minutes: number) {
  const diff = Math.abs(actual.getTime() - new Date(expectedIso).getTime()) / MINUTE;
  assert.ok(diff <= minutes, `${actual.toISOString()} ile ${expectedIso} arasında ${diff.toFixed(1)} dk fark var`);
}

describe("localDayRange", () => {
  it("İstanbul günü UTC'de bir önceki gün 21:00'de başlar", () => {
    const { start, end } = localDayRange(new Date("2026-10-27T12:00:00Z"), TZ);
    assert.equal(start.toISOString(), "2026-10-26T21:00:00.000Z");
    assert.equal(end.toISOString(), "2026-10-27T21:00:00.000Z");
  });

  it("yaz saatine geçilen gün 23 saat sürer (Berlin)", () => {
    const { start, end } = localDayRange(new Date("2026-03-29T12:00:00Z"), "Europe/Berlin");
    assert.equal(start.toISOString(), "2026-03-28T23:00:00.000Z");
    assert.equal(end.toISOString(), "2026-03-29T22:00:00.000Z");
  });

  it("ay ve yıl sonunu doğru geçer", () => {
    const { end } = localDayRange(new Date("2026-12-31T12:00:00Z"), TZ);
    assert.equal(end.toISOString(), "2026-12-31T21:00:00.000Z");
  });
});

describe("ana evre anları", () => {
  // Referans: NASA/USNO ay evresi tabloları (UTC).
  it("27 Ekim 2026'dan sonraki dolunay 24 Kasım 2026 14:53 UTC", () => {
    assertNear(getNextFullMoon(new Date("2026-10-27T12:00:00Z")), "2026-11-24T14:53:00Z", 5);
  });

  it("27 Ekim 2026'dan sonraki yeni ay 9 Kasım 2026 07:02 UTC", () => {
    assertNear(getNextNewMoon(new Date("2026-10-27T12:00:00Z")), "2026-11-09T07:02:00Z", 5);
  });
});

describe("getMoonPhase", () => {
  it("dolunay anının düştüğü yerel gün 'Dolunay' adını alır", () => {
    // 26 Ekim 2026 dolunayı 04:12 UTC = 07:12 İstanbul. Günün akşamı da hâlâ dolunay günüdür.
    const phase = getMoonPhase(new Date("2026-10-26T19:00:00Z"), TZ);
    assert.equal(phase.key, "full-moon");
    assert.equal(phase.name, "Dolunay");
  });

  it("dolunaydan bir gün önce ve sonra ara evre adı verilir", () => {
    assert.equal(getMoonPhase(new Date("2026-10-25T12:00:00Z"), TZ).key, "waxing-gibbous");
    assert.equal(getMoonPhase(new Date("2026-10-27T12:00:00Z"), TZ).key, "waning-gibbous");
  });

  it("aynı an, farklı saat diliminde farklı güne düşebilir", () => {
    // 26 Ekim 04:12 UTC, Los Angeles'ta hâlâ 25 Ekim akşamıdır.
    const at = new Date("2026-10-26T03:00:00Z");
    assert.equal(getMoonPhase(at, "America/Los_Angeles").key, "full-moon");
    assert.equal(getMoonPhase(at, TZ).key, "full-moon");
    assert.equal(getMoonPhase(new Date("2026-10-26T22:00:00Z"), TZ).key, "waning-gibbous");
  });

  it("yeni ayda aydınlanma ~%0, dolunayda ~%100", () => {
    assert.ok(getMoonPhase(new Date("2026-11-09T07:02:00Z"), TZ).illumination < 0.01);
    assert.ok(getMoonPhase(new Date("2026-11-24T14:53:00Z"), TZ).illumination > 0.99);
  });

  it("ay yaşı yeni aydan sonra sıfırlanır ve büyüme yönü doğru", () => {
    const justAfter = getMoonPhase(new Date("2026-11-09T19:02:00Z"), TZ);
    assert.ok(justAfter.ageDays > 0.4 && justAfter.ageDays < 0.6, `yaş ${justAfter.ageDays}`);
    assert.equal(justAfter.isWaxing, true);
    assert.equal(getMoonPhase(new Date("2026-10-30T12:00:00Z"), TZ).isWaxing, false);
  });

  it("bir ay boyunca sekiz evrenin hepsi görülür", () => {
    const seen = new Set<string>();
    for (let day = 0; day < 30; day++) {
      seen.add(getMoonPhase(new Date(Date.UTC(2026, 10, 1 + day, 9)), TZ).key);
    }
    assert.equal(seen.size, 8);
  });
});

describe("getUpcomingPrincipalPhases", () => {
  it("ana evreleri sırayla ve doğru anlarda verir", () => {
    const phases = getUpcomingPrincipalPhases(new Date("2026-10-27T12:00:00Z"), 5);
    assert.deepEqual(
      phases.map((p) => p.key),
      ["last-quarter", "new-moon", "first-quarter", "full-moon", "last-quarter"],
    );
    assert.equal(phases[1].name, "Yeni Ay");
    assertNear(phases[1].date, "2026-11-09T07:02:00Z", 5);
    assertNear(phases[3].date, "2026-11-24T14:53:00Z", 5);
  });

  it("ardışık ana evreler arasında 6-9 gün vardır", () => {
    const phases = getUpcomingPrincipalPhases(new Date("2027-01-01T00:00:00Z"), 12);
    for (let i = 1; i < phases.length; i++) {
      const days = (phases[i].date.getTime() - phases[i - 1].date.getTime()) / 86_400_000;
      assert.ok(days > 6 && days < 9, `${days.toFixed(2)} gün`);
    }
  });
});

describe("getLunation", () => {
  it("27 Ekim 2026, 10 Ekim yeni ayıyla başlayıp 9 Kasım yeni ayıyla biten döngüdedir", () => {
    const l = getLunation(new Date("2026-10-27T12:00:00Z"));
    assert.equal(l.start.toISOString().slice(0, 10), "2026-10-10");
    assertNear(l.end, "2026-11-09T07:02:00Z", 5);
    assert.deepEqual(
      l.phases.map((p) => p.key),
      ["first-quarter", "full-moon", "last-quarter", "new-moon"],
    );
  });
});

describe("getMoonRiseSet", () => {
  it("doğuş ve batış saatleri istenen yerel günün içindedir", () => {
    const date = new Date("2026-10-27T12:00:00Z");
    const { start, end } = localDayRange(date, TZ);
    const { rise, set } = getMoonRiseSet(date, ISTANBUL);
    for (const t of [rise, set]) {
      assert.ok(t, "değer null olmamalı");
      assert.ok(t >= start && t < end);
    }
  });

  it("dolunay günü ay akşam doğar, sabah batar", () => {
    const { rise, set } = getMoonRiseSet(new Date("2026-10-26T12:00:00Z"), ISTANBUL);
    assert.ok(rise && set);
    const hour = (d: Date) => Number(d.toLocaleString("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }));
    assert.ok(hour(rise) >= 16 && hour(rise) <= 19, `doğuş saati ${hour(rise)}`);
    assert.ok(hour(set) >= 5 && hour(set) <= 9, `batış saati ${hour(set)}`);
  });

  it("ay doğmayan ve batmayan günler doğru bulunur (Kasım 2026)", () => {
    // 30 günlük pencere, ayın ~29,5 günlük döngüsünden uzun olduğu için iki "doğuşsuz" gün yakalar.
    const missing: string[] = [];
    for (let day = 0; day < 30; day++) {
      const date = new Date(Date.UTC(2026, 10, 1 + day, 9));
      const { rise, set } = getMoonRiseSet(date, ISTANBUL);
      const label = date.toISOString().slice(0, 10);
      if (!rise) missing.push(`${label} doğuş yok`);
      if (!set) missing.push(`${label} batış yok`);
    }
    assert.deepEqual(missing, ["2026-11-02 doğuş yok", "2026-11-17 batış yok", "2026-11-30 doğuş yok"]);
  });
});

describe("TURKEY_PROVINCES", () => {
  it("81 il var, plaka ve adresler benzersiz", () => {
    assert.equal(TURKEY_PROVINCES.length, 81);
    assert.equal(new Set(TURKEY_PROVINCES.map((p) => p.plate)).size, 81);
    assert.equal(new Set(TURKEY_PROVINCES.map((p) => p.slug)).size, 81);
  });

  it("koordinatlar Türkiye sınırları içinde", () => {
    for (const p of TURKEY_PROVINCES) {
      assert.ok(p.latitude > 35.8 && p.latitude < 42.2, `${p.name} enlemi`);
      assert.ok(p.longitude > 25.6 && p.longitude < 44.9, `${p.name} boylamı`);
    }
  });

  it("Türkçe karakterli adlar sade adreslere çevrilir", () => {
    assert.equal(findProvince("sanliurfa")?.name, "Şanlıurfa");
    assert.equal(findProvince("igdir")?.name, "Iğdır");
    assert.equal(findProvince("istanbul")?.name, "İstanbul");
    assert.equal(findProvince("yok-boyle-il"), undefined);
  });

  it("Türk alfabesine göre sıralı (Ç, C'den sonra gelir)", () => {
    const names = TURKEY_PROVINCES.map((p) => p.name);
    assert.ok(names.indexOf("Çanakkale") > names.indexOf("Bursa"));
    assert.ok(names.indexOf("Çanakkale") < names.indexOf("Denizli"));
  });

  it("doğudaki illerde ay, batıdakilerden önce doğar", () => {
    const date = new Date("2026-10-27T12:00:00Z");
    const van = getMoonRiseSet(date, findProvince("van")!).rise!;
    const edirne = getMoonRiseSet(date, findProvince("edirne")!).rise!;
    const diffMinutes = (edirne.getTime() - van.getTime()) / MINUTE;
    assert.ok(diffMinutes > 50 && diffMinutes < 80, `fark ${diffMinutes.toFixed(0)} dk`);
  });
});

describe("getMoonAltitude", () => {
  it("İstanbul'da kış dolunayı yüksekte, yaz dolunayı alçakta görülür", () => {
    // Gece boyunca (yerel 18:00-06:00) en yüksek konum.
    const maxAltitude = (eveningUtc: string) => {
      let max = -90;
      for (let m = 0; m <= 12 * 60; m += 10) {
        max = Math.max(max, getMoonAltitude(new Date(new Date(eveningUtc).getTime() + m * MINUTE), ISTANBUL));
      }
      return max;
    };
    assert.ok(maxAltitude("2026-12-24T15:00:00Z") > 65);
    assert.ok(maxAltitude("2027-06-19T15:00:00Z") < 25);
  });
});

describe("getMonthCalendar", () => {
  it("Kasım 2026: 30 gün, pazar başlar, ana evreler doğru günlerde", () => {
    const days = getMonthCalendar(2026, 11, TZ);
    assert.equal(days.length, 30);
    assert.equal(days[0].weekday, 6);
    const principal = days.filter((d) => d.principal).map((d) => `${d.day}:${d.principal!.key}`);
    assert.deepEqual(principal, ["1:last-quarter", "9:new-moon", "17:first-quarter", "24:full-moon"]);
    assert.equal(days[23].phase.key, "full-moon");
  });

  it("artık yıl şubatı 29 gündür", () => {
    assert.equal(getMonthCalendar(2028, 2, TZ).length, 29);
  });
});

describe("getNextBlueMoon", () => {
  it("bir takvim ayındaki ikinci dolunayı bulur", () => {
    const blue = getNextBlueMoon(new Date("2026-10-27T00:00:00Z"), TZ);
    assert.ok(blue);
    const prevMonthFull = getMonthCalendar(
      Number(blue.date.toISOString().slice(0, 4)),
      Number(blue.date.toISOString().slice(5, 7)),
      TZ,
    ).filter((d) => d.principal?.key === "full-moon");
    assert.equal(prevMonthFull.length, 2);
  });
});

describe("events", () => {
  it("2026'nın ilk ay tutulması 3 Mart'taki tam tutulmadır", () => {
    const [first] = getUpcomingLunarEclipses(new Date("2026-01-01T00:00:00Z"), 1);
    assert.equal(first.kind, "total");
    assertNear(first.peak, "2026-03-03T11:33:00Z", 10);
  });

  it("2027'de 12 dolunay var, en yakını ocakta", () => {
    const fulls = getFullMoonsOfYear(2027);
    assert.equal(fulls.length, 12);
    const closest = fulls.reduce((a, b) => (getMoonDistanceKm(a.date) < getMoonDistanceKm(b.date) ? a : b));
    assert.equal(closest.date.toISOString().slice(0, 7), "2027-01");
  });

  it("ay-Dünya uzaklığı makul aralıkta", () => {
    const d = getMoonDistanceKm(new Date("2026-10-27T12:00:00Z"));
    assert.ok(d > 356_000 && d < 407_000);
  });
});

describe("solar eclipses", () => {
  it("2 Ağustos 2027 tam güneş tutulması, İstanbul'dan parçalı (%50-70) görülür", () => {
    const global = getUpcomingSolarEclipses(new Date("2027-07-01T00:00:00Z"), 1)[0];
    assert.equal(global.kind, "total");
    assert.equal(global.peak.toISOString().slice(0, 10), "2027-08-02");
    const local = getLocalSolarEclipse(new Date("2027-07-01T00:00:00Z"), ISTANBUL);
    assert.equal(local.kind, "partial");
    assert.ok(local.obscuration > 0.5 && local.obscuration < 0.7, `örtülme ${local.obscuration}`);
    assert.ok(local.peakSunAltitude > 0);
  });

  it("12 Ağustos 2026 tutulması İstanbul'dan görülmez (bir sonraki görülen 2027'dedir)", () => {
    const local = getLocalSolarEclipse(new Date("2026-08-01T00:00:00Z"), ISTANBUL);
    assert.equal(local.peak.getUTCFullYear(), 2027);
  });
});

describe("getCrescentEvenings", () => {
  it("yeni aydan önceki akşam ölçüt karşılanmaz, sonraki akşamlarda hilal yükselir", () => {
    const ankara = findProvince("ankara")!;
    const evenings = getCrescentEvenings(new Date("2026-01-18T19:52:39Z"), ankara);
    assert.equal(evenings.length, 4);
    assert.equal(evenings[0].meetsCriteria, false);
    assert.ok(evenings[0].ageHours < 0);
    assert.ok(evenings[2].meetsCriteria);
    assert.ok(evenings[2].moonAltitude > evenings[1].moonAltitude);
  });
});

describe("zodiac", () => {
  it("dolunayda ay, Güneş'in karşı burcundadır (26 Ekim 2026: Güneş Akrep'te, ay Boğa'da)", () => {
    const sign = getMoonSign(new Date("2026-10-26T04:12:00Z"));
    assert.equal(sign.name, "Boğa");
  });

  it("burç geçişleri sırayla ve 2-3 gün arayla gelir", () => {
    const list = getMoonSignIngresses(new Date("2026-10-27T00:00:00Z"), 12);
    for (let i = 1; i < list.length; i++) {
      assert.equal(list[i].sign.index, (list[i - 1].sign.index + 1) % 12);
      const days = (list[i].date.getTime() - list[i - 1].date.getTime()) / 86_400_000;
      assert.ok(days > 1.9 && days < 2.9, `${days.toFixed(2)} gün`);
    }
  });

  it("geçiş anında burç değişir", () => {
    const [first] = getMoonSignIngresses(new Date("2026-10-27T00:00:00Z"), 1);
    const before = getMoonSign(new Date(first.date.getTime() - 60_000));
    const after = getMoonSign(new Date(first.date.getTime() + 60_000));
    assert.notEqual(before.index, after.index);
    assert.equal(after.index, first.sign.index);
  });

  it("içinde bulunulan burca giriş anı verilen andan öncedir", () => {
    const now = new Date("2026-10-27T12:00:00Z");
    const current = getCurrentSignIngress(now);
    assert.ok(current.date <= now);
    assert.equal(current.sign.index, getMoonSign(now).index);
  });
});

describe("getSunSign", () => {
  it("27 Ekim Akrep, 1 Ocak Oğlak, 21 Mart Koç", () => {
    assert.equal(getSunSign(new Date("2026-10-27T12:00:00Z")).name, "Akrep");
    assert.equal(getSunSign(new Date("2027-01-01T12:00:00Z")).name, "Oğlak");
    assert.equal(getSunSign(new Date("2027-03-22T12:00:00Z")).name, "Koç");
  });
});

describe("getVoidOfCoursePeriods", () => {
  // Yayımlanmış takvimlerle karşılaştırıldı (authorityastrology.com, Kasım 2026).
  it("Kasım 2026'nın en uzun boşluğu: Başak'tan Terazi'ye, 31 saati aşkın", () => {
    const v = getVoidOfCoursePeriods(new Date("2026-11-04T00:00:00Z"), 1)[0];
    assert.equal(v.nextSign.name, "Terazi");
    const hours = (v.end.getTime() - v.start.getTime()) / 3_600_000;
    assert.ok(hours > 31 && hours < 32.5, `${hours.toFixed(1)} saat`);
  });

  it("24 Kasım 2026: Boğa'dan İkizler'e yaklaşık 1 saatlik boşluk", () => {
    const v = getVoidOfCoursePeriods(new Date("2026-11-24T00:00:00Z"), 1)[0];
    assert.equal(v.nextSign.name, "İkizler");
    const hours = (v.end.getTime() - v.start.getTime()) / 3_600_000;
    assert.ok(hours > 0.7 && hours < 1.3, `${hours.toFixed(2)} saat`);
  });
});

describe("getMoonPosition", () => {
  it("dolunay gecesi yarısında ay güneyde ve yüksekte, doğarken doğu tarafında", () => {
    // 26 Ekim 2026 dolunayından sonraki gece (İstanbul 02:00); ay o sırada güneyden geçer.
    const midnight = getMoonPosition(new Date("2026-10-26T23:00:00Z"), ISTANBUL);
    assert.ok(midnight.azimuth > 150 && midnight.azimuth < 210, `azimut ${midnight.azimuth}`);
    assert.ok(midnight.altitude > 30, `yükseklik ${midnight.altitude}`);
    const rise = getNextMoonEvent(new Date("2026-10-27T12:00:00Z"), ISTANBUL, "rise")!;
    const atRise = getMoonPosition(rise, ISTANBUL);
    assert.ok(atRise.azimuth > 45 && atRise.azimuth < 135, `doğuş azimutu ${atRise.azimuth}`);
    assert.ok(Math.abs(atRise.altitude) < 1);
  });
});

describe("getDarkNight", () => {
  it("yeni ay gecesi (9 Kasım 2026, İstanbul) neredeyse bütün astronomik gece karanlık", () => {
    const n = getDarkNight(new Date("2026-11-09T12:00:00Z"), ISTANBUL);
    assert.ok(n.dusk && n.dawn);
    const night = (n.dawn!.getTime() - n.dusk!.getTime()) / 60_000;
    assert.ok(night > 600 && night < 700, `astronomik gece ${night} dk`);
    assert.ok(n.minutes > night - 60, `karanlık ${n.minutes} dk`);
  });

  it("dolunay gecesi (24 Kasım 2026, İstanbul) karanlık yok ya da çok kısa", () => {
    const n = getDarkNight(new Date("2026-11-24T12:00:00Z"), ISTANBUL);
    assert.ok(n.minutes < 30, `karanlık ${n.minutes} dk`);
  });

  it("karanlık aralıklar astronomik gecenin içinde ve ay o sırada ufkun altında", () => {
    for (let d = 0; d < 30; d++) {
      const n = getDarkNight(new Date(Date.UTC(2026, 10, 1 + d, 12)), ISTANBUL);
      for (const r of n.dark) {
        assert.ok(r.start >= n.dusk! && r.end <= n.dawn!);
        const mid = new Date((r.start.getTime() + r.end.getTime()) / 2);
        assert.ok(getMoonAltitude(mid, ISTANBUL) < 0.5, `gün ${d + 1}`);
      }
    }
  });
});

describe("getDaytimeMoon", () => {
  it("ilk dördünde (17 Kasım 2026, İstanbul) ay öğleden sonra güneydoğu-güney tarafında görülür", () => {
    const d = getDaytimeMoon(new Date("2026-11-17T09:00:00Z"), ISTANBUL);
    assert.ok(d.windows.length > 0 && d.best);
    const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hourCycle: "h23" }).format(d.best!.date));
    assert.ok(hour >= 12, `en iyi saat ${hour}`);
    assert.ok(d.best!.azimuth > 90 && d.best!.azimuth < 230, `azimut ${d.best!.azimuth}`);
  });

  it("son dördünde (1 Kasım 2026, İstanbul) ay sabah batı tarafında görülür", () => {
    const d = getDaytimeMoon(new Date("2026-11-01T09:00:00Z"), ISTANBUL);
    assert.ok(d.windows.length > 0 && d.best);
    const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hourCycle: "h23" }).format(d.windows[0].start));
    assert.ok(hour < 11, `başlangıç saati ${hour}`);
  });

  it("yeni ayda (9 Kasım 2026) ay gündüz görülmez", () => {
    const d = getDaytimeMoon(new Date("2026-11-09T09:00:00Z"), ISTANBUL);
    assert.equal(d.windows.length, 0);
  });
});
