'use client';

import { useState, useEffect } from "react";

interface FormData {
  name: string;
  phone: string;
  package: string;
  message: string;
}

export default function RobotikaLandingPage() {
  // State untuk Mobile Menu Navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // State untuk Sticky Header Scroll Effectf
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // State untuk Contact Form Data Integration
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    package: 'Pilih Paket Kelas',
    message: '',
  });

  // Handle detection on scroll to add visual style to Header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle text input change for interactive contact form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to map selection trigger from pricing cards directly into form
  const selectPackage = (packageName: string) => {
    setFormData((prev) => ({
      ...prev,
      package: packageName,
    }));
    // Smooth scrolling redirect directly into contact module section box
    const contactSection = document.getElementById('kontak');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Handler that automatically builds customized WhatsApp message pipeline link
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const phoneNumber = "6281234567890"; // TODO: Ganti dengan nomor WhatsApp admin tujuan Anda
    const waMessage = `Halo JMK Robotics Lab,\n\nSaya ingin memesan kelas dengan rincian berikut:\n• Nama: ${formData.name}\n• No. WA/Telepon: ${formData.phone}\n• Pilihan Paket: ${formData.package}\n• Catatan Tambahan: ${formData.message}`;
    
    const encodedMessage = encodeURIComponent(waMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ========================================== */}
      {/* HEADER & NAVBAR               */}
      {/* ========================================== */}
      <header 
        className={`fixed top-0 left-0 right-0 h-20 border-b z-50 px-4 sm:px-8 flex items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md border-slate-200 shadow-sm' 
            : 'bg-white/80 backdrop-blur-md border-slate-200/80'
        }`}
      >
        {/* Logo Branding Icon Dashboard Link */}
        <a href="#beranda" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            {/* Robotic Brain Grid System Vector Graph Icon */}
            <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
              <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
              <path d="M12 6V2M9 2h6M12 11V6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Jasa Mengajar Robotika
            </span>
            <span className="text-[9px] text-blue-500 font-mono tracking-widest uppercase font-semibold">JMK Robotics Lab</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#beranda" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Beranda</a>
          <a href="#tentang" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Tentang Kami</a>
          <a href="#layanan" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Layanan</a>
          <a href="#galeri" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Galeri</a>
          <a href="#kontak" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Kontak</a>
        </nav>

        {/* Action Right CTA Context Button Component Header */}
        <div className="hidden md:block">
          <a href="#kontak" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-all shadow-sm">
            Hubungi Kami
          </a>
        </div>

        {/* Toggle Mobile Menu Controller Layout Trigger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" 
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Mobile Navigation Sidebar Drawer Component Drawer Overlay Layout */}
      <div className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-sm font-bold text-slate-800">Navigasi Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-4">
          <a href="#beranda" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Beranda</a>
          <a href="#tentang" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Tentang Kami</a>
          <a href="#layanan" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Layanan</a>
          <a href="#galeri" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Galeri</a>
          <a href="#kontak" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Kontak</a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100">
          <a href="#kontak" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-md shadow-blue-600/10">
            Daftar Kelas Sekarang
          </a>
        </div>
      </div>

      {/* Backdrop Background Mask Component Shadow Box for Drawer closing triggers */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* ========================================== */}
      {/* HERO SECTION                */}
      {/* ========================================== */}
      <main className="flex-1">
        <section id="beranda" className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
          <div className="bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl shadow-blue-500/10 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
            
            {/* Decorative Cyber Space Graphic Vectors Background Nodes */}
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 border border-white/10 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5 border border-white/10 pointer-events-none" />

            {/* Left Content Context Information Header Module Block */}
            <div className="flex-1 flex flex-col items-start text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pembelajaran Terbuka 2026
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Jasa Mengajar Robotika untuk Pemula hingga Kompetisi
              </h1>
              
              <p className="text-white/90 text-sm sm:text-base mt-6 leading-relaxed max-w-xl">
                Belajar robotika dari nol dengan mentor berpengalaman, kurikulum terstruktur, dan pembelajaran interaktif langsung menggunakan kit fisik yang modern.
              </p>
              
              {/* Hero Call to Action Navigation Matrix UI Layout Element Row Block */}
              <div className="mt-8 flex flex-wrap gap-4 w-full sm:w-auto">
                <a href="#layanan" className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-bold text-sm tracking-wide text-center transition-all shadow-md hover:shadow-lg active:scale-95">
                  Lihat Program
                </a>
                <a href="#kontak" className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide text-center transition-all shadow-md active:scale-95">
                  Daftar Kelas
                </a>
              </div>
              
              <a href="#kontak" className="group mt-6 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                Hubungi Kami 
                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
            
            {/* Right Graphic Media Container Showcase Component Grid Display */}
            <div className="flex-1 w-full flex justify-center items-center relative z-10">
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm group">
                <img 
                  src="/images/hero_robot.png" 
                  alt="Edu Robot Illustration" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* HARGA & PAKET LAYANAN            */}
        {/* ========================================== */}
        <section id="layanan" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Harga & Paket Singkat
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Layanan Mingguan/Bulanan. Untuk diskon/kelas khusus, cek kontak di bawah.
            </p>
          </div>

          {/* Pricing Grid Package Node Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Animal Package Integration Module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
              <div className="h-44 bg-slate-100 flex items-center justify-center border-b border-slate-200/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-50 to-blue-50/30" />
                <div className="relative w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.54-1.037-7.614-2.766m15.372 0a11.962 11.962 0 010 8.532M4.386 7.734a11.963 11.963 0 000 8.532m0 0A11.953 11.953 0 0112 13.5c2.905 0 5.54 1.037 7.614 2.766" />
                  </svg>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mulai dari</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-mono">Rp1.500.000</h3>
                  <h4 className="text-lg font-bold text-slate-800 mt-4">Tema Animal</h4>
                  <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
                    Membangun proyek robotik bertema hewan (Animal Robot) dengan mekanik dasar, gear system, dan pengenalan gerakan kinetik.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">mekanik</span>
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">level 1</span>
                  </div>
                  <button 
                    onClick={() => selectPackage('Tema Animal (Rp1.500.000)')}
                    className="block w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-700 hover:text-blue-600 font-bold text-xs text-center transition-all"
                  >
                    Pilih Paket
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Smart Life Automation Concept Component Module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
              <div className="h-44 bg-slate-100 flex items-center justify-center border-b border-slate-200/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-50 to-indigo-50/30" />
                <div className="relative w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mulai dari</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-mono">Rp2.500.000</h3>
                  <h4 className="text-lg font-bold text-slate-800 mt-4">Tema Smart Life</h4>
                  <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
                    Termasuk merancang & memprogram bertema smart life menggunakan sensor otomatisasi, deteksi hambatan, dan dasar sirkuit.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">sensor</span>
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">level 2</span>
                  </div>
                  <button 
                    onClick={() => selectPackage('Tema Smart Life (Rp2.500.000)')}
                    className="block w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-700 hover:text-blue-600 font-bold text-xs text-center transition-all"
                  >
                    Pilih Paket
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Advanced Microcontroller Circuit Programming Stack */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
              <div className="h-44 bg-slate-100 flex items-center justify-center border-b border-slate-200/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 to-pink-50/30" />
                <div className="relative w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mulai dari</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-mono">Rp3.500.000</h3>
                  <h4 className="text-lg font-bold text-slate-800 mt-4">Advance Smart Life</h4>
                  <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
                    Membangun proyek Advance Smart Life dengan pembelajaran pemrograman yang lebih kompleks, logika bersyarat, dan integrasi IoT.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">complex</span>
                    <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">level 3</span>
                  </div>
                  <button 
                    onClick={() => selectPackage('Advance Smart Life (Rp3.500.000)')}
                    className="block w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 text-slate-700 hover:text-blue-600 font-bold text-xs text-center transition-all"
                  >
                    Pilih Paket
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* GALERI KEGIATAN              */}
        {/* ========================================== */}
        <section id="galeri" className="py-20 bg-slate-100/50 border-y border-slate-200/60 w-full">
          <div className="px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div className="text-left">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Galeri Kegiatan
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                 Klik tombol untuk lihat semua
                </p>
              </div>
              <a 
      href="https://www.instagram.com/airoofficial_/"
      target="_blank" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-all shadow-sm active:scale-95">
                Lihat Semua
              </a>
            </div>

            {/* Gallery Element Flex Responsive Grid Matrices Layout Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Photo Card Block Module 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_1.png" alt="Lego Mechanical Kit" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 1</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-semibold text-slate-800">Kelas Robotika Level 1</h4>
                </div>
              </div>

              {/* Photo Card Block Module 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_2.png" alt="Arduino sensor setup" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 2</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h4 className="text-sm font-semibold text-slate-800">Kelas Robotika Level 2</h4>
                </div>
              </div>

              {/* Photo Card Block Module 3 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_3.png" alt="Robotic Arm Setup" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 3</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-sm font-semibold text-slate-800">Kelas Robotika level 3</h4>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* VISI, MISI, & NILAI            */}
        {/* ========================================== */}
        <section id="tentang" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Branding Column Content Meta Module Info Box */}
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">SIAPA KAMI</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Visi • Misi • Nilai
              </h2>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed max-w-md">
                Pendidikan pembelajaran robotika yang jelas, ramah anak, terstruktur, dan berdampak nyata bagi kreativitas masa depan.
              </p>
              
              <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <span className="text-2xl font-extrabold text-blue-600 font-mono block">10+</span>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Tahun Pengalaman</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-indigo-600 font-mono block">500+</span>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Siswa Lulus</span>
                </div>
              </div>
            </div>

            {/* Strategic Roadmap List Dynamic Modules Deck Block Layout */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Vision Highlight Entry Node */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Visi</h4>
                  <p className="text-xs text-blue-600 font-mono mt-1 font-semibold uppercase tracking-wider">Memberdayakan generasi melalui teknologi</p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Menjadi wadah belajar robotika yang membuat siswa mampu membangun teknologi dari ide secara mandiri, logis, dan inovatif.
                  </p>
                </div>
              </div>

              {/* Mission Highlight Entry Node */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Misi</h4>
                  <p className="text-xs text-indigo-600 font-mono mt-1 font-semibold uppercase tracking-wider">Praktis, Modern, dan Terstruktur</p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Menyusun kurikulum bertahap, mendampingi praktik secara intensif, dan membentuk siswa mandiri dalam menyelesaikan persoalan teknis pemrograman.
                  </p>
                </div>
              </div>

              {/* Corporate Core Values Highlight Entry Node */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-1.41m8.595-8.594l1.414-1.414M3.553 5.879l1.414 1.413m8.596 8.596l1.414 1.414M16.243 4.757l-1.414 1.414M6.343 14.657l-1.414 1.414M12 3v1.5M12 19.5V21" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Nilai Kami</h4>
                  <p className="text-xs text-rose-600 font-mono mt-1 font-semibold uppercase tracking-wider">Kreativitas, Kolaborasi, dan Tanggung Jawab</p>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Melahirkan karya inovatif yang bermanfaat bagi lingkungan sekitar, serta melatih kerja sama tim dan disiplin tinggi dalam memecahkan masalah.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* KONTAK & HUBUNGI KAMI            */}
        {/* ========================================== */}
        <section id="kontak" className="py-20 bg-slate-100/50 border-t border-slate-200/60 w-full">
          <div className="px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Kontak & Form Pengiriman Pesan
              </h2>
              <p className="text-sm text-slate-500 mt-3">
                Hubungi kami jika ada pertanyaan atau pemesanan paket program robotika.
              </p>
            </div>

            {/* Registration Input Form Pipeline Container UI Core Elements Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column Address Info Card Layout Panel */}
              <div className="lg:col-span-5 space-y-6 text-left">
               <a 
      rel="noopener noreferrer" className="p-6 bg-white border hover:bg-gray-200 border-slate-200/80 rounded-2xl shadow-sm flex gap-4">
  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  </div>

  <div>
    <span
      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition"
    >
      airoofficial_
    </span>

    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
      Lihat lebih lanjut 
    </p>
  </div>
</a>

  <a
  href="mailto:safitrirania32@gmail.com"
  aria-label="Kirim email ke rashif368@gmail.com"
  className="flex gap-4 p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:bg-gray-100 transition-colors duration-200"
>
  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  </div>

  <div>
    <h4 className="text-sm font-bold text-slate-900">
      Saluran Email Resmi
    </h4>
    <p className="mt-1 text-xs font-mono font-semibold text-indigo-600">
      safitrirania32@gmail.com
    </p>
  </div>
</a>



                <a       href="https://wa.me/+6281228909492"
      target="_blank"
      rel="noopener noreferrer" className="p-6 hover:bg-gray-200 delay-100 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Hotline WhatsApp Admin</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Senin - Sabtu (08.00 - 17.00 WIB)</p>
                     <span
      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition"
    >
      +6281228909492
    </span>
                  </div>
                </a>
              </div>

              {/* Right Column Registration Message Input Block Forms */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm text-left">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-700 tracking-wide uppercase">Nama Lengkap</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Contoh: Budi Santoso" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-xs font-bold text-slate-700 tracking-wide uppercase">Nomor WhatsApp / HP</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 081234567890" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="package" className="text-xs font-bold text-slate-700 tracking-wide uppercase">Pilihan Paket Program</label>
                    <select 
                      id="package" 
                      name="package"
                      value={formData.package}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50 text-slate-800"
                    >
                      <option disabled value="Pilih Paket Kelas">Pilih Paket Kelas</option>
                      <option value="Tema Animal (Rp1.500.000)">Tema Animal - Rp1.500.000</option>
                      <option value="Tema Smart Life (Rp2.500.000)">Tema Smart Life - Rp2.500.000</option>
                      <option value="Advance Smart Life (Rp3.500.000)">Advance Smart Life - Rp3.500.000</option>
                      <option value="Custom / Kelas Kompetisi Khusus">Custom / Kelas Kompetisi Khusus</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-bold text-slate-700 tracking-wide uppercase">Pesan atau Catatan Khusus</label>
                    <textarea 
                      id="message" 
                      name="message"
                      rows={4} 
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tulis pesan Anda disini (misal: jadwal kelas yang diinginkan, tingkat umur anak, dll)..." 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50 resize-y"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-colors shadow-md shadow-blue-500/10 active:scale-[0.99]"
                  >
                    Kirim Pesan via WhatsApp
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ========================================== */}
      {/* FOOTER                  */}
      {/* ========================================== */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800 w-full text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-white tracking-tight">Jasa Mengajar Robotika</span>
            <span className="text-[11px] font-mono tracking-wider text-slate-500">© 2026 JMK Robotics Lab. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <a href="#beranda" className="hover:text-white transition-colors">Beranda</a>
            <a href="#tentang" className="hover:text-white transition-colors">Tentang Kami</a>
            <a href="#layanan" className="hover:text-white transition-colors">Layanan</a>
            <a href="#kontak" className="hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
