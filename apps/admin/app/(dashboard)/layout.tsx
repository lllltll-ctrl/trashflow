import Link from 'next/link';
import { CalendarClock, Home, ListChecks, LogOut, Map, MapPin, MessageCircle, Route } from 'lucide-react';
import { signOutAction } from '@/app/actions';
import { getCurrentProfile } from '@/lib/queries';
import { MobileSidebar } from './mobile-sidebar';

export const navItems = [
  { href: '/' as const, label: 'Огляд', icon: Home },
  { href: '/complaints' as const, label: 'Скарги', icon: ListChecks },
  { href: '/map' as const, label: 'Жива карта', icon: Map },
  { href: '/routes' as const, label: 'Маршрути', icon: Route },
  { href: '/points' as const, label: 'Точки збору', icon: MapPin },
  { href: '/schedule' as const, label: 'Графік вивозу', icon: CalendarClock },
  { href: '/support' as const, label: 'Підтримка', icon: MessageCircle },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  const sidebarContent = (
    <>
      <div className="p-4 flex-1 overflow-y-auto">
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
      </div>
      <div className="border-t p-4">
        {profile && (
          <div className="mb-3 px-1 text-xs">
            <p className="truncate font-medium">{profile.full_name ?? 'Диспетчер'}</p>
            <p className="truncate text-muted-foreground">роль: {profile.role}</p>
          </div>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" aria-hidden />
            Вийти
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card">
        {sidebarContent}
      </aside>

      {/* Mobile: top header bar + slide-in sidebar drawer */}
      <MobileSidebar>{sidebarContent}</MobileSidebar>

      {/* Page content */}
      <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
    </div>
  );
}
