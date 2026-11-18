/* Kategori 4: Business & Operations */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'business';

  H.def({
    id: 'tr', cat: C, also: ['micro'], abbr: 'TR', name: 'Total Revenue', idn: 'Total Pendapatan Penjualan',
    use: 'Menghitung pendapatan penjualan sebelum dikurangi biaya.',
    formula: 'TR = Price x Quantity',
    notes: 'Jika terdapat banyak produk, jumlahkan pendapatan setiap produk.',
    related: ['Microeconomics', 'Accounting'], tags: 'pendapatan penjualan revenue',
    inputs: [I.m('p', 'Harga per unit (P)', 25000, { min: 0 }), I.n('q', 'Jumlah terjual (Q)', 1200, { min: 0 })],
    calc: function (v) {
      var tr = v.p * v.q;
      return { head: { label: 'Total pendapatan (TR)', value: tr, kind: 'money' }, rows: [o.m('Harga per unit', v.p), o.n('Jumlah terjual', v.q)],
        steps: ['TR = ' + f.m(v.p) + ' x ' + f.n(v.q) + ' = ' + f.m(tr)] };
    }
  });

  H.def({
    id: 'tc', cat: C, also: ['micro'], abbr: 'TC', name: 'Total Cost', idn: 'Total Biaya',
    use: 'Menghitung gabungan biaya tetap dan biaya variabel.',
    formula: 'TC = TFC + TVC',
    notes: 'TFC = total fixed cost; TVC = total variable cost.',
    related: ['Microeconomics', 'Accounting'], tags: 'biaya tetap variabel',
    inputs: [I.m('tfc', 'Total biaya tetap (TFC)', 8000000, { min: 0 }), I.m('tvc', 'Total biaya variabel (TVC)', 14400000, { min: 0 })],
    calc: function (v) {
      var tc = v.tfc + v.tvc;
      return { head: { label: 'Total biaya (TC)', value: tc, kind: 'money' }, rows: [o.p('Porsi biaya tetap', tc ? v.tfc / tc : 0)],
        steps: ['TC = ' + f.m(v.tfc) + ' + ' + f.m(v.tvc) + ' = ' + f.m(tc)],
        chart: { type: 'donut', title: 'Komposisi biaya', fmt: 'money', parts: [{ label: 'Tetap', value: v.tfc }, { label: 'Variabel', value: v.tvc }] } };
    }
  });

  H.def({
    id: 'cogs', cat: C, also: ['accounting'], abbr: 'COGS', name: 'Cost of Goods Sold', idn: 'Harga Pokok Penjualan',
    use: 'Menghitung biaya persediaan yang menjadi beban karena barang telah terjual.',
    formula: 'COGS = Beginning Inventory + Purchases - Ending Inventory',
    notes: 'Untuk perusahaan dagang. Penyesuaian retur, diskon, dan ongkos pembelian perlu mengikuti kebijakan akuntansi yang digunakan. Untuk pembelian bersih, masukkan pembelian setelah retur dan diskon.',
    related: ['Accounting', 'Financial Statement Analysis'], tags: 'harga pokok penjualan hpp persediaan',
    inputs: [I.m('b', 'Persediaan awal', 40000000, { min: 0 }), I.m('p', 'Pembelian (bersih)', 160000000, { min: 0 }), I.m('e', 'Persediaan akhir', 35000000, { min: 0 })],
    calc: function (v) {
      var c = v.b + v.p - v.e;
      return { head: { label: 'COGS (HPP)', value: c, kind: 'money' }, rows: [o.m('Barang tersedia untuk dijual', v.b + v.p)],
        steps: ['COGS = ' + f.m(v.b) + ' + ' + f.m(v.p) + ' - ' + f.m(v.e) + ' = ' + f.m(c)] };
    }
  });

  H.def({
    id: 'gp', cat: C, abbr: 'GP', name: 'Gross Profit', idn: 'Laba Kotor',
    use: 'Menghitung laba setelah harga pokok penjualan dikurangkan dari pendapatan.',
    formula: 'Gross Profit = Revenue - COGS',
    notes: 'Untuk bisnis jasa, komponen biaya langsung dapat menggantikan COGS sesuai laporan.',
    related: ['Financial Statement Analysis'], also: ['fsa'], tags: 'laba kotor',
    inputs: [I.m('rev', 'Pendapatan (Revenue)', 300000000, { min: 0 }), I.m('cogs', 'COGS', 165000000, { min: 0 })],
    calc: function (v) {
      var gp = v.rev - v.cogs;
      return { head: { label: 'Laba kotor', value: gp, kind: 'money' }, rows: [o.p('Margin laba kotor', v.rev ? gp / v.rev : 0)],
        steps: ['Gross Profit = ' + f.m(v.rev) + ' - ' + f.m(v.cogs) + ' = ' + f.m(gp)] };
    }
  });

  H.ratio({
    id: 'gpm', cat: C, also: ['fsa'], abbr: 'GPM', name: 'Gross Profit Margin', idn: 'Margin Laba Kotor',
    use: 'Mengukur persentase pendapatan yang tersisa setelah dikurangi harga pokok penjualan.',
    formula: 'GPM = (Gross Profit / Revenue) x 100%',
    notes: 'Margin yang lebih tinggi belum tentu berarti laba bersih lebih tinggi karena beban operasional masih perlu dihitung.',
    related: ['Financial Statement Analysis', 'Stock Analysis'], tags: 'margin laba kotor',
    num: { label: 'Laba kotor', def: 135000000 }, den: { label: 'Pendapatan (Revenue)', def: 300000000 }, kind: 'pct'
  });

  H.def({
    id: 'operating-profit', cat: C, abbr: 'EBIT', name: 'Operating Profit', idn: 'Laba Operasional',
    use: 'Menghitung laba dari kegiatan operasi sebelum bunga dan pajak.',
    formula: 'Operating Profit (EBIT) = Revenue - COGS - Operating Expenses',
    notes: 'Pastikan klasifikasi pendapatan dan beban operasi konsisten.',
    related: ['Financial Statement Analysis'], also: ['fsa'], tags: 'laba operasional ebit',
    inputs: [I.m('rev', 'Pendapatan (Revenue)', 300000000, { min: 0 }), I.m('cogs', 'COGS', 165000000, { min: 0 }), I.m('opex', 'Beban operasional', 80000000, { min: 0 })],
    calc: function (v) {
      var ebit = v.rev - v.cogs - v.opex;
      return { head: { label: 'Laba operasional (EBIT)', value: ebit, kind: 'money' }, rows: [o.m('Laba kotor', v.rev - v.cogs), o.p('Margin operasional', v.rev ? ebit / v.rev : 0)],
        steps: ['EBIT = ' + f.m(v.rev) + ' - ' + f.m(v.cogs) + ' - ' + f.m(v.opex) + ' = ' + f.m(ebit)],
        chart: { type: 'bar', title: 'Dari pendapatan ke laba operasional', fmt: 'money', bars: [{ label: 'Pendapatan', value: v.rev }, { label: 'COGS', value: v.cogs }, { label: 'Opex', value: v.opex }, { label: 'EBIT', value: ebit }] } };
    }
  });

  H.def({
    id: 'ebitda', cat: C, also: ['stock', 'fsa'], abbr: 'EBITDA', name: 'Earnings Before Interest, Taxes, Depreciation and Amortization', idn: 'Laba sebelum Bunga, Pajak, Depresiasi, dan Amortisasi',
    use: 'Menilai kinerja operasi sebelum bunga, pajak, depresiasi, dan amortisasi.',
    formula: 'EBITDA = EBIT + Depreciation + Amortization',
    notes: 'EBITDA bukan arus kas dan tidak memperhitungkan CAPEX, perubahan modal kerja, atau pembayaran bunga.',
    related: ['Stock Analysis', 'Financial Statement Analysis'], tags: 'ebitda laba operasi',
    inputs: [I.m('ebit', 'EBIT', 55000000), I.m('dep', 'Depresiasi', 12000000, { min: 0 }), I.m('amo', 'Amortisasi', 3000000, { min: 0 })],
    calc: function (v) {
      var e = v.ebit + v.dep + v.amo;
      return { head: { label: 'EBITDA', value: e, kind: 'money' }, rows: [],
        steps: ['EBITDA = ' + f.m(v.ebit) + ' + ' + f.m(v.dep) + ' + ' + f.m(v.amo) + ' = ' + f.m(e)] };
    }
  });

  H.def({
    id: 'cm', cat: C, also: ['micro'], abbr: 'CM', name: 'Contribution Margin', idn: 'Margin Kontribusi',
    use: 'Menghitung sisa pendapatan setelah biaya variabel untuk menutup biaya tetap dan menghasilkan laba.',
    formula: 'Contribution Margin = Revenue - Variable Costs\nCM per Unit = Selling Price per Unit - Variable Cost per Unit',
    notes: 'Bisa dihitung total, per unit, atau sebagai rasio.',
    related: ['Microeconomics'], tags: 'margin kontribusi biaya variabel',
    inputs: [I.m('p', 'Harga jual per unit', 25000, { min: 0 }), I.m('vc', 'Biaya variabel per unit', 12000, { min: 0 }), I.n('q', 'Jumlah terjual', 1200, { min: 0 })],
    calc: function (v) {
      var cmu = v.p - v.vc, rev = v.p * v.q, tvc = v.vc * v.q, cm = rev - tvc;
      return { head: { label: 'Margin kontribusi total', value: cm, kind: 'money' },
        rows: [o.m('CM per unit', cmu), o.p('Rasio margin kontribusi', v.p ? cmu / v.p : 0), o.m('Pendapatan', rev), o.m('Total biaya variabel', tvc)],
        steps: ['CM per unit = ' + f.m(v.p) + ' - ' + f.m(v.vc) + ' = ' + f.m(cmu), 'Revenue = ' + f.m(v.p) + ' x ' + f.n(v.q) + ' = ' + f.m(rev), 'CM = ' + f.m(rev) + ' - ' + f.m(tvc) + ' = ' + f.m(cm)] };
    }
  });

  H.ratio({
    id: 'cmr', cat: C, also: ['micro'], abbr: 'CMR', name: 'Contribution Margin Ratio', idn: 'Rasio Margin Kontribusi',
    use: 'Mengukur proporsi pendapatan yang menjadi kontribusi untuk biaya tetap dan laba.',
    formula: 'CMR = Contribution Margin / Revenue',
    notes: 'Jika dinyatakan persen, kalikan 100%.',
    related: ['Microeconomics'], tags: 'rasio margin kontribusi',
    num: { label: 'Margin kontribusi', def: 15600000 }, den: { label: 'Pendapatan', def: 30000000 }, kind: 'pct'
  });

  H.def({
    id: 'bep-units', cat: C, also: ['micro'], abbr: 'BEP-U', name: 'Break-Even Point in Units', idn: 'Titik Impas dalam Unit',
    use: 'Menghitung jumlah unit minimal agar total pendapatan sama dengan total biaya.',
    formula: 'BEP Units = Fixed Costs / Contribution Margin per Unit',
    notes: 'Asumsi harga jual dan biaya variabel per unit tetap dalam rentang aktivitas yang dianalisis.',
    related: ['Microeconomics'], tags: 'titik impas bep break even',
    inputs: [I.m('fc', 'Total biaya tetap', 8000000, { min: 0 }), I.m('p', 'Harga jual per unit', 25000, { gt: 0 }), I.m('vc', 'Biaya variabel per unit', 12000, { min: 0 })],
    calc: function (v) {
      var cmu = v.p - v.vc;
      E.need(cmu > 0, 'Harga jual harus lebih besar dari biaya variabel per unit, kalau tidak titik impas tidak tercapai.');
      var u = v.fc / cmu, xs = [], k;
      var top = Math.max(u * 2, 10);
      for (k = 0; k <= 20; k++) xs.push(Math.round(top * k / 20));
      return { head: { label: 'Titik impas (unit)', value: u, kind: 'unit', unit: 'unit' },
        rows: [o.m('CM per unit', cmu), o.m('Titik impas dalam rupiah', u * v.p, 'unit impas x harga jual'), o.n('Pembulatan ke atas (unit)', Math.ceil(u))],
        steps: ['CM per unit = ' + f.m(v.p) + ' - ' + f.m(v.vc) + ' = ' + f.m(cmu), 'BEP Units = ' + f.m(v.fc) + ' / ' + f.m(cmu) + ' = ' + f.n(u) + ' unit'],
        chart: { type: 'line', title: 'Pendapatan dan total biaya', fmt: 'money', xLabel: 'Unit terjual', x: xs,
          series: [{ name: 'Pendapatan', values: xs.map(function (q) { return v.p * q; }) }, { name: 'Total biaya', values: xs.map(function (q) { return v.fc + v.vc * q; }) }] } };
    }
  });

  H.def({
    id: 'bep-sales', cat: C, also: ['micro'], abbr: 'BEP-S', name: 'Break-Even Point in Sales', idn: 'Titik Impas dalam Rupiah',
    use: 'Menghitung nilai penjualan minimal untuk mencapai titik impas.',
    formula: 'BEP Sales = Fixed Costs / Contribution Margin Ratio',
    notes: 'Contribution Margin Ratio dihitung sebagai desimal, misalnya 0,40 bukan 40. Di kolom ini cukup ketik 40 (persen), aplikasi mengonversinya.',
    related: ['Microeconomics'], tags: 'titik impas penjualan',
    inputs: [I.m('fc', 'Total biaya tetap', 8000000, { min: 0 }), I.p('cmr', 'Rasio margin kontribusi (CMR)', 52, { unit: '%', gt: 0, max: 100 })],
    calc: function (v) {
      var s = v.fc / v.cmr;
      return { head: { label: 'Titik impas (penjualan)', value: s, kind: 'money' }, rows: [o.n('CMR dalam desimal', v.cmr)],
        steps: ['CMR = ' + f.p(v.cmr) + ' = ' + f.n(v.cmr), 'BEP Sales = ' + f.m(v.fc) + ' / ' + f.n(v.cmr) + ' = ' + f.m(s)] };
    }
  });

  H.def({
    id: 'mos', cat: C, also: ['micro'], abbr: 'MOS', name: 'Margin of Safety', idn: 'Margin Keamanan Penjualan',
    use: 'Mengukur seberapa jauh penjualan aktual berada di atas titik impas.',
    formula: 'MOS = [(Actual Sales - Break-even Sales) / Actual Sales] x 100%',
    notes: 'MOS dapat pula dinyatakan dalam nilai penjualan, bukan hanya persentase.',
    related: ['Microeconomics'], tags: 'margin keamanan',
    inputs: [I.m('a', 'Penjualan aktual', 30000000, { gt: 0 }), I.m('b', 'Penjualan titik impas', 15400000, { min: 0 })],
    calc: function (v) {
      var m = (v.a - v.b) / v.a;
      return { head: { label: 'Margin of safety', value: m, kind: 'pct' }, rows: [o.m('Dalam nilai penjualan', v.a - v.b)],
        steps: ['MOS = (' + f.m(v.a) + ' - ' + f.m(v.b) + ') / ' + f.m(v.a) + ' = ' + f.p(m)],
        note: m < 0 ? 'Penjualan aktual masih di bawah titik impas.' : undefined };
    }
  });

  H.def({
    id: 'markup', cat: C, abbr: 'MU', name: 'Markup Percentage', idn: 'Persentase Markup',
    use: 'Mengukur kenaikan harga jual dibandingkan biaya perolehan atau biaya produk.',
    formula: 'Markup = [(Selling Price - Cost) / Cost] x 100%',
    notes: 'Markup berbeda dari margin karena penyebutnya adalah cost, bukan selling price.',
    related: ['Personal Finance', 'Accounting'], also: ['personal', 'accounting'], tags: 'markup margin harga jual',
    inputs: [I.m('sp', 'Harga jual', 150000, { min: 0 }), I.m('c', 'Biaya (cost)', 100000, { gt: 0 })],
    calc: function (v) {
      var mu = (v.sp - v.c) / v.c;
      return { head: { label: 'Markup', value: mu, kind: 'pct' }, rows: [o.p('Margin (terhadap harga jual)', v.sp ? (v.sp - v.c) / v.sp : 0, 'jangan disamakan dengan markup'), o.m('Keuntungan per unit', v.sp - v.c)],
        steps: ['Markup = (' + f.m(v.sp) + ' - ' + f.m(v.c) + ') / ' + f.m(v.c) + ' = ' + f.p(mu)] };
    }
  });

  H.def({
    id: 'cac', cat: C, abbr: 'CAC', name: 'Customer Acquisition Cost', idn: 'Biaya Akuisisi Pelanggan',
    use: 'Menghitung biaya rata-rata untuk memperoleh satu pelanggan baru.',
    formula: 'CAC = Sales and Marketing Costs / Number of New Customers',
    notes: 'Tentukan apakah biaya gaji, komisi, iklan, dan biaya pemasaran lain ikut dimasukkan.',
    related: ['Business & Operations'], tags: 'akuisisi pelanggan pemasaran',
    inputs: [I.m('sm', 'Biaya sales dan marketing', 45000000, { min: 0 }), I.n('nc', 'Jumlah pelanggan baru', 150, { gt: 0 })],
    calc: function (v) {
      var c = v.sm / v.nc;
      return { head: { label: 'CAC', value: c, kind: 'money' }, rows: [], steps: ['CAC = ' + f.m(v.sm) + ' / ' + f.n(v.nc) + ' = ' + f.m(c)] };
    }
  });

  H.def({
    id: 'clv', cat: C, abbr: 'CLV', name: 'Customer Lifetime Value', idn: 'Nilai Pelanggan Sepanjang Hubungan',
    use: 'Mengestimasi kontribusi nilai pelanggan sepanjang hubungan bisnis.',
    formula: 'Simple LTV = ARPU x Gross Margin x Customer Lifespan',
    notes: 'ARPU = average revenue per user/customer. Model ini sederhana; model yang lebih lengkap dapat memperhitungkan churn, retensi, diskonto, dan margin kontribusi. Satuan ARPU dan masa hubungan harus sama (misalnya per bulan dan bulan).',
    related: ['Business & Operations'], tags: 'ltv lifetime value pelanggan',
    inputs: [I.m('arpu', 'ARPU per periode', 120000, { min: 0 }), I.p('gm', 'Gross margin', 55, { unit: '%', min: 0, max: 100 }), I.n('life', 'Masa hubungan pelanggan (periode)', 18, { gt: 0 })],
    calc: function (v) {
      var l = v.arpu * v.gm * v.life;
      return { head: { label: 'Simple LTV', value: l, kind: 'money' }, rows: [o.m('Gross profit per periode', v.arpu * v.gm)],
        steps: ['LTV = ' + f.m(v.arpu) + ' x ' + f.p(v.gm) + ' x ' + f.n(v.life) + ' = ' + f.m(l)] };
    }
  });

  H.def({
    id: 'cac-payback', cat: C, abbr: 'CACP', name: 'Customer Acquisition Cost Payback Period', idn: 'Periode Pengembalian Biaya Akuisisi',
    use: 'Menghitung waktu yang diperlukan agar margin pelanggan menutup biaya akuisisi.',
    formula: 'CAC Payback (months) = CAC / Monthly Gross Profit per Customer',
    notes: 'Gunakan gross profit atau contribution profit bulanan per pelanggan, bukan pendapatan kotor semata.',
    related: ['Business & Operations'], tags: 'payback cac pelanggan',
    inputs: [I.m('cac', 'CAC', 300000, { min: 0 }), I.m('gp', 'Gross profit bulanan per pelanggan', 66000, { gt: 0 })],
    calc: function (v) {
      var m = v.cac / v.gp;
      return { head: { label: 'Payback CAC', value: m, kind: 'unit', unit: 'bulan' }, rows: [],
        steps: ['Payback = ' + f.m(v.cac) + ' / ' + f.m(v.gp) + ' = ' + f.n(m) + ' bulan'] };
    }
  });
})();
