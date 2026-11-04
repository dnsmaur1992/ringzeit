  /* ============ Resume after reload / close ============
     While a guided training or one of its timers is open, a small snapshot (own storage key, not part of the
     backup) is kept up to date. After a reload, a closed tab or a system restart the app asks "Training fortsetzen?"
     and, if confirmed, shows the timers PAUSED at the saved remaining time. Nothing starts by itself, and the time
     that passed while the app was closed is never booked as a round, a tick or training load.
     (Locking the screen or switching apps is a different case: the running clock keeps counting there, as before.) */
  const RESUME_KEY = APP_ID + ".resume.v1";
  const RESUME_OLD_MS = 24 * 3600 * 1000;
  let resumeAt = 0,
    resumeReady = false,
    resumeLater = null;
  const resumeText = () =>
    S.profile.lang === "de"
      ? {
          title: "Training fortsetzen?",
          what: (day, time, pos) => `Deine Einheit vom ${day} wurde um ${time} Uhr unterbrochen${pos ? " (" + pos + ")" : ""}. Der Timer steht auf Pause, nichts läuft von selbst weiter.`,
          old: "Das ist länger als einen Tag her.",
          step: (a, n) => `Schritt ${a} von ${n}`,
          timerOnly: "Rundentimer",
          ok: "Fortsetzen",
          no: "Nicht fortsetzen",
          gone: "Die gespeicherte Einheit gibt es nicht mehr.",
          back: "Training fortgesetzt – der Timer steht auf Pause.",
        }
      : {
          title: "Resume training?",
          what: (day, time, pos) => `Your session of ${day} was interrupted at ${time}${pos ? " (" + pos + ")" : ""}. The timer is paused; nothing runs on its own.`,
          old: "That was more than a day ago.",
          step: (a, n) => `step ${a} of ${n}`,
          timerOnly: "round timer",
          ok: "Resume",
          no: "Don't resume",
          gone: "The saved session no longer exists.",
          back: "Training resumed – the timer is paused.",
        };
  function resumeRead() {
    try {
      const r = JSON.parse(localStorage.getItem(RESUME_KEY));
      return r && r.v === 1 && r.ds ? r : null;
    } catch (e) {
      return null;
    }
  }
  function resumeClear() {
    clearTimeout(resumeLater);
    resumeLater = null;
    try {
      localStorage.removeItem(RESUME_KEY);
    } catch (e) {}
  }
  /* null = nothing to resume, undefined = a clock is mid-catch-up (keep the last good snapshot), else the snapshot */
  function resumeSnapshot() {
    const now = Date.now(),
      rt = ui.timer && ui.timer.phase !== "ready" && ui.timer.phase !== "done" ? ui.timer : null,
      et = ui.exerciseTimer && !ui.exerciseTimer.done ? ui.exerciseTimer : null;
    const ds = ui.workout?.ds || et?.ds || rt?.ds;
    if (!ds) return null;
    const sess = S.sessions[ds];
    if (!sess || doneOn(ds)) return null;
    if (et?.running && et.endAt <= now) return undefined;
    if (rt?.running && now - lastTick >= 1000) return undefined;
    const snap = { v: 1, at: now, ds, flowStart: sess.flow?.startedAt || 0, type: sess.type, nb: sess.blocks.length };
    if (ui.workout && ui.workout.ds === ds)
      snap.workout = { block: ui.workout.block, step: ui.workout.step, list: !!ui.workout.list, player: !!ui.workout.player };
    snap.focus = !!ui.focus;
    if (rt && rt.ds === ds) {
      const { ds: _d, call, called, ...rest } = rt;
      snap.timer = { ...rest, ds, running: false, carryMs: rt.running ? Math.min(999, Math.max(0, now - lastTick)) : rt.carryMs || 0 };
    }
    if (et && et.ds === ds) {
      const { warned, endAt, ...rest } = et;
      snap.ex = { ...rest, running: false, done: false, remainingMs: et.running ? Math.max(0, et.endAt - now) : et.remainingMs };
    }
    return snap.workout || snap.timer || snap.ex ? snap : null;
  }
  /* Called often (every clock tick, every step change); writes at most every 2 s, with a trailing write so the
     latest state is never lost. force = write now (page hidden, step changed). */
  function resumeSave(force) {
    if (!resumeReady) return;
    const now = Date.now();
    if (!force && now - resumeAt < 2000) {
      if (!resumeLater)
        resumeLater = setTimeout(() => {
          resumeLater = null;
          resumeSave(true);
        }, 2000 - (now - resumeAt));
      return;
    }
    try {
      const snap = resumeSnapshot();
      if (snap === undefined) return;
      resumeAt = now;
      if (snap) localStorage.setItem(RESUME_KEY, JSON.stringify(snap));
      else localStorage.removeItem(RESUME_KEY);
    } catch (e) {}
  }
  function resumeValid(r) {
    const sess = S.sessions[r.ds];
    return !!sess && !doneOn(r.ds) && (sess.flow?.startedAt || 0) === r.flowStart && sess.type === r.type && sess.blocks.length === r.nb;
  }
  /* The restored state: timers paused with their saved remaining time, position in the guided training as left */
  function resumeApply(r) {
    const sess = S.sessions[r.ds],
      steps = playerSteps(sess);
    ui.sel = r.ds;
    ui.setup = null;
    ui.tab = "session";
    ui.timer = null;
    ui.exerciseTimer = null;
    if (r.timer) ui.timer = { ...r.timer, ds: r.ds, running: false, call: null, called: null };
    if (r.ex && r.workout)
      ui.exerciseTimer = { ...r.ex, ds: r.ds, running: false, done: false, endAt: 0, remainingMs: Math.max(0, r.ex.remainingMs || 0) };
    if (r.workout) {
      const step = Math.max(0, Math.min(steps.length - 1, r.workout.step || 0));
      ui.workout = { ds: r.ds, block: steps[step].bi, step, player: true, list: !!r.workout.list };
      sess.flow = { ...(sess.flow || {}), block: steps[step].bi, step };
      ui.focus = !!r.focus && !ui.workout.list && steps[step].kind === "rounds";
    } else ui.focus = !!r.focus && !!ui.timer;
    syncTimers();
    render();
    window.scrollTo(0, 0);
    toast(resumeText().back);
  }
  /* At start: offers to continue; next() carries on with the normal start-up (news, tour) afterwards.
     Returns true when the question was opened. */
  function resumeOffer(next) {
    const r = resumeRead();
    if (!r) return (resumeReady = true), false;
    if (ui.onb || !resumeValid(r)) {
      resumeClear();
      resumeReady = true;
      if (!ui.onb && S.sessions[r.ds] === undefined) toast(resumeText().gone);
      return false;
    }
    const R = resumeText(),
      at = new Date(r.at),
      sess = S.sessions[r.ds],
      pos = r.workout ? R.step((r.workout.step || 0) + 1, playerSteps(sess).length) : R.timerOnly,
      lines = [R.what(dayLbl(iso(at)), `${pad(at.getHours())}:${pad(at.getMinutes())}`, pos)];
    if (Date.now() - r.at > RESUME_OLD_MS) lines.push(R.old);
    openSheet({
      kind: "confirm",
      title: R.title,
      lines,
      okL: R.ok,
      noL: R.no,
      run() {
        resumeReady = true;
        resumeApply(r);
        resumeSave(true);
      },
      no() {
        resumeClear();
        resumeReady = true;
        next();
      },
    });
    return true;
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") resumeSave(true);
  });
  window.addEventListener("pagehide", () => resumeSave(true));
