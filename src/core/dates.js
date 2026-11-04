/* Calendar dates as local "YYYY-MM-DD" strings and Date objects – no app state, no DOM.
   "Today" comes from the Date clock, so tests can fix it by replacing Date. */
import { pad } from "./format.js";

export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* dates are parsed thousands of times per render: cache them (the Date objects are never mutated) */
const parseCache = new Map();
export const parse = (s) => {
  let d = parseCache.get(s);
  if (!d) {
    if (parseCache.size > 4000) parseCache.clear();
    const [y, m, dd] = s.split("-").map(Number);
    d = new Date(y, m - 1, dd);
    parseCache.set(s, d);
  }
  return d;
};

/** Monday 00:00 of the week containing d. */
export const monday = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Today 00:00 local time. */
export const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const daysBetween = (a, b) => Math.round((b - a) / 864e5);

/** Weekday of a date string, Monday = 0 … Sunday = 6. */
export const wd = (ds) => (parse(ds).getDay() + 6) % 7;
