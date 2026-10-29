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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Unterarmstütz');S.sessions.x={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id}]},{key:'cool',min:4,items:[{id:EX.findIndex(e=>e.de==='Atmung')}]}]};startWorkout();`,
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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Unterarmstütz');S.sessions.x={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id}]}]};startWorkout();globalThis.said=[];say=(x)=>said.push(x);`,
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
  const lunge = a.run("EX.findIndex(e=>e.de==='Ausfallschritte')"),
    twist = a.run("EX.findIndex(e=>e.de==='Russian Twists')"),
    hold = a.run("EX.findIndex(e=>e.de==='Einbeinstand mit Kick-Hold')");
  assert.match(a.run(`doseTxt(${lunge},blk)`), /pro Bein/);
  assert.match(a.run(`doseTxt(${twist},blk)`), /je Seite/);
  assert.match(a.run(`targetText({n:3,r:8,kg:null,timed:false,reason:'initial'},${lunge})`), /Ziel: 3 × 8 pro Bein/);
  a.run(`S.sessions.y={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id:${hold}}]}]};`);
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
    `ui.sel='x';ui.tab='session';const id=EX.findIndex(e=>e.de==='Ausfallschritte');S.sessions.x={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'3× 8–12',items:[{id}]}]};startWorkout();`,
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
    `const hid=EX.findIndex(e=>e.de==='Einbeinstand mit Kick-Hold');S.sessions.y={date:'2026-11-02',type:'S',min:30,eq:[],blocks:[{key:'str',min:10,sets:'2× 8–12',items:[{id:hid}]}]};ui.sel='y';ui.workout=null;startWorkout();playerStartSets();`,
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
  a.run(`const id=EX.findIndex(e=>e.de==='Burpees');ui.sel='c';ui.tab='session';
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
  a.run(`S.profile.level=1;const id=EX.findIndex(e=>e.de==='Burpees');S.sessions.b={date:'2026-11-02',type:'K',min:30,eq:[],blocks:[{key:'cond',min:10,sets:'',items:[{kind:'ex',id}]}]};`);
  assert.match(a.run("doseTxt(S.sessions.b.blocks[0].items[0].id,S.sessions.b.blocks[0])"), /10 Wdh\./);
  assert.equal(a.run("exerciseTiming(S.sessions.b,0,0)"), null);
  assert.equal(a.run("playerSteps(S.sessions.b)[0].kind"), "manual");
});

test("one-legged set: deleting one side reopens the set; old shared values stay readable", async () => {
  const a = app();
  a.run(`const id=EX.findIndex(e=>DOSE_LEG.has(e.de)&&e.cat==='str'&&!TIMED.has(EX.indexOf(e)));ui.sel='l';ui.tab='session';
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

test("simple view: pictures instead of codes, no sparring choice, club logging only with club days", () => {
  const a = app();
  a.run(`S.profile.example=false;S.profile.simple=true;S.profile.club={days:[],minutes:90};const d=iso(today());ui.sel=d;ui.tab='session';ui.setup=null;
    S.sessions[d]=buildSession(d,'T','gym',defaultEq(),{min:60});`);
  assert.equal(a.run("codeOf('T')"), "🥊");
  assert.equal(a.run("effortTxt(7)"), "😣 Hart");
  assert.match(a.run("weekStrip(null,'data-open')"), /class="k ico"/);
  const h = a.run("renderSession()");
  assert.doesNotMatch(h, /data-stype="P"/, "no sparring choice");
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
  a.run(`globalThis.spoken=[];say=(x)=>spoken.push(x);const tid=EX.findIndex(e=>e.de==='Einlaufen'),gid=EX.findIndex(e=>e.de==='Goblet Squats');
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
        if(lvl<2||kid?parts.length!==1:!(parts.length===1||(parts.length===2&&parts[1]==='post')))bad.push('parts '+parts+' lvl'+lvl);
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
    for (const [n, pr] of res[lvl]) assert.ok(n >= Math.min(lo, pr) && n <= Math.min(hi, pr), `level ${lvl}: ${n} of ${pr}`);
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
      for(let i=0;i<60;i++){const s=buildSession('2026-11-04','T','gym',['partner','pads'],{min:90});const rb=s.blocks.find(b=>b.rounds);
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
