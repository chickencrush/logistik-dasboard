# CC Logistik V4.2 — Koneksi Otomatis

## Perubahan
- URL Apps Script milik pengguna sudah ditetapkan dalam config.js.
- Dashboard memuat data otomatis pada perangkat baru tanpa mengetik /exec.
- Konfigurasi bawaan diprioritaskan; URL lama tersimpan per browser diabaikan.
- Form input URL dihapus. Tombol Status Koneksi menampilkan status, bukan pengaturan.
- Mascot tersemat dan perbaikan sidebar V4.1 tetap dipertahankan.
- Tidak ada sistem login/autentikasi baru atau akses yang melewati izin Google.

## Cara update
1. Ekstrak paket dan buka folder logistik_dashboard_v4_2.
2. Upload SEMUA ISI folder ke root repository GitHub lama, termasuk config.js, assets, dan sw.js. Jangan hanya upload ZIP.
3. PENTING: ganti config.js lama dengan file config.js paket ini. Jangan mempertahankan konfigurasi placeholder dari versi lama.
4. Commit changes dan tunggu deployment GitHub Pages selesai.
5. Tutup dashboard lama, buka URL Pages kembali, lalu Ctrl+F5. HP: tutup tab/PWA lalu buka ulang.
6. Apps Script V3 dan Spreadsheet tidak perlu diubah jika deployment yang diberikan masih aktif dan mengizinkan API publik.
7. Bila versi lama tetap tampil, hapus data situs KHUSUS dashboard GitHub Pages. Ini menghapus cache lokal, bukan data Spreadsheet. Koneksi tidak perlu diinput ulang karena sudah bawaan.

## Memasang aplikasi
Gunakan Download / Pasang Aplikasi pada HTTPS GitHub Pages. Ini PWA, bukan APK/EXE. Android menggunakan menu instalasi browser; iPhone melalui Share > Add to Home Screen. Ketersediaan instalasi bergantung pada browser.

## Batasan koneksi
Internet tetap diperlukan untuk pembaruan. API harus memberi respons JSONP dari backend GitHub V3 atau V2 dan deployment publik yang valid. Koneksi otomatis tidak memperbaiki DNS, ekstensi, sesi multi-akun Google, atau kebijakan akses Google. Jika hanya Incognito yang berhasil, gunakan profil Chrome terpisah dan periksa ekstensi/sesi akun.

## Keamanan
Endpoint tersimpan dalam kode publik GitHub. API ini tidak menyediakan autentikasi internal. Orang yang mengetahui URL dapat membaca data yang disediakan endpoint; jangan gunakan untuk data rahasia tanpa autentikasi tambahan. Data terakhir disimpan di perangkat untuk tampilan offline, bukan data live.

## Tes
node tests/core.test.cjs
node tests/backend.test.cjs
node tests/charts.test.cjs
node tests/ui.test.cjs
node tests/brand-sidebar.test.cjs
node tests/autoconnect.test.cjs

Live Google/PWA perlu diverifikasi setelah deployment. URL bawaan hanya diubah oleh pengelola di config.js jika deployment berganti.
