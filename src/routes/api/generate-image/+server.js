import { json } from '@sveltejs/kit';
import { getOpenAI } from '$lib/agents.js';
import { persistImage } from '$lib/r2.js';

/** Direct image generation endpoint — gpt-image-1 per Architecture v2 */
export async function POST({ request }) {
    const { type, brandData } = await request.json();
    const openai = getOpenAI();
    if (!openai) return mockImage(type, brandData);

    try {
        const name = brandData.name || 'Brand';
        const mb = brandData.selectedMoodboard;
        const prompts = {
            logo: `Minimal vectorized logo for "${name}". Colors: ${mb?.colors?.join(', ')}. Style: ${mb?.name}. White bg, centered, brand name below icon.`,
            moodboard: `Brand moodboard for "${name}". Swatches (${mb?.colors?.join(', ')}), typography, lifestyle imagery. Style: ${mb?.name}. Clean white bg.`,
            assets: `Brand mockup for "${name}": business card, letterhead, social post. Colors: ${mb?.colors?.join(', ')}. Professional presentation.`
        };
        if (!prompts[type]) return json({ error: 'Invalid type' }, { status: 400 });

        const r = await openai.images.generate({
            model: 'gpt-image-1',
            prompt: prompts[type],
            n: 1,
            size: '1024x1024',
            quality: 'high'
        });

        let permanentUrl;
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const key = `brands/${slug}/${type}-${Date.now()}.png`;

        if (r.data[0].b64_json) {
            // Use base64 data URL for frontend (R2 public URL returns 401)
            permanentUrl = `data:image/png;base64,${r.data[0].b64_json}`;
            // R2 archival in background
            const buffer = Buffer.from(r.data[0].b64_json, 'base64');
            const { uploadImage } = await import('$lib/r2.js');
            uploadImage(key, buffer, 'image/png').catch(() => {});
        } else if (r.data[0].url) {
            // Fetch and convert to base64 for frontend
            const resp = await fetch(r.data[0].url);
            const buf = Buffer.from(await resp.arrayBuffer());
            permanentUrl = `data:image/png;base64,${buf.toString('base64')}`;
            // R2 archival in background
            const { uploadImage } = await import('$lib/r2.js');
            uploadImage(key, buf, 'image/png').catch(() => {});
        }

        return json({ success: true, imageUrl: permanentUrl, type });
    } catch (e) {
        console.error('gpt-image-1 error:', e);
        return mockImage(type, brandData);
    }
}

function mockImage(type, brandData) {
    const name = brandData?.name || 'Brand';
    const c = brandData?.selectedMoodboard?.colors || ['#0A0A0A', '#2563EB', '#F8F8F7'];
    const font = brandData?.selectedMoodboard?.typography || 'Inter, sans-serif';

    const svgs = {
        logo: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${c[1]}"/><circle cx="200" cy="150" r="55" fill="${c[0]}" opacity=".9"/><text x="200" y="270" font-family="${font}" font-size="28" font-weight="bold" fill="${c[0]}" text-anchor="middle">${name}</text></svg>`,
        moodboard: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#FCFBFB"/><rect x="20" y="20" width="170" height="170" rx="12" fill="${c[0]}"/><text x="480" y="110" font-family="${font}" font-size="20" fill="${c[0]}" text-anchor="middle" font-weight="bold">${name}</text></svg>`,
        assets: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#FCFBFB"/><text x="150" y="100" font-family="${font}" font-size="16" fill="${c[0]}" text-anchor="middle" font-weight="bold">${name}</text></svg>`
    };

    if (!svgs[type]) return json({ error: 'Invalid type' }, { status: 400 });
    return json({ success: true, imageUrl: `data:image/svg+xml;base64,${Buffer.from(svgs[type]).toString('base64')}`, type, isMock: true });
}
