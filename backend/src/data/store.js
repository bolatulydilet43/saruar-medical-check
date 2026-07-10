// Picks the Supabase-backed store when SUPABASE_URL/SUPABASE_SERVICE_KEY are set
// (see supabaseClient.js), otherwise falls back to the in-memory store so local
// dev keeps working without a database. Route handlers only ever import `store`
// and must treat every method as async (`await store.xxx()`).
import { isSupabaseConfigured } from './supabaseClient.js';
import { memoryStore } from './memoryStore.js';
import { supabaseStore } from './supabaseStore.js';

export const store = isSupabaseConfigured ? supabaseStore : memoryStore;
