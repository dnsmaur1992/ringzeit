  /* ============ Loader: alternates fun facts and technique tips ============ */
  let loadIdx = Math.floor(Math.random() * 100);
  function showCard() {
    const lg = S.profile.lang,
      box = document.getElementById("factBox");
    // tips and facts follow the main sport: boxing only gets boxing items, kickboxing keeps its own (k = kickboxing only, b = boxing only, nt = punch/boxing technique: not for taekwondo)
    // taekwondo: general tips plus the tk items (tk: true = both styles, "wt"/"itf" = that style only); kickboxing and boxing never get tk items
    const isBoxMain = mainSport() === "boxing",
      isTkdMain = mainSport() === "taekwondo",
      tkOk = (x) => x.tk === true || x.tk === tkdStyle(),
      tips = TIPS.filter((x) =>
        isTkdMain ? (x.tk ? tkOk(x) : !x.k && !x.b && !x.d && !x.nt) : isBoxMain ? !x.k && !x.d && !x.tk : !x.b && !x.tk && (!x.d || x.d.includes(S.profile.disc)),
      ),
      facts = FACTS.filter((x) => (isTkdMain ? x.tk && tkOk(x) : isBoxMain ? x.b : !x.b && !x.tk));
    if (loadIdx % 2 || !facts.length) {
      const x = tips[Math.floor(loadIdx / 2) % tips.length];
      box.className = "fact tip";
      document.getElementById("factK").textContent = t("tipK");
      document.getElementById("factT").textContent = x[lg];
      document.getElementById("factS").textContent = x.b ? t("tipTrainer") : "";
    } else {
      const f = facts[Math.floor(loadIdx / 2) % facts.length];
      box.className = "fact";
      document.getElementById("factK").textContent = t("factK");
      document.getElementById("factT").textContent = f[lg];
      document.getElementById("factS").textContent = `${t("src")}: ${f.s}`;
    }
    document.getElementById("factNext").textContent = t("nextFact");
  }
  let closeLoader = null,
    loaderTimer = null,
    loaderOpened = 0;
  const LOADER_READ = 10000,
    LOADER_MAX = 10000;
  document.getElementById("factNext").onclick = (ev) => {
    ev.stopPropagation();
    loadIdx++;
    showCard();
    // each "next" gives time to read; 10 s after the screen appeared the app opens anyway
    clearTimeout(loaderTimer);
    const left = Math.max(0, loaderOpened + LOADER_MAX - Date.now());
    loaderTimer = setTimeout(() => closeLoader && closeLoader(), Math.min(LOADER_READ, left));
  };
  document.getElementById("loader").addEventListener("click", () => {
    if (closeLoader) closeLoader();
  });
  function openLoader(ms) {
    return new Promise((res) => {
      const el = document.getElementById("loader");
      el.hidden = false;
      closeLoader = () => {
        clearTimeout(loaderTimer);
        el.hidden = true;
        closeLoader = null;
        res();
      };
      loaderOpened = Date.now();
      loaderTimer = setTimeout(() => closeLoader && closeLoader(), ms);
    });
  }
  function prepLoader(titleKey) {
    document.getElementById("burst").innerHTML = burst();
    document.getElementById("loaderFig").innerHTML =
      `<svg viewBox="0 0 400 220" role="img" aria-label=""><ellipse cx="200" cy="208" rx="150" ry="10" fill="#C9A86A" opacity=".18"/>${fightPair(mainSport() === "boxing" ? "box" : mainSport() === "taekwondo" ? "kick" : loadIdx % 2 ? "box" : "kick", 14, outfitFor(mainSport()))}</svg>`;
    document.getElementById("loaderTitle").textContent = t(titleKey);
    document.getElementById("loaderHint").textContent = t("tapClose");
    showCard();
  }
  function loading(titleKey, ms = 3800) {
    loadIdx++;
    prepLoader(titleKey);
    return openLoader(ms);
  }
  /* A short burst of brass and crimson sparks from the toast position */
  function celebrate(x, y, n = 16, far = 60) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (x == null) x = window.innerWidth / 2;
    if (y == null) y = window.innerHeight - 130;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("span"),
        a = (i / n) * Math.PI * 2,
        d = far - 10 + Math.random() * far;
      el.className = "spark";
      const se = season(),
        pal = se
          ? {
              spring: ["#F6B8C8", "#8ec9a4", "#C9A86A"],
              summer: ["#1FB3C2", "#FFD23F", "#C9A86A"],
              autumn: ["#E0914A", "#C8404A", "#D9A441"],
              winter: ["#FFFFFF", "#BFD6F2", "#C9A86A"],
            }[se.k]
          : ["#C9A86A", "#C9A86A", "#C8404A"];
      el.style.cssText = `left:${x}px;top:${y}px;background:${pal[i % 3]};--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d - 30).toFixed(0)}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (el.hidden = true), 2400);
  }

