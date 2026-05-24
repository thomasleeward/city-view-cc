export type ProfileRole = "admin";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: ProfileRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: ProfileRole;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          role?: ProfileRole;
        };
        Relationships: [];
      };
      sermon_series: {
        Row: {
          id: string;
          name: string;
          date_label: string;
          start_date: string;
          end_date: string | null;
          image_url: string | null;
          youtube_playlist_url: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          date_label: string;
          start_date: string;
          end_date?: string | null;
          image_url?: string | null;
          youtube_playlist_url: string;
          sort_order?: number;
          is_published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["sermon_series"]["Insert"]>;
        Relationships: [];
      };
      hero_slides: {
        Row: {
          id: string;
          headline: string;
          subheadline: string | null;
          image_url: string | null;
          video_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          headline: string;
          subheadline?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["hero_slides"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Record<string, unknown>;
        };
        Update: {
          value?: Record<string, unknown>;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
