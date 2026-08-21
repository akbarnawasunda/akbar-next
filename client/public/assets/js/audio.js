/* ===== AUDIO ENGINE v4 — shared reactive bus ===== */
let AC=null,master=null,analyser=null,freqData=null;
function actx(){
if(!AC){
AC=new (window.AudioContext||window.webkitAudioContext)();
master=AC.createGain();master.gain.value=1;
analyser=AC.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=0.82;
master.connect(analyser);analyser.connect(AC.destination);
}
if(AC.state==='suspended')AC.resume();
return AC;
}
const bands={bass:0,mid:0,high:0,level:0};
function getBands(){
if(!analyser)return bands;
if(!freqData)freqData=new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(freqData);
const avg=(a,b)=>{let s=0;for(let i=a;i<b;i++)s+=freqData[i];return s/((b-a)*255)};
const nb={bass:avg(1,9),mid:avg(9,42),high:avg(42,110),level:avg(1,110)};
bands.bass+=(nb.bass-bands.bass)*.35;bands.mid+=(nb.mid-bands.mid)*.3;bands.high+=(nb.high-bands.high)*.3;bands.level+=(nb.level-bands.level)*.3;
return bands;
}
const noiseBuf=ac=>{const b=ac.createBuffer(1,ac.sampleRate*0.3,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
const synth={
kick(when,vol){const ac=actx(),t=when||ac.currentTime,v=vol==null?1:vol,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g).connect(master);o.start(t);o.stop(t+.3)},
bass(when,vol){const ac=actx(),t=when||ac.currentTime,v=vol==null?1:vol,o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o.frequency.value=55;f.type='lowpass';f.frequency.setValueAtTime(700,t);f.frequency.exponentialRampToValueAtTime(120,t+.3);g.gain.setValueAtTime(v*.8,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(f).connect(g).connect(master);o.start(t);o.stop(t+.4)},
hat(when,vol){const ac=actx(),t=when||ac.currentTime,v=vol==null?1:vol,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(v*.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+.1)},
snare(when,vol){const ac=actx(),t=when||ac.currentTime,v=vol==null?1:vol,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),o=ac.createOscillator(),g2=ac.createGain();s.buffer=noiseBuf(ac);f.type='bandpass';f.frequency.value=1800;g.gain.setValueAtTime(v*.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);s.connect(f).connect(g).connect(master);o.type='triangle';o.frequency.value=200;g2.gain.setValueAtTime(v*.4,t);g2.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g2).connect(master);s.start(t);s.stop(t+.2);o.start(t);o.stop(t+.15)}
};
const buffers={};let samplesLoading=false;
const SAMPLE_FILES={kick:['assets/media/KICK.mp3','assets/media/kick.mp3'],bass:['assets/media/KENDANG.mp3','assets/media/kendang.mp3'],hat:['assets/media/HIHAT.mp3','assets/media/hihat.mp3'],snare:['assets/media/SNARE.mp3','assets/media/snare.mp3']};
function loadSamples(){
if(samplesLoading)return;samplesLoading=true;
const ac=actx();
Object.keys(SAMPLE_FILES).forEach(k=>{
const urls=SAMPLE_FILES[k];
(function tryNext(i){
if(i>=urls.length)return;
fetch(urls[i]).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(ab=>ac.decodeAudioData(ab)).then(buf=>{buffers[k]=buf}).catch(()=>tryNext(i+1));
})(0);
});
}
const live={};
function playVol(buf,vol,key){
const ac=actx(),s=ac.createBufferSource(),g=ac.createGain();
g.gain.value=vol;s.buffer=buf;s.connect(g).connect(master);
if(key){live[key]=s;s.onended=()=>{if(live[key]===s)delete live[key]}}
s.start();return s;
}
function stopSfx(k){if(live[k]){try{live[k].stop()}catch(e){}delete live[k]}}
function stopAllSfx(){Object.keys(live).forEach(stopSfx)}
function isPlaying(k){return !!live[k]}
function sfxRaw(k,vol){vol=vol==null?1:vol;if(buffers[k]){stopSfx(k);playVol(buffers[k],vol,k)}else synth[k](null,vol)}
function scheduleSfx(k,when,vol){
const ac=actx();vol=vol==null?1:vol;
if(buffers[k]){const s=ac.createBufferSource(),g=ac.createGain();g.gain.value=vol;s.buffer=buffers[k];s.connect(g).connect(master);s.start(when);return}
synth[k](when,vol);
}
const gsfx={
jump(){const ac=actx(),t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.setValueAtTime(280,t);o.frequency.exponentialRampToValueAtTime(620,t+.12);g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g).connect(master);o.start(t);o.stop(t+.17)},
djump(){const ac=actx(),t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(880,t+.12);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g).connect(master);o.start(t);o.stop(t+.16)},
land(){const ac=actx(),t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);f.type='lowpass';f.frequency.value=400;g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+.1)},
coin(){const ac=actx(),t=ac.currentTime;[988,1319].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;const st=t+i*0.07;g.gain.setValueAtTime(.18,st);g.gain.exponentialRampToValueAtTime(.001,st+.12);o.connect(g).connect(master);o.start(st);o.stop(st+.13)})},
whoosh(){const ac=actx(),t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);f.type='bandpass';f.frequency.setValueAtTime(600,t);f.frequency.exponentialRampToValueAtTime(3000,t+.15);g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+.17)},
hit(){const ac=actx(),t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),s=ac.createBufferSource(),g2=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(60,t+.2);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g).connect(master);o.start(t);o.stop(t+.23);s.buffer=noiseBuf(ac);g2.gain.setValueAtTime(.3,t);g2.gain.exponentialRampToValueAtTime(.001,t+.15);s.connect(g2).connect(master);s.start(t);s.stop(t+.16)},
over(){const ac=actx(),t=ac.currentTime;[392,330,262,196].forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;const st=t+i*0.14;g.gain.setValueAtTime(.18,st);g.gain.exponentialRampToValueAtTime(.001,st+.16);o.connect(g).connect(master);o.start(st);o.stop(st+.17)})},
drop(){const ac=actx(),t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);f.type='highpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(4000,t+.3);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+.33);const o=ac.createOscillator(),g2=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(220,t+.25);g2.gain.setValueAtTime(.15,t);g2.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g2).connect(master);o.start(t);o.stop(t+.31)}
};
const GA={};let gaLoading=false;let bgmNode=null;
const GA_FILES={boing:'assets/media/BOING.mp3',pop:'assets/media/BUBBLEPOP.mp3',crash:'assets/media/CRASH-CARTOON.mp3',over:'assets/media/GAME-OVER.mp3',swoosh:'assets/media/RISER-SWOOSH.mp3',thud:'assets/media/THUD-2.mp3',bgm:'assets/media/BACKSOUNDING.mp3'};
function loadGameAudio(){
if(gaLoading)return;gaLoading=true;
const ac=actx();
Object.keys(GA_FILES).forEach(k=>{
fetch(GA_FILES[k]).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(ab=>ac.decodeAudioData(ab)).then(buf=>{GA[k]=buf;if(k==='bgm'&&typeof syncBGM==='function')syncBGM()}).catch(()=>{});
});
}
function playGA(k,vol,loop){
if(!GA[k])return null;
const ac=actx(),s=ac.createBufferSource(),g=ac.createGain();
g.gain.value=vol==null?1:vol;s.buffer=GA[k];s.loop=!!loop;
s.connect(g).connect(master);s.start();return s;
}
function bgmStopGA(){if(bgmNode){try{bgmNode.stop()}catch(e){}bgmNode=null}}
(function(){
const orig={};for(const k in gsfx)orig[k]=gsfx[k];
const map={jump:'boing',djump:'boing',land:'thud',coin:'pop',whoosh:'swoosh',hit:'crash',over:'over',drop:'swoosh'};
Object.keys(map).forEach(k=>{gsfx[k]=function(vol){if(GA[map[k]]){playGA(map[k],vol==null?1:vol);return}if(orig[k])orig[k]()}});
})();
let sfx=function(k,vol){if(GA.bgm&&(vol==null?1:vol)<0.5)return;sfxRaw(k,vol)};
window.AUDIO={getBands,ctx:actx,schedule:scheduleSfx};
loadGameAudio();
