  /* ============ Onboarding: three questions on the very first start ============ */
  function renderOnb() {
    const el = document.getElementById("onb");
    if (!ui.onb) {
      el.hidden = true;
      return;
    }
    if (ui.onb.ack) {
      const A = t("ack");
      el.innerHTML = `<svg viewBox="0 0 400 220" style="width:100%;max-width:420px;height:auto;align-self:center;flex-shrink:0" aria-hidden="true"><ellipse cx="200" cy="208" rx="150" ry="10" fill="#C9A86A" opacity=".18"/>${fightPair("box", 14, outfitFor(ui.onb.sport || mainSport(), ui.onb))}</svg><h1>${A.h}</h1><ul class="ackl">${A.pts.map((x) => `<li>${x}</li>`).join("")}</ul><div class="sub">${A.priv}</div><div class="acts"><button type="button" class="btn" data-onb="ack">${A.ok}</button></div>`;
      el.hidden = false;
      return;
    }
    const o = ui.onb,
      step = o.step;
    let h = `<button type="button" class="btn ghost skip" data-onb="skip">${t("onbSkip")}</button><div class="dots">${[0, 1, 2, 3, 4].map((i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>${step === 0 ? installHtml(true) : ""}`;
    h += `<svg viewBox="0 0 400 220" style="width:100%;max-width:420px;height:auto;align-self:center;flex-shrink:0" aria-hidden="true"><ellipse cx="200" cy="208" rx="150" ry="10" fill="#C9A86A" opacity=".18"/>${fightPair((o.sport || mainSport()) === "boxing" ? "box" : (o.sport || mainSport()) === "taekwondo" ? "kick" : step === 1 || step === 3 ? "box" : "kick", 14, outfitFor(o.sport || mainSport(), o))}</svg>`;
    if (step === 0) {
      const osp = o.sport || mainSport();
      if (sportChoices().length > 1)
        h += `<h1>${t("onbSportQ")}</h1><div class="seg">${sportChoices().map((k) => `<button type="button" data-osport="${k}" aria-pressed="${osp === k}">${sportLabel(k)}</button>`).join("")}</div>`;
      if (osp === "boxing") h += `<div class="sub">${t("onbBoxS")}</div>`;
      else if (osp === "taekwondo") {
        const K = t("tkd"),
          ost = o.tstyle || "wt",
          og = o.tgrade != null ? o.tgrade : "";
        h += `<div class="sub">${K.onbS}</div><h1>${K.onbStyle}</h1><div class="seg">${TKDT.STYLES.map((k) => `<button type="button" data-otstyle="${k}" aria-pressed="${ost === k}">${K.styles[k]}</button>`).join("")}</div><h1>${K.onbGrade}</h1><div class="chips"><button type="button" class="chip" data-otgrade="" aria-pressed="${og === ""}">${K.onbGradeNone}</button>${TKDT.gradesFor(ost, null).map((c) => `<button type="button" class="chip" data-otgrade="${c}" aria-pressed="${og === c}">${esc(TKDT.gradeText(c, S.profile.lang === "de" ? "de" : "en"))}</button>`).join("")}</div><div class="sub">${K.onbGradeNote}</div>`;
      } else
        h += `<h1>${t("onbQ1")}</h1><div class="sub">${t("onbQ1s")}</div><div class="seg g2">${["lc", "kl", "fc", "k1"].map((k) => `<button type="button" data-od="${k}" aria-pressed="${o.disc === k}">${t("disc")[k]}</button>`).join("")}</div>`;
    } else if (step === 1) {
      h += `<h1>${t("onbClubQ")}</h1><div class="sub">${t("onbClubS")}</div><div class="chips">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<button type="button" class="chip cday" data-ocday="${i}" aria-pressed="${o.clubDays.includes(i)}">${t("dayNames")[i]}</button>`).join("")}</div>${o.clubDays.length ? `<span class="lab">${t("onbClubMin")}</span><div class="seg">${[60, 75, 90, 120].map((m) => `<button type="button" data-ocmin="${m}" aria-pressed="${o.clubMin === m}">${m} ${t("min")}</button>`).join("")}</div>` : ""}`;
    } else if (step === 2) {
      h += `<h1>${t("onbQ2")}</h1><div class="sub">${t("onbQ2s")}</div><div class="chips">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<button type="button" class="chip${o.clubDays.includes(i) ? " clubday" : ""}" data-oday="${i}" aria-pressed="${o.days.includes(i)}">${t("dayNames")[i]}</button>`).join("")}</div><div class="seg">${[45, 60, 75, 90].map((m) => `<button type="button" data-omin="${m}" aria-pressed="${o.minutes === m}">${m} ${t("min")}</button>`).join("")}</div>`;
    } else if (step === 4) {
      const B = t("blk");
      h += `<h1>${B.onbT}</h1><div class="sub">${B.onbS}</div><div class="onbpts">${B.onbPts.map((x) => `<span>${x}</span>`).join("")}</div>`;
    } else {
      h += `<h1>${t("onbQ3")}</h1><div class="sub">${t("onbQ3s")}</div><input id="oBirth" type="number" inputmode="numeric" min="1950" max="${today().getFullYear() - 8}" placeholder="2001" value="${o.birthYear || ""}"><span class="lab">${t("sex")}</span><div class="seg g3">${["m", "f", "d"].map((k) => `<button type="button" data-osex="${k}" aria-pressed="${o.sex === k}">${t("sexes")[k]}</button>`).join("")}</div><span class="sub">${t("sexHint")}</span><label class="lab" for="oComp">${t("onbComp")}</label><input id="oComp" type="date" min="${iso(today())}" value="${o.comp || ""}">`;
    }
    if (step === 0) {
      const sp = o.sport || mainSport(), st = sp === "taekwondo" ? o.tstyle || "wt" : undefined;
      h += techniqueChoices(sp, st, { sport: sp, level: o.techLevel || 0, tkd: { style: st }, techLevels: {} }, true);
    }
    if (step === 4) {
      const V = t("view");
      h += `<span class="lab">${V.onbQ}</span><div class="seg">${V.opts.map((x, i) => `<button type="button" data-osimple="${i ? 0 : 1}" aria-pressed="${(o.simple !== false) === !i}">${x}</button>`).join("")}</div><span class="sub">${V.hint}</span>`;
      h += `<div class="note"><b>${workoutText().start}</b><div>${esc(workoutText().intro)}</div></div>`;
    }
    if (step === 4)
      h += `<div class="acts"><button type="button" class="btn sec" data-onb="back">${t("onbBack")}</button><button type="button" class="btn" data-onb="test">${t("blk").onbTest}</button></div><button type="button" class="btn ghost later" data-onb="done">${t("blk").onbLater}</button>`;
    else
      h += `<div class="acts">${step ? `<button type="button" class="btn sec" data-onb="back">${t("onbBack")}</button>` : ""}<button type="button" class="btn" data-onb="next" ${step === 2 && !o.days.length ? "disabled" : ""}>${t("onbNext")}</button></div>`;
    el.innerHTML = h;
    el.hidden = false;
  }
  function readOnb() {
    const b = document.getElementById("oBirth"),
      c = document.getElementById("oComp");
    if (b) {
      const y = parseInt(b.value);
      ui.onb.birthYear = y >= 1950 && y <= today().getFullYear() - 8 ? y : "";
    }
    if (c) ui.onb.comp = c.value;
  }
  /* "What's new": shown once per big update to people who already used the app.
     Raise NEWS_V (and update the texts under "news") only for updates worth telling about. */
  const NEWS_V = 11; // 10: independent technique/fitness and final effort control; 11: more feasts, Winter Arc catch-up over 3 days
  const needNews = () => !S.profile.example && !!S.profile.toured && (S.profile.newsSeen || 0) < NEWS_V;
  const showNews = () => openSheet({ kind: "news" });
  async function finishOnb(skip, test) {
    // new users get setup and tour instead
    S.profile.newsSeen = NEWS_V;
    // the safety note is confirmed once before the app starts
    if (!S.profile.ackSafe) {
      ui.onb.ack = { skip, test };
      renderOnb();
      return;
    }
    const o = ui.onb;
    ui.onb = null;
    if (!skip) {
      S.profile = {
        ...S.profile,
        disc: o.disc,
        sport: o.sport || S.profile.sport || "kickboxing",
        tkd: (() => {
          const st = o.tstyle === "itf" ? "itf" : "wt",
            T = { ...tkdOf(), style: st, hist: [...tkdOf().hist] };
          if (o.sport === "taekwondo" && o.tgrade && TKDT.isGrade(st, o.tgrade)) {
            T[st] = o.tgrade;
            T.hist.push({ id: "h" + Date.now().toString(36), date: iso(today()), style: st, from: "", to: o.tgrade, kind: "start" });
          }
          return T;
        })(),
        level: o.techLevel || 0,
        techLevels: { [trainingKey(o.sport || S.profile.sport, o.tstyle)]: o.techLevel || 0 },
        fitnessBase: 0,
        days: o.days.slice().sort((a, b) => a - b),
        minutes: o.minutes,
        club: { days: (o.clubDays || []).slice(), minutes: o.clubMin || 90 },
        simple: o.simple !== false,
        birthYear: o.birthYear || "",
        sex: o.sex || "",
        comps: o.comp ? [{ id: "c" + Date.now().toString(36), date: o.comp }] : [],
        example: false,
        planStart: iso(today()),
      };
      S.sessions = {};
      ensureExample();
      store.save();
      await loading("loadingPlan");
    } else {
      S.profile.example = false;
      store.save();
    }
    ui.tab = "week";
    // optional entry test: the tour follows once the test is saved or closed
    if (test) {
      ui.tab = "test";
      ui.testView = "fit";
      ui.testOpen = true;
      ui.testDraft = {};
      ui.tourAfter = true;
    }
    render(true);
    if (!S.profile.toured && !test) startTour();
  }

