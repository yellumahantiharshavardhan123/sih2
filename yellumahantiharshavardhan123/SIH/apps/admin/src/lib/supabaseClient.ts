import { createClient as createSBClient, SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const service = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE as string | undefined;
  const key = service || anon;
  return createSBClient(url, key, { realtime: { persistConnectivity: true } });
}

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const service = (process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE) as string;
  return createSBClient(url, service, { auth: { persistSession: false } });
}
