import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDayLength, getEquiluxDay, getExtremeDay } from "./daylight.ts";
import { getSeasons } from "./events.ts";
import { ISTANBUL } from "./location.ts";
import { findPlace } from "./places-abroad.ts";

const minutesApart = (a: Date, iso: string) => Math.abs(a.getTime() - new Date(iso).getTime()) / 60_000;

describe("ekinoks ve gündönümü", () => {
  it("2026-2027 anları USNO ile 2 dakika içinde", () => {
    const s26 = getSeasons(2026);
    assert.ok(minutesApart(s26.marchEquinox, "2026-03-20T14:46Z") <= 2);
    assert.ok(minutesApart(s26.juneSolstice, "2026-06-21T08:24Z") <= 2);
    assert.ok(minutesApart(s26.septemberEquinox, "2026-09-23T00:05Z") <= 2);
    assert.ok(minutesApart(s26.decemberSolstice, "2026-12-21T20:50Z") <= 2);
    const s27 = getSeasons(2027);
    assert.ok(minutesApart(s27.decemberSolstice, "2027-12-22T02:42Z") <= 2);
  });
});

describe("gün uzunluğu", () => {
  it("Berlin'de en uzun gün ~16 sa 50 dk, en kısa ~7 sa 39 dk", () => {
    const s = getSeasons(2026);
    const berlin = findPlace("berlin")!;
    assert.ok(Math.abs(getExtremeDay(s.juneSolstice, berlin, "max").minutes - 1010) <= 3);
    assert.ok(Math.abs(getExtremeDay(s.decemberSolstice, berlin, "min").minutes - 459) <= 3);
  });

  it("ekinoks günü gündüz 12 saatten uzun, eşit gün Mart ekinoksundan önce (İstanbul)", () => {
    const s = getSeasons(2026);
    const eq = getDayLength(s.marchEquinox, ISTANBUL);
    assert.ok(eq.minutes > 722 && eq.minutes < 735, `${eq.minutes}`);
    const equilux = getEquiluxDay(s.marchEquinox, ISTANBUL);
    assert.ok(equilux.noon < s.marchEquinox);
    assert.ok(Math.abs(equilux.minutes - 720) < 3);
  });

  it("Tromsø: yaz ortası kutup günü, kış ortası kutup gecesi", () => {
    const s = getSeasons(2026);
    const tromso = { name: "Tromsø", latitude: 69.65, longitude: 18.96, elevation: 0, timeZone: "Europe/Oslo" };
    assert.equal(getDayLength(s.juneSolstice, tromso).polar, "day");
    assert.equal(getDayLength(s.decemberSolstice, tromso).polar, "night");
  });
});
