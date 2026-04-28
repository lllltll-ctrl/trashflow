'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Mobile-only: renders a fixed top header bar with a hamburger button
 * and a slide-in drawer containing the sidebar content passed as children.
 * On desktop (md+) this component renders nothing — the static aside handles it.
 */
export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Close drawer on route change (clicking a nav link)
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Mobile header bar — visible only below md */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b bg-card px-4">
        <button
          type="button"
          aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
        <span className="text-sm font-semibold">TrashFlow Адмін</span>
      </div>

      {/* Offset content below the fixed header on mobile */}
      <div className="md:hidden h-14" aria-hidden />

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={[
          'md:hidden fixed top-14 left-0 bottom-0 z-50 flex w-64 flex-col border-r bg-card',
          'transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Навігаційне меню"
      >
        {/* Wrap children in a click handler so nav links close the drawer */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="flex flex-1 flex-col overflow-y-auto" onClick={() => setOpen(false)}>
          {children}
        </div>
      </aside>
    </>
  );
}
