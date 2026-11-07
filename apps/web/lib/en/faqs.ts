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
  // Kaynak: research/sonuclar/2026-11-04-en-{us,in,gb,au}-moon-phase-today_*.csv ("can't see moon tonight",
  // "does the moon wax or wane first", "how big is the moon tonight", "is the moon bigger tonight").
  moonPhaseToday: [
    {
      q: "Why can't I see the moon tonight?",
      a: "Usually for one of three reasons. Around the new moon it is too close to the sun and lost in its glare for a day or two on either side. Otherwise it may simply not be up yet or already set: a waning moon rises late at night or after midnight, and a young crescent sets soon after sunset. And when it is low, buildings, trees or haze near the horizon can hide it. Check the moonrise and moonset times and the path chart above for your city.",
    },
    {
      q: "Does the moon wax or wane first?",
      a: "It waxes first. After the new moon, the lit part grows night by night (waxing crescent, first quarter, waxing gibbous) until the full moon, then shrinks again (waning gibbous, last quarter, waning crescent) back to the next new moon. One full cycle takes about 29.5 days.",
    },
    {
      q: "Is the moon bigger tonight?",
      a: "Its real size in the sky changes a little, because its orbit is an oval: at its closest (about 356,000 km, 221,000 miles) it looks about 14% wider than at its farthest (about 407,000 km, 253,000 miles). That's what a supermoon is. The much bigger moon you sometimes see near the horizon is an illusion of the eye: measured, the rising moon is no larger than when it is high in the sky. The distance card above shows how far it is today.",
    },
  ],
  // Kaynak: research/sonuclar/2026-11-06-en-{us,in,gb,au}-full-moon_*.csv ("how often is there a full moon",
  // "how many full moons 2027", "does full moon affect sleep", "can full moon cause labor").
  fullMoon: [
    {
      q: "How often is there a full moon?",
      a: "About every 29.5 days, so most years have 12 full moons and some have 13. Because the cycle is a little shorter than most calendar months, every two or three years one month gets two full moons; the second is called a Blue Moon, which is where the phrase \"once in a blue moon\" comes from. February, at 28 or 29 days, is the only month that can have no full moon at all.",
    },
    {
      q: "Does the full moon affect sleep?",
      a: "Possibly a little. In a 2013 sleep-laboratory study, volunteers who could not see the moon slept about 20 minutes less around the full moon, took 5 minutes longer to fall asleep and had 30% less deep sleep, with lower melatonin. It was a single study, and its authors point out that, despite a lot of folklore, no consistent link between the moon's cycle and human body or behavior has been found.",
    },
    {
      q: "Can a full moon cause labor?",
      a: "There is no evidence that it does. A study of 564,039 births in North Carolina over five years found no difference in the number of births, the type of delivery or complications across the eight phases of the moon.",
    },
  ],
  // Kaynak: research/sonuclar/2026-11-06-en-{us,in,gb,au}-solar-eclipse_*.csv ("how long will the next eclipse
  // last", "lunar eclipse vs solar eclipse"). Süreler 2 Ağustos 2027 için kendi hesabımız.
  solarEclipse: [
    {
      q: "How long does a solar eclipse last?",
      a: "From the first bite out of the sun to the last, usually two to three hours; totality itself lasts only a few minutes. On August 2, 2027, for example, the whole eclipse takes about 2 hours 46 minutes in Luxor, Egypt, with 6 minutes 25 seconds of totality, and about 1 hour 56 minutes in London, where it stays partial. The exact times for your city are in the tool at the top of this page.",
    },
    {
      q: "What's the difference between a solar and a lunar eclipse?",
      a: "In a solar eclipse the moon passes between the sun and Earth and blocks the sun; it can only happen at new moon, lasts a few hours and is seen from a limited part of the world. In a lunar eclipse Earth passes between the sun and the moon, and Earth's shadow darkens the full moon, often turning it red; it happens at full moon and is visible from the whole night side of Earth at once. A lunar eclipse is safe to watch with the naked eye; a solar eclipse never is, except during totality.",
    },
  ],
  // Kaynak: research/sonuclar/2026-11-06-en-{us,in,gb,au}-solar-eclipse_*.csv içindeki ay tutulması soruları
  // ("how long does a lunar eclipse last", "blood moon when is the next one", "how often"). Sayılar 2026-2045 hesabımız.
  lunarEclipse: [
    {
      q: "How long does a lunar eclipse last?",
      a: "A total lunar eclipse takes about five and a half to six hours from the first faint dimming to the end, but the parts you really notice are shorter: the moon is partly in Earth's dark shadow for about three and a half hours, and fully red for usually 45 minutes to an hour and a half. The blood moon of June 26, 2029 is a long one, red for about 1 hour 43 minutes.",
    },
    {
      q: "How often is there a blood moon?",
      a: "By our count there are 17 total lunar eclipses between 2026 and 2045, a little under one a year on average, but they come unevenly: there are two in 2029 and none at all in 2027. Any one place sees only some of them, because the moon has to be above your horizon at the time.",
    },
  ],
} as const satisfies Record<string, readonly FaqItem[]>;
