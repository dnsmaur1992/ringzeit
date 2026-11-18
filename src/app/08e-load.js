  /* ============ Automatische Lastverteilung (Betreiber 18.11.2026, E41–E58) ============
     Next to the classic week (few, hard units) a week after the model of Russian wrestling: many units, most of them
     moderate. Switched on only by the person: from 5 training days a week (Ringzeit and club days together, a day with
     both counts once) Ringzeit asks once – at the first start, in operation when the days newly cross the threshold, and
     once after the update for existing profiles (E41, E49, E55). Never for children and youth.
     With the switch on (E56/E57):
     - at most 3 hard days a week (E43); a hard day only counts once it took place: an entry (own or club) with effort ≥ 7
       (E44, E51);
     - the person marks the hard weekdays (E47); a hard club entry that would make it more than 3 turns the next marked,
       not yet begun day into a moderate one (E48);
     - a marked hard day that passed without an entry: the next not begun Ringzeit unit of the same week becomes hard –
       never right after a hard day, never more than 3 (E52); each missed day is made up at most once (ledger below);
     - a missed moderate unit: the next technique unit of the week gets one technique round more, the duration stays –
       the minutes come from the closing block (E53);
     - the other units alternate moderate (target up to 6) and easy (up to 4); mobility stays at 3 (E50); durations and
       the kind of day stay (E45, E46); only the same week counts (E54).
     - only what was really trained steers it (Betreiber 18.11.2026, Teil 36): the last 3 days before a unit decide how
       hard it may be – a hard entry yesterday or two in the last 3 days: easy at most; one the day before yesterday:
       moderate at most; 3 days or more: hard allowed. The role belongs to the date, so a moved unit is judged anew;
     - today's form (optional, only when given): bad form on a hard day swaps it – today easy, the hard day goes to the
       next open unit of the week that may be hard (same number of hard days, nothing made up twice);
     - the intense unit types (strength, sparring, conditioning) sit on the marked hard days, technique on the others.
     Switched off, everything new is gone and Ringzeit plans as before. Protective rules, the day after, deload weeks, the
     weekly load brake and the tournament phases apply in both. */
  const LOAD_MIN_DAYS = 5,
    LOAD_HARD_MAX = 3;
  const loadDays = (p = S.profile) => new Set([...(p.days || []), ...((p.club || {}).days || [])]).size;
  const loadAllowed = (p = S.profile) => !young(p);
  const loadOn = (p = S.profile) => !!p.autoLoad && loadAllowed(p);
  /* the dialog is due: enough days, not asked for this crossing, an adult */
  const loadAskDue = (p = S.profile) => loadAllowed(p) && !p.example && loadDays(p) >= LOAD_MIN_DAYS && !p.loadAsked;
  const hardEntry = (ds) => logOn(ds).some((e) => +e.rpe >= 7);
  const ownUnit = (ds) => {
    const ty = planOn(ds);
    return ty && ty !== "M" ? ty : null;
  };
  /* ---- make-up ledger (18.11.2026, report "Nachholbedarf nur einmal erfüllen") ----
     A missed day may trigger at most ONE replacement. The replacement is written down once, in S.profile.ldClaims
     { [missed date]: { to: replacement date | null, k: "hard" | "x" } }, and from then on only read: opening, recomputing
     or restarting never creates a second claim. A replacement that is done (or missed itself) has used up the claim; a
     missed replacement day never triggers a further one (no chain). A claim without a free slot is stored with to: null
     and is settled as well. Claims older than 5 weeks are dropped.
     The week is evaluated anew from the facts each time (Prüfauftrag 18.11.2026, Punkt 1): actual hard days (entries with
     effort ≥ 7) and begun units planned hard are fixed; a not begun hard replacement that would make it more than 3 is
     stepped down first, then the marked days (E48). Stepping down never touches the ledger – the claim stays used, so a
     changed or deleted entry can make the replacement hard again, but nothing is handed on and nothing is made up twice. */
  const ldClaims = () => (S.profile.ldClaims = S.profile.ldClaims || {});
  const isClaimTarget = (d, C = ldClaims()) => Object.values(C).some((c) => c && c.to === d);
  const claimedHard = (d, C = ldClaims()) => Object.values(C).some((c) => c && c.k === "hard" && c.to === d);
  /* a unit with anything logged, ticked or running – its plan is never rebuilt */
  function ldStarted(ds) {
    const sess = S.sessions[ds];
    if (!sess) return false;
    const resume = typeof resumeRead === "function" ? resumeRead() : null;
    return !!(sess.flow || sess.rdone || Object.keys(sess.perf || {}).length || Object.keys(sess.checked || {}).length || Object.keys(sess.roundChecks || {}).length || (resume && resume.ds === ds) || (ui.timer && ui.timer.ds === ds));
  }
  function loadAssign(ds) {
    if (!loadOn()) return false;
    const C = ldClaims(),
      w = loadWeekBase(ds),
      td = iso(today());
    let changed = false;
    // hard days first: the next open unit, never right after a hard day, within the weekly limit
    for (const d of w.missed) {
      if (C[d] || isClaimTarget(d, C) || !markedOn(d, w.marked)) continue;
      const hardNow = (x) => w.hard.has(x);
      const used = w.hard.size;
      let to = null;
      if (used < LOAD_HARD_MAX)
        to = w.open.find((x) => x >= td && !hardNow(x) && !isClaimTarget(x, C) && !hardNow(iso(addDays(parse(x), -1))) && !w.begun.has(x) && recentCap(x) === "hard") || null;
      C[d] = { to, k: "hard" };
      if (to) w.hard.add(to);
      changed = true;
    }
    // then the moderate/easy ones: one technique round more in the next open technique unit
    for (const d of w.missed) {
      if (C[d] || isClaimTarget(d, C) || markedOn(d, w.marked)) continue;
      const hardNow = (x) => w.hard.has(x);
      const to = w.open.find((x) => ["T", "C"].includes(planOn(x)) && !hardNow(x) && !isClaimTarget(x, C)) || null;
      C[d] = { to, k: "x" };
      changed = true;
    }
    // old claims go
    const old = iso(addDays(monday(today()), -35));
    for (const d of Object.keys(C)) if (d < old) {
      delete C[d];
      changed = true;
    }
    if (changed) store.save();
    return changed;
  }
  /* the facts of a week: dates, settled hard days, open and missed own units, marked days, and the hard days as they
     stand now (hard) – fixed ones first, then the replacements, then the marked days, never more than 3 */
  /* the last 3 days before a date: only logged entries with effort ≥ 7 count (nothing assumed for missing entries) */
  const ROLE_N = { easy: 0, mid: 1, hard: 2 };
  function recentCap(ds) {
    const back = (k) => hardEntry(iso(addDays(parse(ds), -k)));
    if (back(1) || [1, 2, 3].filter(back).length >= 2) return "easy";
    if (back(2)) return "mid";
    return "hard";
  }
  const capRole = (role, cap) => (ROLE_N[role] > ROLE_N[cap] ? cap : role);
  /* a marked hard unit stays one when it is moved: the weekday of its origin counts (moving keeps "from") */
  const markedOn = (d, marked = new Set(S.profile.hardDays || [])) => {
    const o = (S.ov || {})[d];
    return marked.has(wd(o && o.from ? o.from : d));
  };
  const badForm = (d) => typeof formOn === "function" && formOn(d) === 0;
  function loadWeekBase(ds) {
    const mon = monday(parse(ds)),
      td = iso(today()),
      dates = [0, 1, 2, 3, 4, 5, 6].map((i) => iso(addDays(mon, i))),
      marked = new Set(S.profile.hardDays || []),
      C = ldClaims(),
      settledHard = dates.filter((d) => hardEntry(d)),
      open = dates.filter((d) => d >= td && ownUnit(d) && !doneOn(d)),
      missed = dates.filter((d) => d < td && ownUnit(d) && !doneOn(d)),
      // a begun unit keeps the role it was built with
      begun = new Map(open.filter((d) => ldStarted(d)).map((d) => [d, String(S.sessions[d].ld || "")])),
      hard = new Set(settledHard.concat([...begun].filter(([, r]) => r.startsWith("hard")).map(([d]) => d)));
    // open, not begun days the last 3 days allow to be hard (a day that may not be hard is left out, nothing moves)
    const free = open.filter((d) => !begun.has(d) && !hard.has(d)),
      mayHard = (d) => recentCap(d) === "hard";
    // replacements first – beyond the limit (actual and begun hard days counted) they step down, the claim stays used
    const claims = free.filter((d) => claimedHard(d, C) && mayHard(d));
    for (const d of claims) if (hard.size < LOAD_HARD_MAX) hard.add(d);
    // E48: too many marked days left for the allowed number – the next ones (in date order) become moderate
    const R = free.filter((d) => markedOn(d, marked) && !claimedHard(d, C) && mayHard(d)),
      allowed = Math.max(0, LOAD_HARD_MAX - hard.size),
      H = new Set(R.slice(Math.max(0, R.length - allowed)));
    H.forEach((d) => hard.add(d));
    // today's form: a hard day with bad form (only when given) hands its hardness on to the next open unit that may be
    // hard and does not follow a hard day. A past day counts only when it was trained (a missed one is made up instead)
    const swap = {};
    for (const d of dates) {
      if (!ownUnit(d) || !badForm(d) || hardEntry(d) || begun.has(d)) continue;
      const wasHard = open.includes(d) ? hard.has(d) : doneOn(d) && (markedOn(d, marked) || claimedHard(d, C));
      if (!wasHard) continue;
      hard.delete(d);
      const to = free.find((x) => x > d && !hard.has(x) && !swap[x] && mayHard(x) && !hard.has(iso(addDays(parse(x), -1))) && !hardEntry(iso(addDays(parse(x), -1))));
      swap[d] = to || null;
      if (to && hard.size < LOAD_HARD_MAX) hard.add(to);
    }
    return { dates, marked, settledHard, open, missed, H, hard, begun, swap };
  }
  /* the roles of the whole week of a date: { [date]: "hard" | "mid" | "easy" }, extra: { [date]: 1 } (E50, E52, E53) –
     only read from the ledger, so the same state always gives the same week */
  function loadWeek(ds) {
    const w = loadWeekBase(ds),
      C = ldClaims(),
      role = {},
      extra = {},
      claimed = (d, k) => Object.values(C).some((c) => c && c.k === k && c.to === d);
      why = {},
      gotSwap = new Set(Object.values(w.swap).filter(Boolean));
    let i = 0;
    for (const d of w.dates) {
      if (!ownUnit(d)) continue;
      const open = w.open.includes(d);
      // past days keep the role they were planned with; open days follow the week as it stands now
      const pastClaim = !open && claimed(d, "hard") && !(d in w.swap);
      // a unit meant to be hard (marked or a replacement) that the last 3 days hold back gets exactly what they allow:
      // moderate after a hard day the day before yesterday, easy after one yesterday (the operator's example)
      const held = open && !w.begun.has(d) && !w.hard.has(d) && !(d in w.swap) && (markedOn(d, w.marked) || claimed(d, "hard")) && recentCap(d) !== "hard";
      if (w.begun.has(d)) role[d] = w.begun.get(d).replace(/[^a-z].*$/, "") || "mid";
      else if (w.hard.has(d) || hardEntry(d) || pastClaim) role[d] = "hard";
      else if (held) role[d] = recentCap(d);
      else role[d] = i++ % 2 === 0 ? "mid" : "easy";
      if (open && !w.begun.has(d)) {
        if (d in w.swap) {
          role[d] = "easy";
          why[d] = "form";
        } else {
          const c = capRole(role[d], recentCap(d));
          if (c !== role[d] || (role[d] !== "hard" && (markedOn(d, w.marked) || claimed(d, "hard")) && recentCap(d) !== "hard")) why[d] = "recent";
          role[d] = c;
          if (gotSwap.has(d) && role[d] === "hard") why[d] = "formTo";
        }
      }
      if (claimed(d, "x") && role[d] !== "hard" && open) extra[d] = 1;
    }
    return { role, extra, why };
  }
  /* role and extra round of one date (null when the switch is off or the day has no own unit) */
  function loadRole(ds) {
    if (!ds || !loadOn() || !ownUnit(ds)) return null;
    loadAssign(ds);
    const w = loadWeek(ds);
    return { role: w.role[ds] || "mid", extra: w.extra[ds] || 0, why: w.why[ds] || "" };
  }
  /* the target effort of a role: hard keeps the phase value, moderate up to 6, easy up to 4 (rpeRange centre) */
  const loadCap = (role) => (role === "mid" ? 5 : role === "easy" ? 3 : 99);
  const ldSig = (lr) => (lr ? `${lr.role}${lr.extra ? "+" : ""}${lr.why ? ":" + lr.why : ""}` : "");
  /* rebuild the planned, not begun units of this week whose role changed (an entry, a missed day, a new day) */
  let loadRefreshKey = "";
  function loadRefresh() {
    const td = iso(today()),
      last = S.log.length ? S.log[S.log.length - 1] : null,
      mon = iso(monday(today())),
      // every entry of this week with its effort: added, changed or deleted entries re-evaluate the week
      wk = S.log.filter((e) => e && e.date >= mon).map((e) => `${e.id}:${e.date}:${e.rpe}`).sort().join(","),
      fm = Object.entries(S.profile.form || {}).filter(([d]) => d >= mon).map(([d, f]) => `${d}:${f.sleep}:${f.energy}`).join(","),
      key = [td, S.log.length, last && last.id, last && last.rpe, wk, fm, !!S.profile.autoLoad, (S.profile.hardDays || []).join(""), Object.keys(S.sessions).length].join("|");
    if (key === loadRefreshKey) return false;
    loadRefreshKey = key;
    loadAssign(td); // write down make-up claims once (never twice for the same missed day)
    const sun = iso(addDays(monday(today()), 6));
    let changed = false;
    for (const [ds, sess] of Object.entries(S.sessions)) {
      if (ds < td || ds > sun || doneOn(ds) || !sess || sess.type === "M") continue;
      if (ldStarted(ds)) continue;
      // the intense types moved to the hard days (or back, switched off): a not begun unit of a planned type follows
      const now = planOn(ds),
        moved = now && now !== sess.type && !(S.ov && S.ov[ds] && S.ov[ds].t) && [suggestOn(ds, true), suggestOn(ds)].includes(sess.type) && sess.type !== "M" && now !== "M";
      const sig = ldSig(loadRole(ds));
      if (!moved && (sess.ld || "") === sig) continue;
      S.sessions[ds] = buildSession(ds, moved ? now : sess.type, sess.loc, sess.eq, { min: sess.min, run: !!sess.run, sport: sess.sport || mainSport(), tstyle: sess.tstyle, disc: sess.disc });
      changed = true;
    }
    if (changed) store.save();
    return changed;
  }
  /* the threshold: falling below it allows the question again; the dialog opens once per crossing */
  function loadAskCheck() {
    const p = S.profile;
    if (p.loadAsked && loadDays(p) < LOAD_MIN_DAYS) {
      p.loadAsked = false;
      store.save();
    }
    // after the tour and "what's new" – the question never covers them
    if (!loadAskDue(p) || !p.toured || ui.tour != null || needNews() || ui.sheet || ui.workout || ui.onb || (ui.timer && ui.timer.phase !== "ready" && ui.timer.phase !== "done")) return;
    p.loadAsked = true;
    store.save();
    openSheet({ kind: "loadask" });
  }
  function loadAskHtml() {
    const L = t("loadDist");
    return `<h3>${L.askT}</h3><p class="sub">${esc(L.ask(loadDays()))}</p><div class="gsec"><b>${L.classicT}</b><p>${esc(L.classic)}</p></div><div class="gsec"><b>${L.modT}</b><p>${esc(L.mod)}</p></div><p class="sub">${esc(L.askNote)}</p><div class="acts2"><button type="button" class="btn sec" data-ld="no">${L.no}</button><button type="button" class="btn" data-ld="yes">${L.yes}</button></div>`;
  }
  /* marking the hard days: only Ringzeit days, at most 3 (E47) */
  function loadHardHtml(p, sheet) {
    const L = t("loadDist"),
      hd = p.hardDays || [];
    return `${sheet ? `<h3>${L.hardT}</h3>` : `<span class="lab">${L.hardT}</span>`}<div class="chips">${p.days
      .slice()
      .sort((a, b) => a - b)
      .map((i) => `<button type="button" class="chip" data-hday="${i}" aria-pressed="${hd.includes(i)}"${!hd.includes(i) && hd.length >= LOAD_HARD_MAX ? " disabled" : ""}>${t("dayNames")[i]}</button>`)
      .join("")}</div><span class="sub">${esc(L.hardHint(hd.length))}</span>${sheet ? `<div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>` : ""}`;
  }
  function loadProfHtml(p) {
    if (!loadAllowed(p) || (loadDays(p) < LOAD_MIN_DAYS && !p.autoLoad)) return "";
    const L = t("loadDist");
    return `<div class="panel"><div class="field"><span class="lab">${L.title}</span><div class="seg g2"><button type="button" data-ldon="1" aria-pressed="${!!p.autoLoad}">${L.on}</button><button type="button" data-ldon="0" aria-pressed="${!p.autoLoad}">${L.off}</button></div><span class="sub">${esc(p.autoLoad ? L.onHint : L.offHint)}</span></div>${p.autoLoad ? `<div class="field">${loadHardHtml(p, false)}</div>` : ""}</div>`;
  }
  /* taps: dialog answers, switch, hard days – the profile draft and the stored profile change together */
  function loadAction(ds) {
    const P = [S.profile, typeof draft !== "undefined" && draft].filter(Boolean);
    // the day it was switched on – the progress card counts from there (Teil 36)
    const since = (on) => P.forEach((p) => {
      if (on && !p.autoLoad) p.autoLoadSince = iso(today());
    });
    if (ds.ld) {
      since(ds.ld === "yes");
      P.forEach((p) => {
        p.autoLoad = ds.ld === "yes";
        p.loadAsked = true;
      });
      store.save();
      if (ds.ld === "yes") openSheet({ kind: "loadhard" });
      else closeSheet();
      return render();
    }
    if (ds.ldon != null) {
      since(ds.ldon === "1");
      P.forEach((p) => {
        p.autoLoad = ds.ldon === "1";
        p.loadAsked = true;
      });
    }
    if (ds.hday != null) {
      const i = +ds.hday;
      P.forEach((p) => {
        const a = (p.hardDays = (p.hardDays || []).filter((x) => p.days.includes(x)));
        const j = a.indexOf(i);
        if (j >= 0) a.splice(j, 1);
        else if (a.length < LOAD_HARD_MAX) a.push(i);
        a.sort((x, y) => x - y);
      });
    }
    loadRefreshKey = "";
    loadCache = {};
    store.save();
    loadRefresh();
    render();
    if (ui.sheet && ui.sheet.kind === "loadhard") renderSheet();
  }
