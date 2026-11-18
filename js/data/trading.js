/* Kategori 8: Trading & Risk Management */
(function () {
  'use strict';
  var H = window.Hitung, E = H.E, I = H.I, o = H.o, f = H.f;
  var C = 'trading';

  H.def({
    id: 'risk-per-trade', cat: C, also: ['personal', 'investment'], abbr: 'RISK', name: 'Risk per Trade', idn: 'Risiko per Transaksi',
    use: 'Menghitung nominal modal yang dirisikokan pada satu transaksi.',
    formula: 'Risk Amount = Account Equity x Risk Percentage',
    notes: 'Di kolom persen cukup ketik 1 untuk 1% (aplikasi mengonversinya ke 0,01). Ini nilai risiko rencana, bukan jaminan kerugian maksimum saat gap atau slippage.',
    related: ['Personal Finance', 'Portfolio Management'], tags: 'risiko transaksi modal',
    inputs: [I.m('eq', 'Ekuitas akun', 100000000, { gt: 0 }), I.p('rp', 'Risiko per transaksi', 1, { unit: '%', gt: 0, max: 100 })],
    calc: function (v) {
      var r = v.eq * v.rp;
      return { head: { label: 'Nominal risiko', value: r, kind: 'money' }, rows: [o.n('Risiko dalam desimal', v.rp)],
        steps: ['Risk Amount = ' + f.m(v.eq) + ' x ' + f.n(v.rp) + ' = ' + f.m(r)],
        note: v.rp > 0.02 ? 'Risiko di atas 2% per transaksi tergolong agresif menurut banyak pedoman manajemen risiko.' : 'Nilai ini adalah risiko rencana. Gap harga dan slippage bisa membuat kerugian nyata lebih besar.' };
    }
  });

  H.def({
    id: 'position-size', cat: C, also: ['personal', 'investment'], abbr: 'SIZE', name: 'Position Sizing', idn: 'Penentuan Ukuran Posisi',
    use: 'Menghitung volume atau jumlah unit berdasarkan nominal risiko dan jarak stop loss.',
    formula: 'Position Size = Risk Amount / (Stop-Loss Distance x Value per Point per Unit)',
    notes: 'Value per point harus sesuai instrumen, ukuran kontrak, mata uang akun, dan spesifikasi broker atau exchange. Untuk saham atau crypto spot biasanya 1 per unit.',
    related: ['Forex', 'Crypto', 'Risk Management'], tags: 'ukuran posisi lot volume stop loss',
    inputs: [I.m('eq', 'Ekuitas akun', 100000000, { gt: 0 }), I.p('rp', 'Risiko per transaksi', 1, { unit: '%', gt: 0, max: 100 }), I.m('en', 'Harga masuk', 3800, { gt: 0 }), I.m('sl', 'Harga stop loss', 3650, { gt: 0 }),
      I.n('vp', 'Nilai per poin per unit', 1, { gt: 0, hint: 'Saham dan crypto spot: 1. Futures atau CFD: lihat spesifikasi kontrak.' })],
    calc: function (v) {
      var dist = Math.abs(v.en - v.sl);
      E.need(dist > 0, 'Harga masuk dan stop loss tidak boleh sama.');
      var risk = v.eq * v.rp, size = risk / (dist * v.vp), notional = size * v.en;
      return { head: { label: 'Ukuran posisi (unit)', value: size, kind: 'unit', unit: 'unit' },
        rows: [o.m('Nominal risiko', risk), o.n('Jarak stop loss', dist), o.m('Nilai posisi (notional)', notional), o.x('Leverage efektif', notional / v.eq), o.p('Jarak stop terhadap harga masuk', dist / v.en)],
        steps: ['Risk Amount = ' + f.m(v.eq) + ' x ' + f.p(v.rp) + ' = ' + f.m(risk), 'Jarak stop = |' + f.m(v.en) + ' - ' + f.m(v.sl) + '| = ' + f.n(dist), 'Size = ' + f.m(risk) + ' / (' + f.n(dist) + ' x ' + f.n(v.vp) + ') = ' + f.n(size) + ' unit'],
        note: 'Pembulatan ke bawah ke lot atau unit minimum broker disarankan agar risiko tidak melebihi rencana. Slippage dan gap tidak dihitung.' };
    }
  });

  H.def({
    id: 'risk-reward', cat: C, also: ['investment'], abbr: 'R:R', name: 'Risk-to-Reward Ratio', idn: 'Rasio Risiko terhadap Imbal Hasil',
    use: 'Membandingkan potensi reward dengan potensi risiko suatu transaksi.',
    formula: 'Reward-to-Risk = Potential Reward / Potential Risk',
    notes: 'Contoh 2 berarti potensi reward dua kali potensi risiko. Sebagian platform menulis urutannya sebagai risk:reward, jadi label di sini ditulis jelas.',
    related: ['Investment & Portfolio Management'], tags: 'risk reward rasio target stop',
    inputs: [I.m('en', 'Harga masuk', 3800, { gt: 0 }), I.m('sl', 'Harga stop loss', 3650, { gt: 0 }), I.m('tp', 'Harga target (take profit)', 4150, { gt: 0 })],
    calc: function (v) {
      var long = v.sl < v.en;
      E.need(v.sl !== v.en, 'Harga masuk dan stop loss tidak boleh sama.');
      E.need(long ? v.tp > v.en : v.tp < v.en, long ? 'Untuk posisi beli, target harus di atas harga masuk.' : 'Untuk posisi jual, target harus di bawah harga masuk.');
      var risk = Math.abs(v.en - v.sl), reward = Math.abs(v.tp - v.en), rr = reward / risk;
      return { head: { label: 'Reward-to-risk', value: rr, kind: 'x' }, rows: [o.t('Arah posisi', long ? 'Beli (long)' : 'Jual (short)'), o.n('Potensi risiko (poin)', risk), o.n('Potensi reward (poin)', reward), o.t('Penulisan risk:reward', '1 : ' + f.n(rr)), o.p('Win rate impas (sebelum biaya)', 1 / (1 + rr))],
        steps: ['Risiko = |' + f.m(v.en) + ' - ' + f.m(v.sl) + '| = ' + f.n(risk), 'Reward = |' + f.m(v.tp) + ' - ' + f.m(v.en) + '| = ' + f.n(reward), 'Reward-to-Risk = ' + f.n(reward) + ' / ' + f.n(risk) + ' = ' + f.x(rr)],
        chart: { type: 'bar', title: 'Risiko dan reward (poin)', fmt: 'num', bars: [{ label: 'Risiko', value: risk }, { label: 'Reward', value: reward }] } };
    }
  });

  H.def({
    id: 'leverage-ratio', cat: C, also: ['banking', 'corporate'], abbr: 'LEV', name: 'Leverage Ratio', idn: 'Rasio Leverage Transaksi',
    use: 'Mengukur total nilai posisi dibandingkan ekuitas akun.',
    formula: 'Leverage = Total Position Notional Value / Account Equity',
    notes: 'Gunakan nilai notional dalam mata uang akun. Leverage memperbesar eksposur dan dampak pergerakan harga.',
    related: ['Banking & Credit', 'Corporate Finance'], tags: 'leverage eksposur notional',
    inputs: [I.m('nv', 'Total nilai posisi (notional)', 400000000, { min: 0 }), I.m('eq', 'Ekuitas akun', 100000000, { gt: 0 })],
    calc: function (v) {
      var l = v.nv / v.eq;
      return { head: { label: 'Leverage', value: l, kind: 'x' }, rows: [o.p('Perubahan harga yang menghapus ekuitas (kira-kira)', 1 / l, 'sebelum biaya dan margin call')],
        steps: ['Leverage = ' + f.m(v.nv) + ' / ' + f.m(v.eq) + ' = ' + f.x(l)],
        note: 'Pada leverage ' + f.x(l, 1) + ', pergerakan harga sekitar ' + f.p(1 / l) + ' melawan posisi setara dengan seluruh ekuitas akun.' };
    }
  });

  H.def({
    id: 'margin-req', cat: C, also: ['banking'], abbr: 'MARGIN', name: 'Margin Requirement', idn: 'Kebutuhan Margin',
    use: 'Mengestimasi modal jaminan yang diperlukan untuk membuka posisi.',
    formula: 'Required Margin = Position Notional Value / Leverage',
    notes: 'Perhitungan aktual dapat dipengaruhi tier margin, maintenance margin, fee, dan aturan broker atau exchange.',
    related: ['Banking & Credit'], tags: 'margin jaminan leverage',
    inputs: [I.m('nv', 'Nilai posisi (notional)', 400000000, { gt: 0 }), I.n('lev', 'Leverage', 10, { gt: 0 })],
    calc: function (v) {
      var m = v.nv / v.lev;
      return { head: { label: 'Margin yang dibutuhkan', value: m, kind: 'money' }, rows: [o.p('Margin terhadap nilai posisi', 1 / v.lev)], steps: ['Required Margin = ' + f.m(v.nv) + ' / ' + f.n(v.lev) + ' = ' + f.m(m)],
        note: 'Ini margin awal sederhana. Tier, maintenance margin, dan biaya mengikuti aturan broker.' };
    }
  });

  H.def({
    id: 'pip-value', cat: C, also: ['personal', 'investment'], abbr: 'PIP', name: 'Pip Value', idn: 'Nilai Pip',
    use: 'Menghitung nilai uang dari pergerakan satu pip pada posisi forex.',
    formula: 'Pip Value (quote currency) = Position Size in Base Units x Pip Size',
    notes: 'Pip size umumnya 0,0001 untuk kebanyakan pasangan dan 0,01 untuk pasangan JPY. Konversikan dari mata uang kuotasi ke mata uang akun bila berbeda. Untuk CFD atau futures, gunakan contract specification.',
    related: ['Personal Finance', 'Investment'], tags: 'pip forex lot',
    inputs: [I.n('units', 'Ukuran posisi (unit mata uang dasar)', 100000, { gt: 0, hint: '1 lot standar = 100.000 unit.' }),
      I.s('ps', 'Ukuran pip', [['0.0001', '0,0001 (kebanyakan pasangan)'], ['0.01', '0,01 (pasangan JPY)']], '0.0001'),
      I.n('rate', 'Kurs konversi mata uang kuotasi ke mata uang akun', 1, { gt: 0, hint: 'Isi 1 bila mata uang kuotasi sama dengan mata uang akun.' })],
    calc: function (v) {
      var ps = Number(v.ps), q = v.units * ps, acc = q * v.rate;
      return { head: { label: 'Nilai per pip (mata uang akun)', value: acc, kind: 'num' }, rows: [o.n('Nilai per pip (mata uang kuotasi)', q), o.n('Lot standar setara', v.units / 100000)],
        steps: ['Pip value (kuotasi) = ' + f.n(v.units) + ' x ' + ps + ' = ' + f.n(q), 'Dalam mata uang akun = ' + f.n(q) + ' x ' + f.n(v.rate) + ' = ' + f.n(acc)],
        note: 'Hasil dalam satuan mata uang akun, bukan otomatis rupiah. Untuk CFD atau futures pakai spesifikasi kontrak broker.' };
    }
  });

  H.def({
    id: 'be-winrate', cat: C, also: ['investment'], abbr: 'BEWR', name: 'Break-Even Win Rate', idn: 'Tingkat Kemenangan Impas',
    use: 'Menghitung win rate minimum untuk menutup kerugian rata-rata, sebelum biaya transaksi.',
    formula: 'BE Win Rate = Average Loss / (Average Win + Average Loss) x 100%\nFor fixed R:R: BE Win Rate = 1 / (1 + Reward-to-Risk) x 100%',
    notes: 'Average Loss ditulis sebagai nilai positif. Spread, komisi, funding, dan slippage menaikkan win rate impas yang sebenarnya.',
    related: ['Investment & Portfolio Management'], tags: 'win rate impas break even',
    inputs: [I.s('mode', 'Dasar hitung', [['avg', 'Dari rata-rata menang dan kalah'], ['rr', 'Dari reward-to-risk tetap']], 'avg'),
      I.m('aw', 'Rata-rata menang (Average Win)', 600000, { gt: 0, showIf: function (r) { return r.mode !== 'rr'; } }), I.m('al', 'Rata-rata kalah (Average Loss, positif)', 300000, { gt: 0, showIf: function (r) { return r.mode !== 'rr'; } }),
      I.n('rr', 'Reward-to-risk', 2, { gt: 0, showIf: function (r) { return r.mode === 'rr'; } })],
    calc: function (v) {
      var be = v.mode === 'rr' ? 1 / (1 + v.rr) : v.al / (v.aw + v.al);
      return { head: { label: 'Win rate impas', value: be, kind: 'pct' }, rows: [o.p('Loss rate impas', 1 - be)],
        steps: [v.mode === 'rr' ? 'BE = 1 / (1 + ' + f.n(v.rr) + ') = ' + f.p(be, 3) : 'BE = ' + f.m(v.al) + ' / (' + f.m(v.aw) + ' + ' + f.m(v.al) + ') = ' + f.p(be, 3)],
        note: 'Sebelum biaya transaksi. Win rate di bawah angka ini rugi dalam jangka panjang, di atasnya belum tentu untung setelah biaya.' };
    }
  });

  H.def({
    id: 'expectancy', cat: C, also: ['investment'], abbr: 'EXP', name: 'Trading Expectancy', idn: 'Ekspektasi Hasil per Transaksi',
    use: 'Mengukur rata-rata hasil yang diharapkan dari satu transaksi berdasarkan win rate dan rata-rata profit atau loss.',
    formula: 'Expectancy = (Win Rate x Average Win) - (Loss Rate x Average Loss)',
    notes: 'Di kolom persen cukup ketik 45 untuk 45% (dikonversi ke desimal). Untuk expectancy bersih, kurangi biaya transaksi rata-rata.',
    related: ['Investment & Portfolio Management'], tags: 'expectancy ekspektasi trading edge',
    inputs: [I.p('wr', 'Win rate', 45, { unit: '%', min: 0, max: 100 }), I.m('aw', 'Rata-rata menang (Average Win)', 600000, { min: 0 }), I.m('al', 'Rata-rata kalah (Average Loss, positif)', 300000, { min: 0 }), I.m('cost', 'Biaya per transaksi (opsional)', '', { optional: true, min: 0 })],
    calc: function (v) {
      var lr = 1 - v.wr, ex = v.wr * v.aw - lr * v.al, net = ex - (v.cost || 0);
      return { head: { label: v.cost ? 'Expectancy bersih' : 'Expectancy per transaksi', value: net, kind: 'money' }, rows: [o.p('Loss rate', lr), o.m('Expectancy sebelum biaya', ex), o.x('Expectancy per satuan risiko (R)', v.al ? net / v.al : NaN, 'dalam kelipatan rata-rata kalah')],
        steps: ['Expectancy = (' + f.n(v.wr) + ' x ' + f.m(v.aw) + ') - (' + f.n(lr) + ' x ' + f.m(v.al) + ') = ' + f.m(ex), v.cost ? 'Dikurangi biaya ' + f.m(v.cost) + ' = ' + f.m(net) : 'Tidak ada biaya yang dikurangkan.'],
        note: net > 0 ? 'Expectancy positif pada data ini, tetapi tidak menjamin hasil masa depan.' : 'Expectancy nol atau negatif: strategi tidak menghasilkan keuntungan rata-rata pada data ini.' };
    }
  });

  H.def({
    id: 'profit-factor', cat: C, also: ['investment'], abbr: 'PF', name: 'Profit Factor', idn: 'Faktor Profitabilitas',
    use: 'Membandingkan total keuntungan kotor dengan total kerugian kotor.',
    formula: 'Profit Factor = Gross Profit / Absolute(Gross Loss)',
    notes: 'Di atas 1 berarti gross profit lebih besar daripada gross loss pada sampel tersebut; bukan jaminan hasil masa depan.',
    related: ['Investment & Portfolio Management'], tags: 'profit factor trading',
    inputs: [I.m('gp', 'Gross profit (total semua transaksi menang)', 18000000, { min: 0 }), I.m('gl', 'Gross loss (total semua transaksi kalah, boleh negatif)', -12000000)],
    calc: function (v) {
      var gl = Math.abs(v.gl);
      E.need(gl > 0, 'Gross loss bernilai nol, profit factor tidak terdefinisi.');
      var pf = v.gp / gl;
      return { head: { label: 'Profit factor', value: pf, kind: 'x' }, rows: [o.m('Net profit', v.gp - gl)], steps: ['Profit Factor = ' + f.m(v.gp) + ' / |' + f.m(v.gl) + '| = ' + f.x(pf)],
        note: pf > 1 ? 'Di atas 1 pada sampel ini; bukan jaminan hasil masa depan.' : 'Di bawah atau sama dengan 1: kerugian kotor sama atau lebih besar dari keuntungan kotor.',
        chart: { type: 'bar', title: 'Gross profit dan gross loss', fmt: 'money', bars: [{ label: 'Gross profit', value: v.gp }, { label: 'Gross loss', value: -gl }] } };
    }
  });

  H.def({
    id: 'avg-win-loss', cat: C, also: ['investment'], abbr: 'AW/AL', name: 'Average Win and Average Loss', idn: 'Rata-rata Menang dan Kalah',
    use: 'Menghitung rata-rata nilai transaksi yang menang dan yang kalah.',
    formula: 'Average Win = Gross Winning Profit / Number of Winning Trades\nAverage Loss = Absolute(Gross Losing Amount) / Number of Losing Trades',
    notes: 'Gunakan data transaksi dengan periode dan perlakuan biaya yang sama.',
    related: ['Investment & Portfolio Management'], tags: 'rata rata menang kalah trading',
    inputs: [I.m('gp', 'Total profit transaksi menang', 18000000, { min: 0 }), I.i('nw', 'Jumlah transaksi menang', 30, { min: 1 }), I.m('gl', 'Total kerugian transaksi kalah (boleh negatif)', -12000000), I.i('nl', 'Jumlah transaksi kalah', 40, { min: 1 })],
    calc: function (v) {
      var aw = v.gp / v.nw, al = Math.abs(v.gl) / v.nl, n = v.nw + v.nl;
      return { head: { label: 'Rata-rata menang', value: aw, kind: 'money' }, rows: [o.m('Rata-rata kalah', al), o.x('Rasio rata-rata menang / kalah', al ? aw / al : NaN), o.p('Win rate', v.nw / n), o.n('Total transaksi', n)],
        steps: ['Average Win = ' + f.m(v.gp) + ' / ' + v.nw + ' = ' + f.m(aw), 'Average Loss = |' + f.m(v.gl) + '| / ' + v.nl + ' = ' + f.m(al)],
        chart: { type: 'bar', title: 'Rata-rata menang dan kalah', fmt: 'money', bars: [{ label: 'Rata-rata menang', value: aw }, { label: 'Rata-rata kalah', value: -al }] } };
    }
  });
})();
