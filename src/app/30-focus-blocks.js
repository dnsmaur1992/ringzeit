  /* ============ Focus blocks: 6 weeks in 3 stages (fight endurance, power, mobility) ============ */
  /*
   * S.profile.block:     { k: "end"|"pow"|"mob", start: date, paused: date|null }
   * S.profile.blockHist: [{ k, start, end, full }]
   * S.profile.blkSeen:   id of the test whose block suggestion was dismissed or used
   * Tournament phases win: during build, peak, taper and recovery the block content rests.
   */
  const BLK = ["end", "pow", "mob"];
  const BLK_COL = { end: "#5fb3a6", pow: "#c9a86a", mob: "#8ec9a4" };
  const BLK_ICO = {
    end: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.5-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.5 12 20 12 20z"/></svg>',
    pow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z"/></svg>',
    mob: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.5V8h-4.5"/></svg>',
  };
  /* test areas per block (for the suggestion and the before/after comparison) */
  const BLK_CATS = { end: ["end"], pow: ["str", "spd"], mob: ["flx"] };
  /* fight-specific conditioning first in the endurance block */
  const BLK_END = ["cond.shadow_sprints", "cond.bag_sprints", "cond.kick_intervals", "cond.rope_intervals", "cond.speed_rounds"];
  /* mobility per stage: hips & adductors → dynamic kick mobility → active range */
  const BLK_MOB = [
    ["mob.quadruped_hip_circles", "mob.90_90_hip_switches", "mob.cossack_squats", "mob.frog_stretch", "mob.pigeon_stretch", "mob.deep_squat_hold"],
    ["mob.controlled_leg_swings", "mob.slow_motion_kicks", "mob.worlds_greatest_stretch", "mob.cossack_squats", "mob.90_90_hip_switches"],
    ["mob.kick_holds", "mob.active_leg_raises", "mob.slow_motion_kicks", "mob.cossack_squats", "mob.controlled_leg_swings"],
  ];
  /* block week on a date (1–6) regardless of tournaments; null outside the block or while paused */
  function blockRaw(ds) {
    const b = S.profile.block;
    if (!b || !b.k) return null;
    const d = ds || iso(today());
    if (d < b.start || (b.paused && d >= b.paused)) return null;
    const wk = Math.floor(daysBetween(parse(b.start), parse(d)) / 7) + 1;
    if (wk > 6) return null;
    return { k: b.k, wk, st: Math.floor((wk - 1) / 2) };
  }
  /* the block as it shapes the plan: off during tournament phases */
  function blockInfo(ds) {
    const r = blockRaw(ds);
    if (!r) return null;
    const ph = phaseInfo(ds).phase;
    return ph === "base" || ph === "grade" ? r : null;
  }
  /* status for today: soon, run, comp (tournament prep wins), paused, done */
  function blockState() {
    const b = S.profile.block;
    if (!b || !b.k) return null;
    const td = iso(today());
    if (td < b.start) return { s: "soon", k: b.k, wk: 0, st: 0, days: 0 };
    const ref = b.paused || td,
      days = daysBetween(parse(b.start), parse(ref)),
      wk = Math.floor(days / 7) + 1;
    if (wk > 6) return { s: "done", k: b.k, wk: 6, st: 2, days: 42 };
    const st = Math.floor((wk - 1) / 2);
    if (b.paused) return { s: "paused", k: b.k, wk, st, days };
    const ph = phaseInfo(td).phase;
    return {
      s: ph === "base" || ph === "grade" ? "run" : "comp",
      k: b.k,
      wk,
      st,
      days,
    };
  }
  /* fight endurance: round length, rest and (fixed) number of rounds per week */
  function blockRounds(bi, ds) {
    const L = fitnessLevel(),
      m = ageGroup() === "masters" ? 1 : 0,
      dl = weekLoad(ds).deload ? 1 : 0;
    if (bi.st === 0) return { w: bi.wk === 1 ? 240 : 300, b: 60, n: 0, cue: "end0" };
    // round pace: one round more each week
    if (bi.st === 1) return { w: 120, b: 60, n: Math.max(3, bi.wk + L - m - dl), cue: "end1" };
    if (bi.wk === 5) return { w: 120, b: 60, n: 0, pace: true };
    // overload: short rests (a little longer for beginners and youth)
    return {
      w: 120,
      b: dl ? 60 : L === 0 || young() ? 45 : 30,
      n: Math.max(3, 4 + (L === 2 ? 1 : 0) - (L === 0 ? 1 : 0) - m - dl),
      cue: "end2o",
    };
  }
  /* weekly session types inside a block; at most 3 hard units per week, club training included */
  function blockTypes(m, days, k) {
    const cnt = (ty) => days.filter((d) => m[d] === ty).length,
      clubN = ((S.profile.club || {}).days || []).length,
      hard = () => days.filter((d) => HARD_T.has(m[d])).length + clubN,
      swap = (from, to, skip = 0) => {
        const d = days.filter((x) => m[x] === from)[skip];
        if (d == null) return false;
        m[d] = to;
        return true;
      };
    if (k === "end") {
      if (hard() < 3) swap("T", "C");
      if (days.length >= 4 && !cnt("K") && hard() < 3) swap("T", "K", 1);
    } else if (k === "pow") {
      const want = days.length >= 4 ? 2 : 1;
      while (cnt("S") < want && (swap("K", "S") || swap("C", "S") || (cnt("T") > 1 && swap("T", "S", 1))));
    } else if (k === "mob") {
      const want = days.length >= 5 ? 2 : days.length >= 4 ? 1 : 0;
      while (cnt("M") < want && (swap("K", "M") || swap("C", "M") || (cnt("T") > 1 && swap("T", "M", 1))));
    }
  }
  /* round cue: fight-pace intervals or the block's pace hint */
  const paceTxt = (it) => (it.cue ? t("blk").cue[it.cue] || "" : it.pace ? t("paceIv") : it.ease ? t(it.box ? "easeRoundBox" : "easeRound") : "");
  /* weakest physical area of the latest test (technique doesn't pick a block) */
  function blockSuggest() {
    const tt = S.tests[S.tests.length - 1];
    if (!tt || !tt.scores) return null;
    const cand = ["end", "spd", "str", "flx"].filter((k) => tt.scores[k] != null);
    if (!cand.length) return null;
    let w = cand[0];
    cand.forEach((k) => {
      if (tt.scores[k] < tt.scores[w]) w = k;
    });
    if (tt.scores[w] >= 5) return null;
    return {
      cat: w,
      k: { end: "end", spd: "pow", str: "pow", flx: "mob" }[w],
      test: tt,
    };
  }
  /* last test before the block and the first one from week 6 on */
  function blockTests(b) {
    const cut = iso(addDays(parse(b.start), 35));
    return {
      before: S.tests.filter((x) => x.date < b.start).pop(),
      after: S.tests.find((x) => x.date >= cut),
    };
  }
  function blockWeekTxt(bi) {
    const W = t("blk").wtxt[bi.k][bi.st];
    if (bi.k !== "end") return W;
    const r = blockRounds(bi, iso(today())),
      nx = bi.wk === 3 ? blockRounds({ k: "end", wk: 4, st: 1 }, iso(addDays(today(), 7))).n : 0;
    return W(fmt(r.w), fmt(r.b), r.n, nx, bi.wk === 6);
  }
  function blockSync() {
    if (draft) {
      draft.block = S.profile.block;
      draft.blockHist = S.profile.blockHist;
      draft.blkSeen = S.profile.blkSeen;
    }
    // planned sessions from today on are rebuilt with the new block content
    const td = iso(today());
    dropOpenSessions(td);
    ui.setup = null;
    store.save();
  }
  function blockStart(k, when) {
    const start = when === "mon" ? iso(addDays(monday(today()), 7)) : iso(today()),
      sg = blockSuggest();
    S.profile.block = { k, start, paused: null };
    if (sg) S.profile.blkSeen = sg.test.id;
    blockSync();
  }
  function blockFinish() {
    const b = S.profile.block,
      bs = blockState();
    if (!b) return;
    S.profile.blockHist = [
      ...(S.profile.blockHist || []),
      { k: b.k, start: b.start, end: iso(today()), full: bs.s === "done" },
    ].slice(-20);
    S.profile.block = null;
    blockSync();
  }
  function blockPause(on) {
    const b = S.profile.block;
    if (!b) return;
    if (on) b.paused = iso(today());
    else if (b.paused) {
      // the paused days are added to the block, so no week is lost
      const gap = Math.max(0, daysBetween(parse(b.paused), today()));
      b.start = iso(addDays(parse(b.start), gap));
      b.paused = null;
    }
    blockSync();
  }
  function blockStages(k, cur, soon) {
    const B = t("blk");
    return `<div class="bstg">${[0, 1, 2]
      .map((i) => {
        const done = cur != null && !soon && i < cur,
          on = cur != null && !soon && i === cur;
        return `<div class="${done ? "done" : on ? "on" : ""}"><b>${done ? "✓" : on ? B.now : cur == null ? B.wk(i * 2 + 1, i * 2 + 2) : B.wkN(i * 2 + 1)}</b><small>${B.stages[k][i]}</small></div>`;
      })
      .join("")}</div>`;
  }
  /* Today: progress card during a block, otherwise a suggestion after a fitness test */
  function blockHtml() {
    const B = t("blk"),
      bs = blockState();
    if (bs) {
      const b = S.profile.block,
        head = (title) =>
          `<div class="bhd"><div><span class="bchip">${B.names[bs.k]}</span><b>${esc(title)}</b></div><span class="bico">${BLK_ICO[bs.k]}</span></div>`;
      if (bs.s === "done") {
        const tt = blockTests(b);
        let body;
        if (tt.after) {
          const rows = BLK_CATS[bs.k]
            .map((c) => {
              const a = tt.before && tt.before.scores[c],
                z = tt.after.scores[c];
              return `<div><span>${t("cats")[c]}</span><span class="${a && z > a ? "up" : ""}">${a ?? "–"} → ${z ?? "–"}</span></div>`;
            })
            .join("");
          body = `<div class="bcmp"><span class="sub">${B.doneCmp}</span>${rows}</div><div class="acts2"><button type="button" class="btn" data-blk="finish">${B.finish}</button></div>`;
        } else
          body = `<p class="sub">${B.doneS}</p><div class="acts2"><button type="button" class="btn" data-blk="test">${B.testGo}</button><button type="button" class="btn sec" data-blk="finish">${B.finish}</button></div>`;
        return `<div class="blkc" style="--bc:${BLK_COL[bs.k]}">${head(B.doneT)}<div class="pbar"><span style="width:100%"></span></div>${body}</div>`;
      }
      const soon = bs.s === "soon",
        title = soon ? B.soon(fmtDate(b.start)) : `${B.week(bs.wk)} · ${B.stages[bs.k][bs.st]}`,
        txt =
          bs.s === "comp"
            ? B.compNow
            : bs.s === "paused"
              ? B.pausedSince(fmtDate(b.paused))
              : blockWeekTxt(soon ? { k: bs.k, wk: 1, st: 0 } : bs);
      return `<div class="blkc" style="--bc:${BLK_COL[bs.k]}">${head(title)}<div class="pbar"><span style="width:${Math.round((100 * bs.days) / 42)}%"></span></div>${blockStages(bs.k, bs.st, soon)}<p class="sub">${esc(txt)}</p></div>`;
    }
    const sg = blockSuggest(),
      ph = phaseInfo().phase;
    if (!sg || S.profile.blkSeen === sg.test.id || !(ph === "base" || ph === "grade")) return "";
    return `<div class="blks" style="--bc:${BLK_COL[sg.k]}"><div class="bsrow"><span class="bico">${BLK_ICO[sg.k]}</span><div><b>${esc(B.sugT(t("cats")[sg.cat]))}</b><span class="sub">${esc(B.sugS(fmtDate(sg.test.date)))}</span></div></div><div class="acts2"><button type="button" class="btn" data-blk="view:${sg.k}">${B.view}</button><button type="button" class="btn sec" data-blk="later:${sg.test.id}">${B.later}</button></div></div>`;
  }
  /* Profile: start, pause or end a block */
  function blockProfHtml() {
    const B = t("blk"),
      bs = blockState(),
      b = S.profile.block;
    let h = `<div class="panel"><div class="field"><span class="lab">${B.prof}</span>`;
    if (!bs)
      h += `<span class="sub">${B.profHint}</span><button type="button" class="btn sec" data-blk="view">${B.choose}</button>`;
    else {
      const info =
        bs.s === "soon"
          ? B.soon(fmtDate(b.start))
          : bs.s === "done"
            ? B.doneT
            : bs.s === "paused"
              ? B.pausedSince(fmtDate(b.paused))
              : `${B.week(bs.wk)} · ${B.stages[bs.k][bs.st]}`;
      h += `<div class="bsrow" style="--bc:${BLK_COL[bs.k]}"><span class="bico">${BLK_ICO[bs.k]}</span><div><b>${B.names[bs.k]}</b><span class="sub">${esc(info)}</span></div></div><div class="acts2">${
        bs.s === "done"
          ? `<button type="button" class="btn" data-blk="finish">${B.finish}</button>`
          : `<button type="button" class="btn sec" data-blk="${bs.s === "paused" ? "resume" : "pause"}" ${bs.s === "soon" ? "disabled" : ""}>${bs.s === "paused" ? B.resume : B.pause}</button><button type="button" class="btn sec" data-blk="stop">${B.stop}</button>`
      }</div>`;
    }
    h += `</div>`;
    const hist = (S.profile.blockHist || []).slice(-3).reverse();
    if (hist.length)
      h += hist
        .map(
          (x) =>
            `<div class="row"><span style="flex:1"><b>${B.names[x.k]}</b><div class="sub">${fmtDate(x.start)} – ${fmtDate(x.end)}${x.full ? ` · ${B.hist} ✓` : ""}</div></span></div>`,
        )
        .join("");
    return h + `</div>`;
  }
  /* Bottom sheet: choose a block (the mock-up's step 2) */
  function blockSheetHtml(o) {
    const B = t("blk"),
      k = o.k,
      start = o.start === "mon" ? addDays(monday(today()), 7) : today(),
      end = addDays(start, 41),
      nc = (S.profile.comps || []).find(
        (c) => (c.kind || "comp") === "comp" && parse(c.date) >= start && parse(c.date) <= addDays(end, 7),
      );
    let h = `<h3>${B.title}</h3>`;
    h += BLK.map(
      (x) =>
        `<button type="button" class="bopt${x === k ? " on" : ""}" data-bk="${x}" style="--bc:${BLK_COL[x]}" aria-pressed="${x === k}"><span class="bico">${BLK_ICO[x]}</span><span><b>${B.names[x]}${o.rec === x ? `<em>${B.rec}</em>` : ""}</b><small>${B.subs[x]}</small></span></button>`,
    ).join("");
    h += `<div style="--bc:${BLK_COL[k]}">${blockStages(k, null)}</div>`;
    h += `<div class="lab">${B.start}</div><div class="seg">${["today", "mon"].map((x) => `<button type="button" data-bs="${x}" aria-pressed="${(o.start || "today") === x}">${x === "today" ? B.today : B.monday}</button>`).join("")}</div>`;
    h += `<p class="sub">${B.how[k]}</p>`;
    if (nc) h += `<div class="note warn">${esc(B.compWarn(fmtDate(nc.date)))}</div>`;
    if (k === "pow" && kneeAnk()) h += `<div class="note warn">${B.kaWarn}</div>`;
    h += `<div class="acts2"><button type="button" class="btn sec" data-sx="close">${t("cancel")}</button><button type="button" class="btn" data-sx="blkgo" style="background:${BLK_COL[k]}">${B.go}</button></div>`;
    return h;
  }
  function openBlockSheet(k) {
    const sg = blockSuggest();
    openSheet({
      kind: "blk",
      k: k || (sg && sg.k) || "end",
      rec: sg && sg.k,
      start: "today",
    });
  }
  /* after a fitness test: suggest a block when none is running */
  function blockAfterTest() {
    const ph = phaseInfo().phase;
    if (S.profile.block || !(ph === "base" || ph === "grade")) return;
    const sg = blockSuggest();
    if (sg && S.profile.blkSeen !== sg.test.id) openBlockSheet(sg.k);
  }
  function blockAction(a) {
    const [cmd, arg] = a.split(":"),
      B = t("blk");
    if (cmd === "view") return openBlockSheet(arg);
    if (cmd === "later") {
      S.profile.blkSeen = arg;
      if (draft) draft.blkSeen = arg;
      store.save();
      return render();
    }
    if (cmd === "test") {
      ui.tab = "test";
      ui.testView = "fit";
      ui.testOpen = true;
      ui.testDraft = {};
      render(true);
      window.scrollTo(0, 0);
      return;
    }
    if (cmd === "finish") {
      blockFinish();
      render();
      return toast(B.ended);
    }
    if (cmd === "pause" || cmd === "resume") {
      blockPause(cmd === "pause");
      render();
      return toast(cmd === "pause" ? B.pausedT : B.resumed);
    }
    if (cmd === "stop")
      return openSheet({
        kind: "confirm",
        title: B.stop,
        lines: [B.stopAsk],
        run: () => {
          blockFinish();
          render();
          toast(B.ended);
        },
      });
  }

