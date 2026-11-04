/* Taekwondo WT / DTU rule profile (6b): what the planner needs – age class and bout format, protection ban after a
   concussion. Sources: DTU Wettkampfordnung Zweikampf (WOZ) 4.1, 7.1–7.3, 17.3 (docs/rules-sources.md R3b) and the WT
   Competition Rules (R3a, Fassung ab 01.06.2026). No weight classes (linked, not copied), no scoring tables.
   ITF-D follows with 6c. Pure data. */

/* Age classes of the year of the tournament (WOZ 4.1): Jugend D 7–8 · C 9–11 · B 12–14 · A 15–17 · adults from 18
   (Senioren from 17, Masters 1 from 35, Masters 2 from 45 – for the planner adults are one class, masters get the 2-minute format). */
export function wtClass(age) {
  if (age == null) return "s"; // nothing entered: adult
  if (age < 7) return null;
  if (age <= 8) return "td";
  if (age <= 11) return "tc";
  if (age <= 14) return "tb";
  if (age <= 17) return "ta";
  return age >= 35 ? "v" : "s";
}
/* round length per class (WOZ 7.1): Senioren and Jugend A 3 × 2 min, Jugend B–D and Masters 3 × 1:30; 1 min break */
const ROUND = { td: 90, tc: 90, tb: 90, ta: 120, s: 120, v: 90 };

/** Official bout format of the age class, or null (under 7). Same signature as the other rule profiles (discipline unused). */
export function wtFormat(_disc, age) {
  const cls = wtClass(age);
  return cls ? { r: 3, w: ROUND[cls], b: 60, cls } : null;
}
export const STD_FORMAT = { r: 3, w: 120, b: 60, cls: null };

/** Protection ban after a concussion in days by age (WOZ 17.3): adults 30, Junioren/Jugend A 40, Jugend B–D 50. */
export function koDaysFor(age) {
  if (age == null || age >= 18) return 30;
  if (age >= 15) return 40;
  return 50;
}

/* ITF-D (6c): age classes of the ITF-D competition rules (WO 2.5, R4b): D-Jugend 6–8 · C-Jugend 9–11 · B-Jugend 12–14 ·
   A-Jugend 15–17 · adults from 18. Round format of the ITF rules (R4c, Fassung 22.03.2026): adults 2 × 2 min / 1 min
   break; 12–13 and 10–11 years 2 × 1:30 / 45 s; 8–9 years 2 × 1 min / 30 s. Under 8: no format. */
export function itfClass(age) {
  if (age == null) return "s";
  if (age < 6) return null;
  if (age <= 8) return "td";
  if (age <= 11) return "tc";
  if (age <= 14) return "tb";
  if (age <= 17) return "ta";
  return "s";
}
export function itfFormat(_style, age) {
  const cls = itfClass(age);
  if (!cls || age < 8) return null;
  if (age >= 14) return { r: 2, w: 120, b: 60, cls };
  if (age >= 10) return { r: 2, w: 90, b: 45, cls };
  return { r: 2, w: 60, b: 30, cls };
}
