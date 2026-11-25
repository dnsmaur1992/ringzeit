  /* ============ Data check (security review 25.11.2026) ============
     A backup is a file from outside: before, only the app id and a profile were checked, so a crafted file could put
     text where the app writes numbers into the page (effort, minutes, weight, test score …) and run code, or crash
     views with wrong types. Every load – import and the stored data at start – now goes through this check:
     - numbers stay numbers within a sensible range, otherwise they are left out (never a text in their place);
     - dates must be real dates (YYYY-MM-DD), kinds and keys must be ones the app knows;
     - entries that cannot be repaired (no date, unknown exercise) are left out and counted;
     - texts the person writes (notes, names) stay texts – they are escaped where they are shown;
     - "__proto__", "constructor" and "prototype" are never taken over as keys.
     Nothing valid is changed and nothing is added that was not there (older backups lack some fields), so a normal
     backup loads exactly as before. */
  const SAN_BAD_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  // a real calendar day: "2026-13-45" would roll over to another date, so the day must come back unchanged
  const sanDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(parse(v).getTime()) && iso(parse(v)) === v;
  const sanObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const sanArr = (v) => (Array.isArray(v) ? v : []);
  /* a number from a number or a numeric text, within lo…hi – otherwise undefined */
  function sanNum(v, lo = -Infinity, hi = Infinity) {
    if (typeof v === "string" && /^\s*-?\d+([.,]\d+)?\s*$/.test(v)) v = +v.replace(",", ".");
    return typeof v === "number" && isFinite(v) && v >= lo && v <= hi ? v : undefined;
  }
  const sanTxt = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const sanKey = (v) => typeof v === "string" && /^[A-Za-z0-9_.-]{1,60}$/.test(v);
  /* a map with date keys only (sessions, overrides …) */
  function sanDateMap(m, fix, cnt) {
    const out = {};
    if (!sanObj(m)) return out;
    for (const [k, v] of Object.entries(m)) {
      if (SAN_BAD_KEYS.has(k) || !sanDate(k)) {
        cnt.n++;
        continue;
      }
      const x = fix(v, k);
      if (x === undefined) cnt.n++;
      else out[k] = x;
    }
    return out;
  }
  /* a map with plain keys: dates in practice, older states and tests use short names – never markup */
  function sanKeyMap(m, fix, cnt) {
    const out = {};
    if (!sanObj(m)) return out;
    for (const [k, v] of Object.entries(m)) {
      if (SAN_BAD_KEYS.has(k) || !sanKey(k) || (/^\d{4}-/.test(k) && !sanDate(k))) {
        cnt.n++;
        continue;
      }
      const x = fix(v, k);
      if (x === undefined) cnt.n++;
      else out[k] = x;
    }
    return out;
  }
  /* a numeric field of an object: kept when valid, removed otherwise */
  function sanField(o, k, lo, hi) {
    if (!(k in o)) return;
    if (o[k] === null || o[k] === "") return;
    const n = sanNum(o[k], lo, hi);
    if (n === undefined) delete o[k];
    else o[k] = n;
  }
  /* the set rows: every value a number or null */
  function sanRows(rows) {
    return sanArr(rows).map((r) => {
      if (!sanObj(r)) return { r: null, kg: null };
      const o = {};
      for (const [k, v] of Object.entries(r)) {
        if (SAN_BAD_KEYS.has(k) || !sanKey(k)) continue;
        o[k] = v === null || v === "" ? null : typeof v === "boolean" ? v : (sanNum(v, -1, 100000) ?? null);
      }
      return o;
    });
  }
  const TYPES_OK = ["T", "C", "P", "S", "K", "M", "V"],
    CK_OK = ["T", "P", "K", "S", "X"],
    DISC_OK = ["lc", "kl", "k1", "fc"];
  function sanProfile(p, cnt) {
    p = sanObj(p) ? p : {};
    for (const k of Object.keys(p)) if (SAN_BAD_KEYS.has(k)) delete p[k];
    if (!["de", "en"].includes(p.lang)) p.lang = "de";
    if (!(typeof p.sport === "string" && Object.prototype.hasOwnProperty.call(SPORTS, p.sport))) p.sport = "kickboxing";
    if (!DISC_OK.includes(p.disc)) p.disc = "lc";
    if (![0, 1, 2].includes(p.level)) p.level = sanNum(p.level, 0, 2) !== undefined ? Math.round(sanNum(p.level, 0, 2)) : 0;
    if (typeof p.focus !== "string" || !sanKey(p.focus)) p.focus = "bal";
    const days = (a) => [...new Set(sanArr(a).map((x) => sanNum(x, 0, 6)).filter((x) => x !== undefined && Number.isInteger(x)))];
    p.days = days(p.days);
    if (p.hardDays != null) p.hardDays = days(p.hardDays);
    p.minutes = Math.round(sanNum(p.minutes, 15, 300) ?? 75);
    p.club = sanObj(p.club) ? p.club : { days: [], minutes: 90 };
    p.club.days = days(p.club.days);
    p.club.minutes = Math.round(sanNum(p.club.minutes, 15, 300) ?? 90);
    sanField(p, "height", 120, 230);
    if (p.birthYear !== "" && p.birthYear != null) p.birthYear = sanNum(p.birthYear, 1900, 2100) ?? "";
    if (p.birth && !sanDate(p.birth)) p.birth = "";
    for (const k of ["planStart", "ackSafe", "autoLoadSince", "lastBackup"]) if (p[k] && !sanDate(String(p[k]).slice(0, 10))) delete p[k];
    p.limits = sanArr(p.limits).filter(sanKey);
    p.comps = sanArr(p.comps).filter((c) => {
      if (!sanObj(c) || !sanDate(c.date)) return cnt.n++, false;
      if (typeof c.id !== "string") c.id = "c" + c.date.replace(/-/g, "");
      if (c.kind != null && !sanKey(c.kind)) c.kind = "comp";
      if (c.name != null) c.name = sanTxt(c.name, 120) ?? "";
      sanField(c, "wc", 20, 150);
      if (c.result != null) {
        // older versions kept the result as a free text ("2 von 3 gewonnen") – it stays a text
        if (typeof c.result === "string") c.result = c.result.slice(0, 500);
        else if (!sanObj(c.result)) delete c.result;
        else {
          const r = c.result;
          sanField(r, "wins", 0, 99);
          sanField(r, "bouts", 0, 99);
          if (r.place != null && !(typeof r.place === "string" || typeof r.place === "number") ) delete r.place;
          if (r.place != null) r.place = String(r.place).match(/^\s*(\d{1,3}|-)\s*$/) ? String(r.place).trim() : undefined;
          if (r.place === undefined) delete r.place;
          for (const k of ["good", "bad", "grade"]) if (r[k] != null) r[k] = sanTxt(r[k], 500) ?? "";
          if (r.passed != null && !["y", "n"].includes(r.passed)) delete r.passed;
        }
      }
      return true;
    });
    if (p.myc != null) p.myc = sanArr(p.myc).filter((m) => {
      if (!sanObj(m)) return cnt.n++, false;
      m.c = sanArr(m.c).filter((x) => typeof x === "string" && Object.prototype.hasOwnProperty.call(TECH, x));
      m.on = !!m.on;
      return true;
    });
    if (p.pack != null) {
      const pk = {};
      if (sanObj(p.pack))
        for (const [k, v] of Object.entries(p.pack))
          if (!SAN_BAD_KEYS.has(k) && sanObj(v)) pk[k] = { done: sanObj(v.done) ? Object.fromEntries(Object.entries(v.done).filter(([x]) => !SAN_BAD_KEYS.has(x))) : {}, extra: sanArr(v.extra).map((x) => sanTxt(x, 120)).filter((x) => x !== undefined) };
      p.pack = pk;
    }
    if (p.form != null) {
      const f = {};
      if (sanObj(p.form))
        for (const [d, v] of Object.entries(p.form))
          if (sanDate(d) && sanObj(v)) f[d] = { sleep: sanNum(v.sleep, 0, 2) ?? 1, energy: sanNum(v.energy, 0, 2) ?? 1 };
      p.form = f;
    }
    if (p.lowTime != null) p.lowTime = sanObj(p.lowTime) ? { on: !!p.lowTime.on, since: sanDate(p.lowTime.since) ? p.lowTime.since : iso(today()) } : null;
    if (p.ldClaims != null) {
      const c = {};
      if (sanObj(p.ldClaims))
        for (const [d, v] of Object.entries(p.ldClaims))
          if (sanDate(d) && sanObj(v)) c[d] = { to: sanDate(v.to) ? v.to : null, k: v.k === "x" ? "x" : "hard" };
      p.ldClaims = c;
    }
    if (p.tkd != null && sanObj(p.tkd)) {
      p.tkd.hist = sanArr(p.tkd.hist).filter((h) => sanObj(h) && sanDate(h.date));
      p.tkd.exams = sanArr(p.tkd.exams).filter((h) => sanObj(h) && sanDate(h.date));
    }
    return p;
  }
  function sanEntry(e, cnt) {
    if (!sanObj(e) || !sanDate(e.date)) return undefined;
    if (typeof e.id !== "string" || !e.id) e.id = "l" + e.date.replace(/-/g, "") + Math.random().toString(36).slice(2, 7);
    if (e.src != null && !["own", "club"].includes(e.src)) e.src = "own";
    if (e.type != null && !TYPES_OK.includes(e.type)) delete e.type;
    if (e.ck != null && !CK_OK.includes(e.ck)) delete e.ck;
    if (e.rpe === "" || e.rpe == null) delete e.rpe;
    else sanField(e, "rpe", 0, 10);
    if (e.minutes != null) e.minutes = sanNum(e.minutes, 0, 600) ?? 0;
    if (e.note != null) e.note = sanTxt(e.note) ?? "";
    if (e.perf != null)
      e.perf = sanArr(e.perf).filter((p) => {
        if (!sanObj(p) || typeof p.id !== "string" || !EX[p.id]) return cnt.n++, false;
        p.sets = sanRows(p.sets);
        if (p.effort != null && !sanKey(p.effort)) delete p.effort;
        return true;
      });
    if (e.run != null) {
      if (!sanObj(e.run)) delete e.run;
      else for (const k of Object.keys(e.run)) if (SAN_BAD_KEYS.has(k) || sanNum(e.run[k], 0, 100000) === undefined) delete e.run[k];
        else e.run[k] = sanNum(e.run[k], 0, 100000);
    }
    return e;
  }
  function sanSession(s, ds, cnt) {
    if (!sanObj(s) || (s.type != null && !TYPES_OK.includes(s.type)) || !Array.isArray(s.blocks)) return undefined;
    if (s.date != null && s.date !== ds && !sanDate(s.date)) delete s.date;
    if (s.min != null) {
      const m = sanNum(s.min, 5, 300);
      if (m === undefined) delete s.min;
      else s.min = Math.round(m);
    }
    s.blocks = s.blocks.filter((b) => sanObj(b) && Array.isArray(b.items));
    for (const b of s.blocks) {
      sanField(b, "min", 0, 300);
      if (b.key != null && !sanKey(b.key)) delete b.key;
      if (b.lbl != null && !sanKey(b.lbl)) delete b.lbl;
      if (b.sets != null) b.sets = sanTxt(b.sets, 200) ?? "";
      b.items = b.items.filter((it) => {
        if (!sanObj(it)) return cnt.n++, false;
        // exercises must exist in the catalogue; other kinds (hardening, focus …) have their own ids – a plain key then
        if (it.id != null && (typeof it.id !== "string" || ((it.kind == null || it.kind === "ex") ? !EX[it.id] : !sanKey(it.id)))) return cnt.n++, false;
        for (const f of ["combo", "chain"]) if (it[f] != null) it[f] = sanArr(it[f]).filter((x) => typeof x === "string" && /^[a-z0-9_]{1,20}$/.test(x));
        if (it.k != null && !sanKey(it.k)) delete it.k;
        for (const f of ["sec", "w", "b", "sets", "reps"]) if (typeof it[f] !== "string") sanField(it, f, 0, 100000);
        if (it.target != null) {
          if (!sanObj(it.target)) delete it.target;
          else for (const f of ["kg", "r", "s", "reps", "rL", "rR"]) sanField(it.target, f, 0, 100000);
        }
        return true;
      });
    }
    if (s.perf != null) {
      const pf = {};
      if (sanObj(s.perf)) for (const [k, v] of Object.entries(s.perf)) if (/^\d{1,3}\.\d{1,3}$/.test(k)) pf[k] = sanRows(v);
      s.perf = pf;
    }
    if (s.exerciseEffort != null) {
      const ef = {};
      if (sanObj(s.exerciseEffort)) for (const [k, v] of Object.entries(s.exerciseEffort)) if (/^\d{1,3}\.\d{1,3}$/.test(k) && sanKey(v)) ef[k] = v;
      s.exerciseEffort = ef;
    }
    if (s.notes != null) s.notes = sanArr(s.notes).map((x) => sanTxt(x, 500)).filter((x) => x !== undefined);
    if (s.rpe != null && !(typeof s.rpe === "string" && /^[0-9–\-. ]{1,12}$/.test(s.rpe))) delete s.rpe;
    if (s.eq != null) s.eq = sanArr(s.eq).filter(sanKey);
    if (s.loc != null && !sanKey(s.loc)) s.loc = "home";
    return s;
  }
  /* an override of one day: known fields checked, other simple fields kept (numbers, yes/no, short keys) */
  function sanOver(o, known) {
    if (!sanObj(o)) return undefined;
    const x = {};
    for (const [k, v] of Object.entries(o)) {
      if (SAN_BAD_KEYS.has(k)) continue;
      if (k in known) {
        const ok = known[k](v);
        if (ok !== undefined) x[k] = ok;
      } else if (typeof v === "number" ? isFinite(v) : typeof v === "boolean" || (typeof v === "string" && sanKey(v))) x[k] = v;
    }
    return Object.keys(x).length ? x : undefined;
  }
  const isIn = (list) => (v) => (list.includes(v) ? v : undefined),
    dateOr = (v) => (sanDate(v) ? v : undefined);
  /* the whole data set: returns the checked copy and how many entries were left out */
  function sanitizeData(d) {
    // (the same order of keys as the stored data, so a check never changes how the data is saved)
    const cnt = { n: 0 };
    d = sanObj(d) ? JSON.parse(JSON.stringify(d)) : {};
    const out = {
      v: 2,
      profile: sanProfile(d.profile, cnt),
      sessions: sanKeyMap(d.sessions, (s, ds) => sanSession(s, ds, cnt), cnt),
      log: sanArr(d.log)
        .map((e) => {
          const x = sanEntry(e, cnt);
          if (x === undefined) cnt.n++;
          return x;
        })
        .filter(Boolean),
      weights: sanArr(d.weights).filter((w) => {
        if (!sanObj(w) || !sanDate(w.date) || sanNum(w.kg, 10, 400) === undefined) return cnt.n++, false;
        w.kg = sanNum(w.kg, 10, 400);
        return true;
      }),
      tests: sanArr(d.tests).filter((x) => {
        if (!sanObj(x) || !sanDate(x.date) || sanNum(x.total, 0, 25) === undefined) return cnt.n++, false;
        x.total = sanNum(x.total, 0, 25);
        x.scores = sanObj(x.scores) ? Object.fromEntries(TCATS.map((k) => [k, sanNum(x.scores[k], 0, 5) ?? null])) : {};
        if (x.raw != null) x.raw = sanObj(x.raw) ? Object.fromEntries(Object.entries(x.raw).filter(([k]) => !SAN_BAD_KEYS.has(k) && sanKey(k)).map(([k, v]) => [k, sanNum(v, -100000, 100000) ?? null])) : {};
        return true;
      }),
      ov: sanDateMap(d.ov, (o) => sanOver(o, { t: isIn(TYPES_OK), off: isIn(["moved", "skip"]), to: dateOr, from: dateOr }), cnt),
      cov: sanDateMap(d.cov, (o) => sanOver(o, { on: (v) => (v ? true : undefined), min: (v) => sanNum(v, 15, 300), off: isIn(["moved", "cancel", "miss"]), to: dateOr, from: dateOr }), cnt),
      pauses: sanArr(d.pauses).filter((x) => {
        if (!sanObj(x) || !sanDate(x.from) || !(x.to == null || sanDate(x.to))) return cnt.n++, false;
        if (!["ill", "inj", "vac"].includes(x.why)) x.why = "ill";
        if (typeof x.id !== "string") x.id = "p" + x.from.replace(/-/g, "");
        return true;
      }),
      ko: sanDate(d.ko) ? d.ko : "",
    };
    return { data: out, dropped: cnt.n };
  }
