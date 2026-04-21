/**
 * Hand-written minimal schema types. Will be replaced by:
 *   pnpm exec supabase gen types typescript --linked > packages/db/src/types.gen.ts
 * once the user runs `supabase login` and re-links the project.
 *
 * Keep this file in sync with supabase/migrations/ so the apps typecheck
 * against the real schema shape.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ComplaintStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
type UserRole = 'resident' | 'dispatcher' | 'admin';
type WasteCategoryId = 'plastic' | 'paper' | 'glass' | 'metal' | 'hazardous';

interface CommunitiesRow {
  id: string;
  slug: string;
  name: string;
  region: string;
  bbox: string | null;
  created_at: string;
}

interface ProfilesRow {
  id: string;
  community_id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface WasteCategoriesRow {
  id: WasteCategoryId;
  name_ua: string;
  description: string | null;
  hazard_level: number;
  icon_url: string | null;
}

interface CollectionPointsRow {
  id: string;
  community_id: string;
  name: string;
  location: string;
  address: string | null;
  accepts: string[];
  schedule: Json | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ComplaintsRow {
  id: string;
  community_id: string;
  reporter_id: string | null;
  location: string;
  photo_urls: string[];
  category_id: WasteCategoryId | null;
  description: string | null;
  status: ComplaintStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface CvClassificationsRow {
  id: string;
  community_id: string | null;
  photo_url: string;
  predicted_category: WasteCategoryId | null;
  confidence: number;
  user_corrected_to: WasteCategoryId | null;
  created_at: string;
}

type Insert<R, RequiredKeys extends keyof R = never> = Partial<R> &
  Pick<R, RequiredKeys>;
type Update<R> = Partial<R>;
type Relationships = readonly never[];

export interface Database {
  public: {
    Tables: {
      communities: {
        Row: CommunitiesRow;
        Insert: Insert<CommunitiesRow, 'slug' | 'name' | 'region'>;
        Update: Update<CommunitiesRow>;
        Relationships: Relationships;
      };
      profiles: {
        Row: ProfilesRow;
        Insert: Insert<ProfilesRow, 'id' | 'community_id'>;
        Update: Update<ProfilesRow>;
        Relationships: Relationships;
      };
      waste_categories: {
        Row: WasteCategoriesRow;
        Insert: Insert<WasteCategoriesRow, 'id' | 'name_ua'>;
        Update: Update<WasteCategoriesRow>;
        Relationships: Relationships;
      };
      collection_points: {
        Row: CollectionPointsRow;
        Insert: Insert<CollectionPointsRow, 'community_id' | 'name' | 'location' | 'accepts'>;
        Update: Update<CollectionPointsRow>;
        Relationships: Relationships;
      };
      complaints: {
        Row: ComplaintsRow;
        Insert: Insert<ComplaintsRow, 'community_id' | 'location' | 'photo_urls'>;
        Update: Update<ComplaintsRow>;
        Relationships: Relationships;
      };
      cv_classifications: {
        Row: CvClassificationsRow;
        Insert: Insert<CvClassificationsRow, 'photo_url' | 'confidence'>;
        Update: Update<CvClassificationsRow>;
        Relationships: Relationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      points_nearby: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_category?: string | null;
          p_radius_m?: number;
          p_limit?: number;
          p_community_slug?: string | null;
        };
        Returns: Array<{
          id: string;
          name: string;
          address: string | null;
          accepts: string[];
          schedule: Json | null;
          lat: number;
          lng: number;
          distance_m: number;
        }>;
      };
      complaint_heatmap: {
        Args: { p_days_back?: number; p_hex_size_m?: number };
        Returns: Array<{ hex: string; count: number; last_at: string }>;
      };
    };
    Enums: {
      complaint_status: ComplaintStatus;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
