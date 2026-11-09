  /* ============ Boot ============ */
  function ensureExample() {
    const nd = nextTrainingDate(),
      ty = planOn(nd);
    if (ty && !S.sessions[nd]) S.sessions[nd] = buildSession(nd, ty, "gym", defaultEq());
  }
  /* Release transition: refresh only untouched legacy previews, keeping their chosen settings.
     Started/done/resumable sessions retain the exact prescriptions the user already saw in training. */
  function refreshLegacyPlans() {
    const from = iso(today()), resume = resumeRead();
    let changed = false;
    for (const [ds, sess] of Object.entries(S.sessions)) {
      const started = sess.flow || sess.rdone || Object.keys(sess.perf || {}).length ||
        Object.keys(sess.checked || {}).length || Object.keys(sess.roundChecks || {}).length || resume?.ds === ds;
      if (ds < from || doneOn(ds) || started ||
          ([0,1,2].includes(sess.techniqueLevel) && Object.prototype.hasOwnProperty.call(sess, "effortDose"))) continue;
      S.sessions[ds] = buildSession(ds, sess.type, sess.loc, sess.eq, {
        min: sess.min, run: !!sess.run, sport: sess.sport || mainSport(), tstyle: sess.tstyle, disc: sess.disc,
      });
      changed = true;
    }
    return changed;
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
    if (!local && S.profile.example)
      ui.onb = {
        step: 0,
        disc: "lc",
        days: [0, 2, 4],
        minutes: 75,
        birthYear: "",
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
      const next = () => {
        if (!ui.onb && needNews()) return showNews();
        if (!ui.onb && !S.profile.toured) startTour();
      };
      if (!resumeOffer(next)) next();
    });
    store.init().then(async () => {
      if (await store.loadCloud()) {
        if (!S.profile.planStart) S.profile.planStart = iso(today());
        ensureExample();
        store.writeLocal();
        render();
      }
    });
  })();
