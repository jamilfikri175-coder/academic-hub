# Academic Hub v1

Versi pertama untuk mengelola agenda/presentasi, tugas, dan referensi akademik.

## Fitur yang sudah tersedia
- Dashboard ringkasan
- Tambah, edit, dan hapus agenda
- Tambah, edit, hapus, dan tandai tugas selesai
- Simpan referensi dengan URL dan catatan
- Pencarian referensi
- Penyimpanan data lokal di browser (localStorage)
- PWA manifest dan service worker
- Izin notifikasi browser
- Fondasi Web Push menggunakan VAPID

## Jalankan di komputer

1. Install Node.js versi LTS.
2. Ekstrak folder ini.
3. Buka terminal di folder proyek.
4. Jalankan:

   ```bash
   npm install
   npm start
   ```

5. Buka `http://localhost:3000`.

## Notifikasi

### Notifikasi browser lokal
Buka website melalui `localhost`, lalu masuk Pengaturan dan pilih "Aktifkan notifikasi". Pengingat lokal bekerja ketika halaman terbuka dan browser mengizinkan notifikasi. Ini belum menjamin pengingat saat browser benar-benar tertutup.

### Web Push
Web Push memerlukan HTTPS (localhost dikecualikan untuk pengujian), VAPID keys, dan server yang tetap berjalan.

1. Jalankan `npm run vapid`.
2. Salin `publicKey` dan `privateKey` ke file `.env` (buat dari `.env.example`).
3. Jalankan server dengan environment variables tersebut. Jika memakai shell Linux/macOS:

   ```bash
   export VAPID_PUBLIC_KEY="..."
   export VAPID_PRIVATE_KEY="..."
   export VAPID_SUBJECT="mailto:email-anda@example.com"
   npm start
   ```

4. Deploy ke hosting yang menyediakan HTTPS dan proses Node.js yang berjalan terus.
5. Buka website di HP, pilih "Aktifkan notifikasi", lalu izinkan.
6. Di Pengaturan, tekan "Kirim tes".

Untuk produksi, tambahkan autentikasi pengguna, database subscription, scheduler yang mengirim pengingat sesuai jadwal, validasi input, backup, dan kebijakan privasi. Versi ini belum mengirim push terjadwal saat browser tertutup; endpoint tes hanya menguji pengiriman push setelah konfigurasi selesai.

## Catatan data dan privasi
Data agenda, tugas, dan referensi pada v1 disimpan di browser/perangkat yang sedang digunakan. Data tidak otomatis tersinkron ke perangkat lain. Jangan masukkan informasi sensitif.
