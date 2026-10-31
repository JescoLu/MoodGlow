/* MoodGlow V13 — immersive music-accent-responsive light renderer.
 * Desired Feeling sets the palette; Current Mood selects motion geometry.
 * Visual accents use note/drum ONSET data extracted from the generated 32-bar patterns.
 * This is not microphone input, audio-energy sensing or live FFT.
 * No changes to the V11.4 music/sampling algorithms.
 */
(() => {
  'use strict';
  const canvas = document.getElementById('glow-canvas');
  const host = document.getElementById('glow');
  const label = document.getElementById('visual-mood-label');
  if (!canvas || !host) return;
  const ctx = canvas.getContext('2d', { alpha:true });
  if (!ctx) return;

  const PALETTES = {
    uplifted: [[255,207,154],[240,116,164],[185,139,255],[255,162,112]],
    calm: [[206,219,255],[117,152,245],[185,152,253],[121,196,250]],
    refreshed: [[212,239,179],[91,220,173],[105,190,249],[147,240,213]]
  };
  const LABELS = {
    sad:'Sad · Diffuse drift',
    stressed:'Stressed · Flowing ribbons',
    tired:'Tired · Slow rising light',
    okay:'Okay · Balanced liquid orbit'
  };
  let currentMood = document.body.dataset.mood || 'sad';
  let outgoingMood = currentMood;
  let transitionAt = -10000;
  let currentGoal = document.body.dataset.theme || 'uplifted';
  let palette = PALETTES[currentGoal].map(x => x.slice());
  let width = 1, height = 1, dpr = 1, lastDraw = 0;
  let playing = false, bpm = 110, beatStart = performance.now();
  let accentTrack = null, lightEnergy = 0, previousFrame = performance.now();
  // Continuous motion clock: changing Desired Feeling alters speed, not position.
  let motionClock = performance.now()/1000;
  let motionSpeed = 1;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const color = (rgb,a) => `rgba(${rgb.map(x=>Math.round(x)).join(',')},${Math.max(0,Math.min(1,a))})`;
  const wave = (v) => Math.sin(v);

  function resize(){
    const rect = host.getBoundingClientRect();
    width = Math.max(1,Math.floor(rect.width));
    height = Math.max(1,Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio||1,1.25);
    canvas.width = Math.max(1,Math.round(width*dpr));
    canvas.height = Math.max(1,Math.round(height*dpr));
  }

  function drawHaze(x,y,rx,ry,rgb,alpha){
    if(alpha < .002)return;
    ctx.save();
    ctx.translate(x,y);ctx.scale(rx,ry);
    const grad = ctx.createRadialGradient(0,0,.01,0,0,1);
    grad.addColorStop(0,color(rgb,.22*alpha));
    grad.addColorStop(.32,color(rgb,.15*alpha));
    grad.addColorStop(.75,color(rgb,.042*alpha));
    grad.addColorStop(1,color(rgb,0));
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawFluidBlob(x,y,rx,ry,rgb,t,phase,opacity,rotation=0,distortion=.2){
    if(opacity <= .005)return;
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
    ctx.scale(rx,ry);
    ctx.filter=`blur(${Math.min(28,Math.max(9,17*300/Math.max(width,450)))}px)`; // canvas filter scales in physical pixels
    const g=ctx.createRadialGradient(-.08,-.12,.015,0,0,1.14);
    g.addColorStop(0,color(rgb,.87*opacity));
    g.addColorStop(.24,color(rgb,.69*opacity));
    g.addColorStop(.53,color(rgb,.41*opacity));
    g.addColorStop(.84,color(rgb,.16*opacity));
    g.addColorStop(1,color(rgb,0));
    ctx.fillStyle=g;
    const N=72;
    ctx.beginPath();
    for(let i=0;i<=N;i++){
      const a=i/N*Math.PI*2;
      const r=1+distortion*(.47*wave(a*3+t*.38+phase)+.37*wave(a*5-t*.26+phase*2)+.16*wave(a*8+t*.18));
      const px=Math.cos(a)*r,py=Math.sin(a)*r;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fill();ctx.restore();
  }

  // Four clear visual signatures, independent from the soundtrack choice.
  // Rhythm accents remain tied to the actual music BPM. Motion flow speed is separate.
  const GOAL_MOTION_SPEED = {uplifted:1.20, calm:.72, refreshed:1.0};
  const smoothstep = (a,b,x) => {
    const p=Math.max(0,Math.min(1,(x-a)/(b-a)));
    return p*p*(3-2*p);
  };
  // The 3 desired-feeling palettes remain identical to V13.1.
  const MOTION_PROFILES = {
    sad:      {beat:.79, speed:1},    // soft drifting light with moderate musical response
    stressed: {beat:.94, speed:1.50}, // directional ribbons; idle speed also reduced globally
    tired:    {beat:.30, speed:.45}, // quiet ascending pillars with smooth fade at edges
    okay:     {beat:.64, speed:.85}  // smoothly orbiting, blended forms
  };

  function drawRibbon(t,index,alpha,colors){
    const unit=Math.min(height/360,1.8);
    const yy=(.18 + index*.115)*height;
    const wiggle=t*.64+index*1.28;
    const x0=-.24*width, x1=1.24*width;
    const p1=yy+85*unit*wave(wiggle);
    const p2=yy+125*unit*wave(wiggle*.83+1.1);
    const gradient=ctx.createLinearGradient(x0,yy,x1,yy);
    gradient.addColorStop(0,color(colors[index%4],0));
    gradient.addColorStop(.22,color(colors[index%4],.54*alpha));
    gradient.addColorStop(.50,color(colors[(index+1)%4],.88*alpha));
    gradient.addColorStop(.79,color(colors[(index+2)%4],.53*alpha));
    gradient.addColorStop(1,color(colors[(index+2)%4],0));
    ctx.save();
    // Alternating angled ribbons: an unmistakable cross-current silhouette.
    ctx.translate(width*.5,height*.5);
    ctx.rotate(index%2===0?-.32:.26);
    ctx.translate(-width*.5,-height*.5);
    ctx.lineCap='round';ctx.strokeStyle=gradient;
    ctx.filter='blur(16px)';ctx.lineWidth=(42+(index%2)*18)*unit;
    ctx.beginPath();ctx.moveTo(x0, yy-78*unit+index*12*unit);
    ctx.bezierCurveTo(width*.26,p1+58*unit,width*.41,p2-46*unit,width*.60,yy+16*unit*wave(wiggle));
    ctx.bezierCurveTo(width*.77,p2+42*unit,width*.94,p1-52*unit,x1,yy+49*unit);
    ctx.stroke();
    ctx.filter='blur(3px)';ctx.lineWidth=(4+(index%2)*2)*unit;ctx.globalAlpha=.35*alpha;
    ctx.stroke();ctx.restore();
  }

  function drawMode(mood,t,pulse,a,colors){
    if(a<.003)return;
    const w=width,h=height;
    const profile=MOTION_PROFILES[mood]||MOTION_PROFILES.okay;
    const modulation=reduceMotion.matches?0:pulse*(mood==='sad'?.79:profile.beat);
    const response=currentGoal==='calm'?.115:currentGoal==='refreshed'?.21:.235;
    const expansion=1+modulation*response;
    const motionTime=t*profile.speed;
    ctx.save();
    ctx.translate(w/2,h/2);ctx.scale(expansion,expansion);ctx.translate(-w/2,-h/2);
    a*=.94+.16*modulation;
    ctx.globalCompositeOperation='screen';
    if(mood==='sad'){
      // Many translucent, disconnected islands: slow drift and gentle diffusion.
      drawHaze(w*.48,h*.62,w*.47,h*.65,colors[1],.40*a);
      for(let i=0;i<6;i++){
        const col=colors[i%4];
        const x=w*(.18+i*.128)+Math.sin(motionTime*.19+i*2.13)*w*(.032+modulation*.008);
        const y=h*(.51+.15*Math.sin(i*2.9))+Math.cos(motionTime*.19+i*1.7)*h*.08;
        const rx=w*(.165+(i%3)*.017);
        const ry=h*(.285+(i%2)*.04);
        drawFluidBlob(x,y,rx,ry,col,motionTime*.53,i,.81*a,.12*Math.sin(motionTime*.11+i),.20+modulation*.08);
      }
      drawHaze(w*.52,h*.6,w*.28,h*.30,colors[2],.36*a);
    } else if(mood==='stressed'){
      // Seven diagonal, crossing streams with a stronger musical response.
      drawHaze(w*.52,h*.52,w*.44,h*.57,colors[1],.26*a);
      for(let i=0;i<7;i++)drawRibbon(motionTime,i,(.90+.17*modulation)*a,colors);
      for(let i=0;i<2;i++){
        const x=w*(.34+.33*i)+w*.03*Math.sin(motionTime*.43+i*2);
        const y=h*(.45+.09*Math.sin(i*3+motionTime*.40));
        drawFluidBlob(x,y,w*.11,h*.23,colors[(i+2)%4],motionTime,i,.28*a,.42,.27+modulation*.13);
      }
    } else if(mood==='tired'){
      // Tall translucent light columns rise at different phases and fade out.
      drawHaze(w*.50,h*.61,w*.30,h*.70,colors[1],.31*a);
      for(let i=0;i<6;i++){
        // A lane wraps below/above the visible scene; it is COMPLETELY transparent
        // at either reset boundary. This removes the hard jump from top to bottom.
        const rise=reduceMotion.matches?.42:((motionTime*.067+i*.19)%1);
        const fade=reduceMotion.matches?.85:
          smoothstep(.04,.24,rise)*(1-smoothstep(.73,.93,rise));
        const x=w*(.25+i*.10)+Math.sin(motionTime*.19+i*1.7)*w*.012;
        const y=h*(1.20-rise*1.48);
        drawFluidBlob(x,y,w*(.07+(i%2)*.012),h*(.38+(i%3)*.03),colors[i%4],motionTime*.25,i,.95*a*fade,-.05*Math.sin(motionTime*.16+i),.12+modulation*.06);
      }
      drawHaze(w*.51,h*.68,w*.16,h*.50,colors[0],.22*a);
    } else {
      // A compact, merged cluster of larger shapes orbiting a shared center.
      drawHaze(w*.50,h*.51,w*.42,h*.58,colors[2],.49*a);
      for(let i=0;i<4;i++){
        const ang=i*Math.PI/2+motionTime*.22;
        const x=w*.5+Math.cos(ang)*w*.18;
        const y=h*.51+Math.sin(ang)*h*.15;
        drawFluidBlob(x,y,w*.23,h*.35,colors[i%4],motionTime*.73,i,.92*a,ang*.24,.26+modulation*.11);
      }
      drawFluidBlob(w*.50,h*.52,w*.25,h*.38,colors[0],motionTime*.29,2,.60*a,0,.18);
    }
    ctx.restore();
  }

  function frame(now){
    requestAnimationFrame(frame);
    const minInterval=reduceMotion.matches?320:1000/28;
    if(now-lastDraw<minInterval)return;
    lastDraw=now;
    if(canvas.width===0||canvas.height===0)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    const target=PALETTES[currentGoal]||PALETTES.uplifted;
    for(let i=0;i<4;i++)for(let j=0;j<3;j++)palette[i][j]+=(target[i][j]-palette[i][j])*.085;
    const frameSeconds=Math.min(.2,Math.max(0,(now-previousFrame)/1000));
    previousFrame=now;
    // Music target changes flow rate: Uplifted faster, Calm slower, Refreshed medium.
    // Stressed also slows down at idle. Blend speed to avoid visual phase jumps.
    const desiredSpeed=(GOAL_MOTION_SPEED[currentGoal]||1)*(currentMood==='stressed'&&!playing?.52:1);
    motionSpeed+=(desiredSpeed-motionSpeed)*(1-Math.exp(-frameSeconds/.40));
    if(!reduceMotion.matches)motionClock+=frameSeconds*motionSpeed;
    const t=reduceMotion.matches?0:motionClock;
    const beat=playing?Math.max(0,(now-beatStart)/60000*bpm):0;
    let accentTarget=0;
    if(playing && !reduceMotion.matches){
      const sixteen=beat*4;
      const stepMs=60000/(bpm*4);
      // Find latest weighted onsets, smoothing across each incoming drum / piano accent.
      for(let back=0;back<13;back++){
        const index=Math.floor(sixteen)-back;
        if(index<0)break;
        const weight=accentTrack?accentTrack[index%accentTrack.length]:(index%4===0?.62:.10);
        const elapsedMs=(sixteen-index)*stepMs;
        accentTarget=Math.max(accentTarget,weight*Math.exp(-elapsedMs/255));
      }
    }
    // Smooth the response: no strobing or sudden white flashes.
    const smoothing=accentTarget>lightEnergy?1-Math.exp(-frameSeconds/0.075):1-Math.exp(-frameSeconds/.24);
    lightEnergy+=((accentTarget||0)-lightEnergy)*smoothing;
    const pulse=reduceMotion.matches?0:lightEnergy*.78;
    host.style.setProperty('--light-brightness',String(1.11+pulse*.18));
    // Mix neighboring colors within the selected desired-feeling palette at each
    // musical accent; this changes hue/brightness without changing the mood theme.
    const colorStrength=(currentGoal==='calm'?.075:currentGoal==='refreshed'?.18:.21)*pulse;
    const lightColors=palette.map((rgb,i)=>rgb.map((channel,j)=>{
      const neighbor=palette[(i+1)%4][j];
      return Math.min(255,channel*(1-colorStrength)+neighbor*colorStrength+13*pulse);
    }));
    ctx.save();
    ctx.globalCompositeOperation='screen';
    // A gentle atmospheric bed common to all moods; without flat circular scaling.
    drawHaze(width*.29,height*.53,width*.52,height*.79,lightColors[0],.27+pulse*.08);
    drawHaze(width*.73,height*.51,width*.53,height*.80,lightColors[2],.30+pulse*.09);
    const f=reduceMotion.matches?1:Math.min(1,(now-transitionAt)/700);
    if(f<1){drawMode(outgoingMood,t,pulse,1-f,lightColors);}
    drawMode(currentMood,t,pulse,f<1?f:1,lightColors);
    // Soft beat interaction: gentle overall illumination, never a strobing flash.
    if(playing && pulse>.01){
      drawHaze(width*.50,height*.52,width*.49,height*.65,lightColors[0],pulse*.34);
      drawHaze(width*.45,height*.47,width*.34,height*.48,lightColors[2],pulse*.18);
    }
    ctx.restore();
  }

  function setMood(next){
    if(!LABELS[next]||currentMood===next)return;
    outgoingMood=currentMood;currentMood=next;transitionAt=performance.now();
    if(label)label.textContent=LABELS[next];
  }
  function setTheme(next){if(PALETTES[next])currentGoal=next;}
  function setPlayback(on,tempo,accents=null){
    playing=Boolean(on);
    if(Number.isFinite(tempo)&&tempo>0)bpm=tempo;
    accentTrack=Array.isArray(accents)&&accents.length===512?accents.slice():null;
    lightEnergy=0;
    beatStart=performance.now();
  }

  window.moodglowVisual={setMood,setTheme,setPlayback,getState:()=>({mood:currentMood,goal:currentGoal,playing,bpm,energy:lightEnergy,motionSpeed,accentCount:accentTrack?.length||0,reducedMotion:reduceMotion.matches})};
  if(label)label.textContent=LABELS[currentMood];
  resize();
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize',resize,{passive:true});
  host.classList.add('visual-enhanced');
  requestAnimationFrame(frame);

  const dialog=document.getElementById('about-dialog');
  function openInfo(){if(dialog && !dialog.open)dialog.showModal();}
  function closeInfo(){if(dialog?.open)dialog.close();}
  for(const id of ['about-open','about-footer']){
    document.getElementById(id)?.addEventListener('click',openInfo);
  }
  for(const id of ['about-close','about-done']){
    document.getElementById(id)?.addEventListener('click',closeInfo);
  }
  dialog?.addEventListener('click',event=>{
    if(event.target===dialog)closeInfo();
  });
})();
