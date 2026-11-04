/* Kickboxing rule profile (WAKO). The bout formats below were taken over unchanged from the app; the exact rule
   edition was not recorded there and is checked when the sources are documented (docs/rules-sources.md). */

export const DISCIPLINES = ["lc", "kl", "fc", "k1"];

/*
 * WAKO bout format by discipline and age (WAKO rules, tatami and ring general rules):
 *   Tatami (LC, KL): younger cadets 10–12 2×1.5 · older cadets 13–15 2×2 · juniors 16–18 3×2 · seniors 19–40 3×2 · masters 41–55 2×2, 1 min breaks
 *   Ring (FC, K1):   juniors 15–18 and seniors 19–40 3×2 with 1 min breaks; no other ring age categories
 * Returns { r: rounds, w: work seconds, b: break seconds, cls: age class } or null when no official format applies.
 */
export function waFormat(disc, age) {
  if (age == null) return null;
  if (disc === "fc" || disc === "k1") return age >= 15 && age <= 40 ? { r: 3, w: 120, b: 60, cls: age <= 18 ? "j" : "s" } : null;
  if (age >= 10 && age <= 12) return { r: 2, w: 90, b: 60, cls: "yc" };
  if (age >= 13 && age <= 15) return { r: 2, w: 120, b: 60, cls: "oc" };
  if (age >= 16 && age <= 18) return { r: 3, w: 120, b: 60, cls: "j" };
  if (age >= 19 && age <= 40) return { r: 3, w: 120, b: 60, cls: "s" };
  if (age >= 41 && age <= 55) return { r: 2, w: 120, b: 60, cls: "v" };
  return null;
}

/** Training default when no official format applies. */
export const STD_FORMAT = { r: 3, w: 120, b: 60, cls: null };

export const RULE_PROFILE = {
  publisher: "WAKO",
  title: "WAKO rules – tatami (LC, KL) and ring (FC, K1)",
  version: null, // not recorded in the existing app – to be documented in docs/rules-sources.md
  disciplines: DISCIPLINES,
  format: waFormat,
  standardFormat: STD_FORMAT,
};
