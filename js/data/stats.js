/* Kategori 12: Financial Statistics (Variance, SD, Covariance, Correlation didefinisikan di investment.js dan ditampilkan juga di sini) */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'stats';
  var LH = 'Pisahkan dengan spasi, titik koma, atau baris baru.';

  H.def({
    id: 'mean', cat: C, also: ['investment'], abbr: 'MEAN', name: 'Arithmetic Mean', idn: 'Rata-rata Aritmetika',
    use: 'Menghitung rata-rata sederhana dari sekumpulan nilai.',
    formula: 'Mean = SUM x_i / n',
    notes: 'Setiap observasi memiliki bobot yang sama.',
    related: ['Investment & Portfolio Management'], tags: 'rata rata mean',
    inputs: [I.l('x', 'Data', '12 15 9 21 18 14 16', { hint: LH, minLen: 1, dec: true })],
    calc: function (v) {
      var m = E.mean(v.x), s = E.sum(v.x), sorted = v.x.slice().sort(function (a, b) { return a - b; }), n = sorted.length;
      var med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      return { head: { label: 'Rata-rata', value: m, kind: 'num' }, rows: [o.n('Jumlah (SUM x)', s), o.n('Banyak data (n)', n), o.n('Median', med), o.n('Minimum', sorted[0]), o.n('Maksimum', sorted[n - 1])],
        steps: ['SUM x = ' + f.n(s), 'Mean = ' + f.n(s) + ' / ' + n + ' = ' + f.n(m)],
        chart: { type: 'bar', title: 'Data dan rata-rata', fmt: 'num', bars: v.x.slice(0, 24).map(function (x, i) { return { label: String(i + 1), value: x }; }), refLine: m } };
    }
  });

  H.def({
    id: 'weighted-avg', cat: C, also: ['accounting', 'investment'], abbr: 'WA', name: 'Weighted Average', idn: 'Rata-rata Tertimbang',
    use: 'Menghitung rata-rata ketika setiap nilai memiliki bobot berbeda.',
    formula: 'Weighted Average = SUM(w_i x x_i) / SUM w_i',
    notes: 'Jika bobot berupa proporsi dan jumlahnya 1, rumus menjadi SUM(w_i x x_i).',
    related: ['Accounting', 'Portfolio Management'], tags: 'rata rata tertimbang bobot',
    inputs: [I.pr('wx', 'Tiap baris: bobot dan nilai', '40 85\n35 72\n25 90', { hint: 'Contoh "40 85" artinya bobot 40 dengan nilai 85. Bobot bebas, tidak harus 100.', minLen: 1 })],
    calc: function (v) {
      var sw = E.sum(v.wx.map(function (p) { return p[0]; })), swx = E.sum(v.wx.map(function (p) { return p[0] * p[1]; }));
      E.need(sw !== 0, 'Jumlah bobot bernilai nol.');
      var w = swx / sw;
      return { head: { label: 'Rata-rata tertimbang', value: w, kind: 'num' }, rows: [o.n('SUM w', sw), o.n('SUM (w x nilai)', swx), o.n('Rata-rata biasa (pembanding)', E.mean(v.wx.map(function (p) { return p[1]; })))],
        steps: ['SUM (w x nilai) = ' + f.n(swx), 'SUM w = ' + f.n(sw), 'WA = ' + f.n(swx) + ' / ' + f.n(sw) + ' = ' + f.n(w)] };
    }
  });

  H.def({
    id: 'pct-change', cat: C, also: ['macro', 'personal'], abbr: 'PC', name: 'Percentage Change', idn: 'Persentase Perubahan',
    use: 'Menghitung perubahan relatif dari nilai lama ke nilai baru.',
    formula: 'Percentage Change = [(New Value - Old Value) / Old Value] x 100%',
    notes: 'Tidak terdefinisi jika old value = 0. Perubahan persentase juga dapat sulit diinterpretasikan jika nilai awal negatif.',
    related: ['Macroeconomics', 'Personal Finance'], tags: 'persentase perubahan naik turun',
    inputs: [I.n('old', 'Nilai lama', 1250000), I.n('new', 'Nilai baru', 1400000)],
    calc: function (v) {
      E.need(v.old !== 0, 'Nilai lama bernilai nol, persentase perubahan tidak terdefinisi.');
      var c = (v.new - v.old) / v.old;
      return { head: { label: 'Perubahan', value: c, kind: 'pct' }, rows: [o.n('Selisih absolut', v.new - v.old)], steps: ['Perubahan = (' + f.n(v.new) + ' - ' + f.n(v.old) + ') / ' + f.n(v.old) + ' = ' + f.p(c)],
        note: v.old < 0 ? 'Nilai lama negatif, persentase sulit ditafsirkan. Bandingkan selisih absolutnya.' : (c < 0 ? 'Negatif berarti penurunan.' : undefined) };
    }
  });

  H.def({
    id: 'zscore', cat: C, also: ['investment'], abbr: 'Z', name: 'Z-Score', idn: 'Skor Baku',
    use: 'Mengukur jarak suatu nilai dari rata-rata dalam satuan simpangan baku.',
    formula: 'Z = (X - mu) / sigma',
    notes: 'Gunakan sample mean dan sample SD bila data diperlakukan sebagai sampel. sigma harus lebih besar dari nol.',
    related: ['Investment & Portfolio Management'], tags: 'z score skor baku',
    inputs: [I.s('mode', 'Cara input', [['ms', 'Rata-rata dan simpangan baku diketahui'], ['data', 'Hitung dari daftar data']], 'ms'),
      I.n('x', 'Nilai yang dievaluasi (X)', 82),
      I.n('mu', 'Rata-rata (mu)', 70, { showIf: function (r) { return r.mode !== 'data'; } }), I.n('sd', 'Simpangan baku (sigma)', 8, { gt: 0, showIf: function (r) { return r.mode !== 'data'; } }),
      I.l('d', 'Data', '62 70 74 68 81 77 66', { hint: LH, minLen: 2, dec: true, showIf: function (r) { return r.mode === 'data'; } }), I.s('t', 'Jenis data', [['s', 'Sampel (n - 1)'], ['p', 'Populasi (N)']], 's', { showIf: function (r) { return r.mode === 'data'; } })],
    calc: function (v) {
      var mu = v.mu, sd = v.sd;
      if (v.mode === 'data') { mu = E.mean(v.d); sd = E.sd(v.d, v.t === 's'); }
      E.need(sd > 0, 'Simpangan baku harus lebih besar dari nol.');
      var z = (v.x - mu) / sd, a = Math.abs(z);
      return { head: { label: 'Z-score', value: z, kind: 'num' }, rows: [o.n('Rata-rata', mu), o.n('Simpangan baku', sd), o.t('Posisi', a < 1 ? 'Dalam 1 simpangan baku dari rata-rata' : (a < 2 ? 'Antara 1 dan 2 simpangan baku' : 'Lebih dari 2 simpangan baku (tidak lazim)'))],
        steps: ['Z = (' + f.n(v.x) + ' - ' + f.n(mu) + ') / ' + f.n(sd) + ' = ' + f.n(z)], note: z > 0 ? 'Di atas rata-rata.' : (z < 0 ? 'Di bawah rata-rata.' : 'Tepat di rata-rata.') };
    }
  });

  H.def({
    id: 'expected-value', cat: C, also: ['investment'], abbr: 'E(X)', name: 'Expected Value', idn: 'Nilai Harapan',
    use: 'Menghitung rata-rata tertimbang hasil berdasarkan probabilitas setiap kemungkinan.',
    formula: 'E(X) = SUM x_i x P(x_i)',
    notes: 'Jumlah probabilitas hasil yang saling eksklusif dan mencakup seluruh kemungkinan harus sama dengan 1.',
    related: ['Investment & Portfolio Management'], tags: 'nilai harapan expected value probabilitas',
    inputs: [I.pr('o', 'Tiap baris: hasil (x) dan probabilitas (%)', '-5000000 20\n2000000 50\n12000000 30', { hint: 'Contoh "2000000 50" artinya hasil Rp 2.000.000 dengan probabilitas 50%.', minLen: 1 })],
    calc: function (v) {
      var sp = E.sum(v.o.map(function (r) { return r[1]; }));
      E.need(Math.abs(sp - 100) < 1e-6, 'Jumlah probabilitas harus 100%. Sekarang ' + f.n(sp) + '%.');
      var ev = E.sum(v.o.map(function (r) { return r[0] * r[1] / 100; })), vr = E.sum(v.o.map(function (r) { return r[1] / 100 * Math.pow(r[0] - ev, 2); }));
      return { head: { label: 'E(X)', value: ev, kind: 'num' }, rows: [o.n('Simpangan baku', Math.sqrt(vr)), o.n('Jumlah kemungkinan', v.o.length)],
        steps: v.o.slice(0, 8).map(function (r, i) { return 'Hasil ' + (i + 1) + ' = ' + f.n(r[0]) + ' x ' + f.p(r[1] / 100) + ' = ' + f.n(r[0] * r[1] / 100); }).concat(['E(X) = ' + f.n(ev)]),
        chart: { type: 'bar', title: 'Kontribusi tiap hasil ke nilai harapan', fmt: 'num', bars: v.o.map(function (r, i) { return { label: 'H' + (i + 1), value: r[0] * r[1] / 100 }; }) } };
    }
  });

  H.def({
    id: 'probability', cat: C, also: ['investment'], abbr: 'P(A)', name: 'Probability', idn: 'Probabilitas',
    use: 'Mengukur peluang suatu kejadian terjadi.',
    formula: 'Equally likely outcomes: P(A) = Favorable Outcomes / Total Outcomes\nComplement: P(A^c) = 1 - P(A)\nAddition: P(A or B) = P(A) + P(B) - P(A and B)\nIndependent events: P(A and B) = P(A) x P(B)',
    notes: 'Rumus favorable/total hanya berlaku jika seluruh hasil sama mungkin. Rumus perkalian terakhir mensyaratkan kejadian independen.',
    related: ['Investment & Portfolio Management'], tags: 'probabilitas peluang kejadian',
    inputs: [I.s('mode', 'Jenis perhitungan', [['eq', 'Hasil sama mungkin (favorable / total)'], ['comp', 'Komplemen: P(bukan A)'], ['add', 'Gabungan: P(A atau B)'], ['ind', 'Irisan dua kejadian independen: P(A dan B)']], 'eq'),
      I.n('fav', 'Hasil yang diinginkan', 4, { min: 0, showIf: function (r) { return r.mode === 'eq' || !r.mode; } }), I.n('tot', 'Total hasil yang mungkin', 52, { gt: 0, showIf: function (r) { return r.mode === 'eq' || !r.mode; } }),
      I.p('pa', 'P(A)', 30, { unit: '%', min: 0, max: 100, showIf: function (r) { return r.mode && r.mode !== 'eq'; } }),
      I.p('pb', 'P(B)', 40, { unit: '%', min: 0, max: 100, showIf: function (r) { return r.mode === 'add' || r.mode === 'ind'; } }),
      I.p('pab', 'P(A dan B)', 12, { unit: '%', min: 0, max: 100, showIf: function (r) { return r.mode === 'add'; } })],
    calc: function (v) {
      if (v.mode === 'comp') { var c = 1 - v.pa; return { head: { label: 'P(bukan A)', value: c, kind: 'pct' }, rows: [o.p('P(A)', v.pa)], steps: ['P(A^c) = 1 - ' + f.p(v.pa) + ' = ' + f.p(c)], chart: { type: 'donut', title: 'A dan bukan A', fmt: 'pct0', parts: [{ label: 'A', value: v.pa }, { label: 'Bukan A', value: c }] } }; }
      if (v.mode === 'add') {
        E.need(v.pab <= Math.min(v.pa, v.pb) + 1e-9, 'P(A dan B) tidak boleh melebihi P(A) atau P(B).');
        var u = v.pa + v.pb - v.pab; E.need(u <= 1 + 1e-9, 'Hasilnya melebihi 100%, periksa nilai P(A), P(B), dan P(A dan B).');
        return { head: { label: 'P(A atau B)', value: u, kind: 'pct' }, rows: [], steps: ['P(A or B) = ' + f.p(v.pa) + ' + ' + f.p(v.pb) + ' - ' + f.p(v.pab) + ' = ' + f.p(u)] };
      }
      if (v.mode === 'ind') { var i2 = v.pa * v.pb; return { head: { label: 'P(A dan B)', value: i2, kind: 'pct' }, rows: [], steps: ['P(A and B) = ' + f.p(v.pa) + ' x ' + f.p(v.pb) + ' = ' + f.p(i2, 3)], note: 'Berlaku hanya jika kedua kejadian independen.' }; }
      E.need(v.fav <= v.tot, 'Hasil yang diinginkan tidak boleh melebihi total hasil.');
      var p = v.fav / v.tot;
      return { head: { label: 'P(A)', value: p, kind: 'pct' }, rows: [o.n('Pecahan', p)], steps: ['P(A) = ' + f.n(v.fav) + ' / ' + f.n(v.tot) + ' = ' + f.p(p, 3)], note: 'Hanya berlaku bila seluruh hasil sama mungkin.' };
    }
  });
})();
