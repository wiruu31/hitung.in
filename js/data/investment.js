/* Kategori 7: Investment & Portfolio Management */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'investment';
  var LH = 'Pisahkan dengan spasi, titik koma, atau baris baru.';

  H.def({
    id: 'hpr', cat: C, also: ['personal', 'stock'], abbr: 'HPR', name: 'Holding Period Return', idn: 'Imbal Hasil Periode Kepemilikan',
    use: 'Menghitung total return selama aset dimiliki, termasuk pendapatan yang diterima.',
    formula: 'HPR = (P1 - P0 + Income) / P0 x 100%',
    notes: 'P0 = harga awal; P1 = harga akhir; income dapat berupa dividen, kupon, atau distribusi.',
    related: ['Personal Finance', 'Stock Analysis'], tags: 'imbal hasil kepemilikan return total',
    inputs: [I.m('p0', 'Harga awal (P0)', 3000, { gt: 0 }), I.m('p1', 'Harga akhir (P1)', 3400), I.m('inc', 'Pendapatan yang diterima (dividen, kupon)', 150, { optional: true })],
    calc: function (v) {
      var inc = v.inc || 0, h = (v.p1 - v.p0 + inc) / v.p0;
      return { head: { label: 'HPR', value: h, kind: 'pct' }, rows: [o.p('Return dari harga', (v.p1 - v.p0) / v.p0), o.p('Return dari pendapatan', inc / v.p0)],
        steps: ['HPR = (' + f.m(v.p1) + ' - ' + f.m(v.p0) + ' + ' + f.m(inc) + ') / ' + f.m(v.p0) + ' = ' + f.p(h)] };
    }
  });

  H.def({
    id: 'twr', cat: C, abbr: 'TWR', name: 'Time-Weighted Return', idn: 'Imbal Hasil Tertimbang Waktu',
    use: 'Mengukur kinerja investasi dengan memisahkan dampak setoran dan penarikan investor.',
    formula: 'TWR = [(1+r1)(1+r2)...(1+rn)] - 1',
    notes: 'Bagi periode pada setiap arus kas eksternal, hitung return subperiode, lalu kalikan faktor pertumbuhannya. Jangan samakan dengan MWR.',
    related: ['Investment Analysis'], tags: 'time weighted return kinerja',
    inputs: [I.s('mode', 'Cara input', [['ret', 'Return tiap subperiode (%)'], ['val', 'Nilai awal dan akhir tiap subperiode']], 'ret'),
      I.l('rets', 'Return tiap subperiode (dalam %)', '4.5 -2 6.1 3', { hint: LH + ' Contoh: 4.5 -2 6.1', dec: true, showIf: function (r) { return r.mode !== 'val'; } }),
      I.pr('vals', 'Tiap baris: nilai awal subperiode, nilai akhir sebelum arus kas berikutnya', '100000000 104500000\n124500000 122000000\n102000000 108200000', { hint: 'Nilai awal sudah termasuk setoran atau penarikan sebelumnya.', showIf: function (r) { return r.mode === 'val'; } })],
    calc: function (v) {
      var rs = v.mode === 'val' ? v.vals.map(function (p) { E.need(p[0] > 0, 'Nilai awal subperiode harus positif.'); return p[1] / p[0] - 1; }) : v.rets.map(function (x) { return x / 100; });
      E.need(rs.length >= 1, 'Isi minimal satu subperiode.');
      var g = 1, path = [1], steps = [];
      rs.forEach(function (r, i) { E.need(1 + r > 0, 'Return subperiode ke-' + (i + 1) + ' tidak boleh -100% atau lebih rendah.'); g *= 1 + r; path.push(g); if (i < 8) steps.push('Faktor ' + (i + 1) + ' = 1 + ' + f.p(r) + ' = ' + f.n(1 + r)); });
      if (rs.length > 8) steps.push('... ' + (rs.length - 8) + ' subperiode lain');
      steps.push('TWR = ' + f.n(g) + ' - 1 = ' + f.p(g - 1));
      return { head: { label: 'TWR', value: g - 1, kind: 'pct' }, rows: [o.n('Jumlah subperiode', rs.length), o.p('Rata-rata geometrik per subperiode', Math.pow(g, 1 / rs.length) - 1)], steps: steps,
        chart: { type: 'line', title: 'Pertumbuhan Rp 1 (indeks)', fmt: 'num', xLabel: 'Subperiode', x: path.map(function (_, i) { return i; }), series: [{ name: 'Indeks', values: path }] } };
    }
  });

  H.def({
    id: 'mwr', cat: C, also: ['personal', 'corporate'], abbr: 'MWR', name: 'Money-Weighted Return / IRR', idn: 'Imbal Hasil Tertimbang Uang',
    use: 'Mengukur return berdasarkan besar dan waktu setoran, penarikan, dan nilai akhir investasi.',
    formula: '0 = SUM[i=0..n] CF_i / (1+MWR)^(t_i/365)',
    notes: 'Untuk tanggal arus kas yang tidak berjarak sama, gunakan XIRR atau metode IRR berbasis tanggal. Tanda arus kas harus dilihat dari perspektif investor: setoran negatif, penarikan dan nilai akhir positif.',
    related: ['Personal Finance', 'Corporate Finance'], tags: 'xirr irr money weighted',
    inputs: [I.dt('cf', 'Arus kas dengan tanggal (satu per baris)', '2025-01-01; -50000000\n2025-04-15; -10000000\n2025-09-30; 5000000\n2026-01-01; 72000000', { hint: 'Format: 2025-01-31; -1000000. Setoran negatif, nilai akhir portofolio positif.' })],
    calc: function (v) {
      var roots = E.xirr(v.cf);
      E.need(roots.length > 0, 'XIRR tidak ditemukan pada rentang -99% sampai 10.000%.');
      var r = roots[0], d0 = v.cf[0].days, span = (v.cf[v.cf.length - 1].days - d0) / 365;
      return { head: { label: 'MWR (XIRR, per tahun)', value: r, kind: 'pct' }, rows: [o.m('Total masuk (setoran)', -E.sum(v.cf.filter(function (c) { return c.v < 0; }).map(function (c) { return c.v; }))), o.m('Total keluar dan nilai akhir', E.sum(v.cf.filter(function (c) { return c.v > 0; }).map(function (c) { return c.v; }))), o.n('Rentang (tahun)', span)],
        steps: ['Cari r sehingga SUM CF_i / (1 + r)^((t_i - t_0)/365) = 0', 'XIRR = ' + f.p(r, 4)],
        note: roots.length > 1 ? 'Ditemukan lebih dari satu akar. Yang ditampilkan paling dekat dengan nol.' : 'Hasil ini sudah disetahunkan. Untuk periode di bawah setahun, bandingkan dengan hati-hati.' };
    }
  });

  H.def({
    id: 'expected-return', cat: C, also: ['stats'], abbr: 'E(R)', name: 'Expected Return', idn: 'Ekspektasi Pengembalian',
    use: 'Menghitung rata-rata return tertimbang berdasarkan probabilitas berbagai skenario.',
    formula: 'E(R) = SUM[i=1..n] p_i x R_i',
    notes: 'Jumlah probabilitas seluruh skenario harus sama dengan 1 (100%).',
    related: ['Financial Statistics'], tags: 'ekspektasi return skenario probabilitas',
    inputs: [I.pr('sc', 'Tiap baris: probabilitas (%) dan return (%)', '25 -10\n50 8\n25 22', { hint: 'Contoh "25 -10" artinya probabilitas 25% dengan return -10%.', minLen: 1 })],
    calc: function (v) {
      var sp = E.sum(v.sc.map(function (s) { return s[0]; }));
      E.need(Math.abs(sp - 100) < 1e-6, 'Jumlah probabilitas harus 100%. Sekarang ' + f.n(sp) + '%.');
      var er = E.sum(v.sc.map(function (s) { return s[0] / 100 * s[1] / 100; }));
      var varr = E.sum(v.sc.map(function (s) { return s[0] / 100 * Math.pow(s[1] / 100 - er, 2); }));
      return { head: { label: 'E(R)', value: er, kind: 'pct' }, rows: [o.p('Simpangan baku skenario', Math.sqrt(varr), 'berbobot probabilitas'), o.n('Jumlah skenario', v.sc.length)],
        steps: v.sc.slice(0, 8).map(function (s, i) { return 'Skenario ' + (i + 1) + ': ' + f.p(s[0] / 100) + ' x ' + f.p(s[1] / 100) + ' = ' + f.p(s[0] / 100 * s[1] / 100, 4); }).concat(['E(R) = ' + f.p(er, 4)]),
        chart: { type: 'bar', title: 'Return per skenario', fmt: 'pct', bars: v.sc.map(function (s, i) { return { label: 'S' + (i + 1) + ' (' + f.n(s[0]) + '%)', value: s[1] / 100 }; }) } };
    }
  });

  H.def({
    id: 'portfolio-return', cat: C, also: ['stats'], abbr: 'Rp', name: 'Portfolio Return', idn: 'Imbal Hasil Portofolio',
    use: 'Menghitung return gabungan dari beberapa aset berdasarkan bobot portofolio.',
    formula: 'R_p = SUM[i=1..n] w_i x R_i',
    notes: 'Bobot w_i berjumlah 1 untuk portofolio yang sepenuhnya teralokasi; sesuaikan bila ada kas atau leverage.',
    related: ['Financial Statistics'], tags: 'return portofolio bobot alokasi',
    inputs: [I.pr('as', 'Tiap baris: bobot (%) dan return (%)', '40 12\n35 7\n25 3', { hint: 'Contoh "40 12" artinya bobot 40% dengan return 12%.', minLen: 1 })],
    calc: function (v) {
      var sw = E.sum(v.as.map(function (a) { return a[0]; }));
      var rp = E.sum(v.as.map(function (a) { return a[0] / 100 * a[1] / 100; }));
      return { head: { label: 'Return portofolio (R_p)', value: rp, kind: 'pct' }, rows: [o.p('Jumlah bobot', sw / 100)],
        steps: v.as.slice(0, 8).map(function (a, i) { return 'Aset ' + (i + 1) + ': ' + f.p(a[0] / 100) + ' x ' + f.p(a[1] / 100) + ' = ' + f.p(a[0] / 100 * a[1] / 100, 4); }).concat(['R_p = ' + f.p(rp, 4)]),
        note: Math.abs(sw - 100) > 1e-6 ? 'Jumlah bobot ' + f.n(sw) + '%, bukan 100%. Sisanya dianggap kas dengan return 0 atau leverage.' : undefined,
        chart: { type: 'donut', title: 'Alokasi bobot', fmt: 'pct0', parts: v.as.map(function (a, i) { return { label: 'Aset ' + (i + 1), value: Math.abs(a[0]) / 100 }; }) } };
    }
  });

  H.def({
    id: 'roi', cat: C, also: ['personal', 'business', 'corporate'], abbr: 'ROI', name: 'Return on Investment', idn: 'Pengembalian atas Investasi',
    use: 'Mengukur keuntungan atau kerugian relatif terhadap biaya atau modal yang diinvestasikan.',
    formula: 'ROI = (Net Gain from Investment / Cost of Investment) x 100%',
    notes: 'Net gain = hasil investasi dikurangi biaya investasi. Tentukan apakah biaya transaksi, pajak, dan pendapatan tambahan sudah dimasukkan. ROI sederhana tidak memperhitungkan lamanya investasi, dan berbeda dari ROE.',
    related: ['Personal Finance', 'Business & Operations', 'Corporate Finance'], tags: 'roi keuntungan investasi',
    inputs: [I.m('cost', 'Biaya investasi', 50000000, { gt: 0 }), I.m('val', 'Nilai akhir investasi', 63000000), I.m('inc', 'Pendapatan tambahan (opsional)', '', { optional: true }), I.m('fee', 'Biaya transaksi dan pajak (opsional)', '', { optional: true, min: 0 })],
    calc: function (v) {
      var gain = v.val + (v.inc || 0) - (v.fee || 0) - v.cost, r = gain / v.cost;
      return { head: { label: 'ROI', value: r, kind: 'pct' }, rows: [o.m('Net gain', gain)],
        steps: ['Net gain = ' + f.m(v.val) + ' + ' + f.m(v.inc || 0) + ' - ' + f.m(v.fee || 0) + ' - ' + f.m(v.cost) + ' = ' + f.m(gain), 'ROI = ' + f.m(gain) + ' / ' + f.m(v.cost) + ' = ' + f.p(r)],
        note: 'ROI tidak memperhitungkan lama investasi. Untuk perbandingan lintas durasi, pakai CAGR.' };
    }
  });

  H.def({
    id: 'variance', cat: C, also: ['stats'], abbr: 'VAR', name: 'Variance', idn: 'Varians',
    use: 'Mengukur rata-rata kuadrat jarak data dari rata-ratanya (penyebaran return).',
    formula: 'Population: sigma^2 = SUM(x_i - mu)^2 / N\nSample: s^2 = SUM(x_i - x_bar)^2 / (n-1)',
    notes: 'Gunakan pembagi N untuk populasi dan n-1 untuk estimasi varians sampel. Untuk return berbobot probabilitas, gunakan SUM p_i (R_i - E[R])^2.',
    related: ['Financial Statistics'], tags: 'varians penyebaran risiko',
    inputs: [I.l('x', 'Data (misalnya return per periode)', '5.2 -1.8 3.4 7.9 -4.1 2.2 6.0', { hint: LH, minLen: 2, dec: true }), I.s('t', 'Jenis data', [['s', 'Sampel (n - 1)'], ['p', 'Populasi (N)']], 's')],
    calc: function (v) {
      var smp = v.t === 's', m = E.mean(v.x), va = E.variance(v.x, smp);
      return { head: { label: smp ? 'Varians sampel (s^2)' : 'Varians populasi (sigma^2)', value: va, kind: 'num' }, rows: [o.n('Rata-rata', m), o.n('Simpangan baku', Math.sqrt(va)), o.n('Jumlah data (n)', v.x.length)],
        steps: ['Rata-rata = ' + f.n(m), 'Jumlah kuadrat selisih = ' + f.n(va * (smp ? v.x.length - 1 : v.x.length)), 'Varians = ' + f.n(va * (smp ? v.x.length - 1 : v.x.length)) + ' / ' + (smp ? v.x.length - 1 : v.x.length) + ' = ' + f.n(va)],
        note: 'Satuan varians adalah kuadrat satuan data.' };
    }
  });

  H.def({
    id: 'sd', cat: C, also: ['stats', 'trading'], abbr: 'SD', name: 'Standard Deviation', idn: 'Simpangan Baku',
    use: 'Mengukur besarnya penyimpangan return dan menjadi ukuran umum volatilitas.',
    formula: 'Standard Deviation = sqrt(Variance)',
    notes: 'Satuan mengikuti return yang digunakan. Untuk annualisasi, gunakan rumus annualized volatility. Satuan sama dengan satuan data asal.',
    related: ['Financial Statistics', 'Trading & Risk'], tags: 'simpangan baku volatilitas risiko deviasi',
    inputs: [I.l('x', 'Data (misalnya return per periode)', '5.2 -1.8 3.4 7.9 -4.1 2.2 6.0', { hint: LH, minLen: 2, dec: true }), I.s('t', 'Jenis data', [['s', 'Sampel (n - 1)'], ['p', 'Populasi (N)']], 's')],
    calc: function (v) {
      var smp = v.t === 's', sd = E.sd(v.x, smp), m = E.mean(v.x);
      return { head: { label: smp ? 'Simpangan baku sampel (s)' : 'Simpangan baku populasi (sigma)', value: sd, kind: 'num' }, rows: [o.n('Rata-rata', m), o.n('Varians', sd * sd), o.n('Koefisien variasi (SD / rata-rata)', m !== 0 ? sd / Math.abs(m) : NaN)],
        steps: ['Varians = ' + f.n(sd * sd), 'SD = sqrt(' + f.n(sd * sd) + ') = ' + f.n(sd)],
        chart: { type: 'bar', title: 'Data dan rata-rata', fmt: 'num', bars: v.x.slice(0, 24).map(function (x, i) { return { label: String(i + 1), value: x }; }) } };
    }
  });

  H.def({
    id: 'covariance', cat: C, also: ['stats'], abbr: 'COV', name: 'Covariance', idn: 'Kovarians',
    use: 'Mengukur arah gerak bersama dua variabel.',
    formula: 'Sample Covariance = SUM[(x_i - x_bar)(y_i - y_bar)] / (n-1)',
    notes: 'Nilai positif menunjukkan kecenderungan bergerak searah; nilai negatif berlawanan arah. Besar nilainya bergantung skala data; gunakan correlation untuk ukuran yang distandardisasi.',
    related: ['Financial Statistics'], tags: 'kovarians gerak bersama',
    inputs: [I.l('x', 'Data X', '5.2 -1.8 3.4 7.9 -4.1 2.2', { hint: LH, minLen: 2, dec: true }), I.l('y', 'Data Y', '4.0 -0.5 2.8 6.1 -3.0 1.5', { hint: 'Jumlah data harus sama dengan X.', minLen: 2, dec: true }), I.s('t', 'Jenis data', [['s', 'Sampel (n - 1)'], ['p', 'Populasi (N)']], 's')],
    calc: function (v) {
      var c = E.cov(v.x, v.y, v.t === 's');
      return { head: { label: 'Kovarians', value: c, kind: 'num' }, rows: [o.n('Rata-rata X', E.mean(v.x)), o.n('Rata-rata Y', E.mean(v.y)), o.n('Jumlah pasangan', v.x.length)],
        steps: ['Kovarians = SUM[(x_i - x_bar)(y_i - y_bar)] / ' + (v.t === 's' ? '(n - 1)' : 'N') + ' = ' + f.n(c)],
        note: c > 0 ? 'Positif: kedua variabel cenderung bergerak searah.' : (c < 0 ? 'Negatif: kedua variabel cenderung berlawanan arah.' : 'Nol: tidak ada gerak bersama linear.'),
        chart: { type: 'scatter', title: 'Sebaran X dan Y', xLabel: 'X', yLabel: 'Y', points: v.x.map(function (x, i) { return [x, v.y[i]]; }) } };
    }
  });

  H.def({
    id: 'correlation', cat: C, also: ['stats'], abbr: 'RHO', name: 'Correlation Coefficient', idn: 'Koefisien Korelasi',
    use: 'Mengukur kekuatan dan arah hubungan linear dua aset atau dua variabel.',
    formula: 'rho_xy = Cov(X,Y) / (sigma_x x sigma_y)',
    notes: 'Nilai berada antara -1 dan +1. Korelasi tidak membuktikan hubungan sebab-akibat dan dapat gagal menangkap hubungan non-linear.',
    related: ['Financial Statistics'], tags: 'korelasi hubungan linear',
    inputs: [I.l('x', 'Data X', '5.2 -1.8 3.4 7.9 -4.1 2.2', { hint: LH, minLen: 2, dec: true }), I.l('y', 'Data Y', '4.0 -0.5 2.8 6.1 -3.0 1.5', { hint: 'Jumlah data harus sama dengan X.', minLen: 2, dec: true })],
    calc: function (v) {
      var r = E.corr(v.x, v.y), a = Math.abs(r);
      var kuat = a >= 0.8 ? 'sangat kuat' : a >= 0.6 ? 'kuat' : a >= 0.4 ? 'sedang' : a >= 0.2 ? 'lemah' : 'sangat lemah';
      return { head: { label: 'Korelasi (rho)', value: r, kind: 'num' }, rows: [o.n('Kovarians sampel', E.cov(v.x, v.y, true)), o.n('R kuadrat (r^2)', r * r, 'bagian variasi Y yang dijelaskan hubungan linear dengan X')],
        steps: ['Cov(X,Y) = ' + f.n(E.cov(v.x, v.y, true)), 'sigma_x = ' + f.n(E.sd(v.x, true)) + ', sigma_y = ' + f.n(E.sd(v.y, true)), 'rho = ' + f.n(r)],
        note: 'Hubungan ' + (r >= 0 ? 'positif' : 'negatif') + ' ' + kuat + '. Korelasi bukan bukti sebab-akibat.',
        chart: { type: 'scatter', title: 'Sebaran X dan Y', xLabel: 'X', yLabel: 'Y', points: v.x.map(function (x, i) { return [x, v.y[i]]; }) } };
    }
  });

  H.def({
    id: 'beta', cat: C, also: ['corporate', 'stock'], abbr: 'BETA', name: 'Beta Coefficient', idn: 'Koefisien Beta',
    use: 'Mengukur sensitivitas return aset terhadap perubahan return pasar.',
    formula: 'beta_i = Cov(R_i, R_m) / Var(R_m)',
    notes: 'Beta di atas 1 berarti sensitivitas historis lebih tinggi daripada pasar; beta bukan ukuran seluruh risiko.',
    related: ['Corporate Finance', 'Stock Analysis'], tags: 'beta pasar sensitivitas',
    inputs: [I.l('ri', 'Return aset (R_i)', '4.0 -0.5 2.8 6.1 -3.0 1.5 3.3', { hint: LH, minLen: 2, dec: true }), I.l('rm', 'Return pasar (R_m)', '3.0 -1.0 2.0 4.5 -2.5 1.0 2.4', { hint: 'Jumlah data harus sama, periode yang sama.', minLen: 2, dec: true })],
    calc: function (v) {
      var vm = E.variance(v.rm, true);
      E.need(vm !== 0, 'Return pasar tidak bervariasi, beta tidak terdefinisi.');
      var c = E.cov(v.ri, v.rm, true), b = c / vm;
      return { head: { label: 'Beta', value: b, kind: 'num' }, rows: [o.n('Kovarians (R_i, R_m)', c), o.n('Varians pasar', vm), o.n('Korelasi', E.corr(v.ri, v.rm))],
        steps: ['Cov(R_i, R_m) = ' + f.n(c), 'Var(R_m) = ' + f.n(vm), 'Beta = ' + f.n(c) + ' / ' + f.n(vm) + ' = ' + f.n(b)],
        note: b > 1 ? 'Beta di atas 1: secara historis lebih sensitif dari pasar.' : (b < 1 && b >= 0 ? 'Beta di bawah 1: secara historis kurang sensitif dari pasar.' : (b < 0 ? 'Beta negatif: cenderung bergerak berlawanan dengan pasar.' : undefined)),
        chart: { type: 'scatter', title: 'Return aset terhadap return pasar', xLabel: 'Return pasar', yLabel: 'Return aset', points: v.rm.map(function (x, i) { return [x, v.ri[i]]; }), line: { slope: b, intercept: E.mean(v.ri) - b * E.mean(v.rm) } } };
    }
  });

  H.def({
    id: 'sharpe', cat: C, also: ['trading'], abbr: 'SHARPE', name: 'Sharpe Ratio', idn: 'Rasio Sharpe',
    use: 'Mengukur excess return portofolio per satuan risiko total.',
    formula: 'Sharpe = (R_p - R_f) / sigma_p',
    notes: 'Gunakan return dan risk-free rate pada frekuensi yang sama. Untuk data periodik, annualisasi secara konsisten.',
    related: ['Trading & Risk'], tags: 'sharpe risk adjusted',
    inputs: [I.p('rp', 'Return portofolio (R_p)', 12, { unit: '%' }), I.p('rf', 'Risk-free rate (R_f)', 6, { unit: '%' }), I.p('sd', 'Simpangan baku portofolio (sigma_p)', 15, { unit: '%', gt: 0 })],
    calc: function (v) {
      var s = (v.rp - v.rf) / v.sd;
      return { head: { label: 'Sharpe ratio', value: s, kind: 'num' }, rows: [o.p('Excess return (R_p - R_f)', v.rp - v.rf)],
        steps: ['Sharpe = (' + f.p(v.rp) + ' - ' + f.p(v.rf) + ') / ' + f.p(v.sd) + ' = ' + f.n(s)] };
    }
  });

  H.def({
    id: 'treynor', cat: C, also: ['trading'], abbr: 'TREYNOR', name: 'Treynor Ratio', idn: 'Rasio Treynor',
    use: 'Mengukur excess return per satuan risiko sistematis atau beta.',
    formula: 'Treynor = (R_p - R_f) / beta_p',
    notes: 'Lebih relevan untuk portofolio yang terdiversifikasi dengan baik.',
    related: ['Trading & Risk'], tags: 'treynor beta',
    inputs: [I.p('rp', 'Return portofolio (R_p)', 12, { unit: '%' }), I.p('rf', 'Risk-free rate (R_f)', 6, { unit: '%' }), I.n('b', 'Beta portofolio', 1.1)],
    calc: function (v) {
      E.need(v.b !== 0, 'Beta bernilai nol, rasio Treynor tidak terdefinisi.');
      var t = (v.rp - v.rf) / v.b;
      return { head: { label: 'Treynor ratio', value: t, kind: 'pct' }, rows: [o.p('Excess return', v.rp - v.rf)], steps: ['Treynor = (' + f.p(v.rp) + ' - ' + f.p(v.rf) + ') / ' + f.n(v.b) + ' = ' + f.p(t, 4)],
        note: v.b < 0 ? 'Beta negatif membuat tafsir rasio ini terbalik, gunakan dengan hati-hati.' : undefined };
    }
  });

  H.def({
    id: 'jensen', cat: C, also: ['trading', 'corporate'], abbr: 'ALPHA', name: "Jensen's Alpha", idn: 'Alfa Jensen',
    use: 'Mengukur selisih return portofolio aktual dengan return yang diperkirakan CAPM.',
    formula: 'Alpha = R_p - [R_f + beta_p(R_m - R_f)]',
    notes: 'Bandingkan return pada periode dan basis yang sama. Alpha positif menunjukkan kinerja di atas estimasi CAPM pada model tersebut.',
    related: ['Trading & Risk', 'Corporate Finance'], tags: 'alpha jensen capm',
    inputs: [I.p('rp', 'Return portofolio (R_p)', 14, { unit: '%' }), I.p('rf', 'Risk-free rate (R_f)', 6, { unit: '%' }), I.n('b', 'Beta portofolio', 1.1), I.p('rm', 'Return pasar (R_m)', 11, { unit: '%' })],
    calc: function (v) {
      var exp = v.rf + v.b * (v.rm - v.rf), a = v.rp - exp;
      return { head: { label: 'Alpha', value: a, kind: 'pct' }, rows: [o.p('Return yang diharapkan CAPM', exp)],
        steps: ['Return CAPM = ' + f.p(v.rf) + ' + ' + f.n(v.b) + ' x (' + f.p(v.rm) + ' - ' + f.p(v.rf) + ') = ' + f.p(exp, 4), 'Alpha = ' + f.p(v.rp) + ' - ' + f.p(exp, 4) + ' = ' + f.p(a, 4)],
        note: a > 0 ? 'Alpha positif: di atas estimasi CAPM pada data ini.' : (a < 0 ? 'Alpha negatif: di bawah estimasi CAPM pada data ini.' : undefined) };
    }
  });

  H.def({
    id: 'mdd', cat: C, also: ['trading'], abbr: 'MDD', name: 'Maximum Drawdown', idn: 'Penurunan Maksimum',
    use: 'Mengukur penurunan terbesar dari puncak nilai portofolio ke titik terendah berikutnya.',
    formula: 'MDD = (Peak Value - Trough Value) / Peak Value x 100%',
    notes: 'Hitung berdasarkan urutan waktu nilai portofolio. Rumus return alternatif: Trough/Peak - 1, yang menghasilkan angka negatif.',
    related: ['Trading & Risk'], tags: 'drawdown penurunan maksimum',
    inputs: [I.l('vals', 'Nilai portofolio berurutan menurut waktu', '100 108 115 109 96 104 118 112 101 125', { hint: LH + ' Minimal 2 nilai.', minLen: 2, dec: true })],
    calc: function (v) {
      var r = E.maxDrawdown(v.vals);
      return { head: { label: 'Maximum drawdown', value: r.dd, kind: 'pct' }, rows: [o.n('Puncak', r.peak, 'nilai ke-' + (r.pi + 1)), o.n('Lembah', r.trough, 'nilai ke-' + (r.ti + 1)), o.p('Versi return (Trough/Peak - 1)', r.peak ? r.trough / r.peak - 1 : 0)],
        steps: ['Puncak = ' + f.n(r.peak) + ' (urutan ' + (r.pi + 1) + '), lembah = ' + f.n(r.trough) + ' (urutan ' + (r.ti + 1) + ')', 'MDD = (' + f.n(r.peak) + ' - ' + f.n(r.trough) + ') / ' + f.n(r.peak) + ' = ' + f.p(r.dd)],
        chart: { type: 'line', title: 'Nilai portofolio dan drawdown', fmt: 'num', xLabel: 'Urutan', x: v.vals.map(function (_, i) { return i + 1; }), series: [{ name: 'Nilai', values: v.vals }], mark: [r.pi, r.ti] } };
    }
  });

  H.def({
    id: 'annual-vol', cat: C, also: ['trading', 'stats'], abbr: 'VOL', name: 'Annualized Volatility', idn: 'Volatilitas Tahunan',
    use: 'Mengubah volatilitas per periode menjadi estimasi volatilitas tahunan.',
    formula: 'Annualized Volatility = Periodic Standard Deviation x sqrt(N)',
    notes: 'N = jumlah periode dalam satu tahun, misalnya 252 untuk hari perdagangan saham atau 365 untuk data harian crypto.',
    related: ['Trading & Risk', 'Financial Statistics'], tags: 'volatilitas tahunan annualisasi',
    inputs: [I.p('sd', 'Simpangan baku per periode', 1.2, { unit: '%', min: 0 }),
      I.s('n', 'Jumlah periode dalam setahun (N)', [['252', '252 (harian, hari bursa)'], ['365', '365 (harian, crypto)'], ['52', '52 (mingguan)'], ['12', '12 (bulanan)'], ['4', '4 (kuartalan)']], '252')],
    calc: function (v) {
      var n = Number(v.n), a = v.sd * Math.sqrt(n);
      return { head: { label: 'Volatilitas tahunan', value: a, kind: 'pct' }, rows: [o.n('Akar N', Math.sqrt(n))], steps: ['Volatilitas = ' + f.p(v.sd) + ' x sqrt(' + n + ') = ' + f.p(a, 4)],
        note: 'Penskalaan akar waktu mengasumsikan return antarperiode independen.' };
    }
  });
})();
