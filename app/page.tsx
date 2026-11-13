'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { FaInstagram, FaEye, FaEyeSlash } from "react-icons/fa6";
import { SiGoogleforms } from "react-icons/si";
import dynamic from 'next/dynamic';
import type { BeritaItem, TeamMemberItem, PosterItem, LayananItem } from "@/components/AdminDashboard";
import { INITIAL_LAYANAN, INITIAL_POSTERS } from "@/lib/initialData";

const AdminDashboard = dynamic(() => import("@/components/AdminDashboard"), {
  ssr: false,
});
import MobileCarousel from "@/components/MobileCarousel";
import {
  subscribeToCollection,
  loginAdminWithFirebase,
  logoutAdminFromFirebase,
  onAdminAuthStateChanged,
  seedAdminUserIfNotExist,
  formatImageSrc,
} from "@/lib/firebase";

interface FormData {
  name: string;
  phone: string;
  package: string;
  message: string;
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
  const [activePosterTab, setActivePosterTab] = useState<string>('all');
  const [selectedPosterModal, setSelectedPosterModal] = useState<string | null>(null);

  // State untuk Tab Content Layanan (Grup Paket Robotic)
  const [activeLayananTab, setActiveLayananTab] = useState<string>('all');

  // State untuk Tab Content Tim (Pembimbing & Pengajar)
  const [teamTab, setTeamTab] = useState<'pembimbing' | 'pengajar'>('pembimbing');
  const [selectedPembimbingIndex, setSelectedPembimbingIndex] = useState<number>(0);
  const [selectedPengajarIndex, setSelectedPengajarIndex] = useState<number>(0);

  // Theme State (Light / Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('airo_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('airo_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Dynamic State for Berita, Pengajar, Pembimbing, Layanan, & Poster List (100% Synced with Firebase Firestore)
  const [beritaList, setBeritaList] = useState<BeritaItem[]>([]);
  const [pembimbingList, setPembimbingList] = useState<TeamMemberItem[]>([]);
  const [pengajarList, setPengajarList] = useState<TeamMemberItem[]>([]);
  const [layananList, setLayananList] = useState<LayananItem[]>(INITIAL_LAYANAN);
  const [posterList, setPosterList] = useState<PosterItem[]>(INITIAL_POSTERS);
  const [isLoadingBerita, setIsLoadingBerita] = useState<boolean>(true);
  const [isLoadingTeam, setIsLoadingTeam] = useState<boolean>(true);
  const [isLoadingLayanan, setIsLoadingLayanan] = useState<boolean>(true);
  const [isLoadingPoster, setIsLoadingPoster] = useState<boolean>(true);

  // Memoized distinct groups for Layanan (e.g. "Paket Robotic")
  const distinctLayananGroups = useMemo(() => {
    const groups = new Set<string>();
    layananList.forEach((item) => {
      if (item.group) groups.add(item.group);
    });
    if (groups.size === 0) groups.add('Paket Robotic');
    return Array.from(groups);
  }, [layananList]);

  // Filtered Layanan Items
  const filteredLayananItems = useMemo(() => {
    if (activeLayananTab === 'all') return layananList;
    return layananList.filter(
      (item) => (item.group || 'Paket Robotic') === activeLayananTab || item.level === activeLayananTab || item.id === activeLayananTab
    );
  }, [layananList, activeLayananTab]);

  // Filtered Poster Items
  const filteredPosterItems = useMemo(() => {
    if (activePosterTab === 'all') return posterList;
    return posterList.filter(
      (item) => item.id === activePosterTab || item.category === activePosterTab || item.title === activePosterTab
    );
  }, [posterList, activePosterTab]);

  // Auto-correct active index when members are deleted from Firebase
  useEffect(() => {
    if (selectedPembimbingIndex >= pembimbingList.length && pembimbingList.length > 0) {
      setSelectedPembimbingIndex(0);
    }
  }, [pembimbingList.length, selectedPembimbingIndex]);

  useEffect(() => {
    if (selectedPengajarIndex >= pengajarList.length && pengajarList.length > 0) {
      setSelectedPengajarIndex(0);
    }
  }, [pengajarList.length, selectedPengajarIndex]);

