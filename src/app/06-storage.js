  /* ============ Storage ============ */
  /* Stable app (ringzeit; development copy: ringzeit-dev): its own app id keeps local data, backups, caches and the installed app
     apart from Ringzeit Dev, which runs on the same origin (dnsmaur1992.github.io). tools/build_pwa.py
     reads APP_ID and APP_NAME from here for the cache name, manifest and page title. */
  const APP_ID = "ringzeit";
  const APP_NAME = "Ringzeit";
  /* Data stays in this device's local storage only; the optional cloud copy in a Claude host is switched off */
  const CLOUD_SYNC = false;
  const LS = APP_ID + ".v1";
  /* local storage only (cloud host: only when CLOUD_SYNC is switched on); the service itself lives in core/storage.js */
  const store = createStore({
    key: LS,
    storage: () => localStorage,
    getState: () => S,
    compact: () => (S.sessions = slimSessions(S.sessions, S.log)),
    onFull: () => toast(t("storeFull")),
    cloud: () => CLOUD_SYNC && window.claude,
    applyCloud(a, l) {
      if (a) {
        S.profile = migrate({ ...DEFAULT_PROFILE, ...a.profile });
        S.sessions = a.sessions || {};
        S.ov = a.ov || {};
        S.cov = a.cov || {};
        S.pauses = a.pauses || [];
        S.ko = a.ko || "";
      }
      if (l) {
        S.log = l.log || [];
        S.sessions = slimSessions(S.sessions, S.log);
        S.weights = l.weights || [];
        S.tests = l.tests || [];
      }
    },
    cloudDocs() {
      S.sessions = slimSessions(S.sessions, S.log);
      if (S.log.length > 900) S.log = S.log.slice(-900);
      // overrides older than ~half a year are no longer needed
      const cut = iso(addDays(today(), -200)),
        trim = (m) => Object.fromEntries(Object.entries(m || {}).filter(([k]) => k >= cut));
      S.ov = trim(S.ov);
      S.cov = trim(S.cov);
      return {
        app: {
          profile: S.profile,
          sessions: S.sessions,
          ov: S.ov,
          cov: S.cov,
          pauses: (S.pauses || []).slice(-30),
          ko: S.ko || "",
        },
        log: {
          log: S.log,
          weights: S.weights.slice(-400),
          tests: S.tests.slice(-60),
        },
      };
    },
    onCloudLost() {
      toast(t("local"));
      render();
    },
  });
  /* Upgrades profiles saved by older versions of the app */
  function migrate(p) {
    delete p.mode;
    if (!p.sport) p.sport = "kickboxing";
    if (![0,1,2].includes(p.level)) p.level = 0;
    if (![0,1,2].includes(p.fitnessBase)) p.fitnessBase = p.level;
    const levels = p.techLevels && typeof p.techLevels === "object" ? p.techLevels : {};
    p.techLevels = Object.fromEntries(Object.entries(levels).filter(([k,v]) =>
      ["kickboxing","boxing","taekwondo:wt","taekwondo:itf"].includes(k) && [0,1,2].includes(v)));
    p.techLevels[trainingKey(p.sport, undefined, p)] = p.level;
    if (!Array.isArray(p.comps)) p.comps = [];
    if (p.comp) p.comps.push({ id: "c" + Date.now().toString(36), date: p.comp });
    delete p.comp;
    if (p.birthYear == null) p.birthYear = "";
    if (p.belt == null) p.belt = 0;
    if (!p.gp || typeof p.gp !== "object") p.gp = {};
    if (!p.club) p.club = { days: [], minutes: 90 };
    p.comps = p.comps.map((c) => ({ kind: "comp", ...c }));
    if (!p.planStart && p.arcStart) p.planStart = p.arcStart;
    delete p.arcStart;
    if (!p.focus) p.focus = "bal";
    if (!["lc", "fc", "kl", "k1"].includes(p.disc)) p.disc = "lc";
    // taekwondo grades per style (6a): only known grade codes survive, the lists are bounded
    const T = p.tkd && typeof p.tkd === "object" ? p.tkd : {};
    p.tkd = {
      style: T.style === "itf" ? "itf" : "wt",
      names: T.names === "app" ? "app" : "ko",
      wt: TKDT.isGrade("wt", T.wt) ? T.wt : "",
      itf: TKDT.isGrade("itf", T.itf) ? T.itf : "",
      hist: (Array.isArray(T.hist) ? T.hist : []).filter((x) => x && TKDT.STYLES.includes(x.style) && typeof x.date === "string").slice(-200),
      exams: (Array.isArray(T.exams) ? T.exams : []).filter((x) => x && TKDT.STYLES.includes(x.style) && TKDT.isGrade(x.style, x.target) && typeof x.date === "string").slice(-50),
    };
    return p;
  }

  /* Normalises stored or imported data into the current state shape */
  /* Rounds are stored in each log entry, so planned sessions older than ~3 months can be dropped (smaller, faster saves) */
  function slimSessions(sessions, log) {
    log.forEach((e) => {
      if (e.src !== "club" && e.rounds == null && sessions[e.date]) {
        const rb = sessions[e.date].blocks.find((b) => b.rounds);
        e.rounds = rb ? rb.items.length : 0;
      }
    });
    const cut = iso(addDays(today(), -90)),
      out = {};
    for (const k in sessions) if (k >= cut) out[k] = sessions[k];
    return out;
  }
  /* Data saved before 3-D names exercises by their row number; this turns the numbers into the stable text ids
     (planned sessions and the exercise entries of the history). Text ids stay as they are. */
  function migrateExIds(st) {
    const fix = (o) => {
      if (o && typeof o.id === "number") o.id = keyOfLegacy(o.id);
    };
    Object.values(st.sessions || {}).forEach((s) => (s.blocks || []).forEach((b) => (b.items || []).forEach(fix)));
    (st.log || []).forEach((e) => (e.perf || []).forEach(fix));
    return st;
  }
  function hydrate(d) {
    const log = d.log || [];
    const oldDose = [0,1,2].includes(d.profile?.level) ? d.profile.level : 0;
    for (const sess of Object.values(d.sessions || {})) {
      if (![0,1,2].includes(sess.fitnessLevel)) sess.fitnessLevel = oldDose;
      for (const b of sess.blocks || []) if (![0,1,2].includes(b.fitnessLevel)) b.fitnessLevel = sess.fitnessLevel;
    }
    return migrateExIds({
      v: 2,
      profile: migrate({ ...DEFAULT_PROFILE, ...(d.profile || {}) }),
      sessions: slimSessions(d.sessions || {}, log),
      log,
      weights: d.weights || [],
      tests: d.tests || [],
      ov: d.ov || {},
      cov: d.cov || {},
      pauses: d.pauses || [],
      ko: d.ko || "",
    });
  }

