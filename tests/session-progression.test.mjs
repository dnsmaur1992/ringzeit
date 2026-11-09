import test from 'node:test';
import assert from 'node:assert/strict';
import {effortFace,effortRequest,nextEffortDose} from '../src/core/session-progression.js';
const e=(rpe,choice='hold',extra={})=>({id:'e',date:'2026-11-02',src:'own',minutes:40,inputConfirmed:true,completed:true,rpe,tHi:7,
  effortDose:{v:1,scope:'T',eligible:true,factor:1},effortControl:{v:1,face:effortFace(rpe),choice},...extra});
const next=(entries,extra={})=>nextEffortDose({entries,scope:'T',date:'2026-11-09',today:'2026-11-09',...extra});
test('final effort: five faces have graded automatic/explicit impulses',()=>{
  for(const [r,p] of [[2,10],[4,5],[6,0],[8,0],[10,0]])assert.equal(effortRequest(r),p);
  assert.equal(effortRequest(6,'change'),5);assert.equal(effortRequest(8,'change'),-5);assert.equal(effortRequest(10,'change'),-10);
  assert.equal(effortRequest(null),null);assert.equal(effortRequest(11),null);
});
test('final effort: the very next category session responds, and rebuilding it cannot compound the same answer',()=>{
  assert.equal(next([e(2)]).factor,1.1);assert.equal(next([e(4)]).factor,1.05);
  assert.deepEqual(next([e(2)]),next([e(2)]));
  assert.equal(next([e(6,'change')]).factor,1.05);
  assert.equal(next([e(8,'change')]).factor,.95);assert.equal(next([e(10,'change')]).factor,.9);
});
test('final effort: no implicit consent, no legacy/future/foreign/old votes and no positive inference from protected or partial work',()=>{
  assert.equal(next([{...e(2),effortControl:undefined}]).active,false);
  assert.equal(next([e(2,{},{effortDose:{v:1,scope:'S',eligible:true,factor:1}})]).active,false);
  assert.equal(next([e(2,'hold',{date:'2026-11-10'})]).active,false);
  assert.equal(next([e(2,'hold',{date:'2026-09-01'})]).active,false);
  assert.equal(next([e(2,'hold',{completed:false})]).factor,1);
  assert.equal(next([e(2,'hold',{effortDose:{v:1,scope:'T',eligible:false,factor:1}})]).factor,1);
  assert.equal(next([e(10)]).factor,1);
  assert.equal(next([e(10,'change',{completed:false})]).factor,.9,'early stopping may request lower load');
  assert.equal(next([e(2,'hold',{inputConfirmed:false})]).factor,1);
});
test('final effort: repeated signals accumulate only from the experienced snapshot and remain bounded',()=>{
  let factor=1;
  for(let i=0;i<20;i++)factor=next([e(2,'hold',{effortDose:{v:1,scope:'T',eligible:true,factor}})]).factor;
  assert.equal(factor,1.2);
  for(let i=0;i<20;i++)factor=next([e(10,'change',{effortDose:{v:1,scope:'T',eligible:true,factor}})]).factor;
  assert.equal(factor,.8);
  assert.equal(next([e(6,'hold',{effortDose:{v:1,scope:'T',eligible:true,factor:1.1}})]).factor,1.1);
});
