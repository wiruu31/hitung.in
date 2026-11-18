/* Kategori 5: Financial Statement Analysis (GPM, GP, EBIT, EBITDA ada di Business & Operations dan tampil juga di sini) */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'fsa';
  var DAYS = [['365', '365 hari'], ['360', '360 hari']];

  /* A. Likuiditas */
  H.ratio({
    id: 'current-ratio', cat: C, also: ['banking'], abbr: 'CR', name: 'Current Ratio', idn: 'Rasio Lancar',
    use: 'Mengukur kemampuan aset lancar menutup kewajiban lancar.',
    formula: 'Current Ratio = Current Assets / Current Liabilities',
    notes: 'Rasio tinggi tidak otomatis baik jika aset lancar didominasi persediaan lambat terjual atau piutang bermasalah.',
    related: ['Banking & Credit'], tags: 'likuiditas rasio lancar',
    num: { label: 'Aset lancar', def: 450000000 }, den: { label: 'Kewajiban lancar', def: 300000000 }, kind: 'x'
  });

  H.def({
    id: 'quick-ratio', cat: C, also: ['banking'], abbr: 'QR', name: 'Quick Ratio / Acid-Test Ratio', idn: 'Rasio Cepat',
    use: 'Mengukur kemampuan membayar kewajiban lancar tanpa mengandalkan persediaan.',
    formula: 'Quick Ratio = (Current Assets - Inventory - Prepaid Expenses) / Current Liabilities',
    notes: 'Beberapa analisis menggunakan definisi quick assets yang sedikit berbeda.',
    related: ['Banking & Credit'], tags: 'likuiditas acid test rasio cepat',
    inputs: [I.m('ca', 'Aset lancar', 450000000, { min: 0 }), I.m('inv', 'Persediaan', 150000000, { min: 0 }), I.m('pp', 'Beban dibayar di muka', 20000000, { min: 0 }), I.m('cl', 'Kewajiban lancar', 300000000, { gt: 0 })],
    calc: function (v) {
      var qa = v.ca - v.inv - v.pp, q = qa / v.cl;
      return { head: { label: 'Quick ratio', value: q, kind: 'x' }, rows: [o.m('Quick assets', qa)],
        steps: ['Quick assets = ' + f.m(v.ca) + ' - ' + f.m(v.inv) + ' - ' + f.m(v.pp) + ' = ' + f.m(qa), 'Quick Ratio = ' + f.m(qa) + ' / ' + f.m(v.cl) + ' = ' + f.x(q)] };
    }
  });

  H.ratio({
    id: 'cash-ratio', cat: C, also: ['banking'], abbr: 'CASH', name: 'Cash Ratio', idn: 'Rasio Kas',
    use: 'Mengukur kemampuan membayar kewajiban lancar menggunakan kas dan setara kas.',
    formula: 'Cash Ratio = (Cash + Cash Equivalents) / Current Liabilities',
    notes: 'Merupakan ukuran likuiditas yang lebih ketat dibanding current ratio.',
    related: ['Banking & Credit'], tags: 'likuiditas kas',
    num: { label: 'Kas dan setara kas', def: 90000000 }, den: { label: 'Kewajiban lancar', def: 300000000 }, kind: 'x'
  });

  H.def({
    id: 'nwc', cat: C, also: ['corporate', 'accounting'], abbr: 'NWC', name: 'Net Working Capital', idn: 'Modal Kerja Bersih',
    use: 'Menghitung selisih aset lancar dan kewajiban lancar.',
    formula: 'NWC = Current Assets - Current Liabilities',
    notes: 'NWC positif menunjukkan aset lancar melebihi kewajiban lancar, tetapi tidak menjamin seluruh aset mudah dicairkan.',
    related: ['Corporate Finance', 'Accounting'], tags: 'modal kerja',
    inputs: [I.m('ca', 'Aset lancar', 450000000), I.m('cl', 'Kewajiban lancar', 300000000)],
    calc: function (v) {
      var n = v.ca - v.cl;
      return { head: { label: 'Modal kerja bersih', value: n, kind: 'money' }, rows: [], steps: ['NWC = ' + f.m(v.ca) + ' - ' + f.m(v.cl) + ' = ' + f.m(n)] };
    }
  });

  /* B. Profitabilitas */
  H.ratio({
    id: 'opm', cat: C, abbr: 'OPM', name: 'Operating Profit Margin', idn: 'Margin Laba Operasional',
    use: 'Mengukur laba operasi sebagai persentase pendapatan.',
    formula: 'OPM = EBIT / Revenue x 100%',
    notes: 'EBIT adalah laba sebelum bunga dan pajak.',
    related: ['Business & Operations'], also: ['business'], tags: 'margin operasional',
    num: { label: 'EBIT', def: 55000000 }, den: { label: 'Pendapatan', def: 300000000 }, kind: 'pct'
  });

  H.ratio({
    id: 'npm', cat: C, abbr: 'NPM', name: 'Net Profit Margin', idn: 'Margin Laba Bersih',
    use: 'Mengukur laba bersih yang dihasilkan dari setiap satuan pendapatan.',
    formula: 'NPM = Net Income / Revenue x 100%',
    notes: 'Dipengaruhi struktur biaya, bunga, pajak, dan unsur non-operasional.',
    related: ['Stock Analysis'], also: ['stock'], tags: 'margin laba bersih',
    num: { label: 'Laba bersih', def: 38000000 }, den: { label: 'Pendapatan', def: 300000000 }, kind: 'pct'
  });

  H.ratio({
    id: 'roa', cat: C, also: ['corporate', 'stock'], abbr: 'ROA', name: 'Return on Assets', idn: 'Pengembalian atas Aset',
    use: 'Mengukur kemampuan aset menghasilkan laba bersih.',
    formula: 'ROA = Net Income / Average Total Assets x 100%',
    notes: 'Rata-rata aset biasanya (aset awal + aset akhir)/2. Beberapa industri memakai definisi laba atau aset yang disesuaikan.',
    related: ['Corporate Finance', 'Stock Analysis'], tags: 'return aset',
    num: { label: 'Laba bersih', def: 38000000 }, den: { label: 'Total aset', def: 0, def1: 700000000, def2: 760000000, avg: true }, kind: 'pct'
  });

  H.ratio({
    id: 'roe', cat: C, also: ['corporate', 'stock'], abbr: 'ROE', name: 'Return on Equity', idn: 'Pengembalian atas Ekuitas',
    use: 'Mengukur laba bersih relatif terhadap rata-rata ekuitas pemegang saham.',
    formula: 'ROE = Net Income Attributable to Common Shareholders / Average Common Equity x 100%',
    notes: 'Perhatikan leverage dan ekuitas negatif karena dapat membuat interpretasi ROE menyesatkan.',
    related: ['Corporate Finance', 'Stock Analysis'], tags: 'return ekuitas',
    num: { label: 'Laba bersih untuk pemegang saham biasa', def: 38000000 }, den: { label: 'Ekuitas saham biasa', def: 0, def1: 380000000, def2: 420000000, avg: true }, kind: 'pct'
  });

  H.def({
    id: 'roic', cat: C, also: ['corporate'], abbr: 'ROIC', name: 'Return on Invested Capital', idn: 'Pengembalian atas Modal yang Diinvestasikan',
    use: 'Mengukur pengembalian operasi setelah pajak dibandingkan modal yang diinvestasikan.',
    formula: 'ROIC = NOPAT / Average Invested Capital x 100%\nNOPAT = EBIT x (1 - Tax Rate)',
    notes: 'Definisi invested capital dapat berbeda antar analis; gunakan definisi yang konsisten antarperiode dan perusahaan.',
    related: ['Corporate Finance', 'Business Valuation'], tags: 'return modal diinvestasikan nopat',
    inputs: [I.m('ebit', 'EBIT', 55000000), I.p('t', 'Tarif pajak', 22, { unit: '%', min: 0, max: 100 }), I.m('c1', 'Invested capital awal periode', 500000000, { min: 0 }), I.m('c2', 'Invested capital akhir periode', 560000000, { min: 0 })],
    calc: function (v) {
      var nopat = v.ebit * (1 - v.t), avg = (v.c1 + v.c2) / 2, r = E.div(nopat, avg, 'Rata-rata invested capital bernilai nol.');
      return { head: { label: 'ROIC', value: r, kind: 'pct' }, rows: [o.m('NOPAT', nopat), o.m('Rata-rata invested capital', avg)],
        steps: ['NOPAT = ' + f.m(v.ebit) + ' x (1 - ' + f.p(v.t) + ') = ' + f.m(nopat), 'Rata-rata modal = (' + f.m(v.c1) + ' + ' + f.m(v.c2) + ') / 2 = ' + f.m(avg), 'ROIC = ' + f.m(nopat) + ' / ' + f.m(avg) + ' = ' + f.p(r)] };
    }
  });

  H.def({
    id: 'roce', cat: C, also: ['corporate'], abbr: 'ROCE', name: 'Return on Capital Employed', idn: 'Pengembalian atas Modal yang Digunakan',
    use: 'Mengukur laba operasi dibandingkan modal yang digunakan dalam bisnis.',
    formula: 'ROCE = EBIT / Average Capital Employed x 100%\nCapital Employed = Total Assets - Current Liabilities',
    notes: 'Ada variasi definisi capital employed. Pilih satu pendekatan dan gunakan secara konsisten.',
    related: ['Corporate Finance'], tags: 'return modal digunakan capital employed',
    inputs: [I.m('ebit', 'EBIT', 55000000), I.m('ta1', 'Total aset awal periode', 700000000), I.m('ta2', 'Total aset akhir periode', 760000000),
      I.m('cl1', 'Kewajiban lancar awal periode', 280000000), I.m('cl2', 'Kewajiban lancar akhir periode', 300000000)],
    calc: function (v) {
      var ce1 = v.ta1 - v.cl1, ce2 = v.ta2 - v.cl2, avg = (ce1 + ce2) / 2, r = E.div(v.ebit, avg, 'Rata-rata capital employed bernilai nol.');
      return { head: { label: 'ROCE', value: r, kind: 'pct' }, rows: [o.m('Capital employed awal', ce1), o.m('Capital employed akhir', ce2), o.m('Rata-rata', avg)],
        steps: ['CE awal = ' + f.m(v.ta1) + ' - ' + f.m(v.cl1) + ' = ' + f.m(ce1), 'CE akhir = ' + f.m(v.ta2) + ' - ' + f.m(v.cl2) + ' = ' + f.m(ce2), 'ROCE = ' + f.m(v.ebit) + ' / ' + f.m(avg) + ' = ' + f.p(r)] };
    }
  });

  /* C. Solvabilitas */
  H.ratio({
    id: 'der', cat: C, also: ['banking', 'corporate'], abbr: 'DER', name: 'Debt-to-Equity Ratio', idn: 'Rasio Utang terhadap Ekuitas',
    use: 'Membandingkan total utang dengan ekuitas pemegang saham.',
    formula: 'DER = Total Debt / Total Equity',
    notes: 'Tentukan apakah total debt mencakup seluruh liabilitas atau hanya utang berbunga.',
    related: ['Banking & Credit', 'Corporate Finance'], tags: 'solvabilitas utang ekuitas leverage',
    num: { label: 'Total utang', def: 320000000 }, den: { label: 'Total ekuitas', def: 420000000 }, kind: 'x'
  });

  H.ratio({
    id: 'dar', cat: C, also: ['corporate'], abbr: 'DAR', name: 'Debt-to-Asset Ratio', idn: 'Rasio Utang terhadap Aset',
    use: 'Mengukur bagian aset yang dibiayai oleh utang.',
    formula: 'DAR = Total Debt / Total Assets',
    notes: 'Definisi debt harus konsisten dengan analisis yang dipakai.',
    related: ['Corporate Finance'], tags: 'solvabilitas utang aset',
    num: { label: 'Total utang', def: 320000000 }, den: { label: 'Total aset', def: 740000000 }, kind: 'pct'
  });

  H.def({
    id: 'equity-multiplier', cat: C, also: ['corporate'], abbr: 'EM', name: 'Equity Multiplier', idn: 'Pengganda Ekuitas',
    use: 'Mengukur besarnya aset relatif terhadap ekuitas dan menggambarkan leverage.',
    formula: 'Equity Multiplier = Average Total Assets / Average Total Equity',
    notes: 'Dapat menggunakan saldo akhir jika data rata-rata tidak tersedia, tetapi harus diberi label. Untuk itu isi saldo awal dan akhir dengan angka yang sama.',
    related: ['Corporate Finance'], tags: 'pengganda ekuitas leverage dupont',
    inputs: [I.m('a1', 'Total aset awal periode', 700000000), I.m('a2', 'Total aset akhir periode', 760000000), I.m('e1', 'Total ekuitas awal periode', 380000000), I.m('e2', 'Total ekuitas akhir periode', 420000000)],
    calc: function (v) {
      var a = (v.a1 + v.a2) / 2, e = (v.e1 + v.e2) / 2, r = E.div(a, e, 'Rata-rata ekuitas bernilai nol.');
      return { head: { label: 'Equity multiplier', value: r, kind: 'x' }, rows: [o.m('Rata-rata aset', a), o.m('Rata-rata ekuitas', e)],
        steps: ['Rata-rata aset = ' + f.m(a) + ', rata-rata ekuitas = ' + f.m(e), 'EM = ' + f.m(a) + ' / ' + f.m(e) + ' = ' + f.x(r)] };
    }
  });

  H.ratio({
    id: 'tie', cat: C, also: ['corporate', 'banking'], abbr: 'TIE', name: 'Times Interest Earned / Interest Coverage Ratio', idn: 'Rasio Cakupan Bunga',
    use: 'Mengukur kemampuan laba operasi menutup beban bunga.',
    formula: 'TIE = EBIT / Interest Expense',
    notes: 'TIE dan interest coverage ratio sering merujuk pada rasio yang sama. Jika memakai EBITDA atau arus kas, beri nama metrik berbeda.',
    related: ['Corporate Finance', 'Banking & Credit'], tags: 'cakupan bunga interest coverage',
    num: { label: 'EBIT', def: 55000000 }, den: { label: 'Beban bunga', def: 12000000 }, kind: 'x'
  });

  H.def({
    id: 'net-debt-ebitda', cat: C, also: ['stock'], abbr: 'ND/EBITDA', name: 'Net Debt to EBITDA', idn: 'Utang Bersih terhadap EBITDA',
    use: 'Mengukur utang bersih relatif terhadap kemampuan laba operasi sebelum D&A.',
    formula: 'Net Debt/EBITDA = (Total Debt - Cash and Cash Equivalents) / EBITDA',
    notes: 'Tidak bermakna jika EBITDA nol atau negatif; perlu mempertimbangkan jatuh tempo dan struktur utang.',
    related: ['Stock Analysis'], tags: 'utang bersih ebitda leverage',
    inputs: [I.m('d', 'Total utang', 320000000, { min: 0 }), I.m('c', 'Kas dan setara kas', 90000000, { min: 0 }), I.m('e', 'EBITDA', 70000000)],
    calc: function (v) {
      E.need(v.e > 0, 'EBITDA nol atau negatif membuat rasio ini tidak bermakna.');
      var nd = v.d - v.c, r = nd / v.e;
      return { head: { label: 'Net debt / EBITDA', value: r, kind: 'x' }, rows: [o.m('Utang bersih', nd)],
        steps: ['Net debt = ' + f.m(v.d) + ' - ' + f.m(v.c) + ' = ' + f.m(nd), 'Rasio = ' + f.m(nd) + ' / ' + f.m(v.e) + ' = ' + f.x(r)] };
    }
  });

  /* D. Aktivitas */
  H.ratio({
    id: 'itr', cat: C, also: ['business'], abbr: 'ITR', name: 'Inventory Turnover Ratio', idn: 'Rasio Perputaran Persediaan',
    use: 'Mengukur berapa kali persediaan rata-rata terjual atau berputar selama periode.',
    formula: 'ITR = COGS / Average Inventory',
    notes: 'Average Inventory umumnya (persediaan awal + akhir)/2.',
    related: ['Business & Operations'], tags: 'perputaran persediaan',
    num: { label: 'COGS', def: 165000000 }, den: { label: 'Persediaan', def: 0, def1: 40000000, def2: 35000000, avg: true }, kind: 'x'
  });

  function daysFrom(spec) {
    return H.def({
      id: spec.id, cat: C, also: ['business'], abbr: spec.abbr, name: spec.name, idn: spec.idn, use: spec.use, formula: spec.formula, notes: spec.notes,
      related: ['Business & Operations'], tags: spec.tags,
      inputs: [I.m('n', spec.numLabel, spec.numDef, { min: 0 }), I.m('b', spec.avgLabel + ' awal periode', spec.d1, { min: 0 }), I.m('e', spec.avgLabel + ' akhir periode', spec.d2, { min: 0 }), I.s('days', 'Jumlah hari dalam periode', DAYS, '365')],
      calc: function (v) {
        var avg = (v.b + v.e) / 2, turn = E.div(v.n, avg, 'Rata-rata ' + spec.avgLabel.toLowerCase() + ' bernilai nol.'), d = Number(v.days), dd = d / turn;
        return { head: { label: spec.abbr, value: dd, kind: 'days' }, rows: [o.x('Perputaran', turn), o.m('Rata-rata ' + spec.avgLabel.toLowerCase(), avg)],
          steps: ['Rata-rata = (' + f.m(v.b) + ' + ' + f.m(v.e) + ') / 2 = ' + f.m(avg), 'Perputaran = ' + f.m(v.n) + ' / ' + f.m(avg) + ' = ' + f.x(turn), spec.abbr + ' = ' + d + ' / ' + f.n(turn) + ' = ' + f.n(dd) + ' hari'],
          note: spec.note };
      }
    });
  }
  daysFrom({ id: 'dio', abbr: 'DIO', name: 'Days Inventory Outstanding', idn: 'Hari Persediaan Tersimpan', use: 'Mengestimasi rata-rata jumlah hari persediaan berada sebelum terjual.',
    formula: 'DIO = Number of Days in Period / Inventory Turnover', notes: 'Gunakan 365 atau 360 hari sesuai konvensi dan periode laporan.', tags: 'hari persediaan',
    numLabel: 'COGS', numDef: 165000000, avgLabel: 'Persediaan', d1: 40000000, d2: 35000000 });

  H.ratio({
    id: 'art', cat: C, also: ['business'], abbr: 'ART', name: 'Accounts Receivable Turnover', idn: 'Rasio Perputaran Piutang',
    use: 'Mengukur seberapa sering piutang usaha tertagih selama periode.',
    formula: 'ART = Net Credit Sales / Average Accounts Receivable',
    notes: 'Gunakan penjualan kredit bersih bila tersedia; total revenue hanya pendekatan jika rincian tidak ada.',
    related: ['Business & Operations'], tags: 'perputaran piutang',
    num: { label: 'Penjualan kredit bersih', def: 240000000 }, den: { label: 'Piutang usaha', def: 0, def1: 50000000, def2: 60000000, avg: true }, kind: 'x'
  });

  daysFrom({ id: 'dso', abbr: 'DSO', name: 'Days Sales Outstanding', idn: 'Hari Penagihan Piutang', use: 'Mengukur rata-rata waktu yang dibutuhkan untuk menagih piutang.',
    formula: 'DSO = Number of Days in Period / Receivables Turnover', notes: 'Periode lebih pendek biasanya menunjukkan penagihan lebih cepat, dengan tetap mempertimbangkan kebijakan kredit.', tags: 'hari penagihan piutang',
    numLabel: 'Penjualan kredit bersih', numDef: 240000000, avgLabel: 'Piutang usaha', d1: 50000000, d2: 60000000 });

  H.ratio({
    id: 'apt', cat: C, also: ['business'], abbr: 'APT', name: 'Accounts Payable Turnover', idn: 'Rasio Perputaran Utang Usaha',
    use: 'Mengukur berapa kali perusahaan membayar utang usaha selama periode.',
    formula: 'APT = Net Credit Purchases / Average Accounts Payable',
    notes: 'Jika pembelian kredit tidak tersedia, COGS dapat digunakan sebagai pendekatan dengan catatan.',
    related: ['Business & Operations'], tags: 'perputaran utang usaha',
    num: { label: 'Pembelian kredit bersih', def: 160000000 }, den: { label: 'Utang usaha', def: 0, def1: 30000000, def2: 34000000, avg: true }, kind: 'x'
  });

  daysFrom({ id: 'dpo', abbr: 'DPO', name: 'Days Payable Outstanding', idn: 'Hari Pembayaran Utang', use: 'Mengukur rata-rata waktu pembayaran utang usaha kepada pemasok.',
    formula: 'DPO = Number of Days in Period / Accounts Payable Turnover', notes: 'DPO yang tinggi dapat membantu kas tetapi berisiko merusak hubungan pemasok jika melewati syarat pembayaran.', tags: 'hari pembayaran utang',
    numLabel: 'Pembelian kredit bersih', numDef: 160000000, avgLabel: 'Utang usaha', d1: 30000000, d2: 34000000 });

  H.ratio({
    id: 'tatr', cat: C, also: ['business'], abbr: 'TATR', name: 'Total Asset Turnover Ratio', idn: 'Rasio Perputaran Total Aset',
    use: 'Mengukur efisiensi penggunaan seluruh aset untuk menghasilkan pendapatan.',
    formula: 'TATR = Revenue / Average Total Assets',
    notes: 'Gunakan rata-rata aset untuk menyesuaikan perubahan aset selama periode.',
    related: ['Business & Operations'], tags: 'perputaran aset',
    num: { label: 'Pendapatan', def: 300000000 }, den: { label: 'Total aset', def: 0, def1: 700000000, def2: 760000000, avg: true }, kind: 'x'
  });

  H.ratio({
    id: 'fat', cat: C, also: ['business'], abbr: 'FAT', name: 'Fixed Asset Turnover', idn: 'Rasio Perputaran Aset Tetap',
    use: 'Mengukur pendapatan relatif terhadap aset tetap bersih.',
    formula: 'FAT = Revenue / Average Net Fixed Assets',
    notes: 'Cocok untuk membandingkan efisiensi aset pada perusahaan sejenis.',
    related: ['Business & Operations'], tags: 'perputaran aset tetap',
    num: { label: 'Pendapatan', def: 300000000 }, den: { label: 'Aset tetap bersih', def: 0, def1: 250000000, def2: 270000000, avg: true }, kind: 'x'
  });

  H.def({
    id: 'ccc', cat: C, also: ['business'], abbr: 'CCC', name: 'Cash Conversion Cycle', idn: 'Siklus Konversi Kas',
    use: 'Mengukur waktu kas terikat dalam persediaan dan piutang setelah memperhitungkan waktu pembayaran pemasok.',
    formula: 'CCC = DIO + DSO - DPO',
    notes: 'Gunakan basis hari dan periode yang sama untuk DIO, DSO, dan DPO.',
    related: ['Business & Operations'], tags: 'siklus konversi kas',
    inputs: [I.n('dio', 'DIO', 76, { unit: 'hari' }), I.n('dso', 'DSO', 83, { unit: 'hari' }), I.n('dpo', 'DPO', 72, { unit: 'hari' })],
    calc: function (v) {
      var c = v.dio + v.dso - v.dpo;
      return { head: { label: 'Siklus konversi kas', value: c, kind: 'days' }, rows: [],
        steps: ['CCC = ' + f.n(v.dio) + ' + ' + f.n(v.dso) + ' - ' + f.n(v.dpo) + ' = ' + f.n(c) + ' hari'],
        chart: { type: 'bar', title: 'Komponen siklus (hari)', fmt: 'num', bars: [{ label: 'DIO', value: v.dio }, { label: 'DSO', value: v.dso }, { label: 'DPO', value: -v.dpo }, { label: 'CCC', value: c }] } };
    }
  });

  /* E. Arus kas */
  H.ratio({
    id: 'cfo-ratio', cat: C, also: ['accounting', 'corporate'], abbr: 'CFO', name: 'Cash Flow from Operations Ratio', idn: 'Rasio Arus Kas Operasi',
    use: 'Mengukur kemampuan arus kas operasi menutup kewajiban lancar.',
    formula: 'CFO Ratio = Cash Flow from Operations / Current Liabilities',
    notes: 'CFO adalah arus kas bersih dari aktivitas operasi.',
    related: ['Accounting', 'Corporate Finance'], tags: 'arus kas operasi',
    num: { label: 'Arus kas dari operasi (CFO)', def: 62000000 }, den: { label: 'Kewajiban lancar', def: 300000000 }, kind: 'x'
  });

  H.ratio({
    id: 'cf-quality', cat: C, also: ['accounting'], abbr: 'CF/NI', name: 'Cash Flow to Net Income', idn: 'Rasio Arus Kas terhadap Laba Bersih',
    use: 'Membandingkan kas operasi yang dihasilkan dengan laba bersih yang dilaporkan.',
    formula: 'Cash Flow Quality = Cash Flow from Operations / Net Income',
    notes: 'Rasio dapat tidak bermakna jika net income nol atau negatif. Evaluasi tren dan komponen modal kerja.',
    related: ['Accounting'], tags: 'kualitas laba arus kas',
    num: { label: 'Arus kas dari operasi (CFO)', def: 62000000 }, den: { label: 'Laba bersih', def: 38000000 }, kind: 'x'
  });

  H.def({
    id: 'fcf', cat: C, also: ['corporate', 'stock'], abbr: 'FCF', name: 'Free Cash Flow', idn: 'Arus Kas Bebas',
    use: 'Menghitung kas operasi yang tersisa setelah pengeluaran modal.',
    formula: 'FCF = Cash Flow from Operations - Capital Expenditures',
    notes: 'Definisi FCF dapat berbeda. Jangan samakan otomatis FCF ini dengan FCFF atau FCFE.',
    related: ['Corporate Finance', 'Stock Analysis'], tags: 'arus kas bebas',
    inputs: [I.m('cfo', 'Arus kas dari operasi (CFO)', 62000000), I.m('capex', 'Belanja modal (CAPEX)', 35000000, { min: 0 })],
    calc: function (v) {
      var x = v.cfo - v.capex;
      return { head: { label: 'Free cash flow', value: x, kind: 'money' }, rows: [], steps: ['FCF = ' + f.m(v.cfo) + ' - ' + f.m(v.capex) + ' = ' + f.m(x)] };
    }
  });
})();
