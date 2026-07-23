# Panduan Deployment Next.js Menggunakan ZIP (Tanpa .env / Backend)

Dokumen ini berisi panduan langkah demi langkah untuk melakukan deploy aplikasi **Website AIRO 2026** (Next.js) ke server (cPanel, Shared Hosting, VPS, atau Web Hosting lainnya) menggunakan file `.zip` tanpa membutuhkan file `.env`.

---

## ⚡ Opsi 1: Static Export (Paling Mudah & Cepat)
Jika website Anda murni frontend (HTML, CSS, JS) dan tidak membutuhkan Node.js runtime di server production, gunakan opsi **Static Export**. Hasil build berupa file statis yang bisa di-upload ke hosting mana saja (termasuk cPanel `public_html`).

### Langkah 1: Tambahkan Konfigurasi Export
Buka file [next.config.ts](file:///c:/Users/Pongo/Documents/1.%20Rashif%20Workspace/WebsiteAIRO2026/next.config.ts) dan atur `output: "export"`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Diperlukan jika menggunakan tag <Image> dari Next.js pada Static Export
  },
};

export default nextConfig;
```

### Langkah 2: Build Project di Lokal
Jalankan perintah build di terminal komputer Anda:

```bash
npm run build
```

Setelah proses selesai, Next.js akan membuat folder baru bernama **`out/`** yang berisi seluruh file HTML, CSS, JavaScript, dan aset publik.

### Langkah 3: Kompres Folder `out/` Menjadi ZIP
1. Masuk ke dalam folder `out/`.
2. Pilih seluruh isi di dalam folder `out/` (bukan folder `out`-nya, tapi isinya: `index.html`, `_next/`, `public assets`, dll.).
3. Kompres/Zip menjadi **`website.zip`**.

### Langkah 4: Upload & Ekstrak di Hosting / Server
1. Buka **File Manager** cPanel atau FTP/SFTP server Anda.
2. Masuk ke direktori utama web Anda (biasanya `public_html` atau `/var/www/html`).
3. **Upload** file `website.zip`.
4. **Ekstrak** file `website.zip` langsung di direktori tersebut.
5. Selesai! Website langsung aktif tanpa perlu install Node.js, PM2, atau konfigurasi backend.

---

## 🚀 Opsi 2: Node.js Standalone Build ZIP (Jika Menggunakan Node.js Server)

Jika Anda tetap ingin menjalankan server Node.js (misalnya untuk fitur dynamic SSR atau fungsi internal Next.js):

### Langkah 1: Konfigurasi Standalone
Ubah [next.config.ts](file:///c:/Users/Pongo/Documents/1.%20Rashif%20Workspace/WebsiteAIRO2026/next.config.ts):

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

### Langkah 2: Build Project
```bash
npm run build
```

### Langkah 3: Menyiapkan Paket Deploy ZIP
1. Buat folder baru bernama `deploy_package`.
2. Salin isi folder `.next/standalone` ke dalam `deploy_package`.
3. Salin folder `public` dari root ke `deploy_package/public`.
4. Salin folder `.next/static` ke `deploy_package/.next/static`.
5. Kompres seluruh isi folder `deploy_package` menjadi **`deploy.zip`**.

**Struktur File di Dalam ZIP:**
```text
deploy.zip
├── .next/
│   └── static/
├── public/
├── package.json
└── server.js
```

### Langkah 4: Upload & Jalankan di Server
1. Upload & ekstrak `deploy.zip` di server.
2. Jalankan aplikasi via SSH/Terminal:
   ```bash
   # Menggunakan PM2
   pm2 start server.js --name "airo-website"
   ```
   atau jalankan langsung:
   ```bash
   PORT=3000 node server.js
   ```

---

## 📋 Ringkasan File yang Di-ZIP

| Jenis Deploy | Apa yang Dicompress ke ZIP? | Target Upload Server | Perlu Node.js di Server? |
| :--- | :--- | :--- | :--- |
| **Static Export** | Seluruh isi di dalam folder `out/` | `public_html` / web root | ❌ Tidak |
| **Node.js Standalone** | Isi `.next/standalone` + `public` + `.next/static` | Folder aplikasi VPS / cPanel Node | ✅ Ya |

---

## 🔍 Checklist Verifikasi

- [ ] File ZIP berhasil dibuat dari folder build (`out/` atau `.next/standalone`).
- [ ] Semua file ter-extract dengan benar di folder server target.
- [ ] Website dapat diakses di browser tanpa error 404 / asset terputus.
