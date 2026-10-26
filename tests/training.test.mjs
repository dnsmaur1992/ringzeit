import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Execute the actual inline application, without starting the DOM boot/animation loop.
// Only browser services are stubbed; planning, state, rendering and event handlers are the production code.
const html = readFileSync(new URL("../src/ringzeit.html", import.meta.url), "utf8");
const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
function app() {
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
        classList: { add() {}, remove() {}, toggle() {} },
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
        super(...(args.length ? args : [2026, 10, 2]));
      }
    },
    Intl,
    Map,
    Set,
    JSON,
    Math,
    Object,
    Array,
    Number,
    String,
    Promise,
    setInterval() {},
    clearInterval() {},
    setTimeout() {},
    clearTimeout() {},
    navigator: {},
    window: { addEventListener() {}, scrollTo() {} },
    document: {
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
    localStorage: { getItem: (k) => saved.get(k) ?? null, setItem: (k, v) => saved.set(k, v) },
    matchMedia: () => ({ matches: true }),
  });
  new vm.Script(unbooted).runInContext(context, { timeout: 2000, breakOnSigint: true });
  // Boot was deliberately not run (see script replacement below).
  const run = (code) => vm.runInContext(code, context, { timeout: 3000 });
  run(
    `S = hydrate({profile:{...DEFAULT_PROFILE, level:1, example:false, planStart:'2026-08-31'}}); ui.onb = null;`,
  );
  context.record = (...args) => calls.push(args);
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
  return { run, calls, node, click, saved };
}
// Remove the invocation only, retaining every production function and listener.
const bootAt = script.indexOf("  (function boot() {");
assert.ok(bootAt > 0);
const unbooted = script.slice(0, bootAt);
// Also parse the complete production script, including its boot function.
new vm.Script(script);

function history(
  a,
  { type = "T", step = 0, completed = true, rpe = 6, dates = ["2026-10-06", "2026-10-13"], extra = "" } = {},
) {
  a.run(
    `S.log = ${JSON.stringify(dates)}.map((date, i) => ({date, src:'own', type:${JSON.stringify(type)}, minutes:75, rpe:${rpe}, tHi:7, completed:${completed}, progression:{v:1,id:'base:2026-10-05',start:'2026-10-05',end:'2026-11-08',week:1,weeks:5,step:${step},eligible:true,signature:'lc:1:${type}:regular',plannedMin:75} ${extra}}));`,
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
  a.run(`S.sessions.x.roundChecks[2]=false; markRounds(false); S=hydrate(JSON.parse(JSON.stringify(S)));`);
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
  a.run(`S.sessions.x.roundChecks={2:true}; S=hydrate(JSON.parse(JSON.stringify(S)));`);
  assert.equal(a.run("sessionCompletion(S.sessions.x).complete"), true);
});

test("partial finish prompts, keeps form values and logs load without progression success; duplicate save ignored", async () => {
  const a = app();
  a.run(
    `S.sessions.x={date:'2026-11-02',type:'T',min:60,tHi:7,blocks:[{key:'warm',items:[{}]}]}; ui.sel='x'; openSheet=o=>ui.sheet=o; closeSheet=()=>ui.sheet=null;`,
  );
  a.node("fMin").value = "25";
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
  const rendered = a.run("renderSession()");
  assert.match(rendered, /data-check=/);
  assert.match(rendered, /btn all-done/);
  a.node("fMin").value = "30";
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
  assert.equal(a.run(`progressionState('2026-11-02','T',false).eligible`), false);
  a.run(`S.profile.weekMood={}; S.profile.comps=[{date:'2026-11-05',kind:'comp'}]`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).eligible`), false);
  a.run(`S.profile.comps=[]; S.pauses=[{from:'2026-10-20',to:'2026-10-31'}]`);
  assert.equal(a.run(`progressionState('2026-11-02','T',false).eligible`), false);
});

test("wave increases density within time budget and preserves deload, children, official formats and focus stages", () => {
  const a = app();
  history(a);
  for (const day of ["2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23"]) {
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
  assert.equal(a.run(`blockRounds(blockInfo('2026-11-02'),'2026-11-02').w`), 300);
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
  a.run(`ui.setup=null; S.sessions[ui.sel]=buildSession(ui.sel,'K','out',[],{min:60,run:true});`);
  assert.match(a.run("renderSession()"), /data-check=/);
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
