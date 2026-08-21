/* ===== 0. BUILD STAMP ===== */
const BUILD = 'v15-smooth';
console.log('%cAKBAR NAWASUNDA // ' + BUILD, 'color:#ff00e4;font-family:monospace;font-size:12px');
(function(){
  const b = document.createElement('span');
  b.className = 'build-tag';
  b.textContent = '© Akbar Nawasunda';
  document.body.appendChild(b);
})();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== 1. BAHASA ===== */
let currentLang = 'id';
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const langFlags = {
  id: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="4" fill="#e70011"/><rect y="4" width="12" height="4" fill="#fff"/></svg>',
  en: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="8" fill="#b22234"/><rect y="1.1" width="12" height="1.1" fill="#fff"/><rect y="3.4" width="12" height="1.1" fill="#fff"/><rect y="5.7" width="12" height="1.1" fill="#fff"/><rect width="5" height="4" fill="#3c3b6e"/></svg>',
  zh: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="8" fill="#de2910"/><path d="M2 1l.5 1.1 1.2.1-.9.8.3 1.2-1.1-.6-1.1.6.3-1.2-.9-.8 1.2-.1z" fill="#ffde00"/></svg>',
  ja: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="8" fill="#fff"/><circle cx="6" cy="4" r="2.2" fill="#bc002d"/></svg>',
  ko: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="8" fill="#fff"/><circle cx="6" cy="4" r="2" fill="#cd2e3a"/><path d="M4 4a2 2 0 0 0 4 0z" fill="#0047a0"/></svg>',
  es: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="8" fill="#aa151b"/><rect y="2" width="12" height="4" fill="#f1bf00"/></svg>',
  ar: '<svg class="flag" viewBox="0 0 12 8"><rect width="12" height="8" fill="#165d31"/><path d="M2.5 3h7M2.5 4.6h5" stroke="#fff" stroke-width=".7"/></svg>'
};
function clean(s) {
  return String(s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{25A0}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2022}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
langBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  langMenu.classList.toggle('show');
});
document.addEventListener('click', function() {
  langMenu.classList.remove('show');
});
function applyTranslations() {
  const t = (typeof translations !== 'undefined') ? translations[currentLang] : null;
  if (!t) return;
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const k = el.getAttribute('data-i18n');
    if (t[k]) el.textContent = clean(String(t[k]));
  });
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
}
document.querySelectorAll('.lang-option').forEach(function(opt) {
  opt.addEventListener('click', function() {
    currentLang = this.dataset.lang;
    document.querySelectorAll('.lang-option').forEach(function(o) { o.classList.remove('active'); });
    this.classList.add('active');
    langBtn.innerHTML = langFlags[currentLang] + ' ' + currentLang.toUpperCase();
    langMenu.classList.remove('show');
    applyTranslations();
  });
});
applyTranslations();

/* ===== 2. CURSOR (SMOOTH: transform, bukan left/top) ===== */
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
if (cursor && cursorDot) {
  document.addEventListener('mousemove', function(e) {
    var t = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0) translate(-50%,-50%)';
    cursor.style.transform = t;
    cursorDot.style.transform = t;
  }, { passive: true });
  document.querySelectorAll('a,button,.yt-card,.plat,.rel-card,.chip,.chip-stat,.stop-btn,.embed-placeholder,.pad,.marquee,input,select,textarea,.lang-option,.step,.ms').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      cursor.classList.add('hover');
      cursorDot.classList.add('hover');
    });
    el.addEventListener('mouseleave', function() {
      cursor.classList.remove('hover');
      cursorDot.classList.remove('hover');
    });
  });
}

/* ===== 3. MENU MOBILE ===== */
const navBtn = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navBtn && navLinks) {
  navBtn.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    navBtn.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      navLinks.classList.remove('open');
      navBtn.classList.remove('open');
    });
  });
}

/* ===== 4. SCROLL PROGRESS (SMOOTH: scaleX, bukan width) ===== */
const prog = document.querySelector('.progress');
if (prog) {
  prog.style.width = '100%';
  prog.style.transformOrigin = '0 50%';
  prog.style.transform = 'scaleX(0)';
  window.addEventListener('scroll', function() {
    const h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
  }, { passive: true });
}

/* ===== 5. REVEAL 3D ===== */
const observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0) rotateX(0)';
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('section').forEach(function(s) {
  s.style.opacity = '0';
  s.style.transform = 'perspective(900px) translateY(28px) rotateX(8deg)';
  s.style.transition = 'opacity .7s ease, transform .7s ease';
  observer.observe(s);
});

/* ===== 6. TILT & MAGNETIC ===== */
if (matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.tilt').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.transform = 'perspective(1000px) rotateX(' + ((y - r.height / 2) / 15) + 'deg) rotateY(' + ((r.width / 2 - x) / 15) + 'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
  document.querySelectorAll('.magnetic').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      const r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px, ' + ((e.clientY - r.top - r.height / 2) * 0.2) + 'px)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  });
}

