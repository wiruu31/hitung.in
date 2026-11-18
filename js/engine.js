/* Hitung.in: fungsi matematika murni. Tidak menyentuh DOM. */
(function () {
  'use strict';
  var H = (window.Hitung = window.Hitung || {});
  var E = {};

  /* Kesalahan yang pesannya boleh ditampilkan langsung ke pengguna */
  function fail(msg) {
    var e = new Error(msg);
    e.user = true;
    throw e;
  }
  E.fail = fail;
  E.need = function (cond, msg) { if (!cond) fail(msg); };
  E.div = function (a, b, msg) {
    if (b === 0 || !isFinite(b)) fail(msg || 'Pembagi bernilai nol, hasil tidak terdefinisi.');
    return a / b;
  };

  /* Titik sampel 0..n untuk grafik (maksimal max titik, selalu memuat n). */
  E.pts = function (n, max) {
    max = max || 48;
    var step = Math.max(1, Math.ceil(n / max));
    var out = [];
    for (var i = 0; i < n; i += step) out.push(i);
    out.push(n);
    return out;
  };

  /* ---------- nilai waktu uang ---------- */
  E.fv = function (pv, r, n) { return pv * Math.pow(1 + r, n); };
  E.pv = function (fv, r, n) {
    E.need(1 + r > 0, 'Tingkat bunga harus lebih besar dari -100%.');
    return fv / Math.pow(1 + r, n);
  };
  E.annuityFV = function (pmt, r, n, due) {
    var f = r === 0 ? pmt * n : pmt * (Math.pow(1 + r, n) - 1) / r;
    return due ? f * (1 + r) : f;
  };
  E.annuityPV = function (pmt, r, n, due) {
    var f = r === 0 ? pmt * n : pmt * (1 - Math.pow(1 + r, -n)) / r;
    return due ? f * (1 + r) : f;
  };
  E.pmt = function (pv, r, n) {
    E.need(n > 0, 'Jumlah periode harus lebih dari nol.');
    return r === 0 ? pv / n : pv * r / (1 - Math.pow(1 + r, -n));
  };
  E.balance = function (pv, r, pmt, k) {
    return r === 0 ? pv - k * pmt : pv * Math.pow(1 + r, k) - pmt * ((Math.pow(1 + r, k) - 1) / r);
  };
  E.ear = function (apr, m) { return Math.pow(1 + apr / m, m) - 1; };
  E.cagr = function (b, e, n) {
    E.need(b > 0 && e > 0, 'Nilai awal dan nilai akhir harus positif.');
    E.need(n > 0, 'Jumlah tahun harus lebih dari nol.');
    return Math.pow(e / b, 1 / n) - 1;
  };

  /* Jadwal cicilan anuitas. Mengembalikan baris per periode. */
  E.schedule = function (pv, r, n, pmt) {
    var rows = [];
    var bal = pv;
    for (var k = 1; k <= n; k++) {
      var interest = bal * r;
      var principal = pmt - interest;
      bal = bal - principal;
      if (k === n || Math.abs(bal) < 1e-6) bal = Math.abs(bal) < 1e-6 ? 0 : bal;
      rows.push({ k: k, pmt: pmt, interest: interest, principal: principal, balance: Math.max(bal, 0) });
    }
    return rows;
  };

  /* Cari tingkat per periode dari cicilan tetap (bisection). */
  E.rateFromPmt = function (pv, pmt, n) {
    if (pmt * n <= pv) return 0;
    var lo = 0, hi = 1;
    while (E.annuityPV(pmt, hi, n) > pv && hi < 1e4) hi *= 2;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (E.annuityPV(pmt, mid, n) > pv) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  /* ---------- arus kas ---------- */
  /* cfs[0] terjadi pada t = 0 */
  E.npvCF = function (r, cfs) {
    var s = 0;
    for (var t = 0; t < cfs.length; t++) s += cfs[t] / Math.pow(1 + r, t);
    return s;
  };
  E.npvFrom = function (r, i0, cfs) {
    var s = 0;
    for (var t = 0; t < cfs.length; t++) s += cfs[t] / Math.pow(1 + r, t + 1);
    return s - i0;
  };

  function findRoots(f, lo, hi) {
    var grid = [];
    var x;
    for (x = lo; x <= 1; x += 0.005) grid.push(x);
    for (x = 1.5; x <= 100; x += 0.5) grid.push(x);
    var roots = [];
    var prevX = null, prevY = null;
    grid.forEach(function (gx) {
      var y = f(gx);
      if (isFinite(y)) {
        if (y === 0) roots.push(gx);
        else if (prevY !== null && prevY * y < 0) {
          var a = prevX, b = gx;
          for (var i = 0; i < 100; i++) {
            var mid = (a + b) / 2;
            if (f(a) * f(mid) <= 0) b = mid; else a = mid;
          }
          roots.push((a + b) / 2);
        }
        prevX = gx;
        prevY = y;
      }
    });
    return roots;
  }

  E.irr = function (cfs) {
    var pos = cfs.some(function (c) { return c > 0; });
    var neg = cfs.some(function (c) { return c < 0; });
    E.need(pos && neg, 'IRR butuh minimal satu arus kas positif dan satu negatif.');
    var roots = findRoots(function (r) { return E.npvCF(r, cfs); }, -0.99);
    roots.sort(function (a, b) { return Math.abs(a) - Math.abs(b); });
    return roots;
  };

  /* items: [{days, v}] */
  E.xirr = function (items) {
    var pos = items.some(function (c) { return c.v > 0; });
    var neg = items.some(function (c) { return c.v < 0; });
    E.need(pos && neg, 'Butuh arus kas masuk dan keluar.');
    var d0 = items[0].days;
    var f = function (r) {
      var s = 0;
      items.forEach(function (it) { s += it.v / Math.pow(1 + r, (it.days - d0) / 365); });
      return s;
    };
    var roots = findRoots(f, -0.99);
    roots.sort(function (a, b) { return Math.abs(a) - Math.abs(b); });
    return roots;
  };

  E.mirr = function (cfs, fin, reinv) {
    var n = cfs.length - 1;
    E.need(n >= 1, 'Butuh minimal dua arus kas.');
    var fvPos = 0, pvNeg = 0;
    cfs.forEach(function (c, t) {
      if (c > 0) fvPos += c * Math.pow(1 + reinv, n - t);
      else if (c < 0) pvNeg += c / Math.pow(1 + fin, t);
    });
    E.need(fvPos > 0 && pvNeg < 0, 'MIRR butuh arus kas positif dan negatif.');
    return Math.pow(fvPos / -pvNeg, 1 / n) - 1;
  };

  /* i0 positif, cfs untuk t = 1..n. Hasil dalam periode, atau null bila belum balik modal. */
  E.payback = function (i0, cfs) {
    var cum = 0;
    for (var t = 0; t < cfs.length; t++) {
      if (cum + cfs[t] >= i0 && cfs[t] > 0) return t + (i0 - cum) / cfs[t];
      cum += cfs[t];
    }
    return null;
  };
  E.discountedPayback = function (i0, cfs, r) {
    return E.payback(i0, cfs.map(function (c, t) { return c / Math.pow(1 + r, t + 1); }));
  };

  /* ---------- statistik ---------- */
  E.sum = function (a) { return a.reduce(function (s, x) { return s + x; }, 0); };
  E.mean = function (a) { E.need(a.length > 0, 'Data kosong.'); return E.sum(a) / a.length; };
  E.variance = function (a, sample) {
    var n = a.length;
    E.need(n >= (sample ? 2 : 1), sample ? 'Varians sampel butuh minimal 2 data.' : 'Data kosong.');
    var m = E.mean(a);
    var ss = a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0);
    return ss / (sample ? n - 1 : n);
  };
  E.sd = function (a, sample) { return Math.sqrt(E.variance(a, sample)); };
  E.cov = function (x, y, sample) {
    E.need(x.length === y.length, 'Jumlah data X dan Y harus sama (' + x.length + ' vs ' + y.length + ').');
    var n = x.length;
    E.need(n >= (sample ? 2 : 1), 'Data terlalu sedikit.');
    var mx = E.mean(x), my = E.mean(y), s = 0;
    for (var i = 0; i < n; i++) s += (x[i] - mx) * (y[i] - my);
    return s / (sample ? n - 1 : n);
  };
  E.corr = function (x, y) {
    var c = E.cov(x, y, true);
    var d = E.sd(x, true) * E.sd(y, true);
    return E.div(c, d, 'Salah satu data tidak bervariasi (simpangan baku nol).');
  };
  E.maxDrawdown = function (vals) {
    E.need(vals.length >= 2, 'Butuh minimal dua nilai.');
    var peak = vals[0], peakI = 0, best = { dd: 0, peak: vals[0], trough: vals[0], pi: 0, ti: 0 };
    var dds = [];
    vals.forEach(function (v, i) {
      if (v > peak) { peak = v; peakI = i; }
      var dd = peak > 0 ? (peak - v) / peak : 0;
      dds.push(dd);
      if (dd > best.dd) best = { dd: dd, peak: peak, trough: v, pi: peakI, ti: i };
    });
    best.series = dds;
    return best;
  };

  /* ---------- penyusutan ---------- */
  E.depSL = function (cost, residual, life) {
    var yr = (cost - residual) / life;
    var rows = [], acc = 0;
    for (var y = 1; y <= life; y++) {
      acc += yr;
      rows.push({ y: y, dep: yr, acc: acc, book: cost - acc });
    }
    return rows;
  };
  E.depDB = function (cost, residual, life, factor) {
    var rate = factor / life;
    var rows = [], book = cost, acc = 0;
    for (var y = 1; y <= life; y++) {
      var dep = book * rate;
      if (book - dep < residual) dep = Math.max(book - residual, 0);
      if (y === life && book - dep > residual) dep = book - residual;
      book -= dep;
      acc += dep;
      rows.push({ y: y, dep: dep, acc: acc, book: book });
    }
    return { rate: rate, rows: rows };
  };

  /* ---------- parsing daftar ---------- */
  E.parseList = function (text, label, opts) {
    var s = String(text || '').trim();
    if (!s) return [];
    var toks = s.replace(/,\s+/g, ' ').split(/[\s;]+/).filter(Boolean);
    return toks.map(function (t, i) {
      var v = H.parseNum(t, { grouping: !(opts && opts.dec) });
      if (v === null || isNaN(v)) fail((label || 'Daftar') + ': nilai ke-' + (i + 1) + ' ("' + t + '") bukan angka.');
      return v;
    });
  };
  E.parsePairs = function (text, label) {
    var lines = String(text || '').split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    return lines.map(function (l, i) {
      var parts = l.replace(/,\s+/g, ' ').split(/[\s;\t]+/).filter(Boolean);
      if (parts.length !== 2) fail((label || 'Daftar') + ': baris ' + (i + 1) + ' harus berisi dua angka, misalnya "30 8".');
      var a = H.parseNum(parts[0], { grouping: true }), b = H.parseNum(parts[1], { grouping: true });
      if (a === null || b === null || isNaN(a) || isNaN(b)) fail((label || 'Daftar') + ': baris ' + (i + 1) + ' berisi angka tidak valid.');
      return [a, b];
    });
  };
  E.parseDated = function (text, label) {
    var lines = String(text || '').split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var items = lines.map(function (l, i) {
      var m = l.match(/^(\d{4})-(\d{2})-(\d{2})[\s;,]+(.+)$/);
      if (!m) fail((label || 'Daftar') + ': baris ' + (i + 1) + ' harus berbentuk "2025-01-31; -1000000".');
      var days = Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000;
      var v = H.parseNum(m[4], { grouping: true });
      if (v === null || isNaN(v) || isNaN(days)) fail((label || 'Daftar') + ': baris ' + (i + 1) + ' berisi tanggal atau angka tidak valid.');
      return { days: days, date: m[1] + '-' + m[2] + '-' + m[3], v: v };
    });
    items.sort(function (a, b) { return a.days - b.days; });
    return items;
  };

  H.E = E;
})();
