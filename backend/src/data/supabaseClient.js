import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

export const isSupabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// Service-role key bypasses RLS — this client must only ever be used from the backend.
// `realtime.transport` is required on Node < 22, which has no native WebSocket.
export const supabase = isSupabaseConfigured
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { realtime: { transport: ws } })
  : null;
