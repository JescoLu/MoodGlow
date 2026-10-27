/* MoodGlow technology spike: rule-based Strudel music + a shared-BPM visual clock.
   No AI, microphone, paid API, or remote audio samples are required. */

const goals = {
  uplifted: {
    bpm: 112,
    melody: ["c4","e4","g4","a4","g4","e4","d4","g4"],
    arp: ["c4","e4","g4","e4","f4","a4","c5","a4"],
    bass: ["c2","~","g2","~","f2","~","g2","~"]
  },
  calm: {
    bpm: 76,
    melody: ["d4","f4","a4","~","g4","f4","d4","~"],
    arp: ["d4","a4","f4","a4","g4","d4","f4","d4"],
    bass: ["d2","~","~","a2","g2","~","~","d2"]
  },
  refreshed: {
    bpm: 100,
    melody: ["g4","a4","b4","d5","b4","a4","g4","e4"],
    arp: ["g3","b3","d4","g4","c4","e4","g4","e4"],
    bass: ["g2","~","d3","~","c3","~","d3","~"]
  }
};

const moods = {
  sad: { bpmDelta:-5, rests:2, beatGain:.012, bassGain:.12 },
  stressed: { bpmDelta:-9, rests:1, beatGain:.008, bassGain:.12 },
  tired: { bpmDelta:5, rests:0, beatGain:.026, bassGain:.15 },
  okay: { bpmDelta:0, rests:1, beatGain:.018, bassGain:.13 }
};

const state = {
  mood:"sad", goal:"uplifted", playing:false, visualOnly:false,
  initialized:false, patternCount:0, bpm:0, startedAt:0, frame:null
};

const el = (id) => document.getElementById(id);
const glow = el("glow");
const beatDot = el("beat-dot");
const playButton = el("play");
const regenerateButton = el("regenerate");
const stopButton = el("stop");
const lightOnlyButton = el("light-only");

function message(text, error) {
  el("status").textContent = text;
  el("status").classList.toggle("error", Boolean(error));
}

