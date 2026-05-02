// Auto-generated types. Regenerate with: npx supabase gen types typescript --project-id <ref> > src/integrations/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type BoardLayout = {
  tiles: { q: number; r: number; terrain: string; number: number }[];
  settlements: { q: number; r: number; vertex: number; player: string; type: "settlement" | "city" }[];
  roads: { q: number; r: number; edge: number; player: string }[];
  robber: { q: number; r: number };
  ports: { q: number; r: number; type: string; edge: number }[];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          username: string | null;
          is_premium: boolean;
          score: number;
          puzzles_created: number;
        };
        Insert: {
          id: string;
          created_at?: string;
          username?: string | null;
          is_premium?: boolean;
          score?: number;
          puzzles_created?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string | null;
          is_premium?: boolean;
          score?: number;
          puzzles_created?: number;
        };
      };
      puzzles: {
        Row: {
          id: number;
          created_at: string;
          title: string | null;
          description: string | null;
          difficulty: string | null;
          image_url: string | null;
          solved_amount: number | null;
          explanation: string | null;
          creator_user: string | null;
          choices: string[] | null;
          correct_choice: number | null;
          board_layout: BoardLayout | null;
          target_points: number | null;
          move_limit: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          title?: string | null;
          description?: string | null;
          difficulty?: string | null;
          image_url?: string | null;
          solved_amount?: number | null;
          explanation?: string | null;
          creator_user?: string | null;
          choices?: string[] | null;
          correct_choice?: number | null;
          board_layout?: BoardLayout | null;
          target_points?: number | null;
          move_limit?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          title?: string | null;
          description?: string | null;
          difficulty?: string | null;
          image_url?: string | null;
          solved_amount?: number | null;
          explanation?: string | null;
          creator_user?: string | null;
          choices?: string[] | null;
          correct_choice?: number | null;
          board_layout?: BoardLayout | null;
          target_points?: number | null;
          move_limit?: number | null;
        };
      };
      user_progress: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          puzzle_id: number;
          completed: boolean;
          attempts: number;
          solved_at: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          puzzle_id: number;
          completed?: boolean;
          attempts?: number;
          solved_at?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          puzzle_id?: number;
          completed?: boolean;
          attempts?: number;
          solved_at?: string | null;
        };
      };
      daily_challenge: {
        Row: {
          id: number;
          created_at: string;
          challenge_date: string;
          puzzle_id: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          challenge_date: string;
          puzzle_id: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          challenge_date?: string;
          puzzle_id?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"];

export const Constants = {
  public: { Enums: {} },
} as const;
