  /* ============ Round announcer: speaks round, exercise and combo once at the start of every round ============ */
  const SPEAK = {
    de: {
      round: "Roundhouse Körper",
      roundh: "High Kick Kopf",
      lowk: "Low Kick",
      hookk: "Hook Kick Kopf",
      hookb: "Körperhaken",
      upper: "Uppercut",
    },
    en: {
      round: "roundhouse body",
      roundh: "high kick head",
      lowk: "low kick",
      hookk: "hook kick head",
      hookb: "body hook",
      upper: "uppercut",
    },
  };
  const canSpeak = () =>
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";
  const voiceOn = () => canSpeak() && S.profile.voice !== false;
  function comboWords(c) {
    const lg = S.profile.lang,
      sd = sides(c),
      sp = SPEAK[lg];
    return c
      .map((x, i) => {
        const w = sp[x] || techNm(x, true);
        // the side is only spoken where it isn't obvious (jab and cross are always lead and rear)
        return sd[i] && !FIXED[x] && !tkm().FIXED[x]
          ? `${w} ${lg === "de" ? (sd[i] === "L" ? "vorne" : "hinten") : sd[i] === "L" ? "lead" : "rear"}`
          : w;
      })
      .join(", ");
  }
  /* The best installed voice for the app language: premium/enhanced voices first, novelty and online-only voices last
     (the app runs offline in the gym). No voice found: the device default is used. */
  function bestVoice(skip = []) {
    try {
      if (!canSpeak() || !speechSynthesis.getVoices) return null;
      if (skip.includes("*")) return null; // last resort: no explicit voice, the engine picks one for the language
      const lg = S.profile.lang === "de" ? "de" : "en",
        want = lg === "de" ? "de-de" : "en-gb",
        norm = (v) => String(v.lang || "").toLowerCase().replace("_", "-"),
        vs = (speechSynthesis.getVoices() || []).filter((v) => norm(v).startsWith(lg) && !skip.includes(v.voiceURI || v.name));
      if (!vs.length) return null;
      const score = (v) => {
        const id = `${v.name} ${v.voiceURI}`.toLowerCase();
        let sc = 0;
        if (/premium/.test(id)) sc += 30;
        else if (/enhanced|erweitert|verbessert/.test(id)) sc += 20;
        else if (/neural|natural/.test(id)) sc += 15;
        if (/eloquence|novelty/.test(id)) sc -= 20;
        if (v.localService === false) sc -= 12;
        if (norm(v) === want) sc += 3;
        if (v.default) sc += 1;
        return sc;
      };
      return vs.slice().sort((a, b) => score(b) - score(a))[0];
    } catch (e) {
      return null;
    }
  }
  try {
    if (canSpeak() && speechSynthesis.addEventListener)
      speechSynthesis.addEventListener("voiceschanged", () => {
        if (ui.tab === "profile" && ui.profSec === "app") render();
      });
    // Chrome (esp. on Android) loads the voice list lazily: asking once at start makes it available for the first call
    if (canSpeak() && speechSynthesis.getVoices) speechSynthesis.getVoices();
  } catch (e) {}
  /* Android engines report "de_DE"; an utterance needs the BCP-47 form "de-DE", otherwise some engines pick the default (English) voice */
  const bcp47 = (lang) => {
    const [a, b] = String(lang || "").replace("_", "-").split("-");
    return a ? a.toLowerCase() + (b ? "-" + b.toUpperCase() : "") : "";
  };
  /* last failed announcement (shown in the profile so a silent device can be diagnosed) */
  let speechFail = null;
  function applyVoice(u, skip) {
    u.lang = S.profile.lang === "de" ? "de-DE" : "en-GB";
    const v = bestVoice(skip);
    if (v) {
      u.voice = v;
      u.lang = bcp47(v.lang) || u.lang;
    }
  }
  /* A voice that cannot speak (data not installed, engine busy): once more with the next best voice, then with the language alone */
  const SPEECH_RETRY = ["synthesis-failed", "language-unavailable", "voice-unavailable", "synthesis-unavailable", "audio-busy", "audio-hardware", "network"];
  function speakUtterance(text, rate, skip, started) {
    const u = new SpeechSynthesisUtterance(text);
    applyVoice(u, skip);
    u.rate = rate;
    u.onerror = (ev) => {
      const code = (ev && ev.error) || "error";
      if (code === "canceled" || code === "interrupted") return;
      speechFail = { code, voice: u.voice ? u.voice.name : "", at: Date.now() };
      if (!SPEECH_RETRY.includes(code) || Date.now() - started > 3000 || skip.includes("*")) return;
      // first failure: next best voice; second failure (or no explicit voice): language only; then give up
      const next = u.voice && !skip.length ? [u.voice.voiceURI || u.voice.name] : ["*"];
      setTimeout(() => {
        try {
          speechSynthesis.speak(speakUtterance(text, rate, next, started));
        } catch (e) {}
      }, 150);
    };
    return u;
  }
  function say(text, rate = 1) {
    if (!voiceOn()) return;
    try {
      const u = speakUtterance(text, rate, [], Date.now());
      // iOS Safari drops an utterance spoken right after cancel() and sometimes leaves the synth paused
      const busy = (speechSynthesis.speaking || speechSynthesis.pending) && !primeU;
      if (busy) speechSynthesis.cancel();
      if (speechSynthesis.paused) speechSynthesis.resume();
      if (busy) setTimeout(() => speechSynthesis.speak(u), 80);
      else speechSynthesis.speak(u);
    } catch (e) {}
  }
  /* Announces the round once at its start, slowly and clearly: round number, exercise and (if any) the combo */
  function callTick(tm) {
    const round = tm.phase === "rest" ? tm.round + 1 : tm.round;
    if (!voiceOn() || !["work", "prep", "rest"].includes(tm.phase) || tm.called === round || round > tm.total)
      return;
    const sess = S.sessions[tm.ds],
      rb = roundBlock(sess),
      it = rb && rb.items[round - 1];
    if (!it) return;
    unitStyle = sess.sport === "taekwondo" ? sess.tstyle || null : null;
    tm.called = round;
    const info = roundInfo(it),
      de = S.profile.lang === "de",
      text = `${de ? "Runde" : "Round"} ${round}. ${info.title}.${it.combo ? " " + comboWords(it.combo) + "." : ""}`; // counter actions are shown, not spoken
    queueTimerSpeech(
      text,
      300,
      () =>
        ui.timer === tm &&
        tm.running &&
        tm.called === round &&
        ((tm.phase === "rest" && tm.round + 1 === round) || (tm.phase !== "rest" && tm.round === round)),
      0.88,
    );
  }

