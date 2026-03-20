import { json } from '@sveltejs/kit';
import { createBrandPipeline, continuePipeline, finalizePipeline, regenerate } from '$lib/ai/pipeline.js';

/**
 * Determine if the user's message is a meaningful brand/business idea.
 * Returns false for greetings, emojis, random words, filler, etc.
 */
function isValidBrandIdea(text) {
    if (!text) return false;
    const stripped = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/gu, '').trim();
    if (stripped.length < 5) return false;
    const noise = /^(h[ie]y+|hii*|hello+|hola|yo+|sup|what'?s?\s*up|test(ing)?|ok(ay)?|thanks?(\s*you)?|bye|help|please|yes|no|yeah|nah|nope|sure|cool|nice|wow|lol|hmm+|um+|ah+|oh+|huh|idk|bruh|bro|dude|man|wtf|omg|lmao|k+)\s*[.!?]*$/i;
    if (noise.test(stripped)) return false;
    const words = stripped.split(/\s+/).filter(w => w.length >= 2);
    if (words.length < 2) return false;
    return true;
}

export async function POST({ request }) {
    const { step, message, brandData } = await request.json();

    try {
        // Step 1: IDEA_INPUT
        if (step === 'IDEA_INPUT') {
            if (!isValidBrandIdea(message)) {
                return json({
                    role: 'ai',
                    content: `Hey! I'm your brand architect. Tell me about the business or product you want to build. What's the idea?`,
                    nextStep: 'IDEA_INPUT'
                });
            }

            return json({
                role: 'ai',
                content: `Interesting idea. I'm starting to get a sense of the direction here. To help me see your vision, can you share some visual inspirations? Upload some images or drop a link to a brand you like.`,
                nextStep: 'INSPIRATION_UPLOAD'
            });
        }

        // Step 2: INSPIRATION → ANALYSIS → STYLE VECTOR → DNA → NAMES
        if (step === 'INSPIRATION_UPLOAD') {
            const inspirations = brandData.inspirations || [{ type: 'text', data: message }];
            const result = await createBrandPipeline({
                brandIdea: brandData.idea,
                industry: brandData.industry || '',
                inspirations
            });

            return json({
                role: 'ai',
                content: `I've analyzed your inspirations, and a clear personality is emerging. I've put together a few name ideas. Which one feels right to you?`,
                names: result.names,
                brandDNA: result.dna,
                brandId: result.brandId,
                styleInfo: result.styleInfo,
                nextStep: 'NAME_SELECTION'
            });
        }

        // Step 3: NAME_SELECTION → moodboards
        if (step === 'NAME_SELECTION') {
            const selectedName = message;
            const dna = brandData.brandDNA;
            const result = await continuePipeline(dna, selectedName, brandData.brandId);

            return json({
                role: 'ai',
                content: `Great choice. I've created a few distinct visual directions based on our conversation. Let me know which one feels closest to what you've imagined.`,
                moodboards: result.moodboards,
                nextStep: 'MOODBOARD_SELECTION'
            });
        }

        // Step 4: MOODBOARD_SELECTION → LOGO → GUIDELINES → ASSETS → WIREFRAME → SOCIAL
        if (step === 'MOODBOARD_SELECTION') {
            const dna = brandData.brandDNA;
            const brandName = brandData.name;
            const selectedMoodboard = brandData.selectedMoodboard;

            const result = await finalizePipeline(dna, brandName, brandData.brandId, selectedMoodboard);

            return json({
                role: 'ai',
                content: `That's a beautiful direction. Everything is ready — logos, guidelines, assets, React wireframe, and social campaign materials. Take a look and let me know if you want to refine anything.`,
                logos: result.logos,
                guidelines: result.guidelines,
                assets: result.assets,
                brandPackage: result.brandPackage,
                wireframe: result.wireframe,
                socialCampaigns: result.socialCampaigns,
                nextStep: 'DONE'
            });
        }

        // Step 5: REGENERATE
        if (step === 'REGENERATE') {
            const { type } = JSON.parse(message);
            const result = await regenerate(
                type,
                brandData.brandDNA,
                brandData.name,
                brandData.brandId
            );

            if (result.error) {
                return json({ role: 'ai', content: result.error, limitReached: result.limitReached });
            }

            const typeLabels = {
                names: 'name suggestions',
                moodboards: 'moodboard directions',
                logos: 'logo concepts',
                guidelines: 'brand guidelines',
                wireframe: 'React wireframe',
                socialCampaigns: 'social campaigns'
            };

            return json({
                role: 'ai',
                content: `I've created fresh ${typeLabels[type] || type} with a slightly different creative angle. You have ${result.remaining} regeneration${result.remaining !== 1 ? 's' : ''} remaining for this category.`,
                [type]: result.result,
                remaining: result.remaining
            });
        }

        // DONE
        if (step === 'DONE') {
            return json({
                role: 'ai',
                content: `Your brand is ready. You can download your Brand JSON, React wireframe, or ask me to adjust anything.`
            });
        }

        return json({ error: 'Invalid step' }, { status: 400 });
    } catch (e) {
        console.error('Chat API error:', e);
        return json({
            role: 'ai',
            content: `I hit a snag. Let's try that again.`,
            error: true
        });
    }
}
