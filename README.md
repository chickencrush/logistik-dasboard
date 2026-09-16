# CC Logistik V4 — Professional UI

## Pembaruan V4

UI baru: sidebar navy, ringkasan krem, kartu KPI dengan ikon, filter lebih rapi, tabel dan grafik ringan, serta loading non-blocking dengan logo CC Logistik yang disediakan pengguna. Logo asli digunakan tanpa perubahan kreatif; ikon PNG diperkecil dan dipasang pada kanvas persegi dengan gambar utuh. Loading tampil selama permintaan API dan menghilang pada sukses maupun gagal. Cache/pengaturan menggunakan kunci V3 agar koneksi sebelumnya tetap dikenali di browser dan alamat GitHub Pages yang sama.

### Update dari V3 (tanpa mengubah Spreadsheet)

1. Backup file config.js lama bila berisi API_URL pribadi.
2. Ekstrak paket ini; upload seluruh ISI folder logistik_dashboard_v4 ke root repository GitHub lama. index.html harus langsung di root.
3. Pertahankan config.js lama bila sudah diisi, atau gunakan tombol Koneksi setelah dashboard terbuka.
4. Commit, tunggu deployment Pages selesai, lalu Ctrl+F5.
5. Backend Apps Script tetap V3, jadi tidak perlu mengganti Code.gs atau deployment untuk upgrade UI ini.
6. Untuk ikon aplikasi baru: browser bisa mempertahankan ikon PWA lama. Bila belum berubah, hapus instalasi PWA lama lalu pasang kembali melalui URL GitHub Pages yang sama. Menghapus instalasi aplikasi tidak menghapus Spreadsheet.

Kode Apps Script V3 tetap disertakan untuk pemasangan baru. Tidak ada fitur login baru; masalah sesi multi-akun Google tidak dapat diselesaikan hanya dengan upgrade UI.

Versi ini meneruskan V2 GitHub/PWA. Tidak berisi APK/EXE; aplikasi dipasang oleh browser melalui HTTPS. Tidak ada data dummy atau API URL pribadi di paket.

## Pemasangan backend bila sebelumnya masih V2

1. Download dan ekstrak paket V3. Simpan salinan repository V2 sebagai backup.
2. Di Apps Script Spreadsheet lama, ganti Code.gs dengan apps-script/Code.gs dari V3. Simpan.
3. Deploy > Manage deployments > pensil > New version > Deploy. Execute as Me; akses Anyone. Endpoint tetap sama jika deployment lama diperbarui. Spreadsheet tidak perlu dibuat ulang.
4. Upload seluruh isi folder logistik_dashboard_v4 ke root repository GitHub lama. index.html harus di root, bukan di dalam folder tambahan. Jangan hanya upload ZIP.
5. Commit changes. Pengaturan GitHub Pages tetap main / root.
6. Buka URL GitHub Pages. Tekan Ctrl+F5. Bila masih muncul V2, hapus data situs GitHub Pages di pengaturan browser, lalu buka ulang (ini menghapus cache dashboard lokal, bukan Spreadsheet).
7. Klik Koneksi, tempel URL Apps Script /exec, lalu Simpan & Hubungkan. Tidak perlu mencari config.js. Pengaturan ini disimpan per browser/perangkat; isi kembali di HP atau Incognito.

Alternatif: isi API_URL di config.js sebelum upload agar perangkat menggunakan endpoint default yang sama. Jangan mengunggah kredensial.

## Pemasangan aplikasi

Klik Download / Pasang Aplikasi. Jika browser mendukung prompt instalasi, prompt akan tampil. Jika belum tersedia, tombol menampilkan petunjuk Android, iPhone, dan komputer. Dashboard harus dibuka via HTTPS GitHub Pages, bukan file lokal. Bukan unduhan APK/EXE. Opsi instalasi bergantung pada browser/perangkat; prompt tidak selalu tampil dan dapat tidak tersedia di Incognito.

## Grafik

- Batang atau garis lewat pilihan Bentuk grafik.
- Hover, sentuh, atau fokus dengan keyboard untuk tooltip angka.
- Klik legenda untuk menampilkan/menyembunyikan seri.
- Klik batang/titik periode invoice untuk memfilter order.
- Klik outlet di grafik ranking untuk mengisi pencarian outlet.
- Unduh grafik invoice sebagai SVG.
- Animasi KPI dan grafik menghormati pengaturan reduced motion.

## Data & batasan

Order/ranking/KPI menggunakan tanggal order, bukan nama sheet PO. Kolom Periode Sumber tersedia untuk penelusuran. Produksi, stok, harga, dan pemakaian mengikuti nama bulan sumber (tahun tidak tersedia di beberapa tabel); filter outlet tidak diterapkan pada tabel tersebut. Stok tiap bahan tidak dijumlahkan menjadi satu angka. Fisik kosong tidak dianggap selisih negatif. Angka produksi ditampilkan sesuai sumber, tanpa otomatis mengubah angka ambigu seperti 13.925.

Cache data terakhir hanya ditampilkan jika pernah sukses terhubung ke endpoint yang sama. Tampilan offline bukan data live. Koneksi gagal tidak menutup dashboard. Pembaruan otomatis setiap 5 menit saat tab aktif dan online; tombol Muat Ulang meminta data tanpa cache server. Ekstensi, sesi akun, DNS, dan pembatasan jaringan browser tetap dapat memblokir Apps Script; aplikasi tidak melewati pembatasan tersebut.

API publik Anyone memungkinkan pembacaan data oleh siapa pun dengan URL. GitHub Pages/PWA ini tidak menyediakan autentikasi internal. Jangan gunakan untuk data rahasia tanpa lapisan autentikasi tambahan. Cache data tersimpan di perangkat; gunakan perangkat tepercaya.

## Pengujian lokal

`node tests/core.test.cjs` dan `node tests/backend.test.cjs`. Jalankan dari root folder. Membuka file HTML lokal tidak cukup untuk menguji instalasi PWA/API; perlu HTTPS dan deployment Google nyata.
