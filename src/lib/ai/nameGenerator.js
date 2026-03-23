import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

/** Generate 5 brand name suggestions — Gemini 2.5 Pro per Architecture v2 */
export async function generateNames(dna) {
    const key = env.GOOGLE_AI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockNames(dna);
    }

    try {
        console.log("[nameGenerator] Calling Gemini 2.5 Pro...");
        const ai = new GoogleGenAI({ apiKey: key });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `You are a brand naming expert and creative director. Generate 5 unique, memorable brand names for this brand.

Brand DNA:
- Idea: "${dna.brand_idea}"
- Industry: "${dna.industry}"
- Audience: "${dna.target_audience}"
- Style: "${dna.visual_style}"
- Traits: ${JSON.stringify(dna.personality_traits || [])}

Each name must be 1-3 words max, easy to pronounce. Return ONLY valid JSON (no markdown, no code fences):
{
  "naming_logic": "One sentence describing the creative strategy behind these names.",
  "names": [
    { "name": "BrandName", "tagline": "A short tagline", "reasoning": "Why this name works" }
  ]
}`,
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log("[nameGenerator] Gemini 2.5 Pro returned successfully.");
        return JSON.parse(response.text);
    } catch (e) {
        console.error('[nameGenerator] error:', e);
        return mockNames(dna);
    }
}

function mockNames(dna) {
    const base = (dna.brand_idea || 'Nova').split(' ')[0];
    return {
        naming_logic: `Exploring names that blend the core concept of "${dna.brand_idea || 'the idea'}" with modern, memorable linguistics — each designed to signal innovation and approachability in ${dna.industry || 'the industry'}.`,
        names: [
            { name: `${base}Lab`, tagline: `Redefining ${dna.industry || 'innovation'}`, reasoning: 'Combines the core idea with a creative suffix' },
            { name: `${base}ify`, tagline: `${dna.industry || 'Innovation'} simplified`, reasoning: 'Modern, tech-forward naming convention' },
            { name: `Vero${base}`, tagline: `Authentic ${dna.industry || 'solutions'}`, reasoning: 'Latin root for truth adds authenticity' },
            { name: `${base}Arc`, tagline: `Building the future of ${dna.industry || 'business'}`, reasoning: 'Arc suggests trajectory and growth' },
            { name: `Nex${base}`, tagline: `The next generation of ${dna.industry || 'brands'}`, reasoning: 'Forward-looking, next-generation feel' }
        ]
    };
}
