  /* ============ Success moments and timer splashes ============ */
  const CHECK_SVG = `<div class="wcheck" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="c" cx="60" cy="60" r="52"/><path class="k" d="M37 62l15 15 31-33"/>${[
    0, 45, 90, 135, 180, 225, 270, 315,
  ]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<line class="ray" x1="${(60 + Math.cos(r) * 64).toFixed(1)}" y1="${(60 + Math.sin(r) * 64).toFixed(1)}" x2="${(60 + Math.cos(r) * 84).toFixed(1)}" y2="${(60 + Math.sin(r) * 84).toFixed(1)}"/>`;
    })
    .join("")}</svg></div>`;
  const FLAME_SVG =
    '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M9 1c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill="#E0914A"/><path d="M9 11c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 1.5-2.5 0 1 .5 1.5 1 1.5 0-1.5 0-2.5.5-4z" fill="#F6D27A"/></svg>';
  /* big centred text with a flash at round start / round end; a short vibration where supported */
  function timerFx(kind, text) {
    try {
      navigator.vibrate && navigator.vibrate(kind === "go" ? 80 : [50, 70, 50]);
    } catch (e) {}
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.createElement("div");
    el.className = "tfx " + kind;
    el.innerHTML = `<i></i><b>${esc(text)}</b>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
    if (kind === "done") setTimeout(() => celebrate(innerWidth / 2, innerHeight * 0.4, 26, 110), 150);
  }
  /* counts a number up from 0 */
  function countUp(el, to, ms = 900) {
    const t0 = performance.now(),
      step = (now) => {
        const k = Math.min(1, (now - t0) / ms),
          e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(step);
      };
    requestAnimationFrame(step);
  }
  /* full-screen summary after logging a session: stats, week ring, streak, new badges */
  function showWin(e) {
    const W = t("win"),
      reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    ui.win = true;
    checkBadges();
    const fresh = (ui.bdgQueue || [])
      .splice(0)
      .map((id) => BADGES.find((b) => b[0] === id))
      .filter(Boolean);
    const mon = monday(parse(e.date)),
      wp = weekPlan(mon),
      goal = Math.max(wp.planned, wp.done, 1),
      before = Math.max(0, wp.done - 1),
      full = wp.planned > 0 && wp.done >= wp.planned,
      streak = weekStreak(),
      sess = S.sessions[e.date],
      rb = own(e) && sess && roundBlock(sess),
      nEx = own(e) && sess ? sess.blocks.reduce((a, b) => a + b.items.length, 0) : 0,
      stats = [
        [e.minutes, W.min],
        rb ? [e.completedRounds ?? rb.items.length, W.rounds] : nEx ? [nEx, W.ex] : null,
        [e.rpe, "RPE"],
      ].filter(Boolean),
      ownN = S.log.filter(own).length,
      hours = Math.round(S.log.reduce((a, x) => a + (x.minutes || 0), 0) / 60),
      bi = own(e) ? blockRaw(e.date) : null,
      C = 2 * Math.PI * 32,
      title = own(e) ? rnd(t("cheers")) : W.club,
      sub = `${own(e) ? t("types")[e.type] || "" : t("clubKinds")[e.ck] || t("club")} · ${fmtDate(e.date)}`;
    const el = document.createElement("div");
    el.className = "win";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.style.setProperty("--tc", own(e) ? `var(--c-${e.type})` : "var(--c-V)");
    el.innerHTML = `${CHECK_SVG}<h2>${esc(title)}</h2><p class="sub">${esc(sub)}</p>
        <div class="wstats">${stats.map((x) => `<div><b data-to="${x[0]}">${reduced ? x[0] : 0}</b><small>${x[1]}</small></div>`).join("")}</div>
        <div class="wweek${full ? " full" : ""}"><div class="wring"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="7"/><circle class="arc" cx="38" cy="38" r="32" fill="none" stroke="${full ? "var(--ice)" : "var(--tc)"}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - (reduced ? wp.done : before) / goal)).toFixed(1)}" data-off="${(C * (1 - Math.min(1, wp.done / goal))).toFixed(1)}"/></svg><span>${wp.done}/${goal}</span></div>
          <div><b>${full ? W.full : mon.getTime() === monday(today()).getTime() ? W.week : `${W.weekOf} ${fmtDate(iso(mon))}`}</b>${
            full && streak
              ? `<span class="wflame">${FLAME_SVG}${esc(W.streak(streak))}</span>`
              : `<span class="sub">${esc(wp.planned > wp.done ? W.left(wp.planned - wp.done) : W.streak0)}</span>`
          }${bi ? `<span class="wblk">${t("blk").names[bi.k]} · ${t("blk").week(bi.wk)}</span>` : ""}</div></div>
        ${own(e) && sess && sess.eq.some((x) => x === "bag" || x === "pads" || x === "partner") ? `<div class="wcare">🧤 ${esc(t("guide").winCare)}</div>` : ""}
        ${fresh.length ? `<div class="wbdg">${fresh.map((b) => `<div><div class="wmed">${medalSvg(b, true, "pop")}</div><small>${W.newB}</small><b>${esc(bName(b)[0])}</b></div>`).join("")}</div>` : ""}
        <div class="wtot">${esc(W.total(ownN, hours))}</div>
        <button type="button" class="btn">${W.cont}</button>`;
    document.body.appendChild(el);
    const close = () => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 230);
      ui.win = false;
      showBadgeQueue();
    };
    el.querySelector(".btn").onclick = close;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.classList.add("in");
        const arc = el.querySelector(".wring .arc");
        arc.setAttribute("stroke-dashoffset", arc.dataset.off);
        if (!reduced)
          el.querySelectorAll("[data-to]").forEach((b) => setTimeout(() => countUp(b, +b.dataset.to), 350));
        setTimeout(() => celebrate(innerWidth / 2, 120, 22, 90), 700);
        if (full) setTimeout(() => celebrate(innerWidth / 2, innerHeight / 2, 18, 80), 1500);
      }),
    );
  }

