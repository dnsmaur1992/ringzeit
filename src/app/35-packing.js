  /* ============ Tournament packing list (the coach's list, ticked per tournament) ============ */
  function packFor(id) {
    S.profile.pack = S.profile.pack || {};
    return (S.profile.pack[id] = S.profile.pack[id] || { done: {}, extra: [] });
  }
  function packItems(id) {
    const p = packFor(id);
    return [
      ...(isTkdMain() ? t("pack")[tkdStyle() === "itf" ? "itemsItf" : "itemsWt"] : isBoxMain() ? t("pack").itemsBox : t("pack").items).map((x, i) => ({ k: "i" + i, txt: x })),
      ...p.extra.map((x, i) => ({ k: "x" + i, txt: x })),
    ];
  }
  function packCardHtml() {
    const nc = nextComp();
    if (!nc) return "";
    const dn = daysBetween(today(), parse(nc.date));
    if (dn < 0 || dn > 7) return "";
    const P = t("pack"),
      items = packItems(nc.id),
      done = items.filter((x) => packFor(nc.id).done[x.k]).length;
    return `<div class="blks" style="--bc:#C9A86A"><div class="bsrow"><span class="bico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg></span><div><b>${P.card(fmtDate(nc.date))}</b><span class="sub">${done >= items.length ? P.all : P.cardS(done, items.length)}</span></div></div><div class="acts2"><button type="button" class="btn" data-pack-open="${nc.id}">${P.open}</button></div></div>`;
  }
  function packSheetHtml(o) {
    const P = t("pack"),
      c = (S.profile.comps || []).find((x) => x.id === o.id),
      p = packFor(o.id),
      items = packItems(o.id);
    return `<h3>${P.title}${c ? ` · ${esc(fmtDate(c.date))}` : ""}</h3><p class="sub">${P.hint}${isTkdMain() ? ` ${tkdStyle() === "itf" ? P.itfNote : P.wtNote}` : isBoxMain() ? ` ${P.boxNote}` : ""}</p><div class="packl">${items
      .map(
        (x) =>
          `<button type="button" class="strow${p.done[x.k] ? " done" : ""}" data-pack="${x.k}"><i>${p.done[x.k] ? "✓" : ""}</i><span><b>${esc(x.txt)}</b></span></button>`,
      )
      .join(
        "",
      )}</div><div class="inline"><input id="packNew" type="text" maxlength="40" placeholder="${P.add}"><button type="button" class="btn sec" data-pack-add="1">${P.addBtn}</button></div><div class="acts2"><button type="button" class="btn ghost" data-pack-reset="1">${P.reset}</button><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
  }
  function guideAction(ds) {
    if (ds.guide) return openSheet({ kind: "guide", id: ds.guide, step: 0 });
    if (ds.wstep != null && ui.sheet && ui.sheet.kind === "guide") {
      ui.sheet.step = +ds.wstep;
      return renderSheet();
    }
    if (ds.packOpen) return openSheet({ kind: "pack", id: ds.packOpen });
    const o = ui.sheet;
    if (!o || o.kind !== "pack") return;
    const p = packFor(o.id);
    if (ds.pack) p.done[ds.pack] = !p.done[ds.pack];
    if (ds.packAdd) {
      const el = document.getElementById("packNew"),
        v = el && el.value.trim();
      if (v) p.extra.push(v.slice(0, 40));
    }
    if (ds.packReset) p.done = {};
    if (draft) draft.pack = S.profile.pack;
    store.save();
    render();
    renderSheet();
  }

