import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

/** Analyze inspiration images using GPT-4o vision */
export async function analyzeInspiration(sources) {
    const key = env.OPENAI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockAnalysis(sources);
    }

    const openai = new OpenAI({ apiKey: key });
    const results = [];

    for (const src of sources) {
        const messages = [
            {
                role: 'system',
                content: `You are a brand design analyst. Analyze the visual style of the provided inspiration. Return a JSON object:
{
  "description": "Detailed visual style description (colors, typography, mood, layout)",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "typography": "Font style description",
  "mood": "Overall mood/feeling",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`
            }
        ];

        if (src.type === 'image') {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: 'Analyze this brand inspiration image:' },
                    { type: 'image_url', image_url: { url: src.data } }
                ]
            });
        } else if (src.type === 'url') {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: `Analyze this brand/website for visual style: ${src.data}` }
                ]
            });
        } else {
            messages.push({
                role: 'user',
                content: `Analyze the visual brand identity of "${src.data}". Describe their visual style, colors, typography, and mood.`
            });
        }

        try {
            console.log(`[inspirationAnalyzer] Calling OpenAI for source ${src.type}...`);
            const r = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
                response_format: { type: 'json_object' },
                max_tokens: 500
            });
            console.log(`[inspirationAnalyzer] OpenAI returned successfully for ${src.type}.`);
            results.push(JSON.parse(r.choices[0].message.content));
        } catch (e) {
            console.error('Inspiration analysis error:', e);
            results.push({ description: `Visual style inspired by ${src.data}`, colors: ['#1F1F1F', '#F1F1F1', '#B20606'], typography: 'Modern sans-serif', mood: 'Professional', keywords: ['modern', 'clean'] });
        }
    }

    return results;
}

function mockAnalysis(sources) {
    return sources.map(s => ({
        description: `Visual style inspired by ${s.data || 'uploaded image'}`,
        colors: ['#1F1F1F', '#F1F1F1', '#B20606'],
        typography: 'Modern sans-serif',
        mood: 'Professional and clean',
        keywords: ['modern', 'minimal', 'professional']
    }));
}
