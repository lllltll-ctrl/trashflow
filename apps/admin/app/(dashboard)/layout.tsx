import Link from 'next/link';
import { CalendarClock, Home, ListChecks, LogOut, Map, MapPin, MessageCircle, Route } from 'lucide-react';
import { signOutAction } from '@/app/actions';
import { getCurrentProfile } from '@/lib/queries';

const navItems = [
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

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-card md:flex">
        <div className="p-4">
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
        <div className="mt-auto border-t p-4">
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
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
