import { json } from '@sveltejs/kit';
import { regenerate } from '$lib/ai/pipeline.js';

export async function POST({ request }) {
    try {
        const { type, brandDNA, brandName, brandId } = await request.json();

        if (!type || !brandDNA) {
            return json({ error: 'Missing type or brandDNA' }, { status: 400 });
        }

        const result = await regenerate(type, brandDNA, brandName, brandId);

        if (result.error) {
            return json({
                error: result.error,
                limitReached: result.limitReached
            }, { status: result.limitReached ? 429 : 400 });
        }

        return json({
            success: true,
            result: result.result,
            remaining: result.remaining
        });
    } catch (e) {
        console.error('Regenerate API error:', e);
        return json({ error: 'Regeneration failed' }, { status: 500 });
    }
}
