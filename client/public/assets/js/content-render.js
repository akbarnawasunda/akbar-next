/* ===== CONTENT RENDER v14 — human voice labels + auto-stats ===== */
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const normArr=v=>Array.isArray(v)?v:(typeof v==='string'&&v.trim()?[v.trim()]:[]);
const ytId=u=>{const m=String(u).match(/youtu\.be\/([\w-]{6,})/)||String(u).match(/[?&]v=([\w-]{6,})/);return m?m[1]:''};
const ytChannel=u=>/youtube\.com\/(@|channel\/|c\/|user\/)/.test(u);
const spPath=u=>{const m=String(u).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(album|track|artist|playlist)\/([A-Za-z0-9]+)/);return m?m[1]+'/'+m[2]:''};
const ICONS={
spotify:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
apple:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>`,
youtube:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
soundcloud:c=>`<svg viewBox="0 0 24 24"><g fill="${c}"><rect x="0.5" y="13" width="1.6" height="7" rx=".8"/><rect x="2.9" y="11" width="1.6" height="9" rx=".8"/><rect x="5.3" y="9" width="1.6" height="11" rx=".8"/><rect x="7.7" y="7.5" width="1.6" height="12.5" rx=".8"/><circle cx="13.5" cy="14.5" r="4.4"/><circle cx="18.3" cy="15.6" r="3.2"/><rect x="10.5" y="12.4" width="11" height="7.6" rx="3.2"/></g></svg>`,
deezer:c=>`<svg viewBox="0 0 24 24"><g fill="${c}"><rect x="1" y="15" width="3" height="3"/><rect x="5.5" y="15" width="3" height="3"/><rect x="10" y="15" width="3" height="3"/><rect x="14.5" y="15" width="3" height="3"/><rect x="19" y="15" width="3" height="3"/><rect x="1" y="10.5" width="3" height="3"/><rect x="5.5" y="10.5" width="3" height="3"/><rect x="10" y="10.5" width="3" height="3"/><rect x="14.5" y="10.5" width="3" height="3"/><rect x="10" y="6" width="3" height="3"/><rect x="14.5" y="6" width="3" height="3"/><rect x="14.5" y="1.5" width="3" height="3"/></g></svg>`,
amazon:c=>`<svg viewBox="0 0 24 24" fill="none"><path d="M3 14.5c5 3.5 13 3.5 18 0" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M19.2 13.2l2.3 1-1 2.2" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3v10M12 3c-2.5 0-4 1.4-4 3.2 0 3 4 3.3 4 3.3s4 .3 4 3.3c0 1.8-1.5 3.2-4 3.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`,
tidal:c=>`<svg viewBox="0 0 24 24"><g fill="${c}"><path d="M12 8.5l3.5 3.5L12 15.5 8.5 12z"/><path d="M5 5l3.5 3.5L5 12 1.5 8.5z"/><path d="M19 5l3.5 3.5L19 12l-3.5-3.5z"/><path d="M12 15.5l3.5 3.5-3.5 3.5L8.5 19z" opacity=".6"/></g></svg>`,
instagram:c=>{const id='ig'+Math.random().toString(36).substr(2,5);return `<svg viewBox="0 0 24 24" fill="none"><defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".55" stop-color="#d62976"/><stop offset=".8" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#${id})" stroke-width="2"/><circle cx="12" cy="12" r="4.4" stroke="url(#${id})" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.4" fill="#d62976"/></svg>`},
tiktok:c=>`<svg viewBox="0 0 24 24"><path fill="#25F4EE" transform="translate(-1,-1)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/><path fill="#FE2C55" transform="translate(1,1)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/><path fill="#fff" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
x:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>`,
email:c=>`<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4.5" width="20" height="15" rx="2.5" stroke="${c}" stroke-width="2"/><path d="M3.5 6.5 12 13l8.5-6.5" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
whatsapp:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.1 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-3.6-1.1-5.9-3.9-6.1-4.3-.2-.3-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.2.3 0 .6.7 1.2 1.9 2.3 3.4 2.9.3.1.5.1.6-.1l.7-.9c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>`,
facebook:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V14h2.7v8h3.2z"/></svg>`,
anghami:c=>`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="${c}"/><path d="M9 16.5V9l7-2v8" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="7.5" cy="16.5" r="1.8" fill="#fff"/><circle cx="14.5" cy="15" r="1.8" fill="#fff"/></svg>`,
qobuz:c=>`<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="${c}"/><circle cx="11" cy="11" r="4" stroke="#fff" stroke-width="2" fill="none"/><path d="M14 14l4 4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
iheart:c=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M12 21s-8-5.3-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>`,
ytmusic:c=>`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${c}"/><path d="M10 8.5v7l6-3.5z" fill="#fff"/></svg>`,
shazam:c=>`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${c}"/><path d="M12 5.5v3M12 15.5v3M8 10c0-1.1 1.8-1.7 4-1.7s4 .6 4 1.7-1.8 1.6-4 1.6-4 .6-4 1.7 1.8 1.7 4 1.7 4-.6 4-1.7" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
note:c=>`<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="6" cy="18" r="3" fill="${c}"/><circle cx="18" cy="16" r="3" fill="${c}"/></svg>`,
globe:c=>`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="${c}" stroke-width="2"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18-3-4-3-14.5 0-18z" stroke="${c}" stroke-width="1.5"/></svg>`
};
const DEF_COLOR={spotify:'#1DB954',apple:'#FA57C1',youtube:'#FF0000',soundcloud:'#FF5500',deezer:'#A238FF',amazon:'#FF9900',tidal:'#00FFFF',instagram:'#d62976',tiktok:'#25F4EE',x:'#ffffff',email:'#ffc857',whatsapp:'#25D366',facebook:'#1877F2',anghami:'#F95B4F',qobuz:'#0E7EB8',iheart:'#C6002B',ytmusic:'#FF0000',shazam:'#0084FF',note:'#ff00e4',globe:'#a89ec4'};
const DEFAULT_MARQUEE=['spotify','apple','youtube','ytmusic','soundcloud','deezer','amazon','tidal','anghami','qobuz','iheart','shazam','tiktok','instagram'];
/* ===== SELF-HEALING ICON RESOLVER ===== */
function resolveIcon(p){
var k=String(p.icon||'').toLowerCase();
if(k==='twitter'||k==='tw'||k==='x/twitter')k='x';
if(ICONS[k])return k;
var n=String(p.name||'').toLowerCase().trim();
if(n==='x'||n==='twitter')return 'x';
if(ICONS[n])return n;
return 'globe';
}
function oembed(kind,u,cb){
const ep=kind==='spotify'?'https://open.spotify.com/oembed?url=':kind==='soundcloud'?'https://soundcloud.com/oembed?format=json&url=':'https://www.youtube.com/oembed?format=json&url=';
fetch(ep+encodeURIComponent(u)).then(r=>r.json()).then(d=>cb(d)).catch(()=>cb(null));
}
function card(kind,u){
const c=document.createElement('div');c.className='embed-card';
c.innerHTML='<div class="embed-thumb"></div><div class="embed-meta"><span class="embed-kind"></span><span class="embed-title"></span></div>';
const th=c.querySelector('.embed-thumb'),k=c.querySelector('.embed-kind'),t=c.querySelector('.embed-title');
k.textContent=kind==='spotify'?'SPOTIFY':kind==='soundcloud'?'SOUNDCLOUD':(ytChannel(u)?'YOUTUBE / CHANNEL':'YOUTUBE / VIDEO');
t.textContent=kind==='youtube'?(ytChannel(u)?'TAP BUKA CHANNEL':'TAP TONTON VIDEO'):'TAP BUAT PLAY';
if(kind==='youtube'){const id=ytId(u);if(id)th.style.backgroundImage='url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)'}
if(kind!=='youtube'){oembed(kind,u,d=>{if(d&&d.thumbnail_url)th.style.backgroundImage='url('+d.thumbnail_url+')';if(d&&d.title)t.textContent=d.title})}
else{oembed(kind,u,d=>{if(d&&d.title)t.textContent=d.title})}
c.addEventListener('click',()=>{
if(kind==='youtube'&&ytChannel(u)){window.open(u,'_blank');return}
const f=document.createElement('iframe');f.className='embed-card-frame';
f.setAttribute('allow','autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
f.setAttribute('frameborder','0');f.setAttribute('loading','lazy');
if(kind==='spotify'){const p=spPath(u);if(!p)return;f.src='https://open.spotify.com/embed/'+p+'?utm_source=generator&theme=0'}
else if(kind==='soundcloud'){f.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(u)+'&color=%23ff5500'}
else{const id=ytId(u);if(!id)return;f.src='https://www.youtube.com/embed/'+id}
c.replaceWith(f);
});
return c;
}
function railWithHint(kind,urls){
const frag=document.createDocumentFragment();
const hint=document.createElement('div');hint.className='rail-hint';hint.textContent='GESER → '+urls.length+' ITEM';
const r=document.createElement('div');r.className='embed-rail';
urls.forEach(u=>r.appendChild(card(kind,u)));
frag.appendChild(hint);frag.appendChild(r);
return frag;
}
function mountEmbeds(E){
const sp=normArr(E.spotify),sc=normArr(E.soundcloud),yt=normArr(E.youtube);
if(sp.length){const ph=document.querySelector('.embed-placeholder[data-cover="spotify"]');if(ph)ph.replaceWith(railWithHint('spotify',sp))}
if(sc.length){const ph=document.querySelector('.embed-placeholder[data-cover="soundcloud"]');if(ph)ph.replaceWith(railWithHint('soundcloud',sc))}
if(yt.length){const g=document.querySelector('.yt-grid');if(g)g.replaceWith(railWithHint('youtube',yt))}
}
function renderPlatforms(list){
const grid=document.querySelector('.plats');
if(!grid||!Array.isArray(list)||!list.length)return;
grid.innerHTML='';
list.forEach(p=>{
const a=document.createElement('a');a.className='plat';
const col=DEF_COLOR[resolveIcon(p)]||p.color||'#ff00e4';
a.style.setProperty('--c',col);
a.href=p.url||'#';a.target='_blank';a.rel='noopener';
const ic=(ICONS[resolveIcon(p)]||ICONS.globe)(col);
a.innerHTML=ic+'<b></b><span></span>';
a.querySelector('b').textContent=p.name||'';
a.querySelector('span').textContent=p.sub||'';
grid.appendChild(a);
});
}
function buildLogoMarquee(db){
const sec=document.getElementById('platforms');
if(!sec||sec.querySelector('.logo-marquee'))return;
const sub=sec.querySelector('.section-sub');
let list;
if(Array.isArray(db.platforms)&&db.platforms.length){list=db.platforms.map(p=>({name:(p.name||'').toUpperCase(),icon:p.icon,color:DEF_COLOR[resolveIcon(p)]||p.color}))}
else{list=DEFAULT_MARQUEE.map(k=>({name:k.toUpperCase(),icon:k,color:DEF_COLOR[k]}))}
const mid=Math.ceil(list.length/2);
let rowA=list.slice(0,mid),rowB=list.slice(mid);
if(!rowB.length)rowB=rowA;
const half=items=>{const h=document.createElement('div');h.className='logo-half';items.forEach(p=>{const it=document.createElement('span');it.className='logo-item';it.innerHTML=(ICONS[resolveIcon(p)]||ICONS.globe)(p.color||'#fff')+'<span>'+(p.name||'')+'</span>';h.appendChild(it)});return h};
const track=(items,rev)=>{const t=document.createElement('div');t.className='logo-track'+(rev?' rev':'');t.appendChild(half(items));t.appendChild(half(items));return t};
const wrap=document.createElement('div');wrap.className='logo-marquee';
wrap.appendChild(track(rowA,true));
wrap.appendChild(track(rowB,false));
if(sub)sub.after(wrap);else sec.querySelector('.wrap').prepend(wrap);
}
/* ===== COUNT-UP 3 DETIK, ANTI-NAN ===== */
function parseStat(t){
t=String(t);
const m=t.match(/[\d.,]+/);
if(!m)return null;
const raw=m[0];
const value=parseFloat(raw.replace(/[.,]/g,''));
if(!isFinite(value)||value<=0)return null;
const suffix=t.slice(m.index+raw.length);
const isJT=/JT/i.test(suffix);
const isK=!isJT&&/K/i.test(suffix);
let target,fmt;
if(isJT){
target=value*1e6;
fmt=v=>{const x=v/1e6;const r=x>=10?Math.round(x):Math.round(x*10)/10;return String(r).replace('.',',')}
}else if(isK){
target=value*1e3;
fmt=v=>String(Math.round(v/1e3));
}else{
target=value;
const sep=raw.includes(',')?',':(raw.includes('.')?'.':'');
fmt=v=>{const r=Math.round(v);if(!sep)return String(r);return sep===','?r.toLocaleString('en-US'):r.toLocaleString('id-ID')};
}
return {target,fmt,suffix};
}
function animateStat(el){
const finalTxt=el.textContent;
const p=parseStat(finalTxt);
if(!p||RM){el.textContent=finalTxt;return}
const dur=3000;
const t0=performance.now();
const stepFn=n=>{
const k=Math.min(1,(n-t0)/dur);
if(k>=1){el.textContent=finalTxt;return}
const e=1-Math.pow(1-k,3);
el.textContent=p.fmt(p.target*e)+p.suffix;
requestAnimationFrame(stepFn);
};
requestAnimationFrame(stepFn);
}
function initCountUp(){
const els=document.querySelectorAll('.chip-stat b');
if(!els.length)return;
const io=new IntersectionObserver(es=>{
es.forEach(en=>{
if(en.isIntersecting){
io.unobserve(en.target);
animateStat(en.target);
const chip=en.target.closest('.chip-stat');
if(chip)chip.classList.add('counted');
}
});
},{threshold:.6});
els.forEach(el=>io.observe(el));
}
/* ===== TEXT SCRAMBLE — semua judul gerak ===== */
const SCR_CHARS='!<>-_\\/[]{}—=+*^?#';
function scrNode(node,delay){
const final=node.textContent;
if(!final.trim())return;
const q=[];
for(let i=0;i<final.length;i++){
const stt=delay+Math.floor(Math.random()*22);
q.push({to:final[i],st:stt,en:stt+8+Math.floor(Math.random()*22),ch:''});
}
let f=0;
(function upd(){
let out='',done=0;
for(let i=0;i<q.length;i++){
const it=q[i];
if(it.to===' '){out+=' ';done++;continue}
if(f>=it.en){done++;out+=it.to}
else if(f>=it.st){
if(!it.ch||Math.random()<.28)it.ch=SCR_CHARS[Math.floor(Math.random()*SCR_CHARS.length)];
out+=it.ch;
}else out+='\u00A0';
}
node.textContent=out;
if(done<q.length){f++;requestAnimationFrame(upd)}
else node.textContent=final;
})();
}
function scrLeaves(el,stagger,delay){
if(!el||RM)return;
const leaves=[];
(function walk(n){n.childNodes.forEach(c=>{if(c.nodeType===3){if(c.textContent.trim())leaves.push(c)}else if(c.nodeType===1)walk(c)})})(el);
leaves.forEach((lf,i)=>scrNode(lf,(delay||0)+i*(stagger||8)));
}
function injectSecIndex(){
const MAP={pad:'[ 01 — COBA SENDIRI ]',engine:'[ 02 — BIKIN BEAT ]',spotify:'[ 03 — LAGU GW ]',soundcloud:'[ 04 — SET REMIX ]',youtube:'[ 05 — YANG VIRAL ]',releases:'[ 06 — RAK RILISAN ]',platforms:'[ 07 — TEMUIN GW ]',about:'[ 08 — CERITA GW ]',game:'[ 09 — MAIN DULU ]',collab:'[ 10 — GAS COLLAB ]'};
Object.keys(MAP).forEach(id=>{
const sec=document.getElementById(id);
if(!sec||sec.querySelector('.sec-index'))return;
const title=sec.querySelector('.section-title');
if(!title)return;
const el=document.createElement('span');el.className='sec-index';el.textContent=MAP[id];
title.before(el);
});
}
function initScramble(){
if(RM)return;
scrLeaves(document.querySelector('.hero-badge'),6,12);
const lt=document.querySelector('.led-title');
if(lt){
scrLeaves(lt.querySelector('.t1'),5,0);
scrLeaves(lt.querySelector('.t2'),5,16);
}
const targets=[];
document.querySelectorAll('.section').forEach(sec=>{
const t=sec.querySelector('.section-title');
const s=sec.querySelector('.sec-index');
if(t)targets.push(t);
if(s)targets.push(s);
});
const io=new IntersectionObserver(es=>{
es.forEach(en=>{
if(en.isIntersecting){
scrLeaves(en.target,6,0);
io.unobserve(en.target);
}
});
},{threshold:.25});
targets.forEach(t=>io.observe(t));
}
function applyTexts(db){
if(!db.texts)return;
Object.keys(db.texts).forEach(k=>{
const v=db.texts[k];if(!v)return;
document.querySelectorAll('[data-i18n="'+k+'"]').forEach(el=>el.textContent=v);
});
const pt=document.querySelector('#platforms .section-title');
if(pt){
if(db.texts.platforms_title){
const parts=String(db.texts.platforms_title).trim().split(/\s+/);
const last=parts.pop();
pt.innerHTML=parts.join(' ')+' <span class="neon">'+last+'</span>';
}else{
pt.innerHTML='ALL <span class="neon">PLATFORM MUSIK</span>';
}
}
const ps=document.querySelector('#platforms .section-sub');
if(ps&&db.texts.platforms_sub)ps.textContent=db.texts.platforms_sub;
}
function applyBio(db){
const lang=document.documentElement.lang||'id';
const b=db.bio&&db.bio[lang];
if(!b)return;
const s=document.querySelector('.bio.short'),l=document.querySelector('.bio.long');
if(s&&b.short)s.textContent=b.short;
if(l&&b.long)l.textContent=b.long;
}
(function(){
const spkState=document.getElementById('spkState');
if(!spkState)return;
const sync=()=>{document.body.classList.toggle('rave',spkState.textContent.trim()==='RAVE MODE')};
sync();
new MutationObserver(sync).observe(spkState,{childList:true,characterData:true,subtree:true});
})();
fetch('data/content.json',{cache:'no-cache'})
.then(r=>r.ok?r.json():null)
.then(db=>{
if(!db)return;
document.documentElement.dataset.theme=String(db.theme||2);
if(db.hero&&db.hero.badge){const el=document.querySelector('.hero-badge');if(el)el.textContent=db.hero.badge}
if(db.hero&&db.hero.aka){const el=document.querySelector('.hero-aka b');if(el)el.textContent=db.hero.aka}

/* === AUTO-STATS PATCH (v13) === */
const chips=document.querySelectorAll('.chip-stat');
if(db.stats&&chips.length){
chips.forEach(chip=>{
const txt=chip.textContent||'';
const b=chip.querySelector('b');
if(!b)return;
if(/TOTAL FOLLOWERS/i.test(txt)&&db.stats.followers){
b.textContent=db.stats.followers;
}
if(/YOUTUBE VIEWS/i.test(txt)&&db.stats.views){
b.textContent=db.stats.views;
}
if(/PLATFORMS/i.test(txt)&&db.stats.platforms){
b.textContent=db.stats.platforms;
}
if(/TRACKS/i.test(txt)&&db.stats.tracks){
b.textContent=db.stats.tracks;
}
});
}

if(!Array.isArray(db.platforms)||!db.platforms.length){
if(db.socials){
const platLinks=document.querySelectorAll('.plat');
['spotify','apple','youtube','soundcloud','deezer','amazon','tidal','instagram','tiktok','twitter','email'].forEach((k,i)=>{
if(db.socials[k]&&platLinks[i])platLinks[i].href=(k==='email'&&!String(db.socials[k]).startsWith('mailto:'))?('mailto:'+db.socials[k]):db.socials[k];
});
}
}else{renderPlatforms(db.platforms)}
if(db.license){const el=document.querySelector('.license-box p');if(el)el.textContent=db.license}
if(db.dropBoard&&db.dropBoard.text&&!document.querySelector('.drop-board')){
const sec=document.getElementById('releases');
if(sec){
const wrap=sec.querySelector('.wrap')||sec;
const sub=wrap.querySelector('.section-sub');
const el=document.createElement('div');el.className='drop-board';
el.innerHTML='<span class="db-dot"></span><span class="db-text"></span>'+(db.dropBoard.link?'<a class="db-link" target="_blank" rel="noopener">LISTEN</a>':'');
el.querySelector('.db-text').textContent=db.dropBoard.text;
if(db.dropBoard.link)el.querySelector('.db-link').href=db.dropBoard.link;
if(sub)sub.after(el);else wrap.prepend(el);
}
}
const refresh=()=>{applyTexts(db);applyBio(db)};
refresh();
new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
mountEmbeds(db.embeds||db.featured||{});
buildLogoMarquee(db);
injectSecIndex();
initScramble();
initCountUp();
})
.catch(()=>{});
console.log('%cCONTENT RENDER v14 — human voice + auto-stats','color:#00ffd5;font-family:monospace');
})();