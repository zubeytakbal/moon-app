import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ISTANBUL } from "./location.ts";
import { getVisiblePlanets } from "./planets.ts";

describe("bu gece görünen gezegenler", () => {
  it("15 Ocak 2027 İstanbul: Venüs sabah gökyüzünde, en parlak; Jüpiter de görünür", () => {
    const v = getVisiblePlanets(new Date("2027-01-15T12:00:00Z"), ISTANBUL);
    assert.equal(v[0].name, "Venüs");
    assert.equal(v[0].when, "sabah");
    assert.ok(v.some((p) => p.name === "Jüpiter"));
  });
});
