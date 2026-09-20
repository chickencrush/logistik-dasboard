/**
 * CHICKEN CRUSH LOGISTIK - API DASHBOARD V2
 * Sumber data : Spreadsheet LAPORAN BULANAN LOGISTIK
 * Mode        : Read-only API (tidak mengubah data spreadsheet)
 * Cocok untuk : GitHub Pages / PWA dashboard
 */

const CONFIG = {
  TIMEZONE: 'Asia/Jakarta',
  CACHE_SECONDS: 20,

  SHEET_PRODUKSI: 'Produksi',
  SHEET_PEMAKAIAN: 'Data Penjualan',
  SHEET_HARGA: 'Harga',

  OUTLET_SHEETS: ['CV. LIMA DUA', 'CC UII', 'CC GODEAN'],

  // Ini mempertahankan label estimasi yang sudah dipakai dashboard lama.
  // Data estimasi tersebut tidak tersedia sebagai tabel SLA khusus di workbook.
  ESTIMASI_WILAYAH: {
    'CC Medan': '7 - 12 Hari',
    'CC Padang': '7 - 12 Hari',
    'CC Kalimantan': '5 - 8 Hari',
    'CC Banten': '3 - 5 Hari',
    'CC Cilacap': '2 - 3 Hari',
    'CC Pangkal Pinang': '6 - 9 Hari',
    'CC Mataram': '5 - 7 Hari',
    'CC Serpong': '2 - 4 Hari',
    'CC Kudus': '2 - 3 Hari',
    'CC Semarang': '1 - 2 Hari',
    'CC Madiun': '2 - 3 Hari',
    'CC Solear': '3 - 5 Hari',
    'CC Tobelo': '10 - 14 Hari',
    'CC Cepu': '2 - 3 Hari'
  }
};

const BULAN_INDEX = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12
};

/**
 * Endpoint utama.
 * Contoh:
 *   .../exec
 *   .../exec?refresh=1
 *   .../exec?section=wilayah
 *   .../exec?section=persediaan
 *   .../exec?action=ping
 */
function doGet(e) {
  try {
    e = e || { parameter: {} };
    var p = e.parameter || {};
    var action = String(p.action || 'dashboard').toLowerCase();

    if (action === 'ping') {
      return jsonOutput_({
        status: 'success',
        message: 'Chicken Crush Logistik API V2 aktif',
        timestamp: nowIso_()
      }, p.callback);
    }

    if (action !== 'dashboard') {
      return jsonOutput_({
        status: 'error',
        message: 'Action tidak dikenali: ' + action,
        timestamp: nowIso_()
      }, p.callback);
    }

    var refresh = String(p.refresh || '') === '1';
    var section = String(p.section || '').trim().toLowerCase();
    var data = getDashboardData_(refresh);

    if (section) {
      data = filterSection_(data, section);
    }

    return jsonOutput_(data, p.callback);
  } catch (err) {
    return jsonOutput_({
      status: 'error',
      message: err && err.message ? err.message : String(err),
      timestamp: nowIso_()
    }, p.callback);
  }
}

/**
 * Menghasilkan seluruh data dashboard dalam satu response.
 */
