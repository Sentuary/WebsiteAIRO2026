# 🤖 Website JMK (Jasa Mengajar Robotika)

Website resmi **JMK (Jasa Mengajar Robotika)** — Platform edukasi dan pengajaran robotika modern bagi anak-anak dan mahasiswa, yang bekerja sama dengan **Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO)**.

Dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, serta terintegrasi dengan **Cloudinary CDN** untuk penyimpanan dan pengiriman media berkinerja tinggi.

---

## 🚀 Fitur Utama & Keunggulan

- **⚡ Optimasi Performa HP Kentang (Low-End Mobile Optimization)**:
  - **Dynamic Cloudinary URL Optimization**: Transformasi gambar otomatis (`f_auto,q_auto,w_*`) untuk format WebP/AVIF dan kompresi ukuran sesuai ukuran layar, menghemat hingga 80% bandwidth media.
  - **Preconnect CDN**: Menyuntikkan tag `preconnect` ke domain Cloudinary untuk mempercepat handshake TLS & DNS.
  - **Mobile CSS GPU Relief**: Mematikan efek `backdrop-blur` (glassmorphism) dan animasi repaints berlebih pada layar HP (`max-width: 768px`) sehingga scrolling di HP kentang tetap 60 FPS tanpa patah-patah.
  - **Smart Rotation Timer**: Rotasi otomatis daftar tim menggunakan `document.hidden` check untuk otomatis jeda (*pause*) ketika tab tidak aktif / di luar layar, menghemat CPU & baterai HP.
  - **Lazy Loading & Async Decoding**: Mengunduh gambar non-hero secara bertahap saat discroll mendekati layar.

- **☁️ Cloudinary Media Integration**:
  - Seluruh gambar (Hero Robot, Poster Pembelajaran, Paket Kelas, Foto Dosen Pembimbing & Pengajar) tersimpan secara terpusat di **Cloudinary CDN** untuk pemuatan gambar yang cepat dan terdistribusi global.
  - Dilengkapi SDK & REST API Uploader di `lib/cloudinary.ts` dan `app/api/upload/route.ts`.

- **👥 Interactive Team Showcase (Pembimbing & Pengajar)**:
  - **12 Dosen Pembimbing** Fakultas Teknologi Informasi URINDO.
  - **11 Pengajar Profesional** (Asisten Trainer JMK Robotics).
  - **Fitur Auto-Rotate 5 Detik**: Foto & info anggota berganti secara otomatis setiap 5 detik dengan efek transisi *smooth crossfade* (`animate-team-fade`).
  - **Internal Smooth Scroll**: Daftar nama di sidebar otomatis menggulir secara independen tanpa mengganggu posisi scroll utama halaman pengguna.

- **✨ Scroll Reveal & Animations**:
  - Animasi kemunculan (*Reveal Animation*) saat scroll menggunakan `IntersectionObserver`.
  - Animasi melayang (*floatSlow*) pada maskot Hero Robot dan Poster Pembelajaran di desktop.

- **💳 Informasi Paket Layanan & Cicilan**:
  - Penyesuaian harga transparan untuk **Level 1 (Tema Animal)**, **Level 2 (Tema Smart Life)**, dan **Level 3 (Advance Smart Life)** seharga **Rp2.000.000** dengan opsi cicilan kemudahan **Rp500.000 / 4 Bulan**.

- **🖼️ Poster Pembelajaran & Lightbox Modal**:
  - Fitur pratinjau poster interaktif dengan modal popup (*Lightbox Modal*) resolusi tinggi.

- **📱 Desain Modern & Responsive**:
  - Dukungan tampilan penuh di Desktop, Tablet, hingga Smartphone (Mobile Navigation Drawer Menu).

---

## 🔑 Konfigurasi Environment Variables (`.env.local`)

Buat berkas `.env.local` di root proyek untuk mengonfigurasi Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=f2tewygu
CLOUDINARY_API_KEY=321599972144246
CLOUDINARY_API_SECRET=g9pxfXZWOGa4C47BoKW9twBr1Dw
CLOUDINARY_URL=cloudinary://321599972144246:g9pxfXZWOGa4C47BoKW9twBr1Dw@f2tewygu
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=f2tewygu
```

---

## 🛠️ Panduan Memulai (Getting Started)

### Prasyarat
- **Node.js** (Versi LTS terbaru)
- **npm** / **yarn** / **pnpm**

### 1. Instalasi Dependensi

```bash
npm install
```

### 2. Menjalankan Server Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat aplikasinya secara langsung.

### 3. Build & Production Deployment

```bash
# Membuat build produksi teroptimasi
npm run build

# Menjalankan server produksi
npm run start
```

---

## 📂 Struktur Folder Proyek

```text
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── upload/route.ts   # API Route Handler Upload Cloudinary
│   ├── favicon.ico           # Favicon Website
│   ├── globals.css           # Global Styling, Mobile GPU Tweaks & Animations
│   ├── layout.tsx            # Root Layout Application (Preconnect Cloudinary)
│   └── page.tsx              # Main Single Page Application (SPA)
├── lib/
│   └── cloudinary.ts         # Integrasi Cloudinary SDK & REST API Uploader
├── public/                   # Asset Statis Lokal
├── .env.local                # Environment Variables (Cloudinary Keys)
├── package.json              # Metadata Proyek & Dependensi
├── tsconfig.json             # Konfigurasi TypeScript
└── README.md                 # Dokumentasi Resmi Proyek
```

---

## 📌 Urutan Navigasi & Section Halaman

1. **Beranda** (`#beranda`)
2. **Tentang Kami** (`#tentang`)
3. **Tim Kami** (`#tim`)
4. **Layanan** (`#layanan`)
5. **Poster Pembelajaran** (`#poster`)
6. **Galeri** (`#galeri`)
7. **Kontak** (`#kontak`)

---

Dibuat untuk mengembangkan platform **Jasa Mengajar Robotika (JMK)** secara profesional, responsif, dan hemat sumber daya.
