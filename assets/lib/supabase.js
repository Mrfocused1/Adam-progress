import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://cbdwugwwohykkzzsongl.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_BykCdxKY74HyjEfkkwr5qg_O46Gn7z-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const CONTENT_ROW_ID = 1;
