import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { uploadImage } from '$lib/r2.js';

/**
 * Generate moodboard images — nano-banana-pro (Google Gemini) per Architecture v2
 * Creative divergence: experimental visual directions, unexpected aesthetics
 */
export async function generateMoodboards(dna, brandName) {
    const key = env.GOOGLE_AI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockMoodboards(dna);
    }

    const colorList = (dna.colors || ['#0A0A0A', '#2563EB', '#F8F8F7']).join(', ');
    const style = dna.visual_style || 'modern and refined';
    const typo = dna.typography || 'clean modern sans-serif';
    const industry = dna.industry || 'modern business';
    const name = brandName || dna.brand_idea;
    const slug = (brandName || name || 'brand').replace(/[^a-zA-Z0-9]/g, '') || 'brand';

    const directions = [
        {
            name: 'Brand Identity Board',
            narrative: `One direction I'm imagining feels very clean and intentional — almost like the kind of brand identity you'd see from a premium design studio. It's structured but not rigid, with overlapping color palette circles, elegant typography specimens, a minimalist logo mark concept, and perhaps a business card mockup floating at an angle.`,
            focus: `Professional brand identity presentation board with asymmetric but balanced composition. Overlapping color palette circles, elegant typography specimen, a simplified abstract logo mark, a floating business card mockup. Soft off-white background. Premium Behance-quality brand identity case study.`
        },
        {
            name: 'Lifestyle & Mood Collage',
            narrative: `Another visual world that could fit your brand has this beautiful editorial quality to it — think soft, atmospheric lifestyle photography arranged in an organic collage. Gentle brush stroke accents, overlapping photo frames, handwritten-style annotations. It captures the feeling and emotion your brand evokes.`,
            focus: `Pinterest-style editorial collage with organically overlapping rectangular photos. Atmospheric lifestyle photographs, soft organic brush stroke accents, handwritten-style brand name, floating color palette swatches. Warm cream or soft beige background. Fashion editorial moodboard aesthetic.`
        },
        {
            name: 'Creative Pinboard',
            narrative: `There's also a more tactile, creative approach — imagine a designer's actual pinboard, where photos are held by pins or taped down, with fabric swatches, torn paper textures, and hand-drawn arrows connecting ideas. It feels real, lived-in, and deeply creative.`,
            focus: `Tactile collage pinboard with layered, overlapping elements at varied angles on textured background. Photos with polaroid-style borders, material texture swatches, torn paper notes, hand-drawn arrows, paint daubs for color palette. Kraft paper or grid-paper texture background.`
        },
        {
            name: 'Photography & Color Story',
            narrative: `And finally, a cinematic direction that captures the emotional atmosphere of your brand through dramatic, immersive photography arranged in a bold grid with a strong color palette strip. The typography is confident and expressive — like the opening credits of a film about your brand.`,
            focus: `Bold edge-to-edge photography grid with prominent color palette strip across the bottom. Dramatic high-contrast photographs with cohesive color grading, confident display typography, clean brand wordmark. Cinematic brand presentation — immersive and story-driven.`
        }
    ];

    async function generateOne(dir) {
        const prompt = `Create a high-end, professional brand moodboard for "${name}". Industry: ${industry}. Style: ${style}. Colors: ${colorList}. Typography: ${typo}. Direction: ${dir.name}. ${dir.focus}`;

        try {
            const ai = new GoogleGenAI({ apiKey: key });
            console.log(`[moodboardGenerator] Generating "${dir.name}"...`);
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: prompt,
                config: {
                    responseModalities: ['IMAGE', 'TEXT']
                }
            });

            // Extract image from response
            const parts = response.candidates?.[0]?.content?.parts || [];
            const imagePart = parts.find(p => p.inlineData);

            if (imagePart) {
                const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
                const keyPath = `moodboards/${slug}_${dir.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;

                // Try R2 URL first (public access enabled), base64 fallback
                let url = null;
                try { url = await uploadImage(keyPath, buffer, 'image/png'); } catch {}
                if (!url) url = `data:image/png;base64,${buffer.toString('base64')}`;

                console.log(`[moodboardGenerator] "${dir.name}" generated successfully`);
                return { name: dir.name, imageUrl: url, focus: dir.focus, narrative: dir.narrative };
            }

            console.warn(`[moodboardGenerator] "${dir.name}" returned no image data`);
            return { name: dir.name, imageUrl: null, focus: dir.focus, narrative: dir.narrative, error: true };
        } catch (e) {
            console.error(`[moodboardGenerator] "${dir.name}" failed:`, e?.message || e);
            return { name: dir.name, imageUrl: null, focus: dir.focus, narrative: dir.narrative, error: true };
        }
    }

    const settled = await Promise.allSettled(directions.map(generateOne));
    return settled.map(r => r.status === 'fulfilled' ? r.value : { name: 'Error', imageUrl: null, error: true });
}

function mockMoodboards(dna) {
    const colors = dna.colors || ['#0A0A0A', '#2563EB', '#F8F8F7'];
    return [
        {
            name: 'Brand Identity Board',
            colors: colors.slice(0, 3),
            typography: 'Inter, sans-serif',
            imageUrl: null,
            narrative: 'A clean and intentional brand identity presentation — overlapping color circles, typography specimens, and a minimalist logo concept on a soft neutral background.'
        },
        {
            name: 'Lifestyle & Mood Collage',
            colors: [colors[1] || '#2563EB', colors[0] || '#0A0A0A', '#E8DED1'],
            typography: 'Georgia, serif',
            imageUrl: null,
            narrative: 'A soft editorial collage with atmospheric photography, organic brush strokes, and a handwritten feel — capturing the emotion behind the brand.'
        },
        {
            name: 'Creative Pinboard',
            colors: ['#4A4A4A', '#E5E5E5', colors[2] || '#F8F8F7'],
            typography: 'Roboto, sans-serif',
            imageUrl: null,
            narrative: 'A tactile designer\'s inspiration wall — photos pinned at angles, fabric swatches, torn paper notes, and hand-drawn connections.'
        },
        {
            name: 'Photography & Color Story',
            colors: [colors[0] || '#0A0A0A', colors[1] || '#2563EB', '#F1F1F1'],
            typography: 'Helvetica, sans-serif',
            imageUrl: null,
            narrative: 'A cinematic, story-driven board with dramatic photography, bold typography, and a strong color palette strip.'
        }
    ];
}
