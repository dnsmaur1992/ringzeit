/* Formatting helpers shared by every view – no app state, no DOM. */

/** Two-digit number: 7 -> "07". */
export const pad = (n) => String(n).padStart(2, "0");

/** Seconds as m:ss – used by the session timers and the free round timer (formerly fmt and fmtS). */
export const fmtTime = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