/* ===== 7. TITLE AUTOFIT + 3D FLOAT ===== */
function fitTitle() {
  const t = document.querySelector('.led-title');
  if (!t) return;
  const t2 = t.querySelector('.t2') || t;
  t.style.fontSize = '';
  const max = (t.parentElement ? t.parentElement.clientWidth : innerWidth) - 4;
  const w = t2.scrollWidth;
  if (w > max) {
    const cur = parseFloat(getComputedStyle(t).fontSize) || 40;
    t.style.fontSize = Math.max(18, Math.floor(cur * max / w)) + 'px';
  }
}
addEventListener('resize', fitTitle);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);
fitTitle();
(function() {
  const title = document.querySelector('.led-title');
  const hero = document.querySelector('.hero');
  if (!title || !hero) return;
  let mx = 0, my = 0;
  hero.addEventListener('mousemove', function(e) {
    const r = title.getBoundingClientRect();
    mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
  });
  hero.addEventListener('mouseleave', function() { mx = 0; my = 0; });
  (function loop() {
    const t = performance.now() / 1000;
    const swing = Math.sin(t * 0.8) * 4;
    const bob = Math.sin(t * 1.6) * 6;
    title.style.transform = 'perspective(900px) translateY(' + bob + 'px) rotateX(' + (-my * 8).toFixed(2) + 'deg) rotateY(' + (swing + mx * 10).toFixed(2) + 'deg)';
    requestAnimationFrame(loop);
  })();
})();

