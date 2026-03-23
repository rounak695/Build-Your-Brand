import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

/** Generate Brand DNA object — GPT-4o holds context per Architecture v2 */
export async function createBrandDNA(input) {
    const key = env.OPENAI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockDNA(input);
    }

    const openai = new OpenAI({ apiKey: key });

    try {
        console.log("[brandDNA] Calling GPT-4o for Brand DNA generation...");
        const r = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a Brand DNA architect. Generate a comprehensive Brand DNA object that will be the core context for all downstream brand generation. Return ONLY valid JSON:
{
  "brand_idea": "The user's business idea",
  "industry": "The industry category",
  "target_audience": "Who the brand serves",
  "visual_style": "The visual direction",
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "typography": "Font family recommendation",
  "voice_tone": "How the brand communicates — confident, minimal, founder-focused etc.",
  "personality_traits": ["trait1", "trait2", "trait3"],
  "tone_of_voice": "Detailed brand voice description",
  "brand_values": ["value1", "value2", "value3"],
  "competitive_position": "How it stands out"
}`
                },
                {
                    role: 'user',
                    content: `Business idea: "${input.brandIdea}". Industry: "${input.industry || 'auto-detect'}". Visual style from inspiration: "${input.styleDescription || 'modern'}". Dominant colors: ${JSON.stringify(input.colors || [])}. Keywords: ${JSON.stringify(input.keywords || [])}.`
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 800
        });
        console.log("[brandDNA] GPT-4o returned Brand DNA successfully.");
        return JSON.parse(r.choices[0].message.content);
    } catch (e) {
        console.error('[brandDNA] error:', e);
        return mockDNA(input);
    }
}

function mockDNA(input) {
    return {
        brand_idea: input.brandIdea || 'A modern business',
        industry: input.industry || 'Technology',
        target_audience: 'Modern professionals aged 25-45',
        visual_style: input.styleDescription || 'Minimal tech',
        colors: ['#0A0A0A', '#2563EB', '#F8F8F7', '#505050', '#FCFBFB'],
        typography: 'Inter, sans-serif',
        voice_tone: 'confident, minimal, founder-focused',
        personality_traits: ['Innovative', 'Trustworthy', 'Bold'],
        tone_of_voice: 'Confident, direct, and inspiring',
        brand_values: ['Innovation', 'Quality', 'Transparency'],
        competitive_position: 'Premium yet accessible'
    };
}
