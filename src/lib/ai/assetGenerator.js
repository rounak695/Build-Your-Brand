import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
import { uploadImage, persistImage } from '$lib/r2.js';

/** Generate brand asset mockups — gpt-image-1 per Architecture v2 */
export async function generateBrandAssets(dna, brandName) {
    const key = env.OPENAI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockAssets(brandName);
    }

    const openai = new OpenAI({ apiKey: key });
    const assetTypes = [
        { name: 'Business Card', prompt: 'a professional business card mockup' },
        { name: 'Social Media', prompt: 'a social media profile and banner mockup' },
        { name: 'Letterhead', prompt: 'a corporate letterhead mockup' }
    ];

    const results = [];
    for (const asset of assetTypes) {
        try {
            const r = await openai.images.generate({
                model: 'gpt-image-1',
                prompt: `Design ${asset.prompt} for "${brandName}". Brand style: ${dna.visual_style}. Colors: ${dna.colors.slice(0, 3).join(', ')}. Clean, minimal, professional design on a light background.`,
                n: 1,
                size: '1024x1024',
                quality: 'high'
            });

            let imageUrl;
            if (r.data[0].b64_json) {
                const buffer = Buffer.from(r.data[0].b64_json, 'base64');
                const keyPath = `assets/${asset.name.toLowerCase().replace(' ', '_')}_${Date.now()}`;
                imageUrl = await uploadImage(keyPath, buffer, 'image/png');
                if (!imageUrl) imageUrl = `data:image/png;base64,${r.data[0].b64_json}`;
            } else if (r.data[0].url) {
                const slug = (brandName || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-');
                const keyPath = `brands/${slug}/${asset.name.toLowerCase().replace(' ', '_')}_${Date.now()}`;
                imageUrl = await persistImage(r.data[0].url, keyPath);
            }

            results.push({ name: asset.name, imageUrl });
        } catch (e) {
            console.error(`Asset ${asset.name} error:`, e);
            results.push({ name: asset.name, imageUrl: null, error: true });
        }
    }
    return results;
}

function mockAssets(brandName) {
    return [
        { name: 'Business Card', imageUrl: null, mock: true },
        { name: 'Social Media', imageUrl: null, mock: true },
        { name: 'Letterhead', imageUrl: null, mock: true }
    ];
}
