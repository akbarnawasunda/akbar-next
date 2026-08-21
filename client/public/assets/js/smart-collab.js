/* ===== SMART COLLAB v1 — auto-detect track dari link di form collab =====
   depends: #collabForm, input[name="song"]
   output: track card preview + hidden input ke payload FormSubmit
   notes: noembed.com (CORS-friendly, no key), zero edit file lain
================================================================= */
(function () {
  'use strict';
  var form = document.getElementById('collabForm');
  if (!form) return;
  var songInput = form.querySelector('input[name="song"]');
  if (!songInput) return;

  var card = null, hidden = null, timer = null, lastUrl = '';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function detectPlatform(url) {
    if (/youtu\.?be\./i.test(url) || /youtu\.be\//i.test(url)) return 'YouTube';
    if (/spotify\.com|spotify:/i.test(url)) return 'Spotify';
    if (/soundcloud\.com/i.test(url)) return 'SoundCloud';
    return null;
  }

  var cardHost = songInput.closest('label');
  var genreRow = form.querySelector('input[name="genre"]').closest('label').parentElement;

  /* track card preview */
  var card = document.createElement('div');
  card.style.cssText = 'display:none;margin:10px 0 0;padding:10px 12px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(255,255,255,.05);font-family:var(--mono,monospace);font-size:12px;gap:10px;align-items:center;';
  cardHost.appendChild(card);

  /* hidden payload biar masuk email FormSubmit */
  var hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.name = 'track_detected';
  form.appendChild(hidden);

  /* field opsional BPM + KEY */
  var row = document.createElement('div');
  row.className = 'form-row';
  row.innerHTML =
    '<label><span>BPM (OPSIONAL)</span><input name="bpm" inputmode="numeric" placeholder="140"></label>' +
    '<label><span>KEY (OPSIONAL)</span><input name="key" placeholder="F#m"></label>';
  genreRow.after(row);

  function showCard(meta, platform) {
    card.style.display = 'flex';
    card.innerHTML =
      (meta.thumbnail_url ? '<img src="' + esc(meta.thumbnail_url) + '" alt="" style="width:44px;height:44px;border-radius:6px;object-fit:cover;flex:none">' : '') +
      '<div style="min-width:0"><b style="color:#00ffd5">[' + platform + ']</b> ' +
      '<span style="color:#f5f0ff">' + esc(meta.title || '-') + '</span><br>' +
      '<span style="opacity:.7">' + esc(meta.author_name || '') + '</span></div>';
    hidden.value = platform + ' | ' + (meta.title || '') + ' | ' + (meta.author_name || '') + ' | ' + songInput.value.trim();
  }
  function hideCard() {
    card.style.display = 'none';
    card.innerHTML = '';
    hidden.value = '';
  }

  function lookup(url) {
    fetch('https://noembed.com/embed?url=' + encodeURIComponent(url))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.title) showCard(d, detectPlatform(url));
        else hideCard();
      })
      .catch(hideCard);
  }

  songInput.addEventListener('input', function () {
    clearTimeout(timer);
    var url = songInput.value.trim();
    if (!/^https?:\/\//i.test(url) || !detectPlatform(url)) { hideCard(); lastUrl = ''; return; }
    if (url === lastUrl) return;
    timer = setTimeout(function () { lastUrl = url; lookup(url); }, 600);
  });

  console.log('%cSMART COLLAB v1 — track detector active', 'color:#ff00e4;font-family:monospace');
})();