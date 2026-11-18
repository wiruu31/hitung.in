/* Kategori 10: Microeconomics (TR, TC, CM, CMR, BEP, MOS didefinisikan di business.js dan ditampilkan juga di sini) */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'micro';

  function fitLine(p1, q1, p2, q2, what) {
    E.need(p1 !== p2, 'Dua harga harus berbeda untuk membentuk garis ' + what + '.');
    var slope = (q2 - q1) / (p2 - p1);
    return { slope: slope, icpt: q1 - slope * p1 };
  }
  function priceRange(a, b) {
    var lo = Math.min(a, b), hi = Math.max(a, b), span = hi - lo || Math.abs(hi) || 1, xs = [];
    for (var i = 0; i <= 12; i++) xs.push(Math.round((lo - span * 0.5 + (span * 2) * i / 12) * 100) / 100);
    return xs;
  }

  H.def({
    id: 'demand', cat: C, also: ['business'], abbr: 'Qd', name: 'Demand Function', idn: 'Fungsi Permintaan',
    use: 'Menggambarkan hubungan antara harga dan jumlah barang yang diminta.',
    formula: 'Linear form: Q_d = a - bP\nTwo-point form: (P-P1)/(P2-P1) = (Q-Q1)/(Q2-Q1)',
    notes: 'Pada kurva permintaan linear biasa, b > 0 sehingga kemiringan Q terhadap P negatif. Pastikan titik data memakai satuan yang sama.',
    related: ['Business & Operations'], tags: 'permintaan demand kurva',
    inputs: [I.s('mode', 'Cara input', [['lin', 'Diketahui a dan b'], ['two', 'Dari dua titik data']], 'lin'),
      I.n('a', 'Intersep (a)', 1000, { showIf: function (r) { return r.mode !== 'two'; } }), I.n('b', 'Kemiringan (b, positif)', 2, { showIf: function (r) { return r.mode !== 'two'; } }),
      I.n('p1', 'Harga titik 1 (P1)', 100, { showIf: function (r) { return r.mode === 'two'; } }), I.n('q1', 'Jumlah titik 1 (Q1)', 800, { showIf: function (r) { return r.mode === 'two'; } }),
      I.n('p2', 'Harga titik 2 (P2)', 200, { showIf: function (r) { return r.mode === 'two'; } }), I.n('q2', 'Jumlah titik 2 (Q2)', 600, { showIf: function (r) { return r.mode === 'two'; } }),
      I.n('p', 'Harga yang dievaluasi (P)', 150, { optional: true, min: 0 })],
    calc: function (v) {
      var a, b;
      if (v.mode === 'two') { var L = fitLine(v.p1, v.q1, v.p2, v.q2, 'permintaan'); a = L.icpt; b = -L.slope; } else { a = v.a; b = v.b; }
      E.need(b !== 0, 'Kemiringan bernilai nol, kurva permintaan datar.');
      var rows = [o.n('Intersep (a)', a), o.n('Kemiringan (b)', b), o.n('Harga maksimum (Q = 0)', a / b, 'willingness to pay tertinggi')], steps = ['Q_d = ' + f.n(a) + ' - ' + f.n(b) + 'P'];
      var head;
      if (v.p !== undefined) { var q = a - b * v.p; steps.push('Pada P = ' + f.n(v.p) + ': Q_d = ' + f.n(a) + ' - ' + f.n(b) + ' x ' + f.n(v.p) + ' = ' + f.n(q)); head = { label: 'Q_d pada P = ' + f.n(v.p), value: q, kind: 'num' }; } else head = { label: 'Persamaan', value: 'Q_d = ' + f.n(a) + ' - ' + f.n(b) + 'P', kind: 'text' };
      var xs = priceRange(0, a / b);
      return { head: head, rows: rows, steps: steps, note: b < 0 ? 'b negatif: kurva miring ke atas, bukan kurva permintaan biasa.' : undefined,
        chart: { type: 'line', title: 'Kurva permintaan', fmt: 'num', xLabel: 'Harga (P)', x: xs, series: [{ name: 'Q_d', values: xs.map(function (p) { return Math.max(a - b * p, 0); }) }] } };
    }
  });

  H.def({
    id: 'supply', cat: C, also: ['business'], abbr: 'Qs', name: 'Supply Function', idn: 'Fungsi Penawaran',
    use: 'Menggambarkan hubungan antara harga dan jumlah barang yang ditawarkan.',
    formula: 'Linear form: Q_s = c + dP\nTwo-point form: (P-P1)/(P2-P1) = (Q-Q1)/(Q2-Q1)',
    notes: 'Pada kurva penawaran linear biasa, d > 0 sehingga jumlah yang ditawarkan naik saat harga naik.',
    related: ['Business & Operations'], tags: 'penawaran supply kurva',
    inputs: [I.s('mode', 'Cara input', [['lin', 'Diketahui c dan d'], ['two', 'Dari dua titik data']], 'lin'),
      I.n('c', 'Intersep (c)', 100, { showIf: function (r) { return r.mode !== 'two'; } }), I.n('d', 'Kemiringan (d, positif)', 3, { showIf: function (r) { return r.mode !== 'two'; } }),
      I.n('p1', 'Harga titik 1 (P1)', 100, { showIf: function (r) { return r.mode === 'two'; } }), I.n('q1', 'Jumlah titik 1 (Q1)', 400, { showIf: function (r) { return r.mode === 'two'; } }),
      I.n('p2', 'Harga titik 2 (P2)', 200, { showIf: function (r) { return r.mode === 'two'; } }), I.n('q2', 'Jumlah titik 2 (Q2)', 700, { showIf: function (r) { return r.mode === 'two'; } }),
      I.n('p', 'Harga yang dievaluasi (P)', 150, { optional: true, min: 0 })],
    calc: function (v) {
      var c, d;
      if (v.mode === 'two') { var L = fitLine(v.p1, v.q1, v.p2, v.q2, 'penawaran'); c = L.icpt; d = L.slope; } else { c = v.c; d = v.d; }
      E.need(d !== 0, 'Kemiringan bernilai nol, kurva penawaran datar.');
      var rows = [o.n('Intersep (c)', c), o.n('Kemiringan (d)', d), o.n('Harga minimum penawar (Q = 0)', -c / d)], steps = ['Q_s = ' + f.n(c) + ' + ' + f.n(d) + 'P'], head;
      if (v.p !== undefined) { var q = c + d * v.p; steps.push('Pada P = ' + f.n(v.p) + ': Q_s = ' + f.n(c) + ' + ' + f.n(d) + ' x ' + f.n(v.p) + ' = ' + f.n(q)); head = { label: 'Q_s pada P = ' + f.n(v.p), value: q, kind: 'num' }; } else head = { label: 'Persamaan', value: 'Q_s = ' + f.n(c) + ' + ' + f.n(d) + 'P', kind: 'text' };
      var xs = priceRange(Math.max(-c / d, 0), Math.max(-c / d, 0) + 200);
      return { head: head, rows: rows, steps: steps, note: d < 0 ? 'd negatif: kurva miring ke bawah, bukan kurva penawaran biasa.' : undefined,
        chart: { type: 'line', title: 'Kurva penawaran', fmt: 'num', xLabel: 'Harga (P)', x: xs, series: [{ name: 'Q_s', values: xs.map(function (p) { return Math.max(c + d * p, 0); }) }] } };
    }
  });

  H.def({
    id: 'equilibrium', cat: C, also: ['macro'], abbr: 'P*', name: 'Market Equilibrium', idn: 'Keseimbangan Pasar',
    use: 'Menentukan harga dan kuantitas ketika jumlah diminta sama dengan jumlah ditawarkan.',
    formula: 'Set Q_d = Q_s\nIf Q_d = a - bP and Q_s = c + dP: P* = (a - c) / (b + d)\nQ* = a - bP*',
    notes: 'P* = harga keseimbangan; Q* = kuantitas keseimbangan.',
    related: ['Macroeconomics'], tags: 'keseimbangan pasar ekuilibrium harga',
    inputs: [I.n('a', 'Intersep permintaan (a)', 1000), I.n('b', 'Kemiringan permintaan (b)', 2, { gt: 0 }), I.n('c', 'Intersep penawaran (c)', 100), I.n('d', 'Kemiringan penawaran (d)', 3, { gt: 0 })],
    calc: function (v) {
      var p = (v.a - v.c) / (v.b + v.d), q = v.a - v.b * p;
      E.need(p > 0 && q > 0, 'Tidak ada keseimbangan dengan harga dan kuantitas positif untuk parameter ini.');
      var xs = priceRange(0, p * 2);
      return { head: { label: 'Harga keseimbangan (P*)', value: p, kind: 'num' }, rows: [o.n('Kuantitas keseimbangan (Q*)', q), o.n('Cek Q_s pada P*', v.c + v.d * p), o.n('Pendapatan pasar (P* x Q*)', p * q)],
        steps: ['P* = (' + f.n(v.a) + ' - ' + f.n(v.c) + ') / (' + f.n(v.b) + ' + ' + f.n(v.d) + ') = ' + f.n(p), 'Q* = ' + f.n(v.a) + ' - ' + f.n(v.b) + ' x ' + f.n(p) + ' = ' + f.n(q)],
        chart: { type: 'line', title: 'Permintaan, penawaran, dan titik keseimbangan', fmt: 'num', xLabel: 'Harga (P)', x: xs, series: [{ name: 'Q_d', values: xs.map(function (x) { return Math.max(v.a - v.b * x, 0); }) }, { name: 'Q_s', values: xs.map(function (x) { return Math.max(v.c + v.d * x, 0); }) }], markX: p } };
    }
  });

  function elasticity(id, abbr, name, idn, use, formula, notes, tags, qLabel, side) {
    H.def({
      id: id, cat: C, also: ['business'], abbr: abbr, name: name, idn: idn, use: use, formula: formula, notes: notes, related: ['Business & Operations'], tags: tags,
      inputs: [I.s('m', 'Metode', [['mid', 'Titik tengah (midpoint)'], ['simple', 'Persentase sederhana']], 'mid'), I.n('p1', 'Harga awal (P1)', 100, { gt: 0 }), I.n('p2', 'Harga baru (P2)', 110, { gt: 0 }), I.n('q1', qLabel + ' awal (Q1)', 500, { min: 0 }), I.n('q2', qLabel + ' baru (Q2)', 460, { min: 0 })],
      calc: function (v) {
        var dq, dp;
        if (v.m === 'mid') { dq = (v.q2 - v.q1) / ((v.q1 + v.q2) / 2); dp = (v.p2 - v.p1) / ((v.p1 + v.p2) / 2); }
        else { E.need(v.q1 > 0, 'Q1 harus lebih besar dari nol untuk metode sederhana.'); dq = (v.q2 - v.q1) / v.q1; dp = (v.p2 - v.p1) / v.p1; }
        E.need(dp !== 0, 'Harga tidak berubah, elastisitas tidak terdefinisi.');
        var e = dq / dp, a = Math.abs(e);
        var cls = a > 1 ? 'elastis (|E| > 1)' : (a < 1 ? 'inelastis (|E| < 1)' : 'unit elastis (|E| = 1)');
        return { head: { label: abbr, value: e, kind: 'num' }, rows: [o.p('%' + String.fromCharCode(916) + 'Q', dq), o.p('%' + String.fromCharCode(916) + 'P', dp), o.n('Nilai absolut |E|', a), o.t('Klasifikasi', cls)],
          steps: ['%' + String.fromCharCode(916) + 'Q = ' + f.p(dq, 3) + ', %' + String.fromCharCode(916) + 'P = ' + f.p(dp, 3), abbr + ' = ' + f.p(dq, 3) + ' / ' + f.p(dp, 3) + ' = ' + f.n(e)],
          note: side === 'd' ? (e > 0 ? 'Tanda positif tidak lazim untuk permintaan biasa. Cek arah perubahan data.' : 'Tanda negatif menunjukkan hubungan terbalik antara harga dan jumlah diminta. Klasifikasi memakai nilai absolut.') : (e < 0 ? 'Tanda negatif tidak lazim untuk penawaran biasa. Cek arah perubahan data.' : 'Tanda positif sesuai hukum penawaran.') };
      }
    });
  }
  elasticity('ped', 'PED', 'Price Elasticity of Demand', 'Elastisitas Harga Permintaan', 'Mengukur persentase perubahan jumlah permintaan akibat persentase perubahan harga.', 'PED = %dQ_d / %dP\nMidpoint: [(Q2-Q1)/((Q1+Q2)/2)] / [(P2-P1)/((P1+P2)/2)]', 'Nilai PED sering ditampilkan dalam nilai absolut untuk klasifikasi elastis atau inelastis, tetapi tanda negatif menunjukkan hubungan terbalik.', 'elastisitas harga permintaan ped', 'Jumlah diminta', 'd');
  elasticity('pes', 'PES', 'Price Elasticity of Supply', 'Elastisitas Harga Penawaran', 'Mengukur persentase perubahan jumlah penawaran akibat persentase perubahan harga.', 'PES = %dQ_s / %dP\nMidpoint: [(Q2-Q1)/((Q1+Q2)/2)] / [(P2-P1)/((P1+P2)/2)]', 'Gunakan metode midpoint untuk membandingkan perubahan antara dua titik tanpa bergantung titik awal.', 'elastisitas harga penawaran pes', 'Jumlah ditawarkan', 's');

  H.def({
    id: 'yed', cat: C, also: ['macro'], abbr: 'YED', name: 'Income Elasticity of Demand', idn: 'Elastisitas Pendapatan Permintaan',
    use: 'Mengukur perubahan permintaan akibat perubahan pendapatan konsumen.',
    formula: 'YED = %dQ_d / %dIncome',
    notes: 'YED positif umumnya menunjukkan barang normal; YED negatif menunjukkan barang inferior.',
    related: ['Macroeconomics'], tags: 'elastisitas pendapatan yed barang normal inferior',
    inputs: [I.n('y1', 'Pendapatan awal', 8000000, { gt: 0 }), I.n('y2', 'Pendapatan baru', 9000000, { gt: 0 }), I.n('q1', 'Jumlah diminta awal', 100, { min: 0 }), I.n('q2', 'Jumlah diminta baru', 112, { min: 0 })],
    calc: function (v) {
      E.need(v.q1 > 0, 'Jumlah diminta awal harus lebih besar dari nol.');
      var dq = (v.q2 - v.q1) / v.q1, dy = (v.y2 - v.y1) / v.y1;
      E.need(dy !== 0, 'Pendapatan tidak berubah, YED tidak terdefinisi.');
      var e = dq / dy;
      return { head: { label: 'YED', value: e, kind: 'num' }, rows: [o.p('%dQ', dq), o.p('%dIncome', dy), o.t('Jenis barang', e > 1 ? 'Normal, mewah (YED > 1)' : (e >= 0 ? 'Normal, kebutuhan (0 sampai 1)' : 'Inferior (YED < 0)'))],
        steps: ['%dQ = ' + f.p(dq, 3) + ', %dIncome = ' + f.p(dy, 3), 'YED = ' + f.n(e)] };
    }
  });

  H.def({
    id: 'xed', cat: C, also: ['business'], abbr: 'XED', name: 'Cross Elasticity of Demand', idn: 'Elastisitas Silang Permintaan',
    use: 'Mengukur perubahan permintaan barang A akibat perubahan harga barang B.',
    formula: 'XED = %dQ_d(A) / %dP(B)',
    notes: 'XED positif biasanya menunjukkan barang substitusi; XED negatif biasanya menunjukkan barang komplementer.',
    related: ['Business & Operations'], tags: 'elastisitas silang xed substitusi komplementer',
    inputs: [I.n('qa1', 'Jumlah diminta barang A awal', 200, { gt: 0 }), I.n('qa2', 'Jumlah diminta barang A baru', 230, { min: 0 }), I.n('pb1', 'Harga barang B awal', 50, { gt: 0 }), I.n('pb2', 'Harga barang B baru', 55, { gt: 0 })],
    calc: function (v) {
      var dq = (v.qa2 - v.qa1) / v.qa1, dp = (v.pb2 - v.pb1) / v.pb1;
      E.need(dp !== 0, 'Harga barang B tidak berubah, XED tidak terdefinisi.');
      var e = dq / dp;
      return { head: { label: 'XED', value: e, kind: 'num' }, rows: [o.p('%dQ(A)', dq), o.p('%dP(B)', dp), o.t('Hubungan barang', e > 0 ? 'Cenderung substitusi' : (e < 0 ? 'Cenderung komplementer' : 'Tidak terkait'))], steps: ['XED = ' + f.p(dq, 3) + ' / ' + f.p(dp, 3) + ' = ' + f.n(e)] };
    }
  });

  H.def({
    id: 'ar', cat: C, also: ['business'], abbr: 'AR', name: 'Average Revenue', idn: 'Penerimaan Rata-rata',
    use: 'Menghitung penerimaan rata-rata per unit yang terjual.',
    formula: 'AR = TR / Q',
    notes: 'Dalam pasar satu harga, AR sama dengan harga per unit.',
    related: ['Business & Operations'], tags: 'penerimaan rata rata',
    inputs: [I.m('tr', 'Total penerimaan (TR)', 30000000, { min: 0 }), I.n('q', 'Jumlah terjual (Q)', 1200, { gt: 0 })],
    calc: function (v) { var a = v.tr / v.q; return { head: { label: 'Penerimaan rata-rata (AR)', value: a, kind: 'money' }, rows: [], steps: ['AR = ' + f.m(v.tr) + ' / ' + f.n(v.q) + ' = ' + f.m(a)] }; }
  });

  H.def({
    id: 'mr', cat: C, also: ['business'], abbr: 'MR', name: 'Marginal Revenue', idn: 'Penerimaan Marjinal',
    use: 'Mengukur tambahan penerimaan akibat perubahan jumlah output yang dijual.',
    formula: 'MR = dTR / dQ',
    notes: 'Untuk perubahan sangat kecil dapat didefinisikan sebagai turunan dTR/dQ.',
    related: ['Business & Operations'], tags: 'penerimaan marjinal',
    inputs: [I.m('tr1', 'TR awal', 30000000, { min: 0 }), I.m('tr2', 'TR baru', 32400000, { min: 0 }), I.n('q1', 'Q awal', 1200, { min: 0 }), I.n('q2', 'Q baru', 1300, { min: 0 })],
    calc: function (v) {
      var dq = v.q2 - v.q1; E.need(dq !== 0, 'Jumlah tidak berubah, MR tidak terdefinisi.');
      var m = (v.tr2 - v.tr1) / dq;
      return { head: { label: 'Penerimaan marjinal (MR)', value: m, kind: 'money' }, rows: [o.m('dTR', v.tr2 - v.tr1), o.n('dQ', dq)], steps: ['MR = (' + f.m(v.tr2) + ' - ' + f.m(v.tr1) + ') / (' + f.n(v.q2) + ' - ' + f.n(v.q1) + ') = ' + f.m(m)] };
    }
  });

  H.def({
    id: 'atc', cat: C, also: ['business'], abbr: 'ATC', name: 'Average Total Cost', idn: 'Biaya Total Rata-rata',
    use: 'Menghitung biaya total per unit output.',
    formula: 'ATC = TC / Q = AFC + AVC',
    notes: 'Q harus lebih besar dari nol.',
    related: ['Business & Operations'], tags: 'biaya total rata rata',
    inputs: [I.m('tfc', 'Total biaya tetap (TFC)', 8000000, { min: 0 }), I.m('tvc', 'Total biaya variabel (TVC)', 14400000, { min: 0 }), I.n('q', 'Output (Q)', 1200, { gt: 0 })],
    calc: function (v) {
      var tc = v.tfc + v.tvc, atc = tc / v.q;
      return { head: { label: 'ATC', value: atc, kind: 'money' }, rows: [o.m('Total biaya (TC)', tc), o.m('AFC', v.tfc / v.q), o.m('AVC', v.tvc / v.q)], steps: ['TC = ' + f.m(v.tfc) + ' + ' + f.m(v.tvc) + ' = ' + f.m(tc), 'ATC = ' + f.m(tc) + ' / ' + f.n(v.q) + ' = ' + f.m(atc)],
        chart: { type: 'donut', title: 'Komposisi ATC', fmt: 'money', parts: [{ label: 'AFC', value: v.tfc / v.q }, { label: 'AVC', value: v.tvc / v.q }] } };
    }
  });

  H.def({
    id: 'afc', cat: C, also: ['business'], abbr: 'AFC', name: 'Average Fixed Cost', idn: 'Biaya Tetap Rata-rata',
    use: 'Menghitung biaya tetap per unit output.',
    formula: 'AFC = TFC / Q',
    notes: 'AFC menurun saat output meningkat, dengan asumsi total fixed cost tetap.',
    related: ['Business & Operations'], tags: 'biaya tetap rata rata',
    inputs: [I.m('tfc', 'Total biaya tetap (TFC)', 8000000, { min: 0 }), I.n('q', 'Output (Q)', 1200, { gt: 0 })],
    calc: function (v) {
      var a = v.tfc / v.q, qs = [], k;
      for (k = 1; k <= 12; k++) qs.push(Math.round(v.q * k / 6));
      return { head: { label: 'AFC', value: a, kind: 'money' }, rows: [], steps: ['AFC = ' + f.m(v.tfc) + ' / ' + f.n(v.q) + ' = ' + f.m(a)],
        chart: { type: 'line', title: 'AFC menurun saat output naik', fmt: 'money', xLabel: 'Output (Q)', x: qs, series: [{ name: 'AFC', values: qs.map(function (q) { return v.tfc / q; }) }] } };
    }
  });

  H.def({
    id: 'avc', cat: C, also: ['business'], abbr: 'AVC', name: 'Average Variable Cost', idn: 'Biaya Variabel Rata-rata',
    use: 'Menghitung biaya variabel per unit output.',
    formula: 'AVC = TVC / Q',
    notes: 'Gunakan periode dan unit output yang sama dengan TC.',
    related: ['Business & Operations'], tags: 'biaya variabel rata rata',
    inputs: [I.m('tvc', 'Total biaya variabel (TVC)', 14400000, { min: 0 }), I.n('q', 'Output (Q)', 1200, { gt: 0 })],
    calc: function (v) { var a = v.tvc / v.q; return { head: { label: 'AVC', value: a, kind: 'money' }, rows: [], steps: ['AVC = ' + f.m(v.tvc) + ' / ' + f.n(v.q) + ' = ' + f.m(a)] }; }
  });

  H.def({
    id: 'mc', cat: C, also: ['business'], abbr: 'MC', name: 'Marginal Cost', idn: 'Biaya Marjinal',
    use: 'Mengukur tambahan biaya akibat tambahan output.',
    formula: 'MC = dTC / dQ',
    notes: 'Karena fixed cost tidak berubah terhadap output dalam jangka pendek, dTC sama dengan dTVC untuk rentang tersebut.',
    related: ['Business & Operations'], tags: 'biaya marjinal',
    inputs: [I.m('tc1', 'TC awal', 22400000, { min: 0 }), I.m('tc2', 'TC baru', 23600000, { min: 0 }), I.n('q1', 'Q awal', 1200, { min: 0 }), I.n('q2', 'Q baru', 1300, { min: 0 })],
    calc: function (v) {
      var dq = v.q2 - v.q1; E.need(dq !== 0, 'Output tidak berubah, MC tidak terdefinisi.');
      var m = (v.tc2 - v.tc1) / dq;
      return { head: { label: 'Biaya marjinal (MC)', value: m, kind: 'money' }, rows: [o.m('dTC', v.tc2 - v.tc1), o.n('dQ', dq)], steps: ['MC = (' + f.m(v.tc2) + ' - ' + f.m(v.tc1) + ') / (' + f.n(v.q2) + ' - ' + f.n(v.q1) + ') = ' + f.m(m)] };
    }
  });

  H.def({
    id: 'cs', cat: C, also: ['macro'], abbr: 'CS', name: 'Consumer Surplus', idn: 'Surplus Konsumen',
    use: 'Menghitung selisih antara kesediaan membayar konsumen dan harga pasar dalam model linear sederhana.',
    formula: 'CS = 1/2 x Q* x (Maximum Willingness-to-Pay - P*)',
    notes: 'Rumus segitiga ini berlaku pada kurva permintaan linear dengan intersep harga yang diketahui.',
    related: ['Macroeconomics'], tags: 'surplus konsumen willingness to pay',
    inputs: [I.n('q', 'Kuantitas keseimbangan (Q*)', 580, { min: 0 }), I.m('wtp', 'Kesediaan membayar maksimum (intersep harga)', 500, { min: 0 }), I.m('p', 'Harga pasar (P*)', 210, { min: 0 })],
    calc: function (v) {
      E.need(v.wtp >= v.p, 'Kesediaan membayar maksimum harus lebih besar dari atau sama dengan harga pasar.');
      var cs = 0.5 * v.q * (v.wtp - v.p);
      return { head: { label: 'Surplus konsumen', value: cs, kind: 'money' }, rows: [o.m('Pengeluaran konsumen (P* x Q*)', v.p * v.q)], steps: ['CS = 1/2 x ' + f.n(v.q) + ' x (' + f.m(v.wtp) + ' - ' + f.m(v.p) + ') = ' + f.m(cs)],
        chart: { type: 'bar', title: 'Surplus dan pengeluaran konsumen', fmt: 'money', bars: [{ label: 'Surplus', value: cs }, { label: 'Pengeluaran', value: v.p * v.q }] } };
    }
  });

  H.def({
    id: 'ps-surplus', cat: C, also: ['macro'], abbr: 'PS', name: 'Producer Surplus', idn: 'Surplus Produsen',
    use: 'Menghitung selisih antara harga pasar dan harga minimum yang bersedia diterima produsen dalam model linear.',
    formula: 'PS = 1/2 x Q* x (P* - Minimum Supply Price)',
    notes: 'Rumus segitiga berlaku pada kurva penawaran linear.',
    related: ['Macroeconomics'], tags: 'surplus produsen',
    inputs: [I.n('q', 'Kuantitas keseimbangan (Q*)', 580, { min: 0 }), I.m('p', 'Harga pasar (P*)', 210, { min: 0 }), I.m('pmin', 'Harga penawaran minimum (intersep harga)', 0, { min: 0, hint: 'Harga ketika Q_s = 0, yaitu -c/d pada Q_s = c + dP.' })],
    calc: function (v) {
      E.need(v.p >= v.pmin, 'Harga pasar harus lebih besar dari atau sama dengan harga penawaran minimum.');
      var ps = 0.5 * v.q * (v.p - v.pmin);
      return { head: { label: 'Surplus produsen', value: ps, kind: 'money' }, rows: [o.m('Penerimaan produsen (P* x Q*)', v.p * v.q)], steps: ['PS = 1/2 x ' + f.n(v.q) + ' x (' + f.m(v.p) + ' - ' + f.m(v.pmin) + ') = ' + f.m(ps)] };
    }
  });

  H.def({
    id: 'tax-revenue', cat: C, also: ['macro'], abbr: 'TAXREV', name: 'Tax Revenue', idn: 'Penerimaan Pajak',
    use: 'Menghitung penerimaan pemerintah dari pajak per unit.',
    formula: 'Tax Revenue = Tax per Unit x Quantity Sold After Tax',
    notes: 'Untuk pajak ad valorem, basis perhitungannya adalah tarif pajak dikalikan nilai transaksi kena pajak.',
    related: ['Macroeconomics'], tags: 'penerimaan pajak',
    inputs: [I.s('mode', 'Jenis pajak', [['unit', 'Pajak per unit'], ['adv', 'Pajak ad valorem (persen)']], 'unit'),
      I.m('t', 'Pajak per unit', 20, { min: 0, showIf: function (r) { return r.mode !== 'adv'; } }), I.m('qa', 'Kuantitas terjual setelah pajak', 520, { min: 0, showIf: function (r) { return r.mode !== 'adv'; } }),
      I.p('rate', 'Tarif pajak', 11, { unit: '%', min: 0, showIf: function (r) { return r.mode === 'adv'; } }), I.m('val', 'Nilai transaksi kena pajak', 100000000, { min: 0, showIf: function (r) { return r.mode === 'adv'; } })],
    calc: function (v) {
      if (v.mode === 'adv') { var t2 = v.rate * v.val; return { head: { label: 'Penerimaan pajak', value: t2, kind: 'money' }, rows: [], steps: ['Tax Revenue = ' + f.p(v.rate) + ' x ' + f.m(v.val) + ' = ' + f.m(t2)] }; }
      var t = v.t * v.qa;
      return { head: { label: 'Penerimaan pajak', value: t, kind: 'money' }, rows: [], steps: ['Tax Revenue = ' + f.m(v.t) + ' x ' + f.n(v.qa) + ' = ' + f.m(t)], note: 'Gunakan kuantitas setelah pajak, bukan sebelum pajak.' };
    }
  });

  H.def({
    id: 'tax-incidence', cat: C, also: ['macro'], abbr: 'INC', name: 'Tax Incidence', idn: 'Pembagian Beban Pajak',
    use: 'Mengestimasi pembagian beban pajak antara konsumen dan produsen berdasarkan elastisitas.',
    formula: 'Consumer Share = PES / (PES + |PED|)\nProducer Share = |PED| / (PES + |PED|)',
    notes: 'PES dan |PED| memakai besaran elastisitas positif. Hasil merupakan model dasar, bukan pengganti data pasar.',
    related: ['Macroeconomics'], tags: 'insiden pajak beban konsumen produsen',
    inputs: [I.n('pes', 'Elastisitas penawaran (PES)', 1.5, { gt: 0 }), I.n('ped', 'Elastisitas permintaan (|PED|)', 0.5, { gt: 0 }), I.m('tax', 'Pajak per unit (opsional)', '', { optional: true, min: 0 })],
    calc: function (v) {
      var den = v.pes + v.ped, cs = v.pes / den, ps = v.ped / den;
      var rows = [o.p('Porsi dibayar produsen', ps)], steps = ['Consumer share = ' + f.n(v.pes) + ' / (' + f.n(v.pes) + ' + ' + f.n(v.ped) + ') = ' + f.p(cs), 'Producer share = ' + f.n(v.ped) + ' / ' + f.n(den) + ' = ' + f.p(ps)];
      if (v.tax !== undefined) { rows.push(o.m('Beban konsumen per unit', v.tax * cs), o.m('Beban produsen per unit', v.tax * ps)); }
      return { head: { label: 'Porsi beban konsumen', value: cs, kind: 'pct' }, rows: rows, steps: steps, note: 'Pihak yang kurang elastis menanggung porsi pajak lebih besar.',
        chart: { type: 'donut', title: 'Pembagian beban pajak', fmt: 'pct0', parts: [{ label: 'Konsumen', value: cs }, { label: 'Produsen', value: ps }] } };
    }
  });

  H.def({
    id: 'dwl', cat: C, also: ['macro'], abbr: 'DWL', name: 'Deadweight Loss', idn: 'Kerugian Bobot Mati',
    use: 'Menghitung surplus total yang hilang akibat distorsi pasar seperti pajak dalam model linear sederhana.',
    formula: 'DWL = 1/2 x Tax Wedge x |Q_before - Q_after|',
    notes: 'Tax wedge adalah selisih harga yang dibayar pembeli dan diterima penjual akibat pajak.',
    related: ['Macroeconomics'], tags: 'deadweight loss kerugian bobot mati pajak',
    inputs: [I.m('w', 'Tax wedge (selisih harga pembeli dan penjual)', 20, { min: 0 }), I.n('q1', 'Kuantitas sebelum pajak', 580, { min: 0 }), I.n('q2', 'Kuantitas setelah pajak', 520, { min: 0 })],
    calc: function (v) {
      var d = 0.5 * v.w * Math.abs(v.q1 - v.q2);
      return { head: { label: 'Deadweight loss', value: d, kind: 'money' }, rows: [o.n('Penurunan kuantitas', Math.abs(v.q1 - v.q2))], steps: ['DWL = 1/2 x ' + f.m(v.w) + ' x |' + f.n(v.q1) + ' - ' + f.n(v.q2) + '| = ' + f.m(d)] };
    }
  });

  H.def({
    id: 'opp-cost', cat: C, also: ['personal', 'macro'], abbr: 'OC', name: 'Opportunity Cost', idn: 'Biaya Peluang',
    use: 'Mengukur alternatif terbaik yang dikorbankan ketika memilih suatu tindakan.',
    formula: 'Opportunity Cost of X = Units of Y Sacrificed / Units of X Gained',
    notes: 'Bentuk rasio ini dapat digunakan untuk menghitung biaya peluang per unit X dalam model produksi dua barang.',
    related: ['Personal Finance', 'Macroeconomics'], tags: 'biaya peluang opportunity cost',
    inputs: [I.n('y', 'Unit Y yang dikorbankan', 20, { min: 0 }), I.n('x', 'Unit X yang diperoleh', 50, { gt: 0 })],
    calc: function (v) {
      var oc = v.y / v.x;
      return { head: { label: 'Biaya peluang 1 unit X', value: oc, kind: 'unit', unit: 'unit Y' }, rows: [o.n('Biaya peluang 1 unit Y (unit X)', v.y ? v.x / v.y : NaN)], steps: ['OC(X) = ' + f.n(v.y) + ' / ' + f.n(v.x) + ' = ' + f.n(oc) + ' unit Y'] };
    }
  });

  H.def({
    id: 'comp-adv', cat: C, also: ['macro'], abbr: 'CA', name: 'Comparative Advantage', idn: 'Keunggulan Komparatif',
    use: 'Menentukan pihak yang memiliki biaya peluang lebih rendah dalam memproduksi suatu barang.',
    formula: 'Compare Opportunity Cost: the producer with the lower opportunity cost has comparative advantage.',
    notes: 'Hitung biaya peluang setiap pihak dengan satuan yang sebanding. Keunggulan komparatif berbeda dari keunggulan absolut.',
    related: ['Macroeconomics'], tags: 'keunggulan komparatif perdagangan',
    inputs: [I.n('ax', 'Output X maksimum pihak A', 60, { gt: 0 }), I.n('ay', 'Output Y maksimum pihak A', 30, { gt: 0 }), I.n('bx', 'Output X maksimum pihak B', 40, { gt: 0 }), I.n('by', 'Output Y maksimum pihak B', 40, { gt: 0 })],
    calc: function (v) {
      var ocAx = v.ay / v.ax, ocBx = v.by / v.bx, ocAy = v.ax / v.ay, ocBy = v.bx / v.by;
      var xWho = ocAx < ocBx ? 'Pihak A' : (ocAx > ocBx ? 'Pihak B' : 'Setara');
      var yWho = ocAy < ocBy ? 'Pihak A' : (ocAy > ocBy ? 'Pihak B' : 'Setara');
      return { head: { label: 'Unggul komparatif di barang X', value: xWho, kind: 'text' }, rows: [o.t('Unggul komparatif di barang Y', yWho), o.n('Biaya peluang X, pihak A (unit Y)', ocAx), o.n('Biaya peluang X, pihak B (unit Y)', ocBx), o.n('Biaya peluang Y, pihak A (unit X)', ocAy), o.n('Biaya peluang Y, pihak B (unit X)', ocBy)],
        steps: ['OC(X) A = ' + f.n(v.ay) + ' / ' + f.n(v.ax) + ' = ' + f.n(ocAx) + ', B = ' + f.n(v.by) + ' / ' + f.n(v.bx) + ' = ' + f.n(ocBx), 'Pihak dengan biaya peluang lebih rendah unggul secara komparatif.'],
        note: 'Keunggulan komparatif berbeda dari keunggulan absolut: pihak yang unggul absolut di keduanya tetap hanya unggul komparatif di salah satu.' };
    }
  });
})();
