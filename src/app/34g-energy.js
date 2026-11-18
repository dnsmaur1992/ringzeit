  /* ============ Ratgeber: Energiebedarf & Gewichtsklasse (Betreiber 18.11.2026, E37–E40) ============
     A topic under "Zum Lesen" with a reading text per sport (E37) and a calculator below it. Same calculation for all
     sports: resting metabolic rate after Mifflin-St Jeor (1990) × activity of the job (E40: desk 1.4 · on your feet 1.6 ·
     physical 1.8, after the PAL values of the DGE) plus the training of the week (Ringzeit days with their length, club days
     with the club length; net 5 MET, i.e. 5 kcal per kg and hour). Shown as a range (±7.5 %, rounded to 50 kcal), never as
     an exact number; protein 1.6–2.2 g per kg (Morton et al. 2018, ISSN position stand). Goals (E38): keep · lose a little
     (−300 to −500 kcal, never below the resting rate) · build (+200 to +300 kcal). Nothing is stored (E39): sex, job and any
     changed number live only in the open sheet; height, weight and age are prefilled from the profile and the history.
     Under 18 there is no calculator – only the reading text with the advice to plan food and weight class with coach and
     parents. No making weight, no water cuts: with a weight class above the current weight the calculator points to the
     existing warning and does not work out how fast to lose. */
  const EN_WORK = { sit: 1.4, stand: 1.6, phys: 1.8 },
    EN_MET = 5,
    EN_TXT = {
      de: {
        t: "Energiebedarf & Gewichtsklasse",
        sub: "Wie viel Energie dein Training braucht – mit Rechner",
        calc: "Rechner",
        sex: "Für die Formel",
        sexs: { m: "Männlich", f: "Weiblich", x: "Keine Angabe" },
        age: "Alter",
        years: "Jahre",
        height: "Größe",
        weight: "Gewicht",
        work: "Arbeit, Schule, Studium",
        works: { sit: "Sitzend", stand: "Stehend, viel unterwegs", phys: "Körperlich" },
        train: (r, rm, c, cm) =>
          `Training pro Woche: ${r} × Ringzeit à ${rm} Min.${c ? ` und ${c} × Verein à ${cm} Min.` : ""} (aus deinem Plan)`,
        goal: "Ziel",
        goals: { keep: "Halten", lose: "Leicht abnehmen", gain: "Aufbauen" },
        missing: "Für die Rechnung fehlen noch Angaben: Alter, Größe und Gewicht.",
        bmr: (v) => `Grundumsatz ca. ${v} kcal`,
        need: (a, b) => `Bedarf mit Alltag und Training: ca. ${a}–${b} kcal pro Tag`,
        target: (g, a, b) => `${g}: ca. ${a}–${b} kcal pro Tag`,
        protein: (a, b) => `Eiweiß: ${a}–${b} g pro Tag, über den Tag verteilt`,
        floor: "Weniger als den Grundumsatz zeigt der Rechner nie an.",
        wc: (d, w) =>
          `Du liegst über deiner Gewichtsklasse (−${w} kg) für das Turnier am ${d}. Plane das frühzeitig mit deinem Trainer – der Rechner rechnet bewusst nicht aus, wie schnell du abnehmen müsstest.`,
        est: "Schätzwerte: ±10–15 % sind normal. Den echten Bedarf zeigt dein Gewichtsverlauf nach 2–4 Wochen – bleibt das Gewicht gleich, passt die Menge. Nichts davon wird gespeichert, und es ersetzt keine ärztliche oder Ernährungsberatung.",
        young:
          "Bis 18 gibt es hier keinen Rechner. Im Wachstum braucht dein Körper genug Energie für Training, Schule und Wachsen – Kalorien zählen ist nichts für dich. Sprich mit deinem Trainer und deinen Eltern, wenn es um Essen oder die Gewichtsklasse geht.",
        src: "Mifflin-St Jeor (1990); DGE-Referenzwerte (PAL); Compendium of Physical Activities; Morton et al. 2018 / ISSN (Eiweiß); IOC-Konsens REDs 2023",
      },
      en: {
        t: "Energy needs & weight class",
        sub: "How much energy your training needs – with a calculator",
        calc: "Calculator",
        sex: "For the formula",
        sexs: { m: "Male", f: "Female", x: "Not set" },
        age: "Age",
        years: "years",
        height: "Height",
        weight: "Weight",
        work: "Job, school, studies",
        works: { sit: "Desk", stand: "On your feet", phys: "Physical" },
        train: (r, rm, c, cm) =>
          `Training per week: ${r} × Ringzeit of ${rm} min${c ? ` and ${c} × club of ${cm} min` : ""} (from your plan)`,
        goal: "Goal",
        goals: { keep: "Keep", lose: "Lose a little", gain: "Build" },
        missing: "The calculation still needs your age, height and weight.",
        bmr: (v) => `Resting rate approx. ${v} kcal`,
        need: (a, b) => `Needs with daily life and training: approx. ${a}–${b} kcal a day`,
        target: (g, a, b) => `${g}: approx. ${a}–${b} kcal a day`,
        protein: (a, b) => `Protein: ${a}–${b} g a day, spread over the day`,
        floor: "The calculator never shows less than your resting rate.",
        wc: (d, w) =>
          `You are above your weight class (−${w} kg) for the tournament on ${d}. Plan this early with your coach – the calculator deliberately does not work out how fast you would have to lose.`,
        est: "Estimates: ±10–15 % is normal. Your real needs show in your weight over 2–4 weeks – if it stays the same, the amount fits. Nothing here is stored, and it does not replace medical or nutrition advice.",
        young:
          "There is no calculator here until 18. While you are growing, your body needs enough energy for training, school and growing – counting calories is not for you. Talk to your coach and your parents about food or your weight class.",
        src: "Mifflin-St Jeor (1990); DGE reference values (PAL); Compendium of Physical Activities; Morton et al. 2018 / ISSN (protein); IOC consensus REDs 2023",
      },
    };
  /* the reading text per sport (E37) */
  function energySecs(lg) {
    const de = lg === "de",
      sp = mainSport(),
      shared = de
        ? [
            ["Genug Energie ist Leistung", "Wer zu wenig isst, trainiert schwächer, erholt sich langsamer, wird öfter krank und verletzt sich leichter. Sportmediziner nennen das „relatives Energiedefizit“ (REDs). Gerade an harten Trainingstagen gehört ausreichend Essen zum Plan."],
            ["Eiweiß verteilen", "Etwa 1,6–2,2 g Eiweiß pro kg Körpergewicht am Tag reichen für Kraft und Erholung. Besser auf 3–5 Mahlzeiten verteilt als alles auf einmal – auch nach dem Training."],
            ["Trinken", "Durst ist ein spätes Signal. An Trainingstagen über den Tag trinken, nach dem Training nachtrinken. Heller Urin heißt: passt."],
          ]
        : [
            ["Enough energy is performance", "Eating too little means weaker training, slower recovery, more colds and more injuries. Sports medicine calls this “relative energy deficiency” (REDs). On hard training days, enough food is part of the plan."],
            ["Spread your protein", "About 1.6–2.2 g of protein per kg of body weight a day covers strength and recovery. Better over 3–5 meals than all at once – after training too."],
            ["Drink", "Thirst is a late signal. Drink through the day on training days and refill after training. Light-coloured urine means you're fine."],
          ];
    let own;
    if (sp === "taekwondo") {
      const itf = tkdStyle() === "itf";
      own = de
        ? [
            ["Prüfung und Wettkampf", `Bei Gürtelprüfungen spielt das Gewicht keine Rolle – dort zählen Technik, Formen und Kondition. Gewichtsklassen gibt es nur im Wettkampf${itf ? " nach den ITF-Regeln (ITF-D)" : " nach den Regeln von World Taekwondo und DTU"}.`],
            ["Gewichtsklasse langfristig planen", "Wer im Wettkampf in eine Klasse will, plant das über Wochen und nicht in den letzten Tagen. Entwässern oder Hungern vor dem Wiegen kostet Kraft, Schnelligkeit und Konzentration – genau das, was im Kampf zählt. Sprich die Klasse mit deinem Trainer ab."],
          ]
        : [
            ["Grading and competition", `At gradings your weight doesn't matter – technique, patterns and fitness do. Weight classes only exist in competition${itf ? " under ITF rules (ITF-D)" : " under World Taekwondo and DTU rules"}.`],
            ["Plan your weight class early", "If you want a certain class in competition, plan it over weeks, not in the last few days. Dehydrating or starving before the weigh-in costs strength, speed and focus – exactly what counts in the fight. Agree on the class with your coach."],
          ];
    } else {
      const fed = sp === "boxing" ? (de ? "DBV" : "the DBV") : "WAKO";
      own = de
        ? [
            ["Gewichtsklassen", `Im Wettkampf kämpfst du in einer Gewichtsklasse nach den Regeln ${sp === "boxing" ? "des DBV" : "der WAKO"}. Gewogen wird vor dem Turnier; wer drüber liegt, darf in dieser Klasse nicht starten.`],
            ["Langfristig planen statt abkochen", "Die passende Klasse planst du über Wochen mit leichtem Defizit – nicht in den letzten Tagen. Abkochen, Saunagänge oder Hungern vor dem Wiegen machen dich langsamer, schwächer und anfälliger für Treffer. Sprich die Klasse früh mit deinem Trainer ab; Ringzeit erinnert dich vor dem Turnier ans Wiegen."],
          ]
        : [
            ["Weight classes", `In competition you fight in a weight class under the rules of ${fed}. You are weighed before the tournament; above the limit you cannot start in that class.`],
            ["Plan ahead instead of cutting", "Plan your class over weeks with a small deficit – not in the last few days. Water cuts, sauna sessions or starving before the weigh-in make you slower, weaker and easier to hit. Agree on the class with your coach early; Ringzeit reminds you to weigh in before the tournament."],
          ];
    }
    return [...own, ...shared];
  }
  const ENERGY_READ = {
    k: "energy",
    ico: '<path d="M12 3c2.5 3 4.5 5.4 4.5 8.6A4.5 4.5 0 0 1 12 16.2a4.5 4.5 0 0 1-4.5-4.6C7.5 9.8 9 8.3 10 6.6c.6 1.6 1.4 2.4 2.4 2.8C12.7 7.4 12.4 5.4 12 3z"/><path d="M8 20h8"/>',
    get de() {
      return { t: EN_TXT.de.t, sub: EN_TXT.de.sub, secs: energySecs("de"), src: EN_TXT.de.src };
    },
    get en() {
      return { t: EN_TXT.en.t, sub: EN_TXT.en.sub, secs: energySecs("en"), src: EN_TXT.en.src };
    },
  };
  const r50 = (v) => Math.round(v / 50) * 50;
  /* the starting values of the calculator: from the profile and the history, nothing else */
  function energyStart(prof = S.profile) {
    const age = ageAt(today(), prof),
      last = S.weights.length ? S.weights[S.weights.length - 1].kg : null,
      cm = +prof.height >= 120 && +prof.height <= 230 ? +prof.height : null;
    return { sex: prof.sex === "m" || prof.sex === "f" ? prof.sex : "x", age, cm, kg: last, work: prof.work === "phys" ? "phys" : "sit", goal: "keep" };
  }
  /* under 18 – or no birth date and a young age group – no calculator */
  const energyYoung = (prof = S.profile) => {
    const a = ageAt(today(), prof);
    return a != null ? a < 18 : young(prof);
  };
  /* training minutes of the week from the plan: Ringzeit days with their length, club days with the club length */
  function energyWeek(prof = S.profile) {
    const r = (prof.days || []).length,
      rm = +prof.minutes || 60,
      cl = prof.club || {},
      c = (cl.days || []).length,
      cm = +cl.minutes || 90;
    return { r, rm, c, cm, min: r * rm + c * cm };
  }
  /* the calculation; null while age, height or weight are missing */
  function energyCalc(v, wk) {
    const age = +v.age,
      cm = +v.cm,
      kg = +v.kg;
    if (!(age >= 18 && age <= 100 && cm >= 120 && cm <= 230 && kg >= 35 && kg <= 200)) return null;
    const bmr = 10 * kg + 6.25 * cm - 5 * age + (v.sex === "m" ? 5 : v.sex === "f" ? -161 : -78),
      train = (EN_MET * kg * wk.min) / 60 / 7,
      need = bmr * (EN_WORK[v.work] || EN_WORK.sit) + train,
      lo = r50(need * 0.925),
      hi = r50(need * 1.075),
      B = r50(bmr),
      goal =
        v.goal === "lose"
          ? [Math.max(B, r50(need - 500)), Math.max(B, r50(need - 300))]
          : v.goal === "gain"
            ? [r50(need + 200), r50(need + 300)]
            : [lo, hi];
    return { bmr: B, need: [lo, hi], goal, protein: [Math.round(kg * 1.6), Math.round(kg * 2.2)], floor: v.goal === "lose" && r50(need - 500) < B };
  }
  /* the sheet: reading text, then the calculator (or the note for under 18) */
  function energySheetHtml(o, nx) {
    const lg = S.profile.lang === "de" ? "de" : "en",
      E = EN_TXT[lg],
      G = t("guide"),
      R = ENERGY_READ[lg],
      secs = R.secs.map(([a, b]) => `<div class="gsec"><b>${esc(a)}</b><p>${esc(b)}</p></div>`).join("");
    let calc;
    if (energyYoung()) calc = `<div class="note">${esc(E.young)}</div>`;
    else {
      const v = (o.en = o.en || energyStart()),
        wk = energyWeek(),
        res = energyCalc(v, wk),
        seg = (key, opts) =>
          `<div class="seg">${Object.entries(opts).map(([k, l]) => `<button type="button" data-en="${key}:${k}" aria-pressed="${v[key] === k}">${esc(l)}</button>`).join("")}</div>`,
        num = (key, lab, u, ph) =>
          `<div class="field"><label class="lab" for="en_${key}">${lab}</label><div class="inline"><input id="en_${key}" data-enf="${key}" type="text" inputmode="decimal" maxlength="5" placeholder="${ph}" value="${v[key] != null && v[key] !== "" ? esc(String(v[key])) : ""}"><span class="u">${u}</span></div></div>`,
        nc = nextComp(),
        over = nc && nc.wc && +v.kg > nc.wc;
      calc =
        `<span class="glab">${E.calc}</span>` +
        `<div class="field"><span class="lab">${E.sex}</span>${seg("sex", E.sexs)}</div>` +
        num("age", E.age, E.years, "30") +
        num("cm", E.height, "cm", "178") +
        num("kg", E.weight, "kg", "75") +
        `<div class="field"><span class="lab">${E.work}</span>${seg("work", E.works)}</div>` +
        `<p class="sub">${esc(E.train(wk.r, wk.rm, wk.c, wk.cm))}</p>` +
        `<div class="field"><span class="lab">${E.goal}</span>${seg("goal", E.goals)}</div>` +
        (res
          ? `<div class="note ok enres"><b>${esc(E.target(E.goals[v.goal], fmtKcal(res.goal[0]), fmtKcal(res.goal[1])))}</b><br>${esc(E.need(fmtKcal(res.need[0]), fmtKcal(res.need[1])))}<br>${esc(E.bmr(fmtKcal(res.bmr)))}<br>${esc(E.protein(res.protein[0], res.protein[1]))}${res.floor ? `<br>${esc(E.floor)}` : ""}</div>`
          : `<div class="note">${esc(E.missing)}</div>`) +
        (over ? `<div class="note warn">${esc(E.wc(fmtDate(nc.date), numF(nc.wc)))}</div>` : "") +
        `<p class="sub">${esc(E.est)}</p>`;
    }
    return `<h3>${esc(R.t)}</h3><p class="sub">${esc(R.sub)}</p>${secs}${calc}<p class="sub gsrc">${t("src")}: ${esc(R.src)}</p><div class="acts2"><button type="button" class="btn sec" data-sx="close">${t("close")}</button><button type="button" class="btn" data-guide="${nx.k}">${G.nextRead}</button></div>`;
  }
  const fmtKcal = (v) => (S.profile.lang === "de" ? v.toLocaleString("de-DE") : v.toLocaleString("en-GB"));
  /* taps and inputs in the calculator: only the open sheet changes, nothing is saved */
  function energyAction(ds) {
    const o = ui.sheet;
    if (!o || o.kind !== "guide" || o.id !== "energy" || !o.en) return;
    const [k, val] = String(ds.en).split(":");
    if (["sex", "work", "goal"].includes(k)) o.en[k] = val;
    renderSheet();
  }
  function energyInput(el) {
    const o = ui.sheet;
    if (!o || o.kind !== "guide" || o.id !== "energy" || !o.en) return;
    const v = parseFloat(String(el.value).replace(",", "."));
    o.en[el.dataset.enf] = Number.isFinite(v) ? v : "";
    renderSheet();
  }
