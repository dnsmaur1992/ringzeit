  /* ============ Profile 7i: "About me" (sport & belt by choice of sport, person) and "Dates & goals" ============
     The sport row only chooses whose details are shown (ui.psport); the main sport changes through its own button.
     Every setting has one place: discipline/focus/belt (kickboxing), age class (boxing), names/style/grade (taekwondo). */
  const LOCK_SVG = '<svg class="lk" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const profSport = (p) => (sportChoices(true).includes(ui.psport) ? ui.psport : p.sport || mainSport());
  function profSportHtml(p) {
    const M = t("pme"),
      main = p.sport || mainSport(),
      sp = profSport(p),
      age = ageExact(today(), p);
    let h = `<div class="panel"><div class="field"><span class="lab">${M.sportSec}</span><span class="sub">${M.forLbl}</span><div class="seg">${sportChoices(true)
      .map((k) => `<button type="button" data-psport="${k}" aria-pressed="${sp === k}">${sportLabel(k)}${k === main ? `<small class="hsb">${M.mainBadge}</small>` : ""}</button>`)
      .join("")}</div>`;
    h += sp === main ? `<span class="sub">${M.mainIs(sportLabel(main))}</span></div>` : `<span class="sub">${M.otherMain(sportLabel(main), sportLabel(sp))}</span><button type="button" class="btn sec" data-p="sport" data-v="${sp}" style="align-self:flex-start">${M.setMain(sportLabel(sp))}</button></div>`;
    if (sp === "kickboxing") {
      h += `<div class="field"><span class="lab">${t("discipline")}</span><div class="seg g2">${["lc", "kl", "fc", "k1"].map((k) => (age != null && age < 15 && (k === "fc" || k === "k1") ? `<button type="button" class="locked" data-lock="age" aria-disabled="true">${LOCK_SVG}${t("disc")[k]}</button>` : `<button type="button" data-p="disc" data-v="${k}" aria-pressed="${p.disc === k}">${t("disc")[k]}</button>`)).join("")}</div></div>`;
      h += `<div class="field"><span class="lab">${t("focus")}</span><div class="seg">${["box", "bal", "kick"].map((k) => `<button type="button" data-p="focus" data-v="${k}" aria-pressed="${(techniqueLevel("kickboxing", undefined, p) === 0 ? "bal" : p.focus) === k}" ${techniqueLevel("kickboxing", undefined, p) === 0 && k !== "bal" ? "disabled" : ""}>${t("focusOpt")[k]}</button>`).join("")}</div>${techniqueLevel("kickboxing", undefined, p) === 0 ? `<span class="sub">${t("focusLock")}</span>` : ""}</div>`;
      const b = beltIdx();
      h += `<div class="field"><span class="lab">${M.beltKb}</span><div class="row" style="gap:10px;align-items:center">${beltDot(b)}<b style="flex:1">${esc(beltName(b))}</b><button type="button" class="btn ghost" data-pedit="belt">${ui.pedit === "belt" ? M.done : M.change}</button></div>`;
      if (ui.pedit === "belt") h += `<div class="chips">${BELTS.map((x, i) => `<button type="button" class="chip" data-belt="${i}" aria-pressed="${b === i}">${beltDot(i)}${esc(beltName(i))}</button>`).join("")}</div>`;
      h += `<span class="sub">${M.beltKbNote}</span><button type="button" class="btn ghost" data-gotoexam="1" style="align-self:flex-start">${M.toExam}</button></div>`;
    } else if (sp === "boxing") {
      const f = age != null ? sportFor("boxing").rules.format(null, age) : null;
      h += `<div class="field"><span class="lab">${M.boxCls}</span>${f ? `<b>${esc(`${t("cls")[f.cls]} · ${fmtText(f)}`)}</b>` : `<span class="sub">${t("needBirth")}</span>`}<span class="sub">${M.boxNote}</span></div>`;
    } else if (sp === "taekwondo") {
      const K = t("tkd"),
        st = tkdStyle(),
        nm = tkdNames(),
        cur = tkdGradeOf(st),
        list = TKDT.gradesFor(st, tkdAge()),
        T = tkdOf(),
        hist = (T.hist || []).filter((x) => x.style === st).sort((a, b) => b.date.localeCompare(a.date) || (a.id < b.id ? 1 : -1));
      h += `<div class="field"><span class="lab">${K.names}</span><div class="seg">${["ko", "app"].map((k) => `<button type="button" data-tk="names" data-tv="${k}" aria-pressed="${nm === k}">${K.namesOpt[k]}</button>`).join("")}</div><span class="sub">${M.namesNote}</span></div>`;
      h += `<div class="field"><span class="lab">${K.style}</span><div class="seg">${TKDT.STYLES.map((k) => `<button type="button" data-tk="style" data-tv="${k}" aria-pressed="${st === k}">${K.styles[k]}</button>`).join("")}</div><span class="sub">${K.styleNote}</span></div>`;
      h += `<div class="field"><span class="lab">${M.gradeOf(K.styles[st])}</span><div class="row" style="gap:10px;align-items:center">${tkdBeltSvg(cur)}<b style="flex:1">${cur ? esc(tkdGradeLbl(cur)) : K.none}</b><button type="button" class="btn ghost" data-pedit="grade">${ui.pedit === "grade" ? M.done : cur ? M.change : M.enter}</button></div>`;
      if (ui.pedit === "grade") h += `<div class="chips">${list.map((c) => `<button type="button" class="chip" data-tk="grade" data-tv="${c}" aria-pressed="${cur === c}">${esc(tkdGradeLbl(c))}</button>`).join("")}</div><span class="sub">${K.enterNote}</span>`;
      h += `<span class="sub">${cur ? M.gradeNote : K.noneNote}</span>`;
      if (hist.length) {
        h += `<details class="pmore"><summary>${M.histN(hist.length)}</summary>`;
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
        h += `</details>`;
      }
      h += `</div>`;
    }
    h += techniqueChoices(sp, sp === "taekwondo" ? p.tkd?.style : undefined, p);
    return h + `</div>`;
  }
  function profPersonHtml(p) {
    const M = t("pme"),
      age = ageExact(today(), p);
    return `<div class="panel"><div class="field"><span class="lab">${M.person}</span></div><div class="field"><label class="lab" for="pBirth">${t("birth")}</label><input id="pBirth" type="date" min="1950-01-01" max="${birthMax()}" required value="${p.birth || ""}"><span class="sub">${M.birthHint[p.sport || mainSport()] || M.birthHint.kickboxing}${age != null ? ` · ${age} · ${t("ages")[ageGroup(p)]}` : ""}</span>${ageGroup(p) === "kids" ? `<span class="sub">${t("kidsNote")}</span>` : ""}</div>
 <div class="field"><span class="lab">${t("sex")}</span><div class="seg g3">${["m", "f", "d"].map((k) => `<button type="button" data-p="sex" data-v="${k}" aria-pressed="${p.sex === k}">${t("sexes")[k]}</button>`).join("")}</div><span class="sub">${t("sexHint")}</span></div>
 <div class="field"><span class="lab">${t("limits")}</span><div class="chips">${Object.keys(AV)
   .map((k) => `<button type="button" class="chip" data-lim="${k}" aria-pressed="${p.limits.includes(k)}">${t("lim")[k]}</button>`)
   .join("")}</div><span class="sub">${t("limitsHint")}</span></div></div>`;
  }
  /* one list of dates: tournaments and gradings (profile comps, all sports) and taekwondo exams (both styles) */
  function profDates(p) {
    const out = (p.comps || []).map((c) => ({ date: c.date, kind: c.kind === "grade" ? "grade" : "comp", sport: c.sport || "kickboxing", c }));
    for (const x of tkdOf().exams || []) out.push({ date: x.date, kind: "exam", sport: "taekwondo", x });
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }
  function profGoalsHtml(p) {
    const M = t("pme"),
      K = t("tkd"),
      td = iso(today()),
      all = profDates(p),
      open = all.filter((d) => (d.kind === "exam" ? !d.x.result : d.date >= td)),
      past = all.filter((d) => !open.includes(d)).reverse();
    const badge = (k) => `<small class="hsb">${M.kinds[k === "comp" ? "comp" : "exam"]}</small>`;
    let h = `<div class="panel"><div class="field"><span class="lab">${M.upcoming}</span>${open.length ? "" : `<span class="sub">${M.noDates}</span>`}</div>`;
    let nextExam = null;
    for (const d of open) {
      const dn = daysBetween(today(), parse(d.date)),
        info = [sportLabel(d.sport)];
      if (d.kind === "exam") {
        const x = d.x;
        info[0] += " " + K.styles[x.style];
        info.push(M.target(tkdGradeLbl(x.target)));
        if (dn >= 0) info.push(t("daysToGrade")(dn));
        if (!nextExam && dn >= 0) nextExam = x;
        h += `<div class="row" style="flex-wrap:wrap;align-items:center;gap:8px"><span style="flex:1;min-width:0"><b>${esc(fmtDate(d.date))}</b>${badge("exam")}<div class="sub">${esc(info.join(" · "))}</div></span>`;
        if (x.date <= td) h += `<button type="button" class="btn sec" data-tk="res" data-tv="${x.id}:y">${K.passed}</button><button type="button" class="btn sec" data-tk="res" data-tv="${x.id}:n">${K.failed}</button>`;
        h += `<button type="button" class="btn ghost" data-tk="del" data-tv="${x.id}" aria-label="${K.del}">✕</button></div>`;
      } else {
        const c = d.c,
          grade = d.kind === "grade",
          f = grade ? null : sportFor(d.sport).rules.format(d.sport === "taekwondo" ? tkdStyle() : p.disc, ageAt(parse(c.date), p));
        info.push(dn >= 0 ? (grade ? t("daysToGrade") : t("daysToComp"))(dn) : "✓");
        if (f) info.push(`${t("cls")[f.cls]} · ${fmtText(f)}`);
        else if (!grade && p.birthYear) info.push(t("noFormat"));
        if (!grade && koLock(c.date)) info.push(t("koComp"));
        h += `<div class="row" style="flex-wrap:wrap;align-items:center;gap:8px"><span style="flex:1;min-width:0"><b>${esc(fmtDate(c.date))}</b>${badge(d.kind)}<div class="sub">${esc(info.join(" · "))}</div></span>${!grade && dn >= 0 ? `<input class="wc" type="text" inputmode="decimal" data-wc="${c.id}" value="${c.wc ?? ""}" placeholder="${t("wcPh")}" aria-label="${t("wc")}">` : ""}<button type="button" class="btn ghost" data-cdel="${c.id}" aria-label="${t("compClear")}">✕</button></div>`;
      }
    }
    const ask = ui.tkdAsk && (tkdOf().exams || []).find((x) => x.id === ui.tkdAsk);
    if (ask) h += `<div class="note"><b>${K.askT(tkdGradeLbl(ask.target))}</b><div class="inline" style="margin-top:8px"><button type="button" class="btn" data-tk="apply" data-tv="${ask.id}:1">${K.askYes}</button><button type="button" class="btn sec" data-tk="apply" data-tv="${ask.id}:0">${K.askNo}</button></div></div>`;
    if (nextExam) h += `<details class="pmore"><summary>${M.examParts(tkdGradeLbl(nextExam.target))}</summary>${tkdOverviewHtml(nextExam.style, nextExam.target)}</details>`;
    h += `</div>`;
    // one form for a new date: kind, sport, (exam: target grade), date
    const kind = ui.ckind === "grade" ? "grade" : "comp",
      sports = sportChoices(true).filter((k) => kind === "comp" || k !== "boxing"),
      csp = sports.includes(ui.csport) ? ui.csport : sports.includes(mainSport()) ? mainSport() : sports[0];
    ui.csport = csp; // the add button (pCompAdd) takes the sport shown here
    h += `<div class="panel"><div class="field"><span class="lab">${M.newDate}</span><div class="seg">${["comp", "grade"].map((k) => `<button type="button" data-ckind="${k}" aria-pressed="${kind === k}">${M.kinds[k === "comp" ? "comp" : "exam"]}</button>`).join("")}</div></div>`;
    h += `<div class="field"><span class="lab">${t("sportL")}</span><div class="seg">${sports.map((k) => `<button type="button" data-csport="${k}" aria-pressed="${csp === k}">${sportLabel(k)}</button>`).join("")}</div>${kind === "grade" && sportChoices(true).includes("boxing") ? `<span class="sub">${M.boxNoExam}</span>` : ""}</div>`;
    if (kind === "grade" && csp === "taekwondo") {
      const st = tkdStyle(),
        cur = tkdGradeOf(st),
        list = TKDT.gradesFor(st, tkdAge()),
        nxt = cur ? TKDT.nextGrade(st, cur, tkdAge()) : "k9",
        tg = list.filter((c) => list.indexOf(c) > list.indexOf(cur || "k10"));
      if (nxt && tg.length)
        h += `<div class="field"><span class="lab">${M.targetLbl(K.styles[st])}</span><select id="tkTarget" aria-label="${K.target}">${tg.map((c) => `<option value="${c}"${c === nxt ? " selected" : ""}>${esc(tkdGradeLbl(c))}</option>`).join("")}</select></div><div class="field"><div class="inline"><input id="tkDate" type="date" min="${td}" aria-label="${K.date}"><button type="button" class="btn sec" data-tk="plan">${t("compAdd")}</button></div><span class="sub">${M.examHint}</span></div>`;
      else h += `<div class="field"><span class="sub">${M.topGrade}</span></div>`;
    } else h += `<div class="field"><div class="inline"><input id="pCompNew" type="date" min="${td}"><button type="button" class="btn sec" id="pCompAdd">${t("compAdd")}</button></div><span class="sub">${kind === "grade" ? M.examHint : t("compHint")}</span></div>`;
    h += `</div>`;
    if (past.length)
      h += `<div class="panel"><div class="field"><span class="lab">${M.past}</span>${past
        .slice(0, 8)
        .map((d) => {
          if (d.kind === "exam") {
            const x = d.x,
              r = x.result === "y" ? K.passed : x.result === "n" ? K.failed : "";
            return `<span class="sub">${esc(`${fmtDate(x.date)} · ${M.kinds.exam} ${K.styles[x.style]} ${tkdGradeLbl(x.target)}${r ? " · " + r : ""}`)}</span>`;
          }
          const c = d.c;
          return `<span class="sub">${esc(`${fmtDate(c.date)} · ${M.kinds[d.kind === "comp" ? "comp" : "exam"]} ${sportLabel(d.sport)}${c.result ? " · " + resText(c) : ""}`)}</span>`;
        })
        .join("")}</div></div>`;
    return h;
  }
