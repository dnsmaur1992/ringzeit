  /* ============ App tour: spotlight walk-through on the first start (restartable in the profile) ============ */
  /* tab = view to show, sel = element to highlight, up = enlarge to this ancestor; no match → centred card */
  const TOUR = [
    { k: "intro" },
    { k: "today", tab: "week", sel: ".today" },
    { k: "timer", tab: "session", sel: "[data-workout=start]" },
    { k: "ftimer", tab: "week", sel: "#tabs .tabft" },
    { k: "prof", tab: "week", sel: "#tabs [data-tab=profile]" },
    { k: "end" },
  ];
  // Block user scrolling without locking the document: scrollIntoView must
  // still position the highlighted element when moving between tour steps.
  function preventTourScroll(e) {
    if (ui.tour != null && e.cancelable) e.preventDefault();
  }
  document.addEventListener("touchmove", preventTourScroll, {
    passive: false,
    capture: true,
  });
  document.addEventListener("wheel", preventTourScroll, {
    passive: false,
    capture: true,
  });
  document.addEventListener(
    "keydown",
    (e) => {
      if (ui.tour == null || e.ctrlKey || e.metaKey || e.altKey) return;
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
        "Spacebar",
      ];
      if (!scrollKeys.includes(e.key)) return;
      // Space must continue to activate the focused tour button.
      if ((e.key === " " || e.key === "Spacebar") && e.target.closest?.("#tour button")) return;
      preventTourScroll(e);
    },
    { capture: true },
  );
  function startTour() {
    ui.tour = 0;
    ui.sheet = null;
    renderSheet();
    showTour();
  }
  function endTour() {
    ui.tour = null;
    document.getElementById("tour").hidden = true;
    S.profile.toured = true;
    store.save();
    ui.tab = "week";
    render(true);
    window.scrollTo(0, 0);
  }
  function showTour() {
    const st = TOUR[ui.tour],
      tx0 =
        st.k === "intro" && isTkdMain()
          ? [t("tour").intro[0], t("tourIntroTkd")]
          : st.k === "prof" && isTkdMain()
            ? [t("tour").prof[0], t("tourProfTkd")]
            : st.k === "intro" && isBoxMain()
              ? [t("tour").intro[0], t("tourIntroBox")]
              : st.k === "test" && isBoxMain()
                ? t("tourTestBox")
                : t("tour")[st.k],
      // the simple view has no test/history tabs – they live in the profile then
      tx =
        st.k === "prof" && simpleView()
          ? [
              tx0[0],
              tx0[1]
                .replace("Fitnesstest und Verlauf findest du unten in der Leiste.", "Fitnesstest und Verlauf findest du hier ganz unten.")
                .replace("Fitness test and history are in the bar at the bottom.", "Fitness test and history are at the very bottom here."),
            ]
          : tx0,
      el = document.getElementById("tour");
    ui.focus = false;
    if (st.tab && (ui.tab !== st.tab || (st.tab === "profile" && (ui.profSec || null) !== (st.sec || null)))) {
      ui.tab = st.tab;
      if (st.tab === "profile") ui.profSec = st.sec || null;
      if (st.tab === "session") ui.sel = nextTrainingDate();
      render();
    }
    let target = st.sel ? document.querySelector(st.sel) : null;
    if (target && st.up) target = target.closest(st.up) || target;
    const last = ui.tour === TOUR.length - 1,
      basics =
        st.k === "intro" ? `<div class="tbasic"><b>${t("tourBasicsT")}</b><span>${t(isTkdMain() ? "tourBasicsTkd" : isBoxMain() ? "tourBasicsBox" : "tourBasics")}</span></div>` : "";
    el.innerHTML = `<div class="tspot"></div><div class="tcard" role="dialog" aria-modal="true" aria-labelledby="tourT"><div class="tstep">${ui.tour + 1} / ${TOUR.length}</div><h3 id="tourT">${tx[0]}</h3><p>${tx[1]}</p>${basics}<div class="tacts">${last ? "" : `<button type="button" class="btn ghost" data-tour="skip">${t("tourSkip")}</button>`}<span></span>${ui.tour ? `<button type="button" class="btn sec" data-tour="back">${t("onbBack")}</button>` : ""}<button type="button" class="btn" data-tour="${last ? "done" : "next"}">${last ? t("onbGo") : t("onbNext")}</button></div></div>`;
    el.hidden = false;
    el.classList.toggle("dim", !target);
    if (target) target.scrollIntoView({ block: "center", behavior: "auto" });
    else window.scrollTo(0, 0);
    requestAnimationFrame(() => placeTour(target));
  }
  function placeTour(target) {
    const el = document.getElementById("tour");
    if (el.hidden) return;
    const spot = el.querySelector(".tspot"),
      card = el.querySelector(".tcard"),
      H = innerHeight;
    if (!target) {
      spot.style.display = "none";
      card.style.top = Math.max(16, (H - card.offsetHeight) / 2) + "px";
      return;
    }
    const r = target.getBoundingClientRect(),
      pad = 6,
      top = Math.max(8, r.top - pad),
      bottom = Math.min(H - 8, r.bottom + pad);
    Object.assign(spot.style, {
      display: "block",
      left: Math.max(6, r.left - pad) + "px",
      top: top + "px",
      width: Math.min(innerWidth - 12, r.width + pad * 2) + "px",
      height: Math.max(24, bottom - top) + "px",
    });
    const ch = card.offsetHeight,
      below = H - bottom - 14 >= ch;
    card.style.top = (below ? bottom + 14 : Math.max(16, top - 14 - ch)) + "px";
  }
  window.addEventListener("resize", () => ui.tour != null && showTour());

