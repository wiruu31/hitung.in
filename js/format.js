/* Hitung.in: parsing angka gaya Indonesia dan format tampilan. */
(function () {
  'use strict';
  var H = (window.Hitung = window.Hitung || {});
  var settings = { currency: 'IDR' };

  var CUR = {
    IDR: { symbol: 'Rp', digits: 0, label: 'Rupiah (Rp)' },
    USD: { symbol: '$', digits: 2, label: 'Dolar AS ($)' },
    EUR: { symbol: '€', digits: 2, label: 'Euro (€)' },
    SGD: { symbol: 'S$', digits: 2, label: 'Dolar Singapura (S$)' },
    JPY: { symbol: '¥', digits: 0, label: 'Yen (¥)' }
  };

  var nf = {};
  function numFmt(maxDec, minDec) {
    var key = maxDec + ':' + (minDec || 0);
    if (!nf[key]) {
      nf[key] = new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: maxDec,
        minimumFractionDigits: minDec || 0
      });
    }
    return nf[key];
  }

  /* Ubah teks input menjadi angka. opts.grouping=true: titik boleh berarti pemisah ribuan. */
  function parseNum(raw, opts) {
    opts = opts || {};
    if (raw === null || raw === undefined) return null;
    var s = String(raw).trim().replace(/\s+/g, '').replace(/^Rp\.?/i, '').replace(/%$/, '');
    if (s === '') return null;
    if (!/^[+-]?[\d.,]+(e[+-]?\d+)?$/i.test(s)) return NaN;
    var sign = 1;
    if (s[0] === '-' || s[0] === '+') {
      if (s[0] === '-') sign = -1;
      s = s.slice(1);
    }
    var hasDot = s.indexOf('.') >= 0;
    var hasCom = s.indexOf(',') >= 0;
    var out;
    if (hasDot && hasCom) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) out = s.replace(/\./g, '').replace(',', '.');
      else out = s.replace(/,/g, '');
    } else if (hasCom) {
      if ((s.match(/,/g) || []).length > 1) out = s.replace(/,/g, '');
      else out = s.replace(',', '.');
    } else if (hasDot && opts.grouping && /^[1-9]\d{0,2}(\.\d{3})+$/.test(s)) {
      out = s.replace(/\./g, '');
    } else {
      out = s;
    }
    var n = Number(out);
    return isFinite(n) ? sign * n : NaN;
  }

  function fmtNum(v, maxDec) {
    if (v === null || v === undefined || !isFinite(v)) return 'n/a';
    if (maxDec === undefined) maxDec = 4;
    var a = Math.abs(v);
    if (a !== 0 && (a >= 1e15 || a < 1e-6)) return v.toExponential(3).replace('.', ',');
    if (a < 1 && a !== 0 && maxDec < 6) maxDec = Math.max(maxDec, 4);
    return numFmt(maxDec).format(v);
  }

  function fmtMoney(v, force) {
    if (v === null || v === undefined || !isFinite(v)) return 'n/a';
    var c = CUR[settings.currency] || CUR.IDR;
    var digits = c.digits;
    if (digits === 0 && Math.abs(v) < 1000 && Math.abs(v - Math.round(v)) > 1e-9) digits = 2;
    if (force !== undefined) digits = force;
    var neg = v < 0 && Math.round(Math.abs(v) * Math.pow(10, digits)) > 0;
    var body = numFmt(digits, digits === 2 ? 2 : 0).format(Math.abs(v));
    return (neg ? '-' : '') + c.symbol + ' ' + body;
  }

  function fmtPct(dec, d) {
    if (dec === null || dec === undefined || !isFinite(dec)) return 'n/a';
    return numFmt(d === undefined ? 2 : d).format(dec * 100) + '%';
  }

  function fmtX(v, d) {
    if (v === null || v === undefined || !isFinite(v)) return 'n/a';
    return numFmt(d === undefined ? 2 : d).format(v) + 'x';
  }

  function fmtUnit(v, unit, d) {
    return fmtNum(v, d === undefined ? 2 : d) + ' ' + unit;
  }

  /* Format sesuai jenis hasil: money, pct, num, x, days, months, years, text */
  function fmtKind(kind, v, extra) {
    switch (kind) {
      case 'money': return fmtMoney(v);
      case 'pct': return fmtPct(v);
      case 'pp': return fmtNum(v, 2) + '%';
      case 'x': return fmtX(v);
      case 'days': return fmtUnit(v, 'hari');
      case 'months': return fmtUnit(v, 'bulan');
      case 'years': return fmtUnit(v, 'tahun');
      case 'unit': return fmtUnit(v, extra || '');
      case 'text': return String(v);
      default: return fmtNum(v, extra === undefined ? 4 : extra);
    }
  }

  H.CUR = CUR;
  H.settings = settings;
  H.parseNum = parseNum;
  H.fmt = { num: fmtNum, money: fmtMoney, pct: fmtPct, x: fmtX, kind: fmtKind };
  /* Singkatan untuk teks langkah hitung */
  H.f = { n: function (v) { return fmtNum(v, 4); }, m: fmtMoney, p: fmtPct, x: fmtX };
})();
