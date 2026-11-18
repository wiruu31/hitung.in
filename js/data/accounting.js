/* Kategori 9: Accounting (COGS didefinisikan di business.js dan ditampilkan juga di sini) */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'accounting';

  H.def({
    id: 'acc-equation', cat: C, also: ['personal', 'fsa'], abbr: 'A=L+E', name: 'Accounting Equation', idn: 'Persamaan Dasar Akuntansi',
    use: 'Menunjukkan keseimbangan antara sumber daya, kewajiban, dan hak pemilik.',
    formula: 'Assets = Liabilities + Equity',
    notes: 'Setiap transaksi yang dicatat dengan sistem double-entry harus menjaga keseimbangan persamaan.',
    related: ['Personal Finance', 'Financial Statement Analysis'], tags: 'persamaan akuntansi aset kewajiban ekuitas neraca',
    inputs: [I.s('solve', 'Yang dicari', [['e', 'Ekuitas'], ['l', 'Kewajiban'], ['a', 'Aset'], ['check', 'Periksa keseimbangan']], 'e'),
      I.m('a', 'Aset (Assets)', 850000000, { showIf: function (r) { return r.solve !== 'a'; } }), I.m('l', 'Kewajiban (Liabilities)', 320000000, { showIf: function (r) { return r.solve !== 'l'; } }), I.m('e', 'Ekuitas (Equity)', 530000000, { showIf: function (r) { return r.solve !== 'e'; } })],
    calc: function (v) {
      if (v.solve === 'a') { var a = v.l + v.e; return { head: { label: 'Aset', value: a, kind: 'money' }, rows: [], steps: ['Assets = ' + f.m(v.l) + ' + ' + f.m(v.e) + ' = ' + f.m(a)] }; }
      if (v.solve === 'l') { var l = v.a - v.e; return { head: { label: 'Kewajiban', value: l, kind: 'money' }, rows: [], steps: ['Liabilities = ' + f.m(v.a) + ' - ' + f.m(v.e) + ' = ' + f.m(l)], note: l < 0 ? 'Kewajiban negatif: periksa angka aset dan ekuitas.' : undefined }; }
      if (v.solve === 'check') {
        var d = v.a - (v.l + v.e), ok = Math.abs(d) < 0.005;
        return { head: { label: 'Status', value: ok ? 'Seimbang' : 'Tidak seimbang', kind: 'text' }, rows: [o.m('Aset', v.a), o.m('Kewajiban + Ekuitas', v.l + v.e), o.m('Selisih', d)],
          steps: [f.m(v.a) + ' ' + (ok ? '=' : '!=') + ' ' + f.m(v.l) + ' + ' + f.m(v.e)], note: ok ? undefined : 'Persamaan tidak seimbang. Cek pencatatan transaksi.' };
      }
      var e = v.a - v.l;
      return { head: { label: 'Ekuitas', value: e, kind: 'money' }, rows: [o.p('Porsi ekuitas terhadap aset', v.a ? e / v.a : 0)], steps: ['Equity = ' + f.m(v.a) + ' - ' + f.m(v.l) + ' = ' + f.m(e)],
        chart: { type: 'donut', title: 'Pembiayaan aset', fmt: 'money', parts: [{ label: 'Kewajiban', value: Math.max(v.l, 0) }, { label: 'Ekuitas', value: Math.max(e, 0) }] } };
    }
  });

  H.def({
    id: 'net-income', cat: C, also: ['business', 'fsa'], abbr: 'NI', name: 'Net Income', idn: 'Laba Bersih',
    use: 'Menghitung selisih seluruh pendapatan dan seluruh beban dalam satu periode.',
    formula: 'Net Income = Total Revenue - Total Expenses',
    notes: 'Pajak, bunga, dan unsur non-operasional masuk sesuai struktur laporan laba rugi.',
    related: ['Business & Operations', 'Financial Statement Analysis'], tags: 'laba bersih rugi',
    inputs: [I.m('rev', 'Total pendapatan', 300000000, { min: 0 }), I.m('exp', 'Total beban (termasuk bunga dan pajak)', 262000000, { min: 0 })],
    calc: function (v) {
      var ni = v.rev - v.exp;
      return { head: { label: 'Laba bersih', value: ni, kind: 'money' }, rows: [o.p('Margin laba bersih', v.rev ? ni / v.rev : 0)], steps: ['Net Income = ' + f.m(v.rev) + ' - ' + f.m(v.exp) + ' = ' + f.m(ni)],
        note: ni < 0 ? 'Beban melebihi pendapatan, hasilnya rugi bersih.' : undefined };
    }
  });

  H.def({
    id: 'retained-earnings', cat: C, also: ['stock', 'corporate'], abbr: 'RE', name: 'Retained Earnings', idn: 'Laba Ditahan',
    use: 'Menghitung saldo laba ditahan akhir periode perusahaan.',
    formula: 'Ending Retained Earnings = Beginning Retained Earnings + Net Income - Dividends',
    notes: 'Perlu penyesuaian untuk koreksi periode lalu atau perubahan kebijakan akuntansi bila ada.',
    related: ['Stock Analysis', 'Corporate Finance'], tags: 'laba ditahan dividen',
    inputs: [I.m('b', 'Laba ditahan awal periode', 200000000), I.m('ni', 'Laba bersih', 38000000), I.m('d', 'Dividen', 15000000, { min: 0 })],
    calc: function (v) {
      var e = v.b + v.ni - v.d;
      return { head: { label: 'Laba ditahan akhir', value: e, kind: 'money' }, rows: [o.m('Perubahan saldo', e - v.b)],
        steps: ['Ending RE = ' + f.m(v.b) + ' + ' + f.m(v.ni) + ' - ' + f.m(v.d) + ' = ' + f.m(e)],
        chart: { type: 'bar', title: 'Pergerakan laba ditahan', fmt: 'money', bars: [{ label: 'Awal', value: v.b }, { label: 'Laba bersih', value: v.ni }, { label: 'Dividen', value: -v.d }, { label: 'Akhir', value: e }] } };
    }
  });

  H.def({
    id: 'sl-dep', cat: C, also: ['fsa'], abbr: 'SL', name: 'Straight-Line Depreciation', idn: 'Metode Penyusutan Garis Lurus',
    use: 'Membagi nilai yang dapat disusutkan secara merata sepanjang umur manfaat aset.',
    formula: 'Annual Depreciation = (Asset Cost - Residual Value) / Useful Life',
    notes: 'Jika aset digunakan sebagian tahun, beban penyusutan dapat diprorata berdasarkan waktu pemakaian.',
    related: ['Financial Statement Analysis'], tags: 'penyusutan garis lurus depresiasi',
    inputs: [I.m('c', 'Harga perolehan aset', 120000000, { gt: 0 }), I.m('r', 'Nilai residu', 12000000, { min: 0 }), I.i('n', 'Umur manfaat (tahun)', 5, { min: 1, max: 100 })],
    calc: function (v) {
      E.need(v.r < v.c, 'Nilai residu harus lebih kecil dari harga perolehan.');
      var rows = E.depSL(v.c, v.r, v.n), yr = rows[0].dep;
      return { head: { label: 'Penyusutan per tahun', value: yr, kind: 'money' }, rows: [o.m('Nilai yang dapat disusutkan', v.c - v.r), o.p('Tarif tahunan (dari nilai disusutkan)', 1 / v.n)],
        steps: ['Annual Depreciation = (' + f.m(v.c) + ' - ' + f.m(v.r) + ') / ' + v.n + ' = ' + f.m(yr)],
        table: { title: 'Jadwal penyusutan', cols: ['Tahun', 'Beban', 'Akumulasi', 'Nilai buku'], rows: rows.map(function (x) { return [String(x.y), f.m(x.dep), f.m(x.acc), f.m(x.book)]; }) },
        chart: { type: 'line', title: 'Nilai buku aset', fmt: 'money', xLabel: 'Tahun', x: [0].concat(rows.map(function (x) { return x.y; })), series: [{ name: 'Nilai buku', values: [v.c].concat(rows.map(function (x) { return x.book; })) }] } };
    }
  });

  H.def({
    id: 'db-dep', cat: C, also: ['fsa'], abbr: 'DB', name: 'Declining Balance Depreciation', idn: 'Metode Saldo Menurun',
    use: 'Menghitung beban penyusutan sebagai persentase nilai buku awal periode.',
    formula: 'Depreciation Expense = Beginning Book Value x Depreciation Rate',
    notes: 'Metode saldo menurun ganda sering memakai rate = 2 / Useful Life. Jangan menyusutkan melewati nilai residu.',
    related: ['Financial Statement Analysis'], tags: 'penyusutan saldo menurun depresiasi',
    inputs: [I.m('c', 'Harga perolehan aset', 120000000, { gt: 0 }), I.m('r', 'Nilai residu', 12000000, { min: 0 }), I.i('n', 'Umur manfaat (tahun)', 5, { min: 1, max: 100 }),
      I.s('k', 'Faktor saldo menurun', [['2', 'Ganda (2x)'], ['1.5', '1,5x'], ['1', 'Tunggal (1x)']], '2')],
    calc: function (v) {
      E.need(v.r < v.c, 'Nilai residu harus lebih kecil dari harga perolehan.');
      var r = E.depDB(v.c, v.r, v.n, Number(v.k)), rows = r.rows;
      return { head: { label: 'Penyusutan tahun pertama', value: rows[0].dep, kind: 'money' }, rows: [o.p('Tarif penyusutan', r.rate, 'faktor / umur manfaat'), o.m('Nilai buku akhir', rows[rows.length - 1].book)],
        steps: ['Rate = ' + v.k + ' / ' + v.n + ' = ' + f.p(r.rate), 'Tahun 1 = ' + f.m(v.c) + ' x ' + f.p(r.rate) + ' = ' + f.m(rows[0].dep)],
        table: { title: 'Jadwal penyusutan', cols: ['Tahun', 'Beban', 'Akumulasi', 'Nilai buku'], rows: rows.map(function (x) { return [String(x.y), f.m(x.dep), f.m(x.acc), f.m(x.book)]; }) },
        note: 'Penyusutan dihentikan saat nilai buku mencapai nilai residu. Tahun terakhir disesuaikan agar nilai buku akhir sama dengan nilai residu.',
        chart: { type: 'line', title: 'Nilai buku aset', fmt: 'money', xLabel: 'Tahun', x: [0].concat(rows.map(function (x) { return x.y; })), series: [{ name: 'Nilai buku', values: [v.c].concat(rows.map(function (x) { return x.book; })) }] } };
    }
  });

  H.def({
    id: 'book-value', cat: C, also: ['stock', 'fsa'], abbr: 'BV', name: 'Book Value', idn: 'Nilai Buku Aset',
    use: 'Menghitung nilai tercatat aset setelah dikurangi akumulasi penyusutan.',
    formula: 'Book Value = Asset Cost - Accumulated Depreciation - Accumulated Impairment',
    notes: 'Untuk aset tertentu, komponen amortisasi atau impairment juga perlu diperhitungkan.',
    related: ['Stock Analysis', 'Financial Statement Analysis'], tags: 'nilai buku aset',
    inputs: [I.m('c', 'Harga perolehan aset', 120000000, { min: 0 }), I.m('ad', 'Akumulasi penyusutan', 43200000, { min: 0 }), I.m('im', 'Akumulasi penurunan nilai (impairment)', '', { optional: true, min: 0 })],
    calc: function (v) {
      var bv = v.c - v.ad - (v.im || 0);
      return { head: { label: 'Nilai buku', value: bv, kind: 'money' }, rows: [o.p('Porsi yang sudah disusutkan', v.c ? (v.ad + (v.im || 0)) / v.c : 0)], steps: ['Book Value = ' + f.m(v.c) + ' - ' + f.m(v.ad) + ' - ' + f.m(v.im || 0) + ' = ' + f.m(bv)],
        note: bv < 0 ? 'Nilai buku negatif: periksa akumulasi penyusutan dan impairment.' : undefined };
    }
  });

  H.def({
    id: 'wac', cat: C, also: ['business'], abbr: 'WAC', name: 'Weighted Average Cost of Inventory', idn: 'Biaya Rata-rata Tertimbang Persediaan',
    use: 'Menentukan biaya per unit persediaan dengan merata-ratakan biaya unit yang tersedia.',
    formula: 'Weighted Average Cost per Unit = Total Cost of Units Available / Total Units Available',
    notes: 'Metode rata-rata tertimbang dapat diterapkan secara periodik atau perpetual sesuai sistem persediaan.',
    related: ['Business & Operations'], tags: 'persediaan rata rata tertimbang biaya per unit',
    inputs: [I.pr('lots', 'Tiap baris: jumlah unit dan harga per unit', '100 5000\n150 5400\n80 5800', { hint: 'Termasuk persediaan awal. Contoh "100 5000" artinya 100 unit @ Rp 5.000.', minLen: 1 }),
      I.n('sold', 'Unit terjual (opsional)', '', { optional: true, min: 0 })],
    calc: function (v) {
      var units = E.sum(v.lots.map(function (l) { return l[0]; })), cost = E.sum(v.lots.map(function (l) { return l[0] * l[1]; }));
      E.need(units > 0, 'Total unit harus lebih besar dari nol.');
      var w = cost / units, rows = [o.m('Total biaya barang tersedia', cost), o.n('Total unit tersedia', units)], steps = ['Total biaya = ' + f.m(cost) + ', total unit = ' + f.n(units), 'WAC = ' + f.m(cost) + ' / ' + f.n(units) + ' = ' + f.m(w, 2)];
      if (v.sold !== undefined) {
        E.need(v.sold <= units, 'Unit terjual tidak boleh melebihi unit tersedia.');
        rows.push(o.m('HPP unit terjual', v.sold * w), o.m('Persediaan akhir', (units - v.sold) * w));
        steps.push('HPP = ' + f.n(v.sold) + ' x ' + f.m(w, 2) + ' = ' + f.m(v.sold * w));
      }
      return { head: { label: 'Biaya rata-rata per unit', value: w, kind: 'money' }, rows: rows, steps: steps };
    }
  });
})();
