import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

// createBrowserClient stores the session in cookies (not localStorage).
// This is required so the middleware (which reads cookies via @supabase/ssr)
// sees the same session as the browser. Using createClient from
// @supabase/supabase-js stored sessions in localStorage, causing the
// middleware to see no session and redirect every protected route to /login.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          analysis_type: string;
          risk_score: number;
          risk_level: string;
          verdict: string;
          scam_type: string;
          full_result: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          analysis_type: string;
          risk_score: number;
          risk_level: string;
          verdict: string;
          scam_type: string;
          full_result: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          analysis_type?: string;
          risk_score?: number;
          risk_level?: string;
          verdict?: string;
          scam_type?: string;
          full_result?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
  };
};
