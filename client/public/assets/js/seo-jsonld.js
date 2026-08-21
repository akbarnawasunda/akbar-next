/* ===== SEO JSON-LD v1 — rich snippet MusicGroup + releases =====
   depends: - (standalone, gak butuh module lain)
   output: 2x <script type="application/ld+json"> di <head>
   notes: googlebot render JS, jadi inject via JS aman buat static site
================================================================= */
(function () {
  'use strict';
  var SITE = 'https://akbarnawasunda.my.id';
  var MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };

  function norm(s) { return String(s == null ? '' : s).trim(); }

  /* "FEB 2025" -> "2025-02", fallback tahun doang */
  function parseDate(d) {
    d = String(d || '').toUpperCase();
    var y = d.match(/(20\d{2})/);
    if (!y) return null;
    var m = d.match(/([A-Z]{3})/);
    if (m && MONTHS[m[1]]) return y[1] + '-' + MONTHS[m[1]];
    return y[1];
  }

  function inject(obj) {
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(obj);
    document.head.appendChild(el);
  }

  /* ===== GRAPH 1: ARTIST + WEBSITE (statis) ===== */
  inject({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Person', 'MusicGroup'],
        '@id': SITE + '/#artist',
        'name': 'Akbar Nawasunda',
        'alternateName': ['DJ Akbar Remix', 'Arthazra'],
        'url': SITE + '/',
        'image': SITE + '/assets/media/logo-an.png',
        'genre': ['Breakbeat', 'Indo Bass', 'Jedag Jedug', 'Jungle Dutch'],
        'location': { '@type': 'Place', 'name': 'Bandung Barat, Indonesia' },
        'sameAs': [
          'https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw',
          'https://music.apple.com/id/album/masih-dihatiku-single/1816312737',
          'https://www.youtube.com/@akbarnawasunda',
          'https://soundcloud.com/akbarnawasunda',
          'https://www.deezer.com/us/artist/322209491',
          'https://music.amazon.com/albums/B0G4GBYQKJ',
          'https://tidal.com/track/443331782',
          'https://www.instagram.com/arthazra/',
          'https://www.tiktok.com/@akbarnawasunda',
          'https://x.com/akbarnawasunda'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        'url': SITE + '/',
        'name': 'Akbar Nawasunda — Official Website | DJ Akbar Remix',
        'publisher': { '@id': SITE + '/#artist' },
        'inLanguage': ['id', 'en']
      }
    ]
  });

  /* ===== GRAPH 2: RELEASES (dinamis dari data/releases.json) ===== */
  fetch('data/releases.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (db) {
      if (!db || !Array.isArray(db.releases) || !db.releases.length) return;
      var graph = [];
      db.releases.forEach(function (r) {
        var url = norm(r.link) || norm(r.soundcloud);
        if (!url || !norm(r.title)) return;
        var rec = {
          '@type': ['MusicRecording', 'MusicRelease'],
          'name': norm(r.title),
          'url': url,
          'byArtist': { '@id': SITE + '/#artist' },
          'inLanguage': 'id'
        };
        var dp = parseDate(r.date);
        if (dp) rec.datePublished = dp;
        var art = norm(r.art);
        if (art) rec.image = art.replace(/^http:/, 'https:');
        if (norm(r.soundcloud)) rec.sameAs = [norm(r.soundcloud)];
        graph.push(rec);
      });
      if (graph.length) inject({ '@context': 'https://schema.org', '@graph': graph });
    })
    .catch(function () {});

  console.log('%cSEO JSON-LD v1 — rich snippet active', 'color:#ffd319;font-family:monospace');
})();