  /* ============ State ============ */
  const DEFAULT_PROFILE = {
    lang: "de",
    sport: "kickboxing",
    disc: "lc",
    focus: "bal",
    level: 0,
    age: "adult",
    sex: "",
    days: [0, 2, 4],
    minutes: 75,
    comps: [],
    club: { days: [], minutes: 90 },
    birthYear: "",
    birth: "", // full date of birth (YYYY-MM-DD) since 13.11.2026; birthYear follows it
    limits: [],
    example: true,
    planStart: "",
  };
  /*
   * S.ov:     own-session overrides per date – { t } added/moved in (from), { off: "moved"|"skip", to }
   * S.cov:    club overrides per date – { on, min, from } moved in, { off: "moved"|"cancel"|"miss", to }
   * S.pauses: [{ id, from, to|null, why: "ill"|"inj"|"vac" }]
   * S.ko:     date of the last KO / stoppage by head blows ("" = none)
   */
  let S = {
    v: 2,
    profile: { ...DEFAULT_PROFILE },
    sessions: {},
    log: [],
    weights: [],
    tests: [],
    ov: {},
    cov: {},
    pauses: [],
    ko: "",
  };
  let ui = {
    tab: "week",
    sel: null,
    setup: null,
    timer: null,
    testOpen: false,
    testView: null,
    testDraft: null,
    focus: false,
    onb: null,
    tour: null,
  };
  const t = (k) => L[S.profile.lang][k];
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  /* pad, iso, parse, monday, addDays, today, daysBetween, wd, rnd, shuffle: core/dates.js, core/random.js (00-imports.js) */

