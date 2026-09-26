/* ===== BGM SYNC JEDAG RUN ===== */
const _ov=document.getElementById('grOverlay');
const _mb=document.getElementById('grMute');
function syncBGM(){
const want=!!(GA.bgm&&_ov&&_mb&&_mb.dataset.muted!=='1'&&_ov.classList.contains('game-hide'));
if(want&&!bgmNode){bgmNode=playGA('bgm',0.7,true)}
if(!want){bgmStopGA()}
}
if(_ov)new MutationObserver(syncBGM).observe(_ov,{attributes:true,attributeFilter:['class']});
if(_mb)new MutationObserver(syncBGM).observe(_mb,{attributes:true,attributeFilter:['data-muted']});
/* ===== GAME: JEDAG RUN ===== */
(function(){
const cv=document.getElementById('jedagRun');if(!cv)return;
const ctx=cv.getContext('2d');const W=cv.width,H=cv.height;
const overlay=document.getElementById('grOverlay');
const ovTitle=overlay.querySelector('h3');
const ovDesc=overlay.querySelector('.game-desc');
const ovBlink=overlay.querySelector('.blink');
const shareBtn=document.getElementById('grShare');
const muteBtn=document.getElementById('grMute');
const scoreEl=document.getElementById('grScore');
const bestEl=document.getElementById('grBest');
const livesEl=document.getElementById('grLives');
const comboEl=document.getElementById('grCombo');
const GROUND=H-36;
const ACCENTS=[['#ff00e4','#ffd319'],['#00ffd5','#ff00e4'],['#ffd319','#00ffd5'],['#7b2ff7','#ff9a1f'],['#ff9a1f','#00ffd5']];
const LIFE='<svg class="life" viewBox="0 0 24 24"><path d="M4 14a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="2.5" y="13" width="4.5" height="7" rx="2" fill="currentColor"/><rect x="17" y="13" width="4.5" height="7" rx="2" fill="currentColor"/></svg>';
const DEAD='<svg class="life" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#ff3355" stroke-width="2.6" stroke-linecap="round"/></svg>';
const SND_ON='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#00ffd5"/><path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="#00ffd5" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const SND_OFF='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#a89ec4"/><path d="M16 9l5 6M21 9l-5 6" stroke="#ff3355" stroke-width="2" stroke-linecap="round"/></svg>';
let running=false,frame=0,dist=0,bonus=0,best=0,speed=4,level=0,prevLevel=0;
let lives=3,nextLifeAt=500,combo=0,bestComboRun=1,finalScore=0;
let shake=0,hitstop=0,dropTimer=0,bgmOn=true,step=0;
let obstacles=[],notes=[],parts=[],pops=[];
try{best=parseInt(localStorage.getItem('jedagrun_best')||'0')||0}catch(e){}
bestEl.textContent='BEST '+best;
const player={x:70,y:GROUND,vy:0,w:26,h:34,onGround:true,jumps:0,inv:0,sy:1};
const getScore=()=>Math.floor(dist*0.05)+bonus;
const mult=()=>combo>=10?4:combo>=6?3:combo>=3?2:1;
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function popup(txt,x,y,col){pops.push({txt,x,y,life:55,col})}
function burst(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=1+Math.random()*3;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:30+Math.random()*20,col,sz:2+Math.random()*3})}}
function updateHud(){
scoreEl.textContent='SCORE '+getScore();
livesEl.innerHTML=lives>0?LIFE.repeat(lives):DEAD;
comboEl.textContent=mult()>1?('COMBO x'+mult()):'';
}
function reset(){
running=true;frame=0;dist=0;bonus=0;speed=4;level=0;prevLevel=0;
lives=3;nextLifeAt=500;combo=0;bestComboRun=1;step=0;
obstacles=[];notes=[];parts=[];pops=[];trail=[];
player.y=GROUND;player.vy=0;player.onGround=true;player.jumps=0;player.inv=0;player.sy=1;
overlay.classList.add('game-hide');
updateHud();
}
function gameOver(){
running=false;finalScore=getScore();
if(finalScore>best){best=finalScore;try{localStorage.setItem('jedagrun_best',''+best)}catch(e){}}
bestEl.textContent='BEST '+best;
ovTitle.textContent='GAME OVER - '+finalScore;
ovDesc.innerHTML='Combo terbaik: <b style="color:var(--neon)">x'+bestComboRun+'</b> / Best score tersimpan di perangkat ini';
ovBlink.textContent='TAP BUAT MAIN LAGI';
shareBtn.style.display='inline-block';
overlay.classList.remove('game-hide');
gsfx.over();
}
function jump(){
if(!running){reset();return}
if(player.onGround||player.jumps<2){
const first=player.onGround;
player.vy=first?-9.8:-9.2;
player.onGround=false;player.jumps++;
player.sy=1.25;
burst(player.x+13,player.y,'#a89ec4',6);
first?gsfx.jump():gsfx.djump();
}
}
window.addEventListener('keydown',e=>{
if(e.code==='Space'){
const t=document.activeElement&&document.activeElement.tagName;
if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||t==='BUTTON')return;
e.preventDefault();jump();
}
});
cv.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
overlay.addEventListener('pointerdown',e=>{if(e.target===shareBtn||e.target===muteBtn)return;e.preventDefault();jump()});
shareBtn.addEventListener('click',e=>{
e.stopPropagation();
const text=`Aku skor ${finalScore} di JEDAG RUN. Coba kalahkan! ${location.href.split('#')[0]}#game`;
if(navigator.share){navigator.share({text}).catch(()=>{})}
else window.open('https://wa.me/?text='+encodeURIComponent(text));
});
muteBtn.addEventListener('pointerdown',e=>e.stopPropagation());
muteBtn.addEventListener('click',e=>{
e.stopPropagation();
bgmOn=!bgmOn;
muteBtn.dataset.muted=bgmOn?'0':'1';
muteBtn.innerHTML=bgmOn?SND_ON:SND_OFF;
syncBGM();
});
function bgmTick(){
if(!bgmOn)return;
const every=Math.max(4,7-Math.min(3,level));
if(frame%every!==0)return;
step=(step+1)%16;
if(step%4===0)sfx('kick',0.45);
if(level>=1&&step%4===2)sfx('bass',0.35);
if(level>=2&&step%2===1)sfx('hat',0.2);
if(level>=3&&step===8)sfx('snare',0.25);
}
function spawn(){
if(frame%Math.max(50,95-level*6)===0&&Math.random()<.85)obstacles.push({x:W+20,w:24,h:26+Math.random()*26});
if(frame%55===0&&Math.random()<.65)notes.push({x:W+20,y:GROUND-70-Math.random()*50,r:9,spin:0});
}
function update(){
frame++;
if(hitstop>0){hitstop--;return}
speed=4+level*0.5+Math.min(3,dist*0.0004);
dist+=speed;
level=Math.floor(getScore()/300);
if(level>prevLevel){prevLevel=level;dropTimer=40;shake=Math.max(shake,6);popup('DROP!!',W/2,90,ACCENTS[level%5][0]);gsfx.drop()}
if(getScore()>=nextLifeAt){nextLifeAt+=500;if(lives<3){lives++;popup('+1 LIFE',player.x+13,player.y-70,'#ffd319');gsfx.coin()}}
player.vy+=0.5;player.y+=player.vy;
if(player.y>=GROUND){
if(!player.onGround){player.sy=0.7;burst(player.x+13,GROUND,'#a89ec4',5);gsfx.land()}
player.y=GROUND;player.vy=0;player.onGround=true;player.jumps=0;
}
player.sy+=(1-player.sy)*0.2;
if(player.inv>0)player.inv--;
spawn();
obstacles.forEach(o=>o.x-=speed);
notes.forEach(n=>n.x-=speed);
obstacles=obstacles.filter(o=>o.x+o.w>-40);
notes.forEach(n=>{
if(!n.got&&!n.missed&&n.x<player.x-20){n.missed=true;if(combo>0){combo=0;popup('COMBO PUTUS',player.x+40,player.y-80,'#ff3355')}}
});
notes=notes.filter(n=>n.x>-40);
const p=player,py=p.y-p.h;
for(const o of obstacles){
const oy=GROUND-o.h+4;
if(p.x+p.w-6>o.x&&p.x+6<o.x+o.w&&p.y>oy+6){
if(player.inv<=0){
lives--;combo=0;shake=12;hitstop=8;player.inv=90;
burst(p.x+13,p.y-16,'#ff3355',16);
popup('-1 LIFE',p.x+13,p.y-70,'#ff3355');
gsfx.hit();
if(lives<=0){gameOver();return}
}
}
if(!o.counted&&o.x+o.w<p.x){
o.counted=true;
const cl=oy-p.y;
if(cl>=0&&cl<14){bonus+=15;popup('NYARIS! +15',p.x+20,oy-20,'#00ffd5');gsfx.whoosh()}
}
}
notes=notes.filter(n=>{
if(!n.got&&Math.abs(n.x-(p.x+p.w/2))<20&&Math.abs(n.y-(py+p.h/2))<28){
n.got=true;combo++;bestComboRun=Math.max(bestComboRun,mult());
const pts=25*mult();bonus+=pts;
popup('+'+pts+(mult()>1?' x'+mult():''),n.x,n.y-16,'#ffd319');
burst(n.x,n.y,'#ffd319',10);
gsfx.coin();
return false;
}
return true;
});
parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=0.15;q.life--});
parts=parts.filter(q=>q.life>0);
pops.forEach(q=>{q.y-=0.8;q.life--});
pops=pops.filter(q=>q.life>0);
if(shake>0)shake*=0.85;if(shake<0.5)shake=0;
if(dropTimer>0)dropTimer--;
bgmTick();
updateHud();
}
const STARS=Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*(GROUND-70),s:Math.random()*1.6+.4,tw:Math.random()*6.28}));
let trail=[];
function drawSun(){
const cx=W*.72,cy=GROUND-64,r=56;
const g=ctx.createLinearGradient(0,cy-r,0,cy+r);
g.addColorStop(0,'#ffd319');g.addColorStop(.5,'#ff9a1f');g.addColorStop(1,'#ff00e4');
ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.clip();
ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);
ctx.fillStyle='rgba(13,2,33,.9)';
for(let i=0;i<6;i++){ctx.fillRect(cx-r,cy+i*9+Math.sin(frame*.05),r*2,2+i*1.3)}
ctx.restore();
ctx.save();ctx.globalAlpha=.3;ctx.shadowColor='#ff00e4';ctx.shadowBlur=44;
ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle='rgba(255,0,228,.14)';ctx.fill();ctx.restore();
}
function drawMountains(){
ctx.fillStyle='#150631';
ctx.beginPath();ctx.moveTo(-12,GROUND+4);
for(let x=-12;x<=W+12;x+=20){const h=Math.abs(Math.sin((x+dist*.2)*.012))*44+Math.abs(Math.sin((x+dist*.2)*.005))*28;ctx.lineTo(x,GROUND-16-h)}
ctx.lineTo(W+12,GROUND+4);ctx.fill();
ctx.fillStyle='#1c0b40';
ctx.beginPath();ctx.moveTo(-12,GROUND+4);
for(let x=-12;x<=W+12;x+=16){const h=Math.abs(Math.sin((x+dist*.45)*.02))*26+6;ctx.lineTo(x,GROUND-4-h)}
ctx.lineTo(W+12,GROUND+4);ctx.fill();
}
function drawBG(){
const acc=ACCENTS[level%ACCENTS.length];
const g=ctx.createLinearGradient(0,0,0,H);
g.addColorStop(0,'#04010d');g.addColorStop(.55,'#0d0221');g.addColorStop(1,'#1b0a3f');
ctx.fillStyle=g;ctx.fillRect(-12,-12,W+24,H+24);
STARS.forEach(s=>{ctx.globalAlpha=.25+Math.abs(Math.sin(frame*.03+s.tw))*.65;ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,s.s,s.s)});
ctx.globalAlpha=1;
drawSun();drawMountains();
if(dropTimer>0){ctx.fillStyle=rgba(acc[0],dropTimer/40*.18);ctx.fillRect(-12,-12,W+24,H+24)}
for(let i=0;i<26;i++){const bh=6+Math.abs(Math.sin(frame*.07+i*.7))*40;ctx.fillStyle=rgba(i%2?acc[1]:acc[0],.12);ctx.fillRect(i*31-((dist*.3)%31),GROUND-bh,15,bh)}
ctx.fillStyle='#12072a';ctx.fillRect(-12,GROUND+4,W+24,H-GROUND+12);
ctx.strokeStyle=rgba(acc[0],.3);ctx.lineWidth=1;
const off=(dist*.6)%46;
for(let x=-46;x<W+92;x+=46){const xx=x-off;ctx.beginPath();ctx.moveTo(W/2+(xx-W/2)*.22,GROUND+5);ctx.lineTo(xx,H+10);ctx.stroke()}
for(let i=0;i<5;i++){const y=GROUND+5+Math.pow(i/4,1.8)*(H-GROUND);ctx.beginPath();ctx.moveTo(-12,y);ctx.lineTo(W+12,y);ctx.stroke()}
ctx.fillStyle=rgba(acc[0],.9);ctx.fillRect(-12,GROUND+3,W+24,2);
ctx.fillStyle='rgba(0,0,0,.14)';for(let y=0;y<H;y+=4)ctx.fillRect(0,y,W,1);
}
function drawPlayer(){
const p=player;
if(p.inv>0&&Math.floor(frame/4)%2===0)return;
if(running){trail.push({x:p.x,y:p.y});if(trail.length>9)trail.shift()}
trail.forEach((t,i)=>{ctx.globalAlpha=(i/trail.length)*.22;ctx.fillStyle='#00ffd5';ctx.fillRect(t.x+5,t.y-p.h+9,p.w-10,p.h-9)});
ctx.globalAlpha=1;
ctx.save();
ctx.translate(p.x+p.w/2,p.y);
const sy=p.sy,sx=1+(1-sy)*0.7;
ctx.scale(sx,sy);
const w=p.w,h=p.h;
ctx.shadowColor='#00ffd5';ctx.shadowBlur=14;
ctx.fillStyle='#f5f0ff';ctx.fillRect(-w/2,-h+8,w,h-8);
ctx.shadowBlur=0;
ctx.fillStyle='#ff00e4';ctx.fillRect(-w/2,-h+8,w,4);
ctx.fillStyle='#0d0221';ctx.fillRect(-w/2+4,-h+14,w-8,6);
ctx.fillStyle='#e8c39e';ctx.fillRect(-w/2+5,-h,w-10,10);
ctx.fillStyle='#0d0221';ctx.fillRect(-w/2+4,-h-2,w-8,5);
ctx.fillStyle='#ffd319';ctx.fillRect(-w/2+4,-h+2,w-8,2);
ctx.fillStyle='#ffd319';ctx.fillRect(-w/2+2,-h+2,4,7);ctx.fillRect(w/2-6,-h+2,4,7);
ctx.fillStyle='#0d0221';
if(p.onGround){const s=Math.floor(frame/6)%2;ctx.fillRect(-w/2+3,-4,8,4);ctx.fillRect(w/2-11+(s?2:-2),-4,8,4)}
else{ctx.fillRect(-w/2+3,-6,8,4);ctx.fillRect(w/2-11,-2,8,4)}
ctx.restore();
}
function drawObstacles(){
const acc=ACCENTS[level%ACCENTS.length];
obstacles.forEach(o=>{
const y=GROUND-o.h+4;
ctx.save();ctx.shadowColor=acc[0];ctx.shadowBlur=10;
ctx.fillStyle='#12082a';ctx.fillRect(o.x,y,o.w,o.h);ctx.restore();
ctx.strokeStyle=acc[0];ctx.lineWidth=1;ctx.strokeRect(o.x+.5,y+.5,o.w-1,o.h-1);
const pulse=3+Math.sin(frame*.25)*2;
ctx.fillStyle=rgba(acc[0],.85);ctx.beginPath();ctx.arc(o.x+o.w/2,y+o.h*.3,pulse+2,0,7);ctx.fill();
ctx.strokeStyle=rgba(acc[0],.35);ctx.beginPath();ctx.arc(o.x+o.w/2,y+o.h*.3,pulse+7,0,7);ctx.stroke();
ctx.fillStyle=rgba(acc[1],.6);ctx.beginPath();ctx.arc(o.x+o.w/2,y+o.h*.72,4,0,7);ctx.fill();
});
}
function drawNotes(){
notes.forEach(n=>{
n.spin+=0.08;
ctx.save();ctx.translate(n.x,n.y);
ctx.shadowColor='#ffd319';ctx.shadowBlur=16;
ctx.fillStyle='#0d0221';ctx.beginPath();ctx.arc(0,0,n.r,0,7);ctx.fill();
ctx.shadowBlur=0;
ctx.strokeStyle='#ffd319';ctx.lineWidth=1.5;ctx.stroke();
ctx.rotate(n.spin);ctx.strokeStyle='rgba(255,211,25,.5)';ctx.beginPath();ctx.moveTo(-n.r+3,0);ctx.lineTo(n.r-3,0);ctx.stroke();
ctx.fillStyle='#ffd319';ctx.beginPath();ctx.arc(0,0,2.5,0,7);ctx.fill();
ctx.restore();
});
}
function drawFx(){
parts.forEach(q=>{ctx.globalAlpha=Math.max(0,q.life/40);ctx.fillStyle=q.col;ctx.fillRect(q.x,q.y,q.sz,q.sz)});
ctx.globalAlpha=1;
ctx.font='bold 12px JetBrains Mono, monospace';ctx.textAlign='center';
pops.forEach(q=>{ctx.globalAlpha=Math.max(0,q.life/55);ctx.shadowColor=q.col;ctx.shadowBlur=8;ctx.fillStyle=q.col;ctx.fillText(q.txt,q.x,q.y)});
ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.textAlign='left';
}
let runOn=true;
new IntersectionObserver(e=>{runOn=e[0].isIntersecting}).observe(document.getElementById('game'));
function loop(){
requestAnimationFrame(loop);
if(!runOn)return;
if(running)update();
ctx.save();
if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
drawBG();drawObstacles();drawNotes();drawPlayer();drawFx();
ctx.restore();
}
loop();
})();
