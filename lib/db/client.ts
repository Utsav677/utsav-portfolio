import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;
let _public: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    _admin = createClient(url, key);
  }
  return _admin;
}

export function getSupabasePublic(): SupabaseClient {
  if (!_public) {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_ANON_KEY ?? '';
    _public = createClient(url, key);
  }
  return _public;
}

// Legacy named exports for backward compat — resolved lazily
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_t, p) => {
    const client = getSupabaseAdmin();
    const val = (client as any)[p];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export const supabasePublic = new Proxy({} as SupabaseClient, {
  get: (_t, p) => {
    const client = getSupabasePublic();
    const val = (client as any)[p];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