function getDashboardData_(forceRefresh) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'cc_logistik_dashboard_v2';

  if (!forceRefresh) {
    try {
      var cached = cache.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (ignore) {}
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var po = getPoData_(ss);
  var persediaan = getPersediaan_(ss);
  var pemakaian = getPemakaian_(ss);
  var harga = getHarga_(ss);
  var produksi = getProduksi_(ss);
  var outlet = getOutletData_(ss);

  var totalProduksiKg = produksi.reduce(function(sum, x) {
    return sum + number_(x.beratKg);
  }, 0);

  var totalProduksiBox = produksi.reduce(function(sum, x) {
    return sum + number_(x.box);
  }, 0);

  var latestPersediaan = persediaan.length ? persediaan[persediaan.length - 1] : null;

  var result = {
    status: 'success',
    version: '2.0',
    timestamp: nowIso_(),
    spreadsheet: ss.getName(),

    overview: {
      totalOrder: po.totalOrder,
      totalTonase: round2_(po.totalTonase),
      totalInvoice: round2_(po.totalInvoice),
      totalProduksiKg: round2_(totalProduksiKg),
      totalProduksiBox: round2_(totalProduksiBox),
      persediaanTerakhir: latestPersediaan
    },

    // Format utama yang kompatibel dengan dashboard lama
    wilayah: po.wilayah,
    persediaan: persediaan,
    pemakaian: pemakaian,
    harga: harga,

    // Data tambahan V2
    produksi: produksi,
    outlet: outlet,
    poBulanan: po.bulanan,
    poDetail: po.detail,

    meta: {
      poSheets: po.sheets,
      stockSheets: getMonthlyStockSheetNames_(ss),
      outletSheets: CONFIG.OUTLET_SHEETS.filter(function(name) {
        return !!ss.getSheetByName(name);
      }),
      cacheSeconds: CONFIG.CACHE_SECONDS
    }
  };

  try {
    var json = JSON.stringify(result);
    // CacheService punya batas ukuran item; jika terlalu besar, API tetap jalan tanpa cache.
    if (json.length < 95000) {
      cache.put(cacheKey, json, CONFIG.CACHE_SECONDS);
    }
  } catch (ignore2) {}

  return result;
}

/**
 * =========================
 * PO MITRA / WILAYAH
 * =========================
 */
function getPoData_(ss) {
  var sheets = findPoSheets_(ss);
  var detail = [];
  var monthlyMap = {};

  sheets.forEach(function(sheet) {
    var values = readSheet_(sheet, 150, 12);
    var header = findHeaderRow_(values, ['NAMA MITRA', 'TONAGE']);
    if (header < 0) return;

    var h = values[header];
    var idxOrder = findCol_(h, ['TGL ORDER']);
    var idxMitra = findCol_(h, ['NAMA MITRA']);
    var idxPt = findCol_(h, ['PT']);
    var idxEstimasi = findCol_(h, ['TGL ESTIMASI KIRIM']);
    var idxKirim = findCol_(h, ['TGL KIRIM']);
    var idxTonase = findColContains_(h, ['TONAGE', 'TONASE']);
    var idxInvoice = findColContains_(h, ['NOMINAL INVOICE']);
    var idxBayar = findColContains_(h, ['NOMINAL BAYAR']);
    var idxSelisih = findColContains_(h, ['SELISIH']);

    var monthLabel = getPoMonthLabel_(values, sheet.getName());
    if (!monthlyMap[monthLabel]) {
      monthlyMap[monthLabel] = { bulan: monthLabel, orders: 0, tonase: 0, invoice: 0 };
    }

    for (var r = header + 1; r < values.length; r++) {
      var row = values[r];
      var mitra = clean_(row[idxMitra]);
      var firstText = clean_(row[idxOrder]);

      if (firstText.toUpperCase() === 'TOTAL') continue;
      if (!mitra) continue;
      if (/TOTAL|OMSET/i.test(mitra)) continue;

      var tonase = number_(row[idxTonase]);
      var invoice = number_(row[idxInvoice]);
      var wilayah = normalizeWilayah_(mitra);
      if (!wilayah) continue;

      var tglOrder = dateIso_(row[idxOrder]);
      var tglEstimasi = dateIso_(row[idxEstimasi]);
      var tglKirim = dateIso_(row[idxKirim]);

      var estimasiDate = toDate_(row[idxEstimasi]);
      var kirimDate = toDate_(row[idxKirim]);
      var orderDate = toDate_(row[idxOrder]);

      var hariOrderKeKirim = daysBetween_(orderDate, kirimDate);
      var tepatWaktu = null;
      if (estimasiDate && kirimDate) tepatWaktu = kirimDate.getTime() <= estimasiDate.getTime();

      detail.push({
        sheet: sheet.getName(),
        bulan: monthLabel,
        mitra: mitra,
        wilayah: wilayah,
        pt: clean_(row[idxPt]),
        tglOrder: tglOrder,
        tglEstimasiKirim: tglEstimasi,
        tglKirim: tglKirim,
        tonase: round2_(tonase),
        invoice: round2_(invoice),
        bayar: round2_(number_(row[idxBayar])),
        selisih: round2_(number_(row[idxSelisih])),
        hariOrderKeKirim: hariOrderKeKirim,
        tepatWaktu: tepatWaktu
      });

      monthlyMap[monthLabel].orders += 1;
      monthlyMap[monthLabel].tonase += tonase;
      monthlyMap[monthLabel].invoice += invoice;
    }
  });

  var wilayahMap = {};
  detail.forEach(function(item) {
    if (!wilayahMap[item.wilayah]) {
      wilayahMap[item.wilayah] = {
        name: item.wilayah,
        orders: 0,
        tonase: 0,
        invoice: 0,
        estimasi: CONFIG.ESTIMASI_WILAYAH[item.wilayah] || '-',
        totalHariKirim: 0,
        countHariKirim: 0,
        tepatWaktu: 0,
        terlambat: 0
      };
    }

    var w = wilayahMap[item.wilayah];
    w.orders += 1;
    w.tonase += number_(item.tonase);
    w.invoice += number_(item.invoice);

    if (item.hariOrderKeKirim !== null) {
      w.totalHariKirim += item.hariOrderKeKirim;
      w.countHariKirim += 1;
    }
    if (item.tepatWaktu === true) w.tepatWaktu += 1;
    if (item.tepatWaktu === false) w.terlambat += 1;
  });

  var wilayah = Object.keys(wilayahMap).map(function(key) {
    var w = wilayahMap[key];
    return {
      name: w.name,
      orders: w.orders,
      tonase: round2_(w.tonase),
      invoice: round2_(w.invoice),
      estimasi: w.estimasi,
      avgHariKirim: w.countHariKirim ? round2_(w.totalHariKirim / w.countHariKirim) : null,
      tepatWaktu: w.tepatWaktu,
      terlambat: w.terlambat
    };
  });

  wilayah.sort(function(a, b) { return b.tonase - a.tonase; });

  var bulanan = Object.keys(monthlyMap).map(function(key) {
    var m = monthlyMap[key];
    return {
      bulan: m.bulan,
      orders: m.orders,
      tonase: round2_(m.tonase),
      invoice: round2_(m.invoice),
      value: round2_(m.invoice)
    };
  });
  bulanan.sort(sortMonthLabel_);

  return {
    sheets: sheets.map(function(s) { return s.getName(); }),
    totalOrder: detail.length,
    totalTonase: detail.reduce(function(s, x) { return s + number_(x.tonase); }, 0),
    totalInvoice: detail.reduce(function(s, x) { return s + number_(x.invoice); }, 0),
    wilayah: wilayah,
    bulanan: bulanan,
    detail: detail
  };
}

function findPoSheets_(ss) {
  return ss.getSheets().filter(function(sheet) {
    var values = readSheet_(sheet, 15, 12);
    return findHeaderRow_(values, ['NAMA MITRA', 'TONAGE']) >= 0 ||
           findHeaderRow_(values, ['NAMA MITRA', 'TONASE']) >= 0;
  });
}

function normalizeWilayah_(name) {
  var n = clean_(name).toUpperCase();
  if (!n) return '';

  if (n.indexOf('PANGKAL PINANG') >= 0) return 'CC Pangkal Pinang';
  if (n.indexOf('KALIMANTAN') >= 0) return 'CC Kalimantan';
  if (n.indexOf('PADANG') >= 0) return 'CC Padang';
  if (n.indexOf('MEDAN') >= 0) return 'CC Medan';
  if (n.indexOf('BANTEN') >= 0) return 'CC Banten';
  if (n.indexOf('CILACAP') >= 0) return 'CC Cilacap';
  if (n.indexOf('SERPONG') >= 0) return 'CC Serpong';
  if (n.indexOf('KUDUS') >= 0) return 'CC Kudus';
  if (n.indexOf('SEMARANG') >= 0) return 'CC Semarang';
  if (n.indexOf('MADIUN') >= 0) return 'CC Madiun';
  if (n.indexOf('TOBELO') >= 0) return 'CC Tobelo';
  if (n.indexOf('SOLEAR') >= 0) return 'CC Solear';
  if (n.indexOf('MATARAM') >= 0) return 'CC Mataram';
  if (n.indexOf('CEPU') >= 0) return 'CC Cepu';

  n = n.replace(/^CC\s+/, '').replace(/^ST\s+/, '').trim();
  return n ? 'CC ' + titleCase_(n) : '';
}

/**
 * =========================
 * PERSEDIAAN TEPUNG BULANAN
 * =========================
 */
function getPersediaan_(ss) {
  var sheetNames = getMonthlyStockSheetNames_(ss);
  var result = [];

  sheetNames.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    var summary = parseStockSheet_(sheet);

    // Dashboard lama menggunakan OUT Tepung Putih sebagai "Tepung Jadi"
    // dan OUT Tepung Merah sebagai "Tepung Merah".
    var putih = findBlock_(summary.blocks, function(b) {
      return /TEPUNG PUTIH/i.test(b.name) && !/REPACK/i.test(b.name);
    });
    var merah = findBlock_(summary.blocks, function(b) {
      return /TEPUNG MERAH/i.test(b.name) && !/REPACK/i.test(b.name);
    });

    var tepungJadi = putih ? number_(putih.out) : 0;
    var tepungMerah = merah ? number_(merah.out) : 0;

    result.push({
      bulan: monthNameFromSheet_(sheetName),
      tepung_jadi: round2_(tepungJadi),
      tepung_merah: round2_(tepungMerah),
      total_out: round2_(tepungJadi + tepungMerah),
      detail: summary.blocks
    });
  });

  return result;
}

