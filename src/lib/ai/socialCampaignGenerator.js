import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { uploadImage } from '$lib/r2.js';

/**
 * Generate social media campaign assets — Architecture v2
 * nano-banana-pro for creative visuals, Gemini 2.5 Pro for campaign copy
 */
export async function generateSocialCampaigns(dna, brandName, brandPackage) {
    const key = env.GOOGLE_AI_API_KEY;
    if (!key || key.startsWith('your_')) {
        return mockCampaigns(brandName);
    }

    const slug = (brandName || 'brand').replace(/[^a-zA-Z0-9]/g, '') || 'brand';
    const colors = (dna.colors || ['#0A0A0A', '#2563EB', '#F8F8F7']).join(', ');
    const style = dna.visual_style || 'modern minimal';
    const voice = dna.voice_tone || dna.tone_of_voice || 'confident and professional';

    // 1. Generate campaign copy with Gemini 2.5 Pro
    let campaignCopy;
    try {
        const ai = new GoogleGenAI({ apiKey: key });
        const copyResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Generate social media campaign copy for "${brandName}".
Brand voice: ${voice}. Industry: ${dna.industry}. Audience: ${dna.target_audience}.

Return ONLY valid JSON (no markdown, no code fences):
{
  "instagram": { "caption": "Instagram post caption", "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"] },
  "twitter": { "tweet": "Tweet text (280 chars max)", "hashtags": ["tag1", "tag2"] },
  "linkedin": { "post": "LinkedIn post text (2-3 sentences)", "hashtags": ["tag1", "tag2", "tag3"] },
  "campaign_theme": "One-line campaign theme"
}`,
            config: { responseMimeType: 'application/json' }
        });
        campaignCopy = JSON.parse(copyResponse.text);
    } catch (e) {
        console.error('[socialCampaign] Copy generation failed:', e?.message);
        campaignCopy = mockCopy(brandName);
    }

    // 2. Generate campaign visuals with nano-banana-pro (Gemini image generation)
    const platforms = [
        { name: 'instagram_post', aspect: '1:1', desc: 'Instagram post (square)' },
        { name: 'instagram_story', aspect: '9:16', desc: 'Instagram story (vertical)' },
        { name: 'twitter_card', aspect: '2:1', desc: 'Twitter/X card (landscape)' },
        { name: 'linkedin_banner', aspect: '4:1', desc: 'LinkedIn banner (wide)' }
    ];

    const visuals = {};
    const ai = new GoogleGenAI({ apiKey: key });

    for (const platform of platforms) {
        try {
            console.log(`[socialCampaign] Generating ${platform.name}...`);
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: `Create a ${platform.desc} social media campaign visual for "${brandName}". Style: ${style}. Colors: ${colors}. Aspect ratio: ${platform.aspect}. Campaign theme: "${campaignCopy.campaign_theme || 'Launch'}". Professional, brand-consistent, modern design. Include brand name text "${brandName}" prominently.`,
                config: {
                    responseModalities: ['IMAGE', 'TEXT']
                }
            });

            const parts = response.candidates?.[0]?.content?.parts || [];
            const imagePart = parts.find(p => p.inlineData);

            if (imagePart) {
                const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
                const keyPath = `social-assets/${slug}_${platform.name}_${Date.now()}.png`;

                // Try R2 URL first (public access enabled), base64 fallback
                let url = null;
                try { url = await uploadImage(keyPath, buffer, 'image/png'); } catch {}
                if (!url) url = `data:image/png;base64,${buffer.toString('base64')}`;

                console.log(`[socialCampaign] ${platform.name} generated successfully`);
                visuals[platform.name] = url;
            } else {
                console.warn(`[socialCampaign] ${platform.name} returned no image data`);
                visuals[platform.name] = null;
            }
        } catch (e) {
            console.error(`[socialCampaign] ${platform.name} generation failed:`, e?.message);
            visuals[platform.name] = null;
        }
    }

    return {
        copy: campaignCopy,
        visuals,
        platforms: platforms.map(p => p.name)
    };
}

function mockCopy(brandName) {
    return {
        instagram: { caption: `Introducing ${brandName} — built for what's next.`, hashtags: ['#brand', '#launch', '#design'] },
        twitter: { tweet: `Something new is here. Meet ${brandName}.`, hashtags: ['#launch', '#brand'] },
        linkedin: { post: `We're excited to introduce ${brandName}. A brand built with intention, designed for impact.`, hashtags: ['#branding', '#launch', '#design'] },
        campaign_theme: 'Built for what\'s next'
    };
}

function mockCampaigns(brandName) {
    return {
        copy: mockCopy(brandName),
        visuals: {
            instagram_post: null,
            instagram_story: null,
            twitter_card: null,
            linkedin_banner: null
        },
        platforms: ['instagram_post', 'instagram_story', 'twitter_card', 'linkedin_banner'],
        mock: true
    };
}
