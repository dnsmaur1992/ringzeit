  /* ============ Timer ============ */
  let actx = null,
    wake = null;
  function beep(f = 880, d = 0.18, n = 1) {
    withAudio(() => beepNow(f, d, n));
  }
  function beepNow(f, d, n) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < n; i++) {
        const o = actx.createOscillator(),
          g = actx.createGain();
        o.frequency.value = f;
        o.connect(g);
        g.connect(actx.destination);
        const s = actx.currentTime + i * 0.25;
        g.gain.setValueAtTime(0.25, s);
        g.gain.exponentialRampToValueAtTime(0.001, s + d);
        o.start(s);
        o.stop(s + d);
      }
    } catch (e) {}
  }
  /* iOS only allows sound that was first started from a tap: unlock audio and speech on the first touch */
  function unlockAudio() {
    unlockBells();
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const src = actx.createBufferSource();
      src.buffer = actx.createBuffer(1, 1, 22050);
      src.connect(actx.destination);
      src.start(0);
    } catch (e) {}
    primeSpeech();
  }
  /* iOS keeps speech silent until one real (non-empty) utterance was started from a tap.
     A muted dot is spoken on taps until the synth confirms it started; after a restart or a
     return to the app this repeats, so timer calls work without toggling the voice button. */
  let speechPrimed = false,
    primeAt = 0,
    primeU = null;
  function primeSpeech() {
    try {
      if (speechPrimed || !voiceOn() || Date.now() - primeAt < 1500) return;
      if (speechSynthesis.speaking || speechSynthesis.pending) return;
      primeAt = Date.now();
      const u = new SpeechSynthesisUtterance(".");
      u.volume = 0;
      u.rate = 2;
      applyVoice(u);
      // only a real start counts: a cancelled or failed dot is retried on the next tap
      u.onstart = () => (speechPrimed = true);
      u.onend = u.onerror = () => {
        if (primeU === u) primeU = null;
      };
      primeU = u;
      setTimeout(() => {
        if (primeU === u) primeU = null;
      }, 3000);
      if (speechSynthesis.paused) speechSynthesis.resume();
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  const unlockOnce = () => {
    unlockAudio();
    ["pointerdown", "touchend", "click"].forEach((x) => document.removeEventListener(x, unlockOnce, true));
  };
  ["pointerdown", "touchend", "click"].forEach((x) => document.addEventListener(x, unlockOnce, true));
  ["pointerdown", "touchend", "click"].forEach((x) => document.addEventListener(x, primeSpeech, true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") speechPrimed = false;
  });
  /* no pinch zoom: iOS ignores the viewport setting, so its zoom gestures are stopped here */
  ["gesturestart", "gesturechange"].forEach((x) => document.addEventListener(x, (e) => e.preventDefault()));
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );
  /* Boxing ring bell, synthesised: inharmonic partials with a metallic strike and a long ring-out.
       n = number of strikes (1 = round start, 3 = round end) */
  /* iOS puts web audio into "interrupted" (or "suspended") after speech or a pause; wake it before playing */
  function withAudio(play) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const run = () => {
        play();
        scheduleAudioSleep();
      };
      if (actx.state === "running") return run();
      const p = actx.resume();
      if (p && p.then) p.then(run, run);
      else run();
    } catch (e) {}
  }
  /* While a timer runs, an inaudible tone keeps the audio output awake, so the first bell isn't swallowed */
  let keepTone = null;
  function audioKeep(on) {
    try {
      if (on && !keepTone) {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state !== "running") actx.resume();
        const o = actx.createOscillator(),
          g = actx.createGain();
        o.frequency.value = 40;
        g.gain.value = 0.0005;
        o.connect(g);
        g.connect(actx.destination);
        o.start();
        o._keepGain = g;
        keepTone = o;
      } else if (!on && keepTone) {
        keepTone.stop();
        keepTone.disconnect();
        keepTone._keepGain?.disconnect();
        keepTone = null;
      }
    } catch (e) {}
  }
  /* The bell is rendered once into a WAV file and played with an audio element: on iOS that survives speech
       and audio interruptions better than live synthesis. Web audio stays as the fallback. */
  let bellEls = null;
  function bellWav(n) {
    const sr = 44100,
      f0 = 720,
      gap = 0.32,
      parts = [
        [1, 0.55, 2.6],
        [2.01, 0.32, 1.9],
        [2.76, 0.4, 1.5],
        [4.07, 0.22, 1.0],
        [5.43, 0.18, 0.7],
        [6.8, 0.1, 0.45],
        [8.9, 0.06, 0.3],
      ],
      N = Math.ceil(sr * (gap * (n - 1) + 3.8)),
      y = new Float32Array(N);
    for (let i = 0; i < n; i++) {
      const k0 = Math.round((0.02 + i * gap) * sr),
        len = n > 1 && i < n - 1 ? 0.55 : 1;
      parts.forEach(([r, a, d]) =>
        [1, 1.004].forEach((det, j) => {
          const amp = a * (j ? 0.45 : 1),
            M = Math.min(N - k0, Math.round(d * len * 1.4 * sr)),
            dec = Math.log(0.0001 / amp) / M,
            w = (2 * Math.PI * f0 * r * det) / sr,
            att = 0.004 * sr;
          for (let m = 0; m < M; m++)
            y[k0 + m] += Math.sin(w * m) * amp * Math.exp(dec * m) * Math.min(1, m / att);
        }),
      );
      let prev = 0;
      for (let m = 0; m < 0.03 * sr && k0 + m < N; m++) {
        const v = (Math.random() * 2 - 1) * (1 - m / (0.03 * sr)) * 0.35;
        y[k0 + m] += v - prev; // crude high-pass: the hammer's click
        prev = v;
      }
    }
    let peak = 0;
    for (let k = 0; k < N; k++) peak = Math.max(peak, Math.abs(y[k]));
    const buf = new ArrayBuffer(44 + N * 2),
      dv = new DataView(buf),
      str = (o, t) => [...t].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF");
    dv.setUint32(4, 36 + N * 2, true);
    str(8, "WAVEfmt ");
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    str(36, "data");
    dv.setUint32(40, N * 2, true);
    for (let k = 0; k < N; k++)
      dv.setInt16(44 + k * 2, Math.max(-1, Math.min(1, (y[k] / peak) * 0.9)) * 32767, true);
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }
  /* audio elements may only play later if they were started once from a tap: start them muted and stop at once */
  function unlockBells() {
    try {
      if (!bellEls) bellEls = { 1: new Audio(bellWav(1)), 3: new Audio(bellWav(3)) };
      Object.values(bellEls).forEach((el) => {
        if (el._ok) return;
        el.preload = "auto";
        el.muted = true;
        const p = el.play();
        const done = () => {
          el.pause();
          el.currentTime = 0;
          el.muted = false;
          el._ok = true;
        };
        p && p.then ? p.then(done, () => (el.muted = false)) : done();
      });
    } catch (e) {}
  }
  function bell(n = 1) {
    const el = bellEls && bellEls[n > 1 ? 3 : 1];
    if (el && el._ok) {
      try {
        el.muted = false;
        el.currentTime = 0;
        const p = el.play();
        if (p && p.catch) p.catch(() => withAudio(() => bellNow(n)));
        return;
      } catch (e) {}
    }
    withAudio(() => bellNow(n));
  }
  function bellNow(n) {
    try {
      const out = actx.createDynamicsCompressor(),
        master = actx.createGain();
      master.gain.value = 0.9;
      master.connect(out);
      out.connect(actx.destination);
      const f0 = 720,
        parts = [
          [1, 0.55, 2.6],
          [2.01, 0.32, 1.9],
          [2.76, 0.4, 1.5],
          [4.07, 0.22, 1.0],
          [5.43, 0.18, 0.7],
          [6.8, 0.1, 0.45],
          [8.9, 0.06, 0.3],
        ],
        gap = 0.32;
      for (let i = 0; i < n; i++) {
        const t0 = actx.currentTime + 0.02 + i * gap,
          len = n > 1 && i < n - 1 ? 0.55 : 1; // quick strikes in a series, the last one rings out
        parts.forEach(([r, a, d]) => {
          [1, 1.004].forEach((det, j) => {
            const o = actx.createOscillator(),
              g = actx.createGain();
            o.type = "sine";
            o.frequency.value = f0 * r * det;
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(a * (j ? 0.45 : 1), t0 + 0.004);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + d * len * 1.4);
            o.connect(g);
            g.connect(master);
            o.start(t0);
            o.stop(t0 + d * len * 1.4 + 0.05);
          });
        });
        // the hammer: a short burst of filtered noise
        const buf = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.03), actx.sampleRate),
          ch = buf.getChannelData(0);
        for (let k = 0; k < ch.length; k++) ch[k] = (Math.random() * 2 - 1) * (1 - k / ch.length);
        const src = actx.createBufferSource(),
          hp = actx.createBiquadFilter(),
          ng = actx.createGain();
        src.buffer = buf;
        hp.type = "highpass";
        hp.frequency.value = 2500;
        ng.gain.value = 0.35;
        src.connect(hp);
        hp.connect(ng);
        ng.connect(master);
        src.start(t0);
      }
    } catch (e) {}
  }
  /* Screen stays on while any round timer runs (session timer, full screen, free round timer).
       The system drops the lock when the app is hidden or the screen locks – it is requested again on return. */

  /* A single deadline-aligned clock owns both timer types. No idle polling. */
  let timerClock = null,
    timerSpeechEpoch = 0,
    timerSpeechJobs = new Set(),
    audioIdle = null;
  const timerVisible = () => document.visibilityState !== "hidden";
  const freeRunning = () => !!ui.ft && !ui.ft.paused && ["prep", "work", "rest"].includes(ui.ft.phase);
  const timerRunning = () => !!ui.timer?.running || freeRunning() || !!ui.exerciseTimer?.running || relaxRunning();
  function scheduleTimers() {
    clearTimeout(timerClock);
    timerClock = null;
    resumeSave();
    const delays = [],
      now = Date.now();
    if (ui.exerciseTimer?.running) {
      const remaining = ui.exerciseTimer.endAt - now;
      delays.push(remaining <= 0 ? 1 : remaining % 1000 || 1000);
    }
    if (ui.timer?.running) delays.push(Math.max(1, lastTick + 1000 - now));
    if (freeRunning()) {
      const remaining = ui.ft.endAt - now;
      delays.push(remaining <= 0 ? 1 : remaining % 1000 || 1000);
    }
    if (!delays.length) return;
    timerClock = setTimeout(
      () => {
        timerClock = null;
        tick();
        ftTick();
        exerciseTick();
        scheduleTimers();
      },
      Math.min(...delays),
    );
  }
  function cancelTimerSpeech() {
    timerSpeechEpoch++;
    timerSpeechJobs.forEach((job) => clearTimeout(job));
    timerSpeechJobs.clear();
    try {
      if (canSpeak() && !primeU) speechSynthesis.cancel();
    } catch (e) {}
  }
  function queueTimerSpeech(text, delay, valid, rate = 0.95) {
    const epoch = timerSpeechEpoch;
    const job = setTimeout(() => {
      timerSpeechJobs.delete(job);
      if (epoch === timerSpeechEpoch && valid()) say(text, rate);
    }, delay);
    timerSpeechJobs.add(job);
  }
  function scheduleAudioSleep(force = false) {
    if (!force && needsAudioKeep()) return;
    clearTimeout(audioIdle);
    audioIdle = setTimeout(() => {
      audioIdle = null;
      if ((!timerRunning() || !needsAudioKeep()) && actx?.state === "running") {
        try {
          actx.suspend()?.catch(() => {});
        } catch (e) {}
      }
    }, 5000);
  }
  function syncTimers() {
    if (timerRunning()) getWake();
    else releaseWake();
    scheduleTimers();
  }
  function clearSessionTimer() {
    ui.pausedRests = null;
    if (ui.exerciseTimer?.running) pauseExerciseTimer();
    ui.exerciseTimer = null;
    if (ui.timer?.running) ui.timer.running = false;
    ui.timer = null;
    cancelTimerSpeech();
    syncTimers();
  }
  function stopAllTimers() {
    // Account for elapsed full rounds before stopping, never mark the current unfinished round complete.
    tick();
    ftTick();
    exerciseTick();
    if (ui.exerciseTimer) ui.exerciseTimer.running = false;
    if (ui.timer) {
      ui.timer.running = false;
      ui.timer.called = null;
    }
    if (ui.ft) {
      ui.ft.paused = true;
      ui.ft = null;
    }
    clearTimeout(timerClock);
    timerClock = null;
    cancelTimerSpeech();
    try {
      Object.values(bellEls || {}).forEach((el) => {
        el.pause();
        el.currentTime = 0;
      });
    } catch (e) {}
    releaseWake();
    const free = document.getElementById("ftimer");
    if (free) {
      free.hidden = true;
      free.innerHTML = "";
    }
  }
  function pauseOtherTimer(kind) {
    if (kind !== "exercise" && ui.exerciseTimer?.running) pauseExerciseTimer();
    if ((kind === "free" || kind === "exercise") && ui.timer?.running) {
      tick();
      if (ui.timer) {
        ui.timer.carryMs = Math.max(0, Date.now() - lastTick);
        ui.timer.running = false;
        ui.timer.called = null;
      }
      cancelTimerSpeech();
      if (timerVisible()) toast(flowText().pausedSession);
    }
    if ((kind === "session" || kind === "exercise") && freeRunning()) {
      ftTick();
      if (ui.ft) {
        ui.ft.remainingMs = Math.max(0, ui.ft.endAt - Date.now());
        ui.ft.paused = true;
      }
      cancelTimerSpeech();
      if (timerVisible()) toast(flowText().pausedFree);
    }
    syncTimers();
  }
  function selectSessionTimer(ds) {
    if (ui.timer && ui.timer.ds !== ds) clearSessionTimer();
    if (!ui.timer) ui.timer = newTimer(ds);
  }
  // Preserve the compatibility tone on Apple mobile audio; other engines can sleep between signals.
  const needsAudioKeep = () =>
    audioSessionOk() ||
    /iPhone|iPad|iPod/.test(navigator.userAgent || "") ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  let wantWake = false,
    wakeRequest = null,
    wakeEpoch = 0,
    wakeRetry = null;
  async function getWake() {
    if (!timerRunning()) return;
    wantWake = true;
    clearTimeout(audioIdle);
    audioIdle = null;
    applyAudioMode();
    audioKeep(needsAudioKeep());
    unlockBells();
    scheduleAudioSleep();
    if (wake || wakeRequest || !timerVisible()) return wakeRequest;
    const epoch = wakeEpoch;
    wakeRequest = Promise.resolve()
      .then(() => navigator.wakeLock?.request("screen"))
      .then((lock) => {
        if (!lock) return;
        if (!wantWake || epoch !== wakeEpoch || !timerRunning() || !timerVisible()) {
          return Promise.resolve(lock.release()).catch(() => {});
        }
        wake = lock;
        lock.addEventListener("release", () => {
          if (wake !== lock) return;
          wake = null;
          clearTimeout(wakeRetry);
          if (wantWake && timerRunning() && timerVisible()) wakeRetry = setTimeout(() => getWake(), 1000);
        });
      })
      .catch(() => {
        wake = null;
      })
      .finally(() => {
        wakeRequest = null;
        if (epoch !== wakeEpoch && timerRunning() && timerVisible()) getWake();
      });
    return wakeRequest;
  }
  function releaseWake() {
    if (timerRunning()) return;
    wantWake = false;
    wakeEpoch++;
    clearTimeout(wakeRetry);
    wakeRetry = null;
    audioKeep(false);
    const lock = wake;
    wake = null;
    try {
      if (lock) Promise.resolve(lock.release()).catch(() => {});
    } catch (e) {}
    // Let final bells finish; then suspend the audio graph instead of leaving it running idle.
    scheduleAudioSleep(true);
  }
  document.addEventListener("visibilitychange", () => {
    if (timerVisible()) {
      tick();
      ftTick();
      exerciseTick();
      updateExerciseTimerUI();
      if (ui.tab === "session") {
        markRounds(false);
        ui.focus ? renderFocus() : updTimer();
      }
      if (wantWake && timerRunning() && !wake) getWake();
    }
    scheduleTimers();
  });
  /* Music while training (iPhone): "pause" = bell and voice interrupt the music (default, works on silent mode);
       "mix" = music keeps playing and the bell sounds on top (needs the ring/silent switch on ring) */
  const audioSessionOk = () => typeof navigator !== "undefined" && "audioSession" in navigator;
  function applyAudioMode() {
    try {
      if (audioSessionOk()) navigator.audioSession.type = S.profile.mixMusic ? "ambient" : "auto";
    } catch (e) {}
  }
  const roundBlock = (sess) => sess && sess.blocks.find((b) => b.rounds);
  /* Round length and break come from the round block (tournament format in prep weeks); older sessions fall back */
  const workLen = (sess) => {
    const rb = roundBlock(sess);
    if (rb && rb.w) return rb.w;
    return rb && rb.items.some((i) => i.k !== "ex") ? 180 : 120;
  };
  const restLen = (sess) => {
    const rb = roundBlock(sess);
    return (rb && rb.b) || 60;
  };
  /* Timer phases: ready -> prep -> work -> rest -> work … -> done. Only start/resume is manual. */
  function newTimer(ds) {
    const sess = S.sessions[ds],
      total = roundBlock(sess).items.length,
      next = roundBlock(sess).items.findIndex((it, i) => !roundDone(sess, i + 1));
    return {
      ds,
      phase: "ready",
      // continue after the last completed round (e.g. after leaving the page)
      round: next < 0 ? 1 : next + 1,
      left: workLen(sess),
      work: workLen(sess),
      rest: restLen(sess),
      total,
      running: false,
    };
  }
  function tlabel(tm) {
    return tm.phase === "ready"
      ? t("startRound")(tm.round)
      : tm.phase === "done"
        ? t("reset")
        : tm.running
          ? t("stop")
          : t("resume");
  }

