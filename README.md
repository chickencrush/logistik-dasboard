# Chicken Crush Logistik — PWA

Dashboard Logistik Enterprise Chicken Crush yang dapat dipasang sebagai aplikasi di PC, Android, dan iOS.

## Struktur
- `index.html` — aplikasi utama
- `manifest.json` — konfigurasi PWA/install
- `sw.js` — service worker/cache offline
- `icon-192.png` — ikon PWA
- `icon-512.png` — ikon PWA
- `apple-touch-icon.png` — ikon iOS

## Deploy ke GitHub Pages
1. Buat repository baru di GitHub, misalnya `chicken-crush-logistik`.
2. Upload semua file di folder ini ke root repository.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`.
6. Save.
7. Tunggu GitHub Pages selesai deploy.
8. Buka URL Pages yang diberikan GitHub.

## Install
### Android / Chrome
Buka URL → menu browser → Install app / Add to Home screen.

### PC / Edge atau Chrome
Buka URL → ikon Install di address bar atau tombol install di aplikasi.

### iPhone/iPad
Buka URL dengan Safari → Share → Add to Home Screen.

## Catatan
PWA membutuhkan HTTPS. GitHub Pages menyediakan HTTPS secara otomatis.

## UI Upgrade
Versi ini mempertahankan seluruh data dan fungsi dashboard, dengan peningkatan visual modern/profesional, responsive mobile, hover states, header status, dan styling kartu/tabel.
