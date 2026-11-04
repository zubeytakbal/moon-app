import assert from "node:assert/strict";
import { test } from "node:test";
import { getMoonView } from "./moon-view.ts";

// 12 Kasım 2026 akşamı büyüyen hilal; gün batımından ~30 dk sonra.
const at = (iso: string, name: string, latitude: number, longitude: number, timeZone: string) =>
  getMoonView(new Date(iso), { name, latitude, longitude, elevation: 0, timeZone });

test("Akşam hilali: kuzeyde aydınlık kenar sağ altta, güneyde sol altta, ekvatorda altta", () => {
  const ny = at("2026-11-12T22:10:00Z", "New York", 40.71, -74.01, "America/New_York");
  const sydney = at("2026-11-12T09:05:00Z", "Sydney", -33.87, 151.21, "Australia/Sydney");
  const singapore = at("2026-11-12T11:35:00Z", "Singapore", 1.29, 103.85, "Asia/Singapore");
  assert.ok(ny.brightLimb > 200 && ny.brightLimb < 290, `NY ${ny.brightLimb}`);
  assert.ok(sydney.brightLimb > 100 && sydney.brightLimb < 180, `Sydney ${sydney.brightLimb}`);
  assert.ok(singapore.brightLimb > 170 && singapore.brightLimb < 230, `Singapur ${singapore.brightLimb}`);
  assert.ok(ny.altitude > 0 && sydney.altitude > 0 && singapore.altitude > 0);
});
