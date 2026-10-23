'use client';

import { useState, useMemo } from 'react';
import { saveDocument, removeDocument } from '@/lib/firebase';

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

  // Cloudinary image uploader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `AIRO/${activeTab}`);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormImage(data.url);
      } else {
        setUploadError(data.message || 'Gagal mengunggah gambar ke Cloudinary');
      }
    } catch {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOldCloudinaryImage = async (imageUrl?: string) => {
    if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      });
    } catch (err) {
      console.error('Failed to delete old image from Cloudinary:', err);
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
        image: formImage || '/images/hero_robot.png',
      };

      if (editingItem && editingItem.image && editingItem.image !== formImage) {
        deleteOldCloudinaryImage(editingItem.image);
      }

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
        image: formImage || editingItem?.image || '/images/hero_robot.png',
      };

      if (editingItem && editingItem.image && formImage && editingItem.image !== formImage) {
        deleteOldCloudinaryImage(editingItem.image);
      }

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
        image: formImage || editingItem?.image || '/images/hero_robot.png',
      };

      if (editingItem && editingItem.image && formImage && editingItem.image !== formImage) {
        deleteOldCloudinaryImage(editingItem.image);
      }

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
      const item = beritaList.find((b) => b.id === id);
      if (item?.image) deleteOldCloudinaryImage(item.image);
      setBeritaList((prev) => prev.filter((b) => b.id !== id));
      removeDocument('berita', id);
    } else if (activeTab === 'pengajar') {
      const item = pengajarList.find((p) => p.id === id);
      if (item?.image) deleteOldCloudinaryImage(item.image);
      setPengajarList((prev) => prev.filter((p) => p.id !== id));
      removeDocument('pengajar', id);
    } else if (activeTab === 'pembimbing') {
      const item = pembimbingList.find((p) => p.id === id);
      if (item?.image) deleteOldCloudinaryImage(item.image);
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
    <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100 shadow-sm">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Admin Console</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  FTI URINDO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pengelolaan konten berita, kegiatan, dan profil tim AIRO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-950/80 transition-colors"
            >
              Keluar
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm transition-colors"
              aria-label="Tutup Console"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setActiveTab('berita');
              setSearchQuery('');
            }}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'berita'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Berita & Kegiatan</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {beritaList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pengajar');
              setSearchQuery('');
            }}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pengajar'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Tenaga Pengajar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {pengajarList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pembimbing');
              setSearchQuery('');
            }}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pembimbing'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Dosen Pembimbing</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {pembimbingList.length}
            </span>
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'berita'
                    ? 'Cari judul berita atau ringkasan...'
                    : 'Cari nama, jabatan, atau institusi...'
                }
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
            </div>

            {activeTab === 'berita' && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 shrink-0"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Prestasi">Prestasi</option>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Workshop">Workshop</option>
              </select>
            )}
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>+</span>
            <span>
              Tambah {activeTab === 'berita' ? 'Berita' : activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing'}
            </span>
          </button>
        </div>

        {/* Content Table / Flat List View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950">
          {activeTab === 'berita' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-4 w-16">Media</th>
                      <th className="py-2.5 px-4">Judul & Ringkasan</th>
                      <th className="py-2.5 px-4 w-28">Kategori</th>
                      <th className="py-2.5 px-4 w-32">Tanggal</th>
                      <th className="py-2.5 px-4 w-28 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredBerita.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Tidak ada data berita yang sesuai dengan kriteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBerita.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 align-top">
                            <div className="w-14 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top">
                            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-0.5">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {item.excerpt}
                            </div>
                          </td>
                          <td className="py-3 px-4 align-top">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 align-top font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 align-top text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1 rounded text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.title })}
                              className="px-2.5 py-1 rounded text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-medium transition-colors"
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
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                      <th className="py-2.5 px-4 w-14">Foto</th>
                      <th className="py-2.5 px-4">Nama Lengkap</th>
                      <th className="py-2.5 px-4">Jabatan / Role</th>
                      <th className="py-2.5 px-4">Institusi</th>
                      <th className="py-2.5 px-4 w-28 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(activeTab === 'pengajar' ? filteredPengajar : filteredPembimbing).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Tidak ada data profil yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      (activeTab === 'pengajar' ? filteredPengajar : filteredPembimbing).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 align-middle">
                            <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img
                                src={item.image || '/images/hero_robot.png'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 align-middle font-medium text-slate-900 dark:text-white">
                            <div>{item.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{item.label}</span>
                          </td>
                          <td className="py-3 px-4 align-middle text-slate-600 dark:text-slate-300">
                            {item.role}
                          </td>
                          <td className="py-3 px-4 align-middle text-slate-500 dark:text-slate-400">
                            {item.institution}
                          </td>
                          <td className="py-3 px-4 align-middle text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1 rounded text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setItemToDelete({ id: item.id, title: item.name })}
                              className="px-2.5 py-1 rounded text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-medium transition-colors"
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

      {/* Confirmation Dialog for Delete */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-slate-900 dark:text-slate-100">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Konfirmasi Penghapusan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-slate-900 dark:text-slate-200">&ldquo;{itemToDelete.title}&rdquo;</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {editingItem ? 'Edit Data' : 'Tambah Data'}: {activeTab === 'berita' ? 'Berita & Kegiatan' : activeTab === 'pengajar' ? 'Tenaga Pengajar' : 'Dosen Pembimbing'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
              {activeTab === 'berita' ? (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Judul Berita *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Masukkan judul berita atau kegiatan..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                      >
                        <option value="Kegiatan">Kegiatan</option>
                        <option value="Prestasi">Prestasi</option>
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Tanggal Kegiatan</label>
                      <input
                        type="text"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        placeholder="Contoh: 15 Agustus 2026"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
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
                      placeholder="Ringkasan 1-2 kalimat untuk preview..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Konten Lengkap Berita</label>
                    <textarea
                      rows={5}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Isi berita lengkap..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-y"
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
                      placeholder="Contoh: Dr. Ir. Fulan, M.Kom."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Jabatan / Role *</label>
                    <input
                      type="text"
                      required
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="Contoh: Asisten Trainer Robotika atau Dosen FTI"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Institusi</label>
                    <input
                      type="text"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      placeholder="Universitas Respati Indonesia (URINDO)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* Image Upload Area */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Foto / Gambar Cover
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 transition-colors"
                  />
                  {isUploading && (
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 shrink-0">Mengunggah...</span>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{uploadError}</p>
                )}

                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Atau masukkan URL gambar langsung:</span>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/... atau /images/..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-[11px] focus:outline-none focus:border-blue-600"
                  />
                </div>

                {formImage && (
                  <div className="mt-2 w-20 h-14 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
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
