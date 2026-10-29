import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findProvince, getMeteorNight, getShowerPeak, getUpcomingMeteorShowers, METEOR_SHOWERS } from "./index.ts";

const shower = (code: string) => METEOR_SHOWERS.find((s) => s.code === code)!;
const minutesApart = (a: Date, b: string) => Math.abs(a.getTime() - new Date(b).getTime()) / 60_000;

describe("getShowerPeak (IMO Meteor Shower Calendar 2026 ve 2027 ile karşılaştırma)", () => {
  // IMO'nun metinde açıkça verdiği doruk saatleri (UT). IMO saatleri yuvarlak verir; 45 dk pay.
  const cases: [string, number, string][] = [
    ["QUA", 2026, "2026-01-03T21:00Z"],
    ["LYR", 2026, "2026-04-22T19:40Z"],
    ["LEO", 2026, "2026-11-17T23:45Z"],
    ["URS", 2026, "2026-12-22T22:00Z"],
    ["QUA", 2027, "2027-01-04T03:15Z"],
    ["LEO", 2027, "2027-11-18T06:00Z"],
    ["GEM", 2027, "2027-12-14T20:00Z"],
    ["URS", 2027, "2027-12-23T04:00Z"],
  ];
  for (const [code, year, imo] of cases) {
    it(`${code} ${year} ≈ ${imo}`, () => {
      const peak = getShowerPeak(shower(code), year);
      assert.ok(minutesApart(peak, imo) < 45, `${peak.toISOString()} / IMO ${imo}`);
    });
  }

  it("Perseid 2026, IMO'nun 02h-04h UT aralığında", () => {
    const p = getShowerPeak(shower("PER"), 2026);
    assert.ok(p >= new Date("2026-08-13T01:45Z") && p <= new Date("2026-08-13T04:15Z"), p.toISOString());
  });

  it("İkizler 2026, IMO'nun 13 Ara 21h - 14 Ara 18h UT aralığında", () => {
    const p = getShowerPeak(shower("GEM"), 2026);
    assert.ok(p >= new Date("2026-12-13T21:00Z") && p <= new Date("2026-12-14T18:00Z"), p.toISOString());
  });
});

describe("getUpcomingMeteorShowers", () => {
  it("sıralı, `from`dan sonra ve her yağmur yılda bir kez", () => {
    const list = getUpcomingMeteorShowers(new Date("2026-10-29T00:00Z"), 24);
    assert.equal(list.length, 24);
    for (let i = 1; i < list.length; i++) assert.ok(list[i].peak > list[i - 1].peak);
    assert.ok(list[0].peak > new Date("2026-10-29T00:00Z"));
    assert.equal(new Set(list.slice(0, 12).map((s) => s.shower.code)).size, 12);
  });

  it("2026 İkizler'de ay büyüyen hilal, 2027'de dolunay (IMO notu)", () => {
    const list = getUpcomingMeteorShowers(new Date("2026-10-29T00:00Z"), 30).filter((s) => s.shower.code === "GEM");
    assert.ok(list[0].moonIllumination < 0.35, `2026: ${list[0].moonIllumination}`);
    assert.ok(list[1].moonIllumination > 0.9, `2027: ${list[1].moonIllumination}`);
  });
});

describe("getMeteorNight", () => {
  it("İkizler 2026, Ankara: radyant gece doğar, en iyi aralık gece yarısı civarı, ay engellemez", () => {
    const n = getMeteorNight(shower("GEM"), getShowerPeak(shower("GEM"), 2026), findProvince("ankara")!);
    assert.ok(n.best, "en iyi aralık var");
    const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hourCycle: "h23" }).format(n.best!.peakTime));
    assert.ok(hour <= 3 || hour >= 22, `en yoğun saat ${hour}`);
    assert.ok(n.best!.rate.koy > n.best!.rate.kenar && n.best!.rate.kenar > n.best!.rate.sehir);
    assert.ok(n.best!.rate.karanlik > 80 && n.best!.rate.karanlik <= 150, `karanlık ${n.best!.rate.karanlik}`);
    assert.ok(n.moonIllumination < 0.35);
    // Büyüyen hilal akşam batar: gecenin çoğu aysız.
    assert.ok(n.moonUpMinutes <= 270, `ay ${n.moonUpMinutes} dk ufukta`);
  });

  it("Perseid 2026, İstanbul: en yoğun saat sabaha karşı", () => {
    const n = getMeteorNight(shower("PER"), getShowerPeak(shower("PER"), 2026), findProvince("istanbul")!);
    const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", hourCycle: "h23" }).format(n.best!.peakTime));
    assert.ok(hour >= 2 && hour <= 5, `en yoğun saat ${hour}`);
  });
});
