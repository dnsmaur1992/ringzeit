  /* ============ Training flow: explicit input, compact navigation and shared timer ownership ============ */
  const flowText = () =>
    S.profile.lang === "de"
      ? {
          adjust: "Einheit anpassen",
          why: "Warum diese Einheit?",
          next: "Als Nächstes",
          progress: (n, total) => `${n} von ${total} Übungen erledigt`,
          check: "Hakenfläche antippen zum Abhaken · i öffnet die Übungserklärung.",
          chooseEffort: "Wie anstrengend war die Einheit? (Pflicht)",
          effortFine: "Genauer: Skala 1–10",
          effortHelp: "1–3 leicht · 4–6 mittel · 7–8 schwer · 9–10 sehr schwer",
          durationHint: "Vorgeschlagen ist die geplante Dauer – ändere sie, wenn du kürzer oder länger trainiert hast.",
          durationEarly: (m) =>
            `Eingetragen sind ${m} Minuten. Wenn du früher aufgehört hast: Abbrechen tippen und die Dauer anpassen.`,
          missingEffort: "Bitte wähle deine tatsächliche Anstrengung von 1 bis 10.",
          missingDuration: "Bitte trage eine Dauer von 1 bis 300 Minuten ein.",
          pausedSession: "Trainings-Timer pausiert. Du kannst ihn später fortsetzen.",
          pausedFree: "Freier Rundentimer pausiert.",
          overview: "Zur Trainingsübersicht",
          previous: "Vorherige Runde",
          nextRound: "Nächste Runde auswählen",
          start: "Runde starten",
          resume: "Fortsetzen",
          pause: "Timer pausieren",
          anchors: "Diese Grundübungen bleiben für vergleichbare Kraftprotokolle wiederkehrend im Plan.",
        }
      : {
          adjust: "Adjust session",
          why: "Why this session?",
          next: "Up next",
          progress: (n, total) => `${n} of ${total} exercises completed`,
          check: "Tap the check control to mark complete · i opens exercise details.",
          chooseEffort: "How hard was the session? (required)",
          effortFine: "More precise: scale 1–10",
          effortHelp: "1–3 easy · 4–6 moderate · 7–8 hard · 9–10 very hard",
          durationHint: "The planned duration is suggested – change it if you trained shorter or longer.",
          durationEarly: (m) => `${m} minutes are entered. If you stopped early, tap Cancel and adjust the duration.`,
          missingEffort: "Please choose your actual effort from 1 to 10.",
          missingDuration: "Please enter a duration from 1 to 300 minutes.",
          pausedSession: "Session timer paused. You can resume it later.",
          pausedFree: "Free round timer paused.",
          overview: "Back to session overview",
          previous: "Previous round",
          nextRound: "Select next round",
          start: "Start round",
          resume: "Resume",
          pause: "Pause timer",
          anchors: "These basic exercises recur in your plan so strength performances stay comparable.",
        };
  function finishDraft() {
    if (!ui.finishDraft || ui.finishDraft.ds !== ui.sel)
      ui.finishDraft = {
        ds: ui.sel,
        minutes: S.sessions[ui.sel]?.min || S.profile.minutes,
        // the suggested duration counts as actual unless changed; an early finish asks about it (see fSave)
        minutesConfirmed: true,
        minutesTouched: false,
        rpe: null,
        doseChoice: "hold",
        note: "",
      };
    return ui.finishDraft;
  }
  function readFinishDraft() {
    const draft = finishDraft(),
      min = document.getElementById("fMin"),
      effort = document.getElementById("fRpe"),
      note = document.getElementById("fNote");
    if (min) draft.minutes = Number(min.value);
    if (effort) draft.rpe = effort.value === "" ? null : Number(effort.value);
    if (min && Number(min.value) !== (S.sessions[ui.sel]?.min || S.profile.minutes)) draft.minutesTouched = true;
    if (note) draft.note = note.value.slice(0, 300);
    return draft;
  }
  function validateFinish() {
    const draft = readFinishDraft(),
      txt = flowText(),
      errors = [];
    if (!Number.isInteger(draft.rpe) || draft.rpe < 1 || draft.rpe > 10) errors.push(txt.missingEffort);
    if (!Number.isInteger(draft.minutes) || draft.minutes < 1 || draft.minutes > 300)
      errors.push(txt.missingDuration);
    const el = document.getElementById("finishError");
    if (el) {
      el.textContent = errors.join(" ");
      el.hidden = !errors.length;
    }
    return errors.length === 0;
  }
  function finishFormHtml(sess) {
    const draft = finishDraft(),
      txt = flowText(),
      completed = sessionCompletion(sess).complete;
    return `<div id="sessionFinish"><h2>${t("finish")}</h2><div class="panel"><div class="field"><label class="lab" for="fMin">${t("duration")}</label><input id="fMin" type="number" inputmode="numeric" min="1" max="300" value="${Number.isFinite(draft.minutes) ? draft.minutes : ""}"><span class="sub">${txt.durationHint}</span></div>
        <div class="field"><span class="lab" id="effortLabel">${txt.chooseEffort}</span><div class="effort-faces" role="group" aria-labelledby="effortLabel">${effortFaces()
          .map(
            ([n, f, l]) =>
              `<button type="button" data-effort="${n}" data-face="1" aria-pressed="${faceOf(draft.rpe) === n}" aria-label="${esc(l)}"><span aria-hidden="true">${f}</span><small>${esc(l)}</small></button>`,
          )
          .join("")}</div>${
          simpleView()
            ? ""
            : `<details class="effort-fine"><summary>${txt.effortFine}</summary><div class="effort-options" role="group" aria-labelledby="effortLabel">${Array.from(
                { length: 10 },
                (_, i) => i + 1,
              )
                .map(
                  (n) =>
                    `<button type="button" data-effort="${n}" aria-pressed="${draft.rpe === n}" aria-label="${n} / 10">${n}</button>`,
                )
                .join("")}</div><span class="sub">${txt.effortHelp}</span></details>`
        }<input id="fRpe" type="hidden" value="${draft.rpe ?? ""}"><div id="doseAdvice">${effortControlHtml(sess,draft)}</div></div>
        <div class="field"><label class="lab" for="fNote">${t("note")}</label><textarea id="fNote" placeholder="${esc(t("notePh"))}">${esc(draft.note)}</textarea></div><div class="field"><div id="finishError" role="alert" class="note warn" hidden></div><button type="button" class="btn${completed ? " all-done" : ""}" id="fSave">${completed ? trainingText().ready : trainingText().complete}</button></div></div></div>`;
  }
  function effortControlHtml(sess, d, sheet = false) {
    const de = S.profile.lang === "de", f = effortFace(d.rpe), dose = sess?.effortDose;
    if (!f) return "";
    if (!dose?.eligible) return `<p class="sub">${de ? "Bewertung gespeichert für Belastung und Verlauf. Die heutigen Schutz- und Erholungsvorgaben haben Vorrang." : "Rating counts towards load and history. Today's protection and recovery rules take priority."}</p>`;
    const choice = d.doseChoice || "hold", percent = effortRequest(d.rpe, choice), type = t("types")[sess.type];
    const question = f === 6 ? (de ? "Nächste Einheit dieser Art etwas fordernder?" : "Make the next session of this type a little harder?")
      : (de ? "Nächste Einheit dieser Art etwas leichter?" : "Make the next session of this type a little easier?");
    const controls = f >= 6 ? `<span class="lab">${question}</span><div class="chips">${["hold","change"].map(v => `<button type="button" class="chip" data-dose-choice="${v}"${sheet ? ' data-dose-sheet="1"' : ''} aria-pressed="${choice === v}">${v === "hold" ? (de ? "Beibehalten" : "Keep it") : f === 6 ? "+5 %" : f === 8 ? "−5 %" : "−10 %"}</button>`).join("")}</div>` : "";
    const next = Math.max(.8, Math.min(1.2, dose.factor * (1 + (percent || 0) / 100)));
    const info = !percent || next === dose.factor
      ? (de ? "Die bisherige Anpassung bleibt. Tagesform und Periodisierung werden weiter berücksichtigt." : "Keep the current adjustment. Readiness and periodisation still apply.")
      : (de ? `Für die nächste Einheit „${type}“: Steuerimpuls ${percent > 0 ? "+" : ""}${percent} %, umgesetzt über die Pausen. Gerundet und auf ±20 % begrenzt.`
        : `For the next “${type}” session: ${percent > 0 ? "+" : ""}${percent}% planning impulse, applied through rests. Rounded and capped at ±20%.`);
    return `${controls}<p class="sub" role="status">${info}</p>`;
  }
  const finishEffortControl = d => ({v:1,face:effortFace(d.rpe),choice:d.doseChoice || "hold"});
  function itemTitle(sess, bi, ni) {
    const it = sess.blocks[bi].items[ni];
    if (it.kind === "hard") return hardTxt(it.id, it.h)[0];
    if (it.kind === "run") return t("run");
    if (it.kind === "exam") return examItem(it.id)?.[S.profile.lang] || t("main");
    if (EX[it.id]) return exText(it.id).name;
    if (it.kind === "round") return roundInfo(it).title;
    return `${t("main")} ${ni + 1}`;
  }
  function relevantEquipment(id, eq) {
    const alternatives = (EX[id]?.eq || "").split("|").filter(Boolean);
    return eq
      .filter((x) => alternatives.includes(x))
      .sort()
      .join(",");
  }
  function normalizeExerciseKind(kind, id) {
    const parts = String(kind || "").split(":");
    if (parts.length >= 9) parts[parts.length - 4] = relevantEquipment(id, parts[parts.length - 4].split(","));
    return parts.join(":");
  }
  // Repeated basic movements provide comparable logs; remaining slots retain the existing exercise variety.
  function strengthBasics(n, loc, eq, used, prefer) {
    const groups = [
        ["str.barbell_back_squat", "str.goblet_squats", "str.leg_press", "str.lunges"],
        ["str.bench_press", "str.dumbbell_press", "str.push_ups"],
        [
          "str.seated_cable_row",
          "str.band_rows",
          "str.pull_ups",
          "str.negative_pull_ups",
          "str.plank",
          "str.dead_bugs",
        ],
      ],
      selected = [];
    for (const group of groups) {
      const candidates = EX.filter(
        (e) => e.cat === "str" && group.includes(e.key) && okEx(e, loc, eq) && !used.has(e.id),
      ).sort((a, b) => (prefer ? prefer(b) - prefer(a) : 0) || group.indexOf(a.key) - group.indexOf(b.key));
      if (candidates[0] && selected.length < n) {
        selected.push({ kind: "ex", id: candidates[0].id, basic: true });
        used.add(candidates[0].id);
      }
    }
    return selected.concat(pickEx("str", Math.max(0, n - selected.length), loc, eq, used, prefer));
  }

  function saveTrainingSession() {
    const sess = S.sessions[ui.sel],
      ty = sess ? sess.type : planOn(ui.sel);
    if (doneOn(ui.sel) || !validateFinish()) return;
    const actual = readFinishDraft();
    stopAllTimers();
    ui.workout = null;
    ui.focus = false;
    const completion = sessionCompletion(sess),
      minutes = actual.minutes;
    const replanned = changeLog(() => S.log.push({
      id: "e" + Date.now().toString(36),
      date: ui.sel,
      src: "own",
      type: ty,
      minutes,
      perf: collectPerf(sess),
      plannedRounds: (roundBlock(sess) || { items: [] }).items.length,
      rounds: sess ? (roundBlock(sess)?.items || []).filter((it, i) => roundDone(sess, i + 1)).length : 0,
      completedRounds: sess
        ? (roundBlock(sess)?.items || []).filter((it, i) => roundDone(sess, i + 1)).length
        : 0,
      completed: completion.complete,
      openExercises: completion.open,
      progression: sess?.progression,
      effortDose: sess?.effortDose,
      effortControl: finishEffortControl(actual),
      rpe: actual.rpe,
      inputConfirmed: true,
      tHi: sess ? sess.tHi : rpeRange(ty, ui.sel).hi,
      note: actual.note,
      sport: sess?.sport || mainSport(),
      // style (taekwondo) or discipline (kickboxing) of the unit, for the history and the load areas (7b B2)
      tstyle: (sess?.sport || mainSport()) === "taekwondo" ? sess?.tstyle || tkdStyle() : undefined,
      disc: (sess?.sport || mainSport()) === "kickboxing" ? sess?.disc || S.profile.disc : undefined,
      sid: sess?.id,
      reg: sessionRegions(sess),
    }));
    store.save();
    ui.win = true;
    render();
    showWin(S.log[S.log.length - 1]);
    if (replanned) toast(t("replanned"));
  }
  /* Shares of an own session from its exercises (warm-up, cool-down, mobility and hardening blocks do not count);
     without enough exercises the entry falls back to the table of its type (core/history.js) */
  function sessionRegions(sess) {
    // taekwondo technique, sparring and fight-conditioning units: the kick rounds carry the load – style table (7b B1)
    if (sess && sess.sport === "taekwondo" && ["T", "P", "C"].includes(sess.type)) return tkdRegions(sess.tstyle || tkdStyle());
    const list = [];
    (sess?.blocks || []).forEach((b) => {
      if (!["warm", "cool", "mob", "hard", "wrist"].includes(b.key))
        b.items.forEach((it) => {
          if (it.kind === "ex" && EX[it.id]) list.push(exRegions(EX[it.id]));
        });
    });
    return list.length >= 3 ? meanRegions(list) || undefined : undefined;
  }
  /* free run: km and pace shown behind minutes */
  const runInfo = (e) =>
    e.run === "free" && e.km > 0
      ? ` · ${numF(e.km)} km · ${paceOf(e.minutes, e.km)} /km`
      : "";
  function paceOf(min, km) {
    const sec = Math.round((min * 60) / km);
    return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
  }
  const freeRunSel = (setup, ty) => ty === "K" && setup.loc === "out" && setup.run === "free";

  function lastPerf(id, before) {
    const logs = S.log.filter((e) => e.perf && e.date < before).sort((a, b) => b.date.localeCompare(a.date));
    for (const e of logs) {
      const p = e.perf.find((x) => x.id === id);
      if (p && p.sets.length) return p.sets;
    }
    return null;
  }
  const fmtSets = (sets, id) =>
    sets.map((x) => `${x.r ?? "–"}${TIMED.has(id) ? "s" : ""}${x.kg ? ` × ${x.kg} kg` : ""}`).join(" · ");
  /* Returns (and lazily creates) the logged sets for one exercise; key = "<blockIndex>.<itemIndex>" */
  function perfRows(sess, key, b) {
    sess.perf = sess.perf || {};
    if (!sess.perf[key]) {
      const n = b.items ? blockSets(b) : parseInt(b.sets) || 3;
      sess.perf[key] = Array.from({ length: n }, () => ({ r: null, kg: null }));
    }
    return sess.perf[key];
  }
  /* one-legged exercises: left and right are entered separately; the set counts (r) once both legs are in,
     as the weaker leg – so progression, "last time" and completion keep working on one number */
  const legLabels = () => (S.profile.lang === "de" ? ["Links", "Rechts"] : ["Left", "Right"]);
  /* One-legged sets: the set value r is the weaker side and only exists while BOTH sides are entered.
     Deleting one side reopens the set. Old logs with only a shared r (no rL/rR yet) stay as they are. */
  function legSync(row) {
    if (!("rL" in row) && !("rR" in row)) return;
    const has = (v) => v != null && v !== "";
    row.r = has(row.rL) && has(row.rR) ? Math.min(+row.rL, +row.rR) : null;
  }
  function legInputs(key, i, row, ph, timed) {
    const LR = legLabels();
    return ["rL", "rR"]
      .map((f, k) => {
        const v = row[f] ?? (row.rL == null && row.rR == null ? row.r : null);
        return `<input class="si${v != null && v !== "" ? " ok" : ""}" type="text" inputmode="numeric" data-k="${key}" data-i="${i}" data-f="${f}" value="${v ?? ""}" placeholder="${ph}" aria-label="${t("setL")} ${i + 1} ${LR[k]} ${timed ? t("secs") : t("reps")}">`;
      })
      .join("");
  }
  function setsHtml(sess, bi, n, b, id, rounds, preview = false) {
    if (preview) return "";
    const key = `${bi}.${n}`,
      kg = hasKg(id);
    if (rounds) {
      const rows = perfRows(sess, key, { sets: "1" });
      return `<div class="sets nokg" style="grid-template-columns:auto minmax(0,1fr)"><span class="sl">${t("kg")}</span><input class="si" type="text" inputmode="decimal" data-k="${key}" data-i="0" data-f="kg" value="${rows[0].kg ?? ""}" aria-label="${t("kg")}"></div>`;
    }
    const rows = perfRows(sess, key, b),
      target = b.items[n].target,
      timed = TIMED.has(id),
      hold = [
        [20, 30],
        [30, 45],
        [45, 60],
      ][doseLevel(b)] || [30, 45],
      ph = timed ? String(hold[0]) : ((b.sets || "").match(/(\d+)[–-](\d+)/) || [, "10"])[1];
    let h = timed ? `<div class="last" style="margin-top:6px">${t("holdTarget")(rows.length, hold)}</div>` : "";
    const leg = DOSE_LEG.has(EX[id]?.key),
      LR = legLabels();
    h += leg
      ? `<div class="sets leg ${kg ? "" : "nokg"}"><span></span><span class="hd">${LR[0]} · ${timed ? t("secs") : t("reps")}</span><span class="hd">${LR[1]}</span>${kg ? `<span class="hd">${t("kg")}</span>` : ""}<span></span>`
      : `<div class="sets ${kg ? "" : "nokg"}"><span></span><span class="hd">${timed ? t("secs") : t("reps")}</span>${kg ? `<span class="hd">${t("kg")}</span>` : ""}<span></span>`;
    rows.forEach((r, i) => {
      const ok = r.r != null && r.r !== "" ? " ok" : "";
      h += `<span class="sl${ok}" data-sl="${key}.${i}">${t("setL")} ${i + 1}</span>${leg ? legInputs(key, i, r, `${S.profile.lang === "de" ? "Ziel" : "Goal"} ${target ? target.r : ph}`, timed) : `<input class="si${ok}" type="text" inputmode="numeric" data-k="${key}" data-i="${i}" data-f="r" value="${r.r ?? ""}" placeholder="${S.profile.lang === "de" ? "Ziel" : "Goal"} ${target ? target.r : ph}" aria-label="${t("setL")} ${i + 1} ${timed ? t("secs") : t("reps")}">`}${kg ? `<input class="si" type="text" inputmode="decimal" data-k="${key}" data-i="${i}" data-f="kg" value="${r.kg ?? ""}" placeholder="${target?.kg ?? "kg"}" aria-label="${t("setL")} ${i + 1} kg">` : ""}<button type="button" class="x" data-rmset="${key}" data-i="${i}" aria-label="−">−</button>`;
    });
    const last = lastPerf(id, sess.date);
    return (
      h +
      `</div><div class="setfoot"><span class="last">${last ? `${t("lastTime")}: ${esc(fmtSets(last, id))}` : ""}</span><button type="button" class="btn ghost" data-addset="${key}">${t("addSet")}</button></div>`
    );
  }
  /* Lead/rear side for hooks, uppercuts and kicks: hands alternate; a kick comes from the side opposite the last strike */
  const FIXED = {
    jab: "L",
    cross: "R",
    jabb: "L",
    crossb: "R",
    side: "L",
    hookk: "L",
    sweep: "L",
    back: "R",
    shook: "R",
  };
  const DEF = {
    hook: "L",
    hookb: "L",
    upper: "R",
    front: "L",
    round: "R",
    roundh: "R",
    axe: "L",
    lowk: "R",
    knee: "R",
    brazil: "R",
    tornado: "R",
    jknee: "R",
  };
  const SIDED = new Set([
    "hook",
    "hookb",
    "upper",
    "front",
    "round",
    "roundh",
    "side",
    "back",
    "hookk",
    "axe",
    "brazil",
    "shook",
    "tornado",
    "sweep",
    "lowk",
    "knee",
    "jknee",
  ]);
  function sides(c) {
    let last = null;
    return c.map((x) => {
      if (!STRIKE.has(x) && !tkm().SIDED.has(x)) return null;
      const s = FIXED[x] || tkm().FIXED[x] || (last ? (last === "L" ? "R" : "L") : DEF[x] || tkm().SIDE_DEF[x]);
      last = s;
      return SIDED.has(x) || tkm().SIDED.has(x) ? s : null;
    });
  }
  // a single technique outside a combo (partner attack, quick answer): its usual side, so every kick says V or H
  const oneSide = (x) => (SIDED.has(x) ? FIXED[x] || DEF[x] : tkm().SIDED.has(x) ? tkm().FIXED[x] || tkm().SIDE_DEF[x] : null);
  const sideLbl = (s) => (S.profile.lang === "de" ? (s === "L" ? "V" : "H") : s);
  /* one technique chip (kicks red, V/H side mark) – also used inside the partner groups */
  function techChip(x, sd) {
    const sr = tkm().SERIES[x];
    // series: one bracketed chip around the parts, arrows between them (fast sequence without setting down)
    if (sr) return `<span class="ser">${sr.p.map(([y, s]) => techChip(y, s)).join('<b class="arr">›</b>')}</span>`;
    return `<span class="${isKickId(x) ? "k" : ""}">${esc(techNm(x))}${sd ? `<i>${sideLbl(sd)}</i>` : ""}</span>`;
  }
  /* technique name in the display; taekwondo: Korean (WT transliteration) or the app language by the name switch, speech always app language */
  function techNm(x, speech) {
    const lg = S.profile.lang === "de" ? 0 : 1,
      k = tkm().TECH[x];
    if (k && tkm().SERIES[x] && speech) return tkm().SERIES[x].p.map(([y, s]) => techNm(y, true) + (s ? (lg === 0 ? (s === "L" ? " vorne" : " hinten") : s === "L" ? " lead" : " rear") : "")).join(", ");
    if (k) return !speech && tkdNames() === "ko" && k[2] ? k[2] : k[lg];
    return TECH[x][lg];
  }
  const isKickId = (x) => KICKS.has(x) || TKDT.KICKS.has(x);
  function comboHtml(c) {
    const sd = sides(c);
    return `<div class="combo">${c.map((x, i) => techChip(x, sd[i])).join("")}</div>`;
  }
  /* Settings form of an existing session; "dirty" = the form was changed but the session not rebuilt yet */
  const setupOf = (sess, ds) => ({
    ds,
    loc: sess.loc,
    // the simple view only offers partner/bag – hidden extra equipment must not stick to a rebuilt session
    eq: sess.eq.filter(
      (x) => !(x === "bag" && sess.eq.includes("partner")) && (!simpleView() || ["partner", "bag", "pads"].includes(x)),
    ),
    type: sess.type,
    run: !!sess.run,
    sport: sess.sport || mainSport(),
    tstyle: sess.tstyle || tkdStyle(),
    disc: sess.disc || S.profile.disc,
    min: sess.min || sessMin(sess.type),
  });
  function setupDirty(ds) {
    const sess = S.sessions[ds],
      su = ui.setup;
    if (!sess || !su || su.ds !== ds) return false;
    const base = setupOf(sess, ds),
      // only equipment the session type can use counts; the fitness gym brings its own
      eqKey = (e, ty, loc) =>
        loc === "studio" ? "studio" : [...new Set(e.filter((x) => (EQ_FOR[ty] || []).includes(x)))].sort().join();
    return (
      su.type !== base.type ||
      su.loc !== base.loc ||
      su.min !== base.min ||
      (su.sport || mainSport()) !== base.sport ||
      ((su.sport || mainSport()) === "taekwondo" && (su.tstyle || tkdStyle()) !== base.tstyle) ||
      ((su.sport || mainSport()) === "kickboxing" && (su.disc || S.profile.disc) !== base.disc) ||
      !!su.run !== base.run ||
      eqKey(su.eq, su.type, su.loc) !== eqKey(base.eq, base.type, base.loc)
    );
  }
  /* Style (taekwondo: WT or ITF-D) or discipline (kickboxing) of this unit only – the default comes from the profile and the profile stays untouched */
  function unitSubRow(setup) {
    const sp = setup.sport || mainSport();
    if (sp === "taekwondo") {
      const cur = setup.tstyle || tkdStyle();
      return `<div class="field"><span class="lab">${t("unitStyleL")}</span><div class="seg">${TKDT.STYLES.map((k) => `<button type="button" data-ustyle="${k}" aria-pressed="${cur === k}">${t("tkd").styles[k]}</button>`).join("")}</div></div>`;
    }
    if (sp === "kickboxing") {
      const cur = setup.disc || S.profile.disc,
        young = ageExact(today()) != null && ageExact(today()) < 15;
      return `<div class="field"><span class="lab">${t("unitDiscL")}</span><div class="seg g2">${["lc", "kl", "fc", "k1"].filter((k) => !(young && (k === "fc" || k === "k1"))).map((k) => `<button type="button" data-udisc="${k}" aria-pressed="${cur === k}">${t("disc")[k]}</button>`).join("")}</div></div>`;
    }
    return "";
  }
  /* The setup form only asks what matters for the chosen session type */
  function setupFields(setup, ty) {
    const has = (k) => setup.eq.includes(k),
      fight = ty === "T" || ty === "C" || ty === "P";
    let h = "";
    if (fight)
      h += `<div class="field"><span class="lab">${t("pbQ")}</span><div class="seg">${["partner", "bag", "none"].map((k) => `<button type="button" data-pb="${k}" aria-pressed="${k === "none" ? !has("partner") && !has("bag") : has(k)}">${t("pb")[k]}</button>`).join("")}</div></div>`;
    if (ty === "K" && setup.loc === "out")
      h += `<div class="field"><span class="lab">${t("runQ")}</span><div class="seg">${["iv", "run", "free"].map((k) => `<button type="button" data-run="${k}" aria-pressed="${k === "free" ? setup.run === "free" : setup.run !== "free" && (k === "run") === (!!setup.run && !kneeAnk())}" ${k !== "iv" && kneeAnk() ? "disabled" : ""}>${t("runOpt")[k]}</button>`).join("")}</div>${setup.run === "free" ? `<span class="sub">${t("freeRunHint")}</span>` : ""}${kneeAnk() ? `<span class="sub">${t("runLock")}</span>` : ""}</div>`;
    const runOnly = !!setup.run && setup.run !== "free" && canRun(ty, setup.loc),
      studio = setup.loc === "studio" && (ty === "S" || ty === "K");
    if (studio) h += `<div class="field"><span class="sub">${t("studioNote")}</span></div>`;
    const chips =
      ty === "P" || runOnly || studio || simpleView()
        ? []
        : EQ_FOR[ty].filter((k) => t("equip")[k] && (k !== "pads" || has("partner")));
    if (chips.length)
      h += `<div class="field"><span class="lab">${ty === "T" || ty === "C" ? t("suppEq") : t("equipQ")}</span><div class="chips">${chips.map((k) => `<button type="button" class="chip" data-eq="${k}" aria-pressed="${has(k)}">${t("equip")[k]}</button>`).join("")}</div></div>`;
    return h;
  }

  /* Club training on the selected day: log it, move it, mark it as cancelled – or add one that wasn't planned */
  function clubPanel(ds) {
    const cl = clubOn(ds),
      cd = clubDone(ds),
      c = (S.cov || {})[ds] || {},
      past = ds <= iso(today());
    if (!cl && !cd && !c.off)
      return past && !pausedOn(ds) && !(simpleView() && !(S.profile.club && S.profile.club.days.length))
        ? `<div class="minirow" style="justify-content:flex-end"><button type="button" class="btn ghost" data-clublog="${ds}">+ ${t("clubAdd")}</button></div>`
        : "";
    let body,
      acts = "";
    if (cd) {
      body = `✓ ${t("clubKinds")[cd.ck] || ""} · ${cd.minutes} ${t("min")} · ${effortTxt(cd.rpe)}`;
      acts = `<button type="button" class="btn ghost" data-edit="${cd.id}">${t("edit")}</button><button type="button" class="btn ghost" data-del="${cd.id}">${t("del")}</button>`;
    } else if (c.off) {
      body = c.off === "moved" ? t("movedTo")(dayLbl(c.to)) : c.off === "miss" ? t("clubMissed") : t("clubCancelled");
      acts = `<button type="button" class="btn ghost" data-cundo="${ds}">${t("undo")}</button>`;
    } else {
      body = `${cl.min} ${t("min")}${c.from ? ` · ${t("movedFrom")(dayLbl(c.from))}` : ""}`;
      if (past) acts += `<button type="button" class="btn ghost" data-clublog="${ds}">${t("clubLog")}</button>`;
      if (ds >= iso(today()))
        acts += `<button type="button" class="btn ghost" data-cmove="${ds}">${t("move")}</button><button type="button" class="btn ghost" data-ccancel="${ds}">${t("clubCancel")}</button>`;
    }
    return `<div class="panel clubbox" style="--tc:var(--c-V)"><div class="sess"><span class="code V${simpleView() ? " ico" : ""}" aria-hidden="true">${codeOf("V")}</span><span class="lbl"><b>${t("club")}</b><div class="sub">${esc(body)}</div></span></div><div class="minirow" style="padding:0 12px 10px;justify-content:flex-end">${acts}</div></div>`;
  }
  function renderSession() {
    const ds = ui.sel || nextTrainingDate();
    ui.sel = ds;
    const i = wd(ds),
      planned = planOn(ds),
      lg = S.profile.lang === "de" ? 0 : 1,
      ow = (S.ov || {})[ds] || {},
      recent = ds >= iso(addDays(today(), -7));
    // 7m: the strip opens on the week of the chosen day; the arrows may then show other weeks
    if (ui.wkFor !== ds) {
      ui.wk = Math.round(daysBetween(monday(today()), monday(parse(ds))) / 7);
      ui.wkFor = ds;
    }
    let h = header(t("sessTitle")) + weekNavHtml() + weekStrip(ds, "data-sel");
    h += clubPanel(ds);
    const pz = pausedOn(ds);
    if (pz) return h + `<div class="empty"><b>${t("pauseWhy")[pz.why]}</b>${t("pausedDay")}</div>`;
    if (!planned) {
      const lgd = S.log.find((e) => e.date === ds && own(e));
      if (lgd)
        return (
          h +
          `<div class="note ok">✓ ${t("already")} ${t("types")[lgd.type] || ""} · ${effortTxt(lgd.rpe)} · ${lgd.minutes} ${t("min")}</div>`
        );
      const info =
        ow.off === "moved" ? t("movedTo")(dayLbl(ow.to)) : ow.off === "skip" ? t("skipped") : t("noTraining");
      return (
        h +
        `<div class="empty"><b>${ow.off ? t("weekday")[i] : t("rest")}</b>${esc(info)}<div class="minirow" style="justify-content:center;margin-top:12px">${ow.off ? `<button type="button" class="btn ghost" data-undo="${ds}">${t("undo")}</button>` : ""}${!ow.off && recent ? `<button type="button" class="btn sec" data-add="${ds}" style="width:auto">${t("addTraining")}</button>` : ""}</div></div>`
      );
    }
    const sess = S.sessions[ds];
    const setup =
      ui.setup && ui.setup.ds === ds
        ? ui.setup
        : sess
          ? setupOf(sess, ds)
          : {
              ds,
              loc: "gym",
              eq: defaultEq(),
              type: planned,
              run: false,
              sport: mainSport(),
              min: sessMin(planned),
            };
    ui.setup = setup;
    const ty = setup.type;
    h += `<h2>${t("weekday")[i]} · ${t("types")[ty]} · ${setup.min} ${t("min")}</h2>`;
    h += `<details class="panel session-settings" data-session-settings="${ds}" ${!sess || ui.sessionSettings?.[ds]?"open":""}><summary>${flowText().adjust}</summary><div>`;
    h += formHtml(ds, sess);
    // duration options: 30/45/60 and the usual length; mobility never longer than 45 minutes
    const durs = [...new Set(lowTime() ? [20, 30] : [30, 45, 60, S.profile.minutes])]
      .filter((m) => (ty !== "M" || m <= 45) && (kidAge() == null || m <= (kidAge() <= 9 ? 30 : 45)))
      .sort((a, b) => a - b);
    h += `<div class="panel">${sportRow("data-usport", setup.sport)}${unitSubRow(setup)}<div class="field"><span class="lab">${t("sessType")}</span><div class="seg g3">${["T", "C", "P", "S", "K", "M"].map((k) => `<button type="button" data-stype="${k}" aria-pressed="${ty === k}" ${k === "P" && (koLock(ds) || ageGroup() === "kids") ? "disabled" : ""}>${t("types")[k]}${k === planned ? `<small>${t("suggested")}</small>` : ""}</button>`).join("")}</div>${koLock(ds) ? `<span class="sub">${t("koNote")}</span>` : ""}</div>
 <div class="field"><span class="lab">${t("dur")}</span><div class="seg">${durs.map((m) => `<button type="button" data-dur="${m}" aria-pressed="${setup.min === m}">${m}</button>`).join("")}</div></div>
 <div class="field"><span class="lab">${t("where")}</span><div class="seg ${ty === "S" || ty === "K" ? "g2" : ""}">${(ty === "S" || ty === "K" ? ["gym", "studio", "home", "out"] : ["gym", "home", "out"]).map((l) => `<button type="button" data-loc="${l}" aria-pressed="${setup.loc === l}">${t("locs")[l]}</button>`).join("")}</div></div>
${setupFields(setup, ty)}
 <div class="field">${sess && setupDirty(ds) ? `<span class="sub setup-dirty">● ${t("setupChanged")}</span>` : ""}<button class="btn${sess && !setupDirty(ds) ? " sec" : ""}" type="button" id="buildSess">${freeRunSel(setup, ty) ? t("freeRunLog") : sess ? t("recreate") : t("create")}</button><div class="minirow" style="justify-content:space-between">${recent && !doneOn(ds) ? `<button type="button" class="btn ghost" data-move="${ds}">${t("move")}</button>` : ""}${ow.t && !ow.from && !doneOn(ds) ? `<button type="button" class="btn ghost" data-unplan="${ds}">${t("removeExtra")}</button>` : ""}${ow.from ? `<span class="sub">${t("movedFrom")(dayLbl(ow.from))}</span>` : ""}</div></div></div>`;
    h += `</div></details>`;
    if (!sess) {
      const dn = S.log.find((e) => e.date === ds && own(e));
      return dn ? h + `<div class="note ok">✓ ${t("already")} ${effortTxt(dn.rpe)} · ${dn.minutes} ${t("min")}${runInfo(dn)}</div>` : h;
    }
    {
      const doneTop = S.log.find((e) => e.date === ds && own(e));
      h += doneTop
        ? `<div class="note">${workoutText().preview}</div>`
        : `<div class="panel training-start top"><p class="sub">${workoutText().preview}</p>${isIOS() ? `<p class="sub">🔔 ${S.profile.lang === "de" ? "iPhone: Schalter an der Seite auf Ton stellen, sonst bleiben Gong und Ansagen stumm." : "iPhone: set the side switch to ring, otherwise gong and calls stay silent."}</p>` : isAndroid() ? `<p class="sub">🔔 ${S.profile.lang === "de" ? "Android: Medienlautstärke hochdrehen (Lautstärketaste → Musiknote), sonst sind Gong und Ansagen leise." : "Android: turn up the media volume (volume key → music note), otherwise gong and calls are quiet."}</p>` : ""}<button type="button" class="btn" data-workout="start">${PLAY}<span>${sess.flow ? workoutText().resume : workoutText().start}</span></button></div>`;
    }
    if (!simpleView()) h += progressionInfoHtml(true);
    const rbS = roundBlock(sess);
    h += `<div class="tags">${simpleView() ? "" : `<span class="tg ok">${t("rpeTarget")} ${sess.rpe}</span>`}${sess.blk ? `<span class="tg blk">${t("blk").tag} · ${t("blk").names[sess.blk.k]} · ${t("blk").wkN(sess.blk.wk)}</span>` : ""}${rbS && rbS.w === 120 && rbS.items.some((i) => i.k !== "ex") ? `<span class="tg ok">${t("fmtTag")} ${fmt(rbS.w)} / ${fmt(rbS.b)}</span>` : ""}<span class="tg">${t("locs")[sess.loc]}</span>${!isTkdMain() && sess.eq.some((x) => x === "bag" || x === "pads" || x === "partner") ? `<button type="button" class="tg tgbtn" data-guide="wrap">🩹 ${t("guide").wrapLink} ›</button>` : ""}${S.profile.limits.length ? `<span class="tg no">${t("adapted")}: ${S.profile.limits.map((l) => t("lim")[l]).join(", ")}</span>` : ""}</div>`;
    let dataLine = "";
    if (sess.progression?.data) {
      const data = sess.progression.data,
        de = S.profile.lang === "de",
        labels = de
          ? {
              collecting: "im Aufbau",
              sufficient: "ausreichend",
              reliable: "gut belegt",
            }
          : {
              collecting: "building up",
              sufficient: "sufficient",
              reliable: "well supported",
            };
      // shown inside "Why this session?" instead of as its own line
      dataLine = `${de ? "Datengrundlage" : "Training data"}: ${labels[data.level] || labels.collecting}`;
    }
    if ((sess.notes && sess.notes.length) || dataLine) {
      const notes = sess.notes || [];
      const safety = ["koNote", "koNoteBox", "koNoteTkd", "gearNote", "gearKb", "gearWt", "gearItf", "gearPartner", "boxGear", "wtSparNote", "wrNote", "knNote"]
        .flatMap((key) => [L.de[key], L.en[key]])
        .filter((x) => typeof x === "string");
      const critical = notes.filter((n) => safety.includes(n));
      if (critical.length) h += `<div class="note warn">${critical.map(esc).join("<br>")}</div>`;
      if (!simpleView()) h += `<details class="note"><summary>${flowText().why}</summary><div>${[...notes, dataLine].filter(Boolean).map(esc).join("<br>")}</div></details>`;
    }
    sess.blocks.forEach((b, bi) => {
      h += sessionBlockHtml(sess, bi, true);
    });
    const done = S.log.find((e) => e.date === ds && own(e));
    if (done) h += `<div class="note ok">✓ ${t("already")} ${effortTxt(done.rpe)} · ${done.minutes} ${t("min")}${runInfo(done)}</div>`;
    else
      h += `<div class="panel training-start"><p class="sub">${workoutText().preview}</p><p class="sub">${S.profile.lang === "de" ? "Bereitlegen" : "Prepare"}: ${esc(sess.eq.map((k) => t("equip")[k] || t("pb")?.[k] || k).join(", ") || (S.profile.lang === "de" ? "keine zusätzliche Ausrüstung" : "no extra equipment"))}</p><button type="button" class="btn" data-workout="start">${PLAY}<span>${sess.flow ? workoutText().resume : workoutText().start}</span></button></div>`;
    return h;
  }
  function sessionBlockHtml(sess, bi, preview = false) {
    unitStyle = sess.sport === "taekwondo" ? sess.tstyle || null : null;
    const b = sess.blocks[bi],
      lg = S.profile.lang === "de" ? 0 : 1;
    let h = "";
    h += `<div class="block" data-block="${bi}">${blockHead(b, sess)}`;
    if (b.items.some((it) => it.combo))
      h += `<div class="legend">${[sess.sport === "taekwondo" ? t("legendTkd") : t("legend"), b.items.some((it) => it.react) ? t("legendReact") : "", b.items.some((it) => PARTNER_K.has(it.k)) ? esc(t("partnerNote")) : "", (() => { const g = b.items.map(guardCue).find(Boolean); return g ? esc(g) : ""; })()].filter(Boolean).join("<br>")}</div>`;
    b.items.forEach((it, n) => {
      const checked = itemDone(sess, bi, n),
        itemAttr = `data-item="${bi}.${n}"`;
      if (it.kind === "round" && it.k === "ex") {
        const x = exText(it.id);
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr} ${preview ? "" : `data-rd="${n + 1}"`}>${checkButton(sess, bi, n, t("roundAbbr") + (n + 1), preview)}<div class="tx">${exName(it.id, x.name)}<div>${esc(x.desc)}</div>${paceTxt(it) ? `<div class="last">${paceTxt(it)}</div>` : ""}${hasKg(it.id) ? setsHtml(sess, bi, n, b, it.id, true, preview) : ""}</div></div>`;
      } else if (it.kind === "run") {
        const z3 = it.zone === 3;
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr}>${checkButton(sess, bi, n, "Z" + it.zone, preview)}<div class="tx"><b>${z3 ? t("z3set")(it.reps, it.on, it.off) : `${it.min} ${t("min")} · ${t("z2")}`}</b><div>${z3 ? t("z3d") : t("z2d")}</div></div></div>`;
      } else if (it.kind === "hard") {
        const hd = HARD.find((q) => q.id === it.id) || HARD[0],
          x = hardTxt(hd.id, it.h);
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr}>${checkButton(sess, bi, n, pad(n + 1), preview)}<div class="tx">${SKETCH[hd.sk] ? `<button type="button" class="exn" data-hardinfo="${hd.id}${it.h ? "|h" : ""}"><b>${esc(x[0])}</b><span class="exi" aria-hidden="true">i</span></button>` : `<b>${esc(x[0])}</b>`}<div>${esc(x[1])}</div></div></div>`;
      } else if (it.k === "sim") {
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr} ${preview ? "" : `data-rd="${n + 1}"`}>${checkButton(sess, bi, n, t("roundAbbr") + (n + 1), preview)}<div class="tx"><b>${t("simT")(it.fight, it.r)}</b><div>${it.fight > 1 && it.r === 1 ? t("simD2") : t("simD1")}${it.beg ? t("simBeg") : ""}</div></div></div>`;
      } else if (it.k === "task") {
        const x = TASKS.find((q) => q.id === it.id) || TASKS[0],
          tx = x[S.profile.lang],
          d = it.m === "p" ? tx[1] : tx[2] || tx[1];
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr} ${preview ? "" : `data-rd="${n + 1}"`}>${checkButton(sess, bi, n, t("roundAbbr") + (n + 1), preview)}<div class="tx"><span class="last">${t("sparMode")[it.m]}</span><br><b>${esc(tx[0])}</b><div>${esc(d)}</div></div></div>`;
      } else if (it.kind === "exam") {
        const x = examItem(it.id);
        if (x)
          h += `<div class="ex${checked ? " past" : ""}" ${itemAttr}>${checkButton(sess, bi, n, pad(n + 1), preview)}<div class="tx">${preview ? `<b>${esc(x[S.profile.lang])}</b>` : examRow(x, n, sess.eq)}</div></div>`;
      } else if (it.kind === "round") {
        const r = rtOf(it);
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr} ${preview ? "" : `data-rd="${n + 1}"`}>${checkButton(sess, bi, n, t("roundAbbr") + (n + 1), preview)}<div class="tx">${it.mine ? `<span class="last mine">★ ${t("myc").lbl}</span><br>` : ""}<b>${esc(r[lg])}</b>${PARTNER_K.has(it.k) ? "" : `<div>${esc(roundDesc(it, lg))}</div>`}${it.six ? `<div class="last">${esc(t("sixPartner"))}</div>` : ""}${paceTxt(it) ? `<div class="last">${paceTxt(it)}</div>` : ""}${it.combo ? reactHtml(it) : ""}</div></div>`;
      } else {
        const x = exText(it.id),
          tr = tracksSets(it.id) && b.key !== "warm" && b.key !== "cool";
        const dz = it.target ? targetText(it.target, it.id) : doseTxt(it.id, b);
        h += `<div class="ex${checked ? " past" : ""}" ${itemAttr}>${tr ? `<span class="num">${pad(n + 1)}</span>` : checkButton(sess, bi, n, pad(n + 1), preview)}<div class="tx">${exName(it.id, x.name)}${dz ? `<br><span class="dose">${esc(dz)}</span>` : ""}<div>${esc(x.desc)}</div>${tr ? setsHtml(sess, bi, n, b, it.id, false, preview) : hasKg(it.id) ? setsHtml(sess, bi, n, b, it.id, true, preview) : ""}</div></div>`;
      }
      if (!preview && !b.rounds) h += exerciseTimerHtml(sess, bi, n);
    });
    h += `</div>`;
    return h;
  }
