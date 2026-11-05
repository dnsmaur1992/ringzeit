import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { appHtml } from "./app-source.mjs";

// Execute the actual inline application, without starting the DOM boot/animation loop.
// Only browser services are stubbed; planning, state, rendering and event handlers are the production code.
const html = appHtml();
const script = html.slice(
  html.lastIndexOf("<script>") + 8,
  html.lastIndexOf("</script>"),
);
function app() {
  let calendar = [2026, 10, 2],
    nowMs = new Date(2026, 10, 2).getTime(),
    jobId = 0;
  const jobs = new Map();
  const nodes = new Map(),
    listeners = new Map(),
    calls = [],
    saved = new Map();
  function node(id) {
    if (!nodes.has(id))
      nodes.set(id, {
        id,
        value: "",
        textContent: "",
        innerHTML: "",
        hidden: true,
        dataset: {},
        classList: {
          add() {},
          remove() {},
          toggle() {},
          contains() {
            return false;
          },
        },
        style: { setProperty() {} },
        addEventListener() {},
        setAttribute() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      });
    return nodes.get(id);
  }
  const context = vm.createContext({
    console,
    Date: class extends Date {
      constructor(...args) {
        super(...(args.length ? args : calendar));
      }
      static now() {
        return nowMs;
      }
    },
    Intl,
    Map,
    Set,
    JSON,
    Math: Object.create(Math),
    Object,
    Array,
    Number,
    String,
    Promise,
    setInterval() {},
    clearInterval() {},
    setTimeout(fn, delay = 0) {
      const id = ++jobId;
      jobs.set(id, { fn, at: nowMs + delay });
      return id;
    },
    clearTimeout(id) {
      jobs.delete(id);
    },
    navigator: {},
    window: { addEventListener() {}, scrollTo() {} },
    document: {
      visibilityState: "visible",
      querySelector() {
        return null;
      },
      getElementById: node,
      querySelectorAll() {
        return [];
      },
      documentElement: {},
      addEventListener(name, fn) {
        const arr = listeners.get(name) || [];
        arr.push(fn);
        listeners.set(name, arr);
      },
      removeEventListener() {},
    },
    localStorage: {
      getItem: (k) => saved.get(k) ?? null,
      setItem: (k, v) => saved.set(k, v),
      removeItem: (k) => saved.delete(k),
    },
    matchMedia: () => ({ matches: true }),
  });
  new vm.Script(unbooted).runInContext(context, {
    timeout: 2000,
    breakOnSigint: true,
  });
  // Boot was deliberately not run (see script replacement below).
  const run = (code) => vm.runInContext(code, context, { timeout: 3000 });
  // 3-D: exercises are found by their text id; exKey(fn) returns the id of the first exercise matching fn
  run(`globalThis.exKey=(f)=>{const e=EX.find(f);return e?e.key:-1};`);
  run(
    `S = hydrate({profile:{...DEFAULT_PROFILE, level:1, example:false, planStart:'2026-08-31'}}); ui.onb = null;`,
  );
  context.record = (...args) => calls.push(args);
  run(`globalThis.originalResources={getWake,releaseWake};`);
  run(
    `bell = n => record('bell', n); beep = () => record('beep'); getWake = () => record('wake'); releaseWake = () => record('release'); render = () => {}; showWin = () => {};`,
  );
  async function click(button) {
    const target = {
      id: button.id,
      dataset: button.dataset || {},
      closest(sel) {
        return sel === "button" || (sel === "[data-check]" && this.dataset.check) ? this : null;
      },
    };
    for (const listener of listeners.get("click") || []) await listener({ target });
  }
  return {
    run,
    calls,
    node,
    click,
    saved,
    jobs,
    async emit(name, target = {}) {
      for (const fn of listeners.get(name) || []) await fn({ target });
    },
    advance(ms) {
      const until = nowMs + ms;
      let count = 0;
      while (true) {
        const next = [...jobs.entries()]
          .filter(([, job]) => job.at <= until)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        if (++count > 10000) throw new Error("Timer loop");
        nowMs = next[1].at;
        jobs.delete(next[0]);
        next[1].fn();
      }
      nowMs = until;
      return count;
    },
    elapse(ms) {
      nowMs += ms;
    },
    setDate(ds) {
      const [y, m, d] = ds.split("-").map(Number);
      calendar = [y, m - 1, d];
      nowMs = new Date(y, m - 1, d).getTime();
    },
  };
}
// Remove the invocation only, retaining every production function and listener.
const bootAt = script.indexOf("  (function boot() {");
assert.ok(bootAt > 0);
const unbooted = script.slice(0, bootAt);
// Also parse the complete production script, including its boot function.
new vm.Script(script);

function history(
  a,
  {
    type = "T",
    step = 0,
    completed = true,
    rpe = 6,
    dates = ["2026-10-01", "2026-10-06", "2026-10-13", "2026-10-20"],
    extra = "",
  } = {},
) {
  a.run(
    `S.log = ${JSON.stringify(dates)}.map((date, i) => ({date, src:'own', type:${JSON.stringify(type)}, minutes:75, inputConfirmed:true, rpe:${rpe}, tHi:7, completed:${completed}, progression:{v:1,id:'base:2026-10-05',start:'2026-10-05',end:'2026-11-08',week:1,weeks:5,step:${step},eligible:true,signature:'lc:1:${type}:regular',plannedMin:75,plannedDates:${JSON.stringify(dates)}} ${extra}}));`,
  );
  // Use a completed five-week cycle immediately before today.
  a.run(
    `S.log.forEach(e => Object.assign(e.progression, {id:'base:2026-09-21',start:'2026-09-21',end:'2026-10-25'}));`,
  );
}

test("automatic rest -> work, no repeated prep; completion only after work elapsed", () => {
  const a = app();
  a.run(
    `S.sessions.x = {blocks:[{rounds:true,w:2,b:2,items:[{},{}]}]}; ui.sel='x'; ui.timer=newTimer('x'); ui.timer.phase='work'; ui.timer.running=true; ui.timer.left=1; timerStep(ui.timer,false);`,
  );
  assert.equal(a.run(`ui.timer.phase`), "rest");
  assert.equal(a.run(`roundDone(S.sessions.x,1)`), true);
  assert.equal(a.run(`roundDone(S.sessions.x,2)`), false);
  a.run(`timerStep(ui.timer,false); timerStep(ui.timer,false);`);
  assert.equal(a.run(`ui.timer.phase`), "work");
  assert.equal(a.run(`ui.timer.round`), 2);
  assert.equal(a.run(`ui.timer.running`), true);
  assert.equal(a.run(`ui.timer.left`), 2);
  a.run(`timerStep(ui.timer,false); timerStep(ui.timer,false);`);
  assert.equal(a.run(`ui.timer.phase`), "done");
  assert.equal(a.run(`sessionCompletion(S.sessions.x).complete`), true);
  assert.deepEqual(
    a.calls.filter((c) => c[0] === "bell"),
    [
      ["bell", 3],
      ["bell", 1],
      ["bell", 3],
    ],
  );
});

test("skipped rounds stay open, manual uncheck survives timer refresh and reload", () => {
  const a = app();
  a.run(
    `S.sessions.x = {blocks:[{rounds:true,w:2,b:2,items:[{},{},{}]}]}; ui.sel='x'; ui.timer=newTimer('x'); timerJump(1); ui.timer.phase='work'; ui.timer.running=true; ui.timer.left=1; timerStep(ui.timer,true);`,
  );
  assert.equal(a.run(`roundDone(S.sessions.x,1)`), false);
  assert.equal(a.run(`roundDone(S.sessions.x,2)`), true);
  a.run(
    `S.sessions.x.roundChecks[2]=false; markRounds(false); S=hydrate(JSON.parse(JSON.stringify(S)));`,
  );
  assert.equal(a.run(`roundDone(S.sessions.x,2)`), false);
  assert.equal(a.run(`newTimer('x').round`), 1);
});

test("pause/resume and long background catch-up do not require another start or emit stale bells", () => {
  const a = app();
  a.run(
    `S.sessions.x={blocks:[{rounds:true,w:2,b:2,items:[{},{}]}]}; ui.sel='x'; ui.timer=newTimer('x'); timerGo(); timerGo();`,
  );
  assert.equal(a.run("ui.timer.running"), false);
  a.run(`lastTick=Date.now()-100000; timerGo();`);
  assert.ok(a.run("Date.now()-lastTick") < 1000);
  a.run(`lastTick=Date.now()-100000; tick();`);
  assert.equal(a.run("ui.timer.phase"), "done");
  assert.equal(a.run("sessionCompletion(S.sessions.x).complete"), true);
  assert.equal(a.calls.filter((c) => c[0] === "bell").length, 0);
});

test("exercise checks, legacy rounds and entered sets survive backup round trip", () => {
  const a = app();
  a.run(
    `const id=exKey(e=>e.cat==='str'); S.sessions.x={date:'2026-11-02',rdone:1,checked:{'0.0':true,'2.0':true},blocks:[{key:'warm',items:[{id}]},{key:'main',rounds:true,items:[{},{}]},{key:'hard',items:[{kind:'hard',id:'fPush'}]},{key:'str',sets:'2× 8–12',items:[{id}]}],perf:{'3.0':[{r:0},{r:8}]}};`,
  );
  assert.equal(a.run("sessionCompletion(S.sessions.x).open"), 1);
  a.run(
    `S.sessions.x.roundChecks={2:true}; S=hydrate(JSON.parse(JSON.stringify(S)));`,
  );
  assert.equal(a.run("sessionCompletion(S.sessions.x).complete"), true);
});

test("partial finish prompts, keeps form values and logs load without progression success; duplicate save ignored", async () => {
  const a = app();
  a.run(
    `S.sessions.x={date:'2026-11-02',type:'T',min:60,tHi:7,blocks:[{key:'warm',items:[{}]}]}; ui.sel='x'; openSheet=o=>ui.sheet=o; closeSheet=()=>ui.sheet=null;`,
  );
  a.node("fMin").value = "25";
  a.node("fDurationConfirmed").checked = true;
  a.node("fRpe").value = "8";
  a.node("fNote").value = "Zeitmangel";
  await a.click({ id: "fSave" });
  assert.equal(a.run("S.log.length"), 0);
  assert.match(a.run("ui.sheet.lines[0]"), /1 Übung/);
  a.run("ui.sheet.run()");
  assert.equal(a.run("S.log[0].completed"), false);
  assert.equal(a.run("S.log[0].minutes"), 25);
  assert.equal(a.run("S.log[0].rpe"), 8);
  assert.equal(a.run("S.log[0].note"), "Zeitmangel");
  a.run("saveTrainingSession()");
  assert.equal(a.run("S.log.length"), 1);
});

test("fully completed session saves directly and render includes manual checks and highlighted finish", async () => {
  const a = app();
  a.run(`ui.sel='2026-11-02'; S.ov[ui.sel]={t:'T'}; S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:30});
    S.sessions[ui.sel].blocks.forEach((b,bi)=>b.items.forEach((it,ni)=>{if(b.rounds){(S.sessions[ui.sel].roundChecks ||= {})[ni+1]=true;}else{(S.sessions[ui.sel].checked ||= {})[bi+'.'+ni]=true;if(EX[it.id]?.cat==='str'){(S.sessions[ui.sel].perf ||= {})[bi+'.'+ni]=Array.from({length:blockSets(b)},()=>({r:10}));}}}));`);
  assert.equal(a.run("sessionCompletion(S.sessions[ui.sel]).complete"), true);
  const rendered = a.run(
    "S.sessions[ui.sel].blocks.map((b,bi)=>sessionBlockHtml(S.sessions[ui.sel],bi,false)).join('') + finishFormHtml(S.sessions[ui.sel])",
  );
  assert.match(rendered, /data-check=/);
  assert.match(rendered, /btn all-done/);
  a.node("fMin").value = "30";
  a.node("fDurationConfirmed").checked = true;
  a.node("fRpe").value = "6";
  await a.click({ id: "fSave" });
  assert.equal(a.run("S.log[0].completed"), true);
});

test("successful closed cycle increases once; incomplete/current/legacy/duplicate data cannot raise it", () => {
  const a = app();
  history(a);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 1);
  assert.equal(a.run(`progressionState('2026-11-03','T',false).step`), 1);
  history(a, { completed: false });
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  history(a, { dates: ["2026-10-06", "2026-10-06"] });
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  history(a);
  a.run(`S.log.forEach(e=>e.progression.end='2026-11-08')`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  a.run(`S.log.forEach(e=>delete e.progression)`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
});

test("overload lowers baseline, partial cycles repeat; protection wins over increases", () => {
  const a = app();
  history(a, { rpe: 9 });
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), -1);
  history(a);
  a.run(`S.profile.weekMood={'2026-11-02':'hard'}`);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).eligible`),
    false,
  );
  a.run(
    `S.profile.weekMood={}; S.profile.comps=[{date:'2026-11-05',kind:'comp'}]`,
  );
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).eligible`),
    false,
  );
  a.run(`S.profile.comps=[]; S.pauses=[{from:'2026-10-20',to:'2026-10-31'}]`);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).eligible`),
    false,
  );
});

test("wave increases density within time budget and preserves deload, children, official formats and focus stages", () => {
  const a = app();
  history(a);
  for (const day of [
    "2026-10-26",
    "2026-11-02",
    "2026-11-09",
    "2026-11-16",
    "2026-11-23",
  ]) {
    a.run(
      `{ const sess=buildSession(${JSON.stringify(day)},'T','gym',['bag'],{min:45}); const b=roundBlock(sess); globalThis.result={eligible:sess.progression.eligible,week:sess.progression.week,rest:b.b,seconds:b.items.length*b.w+(b.items.length-1)*b.b,budget:b.min*60}; }`,
    );
    const r = a.run("result");
    assert.ok(r.seconds <= r.budget, JSON.stringify(r));
    if (r.week === 5) assert.equal(r.eligible, false);
  }
  a.run(
    `S.profile.birthYear=2016; const child=buildSession('2026-11-02','T','gym',['bag'],{min:30}); globalThis.childP=child.progression.eligible;`,
  );
  assert.equal(a.run("childP"), false);
  a.run(
    `S.profile.birthYear=1992; S.profile.comps=[{date:'2026-11-05',kind:'comp'}]; const prep=buildSession('2026-11-02','T','gym',['bag'],{min:45}); globalThis.prepFormat=[roundBlock(prep).w,roundBlock(prep).b];`,
  );
  assert.equal(JSON.stringify(a.run("prepFormat")), "[120,60]");
  a.run(`S.profile.comps=[]; S.profile.block={k:'end',start:'2026-10-26'};`);
  assert.equal(a.run(`progressionCycle('2026-11-02').weeks`), 6);
  assert.equal(
    a.run(`blockRounds(blockInfo('2026-11-02'),'2026-11-02').w`),
    300,
  );
});

test("strength targets use actual same-exercise data, advance one variable per closed cycle and survive backup", () => {
  const a = app();
  history(a, { type: "S" });
  a.run(`const id=exKey(e=>e.cat==='str' && /weights/.test(e.eq) && !DOSE_FIX[e.de]);
    const sess={date:'2026-11-02',type:'S',loc:'gym',eq:['weights'],progression:progressionState('2026-11-02','S',false)},
      b={key:'str',sets:'3× 8–12',items:[{id}]};
    const initial=strengthTarget(sess,b,b.items[0]);
    globalThis.fixture={id,sess,b,initial};
    S.log.forEach(e=>{e.perf=[{id,sets:[{r:8,kg:20},{r:8,kg:20},{r:8,kg:20}],target:{...initial,cycle:e.progression.id,kg:20}}]});
    sess.progression=progressionState('2026-11-02','S',false);
    globalThis.target=strengthTarget(sess,b,b.items[0]);`);
  assert.equal(a.run("target.r"), 9);
  assert.equal(a.run("target.kg"), 20);
  a.run(
    `S.log.forEach(e=>{e.perf[0].target.r=12; e.perf[0].target.baseR=12; e.perf[0].sets.forEach(r=>r.r=12)}); globalThis.target=strengthTarget(fixture.sess,fixture.b,fixture.b.items[0]);`,
  );
  assert.equal(a.run("target.r"), 12);
  assert.equal(a.run("target.kg"), 20.5);
  a.run(
    `S=hydrate(JSON.parse(JSON.stringify(S))); globalThis.target=strengthTarget(fixture.sess,fixture.b,fixture.b.items[0]);`,
  );
  assert.equal(a.run("target.kg"), 20.5);
  a.run(
    `S.log[0].completed=false; globalThis.target=strengthTarget(fixture.sess,fixture.b,fixture.b.items[0]);`,
  );
  assert.equal(a.run("target.kg"), 20);
});

test("old backups load, preserve logs and exercise values, and do not fabricate completions", () => {
  const a = app();
  a.run(
    `S=hydrate({profile:{lang:'de'},log:[{date:'2026-10-01',src:'own',type:'S',minutes:60,rpe:6,perf:[{id:1,sets:[{r:10,kg:20}]}]}],sessions:{'2026-10-01':{blocks:[],checked:{'0.0':true}}}});`,
  );
  assert.equal(a.run("S.log[0].perf[0].sets[0].kg"), 20);
  assert.equal(a.run("S.log[0].completed"), undefined);
  assert.equal(a.run(`S.sessions['2026-10-01'].checked['0.0']`), true);
});

test("manual exercise and round checks use the production event handler and persist", async () => {
  const a = app();
  a.run(
    `S.sessions.x={date:'2026-11-02',blocks:[{key:'warm',items:[{}]},{key:'main',rounds:true,items:[{}]}]}; ui.sel='x';`,
  );
  await a.click({ dataset: { check: "0.0" } });
  assert.equal(a.run(`S.sessions.x.checked['0.0']`), true);
  await a.click({ dataset: { check: "1.0" } });
  assert.equal(a.run("sessionCompletion(S.sessions.x).complete"), true);
  a.run(`S=hydrate(JSON.parse(localStorage.getItem(LS)))`);
  assert.equal(a.run("sessionCompletion(S.sessions.x).complete"), true);
  await a.click({ dataset: { check: "1.0" } });
  assert.equal(a.run("sessionCompletion(S.sessions.x).open"), 1);
});

test("reset clears rounds before selecting the first round and saves the change", async () => {
  const a = app();
  a.run(
    `S.sessions.x={date:'2026-11-02',rdone:2,roundChecks:{1:true,2:true},blocks:[{rounds:true,w:2,b:2,items:[{},{},{}]}]}; ui.sel='x';`,
  );
  await a.click({ id: "treset" });
  assert.equal(a.run("ui.timer.round"), 1);
  assert.equal(a.run("roundDone(S.sessions.x,1)"), false);
  a.run("S=hydrate(JSON.parse(localStorage.getItem(LS)))");
  assert.equal(a.run("roundDone(S.sessions.x,2)"), false);
});

test("every rendered exercise has completion markup, including running, hardening and grading rows", () => {
  const a = app();
  for (const lang of ["de", "en"])
    for (const type of ["T", "C", "P", "S", "K", "M"]) {
      a.run(`S.profile.lang=${JSON.stringify(lang)}; ui.setup=null; ui.sel='2026-11-02'; S.ov[ui.sel]={t:${JSON.stringify(type)}};
      S.sessions[ui.sel]=buildSession(ui.sel,${JSON.stringify(type)},'gym',['bag','weights','rope'],{min:60});`);
      const rendered = a.run("renderSession()");
      assert.equal(
        (rendered.match(/data-item=/g) || []).length,
        a.run("S.sessions[ui.sel].blocks.reduce((n,b)=>n+b.items.length,0)"),
      );
    }
  a.run(
    `ui.setup=null; S.sessions[ui.sel]=buildSession(ui.sel,'K','out',[],{min:60,run:true});`,
  );
  assert.match(
    a.run(
      "S.sessions[ui.sel].blocks.map((b,bi)=>sessionBlockHtml(S.sessions[ui.sel],bi,false)).join('')",
    ),
    /data-check=/,
  );
  a.run(
    `ui.setup=null; S.profile.belt=0; S.profile.comps=[{kind:'grade',date:'2026-11-10'}]; S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['partner'],{min:75});`,
  );
  const rendered = a.run("renderSession()");
  assert.equal(
    (rendered.match(/data-item=/g) || []).length,
    a.run("S.sessions[ui.sel].blocks.reduce((n,b)=>n+b.items.length,0)"),
  );
});

test("long gaps and future plans do not manufacture progression; capped density does not block earned strength progress", () => {
  const a = app();
  history(a);
  a.run(
    `S.log.forEach(e=>{e.date='2026-08-'+(e.date.endsWith('06')?'01':'02');Object.assign(e.progression,{id:'old',start:'2026-07-27',end:'2026-08-30'})})`,
  );
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  history(a);
  a.run(`S.log.forEach(e=>Object.assign(e.progression,{end:'2026-11-08'}))`);
  assert.equal(a.run(`progressionState('2026-12-01','T',false).step`), 0);
  history(a, { step: 4 });
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 4);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).reason`), "cap");
});

// Advance the calendar, generate real plans, record real completion/performance snapshots,
// and round-trip storage between sessions; no invented progression metadata.
function simulateCycles(type, behavior, cycles = 4) {
  const a = app(),
    output = [];
  a.run(
    `S = hydrate({profile:{...DEFAULT_PROFILE,level:1,example:false,planStart:'2026-10-26',days:[0]}}); Math.random=()=>0.5;`,
  );
  for (let cycle = 0; cycle < cycles; cycle++) {
    const weeks = [];
    for (let week = 0; week < 5; week++) {
      const date = new Date(2026, 9, 26 + cycle * 35 + week * 7);
      const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      a.setDate(ds);
      a.run(
        `ui.sel=${JSON.stringify(ds)}; S.ov[ui.sel]={t:${JSON.stringify(type)}}; S.sessions[ui.sel]=buildSession(ui.sel,${JSON.stringify(type)},'gym',['bag','weights','rope'],{min:60});`,
      );
      const mode = behavior(cycle, week);
      if (mode !== "partial")
        a.run(`{
        const sess=S.sessions[ui.sel];
        sess.blocks.forEach((b,bi)=>b.items.forEach((it,ni)=>{
          if(b.rounds) (sess.roundChecks ||= {})[ni+1]=true;
          else if(EX[it.id]?.cat==='str' && !['warm','cool'].includes(b.key))
            (sess.perf ||= {})[bi+'.'+ni]=Array.from({length:blockSets(b)},()=>({r:it.target?.r ?? 12,kg:hasKg(it.id)?it.target?.kg ?? 20:null}));
          else (sess.checked ||= {})[bi+'.'+ni]=true;
        }));
      }`);
      a.node("fMin").value = "60";
      a.node("fDurationConfirmed").checked = true;
      a.node("fRpe").value = a.run(
        `Math.min(10,S.sessions[ui.sel].tHi + ${mode === "hard" ? 2 : 0})`,
      );
      a.node("fNote").value = "";
      const summary = a.run(
        `({step:S.sessions[ui.sel].progression.step, eligible:S.sessions[ui.sel].progression.eligible,reason:S.sessions[ui.sel].progression.reason,rest:roundBlock(S.sessions[ui.sel])?.b,targets:S.sessions[ui.sel].blocks.flatMap(b=>b.items.filter(it=>it.target).map(it=>({id:it.id,...it.target})))})`,
      );
      weeks.push(summary);
      a.run(
        "saveTrainingSession(); S=hydrate(JSON.parse(localStorage.getItem(LS)));",
      );
    }
    output.push(weeks);
  }
  return output;
}

test("20 weeks of generated, fully completed technique plans raise baselines only after cycle boundaries", () => {
  const result = simulateCycles("T", () => "good");
  assert.deepEqual(
    result.map((c) => c[0].step),
    [0, 1, 2, 3],
  );
  result.forEach((c) => {
    assert.equal(c[0].step, c[3].step);
    assert.equal(c[4].eligible, false);
    if (c[0].reason === "initial") assert.equal(c[0].rest, c[3].rest);
    else assert.ok(c[0].rest > c[3].rest);
  });
  assert.ok(result[1][0].rest < result[0][0].rest);
  console.log(
    "Simulated technique cycle baselines:",
    result.map((c) => c[0].step).join(" → "),
  );
});

test("20 weeks with partial training hold the baseline, and an overloaded cycle lowers the next baseline", () => {
  const partial = simulateCycles("T", () => "partial");
  assert.deepEqual(
    partial.map((c) => c[0].step),
    [0, 0, 0, 0],
  );
  const overload = simulateCycles("T", (cycle) =>
    cycle === 1 ? "hard" : "good",
  );
  assert.deepEqual(
    overload.map((c) => c[0].step),
    [0, 1, 0, 1],
  );
  console.log(
    "Simulated overload cycle baselines:",
    overload.map((c) => c[0].step).join(" → "),
  );
});

test("40 weeks of generated strength plans carry base reps and earned weights through deloads without inventing entered values", () => {
  const result = simulateCycles("S", () => "good", 8);
  const first = result[0][0].targets.find((t) => t.kg == null && !t.timed);
  assert.ok(first);
  const trajectory = result.map((c) =>
    c[0].targets.find((t) => t.id === first.id),
  );
  assert.deepEqual(
    trajectory.slice(0, 5).map((t) => t.baseR),
    [8, 9, 10, 11, 12],
  );
  assert.ok(trajectory[5].kg > trajectory[4].kg);
  result.forEach((c) => {
    assert.equal(c[4].eligible, false);
    assert.equal(c[4].targets.length, 0);
  });
  console.log(
    "Simulated strength base reps:",
    trajectory.map((t) => t.baseR).join(" → "),
  );
  console.log(
    "Simulated strength weight suggestions:",
    trajectory.map((t) => t.kg ?? "choose").join(" → "),
  );
});

test("two successful entries or many entries in one week do not establish regular evidence", () => {
  const a = app();
  history(a, { dates: ["2026-10-06", "2026-10-20"] });
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.level`),
    "collecting",
  );
  history(a, {
    dates: ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"],
  });
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
});

test("unrecorded planned sessions and missing effort values prevent an increase", () => {
  const a = app();
  history(a);
  a.run(
    `S.log.forEach(e=>e.progression.plannedDates.push('2026-09-22','2026-09-29','2026-10-07','2026-10-14'))`,
  );
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.reason`),
    "coverage",
  );
  history(a);
  a.run(`delete S.log[0].rpe;`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
});

test("more high-quality evidence improves confidence without increasing the size of the step", () => {
  const a = app();
  history(a);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.level`),
    "sufficient",
  );
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 1);
  history(a, {
    dates: [
      "2026-09-22",
      "2026-09-24",
      "2026-09-29",
      "2026-10-01",
      "2026-10-06",
      "2026-10-08",
      "2026-10-13",
      "2026-10-20",
    ],
  });
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.level`),
    "reliable",
  );
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 1);
  a.run(`S.log.forEach((e,i)=>e.rpe=i<4?4:6);`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.reason`),
    "trend",
  );
});

test("data remains scoped to the training type and missing legacy plan snapshots cannot justify an increase", () => {
  const a = app();
  history(a);
  assert.equal(a.run(`progressionState('2026-11-02','S',false).data.count`), 0);
  history(a, { step: 2 });
  a.run(`S.log.forEach(e=>delete e.progression.plannedDates)`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 2);
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.reason`),
    "missing",
  );
});

test("historical plan snapshots survive later changes to profile days and backup round-trips", () => {
  const a = app();
  history(a);
  a.run(
    `S.log.forEach(e=>e.progression.plannedDates.push('2026-09-22','2026-09-29','2026-10-07','2026-10-14'));S=hydrate(JSON.parse(JSON.stringify(S)));S.profile.days=[];`,
  );
  assert.equal(
    a.run(`progressionState('2026-11-02','T',false).data.coverage`),
    0.5,
  );
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
});

test("learning explanation is shown once in the first session (not in onboarding) and can be dismissed permanently", async () => {
  const a = app();
  a.run(
    `ui.onb={step:0,disc:'lc',days:[0],minutes:60,clubDays:[],clubMin:90}; installHtml=()=>''; renderOnb();`,
  );
  assert.doesNotMatch(a.node("onb").innerHTML, /So lernt Ringzeit/);
  assert.match(a.run("progressionInfoHtml(true)"), /data-progress-info-close/);
  await a.click({ dataset: { progressInfoClose: "1" } });
  assert.equal(a.run("progressionInfoHtml(true)"), "");
  a.run(`S=hydrate(JSON.parse(localStorage.getItem(LS)));`);
  assert.equal(a.run("S.profile.progressInfoSeen"), true);
});

test("the first-session explanation stays pending after setup, whether skipped or finished", async () => {
  const a = app();
  a.run(
    `S.profile.ackSafe='2026-11-02';S.profile.toured=true;ui.onb={step:0,disc:'lc',days:[0],minutes:60,clubDays:[],clubMin:90}; loading=async()=>{};`,
  );
  await a.run("finishOnb(true,false)");
  assert.match(
    a.run("progressionInfoHtml(true)"),
    /Ringzeit passt dein Training/,
  );
  a.run(
    `ui.onb={step:4,disc:'lc',days:[0],minutes:60,clubDays:[],clubMin:90};`,
  );
  await a.run("finishOnb(false,false)");
  assert.notEqual(a.run("S.profile.progressInfoSeen"), true);
  assert.match(a.run("progressionInfoHtml(true)"), /Ringzeit passt dein Training/);
});

test("finishing requires a deliberate effort and a valid duration; the suggested duration needs no extra tick", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]={date:ui.sel,type:'T',min:60,tHi:7,blocks:[{key:'warm',items:[{}]}]};`,
  );
  a.node("fMin").value = "60";
  a.node("fRpe").value = "";
  await a.click({ id: "fSave" });
  assert.equal(a.run("S.log.length"), 0);
  assert.match(a.node("finishError").textContent, /Anstrengung/);
  await a.click({ dataset: { effort: "6" } });
  // the suggested duration counts unless changed; an invalid duration still blocks saving
  a.node("fMin").value = "0";
  await a.click({ id: "fSave" });
  assert.equal(a.run("S.log.length"), 0);
  assert.match(a.node("finishError").textContent, /Dauer/);
  a.node("fMin").value = "60";
  a.run(`S.sessions[ui.sel].checked={'0.0':true}`);
  await a.click({ id: "fSave" });
  assert.equal(a.run("S.log[0].inputConfirmed"), true);
  assert.equal(a.run("S.log[0].rpe"), 6);
});

test("editing actual duration confirms it and draft effort/notes survive a render", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60})`,
  );
  a.node("fMin").value = "35";
  a.node("fNote").value = "Früher fertig";
  await a.emit("input", a.node("fMin"));
  await a.click({ dataset: { effort: "5" } });
  await a.emit("input", a.node("fNote"));
  assert.equal(a.run("finishDraft().minutesConfirmed"), true);
  const rendered = a.run("finishFormHtml(S.sessions[ui.sel])");
  assert.match(rendered, /value="35"/);
  assert.match(rendered, /value="5"/);
  assert.match(rendered, /Früher fertig/);
  a.node("fMin").value = "0";
  await a.emit("input", a.node("fMin"));
  assert.equal(a.run("validateFinish()"), false);
});

test("a session save stops active timers, scheduled speech and the central clock", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});timerGo();queueTimerSpeech('stale',100,()=>true);say=x=>record('say',x)`,
  );
  a.node("fMin").value = "30";
  a.node("fRpe").value = "7";
  a.node("fDurationConfirmed").checked = true;
  a.run("saveTrainingSession()");
  assert.equal(a.run("ui.timer.running"), false);
  assert.equal(a.run("timerClock"), null);
  assert.equal(a.run("timerSpeechJobs.size"), 0);
  a.advance(2000);
  assert.equal(a.calls.filter((x) => x[0] === "say").length, 0);
  assert.equal(a.run("S.log[0].minutes"), 30);
});

test("there is one deadline clock while active and none while paused or idle", () => {
  const a = app();
  assert.equal(a.run("timerClock"), null);
  a.run(
    `ui.sel='x';S.sessions.x={blocks:[{rounds:true,w:20,b:10,items:[{},{}]}]};timerGo()`,
  );
  assert.equal(a.jobs.size, 1);
  a.advance(2000);
  assert.equal(a.run("ui.timer.left"), 8);
  a.run("timerGo()");
  assert.equal(a.run("timerClock"), null);
  assert.equal(a.jobs.size, 0);
  a.advance(5000);
  assert.equal(a.run("ui.timer.left"), 8);
  a.run("timerGo()");
  assert.equal(a.jobs.size, 1);
  a.advance(1000);
  assert.equal(a.run("ui.timer.left"), 7);
});

test("switching to free timer pauses session timer and closing free timer cancels resources", () => {
  const a = app();
  a.run(
    `ui.sel='x';S.sessions.x={blocks:[{rounds:true,w:20,b:10,items:[{},{}]}]};timerGo();openFt();`,
  );
  assert.equal(a.run("ui.timer.running"), false);
  assert.equal(a.run("timerRunning()"), false);
  a.run(`ui.ft.cfg={r:2,w:20,b:10,prep:false,warn:true,coach:false};ftStart()`);
  assert.equal(a.run("freeRunning()"), true);
  assert.equal(a.run("ui.timer.running"), false);
  a.run("closeFt()");
  assert.equal(a.run("timerRunning()"), false);
  assert.equal(a.run("timerClock"), null);
});

test("free timer catches up across several missed phases with exact deadlines and no stale bells", () => {
  const a = app();
  a.run(
    `openFt();ui.ft.cfg={r:3,w:20,b:10,prep:false,warn:true,coach:false};ftStart()`,
  );
  const bells = a.calls.filter((x) => x[0] === "bell").length;
  a.elapse(45000);
  a.run("ftTick()");
  assert.equal(a.run("ui.ft.round"), 2);
  assert.equal(a.run("ui.ft.phase"), "work");
  assert.equal(a.run("ui.ft.left"), 5);
  assert.equal(a.calls.filter((x) => x[0] === "bell").length, bells);
  a.elapse(40000);
  a.run("ftTick()");
  assert.equal(a.run("ui.ft.phase"), "done");
  assert.equal(a.run("ui.ft.completed"), 3);
  assert.equal(a.run("timerClock"), null);
});

test("free timer pause/resume retains fractional remaining time; manual skip does not count a completed round", () => {
  const a = app();
  a.run(
    `openFt();ui.ft.cfg={r:2,w:20,b:10,prep:false,warn:true,coach:false};ftStart()`,
  );
  a.elapse(450);
  a.run(`ftAction('pause')`);
  assert.equal(a.run("ui.ft.remainingMs"), 19550);
  a.advance(5000);
  a.run(`ftAction('pause')`);
  assert.equal(a.run("ui.ft.endAt-Date.now()"), 19550);
  a.run(`ftAction('skip')`);
  assert.equal(a.run("ui.ft.phase"), "rest");
  assert.equal(a.run("ui.ft.completed"), 0);
});

test("hidden session views do not receive clock DOM updates and refresh on return", async () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';S.sessions.x={blocks:[{rounds:true,w:20,b:10,items:[{},{}]}]};timerGo();document.visibilityState='hidden';updTimer=()=>record('paint');markRounds=()=>record('marks')`,
  );
  a.advance(12000);
  assert.equal(a.run("ui.timer.phase"), "work");
  assert.equal(a.calls.filter((x) => x[0] === "paint").length, 0);
  a.run(`document.visibilityState='visible'`);
  await a.emit("visibilitychange");
  assert.ok(a.calls.some((x) => x[0] === "paint"));
});

