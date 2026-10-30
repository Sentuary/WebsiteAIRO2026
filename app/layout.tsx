import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL('https://airo.urindo.ac.id');

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "AIRO - Artificial Intelligence Robotics & Jasa Mengajar Robotika",
    template: "%s | AIRO Robotics Learning Center FTI URINDO",
  },
  description: "AIRO (Artificial Intelligence Robotics) — Platform edukasi, les & jasa mengajar robotika terbaik untuk anak-anak, siswa & mahasiswa. Bekerja sama dengan Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO).",
  keywords: [
    "AIRO",
    "AIRO URINDO",
    "airo.urindo.ac.id",
    "AIRO Robotics",
    "Jasa Mengajar Robotika",
    "Jasa Mengajar Robotik",
    "Kursus Robotik",
    "Les Robotik",
    "Belajar Robotika",
    "Robotik URINDO",
    "Universitas Respati Indonesia",
    "Pendidikan AI & Robotika",
    "Kursus Arduino",
    "Pelatihan Robotik Anak",
    "Trainer Robotika Jakarta",
    "FTI URINDO"
  ],
  authors: [{ name: "AIRO Robotics Lab - FTI URINDO" }],
  creator: "AIRO Robotics Lab",
  publisher: "Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO)",
  category: "Education",
  applicationName: "AIRO Robotics",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "AIRO - Artificial Intelligence Robotics & Jasa Mengajar Robotika",
    description: "Platform edukasi, les & jasa mengajar robotika modern bagi anak-anak dan mahasiswa, bekerja sama dengan FTI URINDO.",
    url: "https://airo.urindo.ac.id",
    siteName: "AIRO Robotics Learning Center FTI URINDO",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/logo-airo.webp",
        width: 800,
        height: 300,
        alt: "AIRO - Artificial Intelligence Robotics Learning Center FTI URINDO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIRO - Artificial Intelligence Robotics & Jasa Mengajar Robotika",
    description: "Platform edukasi, les & jasa mengajar robotika modern bagi anak-anak dan mahasiswa, bekerja sama dengan FTI URINDO.",
    images: ["/images/logo-airo.webp"],
    creator: "@airo_robotics",
  },
  alternates: {
    canonical: "https://airo.urindo.ac.id",
  },
  icons: {
    icon: [
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: ["/favicon.webp"],
    apple: [
      { url: "/favicon.webp", type: "image/webp" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "AIRO - Artificial Intelligence Robotics",
    "alternateName": ["AIRO Robotics", "Jasa Mengajar Robotika", "AIRO Learning Center FTI URINDO"],
    "url": "https://airo.urindo.ac.id",
    "logo": "https://airo.urindo.ac.id/images/logo-airo.webp",
    "description": "Platform edukasi dan jasa mengajar robotika modern bagi anak-anak dan mahasiswa, bekerjasama dengan Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO).",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jakarta",
      "addressCountry": "ID"
    },
    "sameAs": [
      "https://urindo.ac.id"
    ],
    "parentOrganization": {
      "@type": "EducationalOrganization",
      "name": "Fakultas Teknologi Informasi Universitas Respati Indonesia (URINDO)",
      "url": "https://urindo.ac.id"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Program Pembelajaran Robotika AIRO",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "Level 1 - Animal Robotics",
            "description": "Pengenalan dasar mekanisme mekanik dan kontrol gerak robotik bertema hewan."
          },
          "price": "2000000",
          "priceCurrency": "IDR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "Level 2 - Smart Life System",
            "description": "Pembelajaran pemrograman mikrokontroler Arduino dan sensor otomatisasi rumah pintar."
          },
          "price": "2000000",
          "priceCurrency": "IDR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "Level 3 - Advance Smart Life & AI",
            "description": "Tingkat lanjut integrasi sensor kompleks, IoT, dan algoritma kecerdasan buatan."
          },
          "price": "2000000",
          "priceCurrency": "IDR"
        }
      ]
    }
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
