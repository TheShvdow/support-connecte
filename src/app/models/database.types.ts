export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string; cat: string; cat_en: string; fr: string; en: string;
          price: string; price_en: string; d: string; d_en: string;
          color: string; ico: string; img: string | null;
          avantages: string[]; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      realisations: {
        Row: {
          id: number; fr: string; en: string; cat: string;
          color: string; year: string; img: string | null; created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['realisations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['realisations']['Insert']>;
        Relationships: [];
      };
      demandes: {
        Row: {
          id: number; ref: string; client: string; detail: string; type: string;
          date: string; statut: string; notes: string; email: string; tel: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['demandes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['demandes']['Insert']>;
        Relationships: [];
      };
      contenus: {
        Row: { id: string; title: string; body: any };
        Insert: Database['public']['Tables']['contenus']['Row'];
        Update: Partial<Database['public']['Tables']['contenus']['Row']>;
        Relationships: [];
      };
      qr_codes: {
        Row: {
          id: string; name: string; destination: string; active: boolean;
          expires_at: string | null; created_at: string; scans: number;
          max_scans: number | null; style: Json;
        };
        Insert: Omit<Database['public']['Tables']['qr_codes']['Row'], 'scans' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['qr_codes']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_qr_scans: { Args: { qr_id: string }; Returns: void };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
