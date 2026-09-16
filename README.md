# Dashboard Logistik Chicken Crush — GitHub/PWA

Aplikasi dashboard responsif untuk komputer dan handphone. Tampilan di-host gratis melalui GitHub Pages, sedangkan database tetap menggunakan Google Spreadsheet melalui Google Apps Script.

## Fitur

- Sidebar dapat dibuka dan ditutup.
- Grafik Canvas mandiri tanpa library atau CDN eksternal.
- Data otomatis mengikuti perubahan Google Spreadsheet.
- Refresh otomatis setiap 5 menit dan tombol muat ulang manual.
- Dapat dipasang ke layar utama Android/komputer sebagai PWA.
- Menyimpan data terakhir untuk tampilan saat koneksi terputus.
- Filter periode, pencarian outlet, ranking outlet, order, persediaan, produksi, harga bahan, serta ekspor CSV.

## Bagian 1 — Pasang API pada Google Spreadsheet

1. Unggah file `LAPORAN BULANAN LOGISTIK.xlsx` ke Google Drive dan buka sebagai Google Spreadsheet.
2. Pilih **Ekstensi > Apps Script**.
3. Salin `apps-script/Code.gs` ke file `Code.gs`.
4. Buka **Project Settings**, aktifkan **Show appsscript.json manifest file in editor**, lalu salin `apps-script/appsscript.json`.
5. Jalankan fungsi `setupDashboard` satu kali dan izinkan akses.
6. Pilih **Deploy > New deployment > Web app**.
7. Atur **Execute as: Me** dan **Who has access: Anyone**.
8. Klik **Deploy**, kemudian salin URL yang berakhiran `/exec`.

## Bagian 2 — Hubungkan Aplikasi

1. Buka file `config.js`.
2. Ganti teks `TEMPEL_URL_APPS_SCRIPT_DI_SINI` dengan URL `/exec` dari langkah sebelumnya.
3. Simpan perubahan.

Contoh:

```js
window.DASHBOARD_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxxxxxxxx/exec',
  REFRESH_MINUTES: 5,
  APP_NAME: 'Dashboard Logistik Chicken Crush'
};
```

## Bagian 3 — Upload ke GitHub

1. Buat repository baru di GitHub, misalnya `dashboard-logistik`.
2. Upload seluruh isi folder ini ke repository, jangan hanya folder `apps-script`.
3. Buka **Settings > Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch **main**, folder **/(root)**, lalu klik **Save**.
6. Tunggu sekitar 1–3 menit. Alamat aplikasi akan berbentuk:
   `https://USERNAME.github.io/dashboard-logistik/`

## Memasang di Handphone

- Android/Chrome: buka URL aplikasi, tekan menu browser, lalu **Tambahkan ke layar utama** atau tombol **Pasang Aplikasi**.
- iPhone/Safari: tekan **Share**, kemudian **Add to Home Screen**.
- Komputer/Chrome: klik ikon instalasi di sisi kanan address bar jika tersedia.

## Memperbarui Data

Edit data langsung pada Google Spreadsheet. Dashboard akan membaca data terbaru setiap 5 menit. Gunakan tombol **Muat Ulang** untuk melihat perubahan saat itu juga.

Jika kode Apps Script diubah, buka **Deploy > Manage deployments > Edit**, pilih **New version**, lalu deploy kembali. URL `/exec` tetap dapat digunakan.

## Catatan Keamanan

Deployment `Anyone` berarti data yang dikirim oleh API dapat dibaca oleh orang yang mengetahui URL aplikasi. Jangan menaruh data pribadi atau rahasia di spreadsheet sumber. Untuk akses internal terbatas, gunakan akun Google Workspace dan ubah kebijakan deployment sesuai organisasi.

