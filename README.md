# Hitung.in v2.0.0

Kalkulator rumus keuangan dan ekonomi dalam satu web app. Mencakup 180 rumus dari 12 kategori pada *Finance & Economics Formula Library*. Setiap hasil menampilkan nilai utama, rincian, langkah hitung, catatan asumsi, dan grafik atau tabel bila relevan.

Semua perhitungan berjalan di browser. Tidak ada server, akun, atau pelacak.

## Yang baru di v2.0.0

Tampilan ditulis ulang total dengan arah desain **Warm Ledger**: hangat, rapi, dan profesional. Mesin hitung dan 180 rumus tidak diubah, jadi hasilnya sama dengan v1.0.0.

- Palet krem gading, emerald tua, dan amber-tembaga. Kartu putih hangat dengan bayangan lembut dan sudut membulat.
- Tipografi Google Fonts: Fraunces (judul dan angka hasil), Inter (antarmuka), JetBrains Mono (angka dan tabel).
- Tema **Otomatis (bawaan, ikut sistem)**, **Terang**, dan **Gelap**. Pilihan diingat di browser. Mode gelap bernuansa espresso hangat.
- Beranda dengan hero, rumus populer, contoh hasil langsung, dan 12 kategori berikon dengan warna tipis berbeda.
- Halaman kalkulator dua kolom: input di kiri, hasil menempel di kanan. Kartu hasil utama, langkah hitung bernomor, grafik dengan area dan palet baru, serta tabel dengan header menempel.
- Riwayat bergaya linimasa dengan tombol "Buka lagi" dan hapus per catatan.
- Pintasan keyboard: tekan `/` atau `Ctrl+K` untuk mencari rumus.
- Di HP, menu kategori tampil sebagai lembar dari bawah.
- Skeleton loading saat halaman dimuat, plus pesan jelas jika ada berkas skrip yang gagal dimuat.
- Kontras teks memenuhi WCAG AA, fokus keyboard jelas, dan mendukung reduced motion.

Favorit, riwayat, mata uang, dan tema dari v1.0.0 tetap terbaca karena kunci penyimpanan tidak berubah.

## Cara menjalankan

Buka `hitung.html` di browser. Untuk hosting, unggah seluruh folder ke GitHub Pages, Netlify, atau server statis apa pun. Tidak ada proses build. Jika hosting meminta halaman utama bernama `index.html`, ganti nama `hitung.html` menjadi `index.html`.

Font dimuat dari Google Fonts. Tanpa internet, tampilan memakai font bawaan sistem dan tetap berfungsi penuh.

Menjalankan tes (butuh Node.js, tanpa paket tambahan):

```
node tests/run.js
```

## Jika halaman kosong setelah di-upload

Pastikan seluruh isi folder ikut terunggah dengan struktur yang sama, terutama `js/data/` (13 berkas). Nama berkas peka huruf besar-kecil di GitHub Pages. Setelah mengunggah ulang, muat ulang keras (hapus cache) karena browser bisa menyimpan berkas lama. Tes cepat: buka `alamat-situs/js/data/_core.js` di browser; jika muncul 404, berkas itu belum terunggah. Aplikasi akan menampilkan pesan beserta nama berkas yang gagal dimuat.

## Kategori

01 Personal Finance, 02 Banking & Credit, 03 Corporate Finance, 04 Business & Operations, 05 Financial Statement Analysis, 06 Stock & Fundamental Analysis, 07 Investment & Portfolio Management, 08 Trading & Risk Management, 09 Accounting, 10 Microeconomics, 11 Macroeconomics, 12 Financial Statistics.

Rumus yang relevan di beberapa kategori (misalnya COGS atau Variance) didefinisikan sekali dan muncul di tiap kategori terkait.

## Fitur

- Hasil langsung berubah saat angka diketik, lengkap dengan pesan untuk input kosong atau tidak valid.
- Pencarian rumus lewat singkatan, nama Inggris, istilah Indonesia, dan kata kunci.
- Grafik SVG (batang, garis, donat, sebar) buatan sendiri, tanpa pustaka luar.
- Tabel jadwal (amortisasi, penyusutan) dan langkah hitung yang bisa dibuka.
- Favorit dan riwayat perhitungan, tersimpan di browser (bisa dimatikan atau dihapus).
- Mata uang tampilan: IDR, USD, EUR, SGD, JPY. Ini hanya format dan simbol, tidak ada konversi kurs.
- Tema otomatis, terang, atau gelap.
- Tata letak responsif dari 320px sampai desktop.

## Cara mengisi angka

- Persen diketik sebagai angka biasa. Ketik `8` untuk 8%.
- Format Indonesia diterima: `1.500.000` atau `1500000`, desimal dengan koma atau titik (`2,5`).
- Daftar data dipisah spasi, titik koma, atau baris baru. Input berpasangan satu pasang per baris.

## Struktur

```
hitung.html              halaman utama
favicon.svg              logo
css/hitung-tokens.css    warna, font, radius, bayangan, tema terang dan gelap
css/hitung.css           gaya semua komponen dan halaman
js/hitung-icons.js       set ikon SVG dan hue kategori
js/format.js             parsing dan format angka, mata uang
js/engine.js             fungsi matematika (FV, PV, PMT, IRR, XIRR, statistik, dst.)
js/storage.js            localStorage dengan cadangan di memori
js/data/_core.js         registri rumus, kategori, validasi, pencarian
js/data/*.js             satu file per kategori
js/charts.js             grafik SVG
js/ui.js                 rute, tampilan, kalkulator, tema
tests/run.js             uji Node
```

## Mengubah tampilan

Semua warna ada di `css/hitung-tokens.css`. Ubah `--brand` dan `--accent` (juga versi gelapnya) untuk mengganti palet. Hue ikon tiap kategori ada di `Hitung.catHue` pada `js/hitung-icons.js`.

## Menambah rumus

Tambahkan di file kategori yang sesuai di `js/data/`:

```js
H.def({
  id: 'contoh', cat: 'business', also: [], abbr: 'EX', name: 'Example', idn: 'Contoh',
  use: 'Fungsi singkat rumus.', formula: 'EX = A / B', notes: 'Asumsi dan batasan.',
  related: [], tags: 'kata kunci pencarian',
  inputs: [I.m('a', 'Nilai A', 1000), I.m('b', 'Nilai B', 4, { gt: 0 })],
  calc: function (v) {
    var r = v.a / v.b;
    return { head: { label: 'EX', value: r, kind: 'money' }, rows: [], steps: ['EX = A / B = ' + f.m(r)] };
  }
});
```

Rasio sederhana a / b bisa memakai `H.ratio({...})`. Jalankan `node tests/run.js` untuk memastikan rumus baru berjalan pada contoh bawaannya.

## Asumsi dan batasan

- Hasil bergantung pada input dan asumsi. Rasio bernama mirip belum tentu setara, cek definisinya.
- Rumus model sederhana (pengganda uang, pengganda pengeluaran) memberi batas teoritis, bukan prediksi.
- Return historis dan statistik tidak menjamin hasil masa depan.
- Alat bantu belajar dan estimasi. Bukan nasihat keuangan, hukum, atau pajak.
- Jika penyimpanan browser diblokir (mode privat tertentu), riwayat dan favorit hanya bertahan selama halaman terbuka.

## Lisensi

Pakai dan ubah sesuai kebutuhan pribadi.
