import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

const url = env.PUBLIC_SUPABASE_URL;
const key = env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder'
);
