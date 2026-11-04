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
  /* The last 4 weeks in numbers – shared by the history tab, the text and the image summary */
  function summaryData() {
    const to = today(),
      a = iso(addDays(to, -27)),
      b = iso(to),
      L4 = S.log.filter((e) => e.date >= a && e.date <= b),
      weeks = [0, 1, 2, 3].map((k) => {
        const m = monday(addDays(to, -7 * (3 - k))),
          s0 = iso(m),
          s1 = iso(addDays(m, 6)),
          ws = S.log.filter((e) => e.date >= s0 && e.date <= s1);
        return {
          m,
          own: ws.filter(own).reduce((x, e) => x + (e.minutes || 0), 0),
          club: ws.filter((e) => !own(e)).reduce((x, e) => x + (e.minutes || 0), 0),
        };
      });
    return {
      from: a,
      to: b,
      own: L4.filter(own).length,
      club: L4.filter((e) => !own(e)).length,
      mins: L4.reduce((x, e) => x + (e.minutes || 0), 0),
      rpe: L4.length ? (L4.reduce((x, e) => x + (e.rpe || 0), 0) / L4.length).toFixed(1) : "–",
      weeks,
      test: S.tests[S.tests.length - 1],
      nc: nextComp(),
      lastC: (S.profile.comps || [])
        .filter((c) => c.result && parse(c.date) < to)
        .sort((x, y) => y.date.localeCompare(x.date))[0],
      lw: S.weights[S.weights.length - 1],
      prs: bestSets().slice(0, 3),
    };
  }
  function summaryLines() {
    const d = summaryData(),
      p = S.profile,
      T = t("sum"),
      age = ageAt();
    const out = {
      head: `${T.period(fmtDate(d.from), fmtDate(d.to))} · ${discLabel(p)} · ${t("levels")[p.level]}${age != null ? ` · ${age} ${T.years}` : ""}`,
      test: d.test
        ? `${d.test.total}/25 · ${TCATS.map((k) => `${t("cats")[k]} ${d.test.scores[k] ?? "–"}`).join(", ")} (${fmtDate(d.test.date)})`
        : T.none,
      next: T.none,
      last: d.lastC
        ? `${fmtDate(d.lastC.date)} · ${resText(d.lastC)}${d.lastC.result.bad ? ` · ${d.lastC.result.bad}` : ""}`
        : T.none,
      prs: d.prs.length ? d.prs.map((x) => `${x.name} ${x.v}`).join(" · ") : T.none,
    };
    if (d.nc) {
      const f = sportFor(p.sport).rules.format(p.disc, ageAt(parse(d.nc.date)));
      out.next = `${fmtDate(d.nc.date)}${f ? ` · ${fmtText(f)}` : ""}${d.nc.wc ? ` · −${numF(d.nc.wc)} kg` : ""}${d.lw ? ` · ${T.weightNow} ${numF(d.lw.kg)} kg` : ""}`;
    }
    return { d, out };
  }
  function summaryText() {
    const { d, out } = summaryLines(),
      T = t("sum");
    const lines = [
      `Ringzeit · ${T.title}`,
      out.head,
      "",
      `${T.own}: ${d.own}`,
      `${T.clubN}: ${d.club}`,
      `${T.mins}: ${d.mins}`,
      `${T.rpe}: ${d.rpe}`,
      "",
      `${T.weeks}:`,
      ...d.weeks.map(
        (w) => `  ${fmtDate(iso(w.m))}: ${w.own + w.club} (${T.ownShort} ${w.own} · ${T.clubShort} ${w.club})`,
      ),
      "",
      `${T.test}: ${out.test}`,
      `${T.next}: ${out.next}`,
      `${T.last}: ${out.last}`,
      `${T.prs}: ${out.prs}`,
    ];
    return lines.join("\n");
  }
  /* 1080×1350 summary card drawn on a canvas (system font, app colours) */
  function summaryCanvas() {
    const { d, out } = summaryLines(),
      T = t("sum"),
      W = 1080,
      H = 1350,
      c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d"),
      F = '-apple-system, "SF Pro Display", "Segoe UI", Roboto, sans-serif';
    const text = (str, X, Y, size, col = "#ECE8E1", w = 600, al = "left", maxW = W - 144) => {
      x.font = `${w} ${size}px ${F}`;
      x.fillStyle = col;
      x.textAlign = al;
      let s0 = String(str);
      while (s0.length > 4 && x.measureText(s0).width > maxW) s0 = s0.slice(0, -2);
      if (s0 !== String(str)) s0 = s0.slice(0, -1) + "…";
      x.fillText(s0, X, Y);
    };
    const box = (X, Y, w, h, r) => {
      x.beginPath();
      x.moveTo(X + r, Y);
      x.arcTo(X + w, Y, X + w, Y + h, r);
      x.arcTo(X + w, Y + h, X, Y + h, r);
      x.arcTo(X, Y + h, X, Y, r);
      x.arcTo(X, Y, X + w, Y, r);
      x.closePath();
    };
    x.fillStyle = "#0A0B0D";
    x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W / 2, -40, 40, W / 2, -40, 900);
    g.addColorStop(0, "rgba(201,168,106,.24)");
    g.addColorStop(1, "rgba(201,168,106,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    text("Ringzeit", 72, 108, 34, "#C9A86A", 700);
    text(T.title, 72, 178, 66, "#ECE8E1", 800);
    text(out.head, 72, 230, 30, "#8C9099", 500);
    [
      [d.own, T.own, "#D9545C"],
      [d.club, T.clubN, "#6F9FE0"],
      [d.mins, T.mins, "#ECE8E1"],
      [d.rpe, T.rpe, "#C9A86A"],
    ].forEach(([v, k, col], i) => {
      const X = 72 + i * 240;
      x.fillStyle = "#15171C";
      box(X, 272, 216, 172, 28);
      x.fill();
      text(String(v), X + 26, 372, 66, col, 700, "left", 170);
      text(k, X + 26, 412, 19, "#8C9099", 500, "left", 176);
    });
    text(T.weeks, 72, 520, 32, "#ECE8E1", 700);
    const mx = Math.max(60, ...d.weeks.map((w) => w.own + w.club)),
      base = 790,
      bh = 220;
    d.weeks.forEach((w, i) => {
      const X = 72 + i * 240 + 40,
        ho = (w.own / mx) * bh,
        hc = (w.club / mx) * bh;
      x.fillStyle = "#D9545C";
      x.fillRect(X, base - ho, 136, ho);
      x.fillStyle = "#6F9FE0";
      x.fillRect(X, base - ho - hc, 136, hc);
      text(String(w.own + w.club), X + 68, base - ho - hc - 14, 28, "#ECE8E1", 700, "center", 200);
      text(fmtDate(iso(w.m)), X + 68, base + 38, 22, "#8C9099", 500, "center", 220);
    });
    [
      ["#D9545C", T.ownShort],
      ["#6F9FE0", T.clubShort],
    ].forEach(([col, k], i) => {
      x.fillStyle = col;
      x.fillRect(72 + i * 200, 858, 22, 22);
      text(k, 104 + i * 200, 878, 24, "#8C9099", 500);
    });
    let Y = 950;
    [
      [T.test, out.test],
      [T.next, out.next],
      [T.last, out.last],
      [T.prs, out.prs],
    ].forEach(([k, v]) => {
      text(k, 72, Y, 24, "#8C9099", 500);
      text(v, 72, Y + 40, 31, "#ECE8E1", 600);
      Y += 96;
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

