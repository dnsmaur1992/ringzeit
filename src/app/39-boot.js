  /* ============ Boot ============ */
  function ensureExample() {
    const nd = nextTrainingDate(),
      ty = planOn(nd);
    if (ty && !S.sessions[nd]) S.sessions[nd] = buildSession(nd, ty, defLoc(ty), defaultEq());
  }
  /* Release transition: refresh only untouched legacy previews, keeping their chosen settings.
     Started/done/resumable sessions retain the exact prescriptions the user already saw in training. */
  /* version of the planning logic: a change rebuilds the planned, not begun sessions once (E14, 17.11.2026);
     begun or done sessions and every entry stay as they are */
  const PLAN_LOGIC = 4; // 3: preparation for the focus (17.11.2026); 4: strength unit in the fitness gym (18.11.2026)
  function refreshLegacyPlans() {
    const from = iso(today()), resume = resumeRead(),
      newLogic = S.profile.planLogic !== PLAN_LOGIC;
    let changed = false;
    // in date order, so the focus order of the rebuilt units follows the calendar
    for (const [ds, sess] of Object.entries(S.sessions).sort(([a], [b]) => a.localeCompare(b))) {
      const started = sess.flow || sess.rdone || Object.keys(sess.perf || {}).length ||
        Object.keys(sess.checked || {}).length || Object.keys(sess.roundChecks || {}).length || resume?.ds === ds;
      if (ds < from || doneOn(ds) || started ||
          (!newLogic && [0,1,2].includes(sess.techniqueLevel) && Object.prototype.hasOwnProperty.call(sess, "effortDose"))) continue;
      S.sessions[ds] = buildSession(ds, sess.type, sess.loc, sess.eq, {
        min: sess.min, run: !!sess.run, sport: sess.sport || mainSport(), tstyle: sess.tstyle, disc: sess.disc,
      });
      changed = true;
    }
    if (newLogic) {
      S.profile.planLogic = PLAN_LOGIC;
      changed = true;
    }
    return changed;
  }
  /* all data lives on this device: the installed app asks the browser once per start not to clear it under storage
     pressure (a normal tab asks nothing, so no permission prompt appears there) */
  function askPersist() {
    try {
      if (isStandalone() && navigator.storage && navigator.storage.persist)
        return navigator.storage
          .persisted()
          .then((p) => p || navigator.storage.persist())
          .catch(() => false);
    } catch (e) {}
    return null;
  }
  (function boot() {
    const local = store.readLocal();
    if (local) S = hydrate(local);
    else {
      try {
        if (!/^de\b/i.test(navigator.language || "de")) S.profile.lang = "en";
      } catch (e) {}
    }
    if (!S.profile.planStart) S.profile.planStart = iso(today());
    if (local && refreshLegacyPlans()) store.save();
    askPersist();
    if (!local && S.profile.example)
      ui.onb = {
        step: 0,
        disc: "",
        days: [0, 2, 4],
        minutes: 75,
        birthYear: "",
        birth: "",
        comp: "",
        clubDays: [],
        clubMin: 90,
      };
    ensureExample();
    applyAudioMode();
    render();
    prepLoader("loadingApp");
    openLoader(3500).then(() => {
      if (!ui.onb && !S.profile.ackSafe && !S.profile.example) {
        resumeReady = true;
        ui.onb = { ack: {}, ackOnly: true };
        renderOnb();
        return;
      }
      if (!ui.onb && needBirth()) {
        resumeReady = true;
        return askBirth(() => {
          if (needNews()) return showNews();
          if (!S.profile.toured) startTour();
        });
      }
      const next = () => {
        if (!ui.onb && needNews()) return showNews();
        if (!ui.onb && !S.profile.toured) startTour();
      };
      if (!resumeOffer(next)) next();
    });
    // keep the tab bar at the bottom (iOS): after scrolling stops, on resize and when the app comes back
    {
      let tt = 0;
      const later = () => {
        clearTimeout(tt);
        tt = setTimeout(tabsReanchor, 160);
      };
      window.addEventListener("scroll", later, { passive: true });
      window.addEventListener("resize", later);
      window.addEventListener("pageshow", later);
      document.addEventListener("visibilitychange", () => !document.hidden && later());
    }
    store.init().then(async () => {
      if (await store.loadCloud()) {
        if (!S.profile.planStart) S.profile.planStart = iso(today());
        ensureExample();
        store.writeLocal();
        render();
      }
    });
  })();
