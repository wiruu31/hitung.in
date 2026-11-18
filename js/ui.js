/* Hitung.in v2.0.0: antarmuka. Rute berbasis hash, semua tampilan dibangun dari registri rumus. */
(function () {
  'use strict';
  var H = window.Hitung || {};

  /* Pemeriksaan awal: bila ada berkas skrip yang gagal dimuat (mis. folder js/data belum terunggah),
     tampilkan pesan yang jelas, bukan halaman kosong. */
  var NEED = ['categories', 'formulas', 'run', 'chartHTML', 'icon', 'markSVG', 'store', 'fmt'];
  var missing = NEED.filter(function (k) { return !H[k]; });
  if (missing.length) {
    var failed = (window.__bootErr || []).filter(Boolean);
    var box = document.getElementById('main');
    if (box) {
      box.innerHTML = '<div style="margin:24px 16px;padding:20px;border:1px solid #d5cabb;border-radius:14px;background:#fff;color:#2a2420;line-height:1.6">' +
        '<strong style="font-size:1.1rem">Hitung.in gagal dimuat.</strong><br>Ada berkas skrip yang tidak ditemukan di server. Pastikan seluruh folder <code>js</code> (termasuk <code>js/data</code>) ikut terunggah ke hosting.' +
        (failed.length ? '<br><br>Berkas yang gagal dimuat:<br><code>' + failed.join('<br>') + '</code>' : '') +
        '<br><br><small>Komponen yang belum tersedia: ' + missing.join(', ') + '</small></div>';
    }
    return;
  }
  var S = H.store, I = H.icon;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var main = $('#main'), nav = $('#nav');
  var cur = { f: null, raw: null, session: '', timer: null, last: null, first: false, open: { steps: true, table: false } };
  var restore = null;
  var searchActive = false;

  function esc(s) {
    return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hue(catId) { return H.catHue[catId] === undefined ? 155 : H.catHue[catId]; }

  /* ---------- kerangka header ---------- */
  $('#menuBtn').innerHTML = I('menu', 22);
  $('.brand').innerHTML = '<span class="mk">' + H.markSVG(36) + '</span><span class="brand-name">Hitung<span class="dot">.in</span></span>';
  $('#searchIc').innerHTML = I('search', 18);
  $('#histLink').innerHTML = I('clock', 20);

  /* ---------- pengaturan awal ---------- */
  H.settings.currency = S.currency() in H.CUR ? S.currency() : 'IDR';

  /* Tema: otomatis (ikut sistem), terang, gelap. */
  var THEMES = [
    { id: 'auto', label: 'Otomatis (ikut sistem)', icon: 'auto' },
    { id: 'light', label: 'Terang', icon: 'sun' },
    { id: 'dark', label: 'Gelap', icon: 'moon' }
  ];
  var seg = $('#themeSeg');
  seg.innerHTML = THEMES.map(function (t) {
    return '<button type="button" data-theme-id="' + t.id + '" aria-label="' + t.label + '" title="' + t.label + '" aria-pressed="false">' + I(t.icon, 18) + '</button>';
  }).join('');
  function applyTheme() {
    var t = S.theme(), root = document.documentElement;
    if (t !== 'light' && t !== 'dark') t = 'auto';
    if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
    seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-theme-id') === t ? 'true' : 'false'); });
  }
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-theme-id]');
    if (!b) return;
    S.setTheme(b.getAttribute('data-theme-id'));
    applyTheme();
  });
  applyTheme();

  var curSel = $('#cur');
  Object.keys(H.CUR).forEach(function (k) { curSel.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(k) + '</option>'); });
  curSel.value = H.settings.currency;
  curSel.setAttribute('title', 'Mata uang untuk tampilan nilai uang');
  curSel.addEventListener('change', function () {
    H.settings.currency = curSel.value;
    S.setCurrency(curSel.value);
    document.querySelectorAll('[data-cur-sym]').forEach(function (e) { e.textContent = H.CUR[curSel.value].symbol; });
    if (cur.f && $('#result')) compute(false);
  });

  /* ---------- navigasi samping ---------- */
  function navItem(href, id, iconHTML, label, count) {
    return '<li><a href="' + href + '" data-cat="' + id + '">' + iconHTML + '<span>' + esc(label) + '</span>' + (count !== undefined ? '<span class="cnt" aria-label="' + count + ' rumus">' + count + '</span>' : '') + '</a></li>';
  }
  function buildNav() {
    var h = '<div class="nav-grip" aria-hidden="true"></div><h2>Kategori</h2><ul>';
    H.categories.forEach(function (c) {
      h += navItem('#/k/' + c.id, c.id, '<span class="ti" style="--h:' + hue(c.id) + '">' + I(c.id, 17) + '</span>', c.name, H.inCat(c.id).length);
    });
    h += '</ul><h2>Pribadi</h2><ul>' +
      navItem('#/favorit', 'favorit', '<span class="ti plain">' + I('heart', 17) + '</span>', 'Favorit') +
      navItem('#/riwayat', 'riwayat', '<span class="ti plain">' + I('clock', 17) + '</span>', 'Riwayat') +
      navItem('#/tentang', 'tentang', '<span class="ti plain">' + I('info', 17) + '</span>', 'Tentang dan batasan') + '</ul>';
    nav.innerHTML = h;
  }
  function markNav(id) {
    nav.querySelectorAll('a').forEach(function (a) {
      if (a.getAttribute('data-cat') === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  var menuBtn = $('#menuBtn'), scrim = $('#scrim');
  function openNav(open) {
    nav.classList.toggle('open', open);
    scrim.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var a = nav.querySelector('a'); if (a) a.focus(); }
  }
  menuBtn.addEventListener('click', function () { openNav(!nav.classList.contains('open')); });
  scrim.addEventListener('click', function () { openNav(false); menuBtn.focus(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { openNav(false); menuBtn.focus(); return; }
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if ((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); qIn.focus(); qIn.select();
    }
  });

  /* ---------- potongan tampilan ---------- */
  function ruleCard(f) {
    return '<li><a class="row" style="--h:' + hue(f.cat) + '" href="#/r/' + f.id + '"><span class="abbr">' + esc(f.abbr) + '</span><span><span class="t">' + esc(f.name) + '</span><span class="muted">' + esc(f.idn) + '. ' + esc(f.use) + '</span></span><span class="arrow" aria-hidden="true">' + I('arrow', 18) + '</span></a></li>';
  }
  function crumbs(parts) {
    return '<nav class="crumbs" aria-label="Jejak halaman">' + parts.map(function (p, i) {
      return (p.href ? '<a href="' + p.href + '">' + esc(p.label) + '</a>' : '<span aria-current="page">' + esc(p.label) + '</span>') + (i < parts.length - 1 ? '<span aria-hidden="true">/</span>' : '');
    }).join('') + '</nav>';
  }
  function fmtTime(t) {
    try { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(t)); } catch (e) { return ''; }
  }
  function toast(msg) {
    var old = $('.toast'); if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = I('check', 18) + '<span></span>';
    t.lastChild.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2400);
  }
  function setTitle(t) { document.title = (t ? t + ' | ' : '') + 'Hitung.in'; }
  function show(html, title, focusMain) {
    main.classList.remove('still');
    main.innerHTML = html;
    setTitle(title);
    window.scrollTo(0, 0);
    if (focusMain !== false) main.focus({ preventScroll: true });
  }

  /* ---------- beranda ---------- */
  var POPULAR = ['compound-interest', 'fv', 'pmt', 'npv', 'irr', 'roi', 'cagr', 'bep-units', 'inflation', 'sharpe'];
  function sampleHTML() {
    try {
      var f = H.byId['compound-interest'] || H.byId.fv;
      var r = H.run(f, H.defaults(f));
      if (!r.ok) return '';
      var hd = r.res.head;
      return '<a class="sample" href="#/r/' + f.id + '" aria-label="Contoh hasil: ' + esc(f.name) + '"><div class="cap">Contoh hasil &middot; ' + esc(f.name) + '</div>' +
        '<div class="val">' + esc(H.fmt.kind(hd.kind, hd.value, hd.unit)) + '</div><div class="bar"></div>' +
        '<dl>' + r.res.rows.slice(0, 3).map(function (x) { return '<div><dt>' + esc(x.label) + '</dt><dd>' + esc(H.fmt.kind(x.kind, x.value, x.unit)) + '</dd></div>'; }).join('') + '</dl>' +
        '<span class="more">Coba sendiri ' + I('arrow', 16) + '</span></a>';
    } catch (e) { return ''; }
  }
  function viewHome() {
    markNav('');
    var favs = S.favorites().map(function (id) { return H.byId[id]; }).filter(Boolean).slice(0, 4);
    var hist = S.history().slice(0, 3);
    var pop = POPULAR.map(function (id) { return H.byId[id]; }).filter(Boolean);
    var h = '<section class="hero"><div><span class="eyebrow">Kalkulator rumus keuangan dan ekonomi</span>' +
      '<h1>Rumus keuangan, <em>dihitung langsung.</em></h1>' +
      '<p class="lead">Isi angkanya, hasil muncul seketika, lengkap dengan langkah hitung, asumsi, dan grafik. Semua berjalan di browser Anda.</p>' +
      '<div class="pop"><h2>Rumus populer</h2><ul class="chips">' + pop.map(function (f) { return '<li><a class="chip" href="#/r/' + f.id + '"><span class="abbr">' + esc(f.abbr) + '</span>' + esc(f.idn) + '</a></li>'; }).join('') + '</ul></div>' +
      '<ul class="facts"><li><strong>' + H.formulas.length + '</strong>rumus</li><li><strong>' + H.categories.length + '</strong>kategori</li><li><strong>0</strong>data dikirim keluar</li></ul></div>' +
      sampleHTML() + '</section>';
    if (favs.length) {
      h += '<section class="sec-wrap" aria-labelledby="hf"><h2 class="sec" id="hf">Favorit <a class="small" href="#/favorit">Lihat semua</a></h2><ul class="list">' + favs.map(ruleCard).join('') + '</ul></section>';
    }
    if (hist.length) {
      h += '<section class="sec-wrap" aria-labelledby="hh"><h2 class="sec" id="hh">Terakhir dihitung <a class="small" href="#/riwayat">Lihat riwayat</a></h2><ul class="list">' + hist.map(histItem).join('') + '</ul></section>';
    }
    h += '<section class="sec-wrap" aria-labelledby="hc"><h2 class="sec" id="hc">Jelajahi kategori</h2><div class="grid">';
    H.categories.forEach(function (c) {
      h += '<a class="card" style="--h:' + hue(c.id) + '" href="#/k/' + c.id + '"><span class="ci">' + I(c.id, 24) + '</span><span class="no">' + c.no + '</span><h3>' + esc(c.name) + '</h3><p class="muted">' + esc(c.tag) + '</p><span class="count"><span>' + H.inCat(c.id).length + ' rumus</span>' + I('arrow', 18) + '</span></a>';
    });
    h += '</div></section>';
    show(h, '', true);
  }

  /* ---------- kategori ---------- */
  function viewCategory(id) {
    var c = H.catById[id];
    if (!c) return viewNotFound();
    markNav(id);
    var list = H.inCat(id);
    var h = crumbs([{ href: '#/', label: 'Beranda' }, { label: c.name }]) +
      '<header class="page-h" style="--h:' + hue(id) + '"><h1><span class="badge">' + c.no + '</span>' + esc(c.name) + '</h1><p>' + esc(c.desc) + '</p></header>' +
      '<ul class="list">' + list.map(ruleCard).join('') + '</ul>';
    show(h, c.name);
  }

  /* ---------- favorit, riwayat, tentang ---------- */
  function viewFavorites() {
    markNav('favorit');
    var favs = S.favorites().map(function (id) { return H.byId[id]; }).filter(Boolean);
    var h = crumbs([{ href: '#/', label: 'Beranda' }, { label: 'Favorit' }]) + '<header class="page-h"><h1>Favorit</h1><p>Rumus yang Anda tandai, tersimpan di browser ini.</p></header>';
    h += favs.length ? '<ul class="list">' + favs.map(ruleCard).join('') + '</ul>' :
      '<div class="empty"><strong>Belum ada rumus favorit.</strong>Buka sebuah rumus lalu tekan tombol favorit agar muncul di sini.</div>';
    show(h, 'Favorit');
  }

  function histItem(e) {
    var f = H.byId[e.id];
    if (!f) return '';
    return '<li><div class="hist"><div><a href="#/r/' + f.id + '" data-restore="' + esc(e.session) + '"><strong>' + esc(f.name) + '</strong></a> <span class="when">&middot; ' + esc(fmtTime(e.time)) + '</span>' +
      '<div class="val"><small>' + esc(e.headLabel) + '</small>' + esc(e.headText) + '</div></div></div></li>';
  }
  function viewHistory() {
    markNav('riwayat');
    var list = S.history();
    var h = crumbs([{ href: '#/', label: 'Beranda' }, { label: 'Riwayat' }]) + '<header class="page-h"><h1>Riwayat perhitungan</h1><p>Disimpan hanya di browser ini. Nilai uang pada riwayat tampil sesuai mata uang saat dicatat.</p></header>';
    h += '<div class="bar-actions"><label class="toggle"><input type="checkbox" id="histOn"' + (S.historyOn() ? ' checked' : '') + '> Catat riwayat otomatis</label>' +
      (list.length ? '<button class="btn danger small" type="button" id="histClear">' + I('trash', 16) + 'Hapus semua riwayat</button>' : '') + '</div>';
    if (!S.persistent()) h += '<p class="note">Penyimpanan browser sedang tidak tersedia. Riwayat hanya bertahan sampai halaman ditutup.</p>';
    h += list.length ? '<ul class="hist-list">' + list.map(function (e) {
      var f = H.byId[e.id]; if (!f) return '';
      return '<li><div class="hist"><div><a href="#/r/' + f.id + '" data-restore="' + esc(e.session) + '"><strong>' + esc(f.name) + '</strong></a> <span class="when">&middot; ' + esc(fmtTime(e.time)) + '</span>' +
        '<div class="val"><small>' + esc(e.headLabel) + '</small>' + esc(e.headText) + '</div></div>' +
        '<div class="hist-act"><a class="btn small" href="#/r/' + f.id + '" data-restore="' + esc(e.session) + '">Buka lagi</a>' +
        '<button class="icon-btn" type="button" data-del="' + esc(e.session) + '" aria-label="Hapus catatan ' + esc(f.name) + '" title="Hapus">' + I('trash', 18) + '</button></div></div></li>';
    }).join('') + '</ul>' : '<div class="empty"><strong>Riwayat masih kosong.</strong>Hasil yang valid akan tercatat otomatis setelah Anda menghitung sebuah rumus.</div>';
    show(h, 'Riwayat');
    var on = $('#histOn');
    on.addEventListener('change', function () { S.setHistoryOn(on.checked); toast(on.checked ? 'Riwayat otomatis aktif' : 'Riwayat otomatis dimatikan'); });
    var clr = $('#histClear');
    if (clr) clr.addEventListener('click', function () {
      if (clr.getAttribute('data-confirm') === '1') { S.clearHistory(); viewHistory(); toast('Riwayat dihapus'); }
      else {
        clr.setAttribute('data-confirm', '1'); clr.lastChild.textContent = 'Tekan lagi untuk menghapus';
        setTimeout(function () { if (clr.isConnected) { clr.removeAttribute('data-confirm'); clr.lastChild.textContent = 'Hapus semua riwayat'; } }, 4000);
      }
    });
    main.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () { S.removeHistory(b.getAttribute('data-del')); viewHistory(); });
    });
  }

  function viewAbout() {
    markNav('tentang');
    var h = crumbs([{ href: '#/', label: 'Beranda' }, { label: 'Tentang dan batasan' }]) +
      '<header class="page-h"><h1>Tentang dan batasan</h1><p>Hitung.in menghitung rumus keuangan dan ekonomi dasar. Berikut cara membaca hasilnya dengan benar.</p></header>' +
      '<div class="panel"><h2>Cara kerja</h2><p>Semua perhitungan berjalan di browser Anda. Tidak ada akun, tidak ada server, dan angka yang diketik tidak dikirim ke mana pun. Riwayat, favorit, tema, dan mata uang disimpan di penyimpanan lokal browser.</p></div>' +
      '<div class="panel" style="margin-top:16px"><h2>Yang perlu diingat</h2><ul>' +
      '<li>Hasil tidak lebih baik daripada input dan asumsinya. Cek ulang satuan, periode, dan definisi tiap angka.</li>' +
      '<li>Persen diketik sebagai angka biasa. Ketik 8 untuk 8%.</li>' +
      '<li>Rasio yang namanya mirip belum tentu sama. Contohnya ROE, ROA, dan ROIC memakai penyebut berbeda. Baca definisi sebelum membandingkan.</li>' +
      '<li>Rumus berbasis model sederhana, misalnya pengganda uang dan pengganda pengeluaran, memberi batas teoritis, bukan prediksi.</li>' +
      '<li>Ukuran return historis dan statistik tidak menjamin hasil masa depan.</li>' +
      '<li>Mata uang hanya mengubah simbol dan format tampilan. Angka tidak dikonversi nilai tukar.</li>' +
      '<li>Ini alat bantu belajar dan estimasi. Bukan nasihat keuangan, hukum, atau pajak.</li></ul></div>' +
      '<div class="panel" style="margin-top:16px"><h2>Pintasan keyboard</h2><p>Tekan <kbd class="kbd" style="position:static;transform:none;display:inline-block">/</kbd> atau <kbd class="kbd" style="position:static;transform:none;display:inline-block">Ctrl</kbd> + <kbd class="kbd" style="position:static;transform:none;display:inline-block">K</kbd> untuk langsung mencari rumus.</p></div>';
    show(h, 'Tentang dan batasan');
  }

  function viewNotFound() {
    markNav('');
    show('<div class="empty"><strong>Halaman tidak ditemukan.</strong>Alamat yang dibuka tidak cocok dengan rumus atau kategori mana pun. <a href="#/">Kembali ke beranda</a>.</div>', 'Tidak ditemukan');
  }

  /* ---------- pencarian ---------- */
  function viewSearch(q) {
    markNav('');
    var res = H.search(q);
    var h = '<header class="page-h"><h1>Hasil pencarian</h1><p>' + (res.length ? res.length + ' rumus cocok dengan "' + esc(q) + '".' : 'Tidak ada rumus yang cocok dengan "' + esc(q) + '".') + '</p></header>';
    h += res.length ? '<ul class="list">' + res.slice(0, 60).map(ruleCard).join('') + '</ul>' :
      '<div class="empty"><strong>Coba kata kunci lain.</strong>Cari dengan singkatan (NPV, ROE), nama Inggris, atau istilah Indonesia seperti "laba", "cicilan", "inflasi".</div>';
    main.classList.add('still');
    main.innerHTML = h; setTitle('Cari: ' + q);
  }
  var qIn = $('#q');
  qIn.addEventListener('input', function () {
    var q = qIn.value.trim();
    if (q) { searchActive = true; viewSearch(q); } else if (searchActive) { searchActive = false; route(); }
  });
  $('#searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = qIn.value.trim();
    if (q) { searchActive = true; viewSearch(q); var a = main.querySelector('a.row'); if (a) a.focus(); }
  });

  /* ---------- kalkulator ---------- */
  function fieldHTML(x, raw) {
    var id = 'f_' + x.k, val = raw[x.k] === undefined ? '' : raw[x.k], hint = x.hint ? '<div class="hint" id="h_' + id + '">' + esc(x.hint) + '</div>' : '';
    var dsc = x.hint ? ' aria-describedby="h_' + id + '"' : '';
    var lab = esc(x.label) + (x.optional ? ' <span class="hint">(opsional)</span>' : '');
    var ctl;
    if (x.type === 'select') {
      ctl = '<div class="ctl"><select id="' + id + '" data-k="' + x.k + '"' + dsc + '>' + x.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(val || x.def) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
    } else if (x.type === 'list' || x.type === 'pairs' || x.type === 'dated') {
      ctl = '<div class="ctl"><textarea id="' + id + '" data-k="' + x.k + '" spellcheck="false" autocomplete="off" inputmode="text"' + dsc + '>' + esc(val) + '</textarea></div>';
    } else {
      var aff = x.type === 'money' ? '<span class="aff" data-cur-sym aria-hidden="true">' + esc(H.CUR[H.settings.currency].symbol) + '</span>' : (x.type === 'pct' ? '<span class="aff" aria-hidden="true">%</span>' : (x.unit ? '<span class="aff" aria-hidden="true">' + esc(x.unit) + '</span>' : ''));
      var pre = x.type === 'money' ? aff : '';
      var post = x.type === 'money' ? '' : aff;
      ctl = '<div class="ctl">' + pre + '<input id="' + id + '" data-k="' + x.k + '" type="text" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(val) + '"' + dsc + '>' + post + '</div>';
    }
    return '<div class="field" data-field="' + x.k + '"><label for="' + id + '">' + lab + '</label>' + ctl + hint + '</div>';
  }
  function fieldsHTML(f, raw) {
    return f.inputs.filter(function (x) { return H.visible(x, raw); }).map(function (x) { return fieldHTML(x, raw); }).join('');
  }

  function rowsHTML(rows) {
    if (!rows.length) return '';
    return '<dl class="rows">' + rows.map(function (r) {
      return '<div><dt>' + esc(r.label) + (r.hint ? '<span class="h">' + esc(r.hint) + '</span>' : '') + '</dt><dd>' + esc(H.fmt.kind(r.kind, r.value, r.unit)) + '</dd></div>';
    }).join('') + '</dl>';
  }
  function tableHTML(t) {
    if (!t) return '';
    var head = '<tr>' + t.cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr>';
    var body = t.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('');
    return '<details data-d="table"' + (cur.open.table ? ' open' : '') + '><summary>' + esc(t.title) + ' (' + t.rows.length + ' baris)' + I('chevron', 18) + '</summary><div class="tbl-wrap" tabindex="0" role="region" aria-label="' + esc(t.title) + '"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div></details>';
  }

  function resultHTML(r) {
    var res = r.res, h = res.head;
    var out = '<div class="head"><div class="lbl">' + esc(h.label) + '</div><div class="val">' + esc(H.fmt.kind(h.kind, h.value, h.unit)) + '</div></div>';
    out += rowsHTML(res.rows);
    if (res.note) out += '<p class="note">' + esc(res.note) + '</p>';
    out += H.chartHTML(res.chart);
    out += tableHTML(res.table);
    if (res.steps && res.steps.length) out += '<details data-d="steps"' + (cur.open.steps ? ' open' : '') + '><summary>Langkah hitung' + I('chevron', 18) + '</summary><ol>' + res.steps.map(function (s) { return '<li><span>' + esc(s) + '</span></li>'; }).join('') + '</ol></details>';
    out += '<div class="actions"><button class="btn" type="button" id="copyBtn">' + I('copy', 17) + 'Salin hasil</button></div>';
    return out;
  }

  function compute(save) {
    var f = cur.f, box = $('#result');
    if (!box) return;
    var r = H.run(f, cur.raw);
    cur.last = r;
    if (r.ok) {
      box.innerHTML = resultHTML(r);
      $('#copyBtn').addEventListener('click', function () { copyResult(); });
      if (save) scheduleSave(r);
    } else if (r.kind === 'empty') {
      box.innerHTML = '<div class="state"><strong>Hasil muncul di sini.</strong>' + esc(r.error) + '</div>';
    } else {
      box.innerHTML = '<div class="state err" role="alert"><strong>' + esc(r.error) + '</strong>Perbaiki angka di sebelah kiri, hasil akan diperbarui otomatis.</div>';
    }
    if (cur.first) {
      cur.first = false;
      box.classList.add('enter');
      setTimeout(function () { box.classList.remove('enter'); }, 700);
    }
  }

  function scheduleSave(r) {
    clearTimeout(cur.timer);
    var snapshot = { f: cur.f, raw: JSON.parse(JSON.stringify(cur.raw)), session: cur.session };
    cur.timer = setTimeout(function () {
      var h = r.res.head;
      S.saveHistory({ session: snapshot.session, id: snapshot.f.id, time: Date.now(), inputs: snapshot.raw, headLabel: h.label, headText: H.fmt.kind(h.kind, h.value, h.unit) });
    }, 1200);
  }

  function copyResult() {
    var r = cur.last; if (!r || !r.ok) return;
    var res = r.res, lines = [cur.f.name + ' (' + cur.f.abbr + ')', res.head.label + ': ' + H.fmt.kind(res.head.kind, res.head.value, res.head.unit)];
    res.rows.forEach(function (x) { lines.push(x.label + ': ' + H.fmt.kind(x.kind, x.value, x.unit)); });
    lines.push('Dihitung dengan Hitung.in');
    var txt = lines.join('\n');
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove(); toast(ok ? 'Hasil disalin' : 'Gagal menyalin. Salin manual dari layar.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast('Hasil disalin'); }, fallback);
    else fallback();
  }

  function favLabel(on) { return I('heart', 17) + (on ? 'Favorit' : 'Tambah ke favorit'); }

  function viewFormula(id) {
    var f = H.byId[id];
    if (!f) return viewNotFound();
    var c = H.catById[f.cat];
    markNav(f.cat);
    cur.f = f; cur.session = String(Date.now()) + Math.random().toString(36).slice(2, 6);
    cur.raw = H.defaults(f); cur.first = true; cur.open = { steps: true, table: false };
    if (restore) {
      var e = S.history().filter(function (x) { return x.session === restore; })[0];
      if (e && e.id === id) { for (var k in e.inputs) cur.raw[k] = e.inputs[k]; }
      restore = null;
    }
    var fav = S.isFavorite(id);
    var also = f.also.map(function (a) { return H.catById[a]; }).filter(Boolean);
    var relNames = f.related || [];
    var h = crumbs([{ href: '#/', label: 'Beranda' }, { href: '#/k/' + c.id, label: c.name }, { label: f.name }]) +
      '<header class="page-h" style="--h:' + hue(f.cat) + '"><h1><span class="badge">' + esc(f.abbr) + '</span>' + esc(f.name) + '</h1><p>' + esc(f.idn) + '. ' + esc(f.use) + '</p></header>' +
      '<div class="calc"><section class="panel" aria-labelledby="inh"><h2 id="inh">Input</h2><pre class="formula" aria-label="Rumus">' + esc(f.formula) + '</pre>' +
      '<form id="calcForm" novalidate><div id="fields">' + fieldsHTML(f, cur.raw) + '</div>' +
      '<div class="actions"><button class="btn" type="button" id="resetBtn">' + I('reset', 17) + 'Kembalikan contoh</button><button class="btn fav-btn" type="button" id="favBtn" aria-pressed="' + fav + '">' + favLabel(fav) + '</button></div></form></section>' +
      '<section class="panel result" aria-labelledby="outh"><h2 id="outh">Hasil</h2><div id="result" aria-live="polite"></div></section></div>' +
      '<div class="meta">' +
      (f.notes ? '<div class="panel"><h3>Catatan dan asumsi</h3><p>' + esc(f.notes) + '</p></div>' : '') +
      '<div class="panel"><h3>Cara baca hasil</h3><p>Persen diketik sebagai angka biasa (8 berarti 8%). Hasil bergantung pada input dan asumsi. Rasio bernama mirip belum tentu setara, jadi cek definisinya sebelum membandingkan. <a href="#/tentang">Selengkapnya</a>.</p></div>' +
      '<div><h3>Kategori</h3><ul class="chips"><li><a class="chip" href="#/k/' + c.id + '">' + esc(c.name) + '</a></li>' + also.map(function (a) { return '<li><a class="chip" href="#/k/' + a.id + '">' + esc(a.name) + '</a></li>'; }).join('') + '</ul></div>' +
      (relNames.length ? '<div><h3>Terkait dengan</h3><ul class="chips">' + relNames.map(function (n) {
        var cat = H.categories.filter(function (x) { return x.name.toLowerCase().indexOf(n.toLowerCase()) === 0 || n.toLowerCase().indexOf(x.name.toLowerCase()) === 0; })[0];
        return cat ? '<li><a class="chip" href="#/k/' + cat.id + '">' + esc(n) + '</a></li>' : '<li><span class="chip">' + esc(n) + '</span></li>';
      }).join('') + '</ul></div>' : '') + '</div>';
    show(h, f.name + ' (' + f.abbr + ')');
    compute(true);

    var form = $('#calcForm');
    form.addEventListener('submit', function (ev) { ev.preventDefault(); });
    form.addEventListener('input', function (ev) {
      var k = ev.target.getAttribute('data-k'); if (!k) return;
      cur.raw[k] = ev.target.value;
      if (ev.target.tagName === 'SELECT') {
        var hasDep = f.inputs.some(function (x) { return x.showIf; });
        if (hasDep) {
          $('#fields').innerHTML = fieldsHTML(f, cur.raw);
          var again = document.getElementById('f_' + k); if (again) again.focus();
        }
      }
      compute(true);
    });
    /* Ingat bagian rincian (langkah, tabel) yang sedang dibuka agar tidak menutup sendiri saat angka berubah. */
    $('#result').addEventListener('toggle', function (ev) {
      var d = ev.target; if (!d || !d.getAttribute) return;
      var key = d.getAttribute('data-d'); if (key) cur.open[key] = d.open;
    }, true);
    $('#resetBtn').addEventListener('click', function () {
      cur.raw = H.defaults(f);
      $('#fields').innerHTML = fieldsHTML(f, cur.raw);
      compute(false); toast('Input dikembalikan ke contoh');
    });
    var fb = $('#favBtn');
    fb.addEventListener('click', function () {
      var on = S.toggleFavorite(id);
      fb.setAttribute('aria-pressed', on ? 'true' : 'false');
      fb.innerHTML = favLabel(on);
      toast(on ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
    });
  }

  /* ---------- rute ---------- */
  function route() {
    openNav(false);
    var hash = location.hash || '#/';
    var m;
    if (searchActive) { searchActive = false; qIn.value = ''; }
    if (hash === '#/' || hash === '#' || hash === '') return viewHome();
    if ((m = hash.match(/^#\/k\/([\w-]+)$/))) return viewCategory(m[1]);
    if ((m = hash.match(/^#\/r\/([\w-]+)$/))) return viewFormula(m[1]);
    if (hash === '#/favorit') return viewFavorites();
    if (hash === '#/riwayat') return viewHistory();
    if (hash === '#/tentang') return viewAbout();
    viewNotFound();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-restore]');
    if (a) restore = a.getAttribute('data-restore');
  });
  function safeRoute() {
    try { route(); } catch (err) {
      main.classList.remove('still');
      main.innerHTML = '<div class="empty"><strong>Terjadi kesalahan saat menampilkan halaman.</strong>' + esc(err && err.message) + '. Muat ulang halaman, atau kembali ke <a href="#/">beranda</a>.</div>';
      if (window.console) console.error(err);
    }
  }
  window.addEventListener('hashchange', safeRoute);

  try { buildNav(); } catch (err) { if (window.console) console.error(err); }
  safeRoute();
})();