function getMonthlyStockSheetNames_(ss) {
  var names = ss.getSheets().map(function(s) { return s.getName(); });
  var found = names.filter(function(name) {
    return /^(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+20\d{2}\s*$/i.test(name);
  });
  found.sort(sortSheetMonth_);
  return found;
}

function parseStockSheet_(sheet) {
  var values = readSheet_(sheet, 60, Math.min(sheet.getLastColumn(), 50));
  if (!values.length) return { sheet: sheet.getName(), blocks: [] };

  var titleRow = values.length > 1 ? values[1] : [];
  var starts = [];

  for (var c = 0; c < titleRow.length; c++) {
    var text = clean_(titleRow[c]);
    if (/TEPUNG/i.test(text)) starts.push({ col: c, name: text });
  }

  var blocks = [];
  for (var i = 0; i < starts.length; i++) {
    var start = starts[i].col;
    var end = i + 1 < starts.length ? starts[i + 1].col - 1 : titleRow.length - 1;
    var headerRow = -1;

    for (var r = 0; r < Math.min(values.length, 12); r++) {
      var first = upper_(values[r][start]);
      if (first === 'TGL') {
        headerRow = r;
        break;
      }
    }
    if (headerRow < 0) continue;

    var idxIn = -1;
    var idxOut = -1;
    var idxStock = -1;
    var idxFisik = -1;
    var idxSelisih = -1;

    for (var cc = start; cc <= end && cc < values[headerRow].length; cc++) {
      var h = upper_(values[headerRow][cc]);
      if (idxIn < 0 && /^IN($|\s|\()/i.test(h)) idxIn = cc;
      if (idxOut < 0 && /OUT/i.test(h)) idxOut = cc;
      if (idxStock < 0 && /STOCK/i.test(h)) idxStock = cc;
      if (idxFisik < 0 && /FISIK/i.test(h)) idxFisik = cc;
      if (idxSelisih < 0 && /SELISIH/i.test(h)) idxSelisih = cc;
    }

    var totalIn = sumNumericColumn_(values, headerRow + 1, idxIn);
    var totalOut = sumNumericColumn_(values, headerRow + 1, idxOut);
    var stockAkhir = lastNumericColumn_(values, headerRow + 1, idxStock);
    var fisikAkhir = lastNumericColumn_(values, headerRow + 1, idxFisik);
    var selisihAkhir = lastNumericColumn_(values, headerRow + 1, idxSelisih);

    blocks.push({
      name: starts[i].name,
      in: round2_(totalIn),
      out: round2_(totalOut),
      stock: stockAkhir === null ? null : round2_(stockAkhir),
      fisik: fisikAkhir === null ? null : round2_(fisikAkhir),
      selisih: selisihAkhir === null ? null : round2_(selisihAkhir)
    });
  }

  return { sheet: sheet.getName(), blocks: blocks };
}

/**
 * =========================
 * PEMAKAIAN BARANG
 * =========================
 */
function getPemakaian_(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_PEMAKAIAN);
  if (!sheet) return [];

  var values = readSheet_(sheet, 120, Math.min(sheet.getLastColumn(), 30));
  var header = findHeaderRow_(values, ['JENIS BARANG', 'APRIL']);
  if (header < 0) return [];

  var h = values[header];
  var idxNo = findCol_(h, ['NO']);
  var idxName = findCol_(h, ['JENIS BARANG']);
  var idxApr = findCol_(h, ['APRIL']);
  var idxMei = findCol_(h, ['MEI']);
  var idxJun = findCol_(h, ['JUNI']);
  var idxJul = findCol_(h, ['JULI']);
  var idxAgs = findCol_(h, ['AGUSTUS2']);
  if (idxAgs < 0) idxAgs = findLastCol_(h, 'AGUSTUS');
  var idxAvg = findColContains_(h, ['APRIL-AGUSTUS', 'APRIL - AGUSTUS']);

  var out = [];
  for (var r = header + 1; r < values.length; r++) {
    var row = values[r];
    var name = clean_(row[idxName]);
    if (!name || /^KESIMPULAN$/i.test(name)) continue;
    if (!isFinite(number_(row[idxNo])) || number_(row[idxNo]) <= 0) continue;

    out.push({
      no: number_(row[idxNo]),
      name: name,
      unit: extractUnit_(name),
      apr: round2_(number_(row[idxApr])),
      mei: round2_(number_(row[idxMei])),
      jun: round2_(number_(row[idxJun])),
      jul: round2_(number_(row[idxJul])),
      ags: round2_(number_(row[idxAgs])),
      avg: round2_(number_(row[idxAvg]))
    });
  }
  return out;
}

/**
 * =========================
 * HARGA BAHAN BAKU
 * =========================
 */
function getHarga_(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_HARGA);
  if (!sheet) return [];

  var values = readSheet_(sheet, 250, Math.min(sheet.getLastColumn(), 40));
  var header = findHeaderRow_(values, ['NAMA BARANG', 'MEI']);
  if (header < 0) {
    // workbook saat ini: bulan berada di row 4, subheader Naik/Tetap di row 5
    header = findRowContaining_(values, 'NAMA BARANG');
  }
  if (header < 0) return [];

  var monthRow = values[header];
  var statusRow = values[header + 1] || [];
  var idxNo = findCol_(monthRow, ['NO']);
  var idxName = findCol_(monthRow, ['NAMA BARANG']);

  var monthPairs = buildPriceMonthPairs_(monthRow, statusRow);
  var wanted = ['mei', 'juni', 'juli', 'agustus', 'september'];

  var out = [];
  for (var r = header + 2; r < values.length; r++) {
    var row = values[r];
    var name = clean_(row[idxName]);
    var no = number_(row[idxNo]);
    if (!name || !no) continue;

    var item = { no: no, name: name };
    wanted.forEach(function(monthKey) {
      var pair = monthPairs[monthKey];
      var result = { p: 0, st: '-' };

      if (pair) {
        for (var i = 0; i < pair.cols.length; i++) {
          var c = pair.cols[i];
          var raw = row[c];
          if (raw !== '' && raw !== null && raw !== undefined && isFinite(number_(raw)) && number_(raw) !== 0) {
            result.p = round2_(number_(raw));
            result.st = clean_(statusRow[c]) || '-';
            break;
          }
        }
      }

      var shortKey = monthKey === 'juni' ? 'jun' :
                     monthKey === 'juli' ? 'jul' :
                     monthKey === 'agustus' ? 'ags' :
                     monthKey === 'september' ? 'sep' : monthKey;
      item[shortKey] = result;
    });

    out.push(item);
  }

  return out;
}

