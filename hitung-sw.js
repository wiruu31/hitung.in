/* Hitung.in v2.1.0: service worker.
   Naikkan VERSION setiap kali ada berkas yang berubah, supaya pengguna mendapat versi terbaru. */
'use strict';

var VERSION = '2.1.0';
var SHELL_CACHE = 'hitung-shell-v' + VERSION;
var FONT_CACHE = 'hitung-fonts-v1';
var FONT_MAX = 30;

var SHELL = [
  './hitung.html',
  './hitung.webmanifest',
  './favicon.svg',
  './icons/hitung-192.png',
  './icons/hitung-512.png',
  './icons/hitung-maskable-512.png',
  './icons/hitung-apple-180.png',
  './css/hitung-tokens.css',
  './css/hitung.css',
  './js/format.js',
  './js/engine.js',
  './js/storage.js',
  './js/data/core.js',
  './js/data/personal.js',
  './js/data/banking.js',
  './js/data/corporate.js',
  './js/data/business.js',
  './js/data/fsa.js',
  './js/data/stock.js',
  './js/data/investment.js',
  './js/data/trading.js',
  './js/data/accounting.js',
  './js/data/micro.js',
  './js/data/macro.js',
  './js/data/stats.js',
  './js/charts.js',
  './js/hitung-icons.js',
  './js/ui.js',
  './js/hitung-pwa.js'
];

/* Simpan seluruh aplikasi. Request 'reload' melewati cache HTTP agar yang tersimpan benar-benar versi terbaru. */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (url) {
        return fetch(new Request(url, { cache: 'reload' })).then(function (res) {
          if (!res.ok) throw new Error('Gagal menyimpan ' + url + ' (' + res.status + ')');
          return cache.put(url, res);
        });
      }));
    })
  );
  /* Tidak memanggil skipWaiting di sini: versi baru menunggu sampai pengguna memilih "Muat ulang",
     supaya angka yang sedang diisi tidak hilang. */
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('hitung-') === 0 && k !== SHELL_CACHE && k !== FONT_CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function trim(cache, max) {
  return cache.keys().then(function (keys) {
    if (keys.length <= max) return null;
    return Promise.all(keys.slice(0, keys.length - max).map(function (k) { return cache.delete(k); }));
  });
}

/* Google Fonts: tampilkan dari cache dulu, perbarui di belakang layar. */
function fontStrategy(request) {
  return caches.open(FONT_CACHE).then(function (cache) {
    return cache.match(request).then(function (hit) {
      var net = fetch(request).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(request, res.clone()).then(function () { return trim(cache, FONT_MAX); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(fontStrategy(req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  /* Buka halaman: selalu layani hitung.html dari cache (hash seperti #/r/npv tidak mengubah berkas). */
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./hitung.html').then(function (hit) {
        return hit || fetch(req);
      })
    );
    return;
  }

  /* Berkas aplikasi: cache dulu, jaringan sebagai cadangan. */
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(SHELL_CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