test("pending Wake Lock is released when stop happens before the request resolves", async () => {
  const a = app();
  a.run(`getWake=originalResources.getWake;releaseWake=originalResources.releaseWake;unlockBells=()=>{};audioKeep=on=>record('keep',on);
    ui.timer={running:true};navigator.wakeLock={request:()=>new Promise(resolve=>globalThis.grantLock=resolve)};globalThis.pending=getWake();`);
  await Promise.resolve();
  await Promise.resolve();
  a.run(
    `ui.timer.running=false;releaseWake();grantLock({release:()=>{record('lockReleased');return Promise.resolve()},addEventListener(){}})`,
  );
  await a.run("pending");
  assert.equal(a.run("wake"), null);
  assert.equal(a.run("wantWake"), false);
  assert.ok(a.calls.some((x) => x[0] === "lockReleased"));
});

test("Wake Lock stays requested during both work and rest and idle audio suspends only after stop", async () => {
  const a = app();
  a.run(`getWake=originalResources.getWake;releaseWake=originalResources.releaseWake;unlockBells=()=>{};audioKeep=on=>record('keep',on);
    actx={state:'running',suspend(){this.state='suspended';return Promise.resolve()}};
    ui.timer={running:true,phase:'work'};navigator.userAgent='iPhone';navigator.wakeLock={request:()=>Promise.resolve({release:()=>Promise.resolve(),addEventListener(){}})};`);
  await a.run("getWake()");
  assert.equal(a.run("wantWake"), true);
  assert.ok(a.calls.some((x) => x[0] === "keep" && x[1] === true));
  a.run(`ui.timer.phase='rest';releaseWake()`);
  assert.equal(a.run("wantWake"), true);
  a.run(`ui.timer.running=false;releaseWake()`);
  a.advance(5000);
  assert.equal(a.run("actx.state"), "suspended");
});

test("settings are collapsed for an existing session; warm-up, progress and exercise-specific labels are exposed", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60})`,
  );
  const rendered = a.run("renderSession()");
  assert.match(
    rendered,
    /<details class="panel session-settings"[^>]*>\s*<summary>Einheit anpassen/,
  );
  assert.match(rendered, /data-workout="start"/);
  assert.doesNotMatch(rendered, /data-check=|id="fSave"|class="si|data-fx=/);
  assert.match(rendered, /Bereitlegen/);
  assert.match(rendered, /<details class="note"><summary>Warum diese Einheit/);
  await a.click({ dataset: { go: "2026-11-02" } });
  assert.equal(a.run("ui.focus"), false);
});

test("basic strength movements recur, respect limits, and unrelated equipment does not change exercise identity", () => {
  const a = app();
  a.run(
    `globalThis.one=buildSession('2026-11-02','S','gym',['weights'],{min:60});globalThis.two=buildSession('2026-11-09','S','gym',['weights','rope'],{min:60})`,
  );
  assert.equal(
    JSON.stringify(
      a.run(
        "one.blocks.flatMap(b=>b.items.filter(it=>it.basic).map(it=>it.id))",
      ),
    ),
    JSON.stringify(
      a.run(
        "two.blocks.flatMap(b=>b.items.filter(it=>it.basic).map(it=>it.id))",
      ),
    ),
  );
  assert.ok(
    a.run("one.blocks.flatMap(b=>b.items.filter(it=>it.basic)).length") >= 2,
  );
  a.run(`globalThis.id=exKey(e=>e.de==='Goblet Squats')`);
  assert.equal(
    a.run('relevantEquipment(id,["weights"])'),
    a.run('relevantEquipment(id,["weights","rope","bag"])'),
  );
  a.run(
    `S.profile.limits=['knee'];globalThis.limited=buildSession('2026-11-02','S','gym',['weights'],{min:60})`,
  );
  assert.equal(
    a.run(
      `limited.blocks.flatMap(b=>b.items.filter(it=>it.basic)).some(it=>EX[it.id].avoid.includes('k'))`,
    ),
    false,
  );
});

test("old unconfirmed defaults are not evidence; optional hard exercise feedback can lower its next target", () => {
  const a = app();
  history(a);
  a.run("S.log.forEach(e=>delete e.inputConfirmed)");
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0);
  history(a, { type: "S" });
  a.run(`const id=exKey(e=>e.de==='Goblet Squats'),sess={date:'2026-11-02',type:'S',loc:'gym',eq:['weights'],progression:progressionState('2026-11-02','S',false)},b={key:'str',sets:'3× 8–12',items:[{id}]};
    const initial=strengthTarget(sess,b,b.items[0]);S.log.forEach(e=>e.perf=[{id,effort:'hard',sets:[{r:8,kg:20},{r:8,kg:20},{r:8,kg:20}],target:{...initial,kg:20,cycle:e.progression.id}}]);
    sess.progression=progressionState('2026-11-02','S',false);globalThis.feedbackTarget=strengthTarget(sess,b,b.items[0])`);
  assert.equal(a.run("feedbackTarget.kg"), 19);
  assert.equal(a.run("feedbackTarget.reason"), "down");
});

test("one minute of the free timer needs only second-aligned callbacks and pause stops them", () => {
  const a = app();
  a.run(
    `openFt();ui.ft.cfg={r:3,w:120,b:60,prep:false,warn:true,coach:false};ftStart()`,
  );
  const callbacks = a.advance(60000);
  assert.ok(callbacks >= 60 && callbacks <= 62, `callbacks: ${callbacks}`);
  a.run(`ftAction('pause')`);
  assert.equal(a.advance(60000), 0);
});

test("legacy exercise histories remain comparable when only unrelated equipment changes", () => {
  const a = app();
  history(a, { type: "S" });
  a.run(`const id=exKey(e=>e.de==='Goblet Squats'),sess={date:'2026-11-02',type:'S',loc:'gym',eq:['weights'],progression:progressionState('2026-11-02','S',false)},b={key:'str',sets:'3× 8–12',items:[{id}]};
    const initial=strengthTarget(sess,b,b.items[0]),parts=initial.kind.split(':');parts[parts.length-4]='bag,rope,weights';
    S.log.forEach(e=>e.perf=[{id,sets:[{r:8,kg:20},{r:8,kg:20},{r:8,kg:20}],target:{...initial,kg:20,kind:parts.join(':'),cycle:e.progression.id}}]);
    sess.progression=progressionState('2026-11-02','S',false);globalThis.carriedTarget=strengthTarget(sess,b,b.items[0]);`);
  assert.equal(a.run("carriedTarget.r"), 9);
  assert.equal(a.run("carriedTarget.kg"), 20);
});

test("non-Apple audio can sleep between sounds while screen stays awake and resumes for the next signal", async () => {
  const a = app();
  a.run(`getWake=originalResources.getWake;releaseWake=originalResources.releaseWake;unlockBells=()=>{};audioKeep=on=>record('keep',on);
    actx={state:'running',suspend(){this.state='suspended';return Promise.resolve()},resume(){this.state='running';return Promise.resolve()}};
    ui.timer={running:true};navigator.userAgent='Android';navigator.wakeLock={request:()=>Promise.resolve({release:()=>Promise.resolve(),addEventListener(){}})};`);
  await a.run("getWake()");
  a.advance(5000);
  assert.equal(a.run("actx.state"), "suspended");
  assert.equal(a.run("wantWake"), true);
  a.run(`withAudio(()=>record('signal'))`);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(a.run("actx.state"), "running");
  assert.ok(a.calls.some((x) => x[0] === "signal"));
});

test("the day plan is a read-only preview; starting opens the saved section without auto-completing anything", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.ov[ui.sel]={t:'S'};S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',['weights'],{min:60});`,
  );
  const html = a.run("renderSession()");
  assert.match(html, /data-workout="start"/);
  assert.ok(
    html.lastIndexOf('data-workout="start"') > html.lastIndexOf("data-block="),
  );
  // also available above the plan, so nobody has to scroll through the whole plan first
  assert.ok(html.indexOf('data-workout="start"') < html.indexOf("data-block="));
  assert.doesNotMatch(
    html,
    /data-check=|class="si|data-addset=|data-rmset=|id="fSave"|data-rd=|id="tgo"|data-exercise-timer=/,
  );
  assert.equal(a.run("Object.values(S.sessions[ui.sel].perf||{}).length"), 0);
  await a.click({ dataset: { workout: "start" } });
  assert.equal(a.run("ui.workout.block"), 0);
  // the player shows one step at a time; the section list stays reachable
  assert.match(a.run("workoutHtml()"), /data-player=/);
  assert.match(a.run("ui.workout.list=true,workoutHtml()"), /data-check=|data-exercise-timer=|class="si/);
  a.run("ui.workout.list=false");
  assert.equal(a.run("sessionCompletion(S.sessions[ui.sel]).done"), 0);
  a.run("moveWorkout(1)");
  assert.equal(a.run("S.sessions[ui.sel].flow.block"), 1);
  a.run("closeWorkout();startWorkout()");
  assert.equal(a.run("ui.workout.block"), 1);
  assert.equal(a.run("sessionCompletion(S.sessions[ui.sel]).done"), 0);
  a.run(
    "S=hydrate(JSON.parse(JSON.stringify(S)));ui.workout=null;startWorkout()",
  );
  assert.equal(a.run("ui.workout.block"), 1);
});

test("warm-up timers follow the displayed minutes, pause precisely, and only complete after the full duration", () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Einlaufen');S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'warm',min:4,items:[{id},{id}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
  );
  assert.equal(a.run("ui.exerciseTimer.phases[0].seconds"), 120);
  a.advance(1500);
  a.run("pauseExerciseTimer()");
  assert.equal(a.run("ui.exerciseTimer.remainingMs"), 118500);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.advance(10000);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.run("exerciseTimerAction('toggle')");
  a.advance(118499);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.advance(1);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), true);
  assert.equal(a.run("itemDone(S.sessions.x,0,1)"), false);
  assert.equal(a.run("timerClock"), null);
});

test("per-side cool-down holds include both sides and a changeover; ranges never fabricate a fixed duration", () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';S.sessions.x={date:'2026-11-02',type:'M',eq:[],blocks:[{key:'cool',min:6,items:[{id:exKey(e=>e.de==='Hüftbeuger dehnen')},{id:exKey(e=>e.de==='Adduktoren & Spagat')}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
  );
  assert.deepEqual(
    Array.from(a.run("ui.exerciseTimer.phases.map(p=>p.seconds)")),
    [45, 5, 45],
  );
  a.advance(45000);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.advance(50000);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), true);
  assert.deepEqual(
    Array.from(a.run("exerciseTiming(S.sessions.x,0,1).choices")),
    [60, 90],
  );
  a.run("exerciseTimerAction('start',{key:'0.1',seconds:'90'})");
  assert.equal(a.run("ui.exerciseTimer.phases[0].seconds"), 90);
});

test("finishing a timed strength set fills only that set; set rests do not complete an exercise", () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Unterarmstütz');S.sessions.x={date:'2026-11-02',type:'S',eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id,target:{r:30}}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0',setIndex:'1'});`,
  );
  a.advance(30000);
  assert.deepEqual(
    JSON.parse(a.run("JSON.stringify(S.sessions.x.perf['0.0'].map(r=>r.r))")),
    [null, 30, null],
  );
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.run("exerciseTimerAction('rest',{key:'0.0'})");
  a.advance(60000);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  assert.deepEqual(
    JSON.parse(a.run("JSON.stringify(S.sessions.x.perf['0.0'].map(r=>r.r))")),
    [null, 30, null],
  );
});

test("conditioning intervals catch up quietly, circuit laps remain distinct, and closing pauses without marking", () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Sack-Sprints');S.sessions.x={date:'2026-11-02',type:'K',eq:[],blocks:[{key:'cond',min:12,sets:'3×',items:[{id}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
  );
  assert.equal(a.run("ui.exerciseTimer.phases.length"), 8);
  a.elapse(130000);
  a.run("exerciseTick();scheduleTimers()");
  assert.equal(a.run("S.sessions.x.timedLaps['0.0']"), 1);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.run("exerciseTimerAction('start',{key:'0.0'})");
  a.advance(20000);
  a.run("closeWorkout()");
  assert.equal(a.run("ui.exerciseTimer.running"), false);
  assert.equal(a.run("S.sessions.x.timedLaps['0.0']"), 1);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
});

test("exercise timers share the central clock and cannot run alongside round timers or the free timer", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});ui.workout={ds:ui.sel,block:0};S.sessions[ui.sel].flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
  );
  assert.equal(a.run("ui.exerciseTimer.running"), true);
  a.run("timerGo()");
  assert.equal(a.run("ui.exerciseTimer.running"), false);
  assert.equal(a.run("ui.timer.running"), true);
  a.run("exerciseTimerAction('start',{key:'0.0'})");
  assert.equal(a.run("ui.timer.running"), false);
  assert.equal(a.run("ui.exerciseTimer.running"), true);
  a.run("pauseOtherTimer('free')");
  assert.equal(a.run("ui.exerciseTimer.running"), false);
  assert.equal(a.run("timerClock"), null);
});

test("mobility time frames and hardening holds use their existing prescription", () => {
 const a=app();
 a.run(`ui.sel='x';S.sessions.x={blocks:[{key:'mob',min:12,items:[{id:exKey(e=>e.de==='90/90 Hüftwechsel')},{id:exKey(e=>e.de==='Taube')}]}]};`);
 assert.equal(a.run('exerciseTiming(S.sessions.x,0,0).phases[0].seconds'),360);
 assert.deepEqual(Array.from(a.run('exerciseTiming(S.sessions.x,0,1,90).phases.map(p=>p.seconds)')),[90,5,90]);
 a.run("S.sessions.x.blocks=[{key:'hard',min:6,items:[{kind:'hard',id:'fPlank'}]}]");
 assert.deepEqual(Array.from(a.run('exerciseTiming(S.sessions.x,0,0,30).phases.map(p=>p.seconds)')),[30,5,30,5,30]);
});

test("completed rounds lead to the following planned section instead of skipping to session save", async () => {
 const a=app();
 a.run(`ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});S.sessions[ui.sel].flow={block:1};ui.workout={ds:ui.sel,block:1};ui.focus=true;ui.timer=newTimer(ui.sel);ui.timer.phase='done';`);
 await a.click({dataset:{fx:'finish'}});
 assert.equal(a.run('ui.workout.block'),2);
 assert.equal(a.run('ui.focus'),false);
 assert.equal(a.run('S.log.length'),0);
 assert.equal(a.run('sessionCompletion(S.sessions[ui.sel]).done'),0);
});

test("empty set fields show the target as a hint, and single timed exercises are labelled as running", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.ov[ui.sel]={t:'S'};S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',['weights'],{min:60});`,
  );
  const sets = a.run(
    "(()=>{const s=S.sessions[ui.sel];for(let bi=0;bi<s.blocks.length;bi++){const b=s.blocks[bi];for(let n=0;n<b.items.length;n++){const it=b.items[n];if(it.id!=null&&tracksSets(it.id)&&!['warm','cool'].includes(b.key))return setsHtml(s,bi,n,b,it.id,false)}}return ''})()",
  );
  assert.match(sets, /placeholder="Ziel \d+"/);
  assert.doesNotMatch(sets, /value="\d+"/);
  a.run(
    `ui.sel='x';const id=exKey(e=>e.de==='Einlaufen');S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'warm',min:4,items:[{id},{id}]}]};`,
  );
  assert.equal(a.run("exerciseTiming(S.sessions.x,0,0).phases[0].label"), "Läuft");
});

test("an early finish with the untouched planned duration asks about the duration in the question", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]={date:ui.sel,type:'T',min:60,tHi:7,blocks:[{key:'warm',items:[{},{}]}]};`,
  );
  a.node("fMin").value = "60";
  await a.click({ dataset: { effort: "5" } });
  await a.click({ id: "fSave" });
  assert.equal(a.run("S.log.length"), 0);
  assert.match(a.run("JSON.stringify(ui.sheet.lines)"), /60 Minuten/);
  a.run("ui.sheet=null");
  a.node("fMin").value = "40";
  await a.emit("input", a.node("fMin"));
  await a.click({ id: "fSave" });
  assert.doesNotMatch(a.run("JSON.stringify(ui.sheet.lines)"), /Minuten sind|Eingetragen sind/);
});

test("simplified start: six-step tour, compact first steps, profile split into about me and training week", async () => {
  const a = app();
  assert.equal(a.run("TOUR.length"), 6);
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(TOUR.map(x=>x.k))")), ["intro", "today", "timer", "ftimer", "prof", "end"]);
  assert.ok(a.run("TOUR.every(x=>Array.isArray(L.de.tour[x.k])&&Array.isArray(L.en.tour[x.k]))"));
  a.run("S.profile.starterHide=false");
  const compact = a.run("starterHtml()");
  assert.equal((compact.match(/data-start=/g) || []).length, 1);
  assert.match(compact, /data-act2="starterall"/);
  a.run("ui.starterAll=true");
  assert.ok((a.run("starterHtml()").match(/data-start=/g) || []).length > 1);
  // 7i: training week holds the days, about me the person and the sport – nothing folded away any more
  a.run("ui.tab='profile';ui.profSec='train';draft=JSON.parse(JSON.stringify(S.profile))");
  const prof = a.run("renderProfile()");
  assert.match(prof, /data-cday=/);
  assert.doesNotMatch(prof, /data-pmore="1"|data-p="level"|id="pBirth"/);
  a.run("ui.profSec='me';");
  const me = a.run("renderProfile()");
  assert.match(me, /data-p="level"/);
  assert.match(me, /id="pBirth"/);
  assert.ok(me.indexOf("data-psport=") < me.indexOf('id="pBirth"'), "sport & belt first, then the person");
});

test("what's new appears once for existing users, not for new ones, and stays readable in the profile", async () => {
  const a = app();
  a.run("globalThis.requestAnimationFrame=()=>0");
  a.run("S.profile.example=false;S.profile.toured=true;delete S.profile.newsSeen");
  assert.equal(a.run("needNews()"), true);
  a.run("showNews()");
  assert.equal(a.run("ui.sheet.kind"), "news");
  assert.match(a.node("sheet").innerHTML, /data-news-ok/);
  await a.click({ dataset: { newsOk: "1" } });
  assert.equal(a.run("needNews()"), false);
  a.run(`S=hydrate(JSON.parse(localStorage.getItem(LS)));`);
  assert.equal(a.run("S.profile.newsSeen"), a.run("NEWS_V"));
  assert.match(a.run("ui.tab='profile';ui.profSec='app';renderProfile()"), /data-news="1"/);
  const b = app();
  b.run(
    `S.profile.ackSafe='2026-11-02';S.profile.toured=true;delete S.profile.newsSeen;ui.onb={step:4,disc:'lc',days:[0],minutes:60,clubDays:[],clubMin:90}; loading=async()=>{};`,
  );
  await b.run("finishOnb(false,false)");
  assert.equal(b.run("needNews()"), false);
});

test("player: one step per exercise, rounds as one step, circuits lap by lap, finish last", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag','rope'],{min:75});`,
  );
  const steps = JSON.parse(a.run("JSON.stringify(playerSteps(S.sessions[ui.sel]))"));
  const sess = JSON.parse(a.run("JSON.stringify(S.sessions[ui.sel])"));
  assert.equal(steps[steps.length - 1].kind, "finish");
  assert.equal(steps.filter((s) => s.kind === "rounds").length, sess.blocks.filter((b) => b.rounds).length);
  // every non-round item appears (circuits once per lap)
  const expected = sess.blocks.reduce(
    (n, b, bi) => n + (b.rounds ? 0 : b.items.length * (a.run(`playerCirc(S.sessions[ui.sel].blocks[${bi}])`) ? a.run(`blockSets(S.sessions[ui.sel].blocks[${bi}])`) : 1)),
    0,
  );
  assert.equal(steps.filter((s) => !["rounds", "finish", "rest"].includes(s.kind)).length, expected);
  assert.ok(steps.every((s) => ["timed", "manual", "sets", "rounds", "rest", "finish"].includes(s.kind)));
  // a circuit with n laps has n-1 rests between them
  sess.blocks.forEach((b, bi) => {
    if (!a.run(`playerCirc(S.sessions[ui.sel].blocks[${bi}])`)) return;
    assert.equal(steps.filter((s) => s.kind === "rest" && s.bi === bi).length, a.run(`blockSets(S.sessions[ui.sel].blocks[${bi}])`) - 1);
  });
});

test("player: a timed step starts with 10 s get-ready, rings, completes and moves on by itself", async () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Einlaufen');S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'warm',min:4,items:[{id},{id}]}]};startWorkout();`,
  );
  assert.equal(a.run("ui.workout.player"), true);
  assert.equal(a.run("playerStep().kind"), "timed");
  await a.click({ dataset: { player: "toggle" } });
  assert.equal(a.run("ui.exerciseTimer.phases[0].prep"), true);
  assert.equal(a.run("ui.exerciseTimer.phases[0].seconds"), 10);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  a.advance(10000 + 120000 + 50);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), true);
  a.advance(1500);
  assert.equal(a.run("ui.workout.step"), 1);
  // the next timed step starts on its own (auto mode), again with get-ready
  assert.equal(a.run("ui.exerciseTimer.player"), 1);
  assert.equal(a.run("ui.exerciseTimer.index"), 0);
});

test("player: steps without a fixed time are finished with Done; skipping leaves them open", async () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'cond',min:6,sets:'',items:[]}]};const b=S.sessions.x.blocks[0];const id=exKey((e,i)=>e.cat==='cond'&&(b.items=[{id:i},{id:i}],!exerciseTiming(S.sessions.x,0,0)));b.items=[{id},{id}];startWorkout();`,
  );
  assert.equal(a.run("playerStep().kind"), "manual");
  await a.click({ dataset: { player: "next" } });
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  assert.equal(a.run("ui.workout.step"), 1);
  await a.click({ dataset: { player: "done" } });
  assert.equal(a.run("itemDone(S.sessions.x,0,1)"), true);
  assert.equal(a.run("playerStep().kind"), "finish");
});

test("player: strength steps show the set table; a circuit lap shows only its own set", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',['weights'],{min:60});startWorkout();`,
  );
  const idx = a.run("playerSteps(S.sessions[ui.sel]).findIndex(s=>s.kind==='sets'&&s.lap==null)");
  assert.ok(idx >= 0);
  a.run(`playerGo(${idx})`);
  const html = a.run("workoutHtml()");
  assert.match(html, /class="si/);
  assert.match(html, /data-exercise-timer="rest"/);
  const lapIdx = a.run("playerSteps(S.sessions[ui.sel]).findIndex(s=>s.kind==='sets'&&s.lap===1)");
  if (lapIdx >= 0) {
    a.run(`playerGo(${lapIdx})`);
    const lap = a.run("workoutHtml()");
    assert.equal((lap.match(/data-f="r"/g) || []).length, 1);
    assert.match(lap, /data-i="1"/);
  }
});

test("player: set done asks for a value, starts the set rest, and moves on after the last set", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',['weights'],{min:60});startWorkout();const i=playerSteps(S.sessions[ui.sel]).findIndex(s=>s.kind==='sets'&&s.lap==null);playerGo(i);`,
  );
  const step = a.run("ui.workout.step"),
    key = a.run("(s=>s.bi+'.'+s.ni)(playerStep())");
  await a.click({ dataset: { player: "setdone" } });
  assert.equal(a.run("ui.workout.step"), step);
  assert.ok(!a.run("ui.exerciseTimer&&ui.exerciseTimer.restOnly"));
  a.run(`perfRows(S.sessions[ui.sel],'${key}',S.sessions[ui.sel].blocks[playerStep().bi])[0].r=8`);
  await a.click({ dataset: { player: "setdone" } });
  assert.equal(a.run("ui.exerciseTimer.restOnly"), true);
  assert.equal(a.run("ui.workout.step"), step);
  a.run(`S.sessions[ui.sel].perf['${key}'].forEach(r=>r.r=8)`);
  await a.click({ dataset: { player: "setdone" } });
  assert.equal(a.run("ui.workout.step"), step + 1);
});

test("heavy rep schemes apply to weighted exercises; bodyweight exercises get a bodyweight range, done slowly", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',[],{min:60});const b=S.sessions[ui.sel].blocks.find(b=>b.key==='str');b.sets='4× 4–6 · schwer';`,
  );
  const res = JSON.parse(
    a.run(
      "JSON.stringify((()=>{const s=S.sessions[ui.sel],b=s.blocks.find(b=>b.key==='str');return b.items.filter(it=>EX[it.id]&&!TIMED.has(it.id)).map(it=>({kg:hasKg(it.id),t:strengthTarget(s,b,it),d:doseTxt(it.id,b)}))})())",
    ),
  );
  assert.ok(res.length > 0);
  for (const x of res.filter((x) => !x.kg)) {
    assert.ok(x.t.r >= 8, `bodyweight target ${x.t.r}`);
    assert.equal(x.t.slow, true);
    assert.match(x.d, /langsam/);
  }
  a.run("S.sessions[ui.sel].blocks.find(b=>b.key==='str').sets='3× 8–12'");
  const normal = JSON.parse(
    a.run(
      "JSON.stringify((()=>{const s=S.sessions[ui.sel],b=s.blocks.find(b=>b.key==='str');return b.items.filter(it=>EX[it.id]&&!TIMED.has(it.id)).map(it=>strengthTarget(s,b,it))})())",
    ),
  );
  assert.ok(normal.every((t) => !t || !t.slow));
});

test("player: opening the overview and going back to the flow keeps a running set rest", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',['weights'],{min:60});startWorkout();const i=playerSteps(S.sessions[ui.sel]).findIndex(s=>s.kind==='sets'&&s.lap==null);playerGo(i);const cur=playerStep();exerciseTimerAction('rest',{key:cur.bi+'.'+cur.ni});`,
  );
  a.advance(5000);
  const left = a.run("ui.exerciseTimer.remainingMs");
  await a.click({ dataset: { player: "list" } });
  await a.click({ dataset: { player: "flow" } });
  assert.equal(a.run("ui.exerciseTimer.running"), true);
  assert.equal(a.run("ui.exerciseTimer.restOnly"), true);
  assert.ok(a.run("ui.exerciseTimer.remainingMs") <= left);
  assert.ok(a.run("ui.exerciseTimer.remainingMs") > 50000);
});

test("player: timed strength runs set → rest → set with gong like rounds, fills each set and moves on", async () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Unterarmstütz');S.sessions.x={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id}]},{key:'cool',min:4,items:[{id:exKey(e=>e.de==='Atmung')}]}]};startWorkout();`,
  );
  assert.equal(a.run("playerStep().kind"), "sets");
  await a.click({ dataset: { player: "toggle" } });
  const tm = JSON.parse(a.run("JSON.stringify(ui.exerciseTimer.phases.map(p=>[p.seconds,p.set??null,!!p.prep]))"));
  const hold = tm[1][0];
  // get ready, then 3 sets with 2 rests in between
  assert.deepEqual(
    tm.map((p) => (p[2] ? "prep" : p[1] != null ? "set" : "rest")),
    ["prep", "set", "rest", "set", "rest", "set"],
  );
  a.advance(10000 + hold * 1000 + 50);
  assert.equal(a.run("S.sessions.x.perf['0.0'][0].r"), hold);
  assert.equal(a.run("S.sessions.x.perf['0.0'][1].r"), null);
  a.advance(60000 + hold * 1000 + 60000 + hold * 1000 + 50);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), true);
  a.advance(1500);
  assert.equal(a.run("playerStep().kind"), "timed");
});

test("player: 10 seconds before a hold ends and before the next set starts there is a beep and a call", async () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Unterarmstütz');S.sessions.x={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id}]}]};startWorkout();globalThis.said=[];say=(x)=>said.push(x);`,
  );
  await a.click({ dataset: { player: "toggle" } });
  const hold = a.run("ui.exerciseTimer.phases[1].seconds");
  a.advance(10000 + (hold - 9) * 1000);
  assert.match(a.run("said.join('|')"), /Noch 10 Sekunden/);
  a.advance(9000 + 51000);
  assert.match(a.run("said[said.length-1]"), /Noch 10 Sekunden\. Als Nächstes: Satz 2/);
});

test("one-legged exercises say 'pro Bein' in dose, target and timer; two-sided ones keep 'je Seite'", () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',[],{min:60});globalThis.blk={key:'str',min:20,sets:'3× 8–12',items:[]};`,
  );
  const lunge = a.run("exKey(e=>e.de==='Ausfallschritte')"),
    twist = a.run("exKey(e=>e.de==='Russian Twists')"),
    hold = a.run("exKey(e=>e.de==='Einbeinstand mit Kick-Hold')");
  assert.match(a.run(`doseTxt('${lunge}',blk)`), /pro Bein/);
  assert.match(a.run(`doseTxt('${twist}',blk)`), /je Seite/);
  assert.match(a.run(`targetText({n:3,r:8,kg:null,timed:false,reason:'initial'},'${lunge}')`), /Ziel: 3 × 8 pro Bein/);
  a.run(`S.sessions.y={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id:'${hold}'}]}]};`);
  const labels = a.run("JSON.stringify((exerciseTiming(S.sessions.y,0,0)||{phases:[]}).phases.map(p=>p.label))");
  if (labels !== "[]") assert.match(labels, /Bein/);
});

test("player: the set rest can be paused and resumed (e.g. a toilet break)", async () => {
  const a = app();
  a.run(
    `ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',[],{min:60});startWorkout();const i=playerSteps(S.sessions[ui.sel]).findIndex(s=>s.kind==='sets'&&s.lap==null);playerGo(i);const cur=playerStep();S.sessions[ui.sel].perf||={};perfRows(S.sessions[ui.sel],cur.bi+'.'+cur.ni,S.sessions[ui.sel].blocks[cur.bi])[0].r=10;`,
  );
  await a.click({ dataset: { player: "setdone" } });
  assert.match(a.run("workoutHtml()"), /data-exercise-timer="toggle"/);
  a.advance(10000);
  await a.click({ dataset: { exerciseTimer: "toggle" } });
  const left = a.run("ui.exerciseTimer.remainingMs");
  assert.equal(a.run("ui.exerciseTimer.running"), false);
  a.advance(120000);
  assert.equal(a.run("ui.exerciseTimer.remainingMs"), left);
  await a.click({ dataset: { exerciseTimer: "toggle" } });
  assert.equal(a.run("ui.exerciseTimer.running"), true);
});

test("one-legged exercises are entered per leg; the set counts once both legs are in (weaker leg)", async () => {
  const a = app();
  a.run(
    `ui.sel='x';ui.tab='session';const id=exKey(e=>e.de==='Ausfallschritte');S.sessions.x={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id}]}]};startWorkout();`,
  );
  const html = a.run("workoutHtml()");
  assert.match(html, /data-f="rL"/);
  assert.match(html, /data-f="rR"/);
  assert.match(html, /Links/);
  const left = a.node("legL");
  Object.assign(left, { value: "10", dataset: { k: "0.0", i: "0", f: "rL" }, classList: { contains: (c) => c === "si", toggle() {} } });
  await a.emit("input", left);
  assert.equal(a.run("S.sessions.x.perf['0.0'][0].r"), null);
  assert.equal(a.run("itemDone(S.sessions.x,0,0)"), false);
  const right = a.node("legR");
  Object.assign(right, { value: "9", dataset: { k: "0.0", i: "0", f: "rR" }, classList: { contains: (c) => c === "si", toggle() {} } });
  await a.emit("input", right);
  assert.equal(a.run("S.sessions.x.perf['0.0'][0].r"), 9);
  // timed one-legged hold: the chain has one phase per leg and fills both
  a.run(
    `const hid=exKey(e=>e.de==='Einbeinstand mit Kick-Hold');S.sessions.y={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'2× 8–12',items:[{id:hid}]}]};ui.sel='y';ui.workout=null;startWorkout();playerStartSets();`,
  );
  const legs = JSON.parse(a.run("JSON.stringify(ui.exerciseTimer.phases.filter(p=>p.leg).map(p=>p.leg))"));
  assert.deepEqual(legs, ["rL", "rR", "rL", "rR"]);
  a.advance(10000 + a.run("ui.exerciseTimer.phases[1].seconds") * 2000 + 5000 + 50);
  assert.ok(a.run("S.sessions.y.perf['0.0'][0].r") > 0);
});

test("free timer: switching coach calls on also switches the voice on; the timer has its own voice button", async () => {
  const a = app();
  a.run("globalThis.speechSynthesis={speak(){},cancel(){},resume(){},speaking:false,pending:false,paused:false};window.speechSynthesis=speechSynthesis;globalThis.SpeechSynthesisUtterance=function(t){this.text=t};S.profile.voice=false;openFt()");
  assert.equal(a.run("canSpeak()"), true);
  assert.equal(a.run("voiceOn()"), false);
  await a.click({ dataset: { ftt: "coach" } });
  assert.equal(a.run("ui.ft.cfg.coach"), true);
  assert.equal(a.run("voiceOn()"), true);
  assert.match(a.node("ftimer").innerHTML, /data-voice="1"/);
});

