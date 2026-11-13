  /* ============ Backup and trainer summary – everything stays on the device ============ */
  /* Offers a file through the viewer's save dialog; where that isn't available, shows it so it can be copied */
  /* Feedback form (Tally): only the app version and a coarse device type are passed along, nothing from the training data */
  const FEEDBACK_URL = "https://tally.so/r/OQQE5g";
  function feedbackUrl() {
    const dev = isIOS() ? "iPhone/iPad" : isAndroid() ? "Android" : "Computer",
      mode = isStandalone() ? (S.profile.lang === "de" ? "installiert" : "installed") : "Browser";
    return `${FEEDBACK_URL}?version=${encodeURIComponent(`${APP_ID} ${APP_VER}`)}&geraet=${encodeURIComponent(`${dev}, ${mode}`)}&sprache=${S.profile.lang}`;
  }
  const isStandalone = () => {
    try {
      return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    } catch (e) {
      return false;
    }
  };
  /* Saves a file: in Claude via the downloads capability, on the phone via the share sheet ("Save to Files"),
     otherwise as a browser download; the copy sheet is the last resort */
  async function offerFile(filename, data, fallbackHtml) {
    try {
      const dl = window.claude && window.claude.use ? await claude.use("downloads") : null;
      if (dl) {
        await dl.save({ filename, data });
        toast(t("savedFile"));
        return true;
      }
    } catch (e) {
      if (e && (e.code === "declined" || e.code === "rate_limited")) return false;
    }
    try {
      const type = typeof data === "string" ? "application/json" : data.type || "application/octet-stream",
        file = new File([data], filename, { type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return true;
      }
      if (!isStandalone()) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 1000);
        toast(t("savedFile"));
        return true;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return false;
    }
    openSheet({ kind: "show", title: filename, html: fallbackHtml });
    return false;
  }
  async function exportData() {
    const json = JSON.stringify({
      app: APP_ID,
      v: 2,
      exported: new Date().toISOString(),
      data: S,
    });
    const ok = await offerFile(
      `${APP_ID}-${t("backupName")}-${iso(today())}.json`,
      json,
      `<span class="sub">${t("copyHint")}</span><textarea id="showTxt" readonly style="min-height:160px">${esc(json)}</textarea><button type="button" class="btn sec" data-copy="showTxt">${t("copyBtn")}</button>`,
    );
    if (ok) {
      S.profile.lastBackup = iso(today());
      if (draft) draft.lastBackup = S.profile.lastBackup;
      store.save();
      if (ui.tab === "week") render();
    }
  }
  function importFile(file) {
    const r = new FileReader();
    r.onload = () => {
      let o;
      try {
        o = JSON.parse(r.result);
      } catch (e) {
        o = null;
      }
      if (!o || o.app !== APP_ID || !o.data || !o.data.profile) return toast(t("impBad"));
      const when = o.exported ? fmtDate(iso(new Date(o.exported))) : "?";
      openSheet({
        kind: "confirm",
        title: t("imp"),
        lines: [t("impConfirm")(when)],
        run: () => {
          S = hydrate(o.data);
          resumeClear();
          ui.sel = null;
          ui.setup = null;
          clearSessionTimer();
          draft = null;
          store.save(true);
          toast(t("impDone"));
          render(true);
        },
      });
    };
    r.readAsText(file);
  }
  /* The last 4 calendar weeks (this one included) – shared by the history tab, the text and the image summary.
     For the trainer: every session per calendar week with day, duration, content and new bests (13.11.2026). */
  function sumDay(ds) {
    const d = parse(ds),
      wd = t("weekday")[(d.getDay() + 6) % 7];
    return S.profile.lang === "de" ? `${wd.slice(0, 2)} ${d.getDate()}.${d.getMonth() + 1}.` : `${wd.slice(0, 3)} ${d.getDate()} ${monShort(d)}`;
  }
  /* what was trained: type (with club kind and sport tag); for own sessions the day's plan without warm-up and
     cool-down – rounds with their kinds ("6 Runden: Schattenboxen, Sandsack"), then up to 5 exercises – or, without a
     plan, the exercises with logged sets; then the run or the own note */
  function sumContent(e) {
    const lg = S.profile.lang === "de" ? 0 : 1, // round titles are [de, en, …]
      label = `${t("types")[e.type] || ""}${e.ck ? ` · ${t("clubKinds")[e.ck] || ""}` : ""}${logTag(e)}`,
      sess = own(e) && S.sessions[e.date],
      plan = sess && sess.blocks && (!sess.type || sess.type === e.type) ? sess.blocks.filter((bl) => bl.key !== "warm" && bl.key !== "cool") : null,
      items = plan ? plan.flatMap((bl) => bl.items || []) : [],
      // combination rounds (no exercise of their own); interval rounds with an exercise count as exercises
      rounds = items.filter((it) => it && it.kind === "round" && !EX[it.id]),
      kinds = [...new Set(rounds.map((it) => (rtOf(it) || {})[lg]).filter(Boolean))],
      ids = plan ? items.filter((it) => it && EX[it.id]).map((it) => it.id) : (e.perf || []).map((p) => p.id),
      names = [...new Set(ids.filter((id) => id && EX[id]))].map((id) => exText(id).name),
      parts = [];
    if (rounds.length) parts.push(`${rounds.length} ${t("sum").rounds}${kinds.length ? `: ${kinds.join(", ")}` : ""}`);
    if (names.length) parts.push(names.slice(0, 5).join(", ") + (names.length > 5 ? ` +${names.length - 5}` : ""));
    return { label, list: parts.join(" · "), extra: `${runInfo(e)}${e.note ? ` · ${e.note}` : ""}`.replace(/^ · /, "") };
  }
  function summaryData() {
    const to = today(),
      m0 = addDays(monday(to), -21),
      a = iso(m0),
      b = iso(to),
      L4 = S.log.filter((e) => e.date >= a && e.date <= b),
      prs = entryPrs(),
      kws = [0, 1, 2, 3].map((k) => {
        const m = addDays(m0, 7 * k),
          s0 = iso(m),
          s1 = iso(addDays(m, 6));
        return {
          m,
          kw: isoWeekNo(m),
          range: weekRangeText(m),
          entries: L4.filter((e) => e.date >= s0 && e.date <= s1)
            .sort((x, y) => x.date.localeCompare(y.date))
            .map((e) => ({ e, day: sumDay(e.date), c: sumContent(e), prs: prs[e.id] || [] })),
        };
      });
    return {
      from: a,
      to: b,
      own: L4.filter(own).length,
      club: L4.filter((e) => !own(e)).length,
      mins: L4.reduce((x, e) => x + (e.minutes || 0), 0),
      rpe: L4.length ? numF(Math.round((L4.reduce((x, e) => x + (e.rpe || 0), 0) / L4.length) * 10) / 10) : "–",
      kws,
      test: S.tests[S.tests.length - 1],
      nc: nextComp(),
      lw: S.weights.slice().sort((x, y) => x.date.localeCompare(y.date))[S.weights.length - 1],
      prs: bestSets().slice(0, 3),
    };
  }
  function summaryLines() {
    const d = summaryData(),
      p = S.profile,
      T = t("sum"),
      age = ageExact();
    const out = {
      head: `${T.kwSpan(d.kws[0].kw, d.kws[3].kw)} · ${T.period(sumDay(d.from).replace(/^\S+ /, ""), sumDay(d.to).replace(/^\S+ /, ""))} · ${discLabel(p)} · ${t("levels")[p.level]}${age != null ? ` · ${age} ${T.years}` : ""}`,
      test: d.test
        ? `${d.test.total}/25 · ${TCATS.map((k) => `${t("cats")[k]} ${d.test.scores[k] ?? "–"}`).join(", ")} (${fmtDate(d.test.date)})`
        : T.none,
      next: T.none,
      weight: d.lw ? `${numF(d.lw.kg)} kg (${fmtDate(d.lw.date)})` : T.none,
      prs: d.prs.length ? d.prs.map((x) => `${x.name} ${x.v}`).join(" · ") : T.none,
    };
    if (d.nc) {
      const f = sportFor(p.sport).rules.format(p.disc, ageAt(parse(d.nc.date)));
      out.next = `${fmtDate(d.nc.date)}${f ? ` · ${fmtText(f)}` : ""}${d.nc.wc ? ` · −${numF(d.nc.wc)} kg` : ""}`;
    }
    return { d, out };
  }
  /* one entry as a line: "Mo 9.11. · 60 min · Kraft: Kniebeuge, Liegestütze · Notiz" */
  const sumEntryLine = (x) =>
    `${x.day} · ${x.e.minutes} ${t("min")} · ${x.c.label}${x.c.list ? `: ${x.c.list}` : ""}${x.c.extra ? ` · ${x.c.extra}` : ""}`;
  function summaryText() {
    const { d, out } = summaryLines(),
      T = t("sum");
    const lines = [`Ringzeit · ${T.title}`, out.head, "", `${T.own}: ${d.own} · ${T.clubN}: ${d.club} · ${T.mins}: ${d.mins} · ${T.rpe}: ${d.rpe}`];
    d.kws.forEach((w) => {
      lines.push("", T.kw(w.kw, w.range));
      if (!w.entries.length) lines.push(`• ${T.noneWeek}`);
      w.entries.forEach((x) => {
        lines.push(`• ${sumEntryLine(x)}`);
        if (x.prs.length) lines.push(`  ${T.pr}: ${x.prs.join(" · ")}`);
      });
    });
    lines.push("", `${T.test}: ${out.test}`, `${T.next}: ${out.next}`, `${T.weight}: ${out.weight}`, `${T.prs}: ${out.prs}`);
    return lines.join("\n");
  }
  /* summary card drawn on a canvas, 1080 px wide, as high as the list needs; long lines wrap onto a second line
     (system font, app colours) */
  function summaryCanvas() {
    const { d, out } = summaryLines(),
      T = t("sum"),
      W = 1080,
      c = document.createElement("canvas"),
      x = c.getContext("2d"),
      F = '-apple-system, "SF Pro Display", "Segoe UI", Roboto, sans-serif';
    const font = (size, w) => (x.font = `${w} ${size}px ${F}`);
    // split into at most n lines of width maxW (the last one ends with … if it is still too long)
    const wrap = (str, size, w, maxW, n = 2) => {
      font(size, w);
      const words = String(str).split(" "),
        lines = [];
      let cur = "";
      for (const wd of words) {
        const tryL = cur ? cur + " " + wd : wd;
        if (x.measureText(tryL).width <= maxW || !cur) cur = tryL;
        else {
          lines.push(cur);
          cur = wd;
        }
      }
      if (cur) lines.push(cur);
      if (lines.length > n) {
        let last = lines.slice(n - 1).join(" ");
        while (last.length > 4 && x.measureText(last + "…").width > maxW) last = last.slice(0, -1);
        lines.splice(n - 1, lines.length, last + "…");
      }
      return lines;
    };
    // layout first (measuring needs no final size), then size the canvas and draw
    const ops = [],
      LW = W - 176;
    let Y = 490;
    const put = (str, X, size, col, w, maxW, n, gap) => {
      wrap(str, size, w, maxW, n).forEach((ln) => {
        ops.push([ln, X, Y, size, col, w]);
        Y += gap;
      });
    };
    d.kws.forEach((wk) => {
      put(T.kw(wk.kw, wk.range), 72, 30, "#ECE8E1", 700, W - 144, 1, 50);
      if (!wk.entries.length) put(T.noneWeek, 96, 26, "#8C9099", 500, LW, 1, 44);
      wk.entries.forEach((it) => {
        ops.push(["•dot", own(it.e) ? "#D9545C" : "#6F9FE0", Y]);
        put(`${it.day} · ${it.e.minutes} ${t("min")} · ${it.c.label}`, 104, 27, "#ECE8E1", 600, LW, 1, 40);
        const more = [it.c.list, it.c.extra].filter(Boolean).join(" · ");
        if (more) put(more, 104, 23, "#8C9099", 500, LW, 2, 34);
        if (it.prs.length) put(`${T.pr}: ${it.prs.join(" · ")}`, 104, 23, "#C9A86A", 600, LW, 2, 34);
        Y += 10;
      });
      Y += 30;
    });
    const legendY = Y;
    Y += 60;
    [
      [T.test, out.test],
      [T.next, out.next],
      [T.weight, out.weight],
      [T.prs, out.prs],
    ].forEach(([k, v]) => {
      put(k, 72, 24, "#8C9099", 500, W - 144, 1, 40);
      put(v, 72, 30, "#ECE8E1", 600, W - 144, 2, 40);
      Y += 22;
    });
    c.width = W;
    c.height = Y + 40;
    const text = (str, X, Yy, size, col, w) => {
      font(size, w);
      x.fillStyle = col;
      x.textAlign = "left";
      x.fillText(str, X, Yy);
    };
    const box = (X, Yy, w, h, r) => {
      x.beginPath();
      x.moveTo(X + r, Yy);
      x.arcTo(X + w, Yy, X + w, Yy + h, r);
      x.arcTo(X + w, Yy + h, X, Yy + h, r);
      x.arcTo(X, Yy + h, X, Yy, r);
      x.arcTo(X, Yy, X + w, Yy, r);
      x.closePath();
    };
    x.fillStyle = "#0A0B0D";
    x.fillRect(0, 0, W, c.height);
    const g = x.createRadialGradient(W / 2, -40, 40, W / 2, -40, 900);
    g.addColorStop(0, "rgba(201,168,106,.24)");
    g.addColorStop(1, "rgba(201,168,106,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, c.height);
    text("Ringzeit", 72, 108, 34, "#C9A86A", 700);
    text(T.title, 72, 178, 66, "#ECE8E1", 800);
    wrap(out.head, 26, 500, W - 144, 1).forEach((ln) => text(ln, 72, 228, 26, "#8C9099", 500));
    [
      [d.own, T.own, "#D9545C"],
      [d.club, T.clubN, "#6F9FE0"],
      [d.mins, T.mins, "#ECE8E1"],
      [d.rpe, T.rpe, "#C9A86A"],
    ].forEach(([v, k, col], i) => {
      const X = 72 + i * 240;
      x.fillStyle = "#15171C";
      box(X, 272, 216, 150, 28);
      x.fill();
      text(String(v), X + 26, 360, 60, col, 700);
      text(k, X + 26, 400, 19, "#8C9099", 500);
    });
    ops.forEach((o) => {
      if (o[0] === "•dot") {
        x.fillStyle = o[1];
        x.beginPath();
        x.arc(84, o[2] - 9, 6, 0, 7);
        x.fill();
      } else text(o[0], o[1], o[2], o[3], o[4], o[5]);
    });
    [
      ["#D9545C", T.ownShort],
      ["#6F9FE0", T.clubShort],
    ].forEach(([col, k], i) => {
      x.fillStyle = col;
      x.beginPath();
      x.arc(84 + i * 200, legendY - 8, 7, 0, 7);
      x.fill();
      text(k, 100 + i * 200, legendY, 22, "#8C9099", 500);
    });
    return c;
  }
  function shareImage() {
    const c = summaryCanvas(),
      name = `${APP_ID}-${t("sum").file}-${iso(today())}.png`,
      fallback = `<img src="${c.toDataURL("image/png")}" alt="" style="width:100%;border-radius:14px"><span class="sub">${t("longPress")}</span>`;
    if (c.toBlob) c.toBlob((blob) => offerFile(name, blob, fallback), "image/png");
    else openSheet({ kind: "show", title: name, html: fallback });
  }
  function copyText(txt, fallbackTitle) {
    const fb = () =>
      openSheet({
        kind: "show",
        title: fallbackTitle,
        html: `<textarea id="showTxt" readonly style="min-height:220px">${esc(txt)}</textarea><button type="button" class="btn sec" data-copy="showTxt">${t("copyBtn")}</button>`,
      });
    try {
      navigator.clipboard.writeText(txt).then(() => toast(t("copied")), fb);
    } catch (e) {
      fb();
    }
  }
  function renderTabs() {
    const tab = ([k, l]) =>
      `<button type="button" data-tab="${k}" ${ui.tab === k ? 'aria-current="page"' : ""}>${ICONS[k]}<span>${t(l)}</span></button>`;
    // the free timer opens over the current view, so it is a button rather than a tab
    document.getElementById("tabs").innerHTML =
      [
        ["week", "tabWeek"],
        ["session", "tabSession"],
      ]
        .map(tab)
        .join("") +
      `<button type="button" class="tabft" data-ftx="open" aria-label="${t("ft").title}"><i>${ICO_T}</i><span>${t("tabTimer")}</span></button>` +
      [
        ...(simpleView() ? [] : [["test", "tabTest"], ["log", "tabLog"]]),
        ["profile", "tabProfile"],
      ]
        .map(tab)
        .join("");
  }
  function render(enter) {
    loadCache = {};
    const app = document.getElementById("app");
    if (enter && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      app.classList.remove("enter");
      void app.offsetWidth; // restart the entrance animation
      app.classList.add("enter");
      clearTimeout(render.t);
      render.t = setTimeout(() => app.classList.remove("enter"), 900);
    } else app.classList.remove("enter"); // later re-renders (toggles, timer) must not replay the entrance
    document.documentElement.lang = S.profile.lang;
    if (!ui.ft) checkBadges();
    renderTabs();
    const v = {
      week: renderWeek,
      session: renderSession,
      test: renderTest,
      log: renderLog,
      profile: renderProfile,
    }[ui.tab];
    if (ui.workout && (ui.tab !== "session" || ui.workout.ds !== ui.sel || !S.sessions[ui.sel])) closeWorkout(false);
    document.getElementById("app").innerHTML = ui.workout ? "" : v();
    document.getElementById("tabs").hidden = !!ui.workout;
    renderWorkout();
    if (ui.tab === "session") markRounds(false);
    else ui.focus = false;
    renderFocus();
    renderOnb();
  }