/* ===== 8. 3D BACKGROUND ===== */
(function() {
  if (typeof THREE === 'undefined') return;
  if (window.innerWidth < 760) return;
  const canvas = document.getElementById('bg3d');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 8;
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(2.2, 0.55, 120, 16),
    new THREE.MeshBasicMaterial({ color: 0xff00e4, wireframe: true, transparent: true, opacity: 0.14 })
  );
  scene.add(knot);
  const vinyl = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.08, 48),
    new THREE.MeshBasicMaterial({ color: 0x00ffd5, wireframe: true, transparent: true, opacity: 0.12 })
  );
  vinyl.rotation.x = Math.PI / 2.4;
  vinyl.position.set(3.4, -1.2, -2);
  scene.add(vinyl);
  const pGeo = new THREE.BufferGeometry();
  const N = 160;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffd319, size: 0.05, transparent: true, opacity: 0.5 })));
  let mx = 0, my = 0;
  hero.addEventListener('mousemove', function(e) {
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  let heroOn = true;
  new IntersectionObserver(function(e) { heroOn = e[0].isIntersecting; }).observe(hero);
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    if (!heroOn) return;
    t += 0.005;
    knot.rotation.x = t * 0.7;
    knot.rotation.y = t;
    vinyl.rotation.z -= 0.02;
    camera.position.x += ((mx * 1.2) - camera.position.x) * 0.05;
    camera.position.y += ((-my * 0.8) - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();
})();

/* ===== 8B. VINYL TURNTABLE (SMOOTH: dpr mobile cap + frame-skip) ===== */
(function() {
  const cv = document.getElementById('speaker');
  const stateEl = document.getElementById('spkState');
  if (!cv) return;
  const c = cv.getContext('2d');
  const isMobile = matchMedia('(max-width:760px)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
  let W = 0, H = 0;
  function size() {
    const r = cv.getBoundingClientRect();
    W = cv.width = Math.max(1, Math.round(r.width * dpr));
    H = cv.height = Math.max(1, Math.round(r.height * dpr));
  }
  size();
  window.addEventListener('resize', size);
  const logoImg = new Image();
  let logoReady = false;
  logoImg.onload = function(){ logoReady = true; };
  logoImg.src = '/assets/media/logo-an.png';
  let NEON = [255,0,228], CYAN = [0,255,213], GOLD = [255,211,25];
  function hex2rgb(h){h=String(h||'').trim().replace('#','');if(h.length===3)h=h.split('').map(function(x){return x+x}).join('');var n=parseInt(h,16);return isNaN(n)?null:[(n>>16)&255,(n>>8)&255,n&255]}
  function readTheme(){
    const cs=getComputedStyle(document.documentElement);
    NEON=hex2rgb(cs.getPropertyValue('--neon'))||NEON;
    CYAN=hex2rgb(cs.getPropertyValue('--cyan'))||CYAN;
    GOLD=hex2rgb(cs.getPropertyValue('--yellow'))||GOLD;
  }
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  let push=0, pushT=0, rave=0, pid=null, ly=0, ang=0, ringT=0;
  if (matchMedia('(hover:hover)').matches) {
    cv.addEventListener('pointerdown', function(e){pid=e.pointerId;cv.setPointerCapture(pid);ly=e.clientY;});
    cv.addEventListener('pointermove', function(e){if(e.pointerId!==pid)return;pushT=Math.min(1,Math.max(0,pushT+(ly-e.clientY)*0.005));ly=e.clientY;});
    ['pointerup','pointercancel'].forEach(function(ev){cv.addEventListener(ev,function(){pid=null;});});
    cv.addEventListener('dblclick', function(){pushT=0;});
  }
  const raveBtn=document.getElementById('raveToggle');
  const raveCtl=document.querySelector('.rave-ctl');
  if (raveBtn) raveBtn.addEventListener('click', function(){pushT=pushT>0.5?0:1;});
  let on=true;
  new IntersectionObserver(function(e){on=e[0].isIntersecting;}).observe(cv);
  function rgba(col,a){return 'rgba('+col[0]+','+col[1]+','+col[2]+','+a+')'}
  let f=0;
  const skip=isMobile?2:1;
  function loop(){
    requestAnimationFrame(loop);
    if(!on||!W)return;
    if(++f%skip)return;
    const b=(window.AUDIO&&AUDIO.getBands())||{bass:0,mid:0,high:0,level:0};
    push+=(pushT-push)*0.08;
    const isRave=push>0.66;
    rave+=((isRave?1:0)-rave)*0.06;
    if(stateEl)stateEl.textContent=isRave?'RAVE MODE':'KAMPUNG MODE';
    if(raveBtn){raveBtn.classList.toggle('on',isRave);raveBtn.setAttribute('aria-pressed',isRave?'true':'false');}
    if(raveCtl)raveCtl.classList.toggle('on',isRave);
    c.clearRect(0,0,W,H);
    const cx=W/2, cy=H*0.52, R=Math.min(W,H)*0.42;
    ang+=0.004+b.bass*0.02+push*0.03;
    const glow=c.createRadialGradient(cx,cy,R*0.2,cx,cy,R*1.6);
    glow.addColorStop(0,rgba(NEON,0.10+b.bass*0.15+rave*0.15));
    glow.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=glow;
    c.fillRect(0,0,W,H);
    c.beginPath();c.arc(cx,cy+R*0.06,R*1.04,0,7);
    c.fillStyle='rgba(0,0,0,.45)';c.fill();
    const disc=c.createRadialGradient(cx-R*0.3,cy-R*0.3,R*0.1,cx,cy,R);
    disc.addColorStop(0,'#1b1b1f');disc.addColorStop(0.8,'#0c0c0e');disc.addColorStop(1,'#050506');
    c.beginPath();c.arc(cx,cy,R,0,7);
    c.fillStyle=disc;c.fill();
    c.lineWidth=2*dpr;
    c.strokeStyle=rgba(NEON,0.35+b.bass*0.5);
    c.stroke();
    c.save();
    c.translate(cx,cy);c.rotate(ang);
    for(let i=1;i<=6;i++){
      c.beginPath();c.arc(0,0,R*(0.34+i*0.10),0,7);
      c.strokeStyle='rgba(255,255,255,'+(i%2?0.05:0.03)+')';
      c.lineWidth=1*dpr;c.stroke();
    }
    c.beginPath();c.moveTo(0,0);c.arc(0,0,R*0.98,-0.5,-0.15);c.closePath();
    const wg=c.createRadialGradient(0,0,R*0.2,0,0,R);
    wg.addColorStop(0,'rgba(255,255,255,0)');
    wg.addColorStop(1,'rgba(255,255,255,'+(0.05+b.high*0.08)+')');
    c.fillStyle=wg;c.fill();
    c.beginPath();c.moveTo(0,0);c.arc(0,0,R*0.98,Math.PI-0.5,Math.PI-0.15);c.closePath();
    c.fill();
    c.restore();
    ringT+=0.02+b.mid*0.06;
    for(let i=0;i<2;i++){
      const pr=(ringT+i/2)%1;
      c.beginPath();c.arc(cx,cy,R*(1.02+pr*0.35),0,7);
      c.strokeStyle=rgba(CYAN,(1-pr)*0.25*(0.3+b.bass));
      c.lineWidth=1.5*dpr;c.stroke();
    }
    const lr=R*0.30;
    c.save();
    c.translate(cx,cy);
    c.rotate(ang);
    c.beginPath();c.arc(0,0,lr,0,7);
    c.clip();
    c.fillStyle='#101014';
    c.fillRect(-lr,-lr,lr*2,lr*2);
    c.fillStyle=rgba(NEON,0.18);
    c.fillRect(-lr,-lr,lr*2,lr*2);
    if(logoReady){
      c.drawImage(logoImg,-lr,-lr,lr*2,lr*2);
    }else{
      c.fillStyle='rgba(255,255,255,.92)';
      c.font='bold '+(lr*0.22)+'px monospace';
      c.textAlign='center';
      c.fillText('DJ AKBAR',0,-lr*0.30);
      c.fillText('REMIX',0,-lr*0.05);
    }
    const vg=c.createRadialGradient(0,0,lr*0.55,0,0,lr);
    vg.addColorStop(0,'rgba(0,0,0,0)');
    vg.addColorStop(1,'rgba(0,0,0,.45)');
    c.fillStyle=vg;
    c.fillRect(-lr,-lr,lr*2,lr*2);
    c.restore();
    c.beginPath();c.arc(cx,cy,lr,0,7);
    c.strokeStyle='rgba(0,0,0,.5)';
    c.lineWidth=1.5*dpr;
    c.stroke();
    c.beginPath();c.arc(cx,cy,R*0.03,0,7);
    c.fillStyle='#050506';c.fill();
    c.strokeStyle='rgba(255,255,255,.25)';
    c.lineWidth=1*dpr;
    c.stroke();
    const px=cx+R*1.02, py=cy-R*0.92;
    const armAng=0.5+Math.sin(ang*0.5)*0.02+b.high*0.03;
    const ex=px-Math.sin(armAng)*R*1.45, ey=py+Math.cos(armAng)*R*1.45;
    c.beginPath();c.arc(px,py,R*0.09,0,7);
    c.fillStyle='#151518';c.fill();
    c.strokeStyle=rgba(CYAN,0.5);c.lineWidth=1.5*dpr;c.stroke();
    c.beginPath();c.moveTo(px,py);c.lineTo(ex,ey);
    c.strokeStyle='#2a2a2e';c.lineWidth=4*dpr;c.stroke();
    c.beginPath();c.arc(ex,ey,R*0.05,0,7);
    c.fillStyle=rgba(GOLD,0.9);c.fill();
    if(rave>0.05){
      for(let i=0;i<5;i++){
        if(Math.random()<rave*0.5){
          c.fillStyle=rgba(i%2?NEON:CYAN,0.04+Math.random()*0.12*rave);
          c.fillRect(0,Math.random()*H,W,(2+Math.random()*6)*dpr);
        }
      }
    }
  }
  loop();
})();

/* ===== 8C. HOREG PULSE + STROBE (strobe tetep global, loop-nya murah) ===== */
(function() {
  const hw = document.querySelector('.hero-wrap');
  if (hw && !reduceMotion) {
    let on = true;
    new IntersectionObserver(function(e) { on = e[0].isIntersecting; }).observe(hw);
    (function loop() {
      requestAnimationFrame(loop);
      if (!on || !window.AUDIO) return;
      const b = AUDIO.getBands();
      hw.style.transform = 'scale(' + (1 + b.bass * 0.02) + ')';
    })();
  }
  if (!reduceMotion) {
    let prev = 0, cool = 0;
    (function loop() {
      requestAnimationFrame(loop);
      if (!window.AUDIO) return;
      const b = AUDIO.getBands();
      if (b.mid - prev > 0.1 && cool <= 0) {
        document.body.classList.add('strobe');
        setTimeout(function() { document.body.classList.remove('strobe'); }, 50);
        cool = 14;
      }
      if (cool > 0) cool--;
      prev = b.mid;
    })();
  }
})();

/* ===== 9. CLICK-TO-LOAD EMBEDS ===== */
document.querySelectorAll('.embed-placeholder').forEach(function(ph) {
  ph.addEventListener('click', function() {
    const iframe = document.createElement('iframe');
    iframe.src = ph.dataset.src;
    iframe.style.borderRadius = '8px';
    iframe.style.border = '1px solid var(--line)';
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', ph.dataset.height || '380');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    ph.replaceWith(iframe);
  });
});

/* ===== 10. COVER ART OTOMATIS ===== */
(function loadCovers() {
  function setCover(el, url) {
    el.style.backgroundImage = 'linear-gradient(rgba(13,2,33,.72),rgba(13,2,33,.88)),url(' + url + ')';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  }
  const spPh = document.querySelector('.embed-placeholder[data-cover="spotify"]');
  if (spPh) {
    fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent('https://open.spotify.com/artist/5teZ2VRr7VBSDqZ0ueP3hd'))
      .then(function(r) { return r.json(); })
      .then(function(d) { if (d.thumbnail_url) setCover(spPh, d.thumbnail_url); })
      .catch(function() {});
  }
  const scPh = document.querySelector('.embed-placeholder[data-cover="soundcloud"]');
  if (scPh) {
    fetch('https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent('https://soundcloud.com/akbarnawasunda'))
      .then(function(r) { return r.json(); })
      .then(function(d) { if (d.thumbnail_url) setCover(scPh, d.thumbnail_url); })
      .catch(function() {});
  }
})();

/* ===== 11. RELEASES JSON + THUMBS ===== */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}
function itunesSearch(term, done) {
  var url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(term) + '&entity=song&limit=50';
  fetch(url)
    .then(function(response) {
      if (!response.ok) throw new Error('iTunes search failed');
      return response.json();
    })
    .then(function(data) { done(data); })
    .catch(function() { done(null); });
}
var mapPromise = null;
function getMap() {
  if (!mapPromise) {
    mapPromise = new Promise(function(res) {
      itunesSearch('Akbar Nawasunda', function(d) {
        var map = {};
        ((d && d.results) || []).forEach(function(r) {
          var k = norm(r.trackName);
          if (k && !map[k] && r.artworkUrl100) map[k] = r.artworkUrl100.replace('100x100', '600x600');
        });
        res(map);
      });
    });
  }
  return mapPromise;
}
function setThumb(th, url) {
  th.style.backgroundImage = 'url("' + url.replace(/^http:/, 'https:') + '")';
}
function autoThumb(c) {
  var th = c.querySelector('.rel-thumb');
  if (!th) return;
  if (c.dataset.soundcloud) {
    fetch('https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent(c.dataset.soundcloud))
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.thumbnail_url) setThumb(th, d.thumbnail_url);
        else c.classList.add('noart');
      })
      .catch(function() { c.classList.add('noart'); });
    return;
  }
  getMap().then(function(map) {
    var t = norm(c.dataset.title);
    var art = map[t];
    if (!art && t) {
      var hit = Object.keys(map).find(function(k) { return k.includes(t) || t.includes(k); });
      if (hit) art = map[hit];
    }
    if (art) setThumb(th, art);
    else c.classList.add('noart');
  });
}
function loadThumbs() {
  document.querySelectorAll('.rel-card').forEach(function(c) {
    var th = c.querySelector('.rel-thumb');
    if (!th) return;
    var art = (c.dataset.art || '').trim();
    if (art) {
      var im = new Image();
      im.onload = function() { setThumb(th, art); };
      im.onerror = function() { autoThumb(c); };
      im.src = art.replace(/^http:/, 'https:');
    } else autoThumb(c);
  });
}
function renderReleases(db) {
  var rail = document.getElementById('relRail');
  if (!rail) return;
  rail.innerHTML = '';
  (db.releases || []).forEach(function(r) {
    var url = r.link || r.soundcloud || '';
    var el = document.createElement(url ? 'a' : 'div');
    el.className = 'rel-card';
    el.dataset.cat = r.cat || 'originals';
    el.dataset.title = r.title || '';
    el.dataset.art = r.art || '';
    if (r.soundcloud) el.dataset.soundcloud = r.soundcloud;
    if (url) { el.href = url; el.target = '_blank'; el.rel = 'noopener'; }
    el.innerHTML = '<div class="rel-thumb"></div>' +
      '<span class="rel-yr">' + esc(r.date) + '</span><h4>' + esc(r.title) + '</h4><span class="rel-tp">' + esc(r.type) + '</span>';
    rail.appendChild(el);
  });
}
function applyReleaseFilter() {
  var active = document.querySelector('.release-tabs .chip.active');
  var tab = active ? active.dataset.tab : 'originals';
  document.querySelectorAll('.rel-card').forEach(function(c) {
    c.style.display = c.dataset.cat === tab ? '' : 'none';
  });
}
fetch('data/releases.json', { cache: 'no-cache' })
  .then(function(r) { if (!r.ok) throw 0; return r.json(); })
  .then(function(db) { renderReleases(db); applyReleaseFilter(); loadThumbs(); })
  .catch(function() { applyReleaseFilter(); loadThumbs(); });

