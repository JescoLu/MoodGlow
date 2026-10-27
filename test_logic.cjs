/* Logic-only test harness. Strudel and browser DOM are mocked deliberately.
 * This DOES NOT establish audible browser playback. Run: node test_logic.cjs */
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

class MockClassList {
  constructor() { this.names = new Set(); }
  toggle(name, active) { if (active) this.names.add(name); else this.names.delete(name); }
}
class MockElement {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.textContent = "";
    this.disabled = false;
    this.attributes = {};
    this.callbacks = {};
    this.classList = new MockClassList();
    this.properties = {};
    this.style = { setProperty: (name, value) => { this.properties[name] = value; } };
  }
  addEventListener(type, callback) { this.callbacks[type] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  closest(selector) { return selector.replace(/^\[data-/,'').replace(/\]$/,'') in this.dataset ? this : null; }
  click(event = { target:this }) { if (this.callbacks.click) this.callbacks.click(event); }
  querySelectorAll() { return this.buttons || []; }
}

const elements = {};
const getElement = (id) => elements[id] ||= new MockElement();
const moodButtons = ["sad","stressed","tired","okay"].map(value => new MockElement({mood:value}));
const goalButtons = ["uplifted","calm","refreshed"].map(value => new MockElement({goal:value}));
getElement("mood-options").buttons = moodButtons;
getElement("goal-options").buttons = goalButtons;
for (const id of ["play","regenerate","stop","back","light-only","status","glow","beat-dot","bpm","variation","playback-state"]) getElement(id);

const events = [];
let nextFrame = null;
let frameId = 0;
const makeVoice = () => ({
  s() { return this; }, gain() { return this; }, attack() { return this; },
  release() { return this; }, slow() { return this; }, fast() { return this; }
});
const audio = {
  initStrudel: () => events.push(["init"]),
  hush: () => events.push(["hush"]),
  setcps: (value) => events.push(["cps",value]),
  note: (pattern) => { events.push(["note",pattern]); return makeVoice(); },
  stack: (...parts) => { assert.equal(parts.length,4); return {play:() => events.push(["play"])}; },
  matchMedia: () => ({matches:false})
};
const context = {
  document: {
    getElementById:getElement,
    querySelector:() => ({focus:() => {}}),
    body:{dataset:{theme:"uplifted"}},
    querySelectorAll:(selector) => selector === ".choice" ? [...moodButtons,...goalButtons] : []
  },
  window:audio,
  console,
  performance:{now:() => 1000},
  requestAnimationFrame:(callback) => { nextFrame = callback; return ++frameId; },
  cancelAnimationFrame:() => { nextFrame = null; },
  Date,
  Math
};
vm.runInNewContext(fs.readFileSync(__dirname + "/app.js","utf8"),context);

function choose(type,value) {
  const container = getElement(type === "mood" ? "mood-options" : "goal-options");
  const selected = container.buttons.find(button => button.dataset[type] === value);
  container.click({target:selected});
}
function click(id) { getElement(id).click(); }
function count(type) { return events.filter(entry => entry[0] === type).length; }

choose("mood","tired");
choose("goal","calm");
assert.equal(context.document.body.dataset.theme,"calm");
assert.equal(goalButtons[1].attributes["aria-pressed"],"true");
click("play");
assert.equal(count("play"),1);
assert.equal(count("init"),1);
assert.equal(getElement("play").disabled,true);
assert.equal(getElement("stop").disabled,false);
assert.equal(getElement("playback-state").textContent,"Playing calm");
const bpm = Number(getElement("bpm").textContent.split(" ")[0]);
assert.ok(bpm >= 79 && bpm <= 83,"calm+tired maps to approx 81 BPM");
const cps = events.filter(entry => entry[0] === "cps").at(-1)[1];
assert.ok(Math.abs(cps - bpm/240) < 1e-9);
assert.equal(typeof nextFrame,"function");
nextFrame(1000 + 60000/bpm);
assert.ok(Number(getElement("glow").properties["--scale"]) > 1,"light pulses once per beat");

click("regenerate");
assert.equal(count("play"),2);
assert.equal(getElement("variation").textContent,"Variation 2");
assert.equal(count("init"),1,"Strudel initialises only once");
click("stop");
assert.equal(getElement("play").disabled,false);
assert.equal(getElement("stop").disabled,true);
assert.equal(getElement("glow").properties["--scale"],"1");
click("back");
assert.ok(getElement("status").textContent.includes("Choose a mood"));

const audioCount = count("play");
click("light-only");
assert.equal(count("play"),audioCount,"light-only mode does not play music");
assert.equal(getElement("playback-state").textContent,"Light-only preview");
click("stop");

// The CDN-unavailable branch must be transparent and non-crashing.
audio.initStrudel = undefined;
click("play");
assert.equal(getElement("playback-state").textContent,"Audio unavailable");
assert.equal(getElement("play").disabled,false);
assert.ok(getElement("status").textContent.includes("Strudel did not load"));

console.log("PASS: mood/goal choices, procedural pattern, common BPM, beat pulse, regenerate, stop, visual fallback, CDN error");
console.log("NOTE: Browser audio output and animation rendering still require real-browser verification.");
