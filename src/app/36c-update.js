  /* ============ Update on request (Betreiber 21.11.2026) ============
     The service worker fetches a new version in the background and uses it on the next real start – but an app on the
     home screen is often only brought back from the background, so the old version can stay for days.
     - Profil → App & Daten: "Nach Update suchen" asks the server (the browser checks sw.js past every cache). A new
       version installs, takes over by itself (skipWaiting) and the page reloads – otherwise "newest version".
     - Without a tap: when the app comes back to the foreground (at most every 30 minutes) it checks quietly; a new
       version shows a short note "Neue Version verfügbar – Neu laden" on the home page. Ignored: the next start loads it.
     Data (history, plan, settings) lives in the local storage, not in the app cache – an update never touches it; a
     running unit is saved before the reload and offered again as usual. Offline: a short message, nothing breaks. */
  const UPD_EVERY = 30 * 60 * 1000;
  let updLast = 0,
    updOwn = false;
  const updSW = () => (typeof navigator !== "undefined" && navigator.serviceWorker ? navigator.serviceWorker : null);
  function updInit() {
    const sw = updSW();
    if (!sw) return;
    // the very first install also changes the controller – that is no update
    const had = !!sw.controller;
    sw.addEventListener("controllerchange", () => {
      if (!had) return;
      if (updOwn) return updReload();
      ui.updReady = true;
      if (!ui.workout) render();
    });
    updLast = Date.now(); // the start itself already checks (registration)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - updLast > UPD_EVERY) updPoll();
    });
  }
  async function updPoll() {
    updLast = Date.now();
    try {
      const r = await updSW().getRegistration();
      if (r) await r.update();
    } catch (e) {
      /* offline or no registration: try again next time */
    }
  }
  /* the button: ask now; a new version reloads the page, otherwise say so */
  async function updCheck() {
    const U = t("upd"),
      sw = updSW();
    if (ui.updReady) return updReload();
    if (!sw) return toast(U.none);
    if (navigator.onLine === false) return toast(U.offline);
    ui.updBusy = true;
    render();
    const done = (msg) => {
      updOwn = false;
      ui.updBusy = false;
      render();
      toast(msg);
    };
    try {
      const r = await sw.getRegistration();
      if (!r) return done(U.none);
      updOwn = true;
      updLast = Date.now();
      await r.update();
      if (r.installing || r.waiting) {
        toast(U.loading);
        // the new worker takes over by itself and the page reloads (controllerchange) – a safety net after 10 s
        setTimeout(updReload, 10000);
        return;
      }
      done(U.latest);
    } catch (e) {
      done(U.offline);
    }
  }
  function updReload() {
    try {
      store.save();
      if (ui.workout && typeof resumeSave === "function") resumeSave(true);
    } catch (e) {
      /* the data is saved on every change anyway */
    }
    location.reload();
  }
  /* Profil → App & Daten */
  function updPanelHtml() {
    const U = t("upd");
    return `<div class="panel updp"><div class="field"><span class="lab">${U.lbl}</span><span class="sub">${esc(U.ver(APP_VER))}</span><span class="sub">${ui.updReady ? U.ready : U.hint}</span><div class="acts2"><button type="button" class="btn${ui.updReady ? "" : " sec"}" data-upd="${ui.updReady ? "go" : "check"}"${ui.updBusy ? " disabled" : ""}>${ui.updReady ? U.go : ui.updBusy ? U.busy : U.check}</button></div></div></div>`;
  }
  /* the home page: a short note while a new version is waiting */
  function updNoteHtml() {
    if (!ui.updReady) return "";
    const U = t("upd");
    return `<div class="note updnote"><span>${U.note}</span><button type="button" class="btn sec" data-upd="go">${U.go}</button></div>`;
  }
