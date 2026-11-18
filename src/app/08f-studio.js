  /* ============ Strength unit in the fitness gym (Betreiber 18.11.2026, Prüfauftrag Punkt 4, E59–E66) ============
     "studio" is the fitness gym, "gym" the sports hall – only the studio is meant here, and only its strength unit.
     Assumed: the usual strength and cardio machines (standard list: barbells, dumbbells, kettlebell, cable, lat pulldown,
     leg press, chest press, cable row, leg curl, leg extension, shoulder press, pull-up bar; bike, treadmill,
     cross-trainer, rower), a mat in the stretching corner – no bag, no ring, no pad or partner station, no course floor.
     - warm-up: a cardio machine and mobility standing (E61); no hardening block (E65); no jump block (E60);
     - strength: machines first per movement pattern; the basic lift stays the same (leg press, chest press) so the log
       stays comparable, the pull alternates cable row / lat pulldown, the other exercises vary (E62, E66);
     - conditioning: first one cardio machine, then the kettlebell at one place – one station change at most (E59, E64);
       limits pick the machine (knee/ankle: no treadmill; back: no rower, no swings);
     - "Gerät wechseln" (E63; label and look 18.11.2026): one tap swaps an exercise to the next alternative of the same
       movement pattern that the standard list has and the limits allow – only while nothing of it is entered, ticked or
       running (Prüfauftrag Punkt 2: any value, left or right side alone too; target values are placeholders, not input);
       cardio swaps all rounds of that machine. Entered data is never deleted by a swap.
       Weights are never carried over: the target comes from the history of the new exercise. Nothing claims that a
       machine is free. */
  const STUDIO_CARDIO = ["cond.bike_sprints", "cond.cross_trainer_intervals", "cond.rowing_machine_intervals", "cond.treadmill_intervals"];
  /* the conditioning rounds of the strength unit: one cardio machine, then kettlebell swings (about a third) */
  function studioCond(n, loc, eq, used) {
    const ok = (id) => EX[id] && okEx(EX[id], loc, eq) && !used.has(id),
      cardio = shuffle(STUDIO_CARDIO.filter(ok)),
      kb = ok("cond.kettlebell_swings") ? "cond.kettlebell_swings" : null,
      nk = kb && cardio.length ? Math.floor(n / 3) || (n >= 2 ? 1 : 0) : kb ? n : 0,
      first = cardio[0] || null,
      out = [];
    for (let i = 0; i < n - nk && first; i++) out.push({ kind: "ex", id: first });
    for (let i = 0; i < nk; i++) out.push({ kind: "ex", id: kb });
    if (first) used.add(first);
    if (nk) used.add(kb);
    return out.length ? out : pickEx("cond", n, loc, eq, used);
  }
  /* the movement patterns: the first one that fits is the default, the rest are the alternatives in this order */
  const STUDIO_ALT = [
    ["str.leg_press", "str.barbell_back_squat", "str.goblet_squats", "str.bulgarian_split_squats", "str.lunges"],
    ["str.leg_extension_machine", "str.step_ups", "str.lunges"],
    ["str.leg_curl_machine", "str.barbell_romanian_deadlift", "str.romanian_deadlift", "str.glute_bridges"],
    ["str.barbell_hip_thrust", "str.glute_bridges"],
    ["str.chest_press_machine", "str.bench_press", "str.dumbbell_press", "str.push_ups"],
    ["str.machine_shoulder_press", "str.seated_dumbbell_shoulder_press", "str.push_ups"],
    ["str.seated_cable_row", "str.lat_pulldown", "str.pull_ups", "str.negative_pull_ups"],
    ["str.lat_pulldown", "str.seated_cable_row", "str.pull_ups", "str.negative_pull_ups"],
    ["str.cable_face_pulls", "str.band_face_pulls"],
    ["str.cable_woodchop", "str.russian_twists", "str.dead_bugs"],
    STUDIO_CARDIO,
  ];
  /* the basic groups of strengthBasics in the fitness gym: the basic lift fixed, the pull alternates (E66) */
  const studioBasics = () => [
    ["str.leg_press", "str.barbell_back_squat", "str.goblet_squats", "str.lunges"],
    ["str.chest_press_machine", "str.bench_press", "str.dumbbell_press", "str.push_ups"],
    [...(Math.random() < 0.5 ? ["str.seated_cable_row", "str.lat_pulldown"] : ["str.lat_pulldown", "str.seated_cable_row"]), "str.pull_ups", "str.negative_pull_ups", "str.plank"],
    // the hip hinge (back of the legs) varies: leg curl, Romanian deadlift or hip thrust
    Object.assign(shuffle(["str.leg_curl_machine", "str.barbell_romanian_deadlift", "str.barbell_hip_thrust"]).concat(["str.romanian_deadlift", "str.glute_bridges"]), { free: true }),
  ];
  /* an exercise or round may be swapped only while nothing of it is entered, ticked or running: every field of every
     set row counts (r, kg, rL, rR, …) – one side of a one-legged set alone is an entry; targets live in it.target and
     the placeholders, never in the rows */
  const altVal = (v) => v != null && v !== "" && v !== false;
  function altKeyStarted(sess, key) {
    const rows = (sess.perf || {})[key],
      tm = ui.exerciseTimer;
    return !!(
      (sess.checked || {})[key] ||
      (Array.isArray(rows) && rows.some((r) => r && Object.values(r).some(altVal))) ||
      (sess.timedLaps || {})[key] > 0 ||
      ((sess.lapsDone || {})[key] || []).length ||
      altVal((sess.exerciseEffort || {})[key]) ||
      (tm && tm.ds === (sess.date || ui.sel) && tm.key === key && !tm.restOnly)
    );
  }
  function altStarted(sess, bi, ni) {
    const b = sess.blocks[bi],
      it = b && b.items[ni];
    if (!it) return true;
    if (b.rounds) return b.items.some((x, k) => x.id === it.id && (roundDone(sess, k + 1) || altKeyStarted(sess, `${bi}.${k}`)));
    return altKeyStarted(sess, `${bi}.${ni}`);
  }
  /* the next alternative of the same pattern that exists in the fitness gym, fits the limits and is not in the unit yet */
  function altNext(sess, bi, ni) {
    const it = sess.blocks[bi].items[ni],
      g = STUDIO_ALT.find((x) => x.includes(it.id));
    if (!g) return null;
    const inUnit = new Set(sess.blocks.flatMap((b) => b.items.map((x) => x.id)));
    const i = g.indexOf(it.id);
    for (let k = 1; k < g.length; k++) {
      const id = g[(i + k) % g.length];
      if (EX[id] && !inUnit.has(id) && okEx(EX[id], "studio", ["weights", "kb", "bb", "bar", "studio"])) return id;
    }
    return null;
  }
  const altOn = (sess) => !!sess && sess.loc === "studio" && sess.type === "S";
  function altBtn(sess, bi, ni, preview) {
    if (preview || !altOn(sess) || doneOn(sess.date || ui.sel)) return "";
    const b = sess.blocks[bi],
      it = b && b.items[ni];
    if (!it || !EX[it.id] || ["warm", "cool"].includes(b.key) || altStarted(sess, bi, ni) || !altNext(sess, bi, ni)) return "";
    // a secondary button: frame, accent surface, swap symbol and text – below the main action, never colour alone
    return `<div class="altrow"><button type="button" class="btn sec altbtn" data-alt="${bi}.${ni}"><span class="altic" aria-hidden="true">⇄</span><span>${t("studioAlt").btn}</span></button></div>`;
  }
  function altAction(key) {
    const sess = S.sessions[ui.sel];
    if (!altOn(sess)) return;
    const [bi, ni] = String(key).split(".").map(Number),
      b = sess.blocks[bi],
      it = b && b.items[ni];
    if (!it) return;
    // the lock in the handler too: something is entered – nothing is swapped, nothing deleted
    if (altStarted(sess, bi, ni)) {
      toast(t("studioAlt").locked);
      return render();
    }
    const nx = altNext(sess, bi, ni);
    if (!nx) return;
    const old = it.id;
    // cardio: every round on that machine moves; strength: the one exercise, its target from its own history
    const targets = b.rounds ? b.items.filter((x) => x.id === old) : [it];
    for (const x of targets) {
      x.alt = x.alt || old;
      x.id = nx;
      delete x.target;
      if (!b.rounds && S.profile.work !== "phys") {
        const tg = strengthTarget(sess, b, x);
        if (tg) x.target = tg;
      }
    }
    // only empty rows go (the new exercise may have another number of sets) – the lock above makes sure they are empty
    const rows = !b.rounds && sess.perf && sess.perf[`${bi}.${ni}`];
    if (rows && !rows.some((r) => r && Object.values(r).some(altVal))) delete sess.perf[`${bi}.${ni}`];
    store.save();
    toast(t("studioAlt").done(exText(nx).name));
    render();
  }
