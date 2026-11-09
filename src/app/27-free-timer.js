  /* ============ Free round timer (like the classic boxing timer apps): runs on its own, no plan needed ============ */
  const FT_PRESETS = [
    { id: "wako", r: 3, w: 120, b: 60 },
    { id: "k1", r: 3, w: 180, b: 60 },
    { id: "spar", r: 5, w: 180, b: 60 },
    { id: "pads", r: 6, w: 120, b: 45 },
    { id: "hiit", r: 8, w: 40, b: 20 },
    { id: "pro", r: 12, w: 180, b: 60 },
  ];
  /* presets follow the main sport (and the taekwondo style): the fight format of its rules first, then training formats */
  function ftPresets() {
    const sp = mainSport(),
      age = ageAt(today());
    if (sp === "boxing") {
      const f = boxStandard(age);
      return [{ id: "fbox", r: f.r, w: f.w, b: f.b }, ...FT_PRESETS.filter((p) => ["spar", "pads", "hiit", "pro"].includes(p.id))];
    }
    if (sp === "taekwondo") {
      const itf = tkdStyle() === "itf",
        f = (itf ? TKDT.itfFormat(null, age) : TKDT.wtFormat(null, age)) || (itf ? { r: 2, w: 120, b: 60 } : TKDT.STD_FORMAT);
      return [
        { id: itf ? "fitf" : "fwt", r: f.r, w: f.w, b: f.b },
        { id: "spar", r: 5, w: 120, b: 60 },
        { id: "pads", r: 6, w: 120, b: 45 },
        { id: "hiit", r: 8, w: 40, b: 20 },
      ];
    }
    return FT_PRESETS;
  }
  const ftCfg = () => {
    const f = ftPresets()[0];
    return { r: f.r, w: f.w, b: f.b, prep: true, warn: true, coach: false, ...(S.profile.ft || {}) };
  };
  function openFt() {
    pauseOtherTimer("free");
    if (!ui.ft) ui.ft = { phase: "setup", cfg: ftCfg() };
    renderFt();
  }
  function closeFt() {
    if (freeRunning()) ftTick();
    ui.ft = null;
    cancelTimerSpeech();
    syncTimers();
    renderFt();
  }
  function renderFt() {
    const el = document.getElementById("ftimer"),
      f = ui.ft;
    if (!f) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    const c = f.cfg,
      L = t("ft");
    if (f.phase === "setup") {
      const total = c.r * c.w + (c.r - 1) * c.b + (c.prep ? 10 : 0),
        step = (k, v, lbl) =>
          `<div class="ftstep"><span>${lbl}</span><div><button type="button" data-fts="${k}:-1" aria-label="−">−</button><b>${v}</b><button type="button" data-fts="${k}:1" aria-label="+">+</button></div></div>`;
      el.className = "ftimer setup";
      el.innerHTML = `<div class="fbar"><button type="button" class="x" data-ftx="close" aria-label="×">✕</button><span>${L.title}</span>${canSpeak() ? `<button type="button" class="x vo" data-voice="1" aria-pressed="${voiceOn()}" aria-label="${t("voice")}">${voiceOn() ? "🔊" : "🔈"}</button>` : `<span style="width:40px"></span>`}</div>
          <div class="ftpre">${ftPresets().map((p) => `<button type="button" data-ftp="${p.id}" aria-pressed="${p.r === c.r && p.w === c.w && p.b === c.b}"><b>${L.pre[p.id]}</b><small>${p.r} × ${fmt(p.w)} · ${fmt(p.b)}</small></button>`).join("")}</div>
          <div class="ftcard">${step("r", c.r, L.rounds)}${step("w", fmt(c.w), L.work)}${step("b", fmt(c.b), L.rest)}
            <button type="button" class="setrow2" data-ftt="prep"><span>${L.prep}</span><span class="tog ${c.prep ? "on" : ""}"></span></button>
            <button type="button" class="setrow2" data-ftt="warn"><span>${L.warn}</span><span class="tog ${c.warn ? "on" : ""}"></span></button>
            <button type="button" class="setrow2" data-ftt="coach"><span>${t("coach").lbl}<small>${t("coach").hint}</small></span><span class="tog ${c.coach ? "on" : ""}"></span></button></div>
          <div class="fttotal">${L.total(Math.round(total / 60))}</div>
          <button type="button" class="ftgo" data-ftx="start">${PLAY}<span>${L.start}</span></button>`;
      return;
    }
    const len = f.phase === "work" ? c.w : f.phase === "rest" ? c.b : f.phase === "prep" ? 10 : 1,
      C = 2 * Math.PI * 130,
      frac = f.phase === "done" ? 1 : 1 - f.left / len;
    el.className = `ftimer run ${f.phase}${f.paused ? " paused" : ""}${f.phase === "work" && c.warn && f.left <= 10 ? " last" : ""}`;
    if (f.phase === "done") {
      el.innerHTML = `<div class="fbar"><button type="button" class="x" data-ftx="close" aria-label="×">✕</button><span>${L.title}</span>${canSpeak() ? `<button type="button" class="x vo" data-voice="1" aria-pressed="${voiceOn()}" aria-label="${t("voice")}">${voiceOn() ? "🔊" : "🔈"}</button>` : `<span style="width:40px"></span>`}</div><div class="ftdone">${CHECK_SVG}<b>${L.done}</b><span>${L.doneT(f.completed || 0, Math.round(((f.completed || 0) * c.w) / 60))}</span><button type="button" class="btn" data-ftx="again">${L.again}</button><button type="button" class="btn sec" data-ftx="close">${t("close")}</button></div>`;
      return;
    }
    el.innerHTML = `<div class="fbar"><button type="button" class="x" data-ftx="close" aria-label="×">✕</button><span>${L.title}</span>${canSpeak() ? `<button type="button" class="x vo" data-voice="1" aria-pressed="${voiceOn()}" aria-label="${t("voice")}">${voiceOn() ? "🔊" : "🔈"}</button>` : `<span style="width:40px"></span>`}</div>
        <div class="ftph">${f.phase === "prep" ? L.ready : f.phase === "rest" ? L.restL : f.round === c.r && c.r > 1 ? L.lastR : L.round(f.round, c.r)}</div>
        <div class="fring"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="12"/><circle id="ftarc" cx="140" cy="140" r="130" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/><g class="fknob" id="ftknob" style="transform:rotate(${(frac * 360).toFixed(1)}deg)"><circle cx="270" cy="140" r="10" fill="#fff"/></g></svg><div class="mid"><span class="clk" id="ftclk">${fmt(f.left)}</span>${f.phase === "rest" && f.round < c.r ? `<span class="sub">${L.next(f.round + 1, c.r)}</span>` : ""}</div></div>
        ${c.coach && f.phase === "work" ? `<div class="ftcall" id="ftcall">${f.callTxt ? esc(f.callTxt) : ""}</div>` : ""}
        <div class="ftdots">${[...Array(c.r)].map((_, i) => `<i class="${i + 1 < f.round || (i + 1 === f.round && f.phase === "rest") ? "d" : i + 1 === f.round && f.phase === "work" ? "c" : ""}"></i>`).join("")}</div>
        <div class="fctl"><button type="button" class="s" data-ftx="reset" aria-label="${L.reset}">${ICO.prev}</button><button type="button" class="m" data-ftx="pause" aria-label="${f.paused ? flowText().resume : flowText().pause}">${f.paused ? PLAY : ICO.pause}</button><button type="button" class="s" data-ftx="skip" aria-label="${L.skip}">${ICO.next}</button></div>`;
  }
  function ftPhase(ph, quiet = false, startAt = Date.now()) {
    const f = ui.ft,
      c = f.cfg,
      L = t("ft");
    cancelTimerSpeech();
    f.phase = ph;
    f.lastCall = 0;
    f.callTxt = "";
    const len = ph === "work" ? c.w : ph === "rest" ? c.b : 10;
    f.left = len;
    f.endAt = startAt + len * 1000;
    if (!quiet && ph === "work") {
      bell(1);
      if (timerVisible()) timerFx("go", f.round === c.r && c.r > 1 ? t("win").last : t("win").go);
      queueTimerSpeech(
        f.round === c.r && c.r > 1 ? L.sayLast : L.sayRound(f.round),
        1300,
        () => ui.ft === f && !f.paused && f.phase === "work",
      );
    } else if (!quiet && ph === "rest") {
      bell(3);
      if (timerVisible()) timerFx("end", t("win").end(f.round));
      queueTimerSpeech(L.restL, 1500, () => ui.ft === f && !f.paused && f.phase === "rest");
    }
    if (!quiet && timerVisible()) renderFt();
  }
  function ftStart() {
    pauseOtherTimer("free");
    const f = ui.ft;
    if (!f) return;
    S.profile.ft = {
      r: f.cfg.r,
      w: f.cfg.w,
      b: f.cfg.b,
      prep: f.cfg.prep,
      warn: f.cfg.warn,
      coach: f.cfg.coach,
    };
    store.save();
    f.round = 1;
    f.completed = 0;
    f.paused = false;
    ftPhase(f.cfg.prep ? "prep" : "work");
    if (f.cfg.prep) say(t("ft").sayPrep);
    syncTimers();
  }
  function ftEnd(quiet = false, startAt = Date.now(), manual = false) {
    const f = ui.ft;
    if (!f) return;
    const c = f.cfg;
    if (f.phase === "prep") return ftPhase("work", quiet, startAt);
    if (f.phase === "work") {
      if (!manual) {
        f.completed = (f.completed || 0) + 1;
        S.profile.ftRounds = (S.profile.ftRounds || 0) + 1;
        store.save();
      }
      if (f.round >= c.r) {
        cancelTimerSpeech();
        f.phase = "done";
        f.left = 0;
        f.endAt = null;
        if (!quiet) {
          bell(3);
          queueTimerSpeech(t("ft").sayDone, 1500, () => ui.ft === f && f.phase === "done");
          if (timerVisible()) timerFx("done", t("win").fin);
        }
        syncTimers();
        if (timerVisible()) renderFt();
        checkBadges();
        return;
      }
      if (c.b > 0) return ftPhase("rest", quiet, startAt);
    }
    f.round++;
    ftPhase("work", quiet, startAt);
  }
  function ftTick() {
    const f = ui.ft;
    if (!freeRunning() || !f.endAt) return;
    const now = Date.now(),
      old = f.left;
    let changed = false;
    for (let n = 0; n < f.cfg.r * 2 + 2 && freeRunning() && f.endAt <= now; n++) {
      const boundary = f.endAt;
      ftEnd(now - boundary > 1100, boundary);
      changed = true;
    }
    if (f.phase === "done") return;
    f.left = Math.max(0, Math.ceil((f.endAt - now) / 1000));
    if (!changed && old === f.left) return;
    if (!changed && f.phase === "work" && f.cfg.warn && f.left === 10) beep(660, 0.1, 2);
    if (f.phase === "work" && f.cfg.coach && f.left > 4 && f.cfg.w - f.left >= 3) {
      const gap = [8, 6, 5][techniqueLevel()] || 6;
      if (!f.lastCall || f.lastCall - f.left >= gap) {
        f.lastCall = f.left;
        const c = combo(Math.random() < 0.5 ? "shadow" : "bag", null);
        f.callTxt = c.map((x) => techNm(x)).join(" · ");
        if (!changed) say(comboWords(c), 1.05);
      }
    }
    if (!changed && ["prep", "rest"].includes(f.phase) && f.left <= 3 && f.left > 0) beep(740, 0.08, 1);
    if (!timerVisible()) return;
    if (changed) return renderFt();
    const clk = document.getElementById("ftclk"),
      arc = document.getElementById("ftarc");
    if (!clk || !arc) return;
    clk.textContent = fmt(f.left);
    const len = f.phase === "work" ? f.cfg.w : f.phase === "rest" ? f.cfg.b : 10,
      C = 2 * Math.PI * 130;
    arc.setAttribute("stroke-dashoffset", ((C * f.left) / len).toFixed(1));
    const kn = document.getElementById("ftknob");
    if (kn) kn.style.transform = `rotate(${((1 - f.left / len) * 360).toFixed(1)}deg)`;
    document
      .getElementById("ftimer")
      .classList.toggle("last", f.phase === "work" && f.cfg.warn && f.left <= 10);
    const call = document.getElementById("ftcall");
    if (call && f.callTxt && call.textContent !== f.callTxt) {
      call.textContent = f.callTxt;
      call.classList.remove("pop");
      void call.offsetWidth;
      call.classList.add("pop");
    }
  }
  function ftAction(a) {
    const f = ui.ft;
    if (!f) return;
    if (a === "close") return closeFt();
    if (a === "start") return ftStart();
    if (a === "again" || a === "reset") {
      cancelTimerSpeech();
      f.phase = "setup";
      f.endAt = null;
      f.paused = false;
      syncTimers();
      return renderFt();
    }
    if (a === "pause") {
      if (f.paused) {
        pauseOtherTimer("free");
        f.endAt = Date.now() + (f.remainingMs ?? f.left * 1000);
        f.paused = false;
      } else {
        ftTick();
        if (f.phase === "done") return;
        f.remainingMs = Math.max(0, f.endAt - Date.now());
        f.paused = true;
        cancelTimerSpeech();
      }
      syncTimers();
      return renderFt();
    }
    if (a === "skip") {
      ftEnd(false, Date.now(), true);
      syncTimers();
      return;
    }
  }
  function ftStepper(k, d) {
    const c = ui.ft.cfg;
    if (k === "r") c.r = Math.max(1, Math.min(20, c.r + d));
    if (k === "w") c.w = Math.max(15, Math.min(600, c.w + d * 15));
    if (k === "b") c.b = Math.max(0, Math.min(300, c.b + d * 15));
    renderFt();
  }

