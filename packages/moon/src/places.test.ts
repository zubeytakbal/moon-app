import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLocalSolarEclipse } from "./events.ts";
import { ABROAD_CITIES, findPlace, isAbroad } from "./places-abroad.ts";
import { TURKEY_PROVINCES } from "./provinces-tr.ts";

describe("yurt dışı şehirler", () => {
  it("adları 81 ille çakışmaz ve tekildir", () => {
    const slugs = [...TURKEY_PROVINCES, ...ABROAD_CITIES].map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("findPlace hem ili hem yurt dışı şehri bulur", () => {
    const ankara = findPlace("ankara")!;
    assert.equal(ankara.name, "Ankara");
    assert.equal(isAbroad(ankara), false);
    const koln = findPlace("koln")!;
    assert.ok(isAbroad(koln) && koln.country === "Almanya" && koln.timeZone === "Europe/Berlin");
    assert.equal(findPlace("yok-boyle-bir-yer"), undefined);
  });

  it("11 Ağustos 1999: Münih tam tutulma şeridinde (~2 dk), Paris hemen dışında", () => {
    const from = new Date("1999-08-01T00:00:00Z");
    const munich = getLocalSolarEclipse(from, findPlace("munih")!);
    assert.equal(munich.kind, "total");
    assert.ok(munich.centralSeconds > 100 && munich.centralSeconds < 160, `${munich.centralSeconds} sn`);
    const paris = getLocalSolarEclipse(from, findPlace("paris")!);
    assert.equal(paris.kind, "partial");
    assert.ok(paris.obscuration > 0.97);
  });
});
