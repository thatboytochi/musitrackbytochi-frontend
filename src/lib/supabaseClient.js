import { createClient } from "@supabase/supabase-js";

// Browser client: uses the PUBLIC anon key. Row Level Security (see schema.sql)
// is what keeps one user's rows away from another's.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
