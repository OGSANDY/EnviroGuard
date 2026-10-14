import { createClient } from '@supabase/supabase-js';

const isValidHttpUrl = (str?: string): boolean => {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const defaultUrl = 'https://ssshgbyfqefbipnirqcy.supabase.co';
const defaultKey = 'sb_publishable_HyCP_dIoskSQkErwNIocYA_aIFa13VM';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = isValidHttpUrl(envUrl) ? envUrl : defaultUrl;
const supabaseAnonKey = (envKey && typeof envKey === 'string' && envKey.trim().length > 10) ? envKey : defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

