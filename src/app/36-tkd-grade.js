  /* ============ Taekwondo grade area (6a): style, current grade, exam planning, history, exam overview ============
     Data: sports/taekwondo/grades.js (RZ.TKDT). Stored in S.profile.tkd = { style, wt, itf, hist, exams }.
     A grade changes ONLY by a confirmed exam result or a manual entry/correction – never by sessions, badges or fitness.
     WT and ITF grades are separate; nothing is carried over between the styles. */
  const tkdOf = (p = S.profile) => p.tkd || { style: "wt", wt: "", itf: "", hist: [], exams: [] };
  const tkdStyle = (p = S.profile) => (tkdOf(p).style === "itf" ? "itf" : "wt");
  /* style of the unit being built or shown (a unit can differ from the profile style: ITF-D unit, then WT); null = profile style */
  let unitStyle = null;
  const tkdUnitStyle = () => unitStyle || tkdStyle();
  /* data module of the unit's style: WT (sports/taekwondo/techniques.js) or ITF-D (itf.js) */
  const tkm = () => (tkdUnitStyle() === "itf" ? ITFT : TKDT);
  const tkdGradeOf = (style = tkdStyle(), p = S.profile) => tkdOf(p)[style] || "";
  const tkdW = () => (S.profile.tkd = S.profile.tkd || { style: "wt", names: "ko", wt: "", itf: "", hist: [], exams: [] });
  /* technique names: "ko" = Korean names, "app" = names in the app language (used by the WT/ITF plans, 6b/6c; speech always uses the app language) */
  const tkdNames = (p = S.profile) => (tkdOf(p).names === "app" ? "app" : "ko");
  const tkdGradeLbl = (code) => TKDT.gradeText(code, S.profile.lang === "de" ? "de" : "en");
  /* belt colours name for the grade line (no grade = the white standard drawing, not a confirmed grade) */
  function tkdBeltSvg(code, w = 64) {
    const b = TKDT.beltOf(code),
      h = Math.round(w * 0.2);
    const stripe = b.tip ? `<rect x="0" y="${h * 0.36}" width="${w}" height="${h * 0.28}" fill="${b.tip}"/>` : "";
    const half = b.half ? `<rect x="${w / 2}" y="0" width="${w / 2}" height="${h}" fill="${b.tip}"/>` : "";
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" style="border-radius:3px;border:1px solid var(--line);vertical-align:middle"><rect width="${w}" height="${h}" fill="${b.base}"/>${b.half ? half : stripe}</svg>`;
  }
  /* what the figures wear: false, true (boxing corners) or { tkd: belt } (white dobok with the belt of the grade) */
  function outfitFor(sport, o) {
    if (sport === "boxing") return true;
    if (sport !== "taekwondo") return false;
    const st = (o && o.tstyle) || tkdStyle(),
      g = o && o.tgrade != null ? o.tgrade : tkdGradeOf(st);
    return { tkd: TKDT.beltOf(g) };
  }
  /* number of the Kup of the worn grade of the current style: 0 = Dan/Poom (above all Kup), null = no grade entered */
  const tkdKup = (style = tkdUnitStyle()) => {
    const g = tkdGradeOf(style);
    return g ? (g[0] === "k" ? +g.slice(1) : 0) : null;
  };
  /* context of the technique release (sports/taekwondo/techniques.js allowed()) */
  const tkdCtx = () => ({ level: techniqueLevel("taekwondo"), kup: tkdKup(), kid: ageGroup() === "kids", young: young(), risky: kneeAnk() });
  const tkdAge = (p = S.profile) => (ageAt(today(), p) != null ? ageAt(today(), p) : null);

  function tkdHistPush(e) {
    const T = tkdW();
    T.hist.push({ id: "h" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36), ...e });
    if (T.hist.length > 200) T.hist.splice(0, T.hist.length - 200);
  }
  function tkdSetGrade(style, code, kind, extra = {}) {
    const T = tkdW(),
      from = T[style] || "";
    T[style] = code;
    tkdHistPush({ date: iso(today()), style, from, to: code, kind: kind || (from ? "correct" : "start"), ...extra });
  }
  function tkdLastDate(style) {
    const h = tkdOf().hist.filter((x) => x.style === style && x.to).sort((a, b) => a.date.localeCompare(b.date));
    return h.length ? h[h.length - 1].date : null;
  }
  const tkdPartLbl = (c) => t("tkd").parts[c] || c;

  /* the exam overview of a grade: parts, form name, waiting time (a hint) */
  function tkdOverviewHtml(style, code) {
    const K = t("tkd"),
      parts = TKDT.examParts(style, code),
      form = TKDT.formOf(style, code),
      wait = TKDT.waitMonths(style, code),
      last = tkdLastDate(style),
      early = wait ? TKDT.earliestExam(style, code, last) : null,
      age = tkdAge();
    let h = `<div class="field"><span class="lab">${esc(K.overview(tkdGradeLbl(code)))}</span>`;
    if (!parts.length) return h + `<span class="sub">${K.noExam}</span></div>`;
    h += `<div class="chips">${parts
      .map((c) => {
        let txt = tkdPartLbl(c);
        if (c === "form" && form) txt = `${txt}: ${form[1]}`;
        if (c === "tul" && form) txt = `${txt}: ${form[1]}`;
        return `<span class="chip" style="cursor:default">${esc(txt)}</span>`;
      })
      .join("")}</div>`;
    if (style === "wt" && form && form[0] && code !== "d1" && code !== "p1") h += `<span class="sub">${K.formNote(form[0])}</span>`;
    if (style === "wt" && (parts.includes("break1") || parts.includes("break2")) && age != null && age < 15) h += `<span class="sub">${K.noBreak}</span>`;
    if (wait) h += `<span class="sub">${K.wait(wait, early ? fmtDate(early) : "")}</span>`;
    h += `<span class="sub">${K.partsNote(style)}</span></div>`;
    return h;
  }

  /* style (association) and name language in the grade area of Test → belt grading (in the profile they sit under About me, 15b-profile.js); both act on S.profile at once */
  function tkdPrefsHtml() {
    const K = t("tkd"),
      st = tkdStyle(),
      nm = tkdNames();
    return `<div class="field"><span class="lab">${K.style}</span><div class="seg">${TKDT.STYLES.map((k) => `<button type="button" data-tk="style" data-tv="${k}" aria-pressed="${st === k}">${K.styles[k]}</button>`).join("")}</div><span class="sub">${K.styleNote}</span></div><div class="field"><span class="lab">${K.names}</span><div class="seg">${["ko", "app"].map((k) => `<button type="button" data-tk="names" data-tv="${k}" aria-pressed="${nm === k}">${K.namesOpt[k]}</button>`).join("")}</div><span class="sub">${K.namesNote}</span></div>`;
  }

  function tkdPanelHtml() {
    const K = t("tkd"),
      T = tkdOf(),
      st = tkdStyle(),
      cur = tkdGradeOf(st),
      age = tkdAge(),
      list = TKDT.gradesFor(st, age),
      nxt = cur ? TKDT.nextGrade(st, cur, age) : "k9",
      td = iso(today()),
      exams = (T.exams || []).filter((x) => x.style === st).sort((a, b) => a.date.localeCompare(b.date)),
      hist = (T.hist || []).filter((x) => x.style === st).sort((a, b) => b.date.localeCompare(a.date) || (a.id < b.id ? 1 : -1));
    const ask = ui.tkdAsk && exams.find((x) => x.id === ui.tkdAsk);
    let h = `<div class="panel"><div class="field"><span class="lab">${K.title}</span><span class="sub">${K.hint}</span></div>`;
    h += tkdPrefsHtml();
    h += `<div class="field"><span class="lab">${K.current}</span><div class="row" style="gap:10px;align-items:center">${tkdBeltSvg(cur)}<b>${cur ? esc(tkdGradeLbl(cur)) : K.none}</b></div>${cur ? "" : `<span class="sub">${K.noneNote}</span>`}</div>`;
    h += `<div class="field"><span class="lab">${cur ? K.correct : K.enter}</span><div class="chips">${list.map((c) => `<button type="button" class="chip" data-tk="grade" data-tv="${c}" aria-pressed="${cur === c}">${esc(tkdGradeLbl(c))}</button>`).join("")}</div><span class="sub">${K.enterNote}</span></div>`;
    // exam planning
    h += `<div class="field"><span class="lab">${K.exams}</span>${exams.length ? "" : `<span class="sub">${K.examNone}</span>`}`;
    exams.forEach((x) => {
      const past = x.date <= td,
        res = x.result === "y" ? K.passed : x.result === "n" ? K.failed : "";
      h += `<div class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><span style="flex:1">${esc(fmtDate(x.date))} · ${esc(tkdGradeLbl(x.target))}${res ? ` · <b>${res}</b>` : ""}</span>`;
      if (!x.result && past)
        h += `<button type="button" class="btn sec" data-tk="res" data-tv="${x.id}:y">${K.passed}</button><button type="button" class="btn sec" data-tk="res" data-tv="${x.id}:n">${K.failed}</button>`;
      if (!x.result) h += `<button type="button" class="btn ghost" data-tk="del" data-tv="${x.id}" aria-label="${K.del}">✕</button>`;
      h += `</div>`;
    });
    if (ask)
      h += `<div class="note"><b>${K.askT(tkdGradeLbl(ask.target))}</b><div class="inline" style="margin-top:8px"><button type="button" class="btn" data-tk="apply" data-tv="${ask.id}:1">${K.askYes}</button><button type="button" class="btn sec" data-tk="apply" data-tv="${ask.id}:0">${K.askNo}</button></div></div>`;
    if (nxt)
      h += `<div class="inline"><input id="tkDate" type="date" min="${td}" aria-label="${K.date}"><select id="tkTarget" aria-label="${K.target}">${list
        .filter((c) => list.indexOf(c) > list.indexOf(cur || "k10"))
        .map((c) => `<option value="${c}"${c === nxt ? " selected" : ""}>${esc(tkdGradeLbl(c))}</option>`)
        .join("")}</select><button type="button" class="btn sec" data-tk="plan">${K.plan}</button></div>`;
    h += `</div>`;
    // overview of the next exam (planned target, otherwise the next grade)
    const nextEx = exams.find((x) => !x.result),
      ovg = nextEx ? nextEx.target : nxt;
    if (ovg) h += tkdOverviewHtml(st, ovg);
    // history
    h += `<div class="field"><span class="lab">${K.history}</span>${hist.length ? "" : `<span class="sub">${K.histNone}</span>`}`;
    hist.slice(0, 12).forEach((x) => {
      const what =
        x.kind === "exam" && x.applied === false
          ? K.hExamKept(tkdGradeLbl(x.target))
          : x.kind === "exam"
          ? x.passed === false
            ? K.hExamFail(tkdGradeLbl(x.target || x.to || ""))
            : K.hExam(tkdGradeLbl(x.to))
          : x.kind === "start"
            ? K.hStart(tkdGradeLbl(x.to))
            : K.hCorr(x.from ? tkdGradeLbl(x.from) : K.none, tkdGradeLbl(x.to));
      h += `<div class="sub" style="margin:2px 0">${esc(fmtDate(x.date))} · ${esc(what)}</div>`;
    });
    h += `</div></div>`;
    return h;
  }

  function tkdAction(ds) {
    const T = tkdW(),
      a = ds.tk,
      v = ds.tv;
    if (a === "style") {
      const levels = (S.profile.techLevels = { ...(S.profile.techLevels || {}) });
      if (mainSport() === "taekwondo") levels[trainingKey("taekwondo", T.style)] = S.profile.level;
      T.style = v === "itf" ? "itf" : "wt";
      if (mainSport() === "taekwondo") S.profile.level = levels[trainingKey("taekwondo", T.style)] || 0;
      ui.tkdAsk = null;
    } else if (a === "names") {
      T.names = v === "app" ? "app" : "ko";
    } else if (a === "grade") {
      const st = tkdStyle();
      if (TKDT.isGrade(st, v) && v !== T[st]) tkdSetGrade(st, v);
    } else if (a === "plan") {
      const d = document.getElementById("tkDate"),
        g = document.getElementById("tkTarget");
      if (!d || !d.value) return toast(t("tkd").needDate);
      if (g && TKDT.isGrade(tkdStyle(), g.value))
        T.exams.push({ id: "e" + Date.now().toString(36), style: tkdStyle(), date: d.value, target: g.value, result: null });
    } else if (a === "del") {
      T.exams = T.exams.filter((x) => x.id !== v);
    } else if (a === "res") {
      const [id, r] = v.split(":"),
        x = T.exams.find((e) => e.id === id);
      if (x && !x.result) {
        x.result = r;
        if (r === "y") ui.tkdAsk = id;
        else tkdHistPush({ date: x.date, style: x.style, from: T[x.style] || "", to: "", target: x.target, kind: "exam", passed: false });
      }
    } else if (a === "apply") {
      const [id, yes] = v.split(":"),
        x = T.exams.find((e) => e.id === id);
      if (x && yes === "1") {
        const from = T[x.style] || "";
        T[x.style] = x.target;
        tkdHistPush({ date: x.date, style: x.style, from, to: x.target, target: x.target, kind: "exam", passed: true });
        setTimeout(() => toast(t("tkd").gradeUp(tkdGradeLbl(x.target))), 600);
      } else if (x) tkdHistPush({ date: x.date, style: x.style, from: T[x.style] || "", to: T[x.style] || "", target: x.target, kind: "exam", passed: true, applied: false });
      ui.tkdAsk = null;
    }
    if ((a === "plan" || a === "del" || a === "res") && draft) applyPlan();
    if (a === "style") {
      dropOpenSessions(iso(today())); loadCache = {};
      if (draft) { draft.tkd = JSON.parse(JSON.stringify(S.profile.tkd)); draft.level = S.profile.level; draft.techLevels = { ...S.profile.techLevels }; }
    }
    store.save();
    render();
  }
