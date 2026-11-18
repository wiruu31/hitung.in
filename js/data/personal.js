/* Kategori 1: Personal Finance */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'personal';

  H.def({
    id: 'net-worth', cat: C, abbr: 'NW', name: 'Net Worth', idn: 'Kekayaan Bersih',
    use: 'Menghitung total kekayaan setelah seluruh kewajiban dikurangi.',
    formula: 'Net Worth = Total Assets - Total Liabilities',
    notes: 'Aset dapat mencakup kas, rekening, investasi, properti, dan aset lain. Utang mencakup seluruh kewajiban yang masih harus dibayar.',
    related: ['Accounting', 'Financial Statement Analysis'], also: ['accounting'], tags: 'kekayaan aset utang',
    inputs: [I.m('a', 'Total aset', 850000000), I.m('l', 'Total kewajiban (utang)', 320000000)],
    calc: function (v) {
      var nw = v.a - v.l;
      var rows = [o.m('Total aset', v.a), o.m('Total kewajiban', v.l)];
      if (v.a > 0) rows.push(o.p('Porsi aset yang dibiayai utang', v.l / v.a));
      return {
        head: { label: 'Kekayaan bersih', value: nw, kind: 'money' }, rows: rows,
        steps: ['Net Worth = ' + f.m(v.a) + ' - ' + f.m(v.l) + ' = ' + f.m(nw)],
        note: nw < 0 ? 'Kewajiban lebih besar dari aset, sehingga kekayaan bersih negatif.' : undefined,
        chart: { type: 'bar', title: 'Aset, kewajiban, dan kekayaan bersih', fmt: 'money',
          bars: [{ label: 'Aset', value: v.a }, { label: 'Kewajiban', value: v.l }, { label: 'Kekayaan bersih', value: nw }] }
      };
    }
  });

  H.def({
    id: 'cash-flow', cat: C, abbr: 'NCF', name: 'Cash Flow', idn: 'Arus Kas',
    use: 'Menghitung selisih uang yang benar-benar masuk dan keluar selama suatu periode.',
    formula: 'Net Cash Flow = Cash Inflows - Cash Outflows',
    notes: 'Gunakan arus kas, bukan otomatis pendapatan dikurangi beban akrual.',
    related: ['Accounting', 'Business & Operations'], also: ['accounting', 'business'], tags: 'kas masuk keluar',
    inputs: [I.m('in', 'Kas masuk', 18000000), I.m('out', 'Kas keluar', 14500000)],
    calc: function (v) {
      var n = v.in - v.out;
      return {
        head: { label: 'Arus kas bersih', value: n, kind: 'money' },
        rows: [o.m('Kas masuk', v.in), o.m('Kas keluar', v.out)],
        steps: ['Net Cash Flow = ' + f.m(v.in) + ' - ' + f.m(v.out) + ' = ' + f.m(n)],
        note: n < 0 ? 'Kas keluar melebihi kas masuk pada periode ini.' : undefined,
        chart: { type: 'bar', title: 'Kas masuk dan keluar', fmt: 'money',
          bars: [{ label: 'Masuk', value: v.in }, { label: 'Keluar', value: v.out }, { label: 'Bersih', value: n }] }
      };
    }
  });

  H.ratio({
    id: 'savings-rate', cat: C, abbr: 'SR', name: 'Savings Rate', idn: 'Tingkat Tabungan',
    use: 'Mengukur bagian pendapatan bersih yang berhasil disisihkan.',
    formula: 'Savings Rate = (Savings / Net Income) x 100%',
    notes: 'Definisi pembagi bisa berbeda. Katalog ini memakai pendapatan bersih yang diterima.',
    related: ['Personal Finance'], tags: 'tabungan menabung',
    num: { label: 'Tabungan', def: 3500000 }, den: { label: 'Pendapatan bersih', def: 18000000 }, kind: 'pct'
  });

  H.def({
    id: 'simple-interest', cat: C, abbr: 'SI', name: 'Simple Interest', idn: 'Bunga Sederhana',
    use: 'Menghitung bunga yang hanya didasarkan pada pokok awal.',
    formula: 'Interest = P x r x t\nFuture Value = P x (1 + r x t)',
    notes: 'P = pokok; r = tingkat bunga per tahun; t = waktu dalam tahun. Satuan periode harus konsisten.',
    related: ['Banking & Credit', 'Investment'], also: ['banking'], tags: 'bunga tunggal',
    inputs: [I.m('p', 'Pokok (P)', 10000000, { gt: 0 }), I.p('r', 'Bunga per tahun (r)', 6, { unit: '% / tahun' }),
      I.n('t', 'Lama (t)', 3, { unit: 'tahun', min: 0 })],
    calc: function (v) {
      var it = v.p * v.r * v.t, fv = v.p + it;
      var ys = E.pts(Math.ceil(v.t));
      return {
        head: { label: 'Nilai akhir (FV)', value: fv, kind: 'money' },
        rows: [o.m('Bunga', it), o.m('Pokok', v.p)],
        steps: ['Interest = ' + f.m(v.p) + ' x ' + f.p(v.r) + ' x ' + f.n(v.t) + ' = ' + f.m(it),
          'FV = ' + f.m(v.p) + ' + ' + f.m(it) + ' = ' + f.m(fv)],
        chart: { type: 'line', title: 'Nilai per tahun (bunga sederhana)', fmt: 'money', xLabel: 'Tahun', x: ys,
          series: [{ name: 'Nilai', values: ys.map(function (y) { return v.p * (1 + v.r * y); }) }] }
      };
    }
  });

  H.def({
    id: 'compound-interest', cat: C, abbr: 'CI', name: 'Compound Interest', idn: 'Bunga Majemuk',
    use: 'Menghitung pertumbuhan uang ketika bunga ikut menghasilkan bunga.',
    formula: 'FV = P x (1 + r/m)^(m x t)',
    notes: 'P = pokok; r = nominal rate tahunan; m = frekuensi compounding per tahun; t = tahun. Jika compounding tahunan, FV = P(1+r)^t. Mode setoran bulanan mensimulasikan setoran di akhir tiap bulan.',
    related: ['Investment & Portfolio Management'], also: ['investment'], tags: 'majemuk compounding tabungan setoran',
    inputs: [
      I.m('p', 'Modal awal (P)', 10000000, { min: 0 }),
      I.p('r', 'Bunga nominal per tahun (r)', 8, { unit: '% / tahun' }),
      I.s('m', 'Frekuensi compounding (m)', [['1', 'Tahunan'], ['2', 'Semesteran'], ['4', 'Kuartalan'], ['12', 'Bulanan'], ['52', 'Mingguan'], ['365', 'Harian']], '12'),
      I.n('t', 'Lama (t)', 10, { unit: 'tahun', gt: 0 }),
      I.s('mode', 'Mode', [['single', 'Setoran tunggal'], ['monthly', 'Tambah setoran bulanan']], 'single'),
      I.m('dep', 'Setoran per bulan', 1000000, { min: 0, showIf: function (r) { return r.mode === 'monthly'; } })
    ],
    calc: function (v) {
      var m = Number(v.m);
      var base = 1 + v.r / m;
      E.need(base > 0, 'Bunga terlalu negatif untuk frekuensi ini.');
      var ys = E.pts(Math.ceil(v.t));
      var xs = ys.slice();
      if (v.t % 1 !== 0 && xs[xs.length - 1] !== v.t) xs[xs.length - 1] = v.t;
      if (v.mode === 'monthly') {
        var rm = Math.pow(base, m / 12) - 1;
        var months = Math.round(v.t * 12);
        var bal = v.p, path = [v.p], k;
        for (k = 1; k <= months; k++) { bal = bal * (1 + rm) + v.dep; path.push(bal); }
        var contributed = v.p + v.dep * months;
        var pick = xs.map(function (y) { return Math.min(Math.round(y * 12), months); });
        return {
          head: { label: 'Nilai akhir (FV)', value: bal, kind: 'money' },
          rows: [o.m('Total setoran (modal + setoran bulanan)', contributed), o.m('Bunga yang dihasilkan', bal - contributed),
            o.p('Bunga efektif per bulan', rm)],
          steps: ['Bunga efektif per bulan = (1 + ' + f.p(v.r) + ' / ' + m + ')^(' + m + '/12) - 1 = ' + f.p(rm, 4),
            'Tiap bulan: saldo = saldo x (1 + ' + f.p(rm, 4) + ') + ' + f.m(v.dep),
            'Setelah ' + months + ' bulan: FV = ' + f.m(bal)],
          chart: { type: 'line', title: 'Pertumbuhan dengan setoran bulanan', fmt: 'money', xLabel: 'Tahun', x: xs,
            series: [{ name: 'Nilai akumulasi', values: pick.map(function (i) { return path[i]; }) },
              { name: 'Total setoran', values: pick.map(function (i) { return v.p + v.dep * i; }) }] }
        };
      }
      var fv = v.p * Math.pow(base, m * v.t);
      return {
        head: { label: 'Nilai akhir (FV)', value: fv, kind: 'money' },
        rows: [o.m('Modal awal', v.p), o.m('Bunga yang dihasilkan', fv - v.p), o.p('Bunga efektif tahunan (EAR)', E.ear(v.r, m))],
        steps: ['FV = ' + f.m(v.p) + ' x (1 + ' + f.p(v.r) + ' / ' + m + ')^(' + m + ' x ' + f.n(v.t) + ')',
          'FV = ' + f.m(v.p) + ' x ' + f.n(Math.pow(base, m * v.t)) + ' = ' + f.m(fv)],
        chart: { type: 'line', title: 'Bunga majemuk dibanding bunga sederhana', fmt: 'money', xLabel: 'Tahun', x: xs,
          series: [{ name: 'Majemuk', values: xs.map(function (y) { return v.p * Math.pow(base, m * y); }) },
            { name: 'Sederhana', values: xs.map(function (y) { return v.p * (1 + v.r * y); }) }] }
      };
    }
  });

  H.def({
    id: 'fv', cat: C, abbr: 'FV', name: 'Future Value', idn: 'Nilai Masa Depan',
    use: 'Menghitung nilai masa depan dari sejumlah uang saat ini.',
    formula: 'FV = PV x (1 + r)^n',
    notes: 'Untuk satu kali investasi dengan compounding per periode. r dan n harus memakai periode yang sama.',
    related: ['Corporate Finance', 'Investment & Portfolio Management'], also: ['corporate', 'investment'], tags: 'nilai masa depan',
    inputs: [I.m('pv', 'Nilai sekarang (PV)', 10000000), I.p('r', 'Tingkat bunga per periode (r)', 7, { unit: '% / periode' }),
      I.n('n', 'Jumlah periode (n)', 5, { min: 0 })],
    calc: function (v) {
      var fv = E.fv(v.pv, v.r, v.n);
      var ps = E.pts(Math.ceil(v.n));
      return {
        head: { label: 'Nilai masa depan (FV)', value: fv, kind: 'money' },
        rows: [o.m('Pertumbuhan', fv - v.pv), o.x('Pengali nilai', Math.pow(1 + v.r, v.n))],
        steps: ['FV = ' + f.m(v.pv) + ' x (1 + ' + f.p(v.r) + ')^' + f.n(v.n), 'FV = ' + f.m(v.pv) + ' x ' + f.n(Math.pow(1 + v.r, v.n)) + ' = ' + f.m(fv)],
        chart: { type: 'line', title: 'Nilai per periode', fmt: 'money', xLabel: 'Periode', x: ps,
          series: [{ name: 'Nilai', values: ps.map(function (t) { return E.fv(v.pv, v.r, t); }) }] }
      };
    }
  });

  H.def({
    id: 'pv', cat: C, abbr: 'PV', name: 'Present Value', idn: 'Nilai Sekarang',
    use: 'Mengubah nilai uang masa depan menjadi nilai ekuivalen saat ini.',
    formula: 'PV = FV / (1 + r)^n',
    notes: 'r dan n harus menggunakan periode yang sama.',
    related: ['Corporate Finance', 'Investment & Portfolio Management'], also: ['corporate', 'investment'], tags: 'diskonto nilai sekarang',
    inputs: [I.m('fv', 'Nilai masa depan (FV)', 100000000), I.p('r', 'Tingkat diskonto per periode (r)', 8, { unit: '% / periode' }),
      I.n('n', 'Jumlah periode (n)', 5, { min: 0 })],
    calc: function (v) {
      var pv = E.pv(v.fv, v.r, v.n);
      var ps = E.pts(Math.ceil(v.n));
      return {
        head: { label: 'Nilai sekarang (PV)', value: pv, kind: 'money' },
        rows: [o.m('Selisih terhadap FV', v.fv - pv)],
        steps: ['PV = ' + f.m(v.fv) + ' / (1 + ' + f.p(v.r) + ')^' + f.n(v.n), 'PV = ' + f.m(v.fv) + ' / ' + f.n(Math.pow(1 + v.r, v.n)) + ' = ' + f.m(pv)],
        chart: { type: 'line', title: 'Nilai sekarang menurut jarak waktu', fmt: 'money', xLabel: 'Periode', x: ps,
          series: [{ name: 'PV dari FV', values: ps.map(function (t) { return E.pv(v.fv, v.r, t); }) }] }
      };
    }
  });

  H.def({
    id: 'cagr', cat: C, abbr: 'CAGR', name: 'Compound Annual Growth Rate', idn: 'Tingkat Pertumbuhan Tahunan Majemuk',
    use: 'Mengukur tingkat pertumbuhan tahunan majemuk dari nilai awal ke nilai akhir.',
    formula: 'CAGR = (Ending Value / Beginning Value)^(1/n) - 1',
    notes: 'n = jumlah tahun. CAGR menghaluskan jalur pertumbuhan dan tidak menunjukkan volatilitas di tengah periode.',
    related: ['Investment & Portfolio Management', 'Stock Analysis'], also: ['investment', 'stock'], tags: 'pertumbuhan tahunan',
    inputs: [I.m('b', 'Nilai awal', 50000000, { gt: 0 }), I.m('e', 'Nilai akhir', 120000000, { gt: 0 }), I.n('n', 'Jumlah tahun (n)', 6, { gt: 0 })],
    calc: function (v) {
      var g = E.cagr(v.b, v.e, v.n);
      var ps = E.pts(Math.ceil(v.n));
      return {
        head: { label: 'CAGR', value: g, kind: 'pct' },
        rows: [o.x('Total pertumbuhan', v.e / v.b), o.p('Total pertumbuhan (persen)', v.e / v.b - 1)],
        steps: ['CAGR = (' + f.m(v.e) + ' / ' + f.m(v.b) + ')^(1/' + f.n(v.n) + ') - 1', 'CAGR = ' + f.n(v.e / v.b) + '^' + f.n(1 / v.n) + ' - 1 = ' + f.p(g)],
        note: 'Ini jalur pertumbuhan yang dihaluskan. Nilai nyata di tengah periode bisa naik turun.',
        chart: { type: 'line', title: 'Jalur nilai dengan laju CAGR tetap', fmt: 'money', xLabel: 'Tahun', x: ps,
          series: [{ name: 'Nilai', values: ps.map(function (t) { return v.b * Math.pow(1 + g, t); }) }] }
      };
    }
  });

  H.def({
    id: 'ear', cat: C, abbr: 'EAR', name: 'Effective Annual Rate', idn: 'Suku Bunga Efektif Tahunan',
    use: 'Menghitung bunga efektif tahunan setelah memperhitungkan frekuensi compounding.',
    formula: 'EAR = (1 + APR/m)^m - 1',
    notes: 'APR = suku bunga nominal tahunan; m = jumlah periode compounding per tahun.',
    related: ['Banking & Credit', 'Corporate Finance'], also: ['banking', 'corporate'], tags: 'apr efektif nominal',
    inputs: [I.p('apr', 'Bunga nominal tahunan (APR)', 12, { unit: '% / tahun' }),
      I.s('m', 'Compounding per tahun (m)', [['1', 'Tahunan'], ['2', 'Semesteran'], ['4', 'Kuartalan'], ['12', 'Bulanan'], ['52', 'Mingguan'], ['365', 'Harian']], '12')],
    calc: function (v) {
      var m = Number(v.m), e = E.ear(v.apr, m);
      return {
        head: { label: 'EAR', value: e, kind: 'pct' },
        rows: [o.p('APR nominal', v.apr), o.p('Bunga per periode', v.apr / m, 'APR / m'), o.p('Selisih EAR dan APR', e - v.apr)],
        steps: ['EAR = (1 + ' + f.p(v.apr) + ' / ' + m + ')^' + m + ' - 1', 'EAR = ' + f.n(Math.pow(1 + v.apr / m, m)) + ' - 1 = ' + f.p(e, 4)]
      };
    }
  });

  H.def({
    id: 'real-return', cat: C, abbr: 'RRR', name: 'Real Rate of Return', idn: 'Tingkat Pengembalian Riil',
    use: 'Mengukur return setelah memperhitungkan inflasi.',
    formula: 'Real Return = [(1 + Nominal Return) / (1 + Inflation)] - 1',
    notes: 'Pendekatan sederhana: real return mendekati nominal return dikurangi inflasi.',
    related: ['Investment & Portfolio Management', 'Macroeconomics'], also: ['investment', 'macro'], tags: 'inflasi riil',
    inputs: [I.p('i', 'Return nominal', 9, { unit: '%' }), I.p('pi', 'Inflasi', 3.5, { unit: '%' })],
    calc: function (v) {
      E.need(1 + v.pi > 0, 'Inflasi harus lebih besar dari -100%.');
      var r = (1 + v.i) / (1 + v.pi) - 1;
      return {
        head: { label: 'Return riil', value: r, kind: 'pct' },
        rows: [o.p('Pendekatan sederhana (nominal - inflasi)', v.i - v.pi), o.p('Selisih kedua metode', r - (v.i - v.pi), 'metode eksak dikurangi pendekatan')],
        steps: ['Real = (1 + ' + f.p(v.i) + ') / (1 + ' + f.p(v.pi) + ') - 1 = ' + f.p(r, 4)]
      };
    }
  });

  H.def({
    id: 'inflation-adjusted', cat: C, abbr: 'IAV', name: 'Inflation-Adjusted Value', idn: 'Nilai Setelah Penyesuaian Inflasi',
    use: 'Menghitung daya beli setara suatu nilai uang pada periode lain.',
    formula: 'Real Value = Nominal Value / (1 + Inflation Rate)^n',
    notes: 'Gunakan tingkat inflasi per periode dan jumlah periode yang sesuai.',
    related: ['Macroeconomics'], also: ['macro'], tags: 'daya beli inflasi',
    inputs: [I.m('nv', 'Nilai nominal', 100000000), I.p('pi', 'Inflasi per periode', 4, { unit: '% / periode' }), I.n('n', 'Jumlah periode (n)', 10, { min: 0 })],
    calc: function (v) {
      var rv = E.pv(v.nv, v.pi, v.n);
      var ps = E.pts(Math.ceil(v.n));
      return {
        head: { label: 'Nilai riil (daya beli hari ini)', value: rv, kind: 'money' },
        rows: [o.p('Penurunan daya beli', 1 - rv / v.nv)],
        steps: ['Real Value = ' + f.m(v.nv) + ' / (1 + ' + f.p(v.pi) + ')^' + f.n(v.n) + ' = ' + f.m(rv)],
        chart: { type: 'line', title: 'Daya beli nilai nominal', fmt: 'money', xLabel: 'Periode', x: ps,
          series: [{ name: 'Nilai riil', values: ps.map(function (t) { return E.pv(v.nv, v.pi, t); }) }] }
      };
    }
  });

  H.def({
    id: 'annuity-fv', cat: C, abbr: 'FVA', name: 'Future Value of an Ordinary Annuity', idn: 'Nilai Masa Depan Anuitas Biasa',
    use: 'Menghitung nilai akhir setoran sama besar yang dilakukan pada akhir setiap periode.',
    formula: 'FV = PMT x [((1 + r)^n - 1) / r]',
    notes: 'Untuk setoran awal periode (annuity due), kalikan hasil dengan (1+r). Jika r = 0, FV = PMT x n.',
    related: ['Investment & Portfolio Management'], also: ['investment'], tags: 'anuitas setoran berkala',
    inputs: [I.m('pmt', 'Setoran per periode (PMT)', 1000000), I.p('r', 'Bunga per periode (r)', 0.7, { unit: '% / periode' }),
      I.i('n', 'Jumlah periode (n)', 60, { min: 1 }),
      I.s('type', 'Waktu setoran', [['end', 'Akhir periode (anuitas biasa)'], ['begin', 'Awal periode (annuity due)']], 'end')],
    calc: function (v) {
      var due = v.type === 'begin';
      var fv = E.annuityFV(v.pmt, v.r, v.n, due);
      var ps = E.pts(v.n);
      return {
        head: { label: 'Nilai akhir (FV)', value: fv, kind: 'money' },
        rows: [o.m('Total setoran', v.pmt * v.n), o.m('Bunga yang dihasilkan', fv - v.pmt * v.n)],
        steps: v.r === 0 ? ['r = 0, maka FV = PMT x n = ' + f.m(fv)] :
          ['FV = ' + f.m(v.pmt) + ' x [((1 + ' + f.p(v.r) + ')^' + v.n + ' - 1) / ' + f.p(v.r) + ']' + (due ? ' x (1 + r)' : ''), 'FV = ' + f.m(fv)],
        chart: { type: 'line', title: 'Saldo dan total setoran', fmt: 'money', xLabel: 'Periode', x: ps,
          series: [{ name: 'Saldo', values: ps.map(function (t) { return E.annuityFV(v.pmt, v.r, t, due); }) },
            { name: 'Total setoran', values: ps.map(function (t) { return v.pmt * t; }) }] }
      };
    }
  });

  H.def({
    id: 'annuity-pv', cat: C, abbr: 'PVA', name: 'Present Value of an Ordinary Annuity', idn: 'Nilai Sekarang Anuitas Biasa',
    use: 'Menghitung nilai sekarang dari pembayaran atau penerimaan tetap berkala.',
    formula: 'PV = PMT x [1 - (1 + r)^(-n)] / r',
    notes: 'Untuk pembayaran awal periode, kalikan hasil dengan (1+r). Jika r = 0, PV = PMT x n.',
    related: ['Corporate Finance', 'Banking & Credit'], also: ['corporate', 'banking'], tags: 'anuitas pensiun',
    inputs: [I.m('pmt', 'Pembayaran per periode (PMT)', 5000000), I.p('r', 'Tingkat diskonto per periode (r)', 0.8, { unit: '% / periode' }),
      I.i('n', 'Jumlah periode (n)', 120, { min: 1 }),
      I.s('type', 'Waktu pembayaran', [['end', 'Akhir periode (anuitas biasa)'], ['begin', 'Awal periode (annuity due)']], 'end')],
    calc: function (v) {
      var due = v.type === 'begin';
      var pv = E.annuityPV(v.pmt, v.r, v.n, due);
      return {
        head: { label: 'Nilai sekarang (PV)', value: pv, kind: 'money' },
        rows: [o.m('Total pembayaran nominal', v.pmt * v.n), o.m('Selisih nominal dan PV', v.pmt * v.n - pv)],
        steps: v.r === 0 ? ['r = 0, maka PV = PMT x n = ' + f.m(pv)] :
          ['PV = ' + f.m(v.pmt) + ' x [1 - (1 + ' + f.p(v.r) + ')^(-' + v.n + ')] / ' + f.p(v.r) + (due ? ' x (1 + r)' : ''), 'PV = ' + f.m(pv)]
      };
    }
  });

  H.def({
    id: 'perpetuity', cat: C, abbr: 'PERP', name: 'Perpetuity', idn: 'Anuitas Abadi',
    use: 'Menghitung nilai sekarang dari arus kas tetap yang berlangsung tanpa batas waktu.',
    formula: 'PV = PMT / r\nGrowing: PV = CF1 / (r - g)',
    notes: 'Berlaku untuk pembayaran pertama satu periode lagi dan r > 0. Untuk perpetuitas bertumbuh, r harus lebih besar dari g.',
    related: ['Corporate Finance', 'Stock Analysis'], also: ['corporate', 'stock'], tags: 'abadi perpetual',
    inputs: [I.m('cf', 'Arus kas periode pertama (PMT atau CF1)', 2000000), I.p('r', 'Tingkat diskonto (r)', 8, { unit: '%' }),
      I.p('g', 'Pertumbuhan arus kas (g), isi 0 bila tetap', 0, { unit: '%' })],
    calc: function (v) {
      E.need(v.r > v.g, 'Tingkat diskonto harus lebih besar dari pertumbuhan (r > g).');
      E.need(v.r > 0, 'Tingkat diskonto harus lebih besar dari nol.');
      var pv = v.cf / (v.r - v.g);
      return {
        head: { label: 'Nilai sekarang (PV)', value: pv, kind: 'money' },
        rows: [o.p('r - g', v.r - v.g)],
        steps: [v.g === 0 ? 'PV = ' + f.m(v.cf) + ' / ' + f.p(v.r) + ' = ' + f.m(pv) :
          'PV = ' + f.m(v.cf) + ' / (' + f.p(v.r) + ' - ' + f.p(v.g) + ') = ' + f.m(pv)]
      };
    }
  });
})();
