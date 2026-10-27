/** Hesapların yapıldığı gözlem noktası. */
export interface GeoLocation {
  /** Ekranda gösterilecek ad, örn. "İstanbul". */
  name: string;
  /** Enlem (derece, kuzey pozitif). Güney yarımküre için negatif. */
  latitude: number;
  /** Boylam (derece, doğu pozitif). */
  longitude: number;
  /** Deniz seviyesinden yükseklik (metre). */
  elevation: number;
  /** IANA saat dilimi, örn. "Europe/Istanbul". */
  timeZone: string;
}

/** Varsayılan konum. */
export const ISTANBUL: GeoLocation = {
  name: "İstanbul",
  latitude: 41.0082,
  longitude: 28.9784,
  elevation: 0,
  timeZone: "Europe/Istanbul",
};

/** Güney yarımkürede ay, kuzeye göre ters (sağ-sol yer değiştirmiş) görünür. */
export function isSouthernHemisphere(location: GeoLocation): boolean {
  return location.latitude < 0;
}
