import Link from 'next/link';
import { Home, ListChecks, Map, MapPin, LineChart } from 'lucide-react';

const navItems = [
  { href: '/' as const, label: 'Огляд', icon: Home },
  { href: '/complaints' as const, label: 'Скарги', icon: ListChecks },
  { href: '/map' as const, label: 'Тепломапа', icon: Map },
  { href: '/points' as const, label: 'Точки збору', icon: MapPin },
  { href: '/analytics' as const, label: 'Аналітика', icon: LineChart },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-card p-4 md:flex">
        <div className="mb-6 px-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">TrashFlow</p>
          <p className="font-semibold">Диспетчер</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
