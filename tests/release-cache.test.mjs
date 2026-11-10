import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

// valid in both apps: activating a new version removes only the app's own old caches – never the other app's or foreign ones
test("service-worker activation removes only the own old caches; the other app and unrelated caches stay",async()=>{
  const source=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const handlers={},deleted=[];
  const context=vm.createContext({
    self:{addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{}}},
    caches:{keys:async()=>kept,delete:async name=>{deleted.push(name);return true;}}
  });
  new vm.Script(source).runInContext(context);
  const P=vm.runInContext('PREFIX',context),other=P==='ringzeit-'?'ringzeit-dev-':'ringzeit-';
  assert.ok(P==='ringzeit-'||P==='ringzeit-dev-');
  const kept=[P+'old',other+'old','other-app'];
  const current=vm.runInContext('CACHE',context);kept.push(current);
  let done;handlers.activate({waitUntil:p=>done=p});await done;
  assert.deepEqual(deleted,[P+'old']);
  assert.equal(vm.runInContext('FILES.includes("index.html") && FILES.includes("manifest.webmanifest")',context),true);
});
