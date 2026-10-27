import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Execute the actual inline application, without starting the DOM boot/animation loop.
// Only browser services are stubbed; planning, state, rendering and event handlers are the production code.
const html = readFileSync(
  new URL("../src/ringzeit.html", import.meta.url),
  "utf8",
);
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
    },
    matchMedia: () => ({ matches: true }),
  });
  new vm.Script(unbooted).runInContext(context, {
    timeout: 2000,
    breakOnSigint: true,
  });
  // Boot was deliberately not run (see script replacement below).
  const run = (code) => vm.runInContext(code, context, { timeout: 3000 });
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
    `const id=EX.findIndex(e=>e.cat==='str'); S.sessions.x={date:'2026-11-02',rdone:1,checked:{'0.0':true,'2.0':true},blocks:[{key:'warm',items:[{id}]},{key:'main',rounds:true,items:[{},{}]},{key:'hard',items:[{kind:'hard',id:'fPush'}]},{key:'str',sets:'2× 8–12',items:[{id}]}],perf:{'3.0':[{r:0},{r:8}]}};`,
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
  a.run(`const id=EX.findIndex(e=>e.cat==='str' && /weights/.test(e.eq) && !DOSE_FIX[e.de]);
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
  a.run(`globalThis.id=EX.findIndex(e=>e.de==='Goblet Squats')`);
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
  a.run(`const id=EX.findIndex(e=>e.de==='Goblet Squats'),sess={date:'2026-11-02',type:'S',loc:'gym',eq:['weights'],progression:progressionState('2026-11-02','S',false)},b={key:'str',sets:'3× 8–12',items:[{id}]};
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
  a.run(`const id=EX.findIndex(e=>e.de==='Goblet Squats'),sess={date:'2026-11-02',type:'S',loc:'gym',eq:['weights'],progression:progressionState('2026-11-02','S',false)},b={key:'str',sets:'3× 8–12',items:[{id}]};
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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Einlaufen');S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'warm',min:4,items:[{id},{id}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
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
    `ui.sel='x';ui.tab='session';S.sessions.x={date:'2026-11-02',type:'M',eq:[],blocks:[{key:'cool',min:6,items:[{id:EX.findIndex(e=>e.de==='Hüftbeuger dehnen')},{id:EX.findIndex(e=>e.de==='Adduktoren & Spagat')}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Unterarmstütz');S.sessions.x={date:'2026-11-02',type:'S',eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id,target:{r:30}}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0',setIndex:'1'});`,
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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Sack-Sprints');S.sessions.x={date:'2026-11-02',type:'K',eq:[],blocks:[{key:'cond',min:12,sets:'3×',items:[{id}]}]};ui.workout={ds:'x',block:0};S.sessions.x.flow={block:0};exerciseTimerAction('start',{key:'0.0'});`,
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
 a.run(`ui.sel='x';S.sessions.x={blocks:[{key:'mob',min:12,items:[{id:EX.findIndex(e=>e.de==='90/90 Hüftwechsel')},{id:EX.findIndex(e=>e.de==='Taube')}]}]};`);
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
    `ui.sel='x';const id=EX.findIndex(e=>e.de==='Einlaufen');S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'warm',min:4,items:[{id},{id}]}]};`,
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

test("simplified start: six-step tour, compact first steps, folded profile details", async () => {
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
  a.run("ui.tab='profile';ui.profSec='train';draft=JSON.parse(JSON.stringify(S.profile))");
  const prof = a.run("renderProfile()");
  assert.match(prof, /<details class="pmore" data-pmore="1" >/);
  assert.ok(prof.indexOf("data-cday=") < prof.indexOf('data-pmore="1"'));
  assert.ok(prof.indexOf('data-p="level"') > prof.indexOf('data-pmore="1"'));
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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Einlaufen');S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'warm',min:4,items:[{id},{id}]}]};startWorkout();`,
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
    `ui.sel='x';ui.tab='session';S.sessions.x={date:'2026-11-02',type:'T',min:30,eq:[],blocks:[{key:'cond',min:6,sets:'',items:[]}]};const b=S.sessions.x.blocks[0];const id=EX.findIndex((e,i)=>e.cat==='cond'&&(b.items=[{id:i},{id:i}],!exerciseTiming(S.sessions.x,0,0)));b.items=[{id},{id}];startWorkout();`,
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