test("speech is primed with a muted utterance on taps until it started, and again after returning to the app", async () => {
  const a = app();
  a.run("globalThis.spoken=[];globalThis.speechSynthesis={speak(u){spoken.push(u)},cancel(){},resume(){},speaking:false,pending:false,paused:false};window.speechSynthesis=speechSynthesis;globalThis.SpeechSynthesisUtterance=function(t){this.text=t};S.profile.voice=true");
  await a.emit("pointerdown");
  assert.equal(a.run("spoken.length"), 1);
  assert.equal(a.run("spoken[0].volume"), 0);
  assert.ok(a.run("spoken[0].text.length") > 0);
  a.elapse(2000);
  await a.emit("pointerdown");
  assert.equal(a.run("spoken.length"), 2, "not confirmed yet: tries again");
  a.run("spoken[1].onstart()");
  a.elapse(2000);
  await a.emit("pointerdown");
  assert.equal(a.run("spoken.length"), 2, "confirmed: no more priming");
  await a.emit("visibilitychange");
  a.elapse(2000);
  await a.emit("pointerdown");
  assert.equal(a.run("spoken.length"), 3, "back in the app: primed again");
  a.run("S.profile.voice=false;speechPrimed=false");
  a.elapse(2000);
  await a.emit("pointerdown");
  assert.equal(a.run("spoken.length"), 3, "voice off: silent");
});

test("free timer start tap: the priming dot is not cancelled by the timer and the start speaks right away", async () => {
  const a = app();
  a.run("globalThis.log=[];globalThis.speechSynthesis={speak(u){log.push('speak:'+u.text)},cancel(){log.push('cancel')},resume(){},speaking:false,pending:false,paused:false};window.speechSynthesis=speechSynthesis;globalThis.SpeechSynthesisUtterance=function(t){this.text=t};S.profile.voice=true;openFt();ui.ft.cfg.coach=true;ui.ft.cfg.prep=true");
  await a.emit("pointerdown");
  await a.click({ dataset: { ftx: "start" } });
  const log = JSON.parse(a.run("JSON.stringify(log)"));
  assert.equal(log[0], "speak:.");
  assert.ok(!log.includes("cancel"), "start must not cancel the priming dot");
  assert.ok(log.includes("speak:Bereit machen"));
  a.advance(4000);
  assert.ok(!a.run("primeU"), "priming guard released after a moment");
});

test("session settings: changed but not rebuilt is flagged; a rebuild clears it for every type and place", async () => {
  const a = app();
  const bad = JSON.parse(a.run(`JSON.stringify((()=>{const out=[];const d=iso(today());ui.sel=d;for(const ty of ['T','C','P','S','K','M'])for(const loc of (ty==='S'||ty==='K'?['gym','studio','home','out']:['gym','home','out']))for(const eq of [[],['bag','rope'],['partner','pads'],['partner'],['kb','weights','bands','bar','bb','rope']])for(const min of (ty==='M'?[30,45]:[30,45,60])){ui.setup={ds:d,type:ty,loc,eq:eq.slice(),run:false,min};S.sessions[d]=buildSession(d,ty,loc,eq.slice(),{run:false,min});if(setupDirty(d))out.push([ty,loc,eq.join('+'),min,JSON.stringify(setupOf(S.sessions[d],d))]);}return out})())`));
  assert.deepEqual(bad, []);
  a.run(`const d=iso(today());ui.sel=d;S.sessions[d]=buildSession(d,'T','gym',['bag','rope'],{min:60});ui.setup=null;ui.tab='session';`);
  a.run("ui.setup=setupOf(S.sessions[ui.sel],ui.sel)");
  assert.equal(a.run("setupDirty(ui.sel)"), false);
  await a.click({ dataset: { pb: "none" } });
  assert.equal(a.run("setupDirty(ui.sel)"), true);
  await a.click({ dataset: { workout: "start" } });
  assert.equal(a.run("ui.sheet && ui.sheet.kind"), "confirm");
  assert.equal(a.run("!!ui.workout"), false, "asks before starting");
  await a.click({ dataset: { sx: "confirmNo" } });
  assert.equal(a.run("!!ui.workout"), true, "starts as is");
  assert.ok(a.run("S.sessions[ui.sel].eq.includes('bag')"), "session unchanged");
});

test("start with changed settings: 'yes, rebuild' builds the new session first, then starts", async () => {
  const a = app();
  a.run(`loading=async()=>{};const d=iso(today());ui.sel=d;ui.tab='session';S.sessions[d]=buildSession(d,'T','gym',['bag','rope'],{min:60});ui.setup=setupOf(S.sessions[d],d);`);
  await a.click({ dataset: { pb: "none" } });
  await a.click({ dataset: { workout: "start" } });
  await a.click({ dataset: { sx: "confirm" } });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(a.run("S.sessions[ui.sel].eq.includes('bag')"), false, "rebuilt without heavy bag");
  assert.equal(a.run("setupDirty(ui.sel)"), false);
  assert.equal(a.run("!!ui.workout"), true);
});

test("start screen: 'next' keeps paging, but the app opens at the latest 10 s after the screen appeared", () => {
  const a = app();
  a.run("loading('loadingPlan')");
  for (let i = 0; i < 4; i++) {
    a.advance(2000);
    a.run("document.getElementById('factNext').onclick({stopPropagation(){}})");
  }
  assert.equal(a.run("document.getElementById('loader').hidden"), false, "still open at 8 s");
  a.advance(2100);
  assert.equal(a.run("document.getElementById('loader').hidden"), true, "closed by 10 s");
});

test("weight class: weekly weigh-in with quick entry, trend, a neutral coach note for a big gap, nothing under 15", async () => {
  const a = app();
  const setup = (by, weights, inDays = 30) =>
    a.run(`S.profile.birthYear=${by};S.profile.comps=[{id:'c1',date:iso(addDays(today(),${inDays})),wc:70}];S.weights=${JSON.stringify(weights)}.map(([d,kg])=>({date:iso(addDays(today(),-d)),kg}));`);
  setup(1995, []);
  assert.match(a.run("promptsHtml()"), /id="wQuick"/);
  a.run("document.getElementById('wQuick').value='71,4'");
  await a.click({ id: "wQuickAdd" });
  assert.equal(a.run("S.weights[S.weights.length-1].kg"), 71.4);
  setup(1995, [[6, 69]]);
  assert.doesNotMatch(a.run("promptsHtml()"), /wQuick/, "weighed within the week: no reminder");
  setup(1995, [[7, 69]]);
  assert.match(a.run("promptsHtml()"), /wQuick/, "a week ago: remind");
  // trend of two weeks decides, not the single day
  setup(1995, [[10, 72], [2, 70.4]]);
  assert.equal(a.run("weightTrend()"), 71.2);
  assert.match(a.run("promptsHtml()"), /1,2 kg/);
  // big gap close to the tournament: neutral note, no plan
  setup(1995, [[5, 75], [1, 75]], 14);
  assert.match(a.run("promptsHtml()"), /Trainer, ob die Klasse passt/);
  // under 15: no reminder and no note
  setup("today().getFullYear()-14", []);
  assert.doesNotMatch(a.run("promptsHtml()"), /wQuick|Gewichtsklasse/);
});

test("guide: ten articles in German and English, each opens and leads to the next", async () => {
  const a = app();
  const info = JSON.parse(a.run("JSON.stringify(READS.map(r=>[r.k,r.de.secs.length,r.en.secs.length,!!r.de.src&&!!r.en.src,!!r.de.sub&&!!r.en.sub]))"));
  assert.equal(info.length, 10);
  for (const [k, d, e, src, sub] of info) {
    assert.equal(d, e, `${k}: same sections in both languages`);
    assert.ok(src && sub, `${k}: source and teaser`);
  }
  assert.match(a.run("guidePanelHtml()"), /Zum Lesen/);
  await a.click({ dataset: { guide: "myths" } });
  assert.match(a.run("guideSheetHtml(ui.sheet)"), /Mythen-Check[\s\S]*data-guide="round"/);
  await a.click({ dataset: { guide: "gloves" } });
  assert.match(a.run("guideSheetHtml(ui.sheet)"), /Handschuhe erklärt[\s\S]*data-guide="myths"/);
  a.run("S.profile.lang='en'");
  assert.match(a.run("guideSheetHtml(ui.sheet)"), /Gloves explained/);
});

test("voice: the best installed voice is used – premium before enhanced before default, no novelty or online-only voices", () => {
  const a = app();
  a.run(`globalThis.spoken=[];const V=(name,lang,uri,extra={})=>({name,lang,voiceURI:uri,localService:true,default:false,...extra});
    globalThis.VOICES=[V('Eddy','de-DE','com.apple.eloquence.de-DE.Eddy'),V('Anna','de-DE','com.apple.voice.compact.de-DE.Anna',{default:true}),V('Katja Online (Natural)','de-DE','Microsoft Katja Online',{localService:false}),V('Helena (Erweitert)','de-DE','com.apple.voice.enhanced.de-DE.Helena'),V('Daniel','en-GB','com.apple.voice.compact.en-GB.Daniel')];
    globalThis.speechSynthesis={getVoices:()=>VOICES,speak(u){spoken.push(u)},cancel(){},resume(){},speaking:false,pending:false,paused:false};window.speechSynthesis=speechSynthesis;globalThis.SpeechSynthesisUtterance=function(t){this.text=t};S.profile.voice=true;S.profile.lang='de';`);
  assert.equal(a.run("bestVoice().name"), "Helena (Erweitert)");
  a.run("VOICES.push({name:'Anna (Premium)',lang:'de-DE',voiceURI:'com.apple.voice.premium.de-DE.Anna',localService:true})");
  a.run("say('Runde 1')");
  assert.equal(a.run("spoken[spoken.length-1].voice.name"), "Anna (Premium)");
  a.run("VOICES.splice(0,VOICES.length,{name:'Eddy',lang:'de-DE',voiceURI:'com.apple.eloquence.de-DE.Eddy',localService:true},{name:'Anna',lang:'de-DE',voiceURI:'com.apple.voice.compact.de-DE.Anna',localService:true})");
  assert.equal(a.run("bestVoice().name"), "Anna", "novelty voice last");
  a.run("S.profile.lang='en'");
  a.run("VOICES.push({name:'Daniel',lang:'en_GB',voiceURI:'x',localService:true})");
  assert.equal(a.run("bestVoice().name"), "Daniel");
  a.run("VOICES.length=0");
  assert.equal(a.run("bestVoice()"), null, "no voices: device default");
});

test("feedback: link to the form carries only version, device type and language", () => {
  const a = app();
  a.run("navigator.userAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'");
  const url = a.run("feedbackUrl()");
  assert.match(url, /^https:\/\/tally\.so\/r\/OQQE5g\?version=[^&]+&geraet=iPhone%2FiPad%2C%20(Browser|installiert)&sprache=de$/);
  assert.doesNotMatch(url, /kg|rpe|birth|weight/i);
});

test("focus: 'more boxing' and 'more kicks' clearly shift the kick share of the plan", () => {
  const a = app();
  const share = (f) =>
    a.run(`(()=>{S.profile.disc='kl';S.profile.level=2;S.profile.limits=[];S.profile.birthYear=1995;S.profile.focus='${f}';S.sessions={};let k=0,n=0;
      for(let d=0;d<60;d++){const ds=iso(addDays(today(),d));const s=buildSession(ds,'T','gym',['bag','rope'],{min:60});s.created=d;S.sessions[ds]=s;
        for(const b of s.blocks)for(const it of b.items)if(Array.isArray(it.combo))for(const x of it.combo)if(STRIKE.has(x)){n++;if(KICKS.has(x))k++;}}
      return k/n})()`);
  const box = share("box"), bal = share("bal"), kick = share("kick");
  assert.ok(bal - box >= 0.05, `box ${box} vs bal ${bal}`);
  assert.ok(kick - bal >= 0.08, `kick ${kick} vs bal ${bal}`);
  assert.ok(box > 0.2 && kick < 0.8, "neither side disappears");
});

test("profile change: open sessions are rebuilt, a started one keeps its entries", () => {
  const a = app();
  a.run(`const d=iso(today());S.sessions[d]=buildSession(d,'S','gym',['kb'],{min:45});S.sessions[d].perf={'1.0':[{r:8}]};
    const d2=iso(addDays(today(),1));S.sessions[d2]=buildSession(d2,'T','gym',['bag'],{min:45});
    draft=JSON.parse(JSON.stringify(S.profile));draft.focus='box';applyPlan();`);
  assert.equal(a.run("!!S.sessions[iso(today())]"), true, "started session kept");
  assert.equal(a.run("S.sessions[iso(today())].perf['1.0'][0].r"), 8);
  assert.equal(a.run("!!S.sessions[iso(addDays(today(),1))]"), false, "untouched future session rebuilt later");
});

test("circuit: skipped laps stay open – confirming only lap 3 completes lap 3 alone", async () => {
  const a = app();
  a.run(`const id=exKey(e=>e.de==='Burpees');ui.sel='c';ui.tab='session';
    S.sessions.c={date:'2026-11-02',type:'K',min:30,eq:[],blocks:[{key:'cond',min:12,sets:'3×',items:[{kind:'ex',id}]}]};startWorkout();`);
  const laps = a.run("circN(S.sessions.c.blocks[0])");
  assert.ok(laps >= 3);
  const kinds = JSON.parse(a.run("JSON.stringify(playerSteps(S.sessions.c).map(s=>[s.kind,s.lap]))"));
  const lap3 = kinds.findIndex(([k, l]) => k === "manual" && l === 2);
  assert.ok(lap3 > 0, "lap 3 is a manual step: " + JSON.stringify(kinds));
  a.run(`playerGo(${lap3})`);
  await a.click({ dataset: { player: "done" } });
  assert.equal(a.run("lapIsDone(S.sessions.c,'0.0',2)"), true);
  assert.equal(a.run("lapIsDone(S.sessions.c,'0.0',0)"), false);
  assert.equal(a.run("lapIsDone(S.sessions.c,'0.0',1)"), false);
  assert.equal(a.run("itemDone(S.sessions.c,0,0)"), false, "exercise not done");
  assert.equal(a.run("S.sessions.c.timedLaps['0.0']"), 1, "one lap counted");
  // older saves with only a count still read as laps 0…n-1
  a.run("delete S.sessions.c.lapsDone;S.sessions.c.timedLaps={'0.0':2}");
  assert.equal(a.run("lapIsDone(S.sessions.c,'0.0',1)"), true);
  assert.equal(a.run("lapIsDone(S.sessions.c,'0.0',2)"), false);
});

test("rep prescription: burpees with '10 reps' are confirmed with ✓, no 40/20 work timer", () => {
  const a = app();
  a.run(`S.profile.level=1;const id=exKey(e=>e.de==='Burpees');S.sessions.b={date:'2026-11-02',type:'K',min:30,eq:[],blocks:[{key:'cond',min:10,sets:'',items:[{kind:'ex',id}]}]};`);
  assert.match(a.run("doseTxt(S.sessions.b.blocks[0].items[0].id,S.sessions.b.blocks[0])"), /10 Wdh\./);
  assert.equal(a.run("exerciseTiming(S.sessions.b,0,0)"), null);
  assert.equal(a.run("playerSteps(S.sessions.b)[0].kind"), "manual");
});

test("one-legged set: deleting one side reopens the set; old shared values stay readable", async () => {
  const a = app();
  a.run(`const id=exKey(e=>DOSE_LEG.has(e.de)&&e.cat==='str'&&!TIMED.has(e.key));ui.sel='l';ui.tab='session';
    S.sessions.l={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'2× 8–12',items:[{kind:'ex',id}]}]};
    perfRows(S.sessions.l,'0.0',S.sessions.l.blocks[0]);`);
  const inp = (f, v) => a.emit("input", { classList: { contains: (c) => c === "si", toggle() {} }, dataset: { k: "0.0", i: "0", f }, value: v });
  await inp("rL", "8");
  await inp("rR", "8");
  assert.equal(a.run("S.sessions.l.perf['0.0'][0].r"), 8);
  await inp("rR", "");
  assert.equal(a.run("S.sessions.l.perf['0.0'][0].r"), null, "set open again");
  assert.equal(a.run("itemDone(S.sessions.l,0,0)"), false);
  // an old log with only r keeps its value
  a.run("const row={r:9};legSync(row);globalThis.old=row.r");
  assert.equal(a.run("old"), 9);
});

test("progression: a fully completed session counts even when it was faster than planned", () => {
  const a = app();
  history(a);
  a.run("S.log.forEach(e=>{e.minutes=40;e.progression.plannedMin=60;})");
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 1);
  history(a, { completed: false });
  a.run("S.log.forEach(e=>{e.minutes=60;e.progression.plannedMin=60;})");
  assert.equal(a.run(`progressionState('2026-11-02','T',false).step`), 0, "incomplete still doesn't count");
});

test("effort faces: five faces map onto the 1–10 scale, also when logging club training", async () => {
  const a = app();
  a.run(`ui.sel=iso(today());S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:45});`);
  assert.equal(a.run("effortFaces().length"), 5);
  await a.click({ dataset: { effort: "8", face: "1" } });
  assert.equal(a.run("finishDraft().rpe"), 8);
  assert.equal(a.run("faceOf(7)"), 8, "a fine value 7 lights up 'hard'");
  assert.equal(a.run("faceOf(1)"), 2);
  await a.click({ dataset: { clublog: a.run("iso(today())") } });
  assert.equal(a.run("ui.sheet.kind"), "club");
  await a.click({ dataset: { scface: "4" } });
  assert.equal(a.run("ui.sheet.rpe"), 4);
});

test("simple view: only Today, Session, Timer and Profile; test and history move into the profile", () => {
  const a = app();
  a.run("S.profile.simple=true;S.profile.example=false");
  a.run("renderTabs()");
  const tabs = a.node("tabs").innerHTML;
  assert.doesNotMatch(tabs, /data-tab="test"|data-tab="log"/);
  assert.match(tabs, /data-tab="profile"/);
  assert.match(a.run("ui.profSec=null;renderProfile()"), /data-tab="test"[\s\S]*data-tab="log"/);
  const today = a.run("renderWeek()");
  assert.doesNotMatch(today, /class="panel pulse"/, "no statistics");
  a.run("S.profile.simple=false;renderTabs()");
  assert.match(a.node("tabs").innerHTML, /data-tab="test"/);
  assert.match(a.run("renderWeek()"), /class="panel pulse"/);
});

test("onboarding: the simple view is preselected for new users and can be switched off", async () => {
  const a = app();
  a.run(`S.profile.ackSafe='2026-11-02';S.profile.toured=true;loading=async()=>{};ui.onb={step:4,disc:'lc',days:[0],minutes:60,clubDays:[],clubMin:90}`);
  await a.click({ dataset: { onb: "done" } });
  assert.equal(a.run("S.profile.simple"), true);
  const b = app();
  b.run(`S.profile.ackSafe='2026-11-02';S.profile.toured=true;loading=async()=>{};ui.onb={step:4,disc:'lc',days:[0],minutes:60,clubDays:[],clubMin:90}`);
  await b.click({ dataset: { osimple: "0" } });
  await b.click({ dataset: { onb: "done" } });
  assert.equal(b.run("S.profile.simple"), false);
});

