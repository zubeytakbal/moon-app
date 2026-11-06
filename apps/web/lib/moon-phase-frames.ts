/**
 * `public/moon/phases/pNN-*.webp` görüntülerinde aydınlık kenarın konum açısı (gök kuzeyinden doğuya, derece).
 * `scripts/build-moon-phases.mjs` üretir; elle değiştirmeyin.
 */
export const PHASE_FRAME_LIMB = [325.5, 249.9, 248.3, 304.2, 301.6, 250.5, 247.7, 247.3, 295.9, 296.2, 294.9, 294.5, 294.6, 293.3, 293.5, 291.4, 291.9, 247.3, 290.3, 290.7, 248.2, 291.9, 248.6, 249.2, 291.3, 292.2, 291.3, 252.8, 253.7, 264.9, 138.9, 119, 123, 61.3, 60.1, 114.6, 114.4, 115.6, 64.7, 64.2, 113, 65.5, 65.7, 66, 113.9, 113.4, 66.9, 112.7, 112.5, 67.7, 69.7, 68.8, 111.4, 110.2, 68.1, 68.8, 67.1, 106, 97.7, 88.1] as const;

/** Görüntüler arasındaki evre açısı adımı (derece). */
export const PHASE_FRAME_STEP = 6;
