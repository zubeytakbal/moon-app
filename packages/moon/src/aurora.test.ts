import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AURORA_DESTINATIONS, geomagneticLatitude, getAuroraNight, getDarkMinutes } from "./aurora.ts";
import { ISTANBUL } from "./location.ts";

const tromso = AURORA_DESTINATIONS.find((d) => d.slug === "tromso")!;

describe("kuzey ışıkları gece koşulları", () => {
  it("Tromsø: yeni ay gecesi çok iyi, dolunay gecesi ay ışığı, yaz ortası karanlık yok", () => {
    assert.equal(getAuroraNight(new Date("2026-11-09T12:00:00Z"), tromso).rating, "cok-iyi");
    assert.equal(getAuroraNight(new Date("2026-11-24T12:00:00Z"), tromso).rating, "ay-isigi");
    assert.equal(getAuroraNight(new Date("2027-06-21T12:00:00Z"), tromso).rating, "karanlik-yok");
  });

  it("karanlık süresi: Tromsø aralıkta ~16 saat, haziranda 0", () => {
    assert.ok(Math.abs(getDarkMinutes(new Date("2026-12-21T12:00:00Z"), tromso) / 60 - 15.8) < 0.6);
    assert.equal(getDarkMinutes(new Date("2027-06-21T12:00:00Z"), tromso), 0);
  });

  it("jeomanyetik enlem: İstanbul ~38-39°, Tromsø ~67°", () => {
    assert.ok(Math.abs(geomagneticLatitude(ISTANBUL) - 38.6) < 0.5);
    assert.ok(Math.abs(geomagneticLatitude(tromso) - 67.5) < 0.5);
  });
});
