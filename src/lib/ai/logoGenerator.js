import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { uploadImage } from '$lib/r2.js';

/**
 * Generate logos — gpt-image-1 per Architecture v2
 * Accuracy-first: pixel-perfect precision, consistent brand color accuracy
 */
export async function generateLogos(dna, brandName) {
    const openAiKey = env.OPENAI_API_KEY;
    if (!openAiKey || openAiKey.startsWith('your_')) {
        return mockLogos(dna, brandName);
    }

    const slug = (brandName || 'brand').replace(/[^a-zA-Z0-9]/g, '') || 'brand';
    const variations = ['iconic symbol', 'wordmark', 'lettermark'];
    const colors = dna.colors?.slice(0, 3).join(', ') || '#0A0A0A, #2563EB';
    const style = dna.visual_style || 'modern minimal';

    async function generateOne(variation) {
        const prompt = `Minimal ${variation} logo for "${brandName}". Style: ${style}. Colors: ${colors}. Clean, scalable, white background. Simple geometric shapes. Professional brand identity quality.`;

        try {
            console.log(`[logoGenerator] Generating "${variation}"...`);
            const openai = new OpenAI({ apiKey: openAiKey });
            const r = await openai.images.generate({
                model: 'gpt-image-1',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                quality: 'high'
            });

            // gpt-image-1 returns b64_json by default
            let buffer;
            if (r.data[0].b64_json) {
                buffer = Buffer.from(r.data[0].b64_json, 'base64');
            } else if (r.data[0].url) {
                const response = await fetch(r.data[0].url);
                buffer = Buffer.from(await response.arrayBuffer());
            }

            if (!buffer) {
                return { type: variation, imageUrl: null, error: true };
            }

            // Try R2 URL first (public access enabled), base64 fallback
            const keyPath = `logos/${slug}_${variation.replace(' ', '_')}_${Date.now()}.png`;
            let url = null;
            try { url = await uploadImage(keyPath, buffer, 'image/png'); } catch {}
            if (!url) url = `data:image/png;base64,${buffer.toString('base64')}`;

            console.log(`[logoGenerator] "${variation}" generated successfully`);
            return { type: variation, imageUrl: url };
        } catch (e) {
            console.error(`[logoGenerator] "${variation}" gpt-image-1 failed:`, e?.message || e);
            return { type: variation, imageUrl: null, error: true };
        }
    }

    const settled = await Promise.allSettled(variations.map(generateOne));
    return settled.map(r => r.status === 'fulfilled' ? r.value : { type: 'error', imageUrl: null, error: true });
}

function mockLogos(dna, brandName) {
    const c = dna.colors?.[0] || '#0A0A0A';
    return [
        { type: 'iconic symbol', imageUrl: null, mockSvg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${c}"/></svg>` },
        { type: 'wordmark', imageUrl: null, mockSvg: `<svg viewBox="0 0 200 60"><text x="10" y="45" font-size="36" font-family="Inter" fill="${c}">${brandName || 'Brand'}</text></svg>` },
        { type: 'lettermark', imageUrl: null, mockSvg: `<svg viewBox="0 0 100 100"><text x="25" y="70" font-size="60" font-family="Inter" font-weight="bold" fill="${c}">${(brandName || 'B')[0]}</text></svg>` }
    ];
}