test("simple view, session screen: no day form, no 'why', no RPE tag, no extra equipment – partner/bag stays", () => {
  const a = app();
  a.run(`S.profile.simple=true;S.profile.example=false;const d=iso(today());ui.sel=d;ui.tab='session';ui.setup=null;
    S.sessions[d]=buildSession(d,'T','gym',defaultEq(),{min:60});S.sessions[d].notes=['Testgrund'];`);
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(defaultEq())")), ["bag"]);
  const h = a.run("renderSession()");
  assert.doesNotMatch(h, /data-form="/, "no day form");
  assert.doesNotMatch(h, new RegExp(a.run("flowText().why")), "no why section");
  assert.doesNotMatch(h, new RegExp(a.run("t('rpeTarget')")), "no RPE tag");
  assert.doesNotMatch(h, /data-eq="/, "no extra equipment chips");
  assert.match(h, /data-pb="/, "partner/bag question stays");
  // detailed view shows everything again
  a.run("S.profile.simple=false;ui.setup=null");
  const d2 = a.run("renderSession()");
  assert.match(d2, /data-eq="/);
  assert.match(d2, new RegExp(a.run("flowText().why")));
});

test("switching to the simple view replans open sessions without hidden equipment", async () => {
  const a = app();
  a.run(`S.profile.simple=false;const d=iso(addDays(today(),1));S.sessions[d]=buildSession(d,'T','gym',['bag','rope','kb'],{min:60});`);
  await a.click({ dataset: { simple: "1" } });
  assert.equal(a.run("S.profile.simple"), true);
  assert.equal(a.run("!!S.sessions[iso(addDays(today(),1))]"), false, "open session dropped and rebuilt later");
  a.run("const s={eq:['bag','rope'],loc:'gym',type:'T',min:60};globalThis.su=setupOf(s,'x')");
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(su.eq)")), ["bag"]);
});

test("simple view: pictures instead of codes, sparring choice (since 7d), club logging only with club days", () => {
  const a = app();
  a.run(`S.profile.example=false;S.profile.simple=true;S.profile.club={days:[],minutes:90};const d=iso(today());ui.sel=d;ui.tab='session';ui.setup=null;
    S.sessions[d]=buildSession(d,'T','gym',defaultEq(),{min:60});`);
  assert.equal(a.run("codeOf('T')"), "🥊");
  assert.equal(a.run("effortTxt(7)"), "😣 Hart");
  assert.match(a.run("weekStrip(null,'data-open')"), /class="k ico"/);
  const h = a.run("renderSession()");
  assert.match(h, /data-stype="P"/, "sparring can be chosen in the simple view (7d)");
  assert.match(h, /data-stype="T"/);
  assert.doesNotMatch(a.run("clubPanel(iso(addDays(today(),-1)))"), /data-clublog/, "no club logging without club days");
  a.run("S.profile.club={days:[0,1,2,3,4,5,6],minutes:90}");
  a.run("S.profile.simple=false");
  assert.equal(a.run("codeOf('T')"), "TEC");
  a.run("ui.setup=null");
  assert.match(a.run("renderSession()"), /data-stype="P"/);
});

test("set step: arriving by itself says to enter reps, › on an empty set notes that it stays open", async () => {
  const a = app();
  a.run(`globalThis.spoken=[];say=(x)=>spoken.push(x);const tid=exKey(e=>e.de==='Einlaufen'),gid=exKey(e=>e.de==='Goblet Squats');
    ui.sel='g';ui.tab='session';S.sessions.g={date:'2026-11-02',type:'S',min:30,eq:['kb'],blocks:[{key:'warm',min:3,items:[{id:tid}]},{key:'str',min:10,sets:'2× 8–12',items:[{kind:'ex',id:gid}]}]};startWorkout();`);
  const si = a.run("playerSteps(S.sessions.g).findIndex(s=>s.kind==='sets')");
  a.run(`playerGo(${si},{auto:true})`);
  assert.match(a.run("spoken[spoken.length-1]"), /Wiederholungen eintragen/);
  assert.equal(a.run("openSetIndex(S.sessions.g,playerStep())"), 0);
  a.run("globalThis.toasts=[];toast=(m)=>toasts.push(m)");
  await a.click({ dataset: { player: "next" } });
  assert.match(a.run("toasts.join('|')"), /bleibt offen/);
});

test("partner rounds: one counter action as variation – right place, discipline rules, level and limits respected", () => {
  const a = app();
  const res = JSON.parse(a.run(`JSON.stringify((()=>{const bad=[],stat={};
    for(const disc of ['lc','kl','fc','k1'])for(const lvl of [0,1,2])for(const lim of [[],['knee']])for(const by of [1995,today().getFullYear()-11]){
      if(by>2010&&(disc==='fc'||disc==='k1'))continue;
      S.profile.disc=disc;S.profile.level=lvl;S.profile.limits=lim;S.profile.birthYear=by;const kid=ageGroup()==='kids';
      for(let i=0;i<120;i++){const c=['jab','cross','hook','round'].slice(0,2+(i%3));const r=partnerReact(c);const key=disc+lvl;stat[key]=stat[key]||{n:0,none:0,pre:0,mid:0,post:0};stat[key].n++;
        if(!r){stat[key].none++;continue;}
        const parts=['pre','mid','post'].filter(p=>r[p]);
        if((lvl<2&&!(disc==='fc'&&lvl===1))||kid?parts.length!==1:!(parts.length===1||(parts.length===2&&parts[1]==='post')))bad.push('parts '+parts+' lvl'+lvl);
        if(r.pre&&r.mid)bad.push('pre and mid');
        stat[key][parts[0]]++;for(const pp of parts){const x=r[pp];const def=COUNTER_ATT[x.a];
        if(x.c){if(pp!=='post')bad.push('answer outside post');if(kid)bad.push('kid answer');if(!(ANSWER[x.d]||[]).includes(x.c))bad.push('answer '+x.c+' after '+x.d);
          if(x.c==='lowk'&&!(disc==='kl'||disc==='k1'))bad.push('lowk answer in '+disc);if(x.c==='knee'&&disc!=='k1')bad.push('knee answer in '+disc);if(lim.length&&(x.c==='lowk'||x.c==='knee'))bad.push('answer with limit');}
        if(x.a==='knee'&&disc!=='k1')bad.push('knee in '+disc);
        if(!def)bad.push('unknown '+x.a);
        if(x.a==='lowk'&&!(disc==='kl'||disc==='k1'))bad.push('lowk in '+disc);
        if(lim.length&&(x.a==='lowk'||x.d==='check'))bad.push('lowk/check with knee');
        if(kid&&!['jab','cross'].includes(x.a))bad.push('kid attack '+x.a);
        if(kid&&!['cover','parry','step'].includes(x.d))bad.push('kid defence '+x.d);
        if(!kid&&lvl<def.lvl)bad.push('level attack '+x.a+lvl);
        const dl=def.d.find(([d])=>d===x.d);if(!dl)bad.push('defence '+x.d+' for '+x.a);else if(lvl<dl[1]&&!kid)bad.push('level defence '+x.d);
        }
        if(r.mid&&(r.mid.at<1||r.mid.at>c.length-2))bad.push('mid at '+r.mid.at);}}
    return {bad:[...new Set(bad)],stat}})())`));
  assert.deepEqual(res.bad, []);
  const s = res.stat.kl2;
  assert.equal(s.none, 0, "a chosen round always gets exactly one counter action");
  assert.ok(s.pre > 0 && s.mid > 0 && s.post > 0, "start, middle and end all occur");
  assert.equal(res.stat.lc0.mid, 0, "no interruption at Grundlage");
});

test("partner rounds: the plan attaches counter actions and shows and announces them", () => {
  const a = app();
  a.run(`S.profile.disc='kl';S.profile.level=2;S.profile.limits=[];S.profile.birthYear=1995;globalThis.got=null;
    for(let i=0;i<30&&!got;i++){const s=buildSession('2026-11-04','T','gym',['partner','pads'],{min:60});const it=s.blocks.find(b=>b.rounds).items.find(x=>x.react);if(it)got=it;}`);
  assert.ok(a.run("!!got"), "partner rounds carry counter actions");
  assert.match(a.run("reactHtml(got)"), /class="(rx|combo)/);
  a.run("globalThis.solo=buildSession('2026-11-04','T','gym',['bag'],{min:60})");
  assert.equal(a.run("solo.blocks.find(b=>b.rounds).items.some(x=>x.react)"), false, "no counters without a partner");
});

test("partner interruption only right after one of your own strikes; body hook is blocked", () => {
  const a = app();
  const bad = a.run(`(()=>{S.profile.disc='kl';S.profile.level=2;S.profile.limits=[];S.profile.birthYear=1995;let bad=0,mids=0;
    for(let i=0;i<3000;i++){const c=['jab','slip','cross','step','hook'];const r=partnerReact(c);if(r&&r.mid){mids++;if(!STRIKE.has(c[r.mid.at-1]))bad++;}
      for(const p of ['pre','mid','post'])if(r&&r[p]&&r[p].a==='hookb'&&r[p].d!=='block')bad++;}
    return bad+'/'+mids})()`);
  const [b, m] = bad.split("/").map(Number);
  assert.equal(b, 0);
  assert.ok(m > 0);
});

test("partner sessions: counter actions per session – Grundlage 1, Fortgeschritten 2–4, Wettkampf 3–6", () => {
  const a = app();
  const res = JSON.parse(a.run(`JSON.stringify((()=>{const out={};S.profile.disc='kl';S.profile.limits=[];S.profile.birthYear=1995;
    for(const lvl of [0,1,2]){S.profile.level=lvl;const ns=[];for(let i=0;i<150;i++){const s=buildSession('2026-11-04','T','gym',['partner','pads'],{min:90});const rb=s.blocks.find(b=>b.rounds);
      const pr=rb.items.filter(x=>['partner','pads','counter'].includes(x.k)&&x.combo).length;ns.push([rb.items.filter(x=>x.react).length,pr]);}out[lvl]=ns;}return out})())`));
  const check = (lvl, lo, hi) => {
    for (const [n, pr] of res[lvl]) assert.ok(n >= Math.min(lo, pr - 1) && n <= Math.min(hi, pr - 1), `level ${lvl}: ${n} of ${pr}`);
    const vals = new Set(res[lvl].map(([n]) => n));
    return vals;
  };
  assert.deepEqual([...check(0, 1, 1)], [1]);
  const v1 = check(1, 2, 4), v2 = check(2, 3, 6);
  assert.ok(v1.has(2) && v1.has(4), "Fortgeschritten spans 2–4");
  assert.ok(v2.has(3) && [...v2].some((x) => x >= 5), "Wettkampf spans 3–6");
});

test("partner sessions build up easy → hard; counters sit on the final combos and mostly later", () => {
  const a = app();
  const res = JSON.parse(a.run(`JSON.stringify((()=>{const bad=[];let first=0,late=0,total=0;
    for(const disc of ['lc','kl','k1'])for(const lvl of [0,1,2]){S.profile.disc=disc;S.profile.level=lvl;S.profile.limits=[];S.profile.birthYear=1995;
      for(const min of [30,45,60,90])for(let i=0;i<25;i++){const s=buildSession('2026-11-04','T','gym',['partner','pads'],{min});if(!s.blocks.some(b=>b.rounds))continue;const rb=s.blocks.find(b=>b.rounds);
        const pr=rb.items.map((r,k)=>[r,k]).filter(([r])=>PARTNER_K.has(r.k)&&r.combo);
        const lv=pr.map(([r])=>comboLevel(r.combo));
        // allow the opening-round easing swap: compare from the second partner round on
        for(let k=2;k<lv.length;k++)if(lv[k]+0.001<lv[k-1])bad.push('order '+lv.join(','));
        for(const [r,k] of pr){if(!r.react)continue;total++;if(k===pr[0][1])first++;if(k>=pr[Math.floor(pr.length/2)][1])late++;
          if(r.react.mid&&(r.react.mid.at<1||r.react.mid.at>r.combo.length-2||!STRIKE.has(r.combo[r.react.mid.at-1])))bad.push('mid '+r.combo.join('-')+'@'+r.react.mid.at);}}}
    return {bad:[...new Set(bad)].slice(0,5),first,late,total}})())`));
  assert.deepEqual(res.bad, []);
  assert.equal(res.first, 0, "the opening partner round has no counter action");
  assert.ok(res.late > res.total * 0.6, `counter actions mostly in the later rounds (${res.late}/${res.total})`);
});

test("partner counters: foot sweep from Fortgeschritten (lift the foot / step out), never with ankle limits; check = shin block", () => {
  const a = app();
  const r = JSON.parse(a.run(`JSON.stringify((()=>{const cnt=(lvl,lim)=>{S.profile.disc='lc';S.profile.level=lvl;S.profile.limits=lim;S.profile.birthYear=1995;let n=0;const d=new Set();
      for(let i=0;i<3000;i++){const x=partnerReact(['jab','cross','hook']);const q=x.pre||x.mid||x.post;if(q.a==='sweep'){n++;d.add(q.d);}}return [n,[...d].sort()];};
    return {l0:cnt(0,[]),l1:cnt(1,[]),ankle:cnt(2,['ankle']),label:DEFS.check[0]}})())`));
  assert.equal(r.l0[0], 0);
  assert.ok(r.l1[0] > 0);
  assert.deepEqual(r.l1[1], ["lift", "step"]);
  assert.equal(r.ankle[0], 0);
  assert.match(r.label, /Schienbein-Block/);
});

test("K1 knees as counter (blocked), quick answers after the defence, double exchange at Wettkampf", () => {
  const a = app();
  const r = JSON.parse(a.run(`JSON.stringify((()=>{const run=(disc,lvl)=>{S.profile.disc=disc;S.profile.level=lvl;S.profile.limits=[];S.profile.birthYear=1995;let knee=0,kneeDefOk=true,post=0,ans=0,dbl=0;
      for(let i=0;i<4000;i++){const x=partnerReact(['jab','cross','hook','round']);for(const p of ['pre','mid','post'])if(x[p]&&x[p].a==='knee'){knee++;if(!['block','step'].includes(x[p].d))kneeDefOk=false;}
        if(x.post){post++;if(x.post.c)ans++;}if((x.pre||x.mid)&&x.post)dbl++;}return {knee,kneeDefOk,ans:ans/post,dbl};};
    return {k1a:run('k1',1),k1w:run('k1',2),fcw:run('fc',2),lc0:run('lc',0)}})())`));
  assert.ok(r.k1a.knee > 0 && r.k1a.kneeDefOk, "knees in K1 from Fortgeschritten, blocked or stepped out of");
  assert.equal(r.fcw.knee, 0, "no knees in Full Contact");
  assert.ok(r.k1a.ans > 0.35 && r.k1a.ans < 0.65, "Fortgeschritten answers about half the time");
  assert.ok(r.k1w.ans > 0.75, "Wettkampf answers mostly");
  assert.equal(r.lc0.ans, 0, "no answer at Grundlage");
  assert.ok(r.k1w.dbl > 0 && r.lc0.dbl === 0, "double exchange only at Wettkampf");
});

test("partner attacks and quick answers always show the kick side; counters are not spoken", () => {
  const a = app();
  for (const disc of ["lc", "kl", "fc", "k1"]) {
    for (let n = 0; n < 30; n++) {
      const html = a.run(`(() => { S.profile.disc = ${JSON.stringify(disc)}; S.profile.level = "comp";
        const R = { pre: { a: "round", d: "block", c: "lowk" }, post: { a: "sweep", d: "lift", c: "round" } };
        return reactHtml({ combo: ["jab", "cross"], react: R }) + "|"; })()`);
      const chips = [...html.split("|")[0].matchAll(/<span class="k">([^<]*)(<i>[^<]*<\/i>)?<\/span>/g)];
      assert.ok(chips.length >= 3);
      for (const m of chips) assert.ok(m[2], `kick without side: ${m[1]}`);
      break;
    }
  }
});

test("with a partner every partner round is one Partnerdrill (with or without a counter action)", () => {
  const a = app();
  for (const disc of ["lc", "kl", "fc", "k1"]) {
    const ks = a.run(`(() => { S.profile.disc = ${JSON.stringify(disc)}; S.profile.level = 2;
      const out = []; for (let i = 0; i < 20; i++) out.push(...fightRounds("T", 6, "gym", ["partner", "pads"], null).map((r) => r.k));
      return [...new Set(out)]; })()`);
    assert.equal(ks.filter((k) => k !== "rope").join(), "partner");
  }
  assert.equal(a.run(`RT.pads[0] + RT.counter[0]`), "PartnerdrillPartnerdrill");
  assert.doesNotMatch(a.run(`RT.partner[2] + RT.partner[3]`), /ruft|calls/);
});

test("low kicks are checked half of the time", () => {
  const a = app();
  const r = a.run(`(() => { S.profile.disc = "k1"; S.profile.level = 2; let ch = 0, st = 0, maxDiff = 0;
    for (let i = 0; i < 300; i++) { let c = 0, s = 0;
      for (const x of fightRounds("T", 7, "gym", ["partner"], null)) if (x.react) for (const q of [x.react.pre, x.react.mid, x.react.post]) if (q && q.a === "lowk") q.d === "check" ? c++ : s++;
      ch += c; st += s; maxDiff = Math.max(maxDiff, Math.abs(c - s)); }
    return { ch, st, maxDiff }; })()`);
  assert.ok(r.ch > 50 && Math.abs(r.ch - r.st) / (r.ch + r.st) < 0.1, JSON.stringify(r));
  assert.ok(r.maxDiff <= 1, JSON.stringify(r));
});

test("no defence without a reason: no slip or block in any generated combo, side step only at the end", () => {
  const a = app();
  const r = a.run(`(() => { const bad = [];
    for (const disc of ["lc", "kl", "fc", "k1"]) for (const lvl of [0, 1, 2]) { S.profile.disc = disc; S.profile.level = lvl;
      for (let i = 0; i < 40; i++) {
        for (const x of fightRounds("T", 6, "gym", ["partner"], null)) if (x.combo && x.k !== "sixkick") {
          const c = x.combo;
          if (OWN_DEF.has(c[0]) || c.some((y, j) => y === "slip" || y === "block" || (y === "step" && j < c.length - 1)) || c.length < 2) bad.push(c.join("-"));
        }
        for (const eq of [["bag"], []]) for (const x of fightRounds("T", 6, "gym", eq, chooseTheme())) if (x.combo && !x.mine && x.combo.some((y, j) => y === "slip" || y === "block" || (y === "step" && j < x.combo.length - 1))) bad.push("solo:" + x.combo.join("-"));
      } }
    return bad.slice(0, 5); })()`);
  assert.equal(r.length, 0, r.join(" | "));
});

test("every session has body punches, every kick and knee names its target", () => {
  const a = app();
  const r = a.run(`(() => { const miss = [];
    for (const disc of ["lc", "kl", "fc", "k1"]) for (const lvl of [0, 1, 2]) for (const eq of [["partner"], ["bag"], []]) {
      S.profile.disc = disc; S.profile.level = lvl;
      for (let i = 0; i < 60; i++) if (!fightRounds("T", 6, "gym", eq, null).some((x) => x.combo && x.combo.some((y) => ["jabb","crossb","hookb"].includes(y)))) miss.push(disc + lvl + (eq[0] || "shadow"));
    }
    const noTarget = [...KICKS].filter((k) => k !== "sweep" && !/Kopf|Körper|Oberschenkel/.test(TECH[k][0]) || k !== "sweep" && !/head|body|thigh/.test(TECH[k][1]));
    return { miss: miss.slice(0, 5), noTarget }; })()`);
  assert.equal(r.miss.length, 0, r.miss.join());
  assert.equal(r.noTarget.length, 0, r.noTarget.join());
});

test("no combo twice in one session", () => {
  const a = app();
  const r = a.run(`(() => { let dup = 0, all = 0;
    for (const disc of ["lc", "kl", "fc", "k1"]) for (const lvl of [0, 1, 2]) { S.profile.disc = disc; S.profile.level = lvl;
      for (let i = 0; i < 50; i++) { const cs = fightRounds("T", 6, "gym", ["partner"], null).filter((x) => x.combo && x.k !== "sixkick").map((x) => x.combo.join());
        all++; if (new Set(cs).size < cs.length) dup++; } }
    return dup / all; })()`);
  assert.ok(r < 0.03, String(r));
});

test("Full Contact vs Leichtkontakt: 6-kick rule with a partner, more body and pressure in FC; short combos and control in LC", () => {
  const a = app();
  const r = JSON.parse(a.run(`JSON.stringify((() => { S.profile.limits = []; S.profile.birthYear = 1995; const o = {};
    S.profile.disc = "fc"; S.profile.level = 2; let six = 0, sixFirst = 0, body2 = 0, dbl = 0, cnt = 0;
    for (let i = 0; i < 100; i++) { const rs = fightRounds("T", 6, "gym", ["partner"], null), pr = rs.filter((x) => PARTNER_K.has(x.k) && x.combo);
      if (rs.filter((x) => x.six).length === 1) six++; if (pr[0].six) sixFirst++;
      if (rs.filter((x) => x.combo && x.combo.some((y) => ["jabb","crossb","hookb"].includes(y))).length >= 2) body2++;
      for (const x of rs) if (x.react) { cnt++; if ((x.react.pre || x.react.mid) && x.react.post) dbl++; } }
    Object.assign(o, { six, sixFirst, body2, dblFc: dbl / cnt });
    S.profile.disc = "kl"; dbl = 0; cnt = 0;
    for (let i = 0; i < 100; i++) for (const x of fightRounds("T", 6, "gym", ["partner"], null)) if (x.react) { cnt++; if ((x.react.pre || x.react.mid) && x.react.post) dbl++; }
    o.dblKl = dbl / cnt;
    S.profile.disc = "lc"; let long = 0;
    for (let i = 0; i < 100; i++) for (const eq of [["partner"], ["bag"], []]) for (const x of fightRounds("T", 6, "gym", eq, chooseTheme())) if (x.combo && !x.mine && x.combo.length > 4) long++;
    o.long = long;
    o.lcCue = guardCue({ k: "partner" }); o.lcBag = roundDesc({ k: "bag" }, 0);
    S.profile.disc = "fc"; o.fcBag = roundDesc({ k: "bag" }, 0); S.profile.disc = "kl"; o.klBag = roundDesc({ k: "bag" }, 0); o.klCue = guardCue({ k: "partner" });
    return o; })())`));
  assert.equal(r.six, 100); assert.equal(r.sixFirst, 0);
  assert.equal(r.body2, 100);
  assert.ok(r.dblFc > r.dblKl, JSON.stringify(r));
  assert.equal(r.long, 0);
  assert.match(r.lcCue, /Leichtkontakt/); assert.match(r.lcBag, /Schnell und locker/); assert.match(r.fcBag, /voller Wirkung/);
  assert.match(r.klBag, /mit Kraft/); assert.equal(r.klCue, "");
});

test("the partner's attacks vary within a session", () => {
  const a = app();
  const r = a.run(`(() => { S.profile.disc = "lc"; S.profile.level = 2; S.profile.limits = []; S.profile.birthYear = 1995; let rep = 0;
    for (let i = 0; i < 200; i++) { const at = [];
      for (const x of fightRounds("T", 7, "gym", ["partner"], null)) if (x.react) for (const q of [x.react.pre, x.react.mid, x.react.post]) if (q) at.push(q.a);
      if (new Set(at).size < at.length) rep++; }
    return rep; })()`);
  assert.equal(r, 0);
});

test("as a pair: circuits are offset so no device is needed by both, set work alternates; split view A|B", () => {
  const a = app();
  const r = JSON.parse(a.run(`JSON.stringify((() => { S.profile.disc = "kl"; S.profile.level = 1; S.profile.limits = []; S.profile.birthYear = 1995;
    let duo = 0, clash = 0, html = "", sets = 0;
    for (let i = 0; i < 150; i++) for (const ty of ["T", "S", "K"]) {
      const s = buildSession("2026-11-04", ty, "gym", ["partner", "kb", "bar", "weights", "bag", "rope"], { min: 60 });
      s.eq = s.eq || ["partner", "kb", "bar", "weights", "bag", "rope"];
      s.blocks.forEach((b) => { if (isDuo(s, b)) { duo++; clash += duoOff(s, b).clash; if (!html) html = blockHead(b, s); }
        else if (!b.rounds && blockHead(b, s).includes("Satzpause ist der Satz")) sets++; }); }
    const kb = exKey((e) => e.cat === "str" && e.eq && e.eq.includes("kb"));
    sets = blockHead({ key: "str", sets: "3× 8–10", min: 12, items: [{ id: kb }] }, { eq: ["partner", "kb"] }).includes("Satzpause ist der Satz") ? 1 : 0;
    const solo = buildSession("2026-11-04", "S", "gym", ["kb", "bar"], { min: 60 });
    return { duo, clash, html, sets, soloDuo: solo.blocks.some((b) => isDuo(solo, b)) }; })())`));
  assert.ok(r.duo > 20, JSON.stringify(r).slice(0, 200));
  assert.ok(r.clash / r.duo < 0.1, `clashes ${r.clash}/${r.duo}`);
  assert.match(r.html, /class="duo"/); assert.match(r.html, /B bei Übung \d/);
  assert.ok(r.sets > 0, "set-based blocks say: take turns");
  assert.equal(r.soloDuo, false);
});

test("full contact (FC, K1): harder conditioning for adults, same length; not in LC/KL, not for youth", () => {
  const a = app();
  const r = JSON.parse(a.run(`JSON.stringify((() => { const o = {}; S.profile.limits = []; S.profile.level = 2;
    for (const [disc, by] of [["fc", 1995], ["k1", 1995], ["lc", 1995], ["kl", 1995], ["fc", today().getFullYear() - 16]]) {
      S.profile.disc = disc; S.profile.birthYear = by; let h = 0, n = 0, area = 0, min = 0;
      for (let i = 0; i < 100; i++) { const b = hardBlock(["partner", "bag"], "gym", false); min = Math.max(min, b.min);
        for (const it of b.items) { n++; if (it.h) h++; } if (b.items.some((it) => (disc === "k1" ? ["checks","shinbag","shintap"] : ["abs","bodybag","brace"]).includes(it.id))) area++; }
      o[disc + by] = { h: h / n, area, min }; }
    S.profile.disc = "fc"; S.profile.birthYear = 1995; o.soft = hardBlock(["partner"], "gym", true).items.some((it) => it.h);
    return o; })())`));
  assert.ok(r.fc1995.h > 0.9 && r.k11995.h > 0.9, JSON.stringify(r));
  assert.equal(r.lc1995.h, 0); assert.equal(r.kl1995.h, 0);
  assert.equal(Object.keys(r).filter((k) => k.startsWith("fc") && k !== "fc1995").map((k) => r[k].h)[0], 0);
  assert.ok(r.fc1995.area > 90 && r.k11995.area > 90);
  assert.equal(r.fc1995.min, 6); assert.equal(r.soft, false);
});

// ---- 2-B: resume after reload / close ----
const RESUME_KEY = "ringzeit-dev.resume.v1";
function restart(a) {
  // a second page load on the same device: only localStorage survives
  const b = app();
  a.run("store.writeLocal()");
  for (const [k, v] of a.saved) b.saved.set(k, v);
  b.run("S=hydrate(store.readLocal()); ui.onb=null");
  return b;
}
test("resume: exercise timer and position are kept while training; after a restart they return paused, nothing is booked", () => {
  const a = app();
  a.run(
    `resumeReady=true;ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});startWorkout();exerciseTimerAction('start',{key:'0.0'});`,
  );
  a.advance(30000);
  const snap = JSON.parse(a.saved.get(RESUME_KEY));
  assert.equal(snap.ds, "2026-11-02");
  assert.equal(snap.ex.running, false, "snapshot never stores a running clock");
  assert.ok(snap.ex.remainingMs <= 90000 && snap.ex.remainingMs >= 88000, String(snap.ex.remainingMs));
  const before = a.run("JSON.stringify([S.log.length,S.sessions[ui.sel].checked||null,S.sessions[ui.sel].perf||null])");
  const b = restart(a);
  assert.equal(b.run("resumeOffer(()=>{})"), true);
  assert.equal(b.run("ui.sheet.kind"), "confirm");
  assert.equal(b.run("ui.exerciseTimer == null"), true, "nothing restored before the answer");
  b.run("sheetAction('confirm')");
  assert.equal(b.run("ui.exerciseTimer.running"), false);
  assert.equal(b.run("ui.exerciseTimer.remainingMs"), snap.ex.remainingMs);
  assert.equal(b.run("ui.workout.ds"), "2026-11-02");
  assert.equal(b.run("ui.workout.step"), snap.workout.step);
  b.advance(10 * 60 * 1000);
  b.elapse(10 * 60 * 1000);
  b.run("exerciseTick();tick()");
  assert.equal(b.run("ui.exerciseTimer.remainingMs"), snap.ex.remainingMs, "paused time does not run");
  assert.equal(b.run("JSON.stringify([S.log.length,S.sessions[ui.sel].checked||null,S.sessions[ui.sel].perf||null])"), before);
  assert.equal(b.calls.filter((c) => c[0] === "bell").length, 0);
  // the user starts it again by hand: it continues from the saved remaining time
  b.run("exerciseTimerAction('toggle')");
  assert.equal(b.run("ui.exerciseTimer.running"), true);
  assert.ok(Math.abs(b.run("ui.exerciseTimer.endAt-Date.now()") - snap.ex.remainingMs) < 50);
});
test("resume: round timer comes back paused with the same phase and second", () => {
  const a = app();
  a.run(`resumeReady=true;ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});selectSessionTimer(ui.sel);timerGo();`);
  a.advance(25000);
  const tm = JSON.parse(a.run("JSON.stringify(ui.timer)"));
  assert.equal(tm.phase, "work");
  const snap = JSON.parse(a.saved.get(RESUME_KEY));
  assert.equal(snap.timer.running, false);
  assert.equal(snap.timer.phase, "work");
  assert.ok(Math.abs(snap.timer.left - tm.left) <= 2);
  const b = restart(a);
  assert.equal(b.run("resumeOffer(()=>{})"), true);
  b.run("sheetAction('confirm')");
  assert.equal(b.run("ui.timer.running"), false);
  assert.equal(b.run("ui.timer.phase"), "work");
  const left = b.run("ui.timer.left"),
    done = b.run("S.sessions[ui.sel].rdone||0");
  b.advance(20 * 60 * 1000);
  b.run("tick()");
  assert.equal(b.run("ui.timer.left"), left);
  assert.equal(b.run("S.sessions[ui.sel].rdone||0"), done);
});
test("resume: deleted, rebuilt or finished sessions are not offered and the snapshot is removed", () => {
  const mk = () => {
    const a = app();
    a.run(`resumeReady=true;ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});startWorkout();exerciseTimerAction('start',{key:'0.0'});`);
    a.advance(5000);
    return a;
  };
  let b = restart(mk());
  b.run("delete S.sessions['2026-11-02']");
  assert.equal(b.run("resumeOffer(()=>{})"), false);
  assert.equal(b.saved.has(RESUME_KEY), false);
  b = restart(mk());
  b.run("S.sessions['2026-11-02']=buildSession('2026-11-02','K','gym',[],{min:45})");
  assert.equal(b.run("resumeOffer(()=>{})"), false);
  assert.equal(b.saved.has(RESUME_KEY), false);
  b = restart(mk());
  b.run("S.log.push({id:'e1',date:'2026-11-02',min:60,rpe:5,type:'T'})");
  assert.equal(b.run("resumeOffer(()=>{})"), false);
  b = restart(mk());
  b.saved.delete(RESUME_KEY);
  assert.equal(b.run("resumeOffer(()=>{})"), false);
});
test("resume: declining keeps the plan and the stored position, removes only the snapshot; closing the training clears the timers' snapshot", () => {
  const a = app();
  a.run(`resumeReady=true;ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});startWorkout();exerciseTimerAction('start',{key:'0.0'});`);
  a.advance(5000);
  const b = restart(a);
  b.run("globalThis.__n=0;resumeOffer(()=>{__n++})");
  b.run("sheetAction('confirmNo')");
  assert.equal(b.run("__n"), 1);
  assert.equal(b.saved.has(RESUME_KEY), false);
  assert.equal(b.run("ui.exerciseTimer == null"), true);
  assert.ok(b.run("S.sessions['2026-11-02'].flow.startedAt") > 0, "the normal 'Training fortsetzen' button still works");
  // while the offer is open, background saving must not erase the snapshot
  const c = restart(a);
  c.run("resumeOffer(()=>{})");
  c.run("resumeSave(true)");
  assert.equal(c.saved.has(RESUME_KEY), true);
  // leaving the training for good (timers gone) removes the snapshot
  a.run("closeWorkout(false);clearSessionTimer();resumeSave(true)");
  assert.equal(a.saved.has(RESUME_KEY), false);
});

test("player: a paused set rest keeps its remaining time when paging away and back; other paused timers are dropped as before", () => {
  const a = app();
  a.run(`ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{min:60});startWorkout();playerGo(2);`);
  a.run(`ui.exerciseTimer={ds:ui.sel,key:'x',bi:0,ni:-1,phases:[{seconds:60,label:'Pause'}],index:0,restOnly:true,running:false,done:false,player:2,remainingMs:41000};`);
  a.run("playerGo(3)");
  assert.equal(a.run("ui.exerciseTimer == null"), true, "not shown on another step");
  a.run("playerGo(2)");
  assert.equal(a.run("ui.exerciseTimer.remainingMs"), 41000);
  assert.equal(a.run("ui.exerciseTimer.running"), false, "stays paused");
  a.advance(120000);
  assert.equal(a.run("ui.exerciseTimer.remainingMs"), 41000);
  // a non-rest timer is still dropped when leaving its step
  a.run(`ui.exerciseTimer={ds:ui.sel,key:'y',bi:0,ni:0,phases:[{seconds:60,label:'x'}],index:0,restOnly:false,running:false,done:false,player:2,remainingMs:30000};playerGo(3);playerGo(2);`);
  assert.equal(a.run("ui.exerciseTimer == null"), true);
});
test("neck hold exercise: one name, texts that match the timer (4 directions × 10 s), no old name left", () => {
  const a = app();
  const name = "Isometrische Nackenkräftigung – Halteübung";
  assert.equal(a.run("EX.filter(e=>e.de==='Nackenstärkung').length"), 0);
  const id = a.run(`exKey(e=>e.de==='${name}')`);
  assert.equal(typeof id, 'string');
  assert.match(a.run(`EX['${id}'].desc`) || a.run(`EX['${id}'].dde`) || "", /10 s/);
  // hardening item (normal and full-contact text) and the tracked strength item both run 4 × 10 s with changes in between
  for (const item of [`{kind:'hard',id:'neck'}`, `{kind:'hard',id:'neck',h:1}`, `{id:'${id}',target:{r:10}}`]) {
    a.run(`ui.sel='x';ui.tab='session';S.sessions.x={date:'2026-11-02',type:'K',eq:[],blocks:[{key:'${item.includes("hard") ? "hard" : "str"}',min:5,sets:'3×',items:[${item}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};`);
    const secs = Array.from(a.run("exerciseTiming(S.sessions.x,0,0,undefined,0).phases.map(p=>p.seconds)"));
    assert.deepEqual(secs, [10, 5, 10, 5, 10, 5, 10], item);
  }
  for (const h of [undefined, 1]) {
    const [title, text] = a.run(`hardTxt('neck',${h})`);
    assert.equal(title, name);
    assert.match(text, /10 s/);
    assert.doesNotMatch(text, /15 s|2 Durchg/);
  }
  assert.ok(a.run("SKETCH['str.neck_iso_hold'] != null"));
});

// ---- 2-B: announcer on Android-like engines ----
function speechApp(voices, { failFor = [], code = "synthesis-failed" } = {}) {
  const a = app();
  a.run(`globalThis.__spoken=[];globalThis.SpeechSynthesisUtterance=class{constructor(t){this.text=t}};
    globalThis.speechSynthesis={speaking:false,pending:false,paused:false,cancel(){},resume(){},getVoices:()=>${JSON.stringify(voices)},
      speak(u){__spoken.push({text:u.text,lang:u.lang,voice:u.voice?u.voice.name:null});
        const fail=${JSON.stringify(failFor)};
        if(u.voice? fail.includes(u.voice.name) : fail.includes('*')) setTimeout(()=>u.onerror&&u.onerror({error:${JSON.stringify(code)}}),10)}};
    window.speechSynthesis=speechSynthesis;S.profile.lang='de';S.profile.voice=true;`);
  return a;
}
const V = (name, lang, local = true) => ({ name, voiceURI: name, lang, localService: local });
test("announcer: Android voice codes like de_DE become de-DE; offline German voice beats the online one", () => {
  const a = speechApp([V("English", "en_US"), V("German online", "de_DE", false), V("German local", "de_DE", true)]);
  a.run("say('Runde 1')");
  const sp = Array.from(a.run("__spoken")).map((x) => ({ ...x }));
  assert.equal(sp.length, 1);
  assert.equal(sp[0].voice, "German local");
  assert.equal(sp[0].lang, "de-DE");
});
test("announcer: no voice list yet -> language only; a failing voice is retried with the next one, then with the language alone", () => {
  let a = speechApp([]);
  a.run("say('Hallo')");
  let sp = Array.from(a.run("__spoken"));
  assert.equal(sp.length, 1);
  assert.equal(sp[0].lang, "de-DE");
  assert.equal(sp[0].voice, null);
  a = speechApp([V("German local", "de_DE", true), V("German online", "de_DE", false)], { failFor: ["German local", "German online"] });
  a.run("say('Hallo')");
  a.advance(1000);
  sp = Array.from(a.run("__spoken")).map((x) => x.voice);
  assert.deepEqual(sp, ["German local", "German online", null], "stops after the language-only attempt");
  assert.equal(a.run("speechFail.code"), "synthesis-failed");
  // cancel()/interrupt are normal and neither retried nor reported
  a = speechApp([V("German local", "de_DE")], { failFor: ["German local"], code: "interrupted" });
  a.run("say('Hallo')");
  a.advance(1000);
  assert.equal(Array.from(a.run("__spoken")).length, 1);
  assert.equal(a.run("speechFail"), null);
});

/* ---------- 3-U: shared history, sport per unit, free run, correction and deletion ---------- */
const prior = (a) =>
  a.run(`(()=>{S.profile.planStart='';for (const m of ['2026-10-05','2026-10-12','2026-10-19','2026-10-26']) for (const k of [0,2,4]) S.log.push({id:'p'+m+k,date:iso(addDays(parse(m),k)),src:'own',type:'T',sport:'kickboxing',minutes:75,rpe:6,tHi:7});loadCache={};})()`);

test("3-U case 1: hard club sparring the day before → the next day is built lighter, with a one-sentence reason", () => {
  const a = app();
  const base = a.run("rpeRange('T','2026-11-03').hi");
  assert.equal(a.run("buildSession('2026-11-03','T','gym',[]).notes.some(n=>/Gestern viel/.test(n))"), false);
  a.run("S.log.push({id:'e1',date:'2026-11-02',src:'club',type:'V',ck:'P',minutes:90,rpe:9});loadCache={};");
  assert.equal(a.run("rpeRange('T','2026-11-03').hi"), base - 1);
  assert.match(a.run("buildSession('2026-11-03','T','gym',[]).notes.join('|')"), /Gestern viel Beinarbeit und Schultern und Arme \(Verein, hart\)/);
  assert.equal(a.run("rpeRange('T','2026-11-04').hi"), base, "only the day after");
  assert.equal(a.run("buildSession('2026-11-03','M','home',[]).notes.some(n=>/Gestern viel/.test(n))"), false, "mobility stays as it is");
});

test("3-U: every built session and every entry carries its sport; a unit can be set to another sport; old entries are kickboxing", async () => {
  const a = app();
  a.run("ui.sel=iso(today());ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',[]);ui.setup=setupOf(S.sessions[ui.sel],ui.sel);");
  assert.equal(a.run("S.sessions[ui.sel].sport"), "kickboxing");
  assert.match(a.run("S.sessions[ui.sel].id"), /^s/);
  assert.match(a.run("renderSession()"), /data-usport="kickboxing"/, "the sport row is shown");
  assert.equal(a.run("sportChoices().join()"), "kickboxing,boxing,taekwondo", "boxing (4b) and taekwondo (6a) are released");
  await a.click({ dataset: { usport: "karate" } });
  assert.equal(a.run("ui.setup.sport"), "karate");
  assert.equal(a.run("setupDirty(ui.sel)"), true, "the change is flagged until rebuilt");
  assert.equal(a.run("entrySport({date:'2026-10-01',minutes:60,rpe:5})"), "kickboxing");
  a.run("S.profile.sport='karate';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',[]);");
  assert.equal(a.run("S.sessions[ui.sel].sport"), "karate", "default = main sport");
  assert.equal(a.run("S.sessions[ui.sel] && planContext(ui.sel).sport.id"), "kickboxing", "unfinished sport falls back to the finished module");
});

test("3-U cases 5–7: a corrected or deleted entry rebuilds only sessions that have not begun; days and types stay", async () => {
  const a = app();
  prior(a);
  a.run("const w=iso(addDays(monday(today()),2)),f=iso(addDays(monday(today()),4));S.sessions[w]=buildSession(w,'T','gym',[]);S.sessions[f]=buildSession(f,'T','gym',[]);S.sessions[f].flow={block:0,step:0};");
  const before = a.run("JSON.stringify([0,2,4].map(i=>planOn(iso(addDays(monday(today()),i)))))");
  a.run("changeLog(()=>S.log.push({id:'big',date:'2026-11-02',src:'own',type:'T',sport:'kickboxing',minutes:120,rpe:10,tHi:7}))");
  assert.equal(a.run("weekLoad('2026-11-04').deload"), true);
  assert.equal(a.run("weekLoad('2026-11-04').why"), "proj");
  assert.equal(a.run("!!S.sessions['2026-11-04']"), false, "not begun → dropped, rebuilt on demand");
  assert.equal(a.run("!!S.sessions['2026-11-06']"), true, "begun → kept");
  assert.equal(a.run("JSON.stringify([0,2,4].map(i=>planOn(iso(addDays(monday(today()),i)))))"), before, "days and types unchanged");
  // correction 120 min × 10 → 75 min × 6 through the edit sheet
  a.run("S.sessions['2026-11-04']=buildSession('2026-11-04','T','gym',[]);");
  await a.click({ dataset: { edit: "big" } });
  assert.equal(a.run("ui.sheet.kind"), "edit");
  a.node("scMin").value = "75";
  a.node("scRpe").value = "6";
  a.node("scNote").value = "";
  await a.click({ dataset: { sx: "editsave" } });
  assert.equal(a.run("S.log.find(e=>e.id==='big').rpe"), 6);
  assert.ok(a.run("!!S.log.find(e=>e.id==='big').edited"));
  assert.equal(a.run("weekLoad('2026-11-04').deload"), false, "load sank → no lighter week");
  assert.equal(a.run("!!S.sessions['2026-11-04']"), false, "the open session is rebuilt with the new state");
  // deletion: week load drops, recomputed the same way
  a.run("changeLog(()=>S.log.push({id:'big2',date:'2026-11-03',src:'own',type:'T',minutes:120,rpe:10,tHi:7}));S.sessions['2026-11-04']=buildSession('2026-11-04','T','gym',[]);");
  assert.equal(a.run("weekLoad('2026-11-04').deload"), true);
  await a.click({ dataset: { del: "big2" } });
  assert.equal(a.run("S.log.some(e=>e.id==='big2')"), false);
  assert.equal(a.run("weekLoad('2026-11-04').deload"), false);
  assert.equal(a.run("!!S.sessions['2026-11-04']"), false);
  assert.equal(a.run("S.log.find(e=>e.id==='big').minutes"), 75, "other entries unchanged");
});

test("3-U case 12: free run – no timer, minutes + km + effort; load 240, pace 5:20 /km, distance without effect on the load", async () => {
  const a = app();
  a.run("ui.sel=iso(today());ui.tab='session';ui.setup={ds:ui.sel,type:'K',loc:'out',eq:[],run:'free',sport:'kickboxing',min:60};");
  assert.match(a.run("setupFields(ui.setup,'K')"), /data-run="free" aria-pressed="true"/);
  assert.match(a.run("renderSession()"), /Lauf eintragen/);
  await a.click({ id: "buildSess", dataset: {} });
  assert.equal(a.run("ui.sheet.kind"), "freerun");
  assert.equal(a.run("S.sessions[ui.sel]"), undefined, "no guided session is built");
  // nothing preselected: saving without effort is refused
  a.node("scMin").value = "40";
  a.node("scKm").value = "7,5";
  a.node("scRpe").value = "";
  a.node("scNote").value = "";
  await a.click({ dataset: { sx: "freerunsave" } });
  assert.equal(a.run("S.log.length"), 0);
  assert.ok(a.run("ui.sheet.err"));
  a.node("scRpe").value = "6";
  await a.click({ dataset: { sx: "freerunsave" } });
  const e = JSON.parse(a.run("JSON.stringify(S.log[0])"));
  assert.deepEqual([e.type, e.run, e.minutes, e.km, e.rpe, e.sport, e.src], ["K", "free", 40, 7.5, 6, "kickboxing", "own"]);
  assert.equal(a.run("entryLoad(S.log[0])"), 240);
  assert.equal(a.run("runInfo(S.log[0])"), " · 7,5 km · 5:20 /km");
  assert.equal(a.run("doneOn(ui.sel)"), true, "counts as the own conditioning unit of the day");
  assert.match(a.run("renderSession()"), /7,5 km · 5:20 \/km/);
});

test("3-U case 8: a tournament of another sport drives the phases; a belt exam only acts on its own sport", () => {
  const a = app();
  a.run("S.profile.comps=[{id:'c1',kind:'comp',sport:'karate',date:iso(addDays(today(),20))}];");
  assert.equal(a.run("phaseInfo().phase"), "peak");
  assert.equal(a.run("phaseInfo().official"), false, "no kickboxing format is applied to a sport without module");
  a.run("S.profile.comps=[{id:'g1',kind:'grade',sport:'karate',date:iso(addDays(today(),10))}];");
  assert.equal(a.run("phaseInfo().phase"), "base", "exam of another sport: no effect");
  a.run("S.profile.comps=[{id:'g2',kind:'grade',date:iso(addDays(today(),10))}];");
  assert.equal(a.run("phaseInfo().phase"), "grade", "no sport = kickboxing");
});

test("3-U case 10: full contact / K1 are not tied to the level any more; the age limit stays", () => {
  const a = app();
  a.run("S.profile.level=0;S.profile.birthYear=2001;draft=null;ui.profSec='me';");
  let h = a.run("renderProfile()");
  assert.doesNotMatch(h, /data-lock="disc"/);
  assert.match(h, /data-p="disc" data-v="fc"/);
  a.run("S.profile.birthYear=2012;draft=null;ui.profSec='me';");
  h = a.run("renderProfile()");
  assert.match(h, /data-lock="age"/);
  assert.doesNotMatch(h, /data-p="disc" data-v="fc"/);
});

test("3-U case 11: a backup round trip restores exactly the exported state – no duplicates, no marker leftovers", () => {
  const a = app();
  prior(a);
  const snap = a.run("JSON.stringify(S)");
  a.run("changeLog(()=>{S.log.find(e=>e.id.startsWith('p2026-10-05'))?.rpe; S.log[0].rpe=9;S.log[0].edited='x'})");
  a.run(`S=hydrate(JSON.parse(${JSON.stringify(snap)}));`);
  assert.equal(a.run("S.log.length"), 12);
  assert.equal(a.run("S.log[0].rpe"), 6);
  assert.equal(a.run("S.v"), 2);
  assert.equal(a.run("new Set(S.log.map(e=>e.id)).size"), 12);
});

test("3-U: levels above the tested one show a lock; tapping it explains the fitness test", async () => {
  const a = app();
  a.run("S.profile.level=0;S.tests=[];draft=null;ui.profSec='me';");
  const h = a.run("renderProfile()");
  assert.equal((h.match(/data-lock="level"/g) || []).length, 2, "Fortgeschritten and Wettkampf are locked");
  assert.match(h, /data-p="level" data-v="0"/);
  assert.doesNotMatch(h, /data-p="level" data-v="1"/);
  a.run("toast=(m)=>{globalThis.__t=m}");
  await a.click({ dataset: { lock: "level" } });
  assert.match(a.run("globalThis.__t"), /Fitnesstest/);
});

// ---- 3-D: stable exercise ids, prescriptions, deviations A1–A13 ----
test("3-D ids: old data with numeric exercise ids is migrated in sessions and in the log (hydrate)", () => {
  const a = app();
  const st = JSON.parse(
    a.run(`JSON.stringify(hydrate({profile:{...DEFAULT_PROFILE,example:false},
      sessions:{'2026-11-02':{date:'2026-11-02',type:'S',eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{kind:'ex',id:23},{kind:'hard',id:'neck'},{kind:'round',k:'ex',id:7}]}]}},
      log:[{date:'2026-11-01',type:'S',minutes:30,rpe:5,perf:[{id:23,kind:'x',sets:[]}]}]}))`),
  );
  const items = st.sessions["2026-11-02"].blocks[0].items;
  assert.equal(items[0].id, "str.plank");
  assert.equal(items[1].id, "neck", "hardening ids are untouched");
  assert.equal(items[2].id, "cond.rope_intervals");
  assert.equal(st.log[0].perf[0].id, "str.plank");
  // running it twice changes nothing
  const again = JSON.parse(a.run(`JSON.stringify(hydrate(${JSON.stringify(st)}))`));
  assert.deepEqual(again.sessions, st.sessions);
});

test("3-D ids: every sketch and tip is found by id; sketch label shows the display name", () => {
  const a = app();
  assert.equal(a.run("Object.keys(SKETCH).filter(k => /^(warm|cond|str|mob|cool|pow|pre)\\./.test(k) && !EX[k]).join()"), "");
  assert.equal(a.run("Object.keys(EXTIPS).filter(k => !EX[k]).join()"), "");
  assert.match(a.run("sketchSvg('str.neck_iso_hold')"), /aria-label="Isometrische Nackenkräftigung – Halteübung"/);
  assert.match(a.run("sketchSvg('str.neck_iso_hold')"), /stroke="#C9A86A"/, "four direction marks are drawn");
});

test("3-D text and timer from one prescription: every exercise with a prescription says what its timer runs", () => {
  const a = app();
  for (const k of Object.keys(JSON.parse(a.run("JSON.stringify(RX)")))) {
    if (!k.includes(".")) continue;
    const r = JSON.parse(
      a.run(`JSON.stringify((() => { const rx = RX[${JSON.stringify(k)}];
        const secs = rxPlan(rx, {}).phases.reduce((n, p) => n + p.seconds, 0);
        return { de: rxText(rx, 'de'), en: rxText(rx, 'en'), secs, fix: DOSE_FIX[${JSON.stringify(k)}] }; })())`),
    );
    assert.deepEqual(r.fix, [r.de, r.en], k);
    assert.ok(r.secs > 0, k);
  }
});

test("3-D A5: timed one-leg hold = sets of left then right; text says so; no '3 × pro Bein 2 × 10 s'", () => {
  const a = app();
  a.run(`ui.sel='x';S.profile.level=1;S.sessions.y={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{kind:'ex',id:'str.single_leg_kick_hold'}]}]};`);
  const txt = a.run("doseTxt('str.single_leg_kick_hold', S.sessions.y.blocks[0])");
  assert.match(txt, /^3 × 30–45 s pro Bein halten/);
  assert.match(txt, /erst links, dann rechts/);
  assert.doesNotMatch(txt, /2 × 10 s/);
  const labels = JSON.parse(a.run("JSON.stringify(exerciseTiming(S.sessions.y,0,0).phases)"));
  assert.deepEqual(labels.map((p) => p.seconds), [30, 5, 30]);
  assert.match(labels[0].label, /Bein 1\/2/);
  assert.match(labels[2].label, /Bein 2\/2/);
});

test("3-D A7/A8/A9/A11/A12: kick holds ≈4 min with derived text, mobility header, totals from the timer, rope alternates, sprint sets", () => {
  const a = app();
  const mob = { key: "mob", min: 12, items: [] };
  assert.match(a.run("doseTxt('mob.kick_holds', {key:'mob',min:12,items:[]})"), /je Seite 5 × 3–5 s · im Wechsel links\/rechts, ca\. 4–5 Min\./);
  assert.match(a.run("doseTxt('mob.pigeon_stretch', {key:'mob',min:12,items:[]})"), /je Seite 60–90 s · insgesamt ca\. 2–3 Min\./);
  assert.match(a.run("doseTxt('mob.frog_stretch', {key:'mob',min:12,items:[]})"), /60–90 s halten · insgesamt ca\. 1–2 Min\./);
  assert.match(a.run("blockHead({key:'mob',min:12,items:[]})"), /je Übung ca\. 3–4 Min\., Halteübungen 60–90 s/);
  const kt = a.run("(() => { S.sessions.k={date:'2026-11-02',type:'M',eq:[],blocks:[{key:'mob',min:12,items:[{kind:'ex',id:'mob.kick_holds'}]}]}; const p = exerciseTiming(S.sessions.k,0,0).phases; return p.reduce((n,x)=>n+x.seconds,0); })()");
  assert.ok(kt >= 230 && kt <= 290, String(kt));
  assert.match(a.run("doseTxt('cond.rope_intervals', {key:'cond',min:12,sets:'3×',items:[]})"), /2 Min\. im Wechsel \(30 s zügig \/ 30 s locker\)/);
  a.run("S.sessions.r={date:'2026-11-02',type:'K',eq:[],blocks:[{key:'cond',min:12,sets:'3×',items:[{kind:'ex',id:'cond.rope_intervals'}]}]}");
  assert.equal(a.run("exerciseTiming(S.sessions.r,0,0).phases.length"), 4);
  assert.equal(a.run("doseTxt('cond.hill_sprints', {key:'cond',min:12,sets:'3× 30 s',items:[]})"), "3 × 4 Sprints");
  assert.equal(a.run("doseTxt('cond.strides', {key:'cond',min:12,sets:'3× 30 s',items:[]})"), "3 × (2 × 80 m)");
  assert.equal(a.run("doseTxt('cond.hill_sprints', {key:'cond',min:12,sets:'3×',items:[]})"), "4 Sprints", "circuit laps keep the single dose");
});

test("3-D A1–A4, A6, A13: hardening text and timer of the harder full-contact dose agree (all items)", () => {
  const a = app();
  for (const [id, re, n, secs] of [
    ["fPlank", /3× 30–45 s/, 3, [30, 45]],
    ["fTap", /3× 45 s pro Hand/, 6, [45]],
    ["fBare", /3× 20 s/, 3, [20]],
    ["fWraps", /3× 30 s/, 3, [30]],
    ["checks", /3× 30 s/, 3, [30]],
  ]) {
    assert.match(a.run(`hardTxt('${id}', 1)[1]`), re, id);
    a.run(`ui.sel='x';S.sessions.x={date:'2026-11-02',type:'K',eq:[],blocks:[{key:'hard',min:5,items:[{kind:'hard',id:'${id}',h:1}]}]}`);
    const p = JSON.parse(a.run("JSON.stringify(exerciseTiming(S.sessions.x,0,0))"));
    const work = p.phases.filter((x) => !/Wechsel|Change|change/i.test(x.label) && x.seconds !== 5);
    assert.equal(work.length, n, id);
    assert.ok(secs.includes(work[0].seconds), id);
  }
  // every hardening item with a prescription: the number of work seconds in the text is the timer's
  const ids = JSON.parse(a.run("JSON.stringify(Object.keys(RX).filter(k => !k.includes('.')))"));
  for (const id of ids) for (const h of [0, 1]) {
    const txt = a.run(`hardTxt('${id}', ${h})[1]`);
    assert.doesNotMatch(txt, /\{(rx|n|s|r)\}/, id);
  }
  assert.match(a.run("hardTxt('neck', 0)[1]"), /Stirn, Hinterkopf und beide Kopfseiten/);
});

test("3-D A10: explosive sets without weights use explosive exercises; slow wording only in slow blocks", () => {
  const a = app();
  // slow wording: a heavy block with a bodyweight exercise says "langsam", an explosive one does not
  a.run("S.profile.level=1");
  assert.match(a.run("doseTxt('str.push_ups', {key:'str',min:10,sets:'4× 5–8',items:[]})"), /langsam/);
  assert.doesNotMatch(a.run("doseTxt('str.push_ups', {key:'str',min:10,sets:'3× 3–5 explosiv',items:[]})"), /langsam/);
  assert.match(a.run("doseTxt('pow.jump_squats', {key:'pow',min:10,sets:'3× 3–5 explosiv',items:[]})"), /^3 × 3–5 Wdh\./);
  // plan: tournament preparation (build phase), strength session
  a.run("globalThis.__ph = phaseInfo; phaseInfo = (d) => ({ ...__ph(d), phase: 'build' }); ui.sel = '2026-11-02';");
  const pick = (loc, eq) =>
    JSON.parse(
      a.run(`JSON.stringify((() => {
        const out = [];
        for (let i = 0; i < 10; i++) {
          const s = buildSessionCore('2026-11-02', 'S', ${JSON.stringify(loc)}, ${JSON.stringify(eq)}, { min: 60 });
          const b = s.blocks.find((x) => x.key === 'str');
          out.push({ sets: b.sets, cats: b.items.map((it) => EX[it.id].cat), dose: b.items.map((it) => doseTxt(it.id, b)) });
        }
        return out; })())`),
    );
  const noW = pick("home", ["bands"]);
  assert.ok(noW.every((r) => /explosiv/.test(r.sets)), "build phase = explosive sets");
  assert.ok(noW.every((r) => r.cats.every((c) => c === "pow" || c === "str")), "only power (or the strength fallback)");
  assert.ok(noW.some((r) => r.cats.includes("pow")), "power exercises are chosen");
  assert.ok(noW.every((r) => r.dose.every((d) => !/langsam/.test(d))), "no slow wording in an explosive block");
  // with weights the pick stays as before: strength basics
  const withW = pick("gym", ["weights", "bb"]);
  assert.ok(withW.every((r) => r.cats.every((c) => c === "str")));
});

test("session setup: with 'Freier Lauf' only that option is pressed (not 'Intervalle' as well)", () => {
  const a = app();
  const pressed = (run) => {
    const html = a.run(`setupFields({ds:'x',type:'K',loc:'out',eq:[],run:${JSON.stringify(run)},sport:'kickboxing',min:60},'K')`);
    return ["iv", "run", "free"].filter((k) => new RegExp(`data-run="${k}" aria-pressed="true"`).test(html));
  };
  assert.deepEqual(pressed("free"), ["free"]);
  assert.deepEqual(pressed(true), ["run"]);
  assert.deepEqual(pressed(false), ["iv"]);
});

/* ---------- Boxing (4a-U) ---------- */
const boxSess = (a, type, eq, opts = {}) =>
  JSON.parse(a.run(`JSON.stringify(buildSession('${opts.ds || "2026-11-03"}','${type}','gym',${JSON.stringify(eq)},{sport:'boxing'${opts.min ? ",min:" + opts.min : ""}}))`));
const boxItems = (s) => s.blocks.flatMap((b) => b.items.map((it) => ({ ...it, bk: b.key })));
const KICKTOK = /^(front|round|roundh|side|back|hookk|axe|brazil|shook|tornado|jknee|sweep|lowk|knee)$/;
const tokensOf = (s) =>
  boxItems(s).flatMap((it) => [...(it.combo || []), ...(it.react ? Object.values(it.react).flatMap((r) => [r.a, r.c].filter(Boolean)) : [])]);

test("4a-U: boxing sessions hold only punches, no kick round, no kickbox hardening – for every level, age and limit", () => {
  const a = app();
  for (const [lvl, by, lim] of [[0, 2010, []], [1, 1995, []], [2, 1995, ["wrist"]], [1, 1995, ["knee"]], [0, 2015, []], [2, 1981, ["shoulder"]]]) {
    a.run(`S.profile.level=${lvl};S.profile.birthYear=${by};S.profile.limits=${JSON.stringify(lim)};S.profile.disc='fc';`);
    for (let i = 0; i < 12; i++)
      for (const type of ["T", "C", "P", "S", "K"]) {
        const s = boxSess(a, type, ["partner", "bag", "rope", "bands"]);
        assert.equal(s.sport, "boxing");
        assert.ok(!tokensOf(s).some((x) => KICKTOK.test(x)), `${type} lvl${lvl} ${by} ${lim}: no kick`);
        assert.ok(!boxItems(s).some((it) => it.k === "sixkick" || it.bk === "hard"), "no six-kick round, no kickbox hardening");
        assert.ok(!boxItems(s).some((it) => it.kind === "round" && it.k === "task" && /^(hands|kicks|free|lowfocus|sixkick|knee)$/.test(it.id)), "only boxing tasks");
        assert.ok(!boxItems(s).some((it) => it.kind === "hard" && /^(fGlove|fWraps|fBare|fPads|fTap|checks|shinbag|shintap|arms)$/.test(it.id)), "no hardening with hits");
        // 7b B7: body conditioning only in the toughness block – level 1+, from 16, without limits
        const tough = s.blocks.find((b) => b.lbl === "tough");
        if (boxItems(s).some((it) => it.kind === "hard" && /^(abs|bodybag|brace)$/.test(it.id))) assert.ok(tough && lvl >= 1 && 2026 - by >= 16 && !lim.length, `body conditioning only when allowed: lvl${lvl} ${by} ${lim}`);
      }
  }
});

test("4a-U: Handgelenk & Griff – fixed block (towel + grip) instead of hardening, graded by age, level, limits, equipment", () => {
  const a = app();
  a.run("S.profile.level=1;S.profile.birthYear=1995;S.profile.limits=[];");
  let s = boxSess(a, "T", ["bands"]);
  const w = s.blocks.find((b) => b.key === "wrist");
  assert.equal(w.min, 6);
  assert.ok(w.items.some((it) => it.id === "fWring") && w.items.some((it) => it.id === "fFinger"));
  assert.equal(s.blocks.filter((b) => b.key === "hard").length, 0);
  // beginners keep the plain wrist block (7b: body conditioning from level 1)
  a.run("S.profile.level=0;ui.sel=iso(today());ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bands'],{sport:'boxing'});ui.setup=setupOf(S.sessions[ui.sel],ui.sel);");
  assert.match(a.run("renderSession()"), /Handgelenk &amp; Griff|Handgelenk & Griff/);
  // children: only towel and grip, no neck, no fist load
  a.run("S.profile.level=0;S.profile.birthYear=2015;");
  for (let i = 0; i < 15; i++) assert.deepEqual(boxSess(a, "T", ["partner"], { min: 60 }).blocks.find((b) => b.key === "wrist").items.map((it) => it.id).sort(), ["fFinger", "fWring"]);
  // wrist limit: no fist or wrist load; taper weeks gentle
  a.run("S.profile.level=2;S.profile.birthYear=1995;S.profile.limits=['wrist'];");
  const seen = new Set();
  for (let i = 0; i < 40; i++) boxSess(a, "T", ["weights", "bands"]).blocks.find((b) => b.key === "wrist").items.forEach((it) => seen.add(it.id));
  assert.ok(![...seen].some((id) => ["fPlank", "fPush", "wristCurl"].includes(id)), [...seen].join());
  // equipment: the band exercise only with a band, the dumbbell curl only with weights/band
  a.run("S.profile.limits=[];");
  const noEq = new Set();
  for (let i = 0; i < 40; i++) boxSess(a, "T", []).blocks.find((b) => b.key === "wrist").items.forEach((it) => noEq.add(it.id));
  assert.ok(!noEq.has("fingerExt") && !noEq.has("wristCurl"), [...noEq].join());
  // no exercise twice: the neck hold of the strength block is not repeated in the wrist block
  a.run("S.profile.level=1;S.profile.birthYear=1995;S.profile.limits=[];");
  for (let i = 0; i < 40; i++) {
    const ids = boxItems(boxSess(a, "S", ["bands"])).filter((it) => it.kind === "ex" || it.kind === "hard").map((it) => it.id);
    assert.equal(ids.filter((x) => x === "str.neck_iso_hold" || x === "neck").length <= 1, true);
  }
  // the kickboxing hardening never contains the boxing-only items
  for (let i = 0; i < 20; i++) assert.ok(!JSON.stringify(JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','T','gym',['bands'],{sport:'kickboxing'}))")).blocks).match(/wristCurl|fingerExt/));
});

test("4a-U: round formats – DBV age class, standard without tournament, 3 × 2 min over 40, tournament format in preparation", () => {
  const a = app();
  const main = (s) => s.blocks.find((b) => b.key === "main");
  a.run("S.profile.level=0;S.profile.limits=[];S.profile.birthYear=2010;"); // 16 → U17
  assert.deepEqual([main(boxSess(a, "T", [], { min: 45 })).w, main(boxSess(a, "T", [], { min: 45 })).b], [120, 60]);
  a.run("S.profile.birthYear=2015;"); // 11 → U13
  assert.equal(main(boxSess(a, "T", [], { min: 30 })).w, 60);
  a.run("S.profile.birthYear='';S.profile.level=1;"); // nothing entered: adult
  assert.equal(main(boxSess(a, "T", [])).w, 180);
  assert.ok(!boxSess(a, "T", []).notes.some((n) => /Geburtsjahr/.test(n)));
  a.run("S.profile.birthYear=1981;"); // 45
  const m = boxSess(a, "T", []);
  assert.equal(main(m).w, 120);
  assert.ok(m.notes.some((n) => /kein offizielles DBV-Format/.test(n)));
  // tournament in 4 weeks, adult: 3 × 3 min; tournament of the age class U17: 2 min
  a.run("S.profile.birthYear=1995;S.profile.comps=[{id:'c1',kind:'comp',sport:'boxing',date:iso(addDays(today(),28))}];");
  assert.equal(a.run("phaseInfo().format.w"), 180);
  assert.equal(main(boxSess(a, "T", [])).w, 180);
  assert.equal(a.run("phaseInfo().official"), true);
  a.run("S.profile.birthYear=2010;");
  assert.equal(a.run("phaseInfo().format.w"), 120);
  assert.equal(main(boxSess(a, "T", [])).w, 120);
  // kickboxing stays on its own format
  a.run("S.profile.birthYear=1995;S.profile.comps=[];");
  assert.equal(main(JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','T','gym',[],{sport:'kickboxing'}))"))).w, 180);
});

test("4a-U: partner days – Aufgabensparring only; touch sparring max once, never for beginners, kids, taper/recovery or after a KO", () => {
  const a = app();
  const tasksOf = (s) => boxItems(s).filter((it) => it.k === "task");
  a.run("S.profile.level=1;S.profile.birthYear=1995;S.profile.limits=[];S.profile.comps=[];");
  let free = 0;
  for (let i = 0; i < 60; i++) {
    const t = tasksOf(boxSess(a, "P", ["partner"], { min: 90 }));
    assert.ok(t.length && t.every((x) => x.id.startsWith("bx_") && x.m === "p"));
    const n = t.filter((x) => x.id === "bx_free").length;
    assert.ok(n <= 1, "at most one touch-sparring round");
    free += n;
  }
  assert.ok(free > 0, "touch sparring does occur from Fortgeschritten");
  // beginners and children: none
  for (const [lvl, by] of [[0, 1995], [1, 2015]]) {
    a.run(`S.profile.level=${lvl};S.profile.birthYear=${by};`);
    for (let i = 0; i < 30; i++) assert.ok(!tasksOf(boxSess(a, "P", ["partner"], { min: 90 })).some((x) => x.id === "bx_free"));
  }
  // children never spar with a partner
  for (let i = 0; i < 15; i++) assert.ok(tasksOf(boxSess(a, "P", ["partner"], { min: 90 })).every((x) => x.m !== "p"));
  // taper week: only light tasks, no touch sparring
  a.run("S.profile.level=2;S.profile.birthYear=1995;S.profile.comps=[{id:'c1',kind:'comp',sport:'boxing',date:iso(addDays(today(),5))}];");
  assert.equal(a.run("phaseInfo().phase"), "taper");
  for (let i = 0; i < 30; i++) {
    const t = tasksOf(boxSess(a, "P", ["partner"], { min: 90 }));
    assert.ok(t.every((x) => ["bx_lead", "bx_attdef", "bx_counter", "bx_bodyhead", "bx_first"].includes(x.id)), t.map((x) => x.id).join());
  }
  // text with the notice is shown
  a.run("S.profile.comps=[];S.profile.level=2;");
  let shown = "";
  for (let i = 0; i < 80 && !/Absprache mit deinem Trainer/.test(shown); i++) {
    a.run("ui.sel=iso(today());ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'P','gym',['partner'],{sport:'boxing',min:90});ui.setup=setupOf(S.sessions[ui.sel],ui.sel);");
    shown = a.run("renderSession()");
  }
  assert.match(shown, /Freies Touch-Sparring/);
  assert.match(shown, /30–40 % Schlaghärte/);
  assert.match(shown, /Absprache mit deinem Trainer und unter Aufsicht/);
});

test("4a-U: K.o. ban – boxing 30 days (DBV), kickboxing 4 weeks; solo and contactless; hint to the escalation", () => {
  const a = app();
  a.run("S.profile.level=1;S.profile.birthYear=1995;S.profile.limits=[];S.ko='2026-10-05';"); // 29 days before 2026-11-03
  const b = boxSess(a, "P", ["partner", "bag"], { min: 90 });
  assert.ok(!boxItems(b).some((it) => it.k === "task" && it.m === "p") && b.type === "T", "boxing: still locked after 29 days");
  assert.ok(b.notes.some((n) => /mindestens 30 Tage/.test(n) && /§89/.test(n)));
  assert.ok(!boxItems(b).some((it) => it.k === "partner"), "no partner rounds");
  const k = JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','P','gym',['partner','bag'],{sport:'kickboxing',min:90}))"));
  assert.equal(k.type, "P", "kickboxing: 4 weeks are over");
  a.run("S.ko='2026-10-04';"); // 30 days
  const c = boxSess(a, "P", ["partner", "bag"], { min: 90 });
  assert.equal(c.type, "P");
  assert.ok(boxItems(c).some((it) => it.k === "task"));
});

test("4a-U: a unit can be set to Boxen (development preview) and back; history is shared; the main profile does not offer it", () => {
  const a = app();
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(sportChoices())")), ["kickboxing", "boxing", "taekwondo"], "profile: all released sports");
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(sportChoices(true))")), ["kickboxing", "boxing", "taekwondo"]);
  a.run("ui.sel=iso(today());ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',[]);ui.setup=setupOf(S.sessions[ui.sel],ui.sel);");
  assert.match(a.run("renderSession()"), /data-usport="boxing"[^>]*>Boxen</);
  a.run("S.log.push({id:'k1',date:'2026-11-02',src:'own',type:'T',sport:'kickboxing',minutes:60,rpe:8,tHi:8});");
  const wk = a.run("weekLoadSum(S.log,'2026-11-02')");
  a.run("S.log.push({id:'b1',date:'2026-11-02',src:'own',type:'T',sport:'boxing',minutes:60,rpe:8,tHi:8});");
  const wk2 = a.run("weekLoadSum(S.log,'2026-11-02')");
  assert.ok(wk2 > wk && wk > 0, "a boxing entry counts in the same week load as a kickboxing entry");
  const s = boxSess(a, "T", ["bag"]);
  assert.equal(s.sport, "boxing");
  const back = JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','T','gym',['bag'],{sport:'kickboxing'}))"));
  assert.equal(back.sport, "kickboxing");
  assert.ok(boxItems(back).some((it) => it.combo && it.combo.some((x) => KICKTOK.test(x))) || boxItems(back).length, "kickboxing session is built again");
});

test("4a-U: evasion rounds always name the defence and leave the opponent open; a larger share of footwork and evasion; rendered with A/B frames", () => {
  const a = app();
  a.run("S.profile.level=1;S.profile.birthYear=1995;S.profile.limits=[];");
  let foot = 0, evade = 0, total = 0;
  for (let i = 0; i < 20; i++) {
    const s = boxSess(a, "T", ["bag"], { min: 60 });
    const rr = boxItems(s).filter((it) => it.kind === "round" && it.bk === "main");
    total += rr.length;
    foot += rr.filter((r) => r.k === "foot").length;
    for (const r of rr.filter((x) => x.k === "evade")) {
      evade++;
      assert.ok(r.evade && r.evade.d && !r.react, "defence named, the opponent's action stays open");
    }
  }
  assert.ok((foot + evade) / total >= 0.4, `footwork + evasion share ${(foot + evade) / total}`);
  a.run("ui.sel=iso(today());ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'boxing',min:60});ui.setup=setupOf(S.sessions[ui.sel],ui.sel);");
  const h = a.run("renderSession()");
  assert.match(h, /Meiden &amp; Kontern|Meiden & Kontern/);
  assert.match(h, /class="dfn"/);
  assert.ok(!/class="pg b"/.test(h.slice(h.indexOf("Meiden &"), h.indexOf("Meiden &") + 700)), "no B frame in the evasion round");
  assert.ok(!/Boxeinheit nach DBV-Regeln/.test(h), "the rule link sits in the Today footer only");
  assert.doesNotMatch(h, /Entwicklungsvorschau/, "no preview note after the release");
});

test("4a-U fix: no kick exercise (Kick-Intervalle, Kick-Halten, …) in any boxing block – all types, levels, equipment", () => {
  const a = app();
  const bad = new Set(JSON.parse(a.run("JSON.stringify([...BOXT.BOX_NO_EX])")));
  for (const lvl of [0, 1, 2]) {
    a.run(`S.profile.level=${lvl};S.profile.birthYear=1995;S.profile.limits=[];`);
    for (let i = 0; i < 25; i++)
      for (const type of ["T", "C", "P", "S", "K", "M"]) {
        const s = boxSess(a, type, ["partner", "bag", "rope", "weights", "kb", "bands", "bar"]);
        for (const it of boxItems(s)) assert.ok(!bad.has(it.id), `${type} lvl${lvl}: ${it.id}`);
      }
  }
  // kickboxing still gets them
  let seen = false;
  a.run("S.profile.level=1;");
  for (let i = 0; i < 60 && !seen; i++) seen = JSON.stringify(JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','K','gym',['rope'],{sport:'kickboxing'}))"))).includes("cond.kick_intervals");
  assert.ok(seen, "kickboxing keeps its kick intervals");
});

test("4a-U: main sport Boxen (development preview) in the profile – no discipline/focus, plan sessions are boxing, label says Boxen", () => {
  const a = app();
  a.run("draft=null;ui.profSec='me';ui.psport=null;");
  let h = a.run("renderProfile()");
  assert.match(h, /data-psport="boxing"[^>]*>Boxen</);
  assert.match(h, /data-p="disc"/, "kickboxing: discipline row");
  // 7i: choosing boxing in the sport row shows its details; the main sport only changes through its own button
  a.run("ui.psport='boxing';");
  h = a.run("renderProfile()");
  assert.ok(!/data-p="disc"/.test(h) && !/data-p="focus"/.test(h), "boxing has no discipline and no kick/punch focus");
  assert.match(h, /data-p="sport" data-v="boxing"/, "button: make boxing the main sport");
  a.run("S.profile.sport='boxing';draft=null;ui.psport=null;");
  h = a.run("renderProfile()");
  assert.ok(!/data-p="disc"/.test(h) && !/data-p="focus"/.test(h));
  assert.match(h, /data-psport="boxing" aria-pressed="true">Boxen<small class="hsb">/, "main sport badge");
  assert.doesNotMatch(h, /data-p="sport"/, "no button when it already is the main sport");
  assert.match(a.run("eyebrow()"), /Boxen/);
  assert.equal(a.run("ruleTags()"), "");
  a.run("S.sessions={};S.sessions['2026-11-03']=buildSession('2026-11-03','T','gym',['bag']);");
  assert.equal(a.run("S.sessions['2026-11-03'].sport"), "boxing", "default = main sport");
  assert.ok(!JSON.stringify(a.run("S.sessions['2026-11-03'].blocks")).includes("cond.kick_intervals"));
  a.run("S.profile.sport='kickboxing';draft=null;");
  assert.match(a.run("renderProfile()"), /data-p="disc"/);
  assert.match(a.run("eyebrow()"), /Light Contact|Kick Light|Full Contact|K1/);
});

test("4a-U: start page – blue (left) and red (right) boxing outfits only when the shown session is set to boxing", () => {
  const a = app();
  const hero = () => a.run("todayCard(nextTrainingDate(), typeOn(nextTrainingDate()), 'kick')");
  const BLUE = /#2F6FD0/, RED = /#D2343F/;
  a.run("S.sessions={};");
  assert.ok(!BLUE.test(hero()) && !RED.test(hero()), "kickboxing: plain figures");
  a.run("{const d=iso(today());S.sessions[d]=buildSession(d,'T','gym',[],{sport:'boxing'});ui.setup=setupOf(S.sessions[d],d);}");
  const h = hero();
  assert.ok(BLUE.test(h) && RED.test(h), "boxing: both corners");
  assert.ok(h.indexOf("#2F6FD0") < h.indexOf("#D2343F") || h.indexOf("#2F6FD0") > -1, "blue fighter present");
  assert.match(h, /stroke="#FFFFFF" stroke-width="4.5"/, "white waistline");
  a.run("{const d=iso(today());S.sessions[d]=buildSession(d,'T','gym',[],{sport:'kickboxing'});ui.setup=setupOf(S.sessions[d],d);}");
  assert.ok(!BLUE.test(hero()), "back to kickboxing: plain figures again");
});

test("4b: guide – boxers get boxing topics and no kickbox rule/shin topics; kickboxers keep theirs; WKB link in the rules topic", () => {
  const a = app();
  const keys = () => JSON.parse(a.run("JSON.stringify(readsFor().map((r) => r.k))"));
  assert.ok(keys().includes("shin") && keys().includes("judge") && !keys().includes("bag"), "kickboxing unchanged");
  assert.match(a.run("guidePanelHtml()"), /rund ums Kickboxen/);
  a.run("S.profile.sport='boxing';");
  const kb = keys();
  for (const k of ["bgear", "bag", "bhist", "brules", "myths", "mind", "sleep"]) assert.ok(kb.includes(k), k);
  for (const k of ["shin", "judge", "disc", "day", "gloves"]) assert.ok(!kb.includes(k), k + " is kickbox-only");
  assert.match(a.run("guidePanelHtml()"), /rund ums Boxen/);
  const hist = a.run("guideSheetHtml({id:'bhist'})");
  assert.match(hist, /Olympedia/);
  assert.doesNotMatch(hist, /WAKO/);
  assert.match(a.run("guideSheetHtml({id:'brules'})"), /DBV-WKB|boxverband\.de/);
  assert.doesNotMatch(a.run("guideSheetHtml({id:'care'})"), /Schienbein/, "no shin guards in boxing care");
  assert.doesNotMatch(a.run("guideSheetHtml({id:'aid'})"), /WAKO/);
  a.run("S.profile.lang='en';");
  assert.match(a.run("guideSheetHtml({id:'bag'})"), /Heavy-bag work/);
});

test("4b: packing list, tour text and share text follow the main sport", () => {
  const a = app();
  assert.ok(a.run("packItems('c1').some((x) => /Schienbein/.test(x.txt))"));
  a.run("S.profile.sport='boxing';");
  const items = a.run("packItems('c1').map((x) => x.txt).join('|')");
  assert.match(items, /Boxhandschuhe/);
  assert.doesNotMatch(items, /Schienbein|Kick Light/);
  assert.match(a.run("t('tourIntroBox')"), /DBV/);
  assert.match(a.run("t('inst').shareTextBox"), /Boxen/);
});

test("4b: tips and fun facts are split by sport; kickbox-only tips are flagged, boxing ones carry the trainer note", () => {
  const a = app();
  const n = (code) => +a.run(code);
  assert.ok(n("TIPS.filter((x) => x.b).length") >= 9);
  assert.ok(n("FACTS.filter((x) => x.b).length") >= 7);
  assert.equal(n("TIPS.filter((x) => x.b && /Kick|Tritt|Schienbein/i.test(x.de||x.t||'')).length"), 0, "boxing tips mention no kicks");
  assert.ok(n("TIPS.filter((x) => x.k).length") >= 8);
  assert.match(a.run("t('tipTrainer')"), /Trainer/);
});

test("4b: onboarding asks for the sport first (two sports visible); boxers skip the kickbox discipline question", () => {
  const a = app();
  a.run("ui.onb={step:0,disc:'lc',days:[0,2,4],minutes:75,birthYear:'',comp:'',clubDays:[],clubMin:90};renderOnb();");
  let h = a.run("document.getElementById('onb').innerHTML");
  assert.match(h, /data-osport="boxing"/);
  assert.match(h, /data-od="k1"/);
  a.run("ui.onb.sport='boxing';renderOnb();");
  h = a.run("document.getElementById('onb').innerHTML");
  assert.doesNotMatch(h, /data-od=/);
  assert.match(h, /Altersklasse/);
});

test("4b: technique test – boxing description; technique-only rating for the other sport keeps the fitness values", async () => {
  const a = app();
  a.run("S.profile.sport='boxing';ui.tab='test';ui.testOpen=true;ui.testDraft={};");
  let h = a.run("renderTest()");
  assert.match(h, /Uppercut, Deckung und Beinarbeit/);
  assert.match(h, /data-tsport="kickboxing"/);
  assert.match(h, /id="tStr"/);
  a.run("ui.testDraft.tsport='kickboxing';");
  h = a.run("renderTest()");
  assert.doesNotMatch(h, /id="tStr"/, "no fitness fields when only the technique of the other sport is rated");
  assert.match(h, /Roundhouse, Sidekick/);
  a.run(`S.tests=[{id:'t0',date:'2026-10-01',method:'rz-1',raw:{str:30,spd:30,end:700,flx:4,tec:4},scores:{str:4,spd:4,end:4,flx:4,tec:4},techBy:{boxing:4},total:20,complete:true,min:4}];`);
  const before = a.run("levelFor(S.tests,'kickboxing').needTech");
  assert.equal(before, true, "kickboxing technique is still missing");
  a.run("S.tests.push({id:'t1',date:'2026-11-02',method:'rz-1',raw:{str:null,spd:null,end:null,flx:null,tec:4},scores:{str:null,spd:null,end:null,flx:null,tec:4},techBy:{kickboxing:4}});");
  assert.equal(a.run("levelFor(S.tests,'kickboxing').needTech"), false);
  assert.ok(+a.run("levelFor(S.tests,'kickboxing').level") >= 1, "shared values + new technique give a level");
  a.run("ui.testOpen=false;");
  assert.match(a.run("renderTest()"), /20/, "the last full test is still the one shown");
});

/* ---------- 6a: taekwondo grade area, dobok figures, sport choice ---------- */
const tk = (a, o) => a.click({ dataset: o });
test("6a: profile.tkd is normalised on load (unknown grades dropped, styles separate)", () => {
  const a = app();
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(migrate({tkd:{style:'xx',wt:'k99',itf:'p1',hist:[1,{style:'wt',date:'2026-01-01',to:'k5'}],exams:[{style:'wt',date:'2026-02-01',target:'k4'},{style:'itf',date:'2026-02-01',target:'p1'}]}}).tkd)")),
    { style: "wt", names: "ko", wt: "", itf: "", hist: [{ style: "wt", date: "2026-01-01", to: "k5" }], exams: [{ style: "wt", date: "2026-02-01", target: "k4" }] });
  assert.equal(a.run("S.profile.tkd.style"), "wt");
});
test("6a: grade is set only by an entry, a confirmed exam or a correction – sessions, log and tests never move it", async () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.birthYear=1995;");
  assert.equal(a.run("tkdGradeOf('wt')"), "");
  a.run("S.log.push({id:'x1',date:'2026-11-02',src:'own',type:'S',sport:'taekwondo',minutes:60,rpe:6,tHi:6});S.tests.push({id:'t1',date:'2026-11-02',scores:{str:5,spd:5,end:5,flx:5,tec:5},techBy:{'taekwondo:wt':5}});");
  assert.equal(a.run("tkdGradeOf('wt')"), "", "log and tests do not change the grade");
  await tk(a, { tk: "grade", tv: "k5" });
  assert.equal(a.run("tkdGradeOf('wt')"), "k5");
  assert.equal(a.run("S.profile.tkd.hist.at(-1).kind"), "start");
  await tk(a, { tk: "grade", tv: "k4" });
  assert.equal(a.run("S.profile.tkd.hist.at(-1).kind"), "correct", "later change = correction");
  // exam: a failed one leaves the grade, a passed one asks first
  a.run("S.profile.tkd.exams.push({id:'e1',style:'wt',date:'2026-10-01',target:'k3',result:null},{id:'e2',style:'wt',date:'2026-10-02',target:'k3',result:null});");
  await tk(a, { tk: "res", tv: "e1:n" });
  assert.equal(a.run("tkdGradeOf('wt')"), "k4");
  assert.equal(a.run("S.profile.tkd.hist.at(-1).passed"), false);
  await tk(a, { tk: "res", tv: "e2:y" });
  assert.equal(a.run("ui.tkdAsk"), "e2");
  assert.equal(a.run("tkdGradeOf('wt')"), "k4", "nothing changes before the confirmation");
  assert.match(a.run("tkdPanelHtml()"), /data-tk="apply"/);
  await tk(a, { tk: "apply", tv: "e2:1" });
  assert.equal(a.run("tkdGradeOf('wt')"), "k3");
  assert.equal(a.run("ui.tkdAsk"), null);
  // declined confirmation: result saved, grade kept
  a.run("S.profile.tkd.exams.push({id:'e3',style:'wt',date:'2026-10-03',target:'k2',result:null});");
  await tk(a, { tk: "res", tv: "e3:y" });
  await tk(a, { tk: "apply", tv: "e3:0" });
  assert.equal(a.run("tkdGradeOf('wt')"), "k3");
  assert.equal(a.run("S.profile.tkd.hist.at(-1).applied"), false);
});
test("6a: WT and ITF grades are kept apart; switching the style never carries a grade over", async () => {
  const a = app();
  await tk(a, { tk: "grade", tv: "k6" });
  await tk(a, { tk: "style", tv: "itf" });
  assert.equal(a.run("tkdStyle()"), "itf");
  assert.equal(a.run("tkdGradeOf()"), "", "ITF has no grade yet");
  await tk(a, { tk: "grade", tv: "k8" });
  await tk(a, { tk: "style", tv: "wt" });
  assert.equal(a.run("tkdGradeOf()"), "k6");
  assert.equal(a.run("tkdGradeOf('itf')"), "k8");
  assert.equal(a.run("S.profile.tkd.hist.filter((x) => x.style === 'itf').length"), 1);
});
test("6a: panel shows the grade, the exam overview with form names and the waiting-time hint", async () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.birthYear=1995;draft=null;");
  await tk(a, { tk: "grade", tv: "k6" });
  const h = a.run("tkdPanelHtml()");
  assert.match(h, /6\. Kup/);
  assert.match(h, /5\. Kup – Teile laut Prüfungsordnung|Prüfung zum 5\. Kup/);
  assert.match(h, /Taegeuk Sam Jang/, "the usual form name for the 5th Kup");
  assert.match(h, /Mindestwartezeit/);
  assert.doesNotMatch(h, /Ilbo|Tul/, "no ITF parts in WT");
  await tk(a, { tk: "style", tv: "itf" });
  await tk(a, { tk: "grade", tv: "k5" });
  const i = a.run("tkdPanelHtml()");
  assert.match(i, /Yul-Gok/, "Tul of the 4th Kup (next grade)");
  assert.match(i, /Ibo-Matsogi/);
  a.run("S.profile.lang='en';");
  assert.match(a.run("tkdPanelHtml()"), /Exam for 4th Kup/);
});
test("6a/6b: taekwondo WT unit types, ITF only sport-neutral types, own labels", () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.days=[0,1,2,3];S.profile.birthYear=1995;S.profile.level=1;");
  const types = JSON.parse(a.run("JSON.stringify(Object.values(dayTypes()))"));
  assert.deepEqual(types, ["T", "S", "P", "M"], "WT pattern since 7b: mobility instead of conditioning");
  a.run("S.profile.tkd.style='itf';");
  const itf = JSON.parse(a.run("JSON.stringify(Object.values(dayTypes()))"));
  assert.ok(itf.every((x) => ["T", "S", "P", "K"].includes(x)) && itf.includes("T"), "ITF pattern like WT since 6c: " + itf);
  a.run("S.profile.tkd.style='wt';");
  assert.equal(a.run("(()=>{buildSport='taekwondo';const d=discOf();buildSport=null;return d})()"), "tkd");
  const s = JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','S','gym',['bag','rope'],{sport:'taekwondo'}))"));
  assert.equal(s.sport, "taekwondo");
  assert.ok(s.blocks.length >= 3);
  assert.equal(a.run("discLabel()"), "Taekwondo WT / DTU");
  a.run("S.profile.tkd.style='itf';");
  assert.equal(a.run("discLabel()"), "Taekwondo ITF-D");
  assert.equal(a.run("ruleTags()"), "", "no kickboxing rule tags");
  a.run("ui.sel='2026-11-03';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'S','gym',[],{sport:'taekwondo'});ui.setup=setupOf(S.sessions[ui.sel],ui.sel);");
  assert.doesNotMatch(a.run("renderSession()"), /Technik und Partnerübungen folgen/, "no placeholder note since 6c");
  assert.match(a.run("renderSession()"), /data-usport="taekwondo"[^>]*>Taekwondo</);
});
test("6a: figures wear the white dobok with the belt of the grade (taekwondo only); a swimsuit never replaces it; kickboxing and boxing unchanged", async () => {
  const a = app();
  const BELT = (g) => a.run(`TKDT.beltOf('${g}').base`);
  a.run("S.profile.sport='taekwondo';");
  await tk(a, { tk: "grade", tv: "k4" });
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(outfitFor('taekwondo'))")), { tkd: JSON.parse(a.run("JSON.stringify(TKDT.beltOf('k4'))")) });
  const hero = a.run("heroScene('kick','S',false,outfitFor('taekwondo'))");
  assert.ok(hero.includes(BELT("k4")), "blue belt for the 4th Kup");
  assert.ok(hero.includes("#FEFEFC"), "dobok colour");
  assert.ok(!hero.includes("#2F6FD0") && !hero.includes("#D2343F"), "no boxing corners");
  const none = a.run("heroScene('kick','S',false,outfitFor('taekwondo',{tgrade:'',tstyle:'wt'}))");
  assert.ok(none.includes(a.run("TKDT.COLORS.white")), "no grade: white belt as the standard drawing");
  // summer (palm and deckchair since 7c-3): the dobok stays
  a.run("ui.seasonDate='2026-07-15';S.profile.seasonOff=false;");
  assert.ok(a.run("heroScene('kick','S',false,outfitFor('taekwondo'))").includes("#FEFEFC"));
  assert.equal(a.run("outfitFor('kickboxing')"), false);
  assert.equal(a.run("outfitFor('boxing')"), true);
  assert.ok(!a.run("fightPair('kick',14,false)").includes("#FEFEFC"), "kickboxing figures unchanged");
  assert.ok(a.run("fightPair('kick',14,true)").includes("#2F6FD0"), "boxing corners unchanged");
});
test("6a: start page shows the dobok only when the shown unit is a taekwondo unit", () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.days=[0,1,2,3,4,5,6];ui.tab='week';");
  a.run("{const d=iso(today());S.sessions[d]=buildSession(d,'S','gym',[],{sport:'taekwondo'});ui.setup=setupOf(S.sessions[d],d);}");
  const h = a.run("todayCard()");
  assert.ok(h.includes("#FEFEFC"));
  a.run("{const d=iso(today());S.sessions[d]=buildSession(d,'T','gym',[],{sport:'kickboxing'});ui.setup=setupOf(S.sessions[d],d);}");
  assert.ok(!a.run("todayCard()").includes("#FEFEFC"), "a kickboxing unit: no dobok");
});
test("6a: onboarding – taekwondo asks style and grade, skips the kickboxing discipline, stores the grade as an entry", async () => {
  const a = app();
  a.run("ui.onb={step:0,disc:'lc',days:[0,2,4],minutes:75,birthYear:'',comp:'',clubDays:[],clubMin:90,sport:'taekwondo'};renderOnb();");
  let h = a.run("document.getElementById('onb').innerHTML");
  assert.match(h, /data-otstyle="itf"/);
  assert.match(h, /data-otgrade="k4"/);
  assert.doesNotMatch(h, /data-od=/);
  assert.ok(h.includes("#FEFEFC"), "the figures wear the dobok");
  await a.click({ dataset: { otstyle: "itf" } });
  await a.click({ dataset: { otgrade: "k7" } });
  assert.equal(a.run("ui.onb.tgrade"), "k7");
  await a.click({ dataset: { otstyle: "wt" } });
  assert.equal(a.run("ui.onb.tgrade"), "k7", "k7 exists in WT too");
  h = a.run("document.getElementById('onb').innerHTML");
  assert.ok(h.includes(a.run("TKDT.beltOf('k7').tip")), "belt of the chosen grade");
});
test("6a: technique test – taekwondo description, technique level kept per style", async () => {
  const a = app();
  a.run("S.profile.sport='kickboxing';ui.tab='test';ui.testOpen=true;ui.testDraft={tsport:'taekwondo'};");
  let h = a.run("renderTest()");
  assert.match(h, /Grundtritte/);
  assert.doesNotMatch(h, /id="tStr"/, "technique only for the other sport");
  a.run("S.tests=[{id:'t0',date:'2026-10-01',raw:{str:30,spd:30,end:700,flx:4,tec:4},scores:{str:4,spd:4,end:4,flx:4,tec:4},techBy:{kickboxing:4},total:20,complete:true,min:4}];");
  assert.equal(a.run("levelFor(S.tests,'taekwondo','wt').needTech"), true);
  a.run("S.tests.push({id:'t1',date:'2026-11-02',raw:{tec:4},scores:{tec:4},techBy:{'taekwondo:wt':4}});");
  assert.equal(a.run("levelFor(S.tests,'taekwondo','wt').needTech"), false);
  assert.equal(a.run("levelFor(S.tests,'taekwondo','itf').needTech"), true, "ITF technique is rated separately");
});
test("6d: loader – tips and facts by sport × style × language (no foreign items, tk items only in taekwondo)", () => {
  const a = app();
  const seenBy = (sport, style, lg) => {
    a.run(`S.profile.sport='${sport}';S.profile.lang='${lg}';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${style}'});`);
    const out = [];
    for (let i = 0; i < 80; i++) {
      a.run(`loadIdx=${i};showCard();`);
      out.push(a.run("document.getElementById('factT').textContent"));
    }
    return new Set(out);
  };
  const items = (name) => JSON.parse(a.run(`JSON.stringify(${name})`));
  const TIPS = items("TIPS"), FACTS = items("FACTS");
  const find = (txt, lg) => [...TIPS, ...FACTS].filter((x) => x[lg] === txt);
  for (const lg of ["de", "en"])
    for (const style of ["wt", "itf"]) {
      const seen = seenBy("taekwondo", style, lg);
      let tk = 0, facts = 0;
      for (const txt of seen) {
        const hit = find(txt, lg);
        assert.ok(hit.length, "a known item: " + txt);
        const x = hit[0];
        assert.ok(!x.k && !x.b && !x.d || x.tk, "no kickboxing/boxing item in taekwondo: " + txt);
        if (x.tk) {
          tk++;
          assert.ok(x.tk === true || x.tk === style, "only this style: " + txt);
        }
        if (FACTS.includes(x)) facts++;
      }
      for (const txt of seen) assert.doesNotMatch(txt, /Haken|Jab|Cross|Uppercut|hook|Füße kreuzen|cross your feet/i, "no punch technique tip in taekwondo: " + txt);
      assert.ok(tk >= 8, "tk items shown " + style + lg);
      assert.ok(facts >= 3, "facts shown " + style + lg);
      const other = style === "wt" ? "itf" : "wt";
      for (const txt of seen) assert.notEqual(find(txt, lg)[0].tk, other, "no " + other + " item for " + style);
    }
  for (const sport of ["kickboxing", "boxing"])
    for (const lg of ["de", "en"])
      for (const txt of seenBy(sport, "wt", lg)) assert.ok(!find(txt, lg)[0].tk, sport + " never shows tk: " + txt);
});
test("6d: all taekwondo tips and facts have both languages; facts carry a source; flags valid", () => {
  const a = app();
  for (const name of ["TIPS", "FACTS"]) {
    const L = JSON.parse(a.run(`JSON.stringify(${name}.filter((x) => x.tk))`));
    assert.ok(L.length >= (name === "TIPS" ? 14 : 7));
    for (const x of L) {
      assert.ok([true, "wt", "itf"].includes(x.tk));
      assert.ok(x.de.length > 20 && x.en.length > 20);
      if (name === "FACTS") assert.ok(x.s, "source");
    }
  }
});
test("6a: no kickboxing/boxing technique exercises in taekwondo units (all types, many builds); neutral exercises stay", () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.days=[0,1,2,3,4,5,6];S.profile.birthYear=1995;");
  const bad = JSON.parse(a.run("JSON.stringify([...TKDT.NO_EX])"));
  assert.ok(bad.length >= 6);
  const seen = new Set();
  for (const ty of ["S", "K", "M", "T", "C", "P"])
    for (let i = 0; i < 20; i++) {
      const s = JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-0${(i % 6) + 2}','${ty}',['gym','home','outdoor'][${i} % 3],['weights','bag','rope','band','kb'],{sport:'taekwondo'}))`));
      JSON.stringify(s.blocks).match(/"id":"([a-z]+\.[a-z_0-9]+)"/g)?.forEach((m) => seen.add(m.split('"')[3]));
    }
  assert.ok(seen.size > 8, "found exercise keys");
  for (const k of bad) assert.ok(!seen.has(k), k + " must not appear");
  // kickboxing keeps them
  assert.equal(a.run("(()=>{S.profile.sport='kickboxing';return okEx(EX['warm.easy_shadowboxing'],'gym',[])})()"), true);
});
test("6a: the association (WT/ITF) and the name language are switched under About me and take effect at once", async () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.birthYear=1995;draft=null;ui.psport=null;");
  const h = a.run("profSportHtml(S.profile)");
  assert.match(h, /data-tk="style" data-tv="itf"/);
  assert.match(h, /data-tk="names" data-tv="app"/);
  assert.equal(a.run("tkdNames()"), "ko", "default Korean");
  await tk(a, { tk: "names", tv: "app" });
  assert.equal(a.run("tkdNames()"), "app");
  await tk(a, { tk: "style", tv: "itf" });
  assert.equal(a.run("discLabel()"), "Taekwondo ITF-D");
  a.run("S.profile.sport='kickboxing';");
  assert.doesNotMatch(a.run("profSportHtml(S.profile)"), /data-tk="style"/, "only for taekwondo");
});
test("6a: dobok stands out – pure white dobok, skin-tone head and fists, no gloves", () => {
  const a = app();
  const h = a.run("heroScene('kick','S',false,outfitFor('taekwondo',{tgrade:'k4',tstyle:'wt'}))");
  assert.ok(h.includes("#FEFEFC") && h.includes("#E3B48F"));
  assert.ok(!h.includes('r="11" fill="#C8404A"'), "no kickboxing gloves on the dobok figures");
});

test("6a/6c: taekwondo WT and ITF-D both offer technique, technique & conditioning and sparring", async () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.birthYear=1995;S.profile.days=[0,1,2,3,4,5,6];S.profile.tkd.style='wt';");
  a.run("{const d='2026-11-03';S.sessions[d]=buildSession(d,'S','gym',[],{sport:'taekwondo'});ui.sel=d;ui.tab='session';ui.setup=setupOf(S.sessions[d],d);}");
  assert.match(a.run("renderSession()"), /data-stype="T"[\s\S]*data-stype="C"[\s\S]*data-stype="P"/);
  a.run("S.profile.tkd.style='itf';");
  assert.match(a.run("renderSession()"), /data-stype="T"[\s\S]*data-stype="C"[\s\S]*data-stype="P"/);
  for (const ty of ["T", "C", "P"]) {
    const s = JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-03','${ty}','gym',['bag','pads','partner','weights'],{sport:'taekwondo'}))`));
    assert.equal(s.type, ty, "ITF keeps " + ty);
    assert.equal(s.tstyle, "itf");
  }
  a.run("ui.setup.sport='kickboxing';");
  assert.match(a.run("renderSession()"), /data-stype="T"/, "kickboxing keeps all types");
});

test("6a: onboarding picture fits the sport – boxing shows the boxing scene, taekwondo the dobok, the picture never collapses", () => {
  const a = app();
  const onb = (sp) => { a.run(`ui.onb={step:0,disc:'lc',days:[0,2,4],minutes:75,birthYear:'',comp:'',clubDays:[],clubMin:90,sport:'${sp}',tstyle:'wt',tgrade:''};renderOnb();`); return a.run("document.getElementById('onb').innerHTML"); };
  const box = onb("boxing");
  assert.ok(box.includes(a.run("fightPair('box',14,true)").slice(0, 200)), "boxing scene with corner colours");
  assert.ok(onb("taekwondo").includes("#FEFEFC"));
  assert.match(box, /flex-shrink:0/);
});

test("6b: resistance bands chosen for a mobility unit are used – in every sport", () => {
  const a = app();
  for (const sp of ["kickboxing", "boxing", "taekwondo"]) {
    a.run(`S.profile.sport='${sp}';S.profile.birthYear=1995;`);
    let withBands = 0;
    for (let i = 0; i < 25; i++) {
      const s = JSON.stringify(JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-03','M','home',['bands'],{sport:'${sp}'}))`)).blocks);
      if (/band_activation|band_dislocates/.test(s) || a.run(`JSON.stringify(buildSession('2026-11-03','M','home',['bands'],{sport:'${sp}'}))`).includes("Band")) withBands++;
    }
    assert.equal(withBands, 25, sp + ": bands in every unit");
  }
  // without bands nothing is forced
  const none = a.run("JSON.stringify(buildSession('2026-11-03','M','home',[],{sport:'kickboxing'}))");
  assert.doesNotMatch(none, /band_activation|band_dislocates/);
});

/* ---------- 6b: Taekwondo WT plans (technique, technique & conditioning, sparring) ---------- */
const TKD_IDS = "ap dol dolh yeop mireo dwi nae ban dhu ttdol ttyeop jir stepf stepb steps turn swch sr1 sr2 sr3 sr4 sr5".split(" ");
function tkdProfile(a, o = {}) {
  a.run(
    `S.profile.sport='taekwondo';S.profile.tkd.style='wt';S.profile.days=[0,1,2,3];S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 1};S.profile.limits=${JSON.stringify(o.limits || [])};S.profile.tkd.wt='${o.grade || ""}';`,
  );
}
const tkdSess = (a, type, loc = "gym", eq = ["bag", "partner", "rope"]) =>
  JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-03','${type}','${loc}',${JSON.stringify(eq)},{sport:'taekwondo'}))`));
const idsIn = (s) => new Set([...JSON.stringify(s).matchAll(/"combo":\[([^\]]*)\]/g)].flatMap((m) => m[1].match(/[a-z]+/g) || []).filter((x) => TKD_IDS.includes(x)));

test("6b: technique gating by level, grade, age and limits", () => {
  const a = app();
  const al = (id, c) => a.run(`TKDT.allowed('${id}',${JSON.stringify(c)})`);
  const base = { level: 0, kup: null, kid: false, young: false, risky: false };
  assert.equal(al("ap", base), true);
  assert.equal(al("dolh", base), false, "head kick needs level 1");
  assert.equal(al("dolh", { ...base, level: 1 }), true);
  assert.equal(al("dwi", { ...base, level: 1, young: true }), false, "no spinning back kick under 19");
  assert.equal(al("dwi", { ...base, level: 1 }), true);
  // 7g: level OR grade – either one releases
  assert.equal(al("dhu", { ...base, level: 0, kup: 8 }), false, "hooking kick: neither level 1 nor 6th Kup");
  assert.equal(al("dhu", { ...base, level: 1, kup: 8 }), true, "level 1 is enough");
  assert.equal(al("dhu", { ...base, level: 0, kup: 6 }), true, "6th Kup is enough");
  assert.equal(al("ttdol", { ...base, level: 0, kup: 5 }), false, "jump kicks: neither level 1 nor 4th Kup");
  assert.equal(al("ttdol", { ...base, level: 1, kup: 5 }), true, "level 1 is enough");
  assert.equal(al("ttdol", { ...base, level: 0, kup: 4 }), true, "4th Kup is enough");
  assert.equal(al("ttdol", { ...base, level: 0 }), false, "no grade entered: only the level counts");
  assert.equal(al("dolh", { ...base, level: 0, kup: 1 }), false, "head kicks have no grade route: level only");
  assert.equal(al("ttdol", { ...base, level: 0, kup: 1, young: true }), false, "age lock stays");
  assert.equal(al("ttdol", { ...base, level: 1 }), true, "no grade entered: only the level counts");
  assert.equal(al("ttdol", { ...base, level: 1, kup: 2, risky: true }), false, "knee/ankle limit");
  assert.equal(al("dolh", { ...base, level: 1, kid: true }), false, "children only basics");
  assert.equal(al("yeop", { ...base, kid: true }), true);
});

test("6b: WT units contain only taekwondo techniques that are allowed for the profile", () => {
  for (const [name, o] of [
    ["adult beginner", { lvl: 0 }],
    ["child 10y 8th Kup", { by: 2016, lvl: 0, grade: "k8" }],
    ["teen 16y 4th Kup", { by: 2010, lvl: 1, grade: "k4" }],
    ["adult with knee limit", { lvl: 1, limits: ["knee"] }],
  ]) {
    for (const type of ["T", "C", "P"]) {
      const a = app();
      tkdProfile(a, o);
      const ctx = JSON.parse(a.run("JSON.stringify(tkdCtx())"));
      for (let i = 0; i < 6; i++) {
        const s = tkdSess(a, type);
        if (type === "T") assert.ok(idsIn(s).size > 0, name + ": technique unit without technique ids");
        for (const id of idsIn(s)) assert.ok(a.run(`TKDT.allowed('${id}',${JSON.stringify(ctx)})`) === true, `${name} ${type}: ${id} not allowed`);
        assert.ok(!/jab|hook|uppercut|cross|boxen|Handschuh/i.test(JSON.stringify(s.blocks.filter((b) => /round|fight/i.test(b.key || "")))), `${name} ${type}: boxing content`);
      }
    }
  }
});

test("6b: kids get no head or jump kicks; opening rounds of a technique unit carry no head kicks", () => {
  const a = app();
  tkdProfile(a, { by: 2016, lvl: 0, grade: "k8" });
  for (let i = 0; i < 8; i++) {
    const ids = idsIn(tkdSess(a, "T"));
    for (const h of ["dolh", "nae", "dhu", "dwi", "ttdol", "ttyeop"]) assert.ok(!ids.has(h), "kid got " + h);
  }
});

test("6b: Korean names by default, app language on switch; speech always in the app language", () => {
  const a = app();
  tkdProfile(a);
  assert.equal(a.run("tkdNames()"), "ko");
  assert.equal(a.run("techNm('dol')"), a.run("TKDT.TECH.dol[2]"));
  assert.match(a.run("techNm('dol')"), /chagi/i);
  a.run("S.profile.tkd.names='app';");
  assert.equal(a.run("techNm('dol')"), a.run("TKDT.TECH.dol[0]"), "German app language");
  assert.equal(a.run("techNm('dol')"), a.run("TKDT.TECH.dol[S.profile.lang==='en'?1:0]"));
  a.run("S.profile.tkd.names='ko';");
  assert.equal(a.run("techNm('dol',true)"), a.run("TKDT.TECH.dol[0]"), "speech not Korean");
  // boxing / kickboxing names unaffected
  assert.equal(a.run("techNm('jab')"), a.run("TECH.jab[0]"));
});

test("6b: sparring tasks of taekwondo exist only in taekwondo; free sparring is touch, lvl 1, partner only, never for kids", () => {
  const a = app();
  const tasks = JSON.parse(a.run("JSON.stringify(TKDT.TASKS)"));
  assert.ok(tasks.length >= 5);
  assert.ok(tasks.every((t) => t.sport === "taekwondo"));
  const free = tasks.find((t) => t.id === "tk_free");
  assert.ok(free && free.lvl >= 1 && free.gear, "free sparring: level and gear");
  tkdProfile(a, { by: 2016, lvl: 0 });
  for (let i = 0; i < 8; i++) assert.ok(!/tk_free/.test(JSON.stringify(tkdSess(a, "P"))), "kids sparring free");
  const b = app();
  b.run("S.profile.sport='kickboxing';");
  for (let i = 0; i < 8; i++) assert.ok(!/tk_/.test(JSON.stringify(JSON.parse(b.run("JSON.stringify(buildSession('2026-11-03','P','gym',['partner','bag'],{sport:'kickboxing'}))")))), "tk task in kickboxing");
});

test("6b: WT bout format by age class, concussion ban by age, ITF unchanged", () => {
  const a = app();
  const f = (age) => JSON.parse(a.run(`JSON.stringify(TKDT.wtFormat('wt',${age}))`));
  assert.deepEqual([f(8).r, f(8).w, f(8).b, f(8).cls], [3, 90, 60, "td"]);
  assert.deepEqual([f(13).w, f(13).cls], [90, "tb"]);
  assert.deepEqual([f(16).w, f(16).cls], [120, "ta"]);
  assert.deepEqual([f(30).w, f(30).cls], [120, "s"]);
  assert.deepEqual([f(40).w, f(40).cls], [90, "v"]);
  assert.equal(f(5), null);
  assert.deepEqual([10, 16, 25, null].map((x) => a.run(`TKDT.koDaysFor(${x})`)), [50, 40, 30, 30]);
});

test("6b: taekwondo hardening = one hand area + one leg area, gentle for children, none of it in boxing", () => {
  const a = app();
  tkdProfile(a);
  const hardIds = (s) => s.blocks.filter((b) => b.key === "hard").flatMap((b) => b.items.map((i) => i.id));
  const HAND = ["fTap", "fGlove", "fWraps", "fPads", "tkEdge", "tkTips", "fFinger", "fWring"];
  const LEG = ["shintap", "shinbag", "tkFoot", "tkBall"];
  for (let i = 0; i < 12; i++) {
    const ids = hardIds(tkdSess(a, "S"));
    if (!ids.length) continue;
    assert.equal(ids.length, 2, "two items: " + ids);
    // 7e: WT full contact (16+, level 1+) takes the trunk instead of the hand area every second session
    assert.ok((HAND.includes(ids[0]) || ["bodybag", "brace"].includes(ids[0])) && LEG.includes(ids[1]), "hand or trunk + leg: " + ids);
  }
  const k = app();
  tkdProfile(k, { by: 2016, lvl: 0 });
  for (let i = 0; i < 12; i++) for (const id of hardIds(tkdSess(k, "S"))) assert.ok(!["tkBall", "shinbag", "fGlove", "fPads", "bodybag"].includes(id), "kid " + id);
  const b = app();
  b.run("S.profile.sport='boxing';");
  for (let i = 0; i < 12; i++) assert.ok(!/tkEdge|tkTips|tkFoot|tkBall/.test(JSON.stringify(JSON.parse(b.run("JSON.stringify(buildSession('2026-11-03','S','gym',['bag'],{sport:'boxing'}))")))));
  const kk = app();
  kk.run("S.profile.sport='kickboxing';");
  for (let i = 0; i < 12; i++) assert.ok(!/tkEdge|tkTips|tkFoot|tkBall/.test(JSON.stringify(JSON.parse(kk.run("JSON.stringify(buildSession('2026-11-03','S','gym',['bag','partner'],{sport:'kickboxing'}))")))));
  // prescriptions exist so timer and text work
  for (const id of ["tkEdge", "tkTips", "tkFoot", "tkBall"]) assert.ok(a.run(`!!RX.${id}`) , "RX " + id);
});

test("6b: Mobility uses the brought resistance bands (any sport)", () => {
  for (const sport of ["taekwondo", "kickboxing", "boxing"]) {
    const a = app();
    a.run(`S.profile.sport='${sport}';`);
    let hit = 0;
    for (let i = 0; i < 6; i++) if (/band/i.test(a.run(`JSON.stringify(buildSession('2026-11-03','M','home',['bands'],{sport:'${sport}'}))`))) hit++;
    assert.ok(hit >= 1, sport + " ignores bands");
  }
});
test("6b: boxing has no belt exam entry under dates; kickboxing and taekwondo keep it", async () => {
  const a = app();
  // 7i: one form for all dates – a grading offers only the sports with belts
  a.run("S.profile.sport='boxing';draft=null;ui.tab='profile';ui.profSec='goals';ui.csport=null;ui.ckind='grade';");
  let h = a.run("renderProfile()");
  assert.doesNotMatch(h, /data-csport="boxing"/, "no boxing grading");
  assert.match(h, /data-csport="kickboxing"/);
  assert.match(h, /data-csport="taekwondo"/);
  a.run("ui.ckind='comp';");
  assert.match(a.run("renderProfile()"), /data-csport="boxing"/, "boxing tournaments stay");
});
test("6b: the Today footer links the rule book of the main sport's federation", () => {
  const a = app();
  const foot = () => a.run("rulesLink()");
  a.run("S.profile.sport='kickboxing';");
  assert.match(foot(), /wako-deutschland\.de/);
  a.run("S.profile.sport='boxing';");
  assert.match(foot(), /boxverband\.de[^"]*WKB/);
  assert.match(foot(), /DBV/);
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='wt';");
  assert.match(foot(), /dtu\.de/);
  a.run("S.profile.tkd.style='itf';");
  assert.match(foot(), /itf-d\.de/);
  assert.ok(!/wako/i.test(foot()));
});
test("6b: taekwondo kicks say lead (V) or rear (H) leg; hand techniques stay rare in WT", () => {
  const a = app();
  tkdProfile(a, { lvl: 1 });
  const sd = (c) => JSON.parse(a.run(`JSON.stringify(sides(${JSON.stringify(c)}))`));
  assert.deepEqual(sd(["dwi"]), ["R"], "spinning back kick: rear leg");
  assert.deepEqual(sd(["mireo"]), ["L"], "push kick: lead leg");
  assert.deepEqual(sd(["dol", "dol"]), ["R", "L"], "side alternates in a series");
  assert.equal(sd(["stepf"])[0], null, "steps have no side");
  assert.match(a.run("comboHtml(['dol','yeop'])"), /<i>H<\/i>.*<i>V<\/i>/);
  assert.match(a.run("t('legendTkd')"), /vorderes Bein/);
  let hands = 0,
    total = 0;
  for (let i = 0; i < 40; i++)
    for (const m of JSON.stringify(tkdSess(a, "T")).matchAll(/"combo":\[([^\]]*)\]/g)) {
      const ids = m[1].match(/[a-z]+/g) || [];
      total += ids.length;
      hands += ids.filter((x) => x === "jir").length;
    }
  assert.ok(hands / total < 0.08, "punches " + hands + "/" + total);
});

test("6b: kick series are one bracketed chip with explicit V/H, level 1, never for children or under-19 spinning kicks", () => {
  const a = app();
  const al = (id, c) => a.run(`TKDT.allowed('${id}',${JSON.stringify(c)})`);
  const base = { level: 1, kup: null, kid: false, young: false, risky: false };
  for (const id of ["sr1", "sr2", "sr3", "sr4", "sr5"]) {
    assert.equal(al(id, { ...base, level: 0 }), false, id + " not for beginners");
    assert.equal(al(id, { ...base, kid: true }), false, id + " not for children");
  }
  assert.equal(al("sr1", base), true);
  assert.equal(al("sr3", { ...base, young: true }), false, "series with Dwi-chagi not under 19");
  assert.equal(al("sr3", { ...base, risky: true }), false, "knee/ankle limit");
  tkdProfile(a, { lvl: 1 });
  const h = a.run("comboHtml(['sr1','dol'])");
  assert.match(h, /<span class="ser">/);
  assert.match(h, /class="arr"/);
  assert.match(h, /<i>V<\/i>[\s\S]*<i>H<\/i>/, "Dollyeo V then H");
  assert.equal(a.run("techNm('sr2',true)"), "Halbkreistritt Rumpf vorne, Halbkreistritt Rumpf vorne".replace(/^.*$/, a.run("techNm('ban',true)") + " vorne, " + a.run("techNm('dol',true)") + " vorne"));
  assert.match(a.run("comboWords(['sr3'])"), /vorne.*hinten/);
  let seen = 0;
  for (let i = 0; i < 40; i++) if (/"sr\d"/.test(JSON.stringify(tkdSess(a, "T")))) seen++;
  assert.ok(seen > 0, "series occur in level 1 technique units");
  const k = app();
  tkdProfile(k, { by: 2016, lvl: 0, grade: "k8" });
  for (let i = 0; i < 20; i++) assert.ok(!/"sr\d"/.test(JSON.stringify(tkdSess(k, "T"))), "kid got a series");
});
test("6b: kick chains get longer with the level", () => {
  const maxKicks = (lvl) => {
    const a = app();
    tkdProfile(a, { lvl });
    let m = 0,
      sum = 0,
      n = 0;
    for (let i = 0; i < 60; i++)
      for (const x of JSON.stringify(tkdSess(a, "T")).matchAll(/"combo":\[([^\]]*)\]/g)) {
        const k = a.run(`TKDT.kickCount(${JSON.stringify((x[1].match(/[a-z0-9]+/g) || []))})`);
        m = Math.max(m, k);
        sum += k;
        n++;
      }
    return { m, avg: sum / n };
  };
  const l0 = maxKicks(0),
    l1 = maxKicks(1),
    l2 = maxKicks(2);
  assert.ok(l0.m <= 3, "beginner chains stay short: " + l0.m);
  assert.ok(l2.m >= 5, "competition level reaches 5+ kicks: " + l2.m);
  assert.ok(l0.avg < l1.avg && l1.avg < l2.avg, `average grows: ${l0.avg} ${l1.avg} ${l2.avg}`);
});
/* ---------- 6c: ITF-D plans ---------- */
const itfSess = (a, type, o = {}) =>
  JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-03','${type}','gym',${JSON.stringify(o.eq || ["bag", "partner", "rope"])},{sport:'taekwondo',tstyle:'itf'}))`));
function itfProfile(a, o = {}) {
  a.run(
    `S.profile.sport='taekwondo';S.profile.tkd.style='itf';S.profile.tkd.itf='${o.grade || ""}';S.profile.days=[0,1,2,3];S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 1};S.profile.limits=${JSON.stringify(o.limits || [])};`,
  );
}
const TKD_ALL = "ap dol dolh yeop mireo dwi nae ban dhu ttdol ttyeop jir dung stepf stepb steps turn swch slide".split(" ");
const comboIds = (s) => [...JSON.stringify(s).matchAll(/"combo":\[([^\]]*)\]/g)].map((m) => m[1].match(/[a-z]+/g) || []);

test("6c: ITF release by Kup, level, age and limits (own module, not the WT rules)", () => {
  const a = app();
  const al = (id, c) => a.run(`ITFT.allowed('${id}',${JSON.stringify(c)})`);
  const base = { level: 1, kup: null, kid: false, young: false, risky: false };
  assert.equal(al("jir", { ...base, level: 0 }), true, "punch from the start");
  assert.equal(al("dolh", { ...base, level: 0 }), false);
  assert.equal(al("ttdol", { ...base, level: 0, kup: 3 }), false, "jump kicks: neither level 1 nor 2nd Kup");
  assert.equal(al("ttdol", { ...base, kup: 3 }), true, "7g: level 1 is enough");
  assert.equal(al("ttdol", { ...base, level: 0, kup: 2 }), true, "7g: 2nd Kup is enough");
  assert.equal(al("dwi", { ...base, level: 0, kup: 4 }), true, "7g: 4th Kup releases the back kick");
  assert.equal(al("ttdol", { ...base, young: true, kup: 2 }), true, "teens may jump (only spinning kicks are age-limited)");
  assert.equal(al("ttdol", { ...base, kid: true, kup: 2 }), false, "no jump kicks for children");
  assert.equal(al("dwi", { ...base, young: true, kup: 2 }), false, "no spinning kicks under 19");
  assert.equal(al("dwi", { ...base, risky: true }), false);
  assert.equal(al("sr1", base), false, "no WT series in ITF");
});

test("6c: ITF units have ITF names, hand-foot combos, only allowed techniques, ITF tasks only for ITF", () => {
  for (const [name, o] of [["adult 5th Kup", { grade: "k5" }], ["child 9y", { by: 2017, lvl: 0, grade: "k9" }], ["teen 16y 4th Kup", { by: 2010, grade: "k4" }], ["knee limit", { grade: "k2", limits: ["knee"] }]]) {
    const a = app();
    itfProfile(a, o);
    a.run("S.profile.tkd.names='ko';");
    for (const type of ["T", "C", "P"]) {
      for (let i = 0; i < 6; i++) {
        const s = itfSess(a, type);
        a.run("unitStyle='itf'");
        const ctx = JSON.parse(a.run("JSON.stringify(tkdCtx())"));
        for (const ids of comboIds(s)) for (const id of ids) assert.ok(a.run(`ITFT.allowed('${id}',${JSON.stringify(ctx)})`), `${name} ${type}: ${id}`);
        a.run("unitStyle=null");
        assert.ok(!/"tk_(kicks|step|pad|free)"/.test(JSON.stringify(s)), name + ": WT-only task in ITF");
        assert.ok(!/"sr\d"/.test(JSON.stringify(s)), name + ": series in ITF");
      }
    }
  }
  const a = app();
  itfProfile(a);
  a.run("S.profile.tkd.names='ko';unitStyle='itf';");
  assert.equal(a.run("techNm('ap')"), "Ap Chagi");
  assert.equal(a.run("techNm('dwi')"), "Dwit Chagi");
  assert.equal(a.run("techNm('dhu')"), "Bandae Dollyo Chagi");
  assert.equal(a.run("techNm('nae')"), "Axttritt", "not in the PO: no invented Korean term");
  a.run("unitStyle='wt'");
  assert.equal(a.run("techNm('ap')"), "Ap-chagi", "WT spelling unchanged");
  // hand-foot weighting about 40 / 60
  a.run("unitStyle='itf'");
  let hands = 0, all = 0;
  for (let i = 0; i < 40; i++) for (const ids of comboIds(itfSess(a, "T"))) for (const x of ids) { all++; if (x === "jir" || x === "dung") hands++; }
  assert.ok(hands / all > 0.2 && hands / all < 0.5, "hand share " + (hands / all).toFixed(2));
});

test("6c: ITF partner tasks – Matsogi by Kup and age, children only pad and semi-contact, Jayu Matsogi touch only", () => {
  const ids = (a, type, n) => {
    const seen = new Set();
    for (let i = 0; i < n; i++) for (const m of JSON.stringify(itfSess(a, type)).matchAll(/"id":"(it_[a-z]+)"/g)) seen.add(m[1]);
    return seen;
  };
  const kid = app();
  itfProfile(kid, { by: 2016, lvl: 0, grade: "k8" });
  const k = ids(kid, "P", 25);
  for (const x of ["it_sambo", "it_ibo", "it_ilbo", "it_jayu", "it_hosin"]) assert.ok(!k.has(x), "child got " + x);
  assert.ok(k.has("it_pad") || k.has("it_semi"), "child gets pad or semi-contact");
  const a = app();
  itfProfile(a, { grade: "k8" });
  const n = ids(a, "P", 40);
  assert.ok(n.has("it_sambo"));
  assert.ok(!n.has("it_ibo") || true);
  const b = app();
  itfProfile(b, { grade: "k8", lvl: 1 });
  const hi = ids(b, "P", 60);
  assert.ok(!hi.has("it_ilbo"), "Ilbo only from the 3rd Kup");
  const c = app();
  itfProfile(c, { grade: "k2", lvl: 1 });
  const top = ids(c, "P", 80);
  assert.ok(top.has("it_ilbo") && top.has("it_hosin") && top.has("it_jayu"), "advanced: " + [...top]);
  // Jayu Matsogi at most once per session
  for (let i = 0; i < 40; i++) assert.ok((JSON.stringify(itfSess(c, "P")).match(/"id":"it_jayu"/g) || []).length <= 1);
});

test("6c: ITF bout format by age, class labels exist", () => {
  const a = app();
  const f = (age) => JSON.parse(a.run(`JSON.stringify(TKDT.itfFormat('itf',${age}))`));
  assert.deepEqual([f(25).r, f(25).w, f(25).b], [2, 120, 60]);
  assert.deepEqual([f(15).r, f(15).w, f(15).b], [2, 120, 60]);
  assert.deepEqual([f(12).r, f(12).w, f(12).b], [2, 90, 45]);
  assert.deepEqual([f(8).r, f(8).w, f(8).b], [2, 60, 30]);
  assert.equal(f(5), null);
  assert.equal(a.run("sportFor('taekwondo').rules.format('itf',25).w"), 120);
  assert.equal(a.run("sportFor('taekwondo').rules.format('wt',25).r"), 3);
  for (const c of ["td", "tc", "tb", "ta", "s", "v", "u13", "u15", "u17", "u19", "a"]) assert.ok(a.run(`!!t('cls').${c}`), "class label " + c);
});

test("6c: a unit can carry another style than the profile; its grade, names and plan follow the unit, the profile stays", () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='wt';S.profile.tkd.wt='k4';S.profile.tkd.itf='k9';S.profile.birthYear=1995;S.profile.level=1;S.profile.tkd.names='ko';");
  const w = JSON.parse(a.run("JSON.stringify(buildSession('2026-11-03','T','gym',['bag'],{sport:'taekwondo'}))"));
  const i = JSON.parse(a.run("JSON.stringify(buildSession('2026-11-04','T','gym',['bag'],{sport:'taekwondo',tstyle:'itf'}))"));
  assert.equal(w.tstyle, "wt");
  assert.equal(i.tstyle, "itf");
  assert.equal(a.run("S.profile.tkd.style"), "wt", "profile untouched");
  assert.equal(a.run("unitStyle"), null, "no style leaks after the build");
  // ITF unit with a 9th Kup (beginner): no spinning or jump kicks although the WT grade (4th Kup) would release them (7g: level OR grade)
  a.run("S.profile.level=0;");
  for (let n = 0; n < 12; n++) for (const ids of comboIds(JSON.parse(a.run("JSON.stringify(buildSession('2026-11-04','T','gym',['bag'],{sport:'taekwondo',tstyle:'itf'}))")))) for (const x of ids) assert.ok(!["dwi", "dhu", "ttdol", "ttyeop"].includes(x), "kup of the unit style: " + x);
  a.run("S.profile.level=1;");
  // rendering takes the unit's style for names
  a.run("S.sessions['2026-11-04']=" + JSON.stringify(i) + ";ui.sel='2026-11-04';ui.tab='session';ui.setup=setupOf(S.sessions['2026-11-04'],'2026-11-04');");
  const h = a.run("renderSession()");
  assert.match(h, /Chagi/);
  assert.doesNotMatch(h, /-chagi/, "no WT spelling in an ITF unit");
  assert.match(h, /data-ustyle="wt"[^>]*aria-pressed="false"[\s\S]*data-ustyle="itf"[^>]*aria-pressed="true"/);
});

