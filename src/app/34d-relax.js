  /* ============ Relax (7k): guided breathing and spoken meditations to wind down – ported from Studio Care ============
     Breathing: the voice leads the first cycles ("in – hold – out"), then hands over ("keep this rhythm") and only a soft
     tone marks the changes. Meditations: own texts (body scan, strengthen, fall asleep) spread over 10–30 minutes; the
     pauses between the sentences grow with the length. A near-black screen saves power on OLED displays (the backlight
     itself can't be changed by a web app); the screen stays awake like the round timer. The voice always speaks "du". */
  const RX_PAT = {
    calm: [["in", 4], ["out", 6]],
    box: [["in", 4], ["hold", 4], ["out", 4], ["hold", 4]],
    sleep: [["in", 4], ["hold", 7], ["out", 8]],
  };
  const RX_BMIN = [2, 4, 6, 10],
    RX_MLEN = [10, 15, 20, 30],
    RX_GUIDE = 3; // cycles spoken in full before the voice hands over
  /* meditation scripts: [text, pause weight after it, shortest length (min) that includes it] */
  const RX_MED = {
    de: {
      scan: [
        ["Schön, dass du da bist. Such dir eine bequeme Position, im Sitzen oder im Liegen.", 1],
        ["Wenn es sich gut anfühlt, schließ die Augen. Du musst jetzt nichts leisten. Diese Zeit gehört dir.", 2],
        ["Atme einmal tief ein … und lass die Luft ganz langsam wieder hinaus.", 2],
        ["Spür, wie dein Körper getragen wird. Der Boden hält dich. Du darfst schwer werden.", 2],
        ["Nimm die Geräusche um dich herum wahr. Sie dürfen da sein. Sie ziehen einfach vorbei.", 2, 15],
        ["Lenk deine Aufmerksamkeit jetzt zu deinen Füßen. Spür die Zehen, die Sohlen, die Fersen. Lass sie ganz locker werden.", 3],
        ["Wandere weiter zu deinen Unterschenkeln und Knien. Alles, was angespannt ist, darf jetzt weich werden.", 3],
        ["Deine Oberschenkel. Sie tragen dich jeden Tag, durch jedes Training. Schenk ihnen einen Moment Ruhe.", 3],
        ["Spür dein Becken und deinen unteren Rücken. Mit jedem Ausatmen sinkst du ein kleines Stück tiefer.", 3],
        ["Dein Bauch hebt und senkt sich ganz von allein. Du musst nichts tun. Der Atem atmet dich.", 3],
        ["Spür deinen Brustkorb. Dein Herz schlägt ruhig und gleichmäßig. Es ist immer für dich da.", 3, 20],
        ["Deine Schultern dürfen jetzt sinken. Lass los, was du heute getragen hast.", 3],
        ["Spür deine Arme, die Ellbogen, die Unterarme, bis in die Hände und Fingerspitzen. Schwer und warm.", 3],
        ["Dein Nacken wird lang und weich. Dein Kiefer darf sich lösen, die Zunge liegt locker.", 3],
        ["Deine Stirn wird glatt. Rund um die Augen wird alles ganz ruhig.", 3],
        ["Spür jetzt deinen ganzen Körper auf einmal, von den Zehen bis zum Scheitel. Ruhig, warm und ganz.", 4, 20],
        ["Bleib einfach hier, beim Atem. Wenn Gedanken kommen, ist das in Ordnung. Nimm sie wahr und kehr freundlich zum Atem zurück.", 6, 30],
        ["Sag dir innerlich: Ich bin ruhig. Ich bin bei mir. Ich bin genug.", 4, 15],
        ["Du hast dir gerade etwas Gutes getan. Diese Ruhe findest du jederzeit wieder, mit ein paar tiefen Atemzügen.", 2],
        ["Komm jetzt langsam zurück. Beweg sanft deine Finger und Zehen. Atme einmal tief ein.", 1.5],
        ["Und wenn du so weit bist, öffne die Augen. Nimm diese Ruhe mit.", 0.3],
      ],
      strong: [
        ["Willkommen. Setz dich aufrecht und bequem hin. Deine Füße stehen fest auf dem Boden.", 1],
        ["Schließ die Augen und atme tief ein. Beim Ausatmen lässt du den Tag hinter dir.", 2],
        ["Spür deine Füße auf dem Boden. Du stehst fest. Du bist geerdet.", 2],
        ["Atme ruhig weiter. Mit jedem Einatmen kommt neue Kraft. Mit jedem Ausatmen geht, was dich schwer macht.", 3],
        ["Denk an einen Moment, in dem du stolz auf dich warst. Im Training, im Wettkampf oder im Alltag. Sieh ihn vor dir.", 4, 15],
        ["Spür, wie sich das angefühlt hat. Diese Stärke ist ein Teil von dir. Sie ist immer da.", 3],
        ["Sag dir innerlich: Ich bin stark.", 3],
        ["Ich vertraue meinem Körper und meinem Training.", 3],
        ["Ich gebe mein Bestes. Und mein Bestes ist genug.", 3],
        ["Rückschläge gehören dazu. Sie machen mich nicht kleiner. Ich lerne und wachse daran.", 3, 20],
        ["Ich bleibe ruhig, auch wenn es hart wird. Mein Atem ist mein Anker.", 3],
        ["Stell dir vor, wie du in dein nächstes Training gehst. Konzentriert, wach und mit Freude. Du bist bereit.", 4, 20],
        ["Bleib einen Moment bei deinem Atem. Ruhig ein, ruhig aus. Spür die Kraft, die in dieser Ruhe liegt.", 6, 30],
        ["Du musst niemandem etwas beweisen. Du gehst deinen Weg, Schritt für Schritt.", 3, 15],
        ["Ich bin stark. Ich bin ruhig. Ich bin bereit.", 3],
        ["Atme noch einmal tief ein … und lass los.", 2],
        ["Komm langsam zurück, beweg Finger und Zehen. Öffne die Augen, wenn du so weit bist. Du kannst stolz auf dich sein.", 0.3],
      ],
      sleep: [
        ["Leg dich bequem hin und deck dich zu. Der Tag ist vorbei. Jetzt ist Zeit zum Ausruhen.", 1],
        ["Schließ die Augen. Atme langsam ein … und noch langsamer wieder aus.", 2],
        ["Alles, was heute war, darf jetzt ruhen. Du hast genug getan.", 2],
        ["Spür, wie das Bett dich trägt. Du musst dich nicht mehr festhalten.", 2],
        ["Deine Füße werden schwer und warm.", 3],
        ["Deine Beine werden schwer und warm. Sie sinken tiefer in das Bett.", 3],
        ["Dein Bauch wird weich. Der Atem fließt ganz von allein.", 3],
        ["Dein Rücken darf loslassen, Stück für Stück.", 3, 15],
        ["Deine Schultern sinken. Deine Arme werden schwer, bis in die Fingerspitzen.", 3],
        ["Dein Gesicht entspannt sich. Die Stirn, die Augen, der Mund.", 3],
        ["Stell dir einen Ort vor, an dem du dich ganz sicher fühlst. Es ist warm, es ist still, nichts wird von dir erwartet.", 5, 20],
        ["Wenn Gedanken kommen, lass sie vorbeiziehen wie Wolken. Du musst ihnen nicht folgen.", 4, 15],
        ["Zähl deine Atemzüge rückwärts, von zehn bis eins. Und wenn du dich verzählst, fang einfach von vorn an.", 6, 30],
        ["Du bist sicher. Du bist ruhig. Du darfst jetzt schlafen.", 3],
        ["Ich lasse dich jetzt in der Stille. Schlaf gut.", 6],
      ],
    },
    en: {
      scan: [
        ["Good to have you here. Find a comfortable position, sitting or lying down.", 1],
        ["If it feels right, close your eyes. There is nothing you need to achieve now. This time is yours.", 2],
        ["Take one deep breath in … and let the air flow out very slowly.", 2],
        ["Feel how your body is carried. The ground holds you. You can let yourself get heavy.", 2],
        ["Notice the sounds around you. They can be there. They simply pass by.", 2, 15],
        ["Now bring your attention to your feet. Feel your toes, your soles, your heels. Let them soften completely.", 3],
        ["Move on to your lower legs and knees. Whatever is tense can become soft now.", 3],
        ["Your thighs. They carry you every day, through every training. Give them a moment of rest.", 3],
        ["Feel your hips and your lower back. With every breath out you sink a little deeper.", 3],
        ["Your belly rises and falls all by itself. You don't need to do anything. The breath breathes you.", 3],
        ["Feel your chest. Your heart beats calmly and steadily. It is always there for you.", 3, 20],
        ["Let your shoulders drop now. Let go of what you carried today.", 3],
        ["Feel your arms, your elbows, your forearms, all the way into your hands and fingertips. Heavy and warm.", 3],
        ["Your neck grows long and soft. Your jaw can loosen, your tongue rests easy.", 3],
        ["Your forehead becomes smooth. Everything around your eyes grows quiet.", 3],
        ["Now feel your whole body at once, from your toes to the top of your head. Calm, warm and whole.", 4, 20],
        ["Simply stay here, with your breath. If thoughts come, that's fine. Notice them and kindly return to your breath.", 6, 30],
        ["Say to yourself: I am calm. I am here. I am enough.", 4, 15],
        ["You just did something good for yourself. You can find this calm again anytime, with a few deep breaths.", 2],
        ["Now slowly come back. Gently move your fingers and toes. Take one deep breath in.", 1.5],
        ["And when you're ready, open your eyes. Take this calm with you.", 0.3],
      ],
      strong: [
        ["Welcome. Sit upright and comfortably. Your feet rest firmly on the floor.", 1],
        ["Close your eyes and breathe in deeply. As you breathe out, leave the day behind you.", 2],
        ["Feel your feet on the floor. You stand firm. You are grounded.", 2],
        ["Keep breathing calmly. Every breath in brings new strength. Every breath out lets go of what weighs you down.", 3],
        ["Think of a moment when you were proud of yourself. In training, in a fight or in everyday life. See it in front of you.", 4, 15],
        ["Feel how that felt. This strength is part of you. It is always there.", 3],
        ["Say to yourself: I am strong.", 3],
        ["I trust my body and my training.", 3],
        ["I give my best. And my best is enough.", 3],
        ["Setbacks are part of it. They don't make me smaller. I learn and grow from them.", 3, 20],
        ["I stay calm, even when it gets hard. My breath is my anchor.", 3],
        ["Picture yourself walking into your next training. Focused, awake and with joy. You are ready.", 4, 20],
        ["Stay with your breath for a moment. Calm in, calm out. Feel the strength that lies in this calm.", 6, 30],
        ["You don't have to prove anything to anyone. You walk your own path, step by step.", 3, 15],
        ["I am strong. I am calm. I am ready.", 3],
        ["Take one more deep breath in … and let go.", 2],
        ["Slowly come back, move your fingers and toes. Open your eyes when you're ready. You can be proud of yourself.", 0.3],
      ],
      sleep: [
        ["Lie down comfortably and pull up your blanket. The day is over. Now it's time to rest.", 1],
        ["Close your eyes. Breathe in slowly … and out even more slowly.", 2],
        ["Everything that happened today can rest now. You have done enough.", 2],
        ["Feel how the bed carries you. You don't need to hold on any more.", 2],
        ["Your feet become heavy and warm.", 3],
        ["Your legs become heavy and warm. They sink deeper into the bed.", 3],
        ["Your belly softens. The breath flows all by itself.", 3],
        ["Your back can let go, bit by bit.", 3, 15],
        ["Your shoulders drop. Your arms become heavy, all the way to your fingertips.", 3],
        ["Your face relaxes. Your forehead, your eyes, your mouth.", 3],
        ["Imagine a place where you feel completely safe. It is warm, it is quiet, nothing is expected of you.", 5, 20],
        ["If thoughts come, let them drift by like clouds. You don't have to follow them.", 4, 15],
        ["Count your breaths backwards, from ten to one. And if you lose count, simply start again.", 6, 30],
        ["You are safe. You are calm. You may sleep now.", 3],
        ["I'll leave you in the quiet now. Sleep well.", 6],
      ],
    },
  };
  const RXT = {
    de: {
      title: "Entspannen",
      intro: "Runterfahren, durchatmen, Kraft sammeln. Am besten mit Kopfhörern, an einem ruhigen Ort.",
      breath: "Atemübung",
      med: "Meditation",
      pats: { calm: "Runterfahren", box: "Box-Atmung", sleep: "Einschlafen" },
      patInfo: {
        calm: "4 Sekunden ein, 6 Sekunden aus. Das längere Ausatmen beruhigt.",
        box: "4 ein · 4 halten · 4 aus · 4 halten. Sammelt dich, z. B. vor einem Kampf oder einer Prüfung.",
        sleep: "4 ein · 7 halten · 8 aus. Sehr ruhig, gut zum Einschlafen.",
      },
      kinds: { scan: "Body-Scan", strong: "Stärken", sleep: "Einschlafen" },
      kindInfo: {
        scan: "Aufmerksamkeit Schritt für Schritt durch den Körper. Lässt Spannung los.",
        strong: "Atem, Haltung und stärkende Sätze. Für Selbstvertrauen und einen klaren Kopf.",
        sleep: "Schwer und warm werden, Gedanken ziehen lassen. Endet leise, ohne Zurückholen.",
      },
      dur: "Dauer",
      voice: "Stimme",
      tone: "Leiser Ton beim Wechsel",
      start: "Starten",
      again: "Noch einmal",
      close: "Schließen",
      stop: "Beenden",
      eyes: "Augen zu – ich führe dich.",
      tap: "Antippen für mehr Licht",
      noVoice: "Dieses Gerät hat keine Sprachausgabe. Die Übung läuft mit Kreis und Ton.",
      mute: "Stummschalter auf Ton stellen, sonst bleibt die Stimme still.",
      safe: "Bei Schwindel einfach normal weiteratmen. Bei Atemnot oder Herzrasen bitte ärztlich abklären. Lange Haltephasen nicht in der Schwangerschaft oder bei Herzproblemen ohne Rücksprache.",
      done: "Schön gemacht.",
      doneSub: "Spür kurz nach, wie es dir jetzt geht.",
      evening: "Später Abend – zum Einschlafen vorausgewählt.",
      ph: { in: "Einatmen", hold: "Halten", out: "Ausatmen" },
      sIntro: {
        calm: "Mach es dir bequem. Wir atmen vier Sekunden ein und sechs Sekunden aus. Ich begleite dich durch die ersten Atemzüge.",
        box: "Setz dich aufrecht hin. Wir atmen im Quadrat: vier ein, vier halten, vier aus, vier halten. Ich zähle die ersten Runden mit dir.",
        sleep: "Leg dich bequem hin. Vier ein, sieben halten, acht aus. Ich begleite dich durch die ersten Atemzüge.",
      },
      sHand: "Gut so. Halte diesen Rhythmus jetzt selbst. Ich bin da und begleite dich leise.",
      sEnc: [
        "Du machst das gut.",
        "Mit jedem Ausatmen darf etwas mehr Spannung gehen.",
        "Du musst gerade nichts leisten. Nur atmen.",
        "Bleib freundlich mit dir. Jeder Atemzug zählt.",
        "Spür, wie ruhig du werden kannst.",
      ],
      sLast: "Noch drei Atemzüge.",
      sEnd: {
        calm: "Lass den Atem jetzt wieder frei fließen. Schön, dass du dir diese Zeit genommen hast. Du hast heute etwas Gutes für dich getan.",
        box: "Lass den Atem wieder frei fließen. Du bist ruhig, klar und bereit.",
        sleep: "Lass den Atem jetzt einfach geschehen. Du darfst loslassen. Schlaf gut.",
      },
      card: (m) => `Ruhetag – ${m} Minuten runterfahren?`,
      cardDeload: (m) => `Entlastungswoche – ${m} Minuten bewusst durchatmen?`,
      cardBtn: "Atmen",
      cardMore: "Mehr",
      lifeRow: "Atemübungen und Meditationen zum Runterfahren und Kraft sammeln",
    },
    en: {
      title: "Relax",
      intro: "Wind down, breathe, gather strength. Best with headphones, somewhere quiet.",
      breath: "Breathing",
      med: "Meditation",
      pats: { calm: "Wind down", box: "Box breathing", sleep: "Fall asleep" },
      patInfo: {
        calm: "4 seconds in, 6 seconds out. The longer exhale calms you.",
        box: "4 in · 4 hold · 4 out · 4 hold. Centres you, e.g. before a fight or a grading.",
        sleep: "4 in · 7 hold · 8 out. Very calm, good for falling asleep.",
      },
      kinds: { scan: "Body scan", strong: "Strengthen", sleep: "Fall asleep" },
      kindInfo: {
        scan: "Attention moves step by step through the body. Lets tension go.",
        strong: "Breath, posture and strengthening words. For self-confidence and a clear head.",
        sleep: "Grow heavy and warm, let thoughts drift. Ends softly without bringing you back.",
      },
      dur: "Length",
      voice: "Voice",
      tone: "Soft tone on each change",
      start: "Start",
      again: "Again",
      close: "Close",
      stop: "Stop",
      eyes: "Eyes closed – I'll guide you.",
      tap: "Tap for more light",
      noVoice: "This device has no speech output. The exercise runs with circle and tone.",
      mute: "Set the side switch to sound, or the voice stays silent.",
      safe: "If you feel dizzy, simply breathe normally. With shortness of breath or a racing heart, please see a doctor. Long breath holds only after medical advice during pregnancy or with heart problems.",
      done: "Well done.",
      doneSub: "Notice for a moment how you feel now.",
      evening: "Late evening – fall asleep preselected.",
      ph: { in: "Breathe in", hold: "Hold", out: "Breathe out" },
      sIntro: {
        calm: "Make yourself comfortable. We breathe in for four seconds and out for six. I'll guide you through the first breaths.",
        box: "Sit upright. We breathe in a square: four in, four hold, four out, four hold. I'll count the first rounds with you.",
        sleep: "Lie down comfortably. Four in, seven hold, eight out. I'll guide you through the first breaths.",
      },
      sHand: "Good. Now keep this rhythm on your own. I'm here and stay with you quietly.",
      sEnc: [
        "You're doing well.",
        "With every breath out, a little more tension can go.",
        "There is nothing to achieve right now. Just breathe.",
        "Be kind to yourself. Every breath counts.",
        "Feel how calm you can become.",
      ],
      sLast: "Three more breaths.",
      sEnd: {
        calm: "Now let your breath flow freely again. Good that you took this time. You did something good for yourself today.",
        box: "Let your breath flow freely again. You are calm, clear and ready.",
        sleep: "Now simply let the breath happen. You may let go. Sleep well.",
      },
      card: (m) => `Rest day – ${m} minutes to wind down?`,
      cardDeload: (m) => `Deload week – ${m} minutes of mindful breathing?`,
      cardBtn: "Breathe",
      cardMore: "More",
      lifeRow: "Breathing and meditations to wind down and gather strength",
    },
  };
  const rxT = () => RXT[S.profile.lang] || RXT.de;
  const rxEvening = (d = new Date()) => d.getHours() >= 20 || d.getHours() < 4;
  /* stored choices (per device, in the profile so a backup keeps them) */
  function rxPrefs() {
    const p = S.profile.relax && typeof S.profile.relax === "object" ? S.profile.relax : {};
    return {
      mode: p.mode === "med" ? "med" : "breath",
      pat: RX_PAT[p.pat] ? p.pat : "calm",
      bmin: RX_BMIN.includes(p.bmin) ? p.bmin : 4,
      kind: RX_MED.de[p.kind] ? p.kind : "scan",
      mlen: RX_MLEN.includes(p.mlen) ? p.mlen : 10,
      voice: p.voice !== false,
      tone: p.tone !== false,
    };
  }
  const rxSave = (o) => {
    S.profile.relax = Object.assign(rxPrefs(), o);
    store.save();
  };
  /* breathing schedule: whole cycles that fit into the chosen minutes (at least 4) */
  function rxBreathPlan(pat, min) {
    const ph = RX_PAT[pat],
      cyc = ph.reduce((s, x) => s + x[1], 0),
      n = Math.max(4, Math.round((min * 60) / cyc));
    return { ph, cyc, n, total: n * cyc };
  }
  function rxBreathAt(plan, t) {
    const c = Math.floor(t / plan.cyc);
    let k = t - c * plan.cyc,
      i = 0;
    while (i < plan.ph.length - 1 && k >= plan.ph[i][1]) k -= plan.ph[i++][1];
    return { c, i, ph: plan.ph[i][0], left: plan.ph[i][1] - k };
  }
  /* meditation timeline: sentences for the chosen length; spoken time is estimated (≈2.1 words/s at the calm rate),
     the rest of the minutes is spread over the pauses by their weights */
  const rxSpeakSec = (tx) => tx.split(/\s+/).length / 2.1 + 1;
  function rxMedPlan(kind, len, lang) {
    const lines = ((RX_MED[lang] || RX_MED.de)[kind] || []).filter((x) => !x[2] || len >= x[2]),
      total = len * 60,
      lead = 3,
      speak = lines.reduce((s, x) => s + rxSpeakSec(x[0]), 0),
      w = lines.reduce((s, x) => s + x[1], 0),
      free = Math.max(lines.length * 2, total - lead - speak);
    let at = lead;
    const steps = lines.map((x) => {
      const st = { at: Math.round(at), tx: x[0] };
      at += rxSpeakSec(x[0]) + (free * x[1]) / w;
      return st;
    });
    return { steps, total };
  }
  /* soft sine tone (much quieter than the bells) */
  function rxTone(f) {
    withAudio(() => {
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const o = actx.createOscillator(),
          g = actx.createGain(),
          s = actx.currentTime;
        o.type = "sine";
        o.frequency.value = f;
        o.connect(g);
        g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.07, s + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 1.1);
        o.start(s);
        o.stop(s + 1.2);
      } catch (e) {}
    });
  }
  /* calm voice: own switch (independent of the coach voice), slower rate, never cuts a running sentence off */
  function rxSay(tx) {
    const r = ui.relax;
    if (!r || !r.voice || !canSpeak()) return;
    try {
      if (speechSynthesis.paused) speechSynthesis.resume();
      speechSynthesis.speak(speakUtterance(tx, 0.85, [], Date.now()));
    } catch (e) {}
  }
  const relaxRunning = () => !!(ui.relax && ui.relax.run);
  function relaxOpen(o = {}) {
    const p = rxPrefs(),
      eve = rxEvening();
    ui.relax = Object.assign({ phase: "setup", eve: eve && !o.mode }, p, eve && !o.mode ? { pat: "sleep", kind: "sleep" } : {}, o);
    renderRelax();
  }
  function relaxStart() {
    const r = ui.relax;
    rxSave({ mode: r.mode, pat: r.pat, bmin: r.bmin, kind: r.kind, mlen: r.mlen, voice: r.voice, tone: r.tone });
    unlockAudio();
    Object.assign(r, { phase: "run", run: true, start: Date.now(), last: null, said: {}, idx: 0, enc: 0, line: "" });
    r.plan = r.mode === "breath" ? rxBreathPlan(r.pat, r.bmin) : rxMedPlan(r.kind, r.mlen, S.profile.lang);
    if (r.mode === "breath") rxSay(rxT().sIntro[r.pat]);
    syncTimers();
    renderRelax();
    clearInterval(relaxStart.iv);
    relaxStart.iv = setInterval(relaxTick, 200);
    // the breathing starts after the spoken intro (about 8 s); the meditation starts with its first sentence
    if (r.mode === "breath") r.start = Date.now() + (r.voice && canSpeak() ? 8000 : 1500);
  }
  function relaxStop(done) {
    const r = ui.relax;
    if (!r) return;
    clearInterval(relaxStart.iv);
    r.run = false;
    try {
      if (!done && canSpeak()) speechSynthesis.cancel();
    } catch (e) {}
    r.phase = done ? "done" : "setup";
    syncTimers();
    renderRelax();
  }
  function relaxClose() {
    if (relaxRunning()) relaxStop(false);
    ui.relax = null;
    renderRelax();
  }
  function relaxTick() {
    const r = ui.relax;
    if (!r || !r.run) return clearInterval(relaxStart.iv);
    const L = rxT(),
      t = (Date.now() - r.start) / 1000,
      tot = r.plan.total;
    if (t >= tot) {
      if (r.mode === "breath") rxSay(L.sEnd[r.pat]);
      if (r.tone && !(r.mode === "breath" ? r.pat === "sleep" : r.kind === "sleep")) rxTone(528);
      return relaxStop(true);
    }
    const clk = document.getElementById("rxclk");
    if (clk) clk.textContent = fmt(Math.ceil(tot - Math.max(0, t)));
    if (t < 0) return;
    if (r.mode === "breath") {
      const s = rxBreathAt(r.plan, t),
        key = s.c + ":" + s.i;
      if (key === r.last) return;
      r.last = key;
      const ball = document.getElementById("rxball"),
        tx = document.getElementById("rxph");
      if (ball) {
        ball.style.transitionDuration = Math.max(0.5, s.left) + "s";
        ball.classList.toggle("in", s.ph === "in" || (s.ph === "hold" && r.plan.ph[s.i - 1] && r.plan.ph[s.i - 1][0] === "in"));
      }
      if (tx) tx.textContent = L.ph[s.ph];
      if (s.c < RX_GUIDE) rxSay(L.ph[s.ph]);
      else if (s.c === RX_GUIDE && s.i === 0) rxSay(L.sHand);
      else if (s.c === r.plan.n - 3 && s.i === 0) rxSay(L.sLast);
      else if (s.i === 0 && s.c > RX_GUIDE + 1 && s.c < r.plan.n - 4 && t >= (r.enc + 1) * 120) {
        rxSay(L.sEnc[r.enc % L.sEnc.length]);
        r.enc++;
      }
      if (r.tone && s.c >= RX_GUIDE && s.ph !== "hold") rxTone(s.ph === "in" ? 392 : 294);
    } else {
      const st = r.plan.steps;
      while (r.idx < st.length && t >= st[r.idx].at) {
        // after a return to the app only the current sentence is spoken, missed ones are skipped
        const late = r.idx + 1 < st.length && t >= st[r.idx + 1].at;
        if (!late) rxSay(st[r.idx].tx);
        r.line = st[r.idx].tx;
        r.idx++;
        const el = document.getElementById("rxline");
        if (el && !late) el.textContent = r.line;
      }
    }
  }
  function relaxPanelHtml() {
    // compact entry for "Everyday life & breaks"
    const L = rxT();
    return `<div class="panel"><div class="field"><span class="lab">${L.title}</span><span class="sub">${L.lifeRow}</span><div class="inline"><button type="button" class="btn" data-rx="open" data-rv="breath">🌬️ ${L.breath}</button><button type="button" class="btn sec" data-rx="open" data-rv="med">🌙 ${L.med}</button></div></div></div>`;
  }
  function relaxCardHtml(deload) {
    // small card on Today: rest days and deload weeks (the evening offers the sleep variant inside the relax screen)
    const L = rxT(),
      p = rxPrefs();
    return `<div class="note act rxcard"><span>${esc((deload ? L.cardDeload : L.card)(p.bmin))}</span><span class="minirow"><button type="button" class="btn ghost" data-rx="quick">${L.cardBtn}</button><button type="button" class="btn ghost" data-rx="open">${L.cardMore}</button></span></div>`;
  }
  function renderRelax() {
    const el = document.getElementById("relax"),
      r = ui.relax;
    if (!el) return;
    if (!r) {
      el.hidden = true;
      el.innerHTML = "";
      document.body?.classList?.remove("rxon");
      return;
    }
    el.hidden = false;
    document.body?.classList?.add("rxon");
    const L = rxT(),
      seg = (k, opts, cur, lbl) =>
        `<div class="seg">${opts.map((o) => `<button type="button" data-rx="set" data-rk="${k}" data-rv="${o}" aria-pressed="${String(cur) === String(o)}">${lbl ? lbl(o) : o}</button>`).join("")}</div>`;
    if (r.phase === "run") {
      const med = r.mode === "med";
      el.className = "relax run" + (r.bright ? " bright" : "");
      el.innerHTML = `<div class="rxtop"><span>${esc(med ? L.kinds[r.kind] : L.pats[r.pat])}</span><span id="rxclk" class="num">${fmt(Math.ceil(r.plan.total))}</span></div>
        <div class="rxball${med ? " med" : ""}" id="rxball" aria-hidden="true"><i></i></div>
        ${med ? `<p class="rxline" id="rxline" aria-live="polite">${esc(r.line || L.eyes)}</p>` : `<p class="rxph" id="rxph" aria-live="polite">${esc(L.ph.in)}</p>`}
        <p class="rxhint">${L.tap}</p>
        <button type="button" class="btn ghost rxstop" data-rx="stop">${L.stop}</button>`;
      return;
    }
    el.className = "relax";
    const done = r.phase === "done";
    let h = `<div class="fbar"><button type="button" class="x" data-rx="close" aria-label="×">✕</button><span>${L.title}</span><span style="width:40px"></span></div>`;
    if (done)
      h += `<div class="rxdone"><div class="rxball idle" aria-hidden="true"><i></i></div><h2>${L.done}</h2><p class="sub">${L.doneSub}</p></div><div class="inline" style="justify-content:center"><button type="button" class="btn" data-rx="start">${L.again}</button><button type="button" class="btn sec" data-rx="close">${L.close}</button></div>`;
    else {
      h += `<p class="sub">${L.intro}</p>${r.eve ? `<p class="sub rxeve">${L.evening}</p>` : ""}`;
      h += seg("mode", ["breath", "med"], r.mode, (o) => (o === "breath" ? L.breath : L.med));
      if (r.mode === "breath")
        h += `<div class="field"><div class="seg">${Object.keys(RX_PAT).map((k) => `<button type="button" data-rx="set" data-rk="pat" data-rv="${k}" aria-pressed="${r.pat === k}">${L.pats[k]}</button>`).join("")}</div><span class="sub">${L.patInfo[r.pat]}</span></div>
          <div class="field"><span class="lab">${L.dur}</span>${seg("bmin", RX_BMIN, r.bmin, (m) => `${m} ${t("min")}`)}</div>`;
      else
        h += `<div class="field"><div class="seg">${Object.keys(RX_MED.de).map((k) => `<button type="button" data-rx="set" data-rk="kind" data-rv="${k}" aria-pressed="${r.kind === k}">${L.kinds[k]}</button>`).join("")}</div><span class="sub">${L.kindInfo[r.kind]}</span></div>
          <div class="field"><span class="lab">${L.dur}</span>${seg("mlen", RX_MLEN, r.mlen, (m) => `${m} ${t("min")}`)}</div>`;
      h += `<div class="field"><label class="chk"><input type="checkbox" data-rxchk="voice" ${r.voice ? "checked" : ""}> ${L.voice}</label>${r.mode === "breath" ? `<label class="chk"><input type="checkbox" data-rxchk="tone" ${r.tone ? "checked" : ""}> ${L.tone}</label>` : ""}<span class="sub">${canSpeak() ? L.mute : L.noVoice}</span></div>`;
      h += `<button type="button" class="btn rxgo" data-rx="start">${L.start}</button><p class="sub">${L.safe}</p>`;
    }
    el.innerHTML = h;
  }
  function relaxAction(a, ds) {
    const r = ui.relax;
    if (a === "open") return relaxOpen(ds.rv ? { mode: ds.rv } : {});
    if (a === "quick") {
      relaxOpen({ mode: "breath", pat: "calm", bmin: rxPrefs().bmin });
      return relaxStart();
    }
    if (!r) return;
    if (a === "close") return relaxClose();
    if (a === "stop") return relaxStop(false);
    if (a === "start") return relaxStart();
    if (a === "set") {
      const k = ds.rk;
      r[k] = ["bmin", "mlen"].includes(k) ? +ds.rv : ds.rv;
      if (k !== "mode") r.eve = false;
      return renderRelax();
    }
  }
