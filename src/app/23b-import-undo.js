  /* ============ Loading a backup: check first, safety copy, undo (security review 25.11.2026) ============
     A backup replaces all data. Before, a broken or crafted file could leave the app unusable with no way back.
     - The file is checked before the question (sanitizeData): what cannot be repaired is left out and the question
       says how many entries; a file without anything usable is refused.
     - Before loading, the current data is kept as a safety copy on this device (its own key, same app id).
     - Profile → App & Daten then offers "Rückgängig" (back to the data before loading) and "Verwerfen" (delete the
       copy). The next import replaces the copy. If the copy cannot be stored (storage full), the question says so. */
  const UNDO_KEY = APP_ID + ".undo.v1";
  function undoRead() {
    try {
      const o = JSON.parse(localStorage.getItem(UNDO_KEY) || "null");
      return o && o.data && o.at ? o : null;
    } catch (e) {
      return null;
    }
  }
  function undoWrite() {
    try {
      localStorage.setItem(UNDO_KEY, JSON.stringify({ at: new Date().toISOString(), data: S }));
      return true;
    } catch (e) {
      return false;
    }
  }
  function undoDrop() {
    try {
      localStorage.removeItem(UNDO_KEY);
    } catch (e) {
      /* nothing to drop */
    }
  }
  /* the file: parse, check, ask */
  function importParse(text) {
    let o;
    try {
      o = JSON.parse(text);
    } catch (e) {
      return null;
    }
    if (!o || typeof o !== "object" || o.app !== APP_ID || !o.data || typeof o.data !== "object" || !o.data.profile || typeof o.data.profile !== "object") return null;
    return o;
  }
  function importAsk(o) {
    const I = t("impSafe");
    // a trial load: how many entries cannot be repaired – nothing is changed yet
    let dropped = 0;
    try {
      hydrate(JSON.parse(JSON.stringify(o.data)));
      dropped = sanDropped;
    } catch (e) {
      return toast(t("impBad"));
    }
    const when = o.exported && !isNaN(new Date(o.exported).getTime()) ? fmtDate(iso(new Date(o.exported))) : "?";
    const load = (kept) => {
      S = hydrate(o.data);
      resumeClear();
      ui.sel = null;
      ui.setup = null;
      clearSessionTimer();
      draft = null;
      store.save(true);
      toast(kept ? I.done : t("impDone"));
      render(true);
    };
    openSheet({
      kind: "confirm",
      title: t("imp"),
      lines: [t("impConfirm")(when), I.kept, ...(dropped ? [I.dropped(dropped)] : [])],
      run: () => {
        // the safety copy right before replacing; if it cannot be stored, ask once more
        if (undoWrite()) return load(true);
        openSheet({ kind: "confirm", title: t("imp"), lines: [I.noCopy], run: () => load(false) });
      },
    });
  }
  /* Profile → App & Daten: back to the data before the last import */
  function undoPanelHtml() {
    const u = undoRead();
    if (!u) return "";
    const I = t("impSafe");
    return `<div class="panel"><div class="field"><span class="lab">${I.lbl}</span><span class="sub">${esc(I.since(fmtDate(iso(new Date(u.at))), new Date(u.at).toTimeString().slice(0, 5)))}</span><div class="acts2"><button type="button" class="btn sec" data-undo="drop">${I.drop}</button><button type="button" class="btn" data-undo="back">${I.back}</button></div></div></div>`;
  }
  function undoAction(k) {
    const I = t("impSafe"),
      u = undoRead();
    if (k === "drop") {
      undoDrop();
      toast(I.dropped0);
      return render();
    }
    if (!u) return render();
    openSheet({
      kind: "confirm",
      title: I.back,
      lines: [I.backQ],
      run: () => {
        S = hydrate(u.data);
        undoDrop();
        resumeClear();
        ui.sel = null;
        ui.setup = null;
        clearSessionTimer();
        draft = null;
        store.save(true);
        toast(I.backDone);
        render(true);
      },
    });
  }
