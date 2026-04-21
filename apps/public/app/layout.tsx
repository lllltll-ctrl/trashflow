import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrashFlow',
  description: 'Сортуй, скаржся, очищай громаду',
  manifest: '/manifest.webmanifest',
  applicationName: 'TrashFlow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TrashFlow',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
