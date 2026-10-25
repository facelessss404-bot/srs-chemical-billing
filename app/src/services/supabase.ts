import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Party, Item, Invoice, CompanyProfile, SupabaseConfig } from '../types';

const STORAGE_KEY = 'sbr_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        url: parsed.url || defaultUrl,
        anon_key: parsed.anon_key || defaultKey,
        is_connected: Boolean(parsed.url && parsed.anon_key)
      };
    }
  } catch (e) {
    console.error('Failed to parse stored Supabase config:', e);
  }

  return {
    url: defaultUrl,
    anon_key: defaultKey,
    is_connected: Boolean(defaultUrl && defaultKey)
  };
}

export function saveStoredSupabaseConfig(config: { url: string; anon_key: string }): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    url: config.url.trim(),
    anon_key: config.anon_key.trim(),
    is_connected: Boolean(config.url && config.anon_key)
  }));
  clientInstance = null; // reset cached client
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const config = getStoredSupabaseConfig();
  if (config.url && config.anon_key) {
    try {
      clientInstance = createClient(config.url, config.anon_key);
      return clientInstance;
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url.trim(), anonKey.trim());
    const { error } = await testClient.from('parties').select('id').limit(1);
    if (error) {
      // Check if table missing
      if (error.code === '42P01') {
        return { success: false, message: 'Connected to Supabase, but tables not yet created! Please run supabase_schema.sql in SQL Editor.' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase Cloud successfully!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}
