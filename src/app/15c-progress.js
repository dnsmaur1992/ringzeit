  /* ============ Progress in the history (Betreiber 18.11.2026, Teil 36, point 5) ============
     Only what was entered: no test, no question, no extra task. Two parts, each shown only when there is something:
     - load of the last 4 weeks: entries by effort – hard (7–10), moderate (5–6), easy (1–4); entries without an effort
       are not counted;
     - strength: per exercise the first and the latest entry in the window – with weight the estimated maximum of the
       best set (Epley: kg × (1 + reps / 30)), without weight the most reps (or seconds). At least 2 entries, the 3
       exercises with the most entries. Window: since the load distribution was switched on, otherwise 8 weeks. */
  const PROG_WEEKS = 4,
    PROG_WINDOW = 56;
  function progLoadWeeks() {
    const mon = monday(today());
    return [...Array(PROG_WEEKS)].map((_, k) => {
      const from = iso(addDays(mon, -7 * (PROG_WEEKS - 1 - k))),
        to = iso(addDays(parse(from), 6)),
        es = S.log.filter((e) => e && e.date >= from && e.date <= to && Number.isFinite(+e.rpe) && e.rpe !== "" && e.rpe != null);
      return {
        from,
        hard: es.filter((e) => +e.rpe >= 7).length,
        mid: es.filter((e) => +e.rpe >= 5 && +e.rpe < 7).length,
        easy: es.filter((e) => +e.rpe < 5).length,
      };
    });
  }
  function progStart() {
    const since = loadOn() && S.profile.autoLoadSince,
      win = iso(addDays(today(), -PROG_WINDOW));
    return since && since > win ? { from: since, since: true } : { from: win, since: false };
  }
  function progStrength(from) {
    const per = {};
    S.log
      .filter((e) => e && e.date >= from && Array.isArray(e.perf))
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((e) =>
        e.perf.forEach((p) => {
          if (!p || !EX[p.id] || !Array.isArray(p.sets)) return;
          const kg = p.sets.filter((x) => x && +x.kg > 0 && +x.r > 0);
          const v = kg.length
            ? { kg: true, v: Math.max(...kg.map((x) => +x.kg * (1 + +x.r / 30))) }
            : { kg: false, v: Math.max(0, ...p.sets.filter((x) => x && +x.r > 0).map((x) => +x.r)) };
          if (!v.v) return;
          (per[p.id] = per[p.id] || []).push({ date: e.date, ...v });
        }),
      );
    return Object.entries(per)
      .map(([id, list]) => {
        // a change between weight and no weight is not comparable: only the kind of the latest entry counts
        const last = list[list.length - 1],
          same = list.filter((x) => x.kg === last.kg);
        return { id, n: same.length, first: same[0], last };
      })
      .filter((x) => x.n >= 2)
      .sort((a, b) => b.n - a.n || exText(a.id).name.localeCompare(exText(b.id).name))
      .slice(0, 3);
  }
  function progressHtml() {
    const P = t("prog"),
      weeks = progLoadWeeks(),
      entries = weeks.reduce((a, w) => a + w.hard + w.mid + w.easy, 0),
      st = progStart(),
      str = progStrength(st.from);
    if (entries < 3 && !str.length) return "";
    let h = `<div><h2>${P.title}</h2><div class="panel prog">`;
    if (entries >= 3) {
      h += `<div class="field"><span class="lab">${P.loadT}</span><span class="sub">${P.loadS}</span>`;
      h += weeks
        .map(
          (w) =>
            `<div class="progw"><span class="progd progs">${P.week(parse(w.from).toLocaleDateString(S.profile.lang === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "short" }))}</span><span class="progc"><span class="pchip h">${w.hard} ${P.hard}</span><span class="pchip m">${w.mid} ${P.mid}</span><span class="pchip e">${w.easy} ${P.easy}</span></span></div>`,
        )
        .join("");
      h += `</div>`;
    }
    if (str.length) {
      h += `<div class="field"><span class="lab">${P.strT}</span><span class="sub">${st.since ? P.since(fmtDate(st.from)) : P.weeks8}</span>`;
      h += str
        .map((x) => {
          const pct = Math.round((x.last.v / x.first.v - 1) * 100),
            unit = x.last.kg ? " kg" : TIMED.has(x.id) ? " s" : ` ${t("reps")}`,
            fmt = (v) => (x.last.kg ? Math.round(v * 2) / 2 : Math.round(v)) + unit;
          return `<div class="progw"><span class="progd"><b>${esc(exText(x.id).name)}</b><span class="sub">${x.n} ${P.entries}</span></span><span class="progv">${fmt(x.first.v)} → ${fmt(x.last.v)}<span class="sub">${pct > 0 ? "+" : ""}${pct} %</span></span></div>`;
        })
        .join("");
      h += `<span class="sub">${str.some((x) => x.last.kg) ? P.est : P.raw}</span></div>`;
    }
    return h + `</div></div>`;
  }
