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
     and is settled as well. Claims older than 5 weeks are dropped. */
  const ldClaims = () => (S.profile.ldClaims = S.profile.ldClaims || {});
  const isClaimTarget = (d, C = ldClaims()) => Object.values(C).some((c) => c && c.to === d);
  function loadAssign(ds) {
    if (!loadOn()) return false;
    const C = ldClaims(),
      w = loadWeekBase(ds),
      td = iso(today());
    let changed = false;
    // hard days first: the next open unit, never right after a hard day, within the weekly limit
    for (const d of w.missed) {
      if (C[d] || isClaimTarget(d, C) || !w.marked.has(wd(d))) continue;
      const hardNow = (x) => hardEntry(x) || w.H.has(x) || Object.values(C).some((c) => c && c.k === "hard" && c.to === x);
      const used = w.settledHard.length + w.open.filter((x) => hardNow(x)).length;
      let to = null;
      if (used < LOAD_HARD_MAX)
        to = w.open.find((x) => x >= td && !hardNow(x) && !isClaimTarget(x, C) && !hardNow(iso(addDays(parse(x), -1)))) || null;
      C[d] = { to, k: "hard" };
      changed = true;
    }
    // then the moderate/easy ones: one technique round more in the next open technique unit
    for (const d of w.missed) {
      if (C[d] || isClaimTarget(d, C) || w.marked.has(wd(d))) continue;
      const hardNow = (x) => hardEntry(x) || w.H.has(x) || Object.values(C).some((c) => c && c.k === "hard" && c.to === x);
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
  /* the facts of a week, without claims: dates, settled hard days, open and missed own units, marked days (E48 applied) */
  function loadWeekBase(ds) {
    const mon = monday(parse(ds)),
      td = iso(today()),
      dates = [0, 1, 2, 3, 4, 5, 6].map((i) => iso(addDays(mon, i))),
      marked = new Set(S.profile.hardDays || []),
      C = ldClaims(),
      settledHard = dates.filter((d) => hardEntry(d)),
      open = dates.filter((d) => d >= td && ownUnit(d) && !doneOn(d)),
      missed = dates.filter((d) => d < td && ownUnit(d) && !doneOn(d)),
      openClaimsHard = open.filter((d) => Object.values(C).some((c) => c && c.k === "hard" && c.to === d)).length,
      allowed = Math.max(0, LOAD_HARD_MAX - settledHard.length - openClaimsHard);
    // E48: too many marked days left for the allowed number – the next ones (in date order) become moderate
    const R = open.filter((d) => marked.has(wd(d)) && !Object.values(C).some((c) => c && c.k === "hard" && c.to === d)),
      H = new Set(R.slice(Math.max(0, R.length - allowed)));
    return { dates, marked, settledHard, open, missed, H };
  }
  /* the roles of the whole week of a date: { [date]: "hard" | "mid" | "easy" }, extra: { [date]: 1 } (E50, E52, E53) –
     only read from the ledger, so the same state always gives the same week */
  function loadWeek(ds) {
    const w = loadWeekBase(ds),
      C = ldClaims(),
      role = {},
      extra = {},
      claimed = (d, k) => Object.values(C).some((c) => c && c.k === k && c.to === d);
    let i = 0;
    for (const d of w.dates) {
      if (!ownUnit(d)) continue;
      if (w.H.has(d) || hardEntry(d) || claimed(d, "hard")) role[d] = "hard";
      else role[d] = i++ % 2 === 0 ? "mid" : "easy";
      if (claimed(d, "x") && role[d] !== "hard" && w.open.includes(d)) extra[d] = 1;
    }
    return { role, extra };
  }
  /* role and extra round of one date (null when the switch is off or the day has no own unit) */
  function loadRole(ds) {
    if (!ds || !loadOn() || !ownUnit(ds)) return null;
    loadAssign(ds);
    const w = loadWeek(ds);
    return { role: w.role[ds] || "mid", extra: w.extra[ds] || 0 };
  }
  /* the target effort of a role: hard keeps the phase value, moderate up to 6, easy up to 4 (rpeRange centre) */
  const loadCap = (role) => (role === "mid" ? 5 : role === "easy" ? 3 : 99);
  const ldSig = (lr) => (lr ? `${lr.role}${lr.extra ? "+" : ""}` : "");
  /* rebuild the planned, not begun units of this week whose role changed (an entry, a missed day, a new day) */
  let loadRefreshKey = "";
  function loadRefresh() {
    const td = iso(today()),
      last = S.log.length ? S.log[S.log.length - 1] : null,
      key = [td, S.log.length, last && last.id, last && last.rpe, !!S.profile.autoLoad, (S.profile.hardDays || []).join(""), Object.keys(S.sessions).length].join("|");
    if (key === loadRefreshKey) return false;
    loadRefreshKey = key;
    loadAssign(td); // write down make-up claims once (never twice for the same missed day)
    const resume = typeof resumeRead === "function" ? resumeRead() : null,
      sun = iso(addDays(monday(today()), 6));
    let changed = false;
    for (const [ds, sess] of Object.entries(S.sessions)) {
      if (ds < td || ds > sun || doneOn(ds) || !sess || sess.type === "M") continue;
      const started = sess.flow || sess.rdone || Object.keys(sess.perf || {}).length || Object.keys(sess.checked || {}).length || Object.keys(sess.roundChecks || {}).length || (resume && resume.ds === ds) || (ui.timer && ui.timer.ds === ds);
      if (started) continue;
      const sig = ldSig(loadRole(ds));
      if ((sess.ld || "") === sig) continue;
      S.sessions[ds] = buildSession(ds, sess.type, sess.loc, sess.eq, { min: sess.min, run: !!sess.run, sport: sess.sport || mainSport(), tstyle: sess.tstyle, disc: sess.disc });
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
    if (ds.ld) {
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
