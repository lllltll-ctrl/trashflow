import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrashFlow · Диспетчер',
  description: 'Дашборд управління відходами для ТГ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
