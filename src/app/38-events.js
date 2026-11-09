  /* ============ Events ============ */
  function readTestInputs() {
    const d = ui.testDraft,
      num = (id) => {
        const v = document.getElementById(id);
        if (!v) return null;
        const n = parseInt(v.value);
        return isNaN(n) ? null : n;
      };
    d.str = num("tStr");
    d.spd = num("tSpd");
    d.endM = num("tEndM");
    d.endS = num("tEndS");
  }
  document.addEventListener("click", async (ev) => {
    const check = ev.target.closest("[data-check]"),
      row = ev.target.closest("[data-item]"),
      manualRow = row && !ev.target.closest("button,input,textarea,a") && row.querySelector("[data-check]");
    if (check || manualRow) {
      const sess = S.sessions[ui.sel],
        key = (check || manualRow).dataset.check;
      if (!sess) return;
      const [bi, ni] = key.split(".").map(Number),
        done = itemDone(sess, bi, ni);
      if (sess.blocks[bi].rounds) {
        sess.roundChecks = sess.roundChecks || {};
        sess.roundChecks[ni + 1] = !done;
      } else {
        sess.checked = sess.checked || {};
        sess.checked[key] = !done;
        if (done && sess.timedLaps) sess.timedLaps[key] = 0;
        if (done && sess.lapsDone) sess.lapsDone[key] = [];
      }
      store.save();
      markRounds(false);
      updateCompletionUI();
      return;
    }
    const rd = ev.target.closest("[data-rd]");
    if (
      rd &&
      !ev.target.closest("input,button") &&
      ui.timer &&
      !ui.timer.running &&
      ui.timer.phase !== "work" &&
      ui.timer.phase !== "prep"
    ) {
      ui.timer.round = +rd.dataset.rd;
      ui.timer.phase = "ready";
      ui.timer.left = ui.timer.work;
      updTimer();
      markRounds(false);
      return;
    }
    if (ev.target.id === "sheet") return closeSheet();
    // feedback is a plain link to the form; offline it would only show an error page
    if (ev.target.closest("[data-fb]") && navigator.onLine === false) {
      ev.preventDefault();
      return toast(t("fb").offline);
    }
    const b = ev.target.closest("button");
    // 7k relax: a tap on the dark screen (not on a button) gives a little light for a few seconds
    if (!b && ui.relax && ui.relax.run && ev.target.closest("#relax")) {
      ui.relax.bright = true;
      document.getElementById("relax").classList.add("bright");
      clearTimeout(ui.relax.bt);
      ui.relax.bt = setTimeout(() => {
        if (!ui.relax) return;
        ui.relax.bright = false;
        document.getElementById("relax")?.classList.remove("bright");
      }, 4000);
      return;
    }
    if (!b || b.disabled) return;
    const ds = b.dataset;
    if (ds.rx) return relaxAction(ds.rx, ds);
    if (ds.arc) return arcAction(ds.arc, ds);
    if (ds.arcchk) return arcToggle(ds.arcchk, ds.ad);
    if (ds.arcpick && ui.arc) {
      const p = ui.arc.pick;
      ui.arc.pick = p.includes(ds.arcpick) ? p.filter((x) => x !== ds.arcpick) : p.concat([ds.arcpick]);
      return renderArc();
    }
    if (ds.workout) return workoutAction(ds.workout);
    if (ds.player) return playerAction(ds.player, ds);
    if (ds.exerciseTimer) return exerciseTimerAction(ds.exerciseTimer, ds);
    if (ds.doseChoice) {
      if (!["hold","change"].includes(ds.doseChoice)) return;
      if (ds.doseSheet && ui.sheet) { readSheet(); ui.sheet.doseChoice = ds.doseChoice; renderSheet(); }
      else { const d = readFinishDraft(); d.doseChoice = ds.doseChoice; document.getElementById("doseAdvice").innerHTML = effortControlHtml(S.sessions[ui.sel],d); }
      return;
    }
    if (ds.effort) {
      const draft = finishDraft();
      if (effortFace(draft.rpe) !== effortFace(+ds.effort)) draft.doseChoice = "hold";
      draft.rpe = +ds.effort;
      const hidden = document.getElementById("fRpe");
      if (hidden) hidden.value = String(draft.rpe);
      document
        .querySelectorAll("[data-effort]")
        .forEach((el) =>
          el.setAttribute(
            "aria-pressed",
            String(el.dataset.face ? +el.dataset.effort === faceOf(draft.rpe) : +el.dataset.effort === draft.rpe),
          ),
        );
      const advice = document.getElementById("doseAdvice");
      if (advice) advice.innerHTML = effortControlHtml(S.sessions[ui.sel],draft);
      return;
    }
    if (ds.progressInfoClose) {
      S.profile.progressInfoSeen = true;
      if (draft) draft.progressInfoSeen = true;
      store.save();
      b.closest("[data-progress-info]")?.remove();
      return;
    }
    // ----- bottom sheet
    if (ds.sx) return sheetAction(ds.sx);
    // exercise ids are text ids since 3-D ("warm.easy_jog"); a number conversion broke the info sheet
    if (ds.exinfo) return openSheet({ kind: "ex", id: ds.exinfo });
    // ----- focus blocks
    if (ds.blk) return blockAction(ds.blk);
    if (ds.inst) return installAction(ds.inst);
    if (ds.newsOk) {
      S.profile.newsSeen = NEWS_V;
      store.save();
      return closeSheet();
    }
    if (ds.news) return showNews();
    if (ds.legal) {
      const G = t("legal");
      return openSheet({
        kind: "show",
        title: G.row,
        html: `<div class="legal"><h4>${G.h1}</h4>${G.p1.map((x) => `<p>${x}</p>`).join("")}<h4>${G.h2}</h4>${G.p2.map((x) => `<p>${x}</p>`).join("")}</div>`,
      });
    }
    if (ds.lock) return toast(t(ds.lock === "age" ? "discAgeT" : ds.lock === "level" ? "levelLock" : "discLockT"));
    if (ds.resetAll)
      return openSheet({
        kind: "confirm",
        title: t("resetLbl"),
        lines: [t("resetAsk")],
        run: resetAll,
      });
    if (ds.mood || ds.low || ds.work || ds.form) return lifeAction(ds);
    if (ds.guide || ds.wstep != null || ds.packOpen || ds.pack || ds.packAdd || ds.packReset)
      return guideAction(ds);
    if (ds.fast) {
      const hj = hijri(today());
      if (!hj) return;
      const on = ds.fast === "yes" || ds.fast === "on";
      S.profile.fast = { y: hj.y, on };
      if (draft) draft.fast = S.profile.fast;
      const td = iso(today());
      dropOpenSessions(td);
      ui.setup = null;
      store.save();
      render();
      return toast(on ? t("fast").on : t("fast").off);
    }
    if (ds.mix) {
      S.profile.mixMusic = ds.mix === "1";
      applyAudioMode();
      store.save();
      return render();
    }
    if (ds.season) {
      S.profile.seasonOff = ds.season === "off";
      if (draft) draft.seasonOff = S.profile.seasonOff;
      store.save();
      return render();
    }
    if (ds.bk && ui.sheet && ui.sheet.kind === "blk") {
      ui.sheet.k = ds.bk;
      return renderSheet();
    }
    if (ds.bs && ui.sheet && ui.sheet.kind === "blk") {
      ui.sheet.start = ds.bs;
      return renderSheet();
    }
    // ----- badges, free timer, my combos
    if (ds.bdg) return openSheet({ kind: "badge", id: ds.bdg });
    if (ds.act2 === "allbdg") return openSheet({ kind: "badges" });
    if (ds.start != null) return starterGo(+ds.start);
    if (ds.act2 === "starterall") {
      ui.starterAll = !ui.starterAll;
      return render();
    }
    if (ds.act2 === "starterhide") {
      S.profile.starterHide = true;
      if (draft) draft.starterHide = true;
      store.save();
      toast(t("starter").hidden);
      return render();
    }
    if (ds.ftx) return ds.ftx === "open" ? openFt() : ftAction(ds.ftx);
    if (ds.fts) {
      const [k, d] = ds.fts.split(":");
      return ftStepper(k, +d);
    }
    if (ds.ftp) {
      const p = ftPresets().find((x) => x.id === ds.ftp);
      Object.assign(ui.ft.cfg, { r: p.r, w: p.w, b: p.b });
      return renderFt();
    }
    if (ds.ftt) {
      ui.ft.cfg[ds.ftt] = !ui.ft.cfg[ds.ftt];
      // coach calls are spoken: switching them on also switches the voice on
      if (ds.ftt === "coach" && ui.ft.cfg.coach && !voiceOn() && canSpeak()) {
        S.profile.voice = true;
        if (draft) draft.voice = true;
        store.save();
        say(t("voiceTest"));
      }
      return renderFt();
    }
    if (ds.ctech || ds.cact || ds.cedit || ds.con) {
      const nm = document.getElementById("cName");
      if (ui.cb && nm) ui.cb.name = nm.value.trim().slice(0, 40);
      const list = S.profile.myc || [];
      if (ds.con) {
        const m = list.find((x) => x.id === ds.con);
        if (m) m.on = !m.on;
      } else if (ds.cedit) {
        const m = list.find((x) => x.id === ds.cedit);
        ui.cb = { id: m.id, c: m.c.slice(), name: m.name || "" };
        return mycSheet();
      } else if (ds.ctech) {
        if (ui.cb.c.length < 8) ui.cb.c.push(ds.ctech);
        return mycSheet();
      } else if (ds.cact === "new") {
        ui.cb = { id: null, c: [], name: "" };
        return mycSheet();
      } else if (ds.cact === "undo" || ds.cact === "clear") {
        ds.cact === "undo" ? ui.cb.c.pop() : (ui.cb.c = []);
        return mycSheet();
      } else if (ds.cact === "save") {
        const cb = ui.cb,
          m = {
            id: cb.id || "m" + Date.now().toString(36),
            c: cb.c.slice(),
            name: cb.name,
            on: true,
          };
        S.profile.myc = cb.id ? list.map((x) => (x.id === cb.id ? { ...x, ...m, on: x.on } : x)) : [...list, m];
        closeSheet();
        toast(t("myc").saved);
      } else if (ds.cact === "del") {
        S.profile.myc = list.filter((x) => x.id !== ui.cb.id);
        closeSheet();
      }
      S.profile.myc = S.profile.myc || list;
      if (draft) draft.myc = JSON.parse(JSON.stringify(S.profile.myc));
      store.save();
      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
      return;
    }
    if (ds.hardinfo) {
      const [id, hh] = ds.hardinfo.split("|");
      return openSheet({ kind: "hard", id, h: hh === "h" });
    }
    if (ds.sdinfo) return openSheet({ kind: "sd", id: ds.sdinfo });
    if (ds.th) return openSheet({ kind: "th", id: ds.th, mode: "cards" });
    if (ds.thq || ds.tha) {
      const o = ui.sheet;
      if (ds.thq === "start" || ds.thq === "again") thStartQuiz(o);
      else if (ds.thq === "next") {
        o.qi++;
        o.pick = null;
        // 80 % or more marks the theory item as solid
        if (o.qi >= o.qs.length && o.score >= Math.ceil(o.qs.length * 0.8) && gpState(o.id) < 2) {
          S.profile.gp = { ...(S.profile.gp || {}), [o.id]: 2 };
          if (draft) draft.gp = S.profile.gp;
          store.save();
          if (ui.tab === "test") {
            const y = window.scrollY;
            render();
            window.scrollTo(0, y);
          }
        }
      } else if (ds.tha != null && o.pick == null) {
        o.pick = +ds.tha;
        if (o.pick === o.qs[o.qi][2]) o.score++;
      }
      renderSheet();
      const sh = document.querySelector(".sheet");
      if (sh) sh.scrollTop = 0;
      return;
    }
    if (ds.simple != null) {
      S.profile.simple = ds.simple === "1";
      if (draft) draft.simple = S.profile.simple;
      // open sessions are planned again for the new view (equipment the simple view doesn't ask for drops out)
      dropOpenSessions(iso(today()));
      ui.setup = null;
      store.save();
      renderTabs();
      return render();
    }
    if (ds.scface) {
      const inp = document.getElementById("scRpe");
      if (inp) inp.value = ds.scface;
      if (ui.sheet) { if (effortFace(ui.sheet.rpe) !== effortFace(+ds.scface)) ui.sheet.doseChoice = "hold"; ui.sheet.rpe = +ds.scface; }
      document.querySelectorAll("[data-scface]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.scface === ds.scface)));
      if (ui.sheet?.kind === "edit") renderSheet();
      return;
    }
    if (ds.vpick != null) {
      const lg = S.profile.lang === "de" ? "de" : "en",
        v = ds.vpick && voiceList().find((x) => voiceKey(x) === ds.vpick);
      S.profile.voicePick = Object.assign({}, S.profile.voicePick, { [lg]: v ? { id: ds.vpick, name: v.name } : null });
      if (draft) draft.voicePick = S.profile.voicePick;
      store.save();
      if (v) voiceProbe(ds.vpick);
      return render();
    }
    if (ds.vprobe) return voiceProbe(ds.vprobe);
    if (ds.vtest) {
      if (!voiceOn()) {
        S.profile.voice = true;
        if (draft) draft.voice = true;
        store.save();
      }
      say(t("voiceTest"));
      return;
    }
    if (ds.voice) {
      S.profile.voice = !voiceOn();
      if (draft) draft.voice = S.profile.voice;
      store.save();
      if (S.profile.voice) say(t("voiceTest"));
      else if (canSpeak()) speechSynthesis.cancel();
      if (ui.ft) return renderFt();
      if (ui.focus) renderFocus();
      else {
        const y = window.scrollY;
        render();
        window.scrollTo(0, y);
      }
      return;
    }
    if (ds.sck || ds.rp || ds.rpl || ds.pw || ds.ssp || ds.edt) {
      readSheet();
      const o = ui.sheet;
      if (ds.ssp) o.sport = ds.ssp;
      if (ds.edt) o.type = ds.edt;
      if (ds.sck) o.ck = ds.sck;
      if (ds.rp) o.r.passed = ds.rp;
      if (ds.rpl) o.r.place = ds.rpl;
      if (ds.pw) o.why = ds.pw;
      renderSheet();
      return;
    }
    if (ds.mto) return pickMoveTarget(ds.mto);
    if (ds.copy) {
      const el = document.getElementById(ds.copy);
      if (!el) return;
      try {
        navigator.clipboard.writeText(el.value).then(
          () => toast(t("copied")),
          () => el.select(),
        );
      } catch (e) {
        el.select();
      }
      return;
    }
    // ----- club training
    if (ds.clublog) {
      const d = ds.clublog;
      openSheet({
        kind: "club",
        ds: d,
        sport: mainSport(),
        ck: "X",
        min: (clubOn(d) || {}).min || (S.profile.club && S.profile.club.minutes) || 90,
        rpe: 7,
        note: "",
      });
      return;
    }
    if (ds.clubmiss || ds.ccancel) {
      S.cov[ds.clubmiss || ds.ccancel] = {
        off: ds.clubmiss ? "miss" : "cancel",
      };
      store.save();
      render();
      return;
    }
    if (ds.cundo) {
      undoClub(ds.cundo);
      store.save();
      render();
      return;
    }
    if (ds.cmove) return openSheet({ kind: "move", ds: ds.cmove, club: true });
    // ----- own sessions: move, add, catch up, skip, undo
    if (ds.move) return openSheet({ kind: "move", ds: ds.move });
    if (ds.add) {
      const d = ds.add,
        go = () => {
          ui.okClub = { ...(ui.okClub || {}), [d]: 1 };
          S.ov[d] = { t: suggestExtra(d) };
          ui.setup = null;
          store.save();
          render();
        };
      if (clubOn(d))
        openSheet({
          kind: "confirm",
          title: t("addTraining"),
          lines: [t("clubSameDay")],
          run: go,
        });
      else go();
      return;
    }
    if (ds.unplan) {
      delete S.ov[ds.unplan];
      if (!doneOn(ds.unplan)) delete S.sessions[ds.unplan];
      ui.setup = null;
      store.save();
      render();
      return;
    }
    if (ds.catch) {
      const to = catchUpDate();
      doMove(ds.catch, to);
      toast(t("movedTo")(dayLbl(to)));
      return;
    }
    if (ds.skip) {
      S.ov[ds.skip] = { off: "skip" };
      store.save();
      render();
      return;
    }
    if (ds.undo) {
      undoOwn(ds.undo);
      store.save();
      render();
      return;
    }
    if (ds.later) {
      ui.later = { ...(ui.later || {}), [ds.later]: 1 };
      render();
      return;
    }
    if (ds.res) {
      const c = (S.profile.comps || []).find((x) => x.id === ds.res);
      if (c) openSheet({ kind: "result", id: c.id, r: { ...(c.result || {}) } });
      return;
    }
    if (ds.dur) {
      ui.setup.min = +ds.dur;
      render();
      return;
    }
    // ----- breaks and KO
    if (ds.pnew)
      return openSheet({
        kind: "pause",
        why: ds.pnew,
        from: iso(today()),
        to: "",
      });
    if (ds.pend) {
      endPause(ds.pend);
      store.save();
      render();
      return;
    }
    if (ds.pdel) {
      S.pauses = S.pauses.filter((x) => x.id !== ds.pdel);
      store.save();
      render();
      return;
    }
    if (ds.konew) return openSheet({ kind: "ko", date: iso(today()) });
    if (ds.kodel) {
      S.ko = "";
      store.save();
      render();
      return;
    }
    // ----- profile: club days, tournament kind
    if (ds.cday) {
      const a = draft.club.days,
        i = +ds.cday,
        j = a.indexOf(i);
      j >= 0 ? a.splice(j, 1) : a.push(i);
      a.sort((x, y) => x - y);
      applyPlan();
      render();
      return;
    }
    if (ds.cmin) {
      draft.club.minutes = +ds.cmin;
      applyPlan();
      render();
      return;
    }
    if (ds.ckind) {
      ui.ckind = ds.ckind;
      render();
      return;
    }
    // 7i profile: whose sport details are shown (not the main sport), open/close the belt or grade choice, go to the belt exam
    if (ds.psport) {
      ui.psport = ds.psport;
      ui.pedit = null;
      render();
      return;
    }
    if (ds.pedit) {
      ui.pedit = ui.pedit === ds.pedit ? null : ds.pedit;
      render();
      return;
    }
    if (ds.gotoexam) {
      ui.tab = "test";
      ui.testView = "exam";
      draft = null;
      render(true);
      window.scrollTo(0, 0);
      return;
    }
    // ----- backup and summary
    if (ds.io === "exp") return exportData();
    if (ds.io === "imp") return document.getElementById("impFile").click();
    if (ds.io === "img") return shareImage();
    if (ds.io === "txt") return copyText(summaryText(), t("sumTitle"));
    // ----- belt grading
    if (ds.tview) {
      ui.testView = ds.tview;
      return render();
    }
    if (ds.belt) {
      S.profile.belt = +ds.belt;
      if (draft) draft.belt = S.profile.belt;
      store.save();
      return render();
    }
    if (ds.gp) {
      const gp = { ...(S.profile.gp || {}) };
      gp[ds.gp] = (gpState(ds.gp) + 1) % 3;
      S.profile.gp = gp;
      if (draft) draft.gp = gp;
      store.save();
      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
      return;
    }
    if (ds.psec != null) {
      ui.profSec = ds.psec || null;
      render(true);
      window.scrollTo(0, 0);
      return;
    }
    if (ds.tab) {
      if (ui.testOpen && ds.tab !== "test") ui.testOpen = false;
      // the profile tab always opens on its overview
      if (ds.tab === "profile") {
        ui.profSec = null;
        ui.psport = null;
        ui.pedit = null;
      }
      if (ds.tab === "week") ui.wk = 0; // Today always opens on the current week
      ui.tab = ds.tab;
      if (ds.tab !== "profile") draft = null;
      render(true);
      window.scrollTo(0, 0);
      return;
    }
    if (ds.lang) {
      if (ui.testOpen) readTestInputs();
      S.profile.lang = ds.lang;
      if (draft) draft.lang = ds.lang;
      store.save();
      render();
      return;
    }
    if (ds.wk != null) {
      const r = wkRange();
      ui.wk = ds.wk === "0" ? 0 : Math.max(r.min, Math.min(r.max, (ui.wk || 0) + +ds.wk));
      ui.wkFor = ui.sel;
      return render();
    }
    if (ds.open) {
      ui.sel = ds.open;
      ui.setup = null;
      ui.tab = "session";
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (ds.sel) {
      ui.sel = ds.sel;
      ui.setup = null;
      render();
      return;
    }
    if (ds.loc) {
      ui.setup.loc = ds.loc;
      render();
      return;
    }
    if (ds.eq) {
      const e = ui.setup.eq,
        i = e.indexOf(ds.eq);
      i >= 0 ? e.splice(i, 1) : e.push(ds.eq);
      render();
      return;
    }
    /* partner and heavy bag are mutually exclusive: one, the other, or neither */
    if (ds.pb) {
      ui.setup.eq = ui.setup.eq.filter((x) => x !== "partner" && x !== "bag" && (ds.pb === "partner" || x !== "pads"));
      if (ds.pb !== "none") ui.setup.eq.push(ds.pb);
      render();
      return;
    }
    if (ds.usport) {
      ui.setup.sport = ds.usport;
      render();
      return;
    }
    // style (taekwondo) or discipline (kickboxing) of this unit only
    if (ds.ustyle) {
      ui.setup.tstyle = ds.ustyle;
      render();
      return;
    }
    if (ds.udisc) {
      ui.setup.disc = ds.udisc;
      render();
      return;
    }
    if (ds.csport) {
      ui.csport = ds.csport;
      render();
      return;
    }
    if (ds.edit) {
      const e = S.log.find((x) => x.id === ds.edit);
      if (!e) return;
      openSheet({
        kind: "edit",
        id: e.id,
        ds: e.date,
        src: e.src,
        run: e.run,
        sport: entrySport(e),
        type: e.type,
        ck: e.ck,
        min: e.minutes,
        rpe: e.rpe,
        effortDose: e.effortDose,
        doseChoice: e.effortControl?.choice || "hold",
        kmRaw: e.km != null ? String(e.km).replace(".", S.profile.lang === "de" ? "," : ".") : "",
        note: e.note || "",
      });
      return;
    }
    if (ds.run) {
      ui.setup.run = ds.run === "free" ? "free" : ds.run === "run";
      render();
      return;
    }
    if (ds.stype) {
      ui.setup.type = ds.stype;
      ui.setup.min = sessMin(ds.stype);
      if (ui.setup.loc === "studio" && ds.stype !== "S" && ds.stype !== "K") ui.setup.loc = "gym";
      render();
      return;
    }
    if (b.id === "buildSess") {
      const d = ui.sel;
      if (freeRunSel(ui.setup, ui.setup.type))
        return openSheet({ kind: "freerun", ds: d, sport: ui.setup.sport, min: null, rpe: null, kmRaw: "", note: "" });
      const go = () => rebuildFromSetup(d);
      // an own session on a club day needs a confirmation (once per day)
      if (clubOn(d) && !S.sessions[d] && !(ui.okClub || {})[d])
        return openSheet({
          kind: "confirm",
          title: t("create"),
          lines: [t("clubSameDay")],
          run: () => {
            ui.okClub = { ...(ui.okClub || {}), [d]: 1 };
            go();
          },
        });
      return go();
    }
    if (b.id === "tgo") {
      const wasReady = ui.timer && ui.timer.ds === ui.sel && ui.timer.phase === "ready";
      timerGo();
      updTimer();
      markRounds(wasReady);
      return;
    }
    if (ds.tour) {
      if (ds.tour === "next") ui.tour++;
      else if (ds.tour === "back") ui.tour--;
      else return endTour();
      return showTour();
    }
    if (ds.restartTour) return startTour();
    if (ds.onb === "ack") {
      // a second tap while the plan is being set up does nothing (7b B5)
      if (!ui.onb || (!ui.onb.ack && !ui.onb.ackOnly)) return;
      S.profile.ackSafe = iso(today());
      const a = ui.onb.ack;
      if (ui.onb.ackOnly) {
        ui.onb = null;
        store.save();
        renderOnb();
        if (needNews()) return showNews();
        if (!S.profile.toured) startTour();
        return;
      }
      delete ui.onb.ack;
      return finishOnb(a.skip, a.test);
    }
    if (ds.onb) {
      readOnb();
      if (ds.onb === "next") {
        ui.onb.step++;
        const o = ui.onb;
        if (o.step === 2 && !o.ownTouched && o.clubDays.length) {
          // suggest free days with as few training neighbours as possible (2 next to a busy club week, else 3)
          const busy = new Set(o.clubDays),
            want = o.clubDays.length >= 2 ? 2 : 3,
            pick = [];
          for (let k = 0; k < want; k++) {
            let best = -1,
              bs = 9;
            for (let d = 0; d < 7; d++) {
              if (busy.has(d)) continue;
              const sc = busy.has((d + 6) % 7) + busy.has((d + 1) % 7);
              if (sc < bs) ((bs = sc), (best = d));
            }
            if (best < 0) break;
            pick.push(best);
            busy.add(best);
          }
          o.days = pick.sort((x, y) => x - y);
        }
      } else if (ds.onb === "back") ui.onb.step--;
      else return finishOnb(ds.onb === "skip", ds.onb === "test");
      renderOnb();
      return;
    }
    if (ds.otstyle) {
      if (ui.onb.tstyle !== ds.otstyle) ui.onb.techLevel = 0;
      ui.onb.tstyle = ds.otstyle;
      if (ui.onb.tgrade && !TKDT.isGrade(ds.otstyle, ui.onb.tgrade)) ui.onb.tgrade = "";
      renderOnb();
      return;
    }
    if (ds.otgrade != null) {
      ui.onb.tgrade = ds.otgrade;
      renderOnb();
      return;
    }
    if (ds.osport) {
      if (ui.onb.sport !== ds.osport) ui.onb.techLevel = 0;
      ui.onb.sport = ds.osport;
      renderOnb();
      return;
    }
    if (ds.od) {
      ui.onb.disc = ds.od;
      renderOnb();
      return;
    }
    if (ds.ocday) {
      const a = ui.onb.clubDays,
        i = +ds.ocday,
        j = a.indexOf(i);
      j >= 0 ? a.splice(j, 1) : a.push(i);
      a.sort((x, y) => x - y);
      renderOnb();
      return;
    }
    if (ds.osex) {
      readOnb();
      ui.onb.sex = ui.onb.sex === ds.osex ? "" : ds.osex;
      renderOnb();
      return;
    }
    if (ds.osimple != null && ui.onb) {
      ui.onb.simple = ds.osimple === "1";
      renderOnb();
      return;
    }
    if (ds.ocmin) {
      ui.onb.clubMin = +ds.ocmin;
      renderOnb();
      return;
    }
    if (ds.oday) {
      ui.onb.ownTouched = true;
      const a = ui.onb.days,
        i = +ds.oday,
        j = a.indexOf(i);
      j >= 0 ? a.splice(j, 1) : a.push(i);
      renderOnb();
      return;
    }
    if (ds.omin) {
      ui.onb.minutes = +ds.omin;
      renderOnb();
      return;
    }
    if (ds.fx) {
      if (ds.fx === "open") ui.focus = true;
      else if (ds.fx === "close") ui.focus = false;
      else if (ds.fx === "go") timerGo();
      else if (ds.fx === "next") timerJump(1);
      else if (ds.fx === "prev") timerJump(-1);
      else if (ds.fx === "finish") {
        if (ui.workout?.player) return playerGo(ui.workout.step + 1, { auto: true });
        if (ui.workout) return moveWorkout(1);
        ui.focus = false;
        render();
        const f = document.getElementById("fMin");
        if (f && f.scrollIntoView) f.scrollIntoView({ block: "center" });
        return;
      }
      renderFocus();
      updTimer();
      markRounds(false);
      return;
    }
    if (ds.go) {
      ui.sel = ds.go;
      ui.setup = null;
      ui.tab = "session";
      ui.focus = false;
      render(true);
      window.scrollTo(0, 0);
      return;
    }
    if (ds.addset) {
      const sess = S.sessions[ui.sel];
      const rows = sess.perf[ds.addset];
      const lastR = rows[rows.length - 1] || {};
      if (rows.length < 10) rows.push({ r: null, kg: lastR.kg ?? null });
      store.save();
      render();
      return;
    }
    if (ds.rmset) {
      const sess = S.sessions[ui.sel];
      const rows = sess.perf[ds.rmset];
      if (rows.length > 1) rows.splice(+ds.i, 1);
      store.save();
      render();
      return;
    }
    if (b.id === "treset") {
      if (S.sessions[ui.sel]) {
        delete S.sessions[ui.sel].rdone;
        delete S.sessions[ui.sel].roundChecks;
      }
      clearSessionTimer();
      ui.timer = newTimer(ui.sel);
      store.save();
      syncTimers();
      render();
      return;
    }
    if (b.id === "fSave") {
      if (!validateFinish()) return;
      const completion = sessionCompletion(S.sessions[ui.sel]);
      if (completion.open)
        return openSheet({
          kind: "confirm",
          title: trainingText().complete,
          lines: [
            trainingText().open(completion.open),
            trainingText().partial,
            ...(readFinishDraft().minutesTouched ? [] : [flowText().durationEarly(readFinishDraft().minutes)]),
          ],
          run: saveTrainingSession,
        });
      saveTrainingSession();
      return;
    }
    if (ds.del) {
      const replanned = changeLog(() => (S.log = S.log.filter((e) => e.id !== ds.del)));
      store.save();
      render();
      if (replanned) toast(t("replanned"));
      return;
    }
    if (ds.tdel) {
      const oldFitness = fitnessLevel();
      S.tests = S.tests.filter((e) => e.id !== ds.tdel);
      if (fitnessLevel() !== oldFitness) dropOpenSessions(iso(today()));
      loadCache = {};
      store.save();
      render();
      return;
    }
    if (b.id === "wAdd" || b.id === "wQuickAdd") {
      saveWeight(document.getElementById(b.id === "wAdd" ? "wIn" : "wQuick").value);
      return;
    }
    // test
    if (b.id === "tOpen") {
      ui.testOpen = true;
      ui.testDraft = {};
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (b.id === "tCancel") {
      ui.testOpen = false;
      render();
      if (ui.tourAfter) {
        ui.tourAfter = false;
        if (!S.profile.toured) startTour();
      }
      return;
    }
    if (ds.tf) {
      readTestInputs();
      ui.testDraft.flx = +ds.tf;
      render();
      return;
    }
    if (ds.tsport) {
      readTestInputs();
      ui.testDraft.tsport = ds.tsport;
      render();
      return;
    }
    if (ds.tt) {
      readTestInputs();
      ui.testDraft.tec = +ds.tt;
      render();
      return;
    }
    if (b.id === "tSave") {
      readTestInputs();
      const d = ui.testDraft;
      const end = d.endM != null ? d.endM * 60 + (d.endS || 0) : null;
      const raw = {
        str: d.str,
        spd: d.spd,
        end,
        flx: d.flx ?? null,
        tec: d.tec ?? null,
      };
      const tsp = d.tsport || mainSport(),
        techOnly = tsp !== mainSport();
      if (techOnly) Object.assign(raw, { str: null, spd: null, end: null, flx: null });
      if (Object.values(raw).every((v) => v == null)) return;
      const oldFitness = fitnessLevel(), r = scoreTest(raw);
      await loading("loadingTest");
      S.tests.push({
        id: "t" + Date.now().toString(36),
        date: iso(today()),
        method: "rz-1",
        raw,
        ...(raw.tec != null ? { techBy: { [tsp === "taekwondo" ? techKey(tsp, tkdStyle()) : techKey(tsp)]: raw.tec } } : {}),
        ...r,
      });
      ui.testOpen = false;
      if (fitnessLevel() !== oldFitness) dropOpenSessions(iso(today()));
      loadCache = {};
      store.save();
      render();
      window.scrollTo(0, 0);
      toast(t("saved"));
      if (ui.tourAfter) {
        ui.tourAfter = false;
        if (!S.profile.toured) startTour();
      } else blockAfterTest();
      return;
    }
    if (ds.tk) return tkdAction(ds);
    // profile: a technical choice changes no physical score, grade or competition goal.
    if (ds.techlevel != null) {
      const k = ds.techkey, v = +ds.techlevel;
      if (!["kickboxing","boxing","taekwondo:wt","taekwondo:itf"].includes(k) || ![0,1,2].includes(v)) return;
      draft.techLevels = { ...(draft.techLevels || {}), [k]: v };
      if (k === trainingKey(draft.sport, undefined, draft)) draft.level = v;
      applyPlan(); render(); return;
    }
    if (ds.otech != null && ui.onb) {
      if ([0,1,2].includes(+ds.otech)) ui.onb.techLevel = +ds.otech;
      renderOnb(); return;
    }
    if (ds.p) {
      if (ds.p === "sport" && sportChoices(true).includes(ds.v)) {
        draft.techLevels = { ...(draft.techLevels || {}), [trainingKey(draft.sport, undefined, draft)]: draft.level };
        draft.level = draft.techLevels[trainingKey(ds.v, undefined, draft)] || 0;
      }
      draft[ds.p] = ds.p === "level" ? +ds.v : ds.v;
      // full contact and K1 are no longer tied to the level; only the age limit applies (pBirth)
      if (draft.level === 0) draft.focus = "bal";
      applyPlan();
      render();
      return;
    }
    if (ds.day) {
      const a = draft.days,
        i = +ds.day,
        j = a.indexOf(i);
      j >= 0 ? a.splice(j, 1) : a.push(i);
      a.sort((x, y) => x - y);
      applyPlan();
      render();
      return;
    }
    if (ds.lim) {
      const a = draft.limits,
        j = a.indexOf(ds.lim);
      j >= 0 ? a.splice(j, 1) : a.push(ds.lim);
      applyPlan();
      render();
      return;
    }
    if (b.id === "pCompAdd") {
      const v = document.getElementById("pCompNew").value;
      if (!v) return;
      draft.comps = (draft.comps || []).filter((c) => c.date !== v);
      draft.comps.push({
        id: "c" + Date.now().toString(36),
        date: v,
        kind: (ui.csport || mainSport()) === "boxing" ? "comp" : ui.ckind || "comp", // boxing has no belt exams
        sport: ui.csport || mainSport(),
      });
      applyPlan();
      render();
      return;
    }
    if (ds.cdel) {
      draft.comps = draft.comps.filter((c) => c.id !== ds.cdel);
      applyPlan();
      render();
      return;
    }
  });
  /* Profile changes take effect at once: the plan settings are copied over and planned sessions from today on are rebuilt */
  const PLAN_KEYS = ["techLevels", "fitnessBase", "level", "sport", "disc", "focus", "birthYear", "sex", "days", "minutes", "club", "comps", "limits"];
  /* Open sessions from `from` on are dropped and rebuilt with the new settings when they are next shown.
     A session that was already started (player progress, ticks or logged sets) is kept with its entries. */
  function dropOpenSessions(from) {
    const started = (x) =>
      !!(x && (x.flow || (x.perf && Object.keys(x.perf).length) || (x.checked && Object.keys(x.checked).length)));
    for (const k of Object.keys(S.sessions))
      if (k >= from && !doneOn(k) && !started(S.sessions[k])) delete S.sessions[k];
  }
  function applyPlan() {
    if (!draft) return;
    if (!draft.days.length) return toast(t("needDay"));
    PLAN_KEYS.forEach((k) => (S.profile[k] = JSON.parse(JSON.stringify(draft[k] ?? null))));
    S.profile.example = false;
    if (!S.profile.planStart) S.profile.planStart = iso(today());
    const td = iso(today());
    dropOpenSessions(td);
    ui.setup = null;
    loadCache = {};
    store.save();
    // one short confirmation, even after several quick changes
    clearTimeout(applyPlan.t);
    applyPlan.t = setTimeout(() => toast(t("planUpd")), 700);
  }
  /* Start over: deletes everything on this device (and in Claude's storage) and opens the first-start setup again */
  async function resetAll() {
    try {
      localStorage.removeItem(LS);
    } catch (e) {}
    resumeReady = false;
    resumeClear();
    if (store.mode === "cloud") {
      clearTimeout(store.timer);
      try {
        await Promise.all([store.doc("app").set({}), store.doc("log").set({})]);
      } catch (e) {}
    }
    location.reload();
  }
  function collectPerf(sess) {
    if (!sess || !sess.perf) return undefined;
    const out = [];
    for (const [key, rows] of Object.entries(sess.perf)) {
      const [bi, n] = key.split(".").map(Number),
        it = sess.blocks[bi] && sess.blocks[bi].items[n];
      if (!it) continue;
      const sets = rows.filter((r) => r.r != null || r.kg != null);
      if (sets.length)
        out.push({
          id: it.id,
          sets,
          ...(it.target ? { target: it.target } : {}),
          ...(sess.exerciseEffort?.[key] ? { effort: sess.exerciseEffort[key] } : {}),
        });
    }
    return out.length ? out : undefined;
  }
  const perfVolume = (perf) =>
    (perf || []).reduce(
      (a, p) => a + p.sets.reduce((b, x) => b + (x.r && x.kg && !TIMED.has(p.id) ? x.r * x.kg : 0), 0),
      0,
    );
  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.classList && el.classList.contains("si")) {
      const sess = S.sessions[ui.sel];
      if (!sess || !sess.perf) return;
      const rows = sess.perf[el.dataset.k];
      if (!rows) return;
      const v = parseFloat(el.value.replace(",", "."));
      rows[+el.dataset.i][el.dataset.f] = isNaN(v) || v < 0 ? null : Math.round(v * 10) / 10;
      if (el.dataset.f === "rL" || el.dataset.f === "rR") {
        legSync(rows[+el.dataset.i]);
        el.classList.toggle("ok", rows[+el.dataset.i][el.dataset.f] != null);
        document
          .querySelector(`[data-sl="${el.dataset.k}.${el.dataset.i}"]`)
          ?.classList.toggle("ok", rows[+el.dataset.i].r != null);
      }
      if (el.dataset.f === "r") {
        const done = rows[+el.dataset.i].r != null,
          sl = document.querySelector(`[data-sl="${el.dataset.k}.${el.dataset.i}"]`);
        if (sl) sl.classList.toggle("ok", done);
        el.classList.toggle("ok", done);
      }
      store.save();
      updateCompletionUI();
      return;
    }
    if (["fMin", "fNote"].includes(el.id)) {
      readFinishDraft();
    }
    if (el.id === "pMin") {
      draft.minutes = +el.value;
      document.getElementById("pMinV").textContent = el.value;
    }
  });
  document.addEventListener(
    "toggle",
    (ev) => {
      const ds = ev.target.dataset?.sessionSettings;
      if (ds) {
        ui.sessionSettings = ui.sessionSettings || {};
        ui.sessionSettings[ds] = ev.target.open;
      }
    },
    true,
  );
  document.addEventListener("change", (ev) => {
    if (ev.target.dataset && ev.target.dataset.rxchk && ui.relax) {
      ui.relax[ev.target.dataset.rxchk] = ev.target.checked;
      return;
    }
    if (ev.target.id === "impFile" && ev.target.files && ev.target.files[0]) {
      importFile(ev.target.files[0]);
      ev.target.value = "";
      return;
    }
    if (ev.target.dataset && ev.target.dataset.wc && draft) {
      const c = draft.comps.find((x) => x.id === ev.target.dataset.wc),
        v = parseFloat(ev.target.value.replace(",", "."));
      if (c) c.wc = v >= 20 && v <= 150 ? v : null;
      applyPlan();
      return;
    }
    if (ev.target.id === "pBirth") {
      const y = parseInt(ev.target.value);
      draft.birthYear = y >= 1950 && y <= today().getFullYear() - 8 ? y : "";
      // WAKO ring disciplines only from 15
      if (draft.birthYear && ageAt(today(), draft) < 15 && (draft.disc === "fc" || draft.disc === "k1"))
        draft.disc = "kl";
      applyPlan();
      render();
    }
    // the minutes slider applies when it is let go, not on every step while dragging
    if (ev.target.id === "pMin" && draft) {
      applyPlan();
      render();
    }
  });