/* ===== 12. RELEASE TABS + RAIL DRAG ===== */
document.querySelectorAll('.release-tabs .chip').forEach(function(chip) {
  chip.addEventListener('click', function() {
    document.querySelectorAll('.release-tabs .chip').forEach(function(c) { c.classList.remove('active'); });
    this.classList.add('active');
    applyReleaseFilter();
  });
});
applyReleaseFilter();
var rail = document.getElementById('relRail');
if (rail) {
  var rDown = false, rX = 0, rL = 0;
  rail.addEventListener('pointerdown', function(e) {
    if (e.pointerType !== 'mouse') return;
    rDown = true; rX = e.clientX; rL = rail.scrollLeft;
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener('pointermove', function(e) {
    if (rDown) rail.scrollLeft = rL - (e.clientX - rX);
  }, { passive: true });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(ev) {
    rail.addEventListener(ev, function() { rDown = false; });
  });
}

/* ===== 13. BIO TABS ===== */
document.querySelectorAll('.about-tabs .chip').forEach(function(chip) {
  chip.addEventListener('click', function() {
    document.querySelectorAll('.about-tabs .chip').forEach(function(c) { c.classList.remove('active'); });
    this.classList.add('active');
    document.querySelectorAll('.bio').forEach(function(b) { b.style.display = 'none'; });
    var b = document.querySelector('.bio.' + this.dataset.bio);
    if (b) b.style.display = '';
  });
});

/* ===== 14. FORM COLLAB ===== */
var form = document.getElementById('collabForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var d = Object.fromEntries(new FormData(this));
    d._subject = '[COLLAB REQUEST] ' + d.type + ' - ' + d.name;
    d._replyto = d.email;
    d._template = 'table';
    d._blacklist = 'casino,crypto,judi,slot,poker';
    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'NGIRIM...';
    fetch('https://formsubmit.co/ajax/akbarnawasunda@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(d)
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      submitBtn.innerHTML = 'TERKIRIM! GUE BALES < 24 JAM.';
      form.reset();
      setTimeout(function() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'KIRIM REQUEST';
      }, 3000);
    })
    .catch(function() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'ERROR, COBA LAGI ATAU EMAIL LANGSUNG.';
    });
  });
}

