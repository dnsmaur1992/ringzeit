  /* ============ Completion and performance-based progression ============ */
  const trainingText = () =>
    S.profile.lang === "de"
      ? {
          check: "Übung abhaken",
          uncheck: "Haken entfernen",
          complete: "Einheit abschließen",
          ready: "Alles erledigt · Einheit abschließen",
          open: (n) => `Noch ${n} ${n === 1 ? "Übung" : "Übungen"} offen – trotzdem abschließen?`,
          partial:
            "Die Einheit zählt weiterhin für Belastung und Verlauf. Offene Übungen gelten nicht als geschafft.",
          target: "Ziel",
          ownWeight: "Gewicht selbst wählen",
          learningTitle: "So lernt Ringzeit dein Training kennen",
          learning:
            "Ringzeit passt dein Training anhand deiner Einträge an. Je regelmäßiger du absolvierte Einheiten, Wiederholungen, Gewichte und deine empfundene Anstrengung erfasst, desto gezielter kann die App die Belastung anpassen. Zu Beginn bleibt die Planung vorsichtig. Deine Abschlussbewertung steuert die nächste eigene Einheit derselben Sportart und Gattung. Tagesform und Entlastung haben Vorrang.",
          understood: "Verstanden",
          data: (level, count, weeks) =>
            `Datengrundlage: ${{ collecting: "im Aufbau", sufficient: "ausreichend", reliable: "gut belegt" }[level]} · ${count} vergleichbare Einheiten in ${weeks} Wochen.`,
          dataWhy: {
            few: "Für eine langfristige Zyklussteigerung fehlen noch regelmäßig erfasste Einheiten.",
            missing: "Einige Leistungsangaben fehlen; die Belastung bleibt vorsichtig.",
            coverage: "Vom geplanten Training ist noch zu wenig erfasst; das Niveau bleibt bestehen.",
            trend:
              "Die letzten Einheiten wurden im Verhältnis zum Ziel anstrengender; deshalb heute keine Steigerung.",
          },
          up: "Gut bewältigt: der nächste Zyklus wird leicht gesteigert.",
          repeat:
            "Belastung beibehalten: für eine Steigerung fehlen ausreichend vollständig bewältigte Einheiten.",
          down: "Wiederholt über dem Anstrengungsziel: der nächste Zyklus wird leichter.",
          initial:
            "Ausgangsniveau: zuerst vergleichbare Einheiten vollständig absolvieren und Anstrengung eintragen.",
          cap: "Die Pausendichte bleibt auf dieser Stufe. Kraftziele können bei ausreichender Leistung weiter steigen.",
          protected: "Heute haben Entlastung, Vorbereitung oder Erholung Vorrang vor einer Steigerung.",
          cycle: (week, weeks) => `Belastungszyklus: Woche ${week}/${weeks}.`,
          density: (old, next) =>
            `Gleiche Rundenzeit, angepasste Pausen: ${old} → ${next} s; innerhalb deiner Trainingszeit.`,
          targetWhy: {
            up: "Mehrmals mehr geschafft: Ziel angehoben.",
            down: "Wiederholt zu schwer: Ziel reduziert.",
            hold: "Mehr geschafft, aber die Anstrengung war hoch: Ziel bleibt.",
            carry: "Neuer Wiederholungsbereich: aus deiner letzten Leistung umgerechnet.",
            repeat: "Bisheriges Ziel wiederholen.",
            initial: "Ausgangsziel; Gewicht selbst wählen.",
          },
        }
      : {
          check: "Mark exercise complete",
          uncheck: "Remove check",
          complete: "Finish session",
          ready: "Everything done · finish session",
          open: (n) => `${n} ${n === 1 ? "exercise" : "exercises"} still open – finish anyway?`,
          partial:
            "The session still counts towards load and history. Open exercises do not count as completed.",
          target: "Target",
          ownWeight: "choose your weight",
          learningTitle: "How Ringzeit learns about your training",
          learning:
            "Ringzeit adapts training using your entries. Regularly recording completed sessions, reps, weights and perceived effort helps the app tailor the load. Planning stays cautious at first. Your final effort rating controls your next own session of the same sport and type. Readiness and recovery take priority.",
          understood: "Got it",
          data: (level, count, weeks) =>
            `Training data: ${{ collecting: "building up", sufficient: "sufficient", reliable: "well supported" }[level]} · ${count} comparable sessions across ${weeks} weeks.`,
          dataWhy: {
            few: "More regularly recorded sessions are needed for a long-term cycle increase.",
            missing: "Some performance details are missing; training stays cautious.",
            coverage: "Too little of the planned training has been recorded; maintain the current level.",
            trend: "Recent sessions became harder relative to their targets; no increase today.",
          },
          up: "Well managed: the next cycle increases slightly.",
          repeat: "Maintain load: not enough fully completed sessions to increase yet.",
          down: "Repeatedly above the effort target: the next cycle is lighter.",
          initial: "Baseline: complete comparable sessions and record effort first.",
          cap: "Maintain rest density at this level. Strength targets may still increase when performance supports it.",
          protected: "Deload, preparation or recovery takes priority over progression today.",
          cycle: (week, weeks) => `Load cycle: week ${week}/${weeks}.`,
          density: (old, next) =>
            `Same work time, adjusted rests: ${old} → ${next} s; within your session time.`,
          targetWhy: {
            up: "Did more several times: target raised.",
            down: "Repeatedly too hard: target reduced.",
            hold: "Did more, but the effort was high: target stays.",
            carry: "New rep range: converted from your last performance.",
            repeat: "Repeat the previous target.",
            initial: "Starting target; choose your own weight.",
          },
        };
  const validEffort = (e) => Number.isFinite(e.rpe) && e.rpe >= 1 && e.rpe <= 10 && Number.isFinite(e.tHi);
  const clampStep = (n) => Math.max(-2, Math.min(4, Number.isFinite(n) ? Math.round(n) : 0));
  function roundDone(sess, n) {
    return typeof sess.roundChecks?.[n] === "boolean" ? sess.roundChecks[n] : n <= (sess.rdone || 0);
  }
  /* Circuit laps of one exercise: which laps are done (indexes), not just how many – skipping laps 1 and 2 and
     confirming lap 3 must leave 1 and 2 open. Older saves only kept a count (timedLaps); it is read as laps 0…n-1. */
  function lapSet(sess, key) {
    const m = (sess.lapsDone ||= {});
    if (!m[key]) m[key] = Array.from({ length: sess.timedLaps?.[key] || 0 }, (_, i) => i);
    return m[key];
  }
  const lapIsDone = (sess, key, lap) =>
    sess.lapsDone?.[key] ? sess.lapsDone[key].includes(lap) : (sess.timedLaps?.[key] || 0) > lap;
  function markLap(sess, key, lap, laps) {
    const a = lapSet(sess, key);
    if (lap == null) for (lap = 0; a.includes(lap); lap++);
    if (lap >= laps) lap = laps - 1;
    if (!a.includes(lap)) a.push(lap);
    a.sort((x, y) => x - y);
    (sess.timedLaps ||= {})[key] = a.length;
    if (a.length >= laps) (sess.checked ||= {})[key] = true;
  }
  function itemDone(sess, bi, ni) {
    const b = sess.blocks[bi],
      it = b.items[ni],
      key = `${bi}.${ni}`;
    if (b.rounds) return roundDone(sess, ni + 1);
    if (EX[it.id]?.cat === "str" && !["warm", "cool"].includes(b.key)) {
      const rows = sess.perf?.[key] || [];
      // Same rule as the set inputs: an entered repetition/time value completes a set (including zero).
      return rows.length >= blockSets(b) && rows.every((r) => r.r != null && r.r !== "");
    }
    return sess.checked?.[key] === true;
  }
  function sessionCompletion(sess) {
    let total = 0,
      done = 0;
    if (sess)
      sess.blocks.forEach((b, bi) =>
        b.items.forEach((it, ni) => {
          total++;
          if (itemDone(sess, bi, ni)) done++;
        }),
      );
    return {
      total,
      done,
      open: total - done,
      complete: total > 0 && done === total,
    };
  }
  function checkButton(sess, bi, ni, label, preview = false) {
    if (preview) return `<span class="num">${label}</span>`;
    const done = itemDone(sess, bi, ni),
      txt = trainingText();
    return `<button type="button" class="num excheck${sess.blocks[bi].rounds ? " r" : ""}" data-check="${bi}.${ni}" aria-pressed="${done}" aria-label="${esc((done ? txt.uncheck : txt.check) + ": " + itemTitle(sess, bi, ni))}"><span class="check-icon" aria-hidden="true">${done ? "✓" : "○"}</span><small>${label}</small></button>`;
  }
  function updateCompletionUI() {
    const sess = S.sessions[ui.sel];
    if (!sess) return;
    document.querySelectorAll("[data-item]").forEach((el) => {
      const [bi, ni] = el.dataset.item.split(".").map(Number),
        done = itemDone(sess, bi, ni);
      el.classList.toggle("past", done);
      const btn = el.querySelector("[data-check]");
      if (btn) {
        btn.setAttribute("aria-pressed", String(done));
        btn.setAttribute(
          "aria-label",
          (done ? trainingText().uncheck : trainingText().check) + ": " + itemTitle(sess, bi, ni),
        );
        const icon = btn.querySelector(".check-icon");
        if (icon) icon.textContent = done ? "✓" : "○";
      }
    });
    updateWorkoutProgress();
    const btn = document.getElementById("fSave");
    if (btn) {
      const done = sessionCompletion(sess).complete;
      btn.classList.toggle("all-done", done);
      btn.textContent = done ? trainingText().ready : trainingText().complete;
    }
  }
  // A five-week wave reuses the existing fifth-week deload. Focus blocks retain their six-week stages.
  function progressionCycle(ds) {
    const bi = blockInfo(ds);
    if (bi) {
      const start = S.profile.block.start;
      return {
        id: `block:${bi.k}:${start}`,
        start,
        end: iso(addDays(parse(start), 41)),
        week: bi.wk,
        weeks: 6,
        block: bi.k,
      };
    }
    const anchor = monday(parse(S.profile.planStart || ds)),
      age = Math.max(0, daysBetween(anchor, parse(ds))),
      index = Math.floor(age / 35),
      start = iso(addDays(anchor, index * 35));
    return {
      id: `base:${start}`,
      start,
      end: iso(addDays(parse(start), 34)),
      week: Math.floor((age % 35) / 7) + 1,
      weeks: 5,
      block: null,
    };
  }
  function progressionEligible(ds, type, run) {
    return (
      ["T", "C", "K", "S"].includes(type) &&
      !run &&
      !young() &&
      phaseInfo(ds).phase === "base" &&
      !weekLoad(ds).deload &&
      !rampOn(ds) &&
      !koLock(ds) &&
      !ramadanOn(ds) &&
      weekMood(ds) !== "hard" &&
      formOn(ds) === 2 &&
      !(type === "S" && S.profile.work === "phys")
    );
  }
  // Save the plan when it is made: future profile edits must not rewrite past adherence.
  function progressionPlannedDates(cycle, type, ds) {
    const dates = [];
    for (let date = cycle.start; date <= cycle.end; date = iso(addDays(parse(date), 1))) {
      if (date < (S.profile.planStart || cycle.start) || pausedOn(date)) continue;
      const override = S.ov[date] || {};
      if (override.off === "moved") continue;
      const planned = date === ds ? type : S.sessions[date]?.type || override.t || suggestOn(date);
      if (planned === type && progressionEligible(date, type, false)) dates.push(date);
    }
    return dates;
  }
  function progressionRecordComplete(e) {
    if (
      e.inputConfirmed !== true ||
      !validEffort(e) ||
      typeof e.completed !== "boolean" ||
      !Number.isFinite(e.minutes) ||
      e.minutes <= 0 ||
      !Number.isFinite(e.progression?.plannedMin) ||
      e.progression.plannedMin <= 0
    )
      return false;
    if (e.type !== "S") return true;
    const exercises = (e.perf || []).filter((p) => EX[p.id]?.cat === "str");
    return (
      exercises.length > 0 &&
      exercises.every(
        (p) =>
          p.sets?.length &&
          p.sets.every(
            (r) => Number.isFinite(r.r) && r.r >= 0 && (!hasKg(p.id) || (Number.isFinite(r.kg) && r.kg > 0)),
          ),
      )
    );
  }
  function progressionData(entries, end) {
    // At most 12 weeks of closed-cycle data, one vote per date, scoped to the training signature.
    const from = iso(addDays(parse(end), -83)),
      all = [...new Map(entries.filter((e) => e.date >= from && e.date <= end).map((e) => [e.date, e])).values()].sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
      valid = all.filter(progressionRecordComplete),
      weeks = new Set(valid.map((e) => iso(monday(parse(e.date))))).size,
      known = all.filter((e) => Array.isArray(e.progression.plannedDates)),
      expected = new Set(
        known
          .flatMap((e) => e.progression.plannedDates)
          .filter((date) => date >= from && date <= end && !pausedOn(date) && S.ov[date]?.off !== "moved"),
      );
    // Extra sessions count as planned opportunities too; they cannot cancel out missed dates.
    valid.forEach((e) => expected.add(e.date));
    const planned = expected.size,
      covered = valid.filter((e) => expected.has(e.date)).length,
      coverage = planned ? covered / planned : 0,
      completeness = all.length ? valid.length / all.length : 0,
      planKnown = all.length ? known.length / all.length : 0;
    let level = "collecting",
      reason = "few";
    if (valid.length >= 4 && weeks >= 3) {
      if (completeness < 0.8 || planKnown < 0.8) reason = "missing";
      else if (coverage < 0.8) reason = "coverage";
      else {
        level =
          valid.length >= 8 && weeks >= 4 && completeness >= 0.9 && planKnown >= 0.9 && coverage >= 0.9
            ? "reliable"
            : "sufficient";
        reason = null;
      }
    }
    const recent = valid.slice(-8),
      mid = Math.floor(recent.length / 2),
      effort = (list) => list.reduce((sum, e) => sum + e.rpe - e.tHi, 0) / list.length,
      worsening = recent.length >= 8 && effort(recent.slice(mid)) - effort(recent.slice(0, mid)) > 1;
    return {
      level,
      reason,
      count: valid.length,
      weeks,
      planned,
      coverage,
      completeness,
      planKnown,
      worsening,
    };
  }
  function progressionInfoHtml(dismissible = false) {
    if (dismissible && S.profile.progressInfoSeen) return "";
    const txt = trainingText();
    return `<div class="note" data-progress-info="1"><b>${txt.learningTitle}</b><div>${txt.learning}</div>${dismissible ? `<button type="button" class="btn ghost" data-progress-info-close="1">${txt.understood}</button>` : ""}</div>`;
  }
  function progressionState(ds, type, run) {
    const cycle = progressionCycle(ds),
      signature = `${S.profile.disc}:${fitnessLevel()}:${type}:${run ? "run" : "regular"}`,
      cutoff = ds < iso(today()) ? ds : iso(today()),
      groups = new Map();
    for (const e of S.log) {
      const p = e.progression;
      if (
        e.src === "club" ||
        !p ||
        p.v !== 1 ||
        p.signature !== signature ||
        p.end >= cutoff ||
        e.date > p.end ||
        e.date < p.start ||
        e.date >= cutoff ||
        !p.eligible
      )
        continue;
      if (!groups.has(p.id)) groups.set(p.id, []);
      groups.get(p.id).push(e);
    }
    const previous = [...groups.values()].sort((a, b) => b[0].progression.end.localeCompare(a[0].progression.end))[0];
    let step = 0,
      reason = "initial",
      data = progressionData([], cycle.start);
    if (previous) {
      const entries = [...new Map(previous.map((e) => [e.date, e])).values()],
        old = clampStep(previous[0].progression.step),
        good = entries.filter(
          (e) =>
            progressionRecordComplete(e) &&
            // all exercises done and the effort in range – the duration doesn't matter here (it only counts for the load)
            e.completed === true &&
            e.rpe <= e.tHi,
        ),
        hard = entries.filter((e) => validEffort(e) && e.rpe >= e.tHi + 2),
        lastCycle = progressionData(entries, previous[0].progression.end);
      data = progressionData([...groups.values()].flat(), previous[0].progression.end);
      if (
        daysBetween(
          parse(
            entries
              .map((e) => e.date)
              .sort()
              .slice(-1)[0],
          ),
          parse(cutoff),
        ) > 42
      ) {
        data.level = "collecting";
        data.reason = "few";
      }
      step = old;
      if (hard.length >= 2) {
        step = clampStep(old - 1);
        reason = "down";
      } else if (
        data.level !== "collecting" &&
        !data.worsening &&
        lastCycle.planKnown >= 0.8 &&
        lastCycle.coverage >= 0.8 &&
        good.length >= 3 &&
        good.length / entries.length >= 0.8 &&
        daysBetween(
          parse(
            entries
              .map((e) => e.date)
              .sort()
              .slice(-1)[0],
          ),
          parse(cutoff),
        ) <= 42
      ) {
        step = clampStep(old + 1);
        reason = old === 4 ? "cap" : "up";
      } else {
        reason = "repeat";
        if (data.worsening) data.reason = "trend";
        else if (lastCycle.coverage < 0.8 && data.level !== "collecting") data.reason = "coverage";
      }
    }
    const eligible = progressionEligible(ds, type, run),
      plannedDates = progressionPlannedDates(cycle, type, ds);
    return {
      v: 1,
      ...cycle,
      signature,
      step,
      reason,
      eligible,
      data,
      plannedDates,
    };
  }
  /* Heavy rep schemes (4–6, 5–8 …) only make sense with added weight. Bodyweight exercises in such a block
     get a bodyweight range by level instead, done slowly – otherwise "4 × 4 push-ups" would be far too easy. */
  const BW_RANGE = [
    [8, 10],
    [10, 12],
    [12, 15],
  ];
  const bwHeavy = (b, id) => {
    const m = (b.sets || "").match(/^\d+×\s*(\d+)[–-](\d+)/);
    return !!m && +m[2] <= 8 && !hasKg(id) && !TIMED.has(id) && !isExplSets(b.sets);
  };
  /* Strength targets from the logged sets (Codeprüfung 15.11.2026, Betreiber: alle Empfehlungen).
     Three sources, three jobs: the logged sets give the performance per exercise, the final effort rating only steers
     rest density and blocks increases when it was too hard, the fitness test sets the rep ranges.
     - comparable: same exercise, same relevant equipment, same rep range and timed/reps – place, session type and
       discipline don't matter; a performance counts if the session was finished, effort entered and all target sets
       logged (with weight for weighted exercises); per session the weakest of the target sets counts, so a single
       outstanding set changes nothing
     - an increase needs 2 of the last 3 comparable sessions (6 weeks), none of them above the effort target, and a
       session that may progress (base phase, no deload/ramp/KO/bad form, no worsening trend, no heavy load yesterday);
       at most one change per exercise in 14 days
     - one lever: more reps up to the top of the range; at the top +2.5 % weight and back to the bottom of the range;
       a heavier weight done in all sets in 2 of 3 is taken over (at most +10 %), also back to the bottom of the range
     - everything is derived from the log on each build: opening or rebuilding never adds the same performance twice */
  function strengthTarget(sess, b, it) {
    const pr = sess.progression,
      timed = TIMED.has(it.id),
      match = (b.sets || "").match(/^\d+×\s*(\d+)[–-](\d+)/),
      range = timed
        ? [
            [20, 30],
            [30, 45],
            [45, 60],
          ][doseLevel(b)]
        : bwHeavy(b, it.id)
          ? BW_RANGE[doseLevel(b)] || BW_RANGE[1]
          : match && [+match[1], +match[2]];
    // Circuits, explosive lifts, AMRAP/special prescriptions and changed equipment keep their own dosing.
    if (!range || isCirc(b) || EX[it.id]?.cat !== "str" || (DOSE_FIX[EX[it.id].key] && !timed)) return null;
    const n = blockSets(b),
      [lo, hi] = range,
      eq = relevantEquipment(it.id, sess.eq),
      kgEx = hasKg(it.id),
      kind = `${pr.signature}:${sess.loc}:${eq}:${lo}-${hi}:${n}:${timed ? "s" : "r"}`,
      day = (k) => iso(addDays(parse(sess.date), -k)),
      eqOf = (tg) => {
        if (tg.eq != null) return tg.eq;
        const parts = String(tg.kind || "").split(":");
        return parts.length >= 9 ? relevantEquipment(it.id, parts[parts.length - 4].split(",")) : null;
      },
      same = (tg) => tg && tg.lo === lo && tg.hi === hi && !!tg.timed === timed && eqOf(tg) === eq,
      byDate = new Map();
    for (const e of S.log) {
      if (e.src === "club" || !Array.isArray(e.perf) || e.date >= sess.date || e.date > iso(today()) || e.date < day(84)) continue;
      const perf = e.perf.find((x) => x.id === it.id && same(x.target));
      if (perf && !byDate.has(e.date)) byDate.set(e.date, { e, perf });
    }
    const comp = [...byDate.values()].sort((a, b2) => b2.e.date.localeCompare(a.e.date)),
      last = comp[0],
      old = last?.perf.target,
      target = {
        kind,
        cycle: pr.id,
        n,
        lo,
        hi,
        eq,
        r: Math.max(lo, Math.min(hi, old?.baseR ?? old?.r ?? lo)),
        kg: old?.kg ?? null,
        timed,
        slow: bwHeavy(b, it.id) || undefined,
        reason: old ? "repeat" : "initial",
      };
    // A load is only suggested once it was actually entered for all sets; never invent a starting weight.
    if (kgEx && target.kg == null && last) {
      const weights = last.perf.sets.slice(0, n).map((r) => r.kg);
      if (weights.length === n && weights.every((w) => Number.isFinite(w) && w > 0 && w === weights[0])) target.kg = weights[0];
    }
    // one performance per session: complete, the weakest of the target sets
    const perfOf = (x) => {
      const sets = (x.perf.sets || []).slice(0, n),
        ok =
          x.e.completed === true &&
          x.e.inputConfirmed === true &&
          validEffort(x.e) &&
          sets.length === n &&
          sets.every((r) => Number.isFinite(r.r) && r.r >= 0 && (!kgEx || (Number.isFinite(r.kg) && r.kg > 0)));
      return ok
        ? {
            x,
            minR: Math.min(...sets.map((r) => r.r)),
            minKg: kgEx ? Math.min(...sets.map((r) => r.kg)) : null,
            hard: x.e.rpe > x.e.tHi || x.perf.effort === "hard",
            tooHard: x.e.rpe >= x.e.tHi + 2 || x.perf.effort === "hard",
          }
        : null;
    };
    const recent = comp.filter((x) => x.e.date >= day(42)).slice(0, 3),
      evid = recent.map(perfOf).filter(Boolean),
      allEvid = comp.map(perfOf).filter(Boolean),
      exerciseReady =
        allEvid.length >= 4 && new Set(allEvid.map((v) => iso(monday(parse(v.x.e.date))))).size >= 3,
      changedLately = comp.some((x) => x.e.date >= day(13) && ["up", "down"].includes(x.perf.target.reason)),
      atLoad = (v) => !kgEx || target.kg == null || v.minKg >= target.kg;
    const waveTarget = () => {
      let off = pr.block || !exerciseReady || pr.data?.level === "collecting" ? 0 : [-1, 0, 1, 2, 0][pr.week - 1] * (timed ? 5 : 1);
      // the planned wave never adds to an increase of the same day
      if (target.reason === "up" || target.loadUp) off = Math.min(0, off);
      return { ...target, baseR: target.r, r: Math.max(lo, Math.min(hi, target.r + off)) };
    };
    // no increase in protected days: deload week, gentle return, KO lock, poor form, fasting, a hard week, taper and
    // recovery before/after a tournament, under 15; build phases may still progress strength (as before)
    const ds = sess.date,
      protectedDay =
        young() ||
        weekLoad(ds).deload ||
        rampOn(ds) ||
        koLock(ds) ||
        ramadanOn(ds) ||
        weekMood(ds) === "hard" ||
        formOn(ds) !== 2 ||
        ["taper", "recover"].includes(phaseInfo(ds).phase);
    // the same locks for every way up – an increase and a carry-over alike (Prüfung 15.11.2026)
    const mayUp =
      !protectedDay &&
      pr.reason !== "down" &&
      !pr.data?.worsening &&
      !changedLately &&
      lightRegions({ log: S.log, date: sess.date }).length === 0;
    /* Step 2 (15.11.2026): the fitness test changed the rep range (or the number of sets). The last complete performance
       of the same exercise with the same equipment is carried into the new range instead of starting over:
       weight via the estimated one-rep max (Epley, weakest set), rounded down, reps at the bottom of the new range;
       without weight the reps reached, inside the new range. At most +10 % on the former weight; no rise at all when
       an increase would be locked (mayUp), after a session above the effort target or within 14 days of a change.
       Used when there is no target in the new range yet, or when the other-range performance is newer than the last
       entry in the new range (time order decides). A carry-over that raises the load counts as the one lever of the
       day (set rest 60 s). Derived from the log, so it never adds up. */
    const carryFrom = (() => {
      const prev = [];
      for (const e of S.log) {
        if (e.src === "club" || !Array.isArray(e.perf) || e.date >= sess.date || e.date > iso(today()) || e.date < day(84)) continue;
        const p = e.perf.find((x) => x.id === it.id && x.target && !!x.target.timed === timed && eqOf(x.target) === eq && !same(x.target));
        if (p) prev.push({ e, perf: p });
      }
      prev.sort((a, c) => c.e.date.localeCompare(a.e.date));
      for (const x of prev) {
        const pn = x.perf.target.n || n,
          sets = (x.perf.sets || []).slice(0, pn);
        if (
          x.e.completed === true &&
          x.e.inputConfirmed === true &&
          validEffort(x.e) &&
          sets.length === pn &&
          sets.every((r) => Number.isFinite(r.r) && r.r > 0 && (!kgEx || (Number.isFinite(r.kg) && r.kg > 0)))
        )
          return { x, sets };
      }
      return null;
    })();
    const carryOver = () => {
      const { x, sets } = carryFrom,
        minR = Math.min(...sets.map((r) => r.r)),
        pt = x.perf.target,
        rise =
          mayUp &&
          !(x.e.rpe > x.e.tHi || x.perf.effort === "hard") &&
          !(x.e.date >= day(13) && ["up", "down"].includes(pt.reason));
      if (kgEx) {
        const minKg = Math.min(...sets.map((r) => r.kg)),
          est = minKg * (1 + minR / 30),
          cap = rise ? minKg * 1.1 : minKg;
        target.kg = Math.floor(Math.min(est / (1 + lo / 30), cap) * 10) / 10;
        target.r = lo;
        target.loadUp = target.kg > (pt.kg ?? minKg) || undefined;
      } else {
        const was = pt.baseR ?? pt.r ?? minR;
        target.r = Math.max(lo, Math.min(hi, rise ? minR : Math.min(minR, was)));
        target.loadUp = target.r > was || undefined;
      }
      target.reason = "carry";
      target.from = { lo: pt.lo, hi: pt.hi, date: x.e.date };
    };
    if (carryFrom && (!old || carryFrom.x.e.date > last.e.date)) {
      carryOver();
      return waveTarget();
    }
    if (!old) return waveTarget();
    // repeatedly far too hard: lighter (also outside the base phase – safety first)
    if (!changedLately && evid.filter((v) => v.tooHard).length >= 2) {
      if (target.kg != null) target.kg = Math.round(target.kg * 0.95 * 10) / 10;
      else target.r = Math.max(lo, target.r - (timed ? 5 : 1));
      target.reason = "down";
      return waveTarget();
    }
    if (!mayUp) return waveTarget();
    const good = evid.filter((v) => !v.hard && atLoad(v)),
      second = (vals) => vals.sort((a, c) => c - a)[1],
      up = (r, kg) => {
        target.r = r;
        if (kg != null) target.kg = kg;
        target.reason = "up";
      };
    if (kgEx && target.kg != null) {
      const heavier = good.filter((v) => v.minKg > target.kg && v.minR >= lo);
      if (heavier.length >= 2) {
        const kg = Math.min(second(heavier.map((v) => v.minKg)), Math.floor(target.kg * 1.1 * 10) / 10);
        if (kg > target.kg) {
          up(lo, kg);
          return waveTarget();
        }
      }
      if (good.filter((v) => v.minR >= hi).length >= 2 && target.r >= hi) {
        up(lo, Math.max(Math.floor(target.kg * 1.025 * 10) / 10, Math.round((target.kg + 0.1) * 10) / 10));
        return waveTarget();
      }
    }
    const better = good.filter((v) => v.minR > target.r);
    if (better.length >= 2 && target.r < hi) {
      up(Math.min(hi, second(better.map((v) => v.minR))));
      return waveTarget();
    }
    // the steady way (as before): the target itself met in a closed load cycle – at least 4 sessions in 3 weeks,
    // 80 % of them with all sets at target and the effort in range – gives one step per cycle
    const cycleClosed = old.cycle !== pr.id && last.e.progression?.end < sess.date && last.e.progression?.end < iso(today()),
      atTarget = allEvid.filter(
        (v) =>
          v.x.perf.target.cycle === old.cycle &&
          (v.x.perf.target.baseR ?? v.x.perf.target.r) === (old.baseR ?? old.r) &&
          (!kgEx || target.kg == null || v.minKg >= target.kg),
      ),
      met = atTarget.filter((v) => !v.hard && v.x.e.completed === true && v.minR >= (old.baseR ?? old.r));
    if (cycleClosed && ["up", "cap"].includes(pr.reason) && exerciseReady && atTarget.length >= 4 && met.length / atTarget.length >= 0.8) {
      if (target.r < hi) up(Math.min(hi, target.r + (timed ? 5 : 1)));
      else if (kgEx && target.kg != null) up(lo, Math.max(Math.floor(target.kg * 1.025 * 10) / 10, Math.round((target.kg + 0.1) * 10) / 10));
      if (target.reason === "up") return waveTarget();
    }
    // more was logged, but the effort was too high: the target stays, and the line says why
    const overdone = evid.filter((v) => v.hard && atLoad(v) && (v.minR > target.r || (kgEx && target.kg != null && v.minKg > target.kg)));
    if (overdone.length >= 2 || (overdone.length >= 1 && better.length + overdone.length >= 2)) target.reason = "hold";
    return waveTarget();
  }
  /* short target line; the reason only when the target actually changed, the weight hint only for weighted exercises */
  function targetText(target, id) {
    const T = trainingText(),
      why = ["up", "down", "hold", "carry"].includes(target.reason) ? ` · ${T.targetWhy[target.reason]}` : "",
      kgHint = target.kg == null && id != null && hasKg(id) ? ` · ${T.ownWeight}` : "";
    const slow = target.slow ? (S.profile.lang === "de" ? ", langsam (3 s ab)" : ", slow (3 s down)") : "";
    const per = id != null && EX[id] ? sideWord(EX[id].key) : "";
    return `${T.target}: ${target.n} × ${target.r}${target.timed ? " s" : ""}${per}${target.kg != null ? ` × ${numF(target.kg)} kg` : ""}${slow}${why}${kgHint}`;
  }
  function progressSession(sess) {
    const pr = progressionState(sess.date, sess.type, sess.run),
      txt = trainingText();
    sess.progression = { ...pr, plannedMin: sess.min };
    sess.effortDose = effortDoseState(sess, pr);
    if (sess.blocks.some((b) => b.items.some((it) => it.basic))) sess.notes.push(flowText().anchors);
    if (!["T", "C", "K", "S"].includes(sess.type) || sess.run || young()) return sess;
    sess.notes.push(pr.eligible ? `${txt.cycle(pr.week, pr.weeks, pr.step)} ${sess.effortDose?.active ? (S.profile.lang === "de" ? "Die Abschlussbewertung steuert die nächste Dosierung." : "Final effort controls the next dose.") : txt[pr.reason]}` : txt.protected);
    if (!pr.eligible) return sess;
    sess.notes.push(txt.data(pr.data.level, pr.data.count, pr.data.weeks));
    if (pr.data.reason && !sess.effortDose?.active) sess.notes.push(txt.dataWhy[pr.data.reason]);
    // Increase density alone, never contact intensity or the official competition format.
    // Changing pauses, with fewer rounds if needed, keeps the existing time budget intact.
    if (["T", "C", "K"].includes(sess.type)) {
      const b = roundBlock(sess),
        wave = pr.block ? 1 : pr.data.level === "collecting" ? 0.9 : [0.9, 0.95, 1, 1.05, 1][pr.week - 1];
      if (b && b.w && b.b) {
        const old = b.b,
          factor = (sess.effortDose?.active
            ? sess.effortDose.eligible ? sess.effortDose.factor : Math.min(1, sess.effortDose.factor, 1 + pr.step * 0.05)
            : 1 + pr.step * 0.05) * wave;
        b.b = Math.max(30, Math.round(old / factor));
        const maxRounds = Math.max(1, Math.floor((b.min * 60 + b.b) / (b.w + b.b)));
        if (b.items.length > maxRounds) b.items = b.items.slice(0, maxRounds);
        if (sess.effortDose) sess.effortDose.roundRest = b.b;
        const prev = sess.effortDose?.source && S.log.find(e => e.id === sess.effortDose.source)?.effortDose?.roundRest;
        if ((prev || old) !== b.b) sess.notes.push(txt.density(prev || old, b.b));
      }
    }
    sess.blocks.forEach((b) => {
      if (S.profile.work === "phys" || ["warm", "cool"].includes(b.key) || b.rounds) return;
      b.items.forEach((it) => {
        const target = strengthTarget(sess, b, it);
        if (target) it.target = target;
      });
    });
    applyStrengthRestDose(sess);
    return sess;
  }


  /* Keep one learnt density correction per sport/style/type, independently of location and equipment.
     The cycle wave still varies recovery. The control replaces the cycle's upward density factor,
     rather than multiplying two independent increases. */
  function effortDoseState(sess, pr) {
    if (!["T","C","K","S"].includes(sess.type) || sess.run || young()) return null;
    const sport = sportNow(), style = sport === "taekwondo" ? tkdUnitStyle() : "",
      disc = sport === "kickboxing" ? discOf() : "",
      scope = JSON.stringify([1,sport,style,disc,sess.type,fitnessLevel()]),
      eligible = pr.eligible && pr.reason !== "down" && !pr.data.worsening && lightRegions({log:S.log,date:sess.date}).length === 0;
    const entries = S.log.filter(e => e.src === "own" && e.type === sess.type && entrySport(e) === sport &&
      (sport !== "taekwondo" || (e.tstyle || "wt") === style) &&
      (sport !== "kickboxing" || (e.disc || S.profile.disc) === disc));
    const state = nextEffortDose({entries,scope,date:sess.date,today:iso(today()),fallback:sess.type === "S" ? 1 : 1 + pr.step * .05});
    return {v:1,scope,eligible,setRest:60,...state};
  }
  function applyStrengthRestDose(sess) {
    const d = sess.effortDose;
    if (!d?.active || !d.eligible || sess.type !== "S") return;
    // one lever at a time: on a day with higher reps or weight the set rest goes back to 60 s and the rating starts
    // from there again (factor 1); otherwise the rating shortens or lengthens the rests
    if (sess.blocks.some((b) => b.items.some((it) => it.target?.reason === "up" || it.target?.loadUp))) {
      sess.setRest = 60;
      sess.lapRest = 90;
      d.setRest = 60;
      d.factor = 1;
      d.loadUp = true;
      sess.notes.push(S.profile.lang === "de"
        ? "Heute steigen Wiederholungen oder Gewicht – die Satzpause bleibt dafür bei 60 s."
        : "Reps or weight go up today – the set rest stays at 60 s for it.");
      return;
    }
    sess.setRest = Math.max(45, Math.min(90, Math.round(60 / d.factor)));
    sess.lapRest = Math.max(60, Math.min(135, Math.round(90 / d.factor)));
    d.setRest = sess.setRest;
    if (sess.setRest !== 60) sess.notes.push(S.profile.lang === "de"
      ? `Abschlussbewertung: Satzpause 60 → ${sess.setRest} s. Gewichte und Wiederholungen richten sich nach deinen eingetragenen Sätzen.`
      : `Final effort rating: set rest 60 → ${sess.setRest} s. Weights and reps follow your logged sets.`);
  }
