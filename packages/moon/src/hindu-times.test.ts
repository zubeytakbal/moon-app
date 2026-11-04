import assert from "node:assert/strict";
import { test } from "node:test";
import { getBrahmaMuhurta, getRahuKaal } from "./hindu-times.ts";

const at = (iso: string) => new Date(iso);

test("Rahu Kalam: 12 saatlik gündüzde haftanın gününe göre doğru 90 dakikalık parça", () => {
  const rise = at("2026-03-20T00:30:00Z"); // 06:00 IST
  const set = at("2026-03-20T12:30:00Z"); // 18:00 IST
  // Pazartesi 2. parça: 07:30-09:00 yerel → 02:00-03:30 UTC.
  assert.deepEqual(getRahuKaal(rise, set, 1), { start: at("2026-03-20T02:00:00Z"), end: at("2026-03-20T03:30:00Z") });
  // Pazar 8. (son) parça gün batımında biter.
  assert.equal(getRahuKaal(rise, set, 0)!.end.getTime(), set.getTime());
  // Cumartesi 3. parça: 09:00-10:30 yerel.
  assert.equal(getRahuKaal(rise, set, 6)!.start.toISOString(), "2026-03-20T03:30:00.000Z");
});

test("Rahu Kalam: kutup gününde/gecesinde yok", () => {
  assert.equal(getRahuKaal(null, null, 3), null);
});

test("Brahma Muhurta: doğuştan 96 dk önce başlar, 48 dk önce biter", () => {
  const r = getBrahmaMuhurta(at("2026-11-04T01:05:00Z"))!;
  assert.equal(r.start.toISOString(), "2026-11-03T23:29:00.000Z");
  assert.equal(r.end.toISOString(), "2026-11-04T00:17:00.000Z");
});
