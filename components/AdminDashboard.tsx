'use client';

import { useState, useMemo, useEffect } from 'react';
import { saveDocument, removeDocument, formatImageSrc } from '@/lib/firebase';
import { INITIAL_LAYANAN, INITIAL_POSTERS } from '@/lib/initialData';

export interface BeritaItem {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface TeamMemberItem {
  id: string;
  label: string;
  name: string;
  role: string;
  institution: string;
  image: string;
}

export interface PosterItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
}

export interface LayananItem {
  id: string;
  group: string; // "Paket Robotic"
  level: string; // "Level 1 • Pemula"
  title: string; // "Tema Animal (AI-Fantasy-Zoo)"
  price: string; // "Rp2.000.000"
  installment?: string; // "Cicilan Rp500.000 / 4 Bulan"
  description: string;
  features: string[];
  tags: string[];
  image: string;
  buttonText?: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  beritaList: BeritaItem[];
  setBeritaList: React.Dispatch<React.SetStateAction<BeritaItem[]>>;
  pengajarList: TeamMemberItem[];
  setPengajarList: React.Dispatch<React.SetStateAction<TeamMemberItem[]>>;
  pembimbingList: TeamMemberItem[];
  setPembimbingList: React.Dispatch<React.SetStateAction<TeamMemberItem[]>>;
  layananList: LayananItem[];
  setLayananList: React.Dispatch<React.SetStateAction<LayananItem[]>>;
  posterList: PosterItem[];
  setPosterList: React.Dispatch<React.SetStateAction<PosterItem[]>>;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  onLogout,
  beritaList,
  setBeritaList,
  pengajarList,
  setPengajarList,
  pembimbingList,
  setPembimbingList,
  layananList,
  setLayananList,
  posterList,
  setPosterList,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'berita' | 'pengajar' | 'pembimbing' | 'layanan' | 'poster'>('berita');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // 1-Hour Session Countdown Timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const sessionStart = parseInt(localStorage.getItem('airo_session_start') || '0', 10);
      if (!sessionStart) {
        setRemainingSeconds(3600);
        return;
      }
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const left = Math.max(0, 3600 - elapsed);
      setRemainingSeconds(left);
      if (left <= 0) {
        onLogout();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  const formatRemainingTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form Fields - Berita & Team
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Kegiatan');
  const [formDate, setFormDate] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formInstitution, setFormInstitution] = useState('Universitas Respati Indonesia (URINDO)');
  const [formImage, setFormImage] = useState('');

