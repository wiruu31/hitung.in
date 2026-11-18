/* Kategori 6: Stock & Fundamental Analysis */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'stock';

  H.def({
    id: 'eps', cat: C, also: ['fsa'], abbr: 'EPS', name: 'Earnings Per Share', idn: 'Laba per Saham',
    use: 'Menghitung laba yang tersedia bagi pemegang saham biasa per lembar saham rata-rata tertimbang.',
    formula: 'EPS = (Net Income - Preferred Dividends) / Weighted Average Common Shares Outstanding',
    notes: 'EPS bukan "Earning Percent". Gunakan weighted average shares, bukan selalu jumlah saham akhir periode.',
    related: ['Financial Statement Analysis', 'Business Valuation'], tags: 'laba per saham',
    inputs: [I.m('ni', 'Laba bersih', 38000000000), I.m('pd', 'Dividen saham preferen', 0, { min: 0, optional: true }), I.n('sh', 'Saham biasa beredar rata-rata tertimbang', 10000000000, { gt: 0 })],
    calc: function (v) {
      var pd = v.pd || 0, eps = (v.ni - pd) / v.sh;
      return { head: { label: 'EPS', value: eps, kind: 'money' }, rows: [o.m('Laba untuk pemegang saham biasa', v.ni - pd)],
        steps: ['EPS = (' + f.m(v.ni) + ' - ' + f.m(pd) + ') / ' + f.n(v.sh) + ' = ' + f.m(eps, 2)],
        note: eps < 0 ? 'EPS negatif: perusahaan merugi bagi pemegang saham biasa.' : undefined };
    }
  });

  H.def({
    id: 'diluted-eps', cat: C, also: ['fsa'], abbr: 'DEPS', name: 'Diluted Earnings Per Share', idn: 'Laba per Saham Terdilusi',
    use: 'Mengukur laba per saham dengan memperhitungkan efek instrumen yang berpotensi menambah saham beredar.',
    formula: 'Diluted EPS = Adjusted Earnings Available to Common / Diluted Weighted Average Shares',
    notes: 'Perhitungan memperhatikan opsi, waran, obligasi konversi, dan aturan anti-dilusi. Opsi dihitung dengan treasury stock method.',
    related: ['Financial Statement Analysis'], tags: 'dilusi opsi waran konversi',
    inputs: [I.m('ni', 'Laba bersih', 38000000000), I.m('pd', 'Dividen saham preferen', 0, { min: 0, optional: true }),
      I.m('ci', 'Bunga obligasi konversi setelah pajak (opsional)', '', { min: 0, optional: true }),
      I.n('sh', 'Saham biasa beredar rata-rata tertimbang', 10000000000, { gt: 0 }),
      I.n('cs', 'Saham tambahan bila obligasi dikonversi (opsional)', '', { min: 0, optional: true }),
      I.n('on', 'Jumlah opsi atau waran (opsional)', '', { min: 0, optional: true }),
      I.m('ox', 'Harga pelaksanaan opsi (opsional)', '', { min: 0, optional: true }),
      I.m('ap', 'Harga pasar rata-rata saham (opsional)', '', { min: 0, optional: true })],
    calc: function (v) {
      var pd = v.pd || 0, ci = v.ci || 0, cs = v.cs || 0, on = v.on || 0;
      var net = 0, steps = [];
      if (on > 0) {
        E.need(v.ox !== undefined && v.ap > 0, 'Untuk opsi, isi harga pelaksanaan dan harga pasar rata-rata.');
        net = v.ap > v.ox ? on * (1 - v.ox / v.ap) : 0;
        steps.push('Saham tambahan dari opsi (treasury stock method) = ' + f.n(on) + ' x (1 - ' + f.m(v.ox) + ' / ' + f.m(v.ap) + ') = ' + f.n(net));
      }
      var earn = v.ni - pd + ci, shares = v.sh + cs + net;
      var basic = (v.ni - pd) / v.sh, dil = earn / shares;
      steps.push('Diluted EPS = (' + f.m(v.ni) + ' - ' + f.m(pd) + ' + ' + f.m(ci) + ') / ' + f.n(shares) + ' = ' + f.m(dil, 2));
      return { head: { label: 'Diluted EPS', value: dil, kind: 'money' }, rows: [o.m('EPS dasar', basic), o.p('Dilusi terhadap EPS dasar', basic ? 1 - dil / basic : 0), o.n('Saham terdilusi', shares)],
        steps: steps, note: dil > basic ? 'Konversi ini bersifat anti-dilutif (EPS naik), biasanya tidak dimasukkan ke perhitungan.' : undefined };
    }
  });

  H.def({
    id: 'bvps', cat: C, also: ['accounting', 'fsa'], abbr: 'BVPS', name: 'Book Value Per Share', idn: 'Nilai Buku per Saham',
    use: 'Menghitung nilai buku ekuitas yang tersedia bagi pemegang saham biasa per saham.',
    formula: "BVPS = (Shareholders' Equity - Preferred Equity) / Common Shares Outstanding",
    notes: 'Nilai buku bukan estimasi otomatis dari nilai pasar atau nilai likuidasi.',
    related: ['Accounting', 'Financial Statement Analysis'], tags: 'nilai buku saham',
    inputs: [I.m('eq', 'Total ekuitas pemegang saham', 420000000000), I.m('pe', 'Ekuitas saham preferen', 0, { min: 0, optional: true }), I.n('sh', 'Saham biasa beredar', 10000000000, { gt: 0 })],
    calc: function (v) {
      var pe = v.pe || 0, b = (v.eq - pe) / v.sh;
      return { head: { label: 'BVPS', value: b, kind: 'money' }, rows: [o.m('Ekuitas saham biasa', v.eq - pe)],
        steps: ['BVPS = (' + f.m(v.eq) + ' - ' + f.m(pe) + ') / ' + f.n(v.sh) + ' = ' + f.m(b, 2)] };
    }
  });

  H.ratio({
    id: 'pe', cat: C, also: ['investment'], abbr: 'P/E', name: 'Price-to-Earnings Ratio', idn: 'Rasio Harga terhadap Laba',
    use: 'Membandingkan harga saham dengan laba per saham.',
    formula: 'P/E = Market Price per Share / EPS',
    notes: 'P/E tidak bermakna secara normal jika EPS negatif. Bedakan trailing P/E dan forward P/E.',
    related: ['Business Valuation', 'Investment Analysis'], tags: 'price earnings valuasi per',
    num: { label: 'Harga pasar per saham', def: 3800 }, den: { label: 'EPS', def: 380 }, kind: 'x',
    zeroMsg: 'EPS bernilai nol, P/E tidak terdefinisi.',
    note: function (r, a, b) { return b < 0 ? 'EPS negatif, P/E tidak bermakna secara normal.' : undefined; }
  });

  H.ratio({
    id: 'pb', cat: C, also: ['investment'], abbr: 'P/B', name: 'Price-to-Book Ratio', idn: 'Rasio Harga terhadap Nilai Buku',
    use: 'Membandingkan harga saham dengan nilai buku per saham.',
    formula: 'P/B = Market Price per Share / BVPS',
    notes: 'Lebih sering relevan untuk bisnis yang nilai aset dan ekuitasnya informatif, seperti sektor keuangan.',
    related: ['Business Valuation'], tags: 'price book valuasi pbv',
    num: { label: 'Harga pasar per saham', def: 3800 }, den: { label: 'BVPS', def: 4200 }, kind: 'x'
  });

  H.ratio({
    id: 'ps', cat: C, also: ['investment'], abbr: 'P/S', name: 'Price-to-Sales Ratio', idn: 'Rasio Harga terhadap Penjualan',
    use: 'Membandingkan kapitalisasi pasar dengan pendapatan perusahaan.',
    formula: 'P/S = Market Capitalization / Revenue',
    notes: 'Berguna saat laba belum positif, tetapi tidak menunjukkan profitabilitas.',
    related: ['Business Valuation'], tags: 'price sales valuasi',
    num: { label: 'Kapitalisasi pasar', def: 38000000000000 }, den: { label: 'Pendapatan (Revenue)', def: 30000000000000 }, kind: 'x'
  });

  H.def({
    id: 'peg', cat: C, abbr: 'PEG', name: 'Price/Earnings-to-Growth Ratio', idn: 'Rasio P/E terhadap Pertumbuhan',
    use: 'Menghubungkan valuasi P/E dengan tingkat pertumbuhan laba.',
    formula: 'PEG = P/E Ratio / Annual EPS Growth Rate',
    notes: 'Konvensi umum memasukkan growth sebagai angka persen, misalnya 20 untuk 20%. Aplikasi ini memakai konvensi itu. PEG sensitif terhadap estimasi pertumbuhan.',
    related: ['Business Valuation'], tags: 'peg pertumbuhan laba valuasi',
    inputs: [I.n('pe', 'P/E', 10, { hint: 'Bila belum ada, hitung dulu lewat P/E.' }), I.n('g', 'Pertumbuhan EPS tahunan', 20, { unit: '%', gt: 0, hint: 'Isi 20 untuk 20%.' })],
    calc: function (v) {
      var p = v.pe / v.g;
      return { head: { label: 'PEG', value: p, kind: 'x' }, rows: [], steps: ['PEG = ' + f.n(v.pe) + ' / ' + f.n(v.g) + ' = ' + f.x(p)],
        note: 'Pertumbuhan dipakai sebagai angka persen (' + f.n(v.g) + ', bukan ' + f.n(v.g / 100) + ').' };
    }
  });

  H.def({
    id: 'market-cap', cat: C, also: ['investment'], abbr: 'MCAP', name: 'Market Capitalization', idn: 'Kapitalisasi Pasar',
    use: 'Menghitung nilai pasar seluruh saham biasa yang beredar.',
    formula: 'Market Cap = Share Price x Shares Outstanding',
    notes: 'Gunakan jumlah saham beredar pada tanggal harga yang sama.',
    related: ['Investment & Portfolio Management'], tags: 'kapitalisasi pasar',
    inputs: [I.m('p', 'Harga saham', 3800, { min: 0 }), I.n('sh', 'Saham beredar', 10000000000, { min: 0 })],
    calc: function (v) {
      var m = v.p * v.sh;
      return { head: { label: 'Kapitalisasi pasar', value: m, kind: 'money' }, rows: [], steps: ['Market Cap = ' + f.m(v.p) + ' x ' + f.n(v.sh) + ' = ' + f.m(m)] };
    }
  });

  H.def({
    id: 'ev', cat: C, also: ['corporate'], abbr: 'EV', name: 'Enterprise Value', idn: 'Nilai Perusahaan',
    use: 'Mengestimasi nilai operasi perusahaan dengan memperhitungkan klaim utang dan kepentingan nonpengendali serta mengurangi kas.',
    formula: 'EV = Market Cap + Total Debt + Preferred Equity + Non-controlling Interest - Cash and Cash Equivalents',
    notes: 'Komponen dapat disesuaikan tergantung struktur perusahaan dan data yang tersedia.',
    related: ['Corporate Finance', 'Business Valuation'], tags: 'nilai perusahaan enterprise',
    inputs: [I.m('mc', 'Kapitalisasi pasar', 38000000000000, { min: 0 }), I.m('d', 'Total utang', 12000000000000, { min: 0 }), I.m('pe', 'Ekuitas saham preferen (opsional)', '', { optional: true, min: 0 }),
      I.m('nci', 'Kepentingan nonpengendali (opsional)', '', { optional: true, min: 0 }), I.m('c', 'Kas dan setara kas', 4000000000000, { min: 0 })],
    calc: function (v) {
      var pe = v.pe || 0, nci = v.nci || 0, ev = v.mc + v.d + pe + nci - v.c;
      return { head: { label: 'Enterprise value', value: ev, kind: 'money' }, rows: [o.m('Utang bersih (utang - kas)', v.d - v.c)],
        steps: ['EV = ' + f.m(v.mc) + ' + ' + f.m(v.d) + ' + ' + f.m(pe) + ' + ' + f.m(nci) + ' - ' + f.m(v.c) + ' = ' + f.m(ev)],
        chart: { type: 'bar', title: 'Komponen enterprise value', fmt: 'money', bars: [{ label: 'Kapitalisasi', value: v.mc }, { label: 'Utang', value: v.d }, { label: 'Preferen + NCI', value: pe + nci }, { label: 'Kas', value: -v.c }, { label: 'EV', value: ev }] } };
    }
  });

  H.ratio({
    id: 'ev-ebitda', cat: C, abbr: 'EV/EBITDA', name: 'Enterprise Value to EBITDA', idn: 'Kelipatan Nilai Perusahaan terhadap EBITDA',
    use: 'Membandingkan nilai perusahaan dengan EBITDA sebagai indikator operasi.',
    formula: 'EV/EBITDA = Enterprise Value / EBITDA',
    notes: 'Tidak bermakna jika EBITDA nol atau negatif. Bandingkan perusahaan sejenis.',
    related: ['Business Valuation'], tags: 'multiple ebitda valuasi',
    num: { label: 'Enterprise value', def: 46000000000000 }, den: { label: 'EBITDA', def: 6000000000000 }, kind: 'x',
    note: function (r, a, b) { return b < 0 ? 'EBITDA negatif, kelipatan tidak bermakna.' : undefined; }
  });

  H.ratio({
    id: 'ev-ebit', cat: C, abbr: 'EV/EBIT', name: 'Enterprise Value to EBIT', idn: 'Kelipatan Nilai Perusahaan terhadap EBIT',
    use: 'Membandingkan nilai perusahaan dengan laba operasi sebelum bunga dan pajak.',
    formula: 'EV/EBIT = Enterprise Value / EBIT',
    notes: 'Memasukkan depresiasi dan amortisasi melalui EBIT, sehingga berbeda dari EV/EBITDA.',
    related: ['Business Valuation'], tags: 'multiple ebit valuasi',
    num: { label: 'Enterprise value', def: 46000000000000 }, den: { label: 'EBIT', def: 4500000000000 }, kind: 'x',
    note: function (r, a, b) { return b < 0 ? 'EBIT negatif, kelipatan tidak bermakna.' : undefined; }
  });

  H.ratio({
    id: 'dividend-yield', cat: C, also: ['personal', 'investment'], abbr: 'DY', name: 'Dividend Yield', idn: 'Imbal Hasil Dividen',
    use: 'Menghitung dividen tahunan relatif terhadap harga saham saat ini.',
    formula: 'Dividend Yield = (Annual Dividend per Share / Share Price) x 100%',
    notes: 'Dividen masa lalu tidak menjamin dividen masa depan.',
    related: ['Personal Finance', 'Investment & Portfolio Management'], tags: 'dividen yield',
    num: { label: 'Dividen tahunan per saham', def: 190 }, den: { label: 'Harga saham', def: 3800 }, kind: 'pct'
  });

  H.def({
    id: 'dpr', cat: C, also: ['fsa'], abbr: 'DPR', name: 'Dividend Payout Ratio', idn: 'Rasio Pembayaran Dividen',
    use: 'Mengukur bagian laba yang dibagikan sebagai dividen.',
    formula: 'DPR = (Dividends to Common Shareholders / Net Income Attributable to Common) x 100%\nPer share: DPR = DPS / EPS',
    notes: 'Waspadai laba negatif atau dividen khusus.',
    related: ['Financial Statement Analysis'], tags: 'payout dividen',
    inputs: [I.m('div', 'Dividen untuk pemegang saham biasa (atau DPS)', 190), I.m('ni', 'Laba untuk pemegang saham biasa (atau EPS)', 380, { hint: 'Pakai basis yang sama: total dengan total, atau per saham dengan per saham.' })],
    calc: function (v) {
      E.need(v.ni !== 0, 'Laba bernilai nol, DPR tidak terdefinisi.');
      var r = v.div / v.ni;
      return { head: { label: 'DPR', value: r, kind: 'pct' }, rows: [o.p('Retention ratio (1 - DPR)', 1 - r)], steps: ['DPR = ' + f.m(v.div) + ' / ' + f.m(v.ni) + ' = ' + f.p(r)],
        note: v.ni < 0 ? 'Laba negatif, DPR tidak bermakna normal.' : (r > 1 ? 'Dividen melebihi laba pada periode ini.' : undefined),
        chart: { type: 'donut', title: 'Pembagian laba', fmt: 'pct0', parts: [{ label: 'Dividen', value: Math.max(r, 0) }, { label: 'Ditahan', value: Math.max(1 - r, 0) }] } };
    }
  });

  H.def({
    id: 'retention-ratio', cat: C, also: ['corporate'], abbr: 'RR', name: 'Retention Ratio', idn: 'Rasio Laba Ditahan',
    use: 'Mengukur bagian laba yang tidak dibagikan sebagai dividen dan dipertahankan perusahaan.',
    formula: 'Retention Ratio = 1 - Dividend Payout Ratio',
    notes: 'Untuk rasio dalam persen, Retention % = 100% - DPR %.',
    related: ['Corporate Finance'], tags: 'laba ditahan retention',
    inputs: [I.p('dpr', 'Dividend payout ratio (DPR)', 50, { unit: '%' })],
    calc: function (v) {
      var r = 1 - v.dpr;
      return { head: { label: 'Retention ratio', value: r, kind: 'pct' }, rows: [], steps: ['Retention = 1 - ' + f.p(v.dpr) + ' = ' + f.p(r)] };
    }
  });

  H.ratio({
    id: 'earnings-yield', cat: C, also: ['investment'], abbr: 'EY', name: 'Earnings Yield', idn: 'Imbal Hasil Laba',
    use: 'Mengukur laba per saham relatif terhadap harga saham.',
    formula: 'Earnings Yield = (EPS / Share Price) x 100%',
    notes: 'Secara sederhana merupakan kebalikan P/E jika EPS positif.',
    related: ['Investment Analysis'], tags: 'earnings yield',
    num: { label: 'EPS', def: 380 }, den: { label: 'Harga saham', def: 3800 }, kind: 'pct'
  });

  H.ratio({
    id: 'fcf-yield', cat: C, also: ['investment', 'fsa'], abbr: 'FCFY', name: 'Free Cash Flow Yield', idn: 'Imbal Hasil Arus Kas Bebas',
    use: 'Membandingkan arus kas bebas perusahaan dengan kapitalisasi pasar.',
    formula: 'FCF Yield = (Free Cash Flow / Market Capitalization) x 100%',
    notes: 'Pastikan definisi FCF dan basis market cap konsisten.',
    related: ['Investment Analysis', 'Financial Statement Analysis'], tags: 'fcf yield',
    num: { label: 'Free cash flow', def: 2400000000000 }, den: { label: 'Kapitalisasi pasar', def: 38000000000000 }, kind: 'pct'
  });
})();