function buildPriceMonthPairs_(monthRow, statusRow) {
  var map = {};
  var current = null;

  for (var c = 0; c < monthRow.length; c++) {
    var m = normalizeMonth_(monthRow[c]);
    if (m) current = m;

    var status = upper_(statusRow[c]);
    if (current && (status === 'NAIK' || status === 'TETAP' || status === 'TURUN')) {
      if (!map[current]) map[current] = { cols: [] };
      map[current].cols.push(c);
    }
  }
  return map;
}

/**
 * =========================
 * PRODUKSI
 * =========================
 */
function getProduksi_(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_PRODUKSI);
  if (!sheet) return [];

  var values = readSheet_(sheet, 120, Math.min(sheet.getLastColumn(), 20));
  var header = findHeaderRow_(values, ['BULAN', 'TEPUNG OLAHAN']);
  if (header < 0) return [];

  var h = values[header];
  var idxNo = findCol_(h, ['NO']);
  var idxBulan = findCol_(h, ['BULAN']);
  var idxBox = findColContains_(h, ['TEPUNG OLAHAN']);
  var idxBerat = findColContains_(h, ['BERAT TEPUNG']);
  var idxKgOrang = findColContains_(h, ['PRODUKTIVITAS PER ORANG (KG/ORANG)']);
  var idxKgJam = findColContains_(h, ['PRODUKTIVITAS PER ORANG (KG/JAM)']);
  var idxBoxOrang = findColContains_(h, ['PRODUKTIVITAS PER ORANG (BOX/ORANG)']);
  var idxKategori = findCol_(h, ['KATEGORI']);

  var out = [];
  for (var r = header + 1; r < values.length; r++) {
    var row = values[r];
    var bulan = clean_(row[idxBulan]);
    if (!bulan || !number_(row[idxNo])) continue;

    out.push({
      no: number_(row[idxNo]),
      bulan: bulan,
      box: round2_(number_(row[idxBox])),
      beratKg: round2_(number_(row[idxBerat])),
      produktivitasKgOrang: numberFromText_(row[idxKgOrang]),
      produktivitasKgJam: numberFromText_(row[idxKgJam]),
      produktivitasBoxOrang: numberFromText_(row[idxBoxOrang]),
      kategori: clean_(row[idxKategori])
    });
  }
  return out;
}

