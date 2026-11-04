import type { FaqItem } from "@/lib/faqs";

/**
 * İngilizce sayfaların SSS'leri. Türkçedeki kural aynen: yalnız Google otomatik tamamlamasında gerçekten sorulan ve
 * sayfanın gövdesinde cevaplanmamış sorular; her sayfanın soruları farklı. Sayılar kendi hesabımızdır.
 */
export const EN_FAQS = {
  // Kaynak: research/sonuclar/2026-11-04-en-{us,in,gb,au}-sunrise-time_*.csv ("how long does sunrise take",
  // "is golden hour before sunset", "what is first light vs sunrise", "why is the sunset red today").
  sunriseSunset: [
    {
      q: "How long does a sunrise or sunset take?",
      a: "From the moment the sun's disk first touches the horizon until it has fully set takes about 2 minutes near the equator (Singapore, Mumbai), about 3 minutes in New York, 3½ to 4½ minutes in London and over 5 minutes in Edinburgh around the solstices. The farther you are from the equator, the shallower the sun's path through the horizon, so the slower it sinks; in Anchorage it takes about 8 minutes in June.",
    },
    {
      q: "Is golden hour before or after sunset?",
      a: "The evening golden hour comes before sunset: it starts when the sun is about 6° above the horizon and ends as it sets. There's a morning one too, from sunrise until the sun climbs to 6°. Despite the name it's rarely a full hour: about half an hour in the tropics (Singapore, Mumbai), 35 to 45 minutes in New York, and close to an hour in London, where it's longest in winter, when the sun sets at a shallow angle.",
    },
    {
      q: "What is first light, and how early is it before sunrise?",
      a: "First light is the start of civil twilight, when the sun is 6° below the horizon and the sky is bright enough to see without a lamp. It comes about 21 to 24 minutes before sunrise near the equator, about half an hour before it in New York, and 40 to 60 minutes before it in London or Edinburgh in summer. In the evening, the same moment is what we call \"dark at\".",
    },
    {
      q: "Why is the sunset red?",
      a: "Sunlight is a mix of all colors, and air scatters blue light much more than red; that's why the daytime sky is blue. Near the horizon, the sun's light crosses far more air to reach you, so most of the blue is scattered away and the oranges and reds are left. Dust, smoke or sea salt in the air can deepen the colors.",
    },
  ],
} as const satisfies Record<string, readonly FaqItem[]>;
