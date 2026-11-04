/* Boxing rule profile (DBV – Wettkampfbestimmungen für das olympische Boxen, WKB, Stand 01.09.2026, docs/rules-sources.md R2).
   Only what the planner needs is taken over: age class and round format (§46, §47) and the length of the protection
   ban after a knockout (§89). No weight classes, no glove weights – the rules are linked, not copied. */

export const WKB_URL = "https://www.boxverband.de/wp-content/uploads/2026/09/DBV-WKB-Wettkampfbestimmungen.pdf";

/* Age classes by calendar year (§46): age = year of the date − year of birth.
   U13 10–12 · U15 13–14 · U17 15–16 · U19 17–18 · adults 19 up to the year of the 40th birthday. */
export function dbvClass(age) {
  if (age == null) return "a"; // nothing entered: adult
  if (age >= 10 && age <= 12) return "u13";
  if (age >= 13 && age <= 14) return "u15";
  if (age >= 15 && age <= 16) return "u17";
  if (age >= 17 && age <= 18) return "u19";
  if (age >= 19 && age <= 40) return "a";
  return null; // under 10 and over 40: no DBV class
}
/* round length in seconds per class (§47): always 3 rounds, 1 minute break */
const ROUND = { u13: 60, u15: 90, u17: 120, u19: 180, a: 180 };

/* Official bout format of the age class, or null when no DBV class applies. Same signature as the kickboxing rules
   (the discipline is ignored: boxing has none). */
export function dbvFormat(_disc, age) {
  const cls = dbvClass(age);
  return cls ? { r: 3, w: ROUND[cls], b: 60, cls } : null;
}

/* Training format without a tournament: adults and U19 3 × 3 min, younger classes the round length of their class,
   under 10 like U13, over 40 3 × 2 min (training standard, not an official DBV format – `official: false`). */
export function standardFormat(age) {
  const cls = dbvClass(age);
  if (cls) return { r: 3, w: ROUND[cls], b: 60, cls, official: true };
  if (age != null && age < 10) return { r: 3, w: ROUND.u13, b: 60, cls: "u13", official: false };
  return { r: 3, w: 120, b: 60, cls: "m", official: false };
}
export const STD_FORMAT = { r: 3, w: 180, b: 60, cls: null };

/* §89: protection ban after a knockout – at least 30 days, longer when repeated (3 months, 1 year). Contact training
   is not allowed during the ban. The app only takes the first step into account. */
export const KO_DAYS = 30;

export const RULE_PROFILE = {
  publisher: "DBV",
  title: "DBV – Wettkampfbestimmungen (WKB), olympisches Boxen",
  version: "Stand 01.09.2026, in Kraft 01.11.2026",
  url: WKB_URL,
  disciplines: [],
  format: dbvFormat,
  standardFormat: STD_FORMAT,
  koDays: KO_DAYS,
};
