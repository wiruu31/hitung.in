/* Kategori 11: Macroeconomics */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'macro';
  var DEL = String.fromCharCode(916);

  H.def({
    id: 'gdp', cat: C, also: ['micro', 'stats'], abbr: 'GDP', name: 'Gross Domestic Product', idn: 'Produk Domestik Bruto',
    use: 'Menghitung nilai barang dan jasa akhir yang diproduksi di dalam wilayah ekonomi selama periode tertentu.',
    formula: 'GDP = C + I + G + (X - M)',
    notes: 'C = konsumsi; I = investasi; G = belanja pemerintah; X = ekspor; M = impor. Hindari penghitungan ganda barang antara.',
    related: ['Microeconomics', 'Financial Statistics'], tags: 'pdb produk domestik bruto pengeluaran',
    inputs: [I.m('c', 'Konsumsi (C)', 12000000000000), I.m('i', 'Investasi (I)', 5000000000000), I.m('g', 'Belanja pemerintah (G)', 2500000000000), I.m('x', 'Ekspor (X)', 3000000000000), I.m('m', 'Impor (M)', 2700000000000)],
    calc: function (v) {
      var nx = v.x - v.m, gdp = v.c + v.i + v.g + nx;
      return { head: { label: 'GDP', value: gdp, kind: 'money' }, rows: [o.m('Ekspor neto (X - M)', nx), o.p('Porsi konsumsi', gdp ? v.c / gdp : 0)],
        steps: ['Ekspor neto = ' + f.m(v.x) + ' - ' + f.m(v.m) + ' = ' + f.m(nx), 'GDP = ' + f.m(v.c) + ' + ' + f.m(v.i) + ' + ' + f.m(v.g) + ' + ' + f.m(nx) + ' = ' + f.m(gdp)],
        chart: { type: 'donut', title: 'Komponen pengeluaran', fmt: 'money', parts: [{ label: 'Konsumsi', value: Math.max(v.c, 0) }, { label: 'Investasi', value: Math.max(v.i, 0) }, { label: 'Belanja pemerintah', value: Math.max(v.g, 0) }, { label: 'Ekspor neto', value: Math.max(nx, 0) }] },
        note: nx < 0 ? 'Ekspor neto negatif (defisit perdagangan) mengurangi GDP.' : undefined };
    }
  });

  H.def({
    id: 'nominal-gdp', cat: C, also: ['stats'], abbr: 'NGDP', name: 'Nominal Gross Domestic Product', idn: 'PDB Nominal',
    use: 'Menghitung output menggunakan harga yang berlaku pada periode tersebut.',
    formula: 'Nominal GDP = SUM(P_t x Q_t)',
    notes: 'Perubahan nominal GDP dapat berasal dari perubahan kuantitas maupun harga.',
    related: ['Financial Statistics'], tags: 'pdb nominal harga berlaku',
    inputs: [I.pr('pq', 'Tiap baris: harga dan kuantitas satu produk final', '5000 1200000\n12000 800000\n250000 40000', { hint: 'Contoh "5000 1200000" artinya harga Rp 5.000 dan 1.200.000 unit.', minLen: 1 })],
    calc: function (v) {
      var parts = v.pq.map(function (r) { return r[0] * r[1]; }), g = E.sum(parts);
      return { head: { label: 'PDB nominal', value: g, kind: 'money' }, rows: [o.n('Jumlah produk', v.pq.length)], steps: v.pq.slice(0, 8).map(function (r, i) { return 'Produk ' + (i + 1) + ' = ' + f.m(r[0]) + ' x ' + f.n(r[1]) + ' = ' + f.m(parts[i]); }).concat(['Nominal GDP = ' + f.m(g)]),
        chart: { type: 'donut', title: 'Kontribusi tiap produk', fmt: 'money', parts: parts.map(function (p, i) { return { label: 'Produk ' + (i + 1), value: Math.max(p, 0) }; }) } };
    }
  });

  H.def({
    id: 'real-gdp', cat: C, also: ['stats'], abbr: 'RGDP', name: 'Real Gross Domestic Product', idn: 'PDB Riil',
    use: 'Mengukur output menggunakan harga tahun dasar atau harga konstan.',
    formula: 'Real GDP = (Nominal GDP / GDP Deflator) x 100',
    notes: 'Jika deflator dinyatakan sebagai indeks dengan tahun dasar 100. Metode chained volume measures dapat berbeda.',
    related: ['Financial Statistics'], tags: 'pdb riil harga konstan deflator',
    inputs: [I.m('n', 'PDB nominal', 22000000000000), I.n('d', 'Deflator PDB (tahun dasar = 100)', 118, { gt: 0 })],
    calc: function (v) {
      var r = v.n / v.d * 100;
      return { head: { label: 'PDB riil', value: r, kind: 'money' }, rows: [o.p('Selisih nominal terhadap riil', v.n / r - 1)], steps: ['Real GDP = (' + f.m(v.n) + ' / ' + f.n(v.d) + ') x 100 = ' + f.m(r)] };
    }
  });

  H.def({
    id: 'gni', cat: C, also: ['stats'], abbr: 'GNI', name: 'Gross National Income', idn: 'Pendapatan Nasional Bruto',
    use: 'Mengukur pendapatan yang diterima penduduk atau residen suatu ekonomi, termasuk pendapatan primer neto dari luar negeri.',
    formula: 'GNI = GDP + Net Primary Income from Abroad',
    notes: 'GDP berbasis lokasi produksi; GNI berbasis pendapatan residen.',
    related: ['Financial Statistics'], tags: 'gni pendapatan nasional',
    inputs: [I.m('g', 'GDP', 22000000000000), I.m('np', 'Pendapatan primer neto dari luar negeri (boleh negatif)', -400000000000)],
    calc: function (v) {
      var n = v.g + v.np;
      return { head: { label: 'GNI', value: n, kind: 'money' }, rows: [o.p('GNI dibanding GDP', v.g ? n / v.g - 1 : 0)], steps: ['GNI = ' + f.m(v.g) + ' + ' + f.m(v.np) + ' = ' + f.m(n)], note: v.np < 0 ? 'Pendapatan primer neto negatif: lebih banyak pendapatan mengalir ke luar negeri daripada masuk.' : undefined };
    }
  });

  H.def({
    id: 'gdp-growth', cat: C, also: ['stats'], abbr: 'GROWTH', name: 'GDP Growth Rate', idn: 'Tingkat Pertumbuhan PDB',
    use: 'Menghitung persentase perubahan GDP riil dari periode sebelumnya.',
    formula: 'GDP Growth = [(Real GDP_t - Real GDP_(t-1)) / Real GDP_(t-1)] x 100%',
    notes: 'Untuk mengukur pertumbuhan volume ekonomi, gunakan real GDP, bukan nominal GDP.',
    related: ['Financial Statistics'], tags: 'pertumbuhan ekonomi pdb',
    inputs: [I.m('g0', 'PDB riil periode sebelumnya', 18600000000000, { gt: 0 }), I.m('g1', 'PDB riil periode ini', 19540000000000)],
    calc: function (v) {
      var g = (v.g1 - v.g0) / v.g0;
      return { head: { label: 'Pertumbuhan PDB riil', value: g, kind: 'pct' }, rows: [o.m('Perubahan PDB riil', v.g1 - v.g0)], steps: ['Growth = (' + f.m(v.g1) + ' - ' + f.m(v.g0) + ') / ' + f.m(v.g0) + ' = ' + f.p(g)],
        note: 'Pastikan kedua angka adalah PDB riil, bukan nominal.' };
    }
  });

  H.def({
    id: 'gdp-deflator', cat: C, also: ['stats'], abbr: 'DEFL', name: 'GDP Deflator', idn: 'Deflator PDB',
    use: 'Mengukur tingkat harga output domestik relatif terhadap tahun dasar.',
    formula: 'GDP Deflator = (Nominal GDP / Real GDP) x 100',
    notes: 'Cakupannya adalah output domestik yang masuk dalam GDP, bukan keranjang konsumsi rumah tangga.',
    related: ['Financial Statistics'], tags: 'deflator pdb harga',
    inputs: [I.m('n', 'PDB nominal', 22000000000000), I.m('r', 'PDB riil', 18644000000000, { gt: 0 })],
    calc: function (v) { var d = v.n / v.r * 100; return { head: { label: 'Deflator PDB', value: d, kind: 'num' }, rows: [o.p('Kenaikan harga kumulatif sejak tahun dasar', d / 100 - 1)], steps: ['Deflator = (' + f.m(v.n) + ' / ' + f.m(v.r) + ') x 100 = ' + f.n(d)] }; }
  });

  H.ratio({
    id: 'gdp-per-capita', cat: C, also: ['personal', 'stats'], abbr: 'GDPPC', name: 'GDP per Capita', idn: 'PDB per Kapita',
    use: 'Menghitung GDP rata-rata per penduduk.',
    formula: 'GDP per Capita = GDP / Population',
    notes: 'Bukan berarti setiap orang menerima pendapatan sebesar angka tersebut.',
    related: ['Personal Finance', 'Financial Statistics'], tags: 'pdb per kapita penduduk',
    num: { label: 'GDP', def: 22000000000000 }, den: { label: 'Jumlah penduduk', def: 278000000 }, kind: 'x', money: true,
    rows: function (r) { return []; }
  });

  H.def({
    id: 'cpi', cat: C, also: ['personal', 'stats'], abbr: 'CPI', name: 'Consumer Price Index', idn: 'Indeks Harga Konsumen',
    use: 'Mengukur perubahan harga keranjang barang dan jasa konsumsi dibandingkan tahun dasar.',
    formula: 'CPI = (Cost of Current Basket / Cost of Base-Year Basket) x 100',
    notes: 'Keranjang, bobot, dan metode indeks mengikuti lembaga statistik yang menerbitkan data.',
    related: ['Personal Finance', 'Financial Statistics'], tags: 'ihk indeks harga konsumen keranjang',
    inputs: [I.m('c', 'Biaya keranjang saat ini', 5400000, { min: 0 }), I.m('b', 'Biaya keranjang tahun dasar', 4800000, { gt: 0 })],
    calc: function (v) { var c = v.c / v.b * 100; return { head: { label: 'CPI', value: c, kind: 'num' }, rows: [o.p('Kenaikan harga sejak tahun dasar', c / 100 - 1)], steps: ['CPI = (' + f.m(v.c) + ' / ' + f.m(v.b) + ') x 100 = ' + f.n(c)] }; }
  });

  H.def({
    id: 'inflation', cat: C, also: ['personal', 'stats'], abbr: 'INFL', name: 'Inflation Rate', idn: 'Tingkat Inflasi',
    use: 'Menghitung persentase perubahan CPI dari periode sebelumnya.',
    formula: 'Inflation = [(CPI_t - CPI_(t-1)) / CPI_(t-1)] x 100%',
    notes: 'Perjelas apakah perbandingan month-on-month, year-on-year, atau year-to-date.',
    related: ['Personal Finance', 'Financial Statistics'], tags: 'inflasi ihk harga',
    inputs: [I.n('c0', 'CPI periode pembanding (t-1)', 110, { gt: 0 }), I.n('c1', 'CPI periode ini (t)', 113.5), I.s('basis', 'Jenis perbandingan', [['yoy', 'Year-on-year (YoY)'], ['mom', 'Month-on-month (MoM)'], ['ytd', 'Year-to-date (YTD)']], 'yoy')],
    calc: function (v) {
      var r = (v.c1 - v.c0) / v.c0, lab = { yoy: 'YoY', mom: 'MoM', ytd: 'YTD' }[v.basis];
      return { head: { label: 'Inflasi ' + lab, value: r, kind: 'pct' }, rows: [o.n('Perubahan CPI (poin)', v.c1 - v.c0)], steps: ['Inflasi = (' + f.n(v.c1) + ' - ' + f.n(v.c0) + ') / ' + f.n(v.c0) + ' = ' + f.p(r)],
        note: r < 0 ? 'Negatif berarti deflasi pada periode ini.' : 'Pastikan CPI pembanding sesuai jenis perbandingan yang dipilih (' + lab + ').' };
    }
  });

  H.def({
    id: 'real-interest', cat: C, also: ['personal', 'banking'], abbr: 'r', name: 'Real Interest Rate', idn: 'Suku Bunga Riil',
    use: 'Menghitung tingkat bunga setelah memperhitungkan inflasi.',
    formula: 'Exact: r = [(1+i)/(1+pi)] - 1\nApproximation: r = i - pi',
    notes: 'i = nominal interest rate; pi = inflation rate. Tingkat bunga dan inflasi harus memiliki periode yang sama.',
    related: ['Personal Finance', 'Banking & Credit'], tags: 'bunga riil inflasi fisher',
    inputs: [I.p('i', 'Suku bunga nominal (i)', 6.25, { unit: '%' }), I.p('pi', 'Inflasi (pi)', 3, { unit: '%' })],
    calc: function (v) {
      E.need(1 + v.pi > 0, 'Inflasi harus lebih besar dari -100%.');
      var r = (1 + v.i) / (1 + v.pi) - 1;
      return { head: { label: 'Suku bunga riil (eksak)', value: r, kind: 'pct' }, rows: [o.p('Pendekatan (i - pi)', v.i - v.pi)], steps: ['r = (1 + ' + f.p(v.i) + ') / (1 + ' + f.p(v.pi) + ') - 1 = ' + f.p(r, 4)] };
    }
  });

  H.def({
    id: 'labor-force', cat: C, also: ['stats'], abbr: 'LF', name: 'Labor Force', idn: 'Angkatan Kerja',
    use: 'Menghitung jumlah penduduk bekerja ditambah pengangguran yang termasuk angkatan kerja menurut definisi statistik.',
    formula: 'Labor Force = Employed + Unemployed',
    notes: 'Definisi unemployed biasanya mensyaratkan tidak bekerja, tersedia bekerja, dan mencari pekerjaan sesuai metodologi statistik.',
    related: ['Financial Statistics'], tags: 'angkatan kerja bekerja pengangguran',
    inputs: [I.n('e', 'Penduduk bekerja (Employed)', 135000000, { min: 0 }), I.n('u', 'Penganggur (Unemployed)', 7200000, { min: 0 })],
    calc: function (v) { var l = v.e + v.u; return { head: { label: 'Angkatan kerja', value: l, kind: 'unit', unit: 'orang' }, rows: [], steps: ['Labor Force = ' + f.n(v.e) + ' + ' + f.n(v.u) + ' = ' + f.n(l)] }; }
  });

  H.def({
    id: 'unemployment', cat: C, also: ['stats'], abbr: 'UR', name: 'Unemployment Rate', idn: 'Tingkat Pengangguran',
    use: 'Mengukur persentase penganggur terhadap total angkatan kerja.',
    formula: 'Unemployment Rate = (Unemployed / Labor Force) x 100%',
    notes: 'Bukan penganggur dibagi seluruh penduduk.',
    related: ['Financial Statistics'], tags: 'tingkat pengangguran',
    inputs: [I.n('u', 'Penganggur (Unemployed)', 7200000, { min: 0 }), I.n('lf', 'Angkatan kerja (Labor Force)', 142200000, { gt: 0 })],
    calc: function (v) {
      E.need(v.u <= v.lf, 'Jumlah penganggur tidak boleh melebihi angkatan kerja.');
      var r = v.u / v.lf; return { head: { label: 'Tingkat pengangguran', value: r, kind: 'pct' }, rows: [o.n('Bekerja', v.lf - v.u)], steps: ['UR = ' + f.n(v.u) + ' / ' + f.n(v.lf) + ' = ' + f.p(r)],
        chart: { type: 'donut', title: 'Komposisi angkatan kerja', fmt: 'pct0', parts: [{ label: 'Bekerja', value: 1 - r }, { label: 'Penganggur', value: r }] } };
    }
  });

  H.def({
    id: 'lfpr', cat: C, also: ['stats'], abbr: 'LFPR', name: 'Labor Force Participation Rate', idn: 'Tingkat Partisipasi Angkatan Kerja',
    use: 'Mengukur bagian penduduk usia kerja yang masuk angkatan kerja.',
    formula: 'LFPR = (Labor Force / Working-Age Population) x 100%',
    notes: 'Batas usia kerja mengikuti definisi statistik yang digunakan.',
    related: ['Financial Statistics'], tags: 'partisipasi angkatan kerja',
    inputs: [I.n('lf', 'Angkatan kerja', 142200000, { min: 0 }), I.n('wap', 'Penduduk usia kerja', 210000000, { gt: 0 })],
    calc: function (v) { E.need(v.lf <= v.wap, 'Angkatan kerja tidak boleh melebihi penduduk usia kerja.'); var r = v.lf / v.wap; return { head: { label: 'LFPR', value: r, kind: 'pct' }, rows: [o.n('Bukan angkatan kerja', v.wap - v.lf)], steps: ['LFPR = ' + f.n(v.lf) + ' / ' + f.n(v.wap) + ' = ' + f.p(r)] }; }
  });

  H.def({
    id: 'epr', cat: C, also: ['stats'], abbr: 'EPR', name: 'Employment-to-Population Ratio', idn: 'Rasio Penduduk Bekerja',
    use: 'Mengukur bagian penduduk usia kerja yang bekerja.',
    formula: 'EPR = (Employed / Working-Age Population) x 100%',
    notes: 'Gunakan kelompok usia dan periode yang sama pada pembilang dan penyebut.',
    related: ['Financial Statistics'], tags: 'rasio penduduk bekerja',
    inputs: [I.n('e', 'Penduduk bekerja', 135000000, { min: 0 }), I.n('wap', 'Penduduk usia kerja', 210000000, { gt: 0 })],
    calc: function (v) { E.need(v.e <= v.wap, 'Penduduk bekerja tidak boleh melebihi penduduk usia kerja.'); var r = v.e / v.wap; return { head: { label: 'EPR', value: r, kind: 'pct' }, rows: [], steps: ['EPR = ' + f.n(v.e) + ' / ' + f.n(v.wap) + ' = ' + f.p(r)] }; }
  });

  H.def({
    id: 'labor-productivity', cat: C, also: ['business'], abbr: 'LP', name: 'Labor Productivity', idn: 'Produktivitas Tenaga Kerja',
    use: 'Mengukur output yang dihasilkan per pekerja atau per jam kerja.',
    formula: 'Labor Productivity = Real GDP / Number of Workers\nAlternative = Real Output / Total Hours Worked',
    notes: 'Pilihan penyebut harus dinyatakan: per pekerja atau per jam kerja.',
    related: ['Business & Operations'], tags: 'produktivitas tenaga kerja',
    inputs: [I.m('out', 'Output riil (Real GDP atau output riil)', 18644000000000, { min: 0 }), I.s('den', 'Penyebut', [['w', 'Per pekerja'], ['h', 'Per jam kerja']], 'w'), I.n('d', 'Jumlah pekerja atau total jam kerja', 135000000, { gt: 0 })],
    calc: function (v) { var p = v.out / v.d, u = v.den === 'h' ? 'per jam kerja' : 'per pekerja'; return { head: { label: 'Produktivitas ' + u, value: p, kind: 'money' }, rows: [], steps: ['Produktivitas = ' + f.m(v.out) + ' / ' + f.n(v.d) + ' = ' + f.m(p)] }; }
  });

  H.def({
    id: 'mpc', cat: C, also: ['micro'], abbr: 'MPC', name: 'Marginal Propensity to Consume', idn: 'Kecenderungan Mengonsumsi Marjinal',
    use: 'Mengukur bagian tambahan pendapatan disposabel yang digunakan untuk konsumsi.',
    formula: 'MPC = dConsumption / dDisposable Income',
    notes: 'Dalam model sederhana, MPC berada antara 0 dan 1.',
    related: ['Microeconomics'], tags: 'mpc konsumsi marjinal',
    inputs: [I.m('dc', 'Perubahan konsumsi', 7500000), I.m('dy', 'Perubahan pendapatan disposabel', 10000000)],
    calc: function (v) {
      E.need(v.dy !== 0, 'Pendapatan disposabel tidak berubah, MPC tidak terdefinisi.');
      var m = v.dc / v.dy;
      return { head: { label: 'MPC', value: m, kind: 'num' }, rows: [o.n('MPS (1 - MPC) dalam model sederhana', 1 - m)], steps: ['MPC = ' + f.m(v.dc) + ' / ' + f.m(v.dy) + ' = ' + f.n(m)], note: m < 0 || m > 1 ? 'Di luar rentang 0 sampai 1 yang lazim pada model sederhana. Cek data.' : undefined };
    }
  });

  H.def({
    id: 'mps', cat: C, also: ['personal'], abbr: 'MPS', name: 'Marginal Propensity to Save', idn: 'Kecenderungan Menabung Marjinal',
    use: 'Mengukur bagian tambahan pendapatan disposabel yang ditabung.',
    formula: 'MPS = dSaving / dDisposable Income\nIn simple model: MPC + MPS = 1',
    notes: 'Hubungan MPC + MPS = 1 berlaku dalam model sederhana tanpa komponen lain seperti pajak dan impor yang berubah.',
    related: ['Personal Finance'], tags: 'mps tabungan marjinal',
    inputs: [I.m('ds', 'Perubahan tabungan', 2500000), I.m('dy', 'Perubahan pendapatan disposabel', 10000000)],
    calc: function (v) {
      E.need(v.dy !== 0, 'Pendapatan disposabel tidak berubah, MPS tidak terdefinisi.');
      var m = v.ds / v.dy;
      return { head: { label: 'MPS', value: m, kind: 'num' }, rows: [o.n('MPC (1 - MPS) dalam model sederhana', 1 - m)], steps: ['MPS = ' + f.m(v.ds) + ' / ' + f.m(v.dy) + ' = ' + f.n(m)] };
    }
  });

  H.def({
    id: 'spending-mult', cat: C, also: ['micro'], abbr: 'k', name: 'Government Spending Multiplier', idn: 'Pengganda Pengeluaran',
    use: 'Mengestimasi perubahan pendapatan nasional akibat perubahan pengeluaran otonom dalam model Keynesian sederhana.',
    formula: 'k = 1 / (1 - MPC)',
    notes: 'Bentuk ini mengasumsikan model sederhana tanpa pajak proporsional dan impor.',
    related: ['Microeconomics'], tags: 'pengganda pengeluaran keynes',
    inputs: [I.n('mpc', 'MPC', 0.75, { min: 0, max: 0.999999 }), I.m('dg', 'Perubahan pengeluaran otonom (opsional)', 100000000000, { optional: true })],
    calc: function (v) {
      var k = 1 / (1 - v.mpc), rows = [o.n('1 / MPS', k)], steps = ['k = 1 / (1 - ' + f.n(v.mpc) + ') = ' + f.n(k)];
      if (v.dg !== undefined) { rows.push(o.m('Perubahan pendapatan nasional', k * v.dg)); steps.push('dY = ' + f.n(k) + ' x ' + f.m(v.dg) + ' = ' + f.m(k * v.dg)); }
      return { head: { label: 'Pengganda pengeluaran (k)', value: k, kind: 'x' }, rows: rows, steps: steps };
    }
  });

  H.def({
    id: 'tax-mult', cat: C, also: ['personal'], abbr: 'kT', name: 'Tax Multiplier', idn: 'Pengganda Pajak',
    use: 'Mengestimasi perubahan pendapatan nasional akibat perubahan pajak lump-sum dalam model sederhana.',
    formula: 'k_T = -MPC / (1 - MPC)',
    notes: 'Nilainya negatif dalam model dasar karena kenaikan pajak menurunkan disposable income dan konsumsi.',
    related: ['Personal Finance'], tags: 'pengganda pajak',
    inputs: [I.n('mpc', 'MPC', 0.75, { min: 0, max: 0.999999 }), I.m('dt', 'Perubahan pajak (opsional)', 100000000000, { optional: true })],
    calc: function (v) {
      var k = -v.mpc / (1 - v.mpc), rows = [], steps = ['k_T = -' + f.n(v.mpc) + ' / (1 - ' + f.n(v.mpc) + ') = ' + f.n(k)];
      if (v.dt !== undefined) { rows.push(o.m('Perubahan pendapatan nasional', k * v.dt)); steps.push('dY = ' + f.n(k) + ' x ' + f.m(v.dt) + ' = ' + f.m(k * v.dt)); }
      return { head: { label: 'Pengganda pajak (k_T)', value: k, kind: 'x' }, rows: rows, steps: steps };
    }
  });

  H.def({
    id: 'money-mult', cat: C, also: ['banking'], abbr: 'MM', name: 'Money Multiplier', idn: 'Pengganda Uang',
    use: 'Mengestimasi batas pengganda uang sederhana berdasarkan reserve requirement.',
    formula: 'Simple Money Multiplier = 1 / Required Reserve Ratio',
    notes: 'Ini model teoritis sederhana. Pengganda uang aktual dipengaruhi perilaku bank, permintaan uang tunai, cadangan berlebih, dan kebijakan moneter.',
    related: ['Banking & Credit'], tags: 'pengganda uang cadangan wajib',
    inputs: [I.p('rr', 'Rasio cadangan wajib', 10, { unit: '%', gt: 0, max: 100 }), I.m('dep', 'Setoran awal (opsional)', 100000000, { optional: true, min: 0 })],
    calc: function (v) {
      var m = 1 / v.rr, rows = [], steps = ['Multiplier = 1 / ' + f.p(v.rr) + ' = ' + f.n(m)];
      if (v.dep !== undefined) { rows.push(o.m('Batas ekspansi simpanan total', v.dep * m), o.m('Tambahan uang yang tercipta', v.dep * (m - 1))); steps.push('Ekspansi = ' + f.m(v.dep) + ' x ' + f.n(m) + ' = ' + f.m(v.dep * m)); }
      return { head: { label: 'Pengganda uang', value: m, kind: 'x' }, rows: rows, steps: steps, note: 'Ini batas teoritis. Pengganda aktual lebih kecil karena uang tunai dan cadangan berlebih.' };
    }
  });

  H.def({
    id: 'qtm', cat: C, also: ['banking'], abbr: 'MV=PY', name: 'Quantity Theory of Money', idn: 'Teori Kuantitas Uang',
    use: 'Menghubungkan jumlah uang beredar, kecepatan perputaran uang, tingkat harga, dan output riil.',
    formula: 'M x V = P x Y',
    notes: 'M = money supply; V = velocity; P = price level; Y = real output. Identitas ini tidak sendirinya menentukan sebab-akibat.',
    related: ['Banking & Credit'], tags: 'kuantitas uang velocity mv py',
    inputs: [I.s('solve', 'Yang dicari', [['p', 'Tingkat harga (P)'], ['m', 'Uang beredar (M)'], ['v', 'Velocity (V)'], ['y', 'Output riil (Y)']], 'p'),
      I.n('m', 'Uang beredar (M)', 8000, { gt: 0, showIf: function (r) { return r.solve !== 'm'; } }), I.n('v', 'Velocity (V)', 2.5, { gt: 0, showIf: function (r) { return r.solve !== 'v'; } }),
      I.n('p', 'Tingkat harga (P)', 1.25, { gt: 0, showIf: function (r) { return r.solve !== 'p'; } }), I.n('y', 'Output riil (Y)', 16000, { gt: 0, showIf: function (r) { return r.solve !== 'y'; } })],
    calc: function (v) {
      var res, lab;
      if (v.solve === 'm') { res = v.p * v.y / v.v; lab = 'Uang beredar (M)'; }
      else if (v.solve === 'v') { res = v.p * v.y / v.m; lab = 'Velocity (V)'; }
      else if (v.solve === 'y') { res = v.m * v.v / v.p; lab = 'Output riil (Y)'; }
      else { res = v.m * v.v / v.y; lab = 'Tingkat harga (P)'; }
      return { head: { label: lab, value: res, kind: 'num' }, rows: [], steps: ['M x V = P x Y, diselesaikan untuk ' + lab + ' = ' + f.n(res)], note: 'Identitas ini tidak sendirinya menentukan sebab-akibat.' };
    }
  });

  H.def({
    id: 'budget-balance', cat: C, also: ['accounting'], abbr: 'BB', name: 'Budget Balance', idn: 'Saldo Anggaran',
    use: 'Menghitung surplus atau defisit anggaran pemerintah.',
    formula: 'Budget Balance = Government Revenue - Government Expenditure',
    notes: 'Positif berarti surplus; negatif berarti defisit. Komponen penerimaan dan belanja harus mengikuti definisi fiskal yang dipilih.',
    related: ['Accounting'], tags: 'anggaran defisit surplus apbn',
    inputs: [I.m('r', 'Penerimaan pemerintah', 3000000000000), I.m('e', 'Belanja pemerintah', 3300000000000), I.m('gdp', 'GDP (opsional, untuk rasio)', 22000000000000, { optional: true, gt: 0 })],
    calc: function (v) {
      var b = v.r - v.e, rows = b < 0 ? [o.m('Defisit', -b)] : [];
      if (v.gdp !== undefined) rows.push(o.p('Saldo terhadap GDP', b / v.gdp));
      return { head: { label: b >= 0 ? 'Surplus anggaran' : 'Defisit anggaran', value: b, kind: 'money' }, rows: rows, steps: ['Budget Balance = ' + f.m(v.r) + ' - ' + f.m(v.e) + ' = ' + f.m(b)],
        chart: { type: 'bar', title: 'Penerimaan dan belanja', fmt: 'money', bars: [{ label: 'Penerimaan', value: v.r }, { label: 'Belanja', value: v.e }, { label: 'Saldo', value: b }] } };
    }
  });

  H.def({
    id: 'trade-balance', cat: C, also: ['stats'], abbr: 'TB', name: 'Trade Balance', idn: 'Neraca Perdagangan',
    use: 'Menghitung selisih nilai ekspor dan impor barang dan atau jasa sesuai cakupan data.',
    formula: 'Trade Balance = Exports - Imports',
    notes: 'Jelaskan apakah yang dihitung perdagangan barang saja atau barang dan jasa.',
    related: ['Financial Statistics'], tags: 'neraca perdagangan ekspor impor',
    inputs: [I.m('x', 'Ekspor', 3000000000000, { min: 0 }), I.m('m', 'Impor', 2700000000000, { min: 0 })],
    calc: function (v) {
      var t = v.x - v.m;
      return { head: { label: t >= 0 ? 'Surplus perdagangan' : 'Defisit perdagangan', value: t, kind: 'money' }, rows: [o.p('Saldo terhadap total perdagangan', (v.x + v.m) ? t / (v.x + v.m) : 0)], steps: ['Trade Balance = ' + f.m(v.x) + ' - ' + f.m(v.m) + ' = ' + f.m(t)],
        chart: { type: 'bar', title: 'Ekspor dan impor', fmt: 'money', bars: [{ label: 'Ekspor', value: v.x }, { label: 'Impor', value: v.m }, { label: 'Saldo', value: t }] } };
    }
  });

  H.def({
    id: 'terms-of-trade', cat: C, also: ['stats'], abbr: 'ToT', name: 'Terms of Trade', idn: 'Nilai Tukar Perdagangan',
    use: 'Membandingkan indeks harga ekspor dengan indeks harga impor.',
    formula: 'Terms of Trade = (Export Price Index / Import Price Index) x 100',
    notes: 'Kenaikan indeks dapat menunjukkan daya beli ekspor terhadap impor meningkat, bergantung metode indeks.',
    related: ['Financial Statistics'], tags: 'nilai tukar perdagangan tot',
    inputs: [I.n('xp', 'Indeks harga ekspor', 112, { gt: 0 }), I.n('mp', 'Indeks harga impor', 104, { gt: 0 })],
    calc: function (v) { var t = v.xp / v.mp * 100; return { head: { label: 'Terms of trade', value: t, kind: 'num' }, rows: [o.p('Selisih terhadap 100', t / 100 - 1)], steps: ['ToT = (' + f.n(v.xp) + ' / ' + f.n(v.mp) + ') x 100 = ' + f.n(t)], note: t > 100 ? 'Harga ekspor naik lebih cepat dari harga impor (relatif terhadap tahun dasar).' : (t < 100 ? 'Harga impor naik lebih cepat dari harga ekspor.' : undefined) }; }
  });

  H.ratio({
    id: 'debt-to-gdp', cat: C, also: ['corporate', 'fsa'], abbr: 'D/GDP', name: 'Debt-to-GDP Ratio', idn: 'Rasio Utang terhadap PDB',
    use: 'Membandingkan stok utang pemerintah dengan ukuran ekonomi tahunan.',
    formula: 'Debt-to-GDP = (Government Debt / GDP) x 100%',
    notes: 'Pastikan cakupan utang (pemerintah pusat atau umum) dan jenis GDP yang digunakan jelas.',
    related: ['Corporate Finance', 'Financial Statement Analysis'], tags: 'utang pemerintah pdb rasio',
    num: { label: 'Utang pemerintah', def: 8800000000000 }, den: { label: 'GDP', def: 22000000000000 }, kind: 'pct'
  });
})();
