import * as Astronomy from "astronomy-engine";
import type { GeoLocation } from "./location.ts";

const RAD = Math.PI / 180;

export interface MoonView {
  /** Pusula yönü (0 kuzey, 90 doğu) ve ufuktan yükseklik (derece, kırılma dahil). */
  azimuth: number;
  altitude: number;
  /**
   * Aydınlık kenarın yönü, gözlemcinin tepe noktasına (zenit) göre derece: 0 yukarı, 90 sol, 180 aşağı, 270 sağ
   * (saat yönünün tersine). Kuzey yarımkürede akşam hilali ~180-270 (sağ alt), güneyde ~90-180 (sol alt),
   * ekvatorda ~180 (alt: "kayık" hilal). Meeus, Astronomical Algorithms, böl. 14 ve 48 (parallaktik açı ve
   * aydınlık kenarın konum açısı).
   */
  brightLimb: number;
}

/** Ayın verilen anda o yerden görünüşü: yönü, yüksekliği ve aydınlık kenarının hangi tarafta olduğu. */
export function getMoonView(date: Date, location: GeoLocation): MoonView {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevation);
  const moon = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true);
  const sun = Astronomy.Equator(Astronomy.Body.Sun, date, observer, true, true);
  const hor = Astronomy.Horizon(date, observer, moon.ra, moon.dec, "normal");

  const a = moon.ra * 15 * RAD;
  const d = moon.dec * RAD;
  const a0 = sun.ra * 15 * RAD;
  const d0 = sun.dec * RAD;
  // Aydınlık kenarın konum açısı (gök kuzeyinden doğuya doğru).
  const chi = Math.atan2(Math.cos(d0) * Math.sin(a0 - a), Math.sin(d0) * Math.cos(d) - Math.cos(d0) * Math.sin(d) * Math.cos(a0 - a));
  // Parallaktik açı: gök kuzeyi ile tepe noktası arasındaki açı.
  const lst = (Astronomy.SiderealTime(date) * 15 + location.longitude) * RAD;
  const h = lst - a;
  const phi = location.latitude * RAD;
  const q = Math.atan2(Math.sin(h), Math.tan(phi) * Math.cos(d) - Math.sin(d) * Math.cos(h));
  const brightLimb = ((((chi - q) / RAD) % 360) + 360) % 360;
  return { azimuth: hor.azimuth, altitude: hor.altitude, brightLimb };
}
