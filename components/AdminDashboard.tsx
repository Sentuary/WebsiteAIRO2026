'use client';

import { useState } from 'react';
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

  // Form State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form Field States
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Kegiatan');
  const [formDate, setFormDate] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formInstitution, setFormInstitution] = useState('Universitas Respati Indonesia (URINDO)');
  const [formImage, setFormImage] = useState('');

  if (!isOpen) return null;

  // Handle Cloudinary Image Upload
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
    } catch (err: any) {
      setUploadError('Terjadi kesalahan koneksi saat mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  // Open Form Modal for Create or Edit
  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Kegiatan');
    setFormDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setFormExcerpt('');
    setFormContent('');
    setFormName('');
    setFormRole(activeTab === 'pengajar' ? 'Asisten Trainer' : 'Dosen / Staff FTI');
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

  // Helper to delete image from Cloudinary storage
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

  // Save Item (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset session idle timer on CRUD activity
    if (typeof window !== 'undefined') {
      localStorage.setItem('airo_last_activity', Date.now().toString());
    }

    if (activeTab === 'berita') {
      const id = editingItem ? editingItem.id : `berita-${Date.now()}`;
      const updatedData: BeritaItem = {
        id,
        title: formTitle,
        category: formCategory,
        date: formDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        excerpt: formExcerpt,
        content: formContent || formExcerpt,
        image: formImage || (editingItem ? editingItem.image : '/images/hero_robot.png'),
      };

      if (editingItem && editingItem.image && formImage && editingItem.image !== formImage) {
        deleteOldCloudinaryImage(editingItem.image);
      }

      setBeritaList((prev) =>
        editingItem ? prev.map((b) => (b.id === id ? updatedData : b)) : [updatedData, ...prev]
      );
      saveDocument('berita', id, updatedData);

    } else if (activeTab === 'pengajar') {
      const id = editingItem ? editingItem.id : `pengajar-${Date.now()}`;
      const updatedData: TeamMemberItem = {
        id,
        label: editingItem ? editingItem.label : `Pengajar ${pengajarList.length + 1}`,
        name: formName,
        role: formRole,
        institution: formInstitution,
        image: formImage || (editingItem ? editingItem.image : '/images/hero_robot.png'),
      };

      if (editingItem && editingItem.image && formImage && editingItem.image !== formImage) {
        deleteOldCloudinaryImage(editingItem.image);
      }

      setPengajarList((prev) =>
        editingItem ? prev.map((p) => (p.id === id ? updatedData : p)) : [...prev, updatedData]
      );
      saveDocument('pengajar', id, updatedData);

    } else if (activeTab === 'pembimbing') {
      const id = editingItem ? editingItem.id : `pembimbing-${Date.now()}`;
      const updatedData: TeamMemberItem = {
        id,
        label: editingItem ? editingItem.label : `Pembimbing ${pembimbingList.length + 1}`,
        name: formName,
        role: formRole,
        institution: formInstitution,
        image: formImage || (editingItem ? editingItem.image : '/images/hero_robot.png'),
      };

      if (editingItem && editingItem.image && formImage && editingItem.image !== formImage) {
        deleteOldCloudinaryImage(editingItem.image);
      }

      setPembimbingList((prev) =>
        editingItem ? prev.map((p) => (p.id === id ? updatedData : p)) : [...prev, updatedData]
      );
      saveDocument('pembimbing', id, updatedData);
    }

    setIsModalOpen(false);
  };

  // Delete Item
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    // Reset session idle timer on CRUD activity
    if (typeof window !== 'undefined') {
      localStorage.setItem('airo_last_activity', Date.now().toString());
    }

    if (activeTab === 'berita') {
      const itemToDelete = beritaList.find((b) => b.id === id);
      if (itemToDelete?.image) deleteOldCloudinaryImage(itemToDelete.image);
      setBeritaList((prev) => prev.filter((b) => b.id !== id));
      removeDocument('berita', id);

    } else if (activeTab === 'pengajar') {
      const itemToDelete = pengajarList.find((p) => p.id === id);
      if (itemToDelete?.image) deleteOldCloudinaryImage(itemToDelete.image);
      setPengajarList((prev) => prev.filter((p) => p.id !== id));
      removeDocument('pengajar', id);

    } else if (activeTab === 'pembimbing') {
      const itemToDelete = pembimbingList.find((p) => p.id === id);
      if (itemToDelete?.image) deleteOldCloudinaryImage(itemToDelete.image);
      setPembimbingList((prev) => prev.filter((p) => p.id !== id));
      removeDocument('pembimbing', id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Dashboard */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Dashboard Admin AIRO</h2>
              <p className="text-xs text-slate-400">Kelola Berita, Pengajar, Pembimbing & Upload Cloudinary</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Tutup Dashboard"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Add Button */}
        <div className="px-6 py-4 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('berita')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'berita'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              📰 Data Berita ({beritaList.length})
            </button>
            <button
              onClick={() => setActiveTab('pengajar')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pengajar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              👨‍🏫 Data Pengajar ({pengajarList.length})
            </button>
            <button
              onClick={() => setActiveTab('pembimbing')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pembimbing'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              🎓 Data Pembimbing ({pembimbingList.length})
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span>
            <span>Tambah {activeTab === 'berita' ? 'Berita' : activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing'} Baru</span>
          </button>
        </div>

        {/* Content Table & List Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          {activeTab === 'berita' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {beritaList.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[11px] text-slate-400 font-mono block">{item.date}</span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{item.excerpt}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'pengajar' || activeTab === 'pembimbing') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === 'pengajar' ? pengajarList : pembimbingList).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img src={item.image || '/images/hero_robot.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">
                      {item.label}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{item.role}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.institution}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold text-center"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold text-center"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'berita' ? 'Berita' : activeTab === 'pengajar' ? 'Pengajar' : 'Pembimbing'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {activeTab === 'berita' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Judul Berita *</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Masukkan judul berita..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kategori</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                      >
                        <option value="Kegiatan">Kegiatan</option>
                        <option value="Prestasi">Prestasi</option>
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tanggal</label>
                      <input
                        type="text"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        placeholder="Contoh: 5 Agustus 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Ringkasan Berita *</label>
                    <textarea
                      required
                      rows={3}
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      placeholder="Tulis ringkasan singkat berita..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Isi Lengkap Berita</label>
                    <textarea
                      rows={4}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Tulis isi berita selengkapnya..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50 resize-y"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Masukkan nama lengkap beserta gelar..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jabatan / Role *</label>
                    <input
                      type="text"
                      required
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="Contoh: Asisten Trainer / Dosen Tetap"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Institusi</label>
                    <input
                      type="text"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      placeholder="Universitas Respati Indonesia (URINDO)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                    />
                  </div>
                </>
              )}

              {/* Cloudinary Image Upload Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">Upload Foto ke Cloudinary</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-colors"
                  />
                  {isUploading && (
                    <span className="text-xs font-bold text-blue-600 animate-pulse shrink-0">Uploading...</span>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">{uploadError}</p>
                )}

                {/* Direct Image URL input or Preview */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Atau Gunakan URL Gambar / Preview:</span>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://res.cloudinary.com/... atau /images/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-[11px] font-mono focus:outline-none focus:border-blue-600 bg-slate-50"
                  />
                </div>

                {formImage && (
                  <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
