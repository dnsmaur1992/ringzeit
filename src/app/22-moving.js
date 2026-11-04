  /* ============ Moving sessions ============ */
  /* Moves an own session (with everything already built or entered) to another day; the origin keeps a "moved" note */
  function doMove(from, to) {
    const ty = typeOn(from),
      sess = S.sessions[from],
      prev = S.ov[from] || {},
      origin = prev.from || from;
    if (prev.from) delete S.ov[from];
    if (prev.t && !prev.from && !dayTypes()[wd(from)]) {
      // an extra session simply changes its day
      delete S.ov[from];
      S.ov[to] = { t: ty };
    } else if (to === origin) delete S.ov[origin];
    else {
      S.ov[origin] = { off: "moved", to };
      S.ov[to] = { t: ty, from: origin };
    }
    if (sess && !doneOn(from)) {
      sess.date = to;
      S.sessions[to] = sess;
      delete S.sessions[from];
    }
    ui.sel = to;
    ui.setup = null;
    clearSessionTimer();
    store.save();
    render();
  }
  function undoOwn(ds) {
    const o = S.ov[ds];
    if (!o) return;
    if (o.off === "moved" && o.to) {
      const sess = S.sessions[o.to];
      if (sess && !doneOn(o.to)) {
        sess.date = ds;
        S.sessions[ds] = sess;
        delete S.sessions[o.to];
      }
      if (S.ov[o.to] && S.ov[o.to].from === ds) delete S.ov[o.to];
    }
    delete S.ov[ds];
    ui.setup = null;
  }
  /* First free day from today on (no own session, no break), preferably without club training */
  function catchUpDate() {
    let fallback = null;
    for (let i = 0; i < 7; i++) {
      const d = iso(addDays(today(), i));
      if (planOn(d) || doneOn(d) || pausedOn(d)) continue;
      if (!clubOn(d)) return d;
      fallback = fallback || d;
    }
    return fallback || iso(addDays(today(), 1));
  }
  function pickMoveTarget(to) {
    const o = ui.sheet;
    if (o.club) {
      doClubMove(o.ds, to);
      closeSheet();
      toast(t("movedTo")(dayLbl(to)));
      render();
      return;
    }
    const from = o.ds,
      ty = typeOn(from),
      lines = [];
    if (clubOn(to)) lines.push(t("clubSameDay"));
    if (HARD_T.has(ty) && hardNear(to, from)) lines.push(t("hardNeighbor"));
    const go = () => {
      doMove(from, to);
      toast(t("movedTo")(dayLbl(to)));
    };
    if (lines.length) openSheet({ kind: "confirm", title: t("move"), lines, run: go });
    else {
      closeSheet();
      go();
    }
  }
  function doClubMove(from, to) {
    const c = S.cov[from] || {},
      min = (clubOn(from) || {}).min || (S.profile.club && S.profile.club.minutes) || 90,
      origin = c.from || from;
    if (c.from) delete S.cov[from];
    if (to === origin) delete S.cov[origin];
    else {
      S.cov[origin] = { off: "moved", to };
      S.cov[to] = { on: true, min, from: origin };
    }
    store.save();
  }
  function undoClub(ds) {
    const c = S.cov[ds];
    if (!c) return;
    if (c.off === "moved" && S.cov[c.to] && S.cov[c.to].from === ds) delete S.cov[c.to];
    delete S.cov[ds];
  }

