  /* ============ Badges (in the spirit of Apple Fitness awards): earned from the data, kept with their date ============ */
  const ICON_P = {
    sess: "M6.5 12.5l3.5 3.5 7.5-8.5",
    rounds: "M6 16h12l-1.6-2.2V10a4.4 4.4 0 0 0-8.8 0v3.8z M10 18.5a2 2 0 0 0 4 0",
    streak:
      "M12 3.5c1.2 3.2 4.6 4.6 4.6 8.9a4.6 4.6 0 0 1-9.2 0c0-2.3 1.2-3.6 2.4-4.6 0 1.7 1 2.8 2.2 2.8 0-2.7-1.2-4.8 0-7.1z",
    club: "M4.5 11.2L12 5.5l7.5 5.7V19h-4.6v-4.8H9.1V19H4.5z",
    test: "M12 4.2l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16.2l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z",
    level: "M6.5 14.5l5.5-5.5 5.5 5.5 M6.5 19l5.5-5.5 5.5 5.5",
    belt: "M3.5 10.5h17v3.2h-17z M10.5 13.7l-2 5.8 M13.5 13.7l2 5.8 M10.5 10.5h3v3.2h-3z",
    comp: "M8 4.5h8v4.8a4 4 0 0 1-8 0z M8 6.2H5.4a2.8 2.8 0 0 0 2.8 3.6 M16 6.2h2.6a2.8 2.8 0 0 1-2.8 3.6 M12 13.3v3.9 M9 19.5h6",
    win: "M13.2 3.5L6.5 13h5l-1 7.5 7-10h-5z",
    podium: "M4 20v-6h5.3v6 M9.3 20V9.5h5.4V20 M14.7 20v-8h5.3v8",
    theory:
      "M4.5 5.5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2h-6z M19.5 5.5h-5a2 2 0 0 0-2 2 M19.5 5.5v12h-5a2 2 0 0 0-2 2",
    variety: "M4.5 7.5h3.8l7.4 9h3.8 M4.5 16.5h3.8l2.4-2.9 M13.3 10.4l2.4-2.9h3.8",
  };
  const TIER = [
    null,
    { a: "#e3a26a", b: "#8a4f22", ink: "#f2c49a" }, // bronze
    { a: "#f1f3f6", b: "#8e959f", ink: "#e9edf2" }, // silver
    { a: "#ffe08a", b: "#b07d1f", ink: "#ffd76a" }, // gold
    { a: "#ff8a7a", b: "#9e2430", ink: "#ffb1a6" }, // champion (crimson)
  ];
  /* id, icon, tier, threshold, stat key, [de name, de text], [en name, en text] */
  const BADGES = [
    [
      "s1",
      "sess",
      1,
      1,
      "own",
      ["Erster Schritt", "Deine erste eigene Einheit"],
      ["First step", "Your first own session"],
    ],
    ["s10", "sess", 1, 10, "own", ["Dranbleiber", "10 eigene Einheiten"], ["Sticking with it", "10 own sessions"]],
    ["s25", "sess", 2, 25, "own", ["Routine", "25 eigene Einheiten"], ["Routine", "25 own sessions"]],
    ["s50", "sess", 3, 50, "own", ["Ausdauernd", "50 eigene Einheiten"], ["Relentless", "50 own sessions"]],
    ["s100", "sess", 4, 100, "own", ["Hundert", "100 eigene Einheiten"], ["Century", "100 own sessions"]],
    [
      "r100",
      "rounds",
      1,
      100,
      "rounds",
      ["100 Runden", "100 Runden im Rundentimer"],
      ["100 rounds", "100 rounds on the round timer"],
    ],
    [
      "r500",
      "rounds",
      3,
      500,
      "rounds",
      ["500 Runden", "500 Runden im Rundentimer"],
      ["500 rounds", "500 rounds on the round timer"],
    ],
    [
      "r1000",
      "rounds",
      4,
      1000,
      "rounds",
      ["Tausend Runden", "1000 Runden im Rundentimer"],
      ["Thousand rounds", "1000 rounds on the round timer"],
    ],
    [
      "w4",
      "streak",
      1,
      4,
      "streak",
      ["4 Wochen am Stück", "4 Wochen hintereinander alles geschafft"],
      ["4-week streak", "4 weeks in a row, all done"],
    ],
    [
      "w8",
      "streak",
      2,
      8,
      "streak",
      ["8 Wochen am Stück", "8 Wochen hintereinander alles geschafft"],
      ["8-week streak", "8 weeks in a row, all done"],
    ],
    [
      "w12",
      "streak",
      3,
      12,
      "streak",
      ["Ein Quartal", "12 Wochen hintereinander alles geschafft"],
      ["A full quarter", "12 weeks in a row, all done"],
    ],
    [
      "w26",
      "streak",
      4,
      26,
      "streak",
      ["Ein halbes Jahr", "26 Wochen hintereinander alles geschafft"],
      ["Half a year", "26 weeks in a row, all done"],
    ],
    [
      "c10",
      "club",
      1,
      10,
      "club",
      ["Vereinsmensch", "10 Vereinstrainings eingetragen"],
      ["Club regular", "10 club sessions logged"],
    ],
    [
      "c50",
      "club",
      3,
      50,
      "club",
      ["Stammgast", "50 Vereinstrainings eingetragen"],
      ["Club veteran", "50 club sessions logged"],
    ],
    [
      "t1",
      "test",
      1,
      1,
      "tests",
      ["Standortbestimmung", "Dein erster Fitnesstest"],
      ["Baseline", "Your first fitness test"],
    ],
    [
      "l1",
      "level",
      2,
      1,
      "level",
      ["Technik geübt", "Technikniveau Geübt im Profil gewählt"],
      ["Practised technique", "Practised technical experience selected in your profile"],
    ],
    [
      "l2",
      "level",
      3,
      2,
      "level",
      ["Technik erfahren", "Technikniveau Erfahren im Profil gewählt"],
      ["Experienced technique", "Experienced technical level selected in your profile"],
    ],
    [
      "b1",
      "belt",
      2,
      1,
      "belts",
      ["Neuer Gurt", "Eine Gürtelprüfung bestanden"],
      ["New belt", "Passed a belt grading"],
    ],
    [
      "th1",
      "theory",
      1,
      1,
      "theory",
      ["Theoriefest", "Ein Theorie-Quiz bestanden"],
      ["Knows the rules", "Passed a theory quiz"],
    ],
    [
      "mix",
      "variety",
      2,
      6,
      "types",
      ["Allrounder", "Jede Art von Einheit mindestens einmal"],
      ["All-rounder", "Every session type at least once"],
    ],
    [
      "go",
      "level",
      1,
      6,
      "starter",
      ["Startklar", "Alle ersten Schritte erledigt"],
      ["Ready to go", "All first steps done"],
    ],
    [
      "blk1",
      "level",
      2,
      1,
      "blocks",
      ["Fokussiert", "Einen 6-Wochen-Schwerpunkt durchgezogen"],
      ["Focused", "Completed a 6-week focus block"],
    ],
    [
      "k1",
      "comp",
      2,
      1,
      "comps",
      ["Ab in den Ring", "Dein erstes Turnier"],
      ["Into the ring", "Your first tournament"],
    ],
    ["k2", "win", 3, 1, "wins", ["Erster Sieg", "Einen Turnierkampf gewonnen"], ["First win", "Won a tournament bout"]],
    [
      "k3",
      "podium",
      3,
      1,
      "podium",
      ["Auf dem Podest", "Platz 1 bis 3 bei einem Turnier"],
      ["On the podium", "Top 3 at a tournament"],
    ],
    ["k4", "comp", 4, 1, "gold", ["Turniersieger", "Ein Turnier gewonnen"], ["Champion", "Won a tournament"]],
  ];
  function badgeStats() {
    const ownLog = S.log.filter(own),
      done = (S.profile.comps || []).filter((c) => c.result && c.date <= iso(today()));
    let rounds = 0;
    ownLog.forEach((e) => {
      if (e.rounds != null) rounds += e.rounds;
      else {
        const rb = roundBlock(S.sessions[e.date]);
        if (rb) rounds += rb.items.length;
      }
    });
    rounds += S.profile.ftRounds || 0;
    return {
      own: ownLog.length,
      rounds,
      streak: weekStreak(),
      club: S.log.filter((e) => !own(e)).length,
      tests: S.tests.length,
      level: maxLevel(),
      belts: done.filter((c) => c.kind === "grade" && c.result.passed === "y").length,
      theory: Object.entries(S.profile.gp || {}).filter(([k, v]) => k.includes(".th.") && v === 2).length,
      types: new Set(ownLog.map((e) => e.type)).size,
      starter: starterSteps().filter((x) => x.done).length,
      blocks: (S.profile.blockHist || []).filter((x) => x.full).length,
      comps: done.filter((c) => c.kind !== "grade").length,
      wins: done.filter((c) => c.kind !== "grade" && +c.result.wins > 0).length,
      podium: done.filter((c) => ["1", "2", "3"].includes(c.result.place)).length,
      gold: done.filter((c) => c.result.place === "1").length,
    };
  }
  const bName = (b) => b[S.profile.lang === "de" ? 5 : 6];
  function medalSvg(b, earned, cls = "") {
    const [id, icon, tier, n] = b,
      T = TIER[tier],
      g = `mg${id}${cls ? "x" : ""}`,
      big = n >= 10 && ["sess", "rounds", "club", "streak"].includes(icon);
    return `<svg class="medal ${earned ? "on" : "off"} ${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${earned ? T.a : "#3a3d44"}"/><stop offset="1" stop-color="${earned ? T.b : "#1f2227"}"/></linearGradient><radialGradient id="${g}i" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${earned ? "#262a31" : "#1c1f24"}"/><stop offset="1" stop-color="#0d0f12"/></radialGradient></defs>
        <circle cx="50" cy="50" r="47" fill="url(#${g})"/><circle cx="50" cy="50" r="38.5" fill="url(#${g}i)" stroke="${earned ? T.b : "#15171b"}" stroke-width="1.5"/>
        ${earned ? `<path d="M18 34 A36 36 0 0 1 60 14" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>` : ""}
        <g transform="translate(${big ? 32 : 29} ${big ? 22 : 29}) scale(${big ? 1.5 : 1.75})" fill="none" stroke="${earned ? T.ink : "#4a4e56"}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON_P[icon]}"/></g>
        ${big ? `<text x="50" y="78" text-anchor="middle" font-size="15" font-weight="800" fill="${earned ? T.ink : "#4a4e56"}" font-family="ui-rounded,-apple-system,system-ui,sans-serif">${n}</text>` : ""}</svg>`;
  }
  /* new badges are stored with their date; the very first check (existing data) stores silently */
  function checkBadges() {
    if (ui.onb || ui.tour != null) return;
    const st = badgeStats(),
      first = !S.profile.badges,
      have = S.profile.badges || {},
      fresh = BADGES.filter((b) => !have[b[0]] && st[b[4]] >= b[3]);
    if (!fresh.length && !first) return;
    const d = iso(today());
    fresh.forEach((b) => (have[b[0]] = d));
    S.profile.badges = have;
    if (draft) draft.badges = have;
    store.save();
    if (first) return fresh.length && toast(t("bdgInit")(fresh.length));
    ui.bdgQueue = [...(ui.bdgQueue || []), ...fresh.map((b) => b[0])];
    showBadgeQueue();
  }
  function showBadgeQueue() {
    if (ui.sheet || ui.win || !ui.bdgQueue || !ui.bdgQueue.length) return;
    const id = ui.bdgQueue.shift();
    openSheet({ kind: "badge", id, fresh: true });
    celebrate();
  }
  function badgeSheetHtml(o) {
    const b = BADGES.find((x) => x[0] === o.id),
      got = (S.profile.badges || {})[o.id],
      st = badgeStats(),
      v = Math.min(st[b[4]], b[3]),
      [nm, tx] = bName(b);
    return `<div class="bdgbig">${medalSvg(b, !!got, o.fresh ? "pop" : "")}</div>${o.fresh ? `<div class="bdgnew">${t("bdgNew")}</div>` : ""}<h3 style="text-align:center">${esc(nm)}</h3><p class="sub" style="text-align:center;margin:0">${esc(tx)}</p>
        ${got ? `<p class="sub" style="text-align:center;margin:0">${t("bdgGot")(fmtDate(got))}</p>` : `<div class="pbar"><span style="width:${Math.round((100 * v) / b[3])}%"></span></div><p class="sub" style="text-align:center;margin:0">${v} / ${b[3]}</p>`}
        <div class="acts2"><button type="button" class="btn" data-sx="${o.fresh ? "bdgnext" : "close"}">${o.fresh ? t("bdgCont") : t("close")}</button></div>`;
  }
  function badgeOrder() {
    const have = S.profile.badges || {},
      st = badgeStats();
    const earned = BADGES.filter((b) => have[b[0]]).sort((a, b) => have[b[0]].localeCompare(have[a[0]])),
      open = BADGES.filter((b) => !have[b[0]]).sort((a, b) => st[b[4]] / b[3] - st[a[4]] / a[3]);
    return { earned, open, st };
  }
  function badgesHtml() {
    const { earned, open, st } = badgeOrder(),
      cell = (b, got) =>
        `<button type="button" class="bdg" data-bdg="${b[0]}">${medalSvg(b, got)}<b>${esc(bName(b)[0])}</b><small>${got ? fmtDate(S.profile.badges[b[0]]) : `${Math.min(st[b[4]], b[3])}/${b[3]}`}</small></button>`;
    return `<div><div class="bdghead"><h2>${t("bdgTitle")}</h2><button type="button" class="btn ghost" data-act2="allbdg">${t("bdgAll")} · ${earned.length}/${BADGES.length}</button></div><div class="bdgrow">${[...earned.map((b) => cell(b, true)), ...open.slice(0, 6).map((b) => cell(b, false))].join("")}</div></div>`;
  }
  function allBadgesHtml() {
    const { earned, open, st } = badgeOrder(),
      cell = (b, got) =>
        `<button type="button" class="bdg" data-bdg="${b[0]}">${medalSvg(b, got)}<b>${esc(bName(b)[0])}</b><small>${got ? fmtDate(S.profile.badges[b[0]]) : `${Math.min(st[b[4]], b[3])}/${b[3]}`}</small></button>`;
    return `<h3>${t("bdgTitle")}</h3><div class="sub">${t("bdgCount")(earned.length, BADGES.length)}</div><div class="bdggrid">${[...earned.map((b) => cell(b, true)), ...open.map((b) => cell(b, false))].join("")}</div><div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
  }
