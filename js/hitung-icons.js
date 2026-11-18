/* Hitung.in v2.0.0: set ikon garis SVG (24x24, stroke 1.75). Dipakai lewat Hitung.icon(nama, ukuran). */
(function () {
  'use strict';
  var H = (window.Hitung = window.Hitung || {});

  var P = {
    /* kategori */
    personal: '<path d="M3 7a2 2 0 0 1 2-2h12v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-1"/><circle cx="16.5" cy="13.5" r="1"/>',
    banking: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3 21h18"/>',
    corporate: '<rect x="5" y="3" width="10" height="18" rx="1"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M9 7h2M9 11h2M9 15h2M3 21h18"/>',
    business: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
    fsa: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 17v-3M12 17v-6M15 17v-4"/>',
    stock: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    investment: '<path d="M12 3v9h9"/><path d="M20.5 15A9 9 0 1 1 9 3.5"/>',
    trading: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    accounting: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2"/>',
    micro: '<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8l-3 7a3 3 0 0 0 6 0zM19 8l-3 7a3 3 0 0 0 6 0z"/>',
    macro: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    stats: '<path d="M4 20V10M10 20V4M16 20v-8M3 21h18"/>',

    /* antarmuka */
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    auto: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/>'
  };

  H.icon = function (name, size, cls) {
    var d = P[name];
    if (!d) return '';
    var s = size || 20;
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + '</svg>';
  };

  /* Hue per kategori: dipakai sebagai --h pada kartu, ikon, dan penanda daftar. */
  H.catHue = {
    personal: 155, banking: 205, corporate: 232, business: 28, fsa: 272, stock: 345,
    investment: 172, trading: 8, accounting: 46, micro: 96, macro: 190, stats: 300
  };

  H.markSVG = function (size) {
    var s = size || 36;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="9" fill="currentColor" class="mk-bg"/><rect x="8" y="10.5" width="16" height="3.2" rx="1.6" fill="#fff"/><rect x="8" y="17.5" width="16" height="3.2" rx="1.6" fill="#fff"/><circle cx="24.5" cy="24" r="2.4" fill="#e9a557"/></svg>';
  };
})();
