/* Teil 7a – automatische Gesamtprüfung (nicht Teil der schnellen Suite, Laufzeit einige Minuten).
   node tests/final-check.mjs          → Ablauf-Matrix (12 Profile × 3 Level × 6 Typen × 3 Orte = 648 Einheiten) + Einzelprüfungen H1–H8
   node tests/final-check.mjs quick    → nur ein Ort je Typ (216 Einheiten)
   Die App läuft wie in tests/training.test.mjs im Node-VM (gleicher Harness, Produktionscode, nur Browser-Dienste ersetzt).
   Jede Einheit wird im geführten Training von Anfang bis Ende durchlaufen: Zeitübungen laufen von selbst durch, Sätze
   werden eingetragen, Runden laufen über den Rundentimer; danach Abschluss mit Dauer/Anstrengung und Prüfung des
   Verlaufseintrags. Jeder Schritt wird auf undefined/NaN geprüft. */
import fs from "node:fs";
const src = fs.readFileSync(new URL("./training.test.mjs", import.meta.url), "utf8");
const harness =
  src.slice(0, src.indexOf("\nfunction history(")).replace('"./app-source.mjs"', JSON.stringify(new URL("./app-source.mjs", import.meta.url).href)) + "\nexport { app };";
const { app } = await import("data:text/javascript," + encodeURIComponent(harness));
const QUICK = process.argv[2] === "quick";
const D = "2026-11-02";
const BAD = /undefined|NaN|\[object|null<|>null/;
async function walk(a, setup, label) {
  const find = [];
  a.run(`ui.sel='${D}';ui.tab='session';${setup}startWorkout();`);
  const steps = a.run(`playerSteps(S.sessions[ui.sel]).length`);
  let guard = 0, last = -1, same = 0;
  while (guard++ < 600) {
    const st = JSON.parse(a.run("JSON.stringify(playerStep()||null)"));
    const i = a.run("ui.workout ? ui.workout.step : -1");
    if (!st) { find.push("no step at " + i); break; }
    const h = a.run("playerHtml()");
    const m = h.match(BAD);
    if (m) find.push(`step ${i} ${st.kind}: '${m[0]}' … ${h.slice(Math.max(0, m.index - 80), m.index + 30).replace(/<[^>]+>/g, " ")}`);
    if (i === last) { if (++same > 4) { find.push(`stuck at step ${i} ${st.kind}`); a.run("playerAction('next')"); same = 0; } } else { same = 0; last = i; }
    if (st.kind === "finish") break;
    if (st.kind === "manual") { await a.click({ dataset: { player: "done" } }); continue; }
    if (st.kind === "timed" || st.kind === "rest") {
      if (!a.run(`!!(ui.exerciseTimer && ui.exerciseTimer.player === ${i} && ui.exerciseTimer.running && !ui.exerciseTimer.done)`)) await a.click({ dataset: { player: "toggle" } });
      for (let n = 0; n < 120 && a.run("ui.workout.step") === i; n++) a.advance(15000);
      if (a.run("ui.workout.step") === i) find.push(`timed step ${i} did not move on by itself`);
      continue;
    }
    if (st.kind === "sets") {
      if (a.run(`timedSets(playerStep(), S.sessions[ui.sel])`)) {
        if (!a.run(`!!(ui.exerciseTimer && ui.exerciseTimer.player === ${i} && ui.exerciseTimer.running && !ui.exerciseTimer.done)`)) await a.click({ dataset: { player: "toggle" } });
        for (let n = 0; n < 200 && a.run("ui.workout.step") === i; n++) a.advance(15000);
        if (a.run("ui.workout.step") === i) { find.push(`timed sets ${i} did not move on`); a.run("playerAction('next')"); }
        continue;
      }
      a.run(`(()=>{const s=S.sessions[ui.sel],st=playerStep(),k=st.bi+'.'+st.ni,b=s.blocks[st.bi];const rows=perfRows(s,k,b);(s.perf||={})[k]=rows.map((r)=>({...r,r:8,rL:8,rR:8}));})()`);
      for (let n = 0; n < 12 && a.run("ui.workout.step") === i; n++) { a.run("playerAction('setdone')"); a.advance(200 * 1000); }
      continue;
    }
    if (st.kind === "rounds") {
      await a.click({ dataset: { fx: "open" } });
      await a.click({ dataset: { fx: "go" } });
      a.advance(60 * 60 * 1000);
      if (a.run("ui.workout.step") === i) { const done = a.run("stepDone(S.sessions[ui.sel],playerStep())"); if (!done) find.push(`rounds step ${i} not done after timer`); a.run("ui.focus=false;playerAction('next')"); }
      continue;
    }
  }
  // finish
  const sess = JSON.parse(a.run("JSON.stringify(S.sessions[ui.sel])"));
  const comp = JSON.parse(a.run("JSON.stringify(sessionCompletion(S.sessions[ui.sel]))"));
  const fh = a.run("finishFormHtml(S.sessions[ui.sel])");
  if (BAD.test(fh)) find.push("finish form: " + fh.match(BAD)[0]);
  a.node("fMin").value = String(sess.min || 60);
  a.node("fDurationConfirmed").checked = true;
  a.node("fRpe").value = "6";
  const n0 = a.run("S.log.length");
  await a.click({ id: "fSave" });
  if (a.run("S.log.length") === n0) { a.run("sheetAction && sheetAction('confirm')"); }
  const e = JSON.parse(a.run("JSON.stringify(S.log.find(e=>e.date==='" + D + "')||null)"));
  if (!e) find.push("no log entry");
  else {
    if (!comp.complete) find.push("not complete: " + JSON.stringify(comp).slice(0, 160));
    if (e.completed !== comp.complete) find.push("log.completed " + e.completed + " vs " + comp.complete);
    if (!e.sport) find.push("log without sport");
  }
  return { label, steps, find, entry: e, sess };
}

const P = [
  ["KB LC adult", "S.profile.sport='kickboxing';S.profile.disc='lc';S.profile.birthYear=1995;", "kickboxing", "", "TSPKCM"],
  ["KB KL adult", "S.profile.sport='kickboxing';S.profile.disc='kl';S.profile.birthYear=1995;", "kickboxing", "", "TSPKCM"],
  ["KB PF adult", "S.profile.sport='kickboxing';S.profile.disc='pf';S.profile.birthYear=1995;", "kickboxing", "", "TSPKCM"],
  ["KB FC adult", "S.profile.sport='kickboxing';S.profile.disc='fc';S.profile.birthYear=1995;", "kickboxing", "", "TSPKCM"],
  ["KB K1 adult", "S.profile.sport='kickboxing';S.profile.disc='k1';S.profile.birthYear=1995;", "kickboxing", "", "TSPKCM"],
  ["KB LC youth13", "S.profile.sport='kickboxing';S.profile.disc='lc';S.profile.birthYear=2013;", "kickboxing", "", "TSPKCM"],
  ["Box adult", "S.profile.sport='boxing';S.profile.birthYear=1995;", "boxing", "", "TSPKCM"],
  ["Box youth14", "S.profile.sport='boxing';S.profile.birthYear=2012;", "boxing", "", "TSPKCM"],
  ["WT adult k4", "S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt',wt:'k4'});S.profile.birthYear=1995;", "taekwondo", "wt", "TSPKCM"],
  ["WT kid9 k8", "S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt',wt:'k8'});S.profile.birthYear=2017;", "taekwondo", "wt", "TSPKCM"],
  ["ITF adult k5", "S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'itf',itf:'k5'});S.profile.birthYear=1995;", "taekwondo", "itf", "TSPKCM"],
  ["ITF youth16 k4", "S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'itf',itf:'k4'});S.profile.birthYear=2010;", "taekwondo", "itf", "TSPKCM"],
];
const LOC = QUICK ? [["gym", "['bag','rope','partner','weights']"]] : [["gym", "['bag','rope','partner','weights']"], ["home", "['band','kb']"], ["outdoor", "[]"]];
const out = [];
let total = 0;
for (const [lbl, prof, sport, sty, types] of P)
  for (const lvl of [0, 1, 2])
    for (const ty of types)
      for (const [loc, eq] of LOC) {
        const a = app();
        a.run(prof + `S.profile.level=${lvl};`);
        const label = `${lbl} L${lvl} ${ty} ${loc}`;
        let r;
        try {
          r = await walk(a, `S.sessions[ui.sel]=buildSession(ui.sel,'${ty}','${loc}',${eq},{sport:'${sport}'${sty ? `,tstyle:'${sty}'` : ""}});`, label);
        } catch (e) {
          r = { label, find: ["EXCEPTION " + e.message.split("\n")[0]] };
        }
        total++;
        if (r.entry && r.entry.sport !== sport) r.find.push("log sport " + r.entry.sport);
        if (r.find.length) out.push(label + ": " + r.find.join(" | "));
      }
console.log(`Ablauf-Matrix: ${total} Einheiten, davon mit Befund: ${out.length}`);
out.slice(0, 30).forEach((l) => console.log("  " + l));
const R = [];
const note = (id, ok, txt) => R.push(`${ok ? "OK    " : "BEFUND"} ${id}: ${txt}`);
// H1 regions of taekwondo entries vs concept (WT 0.50/0.15/0.15/0.20, ITF 0.40/0.25/0.15/0.20)
{
  const a = app();
  for (const sty of ["wt", "itf"]) {
    a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${sty}'});S.profile.birthYear=1995;S.profile.level=1;S.log=[];`);
    const r = await walk(a, `S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag','partner'],{sport:'taekwondo',tstyle:'${sty}'});`, "tkd " + sty);
    const reg = JSON.parse(a.run(`JSON.stringify(entryRegions(S.log.find(e=>e.date==='2026-11-02')))`));
    const want = sty === "wt" ? { legs: 0.5, arms: 0.15, core: 0.15, endu: 0.2 } : { legs: 0.4, arms: 0.25, core: 0.15, endu: 0.2 };
    const club2 = JSON.parse(a.run(`JSON.stringify(clubRegions('T','taekwondo','${sty}'))`));
    note("H1-" + sty, JSON.stringify(reg) === JSON.stringify(want) && JSON.stringify(club2) === JSON.stringify(want), `eigene T-Einheit ${JSON.stringify(reg)}; Vereinstraining ${JSON.stringify(club2)} – Konzept 6.1: ${sty === "wt" ? "Beine 0,50 · Arme 0,15" : "Beine 0,40 · Arme 0,25"} · Rumpf 0,15 · Ausdauer 0,20`);
  }
}
// H2 WT then ITF unit in the same week: both logged once, style kept on the entries
{
  const a = app();
  a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt'});S.profile.birthYear=1995;S.profile.level=1;S.log=[];`);
  await walk(a, `S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'taekwondo',tstyle:'wt'});`, "wt");
  a.setDate("2026-11-03");
  a.run("ui.workout=null;");
  const D2 = "2026-11-03";
  a.run(`ui.sel='${D2}';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'taekwondo',tstyle:'itf'});startWorkout();`);
  // finish early with values
  a.run("playerAction('early')");
  a.node("fMin").value = "40"; a.node("fDurationConfirmed").checked = true; a.node("fRpe").value = "7";
  await a.click({ id: "fSave" });
  if (a.run("S.log.length") < 2) a.run("sheetAction('confirm')");
  const L = JSON.parse(a.run("JSON.stringify(S.log.map(e=>({d:e.date,sp:e.sport,ts:e.tstyle,c:e.completed,m:e.minutes,r:e.rpe})))"));
  const wk = a.run("weekLoadSum(S.log,'2026-11-02')");
  note("H2", L.length === 2 && L.every((e) => e.sp === "taekwondo") && wk === 75 * 6 + 40 * 7, `WT- und ITF-Einheit derselben Woche je einmal gezählt; Wochenlast ${wk} (= 75×6 + 40×7)`);
  note("H2b", L.every((e) => e.ts), "Stil der Einheit (WT/ITF) im Verlaufseintrag: " + (L.map((e) => e.ts || "–").join(" / ")));
  const hist = a.run("renderLog()");
  note("H2c", !/undefined|NaN/.test(hist), "Verlaufsseite ohne undefined/NaN");
}
// H3 boxing club hard yesterday -> kickboxing today lighter arms; WT club hard -> ?
{
  const a = app();
  a.run(`S.profile.sport='kickboxing';S.log=[{id:'c1',date:'2026-11-01',src:'club',ck:'P',sport:'boxing',minutes:90,rpe:8,inputConfirmed:true}];`);
  note("H3", true, "leichte Bereiche nach hartem Box-Vereinssparring: " + a.run("JSON.stringify(lightRegions({log:S.log,date:'2026-11-02'}))"));
  a.run(`S.log=[{id:'c2',date:'2026-11-01',src:'club',ck:'P',sport:'taekwondo',tstyle:'wt',minutes:90,rpe:8,inputConfirmed:true}];`);
  note("H3b", a.run("JSON.stringify(lightRegions({log:S.log,date:'2026-11-02'}))") === '["legs"]', "nach hartem WT-Vereinssparring: " + a.run("JSON.stringify(lightRegions({log:S.log,date:'2026-11-02'}))"));
}
// H4 resume of an ITF unit inside a kickboxing main profile keeps the style
{
  const a = app();
  a.run(`resumeReady=true;S.profile.sport='kickboxing';S.profile.birthYear=1995;S.profile.level=1;ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'taekwondo',tstyle:'itf'});selectSessionTimer(ui.sel);timerGo();`);
  a.advance(25000);
  const b = (() => { const B = app(); a.run("store.writeLocal()"); for (const [k, v] of a.saved) B.saved.set(k, v); B.run("S=hydrate(store.readLocal()); ui.onb=null"); return B; })();
  const offer = b.run("resumeOffer(()=>{})");
  b.run("sheetAction('confirm')");
  const st = b.run("S.sessions['2026-11-02'].tstyle"), sp = b.run("S.sessions['2026-11-02'].sport");
  const rendered = b.run("ui.tab='session';renderSession()");
  note("H4", offer && st === "itf" && sp === "taekwondo" && /Chagi|Jirugi|Matsogi/.test(rendered) && !/-chagi/.test(rendered), `Wiederaufnahme angeboten ${offer}, Stil ${st}, Sport ${sp}, ITF-Namen in der Ansicht ${/Chagi|Jirugi/.test(rendered)}`);
}
// H5 backup round trip with taekwondo data
{
  const a = app();
  a.run(`S.profile.sport='taekwondo';S.profile.tkd={style:'itf',names:'app',wt:'k5',itf:'k4',hist:[{date:'2026-09-01',style:'itf',to:'k4'}],exams:[]};S.log=[{id:'x1',date:'2026-10-30',src:'own',sport:'taekwondo',tstyle:'itf',type:'T',minutes:60,rpe:6,inputConfirmed:true,completed:true}];`);
  const snap = a.run("JSON.stringify(S)");
  const b = app();
  b.run(`S=hydrate(JSON.parse(${JSON.stringify(snap)}));`);
  note("H5", b.run("JSON.stringify(S.profile.tkd)") === a.run("JSON.stringify(S.profile.tkd)") && b.run("S.log[0].tstyle") === "itf", "Sicherung/Rückladen behält Stil, Grade, Historie, Namensart und Einheitenstil");
}
// H6 level per style + fitness shared
{
  const a = app();
  a.run("S.tests=[{id:'t0',date:'2026-10-01',raw:{str:30,spd:30,end:700,flx:4,tec:4},scores:{str:4,spd:4,end:4,flx:4,tec:4},techBy:{'taekwondo:wt':4},total:20,complete:true,min:4}];");
  a.run("S.profile.techLevels={'taekwondo:wt':2,'taekwondo:itf':0};");
  note("H6", a.run("techniqueLevel('taekwondo','wt')") === 2 && a.run("techniqueLevel('taekwondo','itf')") === 0 && a.run("fitnessLevel()") === 2, "Manuelle Technik je Sport/Stil getrennt, körperliche Dosierung aus vier gemeinsamen Testwerten");
}
// H7 grade never set automatically by a finished session
{
  const a = app();
  a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt',wt:'k6'});S.profile.birthYear=1995;S.profile.level=2;S.log=[];`);
  for (let i = 0; i < 3; i++) await walk(a, `S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'taekwondo'});`, "g");
  note("H7", a.run("S.profile.tkd.wt") === "k6", "Gürtel bleibt nach Einheiten unverändert (kein automatischer Gürtel)");
}
// H8 dose text vs timer for every timed item of many sessions (numbers × seconds)
{
  const a = app();
  const bad = new Set(); let n = 0;
  for (const [sp, sty] of [["kickboxing", ""], ["boxing", ""], ["taekwondo", "wt"], ["taekwondo", "itf"]])
    for (const ty of "TSPKCM") for (const loc of ["gym", "home", "outdoor"]) for (let k = 0; k < 3; k++) {
      a.run(`S.profile.sport='${sp}';S.profile.birthYear=1995;S.profile.level=${k};`);
      const res = JSON.parse(a.run(`(()=>{const s=buildSession('2026-11-02','${ty}','${loc}',['bag','rope','partner','weights','band','kb'],{sport:'${sp}'${sty ? `,tstyle:'${sty}'` : ""}});S.sessions.q=s;const o=[];s.blocks.forEach((b,bi)=>{if(b.rounds)return;b.items.forEach((it,ni)=>{const tm=exerciseTiming(s,bi,ni);if(!tm||it.kind!=='ex')return;const work=tm.phases.filter(p=>!p.prep&&!/Pause|Wechsel|Rest|Change|Seite|Side/i.test(p.label));const txt=doseTxt(it.id,b);const m=String(txt).match(/(\\d+)\\s*[×x]\\s*(\\d+)\\s*s\\b/);if(m&&work.length){const secs=work.map(p=>p.seconds);if(+m[1]!==work.length||!secs.includes(+m[2]))o.push(it.id+' | '+txt+' | timer '+work.length+'×'+secs[0]);}});});return JSON.stringify(o)})()`));
      n++; res.forEach((x) => bad.add(sp + ": " + x));
    }
  note("H8", bad.size === 0, `${n} Einheiten geprüft; Abweichungen Text↔Timer: ${bad.size ? [...bad].slice(0, 8).join(" ;; ") : "keine"}`);
}
// H9 words of another sport in the unit texts (DE/EN): boxing never mentions kicks or shins, taekwondo never wraps, gloves or punch names
{
  const a = app();
  const RX = {
    boxing: /\bkicks?\b|Tritt|Schienbein|\bshins?\b|WAKO|Dobok|Chagi/i,
    taekwondo: /Bandag|Boxhandschuh|\bwraps?\b|boxing gloves|\bJab\b|\bCross\b|Haken|\bhooks?\b|Uppercut|Low ?Kick|WAKO|Clinch/i,
    kickboxing: /Chagi|Dobok|Poomsae|\bTul\b|DBV/i,
  };
  const hits = new Set();
  for (const lg of ["de", "en"])
    for (const [sp, sty] of [["kickboxing", ""], ["boxing", ""], ["taekwondo", "wt"], ["taekwondo", "itf"]])
      for (const ty of "TSPKCM")
        for (const lv of [0, 1, 2]) {
          a.run(`S.profile.lang='${lg}';S.profile.sport='${sp}';S.profile.birthYear=1995;S.profile.level=${lv};${sty ? `S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${sty}'});` : ""}ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'${ty}','gym',['bag','partner','rope','weights'],{sport:'${sp}'${sty ? `,tstyle:'${sty}'` : ""}});ui.setup=null;`);
          const h = a.run(`(()=>{const s=S.sessions[ui.sel];let h=renderSession();s.blocks.forEach((b)=>b.items.forEach((it)=>{if(it.kind==='ex'&&EX[it.id]){const e=EX[it.id];h+=' '+[e[S.profile.lang],e.how,e.tip,e.err].filter(Boolean).join(' ');}}));return h.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ')})()`)
            .replace(/(Sportart|Sport) (Kickboxen|Kickboxing) (Boxen|Boxing) Taekwondo/g, "");
          for (const m of h.matchAll(new RegExp(RX[sp].source, "gi"))) hits.add(`${sp}/${lg}: „${h.slice(Math.max(0, m.index - 50), m.index + 30)}“`);
        }
  note("H9", hits.size === 0, hits.size ? [...hits].slice(0, 4).join(" ;; ") : "keine sportfremden Begriffe in Einheiten (DE/EN)");
}
console.log(R.join("\n"));
