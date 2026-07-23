# Panduan Deployment Website AIRO 2026

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deployment aplikasi **Website AIRO 2026** (Next.js) ke server (VPS / Dedicated Server / cPanel dengan dukungan Node.js) dengan mengunduh source code file `.zip` dari GitHub.

---

## 📋 Prasyarat Server

Sebelum memulai, pastikan server Anda telah terinstall:
- **Node.js**: Versi v18.x atau lebih baru (`node -v`)
- **npm**: Node Package Manager (`npm -v`)
- **PM2** *(Opsional tetapi Sangat Direkomendasikan)*: Process Manager untuk menjalankan Node.js di background.

---

## 🚀 Langkah Deployment

### 1. Download ZIP dari GitHub
Unduh file ZIP repository dari GitHub **Sentuary/WebsiteAIRO2026**.

- **Cara A (Via Terminal / SSH langsung di server)**:
  ```bash
  wget https://github.com/Sentuary/WebsiteAIRO2026/archive/refs/heads/main.zip -O WebsiteAIRO2026.zip
  ```
- **Cara B (Via Browser)**:
  Buka repository di [GitHub Sentuary/WebsiteAIRO2026](https://github.com/Sentuary/WebsiteAIRO2026), klik tombol **Code** > **Download ZIP**.

---

### 2. Upload ke Server
Jika file ZIP diunduh melalui komputer lokal, upload file `WebsiteAIRO2026.zip` tersebut ke server Anda.

- **Menggunakan SCP / SFTP (Terminal / FileZilla / WinSCP)**:
  ```bash
  scp WebsiteAIRO2026.zip user@ip_server:/path/tujuan/
  ```
- **Menggunakan cPanel File Manager**:
  Masuk ke cPanel File Manager -> Buka folder direktori target -> Klik **Upload** -> Pilih file `WebsiteAIRO2026.zip`.

---

### 3. Extract File
Ekstrak file `.zip` yang sudah berada di direktori server dan masuk ke folder hasil ekstraksi.

- **Melalui Terminal SSH**:
  ```bash
  unzip WebsiteAIRO2026.zip
  cd WebsiteAIRO2026-main
  ```
- **Melalui cPanel File Manager**:
  Klik kanan file `WebsiteAIRO2026.zip` -> Pilih **Extract** -> Masuk ke folder hasil ekstrak (`WebsiteAIRO2026-main`).

> 💡 **Catatan `.env` (Optional)**: Jika aplikasi memerlukan Environment Variables tambahan, buat file `.env` di dalam folder ini sebelum melakukan build.

---

### 4. Install Dependencies (`npm install`)
Jalankan perintah berikut untuk mengunduh dan meng-install semua library/package yang dibutuhkan:

```bash
npm install
```

---

### 5. Build Application (`npm run build`)
Kompilasi project Next.js untuk lingkungan produksi (Production Build):

```bash
npm run build
```
Proses ini akan mengoptimasi aset, halaman, dan membuat folder `.next/` yang siap dijalankan secara efisien di server production.

---

### 6. Jalankan Aplikasi (`npm start`)
Jalankan server Next.js production.

- **Opsi Direct Run (Testing)**:
  ```bash
  npm start
  ```
  *(Aplikasi berjalan di port default `3000`. Jika sesi terminal ditutup, aplikasi akan berhenti)*.

- **Opsi PM2 (Direkomendasikan untuk Production)**:
  Agar aplikasi tetap berjalan terus-menerus di background walau terminal ditutup atau server di-restart:
  ```bash
  # Install PM2 secara global jika belum ada
  npm install -g pm2

  # Jalankan aplikasi Next.js dengan PM2
  pm2 start npm --name "airo-website" -- start

  # Simpan konfigurasi PM2 agar otomatis jalan saat server reboot
  pm2 save
  ```

---

## 🛠️ Perintah Berguna PM2

| Perintah | Deskripsi |
| :--- | :--- |
| `pm2 status` | Melihat daftar dan status aplikasi yang berjalan |
| `pm2 logs airo-website` | Melihat log output / error aplikasi real-time |
| `pm2 restart airo-website` | Merestart aplikasi |
| `pm2 stop airo-website` | Menghentikan sementara aplikasi |

---

## 🔍 Checklist Verifikasi

- [ ] File ZIP berhasil diunduh dan di-extract di server.
- [ ] Dependencies ter-install sempurna via `npm install`.
- [ ] Proses build sukses (`npm run build`).
- [ ] Aplikasi berjalan aktif (`pm2 status` atau `npm start`) dan dapat diakses melalui port/domain server.