/**
 * =========================
 * OUTLET / STOCK INTERNAL
 * =========================
 */
function getOutletData_(ss) {
  var out = [];
  CONFIG.OUTLET_SHEETS.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) return;

    var parsed = parseStockSheet_(sheet);
    out.push({
      name: name,
      stock: parsed.blocks
    });
  });
  return out;
}

/**
 * =========================
 * FILTER RESPONSE
 * =========================
 */
function filterSection_(data, section) {
  var allowed = {
    overview: true,
    wilayah: true,
    persediaan: true,
    pemakaian: true,
    harga: true,
    produksi: true,
    outlet: true,
    pobulanan: true,
    podetail: true,
    meta: true
  };

  if (!allowed[section]) {
    return {
      status: 'error',
      message: 'Section tidak dikenali: ' + section,
      timestamp: nowIso_()
    };
  }

  var realKey = section === 'pobulanan' ? 'poBulanan' :
                section === 'podetail' ? 'poDetail' : section;

  var obj = {
    status: 'success',
    version: data.version,
    timestamp: data.timestamp
  };
  obj[realKey] = data[realKey];
  return obj;
}

/**
 * =========================
 * HELPER
 * =========================
 */
function readSheet_(sheet, maxRows, maxCols) {
  if (!sheet) return [];
  var rows = Math.min(Math.max(sheet.getLastRow(), 1), maxRows || sheet.getLastRow());
  var cols = Math.min(Math.max(sheet.getLastColumn(), 1), maxCols || sheet.getLastColumn());
  return sheet.getRange(1, 1, rows, cols).getValues();
}

