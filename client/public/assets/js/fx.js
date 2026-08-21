/* ===== FX PACK v1 — advanced animation layer ===== */
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER=matchMedia('(hover:hover)').matches;
/* 1. SCRAMBLE ON CLICK — teks interaktif decode pas dipencet */
const SCR_CHARS='!<>-_\\/[]{}—=+*^?#';
function scrambleEl(el){
if(el.dataset.scr)return;
el.dataset.scr='1';
const leaves=[];
(function walk(n){n.childNodes.forEach(c=>{if(c.nodeType===3&&c.textContent.trim())leaves.push(c);else if(c.nodeType===1&&!c.closest('svg'))walk(c)})})(el);
if(!leaves.length){delete el.dataset.scr;return}
let done=0;
leaves.forEach(function(node,idx){
const final=node.textContent;
const q=[];
for(let i=0;i<final.length;i++){const s=Math.floor(Math.random()*12)+idx*3;q.push({to:final[i],st:s,en:s+8+Math.floor(Math.random()*12),ch:''})}
let f=0;
(function upd(){
let out='',d=0;
for(let i=0;i<q.length;i++){const it=q[i];
if(it.to===' '){out+=' ';d++;continue}
if(f>=it.en){d++;out+=it.to}
else if(f>=it.st){if(!it.ch||Math.random()<.3)it.ch=SCR_CHARS[Math.floor(Math.random()*SCR_CHARS.length)];out+=it.ch}
else out+='\u00A0';
}
node.textContent=out;
if(d<q.length){f++;requestAnimationFrame(upd)}
else{node.textContent=final;done++;if(done>=leaves.length)delete el.dataset.scr}
})();
});
}
if(!RM){
document.addEventListener('click',function(e){
const t=e.target.closest('a,button,h1,h2,h3,.chip,.pad,.logo,.section-title,.hero-badge');
if(t)scrambleEl(t);
});
}
/* 2. NEON RIPPLE pas dipencet */
if(!RM){
document.addEventListener('pointerdown',function(e){
const b=e.target.closest('.btn,.chip,.pad,.stop-btn,.seq-play,.seq-stop');
if(!b)return;
const r=b.getBoundingClientRect();
const d=document.createElement('span');
d.className='fx-ripple';
const size=Math.max(r.width,r.height)*1.2;
d.style.width=d.style.height=size+'px';
d.style.left=(e.clientX-r.left-size/2)+'px';
d.style.top=(e.clientY-r.top-size/2)+'px';
b.appendChild(d);
setTimeout(function(){d.remove()},650);
});
}
/* 3. STAGGER REVEAL — isi section muncul bergelombang */
(function(){
const secs=document.querySelectorAll('.section');
if(RM){secs.forEach(function(s){s.classList.add('rev-in')});return}
const io=new IntersectionObserver(function(es){
es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('rev-in');io.unobserve(en.target)}});
},{threshold:.15});
secs.forEach(function(s){io.observe(s)});
})();
/* 4. HERO PARALLAX pas scroll */
if(!RM){
const hw=document.querySelector('.hero-wrap');
const lt=document.querySelector('.led-title');
let tick=false;
addEventListener('scroll',function(){
if(tick)return;tick=true;
requestAnimationFrame(function(){
const y=Math.min(scrollY,innerHeight);
if(hw)hw.style.translate='0 '+(y*.1)+'px';
if(lt)lt.style.translate='0 '+(y*-.06)+'px';
tick=false;
});
},{passive:true});
}
/* 5. TILT 3D kartu platform/release (desktop) */
if(HOVER&&!RM){
document.querySelectorAll('.plat,.rel-card').forEach(function(card){
card.addEventListener('mousemove',function(e){
const r=card.getBoundingClientRect();
const x=e.clientX-r.left,y=e.clientY-r.top;
card.style.transform='perspective(800px) rotateX('+((y-r.height/2)/18)+'deg) rotateY('+((r.width/2-x)/18)+'deg) translateY(-4px)';
});
card.addEventListener('mouseleave',function(){card.style.transform=''});
});
}
console.log('%cFX PACK v1 — advanced animations active','color:#ffd319;font-family:monospace');
})();
