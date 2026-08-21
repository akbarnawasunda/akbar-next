/* AN SW v3 — direct asset paths — navigasi network-first, asset stale-while-revalidate */
var CACHE='an-shell-v3';
self.addEventListener('install',function(e){
e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(['/','/manifest.webmanifest','/assets/media/favicon.png'])}));
self.skipWaiting();
});
self.addEventListener('activate',function(e){
e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}));
self.clients.claim();
});
self.addEventListener('fetch',function(e){
var u=new URL(e.request.url);
if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
if(u.pathname.indexOf('/data/')===0||u.pathname.indexOf('/admin')===0||u.pathname.indexOf('/epk')===0)return;
if(e.request.mode==='navigate'){
e.respondWith(fetch(e.request).then(function(res){
var copy=res.clone();caches.open(CACHE).then(function(c){c.put('/index.html',copy)});
return res;
}).catch(function(){return caches.match('/index.html')}));
return;
}
e.respondWith(caches.match(e.request).then(function(hit){
var fetched=fetch(e.request).then(function(res){
if(res.ok&&res.type==='basic'){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy)})}
return res;
});
return hit||fetched;
}));
});