function findHeaderRow_(values, required) {
  for (var r = 0; r < values.length; r++) {
    var rowText = values[r].map(function(x) { return upper_(x); }).join(' | ');
    var ok = required.every(function(req) {
      return rowText.indexOf(String(req).toUpperCase()) >= 0;
    });
    if (ok) return r;
  }
  return -1;
}

function findRowContaining_(values, text) {
  var target = String(text).toUpperCase();
  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < values[r].length; c++) {
      if (upper_(values[r][c]).indexOf(target) >= 0) return r;
    }
  }
  return -1;
}

function findCol_(row, candidates) {
  if (!row) return -1;
  for (var c = 0; c < row.length; c++) {
    var text = upper_(row[c]);
    for (var i = 0; i < candidates.length; i++) {
      if (text === String(candidates[i]).toUpperCase()) return c;
    }
  }
  return -1;
}

function findLastCol_(row, candidate) {
  var found = -1;
  var target = String(candidate).toUpperCase();
  for (var c = 0; c < row.length; c++) {
    if (upper_(row[c]) === target) found = c;
  }
  return found;
}

function findColContains_(row, candidates) {
  if (!row) return -1;
  for (var c = 0; c < row.length; c++) {
    var text = upper_(row[c]);
    for (var i = 0; i < candidates.length; i++) {
      if (text.indexOf(String(candidates[i]).toUpperCase()) >= 0) return c;
    }
  }
  return -1;
}

