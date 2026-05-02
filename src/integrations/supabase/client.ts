// Browser client — use this in Client Components ('use client').
// Uses the user's session from cookies automatically via @supabase/ssr.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
