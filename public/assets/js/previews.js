/* ===== PREVIEWS PACK v1 — preview 30s di kartu release ===== */
(function(){
var rail=document.getElementById('relRail');
if(!rail)return;
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim()}
var MAP=null;
function loadMap(done){
if(MAP)return done(MAP);
fetch('https://itunes.apple.com/search?term='+encodeURIComponent('Akbar Nawasunda')+'&entity=song&limit=50')
.then(function(response){if(!response.ok)throw new Error('iTunes search failed');return response.json()})
.then(function(d){MAP={};((d&&d.results)||[]).forEach(function(r){var k=norm(r.trackName);if(k&&!MAP[k]&&r.previewUrl)MAP[k]=r.previewUrl});done(MAP)})
.catch(function(){MAP={};done(MAP)});
}
var audio=null,curBtn=null;
function stopAll(){if(audio){audio.pause();audio=null}if(curBtn){curBtn.classList.remove('playing');curBtn=null}}
function attach(card){
if(card.querySelector('.prev-btn'))return;
var title=norm(card.dataset.title);
if(!title)return;
loadMap(function(map){
var url=map[title];
if(!url){var hit=Object.keys(map).find(function(k){return k.includes(title)||title.includes(k)});if(hit)url=map[hit]}
if(!url)return;
card.classList.add('hasprev');
var th=card.querySelector('.rel-thumb');
var tag=document.createElement('span');tag.className='prev-tag';tag.textContent='PREVIEW 30s';
var b=document.createElement('button');b.className='prev-btn';b.setAttribute('aria-label','play preview');
b.innerHTML='<svg class="play-ic" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg><span class="eq"><i></i><i></i><i></i></span>';
th.appendChild(tag);th.appendChild(b);
b.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
if(curBtn===b){stopAll();return}
stopAll();
audio=new Audio(url);audio.play();
curBtn=b;b.classList.add('playing');
audio.addEventListener('ended',stopAll);
});
});
}
function scan(){rail.querySelectorAll('.rel-card').forEach(attach)}
scan();
new MutationObserver(scan).observe(rail,{childList:true});
})();
