  /* ============ Guided training: preview first, execution after an explicit start ============ */
  const workoutText = () =>
    S.profile.lang === "de"
      ? {
          intro: "Heute → Tagesplan ansehen und Ausrüstung bereitlegen → Training beginnen. Dann führt dich Ringzeit Übung für Übung im Vollbild – mit Gong, Ansage und Satz-Tabelle – vom Aufwärmen bis zum Abschluss.",
          start: "Training beginnen",
          resume: "Training fortsetzen",
          preview:
            "Sieh dir den Plan an und lege deine Ausrüstung bereit. „Training beginnen“ führt dich dann Übung für Übung durch – mit Gong, Ansage und Satz-Tabelle.",
          finish: "Abschluss",
          back: "Zurück",
          close: "Zur Planübersicht",
          skip: "Abschnitt überspringen",
          next: "Weiter zu",
          ready: "Abschnitt erledigt",
          open: "Noch offene Übungen – beim Weitergehen bleiben sie offen.",
          timer: "Timer starten",
          pause: "Pausieren",
          continue: "Fortsetzen",
          reset: "Zurücksetzen",
          done: "Zeit abgelaufen",
          side: "Seite",
          change: "Seitenwechsel",
          set: "Satz",
          lap: "Durchgang",
          rest: "Pause",
          work: "Arbeit",
          run: "Läuft",
          choose: "Dauer wählen",
          rounds: "Rundentimer öffnen",
          restStart: "Satzpause starten",
          saved: "Deine Eingaben werden gespeichert. Schließen pausiert laufende Timer.",
        }
      : {
          intro: "Today → look at the daily plan and prepare your equipment → Begin training. Ringzeit then guides you exercise by exercise in full screen – with gong, calls and set table – from warm-up to finish.",
          start: "Begin training",
          resume: "Resume training",
          preview:
            "Review the plan and prepare your equipment. Begin training then guides you exercise by exercise – with gong, calls and set table.",
          finish: "Finish",
          back: "Back",
          close: "Back to plan",
          skip: "Skip section",
          next: "Continue to",
          ready: "Section complete",
          open: "Some exercises are still open. Continuing will leave them open.",
          timer: "Start timer",
          pause: "Pause",
          continue: "Resume",
          reset: "Reset",
          done: "Time elapsed",
          side: "Side",
          change: "Change sides",
          set: "Set",
          lap: "Lap",
          rest: "Rest",
          work: "Work",
          run: "In progress",
          choose: "Choose duration",
          rounds: "Open round timer",
          restStart: "Start set rest",
          saved: "Your entries are saved. Closing pauses running timers.",
        };
  function workoutNextLabel() {
    const sess = S.sessions[ui.sel],
      next = sess?.blocks[(ui.workout?.block ?? 0) + 1];
    return `${workoutText().next} ${next ? blkName(next) : workoutText().finish}`;
  }
  function workoutProgress(sess, bi) {
    const b = sess.blocks[bi];
    if (!b) return sessionCompletion(sess);
    const done = b.items.filter((it, ni) => itemDone(sess, bi, ni)).length;
    return { done, total: b.items.length, complete: done === b.items.length };
  }
  function updateWorkoutProgress() {
    if (!ui.workout) return;
    const sess = S.sessions[ui.sel];
    if (!sess) return;
    const p = workoutProgress(sess, ui.workout.block),
      el = document.getElementById("workoutProgress");
    if (el) el.textContent = flowText().progress(p.done, p.total);
    const hint = document.getElementById("workoutOpen");
    if (hint) hint.textContent = p.complete ? workoutText().ready : workoutText().open;
  }
  function focusWorkout() {
    const root = document.getElementById(ui.focus ? "focus" : "workout");
    root?.querySelector(ui.focus ? "button" : "#workoutTitle")?.focus?.({ preventScroll: true });
  }
  function startWorkout() {
    const sess = S.sessions[ui.sel];
    if (!sess || doneOn(ui.sel)) return;
    pauseOtherTimer("exercise");
    if (ui.exerciseTimer?.running) pauseExerciseTimer();
    const stored = sess.flow?.block;
    const firstOpen = sess.blocks.findIndex((b, bi) => b.items.some((it, ni) => !itemDone(sess, bi, ni)));
    const block = Number.isInteger(stored) ? Math.max(0, Math.min(sess.blocks.length, stored)) : firstOpen < 0 ? sess.blocks.length : firstOpen;
    const steps = playerSteps(sess),
      storedStep = sess.flow?.step,
      firstStep = steps.findIndex((st) => st.kind === "finish" || !stepDone(sess, st)),
      step = Number.isInteger(storedStep) ? Math.max(0, Math.min(steps.length - 1, storedStep)) : Math.max(0, firstStep);
    sess.flow = { block: steps[step].bi, step, startedAt: sess.flow?.startedAt || Date.now() };
    ui.workout = { ds: ui.sel, block: steps[step].bi, step, player: true };
    ui.focus = steps[step].kind === "rounds";
    store.save();
    resumeSave(true);
    render();
    focusWorkout();
  }
  function pauseWorkoutTimers() {
    if (ui.exerciseTimer?.running) pauseExerciseTimer();
    if (ui.timer?.running) {
      tick();
      if (ui.timer) {
        ui.timer.carryMs = Math.max(0, Date.now() - lastTick);
        ui.timer.running = false;
        ui.timer.called = null;
      }
      cancelTimerSpeech();
      syncTimers();
    }
  }
  function closeWorkout(redraw = true) {
    if (!ui.workout) return;
    readFinishDraft();
    pauseWorkoutTimers();
    ui.workout = null;
    ui.focus = false;
    resumeSave(true);
    if (redraw) render();
  }
  function moveWorkout(delta) {
    if (!ui.workout) return;
    const sess = S.sessions[ui.sel];
    readFinishDraft();
    pauseWorkoutTimers();
    ui.workout.block = Math.max(0, Math.min(sess.blocks.length, ui.workout.block + delta));
    sess.flow.block = ui.workout.block;
    // keep the player position in step with the section
    const firstOfBlock = playerSteps(sess).findIndex((st) => st.bi === ui.workout.block);
    if (firstOfBlock >= 0) ui.workout.step = sess.flow.step = firstOfBlock;
    ui.focus = !!sess.blocks[ui.workout.block]?.rounds;
    store.save();
    resumeSave(true);
    render();
    const el = document.getElementById("workout");
    if (el) el.scrollTop = 0;
    focusWorkout();
  }
  /* Builds the session of day d from the settings form */
  async function rebuildFromSetup(d) {
    const ty = ui.setup.type;
    await loading("loadingSess");
    S.sessions[d] = buildSession(d, ty, ui.setup.loc, ui.setup.eq.slice(), {
      run: ui.setup.run === "free" ? false : ui.setup.run,
      sport: ui.setup.sport,
      tstyle: ui.setup.tstyle,
      disc: ui.setup.disc,
      min: ui.setup.min,
    });
    // the form now shows what the new session really uses
    ui.setup = setupOf(S.sessions[d], d);
    clearSessionTimer();
    store.save();
    render();
  }
  function workoutAction(action) {
    if (action === "start") {
      // settings changed but not rebuilt (e.g. no heavy bag any more): ask once before starting
      const d = ui.sel,
        sess = S.sessions[d];
      if (sess && !sess.flow && setupDirty(d))
        return openSheet({
          kind: "confirm",
          title: workoutText().start,
          lines: [t("startChangedQ")],
          okL: t("startRebuild"),
          noL: t("startAsIs"),
          run: async () => {
            await rebuildFromSetup(d);
            startWorkout();
          },
          no: () => {
            ui.setup = null;
            startWorkout();
          },
        });
      return startWorkout();
    }
    if (!ui.workout) return;
    if (action === "close") return closeWorkout();
    if (action === "next") return moveWorkout(1);
    if (action === "back") return moveWorkout(-1);
    if (action === "finish") {
      const sess = S.sessions[ui.sel];
      moveWorkout(sess.blocks.length - ui.workout.block);
    }
  }
