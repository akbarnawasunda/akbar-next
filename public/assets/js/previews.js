/* ===== PREVIEWS PACK v1 — preview 30s di kartu release ===== */
(function () {
  var rail = document.getElementById('relRail');
  if (!rail) return;

  function norm(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  var map = null;
  var mapLoading = false;
  var mapCallbacks = [];
  var callbackSequence = 0;

  function loadMap(done) {
    if (map) {
      done(map);
      return;
    }
    mapCallbacks.push(done);
    if (mapLoading) return;
    mapLoading = true;

    var callbackName = '__itunesPreviews' + Date.now() + '_' + (++callbackSequence);
    var script = document.createElement('script');
    var settled = false;
    var timeout = window.setTimeout(function () { finish(null); }, 8000);

    function finish(data) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      try { delete window[callbackName]; }
      catch (error) { window[callbackName] = undefined; }
      script.onload = null;
      script.onerror = null;
      if (script.parentNode) script.parentNode.removeChild(script);

      map = {};
      ((data && data.results) || []).forEach(function (result) {
        var key = norm(result.trackName);
        if (key && !map[key] && result.previewUrl) map[key] = result.previewUrl;
      });
      mapLoading = false;
      var callbacks = mapCallbacks.splice(0);
      callbacks.forEach(function (callback) { callback(map); });
    }

    window[callbackName] = function (data) { finish(data); };
    script.async = true;
    script.onerror = function () { finish(null); };
    script.src = 'https://itunes.apple.com/search?term=' +
      encodeURIComponent('Akbar Nawasunda') + '&entity=song&limit=50&callback=' +
      encodeURIComponent(callbackName);
    try { document.head.appendChild(script); }
    catch (error) { finish(null); }
  }

  var audio = null;
  var currentButton = null;

  function stopAll() {
    if (audio) {
      audio.pause();
      audio.removeEventListener('ended', stopAll);
      audio.removeEventListener('error', stopAll);
      audio = null;
    }
    if (currentButton) {
      currentButton.classList.remove('playing');
      currentButton = null;
    }
  }

  function attach(card) {
    if (card.querySelector('.prev-btn')) return;
    var title = norm(card.dataset.title);
    if (!title) return;

    loadMap(function (previewMap) {
      var url = previewMap[title];
      if (!url) {
        var match = Object.keys(previewMap).find(function (key) {
          return key.includes(title) || title.includes(key);
        });
        if (match) url = previewMap[match];
      }
      if (!url || card.querySelector('.prev-btn')) return;

      var thumbnail = card.querySelector('.rel-thumb');
      if (!thumbnail) return;
      card.classList.add('hasprev');

      var tag = document.createElement('span');
      tag.className = 'prev-tag';
      tag.textContent = 'PREVIEW 30s';

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'prev-btn';
      button.setAttribute('aria-label', 'Play 30-second preview');
      button.innerHTML = '<svg class="play-ic" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg><span class="eq"><i></i><i></i><i></i></span>';
      thumbnail.appendChild(tag);
      thumbnail.appendChild(button);

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (currentButton === button) {
          stopAll();
          return;
        }

        stopAll();
        var player = new Audio(url);
        audio = player;
        currentButton = button;
        button.classList.add('playing');
        player.addEventListener('ended', stopAll);
        player.addEventListener('error', stopAll);
        var playPromise = player.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (audio === player) stopAll();
          });
        }
      });
    });
  }

  function scan() {
    rail.querySelectorAll('.rel-card').forEach(attach);
  }

  scan();
  new MutationObserver(scan).observe(rail, { childList: true, subtree: true });
})();
