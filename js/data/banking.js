/* Kategori 2: Banking & Credit */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'banking';

  var FREQ = [['12', 'Bulanan (12 kali setahun)'], ['4', 'Kuartalan (4 kali)'], ['2', 'Semesteran (2 kali)'], ['1', 'Tahunan (1 kali)'], ['52', 'Mingguan (52 kali)']];

  function loanInputs() {
    return [I.m('pv', 'Pokok pinjaman', 300000000, { gt: 0 }), I.p('rate', 'Bunga efektif per tahun', 9.5, { unit: '% / tahun', min: 0 }),
      I.n('yrs', 'Tenor', 15, { unit: 'tahun', gt: 0 }), I.s('freq', 'Frekuensi cicilan', FREQ, '12')];
  }
  function loanBase(v) {
    var fq = Number(v.freq), n = Math.round(v.yrs * fq);
    E.need(n >= 1, 'Tenor terlalu pendek untuk frekuensi cicilan ini.');
    var r = v.rate / fq, pmt = E.pmt(v.pv, r, n);
    return { fq: fq, n: n, r: r, pmt: pmt };
  }
  function scheduleTable(rows) {
    var cap = 600;
    return { title: 'Jadwal amortisasi' + (rows.length > cap ? ' (600 periode pertama)' : ''),
      cols: ['Ke-', 'Cicilan', 'Bunga', 'Pokok', 'Sisa pokok'],
      rows: rows.slice(0, cap).map(function (x) { return [String(x.k), f.m(x.pmt), f.m(x.interest), f.m(x.principal), f.m(x.balance)]; }) };
  }

  H.ratio({
    id: 'dti', cat: C, abbr: 'DTI', name: 'Debt-to-Income Ratio', idn: 'Rasio Utang terhadap Pendapatan',
    use: 'Mengukur porsi pendapatan kotor bulanan yang digunakan untuk membayar kewajiban utang bulanan.',
    formula: 'DTI = (Monthly Debt Payments / Gross Monthly Income) x 100%',
    notes: 'Pastikan definisi pembayaran utang konsisten, misalnya cicilan kredit dan kewajiban utang rutin.',
    related: ['Personal Finance', 'Credit Analysis'], also: ['personal'], tags: 'utang pendapatan cicilan',
    num: { label: 'Total cicilan utang per bulan', def: 4500000 }, den: { label: 'Pendapatan kotor per bulan', def: 18000000 }, kind: 'pct'
  });

  H.ratio({
    id: 'ltv', cat: C, abbr: 'LTV', name: 'Loan-to-Value Ratio', idn: 'Rasio Pinjaman terhadap Nilai Aset',
    use: 'Mengukur besarnya pinjaman dibandingkan nilai aset yang dijadikan jaminan.',
    formula: 'LTV = (Loan Amount / Asset Value) x 100%',
    notes: 'Umum digunakan untuk kredit properti dan kendaraan.',
    related: ['Corporate Finance', 'Credit Analysis'], also: ['corporate'], tags: 'jaminan kpr properti kendaraan',
    num: { label: 'Jumlah pinjaman', def: 400000000 }, den: { label: 'Nilai aset jaminan', def: 500000000 }, kind: 'pct'
  });

  H.ratio({
    id: 'dscr', cat: C, abbr: 'DSCR', name: 'Debt Service Coverage Ratio', idn: 'Rasio Cakupan Pembayaran Utang',
    use: 'Mengukur kemampuan arus kas operasi untuk membayar pokok dan bunga utang yang jatuh tempo.',
    formula: 'DSCR = Net Operating Income / Total Debt Service',
    notes: 'Nilai di atas 1 berarti pendapatan operasi melebihi pembayaran utang pada periode tersebut. Definisi NOI harus konsisten.',
    related: ['Corporate Finance', 'Financial Statement Analysis'], also: ['corporate', 'fsa'], tags: 'cakupan utang noi',
    num: { label: 'Net operating income (NOI)', def: 180000000 }, den: { label: 'Total pembayaran utang (pokok + bunga)', def: 120000000 }, kind: 'x',
    note: function (r) { return r > 1 ? 'NOI melebihi total pembayaran utang pada periode ini.' : (r === 1 ? 'NOI persis sama dengan pembayaran utang.' : 'NOI lebih kecil dari pembayaran utang pada periode ini.'); }
  });

  H.ratio({
    id: 'credit-utilization', cat: C, abbr: 'CUR', name: 'Credit Utilization Ratio', idn: 'Rasio Penggunaan Kredit',
    use: 'Mengukur bagian limit kredit yang sedang digunakan.',
    formula: 'Credit Utilization = (Outstanding Credit Balance / Total Credit Limit) x 100%',
    notes: 'Bisa dihitung per kartu maupun seluruh fasilitas kredit.',
    related: ['Personal Finance'], also: ['personal'], tags: 'kartu kredit limit',
    num: { label: 'Saldo kredit terpakai', def: 6000000 }, den: { label: 'Total limit kredit', def: 20000000 }, kind: 'pct'
  });

  H.def({
    id: 'pmt', cat: C, abbr: 'PMT', name: 'Periodic Payment', idn: 'Pembayaran Berkala Tetap',
    use: 'Menghitung cicilan tetap pinjaman dengan metode amortisasi.',
    formula: 'PMT = PV x r / [1 - (1 + r)^(-n)]',
    notes: 'r = bunga per periode; n = jumlah pembayaran. Rumus ini untuk pembayaran akhir periode. Jika r = 0, PMT = PV/n.',
    related: ['Personal Finance', 'Corporate Finance'], also: ['personal', 'corporate'], tags: 'cicilan kpr kredit amortisasi angsuran',
    inputs: loanInputs(),
    calc: function (v) {
      var b = loanBase(v);
      var total = b.pmt * b.n;
      var rows = E.schedule(v.pv, b.r, b.n, b.pmt);
      var ps = E.pts(b.n);
      return {
        head: { label: 'Cicilan per periode (PMT)', value: b.pmt, kind: 'money' },
        rows: [o.m('Total pembayaran', total), o.m('Total bunga', total - v.pv), o.p('Bunga per periode (r)', b.r, 'bunga tahunan / frekuensi'), o.n('Jumlah pembayaran (n)', b.n)],
        steps: ['r = ' + f.p(v.rate) + ' / ' + b.fq + ' = ' + f.p(b.r, 4) + ', n = ' + f.n(v.yrs) + ' x ' + b.fq + ' = ' + b.n,
          'PMT = ' + f.m(v.pv) + ' x ' + f.p(b.r, 4) + ' / [1 - (1 + ' + f.p(b.r, 4) + ')^(-' + b.n + ')]', 'PMT = ' + f.m(b.pmt)],
        chart: { type: 'line', title: 'Sisa pokok pinjaman', fmt: 'money', xLabel: 'Pembayaran ke-', x: ps,
          series: [{ name: 'Sisa pokok', values: ps.map(function (k) { return k === 0 ? v.pv : rows[k - 1].balance; }) }] },
        table: scheduleTable(rows),
        note: 'Tidak termasuk biaya administrasi, provisi, asuransi, atau biaya lain.'
      };
    }
  });

  H.def({
    id: 'total-interest', cat: C, abbr: 'TI', name: 'Total Interest', idn: 'Total Bunga Pinjaman',
    use: 'Menghitung jumlah bunga yang dibayar sepanjang tenor pinjaman dengan cicilan tetap.',
    formula: 'Total Interest = (PMT x n) - Principal',
    notes: 'Tidak termasuk biaya administrasi, provisi, asuransi, atau biaya lain.',
    related: ['Personal Finance'], also: ['personal'], tags: 'total bunga biaya pinjaman',
    inputs: loanInputs(),
    calc: function (v) {
      var b = loanBase(v), total = b.pmt * b.n, ti = total - v.pv;
      return {
        head: { label: 'Total bunga', value: ti, kind: 'money' },
        rows: [o.m('Cicilan per periode', b.pmt), o.m('Total pembayaran', total), o.p('Bunga dibanding pokok', ti / v.pv)],
        steps: ['PMT = ' + f.m(b.pmt) + ', n = ' + b.n, 'Total Interest = (' + f.m(b.pmt) + ' x ' + b.n + ') - ' + f.m(v.pv) + ' = ' + f.m(ti)],
        chart: { type: 'donut', title: 'Komposisi total pembayaran', fmt: 'money',
          parts: [{ label: 'Pokok', value: v.pv }, { label: 'Bunga', value: Math.max(ti, 0) }] }
      };
    }
  });

  H.def({
    id: 'loan-balance', cat: C, abbr: 'BAL', name: 'Outstanding Loan Balance', idn: 'Sisa Pokok Pinjaman',
    use: 'Menghitung sisa pokok utang setelah sejumlah pembayaran dilakukan.',
    formula: 'B_k = PV(1+r)^k - PMT x [((1+r)^k - 1)/r]',
    notes: 'k = jumlah pembayaran yang telah dilakukan. Untuk r = 0, saldo = PV - k x PMT.',
    related: ['Personal Finance', 'Accounting'], also: ['personal', 'accounting'], tags: 'sisa utang pelunasan',
    inputs: loanInputs().concat([I.i('k', 'Jumlah pembayaran yang sudah dilakukan (k)', 36, { min: 0 })]),
    calc: function (v) {
      var b = loanBase(v);
      E.need(v.k <= b.n, 'k tidak boleh melebihi jumlah total pembayaran (' + b.n + ').');
      var bal = Math.max(E.balance(v.pv, b.r, b.pmt, v.k), 0);
      return {
        head: { label: 'Sisa pokok setelah ' + v.k + ' pembayaran', value: bal, kind: 'money' },
        rows: [o.m('Pokok yang sudah dibayar', v.pv - bal), o.p('Porsi pokok terbayar', (v.pv - bal) / v.pv), o.m('Cicilan per periode', b.pmt)],
        steps: ['PMT = ' + f.m(b.pmt) + ', r = ' + f.p(b.r, 4),
          'B_' + v.k + ' = ' + f.m(v.pv) + ' x (1 + ' + f.p(b.r, 4) + ')^' + v.k + ' - ' + f.m(b.pmt) + ' x [((1 + r)^' + v.k + ' - 1) / r]', 'B_' + v.k + ' = ' + f.m(bal)]
      };
    }
  });

  H.def({
    id: 'flat-interest', cat: C, abbr: 'FLAT', name: 'Flat Interest', idn: 'Bunga Flat',
    use: 'Menghitung bunga pinjaman berdasarkan pokok awal selama tenor.',
    formula: 'Total Interest = Principal x Flat Rate x Time\nInstallment = (Principal + Total Interest) / Number of Installments',
    notes: 'Perhitungan bunga flat tidak sama dengan bunga efektif karena pokok pinjaman tidak menjadi dasar bunga yang menurun.',
    related: ['Personal Finance'], also: ['personal'], tags: 'bunga flat motor kredit',
    inputs: [I.m('pv', 'Pokok pinjaman', 20000000, { gt: 0 }), I.p('flat', 'Bunga flat per tahun', 8, { unit: '% / tahun', min: 0 }),
      I.n('yrs', 'Tenor', 3, { unit: 'tahun', gt: 0 }), I.s('freq', 'Frekuensi cicilan', FREQ, '12')],
    calc: function (v) {
      var fq = Number(v.freq), n = Math.round(v.yrs * fq);
      E.need(n >= 1, 'Tenor terlalu pendek untuk frekuensi cicilan ini.');
      var ti = v.pv * v.flat * v.yrs, inst = (v.pv + ti) / n;
      var rp = E.rateFromPmt(v.pv, inst, n), eff = rp * fq;
      return {
        head: { label: 'Cicilan per periode', value: inst, kind: 'money' },
        rows: [o.m('Total bunga', ti), o.m('Total pembayaran', v.pv + ti), o.p('Bunga efektif setara per tahun (perkiraan)', eff, 'nominal, dihitung dari cicilan flat'), o.n('Jumlah cicilan', n)],
        steps: ['Total Interest = ' + f.m(v.pv) + ' x ' + f.p(v.flat) + ' x ' + f.n(v.yrs) + ' = ' + f.m(ti),
          'Installment = (' + f.m(v.pv) + ' + ' + f.m(ti) + ') / ' + n + ' = ' + f.m(inst)],
        note: 'Bunga efektif setara dicari dari cicilan flat dengan metode anuitas, sebagai pembanding. Biaya lain tidak ikut dihitung.'
      };
    }
  });
})();
