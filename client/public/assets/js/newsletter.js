/* ===== NEWSLETTER v1 — wire form "Tetap Terhubung" ke FormSubmit =====
   depends: .news-form (input + button), .news-msg
   output: email masuk inbox owner + feedback di .news-msg
   notes: isolated, zero edit ke file lain selain 1 baris script tag
================================================================= */
(function () {
  'use strict';
  var ENDPOINT = 'https://formsubmit.co/ajax/akbarnawasunda@gmail.com';

  function lang() { return document.documentElement.lang || 'id'; }
  function txt(k) {
    var id = lang() === 'id';
    if (k === 'ok') return id ? 'GAS! LU MASUK LIST. UPDATE RILIS OTW INBOX.' : 'SUBSCRIBED! RELEASE UPDATES INBOUND.';
    if (k === 'bad') return id ? 'EMAIL-NYA BELUM BENER, CEK LAGI.' : 'THAT EMAIL LOOKS OFF, CHECK AGAIN.';
    if (k === 'err') return id ? 'GAGAL NGIRIM. COBA LAGI ATAU EMAIL LANGSUNG.' : 'SEND FAILED. RETRY OR EMAIL US DIRECTLY.';
    return id ? 'NGIRIM...' : 'SENDING...';
  }

  function mount() {
    var form = document.querySelector('.news-form');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    var input = form.querySelector('input[type="email"]') || form.querySelector('input');
    var btn = form.querySelector('button') || form.querySelector('.btn');
    var msg = document.querySelector('.news-msg');
    if (!input || !btn) return;

    if (form.tagName === 'FORM') form.noValidate = true;
    function say(t) { if (msg) msg.textContent = t; }

    function submit(e) {
      if (e) e.preventDefault();
      var email = String(input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { say(txt('bad')); input.focus(); return; }
      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = txt('send');
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email,
          _subject: '[NEWSLETTER] ' + email,
          _template: 'table',
          _captcha: 'false',
          _honey: ''
        })
      })
      .then(function (r) { return r.json(); })
      .then(function () {
        say(txt('ok'));
        input.value = '';
        btn.textContent = '✔';
      })
      .catch(function () {
        say(txt('err'));
        btn.disabled = false;
        btn.textContent = old;
      });
    }

    if (form.tagName === 'FORM') {
      form.addEventListener('submit', submit);
    } else {
      btn.addEventListener('click', submit);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(e); });
    }
  }

  mount();
  console.log('%cNEWSLETTER v1 — form wired to FormSubmit', 'color:#00ffd5;font-family:monospace');
})();