/* ===== WAV EXPORT v1 — render pattern sequencer jadi WAV =====
   depends: DOM sequencer (.rack-row/.step/.ms/.chip.bpm)
   output: download WAV 16-bit 44.1kHz stereo
   notes: MVP synth-only, 4 bar + tail, watermark motif di ekor
================================================================= */
(function () {
  'use strict';
  var BARS = 4;    // mau lebih panjang? ganti angka ini
  var TAIL = 1.2;  // detik ekor biar decay gak kepotong
  var WM = true;   // watermark on/off

  function scrape() {
    var rows = document.querySelectorAll('.rack-row');
    if (!rows.length) return null;
    var chs = [];
    rows.forEach(function (row) {
      var steps = row.querySelectorAll('.step');
      if (!steps.length) return;
      var grid = [];
      steps.forEach(function (s) { grid.push(s.classList.contains('on')); });
      var m = row.querySelector('.ms.m'), so = row.querySelector('.ms.s');
      chs.push({
        k: steps[0].getAttribute('data-ch'),
        grid: grid,
        muted: m ? m.classList.contains('m-on') : false,
        solo: so ? so.classList.contains('s-on') : false
      });
    });
    var bpmEl = document.querySelector('.chip.bpm.active');
    return { chs: chs, bpm: bpmEl ? (+bpmEl.getAttribute('data-bpm') || 140) : 140 };
  }

  function audible(c, all) {
    var anySolo = all.some(function (x) { return x.solo; });
    return !c.muted && (!anySolo || c.solo);
  }

  function noise(ctx) {
    var b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  /* voices offline — adaptasi dari engine, signature (ctx,dest,t,v,nb) */
  var VOICES = {
    kick: function (ctx, ds, t, v) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(40, t + .12);
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .25);
      o.connect(g); g.connect(ds); o.start(t); o.stop(t + .3);
    },
    bass: function (ctx, ds, t, v) {
      var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 55;
      f.type = 'lowpass';
      f.frequency.setValueAtTime(700, t);
      f.frequency.exponentialRampToValueAtTime(120, t + .3);
      g.gain.setValueAtTime(v * .8, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .35);
      o.connect(f); f.connect(g); g.connect(ds); o.start(t); o.stop(t + .4);
    },
    hat: function (ctx, ds, t, v, nb) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = nb; f.type = 'highpass'; f.frequency.value = 7000;
      g.gain.setValueAtTime(v * .4, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .08);
      s.connect(f); f.connect(g); g.connect(ds); s.start(t); s.stop(t + .1);
    },
    snare: function (ctx, ds, t, v, nb) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = nb; f.type = 'bandpass'; f.frequency.value = 1800;
      g.gain.setValueAtTime(v * .7, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .18);
      s.connect(f); f.connect(g); g.connect(ds); s.start(t); s.stop(t + .2);
      var o = ctx.createOscillator(), g2 = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = 200;
      g2.gain.setValueAtTime(v * .4, t);
      g2.gain.exponentialRampToValueAtTime(.001, t + .12);
      o.connect(g2); g2.connect(ds); o.start(t); o.stop(t + .15);
    },
    clap: function (ctx, ds, t, v, nb) {
      for (var i = 0; i < 3; i++) {
        var s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        s.buffer = nb; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 1.2;
        var tt = t + i * .012;
        g.gain.setValueAtTime(.0001, tt);
        g.gain.linearRampToValueAtTime(v * (0.9 - i * .25), tt + .001);
        g.gain.exponentialRampToValueAtTime(.0001, tt + (i === 2 ? .22 : .03));
        s.connect(f); f.connect(g); g.connect(ds); s.start(tt); s.stop(tt + .3);
      }
    },
    ohat: function (ctx, ds, t, v, nb) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = nb; f.type = 'highpass'; f.frequency.value = 7000;
      g.gain.setValueAtTime(v * .5, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .35);
      s.connect(f); f.connect(g); g.connect(ds); s.start(t); s.stop(t + .4);
    },
    rim: function (ctx, ds, t, v, nb) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(1700, t);
      g.gain.setValueAtTime(v * .4, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .06);
      o.connect(g); g.connect(ds); o.start(t); o.stop(t + .08);
      var s = ctx.createBufferSource(), g2 = ctx.createGain(), f = ctx.createBiquadFilter();
      s.buffer = nb; f.type = 'highpass'; f.frequency.value = 3000;
      g2.gain.setValueAtTime(v * .25, t);
      g2.gain.exponentialRampToValueAtTime(.001, t + .03);
      s.connect(f); f.connect(g2); g2.connect(ds); s.start(t); s.stop(t + .05);
    }
  };

  function render(d, done, fail) {
    var stepDur = 60 / d.bpm / 4;
    var steps = 16 * BARS;
    var total = steps * stepDur + TAIL;
    var OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OC) { fail('browser gak support OfflineAudioContext'); return; }
    var oc = new OC(2, Math.ceil(44100 * total), 44100);
    var master = oc.createGain();
    master.gain.value = .9;
    master.connect(oc.destination);
    var nb = noise(oc);
    for (var st = 0; st < steps; st++) {
      var t = st * stepDur, idx = st % 16;
      d.chs.forEach(function (c) {
        if (c.grid[idx] && audible(c, d.chs)) VOICES[c.k](oc, master, t, 1, nb);
      });
    }
    if (WM) {
      [660, 990].forEach(function (fq, i) {
        var o = oc.createOscillator(), g = oc.createGain();
        var tt = total - .9 + i * .15;
        o.type = 'sine'; o.frequency.value = fq;
        g.gain.setValueAtTime(.0001, tt);
        g.gain.linearRampToValueAtTime(.05, tt + .01);
        g.gain.exponentialRampToValueAtTime(.0001, tt + .14);
        o.connect(g); g.connect(master); o.start(tt); o.stop(tt + .16);
      });
    }
    oc.startRendering().then(done, function () { fail('render gagal'); });
  }

  function toWav(abuf) {
    var nch = abuf.numberOfChannels, sr = abuf.sampleRate;
    var len = abuf.length * nch * 2 + 44;
    var buf = new ArrayBuffer(len);
    var v = new DataView(buf);
    function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, len - 8, true); ws(8, 'WAVE');
    ws(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, nch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * nch * 2, true);
    v.setUint16(32, nch * 2, true); v.setUint16(34, 16, true);
    ws(36, 'data'); v.setUint32(40, len - 44, true);
    var chs = [];
    for (var c = 0; c < nch; c++) chs.push(abuf.getChannelData(c));
    var off = 44;
    for (var i = 0; i < abuf.length; i++) {
      for (var ch = 0; ch < nch; ch++) {
        var x = Math.max(-1, Math.min(1, chs[ch][i]));
        v.setInt16(off, x < 0 ? x * 0x8000 : x * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([buf], { type: 'audio/wav' });
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  function mount() {
    var head = document.querySelector('.rack-head');
    if (!head || document.getElementById('wavExport')) return;
    var b = document.createElement('button');
    b.id = 'wavExport';
    b.className = 'btn';
    b.textContent = 'EXPORT WAV';
    b.addEventListener('click', function () {
      var d = scrape();
      if (!d) return;
      b.disabled = true; b.textContent = 'RENDER...';
      render(d,
        function (abuf) {
          download(toWav(abuf), 'akbar-nawasunda-jedag-' + d.bpm + 'bpm.wav');
          b.disabled = false; b.textContent = 'EXPORT WAV';
        },
        function (msg) {
          b.disabled = false; b.textContent = 'EXPORT WAV';
          console.warn('WAV EXPORT:', msg);
        });
    });
    head.appendChild(b);
  }
  mount();
  console.log('%cWAV EXPORT v1 — sequencer to wav active', 'color:#ff9a1f;font-family:monospace');
})();