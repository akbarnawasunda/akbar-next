/* ===== PARTICLE NAME v5 — REPULSION FIELD + BIGGER TYPE ===== */
(function(){
var sec=document.getElementById('about');
if(!sec)return;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var cv=document.createElement('canvas');
cv.className='p-name-cv';
sec.prepend(cv);
var c=cv.getContext('2d');
var W=0,H=0,dpr=1,BAND=320,parts=[],visible=false,raf=null,t0=0;
var EXPLODE=900,CONV=2600,REP_R=80;
var ptr={x:0,y:0,on:false};
function setPtr(e){var r=cv.getBoundingClientRect();ptr.x=e.clientX-r.left;ptr.y=e.clientY-r.top}
sec.addEventListener('pointerdown',function(e){ptr.on=true;setPtr(e)});
sec.addEventListener('pointermove',function(e){if(ptr.on)setPtr(e)});
['pointerup','pointercancel','pointerleave'].forEach(function(ev){sec.addEventListener(ev,function(){ptr.on=false})});
function buildTargets(){
REP_R=W<640?60:80;
var off=document.createElement('canvas');
off.width=Math.max(1,W);off.height=Math.max(1,H);
var o=off.getContext('2d');
var L1='AKBAR',L2='NAWASUNDA';
var fs=Math.min(H*0.34,170);
o.font=fs+'px Anton,sans-serif';
var w=Math.max(o.measureText(L1).width,o.measureText(L2).width);
var maxW=W*0.92;
if(w>maxW){fs=Math.max(28,fs*maxW/w);o.font=fs+'px Anton,sans-serif'}
o.fillStyle='#fff';o.textAlign='center';o.textBaseline='middle';
o.fillText(L1,W/2,H*0.27);
o.fillText(L2,W/2,H*0.73);
var data=o.getImageData(0,0,W,H).data;
var step=2;
var pts=[];
for(var y=0;y<H;y+=step)for(var x=0;x<W;x+=step){
if(data[(y*W+x)*4+3]>120)pts.push([x,y]);
}
var MAX=W<640?2600:4200;
if(pts.length>MAX){var keep=[],ratio=MAX/pts.length;for(var i=0;i<pts.length;i++){if(Math.random()<ratio)keep.push(pts[i])}pts=keep}
var cx=W/2,cy=H/2;
parts=pts.map(function(p){
var ang=Math.random()*Math.PI*2;
var spd=Math.random()*18+6;
return{tx:p[0],ty:p[1],cx:cx,cy:cy,x:cx,y:cy,ivx:Math.cos(ang)*spd,ivy:Math.sin(ang)*spd,vx:0,vy:0,bx:null,by:0,bs:0,ox:0,oy:0,d:Math.random()*500,sz:Math.random()<0.06?2.6:(Math.random()<0.35?1.8:1.2),a:0.5+Math.random()*0.5,ph:Math.random()*6.283};
});
}
function resize(){
dpr=Math.min(window.devicePixelRatio||1,2);
W=cv.clientWidth;H=BAND;
cv.width=Math.max(1,Math.round(W*dpr));cv.height=Math.max(1,Math.round(H*dpr));
c.setTransform(dpr,0,0,dpr,0,0);
t0=0;
buildTargets();
if(RM)drawFinal();
}
function drawFinal(){
c.clearRect(0,0,W,H);
c.fillStyle='#fff';
for(var i=0;i<parts.length;i++){var p=parts[i];c.globalAlpha=p.a;c.fillRect(p.tx,p.ty,p.sz,p.sz)}
c.globalAlpha=1;
}
function loop(now){
raf=requestAnimationFrame(loop);
if(!visible)return;
if(!t0){
t0=now;
for(var j=0;j<parts.length;j++){var q=parts[j];q.x=q.cx;q.y=q.cy;q.vx=q.ivx;q.vy=q.ivy;q.bx=null;q.ox=0;q.oy=0}
}
var t=now-t0;
c.clearRect(0,0,W,H);
c.fillStyle='#fff';
for(var i=0;i<parts.length;i++){
var p=parts[i];
var x,y;
if(t<EXPLODE){
p.x+=p.vx;p.y+=p.vy;p.vx*=0.94;p.vy*=0.94;
x=p.x;y=p.y;
}else{
if(p.bx===null){p.bx=p.x;p.by=p.y;p.bs=EXPLODE+p.d}
if(t<p.bs){
x=p.x;y=p.y;
}else{
var k=(t-p.bs)/CONV;if(k>1)k=1;
var e=1-Math.pow(1-k,3);
x=p.bx+(p.tx-p.bx)*e;
y=p.by+(p.ty-p.by)*e;
if(k>=1){var tt=now/1000;x=p.tx+Math.sin(tt*1.4+p.ph)*1.2;y=p.ty+Math.cos(tt*1.1+p.ph)*1.2}
}
}
/* ===== REPULSION FIELD (meluna style) ===== */
if(ptr.on){
var dx=x-ptr.x,dy=y-ptr.y;
var dist=Math.sqrt(dx*dx+dy*dy)||0.001;
if(dist<REP_R){
var push=(REP_R-dist);
var ox=dx/dist*push,oy=dy/dist*push;
}else{var ox=0,oy=0}
}else{var ox=0,oy=0}
p.ox+=(ox-p.ox)*0.22;
p.oy+=(oy-p.oy)*0.22;
x+=p.ox;y+=p.oy;
c.globalAlpha=p.a*(t<EXPLODE?0.8:1);
c.fillRect(x,y,p.sz,p.sz);
}
c.globalAlpha=1;
}
var rto=null;
window.addEventListener('resize',function(){clearTimeout(rto);rto=setTimeout(resize,200)});
if(document.fonts&&document.fonts.load)document.fonts.load('10px Anton').then(function(){resize()}).catch(function(){});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){resize()});
resize();
if(!RM){
new IntersectionObserver(function(es){
var v=es[0].isIntersecting;
if(v&&!visible){visible=true;t0=0;if(!raf)raf=requestAnimationFrame(loop)}
if(!v&&visible){visible=false;if(raf){cancelAnimationFrame(raf);raf=null}}
},{threshold:.2}).observe(cv);
}
})();
