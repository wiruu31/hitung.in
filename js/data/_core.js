/* Hitung.in: registri rumus, kategori, konstruktor input, validasi, dan pencarian. */
(function () {
  'use strict';
  var H = (window.Hitung = window.Hitung || {});
  var E = H.E;

  H.categories = [
    { id: 'personal', no: '01', name: 'Personal Finance', tag: 'Keuangan pribadi dan perencanaan kekayaan',
      desc: 'Menghitung kondisi keuangan individu, tabungan, nilai waktu uang, pertumbuhan aset, dan target keuangan jangka panjang.' },
    { id: 'banking', no: '02', name: 'Banking & Credit', tag: 'Perbankan, pinjaman, cicilan, dan pengelolaan utang',
      desc: 'Mengukur beban utang, kebutuhan jaminan, kemampuan membayar pinjaman, dan struktur cicilan.' },
    { id: 'corporate', no: '03', name: 'Corporate Finance', tag: 'Keuangan perusahaan, biaya modal, dan kelayakan proyek',
      desc: 'Digunakan untuk keputusan pendanaan, evaluasi proyek, valuasi perusahaan, dan analisis arus kas.' },
    { id: 'business', no: '04', name: 'Business & Operations', tag: 'Pendapatan, biaya, laba, harga, dan efisiensi usaha',
      desc: 'Membantu pemilik usaha menghitung penjualan, harga pokok, margin, titik impas, dan biaya mendapatkan pelanggan.' },
    { id: 'fsa', no: '05', name: 'Financial Statement Analysis', tag: 'Analisis rasio laporan keuangan',
      desc: 'Mengukur likuiditas, profitabilitas, solvabilitas, efisiensi aset, dan kualitas arus kas perusahaan.' },
    { id: 'stock', no: '06', name: 'Stock & Fundamental Analysis', tag: 'Analisis saham dan valuasi fundamental',
      desc: 'Digunakan untuk memahami laba per saham, valuasi pasar, nilai perusahaan, dan kebijakan dividen emiten.' },
    { id: 'investment', no: '07', name: 'Investment & Portfolio Management', tag: 'Return, risiko, diversifikasi, dan kinerja portofolio',
      desc: 'Mengukur hasil investasi, hubungan antar-aset, volatilitas, risiko pasar, dan kualitas kinerja portofolio.' },
    { id: 'trading', no: '08', name: 'Trading & Risk Management', tag: 'Manajemen risiko transaksi dan kalkulator trading',
      desc: 'Menghitung nominal risiko, ukuran posisi, potensi reward, kebutuhan margin, dan statistik performa trading.' },
    { id: 'accounting', no: '09', name: 'Accounting', tag: 'Persamaan akuntansi, laba, persediaan, dan penyusutan',
      desc: 'Mencakup perhitungan dasar untuk pencatatan transaksi, penyusunan laporan keuangan, dan pengukuran nilai aset.' },
    { id: 'micro', no: '10', name: 'Microeconomics', tag: 'Permintaan, penawaran, elastisitas, biaya, dan surplus pasar',
      desc: 'Menganalisis perilaku konsumen dan produsen, pembentukan harga, efisiensi pasar, dan dampak pajak.' },
    { id: 'macro', no: '11', name: 'Macroeconomics', tag: 'PDB, inflasi, tenaga kerja, kebijakan fiskal, dan moneter',
      desc: 'Mengukur kondisi perekonomian secara agregat, pertumbuhan, daya beli, tenaga kerja, anggaran, dan perdagangan.' },
    { id: 'stats', no: '12', name: 'Financial Statistics', tag: 'Statistik dasar untuk analisis data keuangan dan ekonomi',
      desc: 'Menyediakan ukuran ringkasan data, penyebaran, hubungan variabel, dan probabilitas untuk analisis investasi serta ekonomi.' }
  ];
  H.catById = {};
  H.categories.forEach(function (c) { H.catById[c.id] = c; });

  H.formulas = [];
  H.byId = {};

  /* ---------- konstruktor input ---------- */
  function inp(type, k, label, def, o) {
    var x = { k: k, label: label, type: type, def: def === undefined || def === null ? '' : String(def) };
    if (o) for (var key in o) x[key] = o[key];
    return x;
  }
  H.I = {
    m: function (k, l, d, o) { return inp('money', k, l, d, o); },
    n: function (k, l, d, o) { return inp('num', k, l, d, o); },
    i: function (k, l, d, o) { return inp('int', k, l, d, o); },
    p: function (k, l, d, o) { return inp('pct', k, l, d, o); },
    l: function (k, l, d, o) { return inp('list', k, l, d, o); },
    pr: function (k, l, d, o) { return inp('pairs', k, l, d, o); },
    dt: function (k, l, d, o) { return inp('dated', k, l, d, o); },
    s: function (k, l, options, d, o) { var x = inp('select', k, l, d, o); x.options = options; return x; }
  };

  /* ---------- konstruktor baris hasil ---------- */
  H.o = {
    m: function (label, value, hint) { return { label: label, value: value, kind: 'money', hint: hint }; },
    p: function (label, value, hint) { return { label: label, value: value, kind: 'pct', hint: hint }; },
    n: function (label, value, hint) { return { label: label, value: value, kind: 'num', hint: hint }; },
    x: function (label, value, hint) { return { label: label, value: value, kind: 'x', hint: hint }; },
    d: function (label, value, hint) { return { label: label, value: value, kind: 'days', hint: hint }; },
    u: function (label, value, unit, hint) { return { label: label, value: value, kind: 'unit', unit: unit, hint: hint }; },
    t: function (label, value, hint) { return { label: label, value: String(value), kind: 'text', hint: hint }; }
  };

  H.def = function (f) {
    f.also = f.also || [];
    f.related = f.related || [];
    f.tags = f.tags || '';
    if (H.byId[f.id]) throw new Error('ID rumus ganda: ' + f.id);
    if (!H.catById[f.cat]) throw new Error('Kategori tidak dikenal: ' + f.cat);
    H.formulas.push(f);
    H.byId[f.id] = f;
    return f;
  };

  /* Generator rasio sederhana a / b (dengan opsi rata-rata awal dan akhir periode). */
  H.ratio = function (s) {
    var I = H.I;
    var inputs = [];
    var numAvg = s.num.avg, denAvg = s.den.avg;
    var mk = s.money === false ? I.n : I.m;
    if (numAvg) {
      inputs.push(mk('n1', s.num.label + ' awal periode', s.num.def1, { hint: s.num.hint }));
      inputs.push(mk('n2', s.num.label + ' akhir periode', s.num.def2));
    } else inputs.push(mk('n', s.num.label, s.num.def, { hint: s.num.hint }));
    if (denAvg) {
      inputs.push(mk('d1', s.den.label + ' awal periode', s.den.def1, { hint: s.den.hint }));
      inputs.push(mk('d2', s.den.label + ' akhir periode', s.den.def2));
    } else inputs.push(mk('d', s.den.label, s.den.def, { hint: s.den.hint }));
    return H.def({
      id: s.id, cat: s.cat, also: s.also, abbr: s.abbr, name: s.name, idn: s.idn, use: s.use,
      formula: s.formula, notes: s.notes, related: s.related, tags: s.tags,
      inputs: inputs,
      calc: function (v) {
        var f = H.f;
        var a = numAvg ? (v.n1 + v.n2) / 2 : v.n;
        var b = denAvg ? (v.d1 + v.d2) / 2 : v.d;
        var r = E.div(a, b, s.zeroMsg || 'Pembagi bernilai nol, rasio tidak terdefinisi.');
        var kind = s.kind || 'x';
        var shown = kind === 'pct' ? f.p(r) : (kind === 'days' ? f.n(r) + ' hari' : f.x(r));
        var money = s.money === false ? f.n : f.m;
        var steps = [];
        if (numAvg) steps.push('Rata-rata ' + s.num.label + ' = (' + money(v.n1) + ' + ' + money(v.n2) + ') / 2 = ' + money(a));
        if (denAvg) steps.push('Rata-rata ' + s.den.label + ' = (' + money(v.d1) + ' + ' + money(v.d2) + ') / 2 = ' + money(b));
        steps.push(s.abbr + ' = ' + money(a) + ' / ' + money(b) + ' = ' + shown);
        var res = {
          head: { label: s.abbr, value: r, kind: kind === 'days' ? 'days' : kind },
          rows: [], steps: steps
        };
        if (s.rows) res.rows = s.rows(r, a, b) || [];
        if (s.note) res.note = s.note(r, a, b);
        return res;
      }
    });
  };

  /* ---------- parsing dan validasi input ---------- */
  function visible(inp, raw) { return !inp.showIf || inp.showIf(raw); }
  H.visible = visible;

  /* raw: peta k -> teks. Mengembalikan {ok, res} atau {ok:false, kind, error}. */
  H.run = function (f, raw) {
    var v = {};
    var missing = [];
    try {
      for (var i = 0; i < f.inputs.length; i++) {
        var x = f.inputs[i];
        if (!visible(x, raw)) continue;
        var txt = raw[x.k] === undefined ? '' : String(raw[x.k]).trim();
        if (x.type === 'select') { v[x.k] = txt || x.def; continue; }
        if (txt === '') {
          if (x.optional) { v[x.k] = undefined; continue; }
          missing.push(x.label);
          continue;
        }
        if (x.type === 'list') {
          v[x.k] = E.parseList(txt, x.label, { dec: x.dec });
          if (!v[x.k].length) { missing.push(x.label); continue; }
          if (x.minLen && v[x.k].length < x.minLen) E.fail(x.label + ': isi minimal ' + x.minLen + ' nilai.');
        } else if (x.type === 'pairs') {
          v[x.k] = E.parsePairs(txt, x.label);
          if (x.minLen && v[x.k].length < x.minLen) E.fail(x.label + ': isi minimal ' + x.minLen + ' baris.');
        } else if (x.type === 'dated') {
          v[x.k] = E.parseDated(txt, x.label);
          if (v[x.k].length < 2) E.fail(x.label + ': isi minimal 2 baris.');
        } else {
          var n = H.parseNum(txt, { grouping: x.type === 'money' || x.type === 'int' });
          if (n === null || isNaN(n)) E.fail(x.label + ': "' + txt + '" bukan angka yang valid.');
          if (x.type === 'int' && Math.floor(n) !== n) E.fail(x.label + ' harus bilangan bulat.');
          if (x.min !== undefined && n < x.min) E.fail(x.label + ' minimal ' + H.fmt.num(x.min) + '.');
          if (x.max !== undefined && n > x.max) E.fail(x.label + ' maksimal ' + H.fmt.num(x.max) + '.');
          if (x.gt !== undefined && !(n > x.gt)) E.fail(x.label + ' harus lebih besar dari ' + H.fmt.num(x.gt) + '.');
          v[x.k] = x.type === 'pct' ? n / 100 : n;
        }
      }
      if (missing.length) return { ok: false, kind: 'empty', error: 'Lengkapi dulu: ' + missing.join(', ') + '.' };
      var res = f.calc(v);
      if (!res || !res.head) throw new Error('Rumus tidak mengembalikan hasil.');
      var hv = res.head.value;
      if (res.head.kind !== 'text' && !isFinite(hv)) E.fail('Hasil tidak terdefinisi untuk input ini. Periksa kembali angka yang dimasukkan.');
      res.rows = res.rows || [];
      res.steps = res.steps || [];
      return { ok: true, res: res };
    } catch (e) {
      if (e && e.user) return { ok: false, kind: 'invalid', error: e.message };
      return { ok: false, kind: 'invalid', error: 'Perhitungan gagal: ' + (e && e.message ? e.message : 'kesalahan tidak dikenal') + '.' };
    }
  };

  H.defaults = function (f) {
    var raw = {};
    f.inputs.forEach(function (x) { raw[x.k] = x.def; });
    return raw;
  };

  /* ---------- pencarian dan daftar ---------- */
  H.inCat = function (catId) {
    return H.formulas.filter(function (f) { return f.cat === catId || f.also.indexOf(catId) >= 0; });
  };
  function norm(s) { return String(s || '').toLowerCase(); }
  H.search = function (q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var out = [];
    H.formulas.forEach(function (f) {
      var abbr = norm(f.abbr), name = norm(f.name), idn = norm(f.idn), use = norm(f.use), tags = norm(f.tags), id = f.id;
      var total = 0, ok = true;
      terms.forEach(function (t) {
        var s = 0;
        if (abbr === t || id === t) s = 100;
        else if (abbr.indexOf(t) === 0) s = 70;
        else if (name.indexOf(t) >= 0) s = 45;
        else if (idn.indexOf(t) >= 0) s = 40;
        else if (tags.indexOf(t) >= 0) s = 30;
        else if (use.indexOf(t) >= 0) s = 12;
        else if (abbr.indexOf(t) >= 0) s = 20;
        if (!s) ok = false;
        total += s;
      });
      if (ok) out.push({ f: f, score: total });
    });
    out.sort(function (a, b) { return b.score - a.score || a.f.name.localeCompare(b.f.name); });
    return out.map(function (o) { return o.f; });
  };
})();
