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
    const productCategory = dna.product_category || dna.industry || 'modern business';
    const brandIdea = dna.brand_idea || '';

    async function generateOne(variation) {
        const prompt = `Minimal ${variation} logo for "${brandName}", a ${productCategory} brand. Brand concept: ${brandIdea}. Style: ${style}. Colors: ${colors}. The logo should visually evoke the ${productCategory} domain. Clean, scalable, white background. Simple geometric shapes. Professional brand identity quality. ${dna.domain_constraint || ''}`;

        let imageUrl = null;
        let svgCode = null;

        // Step 1: Generate raster PNG with gpt-image-1
        try {
            console.log(`[logoGenerator] Generating raster "${variation}"...`);
            const openai = new OpenAI({ apiKey: openAiKey });
            const r = await openai.images.generate({
                model: 'gpt-image-1',
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                quality: 'high'
            });

            let buffer;
            if (r.data[0].b64_json) {
                buffer = Buffer.from(r.data[0].b64_json, 'base64');
            } else if (r.data[0].url) {
                const response = await fetch(r.data[0].url);
                buffer = Buffer.from(await response.arrayBuffer());
            }

            if (buffer) {
                const keyPath = `logos/${slug}_${variation.replace(' ', '_')}_${Date.now()}.png`;
                try { imageUrl = await uploadImage(keyPath, buffer, 'image/png'); } catch {}
                if (!imageUrl) imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
                console.log(`[logoGenerator] Raster "${variation}" generated successfully`);
            }
        } catch (e) {
            console.error(`[logoGenerator] Raster "${variation}" failed:`, e?.message || e);
        }

        // Step 2: Generate clean SVG vector code with GPT-4o
        try {
            console.log(`[logoGenerator] Generating SVG vector for "${variation}"...`);
            const openai = new OpenAI({ apiKey: openAiKey });
            const svgResponse = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are a vector logo designer. Generate clean, minimal SVG code for a logo. The SVG must:
- Use a viewBox of "0 0 512 512"
- Be production-ready and scalable
- Use only the specified brand colors
- Be clean and minimal with simple geometric paths
- NOT include any raster images or external references
- Return ONLY the SVG code, nothing else (no markdown, no explanation)`
                    },
                    {
                        role: 'user',
                        content: `Create a ${variation} logo in SVG for "${brandName}", a ${productCategory} brand. Colors: ${colors}. Style: ${style}. The design should be minimal, geometric, and evoke the ${productCategory} domain.`
                    }
                ],
                max_tokens: 2000
            });
            const rawSvg = svgResponse.choices[0].message.content.trim();
            // Extract SVG if wrapped in markdown code fences
            const svgMatch = rawSvg.match(/<svg[\s\S]*<\/svg>/i);
            if (svgMatch) {
                svgCode = svgMatch[0];
                console.log(`[logoGenerator] SVG vector for "${variation}" generated successfully`);
            }
        } catch (e) {
            console.error(`[logoGenerator] SVG "${variation}" failed:`, e?.message || e);
        }

        return { type: variation, imageUrl, svgCode, error: !imageUrl && !svgCode };
    }

    const settled = await Promise.allSettled(variations.map(generateOne));
    return settled.map(r => r.status === 'fulfilled' ? r.value : { type: 'error', imageUrl: null, svgCode: null, error: true });
}

function mockLogos(dna, brandName) {
    const c = dna.colors?.[0] || '#0A0A0A';
    return [
        { type: 'iconic symbol', imageUrl: null, mockSvg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${c}"/></svg>` },
        { type: 'wordmark', imageUrl: null, mockSvg: `<svg viewBox="0 0 200 60"><text x="10" y="45" font-size="36" font-family="Inter" fill="${c}">${brandName || 'Brand'}</text></svg>` },
        { type: 'lettermark', imageUrl: null, mockSvg: `<svg viewBox="0 0 100 100"><text x="25" y="70" font-size="60" font-family="Inter" font-weight="bold" fill="${c}">${(brandName || 'B')[0]}</text></svg>` }
    ];
}
