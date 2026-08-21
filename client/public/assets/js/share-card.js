/* ===== SHARE CARD v2 — robust injection + inline style =====
   depends: #grOverlay, #grShare, #grScore, #grBest
   notes: styling inline biar gak bergantung CSS,
          retry via MutationObserver biar gak miss timing
================================================================= */
(function () {
  'use strict';

  function num(t, re) {
    var m = String(t || '').match(re);
    return m ? parseInt(m[1], 10) : 0;
  }

  function readState() {
    var ov = document.getElementById('grOverlay');
    if (!ov) return null;
    var title = ov.querySelector('h3');
    var desc = ov.querySelector('.game-desc');
    var bestEl = document.getElementById('grBest');
    var scoreEl = document.getElementById('grScore');
    var isOver = /GAME OVER/.test(title ? title.textContent : '');
    var score = isOver ? num(title ? title.textContent : '', /-?\s*(\d+)/) : 0;
    var best = num(bestEl ? bestEl.textContent : '', /(\d+)/);
    var cur = num(scoreEl ? scoreEl.textContent : '', /(\d+)/);
    return {
      over: isOver,
      score: isOver ? score : cur,
      best: best,
      combo: isOver ? num(desc ? desc.textContent : '', /x(\d+)/) : 0
    };
  }

  function draw(d) {
    var W = 1200, H = 630;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');

    c.fillStyle = '#0d0221';
    c.fillRect(0, 0, W, H);
    var g = c.createRadialGradient(W / 2, -80, 60, W / 2, -80, 700);
    g.addColorStop(0, 'rgba(255,0,228,.22)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    c.fillStyle = 'rgba(255,255,255,.035)';
    for (var y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);

    c.strokeStyle = '#ff00e4';
    c.lineWidth = 6;
    c.strokeRect(14, 14, W - 28, H - 28);
    c.strokeStyle = 'rgba(0,255,213,.5)';
    c.lineWidth = 2;
    c.strokeRect(26, 26, W - 52, H - 52);

    c.fillStyle = '#a89ec4';
    c.font = '28px "Chakra Petch", monospace';
    c.textAlign = 'left';
    c.fillText('AKBAR NAWASUNDA // DJ AKBAR REMIX', 60, 96);

    c.fillStyle = '#f5f0ff';
    c.font = '110px "Bebas Neue", sans-serif';
    c.fillText('JEDAG RUN', 58, 210);

    c.fillStyle = '#ffd319';
    c.font = '200px "Bebas Neue", sans-serif';
    c.fillText(String(d.score), 56, 420);
    c.font = '30px "Chakra Petch", monospace';
    c.fillStyle = '#00ffd5';
    c.fillText(d.over ? 'SCORE' : 'CURRENT SCORE', 62, 470);

    c.textAlign = 'right';
    c.fillStyle = '#00ffd5';
    c.font = '44px "Chakra Petch", monospace';
    c.fillText('BEST ' + d.best, W - 60, 210);
    if (d.combo > 1) {
      c.fillStyle = '#ff00e4';
      c.fillText('COMBO x' + d.combo, W - 60, 270);
    }

    c.textAlign = 'left';
    c.fillStyle = '#a89ec4';
    c.font = '26px "Chakra Petch", monospace';
    c.fillText('akbarnawasunda.my.id', 60, H - 60);
    c.textAlign = 'right';
    c.fillText('JEDAG JEDUG • INDO BASS • BREAKBEAT', W - 60, H - 60);

    return cv;
  }

  function fire() {
    var d = readState();
    if (!d) return;
    draw(d).toBlob(function (blob) {
      if (!blob) return;
      var text = 'Aku skor ' + d.score + ' di JEDAG RUN — Akbar Nawasunda. Coba kalahkan! https://akbarnawasunda.my.id/#game';
      var file = new File([blob], 'jedag-run-' + d.score + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'JEDAG RUN', text: text }).catch(function () {});
      } else {
        /* fallback: download PNG */
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'jedag-run-' + d.score + '.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      }
    }, 'image/png');
  }

  /* === INJECTION: robust, retry, inline style === */
  function mount() {
    var ov = document.getElementById('grOverlay');
    if (!ov) return false;
    if (document.getElementById('grCard')) return true;

    var b = document.createElement('button');
    b.id = 'grCard';
    b.type = 'button';
    b.textContent = '📸 SHARE CARD';
    /* inline style biar pasti keliatan, gak bergantung CSS */
    b.style.cssText = 'font-family:var(--mono);font-size:11px;background:linear-gradient(180deg,#00ffd5,#00a8a0);color:#031c1a;border:1px solid #66ffe1;padding:10px 18px;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;letter-spacing:.1em;font-weight:600;box-shadow:0 6px 24px rgba(0,255,213,.4);margin-top:8px;';

    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      fire();
    });

    /* taruh di bawah tombol share lama */
    ov.appendChild(b);
    return true;
  }

  /* mount segera + retry via observer kalau DOM belum siap */
  if (!mount()) {
    var obs = new MutationObserver(function () {
      if (mount()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    /* safety timeout: stop observing after 5s */
    setTimeout(function () { obs.disconnect(); }, 5000);
  }

  console.log('%cSHARE CARD v2 — PNG share active', 'color:#00ffd5;font-family:monospace');
})();