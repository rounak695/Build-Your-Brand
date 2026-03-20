import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

/** Generate comprehensive brand guidelines — Gemini 2.5 Pro per Architecture v2 */
export async function generateBrandGuidelines(dna, brandName) {
    const key = env.GOOGLE_AI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockGuidelines(dna, brandName);
    }

    try {
        console.log("[brandGuidelines] Calling Gemini 2.5 Pro...");
        const ai = new GoogleGenAI({ apiKey: key });

        // Strip large data fields to avoid exceeding Gemini's token limit
        const { style_vector, inspiration_sources, ...dnaSafe } = dna;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `You are a brand guidelines expert. Generate comprehensive brand guidelines for "${brandName}".

Brand DNA: ${JSON.stringify(dnaSafe)}

Return ONLY valid JSON (no markdown, no code fences):
{
  "colorPalette": {
    "primary": { "hex": "#hex", "usage": "When and where to use" },
    "secondary": { "hex": "#hex", "usage": "When and where to use" },
    "accent": { "hex": "#hex", "usage": "When and where to use" },
    "neutral": { "hex": "#hex", "usage": "When and where to use" },
    "background": { "hex": "#hex", "usage": "When and where to use" }
  },
  "typography": {
    "primary": "Font family for headings",
    "secondary": "Font family for body text",
    "hierarchy": { "h1": "32px Bold", "h2": "24px Semi", "h3": "18px Medium", "body": "16px Regular", "caption": "12px Regular" }
  },
  "logoUsage": "Rules for logo placement, sizing, and clear space",
  "voiceGuidelines": { "tone": "How the brand sounds", "dosAndDonts": ["Do: x", "Do: y", "Don't: z"] },
  "brandApplications": ["Website", "Social media", "Business cards", "Packaging"]
}`,
            config: {
                responseMimeType: 'application/json'
            }
        });

        console.log("[brandGuidelines] Gemini 2.5 Pro returned successfully.");
        return JSON.parse(response.text);
    } catch (e) {
        console.error('[brandGuidelines] error:', e);
        return mockGuidelines(dna, brandName);
    }
}

function mockGuidelines(dna, brandName) {
    return {
        colorPalette: {
            primary: { hex: dna.colors?.[0] || '#0A0A0A', usage: 'Headings, CTAs, key elements' },
            secondary: { hex: dna.colors?.[1] || '#2563EB', usage: 'Links, secondary actions' },
            accent: { hex: dna.colors?.[2] || '#F8F8F7', usage: 'Backgrounds, cards' },
            neutral: { hex: dna.colors?.[3] || '#505050', usage: 'Body text, secondary elements' },
            background: { hex: dna.colors?.[4] || '#FCFBFB', usage: 'Page backgrounds' }
        },
        typography: {
            primary: dna.typography || 'Inter, sans-serif',
            secondary: 'DM Sans, sans-serif',
            hierarchy: { h1: '32px Bold', h2: '24px Semi', h3: '18px Medium', body: '16px Regular', caption: '12px Regular' }
        },
        logoUsage: 'Maintain clear space equal to the logo height. Use on white or brand-dark backgrounds only.',
        voiceGuidelines: {
            tone: dna.tone_of_voice || dna.voice_tone || 'Confident, direct, inspiring',
            dosAndDonts: ['Do: Use consistent brand colors', 'Do: Maintain visual hierarchy', "Don't: Stretch or distort the logo", "Don't: Use more than 3 font weights"]
        },
        brandApplications: ['Website', 'Social media', 'Business cards', 'Email templates']
    };
}
