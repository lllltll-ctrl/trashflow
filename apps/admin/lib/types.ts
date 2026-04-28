import type { ComplaintStatus, WasteCategoryId } from '@trashflow/db';

export type Complaint = {
  id: string;
  community_id: string;
  reporter_id: string | null;
  location: string; // WKT or GeoJSON depending on select
  lat: number | null;
  lng: number | null;
  photo_urls: string[];
  category_id: WasteCategoryId | null;
  description: string | null;
  status: ComplaintStatus;
  assigned_to: string | null;
  assigned_crew_id: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type Crew = {
  id: string;
  community_id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
};

export type Profile = {
  id: string;
  community_id: string;
  role: 'resident' | 'dispatcher' | 'admin';
  full_name: string | null;
  phone: string | null;
};

export type KpiSnapshot = {
  new_count: number;
  in_progress_count: number;
  resolved_7d: number;
  avg_resolution_hours: number | null;
};
