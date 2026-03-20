import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { supabase } from '$lib/supabase.js';

/** Create style vector embedding from inspiration description */
export async function createStyleVector(description, brandId) {
    const key = env.OPENAI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockVector();
    }

    const openai = new OpenAI({ apiKey: key });

    try {
        console.log("[styleVector] Calling OpenAI embeddings...");
        const r = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: description
        });
        console.log("[styleVector] OpenAI embeddings returned successfully.");
        const vector = r.data[0].embedding;

        // Store in brand_vectors table
        if (brandId) {
            await supabase.from('brand_vectors').insert({
                brand_id: brandId,
                vector: JSON.stringify(vector),
                description,
                source: 'inspiration'
            }).catch(e => console.error('Vector store error:', e));
        }

        return vector;
    } catch (e) {
        console.error('Embedding error:', e);
        return mockVector();
    }
}

/** Combine multiple inspiration analyses into one style description */
export function combineInspirations(analyses) {
    const allColors = analyses.flatMap(a => a.colors || []);
    const allKeywords = analyses.flatMap(a => a.keywords || []);
    const descriptions = analyses.map(a => a.description).join('. ');

    return {
        combinedDescription: descriptions,
        dominantColors: [...new Set(allColors)].slice(0, 5),
        keywords: [...new Set(allKeywords)],
        mood: analyses[0]?.mood || 'Professional',
        typography: analyses[0]?.typography || 'Modern sans-serif'
    };
}

function mockVector() {
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
}
