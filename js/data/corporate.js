/* Kategori 3: Corporate Finance */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'corporate';
  var LHINT = 'Pisahkan dengan spasi, titik koma, atau baris baru. Gunakan tanda minus untuk arus kas keluar.';

  function cumulativeDiscounted(i0, cfs, r) {
    var out = [-i0], cum = -i0;
    cfs.forEach(function (c, t) { cum += c / Math.pow(1 + r, t + 1); out.push(cum); });
    return out;
  }

  H.def({
    id: 'npv', cat: C, abbr: 'NPV', name: 'Net Present Value', idn: 'Nilai Sekarang Bersih',
    use: 'Menilai nilai tambah proyek dengan mendiskontokan arus kas masa depan lalu mengurangkan investasi awal.',
    formula: 'NPV = SUM[t=1..n] CF_t / (1+r)^t - I_0',
    notes: 'NPV positif berarti proyek menghasilkan nilai tambah pada discount rate yang digunakan. CF_t adalah arus kas periode t; I_0 adalah investasi awal.',
    related: ['Investment Analysis', 'Business Valuation'], tags: 'kelayakan proyek diskonto investasi',
    inputs: [I.m('i0', 'Investasi awal (I_0)', 100000000, { gt: 0 }), I.p('r', 'Discount rate per periode (r)', 10, { unit: '% / periode' }),
      I.l('cfs', 'Arus kas periode 1 sampai n (CF_t)', '30000000 40000000 50000000 40000000', { hint: LHINT, minLen: 1 })],
    calc: function (v) {
      var npv = E.npvFrom(v.r, v.i0, v.cfs);
      var pvIn = npv + v.i0;
      var cum = cumulativeDiscounted(v.i0, v.cfs, v.r);
      var steps = v.cfs.slice(0, 12).map(function (c, t) { return 'CF_' + (t + 1) + ' = ' + f.m(c) + ' / (1 + ' + f.p(v.r) + ')^' + (t + 1) + ' = ' + f.m(c / Math.pow(1 + v.r, t + 1)); });
      if (v.cfs.length > 12) steps.push('... ' + (v.cfs.length - 12) + ' periode lain dihitung dengan cara yang sama');
      steps.push('NPV = ' + f.m(pvIn) + ' - ' + f.m(v.i0) + ' = ' + f.m(npv));
      return {
        head: { label: 'NPV', value: npv, kind: 'money' },
        rows: [o.m('Nilai sekarang arus kas masuk', pvIn), o.x('Profitability index', pvIn / v.i0), o.n('Jumlah periode', v.cfs.length)],
        steps: steps,
        note: npv > 0 ? 'NPV positif: pada discount rate ini proyek menghasilkan nilai tambah.' : (npv < 0 ? 'NPV negatif: pada discount rate ini proyek tidak menutup biaya modalnya.' : 'NPV nol: proyek persis impas pada discount rate ini.'),
        chart: { type: 'line', title: 'Arus kas terdiskonto kumulatif', fmt: 'money', xLabel: 'Periode', x: cum.map(function (_, i) { return i; }),
          series: [{ name: 'Kumulatif', values: cum }] }
      };
    }
  });

  H.def({
    id: 'irr', cat: C, abbr: 'IRR', name: 'Internal Rate of Return', idn: 'Tingkat Pengembalian Internal',
    use: 'Mencari tingkat diskonto yang membuat NPV sama dengan nol.',
    formula: '0 = SUM[t=0..n] CF_t / (1+IRR)^t',
    notes: 'Biasanya dihitung secara numerik. Arus kas yang berubah tanda beberapa kali dapat menghasilkan lebih dari satu IRR atau interpretasi yang tidak stabil.',
    related: ['Investment Analysis'], tags: 'tingkat pengembalian internal',
    inputs: [I.l('cfs', 'Arus kas periode 0 sampai n (CF_t)', '-100000000 30000000 40000000 50000000 40000000', { hint: 'Periode 0 ditulis pertama dan biasanya negatif. ' + LHINT, minLen: 2 })],
    calc: function (v) {
      var roots = E.irr(v.cfs);
      E.need(roots.length > 0, 'IRR tidak ditemukan pada rentang -99% sampai 10.000%.');
      var irr = roots[0];
      var xs = [], ys = [];
      var top = Math.max(0.3, Math.min(Math.abs(irr) * 2, 3));
      for (var i = 0; i <= 30; i++) { var rr = -0.05 + (top + 0.05) * i / 30; xs.push(Math.round(rr * 1000) / 10); ys.push(E.npvCF(rr, v.cfs)); }
      return {
        head: { label: 'IRR', value: irr, kind: 'pct' },
        rows: [o.m('Cek: NPV pada IRR', E.npvCF(irr, v.cfs), 'harus mendekati nol'), o.n('Jumlah periode', v.cfs.length - 1)],
        steps: ['Cari r sehingga SUM CF_t / (1 + r)^t = 0 (metode numerik)', 'IRR = ' + f.p(irr, 4)],
        note: roots.length > 1 ? 'Ditemukan ' + roots.length + ' akar IRR (' + roots.slice(0, 4).map(function (r) { return f.p(r); }).join(', ') + '). Yang ditampilkan adalah yang paling dekat dengan nol, tafsirkan dengan hati-hati.' : undefined,
        chart: { type: 'line', title: 'NPV pada berbagai discount rate', fmt: 'money', xLabel: 'Discount rate (%)', x: xs, series: [{ name: 'NPV', values: ys }] }
      };
    }
  });

  H.def({
    id: 'mirr', cat: C, abbr: 'MIRR', name: 'Modified Internal Rate of Return', idn: 'Tingkat Pengembalian Internal Modifikasi',
    use: 'Menghitung tingkat pengembalian dengan tingkat pembiayaan dan reinvestasi yang ditentukan.',
    formula: 'MIRR = (FV of Positive CF / PV of Negative CF)^(1/n) - 1',
    notes: 'Masukkan finance rate untuk arus kas negatif dan reinvestment rate untuk arus kas positif.',
    related: ['Investment Analysis'], tags: 'irr modifikasi reinvestasi',
    inputs: [I.l('cfs', 'Arus kas periode 0 sampai n', '-100000000 30000000 40000000 50000000 40000000', { hint: LHINT, minLen: 2 }),
      I.p('fin', 'Finance rate (biaya dana)', 9, { unit: '%' }), I.p('reinv', 'Reinvestment rate', 11, { unit: '%' })],
    calc: function (v) {
      var m = E.mirr(v.cfs, v.fin, v.reinv), n = v.cfs.length - 1;
      var fvPos = 0, pvNeg = 0;
      v.cfs.forEach(function (c, t) { if (c > 0) fvPos += c * Math.pow(1 + v.reinv, n - t); else if (c < 0) pvNeg += c / Math.pow(1 + v.fin, t); });
      return {
        head: { label: 'MIRR', value: m, kind: 'pct' },
        rows: [o.m('FV arus kas positif', fvPos), o.m('PV arus kas negatif', pvNeg), o.n('Jumlah periode (n)', n)],
        steps: ['FV positif pada reinvestment rate = ' + f.m(fvPos), 'PV negatif pada finance rate = ' + f.m(pvNeg),
          'MIRR = (' + f.m(fvPos) + ' / ' + f.m(-pvNeg) + ')^(1/' + n + ') - 1 = ' + f.p(m, 4)]
      };
    }
  });

  H.def({
    id: 'wacc', cat: C, abbr: 'WACC', name: 'Weighted Average Cost of Capital', idn: 'Biaya Modal Rata-rata Tertimbang',
    use: 'Menghitung rata-rata biaya pendanaan perusahaan berdasarkan bobot ekuitas dan utang.',
    formula: 'WACC = (E/V) x K_e + (D/V) x K_d x (1 - T)',
    notes: 'V = E + D pada bentuk sederhana. Jika ada saham preferen, tambahkan bobot dan biayanya. T = tarif pajak marginal.',
    related: ['Investment Analysis', 'Business Valuation'], tags: 'biaya modal ekuitas utang',
    inputs: [I.m('e', 'Nilai pasar ekuitas (E)', 600000000, { min: 0 }), I.m('d', 'Nilai utang (D)', 400000000, { min: 0 }),
      I.p('ke', 'Biaya ekuitas (K_e)', 12, { unit: '%' }), I.p('kd', 'Biaya utang sebelum pajak (K_d)', 8, { unit: '%' }),
      I.p('t', 'Tarif pajak marginal (T)', 22, { unit: '%', min: 0, max: 100 }),
      I.m('pf', 'Nilai saham preferen (opsional)', '', { optional: true, min: 0 }), I.p('kp', 'Biaya saham preferen (opsional)', '', { optional: true, unit: '%' })],
    calc: function (v) {
      var pf = v.pf || 0, kp = v.kp || 0;
      var V = v.e + v.d + pf;
      E.need(V > 0, 'Total modal (E + D) harus lebih besar dari nol.');
      var we = v.e / V, wd = v.d / V, wp = pf / V;
      var w = we * v.ke + wd * v.kd * (1 - v.t) + wp * kp;
      var parts = [{ label: 'Ekuitas', value: v.e }, { label: 'Utang', value: v.d }];
      if (pf > 0) parts.push({ label: 'Saham preferen', value: pf });
      return {
        head: { label: 'WACC', value: w, kind: 'pct' },
        rows: [o.p('Bobot ekuitas (E/V)', we), o.p('Bobot utang (D/V)', wd), o.p('Biaya utang setelah pajak', v.kd * (1 - v.t)), o.m('Total modal (V)', V)],
        steps: ['V = ' + f.m(v.e) + ' + ' + f.m(v.d) + (pf ? ' + ' + f.m(pf) : '') + ' = ' + f.m(V),
          'WACC = ' + f.p(we) + ' x ' + f.p(v.ke) + ' + ' + f.p(wd) + ' x ' + f.p(v.kd) + ' x (1 - ' + f.p(v.t) + ')' + (pf ? ' + ' + f.p(wp) + ' x ' + f.p(kp) : ''),
          'WACC = ' + f.p(w, 4)],
        chart: { type: 'donut', title: 'Struktur modal', fmt: 'money', parts: parts }
      };
    }
  });

  H.def({
    id: 'capm', cat: C, abbr: 'CAPM', name: 'Capital Asset Pricing Model', idn: 'Model Penetapan Harga Aset Modal',
    use: 'Mengestimasi tingkat pengembalian yang disyaratkan berdasarkan risiko sistematis aset.',
    formula: 'K_e = R_f + beta x (R_m - R_f)',
    notes: 'R_f = risk-free rate; beta = beta aset; R_m = expected market return.',
    related: ['Stock Analysis', 'Investment & Portfolio Management'], also: ['stock', 'investment'], tags: 'beta risk free return disyaratkan',
    inputs: [I.p('rf', 'Risk-free rate (R_f)', 6.5, { unit: '%' }), I.n('beta', 'Beta aset', 1.2), I.p('rm', 'Expected market return (R_m)', 11, { unit: '%' })],
    calc: function (v) {
      var prem = v.rm - v.rf, ke = v.rf + v.beta * prem;
      return {
        head: { label: 'Return yang disyaratkan (K_e)', value: ke, kind: 'pct' },
        rows: [o.p('Premi risiko pasar (R_m - R_f)', prem), o.p('Premi risiko aset', v.beta * prem)],
        steps: ['K_e = ' + f.p(v.rf) + ' + ' + f.n(v.beta) + ' x (' + f.p(v.rm) + ' - ' + f.p(v.rf) + ')', 'K_e = ' + f.p(ke, 4)]
      };
    }
  });

  H.def({
    id: 'cost-of-debt', cat: C, abbr: 'Kd', name: 'Cost of Debt', idn: 'Biaya Utang',
    use: 'Menghitung biaya pendanaan yang berasal dari utang.',
    formula: 'Pre-tax K_d = Annual Interest Expense / Average Interest-bearing Debt\nAfter-tax K_d = Pre-tax K_d x (1 - T)',
    notes: 'Bentuk sederhana setelah pajak mengasumsikan bunga dapat mengurangi pajak dan perusahaan mampu memanfaatkan tax shield.',
    related: ['Financial Statement Analysis'], also: ['fsa'], tags: 'biaya utang bunga pajak tax shield',
    inputs: [I.m('int', 'Beban bunga tahunan', 32000000, { min: 0 }), I.m('d1', 'Utang berbunga awal periode', 380000000, { min: 0 }),
      I.m('d2', 'Utang berbunga akhir periode', 420000000, { min: 0 }), I.p('t', 'Tarif pajak (T)', 22, { unit: '%', min: 0, max: 100 })],
    calc: function (v) {
      var avg = (v.d1 + v.d2) / 2, pre = E.div(v.int, avg, 'Rata-rata utang berbunga bernilai nol.'), after = pre * (1 - v.t);
      return {
        head: { label: 'K_d setelah pajak', value: after, kind: 'pct' },
        rows: [o.p('K_d sebelum pajak', pre), o.m('Rata-rata utang berbunga', avg)],
        steps: ['Rata-rata utang = (' + f.m(v.d1) + ' + ' + f.m(v.d2) + ') / 2 = ' + f.m(avg), 'Pre-tax K_d = ' + f.m(v.int) + ' / ' + f.m(avg) + ' = ' + f.p(pre, 4),
          'After-tax K_d = ' + f.p(pre, 4) + ' x (1 - ' + f.p(v.t) + ') = ' + f.p(after, 4)]
      };
    }
  });

  H.def({
    id: 'cost-of-equity', cat: C, abbr: 'Ke', name: 'Cost of Equity', idn: 'Biaya Ekuitas',
    use: 'Mengestimasi tingkat pengembalian yang disyaratkan pemegang saham.',
    formula: 'CAPM: Cost of Equity = R_f + beta x (R_m - R_f)\nDividend growth: Cost of Equity = D_1 / P_0 + g',
    notes: 'Formula utama memakai CAPM. Model lain seperti dividend growth model dapat digunakan jika asumsi dan data mendukung.',
    related: ['Stock Analysis', 'Investment & Portfolio Management'], also: ['stock', 'investment'], tags: 'biaya ekuitas capm dividen',
    inputs: [I.s('mode', 'Metode', [['capm', 'CAPM'], ['ddm', 'Dividend growth model']], 'capm'),
      I.p('rf', 'Risk-free rate (R_f)', 6.5, { unit: '%', showIf: function (r) { return r.mode !== 'ddm'; } }),
      I.n('beta', 'Beta aset', 1.2, { showIf: function (r) { return r.mode !== 'ddm'; } }),
      I.p('rm', 'Expected market return (R_m)', 11, { unit: '%', showIf: function (r) { return r.mode !== 'ddm'; } }),
      I.m('d1', 'Dividen per saham tahun depan (D_1)', 150, { showIf: function (r) { return r.mode === 'ddm'; } }),
      I.m('p0', 'Harga saham saat ini (P_0)', 3000, { gt: 0, showIf: function (r) { return r.mode === 'ddm'; } }),
      I.p('g', 'Pertumbuhan dividen (g)', 5, { unit: '%', showIf: function (r) { return r.mode === 'ddm'; } })],
    calc: function (v) {
      if (v.mode === 'ddm') {
        var yld = v.d1 / v.p0, ke2 = yld + v.g;
        return { head: { label: 'Cost of equity', value: ke2, kind: 'pct' }, rows: [o.p('Dividend yield (D_1 / P_0)', yld)],
          steps: ['Ke = ' + f.m(v.d1) + ' / ' + f.m(v.p0) + ' + ' + f.p(v.g) + ' = ' + f.p(ke2, 4)] };
      }
      var ke = v.rf + v.beta * (v.rm - v.rf);
      return { head: { label: 'Cost of equity', value: ke, kind: 'pct' }, rows: [o.p('Premi risiko pasar', v.rm - v.rf)],
        steps: ['Ke = ' + f.p(v.rf) + ' + ' + f.n(v.beta) + ' x (' + f.p(v.rm) + ' - ' + f.p(v.rf) + ') = ' + f.p(ke, 4)] };
    }
  });

  H.def({
    id: 'pi', cat: C, abbr: 'PI', name: 'Profitability Index', idn: 'Indeks Profitabilitas',
    use: 'Membandingkan nilai sekarang arus kas masuk dengan investasi awal.',
    formula: 'PI = PV of Future Cash Inflows / Initial Investment',
    notes: 'Dalam proyek konvensional, PI > 1 sejalan dengan NPV positif.',
    related: ['Investment Analysis'], tags: 'indeks profitabilitas',
    inputs: [I.m('i0', 'Investasi awal', 100000000, { gt: 0 }), I.p('r', 'Discount rate per periode', 10, { unit: '%' }),
      I.l('cfs', 'Arus kas masuk periode 1 sampai n', '30000000 40000000 50000000 40000000', { hint: LHINT, minLen: 1 })],
    calc: function (v) {
      var pvIn = E.npvFrom(v.r, v.i0, v.cfs) + v.i0, pi = pvIn / v.i0;
      return {
        head: { label: 'PI', value: pi, kind: 'x' }, rows: [o.m('PV arus kas masuk', pvIn), o.m('NPV', pvIn - v.i0)],
        steps: ['PV arus kas masuk = ' + f.m(pvIn), 'PI = ' + f.m(pvIn) + ' / ' + f.m(v.i0) + ' = ' + f.x(pi, 3)],
        note: pi > 1 ? 'PI di atas 1, sejalan dengan NPV positif.' : 'PI tidak melebihi 1, sejalan dengan NPV nol atau negatif.'
      };
    }
  });

  function paybackCalc(v, disc) {
    var pb = disc ? E.discountedPayback(v.i0, v.cfs, v.r) : E.payback(v.i0, v.cfs);
    var label = disc ? 'Discounted payback' : 'Payback period';
    var cum = [-v.i0], c = -v.i0;
    v.cfs.forEach(function (x, t) { c += disc ? x / Math.pow(1 + v.r, t + 1) : x; cum.push(c); });
    var chart = { type: 'line', title: 'Arus kas kumulatif' + (disc ? ' terdiskonto' : ''), fmt: 'money', xLabel: 'Periode', x: cum.map(function (_, i) { return i; }), series: [{ name: 'Kumulatif', values: cum }] };
    if (pb === null) return { head: { label: label, value: 'Belum balik modal', kind: 'text' }, rows: [o.m('Sisa investasi belum kembali', -c)],
      steps: ['Arus kas kumulatif sampai periode ' + v.cfs.length + ' = ' + f.m(c)], note: 'Investasi belum tertutup dalam ' + v.cfs.length + ' periode yang dimasukkan.', chart: chart };
    var full = Math.floor(pb);
    return { head: { label: label, value: pb, kind: 'unit', unit: 'periode' }, rows: [o.n('Periode penuh sebelum kembali', full), o.p('Sisa pecahan periode', pb - full)],
      steps: ['Periode penuh sebelum modal kembali = ' + full, 'Payback = ' + full + ' + (sisa investasi / arus kas periode ' + (full + 1) + ') = ' + f.n(pb)],
      note: disc ? 'Mengabaikan arus kas setelah titik balik modal.' : 'Mengabaikan nilai waktu uang dan arus kas setelah titik balik modal.', chart: chart };
  }

  H.def({
    id: 'payback', cat: C, abbr: 'PB', name: 'Payback Period', idn: 'Periode Pengembalian Modal',
    use: 'Menghitung waktu yang diperlukan sampai arus kas kumulatif menutup investasi awal.',
    formula: 'Payback = Full Years Before Recovery + (Unrecovered Investment / Cash Flow in Recovery Year)',
    notes: 'Rumus ringkas ini untuk arus kas yang tidak sama. Untuk arus kas sama setiap periode, Payback = Initial Investment / Annual Cash Flow.',
    related: ['Investment Analysis'], tags: 'balik modal pengembalian',
    inputs: [I.m('i0', 'Investasi awal', 100000000, { gt: 0 }), I.l('cfs', 'Arus kas periode 1 sampai n', '30000000 40000000 50000000 40000000', { hint: LHINT, minLen: 1 })],
    calc: function (v) { return paybackCalc(v, false); }
  });

  H.def({
    id: 'discounted-payback', cat: C, abbr: 'DPB', name: 'Discounted Payback Period', idn: 'Periode Pengembalian Terdiskonto',
    use: 'Menghitung waktu balik modal berdasarkan arus kas yang sudah didiskontokan.',
    formula: 'Discounted CF_t = CF_t / (1+r)^t\nDiscounted Payback = waktu saat kumulatif Discounted CF menutup I_0',
    notes: 'Lebih memperhatikan nilai waktu uang daripada payback biasa, tetapi tetap mengabaikan arus kas setelah titik balik modal.',
    related: ['Investment Analysis'], tags: 'balik modal terdiskonto',
    inputs: [I.m('i0', 'Investasi awal', 100000000, { gt: 0 }), I.p('r', 'Discount rate per periode', 10, { unit: '%' }),
      I.l('cfs', 'Arus kas periode 1 sampai n', '30000000 40000000 50000000 40000000', { hint: LHINT, minLen: 1 })],
    calc: function (v) { return paybackCalc(v, true); }
  });

  H.def({
    id: 'dcf', cat: C, abbr: 'DCF', name: 'Discounted Cash Flow', idn: 'Arus Kas Terdiskonto',
    use: 'Mengestimasi nilai perusahaan atau aset dari nilai sekarang arus kas masa depan.',
    formula: 'Enterprise Value = SUM[t=1..n] FCFF_t/(1+WACC)^t + TV_n/(1+WACC)^n',
    notes: 'Untuk valuasi berbasis FCFE, diskontokan FCFE menggunakan cost of equity untuk memperoleh equity value. Nilai terminal di sini memakai Gordon Growth.',
    related: ['Business Valuation', 'Investment Analysis'], tags: 'valuasi arus kas terdiskonto fcff',
    inputs: [I.l('fcf', 'FCFF periode 1 sampai n', '40000000 46000000 52000000 58000000 64000000', { hint: LHINT, minLen: 1 }),
      I.p('w', 'Discount rate (WACC)', 10, { unit: '%' }), I.p('g', 'Pertumbuhan terminal (g)', 3, { unit: '%' }),
      I.m('nd', 'Utang bersih (opsional, untuk nilai ekuitas)', '', { optional: true }), I.n('sh', 'Jumlah saham (opsional, untuk nilai per saham)', '', { optional: true, gt: 0 })],
    calc: function (v) {
      E.need(v.w > v.g, 'WACC harus lebih besar dari g untuk nilai terminal Gordon Growth.');
      var n = v.fcf.length, pvs = v.fcf.map(function (c, t) { return c / Math.pow(1 + v.w, t + 1); });
      var sumPv = E.sum(pvs), tv = v.fcf[n - 1] * (1 + v.g) / (v.w - v.g), pvTv = tv / Math.pow(1 + v.w, n);
      var ev = sumPv + pvTv;
      var rows = [o.m('PV FCFF eksplisit', sumPv), o.m('Nilai terminal (TV_n)', tv), o.m('PV nilai terminal', pvTv), o.p('Porsi nilai terminal dalam EV', pvTv / ev)];
      var steps = ['PV FCFF periode 1 sampai ' + n + ' = ' + f.m(sumPv), 'TV_' + n + ' = ' + f.m(v.fcf[n - 1]) + ' x (1 + ' + f.p(v.g) + ') / (' + f.p(v.w) + ' - ' + f.p(v.g) + ') = ' + f.m(tv),
        'PV(TV) = ' + f.m(tv) + ' / (1 + ' + f.p(v.w) + ')^' + n + ' = ' + f.m(pvTv), 'EV = ' + f.m(sumPv) + ' + ' + f.m(pvTv) + ' = ' + f.m(ev)];
      if (v.nd !== undefined) { rows.push(o.m('Nilai ekuitas (EV - utang bersih)', ev - v.nd)); steps.push('Equity value = EV - utang bersih = ' + f.m(ev - v.nd)); }
      if (v.nd !== undefined && v.sh) rows.push(o.m('Nilai per saham', (ev - v.nd) / v.sh));
      var bars = pvs.map(function (p, t) { return { label: 'P' + (t + 1), value: p }; });
      bars.push({ label: 'TV', value: pvTv });
      return { head: { label: 'Enterprise value', value: ev, kind: 'money' }, rows: rows, steps: steps,
        chart: { type: 'bar', title: 'Nilai sekarang per komponen', fmt: 'money', bars: bars } };
    }
  });

  H.def({
    id: 'fcff', cat: C, abbr: 'FCFF', name: 'Free Cash Flow to Firm', idn: 'Arus Kas Bebas untuk Perusahaan',
    use: 'Menghitung kas yang tersedia bagi seluruh penyedia modal setelah kebutuhan operasi dan investasi.',
    formula: 'FCFF = EBIT(1-T) + D&A - CAPEX - delta NWC',
    notes: 'NOPAT = EBIT(1-T). Delta NWC adalah perubahan net working capital operasional.',
    related: ['Business Valuation', 'Financial Statement Analysis'], also: ['fsa'], tags: 'arus kas bebas perusahaan nopat',
    inputs: [I.m('ebit', 'EBIT', 150000000), I.p('t', 'Tarif pajak (T)', 22, { unit: '%', min: 0, max: 100 }), I.m('da', 'Depresiasi dan amortisasi (D&A)', 20000000),
      I.m('capex', 'Belanja modal (CAPEX)', 35000000), I.m('dnwc', 'Perubahan net working capital (delta NWC)', 8000000, { hint: 'Positif bila modal kerja bertambah.' })],
    calc: function (v) {
      var nopat = v.ebit * (1 - v.t), fcff = nopat + v.da - v.capex - v.dnwc;
      return { head: { label: 'FCFF', value: fcff, kind: 'money' }, rows: [o.m('NOPAT', nopat)],
        steps: ['NOPAT = ' + f.m(v.ebit) + ' x (1 - ' + f.p(v.t) + ') = ' + f.m(nopat), 'FCFF = ' + f.m(nopat) + ' + ' + f.m(v.da) + ' - ' + f.m(v.capex) + ' - ' + f.m(v.dnwc) + ' = ' + f.m(fcff)] };
    }
  });

  H.def({
    id: 'fcfe', cat: C, abbr: 'FCFE', name: 'Free Cash Flow to Equity', idn: 'Arus Kas Bebas untuk Pemegang Saham',
    use: 'Menghitung kas yang tersedia bagi pemegang saham setelah kebutuhan investasi dan pembiayaan utang.',
    formula: 'FCFE = Net Income + D&A - CAPEX - delta NWC + Net Borrowing',
    notes: 'Net Borrowing = utang baru dikurangi pembayaran pokok utang.',
    related: ['Business Valuation', 'Stock Analysis'], also: ['stock'], tags: 'arus kas bebas ekuitas pemegang saham',
    inputs: [I.m('ni', 'Laba bersih', 110000000), I.m('da', 'Depresiasi dan amortisasi (D&A)', 20000000), I.m('capex', 'Belanja modal (CAPEX)', 35000000),
      I.m('dnwc', 'Perubahan net working capital (delta NWC)', 8000000), I.m('nb', 'Utang baru', 40000000, { min: 0 }), I.m('rp', 'Pembayaran pokok utang', 25000000, { min: 0 })],
    calc: function (v) {
      var net = v.nb - v.rp, fcfe = v.ni + v.da - v.capex - v.dnwc + net;
      return { head: { label: 'FCFE', value: fcfe, kind: 'money' }, rows: [o.m('Net borrowing', net)],
        steps: ['Net Borrowing = ' + f.m(v.nb) + ' - ' + f.m(v.rp) + ' = ' + f.m(net), 'FCFE = ' + f.m(v.ni) + ' + ' + f.m(v.da) + ' - ' + f.m(v.capex) + ' - ' + f.m(v.dnwc) + ' + ' + f.m(net) + ' = ' + f.m(fcfe)] };
    }
  });

  H.def({
    id: 'terminal-value', cat: C, abbr: 'TV', name: 'Terminal Value', idn: 'Nilai Terminal',
    use: 'Mengestimasi nilai arus kas setelah periode proyeksi eksplisit dalam model DCF.',
    formula: 'TV_n = FCF_(n+1) / (Discount Rate - g)',
    notes: 'Gordon Growth Model mensyaratkan discount rate > g. Pastikan arus kas dan discount rate sejenis, misalnya FCFF dengan WACC.',
    related: ['Business Valuation'], tags: 'nilai terminal gordon',
    inputs: [I.m('fcf', 'Arus kas bebas tahun terakhir proyeksi (FCF_n)', 64000000), I.p('g', 'Pertumbuhan terminal (g)', 3, { unit: '%' }),
      I.p('r', 'Discount rate', 10, { unit: '%' }), I.i('n', 'Tahun proyeksi eksplisit (n)', 5, { min: 1 })],
    calc: function (v) {
      E.need(v.r > v.g, 'Discount rate harus lebih besar dari g.');
      var next = v.fcf * (1 + v.g), tv = next / (v.r - v.g), pv = tv / Math.pow(1 + v.r, v.n);
      return { head: { label: 'Nilai terminal (TV_n)', value: tv, kind: 'money' }, rows: [o.m('FCF_(n+1)', next), o.m('PV nilai terminal pada t = 0', pv)],
        steps: ['FCF_(n+1) = ' + f.m(v.fcf) + ' x (1 + ' + f.p(v.g) + ') = ' + f.m(next), 'TV_n = ' + f.m(next) + ' / (' + f.p(v.r) + ' - ' + f.p(v.g) + ') = ' + f.m(tv),
          'PV(TV) = ' + f.m(tv) + ' / (1 + ' + f.p(v.r) + ')^' + v.n + ' = ' + f.m(pv)] };
    }
  });

  H.def({
    id: 'eaa', cat: C, abbr: 'EAA', name: 'Equivalent Annual Annuity', idn: 'Anuitas Tahunan Ekuivalen',
    use: 'Mengubah NPV proyek menjadi nilai tahunan setara untuk membandingkan proyek dengan umur berbeda.',
    formula: 'EAA = NPV x [r / (1 - (1+r)^(-n))]',
    notes: 'Gunakan asumsi tingkat diskonto dan umur proyek yang konsisten.',
    related: ['Investment Analysis'], tags: 'anuitas tahunan ekuivalen umur proyek',
    inputs: [I.m('npv', 'NPV proyek', 35000000), I.p('r', 'Discount rate', 10, { unit: '%' }), I.i('n', 'Umur proyek (n)', 5, { min: 1 })],
    calc: function (v) {
      var factor = v.r === 0 ? 1 / v.n : v.r / (1 - Math.pow(1 + v.r, -v.n)), eaa = v.npv * factor;
      return { head: { label: 'EAA per periode', value: eaa, kind: 'money' }, rows: [o.n('Faktor anuitas', factor)],
        steps: ['Faktor = ' + f.p(v.r) + ' / (1 - (1 + ' + f.p(v.r) + ')^(-' + v.n + ')) = ' + f.n(factor), 'EAA = ' + f.m(v.npv) + ' x ' + f.n(factor) + ' = ' + f.m(eaa)] };
    }
  });
})();
