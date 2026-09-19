# Chicken Crush Logistik — Realtime PWA

## Konfigurasi API

Buka `index.html`, cari:

`const API_URL = localStorage.getItem('cc_logistik_api_url') || 'PASTE_APPS_SCRIPT_EXEC_URL_HERE';`

Ganti `PASTE_APPS_SCRIPT_EXEC_URL_HERE` dengan URL Web App Google Apps Script yang berakhiran `/exec`.

Contoh:
`https://script.google.com/macros/s/XXXXXXXX/exec`

Setelah itu upload seluruh isi folder ini ke root repository GitHub Pages.

Dashboard akan:
- mengambil data dari Google Spreadsheet melalui Code.gs V2
- menampilkan KPI realtime
- menampilkan PO per wilayah
- menampilkan persediaan
- menampilkan pemakaian barang
- menampilkan perubahan harga
- menampilkan data outlet
- memperbarui otomatis setiap 60 detik
- memiliki tombol refresh manual
- tetap mendukung PWA/offline shell