function sumNumericColumn_(values, startRow, col) {
  if (col < 0) return 0;
  var sum = 0;
  for (var r = startRow; r < values.length; r++) {
    var v = values[r][col];
    if (typeof v === 'number' && isFinite(v)) sum += v;
  }
  return sum;
}

function lastNumericColumn_(values, startRow, col) {
  if (col < 0) return null;
  var last = null;
  for (var r = startRow; r < values.length; r++) {
    var v = values[r][col];
    if (typeof v === 'number' && isFinite(v)) last = v;
  }
  return last;
}

function findBlock_(blocks, predicate) {
  for (var i = 0; i < blocks.length; i++) {
    if (predicate(blocks[i])) return blocks[i];
  }
  return null;
}

function getPoMonthLabel_(values, fallback) {
  for (var r = 0; r < Math.min(values.length, 6); r++) {
    for (var c = 0; c < values[r].length; c++) {
      var s = clean_(values[r][c]);
      var match = s.match(/(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)\s+(20\d{2})/i);
      if (match) return titleCase_(match[1]) + ' ' + match[2];
    }
  }
  return clean_(fallback);
}

function monthNameFromSheet_(sheetName) {
  var match = clean_(sheetName).match(/^([A-Za-z]+)\s+(20\d{2})$/);
  return match ? titleCase_(match[1]) : clean_(sheetName);
}

function sortSheetMonth_(a, b) {
  var pa = parseMonthYear_(a);
  var pb = parseMonthYear_(b);
  return pa.key - pb.key;
}

function sortMonthLabel_(a, b) {
  var pa = parseMonthYear_(a.bulan);
  var pb = parseMonthYear_(b.bulan);
  return pa.key - pb.key;
}

function parseMonthYear_(text) {
  var s = clean_(text).toLowerCase();
  var yearMatch = s.match(/20\d{2}/);
  var year = yearMatch ? Number(yearMatch[0]) : 0;
  var month = 0;
  Object.keys(BULAN_INDEX).some(function(name) {
    if (s.indexOf(name) >= 0) {
      month = BULAN_INDEX[name];
      return true;
    }
    return false;
  });
  return { year: year, month: month, key: year * 100 + month };
}

function normalizeMonth_(value) {
  var s = clean_(value).toLowerCase();
  if (BULAN_INDEX[s]) return s;
  return '';
}

function extractUnit_(name) {
  var matches = clean_(name).match(/\(([^)]+)\)/g);
  if (!matches || !matches.length) return '';
  return matches[matches.length - 1].replace(/[()]/g, '').trim();
}

function numberFromText_(value) {
  if (typeof value === 'number') return round2_(value);
  var s = clean_(value).replace(/,/g, '.');
  var m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? round2_(Number(m[0])) : 0;
}

function number_(value) {
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === '') return 0;

  var s = String(value).trim();
  if (!s || /#REF!|#ERROR!|#N\/A|#VALUE!/i.test(s)) return 0;

  // Apps Script getValues biasanya sudah memberikan angka asli.
  // Bagian ini hanya fallback untuk string angka.
  var n = Number(s.replace(/\s/g, '').replace(/,/g, '.'));
  return isFinite(n) ? n : 0;
}

function round2_(n) {
  n = number_(n);
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function clean_(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function upper_(value) {
  return clean_(value).toUpperCase();
}

function titleCase_(text) {
  return clean_(text).toLowerCase().replace(/\b\w/g, function(ch) { return ch.toUpperCase(); });
}

function toDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) return value;
  return null;
}

function dateIso_(value) {
  var d = toDate_(value);
  if (!d) return '';
  return Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function daysBetween_(a, b) {
  if (!a || !b) return null;
  var oneDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / oneDay);
}

function nowIso_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function jsonOutput_(obj, callback) {
  var json = JSON.stringify(obj);
  var cb = clean_(callback);

  // JSONP fallback diperlukan untuk dashboard GitHub Pages
  // bila browser memblokir fetch lintas domain ke Apps Script.
  if (cb && /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/.test(cb)) {
    return ContentService
      .createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