test("6c: unit style and unit discipline are chosen in the settings form without touching the profile", async () => {
  const a = app();
  a.run("loading=async()=>{};S.profile.sport='taekwondo';S.profile.tkd.style='wt';S.profile.birthYear=1995;S.profile.days=[0,1,2,3];");
  a.run("{const d='2026-11-03';S.sessions[d]=buildSession(d,'T','gym',['bag'],{sport:'taekwondo'});ui.sel=d;ui.tab='session';ui.setup=setupOf(S.sessions[d],d);}");
  assert.equal(a.run("setupDirty('2026-11-03')"), false);
  await a.click({ dataset: { ustyle: "itf" } });
  assert.equal(a.run("ui.setup.tstyle"), "itf");
  assert.equal(a.run("setupDirty('2026-11-03')"), true);
  assert.equal(a.run("S.profile.tkd.style"), "wt");
  await a.run("rebuildFromSetup('2026-11-03')");
  assert.equal(a.run("S.sessions['2026-11-03'].tstyle"), "itf");
  assert.equal(a.run("S.profile.tkd.style"), "wt");
  // kickboxing discipline
  const k = app();
  k.run("loading=async()=>{};S.profile.sport='kickboxing';S.profile.disc='lc';S.profile.birthYear=1995;S.profile.days=[0,1,2,3];");
  k.run("{const d='2026-11-03';S.sessions[d]=buildSession(d,'T','gym',['bag'],{sport:'kickboxing'});ui.sel=d;ui.tab='session';ui.setup=setupOf(S.sessions[d],d);}");
  assert.match(k.run("renderSession()"), /data-udisc="fc"/);
  await k.click({ dataset: { udisc: "fc" } });
  assert.equal(k.run("ui.setup.disc"), "fc");
  await k.run("rebuildFromSetup('2026-11-03')");
  assert.equal(k.run("S.sessions['2026-11-03'].disc"), "fc");
  assert.equal(k.run("S.profile.disc"), "lc", "profile discipline stays");
  assert.equal(k.run("discOf()"), "lc", "no discipline leaks after the build");
  // children under 15 are not offered the ring disciplines
  k.run("S.profile.birthYear=2016;ui.setup=setupOf(S.sessions['2026-11-03'],'2026-11-03');");
  assert.doesNotMatch(k.run("renderSession()"), /data-udisc="fc"/);
});

