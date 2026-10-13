import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PENA Kejari Batang',
  description:
    'Sistem Pencatatan Inventarisasi ATK dengan kiosk pengambilan berkamera, CRUD barang, peringatan stok otomatis, dan laporan bulanan.',
  openGraph: {
    title: 'PENA Kejaksaan Negeri Batang',
    description:
      'Sistem Pencatatan Inventarisasi ATK dengan kiosk pengambilan berkamera, CRUD barang, peringatan stok otomatis, dan laporan bulanan',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

