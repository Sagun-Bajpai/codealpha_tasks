const TRACKS=[
  {title:"Neon Pulse",     artist:"Synthwave Dreams",genre:"Synthwave", bpm:120,hue:72, dur:60,type:"saw",
   notes:["C4","E4","G4","B4","C5","B4","G4","E4"],bass:["C2","C2","G2","G2"],
   chords:[["C4","E4","G4"],["A3","C4","E4"],["F3","A3","C4"],["G3","B3","D4"]]},
  {title:"Midnight Drive",  artist:"Circuit Breaker", genre:"Electronic",bpm:130,hue:200,dur:60,type:"fm",
   notes:["A4","C5","E5","G5","A5","G5","E5","C5"],bass:["A2","A2","E2","F2"],
   chords:[["A3","C4","E4"],["F3","A3","C4"],["C3","E3","G3"],["G3","B3","D4"]]},
  {title:"Solar Drift",     artist:"Orbital Drift",  genre:"Ambient",   bpm:80, hue:30, dur:60,type:"pad",
   notes:["D4","F4","A4","C5","D5","C5","A4","F4"],bass:["D2","D2","A2","G2"],
   chords:[["D3","F3","A3"],["G3","B3","D4"],["C3","E3","G3"],["A3","C4","E4"]]},
  {title:"Acid Rain",       artist:"Neon Cascade",   genre:"Techno",    bpm:148,hue:280,dur:60,type:"saw",
   notes:["G4","Bb4","D5","F5","G5","F5","D5","Bb4"],bass:["G2","G2","D2","F2"],
   chords:[["G3","Bb3","D4"],["Eb3","G3","Bb3"],["Bb2","D3","F3"],["F3","A3","C4"]]},
  {title:"Chrome Horizon",  artist:"Synthwave Dreams",genre:"Synthwave",bpm:118,hue:160,dur:60,type:"fm",
   notes:["E4","G4","B4","D5","E5","D5","B4","G4"],bass:["E2","E2","B2","A2"],
   chords:[["E3","G3","B3"],["C3","E3","G3"],["A2","C3","E3"],["B2","D3","F#3"]]},
  {title:"Phantom Signal",  artist:"Voidwalker",     genre:"Dark Synth",bpm:128,hue:340,dur:60,type:"pad",
   notes:["F4","Ab4","C5","Eb5","F5","Eb5","C5","Ab4"],bass:["F2","F2","C2","Bb2"],
   chords:[["F3","Ab3","C4"],["Db3","F3","Ab3"],["Ab2","C3","Eb3"],["C3","Eb3","G3"]]},
];

let idx=0,playing=false,shuf=false,rep=false,elapsed=0,timerRef=null,vizPhase=0,started=false;
let synth=null,bass=null,pad=null,drum=null,sq=null,bsq=null,psq=null,dsq=null,mvol=null;

const artC=document.getElementById('artC'),vizC=document.getElementById('vizC');
const vring=document.getElementById('vring');
const stitleEl=document.getElementById('stitle'),sartistEl=document.getElementById('sartist');
const sgenreEl=document.getElementById('sgenre'),sbpmEl=document.getElementById('sbpm');
const statEl=document.getElementById('stat'),curEl=document.getElementById('cur'),totEl=document.getElementById('tot');
const pfill=document.getElementById('pfill'),ptrack=document.getElementById('ptrack');
const playBtn=document.getElementById('playBtn'),vsl=document.getElementById('vsl'),vpct=document.getElementById('vpct');
const plist=document.getElementById('plist');
const PLAY =`<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
const PAUSE=`<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

