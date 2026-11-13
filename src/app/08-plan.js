  /* ============ Plan logic ============ */
  /* Planning inputs in one place: the profile, its sport definition, the shared history and the date.
     Rules moved into src/sports read from here instead of reaching into S themselves. */
  function planContext(ds) {
    const profile = S.profile;
    return { profile, sport: sportFor((ds && S.sessions[ds] && S.sessions[ds].sport) || profile.sport), history: S.log, date: ds, today: today(), rng: Math.random };
  }
  function dayTypes(bk) {
    const p = S.profile,
      days = p.days.slice().sort((a, b) => a - b),
      sp0 = sportFor(p.sport),
      // WT plans one mobility unit more than conditioning from 4 days (docs/taekwondo-concept.md 6.2, F1 = yes, 7b)
      pat = ((p.sport === "taekwondo" && tkdStyle() === "wt" && sp0.dayPatternWt) || sp0.dayPattern)[days.length] || [];
    const m = {};
    days.forEach((d, i) => {
      let ty = pat[i];
      if ((techniqueLevel() === 0 || ageGroup() === "kids") && ty === "P") ty = "T";
      m[d] = ty;
    });
    if (bk) blockTypes(m, days, bk);
    return m;
  }

  /* The type actually used on a date: the built session's type, otherwise the plan */
  const typeOn = (ds) => planOn(ds) && ((S.sessions[ds] && S.sessions[ds].type) || planOn(ds));
  /* everyday life: week check-in (per Monday), short-on-time mode, today's form (per date), type of work */
  const weekMood = (ds) => (S.profile.weekMood || {})[iso(monday(ds ? parse(ds) : today()))] || "normal";
  const lowTime = () => !!(S.profile.lowTime && S.profile.lowTime.on);
  /* today's form: 0 = low, 1 = medium, 2 = fine (sleep + energy, each 0–2) */
  function formOn(ds) {
    const f = (S.profile.form || {})[ds];
    if (!f || f.sleep == null || f.energy == null) return 2;
    const sc = f.sleep + f.energy;
    return sc <= 1 ? 0 : sc <= 2 ? 1 : 2;
  }
  const sessMin = (ty) => {
    let m = ty === "M" ? Math.min(45, S.profile.minutes) : S.profile.minutes;
    const ka = kidAge();
    if (ka != null) m = Math.min(ka <= 9 ? 30 : 45, m);
    return lowTime() ? Math.min(30, m) : m;
  };
  const sessDur = (ds, ty) => (S.sessions[ds] && S.sessions[ds].min) || sessMin(ty);
  const own = (e) => e.src !== "club";
  /* Numbers with the decimal separator of the chosen language */
  const numF = (n) => (S.profile.lang === "de" ? String(n).replace(".", ",") : String(n));
  /* log entries by date; rebuilt only when the log changes (instead of scanning the whole log per day) */
  let logIdxArr = null,
    logIdxKey = "",
    logIdxMap = new Map();
  function logIdx() {
    const n = S.log.length,
      k = n + "|" + (n ? S.log[0].id + S.log[n - 1].id : "");
    if (logIdxArr !== S.log || k !== logIdxKey) {
      logIdxMap = new Map();
      for (const e of S.log) {
        const a = logIdxMap.get(e.date);
        if (a) a.push(e);
        else logIdxMap.set(e.date, [e]);
      }
      logIdxArr = S.log;
      logIdxKey = k;
    }
    return logIdxMap;
  }
  const NO_LOG = [];
  const logOn = (ds) => logIdx().get(ds) || NO_LOG;
  /* all entries from date a to date b (inclusive) – meant for short spans such as a week */
  function logRange(a, b) {
    const out = [];
    for (let d = parse(a), s = a; s <= b; d = addDays(d, 1), s = iso(d)) {
      const x = logIdx().get(s);
      if (x) out.push(...x);
    }
    return out;
  }
  const doneOn = (ds) => logOn(ds).some(own);
  const clubDone = (ds) => logOn(ds).find((e) => e.src === "club");
  /* Breaks (illness, injury, holiday): the plan rests, streaks are kept */
  const pausedOn = (ds) => (S.pauses || []).find((x) => ds >= x.from && (!x.to || ds <= x.to));
  /* Gentle return after a break of 4+ days: 7 days (14 after long breaks), the first half lighter */
  function rampOn(ds) {
    const ended = (S.pauses || []).filter((x) => x.to && x.to < ds).sort((a, b) => b.to.localeCompare(a.to))[0];
    if (!ended) return null;
    const len = daysBetween(parse(ended.from), parse(ended.to)) + 1,
      span = len >= 14 ? 14 : 7,
      d = daysBetween(parse(ended.to), parse(ds));
    if (len < 4 || d > span) return null;
    const early = d <= span / 2;
    return {
      f: early ? 0.6 : 0.8,
      rpe: early ? 1.5 : 0.75,
      left: span - d + 1,
    };
  }
  /* WAKO: no competing for at least 4 weeks after a KO or a stoppage by head blows */
  /* Sport of the session being built (set by buildSession); otherwise the main sport. Boxing has no discipline:
     discOf() is "box" there, so none of the kickboxing discipline rules apply. */
  let buildSport = null;
  const sportNow = () => buildSport || S.profile.sport || "kickboxing";
  const isBox = () => sportNow() === "boxing";
  const isTkd = () => sportNow() === "taekwondo";
  let buildDisc = null; // discipline of the unit being built (kickboxing); null = profile discipline
  const discOf = () => (isBox() ? "box" : isTkd() ? "tkd" : buildDisc || S.profile.disc);
  /* Protection ban after a KO: kickboxing 4 weeks (WAKO), boxing 30 days (DBV §89) */
  const koDays = () => {
    const k = sportFor(sportNow()).rules.koDays;
    return typeof k === "function" ? (tkdStyle() === "itf" ? 30 : k(ageAt(today()))) : k || 28;
  };
  const koLock = (ds) => !!S.ko && ds >= S.ko && daysBetween(parse(S.ko), parse(ds)) < koDays();
  /* Weekly suggestion; no sparring during a KO suspension or the day after club sparring */
  function suggestOn(ds) {
    const bi = blockInfo(ds);
    let ty = dayTypes(bi && bi.k)[wd(ds)];
    if (!ty) return null;
    if (ramadanOn(ds) && (ty === "K" || ty === "C")) ty = "T";
    // a stressful week: technique instead of sparring and hard conditioning
    if (weekMood(ds) === "hard" && (ty === "K" || ty === "C" || ty === "P")) ty = "T";
    const y = clubDone(iso(addDays(parse(ds), -1)));
    if (ty === "P" && (koLock(ds) || (y && y.ck === "P"))) ty = "T";
    return ty;
  }
  /* Own session type planned on a date: overrides (moved, added, skipped) first, then the weekly suggestion */
  function planOn(ds) {
    if (pausedOn(ds)) return null;
    const o = (S.ov || {})[ds];
    if (o && o.off) return null;
    if (o && o.t) return o.t;
    return suggestOn(ds);
  }
  /* Suggestion for an extra session on a free day: strength if the week has none yet, otherwise technique */
  function suggestExtra(ds) {
    const mon = monday(parse(ds));
    return [0, 1, 2, 3, 4, 5, 6].some((i) => planOn(iso(addDays(mon, i))) === "S") ? "T" : "S";
  }
  /* Club training on a date: club overrides (moved, cancelled, missed) first, then the fixed club days */
  function clubOn(ds) {
    if (pausedOn(ds)) return null;
    const c = (S.cov || {})[ds],
      cl = S.profile.club || {};
    if (c && c.off) return null;
    if (c && c.on) return { min: c.min || cl.minutes || 90 };
    return (cl.days || []).includes(wd(ds)) ? { min: cl.minutes || 90 } : null;
  }
  const HARD_T = new Set(["P", "C", "K"]);
  /* A hard own session or any club training right next to a date (ignoring the session that is being moved) */
  const hardNear = (d, ignore) =>
    [-1, 1].some((k) => {
      const n = iso(addDays(parse(d), k));
      if (n === ignore) return false;
      const ty = typeOn(n);
      return (ty && HARD_T.has(ty)) || !!clubOn(n);
    });
  /* Week totals for rings and streaks: planned own + club sessions, and everything logged */
  function weekPlan(mon) {
    let planned = 0,
      paused = 0;
    for (let i = 0; i < 7; i++) {
      const ds = iso(addDays(mon, i));
      if (pausedOn(ds)) paused++;
      if (planOn(ds)) planned++;
      if (clubOn(ds)) planned++;
    }
    const a = iso(mon),
      b = iso(addDays(mon, 6)),
      done = logRange(a, b).length;
    return { planned, done, paused };
  }
  /* Consecutive weeks where everything planned was done; weeks with a break are skipped, not counted as misses */
  function weekStreak() {
    let w = monday(today()),
      n = 0;
    const cur = weekPlan(w);
    if (!cur.planned || cur.done < cur.planned) w = addDays(w, -7);
    for (let k = 0; k < 104; k++, w = addDays(w, -7)) {
      const x = weekPlan(w);
      if (x.paused >= 4) continue;
      if (!x.planned || x.done < x.planned) break;
      n++;
    }
    return n;
  }
  /* Age on a given date (by year of birth); null when no year of birth is set */
  /* age by calendar year (year of the date − year of birth): the rules' age classes, bout formats and grade lines */
  const ageAt = (d = today(), prof = S.profile) => (prof.birthYear ? d.getFullYear() - +prof.birthYear : null);
  /* a full date of birth: a real day, from 1950, at least 8 years ago */
  function validBirth(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
    const d = parse(s);
    return iso(d) === s && d.getFullYear() >= 1950 && s <= iso(addDays(today(), -365 * 8 - 2));
  }
  /* exact age in years on day d (shown age, under-15 safety); without a full date the age by calendar year */
  function ageExact(d = today(), prof = S.profile) {
    if (!prof.birth) return ageAt(d, prof);
    const b = parse(prof.birth),
      before = d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate());
    return d.getFullYear() - b.getFullYear() - (before ? 1 : 0);
  }
  const birthMax = () => iso(addDays(today(), -365 * 8 - 2));
  /* Youth / adult / masters – from the year of birth when known, otherwise from the stored age group */
  function ageGroup(prof = S.profile) {
    const a = ageAt(today(), prof);
    if (a == null) return prof.age || "adult";
    return a < 13 ? "kids" : a < 19 ? "youth" : a > 40 ? "masters" : "adult";
  }
  /* youth and kids share the youth adaptations; kids (8–12) get further limits (kidAge) */
  const young = (prof = S.profile) => {
    const g = ageGroup(prof);
    return g === "youth" || g === "kids";
  };
  /* age of a child (8–12), otherwise null */
  const kidAge = (prof = S.profile) => (ageGroup(prof) === "kids" ? ageAt(today(), prof) : null);
  /* bout formats (waFormat, STD_FORMAT): sports/kickboxing/rules.js, reached through planContext().sport.rules */
  const fmtText = (f) => t("fmtTxt")(f.r, f.w, f.b);
  /*
   * Periodisation around the tournament list:
   *   recover – 7 days after a tournament
   *   build   – specific preparation, up to 6 weeks before (shorter when tournaments are close together)
   *   peak    – last 3 weeks before the final week: fight simulations
   *   taper   – final 7 days
   *   base    – everything else
   */
  function compPhase(ds) {
    const d = ds ? parse(ds) : today(),
      dates = (S.profile.comps || [])
        .filter((c) => (c.kind || "comp") === "comp")
        .map((c) => c.date)
        .sort();
    const prev = dates.filter((x) => parse(x) < d).pop(),
      next = dates.find((x) => parse(x) >= d);
    if (prev && daysBetween(parse(prev), d) < 7) return { phase: "recover", days: null, comp: prev };
    if (!next) return { phase: "base", days: null };
    const n = daysBetween(d, parse(next)),
      window = Math.max(7, Math.min(42, prev ? daysBetween(addDays(parse(prev), 7), parse(next)) : 42)),
      weeks = Math.ceil(window / 7),
      week = Math.min(weeks, Math.max(1, weeks - Math.ceil(n / 7) + 1));
    const ctx = planContext(ds),
      nc = (S.profile.comps || []).find((c) => (c.kind || "comp") === "comp" && c.date === next),
      // a tournament of a sport without its own module has no known format yet; its date still drives the phases
      csp = SPORTS[(nc && nc.sport) || "kickboxing"],
      fmtNext = csp ? csp.rules.format(csp === SPORTS.taekwondo ? tkdStyle() : (nc && nc.disc) || ctx.profile.disc, ageAt(parse(next))) : null;
    const base = {
      days: n,
      comp: next,
      weeks,
      week,
      format: fmtNext || ctx.sport.rules.standardFormat,
      official: !!fmtNext,
    };
    if (n <= 7) return { ...base, phase: "taper" };
    if (n > window) return { ...base, phase: "base" };
    return { ...base, phase: n <= 21 ? "peak" : "build" };
  }
  /* Tournament phases win; otherwise up to 4 weeks of grading preparation before a belt grading */
  function phaseInfo(ds) {
    const r = compPhase(ds);
    if (r.phase !== "base") return r;
    const d = ds ? parse(ds) : today(),
      sp = (ds && S.sessions[ds] && S.sessions[ds].sport) || mainSport(),
      g = (S.profile.comps || [])
        .filter((c) => c.kind === "grade" && (c.sport || "kickboxing") === sp)
        .map((c) => c.date)
        // 7i: a planned taekwondo exam (Dates & goals) prepares like a grading entered as a date
        .concat(sp === "taekwondo" ? ((S.profile.tkd && S.profile.tkd.exams) || []).filter((x) => !x.result).map((x) => x.date) : [])
        .sort()
        .find((x) => parse(x) >= d);
    if (g && daysBetween(d, parse(g)) <= 28)
      return {
        phase: "grade",
        days: daysBetween(d, parse(g)),
        comp: g,
        kind: "grade",
      };
    return r;
  }
  const isPrep = (ph) => ph.phase === "build" || ph.phase === "peak" || ph.phase === "taper";
  function prepText(ph, type) {
    const f = ph.format ? fmtText(ph.format) : "",
      P = t("prep");
    if (ph.phase === "recover") return P.recover;
    if (ph.phase === "taper") return P.taper(f);
    if (ph.phase === "grade") return P.grade(ph.days);
    return P[ph.phase === "peak" && type !== "P" ? "build" : ph.phase](ph.week, ph.weeks, f);
  }
  /* The "what to improve" note from the most recent tournament result */
  function lastLesson() {
    const c = (S.profile.comps || [])
      .filter((x) => x.result && x.result.bad && parse(x.date) < today())
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    return c ? c.result.bad : "";
  }
  function baseRpe(type, ds) {
    const { phase } = phaseInfo(ds);
    let r = { base: 6, build: 7, peak: 8, taper: 5, recover: 4, grade: 6 }[phase];
    if (fitnessLevel() === 0) r -= 1;
    if (fitnessLevel() === 2) r += 0.5;
    if (type === "M") r = 3;
    if (type === "S") r -= 0.5;
    if (type === "K") r += 0.5;
    if (ageGroup() === "masters") r -= 0.5;
    if (young()) r = Math.min(r, ageGroup() === "kids" ? 6 : 7);
    return r;
  }
  /* Load management: a deload every 5th plan week, or after clearly-too-hard sessions in the week before */
  /* weekLoad is called many times per render, so results are cached per week and reset on every render/build */
  let loadCache = {};
  function weekLoad(ds) {
    const mon = monday(ds ? parse(ds) : today()),
      key = iso(mon);
    if (loadCache[key]) return loadCache[key];
    return (loadCache[key] = computeLoad(mon));
  }
  /* The rules live in core/history.js (explicit inputs); this only gathers the inputs from the app state.
     For the current week the expected total (entries so far + sessions still to come) is passed along too. */
  function computeLoad(mon) {
    const ds = iso(mon),
      cur = ds === iso(monday(today()));
    return deloadFor({
      log: S.log,
      mon,
      phase: phaseInfo(ds).phase,
      ramp: !!(rampOn(ds) || rampOn(iso(addDays(mon, 3)))),
      planStart: S.profile.planStart ? iso(monday(parse(S.profile.planStart))) : "",
      projected: cur ? projectWeek({ log: S.log, monISO: ds, plannedDays: plannedAhead(mon) }) : null,
    });
  }
  /* Planned own and club sessions from today to Sunday that have no entry yet. Planned values only – never entries.
     Own: planned minutes × middle of the base target effort; club: planned minutes × 6. */
  function plannedAhead(mon) {
    const td = iso(today()),
      out = [];
    for (let i = 0; i < 7; i++) {
      const ds = iso(addDays(mon, i));
      if (ds < td) continue;
      const ty = planOn(ds);
      if (ty && !doneOn(ds)) out.push({ minutes: sessDur(ds, ty), rpe: baseRpe(typeOn(ds) || ty, ds) });
      const cl = clubOn(ds);
      if (cl && !clubDone(ds)) out.push({ minutes: cl.min, rpe: 6 });
    }
    return out;
  }
  /* What the not-begun sessions of this week depend on from the history: the deload state and the regions that were
     hard the day before. If it changes after a new, corrected or deleted entry, those sessions are rebuilt. */
  function loadSig() {
    const td = iso(today()),
      mon = monday(today()),
      parts = [];
    loadCache = {};
    for (let i = 0; i < 7; i++) {
      const ds = iso(addDays(mon, i));
      if (ds < td) continue;
      parts.push((weekLoad(ds).deload ? 1 : 0) + lightRegions({ log: S.log, date: ds }).join(","));
    }
    // Once short-loop records exist, every own-session correction can affect the next comparable pair.
    // Legacy histories alone keep their former invalidation behaviour.
    if (S.log.some(e => e.effortDose?.v === 1)) parts.push(JSON.stringify(S.log.filter(e => e.src === "own").map(e =>
      [e.id,e.date,e.sport,e.tstyle,e.disc,e.type,e.minutes,e.rpe,e.tHi,e.completed,e.inputConfirmed,
        e.effortControl,e.effortDose,e.progression?.eligible,e.perf])));
    return parts.join("|");
  }
  /* Runs a change of the log; if it alters what open sessions depend on, they are dropped (started ones stay).
     Returns true when sessions were reset, so the caller can say so once. */
  function changeLog(fn) {
    const before = loadSig();
    fn();
    const after = loadSig();
    loadCache = {};
    if (before === after) return false;
    dropOpenSessions(iso(today()));
    return true;
  }
  function rpeRange(type, ds) {
    let r = baseRpe(type, ds);
    if (type !== "M" && ramadanOn(ds)) r -= 1;
    if (type !== "M" && weekMood(ds) === "hard") r -= 1;
    if (type !== "M") r -= [1.5, 0.5, 0][formOn(ds || iso(today()))];
    if (type !== "M" && weekLoad(ds).deload) r -= 1.5;
    // a hard day before in a region (e.g. club sparring → legs): a little easier today (core/history.js lightRegions)
    if (type !== "M" && lightRegions({ log: S.log, date: ds || iso(today()) }).length) r -= 1;
    const rp = rampOn(ds || iso(today()));
    if (rp && type !== "M") r -= rp.rpe;
    const cap = ageGroup() === "kids" ? 6 : young() ? 7 : 10,
      hi = Math.min(cap, Math.ceil(r) + 1),
      lo = Math.min(hi - 1, Math.max(2, Math.floor(r)));
    return { lo, hi, txt: `${lo}–${hi}` };
  }
  /* exercises that need a lot of free floor (about 10–20 m run or a long jump): hall and outdoors only, never in the
     fitness gym (12.11.2026); at home they are already excluded by their places */
  const NO_STUDIO = new Set(["cond.bear_crawl", "cond.sprints", "pow.broad_jumps"]);
  function okEx(e, loc, eq) {
    if (isBox() && BOXT.BOX_NO_EX.has(e.key)) return false; // no kick exercises in boxing
    if (isTkd() && TKDT.NO_EX.has(e.key)) return false; // no kickboxing technique exercises in taekwondo (own plans: 6b/6c)
    const av = S.profile.limits.map((l) => AV[l]).join("");
    // the fitness gym ("studio") also allows every indoor hall exercise – except those that need a long free run
    if (loc === "studio" ? !/[gf]/.test(e.locs) || NO_STUDIO.has(e.key) : !e.locs.includes(loc[0])) return false;
    // e.eq may list alternatives, e.g. "weights|kb" = dumbbells or a kettlebell
    if (e.eq && !e.eq.split("|").some((q) => eq.includes(q))) return false;
    for (const c of av) if (e.avoid.includes(c)) return false;
    if (e.lvl > techniqueLevel()) return false;
    if (young() && /weights|kb|bb/.test(e.eq) && (e.lvl > 0 || ageGroup() === "kids")) return false;
    return true;
  }
  /* prefer: optional scoring function – higher scores are picked first (shuffled within equal scores) */
  let buildLight = [];
  const lightPenalty = (e) => {
    const r = exRegions(e);
    return buildLight.reduce((a, k) => a + (r[k] || 0), 0);
  };
  /* Regions that were hard yesterday on a date, and whether club training was part of it (for the explanation) */
  function lightInfo(ds) {
    const regions = lightRegions({ log: S.log, date: ds }),
      prev = iso(addDays(parse(ds), -1));
    return { regions, club: S.log.some((e) => e.date === prev && e.src === "club" && e.rpe >= 7) };
  }
  /* sport focus of strength, conditioning, power and mobility picks (7b-2): preferred, never exclusive. The basic lifts
     (strengthBasics) stay the same in every sport so that the logs stay comparable; focus blocks (score 3) and the
     equipment at hand keep priority; limits, age and equipment still filter (okEx). Kickboxing has no list (unchanged). */
  const SPORT_FOCUS = {
    boxing: {
      str: ["str.cable_woodchop", "str.pallof_press", "str.russian_twists", "str.plank_shoulder_taps", "str.band_face_pulls", "str.cable_face_pulls", "str.dead_hang", "str.neck_iso_hold", "str.hollow_hold"],
      pow: ["pow.explosive_push_ups", "pow.clap_push_ups"],
      cond: ["cond.shadow_sprints", "cond.bag_sprints", "cond.band_punches", "cond.speed_rounds", "cond.rope_intervals", "cond.bear_crawl"],
      mob: ["mob.band_dislocates", "mob.open_book_rotation", "mob.worlds_greatest_stretch", "mob.neck_mobility", "mob.cat_cow"],
    },
    wt: {
      str: ["str.bulgarian_split_squats", "str.single_leg_kick_hold", "str.step_ups", "str.single_leg_calf_raises", "str.copenhagen_plank", "str.hanging_knee_raises"],
      pow: ["pow.jump_squats", "pow.lateral_bounds", "pow.broad_jumps"],
      cond: ["cond.kick_intervals", "cond.skater_jumps", "cond.sprints", "cond.stair_or_bench_runs", "cond.rope_intervals"],
      mob: ["mob.kick_holds", "mob.slow_motion_kicks", "mob.controlled_leg_swings", "mob.active_leg_raises"],
    },
    itf: {
      str: ["str.bulgarian_split_squats", "str.single_leg_kick_hold", "str.step_ups", "str.pallof_press", "str.plank_shoulder_taps", "str.hanging_knee_raises"],
      pow: ["pow.jump_squats", "pow.lateral_bounds", "pow.explosive_push_ups"],
      cond: ["cond.kick_intervals", "cond.band_punches", "cond.speed_rounds", "cond.skater_jumps", "cond.sprints"],
      mob: ["mob.frog_stretch", "mob.pigeon_stretch", "mob.90_90_hip_switches", "mob.open_book_rotation", "mob.band_dislocates"],
    },
  };
  const SPORT_W = 2;
  const sportFocus = (cat) => {
    const sp = sportNow(),
      k = sp === "boxing" ? "boxing" : sp === "taekwondo" ? (tkdUnitStyle() === "itf" ? "itf" : "wt") : null;
    return k ? SPORT_FOCUS[k][cat] || null : null;
  };
  function pickEx(cat, n, loc, eq, used, prefer) {
    let pool = shuffle(EX.filter((e) => e.cat === cat && okEx(e, loc, eq) && !used.has(e.id)));
    // regions that were hard the day before: exercises that load them come later (below every explicit preference)
    if (buildLight.length) pool.sort((a, b) => lightPenalty(a) - lightPenalty(b));
    // about three in four focus exercises get the bonus in each pick, so the sport shows clearly and variety stays
    const focus = sportFocus(cat),
      bonus = focus ? new Map(pool.map((e) => [e.id, focus.includes(e.key) && Math.random() < 0.75 ? SPORT_W : 0])) : null,
      score = focus ? (e) => (prefer ? prefer(e) : 0) + (bonus.get(e.id) || 0) : prefer;
    if (score) pool.sort((a, b) => score(b) - score(a));
    if (pool.length < n)
      pool = pool.concat(shuffle(EX.filter((e) => e.cat === cat && okEx(e, loc, eq) && !pool.includes(e))));
    const out = pool.slice(0, n);
    out.forEach((e) => used.add(e.id));
    return out.map((e) => ({ kind: "ex", id: e.id }));
  }
  const FOCUS_POW = 3,
    FOCUS_THEME = 1.2;
  const kickShare = (c) => {
    const s = c.filter((x) => STRIKE.has(x));
    return s.length ? s.filter((x) => KICKS.has(x)).length / s.length : 0;
  };
  /* "More boxing"/"More kicks": combos with the preferred share are picked clearly more often (squared weight),
     the other side still appears – nobody should lose kicks or punches entirely */
  function weightedPick(pool, focus) {
    if (focus === "bal") return rnd(pool);
    const w = pool.map((c) => {
      const k = kickShare(c),
        x = focus === "kick" ? k : 1 - k;
      return (0.15 + x) ** FOCUS_POW;
    });
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) {
      r -= w[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }
  const kneeAnk = () => S.profile.limits.some((l) => l === "knee" || l === "ankle");
  function chooseTheme() {
    if (isTkd()) return null; // taekwondo has no hidden themes yet
    if (isBox()) {
      const lv = techniqueLevel(),
        recent = Object.values(S.sessions)
          .sort((a, b) => (a.created || 0) - (b.created || 0))
          .slice(-12)
          .map((s) => s.theme),
        ok = BOXT.BOX_THEMES.filter((th) => !th.lvl || lv >= th.lvl);
      return ok.sort((a, b) => recent.filter((x) => x === a.id).length - recent.filter((x) => x === b.id).length + (Math.random() - 0.5) * 0.5)[0] || null;
    }
    const p = S.profile,
      ka = kneeAnk(),
      focus = techniqueLevel() === 0 ? "bal" : p.focus;
    const ok = THEMES.filter(
      (th) =>
        (!th.disc || th.disc.includes(discOf())) &&
        (!th.lvl || techniqueLevel() >= th.lvl) &&
        !(ka && th.risky) &&
        !(th.id === "sweepFinish" && p.limits.includes("ankle")),
    );
    const recent = Object.values(S.sessions)
      .sort((a, b) => (a.created || 0) - (b.created || 0))
      .slice(-12)
      .map((s) => s.theme);
    const sc = (th) =>
      recent.filter((x) => x === th.id).length -
      ((focus === "box" && th.tag === "hand") || (focus === "kick" && th.tag === "kick") ? FOCUS_THEME : 0) +
      ((focus === "box" && th.tag === "kick") || (focus === "kick" && th.tag === "hand") ? FOCUS_THEME : 0) +
      Math.random() * 0.5;
    return ok.sort((a, b) => sc(a) - sc(b))[0] || null;
  }
  function combo(kind, theme) {
    if (isBox()) return boxCombo(kind, theme);
    if (isTkd()) return tkdCombo(kind);
    const p = S.profile,
      lim = p.limits,
      ka = kneeAnk(),
      focus = techniqueLevel() === 0 ? "bal" : p.focus;
    let pool,
      kickOnly = false;
    if (kind === "bag" && lim.includes("wrist")) {
      pool = KICK_ONLY.filter((c) => !ka || c.every((x) => !RISKY.has(x)));
      kickOnly = true;
    } else if (lim.includes("shoulder") && (kind === "bag" || kind === "pads")) {
      pool = KICK_ONLY;
      kickOnly = true;
    } else {
      pool = COMBOS.slice(0, techniqueLevel() + 1).flat();
      if (EXTRA[discOf()] && !ka && Math.random() < 0.35) pool = EXTRA[discOf()];
      if (ka) pool = pool.filter((c) => c.every((x) => !RISKY.has(x)));
      if (ka && kind === "bag") pool = HAND_ONLY;
      if (young()) pool = pool.filter((c) => !c.includes("back"));
      if (ageGroup() === "kids") pool = pool.filter((c) => c.length <= 3 && !c.some((x) => ADV.has(x)));
      if (techniqueLevel() < 2) pool = pool.filter((c) => !c.includes("jknee"));
      if (!pool.length) pool = HAND_ONLY;
    }
    // 7f: from level 1 about every fifth combo is a kick chain (2 kicks, from level 2 also 3); low kicks only where the
    // discipline allows them (Kick Light, K1); not for children, not with a knee/ankle limit
    // 7g: the plan focus steers the share too – more boxing fewer chains, more kicks more chains
    const chainP = p.focus === "box" ? 0.08 : p.focus === "kick" ? 0.3 : 0.22;
    if (!kickOnly && techniqueLevel() >= 1 && ageGroup() !== "kids" && !ka && Math.random() < chainP) {
      const ch = KICK_CHAINS.filter((x) => x.lvl <= techniqueLevel() && (!x.low || ["kl", "k1"].includes(discOf()))).map((x) => x.c);
      if (ch.length) return partnerClean(rnd(ch).slice());
    }
    let c = weightedPick(pool, focus).slice();
    if (theme && (!kickOnly || theme.kick)) {
      c = theme.ap(c, p);
      const maxLen = ageGroup() === "kids" ? 3 : techniqueLevel() + 3;
      while (c.length > maxLen) c.splice(1, 1);
      if (ka) c = c.filter((x) => !RISKY.has(x));
      if (c.length < 2) c.push("cross");
    }
    return partnerClean(c);
  }
  /* boxing: punches only; with a wrist or shoulder limit short light work instead of bag and pad load */
  function boxCombo(kind, theme) {
    const p = S.profile,
      lim = p.limits,
      load = kind === "bag" || kind === "pads";
    let pool =
      load && (lim.includes("wrist") || lim.includes("shoulder"))
        ? BOXT.BOX_LIGHT
        : BOXT.BOX_COMBOS.slice(0, techniqueLevel() + 1).flat();
    if (ageGroup() === "kids") pool = pool.filter((c) => c.length <= 3);
    if (!pool.length) pool = BOXT.BOX_LIGHT;
    let c = rnd(pool).slice();
    if (theme && pool !== BOXT.BOX_LIGHT) {
      c = theme.ap(c, p);
      const maxLen = ageGroup() === "kids" ? 3 : techniqueLevel() + 3;
      while (c.length > maxLen) c.splice(1, 1);
      if (c.length < 2) c.push("cross");
    }
    return partnerClean(c);
  }
  /* a defence needs a reason: the generated own combos (shadow, bag, partner, coach) hold no slip or block at all –
     defending happens only against a real counter action of the partner; a side step only as the exit at the end.
     Combos the user entered from club training stay as they are. */
  const OWN_DEF = new Set(["slip", "block", "step"]);
  function noDefFirst(c) {
    c = c.slice();
    while (c.length && OWN_DEF.has(c[0])) c.shift();
    return fill2(c);
  }
  function partnerClean(c) {
    c = noDefFirst(c.filter((x, i) => !(x === "slip" || x === "block" || (x === "step" && i < c.length - 1))));
    return fill2(c.filter((x, i) => !(x === "step" && i < c.length - 1)));
  }
  // Leichtkontakt: short, fast combos – at most 4 techniques (the opener and the finish stay)
  function lcShort(c) {
    if (discOf() !== "lc") return c;
    c = c.slice();
    while (c.length > 4) c.splice(1, 1);
    return c;
  }
  function fill2(c) {
    if (!c.length) return ["jab", "cross"];
    if (c.length === 1 || (c.length === 2 && c[1] === "step")) c.splice(c[0] === "jab" ? 1 : 0, 0, c[0] === "jab" ? "cross" : "jab");
    return c;
  }
  const RT = {
    shadow: [
      "Schattenboxen",
      "Shadowboxing",
      "Kombination sauber wiederholen, nach jeder Serie Beinarbeit.",
      "Repeat the combo cleanly, footwork after every set.",
    ],
    bag: [
      "Sandsack",
      "Heavy bag",
      "Kombination mit Kraft, danach sofort raus aus der Linie.",
      "Throw the combo with power, then step off the line.",
    ],
    // one partner round type – with or without a counter action. "pads"/"counter" only for sessions saved earlier
    partner: [
      "Partnerdrill",
      "Partner drill",
      "A schlägt die Kombination kontrolliert, B verteidigt. Ist eine Gegenaktion angegeben, kommt sie genau an dieser Stelle und der andere verteidigt. Kontrollierter Kontakt. Nach 3–5 Wiederholungen Rollen tauschen.",
      "A throws the combo with control, B defends. Where a counter action is shown, it comes exactly there and the other one defends. Controlled contact. Swap roles every 3–5 reps.",
    ],
    pads: [
      "Partnerdrill",
      "Partner drill",
      "A schlägt die Kombination kontrolliert, B verteidigt. Ist eine Gegenaktion angegeben, kommt sie genau an dieser Stelle und der andere verteidigt. Kontrollierter Kontakt. Nach 3–5 Wiederholungen Rollen tauschen.",
      "A throws the combo with control, B defends. Where a counter action is shown, it comes exactly there and the other one defends. Controlled contact. Swap roles every 3–5 reps.",
    ],
    counter: [
      "Partnerdrill",
      "Partner drill",
      "A schlägt die Kombination kontrolliert, B verteidigt. Ist eine Gegenaktion angegeben, kommt sie genau an dieser Stelle und der andere verteidigt. Kontrollierter Kontakt. Nach 3–5 Wiederholungen Rollen tauschen.",
      "A throws the combo with control, B defends. Where a counter action is shown, it comes exactly there and the other one defends. Controlled contact. Swap roles every 3–5 reps.",
    ],
    sixkick: [
      "6-Kick-Runde",
      "6-kick round",
      "Mindestens 6 Kicks in der Runde – mitzählen! (WAKO Full Contact)",
      "At least 6 kicks this round – count them! (WAKO Full Contact)",
    ],
    // boxing: footwork round and evasion round (always with an opponent action, imagined or real)
    foot: [
      "Beinarbeit-Runde",
      "Footwork round",
      "Schattenboxen mit Fokus auf Schritte: Winkel, Distanz halten, Jab als Führung. Nach jedem Schritt wieder in die Grundstellung.",
      "Shadowboxing with a focus on steps: angles, holding distance, the jab as a lead. Back into your stance after every step.",
    ],
    evade: [
      "Meiden & Kontern",
      "Slip & counter",
      "Stell dir einen Angriff vor, weiche aus und kontere sofort mit der Kombination. Kopf bewegen, Hände oben.",
      "Picture an attack, evade it and counter straight away with the combination. Move your head, hands up.",
    ],
    rope: [
      "Seil-Runde",
      "Rope round",
      "Die ganze Runde springen, letzte 20 s Vollgas.",
      "Skip the whole round, last 20 s all-out.",
    ],
  };
  /*
   * Task sparring (Aufgabensparring) for "Sparring" sessions.
   * p = with a partner, s = solo version used on the bag or as shadow sparring (null = partner only).
   * disc limits a task to disciplines, lvl is the minimum level, risky tasks are skipped with knee/ankle limits.
   */
  const TASKS = [
    {
      id: "hands",
      de: [
        "Nur Hände",
        "Beide schlagen nur mit den Fäusten, Kicks sind tabu. Fokus auf Deckung und Kopfbewegung.",
        "Nur Fausttechniken, dazwischen Kopfbewegung und Beinarbeit.",
      ],
      en: [
        "Hands only",
        "Both use punches only, no kicks. Focus on guard and head movement.",
        "Punches only, with head movement and footwork in between.",
      ],
    },
    {
      id: "kicks",
      de: [
        "Nur Kicks",
        "Nur Fußtechniken, die Hände bleiben oben zur Deckung.",
        "Nur Fußtechniken, die Hände bleiben oben zur Deckung.",
      ],
      en: ["Kicks only", "Kicks only, hands stay up as a guard.", "Kicks only, hands stay up as a guard."],
    },
    {
      id: "attdef",
      de: [
        "Angreifer & Verteidiger",
        "A greift nur an, B verteidigt nur mit Block, Ausweichen und Beinarbeit. Nach 3–5 Aktionen Rollen tauschen.",
        null,
      ],
      en: [
        "Attacker & defender",
        "A only attacks, B only defends with blocks, slips and footwork. Swap roles every 3–5 exchanges.",
        null,
      ],
    },
    {
      id: "counter",
      de: [
        "Nur Konter",
        "B darf erst kontern, wenn A angegriffen hat. Nach 3–5 Aktionen Rollen tauschen.",
        "Stell dir einen Angriff vor: erst blocken oder ausweichen, dann sofort kontern.",
      ],
      en: [
        "Counters only",
        "B may only counter after A attacks. Swap roles every 3–5 exchanges.",
        "Picture an attack: block or slip first, then counter straight away.",
      ],
    },
    {
      id: "lead",
      de: [
        "Vordere Seite",
        "Nur Techniken der vorderen Seite: Jab, Haken V, Kicks V.",
        "Nur Techniken der vorderen Seite: Jab, Haken V, Kicks V.",
      ],
      en: [
        "Lead side only",
        "Lead-side techniques only: jab, lead hook, lead kicks.",
        "Lead-side techniques only: jab, lead hook, lead kicks.",
      ],
    },
    {
      id: "kickcounter",
      lvl: 1,
      de: [
        "Kick-Konter",
        "Auf jeden Schlag des Partners antwortest du mit einem Kick.",
        "Nach jeder Hand-Kombination sofort ein Kick hinterher.",
      ],
      en: [
        "Kick counters",
        "Answer every punch from your partner with a kick.",
        "Follow every punch combination with a kick.",
      ],
    },
    {
      id: "pressure",
      de: [
        "Druck & Rückwärts",
        "A macht Druck nach vorn, B arbeitet nur rückwärts und seitlich mit Jab und Beinarbeit. Nach 3–5 Aktionen tauschen.",
        "Abwechselnd 20 s nach vorn drücken und 20 s rückwärts mit Jab und Seitschritten arbeiten.",
      ],
      en: [
        "Pressure & retreat",
        "A pushes forward, B only moves back and sideways with the jab and footwork. Swap every 3–5 exchanges.",
        "Alternate 20 s pressing forward and 20 s moving back with the jab and side steps.",
      ],
    },
    {
      id: "corner",
      de: [
        "Raus aus der Ecke",
        "B startet in der Ringecke bzw. am Mattenrand und muss sich mit Beinarbeit und Konter befreien. Danach tauschen.",
        null,
      ],
      en: [
        "Out of the corner",
        "B starts in the corner or at the mat edge and has to escape with footwork and counters. Then swap.",
        null,
      ],
    },
    {
      id: "firsthit",
      disc: ["lc", "kl"],
      de: [
        "Erster Treffer",
        "Der erste saubere Treffer zählt – kurz trennen, neu beginnen. Wer hat am Ende der Runde mehr?",
        null,
      ],
      en: [
        "First clean hit",
        "The first clean hit scores – break, then restart. Who has more at the end of the round?",
        null,
      ],
    },
    {
      id: "control",
      disc: ["lc", "kl"],
      de: ["Kontrolle", "Nur leichte, kontrollierte Treffer. Jeder zu harte Treffer kostet einen Punkt.", null],
      en: ["Control", "Light, controlled hits only. Every hit that's too hard costs a point.", null],
    },
    {
      id: "sixkick",
      disc: ["fc"],
      de: [
        "6 Kicks zählen",
        "Mindestens 6 Kicks in der Runde – der Partner zählt laut mit.",
        "Mindestens 6 Kicks in der Runde – laut mitzählen.",
      ],
      en: [
        "Count 6 kicks",
        "At least 6 kicks this round – your partner counts out loud.",
        "At least 6 kicks this round – count out loud.",
      ],
    },
    {
      id: "lowfocus",
      disc: ["kl", "k1"],
      risky: true,
      de: [
        "Low-Kick-Fokus",
        "Jede Aktion endet mit einem Low Kick zum Oberschenkel, B übt das Checken.",
        "Jede Kombination endet mit einem Low Kick zum Oberschenkel.",
      ],
      en: [
        "Low kick focus",
        "Every exchange ends with a low kick to the thigh; B practises checking.",
        "Every combination ends with a low kick to the thigh.",
      ],
    },
    {
      id: "knee",
      disc: ["k1"],
      risky: true,
      de: [
        "Knie aus der Bewegung",
        "Knie nur aus der Bewegung einsetzen – kein Halten, kein Clinch.",
        "Knie nur aus der Bewegung einsetzen, dann sofort raus aus der Distanz.",
      ],
      en: [
        "Knees on the move",
        "Use knees only on the move – no holding, no clinch.",
        "Throw knees on the move, then step straight out of range.",
      ],
    },
    {
      id: "bodyhead",
      de: [
        "Körper, dann Kopf",
        "Erst zum Körper treffen, dann zum Kopf – zum Beispiel Körperhaken, dann High Kick.",
        "Erst zum Körper, dann zum Kopf – zum Beispiel Körperhaken, dann High Kick.",
      ],
      en: [
        "Body, then head",
        "Hit the body first, then the head – e.g. body hook, then high kick.",
        "Body first, then head – e.g. body hook, then high kick.",
      ],
    },
    {
      id: "free",
      lvl: 1,
      gear: true,
      de: ["Freies technisches Sparring", "Alles nach Regelwerk erlaubt, 50 % Kraft, Trainer schaut zu.", null],
      en: ["Free technical sparring", "Everything the rules allow, 50 % power, coach watching.", null],
    },
  ];
  TASKS.push(...BOX_TASKS, ...TKDT.TASKS, ...ITFT.TASKS);
  const LIGHT_TASKS = ["hands", "kicks", "lead", "counter", "bodyhead", "control", "attdef"];
  function sparRounds(n, loc, eq, light) {
    const p = S.profile,
      ka = kneeAnk(),
      box = isBox(),
      tkd = isTkd(),
      kid = ageGroup() === "kids",
      age = ageAt(today()),
      // boxing: children never spar with a partner (solo work with an imagined opponent)
      mode = eq.includes("partner") && !(box && kid) ? "p" : eq.includes("bag") && loc !== "out" ? "b" : "s";
    const ok = TASKS.filter(
      (x) =>
        (box ? x.sport === "boxing" : tkd ? x.sport === "taekwondo" && (!x.style || x.style === tkdUnitStyle()) : x.sport !== "boxing" && x.sport !== "taekwondo") &&
        !(x.minAge && age != null && age < x.minAge) &&
        !(x.maxAge && age != null && age > x.maxAge) &&
        !(x.kup != null && (tkdKup() == null ? techniqueLevel() < 1 : tkdKup() > x.kup)) &&
        !(x.touch && (kid || light)) &&
        (mode === "p" || x.de[2]) &&
        (!x.disc || x.disc.includes(discOf())) &&
        (!x.lvl || techniqueLevel() >= x.lvl) &&
        !(ka && x.risky) &&
        !(x.gear && mode !== "p") &&
        !(light && !(LIGHT_TASKS.includes(x.id) || x.light)),
    );
    // discipline-specific tasks always make the cut, the rest is shuffled
    const must = ok.filter((x) => x.disc),
      rest = shuffle(ok.filter((x) => !x.disc));
    const order = [...must, ...rest].slice(0, n);
    const picked = shuffle(order);
    const out = Array.from({ length: n }, (_, i) => ({
      kind: "round",
      k: "task",
      id: picked[i % picked.length].id,
      m: mode,
    }));
    // touch sparring: at most one round per session; free hitting never repeats
    const tough = new Set(TASKS.filter((x) => x.touch).map((x) => x.id)),
      other = picked.filter((x) => !tough.has(x.id));
    let seenTouch = false;
    out.forEach((r, i) => {
      if (!tough.has(r.id)) return;
      if (!seenTouch) seenTouch = true;
      else if (other.length) r.id = other[i % other.length].id;
    });
    return out;
  }
  /* head-height kicks: they need warm hips, so never in the opening round(s) */
  const HIGHK = new Set(["roundh", "axe", "hookk", "brazil", "shook", "tornado", "jknee"]);
  const LOWER = {
    roundh: "round",
    axe: "front",
    hookk: "round",
    brazil: "round",
    shook: "back",
    tornado: "round",
    jknee: "knee",
  };
  /* Partner rounds get a counter action by the partner now and then – an exception, more with a higher level
     (reactCount): before the combo (you defend, then your combo starts), in the middle of a longer combo
     (from Fortgeschritten) or after it (you defend).
     Attack → fitting defences, with the level from which each appears. Low kicks only in Kick Light and K1. */
  const DEFS = {
    cover: ["Doppeldeckung", "Double guard"],
    step: ["Rausgehen", "Step out"],
    parry: ["Parieren", "Parry"],
    slip: ["Slippen", "Slip"],
    duck: ["Abducken", "Duck"],
    block: ["Abblocken", "Block"],
    deflect: ["Ableiten", "Deflect"],
    check: ["Checken (Schienbein-Block)", "Check (shin block)"],
    lift: ["Fuß anheben", "Lift the foot"],
  };
  Object.assign(DEFS, TKDT.DEFS, ITFT.DEFS); // taekwondo defences (Zurückweichen, Ausweichen, Abblocken, Eindrehen)
  const COUNTER_ATT = {
    jab: { lvl: 0, d: [["cover", 0], ["step", 0], ["parry", 1], ["slip", 1]] },
    cross: { lvl: 0, d: [["cover", 0], ["step", 0], ["parry", 1], ["slip", 1]] },
    round: { lvl: 0, d: [["block", 0], ["step", 0]] },
    hook: { lvl: 1, d: [["cover", 1], ["duck", 1]] },
    front: { lvl: 1, d: [["deflect", 1], ["step", 1]] },
    roundh: { lvl: 2, d: [["cover", 2], ["step", 2], ["duck", 2]] },
    upper: { lvl: 1, d: [["cover", 1], ["step", 1]] },
    hookb: { lvl: 1, d: [["block", 1]] },
    crossb: { lvl: 1, d: [["block", 1], ["step", 1]] },
    side: { lvl: 1, d: [["deflect", 1], ["step", 1]] },
    lowk: { lvl: 0, low: true, d: [["check", 0], ["step", 0]] },
    // foot sweep (foot against foot, allowed in all WAKO disciplines): from Fortgeschritten, not with ankle limits
    sweep: { lvl: 1, sweep: true, d: [["lift", 1], ["step", 1]] },
    // K1 only: a knee to the body – blocked with the forearms or by stepping out
    knee: { lvl: 1, k1: true, d: [["block", 1], ["step", 1]] },
  };
  /* your own answer after a defence (the quick exchange): what fits best after each defence */
  const ANSWER = {
    parry: ["cross", "jab"],
    slip: ["hookb", "cross", "crossb", "upper"],
    duck: ["hook", "upper"],
    cover: ["cross", "hook", "knee"],
    block: ["cross", "round", "knee"],
    check: ["lowk", "cross"],
    deflect: ["cross", "round"],
    step: ["jab", "front"],
    lift: ["round", "cross"],
  };
  // low kicks: checked and stepped out half and half – alternating within a session, random start
  let lowTurn = 0;
  // the partner's attacks vary within a session: an attack already used comes again only when all were used
  const usedAtt = new Set();
  function partnerReact(c) {
    const p = S.profile,
      kid = ageGroup() === "kids",
      ka = kneeAnk(),
      box = isBox(),
      lowOk = (discOf() === "kl" || discOf() === "k1") && !ka && !kid,
      lvl = techniqueLevel() || 0;
    const atts = Object.keys(COUNTER_ATT).filter((a) => {
      const x = COUNTER_ATT[a];
      if (box) return BOXT.BOX_ATT.has(a) && (kid ? a === "jab" || a === "cross" : lvl >= x.lvl);
      if (kid) return a === "jab" || a === "cross";
      if (x.low) return lowOk;
      if (x.sweep) return lvl >= x.lvl && !p.limits.includes("ankle");
      if (x.k1) return discOf() === "k1" && lvl >= x.lvl;
      return lvl >= x.lvl;
    });
    const pick = (low) => {
      // low kicks come often in Kick Light/K1 – they are what those disciplines add
      let pool = low && atts.includes("lowk") ? ["lowk"] : atts;
      if (pool.length > 1) {
        const fresh = pool.filter((x) => !usedAtt.has(x));
        pool = fresh.length ? fresh : pool;
      }
      const a = pool[Math.floor(Math.random() * pool.length)],
        ds = COUNTER_ATT[a].d.filter(([d, l]) => lvl >= l && !(kid && !["cover", "parry", "step"].includes(d)) && !(ka && d === "check"));
      usedAtt.add(a);
      if (a === "lowk" && ds.length === 2) return { a, d: lowTurn++ % 2 ? "step" : "check" };
      return { a, d: (ds[Math.floor(Math.random() * ds.length)] || ["cover"])[0] };
    };
    // the quick exchange: after the defence you answer right away (Fortgeschritten about half the time, Wettkampf mostly)
    const answer = (x) => {
      if (kid || Math.random() >= [0, 0.5, 0.85][lvl]) return x;
      const ok = (ANSWER[x.d] || []).filter(
        (t) =>
          !(box && !BOXT.BOX_ATT.has(t)) &&
          !(t === "lowk" && !lowOk) &&
          !(t === "knee" && (discOf() !== "k1" || ka)) &&
          !((t === "upper" || t === "hookb") && lvl < 1),
      );
      return ok.length ? { ...x, c: ok[Math.floor(Math.random() * ok.length)] } : x;
    };
    // one counter action – at the start, in the middle or at the end (how many rounds get one: reactCount)
    const spots = ["pre", "post"],
      cuts = c ? c.map((x, i) => i).filter((i) => i >= 1 && i <= c.length - 2 && STRIKE.has(c[i - 1])) : [];
    if (!kid && lvl >= 1 && cuts.length) spots.push("mid");
    const at = spots[Math.floor(Math.random() * spots.length)],
      r = {};
    if (at === "pre") r.pre = pick(lowOk && Math.random() < 0.5);
    else if (at === "post") r.post = answer(pick(lowOk && Math.random() < 0.35));
    else r.mid = { at: cuts[Math.floor(Math.random() * cuts.length)], ...pick(false) };
    // Wettkampf: in some rounds the partner comes in twice – before your combo and again after it
    const dbl = discOf() === "fc" ? [0, 0.25, 0.6][lvl] : lvl >= 2 ? 0.4 : 0;
    if (!kid && !r.post && Math.random() < dbl) r.post = answer(pick(lowOk && Math.random() < 0.35));
    return r;
  }
  /* how many partner rounds of one session get a counter action: Grundlage (and children) exactly 1,
     Fortgeschritten 2–4, Wettkampf 3–6 – never more than there are partner rounds */
  const REACT_N = [
    [1, 1],
    [2, 4],
    [3, 6],
  ];
  function reactCount(partnerRounds) {
    const lvl = ageGroup() === "kids" ? 0 : techniqueLevel() || 0,
      [lo, hi] = REACT_N[lvl] || REACT_N[0];
    // boxing: more evasion work with a real opponent action (docs/boxing-concept.md §3.1)
    return Math.min(lo + Math.floor(Math.random() * (hi - lo + 1)) + (isBox() && lvl > 0 ? 1 : 0), partnerRounds);
  }
  /* Partner rounds with a counter action: who does what, in order, as framed groups – A (attacker, light blue)
     and B (partner, yellow). Inside the frames the usual technique chips; a defence is a plain chip. */
  function reactHtml(it) {
    const R = it.react,
      c = it.combo;
    // boxing evasion round: the defence, then the counter – nothing is said about the opponent
    if (it.evade && c) {
      const sd0 = sides(c);
      return `<div class="combo pseq"><span class="dfn">${esc(DEFS[it.evade.d][S.profile.lang === "de" ? 0 : 1])}</span>${c.map((x, i) => techChip(x, sd0[i])).join("")}</div>`;
    }
    if (!R) return c ? comboHtml(c) : "";
    const sd = sides(c),
      lg = S.profile.lang === "de" ? 0 : 1,
      chips = (from, to) => c.slice(from, to).map((x, i) => techChip(x, sd[from + i])).join(""),
      def = (x) => `<span class="dfn">${esc(DEFS[x.d][lg])}</span>`,
      att = (x) => techChip(x.a, oneSide(x.a)),
      grp = (who, inner) => `<span class="pg ${who}"><b class="pgw">${who.toUpperCase()}</b>${inner}</span>`;
    let g = [];
    if (R.pre) g = [grp("b", att(R.pre)), grp("a", def(R.pre) + chips(0))];
    else if (R.mid) g = [grp("a", chips(0, R.mid.at)), grp("b", att(R.mid)), grp("a", def(R.mid) + chips(R.mid.at))];
    else g = [grp("a", chips(0))];
    // a second partner action (Wettkampf) or the counter after the combo
    if (R.post) g.push(grp("b", att(R.post)), grp("a", def(R.post) + (R.post.c ? techChip(R.post.c, oneSide(R.post.c)) : "")));
    return `<div class="combo pseq">${g.join("")}</div>`;
  }
  const PARTNER_K = new Set(["partner", "pads", "counter"]);
  // Full Contact partner rounds: a short reminder to get straight back into the guard
  const guardCue = (it) =>
    PARTNER_K.has(it.k) ? (discOf() === "fc" ? t("fcGuard") : discOf() === "lc" ? t("lcControl") : "") : "";
  // round text; the heavy bag reads differently in Full Contact (impact) and Leichtkontakt (speed)
  /* taekwondo rounds carry sp: "t" and read their own texts */
  const rtOf = (it) => (it.sp === "t" && tkm().RT[it.k]) || RT[it.k];
  const roundDesc = (it, lg) => (it.pow ? t("wtPow") + " " : "") + ((it.k === "bag" && it.sp !== "t" && t("bagDisc")[discOf()]) || (rtOf(it) || [])[lg + 2] || "");
  /* rough difficulty of a combo: length, kicks, head kicks and advanced techniques */
  const comboLevel = (c) =>
    c.length + 0.5 * c.filter((x) => KICKS.has(x)).length + c.filter((x) => HIGHK.has(x)).length + 1.5 * c.filter((x) => ADV.has(x)).length;
  /* Boxing technique/conditioning rounds: shadow, bag, partner drills plus a larger share of footwork rounds and
     evasion rounds (always an opponent action first, imagined or real – never a random defence) */
  /* taekwondo (WT): kicks released by level and grade (sports/taekwondo/techniques.js); a wrist or shoulder limit drops the
     punch; children up to 3 techniques; head-height kicks never in the opening rounds (noHead) */
  const ITF_SPECT = new Set(["ttdol", "ttyeop", "dwi", "dhu"]);
  /* active flexibility in the full range of motion (WT focus, 7b) */
  const ACTIVE_MOB = ["mob.kick_holds", "mob.slow_motion_kicks", "mob.controlled_leg_swings", "mob.active_leg_raises"];
  function tkdCombo(kind, noHead) {
    const p = S.profile,
      ctx = tkdCtx(),
      lim = p.limits;
    const M = tkm();
    let pool = M.COMBOS.slice(0, (techniqueLevel() || 0) + 1).flat();
    pool = pool.filter((c) => c.every((x) => M.allowed(x, ctx)));
    // 7g: a technique released by the grade alone (level OR grade) also brings the higher combos that carry it – 7h: about
    // every fifth combo, so the level pool stays the core
    if (ctx.kup != null) {
      const extra = M.COMBOS.slice((techniqueLevel() || 0) + 1).flat().filter((c) => c.some((x) => M.byGrade(x, ctx)) && c.every((x) => M.allowed(x, ctx)));
      if (extra.length && Math.random() < 0.2) pool = extra;
    }
    if (lim.includes("wrist") || lim.includes("shoulder")) pool = pool.filter((c) => !c.some((x) => TKDT.HANDS.has(x) || (M.HANDS && M.HANDS.has(x))));
    if (noHead) pool = pool.filter((c) => !c.some((x) => M.HEAD.has(x)));
    if (ctx.kid) pool = pool.filter((c) => c.length <= 3);
    // the fitter, the longer the kick chains: advanced at least 3 kicks, competition level at least 4 (most of the time).
    // 7f: warm-up rounds without head kicks and ITF (hand-foot, weaker form) need one kick less: 2 / 3
    const lvl = techniqueLevel() || 0,
      need = (noHead || M === ITFT ? 1 : 2) + lvl,
      longer = pool.filter((c) => M.kickCount(c) >= need);
    // ITF (7b B8): from level 1 about every second combo carries a jumping or spinning kick, as far as grade, age and limits allow
    const spect = M === ITFT && lvl >= 1 ? pool.filter((c) => c.some((x) => ITF_SPECT.has(x))) : [];
    if (lvl >= 1 && longer.length && Math.random() < 0.75) pool = longer;
    if (spect.length && Math.random() < 0.45) {
      const sl = spect.filter((c) => pool.includes(c));
      pool = sl.length ? sl : spect;
    }
    if (!pool.length) pool = M.LIGHT.filter((c) => c.every((x) => M.allowed(x, ctx)));
    if (!pool.length) pool = [["ap", "dol"]];
    return rnd(pool).slice();
  }
  /* taekwondo technique and conditioning rounds: shadow kicks, bag, pad drills, footwork and evade & counter rounds */
  function tkdRounds(type, n, loc, eq, easy) {
    const p = S.profile,
      partner = eq.includes("partner"),
      ka = kneeAnk(),
      lvl = techniqueLevel() || 0,
      kid = ageGroup() === "kids",
      ctx = tkdCtx(),
      bag = eq.includes("bag") && loc !== "out" && !p.limits.includes("shoulder"),
      // 7f: WT from level 1 has more chain rounds (shadow, bag, pads) between footwork and evade & counter
      more = tkdUnitStyle() === "wt" && lvl >= 1 && !kid,
      cyc = partner
        ? more ? ["partner", "partner", "foot", "partner", "evade"] : ["partner", "foot", "partner", "evade"]
        : bag
          ? more ? ["shadow", "bag", "foot", "shadow", "evade", "bag"] : ["shadow", "foot", "bag", "evade"]
          : more ? ["shadow", "foot", "shadow", "evade"] : ["shadow", "foot", "evade"],
      kinds = [];
    for (let i = 0; i < n; i++) {
      let k = cyc[i % cyc.length];
      if (type === "C" && eq.includes("rope") && i === n - 1 && !ka) k = "rope";
      kinds.push(k);
    }
    const M = tkm(),
      counters = M.COUNTER.filter((c) => c.lvl <= lvl && c.c.every((x) => M.allowed(x, ctx)) && (!kid || (M.KID_DEFS.has(c.d) && c.c.length <= 2)));
    const used = new Set(),
      warm = Math.max(1, easy);
    const out = kinds.map((k, i) => {
      const r = { kind: "round", k, sp: "t" };
      if (k === "shadow" || k === "bag" || k === "partner") r.combo = tkdCombo(k === "partner" ? "pads" : k, i < warm);
      if (k === "evade") {
        const fresh = counters.filter((c) => !used.has(c.d + c.att)),
          pickC = rnd(fresh.length ? fresh : counters.length ? counters : M.COUNTER.slice(0, 2));
        used.add(pickC.d + pickC.att);
        r.combo = pickC.c.slice();
        // 7f: WT from level 1 – after the counter a short chain follows now and then (trunk, at level 2 up to the head)
        if (more && Math.random() < 0.5) {
          const follow = lvl >= 2 && M.allowed("dolh", ctx) ? ["dol", "dolh"] : ["dol"];
          if (follow.every((x) => M.allowed(x, ctx)) && r.combo.length + follow.length <= 6) r.combo.push(...follow);
        }
        r.evade = { d: pickC.d };
      }
      return r;
    });
    // no combo twice in one session
    const seen = new Set();
    for (const r of out) {
      if (!r.combo || r.k === "evade") continue;
      for (let t = 0; t < 6 && seen.has(r.combo.join()); t++) r.combo = tkdCombo(r.k === "partner" ? "pads" : r.k, out.indexOf(r) < warm);
      seen.add(r.combo.join());
    }
    // partner rounds build up from short to long
    if (partner) {
      const pr = out.filter((r) => r.k === "partner" && r.combo),
        sorted = pr.map((r) => r.combo).sort((x, y) => x.length - y.length);
      pr.forEach((r, i) => (r.combo = sorted[i]));
    }
    // ease into it: the first round(s) at 70 %
    for (let i = 0; i < Math.min(easy, out.length - 1); i++) out[i].ease = 1;
    return out;
  }
  function boxRounds(type, n, loc, eq, theme, easy) {
    const p = S.profile,
      partner = eq.includes("partner"),
      ka = kneeAnk(),
      lvl = techniqueLevel() || 0,
      kid = ageGroup() === "kids",
      bag = eq.includes("bag") && loc !== "out" && !p.limits.includes("wrist") && !p.limits.includes("shoulder"),
      cyc = partner ? ["partner", "foot", "partner", "evade"] : bag ? ["shadow", "foot", "bag", "evade"] : ["shadow", "foot", "evade"],
      kinds = [];
    for (let i = 0; i < n; i++) {
      let k = cyc[i % cyc.length];
      if (type === "C" && eq.includes("rope") && i === n - 1 && !ka) k = "rope";
      kinds.push(k);
    }
    const counters = BOXT.BOX_COUNTER.filter((c) => c.lvl <= lvl && (!kid || ["cover", "parry", "step"].includes(c.d)) && (!kid || c.c.length <= 2));
    const used = new Set();
    const out = kinds.map((k) => {
      const r = { kind: "round", k };
      if (k === "shadow" || k === "bag" || k === "partner") r.combo = combo(k === "partner" ? "pads" : k, theme);
      if (k === "evade") {
        const fresh = counters.filter((c) => !used.has(c.d + c.att)),
          c = rnd(fresh.length ? fresh : counters);
        used.add(c.d + c.att);
        r.combo = c.c.slice();
        // only the defence is named, what the opponent does stays open (Betreiber, 03.11.2026)
        r.evade = { d: c.d };
      }
      return r;
    });
    // no combo twice in one session
    const seen = new Set();
    for (const r of out) {
      if (!r.combo || r.k === "evade") continue;
      for (let t = 0; t < 6 && seen.has(r.combo.join()); t++) r.combo = combo(r.k === "partner" ? "pads" : r.k, theme);
      seen.add(r.combo.join());
    }
    // every session has punches to the body
    const BODY = ["jabb", "crossb", "hookb"],
      withC = out.filter((r) => r.combo && r.k !== "evade" && r.k !== "bag");
    if (!out.some((r) => r.combo && r.combo.some((x) => BODY.includes(x)))) {
      const cand = withC.filter((r) => r.combo.includes("cross") || r.combo.includes("jab"));
      if (cand.length) {
        const r = rnd(cand),
          i = r.combo.lastIndexOf("cross") >= 0 ? r.combo.lastIndexOf("cross") : r.combo.indexOf("jab");
        r.combo[i] = r.combo[i] === "cross" ? "crossb" : "jabb";
      }
    }
    // partner rounds build up from easy to hard
    if (partner) {
      const pr = out.filter((r) => r.k === "partner" && r.combo),
        sorted = pr.map((r) => r.combo).sort((x, y) => x.length - y.length);
      pr.forEach((r, i) => (r.combo = sorted[i]));
    }
    // ease into it: the first round(s) at 70 %
    for (let i = 0; i < Math.min(easy, out.length - 1); i++) out[i].ease = 1;
    if (kid) for (const r of out) if (r.combo) while (r.combo.length > 3) r.combo.splice(1, 1);
    // real counter actions of the partner on some partner rounds (more with a higher level)
    if (partner) {
      const idx = out.map((r, i) => i).filter((i) => out[i].k === "partner" && out[i].combo),
        pool = idx.length > 1 ? idx.slice(1) : idx,
        want = reactCount(pool.length),
        order = pool.map((i) => ({ i, w: i + Math.random() * pool.length * 0.6 })).sort((a, b) => b.w - a.w);
      usedAtt.clear();
      order.slice(0, want).forEach(({ i }) => (out[i].react = partnerReact(out[i].combo)));
    }
    return out;
  }
  function fightRounds(type, n, loc, eq, theme, easy = 1) {
    if (isBox()) return boxRounds(type, n, loc, eq, theme, easy);
    if (isTkd()) return tkdRounds(type, n, loc, eq, easy);
    const p = S.profile,
      partner = eq.includes("partner"),
      ka = kneeAnk();
    const bag = eq.includes("bag") && loc !== "out",
      cyc = [];
    if (partner) {
      cyc.push("partner"); // every partner round is a Partnerdrill: a combo with or without a counter action
    } else {
      cyc.push("shadow");
      if (bag) cyc.push("bag");
    }
    const kinds = [];
    for (let i = 0; i < n; i++) {
      let k = cyc[i % cyc.length];
      if (type === "C" && eq.includes("rope") && i === n - 1 && !ka) k = "rope";
      kinds.push(k);
    }
    if (discOf() === "fc" && n >= 3 && !ka) {
      const idx = Math.min(2, n - 1);
      if (["shadow", "bag"].includes(kinds[idx]) || !partner) kinds[idx] = "sixkick";
    }
    // my combos from club training: the first suitable round always, later ones now and then
    let mi = Math.floor(Math.random() * 8),
      gotMine = false;
    const out = kinds.map((k) => {
      const r = { kind: "round", k };
      if (["shadow", "bag", "pads", "counter", "partner"].includes(k)) {
        const kk = k === "bag" || k === "shadow" ? k : "pads",
          mine = myCombos(kk);
        if (mine.length && (!gotMine || Math.random() < 0.35)) {
          r.combo = mine[mi++ % mine.length].slice();
          r.mine = 1;
          gotMine = true;
        } else r.combo = combo(kk, theme);

      }
      if (k === "sixkick")
        r.combo = ["front", "round", "side", "roundh", "round", "front"].filter(
          (x) => !(techniqueLevel() === 0 && x === "roundh"),
        );
      return r;
    });
    // no combo twice in one session (a repeat gets a fresh one, a few tries)
    const seen = new Set();
    for (const r of out) {
      if (!r.combo || r.mine || r.k === "sixkick") continue;
      r.combo = lcShort(r.combo);
      if (PARTNER_K.has(r.k)) r.combo = partnerClean(r.combo);
      for (let t = 0; t < 6 && seen.has(r.combo.join()); t++) {
        const kk = r.k === "bag" || r.k === "shadow" ? r.k : "pads",
          c = combo(kk, theme);
        r.combo = lcShort(PARTNER_K.has(r.k) ? partnerClean(c) : c);
      }
      seen.add(r.combo.join());
    }
    // Kick Light & K1: every session trains the discipline's own techniques
    // every kickboxing session contains high kicks; Kick Light low kicks; K1 low kicks and knees
    const withC = out.filter(
      (r) =>
        r.combo &&
        r.k !== "sixkick" &&
        !r.mine &&
        !(r.k === "bag" && (ka || p.limits.includes("wrist") || p.limits.includes("shoulder"))),
    );
    const need = ["roundh"];
    if (EXTRA[discOf()] && !ka) need.push(...(discOf() === "k1" ? ["lowk", "knee"] : ["lowk"]));
    const highPool = COMBOS.slice(0, techniqueLevel() + 1)
      .flat()
      .filter(
        (c) =>
          c.includes("roundh") &&
          c.every((x) => !ka || !RISKY.has(x)) &&
          !(ageGroup() === "kids" && c.some((x) => ADV.has(x))),
      );
    need.forEach((tech, j) => {
      const cnt = out.filter((r) => r.combo && r.combo.includes(tech)).length,
        want = tech === "roundh" ? Math.max(1, Math.round(n / 4)) : 1;
      for (let m = cnt; m < want && withC.length; m++) {
        const free = withC.filter((x) => !x.combo.some((y) => need.includes(y))),
          pool = free.length ? free : withC.filter((x) => !x.combo.includes(tech));
        if (!pool.length) break;
        const r = pool[(j + m * 2 + 1) % pool.length];
        const src = tech === "roundh" ? (highPool.length ? highPool : [["jab", "cross", "roundh"]]) : EXTRA[discOf()].filter((c) => c.includes(tech)),
          have = new Set(out.map((x) => x.combo && x.combo.join())),
          fresh = src.filter((c) => !have.has(partnerClean(c).join()));
        // all fitting combos are in use already (few at Grundlage): this round's combo ends in the high kick instead
        if (!fresh.length && tech === "roundh") r.combo = fill2([...r.combo.filter((x) => x !== "round" && x !== "step" && !HIGHK.has(x)).slice(0, techniqueLevel() + 2), "roundh"]);
        else r.combo = lcShort(partnerClean(rnd(fresh.length ? fresh : src)));
      }
    });
    // every session has punches to the body: without one, a cross (or jab) of one combo goes to the body
    // Full Contact: at least two combos with a body shot (impact to the body counts there)
    const BODY = ["jabb", "crossb", "hookb"],
      bodyWant = discOf() === "fc" ? 2 : 1;
    for (let m = out.filter((r) => r.combo && r.combo.some((x) => BODY.includes(x))).length; m < bodyWant; m++) {
      const cand = withC.filter((r) => !r.combo.some((x) => BODY.includes(x)) && (r.combo.includes("cross") || r.combo.includes("jab")));
      if (cand.length) {
        const r = rnd(cand),
          i = r.combo.lastIndexOf("cross") >= 0 ? r.combo.lastIndexOf("cross") : r.combo.indexOf("jab");
        r.combo[i] = r.combo[i] === "cross" ? "crossb" : "jabb";
      } else {
        // 7g: only kick combos left (kick chains, 7f) – one of them opens with a cross to the body (not the 6-kick round, not my combos)
        const kc = withC.filter((r) => !r.combo.some((x) => BODY.includes(x)) && !r.six && !r.mine);
        if (kc.length) rnd(kc).combo.unshift("crossb");
      }
    }
    // partner rounds: no defence without a reason in the own combo (my club combos stay as they are)
    if (partner) for (const r of out) if (PARTNER_K.has(r.k) && r.combo && !r.mine) r.combo = partnerClean(r.combo);
    // partner rounds build up from easy to hard: the combos of the partner rounds are re-ordered by difficulty
    if (partner) {
      const pr = out.filter((r) => PARTNER_K.has(r.k) && r.combo),
        sorted = pr.map((r) => ({ c: r.combo, m: r.mine })).sort((x, y) => comboLevel(x.c) - comboLevel(y.c));
      pr.forEach((r, i) => {
        r.combo = sorted[i].c;
        if (sorted[i].m) r.mine = 1;
        else delete r.mine;
      });
    }
    // ease into it: the first round (the first two in short sessions) at 70 % and with kicks to the body at most;
    // a head-kick combo there swaps places with a later round of the same kind, otherwise its kicks go to body height
    const isHigh = (r) => r.combo && r.combo.some((x) => HIGHK.has(x)),
      e = Math.min(easy, out.length - 1);
    for (let i = 0; i < e; i++) {
      const r = out[i];
      r.ease = 1;
      if (!isHigh(r)) continue;
      // partner sessions are ordered easy → hard: no swap there, the kicks just go to body height
      const j = partner ? -1 : out.findIndex((x, k) => k >= e && x.k === r.k && x.combo && !isHigh(x));
      if (j >= 0) {
        const o = out[j];
        [r.combo, o.combo] = [o.combo, r.combo];
        [r.mine, o.mine] = [o.mine, r.mine];
      } else r.combo = r.combo.map((x) => LOWER[x] || x);
    }
    // kids: at most 3 techniques (the opener and the finishing technique stay)
    if (ageGroup() === "kids")
      for (const r of out) if (r.combo && !r.mine) while (r.combo.length > 3) r.combo.splice(1, 1);
    // Full Contact with a partner: the 6-kick rule on one partner round (not the opening round)
    if (partner && discOf() === "fc" && n >= 3 && !ka) {
      const pr = out.filter((r) => PARTNER_K.has(r.k) && r.combo).slice(1),
        withK = pr.filter((r) => r.combo.some((x) => KICKS.has(x)));
      const r = (withK.length ? withK : pr)[0];
      if (r) r.six = 1;
    }
    // counter actions as an exception (reactCount), on the final combos; later rounds are preferred because a
    // counter action makes a round harder – the opening round never gets one when there is a choice
    if (partner) {
      const idx = out.map((r, i) => i).filter((i) => PARTNER_K.has(out[i].k) && out[i].combo),
        // the opening round never gets one – the count is capped by the rounds after it (short sessions: fewer)
        pool = idx.length > 1 ? idx.slice(1) : idx,
        want = reactCount(pool.length),
        order = pool.map((i) => ({ i, w: i + Math.random() * pool.length * 0.6 })).sort((a, b) => b.w - a.w);
      lowTurn = Math.random() < 0.5 ? 0 : 1;
      usedAtt.clear();
      order.slice(0, want).forEach(({ i }) => (out[i].react = partnerReact(out[i].combo)));
    }
    return out;
  }
  /* Equipment that is relevant per session type – everything else the user selected is ignored */
  const EQ_FOR = {
    T: ["partner", "bag", "pads", "rope", "weights", "kb", "bb", "bands", "bar"],
    C: ["partner", "bag", "pads", "rope", "weights", "kb", "bb", "bands", "bar"],
    P: ["partner", "bag"],
    S: ["rope", "weights", "kb", "bb", "bands", "bar"],
    K: ["rope", "weights", "kb", "bands", "bar"],
    M: ["bands"],
  };
  /* A Zone 2–3 run replaces interval conditioning outdoors (not with knee/ankle limits) */
  const canRun = (type, loc) => type === "K" && loc === "out" && !kneeAnk();
  /*
   * Hardening (Abhärtung) closes every session except mobility. p = with partner, b = on the bag, s = solo.
   * Always light and progressive; youth athletes get the gentle variants only.
   */
  const HARD = [
    /* Fist (fist: true) – one of these is in every hardening block. strike = hitting something; wr = loads the wrist */
    {
      id: "fGlove",
      h: { de: "{rx} kräftige Geraden mit voller Wucht und fest geschlossener Faust, Treffer mit den ersten beiden Knöcheln, Handgelenk gerade.", en: "{rx} hard straights with full impact and a tight fist, land with the first two knuckles, wrist straight." },
      fist: true,
      m: "b",
      strike: true,
      wr: true,
      de: [
        "Faust fest am Sack (Handschuhe)",
        "{rx} gerade Schläge mit fest geschlossener Faust, Treffer mit den ersten beiden Knöcheln, Handgelenk gerade.",
      ],
      en: [
        "Firm fist on the bag (gloves)",
        "{rx} straight punches with a tight fist, land with the first two knuckles, wrist straight.",
      ],
    },
    {
      id: "fWraps",
      h: { de: "Nur mit Bandagen, ohne Handschuhe: {rx} gerade Schläge mit 50–70 % Kraft. Sofort stoppen, wenn etwas schmerzt.", en: "Wraps only, no gloves: {rx} straight punches at 50–70 % power. Stop at once if anything hurts." },
      fist: true,
      m: "b",
      strike: true,
      wr: true,
      adult: true,
      de: [
        "Bandagen-Schläge am Sack",
        "Nur mit Bandagen, ohne Handschuhe: {rx} gerade Schläge mit 30–50 % Kraft. Sofort stoppen, wenn etwas schmerzt.",
      ],
      en: [
        "Wraps-only bag work",
        "Wraps only, no gloves: {rx} straight punches at 30–50 % power. Stop at once if anything hurts.",
      ],
    },
    {
      id: "fBare",
      h: { de: "Ohne Bandagen und Handschuhe: {rx} Geraden mit höchstens 50 % Kraft, nur auf den Sack. Steigerung über Wochen, nicht über Tage.", en: "No wraps, no gloves: {rx} straights at no more than 50 % power, bag only. Progress over weeks, not days." },
      fist: true,
      m: "b",
      strike: true,
      wr: true,
      adult: true,
      lvl: 1,
      de: [
        "Faust ohne Schutz am Sack",
        "Ohne Bandagen und Handschuhe: {rx} lockere Geraden mit höchstens 30 % Kraft, nur auf den weichen Sack. Steigerung über Wochen, nicht über Tage.",
      ],
      en: [
        "Bare fist on the bag",
        "No wraps, no gloves: {rx} light straights at no more than 30 % power, soft bag only. Progress over weeks, not days.",
      ],
    },
    {
      id: "fPads",
      h: { de: "Partner hält fest dagegen, {rx} harte Geraden mit fester Faust und geradem Handgelenk. Dann tauschen.", en: "Partner holds firm, {rx} hard straights with a tight fist and straight wrist. Then swap." },
      fist: true,
      m: "p",
      strike: true,
      wr: true,
      de: [
        "Faust fest an den Pratzen",
        "Partner hält ruhig, {rx} Geraden mit fester Faust und geradem Handgelenk – Fokus auf saubere Knöchelfläche. Dann tauschen.",
      ],
      en: [
        "Firm fist on the pads",
        "Partner holds steady, {rx} straights with a tight fist and straight wrist – focus on a clean knuckle surface. Then swap.",
      ],
    },
    {
      id: "fPush",
      h: { de: "Auf den ersten beiden Knöcheln auf festem Boden statt Matte. 3× 10–15 Wiederholungen, Handgelenk gerade.", en: "On the first two knuckles on a hard floor instead of a mat. 3× 10–15 reps, wrist straight." },
      fist: true,
      m: "s",
      wr: true,
      de: [
        "Faust-Liegestütze",
        "Auf den ersten beiden Knöcheln, zuerst auf weicher Matte. 3× 5–10 Wiederholungen, Handgelenk gerade.",
      ],
      en: ["Knuckle push-ups", "On the first two knuckles, on a soft mat at first. 3× 5–10 reps, wrist straight."],
    },
    {
      id: "fPlank",
      h: { de: "Liegestütz-Position auf den Fäusten auf festem Boden halten, {rx}, Handgelenke gerade.", en: "Hold the push-up position on your fists on a hard floor, {rx}, wrists straight." },
      fist: true,
      m: "s",
      wr: true,
      de: ["Faust-Stütz", "Liegestütz-Position auf den Fäusten halten, {rx}, Handgelenke gerade."],
      en: ["Fist plank", "Hold the push-up position on your fists, {rx}, wrists straight."],
    },
    {
      id: "fTap",
      h: { de: "Mit der Faust kräftig auf eine feste, dünn gepolsterte Fläche klopfen, {rx}.", en: "Tap a firm, thinly padded surface hard with your fist, {rx}." },
      fist: true,
      m: "s",
      strike: true,
      adult: true,
      de: [
        "Knöchel-Klopfen",
        "Mit der Faust leicht auf eine gepolsterte Fläche klopfen (Matte, gefalteter Teppich), {rx}.",
      ],
      en: ["Knuckle tapping", "Tap a padded surface lightly with your fist (mat, folded rug), {rx}."],
    },
    {
      id: "fWring",
      fist: true,
      m: "s",
      de: [
        "Handtuch auswringen",
        "Ein Handtuch kräftig in beide Richtungen auswringen, {rx} – stärkt Finger, Faustschluss und Handgelenk.",
      ],
      en: ["Towel wring", "Wring a towel hard in both directions, {rx} – strengthens fingers, grip and wrist."],
    },
    {
      id: "fFinger",
      fist: true,
      m: "s",
      de: [
        "Faustschluss-Kraft",
        "Faust {n}× langsam maximal fest schließen und {s} s halten, dann Finger weit spreizen. {r} Durchgänge.",
      ],
      en: [
        "Grip strength",
        "Close your fist as hard as you can {n}× slowly, hold {s} s, then spread your fingers wide. {r} rounds.",
      ],
    },
    {
      id: "abs",
      h: { de: "Partner schlägt mit Handschuhen Geraden und Körperhaken mit mittlerem Druck gegen Bauch und Seiten, du spannst an und atmest scharf aus. {rx}, dann tauschen. Den Druck über Wochen steigern.", en: "Partner throws straights and body hooks with gloves at medium pressure to your stomach and sides while you brace and exhale sharply. {rx}, then swap. Build pressure over weeks." },
      m: "p",
      de: [
        "Bauch-Abhärtung",
        "Partner tippt mit Handschuhen kontrolliert gegen den Bauch, du spannst an und atmest scharf aus. {rx}, Druck nur langsam steigern. Dann tauschen.",
      ],
      en: [
        "Ab conditioning",
        "Partner taps your stomach with gloves while you brace and exhale sharply. {rx}, build pressure slowly. Then swap.",
      ],
    },
    {
      id: "arms",
      h: { de: "Partner schlägt und tritt mittelhart auf deine Deckung, du blockst mit festen Unterarmen. {rx}, dann tauschen.", en: "Partner punches and kicks at medium power into your guard, you block with firm forearms. {rx}, then swap." },
      m: "p",
      lim: "s",
      de: [
        "Unterarm-Blocks",
        "Partner schlägt leicht auf deine Deckung, du blockst mit festen Unterarmen. {rx}, dann tauschen.",
      ],
      en: [
        "Forearm blocks",
        "Partner throws light shots at your guard, you block with firm forearms. {rx}, then swap.",
      ],
    },
    {
      id: "checks",
      h: { de: "Abwechselnd Low Kicks mit mittlerem Druck und Checks Schienbein gegen Schienbein, mit Schienbeinschonern. {rx}.", en: "Take turns throwing low kicks at medium pressure and checking shin to shin, with shin guards. {rx}." },
      m: "p",
      disc: ["kl", "k1"],
      risky: true,
      de: [
        "Schienbein-Checks",
        "Abwechselnd leichte Low Kicks und Checks Schienbein gegen Schienbein, mit Schienbeinschonern. {rx}.",
      ],
      en: ["Shin checks", "Take turns throwing light low kicks and checking shin to shin, with shin guards. {rx}."],
    },
    {
      id: "shinbag",
      h: { de: "Je Seite 30 Roundhouse-Kicks mit dem Schienbein mit kräftiger Wucht – nur so fest, wie es ohne Schmerz geht.", en: "30 roundhouse kicks per side with the shin and real impact – only as hard as you can without pain." },
      m: "b",
      adult: true,
      de: [
        "Schienbein am Sandsack",
        "Je Seite 20 Roundhouse-Kicks mit dem Schienbein, locker beginnen und nur langsam fester werden.",
      ],
      en: ["Shins on the bag", "20 roundhouse kicks per side with the shin, start easy and only slowly kick harder."],
    },
    {
      id: "bodybag",
      h: { de: "Den Sandsack kräftig anschwingen und den angespannten Rumpf dagegen nehmen, vorne und seitlich. {rx}.", en: "Swing the bag hard and take it on your braced core, front and sides. {rx}." },
      m: "b",
      de: [
        "Rumpf an den Sack",
        "Seitlich an den Sandsack lehnen und den Rumpf anspannen, während er zurückschwingt. {rx}.",
      ],
      en: ["Core against the bag", "Brace your side against the swinging bag as it comes back. {rx}."],
    },
    {
      id: "brace",
      h: { de: "Bauch fest anspannen, scharf ausatmen und dabei mit der eigenen Faust kräftig gegen den Bauch drücken. 3× 15 Wiederholungen.", en: "Brace hard, exhale sharply and press your own fist firmly into your stomach. 3× 15 reps." },
      m: "s",
      de: [
        "Spannung & Ausatmen",
        "Bauch fest anspannen und dabei kurz und scharf ausatmen, wie bei einem Treffer. 3× 10 Wiederholungen.",
      ],
      en: ["Brace & exhale", "Tighten your abs and exhale short and sharp, as if taking a hit. 3× 10 reps."],
    },
    {
      id: "shintap",
      h: { de: "Schienbeine mit der Faust kräftig abklopfen, von unten nach oben, {rx}.", en: "Tap your shins firmly with a fist, bottom to top, {rx}." },
      m: "s",
      de: [
        "Schienbeine abklopfen",
        "Mit der Faust oder flachen Hand die Schienbeine leicht abklopfen, {rx}.",
      ],
      en: ["Shin tapping", "Lightly tap your shins with a fist or flat hand, {rx}."],
    },
    {
      id: "neck",
      sk: "str.neck_iso_hold",
      h: { de: "Hand an Stirn, Hinterkopf und beide Kopfseiten legen, je Richtung {s} s gegeneinander drücken – kontrolliert und gleichmäßig, der Kopf bleibt in Position.", en: "Hand on forehead, back of head and each side of the head, press head and hand against each other for {s} s per direction – controlled and steady, the head stays in place." },
      m: "s",
      de: ["Isometrische Nackenkräftigung – Halteübung", "Hand an Stirn, Hinterkopf und beide Kopfseiten legen, je Richtung {s} s gegeneinander drücken – der Kopf bleibt in Position."],
      en: ["Isometric neck strengthening – hold", "Hand on forehead, back of head and each side of the head, press head and hand against each other for {s} s per direction – the head stays in place."],
    },
    /* taekwondo only (hardening of hand edge, fingertips and foot, docs/taekwondo-concept.md T10): gentle, never until it hurts */
    {
      id: "tkEdge",
      tkdOnly: true,
      m: "s",
      strike: true,
      adult: true,
      de: ["Handkante klopfen", "Mit der Handkante locker auf eine dick gepolsterte Fläche klopfen (Matte, gefaltetes Handtuch), von weich zu etwas fester – nie bis es schmerzt, {rx}."],
      en: ["Hand-edge tapping", "Tap a thickly padded surface (mat, folded towel) with the edge of your hand, from soft to a little firmer – never until it hurts, {rx}."],
    },
    {
      id: "tkTips",
      tkdOnly: true,
      m: "s",
      de: ["Fingerspitzen-Druck", "Die Fingerspitzen beider Hände gegeneinander pressen, kurz halten, locker lassen, {rx}."],
      en: ["Fingertip press", "Press the fingertips of both hands against each other, hold briefly, let go, {rx}."],
    },
    {
      id: "tkFoot",
      tkdOnly: true,
      m: "s",
      de: ["Fußballen und Spann abklopfen", "Fußballen, Spann und Außenkante des Fußes mit der Faust oder flachen Hand leicht abklopfen, {rx}."],
      en: ["Foot ball and instep tapping", "Lightly tap the ball, instep and outer edge of the foot with a fist or flat hand, {rx}."],
    },
    {
      id: "tkBall",
      tkdOnly: true,
      m: "b",
      strike: true,
      adult: true,
      de: ["Fußballen am Sack", "Mit dem Fußballen locker und kontrolliert gegen den Sack treten (Frontkick), nicht durchziehen, {rx}."],
      en: ["Foot ball on the bag", "Kick the bag lightly and with control with the ball of the foot (front kick), do not follow through, {rx}."],
    },
    /* boxing only (block "Handgelenk & Griff", docs/boxing-concept.md §3.4) */
    {
      id: "wristCurl",
      boxOnly: true,
      m: "s",
      wr: true,
      de: ["Handgelenk beugen und strecken", "Mit leichter Kurzhantel oder Band: Unterarm aufliegend, Handgelenk langsam beugen und strecken, 2× 15 Wiederholungen je Hand."],
      en: ["Wrist curls and extensions", "With a light dumbbell or band: forearm supported, slowly bend and extend the wrist, 2× 15 reps per hand."],
    },
    {
      id: "fingerExt",
      boxOnly: true,
      m: "s",
      de: ["Fingerstrecken gegen Gummiband", "Gummiband um die Finger legen und die Finger gegen den Widerstand weit spreizen und langsam schließen, 2× 20 Wiederholungen."],
      en: ["Finger extensions against a band", "Put a rubber band around your fingers, spread them wide against the resistance and close slowly, 2× 20 reps."],
    },
  ];
  /* name and text of a hardening item; the harder full-contact dose when the item carries h */
  function hardTxt(id, h) {
    const hd = HARD.find((x) => x.id === id) || HARD[0],
      lg = S.profile.lang;
    const text = h && hd.h ? hd.h[lg] : hd[lg][1],
      rx = rxOf(id, h);
    // numbers of the text come from the prescription the timer runs (core/prescription.js)
    return [hd[lg][0], rx ? rxFill(text, rx, lg) : text];
  }
  /* Taekwondo: one hand area (fist, hand edge, fingers) and one leg area (shin, foot), alternating from session to session;
     children and youth only the gentle solo items, taper/recovery weeks without impact (docs/taekwondo-concept.md T10, T12, T13) */
  /* WT is fought in full contact with electronic scoring (PSS counts only hits with enough impact, docs/taekwondo-concept.md
     2.1): adults and youth from 16, from level 1, never in taper/recovery/deload weeks (soft) get impact rounds, trunk
     hardening and the harder hardening dose – like full contact in kickboxing (7e). Children and free sparring stay as they are. */
  const wtFull = (soft) => {
    const age = ageAt(today());
    return isTkd() && tkdUnitStyle() === "wt" && !soft && (techniqueLevel() || 0) >= 1 && age != null && age >= 16;
  };
  function tkdHardBlock(eq, loc, soft) {
    const p = S.profile,
      yg = young(),
      kid = ageGroup() === "kids",
      modes = ["s"];
    if (!soft && !kid) {
      if (eq.includes("partner")) modes.unshift("p");
      else if (eq.includes("bag") && loc !== "out") modes.unshift("b");
    }
    const ok = (x) => modes.includes(x.m) && !(x.adult && yg) && !(soft && x.strike) && !(x.wr && p.limits.includes("wrist")) && (!x.lvl || techniqueLevel() >= x.lvl);
    const byId = (ids) => HARD.filter((x) => ids.includes(x.id) && ok(x));
    const hand = [byId(["fTap"]), byId(["tkEdge"]), byId(["tkTips", "fFinger", "fWring"])].filter((g) => g.length),
      leg = [byId(["shintap", "shinbag"]), byId(["tkFoot", "tkBall"])].filter((g) => g.length);
    // the areas alternate: a random area first, the group with the equipment at hand (m != "s") preferred inside it
    const pick = (groups) => {
      const g = rnd(groups) || [],
        eqPref = g.filter((x) => x.m !== "s");
      return rnd(eqPref.length ? eqPref : g);
    };
    let a = pick(hand);
    const b = pick(leg),
      full = wtFull(soft);
    // WT full contact: every second session the trunk instead of the hand area – at the bag the core against the bag,
    // otherwise brace & exhale (the partner ab drill speaks of gloves and body hooks, which WT does not have)
    if (full && !p.limits.length && Math.random() < 0.5) a = HARD.find((x) => x.id === (eq.includes("bag") && loc !== "out" ? "bodybag" : "brace"));
    return { key: "hard", min: 6, items: [a, b].filter(Boolean).map((x) => (full && x.h ? { kind: "hard", id: x.id, h: 1 } : { kind: "hard", id: x.id })) };
  }
  /* Boxing: no hardening with hits, a fixed 6-minute block for wrists and grip instead (docs/boxing-concept.md §3.4).
     Towel and grip every time; the rest by age, level, limits and equipment; taper/recovery weeks: only the gentle ones. */
  function wristBlock(eq, soft, blocks = [], loc = "gym") {
    const p = S.profile,
      kid = ageGroup() === "kids",
      yg = young(),
      lim = p.limits.includes("wrist"),
      base = ["fWring", "fFinger"],
      more = [];
    if (!soft && !kid) {
      if (!lim) more.push("fPlank");
      if (!lim && techniqueLevel() >= 1 && !yg) more.push("fPush");
      if (!lim && eq.some((q) => ["weights", "kb", "bands"].includes(q))) more.push("wristCurl");
      if (eq.includes("bands")) more.push("fingerExt");
    }
    // the neck hold is dropped when the session already has it (strength block)
    if (!kid && !blocks.some((b) => b.items.some((it) => it.id === "str.neck_iso_hold"))) more.push("neck");
    // toughness (7b B7): from level 1, from 16 years, without limits and not in taper/recovery weeks the second half is body
    // conditioning – with a partner the ab conditioning, at the bag the core against the bag, otherwise brace & exhale
    const age = ageAt(today());
    if (!soft && !kid && techniqueLevel() >= 1 && age != null && age >= 16 && !p.limits.length) {
      const body = eq.includes("partner") ? "abs" : eq.includes("bag") && loc !== "out" ? "bodybag" : "brace";
      return { key: "wrist", lbl: "tough", min: 6, items: [...base, body].map((id) => ({ kind: "hard", id })) };
    }
    const pick = shuffle(more).slice(0, kid ? 0 : 1);
    return { key: "wrist", min: 6, items: [...base, ...pick].map((id) => ({ kind: "hard", id })) };
  }
  function hardBlock(eq, loc, soft, blocks = []) {
    if (isBox()) return wristBlock(eq, soft, blocks, loc);
    if (isTkd()) return tkdHardBlock(eq, loc, soft);
    const p = S.profile,
      // harder only for full-contact adults and never in taper/recovery weeks (soft)
      full = (discOf() === "fc" || discOf() === "k1") && !young() && !soft,
      ka = kneeAnk(),
      modes = ["s"];
    // taper and recovery weeks: solo work without impact only
    if (!soft && eq.includes("partner")) modes.unshift("p");
    else if (!soft && eq.includes("bag") && loc !== "out") modes.unshift("b");
    const ok = HARD.filter(
      (x) =>
        modes.includes(x.m) &&
        (!x.disc || x.disc.includes(discOf())) &&
        !x.boxOnly &&
        !x.tkdOnly &&
        !(x.risky && ka) &&
        !(x.lim && p.limits.includes("shoulder")) &&
        !(x.adult && young()) &&
        !(soft && x.strike),
    );
    // the fist is always covered (with the equipment at hand first), plus one other body area
    const fists = ok.filter((x) => x.fist && (!x.lvl || techniqueLevel() >= x.lvl) && !(x.wr && p.limits.includes("wrist"))),
      fistPick = shuffle(fists.filter((x) => x.m !== "s"))[0] || shuffle(fists)[0];
    const others = ok.filter((x) => !x.fist),
      // full contact (FC, K1): the area the discipline takes the hits on comes first – body in FC, shins in K1
      focusArea = full ? (discOf() === "k1" ? ["checks", "shinbag", "shintap"] : ["abs", "bodybag", "brace"]) : [],
      pref = others.filter((x) => focusArea.includes(x.id)),
      other =
        shuffle(pref.filter((x) => x.m !== "s"))[0] ||
        shuffle(others.filter((x) => x.m !== "s"))[0] ||
        shuffle(pref)[0] ||
        shuffle(others)[0];
    // same length, harder: full-contact adults get the harder dose (h) where an exercise has one
    return {
      key: "hard",
      min: 6,
      items: [fistPick, other].filter(Boolean).map((x) => (full && x.h ? { kind: "hard", id: x.id, h: 1 } : { kind: "hard", id: x.id })),
    };
  }
  /* Sport of the main setting and the choice offered per unit (only finished sports are visible) */
  const mainSport = () => S.profile.sport || "kickboxing";
  /* preview = also the sports in development (labelled); the main sport in the profile never offers them */
  const sportChoices = (preview = false) => [...visibleSports(), ...(preview ? previewSports() : [])].map((x) => x.id);
  /* the preview is marked inside the session (note with rules link), not in the label of the choice */
  const sportLabel = (k) => t("sportNames")[k] || k;
  function sportRow(attr, cur) {
    return `<div class="field"><span class="lab">${t("sportL")}</span><div class="seg">${sportChoices(true)
      .map((k) => `<button type="button" ${attr}="${k}" aria-pressed="${(cur || mainSport()) === k}">${sportLabel(k)}</button>`)
      .join("")}</div></div>`;
  }
  /* A built session carries its sport (default: main sport) and a stable id that links it to its log entry */
  function buildSession(dateStr, type, loc, eqIn, opts = {}) {
    buildSport = opts.sport || mainSport();
    buildDisc = buildSport === "kickboxing" ? opts.disc || null : null;
    unitStyle = buildSport === "taekwondo" ? opts.tstyle || null : null;
    let s;
    try {
      s = buildSessionCore(dateStr, type, loc, eqIn, opts);
      s.techniqueLevel = techniqueLevel();
      s.fitnessLevel = fitnessLevel();
      s.blocks.forEach(b => { b.fitnessLevel = s.fitnessLevel; });
    } finally {
      buildSport = null;
      buildDisc = null;
      unitStyle = null;
    }
    s.sport = opts.sport || mainSport();
    // boxing opening rounds name no kicks (7b B3): every easy round of a boxing unit gets the boxing text
    if (s.sport === "boxing") s.blocks.forEach((b) => b.rounds && b.items.forEach((it) => it.ease && (it.box = 1)));
    // a unit of another style/discipline than the profile keeps it (taekwondo: WT or ITF-D, kickboxing: discipline)
    if (s.sport === "taekwondo") s.tstyle = opts.tstyle || tkdStyle();
    if (s.sport === "kickboxing" && opts.disc && opts.disc !== S.profile.disc) s.disc = opts.disc;
    unitStyle = null;
    s.id = s.id || "s" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
    return s;
  }
  function buildSessionCore(dateStr, type, loc, eqIn, opts = {}) {
    loadCache = {};
    // the fitness gym only exists for strength and conditioning; it brings its standard equipment along
    if (loc === "studio" && type !== "S" && type !== "K") loc = "gym";
    const studio = loc === "studio",
      run = !!opts.run && canRun(type, loc);
    let eq = studio ? ["weights", "kb", "bb", "bar", "studio"] : eqIn.filter((x) => EQ_FOR[type].includes(x));
    // equipment that was brought along gets used first (in the gym: the machines)
    const machines = studio
      ? (e) => (e.eq.includes("studio") ? 2 : e.eq ? 1 : 0)
      : (e) => (e.eq && e.eq.split("|").some((q) => eq.includes(q)) ? 1 : 0);
    // after a KO: no sparring and no partner contact – solo work only
    const ko = koLock(dateStr),
      ramp = rampOn(dateStr);
    if (ko && type === "P") type = "T";
    if (ko) eq = eq.filter((x) => x !== "partner" && x !== "pads");
    const p = S.profile,
      D = Math.min(opts.min || sessMin(type), type === "M" ? 45 : 240),
      used = new Set(),
      blocks = [],
      notes = [];
    const load = weekLoad(dateStr),
      ph = phaseInfo(dateStr),
      prep = isPrep(ph),
      soft = ph.phase === "taper" || ph.phase === "recover" || ko,
      taper = ph.phase === "taper",
      masters = ageGroup() === "masters",
      fasting = ramadanOn(dateStr),
      mood = weekMood(dateStr),
      form = formOn(dateStr),
      work = S.profile.work || "";
    // round length and break: the tournament bout format during preparation, otherwise training defaults
    const box = isBox(),
      bf = box ? boxStandard(ageAt(parse(dateStr))) : null,
      fmtR = prep ? ph.format : null,
      kAge = kidAge(),
      fightW = fmtR ? fmtR.w : box ? bf.w : kAge != null ? (kAge <= 9 ? 60 : 90) : 180,
      condW = fmtR ? fmtR.w : kAge != null ? (kAge <= 9 ? 45 : 60) : 120,
      restB = fmtR ? fmtR.b : 60;
    const roundsFor = (min, len = 3) => {
      let n = Math.max(2, Math.floor(min / len));
      if (masters) n = Math.max(2, n - 1);
      if (taper) n = Math.max(2, Math.round(n * 0.5));
      if (ph.phase === "recover") n = Math.max(2, Math.round(n * 0.6));
      if (load.deload) n = Math.max(2, Math.round(n * 0.7));
      if (ramp) n = Math.max(2, Math.round(n * ramp.f));
      if (prep && fitnessLevel() === 0) n = Math.max(2, Math.round(n * 0.8));
      if (fasting) n = Math.max(2, Math.round(n * 0.8));
      if (mood === "hard") n = Math.max(2, Math.round(n * 0.8));
      if (mood === "easy") n += 1;
      if (form < 2) n = Math.max(2, Math.round(n * (form === 0 ? 0.7 : 0.85)));
      return n;
    };
    const rpe = rpeRange(type, dateStr);
    buildLight = type === "M" ? [] : lightRegions({ log: S.log, date: dateStr });
    if (buildLight.length) notes.push(t("lightNote")(buildLight, lightInfo(dateStr).club));
    if (fasting) notes.push(t("fast").note);
    {
      const N = t("life").notes;
      if (type !== "M") {
        if (mood === "hard") notes.push(N.hard);
        if (mood === "easy") notes.push(N.easy);
        if (form < 2) notes.push(form === 0 ? N.formLow : N.formMid);
      }
      if (lowTime()) notes.push(N.low);
      if (work === "sit" && type !== "M") notes.push(N.sit);
      if (work === "phys" && (type === "S" || type === "K")) notes.push(N.phys);
    }
    // focus block: adapts round lengths, exercise choice and sets; tournament phases switch it off (see blockInfo)
    const bi = blockInfo(dateStr),
      bk = bi && bi.k,
      blk = bi ? { k: bi.k, wk: bi.wk } : null,
      byName = (list, base) => (e) => (list.includes(e.key) ? 3 : 0) + (base ? base(e) : 0);
    if (bi) notes.push(t("blk").note[bi.k][bi.st]);
    if (type === "M") {
      // sport focus (7b): WT active flexibility in the full range of motion, boxing loose footwork/shadow, ITF loose hand-foot links
      const wtM = isTkd() && tkdUnitStyle() === "wt",
        itfM = isTkd() && !wtM,
        warm = 8,
        cool = wtM ? 3 : itfM ? 5 : 7,
        extra = box ? Math.round(((D - warm - cool) * 8) / 30) : itfM ? Math.round(((D - warm - cool) * 4) / 32) : 0,
        flow = D - warm - cool - extra;
      blocks.push({
        key: "warm",
        min: warm,
        items: pickEx(
          "warm",
          2,
          loc,
          eq.filter((x) => x !== "rope"),
          used,
          machines, // equipment that was brought along (resistance bands) is used first
        ),
      });
      blocks.push({
        key: "mob",
        min: flow,
        items: pickEx(
          "mob",
          Math.max(5, Math.round(flow / 4)),
          loc,
          eq,
          used,
          wtM ? byName(ACTIVE_MOB, machines) : bk === "mob" ? byName(BLK_MOB[bi.st], machines) : machines,
        ),
        sets: t("holdNote"),
        ...(wtM ? { lbl: "amob" } : {}),
      });
      if (extra >= 3) {
        // easy shadow rounds: boxing footwork and shadow (3 × 2:00 / 0:30), ITF loose hand-foot links (2 × 1:30 / 0:30)
        const w = box ? 120 : 90,
          b = 30,
          n = Math.max(2, Math.floor((extra * 60) / (w + b)));
        blocks.push({ key: "main", lbl: box ? "foot" : "hf", min: extra, rounds: true, w, b, items: fightRounds("T", n, loc, [], null, n).map((r) => ({ ...r, ease: 1 })) });
      }
      const breath = EX["cool.breathing"];
      blocks.push({
        key: "cool",
        min: cool,
        items: pickEx("cool", 2, loc, eq, used).concat(used.has(breath.id) ? [] : [{ kind: "ex", id: breath.id }]),
      });
      return progressSession({
        date: dateStr,
        type,
        loc,
        eq,
        blocks,
        notes,
        rpe: rpe.txt,
        tHi: rpe.hi,
        min: D,
        blk,
        created: Date.now(),
      });
    }
    if (run) {
      // Simple run by feel: easy zone 2; outside the foundation phase with a short zone-3 block in the middle
      const warm = 8,
        cool = 7,
        main = D - warm - cool - 6,
        iv = fitnessLevel() > 0 && !load.deload && !soft && ph.phase !== "base" && main >= 30;
      const reps = iv ? (fitnessLevel() === 2 ? 4 : 3) : 0,
        ivMin = reps * 5,
        z2a = iv ? Math.round((main - ivMin) / 2) : main;
      const items = [{ kind: "run", zone: 2, min: z2a }];
      if (iv)
        items.push({ kind: "run", zone: 3, reps, on: 3, off: 2 }, { kind: "run", zone: 2, min: main - ivMin - z2a });
      blocks.push({
        key: "warm",
        min: warm,
        items: pickEx("warm", 2, loc, [], used),
      });
      blocks.push({ key: "run", min: main, items });
      if (ageGroup() !== "kids") blocks.push(hardBlock([], loc, soft));
      blocks.push({
        key: "cool",
        min: cool,
        items: pickEx("cool", 2, loc, [], used),
      });
      // a run by feel is easy: zone 2 ≈ RPE 3–4, with zone-3 blocks up to 6
      return progressSession({
        date: dateStr,
        type,
        loc,
        eq,
        run: true,
        blk,
        blocks,
        notes,
        rpe: iv ? "4–6" : "3–4",
        tHi: iv ? 6 : 4,
        min: D,
        created: Date.now(),
      });
    }
    const warmMin = Math.max(8, Math.round(D * 0.15)),
      coolMin = Math.max(5, Math.round(D * 0.1)) + (bk === "mob" ? 5 : 0),
      // 30-minute sessions skip the hardening block, so the main part keeps enough time
      hardMin = D <= 30 || (ageGroup() === "kids" && !box) ? 0 : 6,
      rest = D - warmMin - coolMin - hardMin;
    // power exercises; with knee/ankle limits the jumps drop out and strength work fills in
    const powPick = (n) => {
      const a = pickEx("pow", n, loc, eq, used);
      return a.length >= n ? a : a.concat(pickEx("str", n - a.length, loc, eq, used));
    };
    blocks.push({
      key: "warm",
      min: warmMin,
      items: [
        ...pickEx(
          "warm",
          1,
          loc,
          eq.filter((x) => x === "rope"),
          used,
        ),
        ...pickEx("warm", 2, loc, eq, used),
      ],
    });
    // before kicking sessions: a short pre-stretch after the pulse raiser, followed by dynamic work (short holds don't cost power)
    if (["T", "C", "P"].includes(type)) {
      const wb = blocks[blocks.length - 1],
        pre = EX["pre.short_pre_stretch"];
      wb.items.splice(wb.items.length - 1, 0, { kind: "ex", id: pre.id });
    }
    // strength is maintained, not built, before a tournament: fewer, explosive reps
    const sets = taper
      ? "2× 3 " + t("explosive")
      : prep
        ? "3× 3–5 " + t("explosive")
        : load.deload || ph.phase === "recover"
          ? "2× 8–10"
          : ageGroup() === "kids"
            ? "2× 8–10"
            : young()
              ? "3× 10–12"
              : fitnessLevel() === 2
                ? "4× 5–8"
                : "3× 8–12";
    const supSets = load.deload || work === "phys" ? "2×" : "3×";
    let theme = null;
    if (type === "S") {
      // boxing: a longer strength-endurance finisher (≈ 24 / 15 min of 39, 7b B7)
      const main = Math.round(rest * (box ? 24 / 39 : 0.7)),
        fin = rest - main,
        light = fitnessLevel() === 0 || young(),
        B = t("blk").sets;
      if (bk === "pow" && bi.st > 0 && !load.deload) {
        // explosive transfer / contrast: power work first, while fresh
        const pm = Math.round(main * 0.4);
        blocks.push({
          key: "pow",
          min: pm,
          items: powPick(3),
          sets: bi.st === 1 ? (light ? "3× 5 " : "4× 5 ") + B.expl : B.contrast,
        });
        blocks.push({
          key: "str",
          min: main - pm,
          items: strengthBasics(fitnessLevel() === 0 ? 3 : 4, loc, eq, used, machines),
          sets: light ? "3× 8–10" : "3× 4–6 · " + B.heavy,
        });
      } else {
        const nStr = (taper ? 3 : fitnessLevel() === 0 ? 4 : 5) - (work === "phys" ? 1 : 0),
          // explosive sets (taper / tournament preparation) without weights: only exercises that are explosive by nature,
          // so "3–5 explosive reps" is never asked of a plank or a slow push-up (docs/data-load-concept.md A10)
          explNoWeights = (taper || prep) && !(bk === "pow" && !load.deload) && !/weights|kb|bb/.test(eq.join(",")) && loc !== "studio";
        blocks.push({
          key: "str",
          min: main,
          items: explNoWeights ? powPick(Math.min(nStr, 4)) : strengthBasics(nStr, loc, eq, used, machines),
          sets: bk === "pow" && !load.deload ? (light ? "3× 8–10 · " + B.clean : "4× 4–6 · " + B.heavy) : sets,
        });
      }
      const n = Math.max(2, Math.floor(fin / 3)),
        cpref = bk === "pow" && bi.st === 2 ? byName(["cond.speed_rounds"]) : bk === "end" ? byName(BLK_END) : null;
      blocks.push({
        key: "cond",
        min: fin,
        rounds: true,
        items: pickEx("cond", n, loc, eq, used, cpref).map((x) => ({
          kind: "round",
          k: "ex",
          id: x.id,
        })),
      });
    } else if (type === "K") {
      // boxing: conditioning in 3-minute rounds with 1 minute rest and a larger share (≈ 33 of 39 min, 7b B7)
      const br = bk === "end" ? blockRounds(bi, dateStr) : null,
        boxK = box && !br && kAge == null && !fmtR,
        w = br ? br.w : boxK ? 180 : condW,
        bb = br ? br.b : restB,
        len = (w + bb) / 60,
        kShare = boxK ? 33 / 39 : 0.75;
      let n = roundsFor(Math.round(rest * kShare), len);
      // fixed fight-pace rounds come last; in the overload week only a short lead-in before them
      if (br && br.n)
        n = Math.min(Math.max(n, br.n), bi.wk === 6 ? br.n + 2 : 99, Math.max(2, Math.floor((rest - 5) / len)));
      const main = br && br.n ? Math.round(n * len) : Math.round(rest * kShare),
        core = rest - main,
        coreMax = Math.round(rest * 0.3);
      blocks.push({
        key: "cond",
        min: main,
        rounds: true,
        w,
        b: bb,
        items: pickEx("cond", n, loc, eq, used, br ? byName(BLK_END, machines) : machines).map((x) => ({
          kind: "round",
          k: "ex",
          id: x.id,
          pace: !!fmtR || !!(br && br.pace),
        })),
      });
      const cb = blocks[blocks.length - 1];
      if (br && br.cue) cb.items.forEach((it, i) => (!br.n || i >= cb.items.length - br.n) && (it.cue = br.cue));
      // a lot of time left after the fixed rounds: strength endurance before the core work
      if (core > coreMax + 5) {
        blocks.push({
          key: "str",
          min: core - coreMax,
          items: pickEx("str", 3, loc, eq, used),
          sets: supSets,
        });
        blocks.push({
          key: "core",
          min: coreMax,
          items: pickEx("str", 3, loc, eq, used),
          sets: supSets,
        });
      } else
        blocks.push({
          key: "core",
          min: core,
          items: pickEx("str", 3, loc, eq, used),
          sets: supSets,
        });
    } else {
      theme = chooseTheme();
      // grading prep: part of the session drills the belt programme
      const exMin0 = ph.phase === "grade" && targetStage() ? Math.max(10, Math.min(20, Math.round(rest * 0.25))) : 0,
        exItems = exMin0 ? examPick(Math.max(3, Math.round(exMin0 / 3)), loc, eq) : [],
        exMin = exItems.length ? exMin0 : 0;
      const share = { T: 0.65, C: 0.45, P: 0.7 }[type],
        br = bk === "end" && type === "C" ? blockRounds(bi, dateStr) : null,
        fw = br ? br.w : fightW,
        rb = br ? br.b : restB;
      let main = Math.round((rest - exMin) * share),
        nR = roundsFor(main, (fw + rb) / 60);
      // fixed fight-pace rounds at the end of the round block, technique rounds before them
      if (br && br.n) {
        nR = Math.min(
          Math.max(nR, br.n),
          bi.wk === 6 ? br.n + 2 : 99,
          Math.max(2, Math.floor(((rest - exMin - 5) * 60) / (fw + rb))),
        );
        main = Math.round((nR * (fw + rb)) / 60);
      }
      const sup = rest - exMin - main;
      if (type === "P" && eq.includes("partner")) {
        notes.push(t("gearNote"));
        // what "complete protective gear" means in this sport (7e; boxing keeps its own note below)
        if (!box) notes.push(t(isTkd() ? (tkdUnitStyle() === "itf" ? "gearItf" : "gearWt") : "gearKb"));
        if (isTkd() && tkdUnitStyle() === "wt") notes.push(t("wtSparNote"));
      }
      // partner rounds in technique units: mouthguard, firm pads, guards when there is contact (7e)
      if ((type === "T" || type === "C") && eq.includes("partner") && kAge == null) notes.push(t("gearPartner"));
      let items;
      if (type === "P" && ph.phase === "peak" && fmtR) {
        // fight simulation: two full bouts in the exact format, like two bouts on tournament day
        items = [];
        // beginners simulate one bout, as shadow or bag sparring
        for (let k = 1; k <= (fitnessLevel() === 0 ? 1 : 2); k++)
          for (let r = 1; r <= fmtR.r; r++)
            items.push({
              kind: "round",
              k: "sim",
              fight: k,
              r,
              beg: techniqueLevel() === 0,
            });
      } else if (type === "P") items = sparRounds(nR, loc, eq, soft || ph.phase === "grade");
      else {
        // short sessions have a short warm-up: two easy opening rounds instead of one
        items = fightRounds(type, nR, loc, eq, theme, D <= 45 ? 2 : 1);
        // WT full contact: every second bag or pad round with impact (7e)
        if (wtFull(soft)) {
          let k = 0;
          items.forEach((it) => {
            if (!it.ease && ["bag", "partner", "pads"].includes(it.k) && k++ % 2 === 0) it.pow = 1;
          });
        }
        // fight-pace intervals: every round in technique & conditioning, every second round in technique
        if (fmtR && !taper) items.forEach((it, i) => (it.pace = !it.ease && (type === "C" || i % 2 === 1)));
        if (br)
          items.forEach((it, i) => {
            if (br.pace && !it.ease) it.pace = true;
            if (br.cue && !it.ease && (!br.n || i >= items.length - br.n)) it.cue = br.cue;
          });
        // bursts stage: every second technique round in 15/15 intervals
        if (bk === "end" && bi.st === 2 && type === "T") items.forEach((it, i) => (it.pace = !it.ease && i % 2 === 1));
      }
      blocks.push({
        key: "main",
        min: main,
        rounds: true,
        w: fw,
        b: rb,
        items,
      });
      if (exItems.length) {
        blocks.push({ key: "exam", min: exMin, items: exItems });
        const pr = examProgress(targetStage());
        notes.push(t("examNote")(beltName(stageBelt(targetStage())), pr.ok, pr.n));
      }
      const supItems =
        type === "C"
          ? pickEx("cond", 4, loc, eq, used, bk === "end" ? byName(BLK_END) : null)
          : bk === "pow" && bi.st > 0
            ? [...powPick(1), ...pickEx("cond", 1, loc, eq, used), ...pickEx("str", 2, loc, eq, used)]
            : [...pickEx("cond", 2, loc, eq, used), ...pickEx("str", 2, loc, eq, used)];
      // WT technique: strength 8 + active flexibility 6 instead of strength 14 (docs/taekwondo-concept.md 6.2, 7b B6)
      const amob = isTkd() && tkdUnitStyle() === "wt" && type === "T" && sup >= 10 ? Math.round((sup * 6) / 14) : 0;
      blocks.push({
        key: type === "C" ? "cond" : "str",
        min: sup - amob,
        items: amob ? supItems.slice(0, 3) : supItems,
        sets: supSets,
      });
      if (amob) blocks.push({ key: "mob", lbl: "amob", min: amob, items: pickEx("mob", 2, loc, eq, used, byName(ACTIVE_MOB)), sets: t("holdNote") });
    }
    if (hardMin) blocks.push(hardBlock(eq, loc, soft, blocks));
    blocks.push({
      key: "cool",
      min: coolMin,
      items:
        bk === "mob"
          ? [
              ...pickEx("mob", 2, loc, eq, used, byName(BLK_MOB[bi.st])),
              ...pickEx("cool", 2, loc, eq, used, byName(["cool.adductors_and_splits", "cool.hip_flexor_stretch"])),
            ]
          : pickEx("cool", 3, loc, eq, used),
    });
    if (work === "sit" && type !== "M") {
      const cb = blocks[blocks.length - 1];
      cb.items.push(
        ...pickEx("mob", 1, loc, eq, used, (e) =>
          ["mob.open_book_rotation", "mob.90_90_hip_switches", "mob.worlds_greatest_stretch"].includes(e.key) ? 3 : 0,
        ),
      );
      cb.min += 2;
    }
    if (ph.phase !== "base" && type !== "M") {
      notes.unshift(prepText(ph, type));
      if (prep && !S.profile.birthYear && !box) notes.push(t("needBirth"));
      else if (prep && !ph.official) notes.push(t("noFormat"));
      const les = lastLesson();
      if (prep && les) notes.push(t("lastLesson")(les));
    }
    if (ramp) notes.unshift(t("rampNote")(ramp.left));
    if (ko) notes.unshift(t(box ? "koNoteBox" : isTkd() ? "koNoteTkd" : "koNote"));
    if (box) {
      if (!prep && bf.official === false && bf.cls === "m") notes.push(t("boxMasters"));
      if (type === "P" && eq.includes("partner")) notes.push(t("boxGear"));
    }
    if (load.deload) notes.push(t("deloadNote"));
    if (p.limits.includes("wrist") && theme) notes.push(t("wrNote"));
    if (kneeAnk()) notes.push(t("knNote"));
    if (kneeAnk() && EXTRA[discOf()] && theme) notes.push(t("noLowNote")(discOf()));
    return progressSession({
      date: dateStr,
      type,
      loc,
      eq,
      blocks,
      notes,
      rpe: rpe.txt,
      tHi: rpe.hi,
      theme: theme ? theme.id : null,
      min: D,
      blk,
      created: Date.now(),
    });
  }

