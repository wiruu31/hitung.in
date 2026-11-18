/* Uji Node: setiap rumus berjalan pada contoh bawaan, ID unik, tiap kategori terisi, beberapa nilai diperiksa manual. */
global.window = global;
global.localStorage = undefined;
var path = require('path'), root = path.join(__dirname, '..');
['format', 'engine', 'storage', 'data/core', 'data/personal', 'data/banking', 'data/corporate', 'data/business', 'data/fsa', 'data/stock', 'data/investment', 'data/trading', 'data/accounting', 'data/micro', 'data/macro', 'data/stats', 'charts']
  .forEach(function (f) { require(path.join(root, 'js', f + '.js')); });
var H = window.Hitung, fails = 0, pass = 0;
function ok(c, m) { if (c) pass++; else { fails++; console.log('GAGAL: ' + m); } }

ok(H.formulas.length >= 170, 'jumlah rumus ' + H.formulas.length);
H.categories.forEach(function (c) { ok(H.inCat(c.id).length >= 5, 'kategori kosong: ' + c.id); });
H.formulas.forEach(function (f) {
  var r = H.run(f, H.defaults(f));
  ok(r.ok, f.id + ' gagal pada contoh bawaan: ' + (r.error || ''));
  if (r.ok) {
    var out = JSON.stringify(r.res);
    ok(!/NaN|undefined|Infinity/.test(out.replace(/"note":null/g, '')), f.id + ' mengandung NaN/undefined: ' + out.match(/.{20}(NaN|undefined|Infinity).{20}/));
    if (r.res.chart) ok(H.chartHTML(r.res.chart).indexOf('<svg') >= 0, f.id + ' grafik tidak tergambar');
  }
  ok(f.formula && f.name && f.idn && f.use, f.id + ' metadata kurang');
  ok(!/\u2014/.test(JSON.stringify(f.inputs) + f.name + f.use + (f.notes || '') + f.formula), f.id + ' ada em dash');
  // input kosong tidak boleh melempar error
  var blank = {}; f.inputs.forEach(function (x) { blank[x.k] = ''; });
  var rb = H.run(f, blank);
  ok(rb.ok === false || f.inputs.every(function (x) { return x.optional || x.type === 'select'; }), f.id + ' input kosong lolos');
});

function head(id, raw) { var f = H.byId[id]; var r = H.run(f, Object.assign(H.defaults(f), raw || {})); return r.ok ? r.res.head.value : r; }
function near(a, b, m, t) { ok(typeof a === 'number' && Math.abs(a - b) <= (t || 1e-6) * Math.max(1, Math.abs(b)), m + ': dapat ' + JSON.stringify(a) + ' harap ' + b); }

near(head('simple-interest', { p: '1000000', r: '5', t: '2' }), 1100000, 'nilai akhir bunga sederhana');
near(head('current-ratio', { n: '300', d: '150' }), 2, 'current ratio');
near(head('gdp'), 12000000000000 + 5000000000000 + 2500000000000 + 300000000000, 'GDP');
near(head('real-interest', { i: '10', pi: '5' }), 1.1 / 1.05 - 1, 'bunga riil');
near(head('money-mult', { rr: '10' }), 10, 'pengganda uang');
near(head('spending-mult', { mpc: '0.8' }), 5, 'pengganda belanja');
near(head('unemployment', { u: '5', lf: '100' }), 0.05, 'pengangguran');
near(head('mean', { x: '2 4 6' }), 4, 'mean');
near(head('weighted-avg', { wx: '1 10\n3 20' }), 17.5, 'rata tertimbang');
near(head('zscore', { x: '82', mu: '70', sd: '8' }), 1.5, 'z-score');
near(head('pct-change', { old: '100', new: '125' }), 0.25, 'persen perubahan');
near(head('qtm', { solve: 'p', m: '8000', v: '2', y: '16000' }), 1, 'QTM');
var pm = H.run(H.byId['pmt'], { pv: '100000000', rate: '12', yrs: '1', freq: '12' });
ok(pm.ok, 'pmt jalan'); if (pm.ok) near(pm.res.head.value, 8884878.867834, 'cicilan 100jt 12% 1 tahun', 1e-6);
console.log(pass + ' lulus, ' + fails + ' gagal, ' + H.formulas.length + ' rumus');
process.exit(fails ? 1 : 0);