/* ===== 15. CHIPS GOYANG ===== */
document.querySelectorAll('.chips span').forEach(function(chip) {
  var sx = 0, sy = 0, cx = 0, cy = 0, drag = false, raf = null;
  chip.addEventListener('pointerdown', function(e) {
    drag = true;
    chip.setPointerCapture(e.pointerId);
    sx = e.clientX - cx; sy = e.clientY - cy;
    chip.classList.add('dragging');
    if (raf) cancelAnimationFrame(raf);
  });
  chip.addEventListener('pointermove', function(e) {
    if (!drag) return;
    cx = e.clientX - sx; cy = e.clientY - sy;
    chip.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) rotate(' + (cx * 0.1) + 'deg)';
  });
  var rel = function() {
    if (!drag) return;
    drag = false;
    chip.classList.remove('dragging');
    var spring = function() {
      cx *= 0.85; cy *= 0.85;
      if (Math.abs(cx) < 0.5 && Math.abs(cy) < 0.5) { cx = 0; cy = 0; chip.style.transform = ''; return; }
      chip.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) rotate(' + (Math.sin(cx * 0.3) * 10) + 'deg)';
      raf = requestAnimationFrame(spring);
    };
    raf = requestAnimationFrame(spring);
  };
  chip.addEventListener('pointerup', rel);
  chip.addEventListener('pointercancel', rel);
});

