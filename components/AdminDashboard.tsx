'use client';

import { useState, useMemo, useEffect } from 'react';
import { saveDocument, removeDocument, formatImageSrc } from '@/lib/firebase';

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
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'berita' | 'pengajar' | 'pembimbing'>('berita');
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

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Kegiatan');
  const [formDate, setFormDate] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formInstitution, setFormInstitution] = useState('Universitas Respati Indonesia (URINDO)');
  const [formImage, setFormImage] = useState('');

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
    setFormTitle('');
    setFormCategory('Kegiatan');
    setFormDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setFormExcerpt('');
    setFormContent('');
    setFormName('');
    setFormRole(activeTab === 'pengajar' ? 'Asisten Trainer' : 'Dosen / Peneliti FTI');
    setFormInstitution('Universitas Respati Indonesia (URINDO)');
    setFormImage('');
    setUploadError(null);
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
        const next = editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [updatedItem, ...prev];
        return next;
      });

      await saveDocument('berita', updatedItem.id, updatedItem);

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
        const next = editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [...prev, updatedItem];
        return next;
      });

      await saveDocument('pengajar', updatedItem.id, updatedItem);

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
        const next = editingItem
          ? prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
          : [...prev, updatedItem];
        return next;
      });

      await saveDocument('pembimbing', updatedItem.id, updatedItem);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id } = itemToDelete;

    if (activeTab === 'berita') {
      setBeritaList((prev) => prev.filter((b) => b.id !== id));
      removeDocument('berita', id);
    } else if (activeTab === 'pengajar') {
      setPengajarList((prev) => prev.filter((p) => p.id !== id));
      removeDocument('pengajar', id);
    } else if (activeTab === 'pembimbing') {
      setPembimbingList((prev) => prev.filter((p) => p.id !== id));
      removeDocument('pembimbing', id);
    }

    setItemToDelete(null);
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
                Kelola publikasi berita, dokumentasi kegiatan, dan profil tim
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
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('berita');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
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
              setActiveTab('pengajar');
              setSearchQuery('');
            }}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
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
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
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

          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>+</span>
            <span>
              Tambah {activeTab === 'berita' ? 'Berita' : activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing'}
            </span>
          </button>
        </div>

        {/* Content Table - Flat Clean Rows */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/40 dark:bg-slate-950">
          {activeTab === 'berita' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-16">Foto</th>
                      <th className="py-2.5 px-3.5">Judul & Ringkasan</th>
                      <th className="py-2.5 px-3.5 w-24">Kategori</th>
                      <th className="py-2.5 px-3.5 w-28">Tanggal</th>
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
                              <img
                                src={formatImageSrc(item.image)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/images/hero_robot.webp';
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {item.excerpt}
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {item.date}
                          </td>
                          <td className="py-2.5 px-3.5 align-middle text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                              className="px-2 py-1 rounded text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
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

          {(activeTab === 'pengajar' || activeTab === 'pembimbing') && (
            <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-3.5 w-14">Foto</th>
                      <th className="py-2.5 px-3.5">Nama Lengkap</th>
                      <th className="py-2.5 px-3.5">Peran / Jabatan</th>
                      <th className="py-2.5 px-3.5">Institusi</th>
                      <th className="py-2.5 px-3.5 w-24 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(activeTab === 'pengajar' ? filteredPengajar : filteredPembimbing).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
                          Tidak ada data profil yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      (activeTab === 'pengajar' ? filteredPengajar : filteredPembimbing).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img
                                src={formatImageSrc(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/images/hero_robot.webp';
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 align-middle font-medium text-slate-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3.5 align-middle text-slate-600 dark:text-slate-400">
                            {item.role}
                          </td>
                          <td className="py-2.5 px-3.5 align-middle text-slate-500 dark:text-slate-400">
                            {item.institution}
                          </td>
                          <td className="py-2.5 px-3.5 align-middle text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.name })}
                              className="px-2 py-1 rounded text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
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
      </div>

      {/* Confirmation Dialog for Delete - Flat Design */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded border border-slate-200 dark:border-slate-800 p-5 text-slate-900 dark:text-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              Hapus Data
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <strong className="text-slate-900 dark:text-slate-100">&ldquo;{itemToDelete.title}&rdquo;</strong>? Dokumen ini akan langsung dihapus dari Firebase.
            </p>
            <div className="flex items-center justify-end gap-2">
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
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal for Create & Edit - Flat Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {editingItem ? 'Edit Data' : 'Tambah Data'}: {activeTab === 'berita' ? 'Berita & Kegiatan' : activeTab === 'pengajar' ? 'Tenaga Pengajar' : 'Dosen Pembimbing'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 max-h-[78vh] overflow-y-auto text-xs">
              {activeTab === 'berita' ? (
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
              ) : (
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
                  Unggah Gambar (Otomatis Dikonversi ke Format SVG)
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
                    <div className="w-16 h-12 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                      <img src={formatImageSrc(formImage)} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ✓ Gambar siap disimpan ke Firestore
                    </span>
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
