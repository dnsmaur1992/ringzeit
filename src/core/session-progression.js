/* Final effort controls the next session of its own category. Pure shared decision functions.
   Percentages are planning impulses for density, not measurements of physiological load. */
export const effortFace = rpe => Number.isFinite(rpe) && rpe >= 1 && rpe <= 10 ? Math.ceil(rpe / 2) * 2 : null;
export function effortRequest(rpe, choice = "hold") {
  const face = effortFace(rpe);
  if (face === 2) return 10;
  if (face === 4) return 5;
  if (![6,8,10].includes(face) || !["hold","change"].includes(choice)) return null;
  return choice === "hold" ? 0 : face === 6 ? 5 : face === 8 ? -5 : -10;
}
const bounded = f => Math.max(0.8, Math.min(1.2, f));
export function nextEffortDose({ entries, scope, date, today, fallback = 1 }) {
  const zero = { factor: bounded(fallback), active: false, source: null };
  const last = entries.filter(e => e.date < date && e.date <= today && e.effortDose?.v === 1 &&
    e.effortDose.scope === scope && Number.isFinite(e.effortDose.factor) && e.effortControl?.v === 1)
    .slice().sort((a,b) => a.date.localeCompare(b.date)).pop();
  if (!last) return zero;
  const age = (Date.parse(date) - Date.parse(last.date)) / 864e5;
  if (age > 42) return zero;
  let percent = effortRequest(last.rpe, last.effortControl.choice);
  const base = bounded(last.effortDose.factor);
  if (percent == null || effortFace(last.rpe) !== last.effortControl.face || last.inputConfirmed !== true || !(last.minutes > 0))
    return { factor: base, active: true, source: last.id };
  if (percent > 0 && (last.completed !== true || !last.effortDose.eligible || last.rpe > last.tHi)) percent = 0;
  return { factor: Math.round(bounded(base * (1 + percent / 100)) * 10000) / 10000, active: true, source: last.id };
}
