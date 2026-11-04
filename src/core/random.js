/* Random choice helpers. They read Math.random at call time, so a seeded Math.random (tests, comparison
   baseline) makes every generated plan reproducible. */

/** One random element of a. */
export const rnd = (a) => a[Math.floor(Math.random() * a.length)];

/** Shuffled copy of a (Fisher–Yates); a itself is not changed. */
export const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
