import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";

test("production release: service-worker activation preserves Dev and unrelated caches",async()=>{
  const source=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  const handlers={},deleted=[],kept=['ringzeit-old','ringzeit-dev-old','other-app'];
  const context=vm.createContext({
    self:{addEventListener:(name,fn)=>handlers[name]=fn,clients:{claim:async()=>{}}},
    caches:{keys:async()=>kept,delete:async name=>{deleted.push(name);return true;}}
  });
  new vm.Script(source).runInContext(context);
  assert.equal(vm.runInContext('PREFIX',context),'ringzeit-');
  const current=vm.runInContext('CACHE',context);kept.push(current);
  let done;handlers.activate({waitUntil:p=>done=p});await done;
  assert.deepEqual(deleted,['ringzeit-old']);
  assert.equal(vm.runInContext('FILES.includes("index.html") && FILES.includes("manifest.webmanifest")',context),true);
});
