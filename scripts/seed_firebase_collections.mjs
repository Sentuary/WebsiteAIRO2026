import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// 1. Baca konfigurasi dari file .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const envConfig = {};
envContent.split('\n').forEach((line) => {
  const cleanLine = line.trim();
  if (cleanLine && !cleanLine.startsWith('#')) {
    const idx = cleanLine.indexOf('=');
    if (idx !== -1) {
      const key = cleanLine.substring(0, idx).trim();
      const val = cleanLine.substring(idx + 1).trim();
      envConfig[key] = val;
    }
  }
});

const firebaseConfig = {
  apiKey: envConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: envConfig.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔗 Menghubungkan ke Firebase Project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Helper konversi gambar ke SVG Data URI murni
async function convertFileToSvg(relativeImagePath) {
  const fullPath = path.resolve(process.cwd(), 'public', relativeImagePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    console.warn(`File gambar tidak ditemukan: ${fullPath}`);
    return '';
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const resized = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const width = meta.width || 600;
  const height = meta.height || 600;
  const b64 = resized.toString('base64');

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><image width="${width}" height="${height}" href="data:image/webp;base64,${b64}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svgContent, 'utf8').toString('base64')}`;
}

async function runSeeder() {
  console.log('\n🎨 Mengonversi gambar lokal menjadi dokumen SVG...');
  const heroRobotSvg = await convertFileToSvg('/images/hero_robot.webp');
  const poster1Svg = await convertFileToSvg('/images/Poster-1.webp');
  const smartLifeSvg = await convertFileToSvg('/images/AI-Smart-Life.webp');
  const zooSvg = await convertFileToSvg('/images/AI-Fantasy-Zoo.webp');
  const gallery3Svg = await convertFileToSvg('/images/gallery_level_3.webp');

  console.log('✓ Gambar berhasil di-switch ke format SVG Data URI murni.\n');

  // ==========================================
  // KOLEKSI 1: PEMBIMBING
  // ==========================================
  console.log('📦 Mengisi koleksi Firestore "pembimbing"...');
  const PEMBIMBING_DATA = [
    { id: 'pembimbing-1', label: 'Pembimbing 1', name: 'Ramadhani Ulansari, S.Kom., M.T', role: 'Dekan Fakultas Teknologi Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-2', label: 'Pembimbing 2', name: 'F.A. Ricky Bayu Styanto, S.Kom., M.Kom', role: 'Ketua Program Studi Sistem Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-3', label: 'Pembimbing 3', name: 'Soni Rudi Hartanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-4', label: 'Pembimbing 4', name: 'Suharyanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-5', label: 'Pembimbing 5', name: 'Hari Chandra Budi Rahardjo, S.Kom., M.A.B', role: 'Staff Fakultas Teknologi Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-6', label: 'Pembimbing 6', name: 'Jenih, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Ilmu Komputer', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-7', label: 'Pembimbing 7', name: 'Atik Nalariza, S.Kom', role: 'Staff Fakultas Teknologi Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-8', label: 'Pembimbing 8', name: 'Desmiwati, S.Kom., M.Si', role: 'Dosen Program Studi Ilmu Komputer', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-9', label: 'Pembimbing 9', name: 'Novi Suprapti, S.Kom', role: 'Staff Fakultas Teknologi Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-10', label: 'Pembimbing 10', name: 'Agus Riyanto, S.Kom., M.A.B', role: 'Staff Laboratorium Komputer', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-11', label: 'Pembimbing 11', name: 'Yasmiati, S.Kom., M.Si', role: 'Ketua Program Studi Sistem Informasi', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
    { id: 'pembimbing-12', label: 'Pembimbing 12', name: 'Suwarni, S.Kom., M.Si', role: 'Dosen Tetap Prodi Ilmu Komputer', institution: 'Universitas Respati Indonesia (URINDO)', image: heroRobotSvg },
  ];

  for (const item of PEMBIMBING_DATA) {
    const { id, ...data } = item;
    await setDoc(doc(db, 'pembimbing', id), data);
    console.log(`  + Pembimbing tersimpan: ${data.name}`);
  }

  // ==========================================
  // KOLEKSI 2: PENGAJAR
  // ==========================================
  console.log('\n📦 Mengisi koleksi Firestore "pengajar"...');
  const PENGAJAR_DATA = [
    { id: 'pengajar-1', label: 'Pengajar 1', name: 'Reza Ramadhan', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-2', label: 'Pengajar 2', name: 'Naisya Putri', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-3', label: 'Pengajar 3', name: 'Rafli Maulana Zidane', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-4', label: 'Pengajar 4', name: 'Rifaldi Alfauzi', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-5', label: 'Pengajar 5', name: 'Dinda Alya Ainsani', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-6', label: 'Pengajar 6', name: 'Zhaki Ramdani', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-7', label: 'Pengajar 7', name: 'Rashif Aziiz', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-8', label: 'Pengajar 8', name: 'Azhar Khaibar', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-9', label: 'Pengajar 9', name: 'Keenan Pandu Albany', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-10', label: 'Pengajar 10', name: 'Sri Diah Lestari', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
    { id: 'pengajar-11', label: 'Pengajar 11', name: 'Siti Adriyani Salsabil', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia', image: heroRobotSvg },
  ];

  for (const item of PENGAJAR_DATA) {
    const { id, ...data } = item;
    await setDoc(doc(db, 'pengajar', id), data);
    console.log(`  + Pengajar tersimpan: ${data.name}`);
  }

  // ==========================================
  // KOLEKSI 3: BERITA
  // ==========================================
  console.log('\n📦 Mengisi koleksi Firestore "berita"...');
  const BERITA_DATA = [
    {
      id: 'berita-1',
      title: 'Pembukaan Pendaftaran Kelas Robotik AIRO Semester Baru FTI URINDO',
      category: 'Pengumuman',
      date: '5 Agustus 2026',
      excerpt: 'AIRO Learning Center bekerjasama dengan FTI URINDO membuka pendaftaran program les robotik interaktif untuk tingkat SD, SMP, SMA & Mahasiswa.',
      content: 'Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO) bersama AIRO Robotics resmi membuka pendaftaran kelas robotika tingkat lanjut. Pembelajaran mencakup perakitan mekanis, sensor Arduino, hingga pemrograman logika AI.',
      image: poster1Svg,
    },
    {
      id: 'berita-2',
      title: 'Pelatihan Dan Workshop Pemrograman Arduino & IoT Untuk Generasi Muda',
      category: 'Workshop',
      date: '1 Agustus 2026',
      excerpt: 'Para peserta antusias mempelajari cara membuat otomatisasi rumah pintar dan sensor jarak menggunakan modul AI Smart Life.',
      content: 'Workshop robotika pekan ini dihadiri puluhan peserta yang diajarkan langsung oleh tim trainer AIRO. Seluruh peserta mendapatkan kesempatan praktik langsung merakit hardware kinetik dan mengunggah kode program.',
      image: smartLifeSvg,
    },
    {
      id: 'berita-3',
      title: 'Peluncuran Modul Pembelajaran AI-Fantasy-Zoo Dan Robotika Kinetik',
      category: 'Kegiatan',
      date: '25 Juli 2026',
      excerpt: 'Inovasi kurikulum baru bertema hewan melatih kreativitas kinetik dan pemahaman rasio gir mekanis anak secara menyenangkan.',
      content: 'Modul AI-Fantasy-Zoo dirancang khusus untuk melatih kecerdasan spasial dan motorik anak melalui perakitan robot hewan interaktif.',
      image: zooSvg,
    },
    {
      id: 'berita-4',
      title: 'Tim Mahasiswa FTI URINDO Raih Penghargaan Inovasi Teknologi Robotik',
      category: 'Prestasi',
      date: '18 Juli 2026',
      excerpt: 'Karya robotik berbasis kecerdasan buatan dari mahasiswa URINDO berhasil meraih peringkat terbaik dalam ajang kompetisi nasional.',
      content: 'Mahasiswa prodi Ilmu Komputer dan Sistem Informasi FTI URINDO kembali mengukir prestasi gemilang dengan menciptakan prototype lengan robot berbasis vision AI.',
      image: gallery3Svg,
    },
  ];

  for (const item of BERITA_DATA) {
    const { id, ...data } = item;
    await setDoc(doc(db, 'berita', id), data);
    console.log(`  + Berita tersimpan: ${data.title.substring(0, 45)}...`);
  }

  console.log('\n🎉 SEMUA KOLEKSI ("pembimbing", "pengajar", "berita") BERHASIL DIBUAT DAN DIISI DI FIRESTORE!');
  process.exit(0);
}

runSeeder().catch((err) => {
  console.error('\n❌ Gagal mengisi data ke Firestore:', err);
  process.exit(1);
});
