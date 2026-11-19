/* Hitung.in v2.1.0: lapisan PWA. Daftar service worker, tombol pasang, pesan update, indikator offline. */
(function () {
  'use strict';
  var H = window.Hitung || {};
  var icon = H.icon || function () { return ''; };
  var KEY = 'hitung.v1.pwaDismiss';
  var DISMISS_DAYS = 14;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }

  /* ---------- wadah pesan di bawah layar ---------- */
  var bars = document.createElement('div');
  bars.className = 'pwa-bars';
  document.body.appendChild(bars);

  function makeBar(cls, text, actions) {
    var el = document.createElement('div');
    el.className = 'pwa-bar ' + cls;
    el.setAttribute('role', 'status');
    var p = document.createElement('p');
    p.textContent = text;
    el.appendChild(p);
    actions.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn small' + (a.primary ? ' primary' : '');
      b.textContent = a.label;
      b.addEventListener('click', a.fn);
      el.appendChild(b);
    });
    bars.appendChild(el);
    return el;
  }

  /* ---------- pasang aplikasi ---------- */
  var deferred = null, installBtn = null, installBar = null;

  function dismissedRecently() {
    var t = parseInt(lsGet(KEY), 10);
    return t && (Date.now() - t) < DISMISS_DAYS * 86400000;
  }
  function hideInstall() {
    if (installBtn) installBtn.hidden = true;
    if (installBar) { installBar.remove(); installBar = null; }
  }
  function doInstall() {
    if (!deferred) return;
    var ev = deferred;
    deferred = null;
    ev.prompt();
    ev.userChoice.then(function () { hideInstall(); }, hideInstall);
  }
  function showInstall() {
    if (isStandalone()) return;
    var tools = document.querySelector('.tools');
    if (tools && !installBtn) {
      installBtn = document.createElement('button');
      installBtn.type = 'button';
      installBtn.className = 'btn small install-btn';
      installBtn.innerHTML = icon('download', 17) + '<span>Pasang</span>';
      installBtn.setAttribute('aria-label', 'Pasang Hitung.in sebagai aplikasi');
      installBtn.addEventListener('click', doInstall);
      tools.insertBefore(installBtn, tools.firstChild);
    }
    if (installBtn) installBtn.hidden = false;
    if (!installBar && !dismissedRecently()) {
      installBar = makeBar('install', 'Pasang Hitung.in di layar utama agar bisa dibuka cepat dan jalan tanpa internet.', [
        { label: 'Nanti', fn: function () { lsSet(KEY, String(Date.now())); if (installBar) { installBar.remove(); installBar = null; } } },
        { label: 'Pasang', primary: true, fn: doInstall }
      ]);
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    showInstall();
  });
  window.addEventListener('appinstalled', function () {
    deferred = null;
    hideInstall();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  });
  if (isStandalone() && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});

  /* ---------- indikator offline ---------- */
  var strip = null;
  function syncOnline() {
    if (!navigator.onLine) {
      if (strip) return;
      strip = document.createElement('div');
      strip.className = 'pwa-offline';
      strip.setAttribute('role', 'status');
      strip.textContent = 'Anda sedang offline. Semua rumus tetap berjalan; hanya font dan tautan luar yang mungkin tidak tampil.';
      document.body.insertBefore(strip, document.body.firstChild);
    } else if (strip) {
      strip.remove(); strip = null;
    }
  }
  window.addEventListener('online', syncOnline);
  window.addEventListener('offline', syncOnline);
  syncOnline();

  /* ---------- service worker dan pesan update ---------- */
  if (!('serviceWorker' in navigator)) return;
  var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;

  var updateBar = null, reloading = false;

  function promptUpdate(worker) {
    if (updateBar || !worker) return;
    updateBar = makeBar('update', 'Versi baru Hitung.in tersedia.', [
      { label: 'Nanti', fn: function () { if (updateBar) { updateBar.remove(); updateBar = null; } } },
      { label: 'Muat ulang', primary: true, fn: function () { worker.postMessage({ type: 'SKIP_WAITING' }); } }
    ]);
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener('load', function () {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('hitung-sw.js', { scope: './' }).then(function (reg) {
      if (reg.waiting && hadController) promptUpdate(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state === 'installed' && navigator.serviceWorker.controller) promptUpdate(w);
        });
      });
      /* Cek versi baru saat aplikasi dibuka kembali dan tiap jam. */
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
      setInterval(function () { reg.update().catch(function () {}); }, 3600000);
    }).catch(function (err) { if (window.console) console.warn('Service worker tidak aktif:', err); });
  });
})();
