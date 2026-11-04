  /* ============ My combos: combos from club training, mixed into own sessions ============ */
  const MYC_GROUPS = {
    hand: ["jab", "cross", "jabb", "crossb", "hook", "hookb", "upper"],
    kick: [
      "front",
      "round",
      "roundh",
      "side",
      "back",
      "hookk",
      "axe",
      "brazil",
      "shook",
      "tornado",
      "sweep",
      "lowk",
      "knee",
      "jknee",
    ],
    def: ["slip", "step", "block"],
  };
  /* techniques the discipline allows: low kicks only in kick light and K1, knees only in K1 */
  const discOk = (x, disc = S.profile.disc) =>
    x === "lowk" ? disc === "kl" || disc === "k1" : x === "knee" || x === "jknee" ? disc === "k1" : true;
  function myCombos(kind) {
    const p = S.profile,
      ka = kneeAnk();
    return (p.myc || [])
      .filter((m) => m.on && m.c && m.c.length >= 2)
      .map((m) => m.c)
      .filter(
        (c) =>
          c.every((x) => TECH[x] && discOk(x)) &&
          !(ka && c.some((x) => RISKY.has(x))) &&
          !(young() && c.includes("back")) &&
          !(
            kind === "bag" &&
            (p.limits.includes("wrist") || p.limits.includes("shoulder")) &&
            c.some((x) => !KICKS.has(x) && STRIKE.has(x))
          ),
      );
  }
  function mycSheet() {
    const cb = ui.cb,
      lg = S.profile.lang === "de" ? 0 : 1,
      L = t("myc");
    const tile = (x) =>
      `<button type="button" class="ctile${KICKS.has(x) ? " k" : ""}" data-ctech="${x}">${esc(TECH[x][lg])}</button>`;
    const o = {
      kind: "raw",
      myc: 1,
      title: cb.id ? L.edit : L.new,
      html: `<div class="cprev">${cb.c.length ? comboHtml(cb.c) : `<span class="sub">${L.tap}</span>`}</div>
          <div class="acts2"><button type="button" class="btn sec" data-cact="undo" ${cb.c.length ? "" : "disabled"}>⌫ ${L.undo}</button><button type="button" class="btn sec" data-cact="clear" ${cb.c.length ? "" : "disabled"}>${L.clear}</button></div>
          ${Object.entries(MYC_GROUPS)
            .map(
              ([g, xs]) =>
                `<div class="lab">${L.groups[g]}</div><div class="ctiles">${xs
                  .filter((x) => discOk(x))
                  .map(tile)
                  .join("")}</div>`,
            )
            .join("")}
          <label class="lab" for="cName">${L.name}</label><input id="cName" type="text" maxlength="40" value="${esc(cb.name || "")}" placeholder="${L.namePh}">
          <div class="acts2">${cb.id ? `<button type="button" class="btn sec" data-cact="del">${t("del")}</button>` : ""}<button type="button" class="btn" data-cact="save" ${cb.c.length >= 2 ? "" : "disabled"}>${t("save")}</button></div>`,
    };
    if (ui.sheet && ui.sheet.myc) {
      Object.assign(ui.sheet, o);
      renderSheet();
    } else openSheet(o);
  }
  function mycHtml() {
    const L = t("myc"),
      list = S.profile.myc || [];
    return `<div class="panel"><div class="field"><span class="lab">${L.title}</span><span class="sub">${L.hint}</span>
        ${list
          .map(
            (m) =>
              `<div class="mycrow"><button type="button" class="mycbody" data-cedit="${m.id}">${m.name ? `<b>${esc(m.name)}</b>` : ""}${comboHtml(m.c)}</button><button type="button" class="tog ${m.on ? "on" : ""}" data-con="${m.id}" aria-label="${L.active}" aria-pressed="${!!m.on}"></button></div>`,
          )
          .join("")}
        <button type="button" class="btn sec" data-cact="new">＋ ${L.new}</button></div></div>`;
  }