/* ===== 16. MARQUEE GESER (SMOOTH: scrollWidth di-cache, gak dibaca tiap frame) ===== */
var mqWrap = document.querySelector('.marquee');
var mqTrack = document.querySelector('.marquee-track');
if (mqWrap && mqTrack) {
  var mqX = 0, mqDrag = false, mqLast = 0, mqVel = 0;
  var mqGap = parseFloat(getComputedStyle(mqTrack).columnGap || getComputedStyle(mqTrack).gap) || 48;
  var mqHalfCache = 0;
  function mqRecalc() { mqHalfCache = (mqTrack.scrollWidth + mqGap) / 2; }
  mqRecalc();
  window.addEventListener('resize', mqRecalc);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mqRecalc);
  setTimeout(mqRecalc, 800);
  mqWrap.addEventListener('pointerdown', function(e) {
    mqDrag = true; mqWrap.setPointerCapture(e.pointerId); mqLast = e.clientX; mqVel = 0;
    mqWrap.classList.add('dragging');
  });
  mqWrap.addEventListener('pointermove', function(e) {
    if (!mqDrag) return;
    var d = e.clientX - mqLast;
    mqX += d; mqVel = d; mqLast = e.clientX;
  });
  ['pointerup', 'pointercancel'].forEach(function(ev) {
    mqWrap.addEventListener(ev, function() { mqDrag = false; mqWrap.classList.remove('dragging'); });
  });
  (function mqLoop() {
    if (!mqDrag) { mqVel *= 0.95; mqX += -1.1 + mqVel; }
    var half = mqHalfCache;
    if (half > 0) {
      if (mqX <= -half) mqX += half;
      if (mqX > 0) mqX -= half;
    }
    mqTrack.style.transform = 'translateX(' + mqX + 'px)';
    requestAnimationFrame(mqLoop);
  })();
}

/* ===== 17. JEDAG PAD ===== */
function hitPad(k) {
  loadSamples();
  if (k === 'bass') {
    if (typeof isPlaying === 'function' && isPlaying(k)) stopSfx(k);
    else sfx(k);
  } else { sfx(k); }
  var el = document.querySelector('.pad[data-pad="' + k + '"]');
  if (el) { el.classList.add('hit'); setTimeout(function() { el.classList.remove('hit'); }, 150); }
}
document.querySelectorAll('.pad').forEach(function(p) {
  p.addEventListener('pointerdown', function() { hitPad(p.dataset.pad); });
});
window.addEventListener('keydown', function(e) {
  var m = { '1': 'kick', '2': 'bass', '3': 'hat', '4': 'snare' };
  if (m[e.key]) hitPad(m[e.key]);
});
var stopBtn = document.getElementById('stopAll');
if (stopBtn) stopBtn.addEventListener('click', function() { if (typeof stopAllSfx === 'function') stopAllSfx(); });