function selectOption(type, value) {
  if (state.playing) return;
  state[type] = value;
  const container = el(type === "mood" ? "mood-options" : "goal-options");
  container.querySelectorAll("button").forEach(function(button) {
    const active = button.dataset[type] === value;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (type === "goal") document.body.dataset.theme = value;
  message("Selected " + type + ": " + value + ". Generate to hear its effect.");
}

function lockControls(playing) {
  document.querySelectorAll(".choice").forEach(function(button) { button.disabled = playing; });
  playButton.disabled = playing;
  regenerateButton.disabled = !playing;
  stopButton.disabled = !playing;
  lightOnlyButton.disabled = playing;
}

function seededRandom(seed) {
  let n = seed | 0;
  return function() {
    n += 0x6D2B79F5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildVariation() {
  state.patternCount += 1;
  const random = seededRandom((Date.now() ^ Math.floor(Math.random() * 2147483647)) | 0);
  const goal = goals[state.goal];
  const mood = moods[state.mood];
  const melody = goal.melody.slice();
  const arp = goal.arp.slice();

  // Variation stays in a composed pitch palette rather than choosing arbitrary notes.
  const rotation = Math.floor(random() * 4);
  melody.push.apply(melody, melody.splice(0, rotation));
  const swap = 1 + Math.floor(random() * 4);
  const previous = melody[swap];
  melody[swap] = melody[swap + 1];
  melody[swap + 1] = previous;
  for (let i = 0; i < mood.rests; i++) {
    melody[1 + Math.floor(random() * (melody.length - 1))] = "~";
  }
  if (random() > .5) arp.reverse();

  return {
    number:state.patternCount,
    bpm:goal.bpm + mood.bpmDelta + Math.floor(random() * 5 - 2),
    melody:melody.join(" "), arp:arp.join(" "), bass:goal.bass.join(" "),
    percussion:state.mood === "stressed" ? "c6 ~ c6 ~" : "c6 ~ c6 c6",
    percussionGain:mood.beatGain, bassGain:mood.bassGain
  };
}

function clearLight() {
  if (state.frame !== null) cancelAnimationFrame(state.frame);
  state.frame = null;
  glow.style.setProperty("--scale","1");
  glow.style.setProperty("--dx","0px");
  glow.style.setProperty("--dy","0px");
  beatDot.style.transform = "scale(1)";
  beatDot.style.opacity = ".3";
}

function animate(now) {
  if (!state.playing) return;
  const beat = (now - state.startedAt) / (60000 / state.bpm);
  const phase = beat - Math.floor(beat);
  const pulse = Math.exp(-8 * phase);
  glow.style.setProperty("--scale", String(1 + pulse * .11 + .012 * Math.sin(now / 1800)));
  glow.style.setProperty("--dx", String(Math.sin(now / 2250) * 14) + "px");
  glow.style.setProperty("--dy", String(Math.cos(now / 2800) * 10) + "px");
  beatDot.style.transform = "scale(" + String(1 + pulse * 1.3) + ")";
  beatDot.style.opacity = String(.3 + pulse * .7);
  state.frame = requestAnimationFrame(animate);
}

function startLight(bpm) {
  clearLight();
  state.bpm = bpm;
  state.startedAt = performance.now();
  state.playing = true;
  state.frame = requestAnimationFrame(animate);
}

function updateReadout(pattern, label) {
  el("bpm").textContent = String(pattern.bpm) + " BPM";
  el("variation").textContent = "Variation " + String(pattern.number);
  el("playback-state").textContent = label;
}

function stop() {
  if (!state.visualOnly && typeof window.hush === "function") {
    try { window.hush(); } catch (error) { console.warn("Strudel stop warning:", error); }
  }
  state.playing = false;
  state.visualOnly = false;
  clearLight();
  lockControls(false);
  el("playback-state").textContent = "Ready to create";
  message("Stopped. You can change your mood or generate again.");
}

function lightOnly() {
  if (state.playing) stop();
  const pattern = buildVariation();
  state.visualOnly = true;
  startLight(pattern.bpm);
  lockControls(true);
  updateReadout(pattern,"Light-only preview");
  message("Visual preview only — no music is playing. Press Stop when finished.");
}

function play() {
    if (state.playing) stop();
    const pattern = buildVariation();

    try {
      // Check whether Strudel has loaded.
    if (typeof window.initStrudel !== "function") {
      throw new Error("Strudel library did not load. Check internet access.");
    }

    // Initialise Strudel first.
    if (!state.initialized) {
      window.initStrudel();
      state.initialized = true;
    }

    // Check music functions after initialisation.
    if (typeof window.note !== "function" ||
        typeof window.stack !== "function") {
      throw new Error("Strudel loaded, but its music functions are unavailable.");
    }
    if (typeof window.hush === "function") window.hush();
    const tune = window.stack(
      window.note(pattern.melody).s("sine").gain(.20).attack(.01).release(.16),
      window.note(pattern.arp).s("triangle").gain(.085).slow(2).release(.34),
      window.note(pattern.bass).s("sine").gain(pattern.bassGain).slow(2).release(.24),
      window.note(pattern.percussion).s("sawtooth").gain(pattern.percussionGain).fast(2).release(.04)
    );
    tune.cpm(pattern.bpm / 4).play();
    state.visualOnly = false;
    startLight(pattern.bpm);
    lockControls(true);
    updateReadout(pattern,"Playing " + state.goal);
    message("Strudel playing. " + state.mood + " → " + state.goal +
            " at " + pattern.bpm + " BPM. Light uses the same tempo, not live audio frequencies.");
  } catch (error) {
    console.error("MoodGlow playback failed:", error);
    state.playing = false;
    state.visualOnly = false;
    clearLight();
    lockControls(false);
    el("playback-state").textContent = "Audio unavailable";
    message("Could not start audio: " + String(error.message || error), true);
  }
}

el("mood-options").addEventListener("click", function(event) {
  const button = event.target.closest("[data-mood]");
  if (button) selectOption("mood",button.dataset.mood);
});
el("goal-options").addEventListener("click", function(event) {
  const button = event.target.closest("[data-goal]");
  if (button) selectOption("goal",button.dataset.goal);
});
playButton.addEventListener("click",play);
regenerateButton.addEventListener("click",play);
stopButton.addEventListener("click",stop);
lightOnlyButton.addEventListener("click",lightOnly);
el("back").addEventListener("click",function() {
  if (state.playing) stop();
  document.querySelector("#mood-options .choice.selected").focus();
  message("Choose a mood and a desired feeling, then generate your soundscape.");
});

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  message("Reduced-motion preference detected. The animation can be stopped at any time.");
}
// Prepare Strudel when the page loads.
// Actual audio playback still requires a user click.
if (typeof window.initStrudel === "function") {
  try {
    window.initStrudel();
    state.initialized = true;
  } catch (error) {
    console.warn("Strudel initialization failed:", error);
  }
}