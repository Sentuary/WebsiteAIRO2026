'use client';

import { useState, useEffect } from "react";
import { FaInstagram } from "react-icons/fa6";
import { SiGoogleforms } from "react-icons/si";

interface FormData {
  name: string;
  phone: string;
  package: string;
  message: string;
}

// Helper function to optimize Cloudinary image URLs for low-end mobile devices & auto-format
function getOptimizedCloudinaryUrl(url: string, width: number = 800): string {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
}

export default function RobotikLandingPage() {
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

  // State untuk Tab Content Poster & Modal Preview
  const [activePosterTab, setActivePosterTab] = useState<'all' | 'poster1' | 'poster2'>('all');
  const [selectedPosterModal, setSelectedPosterModal] = useState<string | null>(null);

  // State untuk Tab Content Layanan
  const [activeLayananTab, setActiveLayananTab] = useState<'all' | 'animal' | 'smart' | 'advance'>('all');

  // State untuk Tab Content Tim (Pembimbing & Pengajar)
  const [teamTab, setTeamTab] = useState<'pembimbing' | 'pengajar'>('pembimbing');
  const [selectedPembimbingIndex, setSelectedPembimbingIndex] = useState<number>(0);
  const [selectedPengajarIndex, setSelectedPengajarIndex] = useState<number>(0);

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

  // Auto-rotate Team Showcase Member every 5 seconds (5000ms) with visibility check
  useEffect(() => {
    const totalPembimbing = 12;
    const totalPengajar = 11;

    const timer = setInterval(() => {
      // Pause rotation if page is hidden (user switched tab) to save CPU/battery
      if (document.hidden) return;

      if (teamTab === 'pembimbing') {
        setSelectedPembimbingIndex((prev) => (prev + 1) % totalPembimbing);
      } else {
        setSelectedPengajarIndex((prev) => (prev + 1) % totalPengajar);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [teamTab]);

  // Smooth scroll active team button strictly INSIDE internal sidebar div container (never scroll window/page viewport)
  useEffect(() => {
    const container = document.getElementById('team-sidebar-scroll-container');
    const activeBtn = document.getElementById(`team-btn-${teamTab}-${teamTab === 'pembimbing' ? selectedPembimbingIndex : selectedPengajarIndex}`);
    if (container && activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      if (btnRect.top < containerRect.top || btnRect.bottom > containerRect.bottom) {
        container.scrollTo({
          top: activeBtn.offsetTop - container.offsetTop - 10,
          behavior: 'smooth',
        });
      }
    }
  }, [teamTab, selectedPembimbingIndex, selectedPengajarIndex]);

  // IntersectionObserver for Scroll & Navigation Click Reveal Animations
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const revealElements = document.querySelectorAll('.reveal-element');

    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [activePosterTab, activeLayananTab, teamTab, selectedPembimbingIndex, selectedPengajarIndex]);

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
    
    const phoneNumber = "+6281280007270"; // TODO: Ganti dengan nomor WhatsApp admin tujuan Anda
    const waMessage = `Halo Pengajar Robotik,\n\nSaya ingin memesan kelas dengan rincian berikut:\n• Nama: ${formData.name}\n• No. WA/Telepon: ${formData.phone}\n• Pilihan Paket: ${formData.package}\n• Catatan Tambahan: ${formData.message}`;
    
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
        <a href="#beranda" className="flex items-center group border-none outline-none ring-0">
          <img 
            src="/images/logo-airo.png" 
            alt="AIRO Logo" 
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300 border-none outline-none ring-0 shadow-none"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#beranda" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Beranda</a>
          <a href="#tentang" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Tentang Kami</a>
          <a href="#tim" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Tim Kami</a>
          <a href="#layanan" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Layanan</a>
          <a href="#poster" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Poster Pembelajaran</a>
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
          <a href="#tim" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Tim Kami</a>
          <a href="#layanan" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Layanan</a>
          <a href="#poster" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600 hover:text-blue-600 py-1 transition-colors">Poster Pembelajaran</a>
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
          <div className="bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl shadow-blue-500/10 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden reveal-element">
            
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
                AIRO — Jasa Mengajar Robotik untuk Pemula hingga Kompetisi
              </h1>
              
              <p className="text-white/90 text-sm sm:text-base mt-6 leading-relaxed max-w-xl">
                Belajar Robotik dari nol dengan mentor berpengalaman, kurikulum terstruktur, dan pembelajaran interaktif langsung menggunakan kit fisik yang modern.
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
            <div className="flex-1 w-full flex justify-center items-center relative z-10 reveal-element reveal-delay-2">
              <div className="flex-1 flex justify-center items-center relative">
                <div 
                  className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
                  style={{ animation: 'floatSlow 4s ease-in-out infinite' }}
                >
                  <img 
                    src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716914/jmk-website/main/gqqicdvhajiwullzpnpg.png", 800)} 
                    alt="Hero Robot AIRO" 
                    decoding="async"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>



        {/* ========================================== */}
        {/* TENTANG KAMI & LOKASI INTERACTIVE MAP      */}
        {/* ========================================== */}
        <section id="tentang" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-14 reveal-element">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">SIAPA KAMI</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Tentang Kami & Lokasi Pembelajaran
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Pendidikan pembelajaran Robotik yang jelas, ramah anak, terstruktur, dan berdampak nyata bagi kreativitas masa depan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Penjelasan Singkat Tentang Kami */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 reveal-element reveal-delay-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Penjelasan Singkat Tentang Kami</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                 AIRO adalah wadah bagi para penggemar dan praktisi Robotik untuk berbagi pengetahuan, pengalaman, serta ide-ide inovatif. Melalui kolaborasi dan pengembangan teknologi robotik, komunitas ini berperan dalam meningkatkan keterampilan serta mendorong terciptanya solusi yang bermanfaat bagi masyarakat.</p>

                {/* Visi, Misi & Nilai Module Cards */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Visi Kami</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Memberdayakan generasi muda untuk membangun teknologi dari ide secara mandiri, logis, dan inovatif.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Misi Kami</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Menyusun kurikulum bertahap, mendampingi praktik secara intensif, dan membentuk kemandirian persoalan teknis.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-1.41m8.595-8.594l1.414-1.414M3.553 5.879l1.414 1.413m8.596 8.596l1.414 1.414M16.243 4.757l-1.414 1.414M6.343 14.657l-1.414 1.414M12 3v1.5M12 19.5V21" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Nilai Kami</h4>
                      <p className="text-xs text-rose-600 font-mono mt-0.5 font-semibold uppercase tracking-wider">Kreativitas, Kolaborasi, dan Tanggung Jawab</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Melahirkan karya inovatif yang bermanfaat bagi lingkungan sekitar, serta melatih kerja sama tim dan disiplin tinggi dalam memecahkan masalah.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Map */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between reveal-element reveal-delay-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Interactive Map</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Universitas Respati Indonesia (URINDO, Kampus A)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-bold font-mono uppercase tracking-wider">
                  Lokasi Kampus
                </span>
              </div>

              <div className="w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d953.9470202147235!2d106.90203824966842!3d-6.31702392564142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ed8b5cfc1347%3A0xee8b2ce3ef1e273a!2sUniversitas%20Respati%20Indonesia%20(URINDO%2C%20Kampus%20A)!5e0!3m2!1sid!2sid!4v1784705549010!5m2!1sid!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Lokasi URINDO Kampus A"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* TIM KAMI: PEMBIMBING & PENGAJAR TAB        */}
        {/* ========================================== */}
        <section id="tim" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal-element">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">TIM & PENGURUS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Pembimbing & Pengajar Kami
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Mengenal tim Pembimbing dan Pengajar Fakultas Teknologi Informasi Universitas Respati indonesia.
            </p>

            {/* Top Tab Buttons: Pembimbing vs Pengajar */}
            <div className="flex items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100/80 rounded-2xl w-fit mx-auto border border-slate-200/80 shadow-inner">
              <button
                onClick={() => {
                  setTeamTab('pembimbing');
                  setSelectedPembimbingIndex(0);
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  teamTab === 'pembimbing'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Pembimbing
              </button>
              <button
                onClick={() => {
                  setTeamTab('pengajar');
                  setSelectedPengajarIndex(0);
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  teamTab === 'pengajar'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Pengajar
              </button>
            </div>
          </div>

          {/* Split Content Box (Matching Screenshot Layout) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden reveal-element">
            <div className="flex flex-col md:flex-row min-h-[480px]">
              
              {/* Left Panel: Member List Sidebar */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200/80 bg-slate-50/70 p-4 flex flex-col justify-between">
                <div>
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
                    Daftar {teamTab === 'pembimbing' ? 'Pembimbing (12)' : 'Pengajar (11)'}
                  </div>
                  <div id="team-sidebar-scroll-container" className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                    {teamTab === 'pembimbing'
                      ? [
                          { id: 'pembimbing-1', label: 'Pembimbing 1', name: 'Ramadhani Ulansari, S.Kom., M.T', role: 'Dekan Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716915/jmk-website/pembimbing/h4fiebyvmkikss8gxu0m.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-2', label: 'Pembimbing 2', name: 'F.A. Ricky Bayu Styanto, S.Kom., M.Kom', role: 'Ketua Program Studi Sistem Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716917/jmk-website/pembimbing/qkfs84ryd9pnalibb1fa.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-3', label: 'Pembimbing 3', name: 'Soni Rudi Hartanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716917/jmk-website/pembimbing/mbtfsbzinixmdmybeynw.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-4', label: 'Pembimbing 4', name: 'Suharyanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716918/jmk-website/pembimbing/ze0gh6zvmsx7zytoquvb.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-5', label: 'Pembimbing 5', name: 'Hari Chandra Budi Rahardjo, S.Kom., M.A.B', role: 'Staff Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716919/jmk-website/pembimbing/iuxagqyvjhyvdqssuspo.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-6', label: 'Pembimbing 6', name: 'Jenih, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Ilmu Komputer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716920/jmk-website/pembimbing/jgbv2lbrdgfiee9bupso.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-7', label: 'Pembimbing 7', name: 'Atik Nalariza, S.Kom', role: 'Staff Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716921/jmk-website/pembimbing/j5m5hvvyc21m2nltlwxf.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-8', label: 'Pembimbing 8', name: 'Desmiwati, S.Kom., M.Si', role: 'Dosen Program Studi Ilmu Komputer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716922/jmk-website/pembimbing/vay5nqxhln5js7e8io0j.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-9', label: 'Pembimbing 9', name: 'Novi Suprapti, S.Kom', role: 'Staff Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716923/jmk-website/pembimbing/vn1dbcfad3tow47uyez0.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-10', label: 'Pembimbing 10', name: 'Agus Riyanto, S.Kom., M.A.B', role: 'Laboratorium Komputer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716915/jmk-website/pembimbing/vndcxrfsavabs8xyyeaa.jpg', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-11', label: 'Pembimbing 11', name: 'Yasmiati, S.Kom., M.Si', role: 'Ketua Program Studi Ilmu Komputer', institution: 'Universitas Respati Indonesia (URINDO)' },
                          { id: 'pembimbing-12', label: 'Pembimbing 12', name: 'Suwarni, S.Kom., M.Si', role: 'Dosen Tetap Prodi Ilmu Komputer', institution: 'Universitas Respati Indonesia (URINDO)' },
                        ].map((item, idx) => (
                          <button
                            key={item.id}
                            id={`team-btn-pembimbing-${idx}`}
                            onClick={() => setSelectedPembimbingIndex(idx)}
                            className={`w-full text-left p-3.5 rounded-2xl text-xs transition-all duration-300 flex flex-col gap-0.5 group ${
                              selectedPembimbingIndex === idx
                                ? 'bg-slate-700 text-white font-bold shadow-md scale-[1.02]'
                                : 'text-slate-800 hover:bg-white hover:shadow-xs'
                            }`}
                          >
                            <span className="font-extrabold leading-snug">{item.name}</span>
                            <span className={`text-[11px] leading-tight ${selectedPembimbingIndex === idx ? 'text-slate-200' : 'text-slate-500'}`}>
                              {item.role}
                            </span>
                          </button>
                        ))
                      : [
                          { id: 'pengajar-1', label: 'Pengajar 1', name: 'Reza Ramadhan', role: 'Asisten Trainer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716924/jmk-website/pengajar/o2yuwo3sklssw1z2lami.jpg', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-2', label: 'Pengajar 2', name: 'Naisya Putri', role: 'Asisten Trainer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716924/jmk-website/pengajar/jdln0xn7zf1sje1ohrc6.jpg', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-3', label: 'Pengajar 3', name: 'Rafli Maulana Zidane', role: 'Asisten Trainer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716925/jmk-website/pengajar/egvglmoqzhetnxmeymz2.jpg', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-4', label: 'Pengajar 4', name: 'Rifaldi Alfauzi', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-5', label: 'Pengajar 5', name: 'Dinda Alya Ainsani', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-6', label: 'Pengajar 6', name: 'Zhaki Ramdani', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-7', label: 'Pengajar 7', name: 'Rashif Aziiz', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-8', label: 'Pengajar 8', name: 'Azhar Khaibar', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-9', label: 'Pengajar 9', name: 'Keenan Pandu Albany', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-10', label: 'Pengajar 10', name: 'Sri Diah Lestari', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                          { id: 'pengajar-11', label: 'Pengajar 11', name: 'Siti Adriyani Salsabil', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                        ].map((item, idx) => (
                          <button
                            key={item.id}
                            id={`team-btn-pengajar-${idx}`}
                            onClick={() => setSelectedPengajarIndex(idx)}
                            className={`w-full text-left p-3.5 rounded-2xl text-xs transition-all duration-300 flex flex-col gap-0.5 group ${
                              selectedPengajarIndex === idx
                                ? 'bg-slate-700 text-white font-bold shadow-md scale-[1.02]'
                                : 'text-slate-800 hover:bg-white hover:shadow-xs'
                            }`}
                          >
                            <span className="font-extrabold leading-snug">{item.name}</span>
                            <span className={`text-[11px] leading-tight ${selectedPengajarIndex === idx ? 'text-slate-200' : 'text-slate-500'}`}>
                              {item.role}
                            </span>
                          </button>
                        ))}
                  </div>
                </div>
              </div>

              

              {/* Right Panel: Large Featured Card View */}
              <div className="flex-1 p-3 sm:p-5 bg-white flex flex-col justify-center items-center h-full min-h-[380px] sm:min-h-[480px]">
                {(() => {
                  const pembimbingData = [
                    { id: 'pembimbing-1', label: 'Pembimbing 1', name: 'Ramadhani Ulansari, S.Kom., M.T', role: 'Dekan Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716915/jmk-website/pembimbing/h4fiebyvmkikss8gxu0m.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-2', label: 'Pembimbing 2', name: 'F.A. Ricky Bayu Styanto, S.Kom., M.Kom', role: 'Ketua Program Studi Sistem Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716917/jmk-website/pembimbing/qkfs84ryd9pnalibb1fa.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-3', label: 'Pembimbing 3', name: 'Soni Rudi Hartanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716917/jmk-website/pembimbing/mbtfsbzinixmdmybeynw.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-4', label: 'Pembimbing 4', name: 'Suharyanto, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Sistem Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716918/jmk-website/pembimbing/ze0gh6zvmsx7zytoquvb.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-5', label: 'Pembimbing 5', name: 'Hari Chandra Budi Rahardjo, S.Kom., M.A.B', role: 'Staff Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716919/jmk-website/pembimbing/iuxagqyvjhyvdqssuspo.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-6', label: 'Pembimbing 6', name: 'Jenih, S.Kom., M.Kom', role: 'Dosen Tetap Prodi Ilmu Komputer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716920/jmk-website/pembimbing/jgbv2lbrdgfiee9bupso.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-7', label: 'Pembimbing 7', name: 'Atik Nalariza, S.Kom', role: 'Staff Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716921/jmk-website/pembimbing/j5m5hvvyc21m2nltlwxf.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-8', label: 'Pembimbing 8', name: 'Desmiwati, S.Kom., M.Si', role: 'Dosen Program Studi Ilmu Komputer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716922/jmk-website/pembimbing/vay5nqxhln5js7e8io0j.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-9', label: 'Pembimbing 9', name: 'Novi Suprapti, S.Kom', role: 'Staff Fakultas Teknologi Informasi', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716923/jmk-website/pembimbing/vn1dbcfad3tow47uyez0.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-10', label: 'Pembimbing 10', name: 'Agus Riyanto, S.Kom., M.A.B', role: 'Laboratorium Komputer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716915/jmk-website/pembimbing/vndcxrfsavabs8xyyeaa.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-11', label: 'Pembimbing 11', name: 'Yasmiati, S.Kom., M.Si', role: 'Ketua Program Studi Ilmu Komputer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pembimbing-12', label: 'Pembimbing 12', name: 'Suwarni, S.Kom., M.Si', role: 'Dosen Tetap Prodi Ilmu Komputer', institution: 'Universitas Respati Indonesia' },
                  ];

                  const pengajarData = [
                    { id: 'pengajar-1', label: 'Pengajar 1', name: 'Reza Ramadhan', role: 'Asisten Trainer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716924/jmk-website/pengajar/o2yuwo3sklssw1z2lami.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-2', label: 'Pengajar 2', name: 'Naisya Putri', role: 'Asisten Trainer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716924/jmk-website/pengajar/jdln0xn7zf1sje1ohrc6.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-3', label: 'Pengajar 3', name: 'Rafli Maulana Zidane', role: 'Asisten Trainer', image: 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716925/jmk-website/pengajar/egvglmoqzhetnxmeymz2.jpg', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-4', label: 'Pengajar 4', name: 'Rifaldi Alfauzi', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-5', label: 'Pengajar 5', name: 'Dinda Alya Ainsani', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-6', label: 'Pengajar 6', name: 'Zhaki Ramdani', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-7', label: 'Pengajar 7', name: 'Rashif Aziiz', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-8', label: 'Pengajar 8', name: 'Azhar Khaibar', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-9', label: 'Pengajar 9', name: 'Keenan Pandu Albany', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-10', label: 'Pengajar 10', name: 'Sri Diah Lestari', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                    { id: 'pengajar-11', label: 'Pengajar 11', name: 'Siti Adriyani Salsabil', role: 'Asisten Trainer', institution: 'Universitas Respati Indonesia' },
                  ];

                  const currentMember = teamTab === 'pembimbing' 
                    ? pembimbingData[selectedPembimbingIndex] 
                    : pengajarData[selectedPengajarIndex];
                  
                  if (!currentMember) return null;

                  return (
                    <div key={currentMember.id} className="w-full h-full flex flex-col items-center justify-center animate-team-fade">
                      {/* Photo Showcase Box - Expands to Fill Right Panel matching screenshot */}
                      <div className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] rounded-[32px] overflow-hidden border border-slate-200/80 shadow-md bg-slate-50 flex items-center justify-center group">
                        <img 
                          key={currentMember.id}
                          src={getOptimizedCloudinaryUrl(currentMember.image || 'https://res.cloudinary.com/f2tewygu/image/upload/v1784716914/jmk-website/main/gqqicdvhajiwullzpnpg.png', 600)} 
                          alt={currentMember.name} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain object-center p-2 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getOptimizedCloudinaryUrl('https://res.cloudinary.com/f2tewygu/image/upload/v1784716914/jmk-website/main/gqqicdvhajiwullzpnpg.png', 600);
                          }}
                        />
                        {/* Bottom Right Floating Badge - Matching Screenshot */}
                        <span className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-5 py-2.5 rounded-2xl bg-slate-800/90 text-white font-mono font-extrabold text-xs uppercase tracking-widest shadow-xl backdrop-blur-md border border-slate-700/50">
                          {currentMember.label}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* HARGA & PAKET LAYANAN (TAB CONTENT)       */}
        {/* ========================================== */}
        <section id="layanan" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal-element">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2 font-mono">PROGRAM KELAS</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Harga & Paket Singkat
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Layanan Mingguan/Bulanan. Untuk diskon/kelas khusus, cek kontak di bawah.
            </p>

            {/* Tab Navigation Buttons for Layanan */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100/80 rounded-2xl w-fit mx-auto border border-slate-200/80 shadow-inner">
              <button
                onClick={() => setActiveLayananTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activeLayananTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Semua Paket
              </button>
              <button
                onClick={() => setActiveLayananTab('animal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activeLayananTab === 'animal'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Tema Animal
              </button>
              <button
                onClick={() => setActiveLayananTab('smart')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activeLayananTab === 'smart'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Tema Smart Life
              </button>
              <button
                onClick={() => setActiveLayananTab('advance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activeLayananTab === 'advance'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Advance Smart Life
              </button>
            </div>
          </div>

        

          {/* Pricing Grid Package Node Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Tema Animal (AI-Fantasy-Zoo) */}
            {(activeLayananTab === 'all' || activeLayananTab === 'animal') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group reveal-element reveal-delay-1">
                <div className="h-64 sm:h-72 bg-slate-100 relative overflow-hidden border-b border-slate-200/60 flex items-center justify-center">
                  <img 
                    src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716899/jmk-website/main/psrzqco1e7tau4ta8p8x.png", 800)} 
                    alt="Tema Animal - AI Fantasy Zoo" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-sm text-[10px] font-bold text-white font-mono uppercase tracking-wider shadow-sm">
                    Level 1 • Pemula
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Harga Paket</span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-2xl font-extrabold text-slate-900 font-mono">Rp2.000.000</h3>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        💳 Cicilan Rp500.000 / 4 Bulan
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mt-3">Tema Animal (AI-Fantasy-Zoo)</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Membangun proyek robotik bertema hewan (Animal Robot) dengan mekanik dasar, gear system, dan pengenalan gerakan kinetik.
                    </p>

                    {/* Detail Penjelasan List */}
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Kit Hardware:</strong> AI-Fantasy-Zoo Kit (Modul Kinetik & Gear Motor)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Materi Utama:</strong> Pengenalan struktur mekanis, rasio gir, & keseimbangan robotik</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Fokus Keterampilan:</strong> Melatih kecerdasan spasial, motorik halus, & daya cipta anak</span>
                      </div>
                      <div className="flex items-start gap-2 text-emerald-700">
                        <span className="text-emerald-600 font-bold shrink-0">💳</span>
                        <span><strong className="text-emerald-800">Opsi Kemudahan:</strong> Dapat dicicil Rp500.000 / bulan selama 4 bulan</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">mekanik</span>
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">kinetik</span>
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">level 1</span>
                    </div>
                    <button 
                      onClick={() => selectPackage('Tema Animal (Rp2.000.000)')}
                      className="block w-full py-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs text-center transition-all duration-200 shadow-sm"
                    >
                      Pilih Paket Animal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Tema Smart Life (AI-Smart-Life) */}
            {(activeLayananTab === 'all' || activeLayananTab === 'smart') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group reveal-element reveal-delay-2">
                <div className="h-64 sm:h-72 bg-slate-100 relative overflow-hidden border-b border-slate-200/60 flex items-center justify-center">
                  <img 
                    src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716901/jmk-website/main/aoiapqjjic9mrf4rxuam.png", 800)} 
                    alt="Tema Smart Life - AI Smart Life" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-indigo-600/90 backdrop-blur-sm text-[10px] font-bold text-white font-mono uppercase tracking-wider shadow-sm">
                    Level 2 • Menengah
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Harga Paket</span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-2xl font-extrabold text-slate-900 font-mono">Rp2.000.000</h3>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        💳 Cicilan Rp500.000 / 4 Bulan
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mt-3">Tema Smart Life (AI-Smart-Life)</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Termasuk merancang & memprogram bertema smart life menggunakan sensor otomatisasi, deteksi hambatan, dan dasar sirkuit.
                    </p>

                    {/* Detail Penjelasan List */}
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Kit Hardware:</strong> AI-Smart-Life Controller & Sensor Expansion</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Materi Utama:</strong> Pemrograman visual/block, deteksi sensor IR/Ultrasonic, & sistem otomatisasi</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Fokus Keterampilan:</strong> Logika algoritma bersyarat, problem solving, & otomatisasi pintar</span>
                      </div>
                      <div className="flex items-start gap-2 text-emerald-700">
                        <span className="text-emerald-600 font-bold shrink-0">💳</span>
                        <span><strong className="text-emerald-800">Opsi Kemudahan:</strong> Dapat dicicil Rp500.000 / bulan selama 4 bulan</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">sensor</span>
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">block code</span>
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">level 2</span>
                    </div>
                    <button 
                      onClick={() => selectPackage('Tema Smart Life (Rp2.000.000)')}
                      className="block w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs text-center transition-all duration-200 shadow-sm"
                    >
                      Pilih Paket Smart Life
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Advance Smart Life (Ukit-Advance) */}
            {(activeLayananTab === 'all' || activeLayananTab === 'advance') && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-rose-500/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group reveal-element reveal-delay-3">
                <div className="h-64 sm:h-72 bg-slate-100 relative overflow-hidden border-b border-slate-200/60 flex items-center justify-center">
                  <img 
                    src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716905/jmk-website/main/mo4g3gyrcabcdc59oixy.png", 800)} 
                    alt="Advance Smart Life - Ukit Advance" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-rose-600/90 backdrop-blur-sm text-[10px] font-bold text-white font-mono uppercase tracking-wider shadow-sm">
                    Level 3 • Lanjutan
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Harga Paket</span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-2xl font-extrabold text-slate-900 font-mono">Rp2.000.000</h3>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        💳 Cicilan Rp500.000 / 4 Bulan
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mt-3">Advance Smart Life (Ukit-Advance)</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Membangun proyek Advance Smart Life dengan pembelajaran pemrograman yang lebih kompleks, logika bersyarat, dan integrasi IoT.
                    </p>

                    {/* Detail Penjelasan List */}
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Kit Hardware:</strong> Ukit-Advance High-End Robotic Kit (Multi-Servo)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Materi Utama:</strong> Pemrograman kompleks, kontrol multi-servo axis, sensor presisi, & AI/IoT dasar</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold shrink-0">✓</span>
                        <span><strong className="text-slate-800">Fokus Keterampilan:</strong> Mekatronika murni, persiapan proyek inovasi, & persiapan kompetisi</span>
                      </div>
                      <div className="flex items-start gap-2 text-emerald-700">
                        <span className="text-emerald-600 font-bold shrink-0">💳</span>
                        <span><strong className="text-emerald-800">Opsi Kemudahan:</strong> Dapat dicicil Rp500.000 / bulan selama 4 bulan</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">multi-servo</span>
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">advance</span>
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 rounded-full font-mono">level 3</span>
                    </div>
                    <button 
                      onClick={() => selectPackage('Advance Smart Life (Rp2.000.000)')}
                      className="block w-full py-3 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs text-center transition-all duration-200 shadow-sm"
                    >
                      Pilih Paket Advance
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ========================================== */}
        {/* POSTER PEMBELAJARAN & BROCHURE TAB SECTION */}
        {/* ========================================== */}
        <section id="poster" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12 reveal-element">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">DOKUMENTASI & MEDIA</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Poster Pembelajaran
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Jelajahi poster resmi program pembelajaran robotik AIRO. Klik poster untuk memperbesar.
            </p>

            {/* Tab Navigation Buttons */}
            <div className="flex items-center justify-center gap-2 mt-8 p-1.5 bg-slate-100/80 rounded-2xl w-fit mx-auto border border-slate-200/80 shadow-inner">
              <button
                onClick={() => setActivePosterTab('all')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activePosterTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Semua Poster
              </button>
              <button
                onClick={() => setActivePosterTab('poster1')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activePosterTab === 'poster1'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Poster 1
              </button>
              <button
                onClick={() => setActivePosterTab('poster2')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activePosterTab === 'poster2'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Poster 2
              </button>
            </div>
          </div>

          {/* Posters Display Area with Floating Animations */}
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 py-8 px-4 overflow-hidden">
            {/* Poster 1 Card */}
            {(activePosterTab === 'all' || activePosterTab === 'poster1') && (
              <div 
                className="reveal-element reveal-delay-1"
                onClick={() => setSelectedPosterModal('https://res.cloudinary.com/f2tewygu/image/upload/v1784716902/jmk-website/main/hh4hggwc254bdpt4xasv.png')}
              >
                <div 
                  className="group relative cursor-pointer transform hover:scale-105 transition-all duration-500 ease-out"
                  style={{ 
                    animation: 'floatSlow 4s ease-in-out infinite',
                    animationDelay: '0s'
                  }}
                >
                  <div className="bg-slate-200/90 p-4 sm:p-5 rounded-3xl border border-slate-300 shadow-2xl backdrop-blur-sm max-w-sm sm:max-w-md -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                      <img 
                        src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716902/jmk-website/main/hh4hggwc254bdpt4xasv.png", 800)} 
                        alt="Poster 1 - AIRO Robotics" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 shadow-lg flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                          Lihat Poster 1
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between px-1">
                      <span className="text-sm font-extrabold text-slate-800">Poster 1</span>
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        Modul Program
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Poster 2 Card */}
            {(activePosterTab === 'all' || activePosterTab === 'poster2') && (
              <div 
                className="reveal-element reveal-delay-2"
                onClick={() => setSelectedPosterModal('https://res.cloudinary.com/f2tewygu/image/upload/v1784716903/jmk-website/main/fzhobxxoskmzqqdxjzou.png')}
              >
                <div 
                  className="group relative cursor-pointer transform hover:scale-105 transition-all duration-500 ease-out"
                  style={{ 
                    animation: 'floatSlow 4s ease-in-out infinite',
                    animationDelay: '2s'
                  }}
                >
                  <div className="bg-slate-200/90 p-4 sm:p-5 rounded-3xl border border-slate-300 shadow-2xl backdrop-blur-sm max-w-sm sm:max-w-md rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                      <img 
                        src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716903/jmk-website/main/fzhobxxoskmzqqdxjzou.png", 800)} 
                        alt="Poster 2 - AIRO Robotics" 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 shadow-lg flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                          Lihat Poster 2
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between px-1">
                      <span className="text-sm font-extrabold text-slate-800">Poster 2</span>
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        Pendaftaran Kelas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Modal Lightbox for Poster Preview */}
        {selectedPosterModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedPosterModal(null)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPosterModal(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors shadow-lg"
                aria-label="Tutup poster"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={getOptimizedCloudinaryUrl(selectedPosterModal, 1200)} 
                alt="Poster Full Preview" 
                loading="lazy"
                decoding="async"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* GALERI KEGIATAN              */}
        {/* ========================================== */}
        <section id="galeri" className="py-20 bg-slate-100/50 border-y border-slate-200/60 w-full">
          <div className="px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 reveal-element">
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
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group reveal-element reveal-delay-1">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_1.png" alt="Lego Mechanical Kit" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 1</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-semibold text-slate-800">Kelas Robotik Level 1</h4>
                </div>
              </div>

              {/* Photo Card Block Module 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group reveal-element reveal-delay-2">
                <div className="h-64 overflow-hidden relative">
                  <img src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716912/jmk-website/main/lezrqu5k1sbwcqgy2nnb.png", 800)} alt="Arduino sensor setup" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 2</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h4 className="text-sm font-semibold text-slate-800">Kelas Robotik Level 2</h4>
                </div>
              </div>

              {/* Photo Card Block Module 3 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group reveal-element reveal-delay-3">
                <div className="h-64 overflow-hidden relative">
                  <img src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/f2tewygu/image/upload/v1784716913/jmk-website/main/gdgus6dkwlsldvkdzkhg.jpg", 800)} alt="Robotic Arm Setup" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 3</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-sm font-semibold text-slate-800">Kelas Robotik level 3</h4>
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
            <div className="text-center max-w-2xl mx-auto mb-16 reveal-element">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Kontak & Form Pengiriman Pesan
              </h2>
              <p className="text-sm text-slate-500 mt-3">
                Hubungi kami jika ada pertanyaan atau pemesanan paket program Robotik.
              </p>
            </div>

            {/* Registration Input Form Pipeline Container UI Core Elements Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column Address Info Card Layout Panel */}
              <div className="lg:col-span-5 space-y-4 text-left reveal-element reveal-delay-1">
                {/* Card 1: Instagram */}
                <a 
                  href="https://www.instagram.com/airoofficial_/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <FaInstagram />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                      Instagram Resmi
                    </h4>
                    <p className="text-xs font-mono font-semibold text-pink-600 mt-0.5">
                      @airoofficial_
                    </p>
                  </div>
                </a>

                {/* Card 2: Google Form */}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSetfmpFFwKaW6hwRmIFl0pCmmGW_v6hvNPol4zHOCYn2jjtkw/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <SiGoogleforms />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      Formulir Pendaftaran Ekstrakurikuler
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      AIRO FTI URINDO — Klik untuk mendaftar
                    </p>
                  </div>
                </a>

                {/* Card 3: Email Resmi */}
                <a
                  href="mailto:airo@urindo.ac.id"
                  className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Saluran Email Resmi
                    </h4>
                    <p className="text-xs font-mono font-semibold text-indigo-600 mt-0.5">
                      airo@urindo.ac.id
                    </p>
                  </div>
                </a>

                {/* Card 4: WhatsApp Hotline */}
                <a 
                  href="https://wa.me/+6281280007270" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Hotline WhatsApp Admin
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Senin - Sabtu (08.00 - 17.00 WIB)</p>
                    <p className="text-xs font-mono font-semibold text-emerald-600 mt-0.5">
                      +62 812-8000-7270
                    </p>
                  </div>
                </a>
              </div>

              {/* Right Column Registration Message Input Block Forms */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm text-left reveal-element reveal-delay-2">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Kirim Pesan Langsung</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Konsultasikan jadwal kelas atau pertanyaan Anda, formulir akan otomatis terhubung ke WhatsApp Admin.
                  </p>
                </div>

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
                        placeholder="Contoh: Dinda Alya Ainsani" 
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
                      <option value="Tema Animal (Rp2.000.000 - Cicilan Rp500rb/bln)">Tema Animal - Rp2.000.000 (Cicilan Rp500rb/bln)</option>
                      <option value="Tema Smart Life (Rp2.000.000 - Cicilan Rp500rb/bln)">Tema Smart Life - Rp2.000.000 (Cicilan Rp500rb/bln)</option>
                      <option value="Advance Smart Life (Rp2.000.000 - Cicilan Rp500rb/bln)">Advance Smart Life - Rp2.000.000 (Cicilan Rp500rb/bln)</option>
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
            <span className="text-sm font-bold text-white tracking-tight">AIRO (Artificial Intelligence Robotics)</span>
            <span className="text-[11px] font-mono tracking-wider text-slate-500">© 2026 AIRO. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <a href="#beranda" className="hover:text-white transition-colors">Beranda</a>
            <a href="#tentang" className="hover:text-white transition-colors">Tentang Kami</a>
            <a href="#poster" className="hover:text-white transition-colors">Poster</a>
            <a href="#tim" className="hover:text-white transition-colors">Tim Kami</a>
            <a href="#layanan" className="hover:text-white transition-colors">Layanan</a>
            <a href="#galeri" className="hover:text-white transition-colors">Galeri</a>
            <a href="#kontak" className="hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
                    

    </div>
  );
}
