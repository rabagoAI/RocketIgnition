export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ── Tipos Row (lo que devuelve la BD) ────────────────────────────────────────

export interface RocketRow {
  id: string;
  name: string;
  agency: string;
  country: string;
  first_flight: string | null;
  height_m: number | null;
  payload_leo_kg: number | null;
  payload_gto_kg: number | null;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface RocketVersionRow {
  id: string;
  rocket_id: string;
  version_name: string;
  year: number | null;
  changes_summary: string | null;
  image_url: string | null;
}

export interface RocketComponentRow {
  id: string;
  rocket_id: string;
  version_id: string | null;
  name: string;
  x_percent: number;
  y_percent: number;
  short_description: string | null;
  full_description: string | null;
  simple_description: string | null;
  key_fact: string | null;
  order_index: number;
}

export interface UserFavoriteRow {
  id: string;
  user_id: string;
  rocket_id: string | null;
  launch_id: string | null;
  created_at: string;
}

export interface NotificationPreferencesRow {
  id: string;
  user_id: string;
  notify_24h: boolean;
  notify_2h: boolean;
  notify_30min: boolean;
  notify_10min: boolean;
  notify_scrub: boolean;
  agencies_filter: string[];
}

export interface PushTokenRow {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
}

// ── Tipos Insert (campos con DEFAULT son opcionales) ─────────────────────────

export interface RocketInsert {
  id?: string;
  name: string;
  agency: string;
  country: string;
  first_flight?: string | null;
  height_m?: number | null;
  payload_leo_kg?: number | null;
  payload_gto_kg?: number | null;
  description?: string | null;
  image_url?: string | null;
  is_published?: boolean;
  created_at?: string;
}

export interface RocketVersionInsert {
  id?: string;
  rocket_id: string;
  version_name: string;
  year?: number | null;
  changes_summary?: string | null;
  image_url?: string | null;
}

export interface RocketComponentInsert {
  id?: string;
  rocket_id: string;
  version_id?: string | null;
  name: string;
  x_percent: number;
  y_percent: number;
  short_description?: string | null;
  full_description?: string | null;
  simple_description?: string | null;
  key_fact?: string | null;
  order_index?: number;
}

export interface UserFavoriteInsert {
  id?: string;
  user_id: string;
  rocket_id?: string | null;
  launch_id?: string | null;
  created_at?: string;
}

export interface NotificationPreferencesInsert {
  id?: string;
  user_id: string;
  notify_24h?: boolean;
  notify_2h?: boolean;
  notify_30min?: boolean;
  notify_10min?: boolean;
  notify_scrub?: boolean;
  agencies_filter?: string[];
}

export interface PushTokenInsert {
  id?: string;
  user_id: string;
  token: string;
  created_at?: string;
}

// ── Database shape para createClient<Database> ───────────────────────────────
// Supabase JS v2 requiere Relationships, Views, Functions, Enums en el tipo.

export interface Database {
  public: {
    Tables: {
      rockets: {
        Row: RocketRow;
        Insert: RocketInsert;
        Update: Partial<RocketInsert>;
        Relationships: [];
      };
      rocket_versions: {
        Row: RocketVersionRow;
        Insert: RocketVersionInsert;
        Update: Partial<RocketVersionInsert>;
        Relationships: [];
      };
      rocket_components: {
        Row: RocketComponentRow;
        Insert: RocketComponentInsert;
        Update: Partial<RocketComponentInsert>;
        Relationships: [];
      };
      user_favorites: {
        Row: UserFavoriteRow;
        Insert: UserFavoriteInsert;
        Update: Partial<UserFavoriteInsert>;
        Relationships: [];
      };
      notification_preferences: {
        Row: NotificationPreferencesRow;
        Insert: NotificationPreferencesInsert;
        Update: Partial<NotificationPreferencesInsert>;
        Relationships: [];
      };
      push_tokens: {
        Row: PushTokenRow;
        Insert: PushTokenInsert;
        Update: Partial<PushTokenInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Aliases cortos para uso en la app
export type Rocket = RocketRow;
export type RocketVersion = RocketVersionRow;
export type RocketComponent = RocketComponentRow;
export type UserFavorite = UserFavoriteRow;
export type NotificationPreferences = NotificationPreferencesRow;
export type PushToken = PushTokenRow;