/* ===== 18. JEDAG ENGINE (7 channel) ===== */
(function() {
  var body = document.getElementById('rackBody');
  if (!body || !window.AUDIO) return;
  var CH = [
    { k: 'kick', n: 'KICK', c: '#ff00e4' },
    { k: 'bass', n: 'KENDANG', c: '#ffd319' },
    { k: 'hat', n: 'HIHAT', c: '#00ffd5' },
    { k: 'snare', n: 'SNARE', c: '#7b2ff7' },
    { k: 'clap', n: 'CLAP', c: '#ff6b35' },
    { k: 'ohat', n: 'O-HAT', c: '#00ff88' },
    { k: 'rim', n: 'RIM', c: '#ff3355' }
  ];
  var P = {
    jedag: { kick: [0, 4, 8, 12], bass: [2, 6, 10, 14, 15], hat: [2, 6, 10, 14], snare: [4, 12], clap: [4, 12], ohat: [14], rim: [7, 15] },
    breakbeat: { kick: [0, 7, 10], bass: [3, 11], hat: [0, 2, 4, 6, 8, 10, 12, 14], snare: [4, 12], clap: [4, 12], ohat: [8, 14], rim: [2, 5, 13] },
    empty: { kick: [], bass: [], hat: [], snare: [], clap: [], ohat: [], rim: [] }
  };
  var SEQ = { bpm: 140, playing: false, step: 0, next: 0, timer: null, grid: {}, muted: {}, solo: {} };
  function loadPreset(name) {
    CH.forEach(function(ch) {
      SEQ.grid[ch.k] = Array(16).fill(false);
      (P[name][ch.k] || []).forEach(function(i) { SEQ.grid[ch.k][i] = true; });
      SEQ.muted[ch.k] = false; SEQ.solo[ch.k] = false;
    });
    body.querySelectorAll('.ms').forEach(function(m) { m.classList.remove('m-on', 's-on'); });
    paint();
  }
  function audible(k) {
    var anySolo = CH.some(function(c) { return SEQ.solo[c.k]; });
    return !SEQ.muted[k] && (!anySolo || SEQ.solo[k]);
  }
  function paint() {
    body.querySelectorAll('.step').forEach(function(s) {
      s.classList.toggle('on', !!SEQ.grid[s.dataset.ch][+s.dataset.i]);
    });
  }
  CH.forEach(function(ch) {
    var row = document.createElement('div');
    row.className = 'rack-row';
    row.style.setProperty('--rc', ch.c);
    row.innerHTML = '<div class="ch-cell"><span class="ch-name" style="color:' + ch.c + '">' + ch.n + '</span><button class="ms m" data-ch="' + ch.k + '">M</button><button class="ms s" data-ch="' + ch.k + '">S</button></div>' +
      Array.from({ length: 16 }, function(_, i) {
        return '<div class="step' + (i % 4 === 0 ? ' beat' : '') + '" data-ch="' + ch.k + '" data-i="' + i + '"></div>';
      }).join('');
    body.appendChild(row);
  });
  body.addEventListener('pointerdown', function(e) {
    var s = e.target.closest('.step');
    if (s) {
      var k = s.dataset.ch, i = +s.dataset.i;
      SEQ.grid[k][i] = !SEQ.grid[k][i];
      s.classList.toggle('on');
      if (SEQ.grid[k][i]) AUDIO.schedule(k, AUDIO.ctx().currentTime, 0.9);
      return;
    }
    var m = e.target.closest('.ms');
    if (m) {
      var k = m.dataset.ch;
      if (m.classList.contains('m')) { SEQ.muted[k] = !SEQ.muted[k]; m.classList.toggle('m-on'); }
      else { SEQ.solo[k] = !SEQ.solo[k]; m.classList.toggle('s-on'); }
    }
  });
  var playBtn = document.getElementById('seqPlay'), stopBtn2 = document.getElementById('seqStop');
  var pending = [];
  function scheduleStep(s, t) {
    CH.forEach(function(ch) { if (SEQ.grid[ch.k][s] && audible(ch.k)) AUDIO.schedule(ch.k, t, 1); });
    pending.push({ s: s, t: t });
  }
  function tick() {
    var ac = AUDIO.ctx();
    while (SEQ.next < ac.currentTime + 0.12) {
      scheduleStep(SEQ.step, SEQ.next);
      SEQ.next += 60 / SEQ.bpm / 4;
      SEQ.step = (SEQ.step + 1) % 16;
    }
  }
  function play() {
    if (SEQ.playing) return;
    loadSamples();
    var ac = AUDIO.ctx();
    SEQ.playing = true; SEQ.step = 0; SEQ.next = ac.currentTime + 0.06;
    SEQ.timer = setInterval(tick, 25);
    playBtn.classList.add('on');
  }
  function stop() {
    SEQ.playing = false; clearInterval(SEQ.timer); pending.length = 0;
    playBtn.classList.remove('on');
    body.querySelectorAll('.step.now').forEach(function(s) { s.classList.remove('now'); });
  }
  playBtn.addEventListener('click', function() { SEQ.playing ? stop() : play(); });
  stopBtn2.addEventListener('click', stop);
  document.querySelectorAll('.chip.bpm').forEach(function(b) {
    b.addEventListener('click', function() {
      document.querySelectorAll('.chip.bpm').forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active'); SEQ.bpm = +b.dataset.bpm;
    });
  });
  document.querySelectorAll('.chip.preset').forEach(function(b) {
    b.addEventListener('click', function() {
      document.querySelectorAll('.chip.preset').forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active'); loadPreset(b.dataset.preset);
    });
  });
  (function light() {
    requestAnimationFrame(light);
    if (!SEQ.playing) return;
    var now = AUDIO.ctx().currentTime;
    var cur = -1;
    while (pending.length && pending[0].t <= now) cur = pending.shift().s;
    if (cur >= 0) {
      body.querySelectorAll('.step.now').forEach(function(s) { s.classList.remove('now'); });
      body.querySelectorAll('.step[data-i="' + cur + '"]').forEach(function(s) { s.classList.add('now'); });
    }
  })();
  var tapBtn = document.getElementById('tapTempo');
  if (tapBtn) {
    var taps = [], idle = null;
    tapBtn.addEventListener('click', function() {
      var n = performance.now();
      if (idle) clearTimeout(idle);
      idle = setTimeout(function() { taps = []; tapBtn.textContent = 'TAP'; }, 2000);
      if (taps.length && n - taps[taps.length - 1] > 2000) taps = [];
      taps.push(n);
      if (taps.length >= 2) {
        var sum = 0;
        for (var i = 1; i < taps.length; i++) sum += taps[i] - taps[i - 1];
        var bpm = Math.round(60000 / (sum / (taps.length - 1)));
        bpm = Math.max(60, Math.min(220, bpm));
        SEQ.bpm = bpm;
        tapBtn.textContent = bpm + ' BPM';
        document.querySelectorAll('.chip.bpm').forEach(function(x) { x.classList.toggle('active', +x.dataset.bpm === bpm); });
      }
    });
  }
  loadPreset('jedag');
})();

