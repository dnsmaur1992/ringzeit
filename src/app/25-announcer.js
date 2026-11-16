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
  /* 7l: chosen voice per language ({ id, name }; id = voiceURI or name) and the list of voices the device gives the app */
  const voiceKey = (v) => String(v.voiceURI || v.name || "");
  // Apple's novelty voices (Grandpa, Bells, Zarvox …) live under com.apple.speech.synthesis.voice.*, the Eloquence ones under com.apple.eloquence.*
  const voiceOdd = (v) => /eloquence|novelty|com\.apple\.speech\.synthesis\.voice\./i.test(`${v.name} ${v.voiceURI}`);
  const voicePickFor = (lg) => {
    const p = S.profile.voicePick && S.profile.voicePick[lg];
    return p && p.id ? p : null;
  };
  const voiceQual = (v) => {
    const id = `${v.name} ${v.voiceURI}`.toLowerCase();
    return /premium/.test(id) ? "premium" : /enhanced|erweitert|verbessert|neural|natural/.test(id) ? "enh" : "std";
  };
  function voiceList() {
    try {
      if (!canSpeak() || !speechSynthesis.getVoices) return [];
      const lg = S.profile.lang === "de" ? "de" : "en",
        rank = { premium: 0, enh: 1, std: 2 },
        seen = new Set();
      return (speechSynthesis.getVoices() || [])
        .filter((v) => String(v.lang || "").toLowerCase().replace("_", "-").startsWith(lg) && !voiceOdd(v))
        .filter((v) => !seen.has(voiceKey(v)) && seen.add(voiceKey(v)))
        .sort((a, b) => rank[voiceQual(a)] - rank[voiceQual(b)] || String(a.name).localeCompare(String(b.name)));
    } catch (e) {
      return [];
    }
  }
  /* sample with exactly this voice (from a tap, so iOS lets it speak) */
  function voiceProbe(id) {
    try {
      const v = voiceList().find((x) => voiceKey(x) === id);
      if (!v) return;
      const u = makeUtterance(t("voiceTest"));
      u.voice = v;
      u.lang = bcp47(v.lang) || (S.profile.lang === "de" ? "de-DE" : "en-GB");
      u.rate = 0.95;
      speechSynthesis.cancel();
      setTimeout(() => speechSynthesis.speak(u), 60);
    } catch (e) {}
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
      // 7l: the voice chosen under App & data comes first; if it is missing or failed (skip), the automatic choice follows
      const pick = voicePickFor(lg),
        mine = pick && vs.find((v) => voiceKey(v) === pick.id);
      if (mine) return mine;
      const score = (v) => {
        const id = `${v.name} ${v.voiceURI}`.toLowerCase();
        let sc = 0;
        if (/premium/.test(id)) sc += 30;
        else if (/enhanced|erweitert|verbessert/.test(id)) sc += 20;
        else if (/neural|natural/.test(id)) sc += 15;
        if (voiceOdd(v)) sc -= 20;
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
  /* The ONE place an utterance is born: every spoken text (coach, timers, free timer, focus page, Winter Arc mobility,
     breathing and meditation, voice sample, retries) gets the written-out wording here, so no path can bypass it.
     Retries pass the raw text again, so the expansion runs exactly once per utterance. */
  function makeUtterance(text) {
    return new SpeechSynthesisUtterance(spokenText(text));
  }
  function speakUtterance(text, rate, skip, started) {
    const u = makeUtterance(text);
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
  /* Spoken words in full (Betreiber 16.11.2026): the screen keeps "30 s", "2 min", "3 × 10", "5 Wdh.", the voice says
     "30 Sekunden", "2 Minuten", "3 mal 10", "5 Wiederholungen" – in German and English. */
  function spokenText(text) {
    const de = S.profile.lang === "de",
      one = (n) => /^1$/.test(n),
      U = de
        ? { s: ["Sekunde", "Sekunden"], min: ["Minute", "Minuten"], h: ["Stunde", "Stunden"], rep: ["Wiederholung", "Wiederholungen"], kg: ["Kilogramm", "Kilogramm"], km: ["Kilometer", "Kilometer"], m: ["Meter", "Meter"] }
        : { s: ["second", "seconds"], min: ["minute", "minutes"], h: ["hour", "hours"], rep: ["rep", "reps"], kg: ["kilogram", "kilograms"], km: ["kilometre", "kilometres"], m: ["metre", "metres"] },
      unit = (n, k) => `${n} ${U[k][one(n) ? 0 : 1]}`,
      N = "(\\d+(?:[.,]\\d+)?)";
    let s = String(text || "");
    const rx = (p, f) => (s = s.replace(new RegExp(p, "g"), f));
    // words with dots first
    if (de) {
      rx("\\bz\\.\\s?B\\.", "zum Beispiel");
      rx("\\bbzw\\.", "beziehungsweise");
      rx("\\bca\\.", "circa");
      rx("\\binkl\\.", "inklusive");
      rx("\\bmax\\.", "maximal");
      rx("\\bmind\\.", "mindestens");
      rx("\\bggf\\.", "gegebenenfalls");
      rx("\\bStd\\.", "Stunden");
      rx("(^|\\s)à(?=\\s)", "$1zu je");
    } else {
      rx("\\be\\.g\\.", "for example");
      rx("\\bapprox\\.", "approximately");
      rx("\\bmax\\.", "maximum");
      rx("\\bmin\\.(?=\\s+[a-z])", "minimum");
    }
    // ranges and times: "8–12" → "8 bis 12", "3 × 10" / "3×" → "3 mal 10"
    rx(N + "\\s?[–—]\\s?" + N, (m, a, b) => `${a} ${de ? "bis" : "to"} ${b}`);
    rx(N + "\\s?[×x](?=\\s|\\d|$)", (m, a) => `${a} ${de ? "mal" : "times"}`);
    // units after a number
    rx(N + "\\s?(?:Sek\\.?|sek\\.?|sec\\.?|s)(?![\\wäöüÄÖÜß])", (m, n) => unit(n, "s"));
    rx(N + "\\s?(?:Min\\.?|min\\.?|mins?)(?![\\wäöüÄÖÜß])", (m, n) => unit(n, "min"));
    rx(N + "\\s?(?:Std|h)(?![\\wäöüÄÖÜß.])", (m, n) => unit(n, "h"));
    rx(N + "\\s?(?:Wdh\\.?|Wh\\.?)(?![\\wäöüÄÖÜß])", (m, n) => unit(n, "rep"));
    rx(N + "\\s?kg(?![\\w])", (m, n) => unit(n, "kg"));
    rx(N + "\\s?km(?![\\w])", (m, n) => unit(n, "km"));
    rx(N + "\\s?m(?![\\wäöüÄÖÜß])", (m, n) => unit(n, "m"));
    rx(N + "\\s?%", (m, n) => `${n} ${de ? "Prozent" : "percent"}`);
    // the abbreviation on its own
    rx("\\bWdh\\.?(?![\\wäöüÄÖÜß])", de ? "Wiederholungen" : "reps");
    rx("\\bSek\\.(?=\\s|$)", de ? "Sekunden" : "seconds");
    rx("\\bMin\\.(?=\\s|$)", de ? "Minuten" : "minutes");
    // separators
    rx("\\s·\\s", ", ");
    return s;
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

