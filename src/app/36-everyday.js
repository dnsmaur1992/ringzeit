  /* ============ Everyday life: week check-in, today's form, profile panel ============ */
  function lifeReplan(fromDs) {
    const td = fromDs || iso(today());
    dropOpenSessions(td);
    ui.setup = null;
    loadCache = {};
    ["weekMood", "lowTime", "work", "form"].forEach((k) => draft && (draft[k] = S.profile[k]));
    store.save();
  }
  /* short-on-time mode on or off (profile, unit page, profile entry – 21.11.2026): it stays until it is switched off.
     Units from today on are built anew – also one that was only opened with "Start" and has nothing entered yet
     (before, such a unit kept its old length, so the unit in front of you did not change). Entered data stays. */
  function lowEmpty(sess) {
    // anything entered: a value in a set row, a tick, an effort, a lap (index 0 too) – empty rows and zero counts are not
    const filled = (x) => (Array.isArray(x) ? x.some((e) => e != null && (typeof e !== "object" || filled(e))) : x && typeof x === "object" ? Object.values(x).some(filled) : x != null && x !== "" && x !== false && x !== 0),
      any = (m) => !!m && Object.values(m).some(filled);
    return !!sess && !sess.rdone && !any(sess.perf) && !any(sess.checked) && !any(sess.roundChecks) && !any(sess.exerciseEffort) && !any(sess.lapsDone) && !any(sess.timedLaps);
  }
  function lowSet(on) {
    const was = lowTime();
    S.profile.lowTime = on ? { on: true, since: was ? S.profile.lowTime.since || iso(today()) : iso(today()) } : { on: false, since: iso(today()) };
    const td = iso(today()),
      r = typeof resumeRead === "function" ? resumeRead() : null,
      opened = [];
    for (const [d, sess] of Object.entries(S.sessions))
      if (d >= td && !doneOn(d) && sess && sess.flow && lowEmpty(sess) && !(ui.timer && ui.timer.ds === d) && !(ui.workout && ui.workout.ds === d)) {
        opened.push([d, sess]);
        delete S.sessions[d];
        if (r && r.ds === d) resumeClear();
      }
    lifeReplan();
    // the opened unit comes straight back in the new length – same kind, place and equipment, nothing to rebuild by hand
    for (const [d, x] of opened)
      S.sessions[d] = buildSession(d, x.type, x.loc, x.eq, { run: !!x.run, sport: x.sport || mainSport(), tstyle: x.tstyle, disc: x.disc, min: sessMin(x.type) });
    store.save();
  }
  /* the switch at the unit: one tap, persistent like the one in the profile */
  function lowChipHtml(ds) {
    const L = t("life"),
      on = lowTime();
    return `<div class="lowrow"><button type="button" class="btn sec lowchip" data-low="${on ? "off" : "on"}" aria-pressed="${on}"><span class="lowic" aria-hidden="true">⏱</span><span>${on ? L.lowChipOn : L.lowChip}</span></button><span class="sub">${on ? L.lowChipOnS : L.lowChipS}</span></div>`;
  }
  /* the persistent entry at the top of the profile while the mode is on */
  function lowProfEntry() {
    if (!lowTime()) return "";
    const L = t("life"),
      since = S.profile.lowTime.since;
    return `<div class="panel lowent"><div class="field"><span class="lab"><span aria-hidden="true">⏱</span> ${L.lowLbl}: ${t("onOff")[0]}</span><span class="sub">${esc(L.lowEnt(since ? fmtDate(since) : ""))}</span><div class="acts2"><button type="button" class="btn sec" data-low="off">${L.lowEntOff}</button></div></div></div>`;
  }
  /* Today: one question per week, asked until it is answered (from Monday on) */
  function weekCheckHtml() {
    const key = iso(monday(today()));
    // not in the very first week: new users first get to know the app
    if ((S.profile.weekMood || {})[key] || S.profile.example) return "";
    if (S.profile.planStart && iso(monday(parse(S.profile.planStart))) >= key) return "";
    const L = t("life");
    return `<div class="blks" style="--bc:#6f9fe0"><div class="bsrow"><span class="bico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg></span><div><b>${L.weekQ}</b><span class="sub">${L.weekS}</span></div></div><div class="seg">${["easy", "normal", "hard"].map((k) => `<button type="button" data-mood="${k}">${L.moods[k]}</button>`).join("")}</div></div>`;
  }
  /* Session page: today's form, two optional taps */
  function formHtml(ds, sess) {
    if (simpleView() || ds !== iso(today()) || doneOn(ds) || (sess && sess.type === "M")) return "";
    const L = t("life"),
      f = (S.profile.form || {})[ds] || {},
      row = (k) =>
        `<div class="frow"><span>${L[k]}</span><div class="seg">${[0, 1, 2].map((v) => `<button type="button" data-form="${k}:${v}" aria-pressed="${f[k] === v}">${L.lv[v]}</button>`).join("")}</div></div>`;
    return `<div class="panel formp"><div class="field"><span class="lab">${L.formQ}</span><span class="sub">${f.sleep != null && f.energy != null && formOn(ds) < 2 ? "✓ " + L.formDone : L.formS}</span>${row("sleep")}${row("energy")}</div></div>`;
  }
  function lifePanelHtml() {
    const L = t("life"),
      mood = weekMood(),
      low = lowTime(),
      work = S.profile.work || "";
    return `<div class="panel"><div class="field"><span class="lab">${L.title}</span><span class="sub">${L.hint}</span></div>
        <div class="field"><span class="lab">${L.weekLbl}</span><div class="seg">${["easy", "normal", "hard"].map((k) => `<button type="button" data-mood="${k}" aria-pressed="${mood === k}">${L.moods[k]}</button>`).join("")}</div></div>
        <div class="field"><span class="lab">${L.lowLbl}</span><div class="seg">${[0, 1].map((i) => `<button type="button" data-low="${i ? "off" : "on"}" aria-pressed="${low === !i}">${t("onOff")[i]}</button>`).join("")}</div><span class="sub">${L.lowHint}</span></div>
        <div class="field"><span class="lab">${L.workLbl}</span><div class="seg">${["", "sit", "phys"].map((k) => `<button type="button" data-work="${k || "none"}" aria-pressed="${work === k}">${L.works[k]}</button>`).join("")}</div><span class="sub">${L.workHint}</span></div></div>`;
  }
  function lifeAction(ds) {
    const L = t("life");
    if (ds.mood) {
      const key = iso(monday(today()));
      S.profile.weekMood = { ...(S.profile.weekMood || {}), [key]: ds.mood };
      // keep the last ten weeks
      const ks = Object.keys(S.profile.weekMood).sort();
      while (ks.length > 10) delete S.profile.weekMood[ks.shift()];
      lifeReplan();
      render();
      return toast(L.moodToast[ds.mood]);
    }
    if (ds.low) {
      lowSet(ds.low === "on");
      render();
      return toast(ds.low === "on" ? L.lowOn : L.lowOff);
    }
    if (ds.work) {
      S.profile.work = ds.work === "none" ? "" : ds.work;
      lifeReplan();
      render();
      return toast(t("planUpd"));
    }
    if (ds.form) {
      const [k, v] = ds.form.split(":"),
        d = iso(today());
      S.profile.form = { ...(S.profile.form || {}) };
      S.profile.form[d] = { ...(S.profile.form[d] || {}), [k]: +v };
      const ks = Object.keys(S.profile.form).sort();
      while (ks.length > 30) delete S.profile.form[ks.shift()];
      // today's session follows the new form, unless sets were already logged or the timer is running
      const sess = S.sessions[d],
        logged =
          sess &&
          sess.perf &&
          Object.values(sess.perf).some((rows) => rows.some((r) => r.r != null || r.kg != null)),
        busy =
          logged || (ui.timer && ui.timer.ds === d && ui.timer.phase !== "ready" && ui.timer.phase !== "done");
      if (sess && !busy) {
        S.sessions[d] = buildSession(d, sess.type, sess.loc, sess.eq, {
          min: sess.min,
          run: sess.run,
          sport: sess.sport,
          tstyle: sess.tstyle,
          disc: sess.disc,
        });
        clearSessionTimer();
      }
      if (draft) draft.form = S.profile.form;
      store.save();
      return render();
    }
  }