function drawArt(c,hue,mini=false){
  const ctx=c.getContext('2d'),w=c.width,h=c.height;
  ctx.clearRect(0,0,w,h);
  const bg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.75);
  bg.addColorStop(0,`hsl(${hue},70%,${mini?15:12}%)`);
  bg.addColorStop(1,`hsl(${hue+40},50%,4%)`);
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  if(!mini){
    for(let r=16;r<w*.62;r+=20){
      ctx.beginPath();ctx.arc(w/2,h/2,r,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${hue},70%,60%,.07)`;ctx.lineWidth=1;ctx.stroke();
    }
    const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.38);
    g.addColorStop(0,`hsla(${hue},90%,75%,.44)`);g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
  ctx.beginPath();ctx.arc(w/2,h/2,mini?w*.26:w*.33,0,Math.PI*2);
  ctx.strokeStyle=`hsla(${hue},70%,65%,.35)`;ctx.lineWidth=mini?1:1.5;ctx.stroke();
  ctx.beginPath();ctx.arc(w/2,h/2,mini?3:7,0,Math.PI*2);
  ctx.fillStyle=`hsl(${hue},80%,70%)`;ctx.fill();
}

function drawViz(){
  const ctx=vizC.getContext('2d'),w=vizC.width,h=vizC.height;
  ctx.clearRect(0,0,w,h);
  const hue=TRACKS[idx].hue,bars=68,bw=w/bars;
  for(let i=0;i<bars;i++){
    const t=(i/bars)*Math.PI*4+vizPhase;
    const n=Math.sin(t)*.5+Math.sin(t*2.7+1)*.3+Math.sin(t*.6-.4)*.2;
    const bh=(0.08+Math.abs(n)*.92)*h*(playing?1:.15);
    ctx.fillStyle=`hsla(${hue},80%,65%,${.28+Math.abs(n)*.7})`;
    ctx.beginPath();ctx.roundRect(i*bw+.5,h/2-bh/2,bw-1,bh,2);ctx.fill();
  }
  if(playing)vizPhase+=0.09;
  requestAnimationFrame(drawViz);
}

function fmt(s){return`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;}

function stopAll(){
  [sq,bsq,psq,dsq].forEach(s=>{if(s){try{s.stop();s.dispose();}catch(e){}}});
  sq=bsq=psq=dsq=null;
  [synth,bass,pad,drum].forEach(s=>{if(s){try{s.dispose();}catch(e){}}});
  synth=bass=pad=drum=null;
  try{Tone.getTransport().stop();Tone.getTransport().cancel();}catch(e){}
}

async function startMusic(t){
  await Tone.start();stopAll();
  Tone.getTransport().bpm.value=t.bpm;
  if(!mvol)mvol=new Tone.Volume(-6).toDestination();
  const r1=new Tone.Reverb(1.5).connect(mvol);
  const r2=new Tone.Reverb(3).connect(mvol);
  if(t.type==='fm'){
    synth=new Tone.FMSynth({harmonicity:3,modulationIndex:10,envelope:{attack:.05,decay:.2,sustain:.4,release:.8}}).connect(r1);
  }else if(t.type==='pad'){
    synth=new Tone.PolySynth(Tone.Synth,{oscillator:{type:'sine'},envelope:{attack:.4,decay:.5,sustain:.7,release:2}}).connect(r2);
  }else{
    synth=new Tone.Synth({oscillator:{type:'sawtooth'},envelope:{attack:.02,decay:.1,sustain:.5,release:.5}}).connect(new Tone.Filter(1800,'lowpass').connect(r1));
  }
  bass=new Tone.Synth({oscillator:{type:'sine'},envelope:{attack:.05,decay:.2,sustain:.6,release:.4}}).connect(new Tone.Volume(-5).connect(mvol));
  pad=new Tone.PolySynth(Tone.Synth,{oscillator:{type:'triangle'},envelope:{attack:.5,decay:.3,sustain:.8,release:2}}).connect(new Tone.Reverb(4).connect(new Tone.Volume(-9).connect(mvol)));
  drum=new Tone.MembraneSynth({pitchDecay:.05,octaves:6,envelope:{attack:.001,decay:.18,sustain:0,release:.18}}).connect(new Tone.Volume(-5).connect(mvol));
  const nl=t.type==='pad'?'2n':'8n';
  sq =new Tone.Sequence((time,note) =>synth.triggerAttackRelease(note,nl,time),t.notes,nl);
  bsq=new Tone.Sequence((time,note) =>bass.triggerAttackRelease(note,'4n',time),t.bass,'1m');
  psq=new Tone.Sequence((time,chord)=>pad.triggerAttackRelease(chord,'1m',time),t.chords,'1m');
  const kp=t.bpm>130?[1,0,1,0,1,0,1,0]:[1,0,0,0,1,0,0,0];
  dsq=new Tone.Sequence((time,h)=>{if(h)drum.triggerAttackRelease('C1','8n',time);},kp,'8n');
  sq.start(0);bsq.start(0);psq.start(0);dsq.start(0);
  Tone.getTransport().start();
}

function load(i,auto=false){
  idx=i;elapsed=0;
  const t=TRACKS[i];
  stitleEl.textContent=t.title;sartistEl.textContent=t.artist;
  sgenreEl.textContent=t.genre;sbpmEl.textContent=t.bpm+' BPM';
  totEl.textContent=fmt(t.dur);curEl.textContent='0:00';pfill.style.width='0%';
  drawArt(artC,t.hue);updatePL();stopTimer();
  if(auto)doPlay();
  else{playing=false;playBtn.innerHTML=PLAY;vring.classList.remove('on');stopAll();started=false;statEl.textContent='▶ Click play to start';updatePL();}
}

async function doPlay(){
  statEl.textContent='♪ Playing...';
  await startMusic(TRACKS[idx]);
  playing=true;playBtn.innerHTML=PAUSE;vring.classList.add('on');startTimer();updatePL();
}
function doPause(){Tone.getTransport().pause();playing=false;playBtn.innerHTML=PLAY;vring.classList.remove('on');stopTimer();statEl.textContent='⏸ Paused';updatePL();}
async function doResume(){await Tone.start();Tone.getTransport().start();playing=true;playBtn.innerHTML=PAUSE;vring.classList.add('on');startTimer();statEl.textContent='♪ Playing...';updatePL();}
async function togglePlay(){if(!started){started=true;await doPlay();return;}playing?doPause():doResume();}

function startTimer(){
  stopTimer();
  timerRef=setInterval(()=>{
    elapsed++;curEl.textContent=fmt(elapsed);
    pfill.style.width=(elapsed/TRACKS[idx].dur*100)+'%';
    if(elapsed>=TRACKS[idx].dur){stopTimer();onEnd();}
  },1000);
}
function stopTimer(){clearInterval(timerRef);timerRef=null;}
function onEnd(){
  if(rep){elapsed=0;Tone.getTransport().stop();Tone.getTransport().start();startTimer();return;}
  if(document.getElementById('autoTog').checked)nextT();
  else{playing=false;playBtn.innerHTML=PLAY;vring.classList.remove('on');stopAll();updatePL();started=false;statEl.textContent='▶ Click play to start';}
}
function nextT(){
  let n=shuf?Math.floor(Math.random()*TRACKS.length):(idx+1)%TRACKS.length;
  if(shuf&&TRACKS.length>1)while(n===idx)n=Math.floor(Math.random()*TRACKS.length);
  started=false;load(n,true);
}
function prevT(){
  if(elapsed>3){elapsed=0;Tone.getTransport().stop();Tone.getTransport().start();return;}
  started=false;load((idx-1+TRACKS.length)%TRACKS.length,playing);
}

ptrack.addEventListener('click',e=>{
  const r=ptrack.getBoundingClientRect();
  elapsed=Math.floor(((e.clientX-r.left)/r.width)*TRACKS[idx].dur);
  pfill.style.width=(elapsed/TRACKS[idx].dur*100)+'%';curEl.textContent=fmt(elapsed);
});
vsl.addEventListener('input',()=>{
  const v=vsl.value;vpct.textContent=v+'%';
  if(mvol)mvol.volume.value=Tone.gainToDb(v/100);
  vsl.style.background=`linear-gradient(to right,var(--acc) 0%,var(--acc) ${v}%,var(--sur) ${v}%,var(--sur) 100%)`;
});
vsl.style.background=`linear-gradient(to right,var(--acc) 0%,var(--acc) 75%,var(--sur) 75%,var(--sur) 100%)`;
playBtn.addEventListener('click',togglePlay);
document.getElementById('nextBtn').addEventListener('click',nextT);
document.getElementById('prevBtn').addEventListener('click',prevT);
document.getElementById('shufBtn').addEventListener('click',()=>{shuf=!shuf;document.getElementById('shufBtn').classList.toggle('on',shuf);});
document.getElementById('repBtn').addEventListener('click',()=>{rep=!rep;document.getElementById('repBtn').classList.toggle('on',rep);});
document.addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();togglePlay();}
  if(e.code==='ArrowRight')nextT();
  if(e.code==='ArrowLeft')prevT();
  if(e.code==='ArrowUp'){vsl.value=Math.min(100,+vsl.value+10);vsl.dispatchEvent(new Event('input'));}
  if(e.code==='ArrowDown'){vsl.value=Math.max(0,+vsl.value-10);vsl.dispatchEvent(new Event('input'));}
});

function buildPL(){
  plist.innerHTML='';
  document.getElementById('pct').textContent=TRACKS.length+' tracks';
  TRACKS.forEach((t,i)=>{
    const item=document.createElement('div');item.className='ti';
    const mc=document.createElement('canvas');mc.width=84;mc.height=84;drawArt(mc,t.hue,true);
    item.innerHTML=`
      <div class="tnum">${i+1}</div>
      <div class="ebars"><div class="ebar"></div><div class="ebar"></div><div class="ebar"></div></div>
      <div class="tthumb"></div>
      <div class="tmeta"><div class="tname">${t.title}</div><div class="tartist">${t.artist}</div></div>
      <div class="tdur">${fmt(t.dur)}</div>`;
    item.querySelector('.tthumb').appendChild(mc);
    item.addEventListener('click',()=>{started=false;load(i,true);});
    plist.appendChild(item);
  });
}
function updatePL(){
  document.querySelectorAll('.ti').forEach((item,i)=>{
    item.classList.toggle('active',i===idx);
    item.classList.toggle('playing',i===idx&&playing);
  });
  const a=plist.querySelector('.ti.active');
  if(a)a.scrollIntoView({behavior:'smooth',block:'nearest'});
}
buildPL();load(0);drawViz();