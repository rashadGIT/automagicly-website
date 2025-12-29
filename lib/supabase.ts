import { createClient } from '@supabase/supabase-js';

// Client-side Supabase (public, limited access)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase (full access with service role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Type definitions for our database
export interface Review {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  rating: number;
  review_text: string;
  service_type: string;
  status: 'pending' | 'approved' | 'rejected';
  featured?: boolean;
  approval_token?: string;
  token_expires_at?: string;
  created_at: string;
  approved_at?: string;
  updated_at: string;
}
