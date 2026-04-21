'use client';

import dynamic from 'next/dynamic';
import type { Complaint } from '@/lib/types';

const AdminMap = dynamic(() => import('./admin-map').then((m) => m.AdminMap), {
  ssr: false,
  loading: () => <div className="h-[28rem] w-full animate-pulse rounded-lg bg-muted" />,
});

export function AdminMapLoader({ complaints }: { complaints: Complaint[] }) {
  return <AdminMap complaints={complaints} />;
}
