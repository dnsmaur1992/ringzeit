  /* ============ Boot ============ */
  function ensureExample() {
    const nd = nextTrainingDate(),
      ty = planOn(nd);
    if (ty && !S.sessions[nd]) S.sessions[nd] = buildSession(nd, ty, "gym", defaultEq());
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
