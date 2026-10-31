// MoodGlow V11.4 regression test: delayed Strudel initialization + first click.
// Run: node test_logic.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class Element {
  constructor(){this.textContent='';this.disabled=false;this.dataset={};this.listeners={};this.style={setProperty(){}};
    this.classList={toggle(){}};}
  addEventListener(event,fn){this.listeners[event]=fn;}
  setAttribute(){}
  querySelectorAll(){return []}
  click(){if(this.listeners.click)this.listeners.click({target:this})}
  focus(){}
}
const ids = new Map();
const element = id => {if(!ids.has(id))ids.set(id,new Element());return ids.get(id)};
const plays=[];
let calls=0;
const voices=p=>{const v={p};for(const prop of ['s','gain','room','attack','release','lpf','swingBy'])v[prop]=()=>v;
  v.cpm=()=>v;v.play=()=>{plays.push('test-tone');return Promise.resolve()};return v;};
const window={
  matchMedia:()=>({matches:false}),addEventListener(){},
  hush(){},
  initStrudel(){
    calls++;
    return new Promise(resolve=>setTimeout(()=>{
      window.note=voices;window.s=voices;
      window.stack=(...args)=>({cpm(){return this;},play(){plays.push('stack:'+args.length);return Promise.resolve();}});
      resolve();
    },80));
  }
};
const document={getElementById:element,querySelectorAll:()=>[],body:{dataset:{}},querySelector:()=>({focus(){}})};
const context={window,document,setTimeout,clearTimeout,Math,Date,console,
  performance:{now:()=>Date.now()},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),context);
(async()=>{
  // First click while the library initialization is still pending.
  vm.runInContext("state.goal='calm'",context);
  await vm.runInContext('play()',context);
  assert.ok(plays[0].startsWith('stack:'),'Calm must play on first click');
  assert.equal(element('status').classList.error,undefined);
  vm.runInContext('stop()',context);
  vm.runInContext("state.goal='refreshed'",context);
  await vm.runInContext('play()',context);
  assert.ok(plays[1].startsWith('stack:'),'Refreshed plays on first click');
  vm.runInContext('stop()',context);
  await vm.runInContext('testTone()',context);
  assert.equal(plays[2],'test-tone');
  assert.equal(calls,1,'Strudel initializes only once');
  for(const goal of ['uplifted','calm','refreshed']){
    vm.runInContext('state.goal='+JSON.stringify(goal),context);
    const pattern=vm.runInContext('buildVariation(20261029)',context);
    assert.equal(pattern.bars,32);
  }
  // V13: actual generated note/drum events drive the visual amplitude.
  const accentProfiles=[];
  for(const goal of ['uplifted','calm','refreshed']){
    vm.runInContext('state.goal='+JSON.stringify(goal),context);
    const profile=vm.runInContext('visualAccentTrack(buildVariation(424242))',context);
    assert.equal(profile.length,512,goal+' needs exactly 32 bars x 16 steps');
    assert.ok(profile.filter(x=>x>.35).length>0,goal+' should have real musical accents');
    assert.ok(new Set(profile.map(x=>x.toFixed(3))).size>3,goal+' should have varied dynamics');
    accentProfiles.push(JSON.stringify(Array.from(profile)));
  }
  assert.notEqual(accentProfiles[0],accentProfiles[1]);
  assert.notEqual(accentProfiles[1],accentProfiles[2]);
  console.log('PASS: V11.4 first click Calm/Refreshed/Test tone; 32-bar patterns; V13 musical accent data for all three styles.');
})().catch(e=>{console.error(e);process.exitCode=1;});
