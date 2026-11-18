/* Hitung.in v2.0.0: grafik SVG tanpa pustaka luar. Warna diambil dari variabel CSS agar ikut tema. */
(function () {
  'use strict';
  var H = (window.Hitung = window.Hitung || {});
  var W = 640, HT = 300, PAD = { l: 64, r: 16, t: 16, b: 40 };
  function sizeFor() {
    var narrow = window.innerWidth && window.innerWidth <= 640;
    W = narrow ? 340 : 640; HT = narrow ? 260 : 300; PAD.l = narrow ? 78 : 70;
  }
  var NS = 'http://www.w3.org/2000/svg';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Format ringkas untuk sumbu: rb, jt, M, T pada rupiah dan K, M, B pada mata uang lain. */
  function compact(v) {
    var a = Math.abs(v), sign = v < 0 ? '-' : '';
    var idr = (H.settings && H.settings.currency === 'IDR');
    var units = idr ? [[1e12, ' T'], [1e9, ' M'], [1e6, ' jt'], [1e3, ' rb']] : [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
    for (var i = 0; i < units.length; i++) {
      if (a >= units[i][0]) return sign + H.fmt.num(a / units[i][0], 1) + units[i][1];
    }
    return sign + H.fmt.num(a, a < 1 ? 3 : 2);
  }

  function axisFmt(kind) {
    if (kind === 'pct' || kind === 'pct0') return function (v) { return H.fmt.pct(v, 0); };
    if (kind === 'money') return function (v) { return (H.settings.currency === 'IDR' ? 'Rp ' : '') + compact(v); };
    return compact;
  }
  function fullFmt(kind) {
    if (kind === 'pct') return function (v) { return H.fmt.pct(v); };
    if (kind === 'pct0') return function (v) { return H.fmt.pct(v, 1); };
    if (kind === 'money') return function (v) { return H.fmt.money(v); };
    return function (v) { return H.fmt.num(v, 2); };
  }

  /* Skala sumbu dengan angka bulat. */
  function niceScale(min, max, ticks) {
    if (min === max) { max = min + 1; min = min - (min === 0 ? 0 : 1); }
    var span = max - min, raw = span / (ticks || 5);
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag, step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
    step *= mag;
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
    for (var t = lo; t <= hi + step / 2; t += step) out.push(Math.abs(t) < step * 1e-9 ? 0 : t);
    return { lo: lo, hi: hi, ticks: out };
  }

  function frame(inner, label) {
    return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + HT + '" role="img" aria-label="' + esc(label) + '" xmlns="' + NS + '">' + inner + '</svg>';
  }

  function gridY(sc, y, af) {
    var s = '';
    sc.ticks.forEach(function (t) {
      var yy = y(t);
      s += '<line class="c-grid' + (t === 0 ? ' c-zero' : '') + '" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + yy + '" y2="' + yy + '"/>';
      s += '<text class="c-tick" x="' + (PAD.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(af(t)) + '</text>';
    });
    return s;
  }

  function bar(c) {
    var bars = c.bars || [], af = axisFmt(c.fmt), ff = fullFmt(c.fmt);
    var vals = bars.map(function (b) { return b.value; });
    var lo = Math.min.apply(null, vals.concat([0])), hi = Math.max.apply(null, vals.concat([0]));
    if (c.refLine !== undefined) { lo = Math.min(lo, c.refLine); hi = Math.max(hi, c.refLine); }
    var sc = niceScale(lo, hi, 5), iw = W - PAD.l - PAD.r, ih = HT - PAD.t - PAD.b;
    var y = function (v) { return PAD.t + ih - (v - sc.lo) / (sc.hi - sc.lo) * ih; };
    var slot = iw / Math.max(bars.length, 1), bw = Math.min(slot * 0.66, 72);
    var s = gridY(sc, y, af);
    var showVal = bars.length <= 8;
    bars.forEach(function (b, i) {
      var x = PAD.l + slot * i + (slot - bw) / 2, y0 = y(0), y1 = y(b.value);
      var top = Math.min(y0, y1), h = Math.max(Math.abs(y0 - y1), 1);
      s += '<rect class="c-bar' + (b.value < 0 ? ' neg' : '') + '" x="' + x.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="5"><title>' + esc(b.label + ': ' + ff(b.value)) + '</title></rect>';
      if (showVal) s += '<text class="c-val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (b.value < 0 ? top + h + 14 : top - 6).toFixed(1) + '" text-anchor="middle">' + esc(af(b.value)) + '</text>';
      if (bars.length <= 14 || i % Math.ceil(bars.length / 12) === 0) {
        var lab = String(b.label); if (lab.length > 14) lab = lab.slice(0, 13) + '.';
        s += '<text class="c-tick" x="' + (x + bw / 2).toFixed(1) + '" y="' + (HT - PAD.b + 18) + '" text-anchor="middle">' + esc(lab) + '</text>';
      }
    });
    if (c.refLine !== undefined) {
      s += '<line class="c-ref" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + y(c.refLine) + '" y2="' + y(c.refLine) + '"/>';
      s += '<text class="c-reftxt" x="' + (W - PAD.r) + '" y="' + (y(c.refLine) - 5) + '" text-anchor="end">rata-rata ' + esc(ff(c.refLine)) + '</text>';
    }
    return { svg: frame(s, c.title + '. ' + bars.map(function (b) { return b.label + ' ' + ff(b.value); }).join(', ')), legend: null };
  }

  function line(c) {
    var xs = c.x, series = c.series, af = axisFmt(c.fmt), ff = fullFmt(c.fmt);
    var all = []; series.forEach(function (s) { s.values.forEach(function (v) { if (isFinite(v)) all.push(v); }); });
    var sc = niceScale(Math.min.apply(null, all), Math.max.apply(null, all), 5);
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs); if (xmin === xmax) xmax = xmin + 1;
    var iw = W - PAD.l - PAD.r, ih = HT - PAD.t - PAD.b;
    var x = function (v) { return PAD.l + (v - xmin) / (xmax - xmin) * iw; };
    var y = function (v) { return PAD.t + ih - (v - sc.lo) / (sc.hi - sc.lo) * ih; };
    var s = gridY(sc, y, af);
    var nt = Math.min(xs.length, 6);
    for (var i = 0; i < nt; i++) {
      var xv = xs[Math.round(i * (xs.length - 1) / Math.max(nt - 1, 1))];
      s += '<text class="c-tick" x="' + x(xv).toFixed(1) + '" y="' + (HT - PAD.b + 18) + '" text-anchor="middle">' + esc(H.fmt.num(xv, 2)) + '</text>';
    }
    if (c.xLabel) s += '<text class="c-axis" x="' + (PAD.l + iw / 2) + '" y="' + (HT - 6) + '" text-anchor="middle">' + esc(c.xLabel) + '</text>';
    if (c.markX !== undefined && c.markX >= xmin && c.markX <= xmax) {
      s += '<line class="c-ref" x1="' + x(c.markX).toFixed(1) + '" x2="' + x(c.markX).toFixed(1) + '" y1="' + PAD.t + '" y2="' + (PAD.t + ih) + '"/>';
      s += '<text class="c-reftxt" x="' + (x(c.markX) + 5).toFixed(1) + '" y="' + (PAD.t + 12) + '">' + esc(H.fmt.num(c.markX, 2)) + '</text>';
    }
    series.forEach(function (se, k) {
      var d = '';
      se.values.forEach(function (v, i) { if (isFinite(v)) d += (d ? 'L' : 'M') + x(xs[i]).toFixed(1) + ' ' + y(v).toFixed(1); });
      if (k === 0 && se.values.length > 1 && se.values.every(isFinite)) {
        var base = y(sc.lo < 0 && sc.hi > 0 ? 0 : sc.lo);
        s += '<path class="c-area s0" d="' + d + 'L' + x(xs[xs.length - 1]).toFixed(1) + ' ' + base.toFixed(1) + 'L' + x(xs[0]).toFixed(1) + ' ' + base.toFixed(1) + 'Z"/>';
      }
      s += '<path class="c-line s' + (k % 4) + '" d="' + d + '"/>';
      if (xs.length <= 24) se.values.forEach(function (v, i) { if (isFinite(v)) s += '<circle class="c-dot s' + (k % 4) + '" cx="' + x(xs[i]).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3"><title>' + esc(se.name + ' (' + H.fmt.num(xs[i], 2) + '): ' + ff(v)) + '</title></circle>'; });
    });
    if (c.mark && series[0]) {
      c.mark.forEach(function (idx, j) {
        var v = series[0].values[idx]; if (v === undefined) return;
        s += '<circle class="c-mark" cx="' + x(xs[idx]).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="6"/>';
        s += '<text class="c-reftxt" x="' + x(xs[idx]).toFixed(1) + '" y="' + (y(v) + (j === 0 ? -12 : 20)).toFixed(1) + '" text-anchor="middle">' + (j === 0 ? 'puncak' : 'lembah') + '</text>';
      });
    }
    var legend = series.length > 1 ? series.map(function (se, k) { return { label: se.name, cls: 's' + (k % 4) }; }) : null;
    return { svg: frame(s, c.title + '. Grafik garis dengan ' + series.length + ' seri dan ' + xs.length + ' titik.'), legend: legend };
  }

  function donut(c) {
    var parts = (c.parts || []).filter(function (p) { return p.value > 0 && isFinite(p.value); });
    var total = parts.reduce(function (a, p) { return a + p.value; }, 0), ff = fullFmt(c.fmt);
    if (!total) return null;
    var cx = 150, cy = 150, R = 130, r = 78, a0 = -Math.PI / 2, s = '';
    parts.forEach(function (p, i) {
      var frac = p.value / total, a1 = a0 + frac * Math.PI * 2;
      if (frac > 0.9999) {
        s += '<circle class="c-slice k' + (i % 6) + '" cx="' + cx + '" cy="' + cy + '" r="' + ((R + r) / 2) + '" fill="none" stroke-width="' + (R - r) + '"><title>' + esc(p.label + ': ' + ff(p.value)) + '</title></circle>';
      } else {
        var large = frac > 0.5 ? 1 : 0;
        var pt = function (a, rad) { return (cx + rad * Math.cos(a)).toFixed(2) + ' ' + (cy + rad * Math.sin(a)).toFixed(2); };
        s += '<path class="c-slice k' + (i % 6) + '" d="M' + pt(a0, R) + ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + pt(a1, R) + ' L' + pt(a1, r) + ' A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + pt(a0, r) + 'Z"><title>' + esc(p.label + ': ' + ff(p.value) + ' (' + H.fmt.pct(frac, 1) + ')') + '</title></path>';
      }
      a0 = a1;
    });
    s += '<text class="c-center" x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle">Total</text><text class="c-center-sub" x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle">' + esc(c.fmt === 'money' ? compact(total) : (c.fmt === 'pct' || c.fmt === 'pct0' ? H.fmt.pct(total, 0) : H.fmt.num(total, 2))) + '</text>';
    var svg = '<svg class="chart-svg donut" viewBox="0 0 300 300" role="img" aria-label="' + esc(c.title + '. ' + parts.map(function (p) { return p.label + ' ' + H.fmt.pct(p.value / total, 1); }).join(', ')) + '" xmlns="' + NS + '">' + s + '</svg>';
    return { svg: svg, donut: true, legend: parts.map(function (p, i) { return { label: p.label, cls: 'k' + (i % 6), value: ff(p.value) + ' (' + H.fmt.pct(p.value / total, 1) + ')' }; }) };
  }

  function scatter(c) {
    var pts = c.points || [], xv = pts.map(function (p) { return p[0]; }), yv = pts.map(function (p) { return p[1]; });
    var sx = niceScale(Math.min.apply(null, xv), Math.max.apply(null, xv), 5), sy = niceScale(Math.min.apply(null, yv), Math.max.apply(null, yv), 5);
    var iw = W - PAD.l - PAD.r, ih = HT - PAD.t - PAD.b;
    var x = function (v) { return PAD.l + (v - sx.lo) / (sx.hi - sx.lo) * iw; };
    var y = function (v) { return PAD.t + ih - (v - sy.lo) / (sy.hi - sy.lo) * ih; };
    var s = gridY(sy, y, function (v) { return H.fmt.num(v, 2); });
    sx.ticks.forEach(function (t) { s += '<text class="c-tick" x="' + x(t).toFixed(1) + '" y="' + (HT - PAD.b + 18) + '" text-anchor="middle">' + esc(H.fmt.num(t, 2)) + '</text>'; });
    if (c.xLabel) s += '<text class="c-axis" x="' + (PAD.l + iw / 2) + '" y="' + (HT - 6) + '" text-anchor="middle">' + esc(c.xLabel) + '</text>';
    if (c.yLabel) s += '<text class="c-axis" transform="translate(12 ' + (PAD.t + ih / 2) + ') rotate(-90)" text-anchor="middle">' + esc(c.yLabel) + '</text>';
    if (c.line) {
      var ya = c.line.intercept + c.line.slope * sx.lo, yb = c.line.intercept + c.line.slope * sx.hi;
      s += '<line class="c-ref solid" x1="' + x(sx.lo) + '" y1="' + y(ya).toFixed(1) + '" x2="' + x(sx.hi) + '" y2="' + y(yb).toFixed(1) + '"/>';
    }
    pts.forEach(function (p) { s += '<circle class="c-dot s0" cx="' + x(p[0]).toFixed(1) + '" cy="' + y(p[1]).toFixed(1) + '" r="4"><title>' + esc('(' + H.fmt.num(p[0], 3) + '; ' + H.fmt.num(p[1], 3) + ')') + '</title></circle>'; });
    return { svg: frame(s, c.title + '. Diagram sebar dengan ' + pts.length + ' titik.'), legend: null };
  }

  /* Mengembalikan HTML figur grafik, atau string kosong bila data tidak layak digambar. */
  H.chartHTML = function (c) {
    if (!c) return '';
    var r = null;
    sizeFor();
    try {
      if (c.type === 'bar' && c.bars && c.bars.length) r = bar(c);
      else if (c.type === 'line' && c.x && c.x.length > 1) r = line(c);
      else if (c.type === 'donut') r = donut(c);
      else if (c.type === 'scatter' && c.points && c.points.length > 1) r = scatter(c);
    } catch (e) { r = null; }
    if (!r) return '';
    var leg = '';
    if (r.legend) {
      leg = '<ul class="chart-legend">' + r.legend.map(function (l) {
        return '<li><span class="sw ' + l.cls + '" aria-hidden="true"></span><span class="lt">' + esc(l.label) + '</span>' + (l.value ? '<span class="lv">' + esc(l.value) + '</span>' : '') + '</li>';
      }).join('') + '</ul>';
    }
    return '<figure class="chart' + (r.donut ? ' chart-donut' : '') + '"><figcaption>' + esc(c.title || 'Grafik') + '</figcaption><div class="chart-body">' + r.svg + leg + '</div></figure>';
  };
})();