  // Form Fields - Layanan (Paket Robotic)
  const [formGroup, setFormGroup] = useState('Paket Robotic');
  const [formLevel, setFormLevel] = useState('Level 1 • Pemula');
  const [formPrice, setFormPrice] = useState('Rp2.000.000');
  const [formInstallment, setFormInstallment] = useState('Cicilan Rp500.000 / 4 Bulan');
  const [formFeatures, setFormFeatures] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formButtonText, setFormButtonText] = useState('Pilih Paket');

  // Image uploader with automatic SVG conversion for direct Firestore storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormImage(data.url);
      } else {
        setUploadError(data.message || 'Gagal mengonversi gambar ke format SVG');
      }
    } catch {
      setUploadError('Terjadi kesalahan jaringan saat memproses gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setUploadError(null);

    // Reset base fields
    setFormTitle('');
    setFormCategory('Kegiatan');
    setFormDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setFormExcerpt('');
    setFormContent('');
    setFormName('');
    setFormRole(activeTab === 'pengajar' ? 'Asisten Trainer' : 'Dosen / Peneliti FTI');
    setFormInstitution('Universitas Respati Indonesia (URINDO)');
    setFormImage('');

    // Reset Layanan fields
    setFormGroup('Paket Robotic');
    setFormLevel('Level 1 • Pemula');
    setFormPrice('Rp2.000.000');
    setFormInstallment('Cicilan Rp500.000 / 4 Bulan');
    setFormFeatures('Kit Hardware: AI-Fantasy-Zoo Kit (Modul Kinetik & Gear Motor)\nMateri Utama: Pengenalan struktur mekanis, rasio gir, & keseimbangan robotik\nFokus Keterampilan: Melatih kecerdasan spasial, motorik halus, & daya cipta anak\nOpsi Kemudahan: Dapat dicicil Rp500.000 / bulan selama 4 bulan');
    setFormTags('mekanik, kinetik, level 1');
    setFormButtonText('Pilih Paket');

    if (activeTab === 'poster') {
      setFormCategory('Modul Program');
      setFormTitle(`Poster ${posterList.length + 1}`);
    }

    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setUploadError(null);

    if (activeTab === 'berita') {
      setFormTitle(item.title || '');
      setFormCategory(item.category || 'Kegiatan');
      setFormDate(item.date || '');
      setFormExcerpt(item.excerpt || '');
      setFormContent(item.content || '');
      setFormImage(item.image || '');
    } else if (activeTab === 'poster') {
      setFormTitle(item.title || '');
      setFormCategory(item.category || 'Modul Program');
      setFormExcerpt(item.description || '');
      setFormImage(item.image || '');
    } else if (activeTab === 'layanan') {
      setFormGroup(item.group || 'Paket Robotic');
      setFormLevel(item.level || 'Level 1 • Pemula');
      setFormTitle(item.title || '');
      setFormPrice(item.price || 'Rp2.000.000');
      setFormInstallment(item.installment || 'Cicilan Rp500.000 / 4 Bulan');
      setFormExcerpt(item.description || '');
      setFormFeatures(Array.isArray(item.features) ? item.features.join('\n') : '');
      setFormTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
      setFormButtonText(item.buttonText || 'Pilih Paket');
      setFormImage(item.image || '');
    } else {
      setFormName(item.name || '');
      setFormRole(item.role || '');
      setFormInstitution(item.institution || '');
      setFormImage(item.image || '');
    }

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;

    if (activeTab === 'berita') {
      const updatedItem: BeritaItem = {
        id: editingItem ? editingItem.id : `berita-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        date: formDate,
        excerpt: formExcerpt,
        content: formContent,
        image: formImage || editingItem?.image || '/images/hero_robot.webp',
      };

      setBeritaList((prev) => {
        return editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [updatedItem, ...prev];
      });

      success = await saveDocument('berita', updatedItem.id, updatedItem);

    } else if (activeTab === 'pengajar') {
      const updatedItem: TeamMemberItem = {
        id: editingItem ? editingItem.id : `pengajar-${Date.now()}`,
        label: editingItem ? editingItem.label : `Pengajar ${pengajarList.length + 1}`,
        name: formName,
        role: formRole,
        institution: formInstitution,
        image: formImage || editingItem?.image || '/images/hero_robot.webp',
      };

      setPengajarList((prev) => {
        return editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [...prev, updatedItem];
      });

      success = await saveDocument('pengajar', updatedItem.id, updatedItem);

    } else if (activeTab === 'pembimbing') {
      const updatedItem: TeamMemberItem = {
        id: editingItem ? editingItem.id : `pembimbing-${Date.now()}`,
        label: editingItem ? editingItem.label : `Pembimbing ${pembimbingList.length + 1}`,
        name: formName,
        role: formRole,
        institution: formInstitution,
        image: formImage || editingItem?.image || '/images/hero_robot.webp',
      };

      setPembimbingList((prev) => {
        return editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [...prev, updatedItem];
      });

      success = await saveDocument('pembimbing', updatedItem.id, updatedItem);

    } else if (activeTab === 'poster') {
      const updatedItem: PosterItem = {
        id: editingItem ? editingItem.id : `poster-${Date.now()}`,
        title: formTitle || `Poster ${posterList.length + 1}`,
        category: formCategory || 'Modul Program',
        description: formExcerpt || '',
        image: formImage || editingItem?.image || '/images/Poster-1.webp',
      };

      setPosterList((prev) => {
        return editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [...prev, updatedItem];
      });

      success = await saveDocument('posters', updatedItem.id, updatedItem);

    } else if (activeTab === 'layanan') {
      const parsedFeatures = formFeatures
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const parsedTags = formTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const updatedItem: LayananItem = {
        id: editingItem ? editingItem.id : `layanan-${Date.now()}`,
        group: formGroup || 'Paket Robotic',
        level: formLevel || 'Level 1 • Pemula',
        title: formTitle,
        price: formPrice,
        installment: formInstallment,
        description: formExcerpt,
        features: parsedFeatures,
        tags: parsedTags,
        buttonText: formButtonText || 'Pilih Paket',
        image: formImage || editingItem?.image || '/images/AI-Fantasy-Zoo.webp',
      };

      setLayananList((prev) => {
        return editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [...prev, updatedItem];
      });

      success = await saveDocument('layanan', updatedItem.id, updatedItem);
    }

    if (!success) {
      alert('Perhatian: Gagal menyimpan data ke Firestore Database. Pastikan Firestore Security Rules di Firebase Console mengizinkan operasi tulis (write).');
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id } = itemToDelete;

    let success = false;

    if (activeTab === 'berita') {
      setBeritaList((prev) => prev.filter((b) => b.id !== id));
      success = await removeDocument('berita', id);
    } else if (activeTab === 'pengajar') {
      setPengajarList((prev) => prev.filter((p) => p.id !== id));
      success = await removeDocument('pengajar', id);
    } else if (activeTab === 'pembimbing') {
      setPembimbingList((prev) => prev.filter((p) => p.id !== id));
      success = await removeDocument('pembimbing', id);
    } else if (activeTab === 'poster') {
      setPosterList((prev) => prev.filter((p) => p.id !== id));
      success = await removeDocument('posters', id);
    } else if (activeTab === 'layanan') {
      setLayananList((prev) => prev.filter((l) => l.id !== id));
      success = await removeDocument('layanan', id);
    }

    if (!success) {
      alert('Perhatian: Gagal menghapus data dari Firestore Database. Pastikan Firestore Security Rules di Firebase Console mengizinkan operasi delete.');
    }

    setItemToDelete(null);
  };

  // Seed default template helpers
  const handleSeedDefaultLayanan = async () => {
    if (!confirm('Apakah Anda yakin ingin memuat 3 paket default "Paket Robotic" ke Firebase?')) return;
    for (const item of INITIAL_LAYANAN) {
      await saveDocument('layanan', item.id, item);
    }
    setLayananList(INITIAL_LAYANAN);
    alert('Berhasil memuat 3 paket "Paket Robotic" ke Firebase!');
  };

  const handleSeedDefaultPosters = async () => {
    if (!confirm('Apakah Anda yakin ingin memuat 2 poster default ke Firebase?')) return;
    for (const item of INITIAL_POSTERS) {
      await saveDocument('posters', item.id, item);
    }
    setPosterList(INITIAL_POSTERS);
    alert('Berhasil memuat 2 poster default ke Firebase!');
  };

  // Filtered lists based on search & category
  const filteredBerita = useMemo(() => {
    return beritaList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [beritaList, searchQuery, categoryFilter]);

  const filteredPengajar = useMemo(() => {
    return pengajarList.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [pengajarList, searchQuery]);

  const filteredPembimbing = useMemo(() => {
    return pembimbingList.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [pembimbingList, searchQuery]);

  const filteredLayanan = useMemo(() => {
    return layananList.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [layananList, searchQuery]);

  const filteredPosters = useMemo(() => {
    return posterList.filter((item) => {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [posterList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans antialiased">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Top Header Bar - Flat Design */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Panel Administrasi Konten
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  FTI URINDO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kelola publikasi berita, paket robotic, poster promosi, dan profil tim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Flat Session Expiration Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sesi: {formatRemainingTime(remainingSeconds)}</span>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              Keluar
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs transition-colors"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation - Flat Underline */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('berita');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'berita'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Berita & Kegiatan</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {beritaList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('layanan');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'layanan'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Paket Layanan</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
              {layananList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('poster');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'poster'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Poster Promosi</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {posterList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pengajar');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pengajar'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Tenaga Pengajar</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {pengajarList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pembimbing');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'pembimbing'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Dosen Pembimbing</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {pembimbingList.length}
            </span>
          </button>
        </div>

        {/* Action Toolbar - Flat Design */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'berita'
                  ? 'Cari judul atau isi berita...'
                  : activeTab === 'layanan'
                  ? 'Cari judul, grup (Paket Robotic), atau level...'
                  : activeTab === 'poster'
                  ? 'Cari judul poster atau kategori...'
                  : 'Cari nama, peran, atau institusi...'
              }
              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />

            {activeTab === 'berita' && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 shrink-0"
              >
                <option value="ALL">Semua</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Prestasi">Prestasi</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Workshop">Workshop</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'layanan' && layananList.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaultLayanan}
                className="px-3 py-1.5 rounded border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                + Muat 3 Paket Robotic Awal
              </button>
            )}

            {activeTab === 'poster' && posterList.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaultPosters}
                className="px-3 py-1.5 rounded border border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
              >
                + Muat 2 Poster Awal
              </button>
            )}

            <button
              onClick={openCreateModal}
              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>+</span>
              <span>
                Tambah {activeTab === 'berita' ? 'Berita' : activeTab === 'layanan' ? 'Paket Layanan' : activeTab === 'poster' ? 'Poster' : activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Table - Flat Clean Rows */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/40 dark:bg-slate-950">
          
          {/* TAB BERITA */}
          {activeTab === 'berita' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-16">Foto</th>
                      <th className="py-2.5 px-3.5">Judul & Ringkasan</th>
                      <th className="py-2.5 px-3.5 w-36 whitespace-nowrap">Kategori</th>
                      <th className="py-2.5 px-3.5 w-32 whitespace-nowrap">Tanggal</th>
                      <th className="py-2.5 px-3.5 w-24 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBerita.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Tidak ada data berita yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredBerita.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="w-12 h-9 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img src={formatImageSrc(item.image)} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.excerpt}</p>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-semibold font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900 whitespace-nowrap">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-400">{item.date}</td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                              className="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold ml-1"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB PAKET LAYANAN (GRUP PAKET ROBOTIC) */}
          {activeTab === 'layanan' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-16">Foto</th>
                      <th className="py-2.5 px-3.5">Judul Paket & Level</th>
                      <th className="py-2.5 px-3.5 w-36 whitespace-nowrap">Grup</th>
                      <th className="py-2.5 px-3.5 w-36 whitespace-nowrap">Harga & Cicilan</th>
                      <th className="py-2.5 px-3.5 w-24 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredLayanan.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Belum ada paket layanan. Klik &quot;+ Muat 3 Paket Robotic Awal&quot; atau &quot;+ Tambah Paket Layanan&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredLayanan.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="w-12 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img src={formatImageSrc(item.image)} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100">{item.title}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900 whitespace-nowrap">
                                {item.level}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-blue-600 text-white uppercase tracking-wider whitespace-nowrap shadow-xs">
                              {item.group || 'Paket Robotic'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle whitespace-nowrap">
                            <p className="font-extrabold font-mono text-slate-900 dark:text-white">{item.price}</p>
                            {item.installment && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{item.installment}</p>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                              className="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold ml-1"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB POSTER */}
          {activeTab === 'poster' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-16">Foto</th>
                      <th className="py-2.5 px-3.5">Judul Poster</th>
                      <th className="py-2.5 px-3.5 w-40 whitespace-nowrap">Kategori</th>
                      <th className="py-2.5 px-3.5">Deskripsi</th>
                      <th className="py-2.5 px-3.5 w-24 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPosters.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Belum ada poster. Klik &quot;+ Muat 2 Poster Awal&quot; atau &quot;+ Tambah Poster&quot;.
                        </td>
                      </tr>
                    ) : (
                      filteredPosters.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="w-12 h-14 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img src={formatImageSrc(item.image)} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </td>
                          <td className="py-2.5 px-3.5 align-middle whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-semibold font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900 whitespace-nowrap">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">
                            {item.description || '-'}
                          </td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                              className="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold ml-1"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB TENAGA PENGAJAR */}
          {activeTab === 'pengajar' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-16">Foto</th>
                      <th className="py-2.5 px-3.5">Nama & Gelar</th>
                      <th className="py-2.5 px-3.5">Peran / Jabatan</th>
                      <th className="py-2.5 px-3.5">Institusi</th>
                      <th className="py-2.5 px-3.5 w-24 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPengajar.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Tidak ada data pengajar yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredPengajar.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img src={formatImageSrc(item.image)} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 font-medium">{item.role}</td>
                          <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">{item.institution}</td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.name })}
                              className="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold ml-1"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB DOSEN PEMBIMBING */}
          {activeTab === 'pembimbing' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-16">Foto</th>
                      <th className="py-2.5 px-3.5">Nama & Gelar</th>
                      <th className="py-2.5 px-3.5">Peran / Jabatan</th>
                      <th className="py-2.5 px-3.5">Institusi</th>
                      <th className="py-2.5 px-3.5 w-24 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPembimbing.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Tidak ada data pembimbing yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredPembimbing.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img src={formatImageSrc(item.image)} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 font-medium">{item.role}</td>
                          <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400">{item.institution}</td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.name })}
                              className="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold ml-1"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded border border-slate-200 dark:border-slate-800 p-5 text-slate-900 dark:text-slate-100 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Konfirmasi Penghapusan</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus data <strong className="text-slate-900 dark:text-white">&quot;{itemToDelete.title}&quot;</strong>? Perubahan ini akan langsung diperbarui di database Firebase.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Form Modal for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {editingItem ? 'Edit Data' : 'Tambah Data'}: {
                  activeTab === 'berita'
                    ? 'Berita & Kegiatan'
                    : activeTab === 'layanan'
                    ? 'Paket Layanan (Paket Robotic)'
                    : activeTab === 'poster'
                    ? 'Poster Promosi'
                    : activeTab === 'pengajar'
                    ? 'Tenaga Pengajar'
                    : 'Dosen Pembimbing'
                }
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 max-h-[78vh] overflow-y-auto text-xs">
              
              {/* FORM BERITA */}
              {activeTab === 'berita' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Judul Berita *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Masukkan judul berita..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      >
                        <option value="Kegiatan">Kegiatan</option>
                        <option value="Prestasi">Prestasi</option>
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal</label>
                      <input
                        type="text"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        placeholder="Contoh: 15 Agustus 2026"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Ringkasan Singkat (Excerpt) *</label>
                    <textarea
                      required
                      rows={2}
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      placeholder="Ringkasan 1-2 kalimat..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Konten Lengkap Berita</label>
                    <textarea
                      rows={4}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Isi berita lengkap..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y"
                    />
                  </div>
                </>
              )}

              {/* FORM PAKET LAYANAN */}
              {activeTab === 'layanan' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Grup Paket *</label>
                      <input
                        type="text"
                        required
                        value={formGroup}
                        onChange={(e) => setFormGroup(e.target.value)}
                        placeholder="Paket Robotic"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-bold"
                      />
                      <span className="text-[10px] text-slate-400">Gunakan &quot;Paket Robotic&quot; agar masuk 1 grup</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Level / Tingkatan *</label>
                      <input
                        type="text"
                        required
                        value={formLevel}
                        onChange={(e) => setFormLevel(e.target.value)}
                        placeholder="Contoh: Level 1 • Pemula"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Judul Paket *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Contoh: Tema Animal (AI-Fantasy-Zoo)"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Harga Paket *</label>
                      <input
                        type="text"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="Contoh: Rp2.000.000"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Skema Cicilan / Catatan</label>
                      <input
                        type="text"
                        value={formInstallment}
                        onChange={(e) => setFormInstallment(e.target.value)}
                        placeholder="Contoh: Cicilan Rp500.000 / 4 Bulan"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Deskripsi Paket *</label>
                    <textarea
                      required
                      rows={2}
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      placeholder="Deskripsi singkat materi dan capaian paket..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Poin Fitur / Materi Pembelajaran (1 baris per poin)</label>
                    <textarea
                      rows={4}
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      placeholder="Kit Hardware: AI-Fantasy-Zoo Kit (Modul Kinetik & Gear Motor)&#10;Materi Utama: Pengenalan struktur mekanis, rasio gir, & keseimbangan&#10;Fokus Keterampilan: Melatih kecerdasan spasial & daya cipta&#10;Opsi Kemudahan: Dapat dicicil Rp500.000 / bulan selama 4 bulan"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y font-mono text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Tags / Kata Kunci (Pisahkan koma)</label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="mekanik, kinetik, level 1"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Teks Tombol CTA</label>
                      <input
                        type="text"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        placeholder="Pilih Paket Animal"
                        className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM POSTER */}
              {activeTab === 'poster' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Judul Poster *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Contoh: Poster 1 - Modul Program"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Kategori / Label Poster</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="Contoh: Modul Program atau Pendaftaran Kelas"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Deskripsi / Catatan Singkat</label>
                    <textarea
                      rows={2}
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      placeholder="Deskripsi singkat mengenai informasi poster ini..."
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y"
                    />
                  </div>
                </>
              )}

              {/* FORM TEAM (PENGAJAR / PEMBIMBING) */}
              {(activeTab === 'pengajar' || activeTab === 'pembimbing') && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Ramadhani Ulansari, S.Kom., M.T"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Jabatan / Role *</label>
                    <input
                      type="text"
                      required
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="Contoh: Asisten Trainer atau Dosen FTI"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Institusi</label>
                    <input
                      type="text"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      placeholder="Universitas Respati Indonesia (URINDO)"
                      className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* Image Upload Area - Auto-converts to SVG */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Unggah Gambar (Otomatis Dikonversi &amp; Disimpan sebagai Format SVG ke Firebase)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 transition-colors"
                  />
                  {isUploading && (
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 shrink-0">Memproses SVG...</span>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{uploadError}</p>
                )}

                {formImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-16 h-14 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={formatImageSrc(formImage)} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
                        ✓ Gambar format SVG siap disimpan ke Firestore
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Direct Document Storage (Zero Blob Delay)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
