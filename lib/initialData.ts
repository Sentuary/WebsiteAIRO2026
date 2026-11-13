import type { BeritaItem, TeamMemberItem, PosterItem, LayananItem } from "@/components/AdminDashboard";

export const INITIAL_PEMBIMBING: TeamMemberItem[] = [
  { id: 'pembimbing-1', label: 'Pembimbing 1', name: 'Ramadhani Ulansari, S.Kom., M.T', role: 'Dekan Fakultas Teknologi Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-2', label: 'Pembimbing 2', name: 'F.A. Ricky Bayu Styanto, S.Kom., M.Kom', role: 'Ketua Program Studi Sistem Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-3', label: 'Pembimbing 3', name: 'Soni Rudi Hartanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-4', label: 'Pembimbing 4', name: 'Suharyanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-5', label: 'Pembimbing 5', name: 'Hari Chandra Budi Rahardjo, S.Kom., M.A.B', role: 'Staff Fakultas Teknologi Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-6', label: 'Pembimbing 6', name: 'Jenih, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Ilmu Komputer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-7', label: 'Pembimbing 7', name: 'Atik Nalariza, S.Kom', role: 'Staff Fakultas Teknologi Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-8', label: 'Pembimbing 8', name: 'Desmiwati, S.Kom., M.Si', role: 'Dosen Program Studi Ilmu Komputer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-9', label: 'Pembimbing 9', name: 'Novi Suprapti, S.Kom', role: 'Staff Fakultas Teknologi Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-10', label: 'Pembimbing 10', name: 'Agus Riyanto, S.Kom., M.A.B', role: 'Staff Laboratorium Komputer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-11', label: 'Pembimbing 11', name: 'Yasmiati, S.Kom., M.Si', role: 'Ketua Program Studi Sistem Informasi', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
  { id: 'pembimbing-12', label: 'Pembimbing 12', name: 'Suwarni, S.Kom., M.Si', role: 'Dosen Tetap Prodi Ilmu Komputer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia (URINDO)' },
];

export const INITIAL_PENGAJAR: TeamMemberItem[] = [
  { id: 'pengajar-1', label: 'Pengajar 1', name: 'Reza Ramadhan', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-2', label: 'Pengajar 2', name: 'Naisya Putri', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-3', label: 'Pengajar 3', name: 'Rafli Maulana Zidane', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-4', label: 'Pengajar 4', name: 'Rifaldi Alfauzi', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-5', label: 'Pengajar 5', name: 'Dinda Alya Ainsani', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-6', label: 'Pengajar 6', name: 'Zhaki Ramdani', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-7', label: 'Pengajar 7', name: 'Rashif Aziiz', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-8', label: 'Pengajar 8', name: 'Azhar Khaibar', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-9', label: 'Pengajar 9', name: 'Keenan Pandu Albany', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-10', label: 'Pengajar 10', name: 'Sri Diah Lestari', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
  { id: 'pengajar-11', label: 'Pengajar 11', name: 'Siti Adriyani Salsabil', role: 'Asisten Trainer', image: '/images/hero_robot.webp', institution: 'Universitas Respati Indonesia' },
];

export const INITIAL_BERITA: BeritaItem[] = [
  {
    id: 'berita-1',
    title: 'Pembukaan Pendaftaran Kelas Robotik AIRO Semester Baru FTI URINDO',
    category: 'Pengumuman',
    date: '5 Agustus 2026',
    excerpt: 'AIRO Learning Center bekerjasama dengan FTI URINDO membuka pendaftaran program les robotik interaktif untuk tingkat SD, SMP, SMA & Mahasiswa.',
    content: 'Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO) bersama AIRO Robotics resmi membuka pendaftaran kelas robotika tingkat lanjut. Pembelajaran mencakup perakitan mekanis, sensor Arduino, hingga pemrograman logika AI.',
    image: '/images/Poster-1.webp'
  },
  {
    id: 'berita-2',
    title: 'Pelatihan Dan Workshop Pemrograman Arduino & IoT Untuk Generasi Muda',
    category: 'Workshop',
    date: '1 Agustus 2026',
    excerpt: 'Para peserta antusias mempelajari cara membuat otomatisasi rumah pintar dan sensor jarak menggunakan modul AI Smart Life.',
    content: 'Workshop robotika pekan ini dihadiri puluhan peserta yang diajarkan langsung oleh tim trainer AIRO. Seluruh peserta mendapatkan kesempatan praktik langsung merakit hardware kinetik dan mengunggah kode program.',
    image: '/images/AI-Smart-Life.webp'
  },
  {
    id: 'berita-3',
    title: 'Peluncuran Modul Pembelajaran AI-Fantasy-Zoo Dan Robotika Kinetik',
    category: 'Kegiatan',
    date: '25 Juli 2026',
    excerpt: 'Inovasi kurikulum baru bertema hewan melatih kreativitas kinetik dan pemahaman rasio gir mekanis anak secara menyenangkan.',
    content: 'Modul AI-Fantasy-Zoo dirancang khusus untuk melatih kecerdasan spasial dan motorik anak melalui perakitan robot hewan interaktif.',
    image: '/images/AI-Fantasy-Zoo.webp'
  },
  {
    id: 'berita-4',
    title: 'Tim Mahasiswa FTI URINDO Raih Penghargaan Inovasi Teknologi Robotik',
    category: 'Prestasi',
    date: '18 Juli 2026',
    excerpt: 'Karya robotik berbasis kecerdasan buatan dari mahasiswa URINDO berhasil meraih peringkat terbaik dalam ajang kompetisi nasional.',
    content: 'Mahasiswa prodi Ilmu Komputer dan Sistem Informasi FTI URINDO kembali mengukir prestasi gemilang dengan menciptakan prototype lengan robot berbasis vision AI.',
    image: '/images/gallery_level_3.webp'
  }
];

export const INITIAL_POSTERS: PosterItem[] = [
  {
    id: 'poster-1',
    title: 'Poster 1',
    category: 'Modul Program',
    image: '/images/Poster-1.webp',
    description: 'Poster Modul Program Kelas Robotik AIRO FTI URINDO',
  },
  {
    id: 'poster-2',
    title: 'Poster 2',
    category: 'Pendaftaran Kelas',
    image: '/images/Poster-2.webp',
    description: 'Poster Informasi Pendaftaran Kelas Baru AIRO Robotics',
  },
];

export const INITIAL_LAYANAN: LayananItem[] = [
  {
    id: 'layanan-1',
    group: 'Paket Robotic',
    level: 'Level 1 • Pemula',
    title: 'Tema Animal (AI-Fantasy-Zoo)',
    price: 'Rp2.000.000',
    installment: 'Cicilan Rp500.000 / 4 Bulan',
    description: 'Membangun proyek robotik bertema hewan (Animal Robot) dengan mekanik dasar, gear system, dan pengenalan gerakan kinetik.',
    features: [
      'Kit Hardware: AI-Fantasy-Zoo Kit (Modul Kinetik & Gear Motor)',
      'Materi Utama: Pengenalan struktur mekanis, rasio gir, & keseimbangan robotik',
      'Fokus Keterampilan: Melatih kecerdasan spasial, motorik halus, & daya cipta anak',
      'Opsi Kemudahan: Dapat dicicil Rp500.000 / bulan selama 4 bulan',
    ],
    tags: ['mekanik', 'kinetik', 'level 1'],
    image: '/images/AI-Fantasy-Zoo.webp',
    buttonText: 'Pilih Paket Animal',
  },
  {
    id: 'layanan-2',
    group: 'Paket Robotic',
    level: 'Level 2 • Menengah',
    title: 'Tema Smart Life (AI-Smart-Life)',
    price: 'Rp2.000.000',
    installment: 'Cicilan Rp500.000 / 4 Bulan',
    description: 'Termasuk merancang & memprogram bertema smart life menggunakan sensor otomatisasi, deteksi hambatan, dan dasar sirkuit.',
    features: [
      'Kit Hardware: AI-Smart-Life Controller & Sensor Expansion',
      'Materi Utama: Pemrograman visual/block, deteksi sensor IR/Ultrasonic, & sistem otomatisasi',
      'Fokus Keterampilan: Logika algoritma bersyarat, problem solving, & otomatisasi pintar',
      'Opsi Kemudahan: Dapat dicicil Rp500.000 / bulan selama 4 bulan',
    ],
    tags: ['sensor', 'block code', 'level 2'],
    image: '/images/AI-Smart-Life.webp',
    buttonText: 'Pilih Paket Smart Life',
  },
  {
    id: 'layanan-3',
    group: 'Paket Robotic',
    level: 'Level 3 • Lanjutan',
    title: 'Advance Smart Life (Ukit-Advance)',
    price: 'Rp2.000.000',
    installment: 'Cicilan Rp500.000 / 4 Bulan',
    description: 'Membangun proyek Advance Smart Life dengan pembelajaran pemrograman yang lebih kompleks, logika bersyarat, dan integrasi IoT.',
    features: [
      'Kit Hardware: Ukit-Advance High-End Robotic Kit (Multi-Servo)',
      'Materi Utama: Pemrograman kompleks, kontrol multi-servo axis, sensor presisi, & AI/IoT dasar',
      'Fokus Keterampilan: Mekatronika murni, persiapan proyek inovasi, & persiapan kompetisi',
      'Opsi Kemudahan: Dapat dicicil Rp500.000 / bulan selama 4 bulan',
    ],
    tags: ['multi-servo', 'advance', 'level 3'],
    image: '/images/Ukit-Advance.webp',
    buttonText: 'Pilih Paket Advance',
  },
];
