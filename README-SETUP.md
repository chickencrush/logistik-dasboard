# Chicken Crush Logistik — MOBILE UI V6

Endpoint API produksi sudah dipasang otomatis:

`https://script.google.com/macros/s/AKfycbx7TbKQ8SUMH6QYlBlAQeji10JMAAOOAOdUbmrQE53XX_LrT5CDNQRrX6LBr4-EVTor/exec`

## Perbaikan API

Dashboard sudah memiliki endpoint produksi. Pengguna tidak perlu memasukkan URL `/exec`.

Versi ini menambahkan sidebar mobile yang lebih ramping, backdrop yang dapat diketuk untuk menutup menu, menu otomatis tertutup setelah dipilih, dan ikon aplikasi maskot profesional.

1. Buka Spreadsheet sumber > Ekstensi > Apps Script.
2. Ganti Code.gs dengan Code.gs paket ini.
3. Jalankan fungsi `setupApi` satu kali dan izinkan akses.
4. Deploy > Manage deployments > Edit > New version > Deploy. Execute as Me; akses Anyone.
5. Upload index.html, manifest.json, sw.js, dan seluruh ikon ke root GitHub Pages.
6. Tunggu Pages selesai, tutup tab lama, buka kembali dan tekan Ctrl+F5.

`setupApi` menyimpan ID Spreadsheet sehingga Web App tidak kehilangan database ketika dipanggil dari GitHub Pages.

Setelah itu upload seluruh isi folder ini ke root repository GitHub Pages.

Dashboard akan:
- mengambil data melalui JSONP sehingga tidak bergantung pada CORS fetch
- menggunakan endpoint produksi API V4 yang sudah aktif
- menyimpan endpoint terakhir yang berhasil
- menampilkan data cache terakhir dengan status API: OFFLINE jika jaringan gagal
- menampilkan pesan diagnosis pada teks waktu pembaruan
- menggunakan Code.gs V4 dengan Spreadsheet ID tersimpan
- menampilkan KPI realtime
- menampilkan PO per wilayah
- menampilkan persediaan
- menampilkan pemakaian barang
- menampilkan perubahan harga
- menampilkan data outlet
- memperbarui otomatis setiap 60 detik
- memiliki tombol refresh manual
- tetap mendukung PWA/offline shell melalui manifest.json dan sw.js yang kini disertakan

Catatan: endpoint harus benar-benar dideploy dengan Code.gs paket ini. Kode GitHub tidak dapat memperbarui deployment Google secara otomatis.
