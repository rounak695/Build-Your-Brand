import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env as pub } from '$env/dynamic/public';

export async function POST({ request }) {
    const { brandData } = await request.json();
    const url = pub.PUBLIC_SUPABASE_URL;
    const key = pub.PUBLIC_SUPABASE_ANON_KEY;

    if (!url || url.startsWith('your_')) {
        return json({ success: true, id: 'mock-' + Date.now(), message: 'Brand saved locally (Supabase not configured).' });
    }

    try {
        const sb = createClient(url, key);
        const { data, error } = await sb.from('brands').insert([{
            name: brandData.name, idea: brandData.idea, personality: brandData.personality,
            moodboard: brandData.selectedMoodboard, inspirations: brandData.inspirations,
            brand_dna: brandData.brandDNA, guidelines: brandData.guidelines,
            created_at: new Date().toISOString()
        }]).select().single();
        if (error) throw error;
        return json({ success: true, id: data.id, message: 'Brand saved!' });
    } catch (e) {
        console.error('Supabase error:', e);
        return json({ error: 'Failed to save' }, { status: 500 });
    }
}
