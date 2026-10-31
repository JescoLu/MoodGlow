/* MoodGlow V11.3 — Uplifted WebAudio sampler / existing Strudel Calm & Refreshed.
 * No audio, melodies, drum transcriptions or samples from commercial songs.
 * 32-bar, 4/4 Strudel patterns. Target feeling selects the music.
 * Current mood controls the visual, independently of the sound.
 */
const MOODGLOW_LOCAL_SAMPLES = {
  "mg_piano": {
    "c4": "mg_piano_60.wav",
    "c5": "mg_piano_72.wav",
    "c6": "mg_piano_84.wav"
  },
  "mg_epiano": {
    "c4": "mg_epiano_60.wav",
    "c5": "mg_epiano_72.wav",
    "c6": "mg_epiano_84.wav"
  },
  "mg_guitar": {
    "c4": "mg_guitar_60.wav",
    "c5": "mg_guitar_72.wav",
    "c6": "mg_guitar_84.wav"
  },
  "mg_brass": {
    "c4": "mg_brass_60.wav",
    "c5": "mg_brass_72.wav",
    "c6": "mg_brass_84.wav"
  },
  "mg_strings": {
    "c4": "mg_strings_60.wav",
    "c5": "mg_strings_72.wav",
    "c6": "mg_strings_84.wav"
  },
  "mg_bd": "mg_bd.wav",
  "mg_sd": "mg_sd.wav",
  "mg_hh": "mg_hh.wav",
  "mg_cp": "mg_cp.wav",
  "mg_sh": "mg_sh.wav"
};

const GOALS = {
  uplifted: {
    bpm: 172, name: 'Firefly Parade', family: 'lively pop-rock with piano hooks, bright guitar, brass hits, strings and driving drums — no permanent bass or drone',
    // All-new original progression, higher chord voicings with no bass note bed.
    chords: [
      {root:'a2',fifth:'e3',chord:['a4','c#5','e5'],pool:['a4','b4','c#5','d5','e5','f#5','g#5','a5','b5','c#6']},
      {root:'d3',fifth:'a3',chord:['a4','d5','f#5'],pool:['a4','b4','c#5','d5','e5','f#5','g#5','a5','b5','c#6']},
      {root:'f#2',fifth:'c#3',chord:['a4','c#5','f#5'],pool:['a4','b4','c#5','d5','e5','f#5','g#5','a5','b5','c#6']},
      {root:'e3',fifth:'b3',chord:['g#4','b4','e5'],pool:['a4','b4','c#5','d5','e5','f#5','g#5','a5','b5','c#6']},
      {root:'b2',fifth:'f#3',chord:['b4','d5','f#5'],pool:['a4','b4','c#5','d5','e5','f#5','g#5','a5','b5','c#6']}
    ],
    harmony: [0,1,2,3, 0,4,1,3,
              2,1,0,3, 4,1,2,3,
              0,2,1,3, 0,4,1,3,
              2,1,0,3, 4,1,3,0]
  },
  calm: {
    bpm: 86, name: 'Quiet Horizon', family: 'expressive piano and warm orchestral layers' ,
    chords: [
      {root:'f2', fifth:'c3', chord:['f3','a3','c4','e4'],pool:['a4','c5','e5','f5','g5']},
      {root:'d3', fifth:'a3', chord:['d4','f4','a4','c5'],pool:['f4','a4','c5','d5','e5']},
      {root:'bb2',fifth:'f3', chord:['bb3','d4','f4','a4'],pool:['a4','bb4','d5','f5','g5']},
      {root:'c3', fifth:'g3', chord:['c4','e4','g4','d5'],pool:['g4','c5','d5','e5','g5']}
    ],
    harmony: [0,1,2,3, 0,2,1,3, 1,0,3,2, 0,1,3,0, 2,1,0,3, 1,2,3,0, 0,2,1,3, 0,1,0,0]
  },
  refreshed: {
    bpm: 118, name: 'Neon Breeze', family: 'shimmering retro synth-pop with steady dance groove',
    chords: [
      {root:'e2', fifth:'b2', chord:['e3','g#3','b3','d#4'],pool:['g#4','b4','c#5','d#5','e5','f#5','g#5']},
      {root:'b2', fifth:'f#3',chord:['b3','d#4','f#4','a4'],pool:['f#4','a4','b4','c#5','d#5','f#5','a5']},
      {root:'c#3',fifth:'g#3',chord:['c#4','e4','g#4','b4'],pool:['e4','g#4','b4','c#5','d#5','e5','g#5']},
      {root:'a2', fifth:'e3', chord:['a3','c#4','e4','g#4'],pool:['e4','f#4','g#4','a4','b4','c#5','e5']},
      {root:'f#2',fifth:'c#3',chord:['f#3','a3','c#4','e4'],pool:['a4','b4','c#5','d#5','e5','f#5','g#5']}
    ],
    harmony: [0,3,2,1, 0,3,4,1, 2,3,0,1, 2,4,3,1, 3,0,1,2, 3,4,0,1, 0,2,3,1, 4,3,1,0]
  }
};
const MOODS = { sad:'Diffuse · drifting islands', stressed:'Ribbon · directional flow',
                tired:'Vertical · slow bloom', okay:'Balanced · fluid orbit' };
