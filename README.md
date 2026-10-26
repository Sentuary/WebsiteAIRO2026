# 🤖 Website AIRO (Artificial Intelligence Robotics)

Website resmi **AIRO (Artificial Intelligence Robotics)** — Platform edukasi dan pengajaran robotika modern bagi anak-anak dan mahasiswa, yang bekerja sama dengan **Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO)**.

Dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, serta terintegrasi dengan **Firebase Firestore Realtime Database** dan **Sharp Image-to-SVG Vectorizer**.

---

## 🚀 Fitur Utama & Keunggulan

- **🔥 Firebase Firestore Realtime Database**:
  - Seluruh data dinamis (**Berita & Kegiatan**, **Dosen Pembimbing**, dan **Pengajar / Trainer**) tersimpan langsung di koleksi Firebase Firestore (`berita`, `pembimbing`, `pengajar`).
  - Sinkronisasi instan dua arah secara *real-time* tanpa perlu me-refresh halaman.

- **🎨 Image-to-SVG Architecture (Tanpa Storage Eksternal)**:
  - Setiap gambar yang diunggah otomatis di-switch dan di-vektorisasi menjadi dokumen SVG murni (`data:image/svg+xml;base64,...`) yang super ringkas (~20–40 KB) via Sharp.
  - Gambar tersimpan langsung di dalam dokumen atribut Firestore tanpa memerlukan bucket Cloudinary maupun Firebase Storage.

- **⚡ Optimasi Performa HP Kentang (Low-End Mobile Optimization)**:
  - **Mobile CSS GPU Relief**: Mematikan efek `backdrop-blur` (glassmorphism) dan animasi repaints berlebih pada layar HP (`max-width: 768px`) sehingga scrolling di HP kentang tetap 60 FPS tanpa patah-patah.
  - **Smart Rotation Timer**: Rotasi otomatis daftar tim menggunakan `document.hidden` check untuk otomatis jeda (*pause*) ketika tab tidak aktif / di luar layar, menghemat CPU & baterai HP.
  - **Lazy Loading & Async Decoding**: Mengunduh gambar non-hero secara bertahap saat discroll mendekati layar.

- **👥 Interactive Team Showcase (Pembimbing & Pengajar)**:
  - **12 Dosen Pembimbing** Fakultas Teknologi Informasi URINDO.
  - **11 Pengajar Profesional** (Asisten Trainer AIRO Robotics).
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

## 🔑 Konfigurasi Environment Variables (`.env`)

Buat atau isi berkas `.env` di root proyek untuk mengonfigurasi Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
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
│   │   └── upload/route.ts   # Image to SVG Switcher & Processing Endpoint
│   ├── favicon.ico           # Favicon Website
│   ├── globals.css           # Global Styling, Mobile GPU Tweaks & Animations
│   ├── layout.tsx            # Root Layout Application
│   └── page.tsx              # Main Single Page Application (SPA)
├── components/
│   └── AdminDashboard.tsx    # Flat Anti-Slop CRUD Admin Dashboard (1-Hr Token Expiry)
├── lib/
│   └── firebase.ts           # Firebase Auth & Firestore Client SDK
├── public/                   # Asset Statis Lokal
├── .env                      # Environment Variables (Firebase Keys)
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

Dibuat untuk mengembangkan platform **AIRO (Artificial Intelligence Robotics)** secara profesional, responsif, dan hemat sumber daya.
