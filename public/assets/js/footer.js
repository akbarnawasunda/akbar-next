/* ===== FOOTER SYNC v1 — footer dinamis dari content.json ===== */
(function(){
fetch('data/content.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(db){
var f=(db&&db.footer)||{};
function set(id,v){var el=document.getElementById(id);if(el&&v)el.textContent=v}
var c=document.getElementById('ftCopy');
if(c&&(f.year||f.name))c.textContent='© '+(f.year||'2026')+' '+(f.name||'AKBAR NAWASUNDA');
if(f.rights){var r=document.getElementById('ftRights');if(r){r.textContent=f.rights;r.removeAttribute('data-i18n')}}
set('ftStatus',f.status);
set('ftCity',f.city);
set('ftTz',f.tz);
var link=document.getElementById('ftCityLink');
if(link&&f.maps){link.href=f.maps;link.target='_blank';link.rel='noopener'}
});
})();
