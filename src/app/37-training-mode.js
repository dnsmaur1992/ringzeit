  /* ============ Training mode (full screen) ============ */
  /* Title, description and combo of one round item, used by the training mode */
  function roundInfo(it) {
    const lg = S.profile.lang === "de" ? 0 : 1;
    if (it.k === "ex") {
      const x = exText(it.id);
      return {
        title: x.name,
        desc: x.desc + (paceTxt(it) ? " " + paceTxt(it) : ""),
      };
    }
    if (it.k === "sim")
      return {
        title: t("simT")(it.fight, it.r),
        desc: it.fight > 1 && it.r === 1 ? t("simD2") : t("simD1"),
      };
    if (it.k === "task") {
      const x = (TASKS.find((q) => q.id === it.id) || TASKS[0])[S.profile.lang];
      return {
        title: x[0],
        desc: it.m === "p" ? x[1] : x[2] || x[1],
        label: t("sparMode")[it.m],
      };
    }
    const r = rtOf(it) || ["", "", "", ""];
    return {
      title: r[lg],
      // partner rounds: no long text, only the short rule (the A/B frames show the rest)
      desc: (PARTNER_K.has(it.k) ? t("partnerNote") : roundDesc(it, lg)) + (it.six ? " " + t("sixPartner") : "") + (guardCue(it) ? " " + guardCue(it) : "") + (paceTxt(it) ? " " + paceTxt(it) : ""),
      combo: it.combo,
      item: it,
      label: it.mine ? "★ " + t("myc").lbl : undefined,
    };
  }
  const ICO = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/></svg>',
  };
  function renderFocus() {
    const el = document.getElementById("focus"),
      sess = S.sessions[ui.sel],
      rb = sess && roundBlock(sess);
    unitStyle = sess && sess.sport === "taekwondo" ? sess.tstyle || null : null;
    if (!ui.focus || ui.tab !== "session" || !rb) {
      el.hidden = true;
      const guide = document.getElementById("workout");
      if (guide) guide.inert = false;
      return;
    }
    const guide = document.getElementById("workout");
    if (guide) guide.inert = true;
    selectSessionTimer(ui.sel);
    const tm = ui.timer,
      items = rb.items,
      cur = items[Math.min(tm.round, tm.total) - 1],
      rest = tm.phase === "rest" && !!items[tm.round],
      /* in the rest the card already shows the coming round */
      show = rest ? items[tm.round] : cur,
      nxt = items[tm.round + (rest ? 1 : 0)],
      info = roundInfo(show),
      sk = show && show.k === "ex" && hasSketch(show.id),
      big = tm.phase !== "work";
    // rest is green, the lead-in brass, the round in the session colour
    el.style.setProperty(
      "--tc",
      tm.phase === "rest" ? "var(--done)" : tm.phase === "prep" ? "var(--ice)" : `var(--c-${sess.type})`,
    );
    el.className = "focus" + (tm.phase === "rest" ? " rest" : "");
    let h = `<div class="fbar"><button type="button" class="x" data-fx="close" aria-label="${flowText().overview}">✕</button><span>${t("types")[sess.type]}</span>${canSpeak() ? `<button type="button" class="x vo" data-voice="1" aria-pressed="${voiceOn()}" aria-label="${t("voice")}">${voiceOn() ? "🔊" : "🔈"}</button>` : `<span style="width:40px"></span>`}</div>`;
    if (tm.phase === "done") {
      h += `<div class="fdone">${CHECK_SVG}<b>${t("finishedT")}</b><div class="sub">${t("roundOf")(tm.total, tm.total)}</div><button type="button" class="btn" data-fx="finish">${ui.workout ? workoutNextLabel() : t("finishNow")}</button></div>`;
    } else {
      const C = 2 * Math.PI * 130;
      h += `<div class="fring"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle id="farc" class="arc" cx="140" cy="140" r="130" fill="none" stroke="var(--tc)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/><g class="fknob" id="fknob"><circle cx="270" cy="140" r="9" fill="var(--tc)" stroke="#0a0b0d" stroke-width="4"/></g></svg>
   <div class="mid"><span class="ph" id="fph"></span><span class="clk" id="fclock">${fmt(tm.left)}</span><span class="sub">${t("roundOf")(Math.min(tm.round, tm.total), tm.total)}</span></div></div>`;
      const lbl = rest ? t("nextLbl") : info.label || t("roundOf")(Math.min(tm.round, tm.total), tm.total);
      h += `<div class="fcur${sk ? (big ? " skb" : " sks") : ""}">${sk && big ? `<div class="fsk">${sketchSvg(EX[show.id].key, true)}</div>` : ""}<div class="fct"><small>${esc(lbl)}</small><b>${esc(info.title)}</b><p>${esc(info.desc)}</p>${info.combo ? `<div id="fcall">${info.item ? reactHtml(info.item) : comboHtml(info.combo)}</div>` : ""}</div>${sk && !big ? `<div class="fsk">${sketchSvg(EX[show.id].de, true)}</div>` : ""}</div>`;
      h += `<div class="fnext">${nxt ? `${t(rest ? "afterLbl" : "nextLbl")}: <b>${esc(roundInfo(nxt).title)}</b>` : t("lastRound")}</div>`;
      h += `<div class="fctl"><button type="button" class="s" data-fx="prev" aria-label="${flowText().previous}" ${tm.round <= 1 ? "disabled" : ""}>${ICO.prev}</button><button type="button" class="m" data-fx="go" id="fgo"></button><button type="button" class="s" data-fx="next" aria-label="${flowText().nextRound}" ${tm.round >= tm.total ? "disabled" : ""}>${ICO.next}</button></div>`;
    }
    el.innerHTML = h;
    el.hidden = false;
    updFocus();
  }
  function updateWorkoutRoundStatus() {
    if (!ui.workout || ui.focus) return;
    const el = document.getElementById("workoutRoundStatus"),
      tm = ui.timer;
    if (el && tm)
      el.textContent = `${tm.phase === "rest" ? t("restLbl") : tm.phase === "ready" ? t("ready") : tm.phase === "prep" ? t("prepLbl") : tm.phase === "done" ? t("finished") : t("work")} · ${t("round")} ${Math.min(tm.round, tm.total)}/${tm.total} · ${fmt(tm.left)}`;
  }
  /* Per-second update of the training mode without rebuilding it */
  function updFocus() {
    const tm = ui.timer,
      el = document.getElementById("focus");
    if (!tm || el.hidden || tm.phase === "done") return;
    const clk = document.getElementById("fclock");
    if (!clk) return;
    clk.textContent = fmt(tm.left);
    el.classList.toggle("last", tm.phase === "work" && tm.left <= 10);
    document.getElementById("fph").textContent =
      tm.phase === "rest"
        ? t("restLbl")
        : tm.phase === "ready"
          ? t("ready")
          : tm.phase === "prep"
            ? t("prepLbl")
            : t("work");
    const len = tm.phase === "rest" ? tm.rest : tm.phase === "prep" ? 10 : tm.work,
      C = 2 * Math.PI * 130,
      frac = tm.phase === "ready" ? 0 : 1 - tm.left / len;
    document.getElementById("farc").setAttribute("stroke-dashoffset", (C * (1 - frac)).toFixed(1));
    const kn = document.getElementById("fknob");
    if (kn) kn.style.transform = `rotate(${(frac * 360).toFixed(1)}deg)`;
    const go = document.getElementById("fgo");
    const state = tm.phase === "ready" ? "ready" : tm.running ? "running" : "paused";
    if (go.dataset.state !== state) {
      go.innerHTML = tm.phase === "ready" ? PLAY : tm.running ? ICO.pause : PLAY;
      go.setAttribute(
        "aria-label",
        tm.phase === "ready" ? flowText().start : tm.running ? flowText().pause : flowText().resume,
      );
      go.dataset.state = state;
    }
  }
  /* Start / pause / resume – shared by the inline timer and the training mode */
  function timerGo() {
    pauseOtherTimer("session");
    selectSessionTimer(ui.sel);
    const tm = ui.timer;
    if (tm.phase === "done") {
      ui.timer = newTimer(ui.sel);
      syncTimers();
      return;
    }
    if (tm.running) {
      tick();
      if (tm.phase === "done") return;
      tm.carryMs = Math.max(0, Date.now() - lastTick);
      tm.running = false;
      tm.called = null;
      cancelTimerSpeech();
      syncTimers();
      return;
    }
    if (tm.phase === "ready") {
      tm.phase = "prep";
      tm.left = 10;
      tm.carryMs = 0;
    }
    tm.running = true;
    lastTick = Date.now() - (tm.carryMs || 0);
    callTick(tm);
    syncTimers();
  }
  function timerJump(d) {
    const tm = ui.timer;
    if (!tm) return;
    tick();
    tm.round = Math.max(1, Math.min(tm.total, tm.round + d));
    tm.call = null;
    tm.called = null;
    tm.phase = "ready";
    tm.left = tm.work;
    tm.running = false;
    tm.carryMs = 0;
    cancelTimerSpeech();
    syncTimers();
  }
  function markRounds(scroll) {
    const tm = ui.timer && ui.timer.ds === ui.sel ? ui.timer : null,
      sess = S.sessions[ui.sel];
    document.querySelectorAll("[data-rd]").forEach((el) => {
      const n = +el.dataset.rd,
        done = !!sess && roundDone(sess, n),
        isCur = !done && !!tm && tm.phase !== "done" && n === tm.round;
      el.classList.toggle("cur", isCur);
      el.classList.toggle("resting", !!tm && tm.phase === "rest" && n === tm.round);
      el.classList.toggle("past", done);
      if (scroll && n === tm.round && el.scrollIntoView) {
        try {
          el.scrollIntoView({
            block: "center",
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          });
        } catch (e) {}
      }
    });
    updateCompletionUI();
  }
  function completeTimerRound(tm) {
    const sess = S.sessions[tm.ds];
    if (!sess) return;
    // Snapshot legacy rdone before moving the resume cursor, including explicit false values for skipped rounds.
    sess.roundChecks = Object.fromEntries(Array.from({ length: tm.total }, (_, i) => [i + 1, roundDone(sess, i + 1)]));
    sess.roundChecks[tm.round] = true;
    sess.rdone = Math.max(sess.rdone || 0, tm.round);
    store.save();
  }
  /* One timer second. quiet = catching up after the phone paused the page: no sounds, no splashes */
  function timerStep(tm, quiet) {
    tm.left--;
    if (!quiet && tm.left === 10 && tm.phase === "work") beep(660, 0.12, 1);
    if (!quiet && ["prep", "rest"].includes(tm.phase) && tm.left > 0 && tm.left <= 3) beep(740, 0.08, 1);
    if (!quiet && tm.phase === "rest" && tm.left === Math.min(10, tm.rest - 1)) callTick(tm);
    if (tm.left > 0) return false;
    const W = t("win"),
      fx = (k, txt) => !quiet && ui.focus && timerFx(k, txt);
    if (tm.phase === "prep") {
      tm.phase = "work";
      tm.left = tm.work;
      if (!quiet) bell(1);
      fx("go", tm.round === tm.total && tm.total > 1 ? W.last : W.go);
    } else if (tm.phase === "work") {
      completeTimerRound(tm);
      if (tm.round >= tm.total) {
        tm.phase = "done";
        tm.running = false;
        tm.left = 0;
        if (!quiet) bell(3);
        releaseWake();
        fx("done", W.fin);
      } else {
        tm.phase = "rest";
        tm.call = null;
        tm.left = tm.rest;
        if (!quiet) bell(3);
        fx("end", W.end(tm.round));
      }
    } else {
      tm.phase = "work";
      tm.call = null;
      tm.round++;
      tm.left = tm.work;
      if (!quiet) {
        bell(1);
        callTick(tm);
      }
      fx("go", tm.round === tm.total ? W.last : W.go);
    }
    return true;
  }
  /* Runs every second; counts the real time that passed, so a locked screen doesn't stop the clock */
  let lastTick = Date.now();
  function tick() {
    const now = Date.now(),
      gap = Math.floor((now - lastTick) / 1000);
    if (gap < 1) return;
    lastTick += gap * 1000;
    const tm = ui.timer;
    if (!tm || !tm.running) return;
    let changed = false;
    const max = Math.min(gap, tm.total * (tm.work + tm.rest) + 10);
    for (let i = 0; i < max && tm.running; i++) changed = timerStep(tm, i < gap - 1) || changed;
    if (!timerVisible() || ui.tab !== "session" || ui.sel !== tm.ds) return;
    if (changed) {
      markRounds(false);
      if (ui.focus) renderFocus();
    }
    if (ui.focus) updFocus();
    else updTimer();
  }
  function updTimer() {
    updateWorkoutRoundStatus();
    const tm = ui.timer,
      el = document.getElementById("timer");
    if (!el || !tm || !document.getElementById("tclock")) return;
    el.className =
      "timer " +
      (tm.phase === "rest" || tm.phase === "ready" ? "rest" : "") +
      ((tm.phase === "work" || tm.phase === "prep") && tm.running ? " on" : "") +
      (tm.phase === "work" && tm.left <= 10 ? " last" : "");
    document.getElementById("tclock").textContent = fmt(tm.left);
    document.getElementById("tph").textContent =
      tm.phase === "rest"
        ? t("pause")
        : tm.phase === "done"
          ? t("finished")
          : tm.phase === "ready"
            ? t("ready")
            : tm.phase === "prep"
              ? t("prepLbl")
              : t("work");
    document.getElementById("tround").textContent =
      `${t("round")} ${Math.min(tm.round, tm.total)}/${tm.total} · ${fmt(tm.work)} / ${fmt(tm.rest)}`;
    document.getElementById("tgo").textContent = tlabel(tm);
    const len = tm.phase === "rest" ? tm.rest : tm.phase === "prep" ? 10 : tm.work,
      bar = document.getElementById("tbar");
    if (bar)
      bar.style.width =
        (tm.phase === "ready" ? 0 : tm.phase === "done" ? 100 : (1 - tm.left / len) * 100) + "%";
  }
  /* scheduleTimers() runs only while a timer is active, aligned to the next displayed second. */

