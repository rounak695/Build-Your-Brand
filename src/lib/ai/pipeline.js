import { analyzeInspiration } from './inspirationAnalyzer.js';
import { createStyleVector, combineInspirations } from './styleVector.js';
import { createBrandDNA } from './brandDNA.js';
import { generateNames } from './nameGenerator.js';
import { generateMoodboards } from './moodboardGenerator.js';
import { generateLogos } from './logoGenerator.js';
import { generateBrandGuidelines } from './brandGuidelineGenerator.js';
import { generateBrandAssets } from './assetGenerator.js';
import { generateBrandPackageJSON } from './brandPackageGenerator.js';
import { generateWireframe } from './wireframeGenerator.js';
import { generateSocialCampaigns } from './socialCampaignGenerator.js';
import { supabase } from '$lib/supabase.js';

/**
 * Architecture v2.0 — 12-stage Brand Creation Pipeline
 *
 * Stage 1-5: Idea → Inspiration → Analysis → Style Vector → Brand DNA
 * Stage 6: Name Suggestions (Gemini 2.5 Pro)
 * Stage 7: Moodboard Generation (nano-banana-pro)
 * Stage 8: Logo Generation (gpt-image-1)
 * Stage 9: Brand Guidelines (Gemini 2.5 Pro)
 * Stage 10: Brand Asset Pack → JSON Export
 * Stage 11: React Wireframe (Claude Opus 4.6)
 * Stage 12: Social Media Campaigns (nano-banana-pro + Gemini)
 */

/** Stages 1-6: Idea → Inspiration → Analysis → Style Vector → Brand DNA → Names */
export async function createBrandPipeline(input) {
    console.log("[pipeline] Starting v2.0 pipeline...");

    // Stage 3: Analyze inspirations (GPT-4o vision)
    console.log("[pipeline] Stage 3: Inspiration Analysis (GPT-4o)...");
    const analyses = await analyzeInspiration(input.inspirations || []);

    const styleInfo = combineInspirations(analyses);

    // Stage 4: Create style vector (text-embedding-3-small)
    console.log("[pipeline] Stage 4: Style Vector Creation...");
    const styleVector = await createStyleVector(styleInfo.combinedDescription);

    // Stage 5: Generate Brand DNA (GPT-4o)
    console.log("[pipeline] Stage 5: Brand DNA Generation (GPT-4o)...");
    const dna = await createBrandDNA({
        brandIdea: input.brandIdea,
        industry: input.industry,
        styleDescription: styleInfo.combinedDescription,
        colors: styleInfo.dominantColors,
        keywords: styleInfo.keywords
    });

    dna.style_vector = styleVector;
    dna.inspiration_sources = input.inspirations;

    // Store brand in Supabase
    let brandId = null;
    try {
        const { data: brand } = await supabase.from('brands').insert({
            brand_idea: input.brandIdea,
            industry: dna.industry,
            target_audience: dna.target_audience,
            visual_style: dna.visual_style,
            brand_dna: dna,
            inspiration_sources: input.inspirations
        }).select().single();
        brandId = brand?.id;
    } catch (e) {
        console.error('Brand insert error:', e);
    }

    // Stage 6: Generate names (Gemini 2.5 Pro)
    console.log("[pipeline] Stage 6: Name Suggestions (Gemini 2.5 Pro)...");
    const names = await generateNames(dna);

    console.log("[pipeline] Stages 1-6 complete.");
    return { dna, names, brandId, styleInfo, analyses };
}

/** Stage 7: Continue pipeline after user selects name → Generate moodboards */
export async function continuePipeline(dna, brandName, brandId) {
    console.log("[pipeline] Stage 7: Moodboard Generation (gemini-3-pro-image-preview)...");
    const moodboards = await generateMoodboards(dna, brandName);
    const mbSuccess = moodboards.filter(m => m.imageUrl && !m.error).length;
    console.log(`[pipeline] Stage 7 complete: ${mbSuccess}/${moodboards.length} moodboards have images`);
    return { moodboards };
}

