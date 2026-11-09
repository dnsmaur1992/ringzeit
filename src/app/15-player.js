  /* ============ Training player: one thing at a time, full screen ============
     After "Begin training" the session runs step by step:
       timed exercise  → 10 s get-ready (announces it), then the timer with gong, then the next step by itself
       no fixed time   → big "Done" button (reps, distance, joint circles …)
       strength        → set table on the same screen, set rest with gong
       round block     → the round screen (rounds run on their own)
       circuit         → lap by lap; the card lists the whole lap, the current exercise highlighted
     The section overview (list) stays reachable via ☰. */
  const PREP_S = 10;
  const TICK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const playerText = () =>
    S.profile.lang === "de"
      ? {
          ready: "Bereit machen",
          done: "Fertig",
          next: "Als Nächstes",
          nextSay: "Als Nächstes",
          last: "Danach: Abschluss",
          list: "Übersicht",
          player: "Zurück zum Ablauf",
          lap: (a, n) => `Durchgang ${a} von ${n}`,
          circuit: "Zirkel – alle Übungen nacheinander, dann Pause",
          setOf: (a, n) => `Satz ${a} von ${n}`,
          setsDone: "Alle Sätze eingetragen",
          enter: "Satz machen, Wiederholungen eintragen, ✓ tippen – dann läuft die Satzpause.",
          enterTime: "▶ startet alle Sätze: Halten, Pause, nächster Satz – mit Gong, wie bei den Runden. Die Sekunden werden eingetragen; du kannst sie ändern.",
          rest: "Satzpause 1:00",
          setTimer: (n) => `Satz ${n} mit Timer`,
          rounds: "Runden",
          roundsOpen: "Rundentimer öffnen",
          roundsOf: (a, n) => `${a} von ${n} Runden erledigt`,
          start: "Start",
          step: (a, n) => `${a}/${n}`,
          prev: "Vorherige Übung",
          skip: "Nächste Übung",
          finishEarly: "Vorzeitig abschließen",
          choose: "Dauer",
          setDone: "Satz fertig",
          soundT: "Ton an?",
          sound: "Schalter links am iPhone auf Ton (kein oranger Streifen), Lautstärke hoch. Ohne Schalter: im Kontrollzentrum den Stummmodus (Glocke) aus.",
          soundOk: "Ton ist an",
          soundAndroid:
            "Lautstärketaste drücken und den Regler für Medien (Musiknote) hochziehen – er ist getrennt vom Klingelton.",
          tenLeft: "Noch 10 Sekunden",
          lapRest: "Pause",
          lapRestHint: "Durchatmen, trinken – gleich kommt der nächste Durchgang.",
          enterFirst: "Bitte erst die Wiederholungen eintragen.",
          enterSay: "Wiederholungen eintragen",
          skippedOpen: "Übersprungen – der Satz bleibt offen.",
          mine: "deine Werte – B trägt nichts ein",
        }
      : {
          ready: "Get ready",
          done: "Done",
          next: "Up next",
          nextSay: "Up next",
          last: "Then: finish",
          list: "Overview",
          player: "Back to the flow",
          lap: (a, n) => `Lap ${a} of ${n}`,
          circuit: "Circuit – all exercises in a row, then rest",
          setOf: (a, n) => `Set ${a} of ${n}`,
          setsDone: "All sets entered",
          enter: "Do the set, enter your reps, tap ✓ – the set rest starts.",
          enterTime: "▶ runs all sets: hold, rest, next set – with gong, like rounds. The seconds are filled in; you can change them.",
          rest: "Set rest 1:00",
          setTimer: (n) => `Set ${n} with timer`,
          rounds: "Rounds",
          roundsOpen: "Open round timer",
          roundsOf: (a, n) => `${a} of ${n} rounds done`,
          start: "Start",
          step: (a, n) => `${a}/${n}`,
          prev: "Previous exercise",
          skip: "Next exercise",
          finishEarly: "Finish early",
          choose: "Duration",
          setDone: "Set done",
          soundT: "Sound on?",
          sound: "Left switch on your iPhone to ring (no orange stripe), volume up. No switch: turn off Silent Mode (bell) in Control Centre.",
          soundOk: "Sound is on",
          soundAndroid:
            "Press a volume key and turn up the media slider (music note) – it is separate from the ringtone.",
          tenLeft: "10 seconds left",
          lapRest: "Rest",
          lapRestHint: "Breathe, drink – the next lap is coming.",
          enterFirst: "Please enter your reps first.",
          enterSay: "enter your reps",
          skippedOpen: "Skipped – the set stays open.",
          mine: "your numbers – B enters nothing",
        };
  /* iPhone/iPad: the side switch (or silent mode on newer models) mutes gong and calls */
  /* Android: no mute switch, but media volume is separate from the ringer volume */
  const isAndroid = () => typeof navigator !== "undefined" && /android/i.test(navigator.userAgent || "");
  const soundHintHtml = (P) =>
    (isIOS() || isAndroid()) && !S.profile.soundHintSeen
      ? `<div class="note psound"><b>🔔 ${P.soundT}</b><div>${isIOS() ? P.sound : P.soundAndroid}</div><button type="button" class="btn ghost" data-player="soundok">${P.soundOk}</button></div>`
      : "";
  const strItem = (b, it) => EX[it.id]?.cat === "str" && !["warm", "cool"].includes(b.key);
  /* circuits run lap by lap (warm-up and cool-down never are circuits) */
  const playerCirc = (b) => isCirc(b) && !["warm", "cool"].includes(b.key) && !b.rounds;
  function playerSteps(sess) {
    const steps = [];
    sess.blocks.forEach((b, bi) => {
      if (b.rounds) return steps.push({ kind: "rounds", bi });
      const circ = playerCirc(b),
        laps = circ ? blockSets(b) : 1;
      for (let lap = 0; lap < laps; lap++) {
        b.items.forEach((it, ni) => {
          const timing = exerciseTiming(sess, bi, ni, undefined, circ ? lap : 0);
          steps.push({
            bi,
            ni,
            lap: circ ? lap : null,
            laps: circ ? laps : null,
            kind: strItem(b, it) ? "sets" : timing ? "timed" : "manual",
          });
        });
        // circuit: rest between laps
        if (circ && lap < laps - 1) steps.push({ bi, lap, laps, kind: "rest" });
      }
    });
    steps.push({ kind: "finish", bi: sess.blocks.length });
    return steps;
  }
  const LAP_REST = 90;
  const lapRest = sess => sess?.lapRest || LAP_REST;
  const setRest = sess => sess?.setRest || 60;
  function stepDone(sess, st) {
    if (!st || st.kind === "finish") return false;
    if (st.kind === "rest") return !!sess.flow?.rests?.[`${st.bi}.${st.lap}`];
    const b = sess.blocks[st.bi];
    if (st.kind === "rounds") return b.items.every((it, ni) => itemDone(sess, st.bi, ni));
    const key = `${st.bi}.${st.ni}`;
    if (st.lap == null) return itemDone(sess, st.bi, st.ni);
    if (st.kind === "sets") {
      const r = sess.perf?.[key]?.[st.lap];
      return !!r && r.r != null && r.r !== "";
    }
    return itemDone(sess, st.bi, st.ni) || lapIsDone(sess, key, st.lap);
  }
  const playerStep = () => {
    const sess = S.sessions[ui.sel];
    return sess && ui.workout?.player ? playerSteps(sess)[ui.workout.step] : null;
  };
  function stepTitle(sess, st) {
    if (!st) return "";
    if (st.kind === "rest") return playerText().lapRest;
    if (st.kind === "finish") return workoutText().finish;
    if (st.kind === "rounds") return blkName(sess.blocks[st.bi]);
    return itemTitle(sess, st.bi, st.ni);
  }
  /* dose line as in the plan (target for strength, otherwise the prescription) */
  function stepDose(sess, st) {
    const b = sess.blocks[st.bi],
      it = b.items[st.ni];
    if (!it || it.kind === "round") return "";
    if (it.kind === "hard" || it.kind === "run" || it.kind === "exam") return "";
    return it.target ? targetText(it.target, it.id) : doseTxt(it.id, b) || "";
  }
  function stepDesc(sess, st) {
    const it = sess.blocks[st.bi].items[st.ni];
    if (!it) return "";
    if (it.kind === "hard") return hardTxt(it.id, it.h)[1];
    if (it.kind === "run") return it.zone === 3 ? t("z3d") : t("z2d");
    if (EX[it.id]) return exText(it.id).desc;
    return "";
  }
  function playerGo(i, opt = {}) {
    const sess = S.sessions[ui.sel];
    if (!sess || !ui.workout) return;
    const steps = playerSteps(sess);
    i = Math.max(0, Math.min(steps.length - 1, i));
    // switching between overview and flow keeps running timers (set rest, exercise, rounds) untouched
    if (!opt.keepTimers) {
      pauseWorkoutTimers();
      // a paused set rest keeps its remaining time while paging forward/back; it comes back when its step is shown again
      const old = ui.exerciseTimer;
      if (old && !old.running && !old.done && old.restOnly && old.player != null && old.player !== i && old.ds === ui.sel && old.remainingMs > 0)
        (ui.pausedRests ||= {})[old.player] = old;
      if (old && !old.running) ui.exerciseTimer = null;
    }
    readFinishDraft();
    const st = steps[i];
    const kept = ui.pausedRests?.[i];
    if (kept) delete ui.pausedRests[i];
    if (kept && !opt.keepTimers && kept.ds === ui.sel && !ui.exerciseTimer && !kept.done) ui.exerciseTimer = kept;
    ui.workout.step = i;
    ui.workout.block = st.bi;
    ui.workout.list = false;
    sess.flow = { ...(sess.flow || {}), block: st.bi, step: i };
    ui.focus = st.kind === "rounds";
    store.save();
    resumeSave(true);
    render();
    const el = document.getElementById("workout");
    if (el) el.scrollTop = 0;
    if ((st.kind === "timed" || st.kind === "rest") && opt.auto) playerStartTimed();
    else if (opt.auto && timedSets(st, sess)) playerStartSets();
    else if (opt.auto && st.kind === "sets")
      say(`${playerText().nextSay}: ${stepTitle(sess, st)}. ${playerText().enterSay}`, 0.95);
    else if (opt.auto && st.kind !== "finish" && st.kind !== "rounds")
      say(`${playerText().nextSay}: ${stepTitle(sess, st)}`, 0.95);
  }
  function playerStartTimed(choice) {
    const sess = S.sessions[ui.sel],
      st = playerStep();
    if (!sess || !st || (st.kind !== "timed" && st.kind !== "rest")) return;
    if (st.kind === "rest") {
      pauseOtherTimer("exercise");
      if (ui.exerciseTimer?.running) pauseExerciseTimer();
      ui.exerciseTimer = {
        ds: ui.sel,
        key: `${st.bi}.lap${st.lap}`,
        bi: st.bi,
        ni: -1,
        phases: [{ seconds: lapRest(sess), label: workoutText().rest }],
        index: 0,
        restOnly: true,
        running: true,
        done: false,
        player: ui.workout.step,
        remainingMs: lapRest(sess) * 1000,
        endAt: Date.now() + lapRest(sess) * 1000,
      };
      (sess.flow.rests ||= {})[`${st.bi}.${st.lap}`] = true;
      ui.workout.auto = true;
      store.save();
      syncTimers();
      renderWorkout();
      return;
    }
    const plan = exerciseTiming(sess, st.bi, st.ni, choice, st.lap || 0);
    if (!plan) return;
    pauseOtherTimer("exercise");
    if (ui.exerciseTimer?.running) pauseExerciseTimer();
    const P = playerText(),
      phases = [{ seconds: PREP_S, label: P.ready, prep: true }, ...plan.phases];
    ui.exerciseTimer = {
      ds: ui.sel,
      key: `${st.bi}.${st.ni}`,
      bi: st.bi,
      ni: st.ni,
      phases,
      index: 0,
      lap: st.lap,
      seconds: plan.seconds,
      setIndex: plan.setIndex,
      tracked: plan.tracked,
      restOnly: false,
      running: true,
      done: false,
      player: ui.workout.step,
      remainingMs: PREP_S * 1000,
      endAt: Date.now() + PREP_S * 1000,
    };
    ui.workout.auto = true;
    // announce what comes, while there are 10 seconds to get into position
    const dose = stepDose(sess, st);
    say(`${stepTitle(sess, st)}${dose ? ". " + dose.replace(/ · /g, ", ") : ""}`, 0.95);
    syncTimers();
    renderWorkout();
  }
  /* timed strength (plank & co.): get ready → set → rest → set …, like rounds; values fill in set by set */
  const timedSets = (st, sess) => st?.kind === "sets" && TIMED.has(sess.blocks[st.bi].items[st.ni].id);
  function playerStartSets() {
    const sess = S.sessions[ui.sel],
      st = playerStep();
    if (!sess || !timedSets(st, sess)) return;
    const b = sess.blocks[st.bi],
      key = `${st.bi}.${st.ni}`,
      plan = exerciseTiming(sess, st.bi, st.ni, undefined, st.lap || 0),
      rows = perfRows(sess, key, b);
    if (!plan) return;
    const open = (i) => rows[i] && (rows[i].r == null || rows[i].r === ""),
      todo = st.lap != null ? (open(st.lap) ? [st.lap] : []) : rows.map((r, i) => i).filter(open);
    if (!todo.length) return playerGo(ui.workout.step + 1, { auto: true });
    const P = playerText(),
      W = workoutText(),
      phases = [{ seconds: PREP_S, label: P.ready, prep: true }];
    const leg = DOSE_LEG.has(EX[b.items[st.ni].id]?.key),
      LR = legLabels();
    todo.forEach((i, k) => {
      if (leg) {
        phases.push({ seconds: plan.seconds, label: `${W.set} ${i + 1}/${rows.length} · ${LR[0]}`, set: i, leg: "rL" });
        phases.push({ seconds: 5, label: W.change });
        phases.push({ seconds: plan.seconds, label: `${W.set} ${i + 1}/${rows.length} · ${LR[1]}`, set: i, leg: "rR" });
      } else phases.push({ seconds: plan.seconds, label: `${W.set} ${i + 1}/${rows.length}`, set: i });
      if (k < todo.length - 1) phases.push({ seconds: setRest(sess), label: W.rest });
    });
    pauseOtherTimer("exercise");
    if (ui.exerciseTimer?.running) pauseExerciseTimer();
    ui.exerciseTimer = {
      ds: ui.sel,
      key,
      bi: st.bi,
      ni: st.ni,
      phases,
      index: 0,
      seconds: plan.seconds,
      chainSets: true,
      tracked: false,
      restOnly: false,
      running: true,
      done: false,
      player: ui.workout.step,
      remainingMs: PREP_S * 1000,
      endAt: Date.now() + PREP_S * 1000,
    };
    ui.workout.auto = true;
    say(`${stepTitle(sess, st)}. ${todo.length} × ${plan.seconds} ${S.profile.lang === "de" ? "Sekunden" : "seconds"}`, 0.95);
    syncTimers();
    renderWorkout();
  }
  /* called by the exercise clock: announce the next step 10 s before the end, move on after the gong */
  function playerTimerTick(tm, finished) {
    if (tm.player == null || !ui.workout?.player || ui.workout.step !== tm.player) return;
    const sess = S.sessions[tm.ds];
    if (!sess) return;
    if (finished) {
      if (!tm.stay) setTimeout(() => ui.workout?.step === tm.player && playerGo(tm.player + 1, { auto: true }), 1200);
      return;
    }
    // 10 seconds before a phase ends: short beep and a call –
    // in a rest/change: what comes next; in work: "10 seconds left" (and, at the very end, the next exercise)
    const ph = tm.phases[tm.index];
    if (!tm.running || !ph || ph.prep || tm.remainingMs > 10000 || tm.remainingMs <= 8000) return;
    tm.warned ||= {};
    if (tm.warned[tm.index]) return;
    tm.warned[tm.index] = true;
    const P = playerText(),
      last = tm.index === tm.phases.length - 1,
      nextPh = tm.phases[tm.index + 1],
      nx = playerSteps(sess)[tm.player + 1],
      isRest = /Pause|Rest|Wechsel|Change/.test(ph.label || ""),
      nextName =
        tm.nextLabel || (last ? (nx && nx.kind !== "finish" ? stepTitle(sess, nx) : "") : nextPh?.label || "");
    if (ph.seconds < 20 && !last) return; // short intervals: the gong is enough
    beep(660, 0.12, 1);
    if (isRest) say(`${P.tenLeft}. ${P.nextSay}: ${nextName}`, 0.95);
    else say(`${P.tenLeft}${last && nextName ? `. ${P.nextSay}: ${nextName}` : ""}`, 0.95);
  }
  function playerDone() {
    const sess = S.sessions[ui.sel],
      st = playerStep();
    if (!sess || !st) return;
    const key = `${st.bi}.${st.ni}`;
    if (st.kind === "manual" || st.kind === "timed") {
      if (st.lap != null) markLap(sess, key, st.lap, st.laps);
      else (sess.checked ||= {})[key] = true;
      store.save();
    }
    playerGo(ui.workout.step + 1, { auto: true });
  }
  function playerAction(a, ds = {}) {
    if (!ui.workout) return;
    const st = playerStep();
    if (a === "list") {
      ui.workout.list = true;
      ui.focus = false;
      return render();
    }
    if (a === "flow") return playerGo(ui.workout.step, { keepTimers: true });
    if (a === "prev") return playerGo(ui.workout.step - 1);
    if (a === "next") {
      const sess = S.sessions[ui.sel];
      if (st?.kind === "sets" && !stepDone(sess, st)) toast(playerText().skippedOpen);
      return playerGo(ui.workout.step + 1, { auto: st?.kind === "sets" && stepDone(sess, st) });
    }
    if (a === "done") return playerDone();
    if (a === "soundok") {
      S.profile.soundHintSeen = true;
      store.save();
      return renderWorkout();
    }
    if (a === "setdone") {
      const sess = S.sessions[ui.sel],
        key = `${st.bi}.${st.ni}`,
        rows = perfRows(sess, key, sess.blocks[st.bi]),
        filled = (r) => r && r.r != null && r.r !== "",
        ask = (k) => {
          const row = rows[k] || {};
          document
            .querySelector(
              `[data-k="${key}"][data-i="${k}"][data-f="r"], [data-k="${key}"][data-i="${k}"][data-f="${row.rL == null ? "rL" : "rR"}"]`,
            )
            ?.focus();
          document.querySelectorAll(`#workout [data-k="${key}"][data-i="${k}"]`).forEach((el) => {
            el.classList.remove("shake");
            void el.offsetWidth;
            el.classList.add("need", "shake");
          });
          toast(playerText().enterFirst);
        };
      // values are entered by hand; an empty set is never filled in automatically
      if (st.lap != null) return filled(rows[st.lap]) ? playerGo(ui.workout.step + 1, { auto: true }) : ask(st.lap);
      if (!rows.some(filled)) return ask(0);
      const open = rows.findIndex((r) => !filled(r));
      if (open < 0) return playerGo(ui.workout.step + 1, { auto: true });
      // a set is done and more are open: set rest with gong, the next field is ready
      exerciseTimerAction("rest", { key });
      // the set rest also gets the 10-second call, but stays on this exercise when it ends
      if (ui.exerciseTimer?.restOnly)
        Object.assign(ui.exerciseTimer, { player: ui.workout.step, stay: true, nextLabel: `${workoutText().set} ${open + 1}` });
      document
        .querySelector(`[data-k="${key}"][data-i="${open}"][data-f="r"], [data-k="${key}"][data-i="${open}"][data-f="rL"]`)
        ?.focus({ preventScroll: true });
      return;
    }
    if (a === "early") return playerGo(playerSteps(S.sessions[ui.sel]).length - 1);
    if (a === "toggle") {
      const tm = ui.exerciseTimer;
      if (!tm || tm.player !== ui.workout.step || tm.done)
        return timedSets(st, S.sessions[ui.sel]) ? playerStartSets() : playerStartTimed(+ds.seconds || undefined);
      return exerciseTimerAction("toggle");
    }
  }
  function playerRing(tm, st, small, idle = 0) {
    const C = 2 * Math.PI * 130,
      active = tm && tm.player === ui.workout.step && !(st && st.kind !== "rest" && tm.ni === -1),
      restHere = tm && tm.restOnly && st && tm.key === `${st.bi}.${st.ni}`,
      setHere = tm && tm.tracked && st && tm.key === `${st.bi}.${st.ni}`,
      show = active || restHere || setHere;
    const label = show ? (tm.done ? workoutText().done : tm.phases[tm.index]?.label || "") : "",
      secs = show ? Math.ceil((tm.remainingMs || 0) / 1000) : idle;
    return `<div class="fring${small ? " small" : ""}"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle id="parc" class="arc" cx="140" cy="140" r="130" fill="none" stroke="var(--tc)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/></svg><div class="mid"><span class="ph" id="exercisePhase">${esc(label)}</span><span class="clk" id="exerciseClock">${fmt(secs)}</span></div></div>`;
  }
  function playerSetsHtml(sess, st) {
    const b = sess.blocks[st.bi],
      it = b.items[st.ni],
      key = `${st.bi}.${st.ni}`,
      P = playerText(),
      timed = TIMED.has(it.id),
      kg = hasKg(it.id);
    let h = `<p class="sub">${timed ? P.enterTime : P.enter}</p>`;
    if (st.lap == null) h += setsHtml(sess, st.bi, st.ni, b, it.id, false);
    else {
      // circuit: only this lap's set
      const rows = perfRows(sess, key, b),
        r = rows[st.lap] || {},
        ph = it.target ? it.target.r : ((b.sets || "").match(/(\d+)[–-](\d+)/) || [, "10"])[1];
      const leg = DOSE_LEG.has(EX[it.id]?.key),
        LR = legLabels(),
        goal = `${S.profile.lang === "de" ? "Ziel" : "Goal"} ${ph}`;
      h += `<div class="sets lap${leg ? " leg" : ""} ${kg ? "" : "nokg"}"><span></span><span class="hd">${leg ? LR[0] + " · " : ""}${timed ? t("secs") : t("reps")}</span>${leg ? `<span class="hd">${LR[1]}</span>` : ""}${kg ? `<span class="hd">${t("kg")}</span>` : ""}<span class="sl${r.r != null ? " ok" : ""}" data-sl="${key}.${st.lap}">${t("setL")} ${st.lap + 1}</span>${leg ? legInputs(key, st.lap, r, goal, timed) : `<input class="si${r.r != null ? " ok" : ""}" type="text" inputmode="numeric" data-k="${key}" data-i="${st.lap}" data-f="r" value="${r.r ?? ""}" placeholder="${goal}" aria-label="${t("setL")} ${st.lap + 1}">`}${kg ? `<input class="si" type="text" inputmode="decimal" data-k="${key}" data-i="${st.lap}" data-f="kg" value="${r.kg ?? ""}" placeholder="kg" aria-label="${t("setL")} ${st.lap + 1} kg">` : ""}</div>`;
    }
    if (timed) return h;
    const plan = exerciseTiming(sess, st.bi, st.ni, undefined, st.lap || 0);
    h += `<div class="minirow player-tools">`;
    if (plan && plan.tracked) {
      const rows = perfRows(sess, key, b),
        nextSet = st.lap != null ? st.lap : Math.max(0, rows.findIndex((r) => r.r == null));
      h += `<button type="button" class="btn sec" data-exercise-timer="start" data-key="${key}" data-set-index="${nextSet}">${P.setTimer(nextSet + 1)}</button>`;
    }
    if (st.lap == null) h += `<button type="button" class="btn ghost" data-exercise-timer="rest" data-key="${key}">${S.profile.lang === "de" ? "Satzpause" : "Set rest"} ${fmt(setRest(sess))}</button>`;
    return h + `</div>`;
  }
  function playerHtml() {
    const sess = S.sessions[ui.sel],
      steps = playerSteps(sess),
      i = Math.max(0, Math.min(steps.length - 1, ui.workout.step || 0)),
      st = steps[i],
      P = playerText(),
      W = workoutText(),
      tm = ui.exerciseTimer,
      nx = steps[i + 1];
    const doneN = steps.filter((s) => stepDone(sess, s)).length,
      head = `<div class="fbar"><button type="button" class="x" data-workout="close" aria-label="${W.close}">✕</button><span>${esc(st.kind === "finish" ? W.finish : blkName(sess.blocks[st.bi]))} · ${P.step(i + 1, steps.length)}</span><button type="button" class="x" data-player="list" aria-label="${P.list}">☰</button></div><div class="pbar"><span style="width:${Math.round((100 * doneN) / Math.max(1, steps.length - 1))}%"></span></div>`;
    if (st.kind === "finish")
      return `<div class="player-inner">${head}${finishFormHtml(sess)}<button type="button" class="btn sec" data-player="prev">${W.back}</button></div>`;
    const b = sess.blocks[st.bi],
      done = stepDone(sess, st);
    let h = head + soundHintHtml(P);
    if (st.kind === "rest") {
      h += playerRing(tm, st, false, lapRest(sess));
      h += `<div class="pcard"><small>${esc(P.lap(st.lap + 1, st.laps))}</small><b>${P.lapRest}</b><p>${P.lapRestHint}</p></div>`;
    } else if (st.kind === "rounds") {
      const n = b.items.filter((it, ni) => itemDone(sess, st.bi, ni)).length;
      h += `<div class="pcard"><small>${P.rounds}</small><b>${esc(blkName(b))}</b><p>${P.roundsOf(n, b.items.length)}</p></div><button type="button" class="btn" data-fx="open">${P.roundsOpen}</button>`;
    } else {
      const it = b.items[st.ni],
        dose = stepDose(sess, st),
        desc = stepDesc(sess, st),
        sk = it && EX[it.id] && hasSketch(it.id) && st.kind !== "sets";
      const timerHere = tm && !tm.done && tm.key === `${st.bi}.${st.ni}` && (tm.restOnly || tm.tracked);
      // idle ring shows the time of the first work phase instead of 0:00
      const idlePlan = st.kind === "timed" || timedSets(st, sess) ? exerciseTiming(sess, st.bi, st.ni, undefined, st.lap || 0) : null,
        idle = idlePlan ? (timedSets(st, sess) ? idlePlan.seconds : idlePlan.phases[0].seconds) || 0 : 0;
      if (st.kind === "timed" || timedSets(st, sess)) h += playerRing(tm, st, false, idle);
      else if (st.kind === "sets" && timerHere)
        // set rest: its own pause/resume button (the big button is ✓ for the next set)
        h +=
          playerRing(tm, st, true) +
          `<button type="button" class="btn ghost prest" data-exercise-timer="toggle" id="exerciseToggle">${tm.running ? workoutText().pause : workoutText().continue}</button>`;
      let small = st.lap != null ? P.lap(st.lap + 1, st.laps) : "";
      // training as a pair: the big card shows both – A left, B right – each with picture, dose and text
      if (st.lap != null && isDuo(sess, b)) {
        const bk = (st.ni + duoOff(sess, b).off) % b.items.length,
          side = (who, ni) => {
            const s2 = { ...st, ni },
              x = b.items[ni],
              d2 = stepDose(sess, s2),
              t2 = stepDesc(sess, s2),
              sk2 = x && EX[x.id] && hasSketch(x.id);
            return `<div class="pdc ${who}"><span class="pdw">${who.toUpperCase()}</span>${sk2 ? `<div class="fsk">${sketchSvg(EX[x.id].key, true)}</div>` : ""}<b>${esc(itemTitle(sess, st.bi, ni))}${who === "a" && done ? " ✓" : ""}</b>${d2 ? `<span class="dose">${esc(d2)}</span>` : ""}${t2 ? `<p>${esc(t2)}</p>` : ""}</div>`;
          };
        h += `<div class="pcard${done ? " done" : ""}">${small ? `<small>${esc(small)}</small>` : ""}<div class="pduo">${side("a", st.ni)}${side("b", bk)}</div></div>`;
      } else {
      h += `<div class="pcard${done ? " done" : ""}">${sk ? `<div class="fsk">${sketchSvg(EX[it.id].key, true)}</div>` : ""}${small ? `<small>${esc(small)}</small>` : ""}<b>${esc(stepTitle(sess, st))}${done ? " ✓" : ""}</b>${dose ? `<span class="dose">${esc(dose)}</span>` : ""}${desc ? `<p>${esc(desc)}</p>` : ""}`;
      if (st.lap != null)
        h += `<ol class="plap">${b.items.map((x, k) => `<li class="${k === st.ni ? "on" : ""}">${esc(itemTitle(sess, st.bi, k))}</li>`).join("")}</ol>`;
      h += `</div>`;
      }
      if (st.kind === "timed") {
        const plan = exerciseTiming(sess, st.bi, st.ni, undefined, st.lap || 0),
          running = tm && tm.player === i && !tm.done;
        if (plan && plan.choices.length > 1 && !running)
          h += `<div class="minirow player-tools"><span class="sub">${P.choose}:</span>${plan.choices.map((n) => `<button type="button" class="btn ghost" data-player="toggle" data-seconds="${n}">${n} s</button>`).join("")}</div>`;
      }
      // as a pair the entries are A's – the person whose phone it is
      if (st.kind === "sets")
        h += (st.lap != null && isDuo(sess, b) ? `<div class="pmine"><span class="lg a">A</span> ${esc(P.mine)}</div>` : "") + playerSetsHtml(sess, st);
    }
    // as a pair inside a circuit: what comes next for A and for B
    const nxB =
      nx && nx.lap != null && nx.ni != null && isDuo(sess, sess.blocks[nx.bi])
        ? itemTitle(sess, nx.bi, (nx.ni + duoOff(sess, sess.blocks[nx.bi]).off) % sess.blocks[nx.bi].items.length)
        : "";
    h += `<div class="fnext">${nx ? (nx.kind === "finish" ? P.last : nxB ? `${P.next}: <span class="lg a">A</span> <b>${esc(stepTitle(sess, nx))}</b> · <span class="lg b">B</span> <b>${esc(nxB)}</b>` : `${P.next}: <b>${esc(stepTitle(sess, nx))}</b>`) : ""}</div>`;
    // controls: previous · main · next
    let main;
    if (st.kind === "timed" || st.kind === "rest" || timedSets(st, sess)) {
      const running = tm && tm.player === i && tm.running;
      main = `<button type="button" class="m" data-player="toggle" id="pgo" aria-label="${running ? W.pause : P.start}">${running ? ICO.pause : PLAY}</button>`;
    } else if (st.kind === "manual")
      main = `<button type="button" class="m" data-player="done" aria-label="${P.done}">${TICK}</button>`;
    else if (st.kind === "sets")
      main = `<button type="button" class="m" data-player="setdone" aria-label="${P.setDone}">${TICK}</button>`;
    else main = `<button type="button" class="m" data-player="next" aria-label="${P.skip}">${ICO.next}</button>`;
    h += `<div class="fctl"><button type="button" class="s" data-player="prev" aria-label="${P.prev}" ${i ? "" : "disabled"}>${ICO.prev}</button>${main}<button type="button" class="s" data-player="next" aria-label="${P.skip}">${ICO.next}</button></div>`;
    h += `<button type="button" class="btn ghost player-early" data-player="early">${P.finishEarly}</button>`;
    return `<div class="player-inner">${h}</div>`;
  }
  function workoutHtml() {
    if (!ui.workout) return "";
    if (ui.workout.player && !ui.workout.list) return playerHtml();
    const sess = S.sessions[ui.sel],
      bi = ui.workout.block,
      b = sess.blocks[bi],
      W = workoutText();
    let h = `<div class="workout-inner"><div class="fbar"><button type="button" class="x" data-workout="close" aria-label="${W.close}">✕</button><span>${esc(t("types")[sess.type])}</span><span>${bi + 1}/${sess.blocks.length + 1}</span></div>${ui.workout.player ? `<button type="button" class="btn" data-player="flow">${playerText().player}</button>` : ""}<h1 id="workoutTitle" tabindex="-1">${b ? blkName(b) : W.finish}</h1>`;
    h += `<ol class="workout-steps" aria-label="${S.profile.lang === "de" ? "Trainingsabschnitte" : "Training sections"}">${sess.blocks.map((block, i) => `<li ${i === bi ? 'aria-current="step"' : ""}>${esc(blkName(block))}</li>`).join("")}<li ${!b ? 'aria-current="step"' : ""}>${W.finish}</li></ol>`;
    if (b) {
      h += `<p id="workoutProgress" class="sub" aria-live="polite"></p>`;
      if (b.rounds)
        h += `<p class="sub" id="workoutRoundStatus"></p><button type="button" class="btn" data-fx="open">${W.rounds}</button>`;
      h += sessionBlockHtml(sess, bi, false);
      h += `<p id="workoutOpen" class="sub"></p><button type="button" class="btn" data-workout="next">${esc(workoutNextLabel())}</button><div class="minirow workout-nav">${bi ? `<button type="button" class="btn ghost" data-workout="back">${W.back}</button>` : ""}<button type="button" class="btn ghost" data-workout="finish">${S.profile.lang === "de" ? "Vorzeitig abschließen" : "Finish early"}</button></div>`;
    } else {
      h += finishFormHtml(sess) + `<button type="button" class="btn sec" data-workout="back">${W.back}</button>`;
    }
    return h + `<p class="sub">${W.saved}</p></div>`;
  }
  function renderWorkout() {
    const el = document.getElementById("workout");
    if (!el) return;
    el.hidden = !ui.workout;
    document.body?.classList.toggle("training-open", !!ui.workout);
    if (!ui.workout) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = workoutHtml();
    el.classList.toggle("player", !!(ui.workout.player && !ui.workout.list));
    if (ui.workout.player) {
      const sess = S.sessions[ui.sel];
      el.style.setProperty("--tc", `var(--c-${sess?.type || "T"})`);
    }
    updateWorkoutProgress();
    updateExerciseTimerUI();
    updateWorkoutRoundStatus();
    markNeedInputs();
  }
  /* In a set step the fields of the next open set glow until something is entered – after a timer it is
     otherwise easy to miss that this exercise needs an entry */
  function openSetIndex(sess, st) {
    const rows = perfRows(sess, `${st.bi}.${st.ni}`, sess.blocks[st.bi]),
      filled = (r) => r && r.r != null && r.r !== "";
    return st.lap != null ? (filled(rows[st.lap]) ? -1 : st.lap) : rows.findIndex((r) => !filled(r));
  }
  function markNeedInputs() {
    if (!ui.workout?.player || ui.workout.list) return;
    const st = playerStep(),
      sess = S.sessions[ui.sel];
    if (!st || st.kind !== "sets" || !sess) return;
    const i = openSetIndex(sess, st);
    if (i < 0) return;
    document
      .querySelectorAll(`#workout [data-k="${st.bi}.${st.ni}"][data-i="${i}"]`)
      .forEach((el) => el.classList.add("need"));
  }
  // Structured phase plans use the same prescription as the visible exercise dose.
  // Work and rests stay distinct; per-side holds include an explicit changeover.
  /* turns a phase of a prescription (role + counters from core/prescription.js) into the text the person sees */
  function rxLabel(p, rx, W) {
    const de = S.profile.lang === "de",
      cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
    switch (p.role) {
      case "change":
        return W.change;
      case "run":
        return W.run;
      case "side":
        return `${W.side} ${p.side}/${p.sides}`;
      case "set":
        return `${W.set} ${p.i}/${p.n}`;
      case "sideset":
        return `${W.side} ${p.side}/2 · ${W.set} ${p.set}/${p.sets}`;
      case "dir":
        return `${de ? "Richtung" : "Direction"} ${p.i}/${p.n}${p.name ? " · " + p.name[de ? 0 : 1] : ""}`;
      case "grip":
        return `${W.work} ${p.i}/${p.n} · ${W.lap} ${p.round}/${p.rounds}`;
      case "spread":
        return de ? "Finger spreizen" : "Spread fingers";
      case "fast":
        return `${cap(rx.onW[de ? 0 : 1])} ${p.i}/${p.n}`;
      case "easy":
        return cap(rx.offW[de ? 0 : 1]);
      default: {
        let l = p.role === "work" ? `${W.work} ${p.i}/${p.n}` : W.rest;
        if (p.side) l = `${W.side} ${p.side} · ${l}`;
        if (p.passes > 1) l = `${W.lap} ${p.pass}/${p.passes} · ${l}`;
        return l;
      }
    }
  }
  /* a prescription in repetitions (e.g. "10 reps" for burpees) is confirmed with ✓ – no work timer replaces it */
  const repDose = (id, b) => {
    const d = doseTxt(id, b) || "";
    return /Wdh\.|\breps\b/.test(d) && !/\d\s*(s|Sek|Min\.|min)\b/.test(d);
  };
  function exerciseTiming(sess, bi, ni, choice, setIndex) {
    const b = sess.blocks[bi],
      it = b.items[ni],
      name = EX[it.id]?.key,
      W = workoutText();
    if (b.rounds) return null;
    if (DOSE_LEG.has(name)) W.side = S.profile.lang === "de" ? "Bein" : "Leg";
    const phase = (seconds, label = W.run) => ({ seconds, label }),
      interval = (n, on, off) =>
        Array.from({ length: n }, (_, i) => [
          phase(on, `${W.work} ${i + 1}/${n}`),
          ...(off ? [phase(off, W.rest)] : []),
        ]).flat();
    let phases = [],
      choices = [],
      seconds = 0,
      sides = 1;
    const tracked = EX[it.id]?.cat === "str" && !["warm", "cool"].includes(b.key) && tracksSets(it.id);
    // every prescription (core/prescription.js) gives text, phases and time from the same numbers
    const fromRx = (rx, o = {}) => {
      const r = rxPlan(rx, { choice, ...o });
      phases = r.phases.map((p) => ({ seconds: p.seconds, label: rxLabel(p, rx, W) }));
      choices = r.choices;
      seconds = r.seconds;
      sides = r.sides;
    };
    if (it.kind === "hard") {
      const rx = rxOf(it.id, it.h);
      if (rx) fromRx(rx);
    } else if (it.kind === "run")
      phases = it.zone === 3 ? interval(it.reps, it.on * 60, it.off * 60) : [phase(it.min * 60, t("run"))];
    else if (b.key === "warm" && name && EX[it.id]?.cat !== "pre")
      seconds = Math.max(2, Math.round(b.min / Math.max(1, b.items.length))) * 60;
    else if (tracked && name === "str.neck_iso_hold") fromRx(RX[name], { seconds: it.target?.r || 10 });
    else if (TIMED.has(it.id) && tracked) {
      choices = it.target
        ? [it.target.r]
        : [
            [20, 30],
            [30, 45],
            [45, 60],
          ][doseLevel(b)] || [30, 45];
      seconds = choices.includes(choice) ? choice : choices[0];
      sides = DOSE_SIDE.has(name) || DOSE_LEG.has(name) ? 2 : 1;
    } else {
      const rx = RX[name];
      if (rx) fromRx(rx);
      else if (EX[it.id]?.cat === "cond" && !DOSE_FIX[name] && !repDose(it.id, b)) {
        phases = interval(1, [30, 40, 45][doseLevel(b)], [30, 20, 15][doseLevel(b)]);
      } else if (["cool", "mob"].includes(b.key) && !DOSE_FIX[name]) {
        choices = b.key === "mob" ? [60, 90] : [45, 60];
        seconds = choices.includes(choice) ? choice : choices[0];
      } else if (b.key === "mob") {
        seconds = Math.max(2, Math.round(b.min / Math.max(1, b.items.length))) * 60;
      }
    }
    if (!phases.length && seconds)
      phases =
        sides === 2
          ? [phase(seconds, `${W.side} 1/2`), phase(5, W.change), phase(seconds, `${W.side} 2/2`)]
          : [phase(seconds)];
    if (!phases.length || phases.some((p) => !Number.isFinite(p.seconds) || p.seconds <= 0)) return null;
    return {
      phases,
      choices,
      seconds,
      tracked,
      setIndex: tracked ? Math.max(0, setIndex || 0) : null,
    };
  }
  function exerciseTimerHtml(sess, bi, ni) {
    const key = `${bi}.${ni}`,
      b = sess.blocks[bi],
      W = workoutText(),
      tm = ui.exerciseTimer;
    const plan = exerciseTiming(sess, bi, ni, undefined, 0),
      tracked = plan?.tracked;
    const active = tm?.ds === ui.sel && tm.key === key;
    if (!plan && !(EX[b.items[ni].id]?.cat === "str" && !["warm", "cool"].includes(b.key))) return "";
    let h = `<div class="exercise-timing" data-timing="${key}">`;
    if (isCirc(b) && !tracked)
      h += `<span class="sub" data-lap-progress="${key}">${W.lap}: ${sess.timedLaps?.[key] || 0}/${circN(b)}</span>`;
    if (plan) {
      if (plan.choices.length > 1)
        h += `<div class="sub">${W.choose}: ${plan.choices.map((n) => `<button type="button" class="btn ghost" data-exercise-timer="start" ${active && tm.running ? "disabled" : ""} data-key="${key}" data-seconds="${n}">${n} s</button>`).join("")}</div>`;
      if (tracked) {
        const rows = perfRows(sess, key, b);
        h += rows
          .map(
            (r, i) =>
              `<button type="button" class="btn sec" data-exercise-timer="start" ${active && tm.running ? "disabled" : ""} data-key="${key}" data-set-index="${i}">${W.set} ${i + 1} · ${fmt(plan.seconds)} · ${W.timer}</button>`,
          )
          .join("");
      } else
        h += `<button type="button" class="btn sec" data-exercise-timer="start" ${active && tm.running ? "disabled" : ""} data-key="${key}">${W.timer} · ${fmt(plan.phases.reduce((n, p) => n + p.seconds, 0))}</button>`;
    }
    if (EX[b.items[ni].id]?.cat === "str" && !["warm", "cool"].includes(b.key))
      h += `<button type="button" class="btn ghost" data-exercise-timer="rest" data-key="${key}">${W.restStart} · 1:00</button>`;
    if (active)
      h += `<div class="exercise-countdown" role="timer"><span id="exercisePhase"></span><strong id="exerciseClock">${fmt(Math.ceil((tm.remainingMs ?? 0) / 1000))}</strong><div class="minirow"><button type="button" class="btn" data-exercise-timer="toggle" id="exerciseToggle"></button><button type="button" class="btn sec" data-exercise-timer="reset">${W.reset}</button></div></div>`;
    return h + "</div>";
  }
  function pauseExerciseTimer() {
    exerciseTick();
    const tm = ui.exerciseTimer;
    if (tm?.running) {
      tm.remainingMs = Math.max(0, tm.endAt - Date.now());
      tm.running = false;
    }
    cancelTimerSpeech();
    syncTimers();
    updateExerciseTimerUI();
  }
  function exerciseTimerAction(action, ds = {}) {
    if (!ui.workout) return;
    if (action === "toggle") {
      const tm = ui.exerciseTimer;
      if (!tm || tm.done) return;
      if (tm.running) return pauseExerciseTimer();
      pauseOtherTimer("exercise");
      tm.running = true;
      tm.endAt = Date.now() + tm.remainingMs;
      syncTimers();
      updateExerciseTimerUI();
      return;
    }
    if (action === "reset") {
      pauseExerciseTimer();
      ui.exerciseTimer = null;
      renderWorkout();
      return;
    }
    const sess = S.sessions[ui.sel],
      [bi, ni] = (ds.key || "").split(".").map(Number);
    if (!sess?.blocks[bi]?.items[ni] || bi !== ui.workout.block) return;
    const plan =
      action === "rest"
        ? {
            phases: [{ seconds: setRest(sess), label: workoutText().rest }],
            tracked: false,
          }
        : exerciseTiming(sess, bi, ni, +ds.seconds, +ds.setIndex);
    if (!plan) return;
    if (plan.tracked && (+ds.setIndex < 0 || +ds.setIndex >= perfRows(sess, ds.key, sess.blocks[bi]).length)) return;
    pauseOtherTimer("exercise");
    if (ui.exerciseTimer?.running) pauseExerciseTimer();
    ui.exerciseTimer = {
      ds: ui.sel,
      key: ds.key,
      bi,
      ni,
      phases: plan.phases,
      index: 0,
      seconds: plan.seconds,
      setIndex: plan.setIndex,
      tracked: plan.tracked,
      restOnly: action === "rest",
      running: true,
      done: false,
      remainingMs: plan.phases[0].seconds * 1000,
      endAt: Date.now() + plan.phases[0].seconds * 1000,
    };
    bell(1);
    syncTimers();
    renderWorkout();
    document.querySelector(`[data-timing="${ds.key}"]`)?.scrollIntoView({ block: "center", behavior: "auto" });
  }
  function completeExerciseTimer(tm) {
    if (tm.chainSets) return; // timed sets are written phase by phase (exerciseTick)
    const sess = S.sessions[tm.ds];
    if (!sess || tm.restOnly) return;
    const b = sess.blocks[tm.bi];
    if (!b?.items[tm.ni]) return;
    if (tm.tracked) {
      const rows = perfRows(sess, tm.key, b);
      if (rows[tm.setIndex] && rows[tm.setIndex].r == null) {
        rows[tm.setIndex].r = tm.seconds;
        // the single-set timer already covers both legs (side 1 / side 2)
        if (DOSE_LEG.has(EX[b.items[tm.ni].id]?.key)) rows[tm.setIndex].rL = rows[tm.setIndex].rR = tm.seconds;
      }
    } else {
      // the player knows which lap ran; the plain list timer completes the next open lap
      markLap(sess, tm.key, tm.lap, isCirc(b) ? circN(b) : 1);
    }
    store.save();
  }
  function exerciseTick() {
    const tm = ui.exerciseTimer;
    if (!tm?.running) return;
    const now = Date.now();
    let changed = false;
    while (tm.running && now >= tm.endAt) {
      const ended = tm.phases[tm.index];
      tm.index++;
      changed = true;
      if (tm.chainSets && ended && ended.set != null) {
        const sess = S.sessions[tm.ds],
          rows = sess?.perf?.[tm.key];
        const row = rows?.[ended.set];
        if (row && ended.leg) {
          if (row[ended.leg] == null || row[ended.leg] === "") row[ended.leg] = ended.seconds;
          legSync(row);
          store.save();
        } else if (row && (row.r == null || row.r === "")) {
          row.r = ended.seconds;
          store.save();
        }
      }
      if (tm.index >= tm.phases.length) {
        tm.done = true;
        tm.running = false;
        tm.remainingMs = 0;
        completeExerciseTimer(tm);
        if (now - tm.endAt < 1000) bell(3);
        releaseWake();
      } else {
        tm.endAt += tm.phases[tm.index].seconds * 1000;
        if (now < tm.endAt && now - (tm.endAt - tm.phases[tm.index].seconds * 1000) < 1000) bell(1);
      }
    }
    if (tm.running) tm.remainingMs = Math.max(0, tm.endAt - now);
    if (changed) resumeSave(true);
    playerTimerTick(tm, changed && tm.done);
    if (!timerVisible()) return;
    if (changed && ui.workout?.player && !ui.workout.list) renderWorkout();
    if (changed && ui.workout?.ds === tm.ds) {
      if (tm.done && tm.tracked) {
        const input = document.querySelector(`[data-k="${tm.key}"][data-i="${tm.setIndex}"][data-f="r"]`);
        if (input) {
          input.value = String(S.sessions[tm.ds].perf[tm.key][tm.setIndex].r);
          input.classList.add("ok");
        }
        document.querySelector(`[data-sl="${tm.key}.${tm.setIndex}"]`)?.classList.add("ok");
      }
      updateCompletionUI();
    }
    updateExerciseTimerUI();
  }
  function updateExerciseTimerUI() {
    const tm = ui.exerciseTimer;
    if (!tm || !ui.workout || ui.focus) return;
    if (tm.done && tm.tracked) {
      const input = document.querySelector(`[data-k="${tm.key}"][data-i="${tm.setIndex}"][data-f="r"]`),
        value = S.sessions[tm.ds]?.perf?.[tm.key]?.[tm.setIndex]?.r;
      if (input && value != null && document.activeElement !== input) {
        input.value = String(value);
        input.classList.add("ok");
      }
    }
    const block = S.sessions[tm.ds]?.blocks[tm.bi],
      lap = document.querySelector(`[data-lap-progress="${tm.key}"]`);
    if (lap && block)
      lap.textContent = `${workoutText().lap}: ${S.sessions[tm.ds].timedLaps?.[tm.key] || 0}/${circN(block)}`;
    const clock = document.getElementById("exerciseClock"),
      phase = document.getElementById("exercisePhase"),
      toggle = document.getElementById("exerciseToggle");
    if (clock) clock.textContent = fmt(Math.ceil((tm.remainingMs || 0) / 1000));
    if (phase) phase.textContent = tm.done ? workoutText().done : tm.phases[tm.index]?.label || "";
    if (toggle) {
      toggle.textContent = tm.running ? workoutText().pause : workoutText().continue;
      toggle.disabled = tm.done;
    }
    // player ring and colour: brass while getting ready, green in rests
    const arc = document.getElementById("parc");
    if (arc) {
      const ph = tm.phases[tm.index],
        len = (ph?.seconds || 1) * 1000,
        frac = tm.done ? 1 : 1 - (tm.remainingMs || 0) / len,
        C = 2 * Math.PI * 130;
      arc.setAttribute("stroke-dashoffset", (C * (1 - Math.max(0, Math.min(1, frac)))).toFixed(1));
      const w = document.getElementById("workout"),
        rest = ph && (ph.prep || /Pause|Rest|Wechsel|Change/.test(ph.label || ""));
      if (w) w.style.setProperty("--tc", ph?.prep ? "var(--ice)" : rest ? "var(--done)" : `var(--c-${S.sessions[tm.ds]?.type || "T"})`);
      const go = document.getElementById("pgo");
      if (go && tm.player === ui.workout?.step) {
        const st = tm.running ? "run" : "stop";
        if (go.dataset.state !== st) {
          go.innerHTML = tm.running ? ICO.pause : PLAY;
          go.dataset.state = st;
        }
      }
    }
  }
  function radar(cur, prev) {
    const cx = 110,
      cy = 104,
      R = 78,
      ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5,
      pt = (i, v) => [cx + (Math.cos(ang(i)) * R * v) / 5, cy + (Math.sin(ang(i)) * R * v) / 5];
    let s = `<svg viewBox="-34 0 288 214" role="img" aria-label="${t("testLast")}">`;
    for (let r = 1; r <= 5; r++)
      s += `<polygon points="${TCATS.map((_, i) => pt(i, r).join(",")).join(" ")}" fill="none" stroke="var(--line)" stroke-width="${r === 5 ? 1.4 : 1}"/>`;
    TCATS.forEach((k, i) => {
      const [x, y] = pt(i, 5);
      s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`;
      const [lx, ly] = pt(i, 6.15);
      s += `<text x="${lx}" y="${ly + 4}" font-size="10.5" font-family="DM Mono,monospace" text-anchor="middle" fill="var(--mist)">${t("cats")[k]}</text>`;
    });
    const poly = (sc, st) => `<polygon points="${TCATS.map((k, i) => pt(i, sc[k] || 0).join(",")).join(" ")}" ${st}/>`;
    if (prev) s += poly(prev.scores, 'fill="none" stroke="var(--mist)" stroke-width="1.4" stroke-dasharray="4 3"');
    s += poly(cur.scores, 'fill="var(--ice-dim)" fill-opacity=".85" stroke="var(--ice)" stroke-width="2"');
    TCATS.forEach((k, i) => {
      if (cur.scores[k]) {
        const [x, y] = pt(i, cur.scores[k]);
        s += `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--ember)"/>`;
      }
    });
    return s + `</svg>`;
  }
  /* belt exam view follows the main sport (7c-4): kickboxing = BFVKB programme, taekwondo = the grade area of the style,
     boxing has no belts (fitness test only) */
  const testViewNow = () => (mainSport() === "boxing" ? "fit" : ui.testView || (phaseInfo().phase === "grade" ? "exam" : "fit"));
  function renderTest() {
    const tv = testViewNow();
    let h = header(!ui.testOpen && tv === "exam" ? t("tview").exam : t("testTitle"));
    if (ui.testOpen) {
      const d = ui.testDraft,
        tsp = d.tsport || mainSport(),
        techOnly = tsp !== mainSport();
      h += `<div class="note">${t("testEvery")}</div><div class="panel">`;
      if (sportChoices().length > 1)
        h += `<div class="field"><span class="lab">${t("tecSportL")}</span><div class="seg">${sportChoices()
          .map((k) => `<button type="button" data-tsport="${k}" aria-pressed="${tsp === k}">${sportLabel(k)}</button>`)
          .join("")}</div>${techOnly ? `<span class="sub">${t("tecOnlyH")(sportLabel(tsp))}</span>` : ""}</div>`;
      if (!techOnly) {
      h += `<div class="field"><span class="lab">${t("cats").str}</span><span class="how">${t("tDesc").str}</span><div class="inline"><input id="tStr" type="number" inputmode="numeric" min="0" max="200" value="${d.str ?? ""}"><span class="u">${t("tUnit").str}</span></div></div>`;
      h += `<div class="field"><span class="lab">${t("cats").spd}</span><span class="how">${t("tDesc").spd}</span><div class="inline"><input id="tSpd" type="number" inputmode="numeric" min="0" max="100" value="${d.spd ?? ""}"><span class="u">${t("tUnit").spd}</span></div></div>`;
      h += `<div class="field"><span class="lab">${t("cats").end}</span><span class="how">${t("tDesc").end}</span><div class="inline"><input id="tEndM" type="number" inputmode="numeric" min="5" max="40" placeholder="12" value="${d.endM ?? ""}"><span class="u">:</span><input id="tEndS" type="number" inputmode="numeric" min="0" max="59" placeholder="30" value="${d.endS ?? ""}"><span class="u">${t("tUnit").end}</span></div></div>`;
      h += `<div class="field"><span class="lab">${t("cats").flx}</span><span class="how">${t("tDesc")[mainSport() === "boxing" ? "flxBox" : "flx"]}</span><div class="seg g5">${t(
        "flxOpt",
      )
        .map((x, i) => `<button type="button" data-tf="${i + 1}" aria-pressed="${d.flx === i + 1}">${x}</button>`)
        .join("")}</div></div>`;
      }
      h += `<div class="field"><span class="lab">${t("cats").tec}</span><span class="how">${t("tDesc")[tsp === "boxing" ? "tecBox" : tsp === "taekwondo" ? "tecTkd" : "tec"]}</span><div class="seg g5">${t(
        "tecOpt",
      )
        .map(
          (x, i) =>
            `<button type="button" data-tt="${i + 1}" aria-pressed="${d.tec === i + 1}"><b>${i + 1}</b><small>${x}</small></button>`,
        )
        .join("")}</div></div>`;
      h += `<div class="field"><span class="sub">${t("testSkip")}</span><div class="inline"><button type="button" class="btn sec" id="tCancel">${t("testCancel")}</button><button type="button" class="btn" id="tSave">${t("testSave")}</button></div></div></div>`;
      return h;
    }
    const view = testViewNow();
    if (mainSport() !== "boxing")
      h += `<div class="seg tview">${["fit", "exam"].map((k) => `<button type="button" data-tview="${k}" aria-pressed="${view === k}">${t("tview")[k]}</button>`).join("")}</div>`;
    if (view === "exam") return h + (mainSport() === "taekwondo" ? tkdPanelHtml() : renderExam());
    const tests = S.tests.filter((x) => !x.raw || [x.raw.str, x.raw.spd, x.raw.end, x.raw.flx].some((v) => v != null)),
      last = tests[tests.length - 1],
      prev = tests.length > 1 ? tests[tests.length - 2] : null;
    if (!last) {
      h += `<div class="empty"><b>${t("testNone")}</b>${t("testNoneT")}</div>`;
    } else {
      h += `<div><h2>${t("testLast")} · ${fmtDate(last.date)}</h2><div class="radar">${radar(last, prev)}<div class="lvl"><div class="score">${last.total}<small> / 25 ${t("testTotal")}</small></div>
  ${TCATS.map((k) => `<div class="sub">${t("cats")[k]}: <span class="res">${last.scores[k] ?? "–"}</span>${prev && prev.scores[k] && last.scores[k] ? ` <span class="sub">(${last.scores[k] - prev.scores[k] >= 0 ? "+" : ""}${last.scores[k] - prev.scores[k]})</span>` : ""}</div>`).join("")}
  ${prev ? `<div class="sub">- - - ${t("testPrev")}</div>` : ""}</div></div></div>`;
    }
    h += fitnessSummaryHtml();
    h += `<button type="button" class="btn" id="tOpen">${t("testStart")}</button><p class="foot">${t("testEvery")}</p>`;
    if (tests.length)
      h +=
        `<div><h2>${t("testHist")}</h2><div class="panel">` +
        tests
          .slice()
          .reverse()
          .map(
            (x) =>
              `<div class="logi"><span class="rpe">${x.total}</span><div style="flex:1;min-width:0"><b>${fmtDate(x.date)}</b><div class="sub">${TCATS.map((k) => `${t("cats")[k]} ${x.scores[k] ?? "–"}`).join(" · ")}${x.complete ? "" : ` · ${t("testIncomplete")}`}</div></div><button type="button" class="btn ghost" data-tdel="${x.id}">${t("del")}</button></div>`,
          )
          .join("") +
        `</div></div>`;
    return h;
  }
  function weekKey(ds) {
    return iso(monday(parse(ds)));
  }
  const fmtCache = new Map();
  function fmtDate(ds) {
    const k = S.profile.lang + ds;
    let v = fmtCache.get(k);
    if (v == null) {
      if (fmtCache.size > 2000) fmtCache.clear();
      v = parse(ds).toLocaleDateString(S.profile.lang === "de" ? "de-DE" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      fmtCache.set(k, v);
    }
    return v;
  }

  /* Strava-style calendar: one square per day for the last 16 weeks, coloured by session type */
  function heatHtml() {
    const mon = monday(today()),
      start = addDays(mon, -7 * 15),
      td = iso(today()),
      byDay = {};
    S.log.forEach((e) => (byDay[e.date] = e.type));
    let cells = "";
    for (let i = 0; i < 16 * 7; i++) {
      const d = iso(addDays(start, i)),
        ty = byDay[d],
        fut = d > td;
      cells += `<span class="c${ty ? " on" : ""}${fut ? " fut" : ""}${d === td ? " td" : ""}"${ty ? ` style="--tc:var(--c-${ty})"` : ""} title="${d}"></span>`;
    }
    const used = [...new Set(S.log.map((e) => e.type))].filter((x) => t("types")[x]);
    return `<div><h2>${t("heat")}</h2><div class="panel heat"><div class="wd">${t("dayNames")
      .map((n, i) => `<span>${i % 2 ? "" : n}</span>`)
      .join(
        "",
      )}</div><div class="grid">${cells}</div>${used.length ? `<div class="heatlg">${used.map((x) => `<span><i style="--tc:var(--c-${x})"></i>${t("types")[x]}</span>`).join("")}</div>` : ""}<div class="heatlg" style="margin-top:-2px">${t("heatSub")}</div></div></div>`;
  }
  /* Best set per exercise: heaviest weight (with its reps), otherwise most reps or longest hold */
  function bestSets() {
    const best = {};
    S.log.forEach((e) =>
      (e.perf || []).forEach((p) =>
        p.sets.forEach((x) => {
          const score = x.kg ? x.kg * 1000 + (x.r || 0) : x.r || 0;
          if (!score) return;
          if (!best[p.id] || score > best[p.id].score) best[p.id] = { score, set: x, date: e.date };
        }),
      ),
    );
    return Object.keys(best)
      .map(Number)
      .filter((id) => EX[id])
      .sort((a, b) => best[b].date.localeCompare(best[a].date))
      .map((id) => {
        const b = best[id];
        return {
          id,
          date: b.date,
          name: exText(id).name,
          v: b.set.kg
            ? `${b.set.kg} kg × ${b.set.r ?? "–"}`
            : TIMED.has(id)
              ? `${b.set.r} s`
              : `${b.set.r} ${t("reps")}`,
        };
      });
  }
  function prsHtml() {
    const list = bestSets().slice(0, 10);
    if (!list.length) return `<div><h2>${t("prs")}</h2><div class="empty">${t("prsNone")}</div></div>`;
    return `<div><h2>${t("prs")}</h2><div class="panel">${list
      .map(
        (b) =>
          `<div class="pr"><span class="medal">★</span><span style="min-width:0"><b>${esc(b.name)}</b><div class="sub">${fmtDate(b.date)}</div></span><span class="v">${b.v}</span></div>`,
      )
      .join("")}</div></div>`;
  }
  /* One line per result: wins of bouts and placing, or passed/not passed with the new belt */
  function resText(c) {
    const r = c.result || {};
    if (c.kind === "grade")
      return r.passed === "y" ? `${t("passed")}${r.grade ? " · " + r.grade : ""}` : t("notPassed");
    return `${t("resWon")(r.wins, r.bouts)}${r.place && r.place !== "-" ? ` · ${r.place}.` : ""}`;
  }
  function resultsHtml() {
    const past = (S.profile.comps || [])
      .filter((c) => parse(c.date) < today())
      .sort((a, b) => b.date.localeCompare(a.date));
    if (!past.length) return "";
    return `<div><h2>${t("results")}</h2><div class="panel">${past
      .map((c) => {
        const r = c.result,
          medal =
            c.kind === "grade"
              ? r && r.passed === "y"
                ? "✓"
                : "–"
              : r && /^[123]$/.test(r.place || "")
                ? r.place
                : "–";
        return `<div class="pr"><span class="medal">${medal}</span><span style="min-width:0;flex:1"><b>${t("compKind")[c.kind || "comp"]} · ${fmtDate(c.date)}</b><div class="sub">${r ? esc(resText(c) + (r.bad ? " · " + r.bad : "")) : t("resMissing")}</div></span>${r ? "" : `<button type="button" class="btn ghost" data-res="${c.id}">${t("clubLog")}</button>`}</div>`;
      })
      .join("")}</div></div>`;
  }
  /* sport, style and discipline of an entry where they are not obvious (7b B2): other sport than the main one,
     WT/ITF for taekwondo, a discipline other than the profile's for kickboxing */
  function logTag(e) {
    const sp = entrySport(e),
      parts = [];
    if (sp !== mainSport()) parts.push(sportLabel(sp));
    if (sp === "taekwondo" && e.tstyle) parts.push(e.tstyle === "itf" ? "ITF" : "WT");
    if (sp === "kickboxing" && e.disc && e.disc !== S.profile.disc && t("disc")[e.disc]) parts.push(t("disc")[e.disc]);
    return parts.length ? ` · ${parts.join(" · ")}` : "";
  }
  function renderLog() {
    let h = header(t("logTitle"));
    const mon = monday(today()),
      thisW = iso(mon),
      planned = weekPlan(mon).planned,
      streak = weekStreak(),
      sd = summaryData();
    const byWeek = {};
    S.log.forEach((e) => {
      const k = weekKey(e.date);
      byWeek[k] = (byWeek[k] || 0) + 1;
    });
    const cut = iso(addDays(mon, -21)),
      recent = S.log.filter((e) => e.date >= cut);
    const avg = recent.length ? (recent.reduce((a, e) => a + e.rpe, 0) / recent.length).toFixed(1) : "–";
    h += `<div class="stats"><div class="stat"><div class="v">${byWeek[thisW] || 0}/${planned}</div><div class="k">${t("statWeek")}</div></div><div class="stat ${streak >= 2 ? "hot" : ""}"><div class="v">${streak}</div><div class="k">${t("statStreak")}</div></div><div class="stat"><div class="v">${avg}</div><div class="k">${t("statRpe")}</div></div></div>`;
    h += `<div><h2>${t("last4")}</h2><div class="stats"><div class="stat"><div class="v">${sd.own}</div><div class="k">${t("sum").own}</div></div><div class="stat"><div class="v" style="color:var(--c-V)">${sd.club}</div><div class="k">${t("sum").clubN}</div></div><div class="stat"><div class="v">${sd.mins}</div><div class="k">${t("sum").mins}</div></div></div></div>`;
    h += badgesHtml();
    h += heatHtml();
    if (!S.log.length) h += `<div class="empty"><b>${t("emptyLog")}</b>${t("emptyLogT")}</div>`;
    else {
      const weeks = [...Array(8)].map((_, i) => {
        const d = addDays(mon, -7 * (7 - i));
        return { d, n: byWeek[iso(d)] || 0 };
      });
      h += `<div><h2>${t("chartWeeks")}</h2><div class="chart">${barChart(weeks, planned)}</div></div>`;
    }
    h += `<div><h2>${t("chartWeight")}</h2><div class="panel"><div class="field"><label class="lab" for="wIn">${t("weightAdd")}</label><div class="inline"><input id="wIn" type="text" inputmode="decimal" placeholder="${t("weightPh")}"><button type="button" class="btn" id="wAdd">${t("add")}</button></div><span class="sub">${t("wTip")}${weightTrend() != null ? ` · ${t("wTrend")(numF(weightTrend()))}` : ""}</span></div></div></div>`;
    const ncw = nextComp();
    if (S.weights.length >= 2)
      h += `<div class="chart">${lineChart(S.weights.slice(-20), ncw && ncw.wc ? ncw.wc : null)}</div>`;
    else if (S.weights.length === 1)
      h += `<div class="empty">${S.weights[0].kg.toFixed(1)} kg · ${fmtDate(S.weights[0].date)}</div>`;
    else h += `<div class="empty">${t("emptyW")}</div>`;
    h += prsHtml();
    h += resultsHtml();
    if (S.log.length)
      h +=
        `<div><h2>${t("history")} · ${S.log.length} ${t("statTotal")}</h2><div class="panel">` +
        S.log
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 25)
          .map(
            (e) =>
              `<div class="logi"><span class="rpe" style="color:${e.rpe >= 8 ? "var(--ember)" : e.rpe >= 5 ? "var(--frost)" : "var(--done)"}">${e.rpe}</span><div style="flex:1;min-width:0"><b>${t("types")[e.type] || ""}${e.ck ? ` · ${t("clubKinds")[e.ck] || ""}` : ""}${logTag(e)}</b><div class="sub">${fmtDate(e.date)} · ${e.minutes} ${t("min")}${e.perf ? ` · ${t("exDone")(e.perf.length)}` : ""}${perfVolume(e.perf) ? ` · ${t("volume")} ${Math.round(perfVolume(e.perf)).toLocaleString(S.profile.lang === "de" ? "de-DE" : "en-GB")} kg` : ""}${runInfo(e)}${e.note ? ` · ${esc(e.note)}` : ""}</div></div><button type="button" class="btn ghost" data-edit="${e.id}">${t("edit")}</button><button type="button" class="btn ghost" data-del="${e.id}">${t("del")}</button></div>`,
          )
          .join("") +
        `</div></div>`;
    return h;
  }
  function barChart(weeks, goal) {
    const W = 340,
      H = 150,
      pl = 24,
      pb = 22,
      pt = 12,
      max = Math.max(goal, ...weeks.map((w) => w.n), 1),
      bw = (W - pl) / weeks.length,
      y = (v) => pt + (H - pt - pb) * (1 - v / max);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("chartWeeks")}">`;
    for (let v = 0; v <= max; v++)
      s += `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl - 6}" y="${y(v) + 4}" font-size="10" font-family="DM Mono,monospace" text-anchor="end" fill="var(--mist)">${v}</text>`;
    weeks.forEach((w, i) => {
      const x = pl + i * bw + bw * 0.2;
      s += `<rect x="${x}" y="${y(w.n)}" width="${bw * 0.6}" height="${Math.max(H - pb - y(w.n), 0)}" fill="${w.n >= goal ? "var(--ice)" : "var(--ember)"}"/><text x="${x + bw * 0.3}" y="${H - 6}" font-size="10" font-family="DM Mono,monospace" text-anchor="middle" fill="var(--mist)">${w.d.getDate()}.${w.d.getMonth() + 1}</text>`;
    });
    return (
      s +
      `<line x1="${pl}" x2="${W}" y1="${y(goal)}" y2="${y(goal)}" stroke="var(--frost)" stroke-width="1.2" stroke-dasharray="4 3"/><text x="${W - 2}" y="${y(goal) - 4}" font-size="10" font-family="DM Mono,monospace" text-anchor="end" fill="var(--frost)">${t("goal")}</text></svg>`
    );
  }
  function lineChart(ws, limit) {
    const W = 340,
      H = 150,
      pl = 34,
      pb = 22,
      pt = 16,
      pr = 10,
      vals = ws.map((w) => w.kg).concat(limit ? [limit] : []);
    let lo = Math.min(...vals),
      hi = Math.max(...vals);
    if (hi - lo < 2) {
      lo -= 1;
      hi += 1;
    }
    lo = Math.floor(lo);
    hi = Math.ceil(hi);
    const x = (i) => pl + (W - pl - pr) * (i / (ws.length - 1)),
      y = (v) => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo)),
      step = Math.max(1, Math.round((hi - lo) / 3));
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("chartWeight")}">`;
    for (let v = lo; v <= hi; v += step)
      s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl - 6}" y="${y(v) + 4}" font-size="10" font-family="DM Mono,monospace" text-anchor="end" fill="var(--mist)">${v}</text>`;
    const pts = ws.map((w, i) => `${x(i)},${y(w.kg)}`).join(" "),
      last = ws.length - 1;
    s += `<polygon points="${x(0)},${H - pb} ${pts} ${x(last)},${H - pb}" fill="var(--ice-dim)"/><polyline points="${pts}" fill="none" stroke="var(--ice)" stroke-width="2"/>`;
    // class line on top of the filled area, otherwise it hides exactly when you are above it
    if (limit)
      s += `<line x1="${pl}" x2="${W - pr}" y1="${y(limit)}" y2="${y(limit)}" stroke="var(--ember)" stroke-width="1.4" stroke-dasharray="5 4"/><text x="${pl + 4}" y="${y(limit) - 5}" font-size="10.5" fill="var(--ember)">${t("wcLine")(numF(limit))}</text>`;
    s += `<circle cx="${x(last)}" cy="${y(ws[last].kg)}" r="4.5" fill="var(--ember)"/><text x="${x(last) - 6}" y="${y(ws[last].kg) - 9}" font-size="11" font-weight="700" text-anchor="end" fill="var(--frost)">${ws[last].kg.toFixed(1)}</text>`;
    return (
      s +
      `<text x="${pl}" y="${H - 6}" font-size="10" fill="var(--mist)">${fmtDate(ws[0].date)}</text><text x="${W - pr}" y="${H - 6}" font-size="10" text-anchor="end" fill="var(--mist)">${fmtDate(ws[last].date)}</text></svg>`
    );
  }
  let draft = null;
  function renderProfile() {
    if (!draft) draft = JSON.parse(JSON.stringify(S.profile));
    const p = draft;
    const sec = ui.profSec,
      PS = t("psec");
    if (!sec) return profOverview(p);
    let h = header(PS[sec][0]) + `<button type="button" class="pback" data-psec="">‹ ${PS.back}</button>`;
    let me = "",
      train = "",
      goals = "",
      life = "",
      app = "";
    // 7i: about me = sport & belt (by choice of sport) + person; training week = club, own days, focus block; dates & goals
    me += profSportHtml(p) + profPersonHtml(p);
    const cl = p.club || { days: [], minutes: 90 },
      overlap = cl.days.some((d) => p.days.includes(d));
    train += `<div class="panel"><div class="field"><span class="lab">${t("clubDays")}</span><div class="chips">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<button type="button" class="chip cday" data-cday="${i}" aria-pressed="${cl.days.includes(i)}">${t("dayNames")[i]}</button>`).join("")}</div><span class="sub">${t("clubDaysHint")}</span></div>${cl.days.length ? `<div class="field"><span class="lab">${t("clubMin")}</span><div class="seg">${[60, 75, 90, 120].map((m) => `<button type="button" data-cmin="${m}" aria-pressed="${cl.minutes === m}">${m} ${t("min")}</button>`).join("")}</div>${overlap ? `<span class="sub">${t("clubOverlap")}</span>` : ""}</div>` : ""}</div>`;
    const cap = 120,
      mv = Math.min(p.minutes, cap);
    train += `<div class="panel"><div class="field"><span class="lab">${t("days")} · ${p.days.length}</span><div class="chips">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<button type="button" class="chip${(p.club || { days: [] }).days.includes(i) ? " clubday" : ""}" data-day="${i}" aria-pressed="${p.days.includes(i)}">${t("dayNames")[i]}</button>`).join("")}</div><span class="sub">${t("ownHint")}</span></div>
 <div class="field"><label class="lab" for="pMin">${t("minutes")}: <span id="pMinV">${mv}</span></label><input id="pMin" type="range" min="30" max="${cap}" step="15" value="${mv}"><span class="sub">${t("minCap")}</span></div>
 </div>`;
    train += blockProfHtml();
    goals += profGoalsHtml(p) + arcProfileHtml();
    const note = `<p class="sub" style="text-align:center;margin:-4px 0 0">${p.days.length ? t("autoSave") : t("needDay")}</p>`;
    me += note;
    train += note;
    goals += note;
    // breaks and KO act on the stored data directly (they are not part of the plan settings above)
    const pz = pausedOn(iso(today())),
      koUntil = S.ko ? addDays(parse(S.ko), 27) : null;
    life += `<div class="panel"><div class="field"><span class="lab">${t("pauseSec")}</span>${pz ? `<span class="sub">${esc(t("pauseNow")(t("pauseWhy")[pz.why], fmtDate(pz.from)))}</span><button type="button" class="btn sec" data-pend="${pz.id}">${t("pauseEnd")}</button>` : `<div class="seg">${["ill", "inj", "vac"].map((k) => `<button type="button" data-pnew="${k}">${t("pauseWhy")[k]}</button>`).join("")}</div><span class="sub">${t("pauseHint")}</span>`}</div>${(
      S.pauses || []
    )
      .slice(-3)
      .reverse()
      .map(
        (x) =>
          `<div class="row"><span style="flex:1"><b>${t("pauseWhy")[x.why]}</b><div class="sub">${fmtDate(x.from)} – ${x.to ? fmtDate(x.to) : "…"}</div></span><button type="button" class="btn ghost" data-pdel="${x.id}">${t("del")}</button></div>`,
      )
      .join(
        "",
      )}<div class="field"><span class="lab">${t("ko")}</span>${S.ko ? `<span class="sub">${esc(koLock(iso(today())) ? t("koActive")(fmtDate(iso(koUntil)), daysBetween(today(), koUntil) + 1) : t("koPast")(fmtDate(S.ko)))}</span><button type="button" class="btn ghost" data-kodel="1" style="align-self:flex-start">${t("del")}</button>` : `<span class="sub">${t("koHint")}</span><button type="button" class="btn sec" data-konew="1">${t("koAdd")}</button>`}</div></div>`;
    {
      const hj = hijri(today()),
        F = t("fast");
      if (hj && hj.m === 9) {
        const on = !!(S.profile.fast && S.profile.fast.y === hj.y && S.profile.fast.on);
        life += `<div class="panel"><div class="field"><span class="lab">${F.lbl}</span><div class="seg">${[0, 1].map((i) => `<button type="button" data-fast="${i ? "off" : "on"}" aria-pressed="${on === !i}">${t("onOff")[i]}</button>`).join("")}</div><span class="sub">${F.hint}</span></div></div>`;
      }
    }
    life = relaxPanelHtml() + lifePanelHtml() + life; // 7k: relaxing comes first
    app += `<div class="panel"><div class="field"><span class="lab">${t("seasonLbl")}</span><div class="seg">${[0, 1].map((i) => `<button type="button" data-season="${i ? "off" : "on"}" aria-pressed="${!!S.profile.seasonOff === !!i}">${t("onOff")[i]}</button>`).join("")}</div><span class="sub">${t("seasonHint")}</span></div></div>`;
    {
      const V = t("view");
      app = `<div class="panel"><div class="field"><span class="lab">${V.lbl}</span><div class="seg">${V.opts.map((x, i) => `<button type="button" data-simple="${i ? 0 : 1}" aria-pressed="${simpleView() === !i}">${x}</button>`).join("")}</div><span class="sub">${V.hint}</span></div></div>` + app;
    }
    if (canSpeak()) {
      // 7l: choose a voice (with sample); a missing or failing choice falls back to the automatic one
      const V = t("vsel"),
        bv = bestVoice(),
        lg = S.profile.lang === "de" ? "de" : "en",
        pick = voicePickFor(lg),
        list = voiceList(),
        has = pick && list.some((v) => voiceKey(v) === pick.id),
        row = (id, name, tag) =>
          `<div class="vrow"><button type="button" class="chip" data-vpick="${esc(id)}" aria-pressed="${id ? !!has && pick.id === id : !has}">${esc(name)}${tag ? ` <small>${tag}</small>` : ""}</button>${id ? `<button type="button" class="btn ghost" data-vprobe="${esc(id)}" aria-label="${V.test}">▶</button>` : ""}</div>`;
      app += `<div class="panel"><div class="field"><span class="lab">${V.lbl}</span><span class="sub">${pick && !has ? esc(V.missing(pick.name, bv ? bv.name : "–")) : has ? esc(V.chosen(pick.name)) : bv ? esc(V.now(bv.name)) : V.none}</span>${speechFail ? `<span class="sub">${esc(V.fail(speechFail.code, speechFail.voice))}</span>` : ""}<div class="vlist">${row("", V.auto, "")}${list
        .slice(0, 16)
        .map((v) => row(voiceKey(v), v.name, (new RegExp(V.q[voiceQual(v)], "i").test(v.name) ? "" : V.q[voiceQual(v)]) + (v.localService === false ? " · online" : "")))
        .join("")}</div><span class="sub">${isIOS() ? V.ios : isAndroid() ? V.android : V.other}</span>${isIOS() ? `<span class="sub">${V.iosWeb}</span>` : ""}<button type="button" class="btn sec" data-vtest="1">${V.test}</button></div></div>`;
    }
    if (audioSessionOk())
      app += `<div class="panel"><div class="field"><span class="lab">${t("music").lbl}</span><div class="seg">${t(
        "music",
      )
        .opts.map(
          (x, i) =>
            `<button type="button" data-mix="${i}" aria-pressed="${!!S.profile.mixMusic === !!i}">${x}</button>`,
        )
        .join("")}</div><span class="sub">${t("music").hint}</span></div></div>`;
    app = mycHtml() + app;
    app += `<div class="panel"><div class="field"><span class="lab">${t("dataSec")}</span><span class="sub">${t("expHint")}</span><div class="acts2"><button type="button" class="btn sec" data-io="exp">${t("exp")}</button><button type="button" class="btn sec" data-io="imp">${t("imp")}</button></div><input id="impFile" type="file" accept=".json,application/json" hidden></div><div class="field"><span class="lab">${t("sumTitle")}</span><span class="sub">${t("sumHint")}</span><div class="acts2"><button type="button" class="btn sec" data-io="img">${t("sumImg")}</button><button type="button" class="btn sec" data-io="txt">${t("sumTxt")}</button></div></div>${installable() ? `<div class="field"><span class="lab">${t("inst").share}</span><span class="sub">${t("inst").shareHint}</span><button type="button" class="btn sec" data-inst="share">${t("inst").share}</button></div>` : ""}<div class="field"><span class="lab">${t("fb").lbl}</span><span class="sub">${t("fb").hint}</span><a class="btn sec" data-fb="1" href="${esc(feedbackUrl())}" target="_blank" rel="noopener">${t("fb").btn}</a></div><div class="field"><span class="lab">${t("tourLbl")}</span><span class="sub">${t("tourHint")}</span><button type="button" class="btn sec" data-restart-tour="1">${t("tourStart")}</button></div><div class="field"><span class="lab">${t("resetLbl")}</span><span class="sub">${t("resetHint")}</span><button type="button" class="btn ghost danger" data-reset-all="1">${t("resetBtn")}</button></div></div>`;
    app += `<div class="panel"><button type="button" class="row legal-entry" data-news="1"><span class="legal-entry-text"><b>${t("news").row}</b><span class="sub">${t("news").sub}</span></span><span class="chev" aria-hidden="true">›</span></button></div>`;
    app += `<div class="panel"><button type="button" class="row legal-entry" data-legal="1"><span class="legal-entry-text"><b>${t("legal").row}</b><span class="sub">${t("legal").sub}</span></span><span class="chev" aria-hidden="true">›</span></button></div>`;
    app += `<div class="panel"><div class="row"><span style="flex:1">${t("storage")}</span><span class="sub">${store.mode === "cloud" ? t("cloud") : t("local")}</span></div></div>`;
    h += { me, train, goals, life, guide: guidePanelHtml(), app }[sec] || "";
    return h;
  }
  /* Profile overview: six sections (7i) like the iPhone settings, each with a one-line summary */
  const PSEC_ICO = {
    me: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>',
    train: '<path d="M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11"/>',
    goals:
      '<path d="M8 4.5h8v4.8a4 4 0 0 1-8 0z"/><path d="M8 6.2H5.4a2.8 2.8 0 0 0 2.8 3.6M16 6.2h2.6a2.8 2.8 0 0 1-2.8 3.6M12 13.3v3.9M9 19.5h6"/>',
    life: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    guide: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/>',
    app: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>',
  };
  function profOverview(p) {
    const PS = t("psec"),
      td = iso(today()),
      nd = profDates(p).find((d) => (d.kind === "exam" ? !d.x.result && d.date >= td : d.date >= td)),
      bs = blockState(),
      L = t("life"),
      sp = p.sport || mainSport(),
      grade = sp === "kickboxing" ? beltName(beltIdx()) : sp === "taekwondo" && tkdGradeOf() ? tkdGradeLbl(tkdGradeOf()) : "",
      sum = {
        me: [discLabel(p), t("levels")[p.level || 0], grade].filter(Boolean).join(" · "),
        train: [
          (p.club && p.club.days.length ? PS.club(p.club.days.length) + " + " : "") + PS.days(p.days.length),
          bs ? `${t("blk").names[bs.k]}${bs.wk ? " · " + t("blk").wkN(bs.wk) : ""}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
        goals: nd ? (nd.kind === "comp" ? PS.nextComp : PS.nextGrade)(fmtDate(nd.date)) : PS.noGoal,
        life: [
          pausedOn(iso(today())) ? PS.paused : "",
          `${L.weekLbl}: ${L.moods[weekMood()]}`,
          lowTime() ? L.lowLbl : "",
        ]
          .filter(Boolean)
          .join(" · "),
        guide: isTkdMain() ? PS.guideTkd : PS.guide[1],
        app: PS.app[1],
      };
    let h = header(t("profTitle")) + `<div class="panel plist">`;
    ["me", "train", "goals", "life", "guide", "app"].forEach((k) => {
      h += `<button type="button" class="grow" data-psec="${k}"><span class="gico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${PSEC_ICO[k]}</svg></span><span class="gtx"><b>${PS[k][0]}</b><small>${esc(sum[k])}</small></span><span class="chev">›</span></button>`;
    });
    if (simpleView())
      h += ["test", "log"]
        .map(
          (k) =>
            `<button type="button" class="grow" data-tab="${k}"><span class="gico">${ICONS[k]}</span><span class="gtx"><b>${t("view").rows[k][0]}</b><small>${t("view").rows[k][1]}</small></span><span class="chev">›</span></button>`,
        )
        .join("");
    h += `</div><p class="sub" style="text-align:center">${t("autoSave")}</p><p class="foot" style="text-align:center">${APP_NAME} · Version ${APP_VER}</p>`;
    return h;
  }
  const ICONS = {
    week: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    session:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/></svg>',
    test: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8.5 6.2-3.2 10H6.7L3.5 9.2z"/><path d="M12 8l3.6 2.6-1.4 4.2H9.8l-1.4-4.2z"/></svg>',
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    profile:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  };