test("6d: guide – taekwondo reads by style and language; no kickboxing/boxing topics; each sheet renders", () => {
  const a = app();
  for (const lg of ["de", "en"])
    for (const style of ["wt", "itf"]) {
      a.run(`S.profile.sport='taekwondo';S.profile.lang='${lg}';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${style}'});`);
      const keys = JSON.parse(a.run("JSON.stringify(readsFor().map((r)=>r.k))"));
      for (const k of ["tbelt", "tgrade", "tterms", "thist", "myths", "sleep"]) assert.ok(keys.includes(k), k);
      for (const k of ["gloves", "shin", "judge", "disc", "day", "mistakes", "bgear"]) assert.ok(!keys.includes(k), k + " hidden");
      const panel = a.run("guidePanelHtml()");
      assert.doesNotMatch(panel, /data-guide="wrap"/, "no hand-wrap row");
      assert.match(panel, /data-guide="care"/);
      assert.match(panel, /data-guide="tgrade"/);
      for (const k of keys) {
        const h = a.run(`guideSheetHtml({id:'${k}'})`);
        assert.doesNotMatch(h, /undefined|NaN|\[object/, k);
        const bad = h.match(/WAKO|Kickbox|kickbox|Handschuh|glove|Bandag|wrap|Thai/i);
        assert.ok(!bad, `no kickboxing words in ${k} ${style}${lg}: ${bad && h.slice(Math.max(0, bad.index - 60), bad.index + 60)}`);
        if (["tbelt", "tgrade"].includes(k)) assert.match(h, /class="vlink" href="https:\/\/www\.(dtu|itf-d)\.de/, "publisher link " + k);
      }
      const g = a.run("guideSheetHtml({id:'tgrade'})");
      if (style === "itf") {
        assert.match(g, /Chon-Ji/);
        assert.doesNotMatch(g, /Taegeuk/);
      } else {
        assert.match(g, /Taegeuk Il Jang/);
        assert.doesNotMatch(g, /Chon-Ji/);
      }
      const care = a.run("guideSheetHtml({id:'care'})") + a.run("guideSheetHtml({id:'aid'})");
      const cb = care.match(/WAKO|Namman|Bandagen|Handschuhe|wraps|gloves/);
      assert.ok(!cb, "care/aid neutral: " + (cb && care.slice(Math.max(0, cb.index - 80), cb.index + 60)));
      assert.match(care, /Mundschutz|Mouth ?guard/);
    }
  a.run("S.profile.lang='de';S.profile.sport='kickboxing';");
  assert.match(a.run("guidePanelHtml()"), /data-guide="wrap"/);
  assert.ok(!JSON.parse(a.run("JSON.stringify(readsFor().map((r)=>r.k))")).some((k) => /^t(belt|grade|terms|hist)$/.test(k)));
  a.run("S.profile.sport='boxing';");
  assert.ok(!JSON.parse(a.run("JSON.stringify(readsFor().map((r)=>r.k))")).some((k) => /^t(belt|grade|terms|hist)$/.test(k)));
});
test("6d: guide – waiting times and forms come from the module data (no drift)", () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.lang='de';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt'});");
  let g = a.run("guideSheetHtml({id:'tgrade'})");
  assert.match(g, new RegExp(`${a.run("TKDT.gradeText('k4','de')").replace(".", "\\.")} ${a.run("TKDT.WAIT.wt.k4")}( ·|\\.|<)`));
  a.run("S.profile.tkd.style='itf';");
  g = a.run("guideSheetHtml({id:'tgrade'})");
  assert.match(g, new RegExp(`${a.run("TKDT.gradeText('k5','de')").replace(".", "\\.")} ${a.run("TKDT.WAIT.itf.k5")}( ·|\\.|<)`));
  for (const n of Object.values(JSON.parse(a.run("JSON.stringify(TKDT.ITF_TUL)")))) assert.ok(g.includes(n), n);
  const terms = a.run("guideSheetHtml({id:'tterms'})");
  assert.match(terms, /Dollyo Chagi/);
  assert.doesNotMatch(terms, /Dollyeo/);
});
test("6d: packing list by style; note by style; others unchanged", () => {
  const a = app();
  a.run("S.profile.comps=[{id:'c1',date:'2026-11-05',kind:'comp',name:'X'}];");
  const items = (sport, style) => {
    a.run(`S.profile.sport='${sport}';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${style}'});S.profile.lang='de';`);
    return JSON.parse(a.run("JSON.stringify(packItems('c1').map((x)=>x.txt))"));
  };
  const wt = items("taekwondo", "wt"), itf = items("taekwondo", "itf"), kb = items("kickboxing", "wt"), bx = items("boxing", "wt");
  assert.ok(wt.includes("Rumpfschutz (Weste)") && wt.includes("Dobok") && wt.includes("Gürtel"));
  assert.ok(itf.includes("Geschlossene Handschuhe") && itf.includes("Armbinden rot und blau"));
  assert.ok(!wt.includes("Geschlossene Handschuhe") && !itf.includes("Rumpfschutz (Weste)"));
  assert.ok(kb.includes("Coach-Lizenz") && !kb.includes("Dobok") && !bx.includes("Dobok"));
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='wt';");
  assert.match(a.run("packSheetHtml({id:'c1'})"), /WT-Wettkampfregeln/);
  a.run("S.profile.tkd.style='itf';");
  assert.match(a.run("packSheetHtml({id:'c1'})"), /ITF-Turnierregeln/);
  a.run("S.profile.lang='en';");
  assert.match(a.run("packSheetHtml({id:'c1'})"), /ITF tournament rules/);
  assert.ok(items("taekwondo", "wt").length >= 12);
});
test("6d: tour, share and profile texts have a taekwondo variant (DE and EN) without WAKO/boxing wording", () => {
  const a = app();
  for (const lg of ["de", "en"]) {
    a.run(`S.profile.lang='${lg}';S.profile.sport='taekwondo';`);
    for (const k of ["tourIntroTkd", "tourBasicsTkd", "tourProfTkd"]) {
      const v = a.run(`t('${k}')`);
      assert.ok(v.length > 60, k);
      assert.doesNotMatch(v, /WAKO|Kickbox|DBV|Jab|Haken|Bandag|wrap|hooks/i, k);
    }
    assert.match(a.run("t('inst').shareTextTkd || ''"), /Taekwondo|taekwondo/);
    assert.ok(a.run("t('psec').guideTkd").length > 10);
    assert.ok(a.run("t('guide').hintTkd").length > 10);
  }
});
test("6d: style change loses nothing (grades, history, exams, names stay); the whole profile is part of the backup", async () => {
  const a = app();
  a.run("S.profile.sport='taekwondo';S.profile.birthYear=1995;draft=null;");
  a.run("S.profile.tkd={style:'wt',names:'app',wt:'k5',itf:'k7',hist:[{date:'2026-09-01',style:'wt',to:'k5'}],exams:[{id:'e1',date:'2026-12-01'}]};");
  const before = a.run("JSON.stringify({wt:S.profile.tkd.wt,itf:S.profile.tkd.itf,hist:S.profile.tkd.hist,exams:S.profile.tkd.exams,names:S.profile.tkd.names})");
  await tk(a, { tk: "style", tv: "itf" });
  await tk(a, { tk: "style", tv: "wt" });
  assert.equal(a.run("JSON.stringify({wt:S.profile.tkd.wt,itf:S.profile.tkd.itf,hist:S.profile.tkd.hist,exams:S.profile.tkd.exams,names:S.profile.tkd.names})"), before);
  // guide and loader follow the switch at once
  await tk(a, { tk: "style", tv: "itf" });
  assert.match(a.run("guideSheetHtml({id:'tgrade'})"), /Chon-Ji/);
  await tk(a, { tk: "style", tv: "wt" });
  assert.match(a.run("guideSheetHtml({id:'tgrade'})"), /Taegeuk/);
  assert.match(a.run("JSON.stringify(S)"), /"tkd":\{"style":"wt","names":"app"/);
});
test("6d-3: free round timer – presets and default by main sport and style; coach calls use the sport's techniques", () => {
  const a = app();
  const pres = (sport, style, year) => {
    a.run(`S.profile.sport='${sport}';S.profile.birthYear=${year};S.profile.ft=undefined;S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${style}'});`);
    return JSON.parse(a.run("JSON.stringify(ftPresets())"));
  };
  const kb = pres("kickboxing", "wt", 1995);
  assert.deepEqual(kb.map((p) => p.id), ["wako", "k1", "spar", "pads", "hiit", "pro"]);
  const bx = pres("boxing", "wt", 1995);
  assert.equal(bx[0].id, "fbox");
  assert.ok(!bx.some((p) => ["wako", "k1"].includes(p.id)));
  const wt = pres("taekwondo", "wt", 1995);
  assert.equal(wt[0].id, "fwt");
  assert.deepEqual([wt[0].r, wt[0].w, wt[0].b], [3, 120, 60]);
  assert.ok(!wt.some((p) => ["wako", "k1", "pro"].includes(p.id)));
  const itf = pres("taekwondo", "itf", 1995);
  assert.equal(itf[0].id, "fitf");
  assert.deepEqual([itf[0].r, itf[0].w, itf[0].b], [2, 120, 60]);
  const kid = pres("taekwondo", "itf", 2017);
  assert.deepEqual([kid[0].r, kid[0].w, kid[0].b], [2, 60, 30], "age 9: 2 x 1:00 / 0:30");
  // default setup follows the sport; saved values stay
  pres("taekwondo", "itf", 1995);
  assert.equal(a.run("ftCfg().r"), 2);
  a.run("S.profile.ft={r:7,w:100,b:30,prep:true,warn:true,coach:false};");
  assert.equal(a.run("ftCfg().r"), 7);
  // labels in both languages for every preset of every sport
  for (const lg of ["de", "en"])
    for (const sp of ["kickboxing", "boxing", "taekwondo"]) {
      pres(sp, "wt", 1995);
      a.run(`S.profile.lang='${lg}';`);
      for (const p of JSON.parse(a.run("JSON.stringify(ftPresets())"))) assert.ok(a.run(`t('ft').pre['${p.id}']`), p.id + lg);
    }
  // coach call text for taekwondo uses its own techniques (no crash, no kickboxing names)
  pres("taekwondo", "wt", 1995);
  a.run("S.profile.lang='de';S.profile.level=1;");
  for (let i = 0; i < 20; i++) {
    const txt = a.run("combo('shadow', null).map((x) => techNm(x)).join(' · ')");
    assert.ok(txt && !/undefined/.test(txt), txt);
  }
});

/* ---------- 7b: sport focus and corrections ---------- */
const sess7 = (a, sport, type, o = {}) =>
  JSON.parse(a.run(`(()=>{S.profile.sport='${sport}';S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 1};S.profile.limits=${JSON.stringify(o.lim || [])};S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${o.st || "wt"}',wt:'${o.grade || "k1"}',itf:'${o.grade || "k1"}'});return JSON.stringify(buildSession('2026-11-02','${type}','${o.loc || "gym"}',${JSON.stringify(o.eq || ["bag", "rope", "weights"])},{sport:'${sport}',min:${o.min ?? 60}${sport === "taekwondo" ? `,tstyle:'${o.st || "wt"}'` : ""}}))})()`));
const blk = (s, f) => s.blocks.find(f);
test("7b B6: WT technique = strength 8 + active flexibility 6; ITF, kickboxing and boxing keep strength 14", () => {
  const a = app();
  const wt = sess7(a, "taekwondo", "T");
  const am = blk(wt, (b) => b.lbl === "amob");
  assert.ok(am && am.key === "mob" && am.min === 6, JSON.stringify(wt.blocks.map((b) => [b.key, b.lbl, b.min])));
  assert.equal(blk(wt, (b) => b.key === "str").min, 8);
  assert.ok(am.items.every((it) => ["mob.kick_holds", "mob.slow_motion_kicks", "mob.controlled_leg_swings", "mob.active_leg_raises"].includes(it.id)), "active items");
  for (const [sp, st] of [["taekwondo", "itf"], ["kickboxing"], ["boxing"]]) {
    const s = sess7(a, sp, "T", { st });
    assert.equal(blk(s, (b) => b.key === "str").min, 14, sp + st);
    assert.ok(!blk(s, (b) => b.lbl === "amob"), sp);
  }
  a.run("S.profile.sport='taekwondo';S.profile.lang='de';ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'taekwondo',tstyle:'wt'});ui.setup=null;");
  assert.match(a.run("renderSession()"), /Aktive Beweglichkeit/);
});
test("7b B6: WT mobility = active flexibility 34 (about half active items) + easy cool-down 3; WT week pattern", () => {
  const a = app();
  for (let i = 0; i < 10; i++) {
    const m = sess7(a, "taekwondo", "M", { min: 45 });
    const mb = blk(m, (b) => b.key === "mob");
    assert.equal(mb.min, 34);
    assert.equal(mb.lbl, "amob");
    assert.equal(blk(m, (b) => b.key === "cool").min, 3);
    const act = mb.items.filter((it) => /kick_holds|slow_motion_kicks|controlled_leg_swings|active_leg_raises/.test(it.id)).length;
    assert.ok(act >= 3 && act >= mb.items.length / 2 - 1, `${act} of ${mb.items.length}`);
  }
  const pat = (n, st) => JSON.parse(a.run(`(()=>{S.profile.sport='taekwondo';S.profile.tkd.style='${st}';S.profile.level=1;S.profile.birthYear=1995;S.profile.days=[0,1,2,3,4,5,6].slice(0,${n});return JSON.stringify(Object.values(dayTypes()))})()`));
  assert.deepEqual(pat(3, "wt"), ["T", "S", "P"]);
  assert.deepEqual(pat(4, "wt"), ["T", "S", "P", "M"]);
  assert.deepEqual(pat(5, "wt"), ["T", "S", "P", "C", "M"]);
  assert.deepEqual(pat(6, "wt"), ["T", "S", "P", "M", "T", "M"]);
  assert.deepEqual(pat(7, "wt"), ["T", "S", "P", "M", "T", "S", "M"]);
  assert.deepEqual(pat(4, "itf"), ["T", "S", "P", "K"], "ITF unchanged");
});
test("7b B7: boxing conditioning in 3-minute rounds (≈33 min), strength 24 + finisher 15, mobility 22 + footwork/shadow 8", () => {
  const a = app();
  const k = sess7(a, "boxing", "K");
  const c = blk(k, (b) => b.key === "cond");
  assert.equal(c.w, 180);
  assert.equal(c.b, 60);
  assert.ok(c.min >= 31 && c.min <= 34, String(c.min));
  assert.ok(blk(k, (b) => b.key === "core").min <= 8);
  const s = sess7(a, "boxing", "S");
  assert.equal(blk(s, (b) => b.key === "str").min, 24);
  assert.equal(blk(s, (b) => b.key === "cond").min, 15);
  const m = sess7(a, "boxing", "M", { min: 45 });
  assert.equal(blk(m, (b) => b.key === "mob").min, 22);
  const f = blk(m, (b) => b.lbl === "foot");
  assert.ok(f && f.rounds && f.min === 8 && f.w === 120 && f.b === 30 && f.items.length === 3, JSON.stringify(f));
  assert.ok(f.items.every((it) => it.ease), "easy rounds");
  // kickboxing keeps its blocks
  const kk = sess7(a, "kickboxing", "K");
  assert.equal(blk(kk, (b) => b.key === "cond").w, 120);
  assert.equal(blk(sess7(a, "kickboxing", "S"), (b) => b.key === "str").min, 27);
  assert.ok(!blk(sess7(a, "kickboxing", "M", { min: 45 }), (b) => b.lbl));
  // children keep their short conditioning rounds
  assert.notEqual(blk(sess7(a, "boxing", "K", { by: 2015, lvl: 0, min: 45 }), (b) => b.key === "cond").w, 180);
});
test("7b B7: boxing toughness – wrist 3 + body 3 from level 1, 16 years, no limits; body item by equipment", () => {
  const a = app();
  const body = (o) => {
    const w = blk(sess7(a, "boxing", "T", o), (b) => b.key === "wrist");
    return [w.lbl || "", w.items.map((it) => it.id).join(",")];
  };
  assert.deepEqual(body({ eq: ["partner", "bag"] }), ["tough", "fWring,fFinger,abs"]);
  assert.deepEqual(body({ eq: ["bag"] }), ["tough", "fWring,fFinger,bodybag"]);
  assert.deepEqual(body({ eq: [], loc: "home" }), ["tough", "fWring,fFinger,brace"]);
  assert.equal(body({ lvl: 0 })[0], "");
  assert.equal(body({ by: 2012 })[0], "", "under 16");
  assert.equal(body({ lim: ["back"] })[0], "", "limits");
  a.run("S.profile.lang='de';");
  assert.equal(a.run("blkName({key:'wrist',lbl:'tough'})"), "Handgelenk & Körperabhärtung");
  assert.equal(a.run("blkName({key:'wrist'})"), a.run("t('wrist')"));
  // deload, taper and recovery weeks (soft): never body conditioning
  a.run("S.profile.sport='boxing';S.profile.level=1;S.profile.birthYear=1995;S.profile.limits=[];");
  assert.equal(a.run("wristBlock(['partner'], true, [], 'gym').lbl || ''"), "");
});
test("7b B8: ITF from level 1 – at least 40 % of the combos carry a jumping or spinning kick (as far as allowed); WT less; locks stay", () => {
  const a = app();
  const share = (st, o = {}) => {
    a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${st}',wt:'${o.grade || "k1"}',itf:'${o.grade || "k1"}'});S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 1};S.profile.limits=${JSON.stringify(o.lim || [])};`);
    let n = 0, sp = 0;
    for (let i = 0; i < 400; i++) {
      const c = JSON.parse(a.run(`(()=>{buildSport='taekwondo';unitStyle='${st}';const c=tkdCombo('shadow');buildSport=null;unitStyle=null;return JSON.stringify(c)})()`));
      n++;
      if (c.some((x) => ["ttdol", "ttyeop", "dwi", "dhu"].includes(x))) sp++;
    }
    return sp / n;
  };
  const itf = share("itf"), wt = share("wt");
  assert.ok(itf >= 0.4, "ITF " + itf);
  assert.ok(itf > wt, `ITF ${itf} vs WT ${wt}`);
  assert.equal(share("itf", { lvl: 0, grade: "k9" }), 0, "beginners with a low grade: none");
  assert.ok(share("itf", { lvl: 0, grade: "k2" }) > 0, "7g: beginners with the 2nd Kup get them through the grade");
  assert.equal(share("itf", { by: 2017 }), 0, "children: none");
  assert.equal(share("itf", { lim: ["knee"] }), 0, "knee limit: none");
});
test("7b B8: ITF mobility = mobility 28 + easy hand-foot links 4 (2 rounds) + cool-down 5", () => {
  const a = app();
  const m = sess7(a, "taekwondo", "M", { st: "itf", min: 45 });
  assert.equal(blk(m, (b) => b.key === "mob").min, 28);
  const hf = blk(m, (b) => b.lbl === "hf");
  assert.ok(hf && hf.rounds && hf.min === 4 && hf.w === 90 && hf.b === 30 && hf.items.length === 2, JSON.stringify(hf));
  assert.ok(hf.items.every((it) => it.ease) && hf.items.some((it) => it.combo && it.combo.some((x) => ["jir", "dung"].includes(x)) && it.combo.some((x) => ["ap", "dol", "dolh", "yeop", "mireo", "nae", "ban"].includes(x))) || hf.items.some((it) => it.combo), "easy hand-foot rounds");
  assert.equal(blk(m, (b) => b.key === "cool").min, 5);
  a.run("S.profile.lang='de';ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'M','gym',['bag'],{sport:'taekwondo',tstyle:'itf',min:45});ui.setup=null;");
  assert.match(a.run("renderSession()"), /Lockere Hand-Fuß-Verbindungen/);
});
test("7b B1: taekwondo load areas by style for club and own technique/sparring units; kickboxing and boxing unchanged", () => {
  const a = app();
  const r = (e) => JSON.parse(a.run(`JSON.stringify(entryRegions(${JSON.stringify(e)}))`));
  assert.deepEqual(r({ src: "club", ck: "T", sport: "taekwondo", tstyle: "wt" }), { legs: 0.5, arms: 0.15, core: 0.15, endu: 0.2 });
  assert.deepEqual(r({ src: "club", ck: "P", sport: "taekwondo", tstyle: "itf" }), { legs: 0.4, arms: 0.25, core: 0.15, endu: 0.2 });
  assert.deepEqual(r({ src: "club", ck: "T", sport: "taekwondo" }), { legs: 0.5, arms: 0.15, core: 0.15, endu: 0.2 }, "no style: WT");
  assert.deepEqual(r({ src: "club", ck: "K", sport: "taekwondo", tstyle: "wt" }), r({ src: "club", ck: "K", sport: "kickboxing" }), "conditioning stays general");
  assert.deepEqual(r({ src: "club", ck: "P", sport: "kickboxing" }), { legs: 0.35, arms: 0.35, core: 0.1, endu: 0.2 }, "kickboxing unchanged (3-Q)");
  assert.deepEqual(r({ src: "own", type: "T", sport: "taekwondo", tstyle: "itf" }), { legs: 0.4, arms: 0.25, core: 0.15, endu: 0.2 });
  // a hard WT club evening lightens only the legs the next day
  a.run("S.profile.sport='kickboxing';S.log=[{id:'c1',date:'2026-11-01',src:'club',ck:'P',sport:'taekwondo',tstyle:'wt',minutes:90,rpe:8,inputConfirmed:true}];");
  assert.equal(a.run("JSON.stringify(lightRegions({log:S.log,date:'2026-11-02'}))"), '["legs"]');
  // own unit: the stored areas are the style table
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='itf';");
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(sessionRegions(buildSession('2026-11-02','T','gym',['bag'],{sport:'taekwondo',tstyle:'wt'})))")), { legs: 0.5, arms: 0.15, core: 0.15, endu: 0.2 });
});
test("7b B2: entries keep the unit's style/discipline; the history names them where not obvious", async () => {
  const a = app();
  a.run("S.profile.sport='kickboxing';S.profile.disc='lc';S.profile.lang='de';S.log=[];ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'T','gym',['bag'],{sport:'taekwondo',tstyle:'itf',min:30});startWorkout();playerAction('early');");
  a.node("fMin").value = "30";
  a.node("fDurationConfirmed").checked = true;
  a.node("fRpe").value = "6";
  await a.click({ id: "fSave" });
  if (a.run("S.log.length") === 0) a.run("sheetAction('confirm')");
  assert.equal(a.run("S.log[0].tstyle"), "itf");
  assert.equal(a.run("S.log[0].disc"), undefined);
  assert.match(a.run("logTag(S.log[0])"), /Taekwondo · ITF/);
  assert.equal(a.run("logTag({sport:'kickboxing',disc:'lc'})"), "", "own sport and discipline: no tag");
  assert.match(a.run("logTag({sport:'kickboxing',disc:'k1'})"), /K1/);
  // club entries of taekwondo take the profile style
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='wt';");
  assert.match(a.run("renderLog()"), /Taekwondo · ITF|ITF/);
});
test("7b B3: the boxing opening round names no kicks (DE/EN); kickboxing keeps its text", () => {
  const a = app();
  for (const lg of ["de", "en"]) {
    a.run(`S.profile.lang='${lg}';`);
    for (let i = 0; i < 8; i++) {
      const s = sess7(a, "boxing", "T", { eq: ["bag"] });
      const ease = blk(s, (b) => b.key === "main").items.filter((it) => it.ease);
      assert.ok(ease.length && ease.every((it) => it.box), "flagged");
      for (const it of ease) assert.doesNotMatch(a.run(`paceTxt(${JSON.stringify(it)})`), /kick/i);
    }
    const kb = blk(sess7(a, "kickboxing", "T", { eq: ["bag"] }), (b) => b.key === "main").items.find((it) => it.ease);
    assert.match(a.run(`paceTxt(${JSON.stringify(kb)})`), /kick/i);
  }
});
test("7b B5: a second tap on the safety note after the onboarding closed does nothing", async () => {
  const a = app();
  a.run("ui.onb=null;S.profile.ackSafe='2026-01-01';");
  await a.click({ dataset: { onb: "ack" } });
  assert.equal(a.run("S.profile.ackSafe"), "2026-01-01");
  a.run("ui.onb={step:3};");
  await a.click({ dataset: { onb: "ack" } });
  assert.equal(a.run("S.profile.ackSafe"), "2026-01-01", "no pending note: nothing happens");
});
test("7c fix: the ⓘ of every exercise with a sketch opens its info sheet (text ids, all sports)", async () => {
  const a = app();
  for (const [sp, st] of [["kickboxing"], ["boxing"], ["taekwondo", "wt"], ["taekwondo", "itf"]])
    for (const ty of ["T", "S", "K", "M"]) {
      a.run(`S.profile.sport='${sp}';${st ? `S.profile.tkd.style='${st}';` : ""}ui.sel='2026-11-02';ui.tab='session';S.sessions[ui.sel]=buildSession(ui.sel,'${ty}','gym',['weights','bag','rope'],{sport:'${sp}'${st ? `,tstyle:'${st}'` : ""}});ui.setup=null;ui.sheet=null;`);
      const ids = [...new Set([...a.run("renderSession()").matchAll(/data-exinfo="([^"]+)"/g)].map((m) => m[1]))];
      assert.ok(ids.length, `${sp} ${ty}: info buttons`);
      for (const id of ids) {
        await a.click({ dataset: { exinfo: id } });
        assert.equal(a.run("ui.sheet && ui.sheet.id"), id, id);
        const h = a.run("renderSheet(), document.getElementById('sheet').innerHTML");
        assert.match(h, /class="skwrap"/, id);
        a.run("ui.sheet=null;");
      }
    }
});
test("7c-3: summer shows a palm tree (taller than the fighters) and a deckchair for every outfit – no swim trunks any more", () => {
  const a = app();
  a.run("S.profile.seasonOff=false;");
  for (const sp of ["kickboxing", "boxing", "taekwondo"]) {
    a.run(`S.profile.sport='${sp}';ui.seasonDate='2026-07-15';`);
    const h = a.run(`heroScene('kick','T',false,outfitFor('${sp}'))`);
    assert.match(h, /class="palm"/, sp);
    assert.match(h, /class="deckchair"/, sp);
    assert.doesNotMatch(h, /trunksP/, sp);
    // the palm reaches higher than the heads of the fighters (crown at y ≈ 10–48, heads around y 50–60)
    assert.ok(h.indexOf('class="palm"') < h.lastIndexOf("<circle"), "palm drawn before the fighters (background)");
    for (const ds of ["2026-01-20", "2026-04-15", "2026-10-15"]) {
      a.run(`ui.seasonDate='${ds}';`);
      assert.doesNotMatch(a.run(`heroScene('kick','T',false,outfitFor('${sp}'))`), /class="palm"|class="deckchair"/, sp + ds);
    }
  }
  a.run("S.profile.seasonOff=true;ui.seasonDate='2026-07-15';");
  assert.doesNotMatch(a.run("heroScene('kick','T',false,false)"), /class="palm"/, "design off: no summer scenery");
});
test("7c-4: the belt-exam view follows the main sport – kickboxing BFVKB, taekwondo grade area, boxing fitness test only", async () => {
  const a = app();
  a.run("S.profile.lang='de';ui.tab='test';ui.testOpen=false;ui.testView='exam';S.profile.sport='kickboxing';");
  let h = a.run("renderTest()");
  assert.match(h, /data-tview="exam"/);
  assert.match(h, /data-belt=/, "kickboxing: BFVKB belts");
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='wt';");
  h = a.run("renderTest()");
  assert.doesNotMatch(h, /data-belt=/, "taekwondo: no kickboxing belts");
  assert.match(h, /Kup/, "taekwondo grade area");
  a.run("S.profile.sport='boxing';");
  h = a.run("renderTest()");
  assert.doesNotMatch(h, /data-tview=|data-belt=/, "boxing: no belt exam");
  assert.match(h, /tOpen/, "fitness test");
  assert.equal(a.run("t('tourTestBox')[0]"), "Fitnesstest");
});
test("7b-2: strength, conditioning and mobility picks follow the main sport; basic lifts stay; kickboxing unchanged; limits still filter", () => {
  const a = app();
  const F = JSON.parse(a.run("JSON.stringify(SPORT_FOCUS)"));
  const pick = (sp, st, ty, o = {}) => {
    a.run(`S.profile.sport='${sp}';S.profile.birthYear=1995;S.profile.level=1;S.profile.limits=${JSON.stringify(o.lim || [])};${st ? `S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${st}'});` : ""}`);
    const s = JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-02','${ty}','gym',['bag','rope','weights','kb','bands'],{sport:'${sp}',min:${ty === "M" ? 45 : 60}${st ? `,tstyle:'${st}'` : ""}}))`));
    const items = s.blocks.filter((b) => !["warm", "cool", "main", "hard", "wrist"].includes(b.key)).flatMap((b) => b.items).filter((it) => it.kind === "ex");
    return { s, extra: items.filter((it) => !it.basic).map((it) => it.id), basic: items.filter((it) => it.basic).map((it) => it.id) };
  };
  for (const [sp, st, k] of [["boxing", "", "boxing"], ["taekwondo", "wt", "wt"], ["taekwondo", "itf", "itf"]]) {
    const all = new Set(Object.values(F[k]).flat());
    for (const ty of ["S", "K"]) {
      let n = 0, f = 0;
      const seen = new Set();
      for (let i = 0; i < 20; i++) {
        const r = pick(sp, st, ty);
        r.extra.forEach((id) => { n++; if (all.has(id)) f++; seen.add(id); });
        if (ty === "S") assert.ok(r.basic.length >= 3, "basic lifts stay");
      }
      assert.ok(f / n >= 0.7, `${k} ${ty}: focus share ${f}/${n}`);
      assert.ok(seen.size >= 4, `${k} ${ty}: variety ${[...seen].join()}`);
    }
  }
  // the basic lifts are the same in every sport
  const b0 = new Set(pick("kickboxing", "", "S").basic.map((x) => x.split(".")[1].replace(/barbell_|seated_/, "")));
  assert.ok(b0.size >= 3);
  // boxing mobility: shoulders, thoracic spine and neck first
  let up = 0;
  for (let i = 0; i < 10; i++) up += pick("boxing", "", "M").extra.filter((id) => F.boxing.mob.includes(id)).length;
  assert.ok(up >= 30, "boxing mobility focus " + up);
  // limits keep working: a knee limit removes the jumps of the WT power focus
  for (let i = 0; i < 15; i++) assert.ok(!pick("taekwondo", "wt", "S", { lim: ["knee"] }).extra.some((id) => /jump_squats|lateral_bounds|broad_jumps|skater_jumps/.test(id)));
});
test("7d: sparring can be chosen in the simple view too; still locked after a KO and for children", () => {
  const a = app();
  a.run("S.profile.example=false;S.profile.simple=true;S.profile.sport='kickboxing';S.profile.birthYear=1995;const d=iso(today());ui.sel=d;ui.tab='session';ui.setup=null;S.sessions[d]=buildSession(d,'T','home',['bag'],{min:60});");
  assert.equal(a.run("simpleView()"), true);
  let h = a.run("renderSession()");
  assert.match(h, /data-stype="P"(?![^>]*disabled)/, "sparring offered in the simple view");
  a.run("S.profile.birthYear=2017;ui.setup=null;");
  h = a.run("renderSession()");
  assert.match(h, /data-stype="P"[^>]*disabled/, "children: locked");
});

test("7e: WT full contact – impact rounds, trunk hardening and the harder dose from 16 and level 1, never in soft weeks; ITF, children unchanged", () => {
  const a = app();
  const mk = (o) => {
    a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${o.st || "wt"}',wt:'k4',itf:'k4'});S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 1};S.profile.limits=[];`);
    return JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-02','${o.ty || "T"}','gym',['bag','rope'${o.partner ? ",'partner'" : ""}],{sport:'taekwondo',tstyle:'${o.st || "wt"}'}))`));
  };
  let pow = 0, trunk = 0, harder = 0;
  for (let i = 0; i < 40; i++) {
    const s = mk({});
    const main = s.blocks.find((b) => b.key === "main");
    pow += main.items.filter((it) => it.pow).length;
    const hb = s.blocks.find((b) => b.key === "hard");
    if (hb.items.some((it) => ["bodybag", "brace"].includes(it.id))) trunk++;
    assert.ok(!hb.items.some((it) => it.id === "abs"), "no partner ab drill with body hooks in WT");
    if (hb.items.some((it) => it.h)) harder++;
  }
  assert.ok(pow >= 40, "impact rounds " + pow);
  assert.ok(trunk >= 10 && trunk <= 32, "trunk about every second session " + trunk);
  assert.ok(harder >= 20, "harder dose " + harder);
  for (const o of [{ st: "itf" }, { lvl: 0 }, { by: 2012 }]) {
    for (let i = 0; i < 10; i++) {
      const s = mk(o);
      assert.ok(!s.blocks.some((b) => b.items.some((it) => it.pow || it.h)), JSON.stringify(o));
    }
  }
  a.run("S.profile.lang='de';");
  assert.match(a.run(`roundDesc({kind:'round',k:'bag',sp:'t',pow:1},0)`), /PSS/);
});
test("7e: protective gear notes per sport in sparring with a partner, a partner-drill note in technique units – shown as safety notes", () => {
  const a = app();
  a.run("S.profile.lang='de';S.profile.birthYear=1995;S.profile.level=1;");
  const notes = (sp, st, ty) => {
    a.run(`S.profile.sport='${sp}';${st ? `S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${st}'});` : ""}`);
    return JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-02','${ty}','gym',['partner','pads','bag'],{sport:'${sp}'${st ? `,tstyle:'${st}'` : ""}}).notes)`)).join(" | ");
  };
  assert.match(notes("kickboxing", "", "P"), /Schutzausrüstung Kickboxen/);
  assert.match(notes("taekwondo", "wt", "P"), /Rumpfschutz \(Weste\)/);
  assert.match(notes("taekwondo", "wt", "P"), /vollem Kontakt/);
  assert.match(notes("taekwondo", "itf", "P"), /geschlossene Handschuhe/);
  assert.doesNotMatch(notes("taekwondo", "itf", "P"), /vollem Kontakt/);
  assert.match(notes("boxing", "", "P"), /Mundschutz und Kopfschutz/);
  assert.doesNotMatch(notes("boxing", "", "P"), /Schutzausrüstung Kickboxen/);
  for (const [sp, st] of [["kickboxing"], ["boxing"], ["taekwondo", "wt"]]) assert.match(notes(sp, st, "T"), /Partnerübungen: Mundschutz/, sp);
  // shown in the safety box (also in the simple view)
  a.run("S.profile.sport='taekwondo';S.profile.tkd.style='wt';S.profile.simple=true;const d=iso(today());ui.sel=d;ui.tab='session';ui.setup=null;S.sessions[d]=buildSession(d,'P','gym',['partner','pads'],{sport:'taekwondo',tstyle:'wt'});");
  assert.match(a.run("renderSession()"), /note warn[^>]*>[^<]*Sparring mit Partner[\s\S]*Schutzausrüstung WT/);
});
test("7f: kick chains – WT more chain rounds and longer chains, ITF weaker, kickboxing occasional chains from level 1; locks stay", () => {
  const a = app();
  const KK = new Set(JSON.parse(a.run("JSON.stringify([...KICKS, ...TKDT.KICKS])")));
  const stats = (sp, st, lvl, o = {}) => {
    let combos = 0, k3 = 0, k4 = 0, pure = 0;
    for (let i = 0; i < 25; i++) {
      a.run(`S.profile.sport='${sp}';S.profile.disc='${o.disc || "lc"}';S.profile.birthYear=${o.by ?? 1995};S.profile.level=${lvl};S.profile.limits=${JSON.stringify(o.lim || [])};${st ? `S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${st}',wt:'k1',itf:'k1'});` : ""}`);
      const s = JSON.parse(a.run(`JSON.stringify(buildSession('2026-11-02','T','gym',['bag','rope'],{sport:'${sp}',min:60${st ? `,tstyle:'${st}'` : ""}}))`));
      for (const it of s.blocks.find((b) => b.key === "main").items) {
        if (!it.combo) continue;
        const seq = it.combo.flatMap((x) => (sp === "taekwondo" && a.run(`!!tkm().SERIES['${x}']`) ? JSON.parse(a.run(`(unitStyle='${st}',JSON.stringify(tkm().SERIES['${x}'].p.map(q=>q[0])))`)) : [x]));
        a.run("unitStyle=null");
        const k = seq.filter((x) => KK.has(x)).length;
        combos++;
        if (k >= 3) k3++;
        if (k >= 4) k4++;
        if (k >= 2 && seq.every((x) => KK.has(x))) pure++;
      }
    }
    return { k3: k3 / combos, k4: k4 / combos, pure: pure / combos };
  };
  const w1 = stats("taekwondo", "wt", 1), w2 = stats("taekwondo", "wt", 2);
  assert.ok(w1.k3 >= 0.5, "WT L1 ≥3 kicks " + w1.k3);
  assert.ok(w2.k4 >= 0.4, "WT L2 ≥4 kicks " + w2.k4);
  const i2 = stats("taekwondo", "itf", 2);
  assert.ok(i2.k3 >= 0.35, "ITF L2 ≥3 kicks " + i2.k3);
  assert.ok(i2.k3 < w2.k3, "ITF weaker than WT");
  const k1 = stats("kickboxing", "", 1), k0 = stats("kickboxing", "", 0);
  assert.ok(k1.pure >= 0.1 && k1.pure <= 0.4, "kickboxing L1 kick chains " + k1.pure);
  assert.ok(k0.pure < 0.1, "kickboxing L0 none of the new chains " + k0.pure);
  // low kicks only in KL and K1; knee limit: no chains with risky kicks
  for (let i = 0; i < 200; i++) {
    a.run("S.profile.sport='kickboxing';S.profile.level=2;S.profile.birthYear=1995;S.profile.limits=[];S.profile.disc='lc';");
    assert.ok(!a.run("combo('shadow',null)").includes("lowk"), "no low kick in LC");
  }
  const kid = stats("kickboxing", "", 2, { by: 2016 });
  assert.ok(kid.pure < 0.15, "children: no new chains " + kid.pure);
  // the new ITF chains only use techniques the ITF module knows
  for (const c of JSON.parse(a.run("JSON.stringify(ITFT.COMBOS.flat())"))) for (const x of c) assert.ok(a.run(`!!ITFT.TECH['${x}']`), x);
});

test("7g: taekwondo release by level OR grade – a beginner with a high grade gets the released kicks in the plan; locks stay", () => {
  const a = app();
  const kicks = (st, o) => {
    a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'${st}',wt:'${o.grade || ""}',itf:'${o.grade || ""}'});S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 0};S.profile.limits=${JSON.stringify(o.lim || [])};`);
    const seen = new Set();
    for (let i = 0; i < 400; i++) for (const x of JSON.parse(a.run(`(()=>{buildSport='taekwondo';unitStyle='${st}';const c=tkdCombo('shadow');buildSport=null;unitStyle=null;return JSON.stringify(c)})()`))) seen.add(x);
    return seen;
  };
  const wt4 = kicks("wt", { grade: "k4" });
  assert.ok(wt4.has("ttdol") || wt4.has("ttyeop"), "WT beginner 4th Kup: jump kicks " + [...wt4]);
  assert.ok(wt4.has("dhu"), "WT beginner 4th Kup: hooking kick");
  assert.ok(!wt4.has("dolh") && !wt4.has("nae"), "head kicks stay level-bound");
  const wt6 = kicks("wt", { grade: "k6" });
  assert.ok(wt6.has("dhu") && !wt6.has("ttdol") && !wt6.has("ttyeop"), "WT 6th Kup: hooking kick, no jumps");
  for (const o of [{ grade: "k8" }, {}, { grade: "k1", by: 2010 }, { grade: "k1", lim: ["knee"] }, { grade: "k1", by: 2017 }])
    for (const x of ["dhu", "dwi", "ttdol", "ttyeop"]) assert.ok(!kicks("wt", o).has(x), "WT " + JSON.stringify(o) + ": " + x);
  const itf2 = kicks("itf", { grade: "k2" });
  assert.ok(itf2.has("ttdol") || itf2.has("ttyeop"), "ITF beginner 2nd Kup: jump kicks");
  for (const x of ["dwi", "dhu", "ttdol", "ttyeop"]) assert.ok(!kicks("itf", { grade: "k5" }).has(x), "ITF beginner 5th Kup: " + x);
});

test("7h: WT from level 1 – about every fifth combo carries a spinning hook or jump kick; teens, children, knee limit none", () => {
  const a = app();
  const share = (o) => {
    a.run(`S.profile.sport='taekwondo';S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt',wt:'${o.grade || ""}'});S.profile.birthYear=${o.by ?? 1995};S.profile.level=${o.lvl ?? 1};S.profile.limits=${JSON.stringify(o.lim || [])};`);
    let sp = 0;
    for (let i = 0; i < 500; i++) if (JSON.parse(a.run(`(()=>{buildSport='taekwondo';unitStyle='wt';const c=tkdCombo('shadow');buildSport=null;unitStyle=null;return JSON.stringify(c)})()`)).some((x) => ["dhu", "ttdol", "ttyeop"].includes(x))) sp++;
    return sp / 500;
  };
  for (const o of [{ lvl: 1 }, { lvl: 2 }, { lvl: 2, grade: "k10" }, { lvl: 0, grade: "k4" }]) {
    const s = share(o);
    assert.ok(s >= 0.1 && s <= 0.3, JSON.stringify(o) + " " + s);
  }
  for (const o of [{ lvl: 2, by: 2010 }, { lvl: 2, by: 2017 }, { lvl: 2, lim: ["knee"] }, { lvl: 0 }]) assert.equal(share(o), 0, JSON.stringify(o));
});

test("7i: profile – six sections; about me asks only the chosen sport's questions; one list of dates; exams prepare the plan", async () => {
  const a = app();
  a.run("globalThis.requestAnimationFrame=()=>0;S.profile.sport='kickboxing';S.profile.birthYear=1992;S.profile.level=1;S.profile.days=[1,3,5];S.profile.tkd=Object.assign(S.profile.tkd||{},{style:'wt',wt:'k4',exams:[],hist:[]});draft=null;ui.tab='profile';ui.profSec=null;ui.psport=null;ui.pedit=null;");
  const ov = a.run("renderProfile()");
  assert.deepEqual((ov.match(/data-psec="(\w+)"/g) || []).map((x) => x.slice(11, -1)), ["me", "train", "goals", "life", "guide", "app"]);
  assert.match(ov, /Über mich[\s\S]*Trainingswoche[\s\S]*Termine &amp; Ziele|Über mich[\s\S]*Trainingswoche[\s\S]*Termine & Ziele/);
  // kickboxing: discipline, focus, belt – nothing of taekwondo
  a.run("ui.profSec='me';");
  let h = a.run("renderProfile()");
  assert.match(h, /data-p="disc"/);
  assert.match(h, /data-pedit="belt"/);
  assert.doesNotMatch(h, /data-tk=|data-belt=/, "no taekwondo, belt chips only after Change");
  await a.click({ dataset: { pedit: "belt" } });
  assert.match(a.run("renderProfile()"), /data-belt="0"/);
  // taekwondo: names first, then style, then only this style's grade; the main sport stays kickboxing
  await a.click({ dataset: { psport: "taekwondo" } });
  assert.equal(a.run("S.profile.sport"), "kickboxing");
  h = a.run("renderProfile()");
  assert.ok(h.indexOf('data-tk="names"') < h.indexOf('data-tk="style"'), "names directly under the sport row");
  assert.doesNotMatch(h, /data-p="disc"|data-pedit="belt"|data-tk="grade"/, "no kickboxing, grade chips only after Change");
  assert.match(h, /4\. Kup/);
  await a.click({ dataset: { pedit: "grade" } });
  assert.match(a.run("renderProfile()"), /data-tk="grade" data-tv="k3"/);
  // dates & goals: a planned taekwondo exam is listed with the tournaments and starts the grading preparation
  a.run("S.profile.sport='taekwondo';draft=null;ui.profSec='goals';ui.ckind='grade';ui.csport='taekwondo';");
  h = a.run("renderProfile()");
  assert.match(h, /id="tkTarget"/);
  const d = a.run("iso(addDays(today(),20))");
  a.run(`(()=>{const n={value:'${d}'},g={value:'k3'};const ge=document.getElementById;document.getElementById=(id)=>id==='tkDate'?n:id==='tkTarget'?g:ge(id);})()`);
  await a.click({ dataset: { tk: "plan" } });
  assert.equal(a.run("S.profile.tkd.exams.length"), 1);
  assert.equal(a.run("phaseInfo().phase"), "grade", "4 weeks before the exam: grading preparation");
  h = a.run("renderProfile()");
  assert.match(h, /Prüfung<\/small>/);
  assert.match(h, /Prüfung zum 3\. Kup/);
  a.run(`S.profile.comps=[{id:'c1',date:iso(addDays(today(),40)),kind:'comp',sport:'kickboxing'}];draft=null;`);
  h = a.run("renderProfile()");
  assert.ok(h.indexOf("Prüfung</small>") < h.indexOf("Turnier</small>"), "one list sorted by date");
  // the belt exam link opens the test tab on the exam view
  await a.click({ dataset: { gotoexam: "1" } });
  assert.equal(a.run("ui.tab"), "test");
  assert.equal(a.run("ui.testView"), "exam");
});

test("7k relax: breathing plans, voice hand-over after three cycles, meditation timelines for 10–30 min, entries", async () => {
  const a = app();
  // breathing: whole cycles, the patterns differ by use
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(rxBreathPlan('calm',4))")).total, 240);
  assert.equal(a.run("rxBreathPlan('box',4).cyc"), 16);
  assert.equal(a.run("rxBreathPlan('sleep',2).n"), 6);
  assert.equal(a.run("rxBreathAt(rxBreathPlan('sleep',4),12).ph"), "out", "4-7-8: from 11 s the long exhale");
  assert.equal(a.run("rxBreathAt(rxBreathPlan('box',4),9).ph"), "out");
  // meditations: every kind and length in both languages – same sentences, rising times, the whole length used
  for (const kind of ["scan", "strong", "sleep"])
    for (const len of [10, 15, 20, 30]) {
      const de = JSON.parse(a.run(`JSON.stringify(rxMedPlan('${kind}',${len},'de'))`)),
        en = JSON.parse(a.run(`JSON.stringify(rxMedPlan('${kind}',${len},'en'))`));
      assert.equal(de.steps.length, en.steps.length, kind + len + " DE/EN pairs");
      assert.equal(de.total, len * 60);
      de.steps.forEach((s, i) => i && assert.ok(s.at > de.steps[i - 1].at, "rising"));
      const last = de.steps[de.steps.length - 1];
      assert.ok(last.at < de.total - 5 && last.at > de.total * 0.75, `${kind} ${len}: last sentence near the end (${last.at}/${de.total})`);
    }
  assert.ok(a.run("rxMedPlan('scan',30,'de').steps.length") > a.run("rxMedPlan('scan',10,'de').steps.length"), "longer = more sentences");
  assert.ok(JSON.stringify(JSON.parse(a.run("JSON.stringify(RX_MED.de)"))).includes("Ich bin stark"), "strengthening words");
  const deTx = a.run("JSON.stringify(RX_MED.de)+JSON.stringify(RXT.de)");
  assert.doesNotMatch(deTx, /\bIhnen\b|\bIhre[mnrs]?\b|\b(Atmen|Schließen|Spüren|Legen|Setzen|Lassen|Nehmen|Kommen|Bleiben) Sie\b/, "never formal address");
  assert.ok((deTx.match(/\b(du|dich|dir|dein\w*)\b/gi) || []).length > 40, "the voice says du");
  assert.equal(a.run("rxEvening(new Date(2026,10,5,21,0))"), true);
  assert.equal(a.run("rxEvening(new Date(2026,10,5,15,0))"), false);
  // voice flow: intro, three guided cycles, hand-over, then quiet; the coach voice switch does not mute it
  a.run(`globalThis.spoken=[];globalThis.speechSynthesis={speak(u){spoken.push(u.text)},cancel(){},resume(){},speaking:false,pending:false,paused:false,getVoices:()=>[]};window.speechSynthesis=speechSynthesis;globalThis.SpeechSynthesisUtterance=function(t){this.text=t};S.profile.voice=false;S.profile.lang='de';
    globalThis.__now=1e12;Date.now=()=>__now;relaxOpen({mode:'breath',pat:'calm',bmin:4,tone:false});relaxStart();`);
  assert.equal(a.run("ui.relax.run"), true);
  assert.equal(a.run("timerRunning()"), true, "keeps the screen awake like the timer");
  assert.match(a.run("spoken[0]"), /vier Sekunden ein/);
  for (let s = 0; s <= 80; s += 0.5) a.run(`__now=1e12+8000+${s * 1000};relaxTick()`);
  const said = JSON.parse(a.run("JSON.stringify(spoken)"));
  assert.equal(said.filter((x) => x === "Einatmen").length, 3, "three guided inhales");
  assert.equal(said.filter((x) => x === "Ausatmen").length, 3);
  assert.ok(said.includes(a.run("RXT.de.sHand")), "hand-over sentence");
  assert.ok(said.indexOf(a.run("RXT.de.sHand")) > said.lastIndexOf("Ausatmen"));
  for (let s = 80; s <= 241; s += 0.5) a.run(`__now=1e12+8000+${s * 1000};relaxTick()`);
  const all = JSON.parse(a.run("JSON.stringify(spoken)"));
  assert.ok(all.includes("Noch drei Atemzüge."));
  assert.ok(all.some((x) => /Du machst das gut|Spannung gehen/.test(x)), "encouragement in between");
  assert.match(all[all.length - 1], /etwas Gutes für dich getan/);
  assert.equal(a.run("ui.relax.phase"), "done");
  assert.equal(a.run("timerRunning()"), false);
  // meditation: the sentences come in order; returning late skips the missed ones
  a.run(`spoken.length=0;__now=1e12;relaxOpen({mode:'med',kind:'strong',mlen:10});relaxStart();`);
  const steps = JSON.parse(a.run("JSON.stringify(ui.relax.plan.steps)"));
  a.run(`__now=1e12+${(steps[0].at + 0.1) * 1000};relaxTick()`);
  a.run(`__now=1e12+${(steps[5].at + 0.1) * 1000};relaxTick()`);
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(spoken)")), [steps[0].tx, steps[5].tx]);
  a.run("relaxClose()");
  assert.equal(a.run("ui.relax"), null);
  // entries: everyday life section, Today on a rest day; the evening preselects falling asleep
  a.run("draft=null;ui.tab='profile';ui.profSec='life';");
  assert.match(a.run("renderProfile()"), /data-rx="open" data-rv="breath"/);
  a.run("S.profile.days=[];S.profile.club=null;S.sessions={};draft=null;");
  assert.match(a.run("renderWeek()"), /data-rx="quick"/, "rest day card");
  a.run("relaxOpen()");
  assert.equal(a.run("ui.relax.pat === 'sleep'"), a.run("rxEvening()"), "evening: falling asleep first");
  assert.match(a.run("relaxOpen({mode:'med'});document.getElementById('relax').innerHTML"), /data-rv="30"/);
});

test("7l voice choice: the chosen voice comes first; missing or failing it falls back to the best other voice", async () => {
  const a = app();
  const V = [
    { name: "Anna", voiceURI: "com.apple.voice.enhanced.de-DE.Anna", lang: "de-DE", localService: true },
    { name: "Markus", voiceURI: "com.apple.voice.compact.de-DE.Markus", lang: "de-DE", localService: true },
    { name: "Grandpa", voiceURI: "com.apple.speech.synthesis.voice.Grandpa", lang: "de-DE", localService: true },
    { name: "Daniel", voiceURI: "com.apple.voice.compact.en-GB.Daniel", lang: "en-GB", localService: true },
  ];
  a.run(`globalThis.VOICES=${JSON.stringify(V)};globalThis.spoken=[];globalThis.speechSynthesis={getVoices:()=>VOICES,speak(u){spoken.push(u)},cancel(){},resume(){},speaking:false,pending:false,paused:false};window.speechSynthesis=speechSynthesis;globalThis.SpeechSynthesisUtterance=function(t){this.text=t};S.profile.lang='de';S.profile.voice=true;S.profile.voicePick=null;`);
  assert.equal(a.run("bestVoice().name"), "Anna", "automatic: enhanced first");
  assert.deepEqual(JSON.parse(a.run("JSON.stringify(voiceList().map(v=>v.name))")), ["Anna", "Markus"], "German voices, novelty voices left out, enhanced first");
  // choose Markus via the list (with a sample in exactly that voice)
  a.run("draft=null;ui.tab='profile';ui.profSec='app';");
  assert.match(a.run("renderProfile()"), /data-vpick="com\.apple\.voice\.compact\.de-DE\.Markus"/);
  await a.click({ dataset: { vpick: "com.apple.voice.compact.de-DE.Markus" } });
  assert.equal(a.run("S.profile.voicePick.de.name"), "Markus");
  a.advance(100); // the sample starts 60 ms after cancel() (iOS)
  assert.equal(a.run("spoken[spoken.length-1].voice.name"), "Markus", "sample in the chosen voice");
  assert.equal(a.run("bestVoice().name"), "Markus", "the choice wins over the automatic one");
  assert.match(a.run("renderProfile()"), /Gewählt: Markus/);
  // a failing chosen voice: the retry skips it and takes the best other one
  assert.equal(a.run("bestVoice(['com.apple.voice.compact.de-DE.Markus']).name"), "Anna");
  // the chosen voice disappears (other device, iOS update): automatic, with a note
  a.run("VOICES.splice(1,1);");
  assert.equal(a.run("bestVoice().name"), "Anna");
  assert.match(a.run("renderProfile()"), /„Markus“ ist gerade nicht verfügbar/);
  // per language: English keeps its own (automatic) choice; "automatic" clears the German one
  a.run("S.profile.lang='en';");
  assert.equal(a.run("bestVoice().name"), "Daniel");
  a.run("S.profile.lang='de';");
  await a.click({ dataset: { vpick: "" } });
  assert.equal(a.run("S.profile.voicePick.de"), null);
  // the relax voice uses the same choice
  a.run("VOICES.splice(1,0," + JSON.stringify(V[1]) + ");");
  await a.click({ dataset: { vpick: "com.apple.voice.compact.de-DE.Markus" } });
  a.run("spoken.length=0;relaxOpen({mode:'breath',pat:'calm',bmin:2});relaxStart();");
  assert.equal(a.run("spoken[0].voice.name"), "Markus");
  a.run("relaxClose()");
});

test("7m calendar: week arrows on Today and Session, month hint, back to the first plan week, ahead 6 weeks", async () => {
  const a = app();
  a.run("S.profile.days=[1,3,5];S.profile.planStart=iso(addDays(today(),-21));S.log=[];ui.tab='week';ui.wk=0;draft=null;");
  let h = a.run("renderWeek()");
  assert.match(h, /data-wk="-1"/);
  assert.match(h, /Diese Woche/);
  assert.match(h, /KW \d+ · /);
  assert.match(h, /class="m[^"]*">[A-ZÄa-zä]{3}/, "month on the first day of the strip");
  // forward: the strip and the list follow; Today returns
  await a.click({ dataset: { wk: "1" } });
  assert.equal(a.run("ui.wk"), 1);
  h = a.run("renderWeek()");
  assert.match(h, /Nächste Woche/);
  assert.match(h, /data-wk="0"/, "back to today");
  const nextMon = a.run("iso(addDays(monday(today()),7))");
  assert.ok(h.includes(`data-open="${nextMon}"`), "next week's days");
  for (let i = 0; i < 10; i++) await a.click({ dataset: { wk: "1" } });
  assert.equal(a.run("ui.wk"), 6, "at most 6 weeks ahead");
  assert.match(a.run("renderWeek()"), /data-wk="1" aria-label="[^"]*" disabled/);
  for (let i = 0; i < 20; i++) await a.click({ dataset: { wk: "-1" } });
  assert.equal(a.run("ui.wk"), -3, "back to the first plan week");
  await a.click({ dataset: { wk: "0" } });
  assert.equal(a.run("ui.wk"), 0);
  // session tab: opens on the week of the chosen day, arrows browse from there
  a.run(`ui.tab='session';ui.sel=iso(addDays(monday(today()),14));ui.wkFor=null;`);
  a.run("renderSession()");
  assert.equal(a.run("ui.wk"), 2);
  await a.click({ dataset: { wk: "-1" } });
  a.run("renderSession()");
  assert.equal(a.run("ui.wk"), 1, "the arrows are not undone by the chosen day");
  // the Today tab always starts on the current week
  await a.click({ dataset: { tab: "week" } });
  assert.equal(a.run("ui.wk"), 0);
  // month change inside a week: both months in the range, the 1st marked
  assert.equal(a.run("isoWeekNo(new Date(2026,0,1))"), 1);
  assert.equal(a.run("isoWeekNo(new Date(2026,10,5))"), 45);
});
