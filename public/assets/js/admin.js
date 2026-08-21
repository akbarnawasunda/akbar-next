const OWNER='akbarnawasunda',REPO='akbarnawasunda-portofolio',BRANCH='main';
const PATH_C='data/content.json',PATH_R='data/releases.json';
const $=s=>document.querySelector(s);
const enc=s=>btoa(unescape(encodeURIComponent(s)));
const dec=s=>decodeURIComponent(escape(atob(s.replace(/\n/g,''))));
let TOKEN=localStorage.getItem('an_token')||'',SHA_C=null,SHA_R=null,DB=null,DBR=null,CURRENT_LANG='id',DIRTY=false;
console.log('%cAN ADMIN v16','color:#6c63ff;font-family:monospace');
const ICON_KEYS=['spotify','apple','youtube','soundcloud','deezer','amazon','tidal','instagram','tiktok','x','email','whatsapp','facebook','anghami','qobuz','iheart','ytmusic','shazam','note','globe'];
const DEF_COLOR={spotify:'#1DB954',apple:'#FA57C1',youtube:'#FF0000',soundcloud:'#FF5500',deezer:'#A238FF',amazon:'#FF9900',tidal:'#00FFFF',instagram:'#d62976',tiktok:'#25F4EE',x:'#ffffff',email:'#ffc857',whatsapp:'#25D366',facebook:'#1877F2',anghami:'#F95B4F',qobuz:'#0E7EB8',iheart:'#C6002B',ytmusic:'#FF0000',shazam:'#0084FF',note:'#6c63ff',globe:'#a0a0b8'};
const TITLES={dash:'Dashboard',media:'Media',hero:'Hero & Stats',texts:'Site Texts',platforms:'Platforms & Socials',bio:'Bio Text',embeds:'Embeds',theme:'Theme',drop:'Drop Board',license:'License',releases:'Releases',footer:'Footer'};
const DEFAULT_PLATS=[
{icon:'spotify',name:'Spotify',sub:'DJ Akbar Remix',url:'https://open.spotify.com/artist/5teZ2VRr7VBSDqZ0ueP3hd'},
{icon:'apple',name:'Apple Music',sub:'listen',url:'https://music.apple.com/id/album/masih-dihatiku-single/1816312737'},
{icon:'youtube',name:'YouTube',sub:'5.73K subs',url:'https://www.youtube.com/@akbarnawasunda'},
{icon:'soundcloud',name:'SoundCloud',sub:'330+ followers',url:'https://soundcloud.com/akbarnawasunda'},
{icon:'deezer',name:'Deezer',sub:'listen',url:'https://www.deezer.com/us/artist/322209491'},
{icon:'amazon',name:'Amazon',sub:'music',url:'https://music.amazon.com/albums/B0G4GBYQKJ'},
{icon:'tidal',name:'Tidal',sub:'listen',url:'https://tidal.com/track/443331782'},
{icon:'instagram',name:'Instagram',sub:'@akbarnawasunda',url:'https://www.instagram.com/akbarnawasunda/'},
{icon:'tiktok',name:'TikTok',sub:'@akbarnawasunda',url:'https://www.tiktok.com/@akbarnawasunda'},
{icon:'x',name:'X',sub:'twitter',url:'https://x.com/akbarnawasunda'},
{icon:'email',name:'Email',sub:'reply < 24h',url:'mailto:akbarnawasunda@gmail.com'}
];
const SOC_MAP={spotify:'spotify',apple:'apple',youtube:'youtube',soundcloud:'soundcloud',deezer:'deezer',amazon:'amazon',tidal:'tidal',instagram:'instagram',tiktok:'tiktok',x:'twitter',email:'email'};
function syncSocials(){
if(!DB.platforms||!DB.platforms.length)return;
const s={};
DB.platforms.forEach(p=>{const k=SOC_MAP[p.icon];if(k&&p.url)s[k]=p.url});
DB.socials=s;
}
const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
function syncThemeBtn(){const t=document.documentElement.getAttribute('data-admin-theme');$('#themeToggle').innerHTML=t==='light'?MOON:SUN}
$('#themeToggle').addEventListener('click',()=>{const t=document.documentElement.getAttribute('data-admin-theme')==='light'?'dark':'light';document.documentElement.setAttribute('data-admin-theme',t);localStorage.setItem('an_ui_theme',t);syncThemeBtn()});
syncThemeBtn();
/* v16: toast queue — stack rapi, gak overlap */
let toastStack=[];
function toast(m,err){const d=document.createElement('div');d.className='toast'+(err?' err':'');d.textContent=m;d.style.bottom=(20+toastStack.length*54)+'px';toastStack.push(d);document.body.appendChild(d);setTimeout(()=>{d.remove();toastStack=toastStack.filter(x=>x!==d)},2600)}
function status(m,err){
const el=document.getElementById('status');
const ic=err
?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:8px"><path d="M18 6L6 18M6 6l12 12"/></svg>'
:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:-2px;margin-right:8px"><path d="M20 6L9 17l-5-5"/></svg>';
el.innerHTML=ic+String(m).replace(/</g,'&lt;');
el.className=err?'status-bar show error':'status-bar show';
}
let draftT=null;
function saveDraft(){try{localStorage.setItem('an_draft',JSON.stringify({c:DB,r:DBR}))}catch(e){}}
function markDirty(){DIRTY=true;$('#save').classList.add('dirty');clearTimeout(draftT);draftT=setTimeout(saveDraft,600)}
function clearDirty(){DIRTY=false;$('#save').classList.remove('dirty')}
function headers(){return{Authorization:`Bearer ${TOKEN}`,Accept:'application/vnd.github+json'}}
function showEditor(){$('#authBox').hidden=true;$('#editor').hidden=false}
function defaultDB(){return{hero:{},stats:{},socials:{},bio:{},texts:{},featured:{spotify:[],youtube:[],soundcloud:[]},platforms:[],theme:1,dropBoard:{},license:''}}
const lines=v=>String(v||'').split('\n').map(s=>s.trim()).filter(Boolean);
/* v16: loading skeletons */
function skeletonize(){
const chart=$('#dChart');if(chart)chart.innerHTML='<div class="skeleton" style="height:80px"></div>';
['relRows','platRows'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<div class="skeleton" style="height:64px;margin-bottom:12px"></div><div class="skeleton" style="height:64px;margin-bottom:12px"></div><div class="skeleton" style="height:64px"></div>'});
}
function switchTab(t){
document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.tab===t));
document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
const p=document.getElementById('panel-'+t);if(p)p.classList.add('active');
$('#panelTitle').textContent=TITLES[t]||'';
}
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>switchTab(n.dataset.tab)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.goto)));
async function loadFile(path){
const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{headers:headers()});
if(r.status===404)return{sha:null,data:null};
if(r.status===401||r.status===403)throw new Error('Token ditolak (401/403)');
if(!r.ok)throw new Error('GitHub error '+r.status);
const d=await r.json();return{sha:d.sha,data:JSON.parse(dec(d.content))};
}
async function putFile(path,sha,data,msg){
const body={message:msg,content:enc(JSON.stringify(data,null,2)),branch:BRANCH};
if(sha)body.sha=sha;
const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify(body)});
if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||('GitHub error '+r.status))}
const d=await r.json();return d.content.sha;
}
async function uploadMedia(file){
if(file.size>5*1024*1024){toast('File terlalu besar (max 5MB)',true);return}
const reader=new FileReader();
reader.onload=async()=>{
const base64=reader.result.split(',')[1];
const filename=file.name.replace(/\s+/g,'-').toLowerCase();
const path=`assets/media/${filename}`;
status(`Uploading ${filename}...`);
try{
const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({message:`chore(media): upload ${filename}`,content:base64,branch:BRANCH})});
if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||'Upload failed')}
const url=`https://akbarnawasunda.my.id/assets/media/${filename}`;
await navigator.clipboard.writeText(url);
status(`Upload sukses! URL ke-copy: ${url}`);
toast('Uploaded! URL ke-copy ke clipboard.');
loadMedia();
}catch(e){status('Upload gagal: '+e.message,true);toast('Upload gagal: '+e.message,true)}
};
reader.readAsDataURL(file);
}
async function loadMedia(){
const grid=$('#mediaGrid');
if(!grid)return;
grid.innerHTML='<p class="hint">Loading...</p>';
try{
const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/assets/media`,{headers:headers()});
if(!r.ok){grid.innerHTML='<p class="hint">Belum ada file di assets/media/</p>';return}
const files=await r.json();
grid.innerHTML='';
files.filter(f=>f.type==='file').forEach(f=>{
const item=document.createElement('div');
item.className='media-item';
const url=`https://akbarnawasunda.my.id/assets/media/${f.name}`;
const isImage=/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
item.innerHTML=`${isImage?`<img src="${f.download_url}" alt="${f.name}">`:'<div style="height:80px;display:flex;align-items:center;justify-content:center;background:var(--panel-hover);border-radius:4px;margin-bottom:8px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg></div>'}<div class="name">${f.name}</div>`;
item.addEventListener('click',async()=>{
await navigator.clipboard.writeText(url);
toast(`URL ${f.name} ke-copy!`);
});
grid.appendChild(item);
});
}catch(e){grid.innerHTML='<p class="hint">Gagal load media: '+e.message+'</p>'}
}
function renderChart(){
const box=$('#dChart');if(!box)return;
const counts={};
DBR.releases.forEach(r=>{const m=String(r.date||'').match(/\d{4}/);if(m)counts[m[0]]=(counts[m[0]]||0)+1});
const years=Object.keys(counts).sort();
if(!years.length){box.innerHTML='<span class="hint">Belum ada data tahun di releases.</span>';return}
const max=Math.max(...years.map(y=>counts[y]));
box.innerHTML=years.map(y=>`<div class="bar-col"><div class="bar" style="height:${Math.round(counts[y]/max*100)}%" title="${y}: ${counts[y]} rilis"></div><span>${y.slice(2)}</span></div>`).join('');
}
function fillDash(){
$('#dRel').textContent=DBR.releases.length;
$('#dPlat').textContent=DB.platforms.length;
$('#dEmb').textContent=(DB.featured.spotify||[]).length+(DB.featured.youtube||[]).length+(DB.featured.soundcloud||[]).length;
$('#dTheme').textContent=['NEON','MELUNA','KAMPUNG'][+DB.theme-1]||'NEON';
renderChart();
}
function sanitize(){
['hero','stats','socials','bio','texts','featured','dropBoard'].forEach(k=>{DB[k]=DB[k]||{}});
DB.theme=DB.theme||1;DB.platforms=Array.isArray(DB.platforms)?DB.platforms:[];
['spotify','youtube','soundcloud'].forEach(k=>{if(typeof DB.featured[k]==='string')DB.featured[k]=[DB.featured[k]];DB.featured[k]=DB.featured[k]||[]});
if(!DBR||!Array.isArray(DBR.releases))DBR={releases:[]};
}
function validateJSON(){
try{
JSON.stringify(DB,null,2);
JSON.stringify(DBR,null,2);
return{valid:true};
}catch(e){
return{valid:false,error:e.message};
}
}
async function load(){
status('Loading data dari repo...');
skeletonize();
const [c,rl]=await Promise.all([loadFile(PATH_C),loadFile(PATH_R)]);
SHA_C=c.sha;DB=c.data||defaultDB();
SHA_R=rl.sha;DBR=rl.data||{releases:[]};
sanitize();
showEditor();populateFields();renderRelRows();renderPlatRows();syncThemeCards();fillDash();clearDirty();
status('Data berhasil dimuat. Siap diedit!');
if(localStorage.getItem('an_draft'))$('#draftBar').hidden=false;
loadMedia();
}
$('#draftYes').addEventListener('click',()=>{
try{const p=JSON.parse(localStorage.getItem('an_draft'));DB=p.c||DB;DBR=p.r||DBR;sanitize();populateFields();renderRelRows();renderPlatRows();syncThemeCards();fillDash();markDirty();toast('Draft di-restore. Jangan lupa Save & Deploy.')}catch(e){toast('Draft rusak, dibuang.',true)}
localStorage.removeItem('an_draft');$('#draftBar').hidden=true;
});
$('#draftNo').addEventListener('click',()=>{localStorage.removeItem('an_draft');$('#draftBar').hidden=true;toast('Draft dibuang.')});
function getVal(path){let o=DB;for(const p of path.split('.')){o=o?.[p];if(o==null)return ''}return o}
function setVal(path,val){const ps=path.split('.');let o=DB;for(let i=0;i<ps.length-1;i++){if(!o[ps[i]])o[ps[i]]={};o=o[ps[i]]}o[ps[ps.length-1]]=val}
function populateFields(){
document.querySelectorAll('[data-f]').forEach(el=>{el.value=getVal(el.dataset.f)});
$('#bioShort').value=DB.bio[CURRENT_LANG]?.short||'';
$('#bioLong').value=DB.bio[CURRENT_LANG]?.long||'';
$('#featSp').value=(DB.featured.spotify||[]).join('\n');
$('#featYt').value=(DB.featured.youtube||[]).join('\n');
$('#featSC').value=(DB.featured.soundcloud||[]).join('\n');
}
function bindStatic(){
document.querySelectorAll('[data-f]').forEach(el=>el.addEventListener('input',()=>{setVal(el.dataset.f,el.value);markDirty()}));
$('#bioShort').addEventListener('input',e=>{if(!DB.bio[CURRENT_LANG])DB.bio[CURRENT_LANG]={short:'',long:''};DB.bio[CURRENT_LANG].short=e.target.value;markDirty()});
$('#bioLong').addEventListener('input',e=>{if(!DB.bio[CURRENT_LANG])DB.bio[CURRENT_LANG]={short:'',long:''};DB.bio[CURRENT_LANG].long=e.target.value;markDirty()});
$('#featSp').addEventListener('input',e=>{DB.featured.spotify=lines(e.target.value);markDirty()});
$('#featYt').addEventListener('input',e=>{DB.featured.youtube=lines(e.target.value);markDirty()});
$('#featSC').addEventListener('input',e=>{DB.featured.soundcloud=lines(e.target.value);markDirty()});
document.querySelectorAll('.theme-card').forEach(c=>c.addEventListener('click',()=>{DB.theme=+c.dataset.theme;syncThemeCards();markDirty()}));
$('#relSearch').addEventListener('input',applyRelFilter);
}
function syncThemeCards(){document.querySelectorAll('.theme-card').forEach(c=>c.classList.toggle('active',+c.dataset.theme===+DB.theme))}
bindStatic();
const UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
const DN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
const DL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
function renderPlatRows(){
const box=$('#platRows');box.innerHTML='';
DB.platforms.forEach((p,i)=>{
p.icon=String(p.icon||'').toLowerCase();if(p.icon==='twitter')p.icon='x';p.color=DEF_COLOR[p.icon]||p.color||'#6c63ff';
const row=document.createElement('div');row.className='data-card';
row.innerHTML=`
<div class="data-row-top">
<select class="pp-icon">${ICON_KEYS.map(k=>`<option value="${k}">${k.toUpperCase()}</option>`).join('')}</select>
<input class="pp-name" placeholder="Nama Platform *">
<input class="pp-sub" placeholder="Sub Label">
<div class="action-btns"><button class="icon-btn rr-up">${UP}</button><button class="icon-btn rr-down">${DN}</button><button class="icon-btn del rr-del">${DL}</button></div>
</div>
<div class="data-row-bot"><input class="pp-url" style="grid-column:1/-1" placeholder="URL Platform *"></div>`;
row.querySelector('.pp-icon').value=p.icon||'globe';
row.querySelector('.pp-name').value=p.name||'';
row.querySelector('.pp-sub').value=p.sub||'';
row.querySelector('.pp-url').value=p.url||'';
row.querySelector('.pp-icon').addEventListener('input',e=>{p.icon=e.target.value;p.color=DEF_COLOR[p.icon]||p.color;markDirty()});
row.querySelector('.pp-name').addEventListener('input',e=>{p.name=e.target.value;markDirty()});
row.querySelector('.pp-sub').addEventListener('input',e=>{p.sub=e.target.value;markDirty()});
row.querySelector('.pp-url').addEventListener('input',e=>{p.url=e.target.value;markDirty()});
row.querySelector('.rr-up').addEventListener('click',()=>{if(i>0){[DB.platforms[i-1],DB.platforms[i]]=[DB.platforms[i],DB.platforms[i-1]];renderPlatRows();markDirty()}});
row.querySelector('.rr-down').addEventListener('click',()=>{if(i<DB.platforms.length-1){[DB.platforms[i+1],DB.platforms[i]]=[DB.platforms[i],DB.platforms[i+1]];renderPlatRows();markDirty()}});
row.querySelector('.rr-del').addEventListener('click',()=>{if(!confirm('Hapus platform ini?'))return;DB.platforms.splice(i,1);renderPlatRows();markDirty()});
box.appendChild(row);
});
}
$('#seedPlat').addEventListener('click',()=>{
if(DB.platforms.length&&!confirm('Timpa list platforms sekarang dengan 11 default?'))return;
DB.platforms=DEFAULT_PLATS.map(p=>Object.assign({},p));
renderPlatRows();markDirty();
toast('11 platform default dimuat. Edit sesuka lu, terus Save.');
});
$('#addPlat').addEventListener('click',()=>{DB.platforms.push({icon:'note',name:'',sub:'',url:'',color:DEF_COLOR.note});renderPlatRows();markDirty()});
function applyRelFilter(){
const q=($('#relSearch').value||'').toLowerCase();
document.querySelectorAll('#relRows .data-card').forEach((el,i)=>{
el.style.display=(DBR.releases[i]&&(DBR.releases[i].title||'').toLowerCase().includes(q))?'':'none';
});
}
function renderRelRows(){
const box=$('#relRows');box.innerHTML='';
DBR.releases.forEach((r,i)=>{
const row=document.createElement('div');row.className='data-card';
row.innerHTML=`
<div class="data-row-top">
<img class="rr-thumb" alt="">
<select class="rr-cat"><option value="originals">ORIGINAL</option><option value="remixes">REMIX</option></select>
<input class="rr-title" placeholder="Judul Track *">
<input class="rr-date" placeholder="JUN 2025">
<select class="rr-type"><option>SINGLE</option><option>EP</option><option>REMIX</option><option>BOOTLEG</option></select>
<div class="action-btns"><button class="icon-btn rr-up">${UP}</button><button class="icon-btn rr-down">${DN}</button><button class="icon-btn del rr-del">${DL}</button></div>
</div>
<div class="data-row-bot">
<input class="rr-art" placeholder="URL Cover Art (opsional)">
<input class="rr-link" placeholder="URL Link Utama">
<input class="rr-sc" placeholder="URL SoundCloud (opsional)">
</div>`;
const th=row.querySelector('.rr-thumb');
function setTh(v){if(v){th.src=String(v).replace(/^http:/,'https:');th.style.visibility='visible'}else th.style.visibility='hidden'}
setTh(r.art);
th.onerror=()=>{th.style.visibility='hidden'};
row.querySelector('.rr-cat').value=r.cat||'originals';
row.querySelector('.rr-type').value=r.type||'SINGLE';
row.querySelector('.rr-title').value=r.title||'';
row.querySelector('.rr-date').value=r.date||'';
row.querySelector('.rr-art').value=r.art||'';
row.querySelector('.rr-link').value=r.link||'';
row.querySelector('.rr-sc').value=r.soundcloud||'';
row.querySelector('.rr-cat').addEventListener('input',e=>{r.cat=e.target.value;markDirty()});
row.querySelector('.rr-type').addEventListener('input',e=>{r.type=e.target.value;markDirty()});
row.querySelector('.rr-title').addEventListener('input',e=>{r.title=e.target.value;markDirty()});
row.querySelector('.rr-date').addEventListener('input',e=>{r.date=e.target.value;markDirty()});
row.querySelector('.rr-art').addEventListener('input',e=>{r.art=e.target.value;setTh(r.art);markDirty()});
row.querySelector('.rr-link').addEventListener('input',e=>{r.link=e.target.value;markDirty()});
row.querySelector('.rr-sc').addEventListener('input',e=>{r.soundcloud=e.target.value;markDirty()});
row.querySelector('.rr-up').addEventListener('click',()=>{if(i>0){[DBR.releases[i-1],DBR.releases[i]]=[DBR.releases[i],DBR.releases[i-1]];renderRelRows();markDirty()}});
row.querySelector('.rr-down').addEventListener('click',()=>{if(i<DBR.releases.length-1){[DBR.releases[i+1],DBR.releases[i]]=[DBR.releases[i],DBR.releases[i+1]];renderRelRows();markDirty()}});
row.querySelector('.rr-del').addEventListener('click',()=>{if(!confirm('Hapus release ini?'))return;DBR.releases.splice(i,1);renderRelRows();markDirty()});
box.appendChild(row);
});
applyRelFilter();
}
$('#addRel').addEventListener('click',()=>{DBR.releases.unshift({cat:'originals',title:'',date:'',type:'SINGLE',art:'',link:'',soundcloud:''});renderRelRows();markDirty()});
/* v16: fuzzy search palette */
function fuzzy(q,s){
q=(q||'').toLowerCase();s=(s||'').toLowerCase();
if(!q)return true;
let i=0;
for(let c=0;c<s.length;c++){if(s[c]===q[i])i++;if(i===q.length)return true}
return false;
}
function openPal(){$('#palette').hidden=false;$('#palInput').value='';renderPal('');$('#palInput').focus()}
function closePal(){$('#palette').hidden=true}
function renderPal(q){
const items=[];
Object.keys(TITLES).forEach(t=>items.push({label:'Buka: '+TITLES[t],k:'TAB',fn:()=>switchTab(t)}));
items.push({label:'Save & Deploy',k:'CTRL+S',fn:()=>$('#save').click()});
items.push({label:'Reload data',k:'ACT',fn:()=>load().catch(e=>status(e.message,true))});
items.push({label:'Tambah release baru',k:'ACT',fn:()=>{switchTab('releases');$('#addRel').click()}});
items.push({label:'Tambah platform baru',k:'ACT',fn:()=>{switchTab('platforms');$('#addPlat').click()}});
items.push({label:'Ganti dark/light mode',k:'UI',fn:()=>$('#themeToggle').click()});
items.push({label:'View site',k:'EXT',fn:()=>window.open('https://akbarnawasunda.my.id','_blank')});
items.push({label:'Disconnect',k:'ACT',fn:()=>{localStorage.removeItem('an_token');location.reload()}});
const f=items.filter(x=>fuzzy(q,x.label));
$('#palList').innerHTML=f.map((x,i)=>`<div class="pal-item" data-i="${i}">${x.label}<span class="k">${x.k}</span></div>`).join('')||'<div class="pal-item">Gak ketemu.</div>';
$('#palList').querySelectorAll('.pal-item').forEach(el=>{el.addEventListener('click',()=>{const x=f[+el.dataset.i];if(x){closePal();x.fn()}})});
}
$('#palBtn').addEventListener('click',openPal);
$('#palClose').addEventListener('click',closePal);
$('#palInput').addEventListener('input',e=>renderPal(e.target.value));
$('#palette').addEventListener('click',e=>{if(e.target.id==='palette')closePal()});
$('#login').addEventListener('click',async()=>{
const t=$('#token').value.trim();if(!t)return status('Token gak boleh kosong!',true);
TOKEN=t;localStorage.setItem('an_token',t);
try{await load()}catch(e){status(e.message,true)}
});
$('#reload').addEventListener('click',()=>load().catch(e=>status(e.message,true)));
$('#logout').addEventListener('click',()=>{localStorage.removeItem('an_token');location.reload()});
$('#save').addEventListener('click',async()=>{
const validation=validateJSON();
if(!validation.valid){
status('JSON invalid: '+validation.error,true);
toast('JSON rusak: '+validation.error,true);
return;
}
status('Menyimpan ke GitHub...');
try{
syncSocials();
SHA_C=await putFile(PATH_C,SHA_C,DB,'chore(admin): update content via v16');
SHA_R=await putFile(PATH_R,SHA_R,DBR,'chore(admin): update releases via v16');
clearDirty();fillDash();
localStorage.removeItem('an_draft');$('#draftBar').hidden=true;
status('Berhasil disimpan! Vercel bakal deploy dalam ±60 detik.');
toast('Deployed! Site live dalam ±60 detik.');
}catch(e){status(e.message,true);toast('Gagal save: '+e.message,true)}
});
document.querySelectorAll('.lang-tab').forEach(tab=>tab.addEventListener('click',()=>{
document.querySelectorAll('.lang-tab').forEach(t=>t.classList.remove('active'));
tab.classList.add('active');
CURRENT_LANG=tab.dataset.lang;
$('#bioShort').value=DB.bio[CURRENT_LANG]?.short||'';
$('#bioLong').value=DB.bio[CURRENT_LANG]?.long||'';
}));
document.addEventListener('keydown',e=>{
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#palette').hidden?openPal():closePal();return}
if(e.key==='Escape')closePal();
if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();$('#save').click()}
});
window.addEventListener('beforeunload',e=>{
if(DIRTY){e.preventDefault();e.returnValue=''}
});
const dropZone=$('#dropZone');
const fileInput=$('#fileInput');
if(dropZone&&fileInput){
dropZone.addEventListener('click',()=>fileInput.click());
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('dragover')});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop',e=>{
e.preventDefault();
dropZone.classList.remove('dragover');
const file=e.dataTransfer.files[0];
if(file)uploadMedia(file);
});
fileInput.addEventListener('change',e=>{
const file=e.target.files[0];
if(file)uploadMedia(file);
e.target.value='';
});
}
if(TOKEN)load().catch(e=>status(e.message+' (Coba login ulang)',true));