  // Instant Client Cache Hydration: Render Layanan & Poster instantly (0ms) without waiting for network round-trip
  useEffect(() => {
    try {
      const cachedLayanan = localStorage.getItem('airo_cache_layanan');
      if (cachedLayanan) {
        const parsed = JSON.parse(cachedLayanan);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLayananList(parsed);
          setIsLoadingLayanan(false);
        }
      }
      const cachedPosters = localStorage.getItem('airo_cache_posters');
      if (cachedPosters) {
        const parsed = JSON.parse(cachedPosters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosterList(parsed);
          setIsLoadingPoster(false);
        }
      }
    } catch {
      // Ignore cache storage error
    }
  }, []);

  // Memoized repeat list to guarantee a seamless, infinite marquee without any snap or gaps
  const marqueeBerita = useMemo(() => {
    if (beritaList.length === 0) return [];
    if (beritaList.length < 4) {
      return [...beritaList, ...beritaList, ...beritaList, ...beritaList];
    }
    if (beritaList.length < 8) {
      return [...beritaList, ...beritaList];
    }
    return beritaList;
  }, [beritaList]);

  // Admin Login & Session State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Login Session Expiration Constant: Tepat 1 Jam (3600 detik)
  const ADMIN_SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 Jam Expired Token/Sesi

  // Sync login session with Firebase Auth and enforce 1-hour expiration limit
  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((user) => {
      if (user) {
        const now = Date.now();
        const sessionStartStr = localStorage.getItem('airo_session_start');
        const sessionStart = sessionStartStr ? parseInt(sessionStartStr, 10) : now;

        // Jika sesi sudah lebih dari 1 jam sejak pertama kali login, wajib logout
        if (now - sessionStart >= ADMIN_SESSION_EXPIRY_MS) {
          handleLogout();
          return;
        }

        setIsLoggedIn(true);
        localStorage.setItem('airo_admin_logged_in', 'true');
        if (!sessionStartStr) {
          localStorage.setItem('airo_session_start', now.toString());
        }
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('airo_admin_logged_in');
        localStorage.removeItem('airo_session_start');
        localStorage.removeItem('airo_last_activity');
      }
    });

    return () => unsubscribe();
  }, []);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [selectedBeritaModal, setSelectedBeritaModal] = useState<BeritaItem | null>(null);

  // Monitor Admin Session Expiration (Strict 1-Hour Token Expiration)
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkAdminSession = () => {
      const now = Date.now();
      const sessionStartStr = localStorage.getItem('airo_session_start');
      const sessionStart = sessionStartStr ? parseInt(sessionStartStr, 10) : now;

      // Cek Batas Kadaluarsa Token Sesi 1 Jam
      if (now - sessionStart >= ADMIN_SESSION_EXPIRY_MS) {
        alert('Waktu sesi login Admin telah habis (berlaku 1 jam). Silakan login kembali.');
        handleLogout();
        return;
      }
    };

    // Periksa status sesi setiap 3 detik
    const intervalId = setInterval(checkAdminSession, 3000);
    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

  // Subscribe to Firebase Firestore Realtime Database (Pure Dynamic Sync)
  useEffect(() => {
    if (isLoggedIn) {
      seedAdminUserIfNotExist();
    }

    // Listen to real-time updates directly from Firebase Firestore collections
    const unsubBerita = subscribeToCollection<BeritaItem>(
      'berita',
      (data) => {
        setBeritaList(data || []);
        setIsLoadingBerita(false);
      },
      () => {
        setIsLoadingBerita(false);
      }
    );

    const unsubPembimbing = subscribeToCollection<TeamMemberItem>(
      'pembimbing',
      (data) => {
        setPembimbingList(data || []);
        setIsLoadingTeam(false);
      },
      () => {
        setIsLoadingTeam(false);
      }
    );

    const unsubPengajar = subscribeToCollection<TeamMemberItem>(
      'pengajar',
      (data) => {
        setPengajarList(data || []);
        setIsLoadingTeam(false);
      },
      () => {
        setIsLoadingTeam(false);
      }
    );

    const unsubPosters = subscribeToCollection<PosterItem>(
      'posters',
      (data) => {
        if (data && data.length > 0) {
          setPosterList(data);
          try {
            localStorage.setItem('airo_cache_posters', JSON.stringify(data));
          } catch {}
        } else {
          setPosterList(INITIAL_POSTERS);
        }
        setIsLoadingPoster(false);
      },
      () => {
        setIsLoadingPoster(false);
      }
    );

    const unsubLayanan = subscribeToCollection<LayananItem>(
      'layanan',
      (data) => {
        if (data && data.length > 0) {
          setLayananList(data);
          try {
            localStorage.setItem('airo_cache_layanan', JSON.stringify(data));
          } catch {}
        } else {
          setLayananList(INITIAL_LAYANAN);
        }
        setIsLoadingLayanan(false);
      },
      () => {
        setIsLoadingLayanan(false);
      }
    );


    return () => {
      unsubBerita();
      unsubPembimbing();
      unsubPengajar();
      unsubPosters();
      unsubLayanan();
    };
  }, [isLoggedIn]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await loginAdminWithFirebase(emailInput, passwordInput);
      setIsLoggedIn(true);
      const now = Date.now().toString();
      localStorage.setItem('airo_admin_logged_in', 'true');
      localStorage.setItem('airo_session_start', now);
      localStorage.setItem('airo_last_activity', now);
      setIsLoginModalOpen(false);
      setShowAdminDashboard(true);
      setEmailInput('');
      setPasswordInput('');
    } catch (err: any) {
      setLoginError(err.message || 'Email atau Password Admin salah!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdminFromFirebase();
    setIsLoggedIn(false);
    localStorage.removeItem('airo_admin_logged_in');
    localStorage.removeItem('airo_session_start');
    localStorage.removeItem('airo_last_activity');
    setShowAdminDashboard(false);
  };

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
    const timer = setInterval(() => {
      // Pause rotation if page is hidden (user switched tab) to save CPU/battery
      if (document.hidden) return;

      if (teamTab === 'pembimbing') {
        setSelectedPembimbingIndex((prev) => (prev + 1) % Math.max(1, pembimbingList.length));
      } else {
        setSelectedPengajarIndex((prev) => (prev + 1) % Math.max(1, pengajarList.length));
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [teamTab, pembimbingList.length, pengajarList.length]);

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
      rootMargin: '120px 0px 80px 0px',
      threshold: 0.01,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const revealElements = document.querySelectorAll('.reveal-element');

    revealElements.forEach((el) => {
      // Jika elemen sudah berada dalam area viewport saat tab berganti, reveal seketika tanpa delay
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100 && rect.bottom > -50) {
        el.classList.add('is-revealed');
      } else {
        observer.observe(el);
      }
    });

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

  // Secret multi-click admin portal trigger: 1x click = scroll ke beranda, 5x click = buka portal admin
  const logoClickCountRef = useRef<number>(0);
  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    // 1. Selalu jalankan fungsi kembali ke halaman beranda (scroll halus ke paling atas / #beranda)
    const berandaSection = document.getElementById('beranda');
    if (berandaSection) {
      berandaSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 2. Akumulasi jumlah klik berturut-turut untuk trigger secret portal admin
    logoClickCountRef.current += 1;

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    // Jika mencapai 5x klik berturut-turut, buka portal admin
    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      if (isLoggedIn) {
        setShowAdminDashboard(true);
      } else {
        setLoginError(null);
        setIsLoginModalOpen(true);
      }
      return;
    }

    // Reset hitungan klik jika tidak ada klik lanjutan dalam 1.5 detik
    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'h-16 sm:h-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs' 
            : 'h-16 sm:h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <button 
            type="button"
            onClick={handleLogoClick}
            className="flex items-center group cursor-pointer p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Kembali ke Beranda AIRO Robotics"
          >
            <img 
              src="/images/logo-airo.webp" 
              alt="AIRO Robotics Logo" 
              width={180}
              height={44}
              fetchPriority="high"
              decoding="async"
              className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </button>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a href="#beranda" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Beranda</a>
            <a href="#berita" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Berita</a>
            <a href="#tentang" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Tentang Kami</a>
            <a href="#tim" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Tim Kami</a>
            <a href="#layanan" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Layanan</a>
            <a href="#poster" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Poster</a>
            <a href="#galeri" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Galeri</a>
            <a href="#kontak" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Kontak</a>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {isLoggedIn && (
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs tracking-wide transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span>Dashboard Admin</span>
              </button>
            )}

            <a 
              href="#kontak" 
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs tracking-wide transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Hubungi Kami
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
              aria-label="Buka menu navigasi"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Navigasi AIRO</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <a href="#beranda" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Beranda</a>
          <a href="#berita" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Berita</a>
          <a href="#tentang" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Tentang Kami</a>
          <a href="#tim" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Tim Kami</a>
          <a href="#layanan" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Layanan</a>
          <a href="#poster" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Poster</a>
          <a href="#galeri" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Galeri</a>
          <a href="#kontak" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 px-3 py-2 rounded-lg transition-colors">Kontak</a>
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowAdminDashboard(true);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span>Dashboard Admin</span>
            </button>
          )}
          <a 
            href="#kontak" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center justify-center w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs tracking-wide transition-colors shadow-xs"
          >
            Hubungi Kami
          </a>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      <main className="flex-1">
        <section id="beranda" className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
          <div className="bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl shadow-blue-500/10 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden reveal-element">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),rgba(255,255,255,0))] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="flex-1 flex flex-col items-start text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold tracking-wide text-white mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-200" />
                Pendaftaran Terbuka {new Date().getFullYear()}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                AIRO — Artificial Intelligence Robotics Learning Center FTI URINDO
              </h1>
              
              <p className="text-white/90 text-sm sm:text-base mt-6 leading-relaxed max-w-xl">
                Belajar robotik dari dasar bersama instruktur berpengalaman, kurikulum terstruktur, dan praktik langsung menggunakan kit fisik interaktif.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-3.5 w-full sm:w-auto">
                <a 
                  href="#kontak" 
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-semibold text-sm tracking-wide text-center transition-all shadow-md hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Daftar Kelas Sekarang
                </a>
                <a 
                  href="#layanan" 
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700/80 border border-white/20 text-white font-semibold text-sm tracking-wide text-center transition-all backdrop-blur-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Lihat Pilihan Program
                </a>
              </div>
            </div>
            
            <div className="hidden md:flex flex-1 w-full justify-center items-center relative z-10 reveal-element reveal-delay-2">
              <div className="flex-1 flex justify-center items-center relative">
                <div 
                  className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
                  style={{ animation: 'floatSlow 4s ease-in-out infinite' }}
                >
                  <img 
                    src="/images/hero_robot.webp" 
                    alt="Robot Edukasi AIRO" 
                    decoding="async"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* SECTION BERITA (SEAMLESS INFINITE MARQUEE) */}
        {/* ========================================== */}
        <section id="berita" className="py-10 md:py-20 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden w-full relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-6 md:mb-10 text-center reveal-element">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">
              Informasi Terkini
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Berita & Kegiatan Terbaru AIRO
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto leading-relaxed">
              Jelajahi berita terbaru, workshop robotika, pengumuman resmi, dan pencapaian civitas akademika AIRO Robotics.
            </p>
          </div>

          {isLoadingBerita ? (
            <div className="py-16 px-4 text-center">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memuat berita terbaru...</p>
            </div>
          ) : beritaList.length === 0 ? (
            <div className="py-12 px-4 text-center max-w-md mx-auto bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Belum Ada Berita</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Kabar, pengumuman, dan artikel kegiatan robotika terbaru akan ditampilkan di sini setelah dipublikasikan.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View: 1 Card per Slide Carousel (< md) */}
              <div className="block md:hidden px-4 max-w-sm sm:max-w-md mx-auto">
                <MobileCarousel
                  minHeightClass="min-h-[410px]"
                  items={beritaList.map((item) => (
                    <div
                      key={`carousel-${item.id}`}
                      onClick={() => setSelectedBeritaModal(item)}
                      className="w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/60">
                          <img
                            src={formatImageSrc(item.image)}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            width={384}
                            height={192}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/hero_robot.webp';
                            }}
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded font-mono shadow-sm">
                            {item.category}
                          </span>
                        </div>

                        <div className="p-5 space-y-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                            📅 {item.date}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {item.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <span>Baca Selengkapnya</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                  ))}
                />
              </div>

              {/* Tablet & Desktop View: Running Card Auto-Scroll Carousel Container (>= md) */}
              <div className="hidden md:block marquee-container relative w-full overflow-hidden py-4">
                {/* Left & Right edge gradient fade masks for smooth entrance/exit */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 z-10 bg-gradient-to-r from-slate-100 dark:from-slate-900 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 z-10 bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent" />

                <div className="flex overflow-hidden select-none">
                  {/* Track 1 */}
                  <div className="flex shrink-0 items-stretch gap-6 pr-6 animate-marquee-seamless">
                    {marqueeBerita.map((item, index) => (
                      <div
                        key={`track1-${item.id}-${index}`}
                        onClick={() => setSelectedBeritaModal(item)}
                        className="w-80 sm:w-96 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/70 dark:hover:border-blue-500/70 transition-all duration-300 cursor-pointer group/card flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/60">
                            <img
                              src={formatImageSrc(item.image)}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              width={384}
                              height={192}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/hero_robot.webp';
                              }}
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded font-mono shadow-sm">
                              {item.category}
                            </span>
                          </div>

                          <div className="p-5 space-y-2">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                              📅 {item.date}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {item.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover/card:text-blue-700 dark:group-hover/card:text-blue-300">
                          <span>Baca Selengkapnya</span>
                          <svg className="w-4 h-4 group-hover/card:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Track 2 (Identical clone for continuous infinite loop without any gap or snap) */}
                  <div aria-hidden="true" className="flex shrink-0 items-stretch gap-6 pr-6 animate-marquee-seamless">
                    {marqueeBerita.map((item, index) => (
                      <div
                        key={`track2-${item.id}-${index}`}
                        onClick={() => setSelectedBeritaModal(item)}
                        className="w-80 sm:w-96 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/70 dark:hover:border-blue-500/70 transition-all duration-300 cursor-pointer group/card flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/60">
                            <img
                              src={formatImageSrc(item.image)}
                              alt={item.title}
                              loading="lazy"
                              decoding="async"
                              width={384}
                              height={192}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/hero_robot.webp';
                              }}
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded font-mono shadow-sm">
                              {item.category}
                            </span>
                          </div>

                          <div className="p-5 space-y-2">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                              📅 {item.date}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {item.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover/card:text-blue-700 dark:group-hover/card:text-blue-300">
                          <span>Baca Selengkapnya</span>
                          <svg className="w-4 h-4 group-hover/card:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>



        {/* ========================================== */}
        {/* TENTANG KAMI & LOKASI INTERACTIVE MAP      */}
        {/* ========================================== */}
        <section id="tentang" className="py-10 md:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-14 reveal-element">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Tentang Kami & Lokasi Pembelajaran
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Pendidikan pembelajaran Robotik yang jelas, ramah anak, terstruktur, dan berdampak nyata bagi kreativitas masa depan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Penjelasan Singkat Tentang Kami */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6 reveal-element reveal-delay-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Penjelasan Singkat Tentang Kami</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                 AIRO adalah wadah bagi para penggemar dan praktisi Robotik untuk berbagi pengetahuan, pengalaman, serta ide-ide inovatif. Melalui kolaborasi dan pengembangan teknologi robotik, komunitas ini berperan dalam meningkatkan keterampilan serta mendorong terciptanya solusi yang bermanfaat bagi masyarakat.</p>

                {/* Visi, Misi & Nilai Module Cards */}
                {/* Mobile View: 1 Card per Slide Carousel (< md) */}
                <div className="block md:hidden">
                  <MobileCarousel
                    minHeightClass="min-h-[180px]"
                    items={[
                      <div key="mobile-visi" className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-start gap-3.5 h-full">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visi Kami</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Memberdayakan generasi muda untuk membangun teknologi dari ide secara mandiri, logis, dan inovatif.</p>
                        </div>
                      </div>,
                      <div key="mobile-misi" className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-start gap-3.5 h-full">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Misi Kami</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Menyusun kurikulum bertahap, mendampingi praktik secara intensif, dan membentuk kemandirian persoalan teknis.</p>
                        </div>
                      </div>,
                      <div key="mobile-nilai" className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-start gap-3.5 h-full">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-1.41m8.595-8.594l1.414-1.414M3.553 5.879l1.414 1.413m8.596 8.596l1.414 1.414M16.243 4.757l-1.414 1.414M6.343 14.657l-1.414 1.414M12 3v1.5M12 19.5V21" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nilai Kami</h4>
                          <p className="text-xs text-rose-600 font-mono mt-0.5 font-semibold uppercase tracking-wider">Kreativitas, Kolaborasi, dan Tanggung Jawab</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Melahirkan karya inovatif yang bermanfaat bagi lingkungan sekitar, serta melatih kerja sama tim dan disiplin tinggi dalam memecahkan masalah.</p>
                        </div>
                      </div>
                    ]}
                  />
                </div>

                {/* Tablet & Desktop View: Vertical Stack Module Cards (>= md) */}
                <div className="hidden md:block space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visi Kami</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Memberdayakan generasi muda untuk membangun teknologi dari ide secara mandiri, logis, dan inovatif.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Misi Kami</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Menyusun kurikulum bertahap, mendampingi praktik secara intensif, dan membentuk kemandirian persoalan teknis.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-1.41m8.595-8.594l1.414-1.414M3.553 5.879l1.414 1.413m8.596 8.596l1.414 1.414M16.243 4.757l-1.414 1.414M6.343 14.657l-1.414 1.414M12 3v1.5M12 19.5V21" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nilai Kami</h4>
                      <p className="text-xs text-rose-600 font-mono mt-0.5 font-semibold uppercase tracking-wider">Kreativitas, Kolaborasi, dan Tanggung Jawab</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Melahirkan karya inovatif yang bermanfaat bagi lingkungan sekitar, serta melatih kerja sama tim dan disiplin tinggi dalam memecahkan masalah.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Map */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between reveal-element reveal-delay-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interactive Map</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Universitas Respati Indonesia (URINDO, Kampus A)</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-bold font-mono uppercase tracking-wider">
                  Lokasi Kampus
                </span>
              </div>

              <div className="w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative bg-slate-100 dark:bg-slate-800">
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
        <section id="tim" className="py-10 md:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-12 reveal-element">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Pembimbing & Pengajar Kami
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 leading-relaxed">
              Mengenal tim Pembimbing dan Pengajar Fakultas Teknologi Informasi Universitas Respati Indonesia.
            </p>

            {/* Top Tab Buttons: Pembimbing vs Pengajar */}
            <div className="flex items-center justify-center gap-2 mt-4 md:mt-8 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl w-fit mx-auto border border-slate-200/80 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => {
                  setTeamTab('pembimbing');
                  setSelectedPembimbingIndex(0);
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  teamTab === 'pembimbing'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
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
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                Pengajar
              </button>
            </div>
          </div>

          {/* Split Content Box (Matching Screenshot Layout) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden reveal-element">
            {isLoadingTeam ? (
              <div className="flex flex-col items-center justify-center p-16 text-center min-h-[440px]">
                <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memuat data tim...</p>
              </div>
            ) : (teamTab === 'pembimbing' ? pembimbingList : pengajarList).length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center min-h-[440px]">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Belum Ada Data {teamTab === 'pembimbing' ? 'Pembimbing' : 'Pengajar'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  Data {teamTab === 'pembimbing' ? 'pembimbing' : 'pengajar'} akan ditampilkan di sini setelah ditambahkan melalui Admin Dashboard.
                </p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row min-h-[480px]">
                
                {/* Left Panel: Member List Sidebar (Hidden on mobile < md) */}
                <div className="hidden md:flex w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex-col justify-between">
                  <div>
                    <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider mb-2">
                      Daftar {teamTab === 'pembimbing' ? `Pembimbing (${pembimbingList.length})` : `Pengajar (${pengajarList.length})`}
                    </div>
                    <div id="team-sidebar-scroll-container" className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                      {teamTab === 'pembimbing'
                        ? pembimbingList.map((item, idx) => (
                            <button
                              key={item.id}
                              id={`team-btn-pembimbing-${idx}`}
                              onClick={() => setSelectedPembimbingIndex(idx)}
                              className={`w-full text-left p-2.5 rounded-2xl text-xs transition-all duration-300 flex items-center gap-2.5 group ${
                                selectedPembimbingIndex === idx
                                  ? 'bg-slate-700 dark:bg-blue-600 text-white font-bold shadow-md scale-[1.02]'
                                  : 'text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs'
                              }`}
                            >
                              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center">
                                <img
                                  src={formatImageSrc(item.image)}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/images/hero_robot.webp';
                                  }}
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-extrabold leading-snug truncate">{item.name}</span>
                                <span className={`text-[11px] leading-tight truncate ${selectedPembimbingIndex === idx ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {item.role}
                                </span>
                                {item.institution && (
                                  <span className={`text-[10px] leading-tight truncate mt-0.5 ${selectedPembimbingIndex === idx ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {item.institution}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        : pengajarList.map((item, idx) => (
                            <button
                              key={item.id}
                              id={`team-btn-pengajar-${idx}`}
                              onClick={() => setSelectedPengajarIndex(idx)}
                              className={`w-full text-left p-2.5 rounded-2xl text-xs transition-all duration-300 flex items-center gap-2.5 group ${
                                selectedPengajarIndex === idx
                                  ? 'bg-slate-700 dark:bg-blue-600 text-white font-bold shadow-md scale-[1.02]'
                                  : 'text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs'
                              }`}
                            >
                              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center">
                                <img
                                  src={formatImageSrc(item.image)}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/images/hero_robot.webp';
                                  }}
                                />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-extrabold leading-snug truncate">{item.name}</span>
                                <span className={`text-[11px] leading-tight truncate ${selectedPengajarIndex === idx ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {item.role}
                                </span>
                                {item.institution && (
                                  <span className={`text-[10px] leading-tight truncate mt-0.5 ${selectedPengajarIndex === idx ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {item.institution}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Large Featured Card View */}
                <div className="flex-1 p-4 sm:p-6 bg-white dark:bg-slate-900 flex flex-col justify-center items-center h-full min-h-[380px] sm:min-h-[480px]">
                  {(() => {
                    const currentList = teamTab === 'pembimbing' ? pembimbingList : pengajarList;
                    const currentIndex = teamTab === 'pembimbing' ? selectedPembimbingIndex : selectedPengajarIndex;
                    const currentMember = currentList[currentIndex] || currentList[0];
                    
                    if (!currentMember) return null;

                    return (
                      <div key={currentMember.id} className="w-full h-full flex flex-col items-center justify-center animate-team-fade">
                        {/* Photo Showcase Box with SVG/Image and Overlay Profile Info */}
                        <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] rounded-[28px] overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md bg-slate-50 dark:bg-slate-950 flex items-center justify-center group">
                          <img 
                            key={currentMember.id}
                            src={formatImageSrc(currentMember.image)} 
                            alt={currentMember.name} 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain object-center p-4 transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/hero_robot.webp';
                            }}
                          />

                          {/* Top Right Floating Badge */}
                          <span className="absolute top-4 right-4 sm:top-5 sm:right-5 px-3.5 py-1.5 rounded-full bg-slate-900/80 dark:bg-slate-800/80 text-white font-mono font-bold text-[11px] uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm">
                            {currentMember.label || (teamTab === 'pembimbing' ? 'Pembimbing' : 'Pengajar')}
                          </span>

                          {/* Bottom Profile Details Gradient Banner */}
                          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent backdrop-blur-[2px] text-white flex flex-col gap-1 transition-all text-left">
                            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-snug drop-shadow-sm">
                              {currentMember.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-200">
                              <span className="font-semibold text-blue-300">
                                {currentMember.role}
                              </span>
                              {currentMember.institution && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-300 font-medium">
                                    {currentMember.institution}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mobile Navigation Controls (< & >) below photo for fast touch browsing */}
                        {currentList.length > 1 && (
                          <div className="md:hidden flex items-center justify-between w-full mt-3 px-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (teamTab === 'pembimbing') {
                                  setSelectedPembimbingIndex((prev) => (prev === 0 ? pembimbingList.length - 1 : prev - 1));
                                } else {
                                  setSelectedPengajarIndex((prev) => (prev === 0 ? pengajarList.length - 1 : prev - 1));
                                }
                              }}
                              aria-label="Sebelumnya"
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                              </svg>
                              <span>Sebelumnya</span>
                            </button>
                            <span className="text-[11px] font-mono font-medium text-slate-400">
                              {currentIndex + 1} / {currentList.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (teamTab === 'pembimbing') {
                                  setSelectedPembimbingIndex((prev) => (prev + 1) % pembimbingList.length);
                                } else {
                                  setSelectedPengajarIndex((prev) => (prev + 1) % pengajarList.length);
                                }
                              }}
                              aria-label="Berikutnya"
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                            >
                              <span>Berikutnya</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        </section>

        {/* ========================================== */}
        {/* HARGA & PAKET LAYANAN (TAB CONTENT)       */}
        {/* ========================================== */}
        <section id="layanan" className="py-10 md:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full transition-colors duration-200">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-12 reveal-element">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Harga & Paket Singkat
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 leading-relaxed">
              Layanan Mingguan/Bulanan. Untuk diskon/kelas khusus, cek kontak di bawah.
            </p>

            {/* Tab Navigation Buttons for Layanan */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 md:mt-8 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl w-fit mx-auto border border-slate-200/80 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => setActiveLayananTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activeLayananTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                Semua Paket
              </button>
              {distinctLayananGroups.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setActiveLayananTab(grp)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                    activeLayananTab === grp
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile View: 1 Card per Slide Carousel (< md) */}
          <div className="block md:hidden max-w-sm sm:max-w-md mx-auto">
            {filteredLayananItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Belum ada paket layanan.</div>
            ) : (
              <MobileCarousel
                minHeightClass="min-h-[590px]"
                items={filteredLayananItems.map((pkg) => (
                  <div key={`mobile-pkg-${pkg.id}`} className="w-full h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                    <div className="h-64 bg-slate-100 dark:bg-slate-950 relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
                      <img 
                        src={formatImageSrc(pkg.image)} 
                        alt={pkg.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center"
                      />
                      {pkg.group && (
                        <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-sm text-[10px] font-bold text-white font-mono uppercase tracking-wider shadow-sm">
                          {pkg.group}
                        </span>
                      )}
                      {pkg.level && (
                        <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-slate-200 font-mono tracking-wider shadow-sm">
                          {pkg.level}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Harga Paket</span>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{pkg.price}</h3>
                          {pkg.installment && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              💳 {pkg.installment}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-3">{pkg.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {pkg.description}
                        </p>

                        {pkg.features && pkg.features.length > 0 && (
                          <div className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                            {pkg.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold shrink-0">✓</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {pkg.tags && pkg.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {pkg.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full font-mono">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            const val = pkg.installment
                              ? `${pkg.title} (${pkg.price} - ${pkg.installment})`
                              : `${pkg.title} (${pkg.price})`;
                            selectPackage(val);
                          }}
                          className="block w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-all duration-200 shadow-sm"
                        >
                          {pkg.buttonText || 'Pilih Paket'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              />
            )}
          </div>

          {/* Tablet & Desktop View: Grid (>= md) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {filteredLayananItems.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="h-64 bg-slate-100 dark:bg-slate-950 relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
                  <img 
                    src={formatImageSrc(pkg.image)} 
                    alt={pkg.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {pkg.group && (
                    <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-sm text-[10px] font-bold text-white font-mono uppercase tracking-wider shadow-sm">
                      {pkg.group}
                    </span>
                  )}
                  {pkg.level && (
                    <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-slate-200 font-mono tracking-wider shadow-sm">
                      {pkg.level}
                    </span>
                  )}
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                      Harga Paket
                    </span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                        {pkg.price}
                      </h3>
                      {pkg.installment && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          💳 {pkg.installment}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {pkg.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    {pkg.features && pkg.features.length > 0 && (
                      <div className="mt-6 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold shrink-0">✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {pkg.tags && pkg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        const val = pkg.installment
                          ? `${pkg.title} (${pkg.price} - ${pkg.installment})`
                          : `${pkg.title} (${pkg.price})`;
                        selectPackage(val);
                      }}
                      className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition-all duration-200 shadow-sm shadow-blue-500/20"
                    >
                      {pkg.buttonText || 'Pilih Paket'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================== */}
        {/* POSTER PEMBELAJARAN & BROCHURE TAB SECTION */}
        {/* ========================================== */}
        <section id="poster" className="py-10 md:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full transition-colors duration-200">
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-12 reveal-element">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Poster Pembelajaran
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 leading-relaxed">
              Jelajahi poster resmi program pembelajaran robotik AIRO. Klik poster untuk memperbesar.
            </p>

            {/* Tab Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 md:mt-8 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl w-fit mx-auto border border-slate-200/80 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => setActivePosterTab('all')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  activePosterTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                Semua Poster
              </button>
              {posterList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePosterTab(p.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                    activePosterTab === p.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile View: 1 Card per Slide Carousel (< md) */}
          <div className="block md:hidden max-w-sm sm:max-w-md mx-auto my-1">
            {filteredPosterItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Belum ada poster.</div>
            ) : (
              <MobileCarousel
                minHeightClass="min-h-0"
                items={filteredPosterItems.map((poster) => (
                  <div 
                    key={`mobile-${poster.id}`}
                    onClick={() => setSelectedPosterModal(poster.image)}
                    className="w-full cursor-pointer p-2"
                  >
                    <div className="bg-slate-200/90 dark:bg-slate-800/90 p-4 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-xl backdrop-blur-sm">
                      <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                        <img 
                          src={formatImageSrc(poster.image)} 
                          alt={poster.title} 
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-cover rounded-xl"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between px-1">
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{poster.title}</span>
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30">
                          {poster.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              />
            )}
          </div>

          {/* Tablet & Desktop View: Posters Display Area with Floating Animations (>= md) */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-10 sm:gap-14 py-8 px-4 overflow-hidden">
            {filteredPosterItems.map((poster, idx) => (
              <div 
                key={poster.id}
                onClick={() => setSelectedPosterModal(poster.image)}
              >
                <div 
                  className="group relative cursor-pointer transform hover:scale-105 transition-all duration-300 ease-out"
                  style={{ 
                    animation: 'floatSlow 4s ease-in-out infinite',
                    animationDelay: `${idx * 2}s`
                  }}
                >
                  <div className={`bg-slate-200/90 dark:bg-slate-800/90 p-4 sm:p-5 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl backdrop-blur-sm max-w-sm sm:max-w-md ${idx % 2 === 0 ? '-rotate-3' : 'rotate-3'} group-hover:rotate-0 transition-transform duration-300`}>
                    <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner">
                      <img 
                        src={formatImageSrc(poster.image)} 
                        alt={poster.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 shadow-lg flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                          Lihat {poster.title}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between px-1">
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{poster.title}</span>
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30">
                        {poster.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                src={formatImageSrc(selectedPosterModal)} 
                alt="Poster Full Preview" 
                loading="eager"
                decoding="async"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ========================================== */}
        {/* GALERI KEGIATAN              */}
        {/* ========================================== */}
        <section id="galeri" className="py-10 md:py-20 bg-slate-100/60 dark:bg-slate-950 border-y border-slate-200/60 dark:border-slate-800/80 w-full transition-colors duration-200">
          <div className="px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12 reveal-element">
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Galeri Kegiatan
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 sm:mt-2">
                  Klik tombol untuk lihat semua
                </p>
              </div>
              <a 
                href="https://www.instagram.com/airoofficial_/"
                target="_blank" 
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                Lihat Semua
              </a>
            </div>

            {/* Mobile View: 1 Card per Slide Carousel (< md) */}
            <div className="block md:hidden max-w-sm sm:max-w-md mx-auto">
              <MobileCarousel
                minHeightClass="min-h-[340px]"
                items={[
                  <div key="mobile-gallery-1" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-64 overflow-hidden relative">
                      <img src="/images/gallery_level_1.webp" alt="Lego Mechanical Kit" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 1</span>
                    </div>
                    <div className="p-5 flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelas Robotik Level 1</h4>
                    </div>
                  </div>,
                  <div key="mobile-gallery-2" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-64 overflow-hidden relative">
                      <img src="/images/gallery_level_2.webp" alt="Arduino sensor setup" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 2</span>
                    </div>
                    <div className="p-5 flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelas Robotik Level 2</h4>
                    </div>
                  </div>,
                  <div key="mobile-gallery-3" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-64 overflow-hidden relative">
                      <img src="/images/gallery_level_3.webp" alt="Robotic Arm Setup" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 3</span>
                    </div>
                    <div className="p-5 flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelas Robotik level 3</h4>
                    </div>
                  </div>
                ]}
              />
            </div>

            {/* Tablet & Desktop View: Gallery Element Flex Responsive Grid Matrices Layout Container (>= md) */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              
              {/* Photo Card Block Module 1 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group reveal-element reveal-delay-1">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_1.webp" alt="Lego Mechanical Kit" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 1</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelas Robotik Level 1</h4>
                </div>
              </div>

              {/* Photo Card Block Module 2 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group reveal-element reveal-delay-2">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_2.webp" alt="Arduino sensor setup" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 2</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelas Robotik Level 2</h4>
                </div>
              </div>

              {/* Photo Card Block Module 3 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group reveal-element reveal-delay-3">
                <div className="h-64 overflow-hidden relative">
                  <img src="/images/gallery_level_3.webp" alt="Robotic Arm Setup" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">Level 3</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Kelas Robotik level 3</h4>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* KONTAK & HUBUNGI KAMI            */}
        {/* ========================================== */}
        <section id="kontak" className="py-10 md:py-20 bg-slate-100/60 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/80 w-full transition-colors duration-200">
          <div className="px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16 reveal-element">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Kontak & Form Pengiriman Pesan
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Hubungi kami jika ada pertanyaan atau pemesanan paket program Robotik.
              </p>
            </div>

            {/* Registration Input Form Pipeline Container UI Core Elements Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column Address Info Card Layout Panel */}
              <div className="w-full lg:col-span-5 space-y-4 text-left reveal-element reveal-delay-1">
                {/* Card 1: Instagram */}
                <a 
                  href="https://www.instagram.com/airoofficial_/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <FaInstagram />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      Instagram Resmi
                    </h4>
                    <p className="text-xs font-mono font-semibold text-pink-600 dark:text-pink-400 mt-0.5">
                      @airoofficial_
                    </p>
                  </div>
                </a>

                {/* Card 2: Google Form */}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSetfmpFFwKaW6hwRmIFl0pCmmGW_v6hvNPol4zHOCYn2jjtkw/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <SiGoogleforms />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Formulir Pendaftaran Ekstrakurikuler
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      AIRO FTI URINDO — Klik untuk mendaftar
                    </p>
                  </div>
                </a>

                {/* Card 3: Email Resmi */}
                <a
                  href="mailto:airo@urindo.ac.id"
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Saluran Email Resmi
                    </h4>
                    <p className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      airo@urindo.ac.id
                    </p>
                  </div>
                </a>

                {/* Card 4: WhatsApp Hotline */}
                <a 
                  href="https://wa.me/+6281280007270" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Hotline WhatsApp Admin
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Senin - Sabtu (08.00 - 17.00 WIB)</p>
                    <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +62 812-8000-7270
                    </p>
                  </div>
                </a>
              </div>

              {/* Right Column Registration Message Input Block Forms */}
              <div className="w-full lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Kirim Pesan Langsung</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Konsultasikan jadwal kelas atau pertanyaan Anda, formulir akan otomatis terhubung ke WhatsApp Admin.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Nama Lengkap</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Contoh: Dinda Alya Ainsani" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Nomor WhatsApp / HP</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 081234567890" 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="package" className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Pilihan Paket Program</label>
                    <select 
                      id="package" 
                      name="package"
                      value={formData.package}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Pilih Paket Kelas">Pilih Paket Kelas</option>
                      {layananList.map((item) => {
                        const val = item.installment
                          ? `${item.title} (${item.price} - ${item.installment})`
                          : `${item.title} (${item.price})`;
                        return (
                          <option key={item.id} value={val}>
                            {item.title} - {item.price} {item.installment ? `(${item.installment})` : ''}
                          </option>
                        );
                      })}
                      <option value="Kelas Custom / Konsultasi Khusus">Kelas Custom / Konsultasi Khusus</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Pesan atau Catatan Khusus</label>
                    <textarea 
                      id="message" 
                      name="message"
                      rows={4} 
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tulis pesan Anda disini (misal: jadwal kelas yang diinginkan, tingkat umur anak, dll)..." 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-y"
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
            <span className="text-[11px] font-mono tracking-wider text-slate-500">© {new Date().getFullYear()} AIRO. Hak Cipta Dilindungi Undang-Undang.</span>
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
                    

      {/* Modal Lightbox for Berita Detail */}
      {selectedBeritaModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedBeritaModal(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md p-6 flex flex-col overflow-y-auto text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Detail Berita & Kegiatan
              </span>
              <button
                onClick={() => setSelectedBeritaModal(null)}
                className="w-7 h-7 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors text-xs"
                aria-label="Tutup Berita"
              >
                ✕
              </button>
            </div>

            <div className="h-56 sm:h-72 relative rounded-lg overflow-hidden mb-4 shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <img 
                src={formatImageSrc(selectedBeritaModal.image)} 
                alt={selectedBeritaModal.title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/hero_robot.webp';
                }}
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider rounded font-mono shadow-sm">
                {selectedBeritaModal.category}
              </span>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block mb-1">
              📅 {selectedBeritaModal.date}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
              {selectedBeritaModal.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {selectedBeritaModal.content || selectedBeritaModal.excerpt}
            </p>
          </div>
        </div>
      )}

      {/* Admin Login Modal (2-Step Verification) - Flat Clean Design */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Portal Autentikasi Admin
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Masuk menggunakan akun Firebase Authentication
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                aria-label="Tutup modal login"
                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Admin</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@airo.urindo.ac.id"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 flex items-center justify-center rounded"
                    title={showPassword ? "Sembunyikan" : "Tampilkan"}
                  >
                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 text-center bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900">
                  {loginError}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors disabled:opacity-50 shadow-sm shadow-blue-500/20"
                >
                  {isLoggingIn ? 'Memverifikasi...' : 'Masuk Dashboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Dashboard Overlay Component */}
      {showAdminDashboard && (
        <AdminDashboard
          isOpen={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
          onLogout={handleLogout}
          beritaList={beritaList}
          setBeritaList={setBeritaList}
          pengajarList={pengajarList}
          setPengajarList={setPengajarList}
          pembimbingList={pembimbingList}
          setPembimbingList={setPembimbingList}
          layananList={layananList}
          setLayananList={setLayananList}
          posterList={posterList}
          setPosterList={setPosterList}
        />
      )}
    </div>
  );
}