/* ===== 19. EXTRA INSTRUMENT VOICES (clap / o-hat / rim) ===== */
(function() {
  if (!window.AUDIO || typeof AUDIO.schedule !== 'function') return;
  var origSchedule = AUDIO.schedule.bind(AUDIO);
  var noiseBuf = null;
  function noise(ctx) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; return s;
  }
  var VOICES = {
    clap: function(ctx, t, v) {
      for (var i = 0; i < 3; i++) {
        var s = noise(ctx), g = ctx.createGain(), f = ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.2;
        var tt = t + i * 0.012;
        g.gain.setValueAtTime(0.0001, tt);
        g.gain.linearRampToValueAtTime(v * (0.9 - i * 0.25), tt + 0.001);
        g.gain.exponentialRampToValueAtTime(0.0001, tt + (i === 2 ? 0.22 : 0.03));
        s.connect(f); f.connect(g); g.connect(ctx.destination);
        s.start(tt); s.stop(tt + 0.3);
      }
    },
    ohat: function(ctx, t, v) {
      var s = noise(ctx), g = ctx.createGain(), f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 7000;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v * 0.5, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      s.connect(f); f.connect(g); g.connect(ctx.destination);
      s.start(t); s.stop(t + 0.4);
    },
    rim: function(ctx, t, v) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(1700, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v * 0.4, t + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.08);
      var s = noise(ctx), g2 = ctx.createGain(), f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 3000;
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.linearRampToValueAtTime(v * 0.25, t + 0.001);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      s.connect(f); f.connect(g2); g2.connect(ctx.destination);
      s.start(t); s.stop(t + 0.05);
    }
  };
  AUDIO.schedule = function(k, t, v) {
    if (VOICES[k]) { VOICES[k](AUDIO.ctx(), t, v); return; }
    return origSchedule(k, t, v);
  };
})();
console.log('%cSMOOTH PACK — transform cursor, scaleX progress, cached marquee, vinyl mobile cap', 'color:#00ffd5;font-family:monospace');
