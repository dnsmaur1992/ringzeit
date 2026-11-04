  /* ============ Render ============ */
  /* what the plan is called in headers: the discipline, or the sport when it has none (boxing) */
  const discLabel = (p = S.profile) =>
    p.sport === "boxing"
      ? t("sportNames").boxing
      : p.sport === "taekwondo"
        ? `${t("sportNames").taekwondo} ${t("tkd").styles[(p.tkd && p.tkd.style) || "wt"]}`
        : t("disc")[p.disc];
  function eyebrow() {
    const p = S.profile,
      label = discLabel(p);
    const dl = weekLoad().deload;
    return `<div class="eyebrow"><i></i>${esc(label)} · ${t("phases")[phaseInfo().phase]}${dl ? ` · <em>${t("deload")}</em>` : ""}</div>`;
  }
  function header(title) {
    const lg = S.profile.lang;
    return `<div class="top"><div>${eyebrow()}<h1>${esc(title)}</h1></div>
 <div class="lang" role="group" aria-label="${t("lang")}"><button type="button" data-lang="de" aria-pressed="${lg === "de"}">DE</button><button type="button" data-lang="en" aria-pressed="${lg === "en"}">EN</button></div></div>`;
  }
  function ruleTags() {
    const p = S.profile;
    if (p.sport === "boxing" || p.sport === "taekwondo") return ""; // boxing: rules are linked in the session, not shown as kickboxing tags
    const r = t("rules")[p.disc];
    return `<div class="tags"><span class="tg ok">${r[0]}</span>${r[1].map((x) => `<span class="tg no">${x}</span>`).join("")}${r[2].map((x) => `<span class="tg">${x}</span>`).join("")}</div>`;
  }
  /* simple view: a picture per session type instead of the short English codes (TEC, STR …) */
  const TYPE_ICO = { T: "🥊", C: "⚡", P: "🤼", S: "🏋️", K: "🏃", M: "🧘", V: "👥" };
  const codeOf = (ty) =>
    simpleView() ? TYPE_ICO[ty] || "" : ty === "V" ? (S.profile.lang === "de" ? "VER" : "CLB") : CODE[ty];
  const dayLbl = (ds) => `${t("weekday")[wd(ds)]}, ${parse(ds).getDate()}.${parse(ds).getMonth() + 1}.`;
  /* Week at a glance: progress ring (own + club sessions), week streak, next tournament */
  function pulseHtml() {
    const wp = weekPlan(monday(today())),
      frac = wp.planned ? Math.min(1, wp.done / wp.planned) : 0,
      C = 2 * Math.PI * 30,
      streak = weekStreak(),
      nc = nextComp();
    return `<div class="panel pulse"><div class="ring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke="var(--line)" stroke-width="5"/><circle class="arc" cx="36" cy="36" r="30" fill="none" stroke="${frac >= 1 ? "var(--done)" : "var(--ice)"}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/></svg><b>${wp.done}/${wp.planned}</b></div>
 <div><div class="pv ${streak >= 2 ? "hot" : ""}">${streak}</div><div class="pk">${t("statStreak")}</div></div>
 <div><div class="pv">${nc ? daysBetween(today(), parse(nc.date)) : "–"}</div><div class="pk">${t("toComp")}</div></div></div>`;
  }
  /* The next own session that is still open (today included) */
  function nextTrainingDate() {
    for (let i = 0; i < 14; i++) {
      const ds = iso(addDays(today(), i));
      if (planOn(ds) && !doneOn(ds)) return ds;
    }
    return iso(today());
  }
  function weekStrip(selDs, attr) {
    const mon = monday(today()),
      td = iso(today());
    return (
      `<div class="week">` +
      [0, 1, 2, 3, 4, 5, 6]
        .map((i) => {
          const d = addDays(mon, i),
            ds = iso(d),
            ty = typeOn(ds),
            cl = clubOn(ds) || clubDone(ds),
            done = doneOn(ds),
            tc = ty || (cl ? "V" : null);
          const cls = [
            "day",
            tc ? "train" : "",
            done ? "done" : "",
            ds === td ? "today" : "",
            ds === selDs ? "sel" : "",
          ].join(" ");
          const k = done ? "✓" : ty ? codeOf(ty) : cl ? codeOf("V") : pausedOn(ds) ? "–" : "·";
          return `<button type="button" class="${cls}" ${attr}="${ds}"${tc ? ` style="--tc:var(--c-${tc})"` : ""} aria-label="${t("weekday")[i]}${ty ? " · " + t("types")[ty] : ""}${cl ? " · " + t("club") : ""}"><span class="d">${t("dayNames")[i]}</span><span class="n">${d.getDate()}</span><span class="k${simpleView() && (ty || cl) && !done ? " ico" : ""}">${k}</span>${ty && cl ? `<i class="cl"></i>` : ""}</button>`;
        })
        .join("") +
      `</div>`
    );
  }

  const APP_VER = "dev";
  const ICO_T =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.6M9.5 2.5h5M19 6l1.5-1.5"/></svg>';
  const PLAY =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>';
  /* The first thing on the start page: today's session, club training or the next session, with one big button */
  function todayCard(nd, nty, pose) {
    const td = iso(today()),
      tty = typeOn(td),
      cl = clubOn(td),
      pz = pausedOn(td),
      ty = tty || (cl ? "V" : nty),
      dateLbl = parse(td).toLocaleDateString(S.profile.lang === "de" ? "de-DE" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    let small,
      title,
      meta = "",
      btn = "";
    if (pz) {
      small = t("pauseWhy")[pz.why];
      title = pz.why === "vac" ? t("niceHoliday") : t("getWell");
    } else if (tty && !doneOn(td)) {
      small = dateLbl;
      title = t("types")[tty];
      meta = `${sessDur(td, tty)} ${t("min")}${simpleView() ? "" : ` · RPE ${rpeRange(tty, td).txt}`}${cl ? ` · + ${t("club")}` : ""}`;
      btn = `<button type="button" class="go" data-go="${td}" aria-label="${t("startBtn")}">${PLAY}</button>`;
    } else if (cl && !clubDone(td)) {
      small = dateLbl;
      title = t("club");
      meta = `${cl.min} ${t("min")}`;
      btn = `<button type="button" class="go small" data-clublog="${td}">${t("clubLog")}</button>`;
    } else {
      small = tty || clubDone(td) ? `${t("doneToday")} ✓` : t("restToday");
      title = nty && nd !== td ? `${t("weekday")[wd(nd)]} · ${t("types")[nty]}` : t("restWeek");
      meta = nty && nd !== td ? `${t("nextUp")} · ${sessDur(nd, nty)} ${t("min")}` : "";
      btn =
        nty && nd !== td ? `<button type="button" class="go small" data-open="${nd}">${t("viewNext")}</button>` : "";
    }
    // the fighters trade blows on training days; on rest days and once done they wait calmly in guard
    const calm = !!pz || !((tty && !doneOn(td)) || (cl && !clubDone(td)));
    // boxing outfits (blue/red corner) only when the shown session is set to boxing: setup choice first, then the built session, then the main sport
    const shownDs = tty && !doneOn(td) ? td : nty && nd !== td ? nd : td,
      shownSport = (ui.setup && ui.setup.ds === shownDs && ui.setup.sport) || (S.sessions[shownDs] && S.sessions[shownDs].sport) || mainSport(),
      boxHero = (shownSport === "boxing" || shownSport === "taekwondo") && !pz && !(cl && !tty) ? outfitFor(shownSport) : false;
    const greet = (season() || { greet: [] }).greet;
    return `<div class="today" style="--tc:var(--c-${ty || "S"})">${heroScene(boxHero === true ? "box" : boxHero ? "kick" : pose, ty, calm, boxHero)}${greet.length ? `<div class="greet">${esc(greet.join(" · "))}</div>` : ""}<div class="tbody"><div style="min-width:0"><small>${esc(small)}</small><b>${esc(title)}</b>${meta ? `<div class="sub">${esc(meta)}</div>` : ""}</div>${btn}</div></div>`;
  }
  /* Things that need an answer: break, KO suspension, club attendance, missed sessions, results, weight class */
  function promptsHtml() {
    const td = iso(today()),
      start = S.profile.planStart || td,
      act = (txt, btns) => `<div class="note act"><span>${esc(txt)}</span><span class="minirow">${btns}</span></div>`,
      btn = (attr, v, label) => `<button type="button" class="btn ghost" data-${attr}="${v}">${label}</button>`;
    let h = "";
    const pz = pausedOn(td);
    if (pz) h += act(t("pauseNow")(t("pauseWhy")[pz.why], fmtDate(pz.from)), btn("pend", pz.id, t("pauseEnd")));
    if (koLock(td)) {
      const until = addDays(parse(S.ko), 27);
      h += `<div class="note warn">${esc(t("koActive")(fmtDate(iso(until)), daysBetween(today(), until) + 1))}</div>`;
    }
    const rp = rampOn(td);
    if (rp && !pz) h += `<div class="note">${esc(t("rampNote")(rp.left))}</div>`;
    // installed on the phone, the data only lives on this device: remind of a backup every 30 days
    const lb = S.profile.lastBackup;
    if (isStandalone() && S.log.length >= 3 && (!lb || daysBetween(parse(lb), today()) > 30))
      h += act(lb ? t("backupOld")(fmtDate(lb)) : t("backupNone"), btn("io", "exp", t("exp")));
    // club attendance of the last three days – asked once per training
    for (let i = 1; i <= 3; i++) {
      const ds = iso(addDays(today(), -i));
      if (ds < start) break;
      if (clubOn(ds) && !clubDone(ds)) {
        h += act(t("clubAsk")(t("weekday")[wd(ds)]), btn("clubmiss", ds, t("no")) + btn("clublog", ds, t("yesLog")));
        break;
      }
    }
    // own sessions of the last 7 days that were neither done nor moved
    let shown = 0;
    for (let i = 1; i <= 7 && shown < 2; i++) {
      const ds = iso(addDays(today(), -i));
      if (ds < start) break;
      const ty = typeOn(ds);
      if (ty && !doneOn(ds)) {
        shown++;
        h += act(
          t("missed")(t("weekday")[wd(ds)], t("types")[ty]),
          btn("skip", ds, t("skipIt")) + btn("catch", ds, t("catchUp")),
        );
      }
    }
    // results of tournaments and gradings in the last three weeks
    (S.profile.comps || []).forEach((c) => {
      const n = daysBetween(parse(c.date), today());
      if (n >= 1 && n <= 21 && !c.result && !(ui.later || {})[c.id])
        h += act(
          (c.kind === "grade" ? t("resAskG") : t("resAsk"))(fmtDate(c.date)),
          btn("later", c.id, t("later")) + btn("res", c.id, t("clubLog")),
        );
    });
    // weight class of the next tournament: weekly weigh-in and factual notes only, never weight-cutting advice;
    // under 15 there are no reminders at all (logging stays possible in History)
    const nc = nextComp(),
      ncDays = nc ? daysBetween(today(), parse(nc.date)) : 99;
    if (nc && nc.wc && ncDays <= 56 && !under15()) {
      const lw = S.weights[S.weights.length - 1];
      if (!lw || daysBetween(parse(lw.date), today()) >= 7)
        h += `<div class="note act wq"><span>${esc(t("wcWeekly")(fmtDate(nc.date)))}<br><small class="sub">${esc(t("wTip"))}</small></span><span class="minirow"><input id="wQuick" type="text" inputmode="decimal" placeholder="${t("weightPh")}" aria-label="${t("weightAdd")}"><button type="button" class="btn ghost" id="wQuickAdd">${t("add")}</button></span></div>`;
      else {
        const ref = weightTrend() ?? lw.kg;
        if (ref > nc.wc) {
          const diff = Math.round((ref - nc.wc) * 10) / 10,
            big = ncDays <= 21 && diff > ref * 0.03;
          h += `<div class="note warn">${esc(big ? t("wcBig")(numF(diff), numF(nc.wc), ncDays) : t("wcOver")(numF(diff.toFixed(1)), numF(nc.wc), fmtDate(nc.date)))}</div>`;
        }
      }
    }
    return h;
  }
  function renderWeek() {
    const mon = monday(today()),
      ph = phaseInfo(),
      nd = nextTrainingDate(),
      nty = typeOn(nd),
      load = weekLoad();
    const pose = nty === "T" || nty === "C" || nty === "P" ? "kick" : "box";
    let h = header(t("todayTitle"));
    h += installHtml();
    h += todayCard(nd, nty, pose);
    // prompts that need an answer: at most two at once, by importance; the rest follow once one is done
    const asks = [];
    {
      const hj = hijri(today()),
        F = t("fast");
      if (hj && hj.m === 9 && !(S.profile.fast && S.profile.fast.y === hj.y))
        asks.push(
          `<div class="blks" style="--bc:#E0A63A"><div class="bsrow"><span class="bico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg></span><div><b>${F.ask}</b><span class="sub">${F.askS}</span></div></div><div class="acts2"><button type="button" class="btn" data-fast="yes">${F.yes}</button><button type="button" class="btn sec" data-fast="no">${F.no}</button></div></div>`,
        );
    }
    const bh = blockHtml(),
      blockAsk = bh.includes('data-blk="later');
    asks.push(packCardHtml(), blockAsk ? bh : "", weekCheckHtml());
    const simple = simpleView();
    if (!blockAsk) h += bh;
    h += asks.filter(Boolean).slice(0, simple ? 1 : 2).join("");
    if (!simple) h += starterHtml();
    h += promptsHtml();
    if (!simple) h += pulseHtml();
    if (S.profile.example) h += `<div class="note">${t("example")}</div>`;
    if (ph.phase !== "base") {
      let extra = "";
      if (isPrep(ph)) {
        if (!S.profile.birthYear) extra += `<br>${t("needBirth")}`;
        else if (!ph.official) extra += `<br>${t("noFormat")}`;
        const lt = S.tests[S.tests.length - 1];
        if (!lt || daysBetween(parse(lt.date), today()) > 70) extra += `<br>${t("noTestHint")}`;
        else if (lt.complete) {
          const weak = TCATS.filter((k) => lt.scores[k] <= 1).map((k) => t("cats")[k]);
          if (weak.length) extra += `<br>${esc(t("weakHint")(weak.join(", ")))}`;
        }
        const les = lastLesson();
        if (les) extra += `<br>${esc(t("lastLesson")(les))}`;
      }
      h += `<div class="note warn">${esc(prepText(ph, "P"))}${extra}</div>`;
    }
    if (load.deload)
      h += `<div class="note warn">${load.why === "rpe" ? t("deloadRpe") : load.why === "acwr" ? t("deloadAcwr") : load.why === "proj" ? t("deloadProj") : t("deloadPlan")}</div>`;
    const ts = simple ? null : testStatus();
    if (ts)
      h += `<div class="note act"><span>${t({ due: "testDue", first: "testFirst", pre: "testPre", post: "testPost" }[ts])}</span><button type="button" class="btn ghost" data-tab="test">${t("toTest")}</button></div>`;
    h += `<h2>${t("thisWeekH")}</h2>` + weekStrip(null, "data-open");
    h += `<div><div class="sub" style="margin:0 2px 8px">${t("phases")[ph.phase]}${ph.days != null ? ` · ${(ph.kind === "grade" ? t("daysToGrade") : t("daysToComp"))(ph.days)}` : ""}</div><div class="panel">`;
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const ds = iso(addDays(mon, i)),
        ty = typeOn(ds),
        cl = clubOn(ds),
        cd = clubDone(ds),
        ow = (S.ov || {})[ds] || {},
        lg = S.log.find((e) => e.date === ds && own(e)),
        oty = ty || (lg && lg.type);
      if (oty)
        rows.push(
          `<button type="button" class="sess" data-open="${ds}" style="--tc:var(--c-${oty})"><span class="code ${oty}${simpleView() ? " ico" : ""}" aria-hidden="true">${codeOf(oty)}</span><span class="lbl"><b>${t("weekday")[i]}</b><div class="sub">${t("types")[oty]} · ${sessDur(ds, oty)} ${t("min")}${lg || simpleView() ? "" : ` · RPE ${rpeRange(oty, ds).txt}`}${ow.from ? ` · ${t("movedFrom")(t("dayNames")[wd(ow.from)])}` : ""}</div></span>${lg ? `<span class="check">✓ ${t("doneTag")}</span>` : `<span class="chev">→</span>`}</button>`,
        );
      else if (ow.off === "moved")
        rows.push(
          `<button type="button" class="sess" data-open="${ds}" style="--tc:var(--mist)"><span class="code" aria-hidden="true">→</span><span class="lbl"><b>${t("weekday")[i]}</b><div class="sub">${t("movedTo")(t("weekday")[wd(ow.to)])}</div></span></button>`,
        );
      if (cl || cd)
        rows.push(
          `<button type="button" class="sess" data-open="${ds}" style="--tc:var(--c-V)"><span class="code V${simpleView() ? " ico" : ""}" aria-hidden="true">${codeOf("V")}</span><span class="lbl"><b>${t("weekday")[i]}</b><div class="sub">${t("club")}${cd ? ` · ${t("clubKinds")[cd.ck] || ""} · ${cd.minutes} ${t("min")}` : ` · ${cl.min} ${t("min")}`}</div></span>${cd ? `<span class="check">✓ ${t("doneTag")}</span>` : `<span class="chev">→</span>`}</button>`,
        );
    }
    h += rows.join("") || `<div class="row"><span class="sub">${t("noTraining")}</span></div>`;
    h +=
      `</div></div>` +
      (simple ? "" : ruleTags()) +
      `<p class="foot">${t("disclaimer")}${rulesLink()}</p>`;
    return h;
  }
  /* rule book link of the main sport's federation (kickboxing WAKO Germany, boxing DBV, taekwondo DTU or ITF-D) */
  function rulesLink() {
    const de = S.profile.lang === "de",
      sp = mainSport(),
      L =
        sp === "boxing"
          ? [WKB_URL, "Wettkampfbestimmungen des DBV", "DBV competition rules (German)"]
          : sp === "taekwondo"
            ? tkdStyle() === "itf"
              ? ["https://www.itf-d.de/api/public/res/file-manager/downloads/rules/63a9cc9056659.pdf", "Wettkampfordnung der ITF-D", "ITF-D competition rules (German)"]
              : ["https://www.dtu.de/fileadmin/Downloads/Ordnungen/2026/8.1_Wettkampfordnung_Zweikampf_Stand_01.01.2026.pdf", "Wettkampfordnung der DTU", "DTU competition rules (German)"]
            : ["https://www.wako-deutschland.de/downloads/", "Regelwerke der WAKO Deutschland", "WAKO Germany rulebooks (German)"];
    return `<a href="${L[0]}" target="_blank" rel="noopener">${de ? L[1] : L[2]}</a>`;
  }
  function exText(id) {
    const e = EX[id],
      lg = S.profile.lang;
    return {
      name: lg === "de" ? e.de : e.en,
      desc: lg === "de" ? e.dde : e.den,
    };
  }
  /* Hold exercises are logged in seconds instead of reps (looked up by German name in the library) */
  const TIMED = new Set([
    "str.plank",
    "str.hollow_hold",
    "str.single_leg_kick_hold",
    "str.copenhagen_plank",
    "str.neck_iso_hold",
    "str.plank_shoulder_taps",
    "str.dead_hang",
  ]);
  const tracksSets = (id) => EX[id].cat === "str";
  const hasKg = (id) => /weights|kb|bb/.test(EX[id].eq) || (EX[id].eq.includes("studio") && EX[id].cat === "str");

