  /* ============ First steps: a small checklist on Today that ticks itself off (like onboarding lists in Duolingo or Notion) ============ */
  /* key, done?, where the tap leads (tab + element to highlight, or an action) */
  function starterSteps() {
    const p = S.profile;
    return [
      {
        k: "profile",
        done: !!p.birthYear && p.days.length > 0,
        tab: "profile",
        sec: "me",
        sel: "#pBirth",
      },
      {
        k: "club",
        done: !!(p.club && p.club.days && p.club.days.length),
        tab: "profile",
        sec: "train",
        sel: "[data-cday]",
      },
      { k: "session", done: S.log.some(own), tab: "session" },
      { k: "timer", done: (p.ftRounds || 0) > 0, act: "timer" },
      { k: "test", done: S.tests.length > 0, tab: "test", view: "fit" },
      {
        k: "combo",
        done: (p.myc || []).length > 0,
        tab: "profile",
        sec: "app",
        sel: "[data-cact=new]",
      },
    ];
  }
  function starterHtml() {
    if (S.profile.starterHide) return "";
    const st = starterSteps(),
      ok = st.filter((x) => x.done).length,
      L = t("starter");
    if (ok === st.length) return "";
    return `<div class="starter"><div class="sthead"><div><b>${L.title}</b><span class="sub">${L.count(ok, st.length)}</span></div><button type="button" class="btn ghost" data-act2="starterhide">${L.hide}</button></div>
        <div class="pbar"><span style="width:${Math.round((100 * ok) / st.length)}%"></span></div>
        ${st
          .map((x, i) => [x, i])
          // compact: only the next open step; all steps after "show all"
          .filter(([x], j, arr) => ui.starterAll || arr.findIndex(([y]) => !y.done) === j)
          .map(
            ([x, i]) =>
              `<button type="button" class="strow${x.done ? " done" : ""}" data-start="${i}" ${x.done ? "disabled" : ""}><i>${x.done ? "✓" : ""}</i><span><b>${L.steps[x.k][0]}</b><small>${L.steps[x.k][1]}</small></span>${x.done ? "" : '<span class="chev">›</span>'}</button>`,
          )
          .join("")}<button type="button" class="btn ghost stall" data-act2="starterall">${ui.starterAll ? L.less : L.all(st.length)}</button></div>`;
  }
  function starterGo(i) {
    const x = starterSteps()[i];
    if (!x) return;
    if (x.act === "timer") return openFt();
    if (x.tab === "session") ui.sel = nextTrainingDate();
    if (x.view) ui.testView = x.view;
    if (x.tab === "profile") ui.profSec = x.sec || null;
    // the year of birth sits in the folded "more" part of the training section
    ui.tab = x.tab;
    if (x.tab !== "profile") draft = null;
    render(true);
    window.scrollTo(0, 0);
    if (x.sel)
      setTimeout(() => {
        const el = document.querySelector(x.sel),
          box = el && (el.closest(".field") || el);
        if (!box) return;
        box.scrollIntoView({
          block: "center",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
        box.classList.add("sthl");
        setTimeout(() => box.classList.remove("sthl"), 2200);
      }, 120);
  }

