import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LmsProvider } from '@/context/LmsContext';

export const metadata: Metadata = {
  title: 'EduSchool - School Platform',
  description: 'Platform Pembelajaran & Manajemen Sekolah Terpadu untuk Admin, Guru, dan Siswa',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased selection:bg-blue-600 selection:text-white font-sans">
        <LmsProvider>
          <main className="w-full min-h-screen flex flex-col">{children}</main>
        </LmsProvider>
      </body>
    </html>
  );
}
