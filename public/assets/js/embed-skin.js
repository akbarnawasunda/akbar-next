/* ===== EMBED SKIN v2 — Martin Garrix typography ===== */
(function(){
function skin(card){
if(card.dataset.skinned)return;
card.dataset.skinned='1';
var k=card.querySelector('.embed-kind');
if(k&&k.parentElement!==card)card.appendChild(k);
if(!card.querySelector('.embed-credit')){
var cr=document.createElement('span');
cr.className='embed-credit';
cr.textContent=/YOUTUBE/.test(k?k.textContent:'')?'DJ Akbar Remix':'Akbar Nawasunda';
var meta=card.querySelector('.embed-meta');
if(meta)meta.appendChild(cr);
}
if(!card.querySelector('.embed-play')){
var p=document.createElement('span');
p.className='embed-play';
p.innerHTML='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
card.appendChild(p);
}
}
function scan(){document.querySelectorAll('.embed-card').forEach(skin)}
scan();
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();