/** Stages 8-12: Final pipeline after moodboard selection */
export async function finalizePipeline(dna, brandName, brandId, selectedMoodboard) {
    // Stage 8: Generate logos (gpt-image-1)
    console.log("[pipeline] Stage 8: Logo Generation (gpt-image-1)...");
    const logos = await generateLogos(dna, brandName);
    const logoSuccess = logos.filter(l => l.imageUrl && !l.error).length;
    console.log(`[pipeline] Stage 8 complete: ${logoSuccess}/${logos.length} logos have images`);

    // Stage 9: Generate guidelines (Gemini 2.5 Pro)
    console.log("[pipeline] Stage 9: Brand Guidelines (Gemini 2.5 Pro)...");
    const guidelines = await generateBrandGuidelines(dna, brandName);

    // Stage 10: Generate assets + Brand Package JSON
    console.log("[pipeline] Stage 10: Brand Asset Pack + JSON Export...");
    const assets = await generateBrandAssets(dna, brandName);
    const brandPackage = await generateBrandPackageJSON({
        brandDNA: dna,
        brandId,
        selectedName: brandName,
        selectedMoodboard,
        logos,
        guidelines,
        assets
    });

    // Stage 11: React Wireframe (Claude Opus 4.6)
    console.log("[pipeline] Stage 11: React Wireframe (Claude Opus 4.6)...");
    const wireframe = await generateWireframe(brandPackage, brandName);

    // Stage 12: Social Media Campaigns (nano-banana-pro + Gemini)
    console.log("[pipeline] Stage 12: Social Campaigns (gemini-3-pro-image-preview + Gemini)...");
    const socialCampaigns = await generateSocialCampaigns(dna, brandName, brandPackage);
    const socialSuccess = socialCampaigns.visuals ? Object.values(socialCampaigns.visuals).filter(v => v).length : 0;
    console.log(`[pipeline] Stage 12 complete: ${socialSuccess}/4 social visuals generated`);

    // Update brand record with all outputs
    if (brandId) {
        await supabase.from('brands').update({
            brand_dna: { ...dna, brandName, logos, guidelines, assets, brandPackage, wireframe: wireframe?.wireframeUrl, socialCampaigns }
        }).eq('id', brandId).catch(() => { });
    }

    console.log("[pipeline] All 12 stages complete.");
    return { logos, guidelines, assets, brandPackage, wireframe, socialCampaigns };
}

/** Regeneration with limits — reuses existing Brand DNA (v2 limits) */
export async function regenerate(type, dna, brandName, brandId) {
    const LIMITS = {
        names: 3,
        moodboards: 2,
        logos: 3,
        guidelines: 2,
        wireframe: 2,
        socialCampaigns: 3
    };
    const limit = LIMITS[type];

    if (!limit) {
        return { error: 'Invalid regeneration type' };
    }

    // Check current count
    let count = 0;
    if (brandId) {
        const { data: existing } = await supabase
            .from('generations')
            .select('regen_count')
            .eq('brand_id', brandId)
            .eq('type', type)
            .single()
            .catch(() => ({ data: null }));
        count = existing?.regen_count || 0;
    }

    if (count >= limit) {
        return { error: `Regeneration limit reached (${count}/${limit})`, limitReached: true };
    }

    // Upsert generation record
    if (brandId) {
        await supabase.from('generations').upsert({
            brand_id: brandId,
            type,
            regen_count: count + 1
        }, { onConflict: 'brand_id,type' }).catch(() => { });
    }

    // Execute regeneration (reuses Brand DNA per architecture rule)
    const remaining = limit - count - 1;
    switch (type) {
        case 'names': return { result: await generateNames(dna), remaining };
        case 'moodboards': return { result: await generateMoodboards(dna, brandName), remaining };
        case 'logos': return { result: await generateLogos(dna, brandName), remaining };
        case 'guidelines': return { result: await generateBrandGuidelines(dna, brandName), remaining };
        case 'wireframe': return { result: await generateWireframe(null, brandName), remaining };
        case 'socialCampaigns': return { result: await generateSocialCampaigns(dna, brandName, null), remaining };
        default: return { error: 'Invalid regeneration type' };
    }
}