const SECTION_NAMES = ['Establish the groove','New layers arrive','Full-energy lift','Warm return'];
const state = {mood:'sad',goal:'uplifted',playing:false,loading:false,initialized:false,
               patternCount:0,bpm:0,startedAt:0,frame:null,section:null};
const el=id=>document.getElementById(id);
const glow=el('glow'),beatDot=el('beat-dot');
const playButton=el('play'),regenerateButton=el('regenerate'),stopButton=el('stop');
const toneButton=el('test-tone'),layersButton=el('toggle-layers');
function message(text,error=false){el('status').textContent=text;el('status').classList.toggle('error',Boolean(error));}
function chooseOption(type,value){
  if(state.playing && type==='goal')return; // switching mood during playback changes only light
  state[type]=value;
  const container=el(type==='mood'?'mood-options':'goal-options');
  container.querySelectorAll('button').forEach(button=>{
    const active=button.dataset[type]===value;
    button.classList.toggle('selected',active);
    button.setAttribute('aria-pressed',String(active));
  });
  if(type==='goal'){
    document.body.dataset.theme=value;
    window.moodglowVisual?.setTheme(value);
  } else {
    document.body.dataset.mood=value;
    window.moodglowVisual?.setMood(value);
    el('mood-effect').textContent='Light · '+MOODS[value];
  }
  message(type==='mood' ? 'Light shape: '+MOODS[value]+'. Music continues unchanged.' :
                       'Desired feeling: '+value+'. Generate to hear its continuous arrangement.');
}
function lockControls(playing){
  // Desired feeling controls the playing music; current mood only changes visuals,
  // so allow the four current-mood buttons to update live during playback.
  document.querySelectorAll('[data-goal]').forEach(button=>button.disabled=playing);
  playButton.disabled=playing;regenerateButton.disabled=!playing;
  stopButton.disabled=!playing;
  toneButton.disabled=playing;layersButton.disabled=playing;
}
function seededRandom(seed){let n=seed|0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const empty=n=>Array(n).fill('~');
const barsToStr=bars=>'<'+bars.map(bar=>'['+bar.join(' ')+']').join(' ')+ '>';
const chordsToStr=bars=>'<'+bars.map(bar=>'['+bar.join(',')+']').join(' ')+ '>';
const voices=['lead','leadAccent','strings','answer','sparkle','rhythmKeys','guitar','arp','pad','bass','bassAnchor',
              'kick','snare','hat','shaker','fill'];
// ORIGINAL melodic gestures. Each four-bar group has a recognizable contour,
// not independently random pitches. Note lengths use a sixteen-step grid.
const SHAPES={
 uplifted:[
   [0,2,3,5,7,10,12,14],
   [0,2,4,6,9,11,13,15],
   [0,3,5,7,8,11,13,15],
   [0,2,4,7,9,11,12,14]
 ],
 refreshed:[
   [0,2,4,5,7,8,10,12,14],
   [0,3,4,6,8,9,11,12,14,15],
   [0,2,3,5,7,8,10,11,13,15],
   [0,2,4,6,8,10,11,12,14]
 ],
 calm:[
   [0,3,6,9,12,14],
   [0,4,7,10,13],
   [0,3,7,9,12,15],
   [0,4,8,11,13]
 ]
};
const MELODIES={
 uplifted:[2,4,5,3,6,4,3,2, 4,5,3,2,5,4,2,1],
 refreshed:[2,3,4,3,2,4,5,4,3,2,4,3,2,3,5,4],
 calm:[1,2,3,2,4,3,2,1,2,3,2,1,0,2,1,1]
};
const pick=(pool,i)=>pool[((i%pool.length)+pool.length)%pool.length];
function leadBar(pool,goal,bar,seed,random){
  const notes=empty(16), steps=SHAPES[goal][bar%4],contour=MELODIES[goal];
  if(goal==='uplifted'){
    // ORIGINAL 4-section arrangement. Melodic shapes are developed from a
    // new major-key motif; not a note-for-note or drum transcription.
    // Each 16-position bar contains rhythmic offbeats and distinct endings.
    const section=Math.floor(bar/8), phrase=bar%4;
    const rhythmA=[[0,2,3,6,8,10,12,14],[0,3,4,6,9,10,13,14],
                   [0,2,5,6,8,11,12,15],[0,2,4,7,8,10,12,14]];
    const rhythmB=[[0,1,3,4,6,8,10,13,14],[0,2,3,5,7,8,10,12,15],
                   [0,1,4,6,8,9,11,12,14],[0,2,3,4,7,9,10,12,15]];
    const rhythmHook=[[0,2,4,6,7,9,11,12,14],[0,2,3,5,7,8,10,12,14],
                      [0,1,3,5,6,8,10,12,15],[0,2,4,5,7,8,10,11,14]];
    const contourA=[[2,4,5,3,6,5,4,2],[3,5,6,4,7,6,5,3],
                    [4,3,5,6,4,2,3,5],[2,5,4,6,5,3,2,4]];
    const contourB=[[3,5,7,6,4,5,6,8,7],[4,6,5,7,8,6,5,3,4],
                    [5,7,8,6,7,5,4,6,8],[7,6,5,8,6,4,5,3,2]];
    const hook=[[5,7,8,9,7,6,8,9,7],[6,8,9,7,8,6,7,9,8],
                [7,9,8,6,9,8,7,5,8],[8,7,9,8,6,7,5,6,5]];
    const rhythms=section<1?rhythmA:section<2?rhythmB:rhythmHook;
    const contour=section<1?contourA:section<2?contourB:hook;
    const steps=rhythms[phrase], degrees=contour[phrase];
    const variation=((seed%7)+7)%7;
    for(let i=0;i<steps.length;i++){
      let degree=degrees[i];
      if(section===3 && (i===2 || i===6))degree=Math.min(9,degree+1);
      if((bar%8)===7 && i===steps.length-1)degree=section===3?4:3;
      if(variation%3===1 && (i===2||i===5))degree=Math.min(9,degree+1);
      if(variation%3===2 && (i===3||i===7))degree=Math.max(1,degree-1);
      notes[steps[i]]=pick(pool,degree);
    }
    return notes;
  }
  // Repeated four-bar hook + gentle answers; a seed adjusts the hook shape,
  // while chord-based note pools preserve the harmony.
  const section=Math.floor(bar/8),sectionShift=section===2?1:0;
  const hookShift=(seed%3+3)%3-1;
  steps.forEach((step,i)=>{
    let idx=contour[(i+(bar%2)*2)%contour.length]+hookShift+sectionShift;
    if((bar%4)===3 && i>=steps.length-2)idx=2; // cadence to the next phrase
    if(goal!=='calm' && section===2 && i%6===5)idx+=1;
    if(random()<.04 && goal!=='calm')idx+=random()<.5?-1:1;
    notes[step]=pick(pool,idx);
  });
  return notes;
}
function chordHits(chord,goal,bar,section){
  const slots=empty(8),notes='['+chord.chord.join(',')+']';
  if(goal==='uplifted'){
    // Staccato chord accents: no held drone, no endlessly rolling piano.
    const hits=section===0?[0,3,6]:section===1?[0,2,5,7]:[0,2,4,5,7];
    hits.forEach(i=>slots[i]=notes);
  }else if(goal==='refreshed'){
    // Off-beat synth chords, common to the broad retro dance-pop idiom.
    [1,3,5,7].forEach(i=>slots[i]=notes);
    if(section===2)slots[0]=notes;
  }else{ slots[0]=notes;slots[4]=notes; }
  return slots;
}
function arpeggio(chord,goal,bar){
  const slots=empty(8),order=goal==='uplifted'?([
    [0,1,2,1,0,2,3,1], [0,2,1,3,2,1,0,2],
    [0,1,3,2,1,3,2,0], [0,2,3,1,0,3,2,1]
  ][bar%4]):goal==='refreshed'?[0,2,1,3,2,1,0,2]:[0,1,2,1,3,2,1,0];
  const steps=goal==='calm'?[0,2,4,6]:goal==='refreshed'?[0,1,2,3,4,5,6,7]:[0,1,2,3,4,5,6,7];
  steps.forEach((step,i)=>slots[step]=chord.chord[order[(i+bar%2)%order.length]%chord.chord.length]);
  return slots;
}
function grooveBass(chord,goal,bar,section){
  const slots=empty(8);
  if(goal==='calm'){
    [0,4].forEach((step,i)=>slots[step]=i===0?chord.root:chord.fifth);
  }else if(goal==='uplifted'){
    // Syncopated bass that still anchors every quarter-note pulse.
    const hits=bar%2===0?[0,1,3,4,6,7]:[0,2,3,4,5,7];
    hits.forEach((step,i)=>{
      slots[step]=(i===2||i===hits.length-1)?chord.fifth:chord.root;
    });
    // Extra pickup in the higher-energy phrase; never remove the downbeat.
    if(section===2)slots[5]=chord.fifth;
  }else{
    // Springy synth-bass syncopations. The root returns every bar.
    [0,2,3,4,6,7].forEach((step,i)=>slots[step]=[chord.root,chord.root,chord.fifth,chord.root,chord.fifth,chord.root][i]);
  }
  return slots;
}
function rhythm(goal,bar,section){
  const kick=empty(16),snare=empty(16),hat=empty(16),shaker=empty(16),fill=empty(16);
  if(goal==='calm')return {kick,snare,hat,shaker,fill};
  if(goal==='uplifted'){
    // Driving pop-rock kit: distinct verse/build/chorus fills, bright hats.
    const kicks=[[0,6,8,11],[0,3,8,14],[0,5,8,10,14],[0,7,8,11,15]];
    kicks[bar%4].forEach(i=>kick[i]='bd');
    [4,12].forEach(i=>snare[i]='sd');
    for(let i=0;i<16;i+=2)hat[i]='hh';
    if(section>=1)for(const i of [3,7,11,15])hat[i]='hh';
    if(section===2||section===3){
      kick[section===2?13:10]='bd';
      [2,6,10,14].forEach(i=>shaker[i]='sh');
    }
    if(bar%4===3){fill[13]='sd';fill[14]='sd';fill[15]='sd';}
    if(bar%8===7){fill[11]='cp';fill[12]='sd';fill[14]='sd';fill[15]='cp';}
  }else{
    // ORIGINAL four-on-the-floor dance pulse with steady backbeat.
    [0,4,8,12].forEach(i=>kick[i]='bd');
    [4,12].forEach(i=>snare[i]='cp');
    for(let i=0;i<16;i+=2)hat[i]='hh';
    [2,6,10,14].forEach(i=>shaker[i]='sh');
    if(section===2 && bar%4===3){fill[13]='sd';fill[15]='sd';}
  }
  return {kick,snare,hat,shaker,fill};
}
function buildVariation(seedOverride){
  const number=++state.patternCount,goal=state.goal,config=GOALS[goal];
  const seed=Number.isInteger(seedOverride)?seedOverride:(Date.now()^Math.floor(Math.random()*0x7fffffff));
  const random=seededRandom(seed),parts=Object.fromEntries(voices.map(v=>[v,[]]));
  let noteCount=0;
  for(let bar=0;bar<32;bar++){
    const section=Math.floor(bar/8),chord=config.chords[config.harmony[bar]],pool=chord.pool;
    const lead=leadBar(pool,goal,bar,seed,random),answer=empty(16),sparkle=empty(16);
    // Extra note-on velocity for musical accents; the unaccented lead keeps playing.
    const accent=empty(16);
    for(const step of (goal==='calm'?[0,8]:(section===2?[0,4,6,8,12,14]:[0,4,8,12]))){
      if(lead[step]!=='~')accent[step]=lead[step];
    }
    if(goal==='uplifted'){
      // All-new upper-register call/response; no constant low note.
      if(section===0){
        if(bar%2){answer[6]=pick(pool,6);answer[14]=pick(pool,7);}
      }else if(section===1){
        [2,6,10,14].forEach((at,j)=>{if((j+bar)%3!==0)answer[at]=pick(pool,5+(j%4));});
      }else{
        // A bright brass response in high-energy section; it plays
        // alongside the piano, not replacing it or adding a bass bed.
        [1,5,9,13].forEach((at,j)=>{if(j!==bar%4)answer[at]=pick(pool,6+(j%3));});
        if(bar%2===0){sparkle[0]=pick(pool,5);sparkle[8]=pick(pool,7);}
      }
    }else if(goal==='refreshed'){
      // Bright electric-key responses to a sustained retro synth hook.
      [3,7,11,15].forEach((step,i)=>answer[step]=pick(pool,1+((bar+i+section)%5)));
      if(section===2){[6,14].forEach((step,i)=>sparkle[step]=pick(pool,3+i+(bar%2)));}
    }else{
      if(bar%2===1||section===2){answer[8]=pick(pool,2+(bar%3));}
      if(section===2&&bar%4===3){answer[12]=pick(pool,3);}
    }
    const rhythmKeys=chordHits(chord,goal,bar,section);
    const guitar=empty(8);
    if(goal==='uplifted'){
      // Chord stabs for guitars; no low guitar ostinato.
      if(section>=1){
        const chordHigh='['+chord.chord.join(',')+']';
        const attacks=section===1?[1,4,6]:bar%2===0?[0,3,5,7]:[1,3,4,6];
        attacks.forEach(step=>guitar[step]=chordHigh);
      }
    }
    parts.lead.push(lead);parts.leadAccent.push(accent);parts.answer.push(answer);parts.sparkle.push(sparkle);
    parts.strings.push(goal==='uplifted'?(section===2||section===3?chord.chord:['~']):goal==='calm'&&section===0?['~']:chord.chord);
    parts.rhythmKeys.push(rhythmKeys);parts.guitar.push(guitar);
    // Uplifted intentionally has no continuous bass, anchor, arpeggio or synth pad.
    parts.arp.push(goal==='uplifted'?empty(8):arpeggio(chord,goal,bar));
    parts.pad.push(goal==='uplifted'?['~']:chord.chord);
    parts.bass.push(goal==='uplifted'?empty(8):grooveBass(chord,goal,bar,section));
    parts.bassAnchor.push(goal==='uplifted'?empty(8):[chord.root,'~','~','~',chord.fifth,'~','~','~']);
    const drum=rhythm(goal,bar,section);
    for(const name of ['kick','snare','hat','shaker','fill'])parts[name].push(drum[name]);
    noteCount+=lead.filter(n=>n!=='~').length;
  }
  const patterns=Object.fromEntries(voices.map(name=>[name,barsToStr(parts[name])]));
  patterns.pad=chordsToStr(parts.pad);
  patterns.strings=chordsToStr(parts.strings);
  return {rawParts:parts,number,bpm:config.bpm,bars:32,style:goal,mood:state.mood,
    description:config.name,genre:config.family,seed,noteCount,...patterns};
}
function maybeSwing(pattern,subdivision,amount){return typeof pattern.swingBy==='function'?pattern.swingBy(amount,subdivision):pattern;}
// Safe mode keeps the same V11 melody/chords/rhythm but only uses voices
// already demonstrated in earlier working versions. Optional layers are
// tested separately because a bad sample/pattern may fail during scheduling.
let upliftedExtraLayers = false;
function voicesForPattern(p){
  const note=window.note,s=window.s;
  // All melodic material and rhythm programming are newly authored.
  // Reference files are never loaded, streamed, sampled, or distributed.
  if(p.style==='uplifted'){
    // V11.2 FIX: sound names are explicitly registered in the local sample map.
    // These small original DSP-generated WAVs ship with this preview.
    // Unlike the unregistered 'piano', 'bd', etc., they can be resolved offline.
    const core=[
      note(p.lead).s('mg_piano').gain(.27).release(.24),
      note(p.leadAccent).s('mg_piano').gain(.055).release(.20),
      note(p.rhythmKeys).s('mg_epiano').gain(.095).release(.20),
      note(p.answer).s('mg_piano').gain(.095).release(.18),
      s(p.kick.replaceAll('bd','mg_bd')).gain(.38),
      s(p.snare.replaceAll('sd','mg_sd')).gain(.28),
      s(p.hat.replaceAll('hh','mg_hh')).gain(.12),
      s(p.shaker.replaceAll('sh','mg_sh')).gain(.11),
      s(p.fill.replaceAll('sd','mg_sd').replaceAll('cp','mg_cp')).gain(.12)
    ];
    if(upliftedExtraLayers){
      core.push(
        note(p.guitar).s('mg_guitar').gain(.11).release(.20),
        note(p.answer).s('mg_brass').gain(.075).release(.25),
        note(p.sparkle).s('mg_brass').gain(.07).release(.16),
        note(p.strings).s('mg_strings').gain(.045).release(.75)
      );
    }
    return core;
  }
  if(p.style==='calm')return [
    note(p.lead).s('piano').gain(.20).room(.24).release(.65),
    note(p.leadAccent).s('piano').gain(.035).room(.24).release(.65),
    note(p.answer).s('gm_flute').attack(.11).release(.8).gain(.050).room(.32),
    note(p.rhythmKeys).s('gm_epiano1').gain(.052).room(.3).release(1.0),
    note(p.arp).s('piano').gain(.055).room(.24).release(.66),
    note(p.strings).s('gm_string_ensemble_1').attack(.60).release(2.3).gain(.048).room(.33),
    note(p.bassAnchor).s('gm_cello').attack(.22).release(1.55).gain(.038).room(.26),
    note(p.pad).s('triangle').attack(.3).release(1.5).lpf(580).gain(.016)
  ];
  return [
    // A new retro synth melody, NOT a transcription of the reference vocals.
    note(p.lead).s('sawtooth').lpf(2100).attack(.012).release(.19).gain(.070).room(.15),
    note(p.leadAccent).s('sawtooth').lpf(2350).attack(.012).release(.19).gain(.019),
    note(p.lead).s('square').lpf(1200).attack(.014).release(.16).gain(.022),
    note(p.answer).s('gm_epiano1').gain(.095).room(.16).release(.38),
    note(p.sparkle).s('gm_glockenspiel').gain(.035).room(.16),
    maybeSwing(note(p.rhythmKeys).s('gm_epiano1').gain(.085).release(.20),4,.12),
    note(p.arp).s('triangle').lpf(2300).attack(.012).release(.12).gain(.049),
    note(p.pad).s('gm_synth_strings_1').attack(.26).release(1.15).gain(.040).room(.26),
    note(p.pad).s('triangle').attack(.09).release(.85).lpf(700).gain(.014),
    note(p.bass).s('gm_synth_bass_1').gain(.164).lpf(1200),
    note(p.bassAnchor).s('sine').release(.35).gain(.020),
    s(p.kick).gain(.23),s(p.snare).gain(.15),
    maybeSwing(s(p.hat).gain(.049),4,.13),
    s(p.shaker).gain(.035),s(p.fill).gain(.050)
  ];
}
function showPlayingTitle(active){el('experience').classList.toggle('is-playing', Boolean(active));}
function clearLight(){
  if(state.frame!==null)cancelAnimationFrame(state.frame);
  state.frame=null;state.section=null;
  glow.style.setProperty('--scale','1');glow.style.setProperty('--dx','0px');glow.style.setProperty('--dy','0px');
  beatDot.style.transform='scale(1)';beatDot.style.opacity='.3';
  const section=el('section');if(section)section.textContent='32-bar arrangement';
  window.moodglowVisual?.setPlayback(false,state.bpm);
}
function animate(now){
  if(!state.playing)return;
  const elapsed=now-state.startedAt,beat=elapsed/(60000/state.bpm);
  const phase=beat-Math.floor(beat),pulse=Math.exp(-8*phase);
  glow.style.setProperty('--scale',String(1+pulse*.09+.013*Math.sin(now/1800)));
  glow.style.setProperty('--dx',String(Math.sin(now/2150)*14)+'px');
  glow.style.setProperty('--dy',String(Math.cos(now/2700)*9)+'px');
  beatDot.style.transform='scale('+String(1+pulse*1.2)+')';
  beatDot.style.opacity=String(.3+pulse*.7);
  const sectionIndex=Math.floor(beat/4/8)%4;
  if(sectionIndex!==state.section){
    state.section=sectionIndex;
    const display=el('section');if(display)display.textContent=SECTION_NAMES[sectionIndex]+' · bars '+(sectionIndex*8+1)+'–'+(sectionIndex*8+8);
  }
  state.frame=requestAnimationFrame(animate);
}
// Each sixteenth-note accent is derived from the actual generated 32-bar arrangement.
// For native Uplifted these steps are the same drum events sent to Web Audio.
// For Strudel Calm/Refreshed they are pattern-derived, so visual alignment is approximate.
function visualAccentTrack(pattern){
  if(!pattern || !pattern.rawParts) return null;
  const parts=pattern.rawParts;
  const accent=Array(32*16).fill(0);
  for(let bar=0;bar<32;bar++)for(let step=0;step<16;step++){
    const has=(voice,division=16)=>{
      if(division===8 && step%2)return false;
      const token=parts[voice]?.[bar]?.[division===8?step/2:step];
      return Boolean(token && token!=='~' && token!=='[~]');
    };
    let level=0;
    if(pattern.style==='calm'){
      if(has('lead'))level+=.15;
      if(has('leadAccent'))level+=.17;
      if(has('rhythmKeys',8))level+=.11;
      if(has('arp',8))level+=.085;
      if(step===0 && bar%4===0)level+=.195;
    } else {
      if(has('kick'))level+=pattern.style==='uplifted'?.43:.455;
      if(has('snare'))level+=.525;
      if(has('fill'))level+=.50;
      if(has('hat'))level+=.07;
      if(has('shaker'))level+=.035;
      if(has('leadAccent'))level+=.12;
      if(has('rhythmKeys',8))level+=.055;
    }
    accent[bar*16+step]=Math.min(1,level);
  }
  return accent;
}
function startLight(bpm,pattern){clearLight();showPlayingTitle(true);state.bpm=bpm;state.startedAt=performance.now();state.playing=true;
  window.moodglowVisual?.setPlayback(true,bpm,visualAccentTrack(pattern));
  state.frame=requestAnimationFrame(animate);}
function updateReadout(p,label){
  el('bpm').textContent=String(p.bpm)+' BPM';
  el('variation').textContent='Variation '+String(p.number);
  el('playback-state').textContent=label;
  el('mood-effect').textContent='Light · '+MOODS[state.mood];
}
function stop(){
  cancelNativePlayback();state.loading=false;
  if(typeof window.hush==='function'){
    try{window.hush();}catch(error){console.warn('Strudel stop warning:',error);}
  }
  state.playing=false;clearLight();showPlayingTitle(false);lockControls(false);
  el('playback-state').textContent='Ready to create';
  message('Stopped. Select another current mood or desired feeling above, then press Generate & Play.');
}
function audioFailed(error){
  cancelNativePlayback();state.loading=false;
  console.error('MoodGlow audio engine error:',error);
  state.playing=false;
  clearLight();showPlayingTitle(false);lockControls(false);
  el('playback-state').textContent='Audio failed';
  message('Audio error: '+String(error?.message||error)+' — open Chrome DevTools Console for details.',true);
}

// V11.4: Pre-warm Strudel on page load, and share a single readiness promise.
// The initial initStrudel() call can return before note/s/stack are exposed.
// Only mark state.initialized once the real functions are available.
let strudelReadyPromise = null;
const strudelApiReady = () => ['note','s','stack'].every(name => typeof window[name] === 'function');
function initializeMoodGlowAudio(){
  if(state.initialized && strudelApiReady())return Promise.resolve();
  if(strudelReadyPromise)return strudelReadyPromise;
  strudelReadyPromise = (async () => {
    if(typeof window.initStrudel !== 'function'){
      throw new Error('Strudel library did not load. Check your connection.');
    }
    // Supports both current synchronous and future Promise-returning initStrudel.
    await window.initStrudel();
    // Some browser bundle versions expose the global helpers on a later tick.
    const deadline = performance.now() + 8000;
    while(!strudelApiReady()){
      if(performance.now() > deadline){
        throw new Error('Strudel did not finish preparing its music functions. Please reload the page.');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    state.initialized=true;
  })().catch(error => {
    state.initialized=false;
    strudelReadyPromise=null; // allow a retry after network / initialization failure
    throw error;
  });
  return strudelReadyPromise;
}

// Original, locally bundled WAV samples are rendered with native Web Audio.
// This avoids the undefined window.samples API and prevents a failed sample
// registration from muting other styles. Calm and Refreshed remain Strudel.
const nativeEngine={ctx:null,master:null,buffers:new Map(),timer:null,requestId:0,
                    step:0,startAt:0,active:new Set()};
const SAMPLE_KEYS={
  piano:['mg_piano_60.wav','mg_piano_72.wav','mg_piano_84.wav'],
  epiano:['mg_epiano_60.wav','mg_epiano_72.wav','mg_epiano_84.wav'],
  guitar:['mg_guitar_60.wav','mg_guitar_72.wav','mg_guitar_84.wav'],
  brass:['mg_brass_60.wav','mg_brass_72.wav','mg_brass_84.wav'],
  strings:['mg_strings_60.wav','mg_strings_72.wav','mg_strings_84.wav'],
  bd:['mg_bd.wav'],sd:['mg_sd.wav'],hh:['mg_hh.wav'],cp:['mg_cp.wav'],sh:['mg_sh.wav']
};
function noteNumber(note){
  const match=/^([a-g])([#b]?)(-?\d+)$/i.exec(note);
  if(!match)return null;
  const base={c:0,d:2,e:4,f:5,g:7,a:9,b:11}[match[1].toLowerCase()];
  return (Number(match[3])+1)*12+base+(match[2]==='#'?1:match[2]==='b'?-1:0);
}
function noteArray(token){
  if(!token||token==='~')return [];
  if(typeof token!=='string')return [];
  if(token.startsWith('['))return token.slice(1,-1).split(',').map(s=>s.trim()).filter(s=>s&&s!=='~');
  return [token];
}
async function prepareNativeSamples(full){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)throw new Error('This browser does not support Web Audio.');
  if(!nativeEngine.ctx || nativeEngine.ctx.state==='closed'){
    nativeEngine.ctx=new AC();
    nativeEngine.master=nativeEngine.ctx.createGain();
    nativeEngine.master.gain.value=.78;
    nativeEngine.master.connect(nativeEngine.ctx.destination);
  }
  // Resume from the user-initiated click, BEFORE awaiting any network request.
  await nativeEngine.ctx.resume();
  const keys=full?['piano','epiano','guitar','brass','strings','bd','sd','hh','cp','sh']:
                  ['piano','epiano','bd','sd','hh','cp','sh'];
  const files=keys.flatMap(key=>SAMPLE_KEYS[key]);
  await Promise.all(files.map(async filename=>{
    if(nativeEngine.buffers.has(filename))return;
    const url=new URL('./sounds/'+filename,document.baseURI);
    const response=await fetch(url);
    if(!response.ok)throw new Error('Missing local audio file: '+filename+' (HTTP '+response.status+')');
    const bytes=await response.arrayBuffer();
    let audio;
    try{audio=await nativeEngine.ctx.decodeAudioData(bytes);}
    catch(error){throw new Error('Cannot decode local audio file '+filename+': '+error.message);}
    nativeEngine.buffers.set(filename,audio);
  }));
}
function playNativeSample(instrument,pitch,time,gain,duration){
  const ctx=nativeEngine.ctx;
  if(!ctx || !nativeEngine.master)return;
  let filename,rate=1;
  if(['bd','sd','hh','cp','sh'].includes(instrument)){
    filename=SAMPLE_KEYS[instrument][0];
  } else {
    const midi=noteNumber(pitch);
    if(midi===null)return;
    const anchor=[60,72,84].reduce((a,b)=>Math.abs(b-midi)<Math.abs(a-midi)?b:a,60);
    filename=`mg_${instrument}_${anchor}.wav`;
    rate=Math.pow(2,(midi-anchor)/12);
  }
  const buffer=nativeEngine.buffers.get(filename);
  if(!buffer){console.warn('Missing decoded sound:',filename);return;}
  const source=ctx.createBufferSource(),level=ctx.createGain();
  source.buffer=buffer;source.playbackRate.value=rate;
  const safeTime=Math.max(time,ctx.currentTime+.004);
  const soundDuration=Math.min(duration||.23,buffer.duration/rate);
  const peak=Math.max(.0001,Math.min(.7,gain));
  level.gain.setValueAtTime(.0001,safeTime);
  level.gain.linearRampToValueAtTime(peak,safeTime+.006);
  level.gain.setValueAtTime(peak,safeTime+Math.min(.04,soundDuration*.4));
  level.gain.exponentialRampToValueAtTime(.0001,safeTime+Math.max(.03,soundDuration));
  source.connect(level);level.connect(nativeEngine.master);
  source.onended=()=>{nativeEngine.active.delete(source);source.disconnect();level.disconnect();};
  nativeEngine.active.add(source);
  source.start(safeTime);
  source.stop(safeTime+Math.max(.04,soundDuration)+.02);
}
function scheduleNativeStep(p,globalStep,time){
  const bar=Math.floor(globalStep/16)%32,step=globalStep%16;
  const parts=p.rawParts;
  const barSeconds=240/p.bpm;
  const sixteenth=barSeconds/16;
  function pitched(part,instr,vol,dur,res=16){
    if(res===8&&step%2)return;
    const token=parts[part]?.[bar]?.[res===8?step/2:step];
    for(const note of noteArray(token))playNativeSample(instr,note,time,vol,dur);
  }
  function drums(part,instr,vol){
    if(parts[part]?.[bar]?.[step]!=='~')playNativeSample(instr,null,time,vol,.15);
  }
  const human=(bar+step)%7===0?.88:1;
  pitched('lead','piano',.30*human,Math.min(.32,sixteenth*2.1));
  pitched('leadAccent','piano',.075,Math.min(.3,sixteenth*2.0));
  pitched('answer','piano',.12,Math.min(.32,sixteenth*1.8));
  pitched('rhythmKeys','epiano',.10,Math.min(.28,sixteenth*2.0),8);
  if(upliftedExtraLayers){
    pitched('guitar','guitar',.13,.27,8);
    pitched('sparkle','brass',.12,.22);
    if(step===0){
      for(const note of noteArray('['+(parts.strings?.[bar]||[]).filter(x=>x!=='~').join(',')+']')){
        playNativeSample('strings',note,time,.055,Math.min(.68,barSeconds));
      }
    }
  }
  drums('kick','bd',.40);
  drums('snare','sd',.28);
  drums('hat','hh',.105);
  drums('shaker','sh',.07);
  const fill=parts.fill?.[bar]?.[step];
  if(fill==='sd')playNativeSample('sd',null,time,.18,.15);
  else if(fill==='cp')playNativeSample('cp',null,time,.17,.15);
}
function cancelNativePlayback(){
  nativeEngine.requestId++;
  if(nativeEngine.timer!==null){clearInterval(nativeEngine.timer);nativeEngine.timer=null;}
  for(const source of Array.from(nativeEngine.active)){
    try{source.stop();}catch(error){}
  }
  nativeEngine.active.clear();
  nativeEngine.step=0;
}
async function startNativeUplifted(p){
  const request=++nativeEngine.requestId;
  state.loading=true;
  el('playback-state').textContent='Loading local audio';
  message('Loading bundled WAV samples for Uplifted…');
  // The native AudioContext must be created/resumed in this click path.
  await prepareNativeSamples(upliftedExtraLayers);
  if(request!==nativeEngine.requestId)return;
  state.loading=false;
  nativeEngine.step=0;
  nativeEngine.startAt=nativeEngine.ctx.currentTime+.075;
  const stepDuration=60/p.bpm/4;
  const tick=()=>{
    const now=nativeEngine.ctx.currentTime;
    while(nativeEngine.startAt+nativeEngine.step*stepDuration < now+.18){
      const time=nativeEngine.startAt+nativeEngine.step*stepDuration;
      scheduleNativeStep(p,nativeEngine.step%512,time);
      nativeEngine.step++;
    }
  };
  nativeEngine.timer=setInterval(tick,45);
  tick();
  startLight(p.bpm,p);lockControls(true);
  updateReadout(p,'Playing uplifted · local WAV audio');
  message('Uplifted is playing through the local Web Audio sampler: '+p.bpm+' BPM · 32 bars. No global Strudel sample-loader required.');
}
async function testTone(){
  if(state.loading)return;
  try{
    state.loading=true;
    el('playback-state').textContent='Preparing audio';
    message('Preparing Strudel audio…');
    await initializeMoodGlowAudio();
    state.loading=false;
    if(typeof window.hush==='function')window.hush();
    const result=window.note('c5 e5 g5 c6').s('triangle').gain(.18).cpm(30).play();
    if(result&&typeof result.catch==='function')result.catch(audioFailed);
    message('Test tone started: a repeating four-note triangle synth. Click Stop to end it.');
    startLight(120,null);lockControls(true);
    el('playback-state').textContent='Audio self-test';
  }catch(error){audioFailed(error);}
}
async function play(){
  if(state.loading)return;
  if(state.playing)stop();
  showPlayingTitle(true); // Fade title immediately on Generate & Play, including while samples initialize.
  const p=buildVariation();
  try{
    if(p.style==='uplifted'){
      await startNativeUplifted(p);
      return;
    }
    state.loading=true;
    el('playback-state').textContent='Preparing music';
    message('Preparing Strudel audio…');
    await initializeMoodGlowAudio();
    state.loading=false;
    if(typeof window.hush==='function')window.hush();
    const playResult=window.stack(...voicesForPattern(p)).cpm(p.bpm/4).play();
    if(playResult&&typeof playResult.catch==='function')playResult.catch(audioFailed);
    startLight(p.bpm,p);lockControls(true);
    updateReadout(p,'Playing '+state.goal);
    message(p.description+' · '+p.bpm+' BPM · 32 bars. Calm / Refreshed use their existing Strudel arrangements.');
  }catch(error){
    audioFailed(error);
  }
}
el('mood-options').addEventListener('click',event=>{
  const button=event.target.closest('[data-mood]');if(button)chooseOption('mood',button.dataset.mood);
});
el('goal-options').addEventListener('click',event=>{
  const button=event.target.closest('[data-goal]');if(button)chooseOption('goal',button.dataset.goal);
});
toneButton.addEventListener('click',testTone);
layersButton.addEventListener('click',()=>{
  if(state.playing)return;
  upliftedExtraLayers=!upliftedExtraLayers;
  layersButton.textContent=upliftedExtraLayers?'Extra layers: ON (test)':'Extra layers: OFF (safe)';
  layersButton.setAttribute('aria-pressed',String(upliftedExtraLayers));
  message(upliftedExtraLayers?'Extra LOCAL guitar / brass / strings enabled for diagnosis. Choose Uplifted and press Generate.':'Local core enabled: registered piano, electric keys and percussion WAVs.');
});
if(typeof window.addEventListener==='function'){
  window.addEventListener('unhandledrejection',event=>{
    if(state.playing){ audioFailed(event.reason||new Error('Unhandled browser audio promise rejection')); }
  });
}
playButton.addEventListener('click',play);regenerateButton.addEventListener('click',play);
stopButton.addEventListener('click',stop);
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  message('Reduced-motion preference detected. Animation can be stopped at any time.');
}
// Pre-initialize Strudel *without playing audio* so the first click works.
// Native Uplifted remains independent if the external Strudel CDN is unavailable.
void initializeMoodGlowAudio().catch(error => {
  console.warn('Strudel preparation warning (native Uplifted remains available):', error);
});
