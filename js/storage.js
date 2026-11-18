/* Hitung.in: penyimpanan lokal (tema, mata uang, favorit, riwayat). Aman bila localStorage diblokir. */
(function () {
  'use strict';
  var H = (window.Hitung = window.Hitung || {});
  var PREFIX = 'hitung.v1.';
  var memory = {};
  var persistent = true;

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      if (raw === null) return key in memory ? memory[key] : fallback;
      return JSON.parse(raw);
    } catch (e) {
      persistent = false;
      return key in memory ? memory[key] : fallback;
    }
  }

  function write(key, value) {
    memory[key] = value;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      persistent = false;
      return false;
    }
  }

  var MAX_HISTORY = 100;

  var S = {
    persistent: function () { return persistent; },

    theme: function () { return read('theme', 'auto'); },
    setTheme: function (t) { write('theme', t); },

    currency: function () { return read('currency', 'IDR'); },
    setCurrency: function (c) { write('currency', c); },

    historyOn: function () { return read('historyOn', true); },
    setHistoryOn: function (on) { write('historyOn', !!on); },

    favorites: function () { return read('favs', []); },
    isFavorite: function (id) { return S.favorites().indexOf(id) >= 0; },
    toggleFavorite: function (id) {
      var f = S.favorites();
      var i = f.indexOf(id);
      if (i >= 0) f.splice(i, 1); else f.unshift(id);
      write('favs', f);
      return i < 0;
    },

    history: function () { return read('history', []); },

    /* Satu entri per sesi kunjungan ke rumus: pemanggilan berikutnya dengan sessionKey sama memperbarui entri itu. */
    saveHistory: function (entry) {
      if (!S.historyOn()) return;
      var list = S.history();
      var idx = -1;
      for (var i = 0; i < list.length; i++) if (list[i].session === entry.session) { idx = i; break; }
      if (idx >= 0) list.splice(idx, 1);
      list.unshift(entry);
      if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
      write('history', list);
    },
    removeHistory: function (session) {
      write('history', S.history().filter(function (h) { return h.session !== session; }));
    },
    clearHistory: function () { write('history', []); }
  };

  H.store = S;
})();
