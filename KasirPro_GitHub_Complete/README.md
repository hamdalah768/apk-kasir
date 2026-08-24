# KasirPro Fashion - Project VS Code

Project ini dibuat dengan:
- HTML
- CSS
- JavaScript

Tidak memakai framework sehingga mudah dipelajari dan diedit di VS Code.

## 1. Membuka project

Extract ZIP, kemudian:

1. Buka VS Code.
2. Pilih File > Open Folder.
3. Pilih folder `Kasir_VSCode_Clean`.
4. Buka `index.html`.

## 2. Cara menjalankan

Cara paling mudah:

1. Install extension `Live Server` di VS Code.
2. Klik kanan `index.html`.
3. Pilih `Open with Live Server`.

Browser akan membuka aplikasi.

## 3. Login

Username:
admin

Password:
admin123

## 4. Fitur

- Login
- Dashboard
- Grafik penjualan
- Kasir
- Pembayaran Cash
- Diskon
- Kembalian
- Cetak struk
- Produk
- Foto produk
- Harga jual
- Harga modal
- Stok
- Edit produk
- Hapus produk
- Rekap transaksi
- Laporan laba
- Penyimpanan lokal browser

## 5. Membuat APK Android

Project sudah memiliki konfigurasi awal Capacitor.

Install Node.js terlebih dahulu.

Kemudian buka Terminal VS Code di folder project:

```bash
npm install
npx cap add android
npx cap sync
npx cap open android
```

Android Studio akan membuka project Android.

Untuk menjalankan ke HP Android:
- Install Android Studio.
- Install Android SDK.
- Aktifkan USB Debugging di HP.
- Sambungkan HP.
- Klik Run di Android Studio.

## Catatan

Versi ini adalah aplikasi kasir pribadi/offline sederhana.

Data menggunakan localStorage.

Printer thermal Bluetooth/USB langsung membutuhkan integrasi native Android khusus. Versi browser menggunakan dialog print.

Login `admin/admin123` adalah login demo, bukan sistem keamanan produksi.

Jika aplikasi nantinya dipakai untuk banyak perangkat/kasir, sebaiknya ditambahkan backend dan database.

\n## Struktur GitHub

Upload the contents of this folder to the root of your GitHub repository.
Do not upload the ZIP as the project itself.

The `assets/icons` folder contains the application icons.
The `assets/images` folder is intentionally included so the directory structure is preserved.
