/* Teil 7a – Browserprüfung des ausgelieferten Stands (Repo-Wurzel: index.html, sw.js, Icons) mit Playwright/Chromium.
   node tests/final-browser.cjs [views|off|onb|all]
   views: alle Hauptseiten je Sport/Stil/Sprache bei 390 px (kein undefined/NaN, kein Seitwärtsscrollen, keine JS-Fehler)
   off:   Service Worker aktiv, Cache nur mit Präfix ringzeit- (nicht ringzeit-dev-), Start ohne Server nach dem ersten Besuch
   onb:   frisches Profil (ohne Daten) – Inbetriebnahme je Hauptsport bis zur App */
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const srv = http.createServer((q, r) => { let u = q.url.split("?")[0]; if (u === "/") u = "/index.html"; const f = path.join(root, u); fs.readFile(f, (e, d) => { if (e) { r.statusCode = 404; r.end(); } else { r.setHeader("content-type", types[path.extname(f)] || "application/octet-stream"); r.end(d); } }); }).listen(8790);
const ok = (n, c, x = "") => console.log((c ? "OK     " : "BEFUND ") + n + (x ? " – " + x : ""));
const seed = (sport, style, lang) => ({ v: 2, profile: { lang, sport, disc: "lc", focus: "bal", level: 1, age: "adult", birthYear: 1995, days: [0, 1, 2, 3, 4, 5, 6], minutes: 60, comps: [{ id: "c1", date: "2026-11-06", kind: "comp", name: "Test" }], club: { days: [] }, limits: [], onboarded: true, seasonOff: false, toured: true, ackSafe: "2026-11-02", tkd: { style, wt: "k4", itf: "k5", hist: [], exams: [] } }, sessions: {}, log: [], weights: [], tests: [], ov: {}, cov: {}, pauses: [], ko: "" });
(async () => {
  const ONLY = process.argv[2] || "all";
  const b = await chromium.launch();
  if (ONLY === "all" || ONLY === "views") {
  // 1. screens per sport/style/language at 390 px
  for (const [sport, style] of [["kickboxing", "wt"], ["boxing", "wt"], ["taekwondo", "wt"], ["taekwondo", "itf"]])
    for (const lang of ["de", "en"]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", locale: lang === "de" ? "de-DE" : "en-US" });
      const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
      await p.addInitScript((s) => { localStorage.setItem("ringzeit.v1", JSON.stringify(s)); }, seed(sport, style, lang));
      await p.goto("http://localhost:8790/", { timeout: 20000 }); await p.waitForTimeout(3500);
      await p.evaluate(() => document.querySelectorAll("#tour,.win").forEach((x) => x.remove()));
      const res = [];
      for (const [tab, sec] of [["week", null], ["session", null], ["test", null], ["log", null], ["profile", null], ["profile", "me"], ["profile", "train"], ["profile", "goals"], ["profile", "life"], ["profile", "guide"], ["profile", "app"]]) {
        const r = await Promise.race([
          p.evaluate(([tab, sec]) => {
            ui.tab = tab; ui.profSec = sec; if (tab === "session") ui.sel = nextTrainingDate();
            try { render(); } catch (e) { return "EXC " + e.message; }
            const txt = document.body.innerText, bad = txt.match(/undefined|NaN|\[object Object\]/), wide = document.documentElement.scrollWidth > 391;
            return (bad ? "TEXT '" + bad[0] + "' " : "") + (wide ? "SCROLL " + document.documentElement.scrollWidth : "");
          }, [tab, sec]),
          new Promise((z) => setTimeout(() => z("TIMEOUT"), 10000)),
        ]);
        res.push([tab + "/" + (sec || ""), r]);
      }
      const badv = res.filter((x) => x[1]);
      ok(`Ansichten ${sport}${sport === "taekwondo" ? "/" + style : ""} ${lang} (11 Seiten, 390 px)`, !badv.length && !errs.length, badv.map((x) => x.join(": ")).join("; ") + (errs.length ? " JS: " + errs.join(" | ") : ""));
      await ctx.close();
    }
  }
  if (ONLY === "all" || ONLY === "onb") {
  for (const sport of ["kickboxing", "boxing", "taekwondo"]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", locale: "de-DE" });
    const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.goto("http://localhost:8790/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(3500);
    const steps = [];
    await p.evaluate(() => { const l = document.getElementById("loader"); if (l) l.click(); });
    await p.waitForTimeout(800);
    for (let i = 0; i < 25; i++) {
      const st = await p.evaluate((sport) => {
        const o = document.getElementById("onb");
        if (!o || o.hidden || !o.innerHTML.trim() || getComputedStyle(o).display === "none") return "done";
        const txt = o.innerText.replace(/\s+/g, " ").slice(0, 60);
        const pick = o.querySelector(`[data-osport="${sport}"]`) && !o.querySelector(`[data-osport="${sport}"][aria-pressed="true"]`) ? o.querySelector(`[data-osport="${sport}"]`) : null;
        if (pick) { pick.click(); return "sport " + txt; }
        // choose the first option in unanswered segments, then the primary button
        o.querySelectorAll(".seg").forEach((sg) => { if (!sg.querySelector('[aria-pressed="true"]')) { const bt = sg.querySelector("button"); if (bt) bt.click(); } });
        // the date of birth is required (13.11.2026): "next" stays disabled until it is complete
        const dt = o.querySelector('input[type="date"]');
        if (dt && !dt.value) {
          const nx = o.querySelector('[data-onb="next"]');
          if (nx && !nx.disabled) return "next enabled without date of birth";
          dt.value = "1995-03-14"; dt.dispatchEvent(new Event("input", { bubbles: true })); dt.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const inp = o.querySelector('input[type="number"], input#oBy, input[inputmode="numeric"]'); if (inp && !inp.value) { inp.value = "1995"; inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); }
        const btn = [...o.querySelectorAll("button.btn:not(.sec):not(.ghost)")].pop();
        if (!btn) return "no button: " + txt;
        if (window.__last === btn) return "same button " + txt;
        window.__last = btn;
        btn.click(); return txt + " [" + (btn.dataset.onb || btn.id || "") + "]";
      }, sport);
      steps.push(st);
      if (st === "done" || st.startsWith("no button")) break;
      await p.waitForTimeout(900);
    }
    const res = await p.evaluate(() => ({ birth: S.profile.birth, sport: S.profile.sport, onb: !!S.profile.onboarded, txt: /undefined|NaN/.test(document.body.innerText), sess: Object.keys(S.sessions).length, keys: Object.keys(S.profile).filter(k=>/onb|ack|tour/i.test(k)).map(k=>k+'='+S.profile[k]).join(','), uionb: !!ui.onb, tour: !document.getElementById('tour')?.hidden }));
    ok(`Inbetriebnahme frisches Profil ${sport}`, res.sport === sport && res.birth === "1995-03-14" && !res.uionb && !res.txt && res.sess > 0 && !errs.length, `${steps.length} Schritte${errs.length ? "; JS: " + [...new Set(errs)].join(" | ") : ""}`);
    await ctx.close();
  }
  }
  // 2. offline start and update via the service worker
  if (ONLY === "all" || ONLY === "off") {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const lg = (...x) => console.error("·", ...x);
    await p.addInitScript((s) => { if (!localStorage.getItem("ringzeit.v1")) localStorage.setItem("ringzeit.v1", JSON.stringify(s)); }, seed("taekwondo", "wt", "de"));
    await p.goto("http://localhost:8790/", { waitUntil: "domcontentloaded", timeout: 15000 }); lg("loaded");
    await p.waitForTimeout(3000);
    const sw = await p.evaluate(() => Promise.race([navigator.serviceWorker.getRegistration().then((r) => (r ? (r.active ? "active" : r.installing ? "installing" : "waiting") : "none")), new Promise((z) => setTimeout(() => z("timeout"), 5000))])); lg("sw", sw);
    await p.waitForTimeout(3000);
    const caches1 = await p.evaluate(() => caches.keys()); lg("caches", caches1);
    const reg2 = await p.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => (r ? (r.active ? "active" : "pending") : "none"))); lg("sw2", reg2);
    srv.close(); srv.closeAllConnections && srv.closeAllConnections(); lg("Server gestoppt");
    let offOk = false, err = "";
    const p2 = await ctx.newPage();
    try { await p2.goto("http://localhost:8790/", { waitUntil: "domcontentloaded", timeout: 10000 }); await p2.waitForTimeout(2500); offOk = await p2.evaluate(() => typeof render === "function" && document.body.innerText.length > 200); } catch (e) { err = e.message.split("\n")[0]; }
    lg("offline", offOk, err);
    ok("Start ohne Server nach erstem Besuch (Service Worker)", offOk, `SW ${sw}/${reg2}; ${err}`);
    ok("Cache-Name nur stabile App", caches1.length > 0 && caches1.every((c) => c.startsWith("ringzeit-") && !c.startsWith("ringzeit-dev-")), caches1.join(","));
    await ctx.close();
  }
  await b.close();
  try { srv.close(); } catch (e) {}
})();
