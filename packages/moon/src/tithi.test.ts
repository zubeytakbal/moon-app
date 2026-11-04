import assert from "node:assert/strict";
import { test } from "node:test";
import { getTithi } from "./tithi.ts";

test("Tithi: 4 Kasım 2026 (ay yaşı ~24,8 gün) Krishna Ekadashi, 12° aralığın başı ve sonu çevresinde", () => {
  const t = getTithi(new Date("2026-11-04T12:00:00Z"));
  assert.equal(t.number, 26);
  assert.equal(t.paksha, "Krishna");
  assert.equal(t.name, "Ekadashi");
  assert.ok(t.start < new Date("2026-11-04T12:00:00Z") && t.end > new Date("2026-11-04T12:00:00Z"));
  const hours = (t.end.getTime() - t.start.getTime()) / 3_600_000;
  assert.ok(hours > 19 && hours < 27, `süre ${hours}`);
});

test("Tithi: dolunay anı Purnima'nın sonu, yeni ay anı Amavasya'nın sonudur", () => {
  // 24 Kasım 2026 14:53 UT dolunay; hemen öncesi Purnima (15), hemen sonrası Krishna Pratipada (16).
  assert.equal(getTithi(new Date("2026-11-24T14:00:00Z")).name, "Purnima");
  assert.equal(getTithi(new Date("2026-11-24T16:00:00Z")).number, 16);
});
