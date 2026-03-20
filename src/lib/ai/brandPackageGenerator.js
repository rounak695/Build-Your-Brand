/**
 * Brand Package JSON v2.0
 *
 * Authoritative machine-readable brand representation.
 * Consumed by external AI systems to generate digital products:
 * websites, applications, pitch decks, marketing assets.
 *
 * Single source of truth for all downstream AI design and development.
 */
export async function generateBrandPackageJSON({
    brandDNA,
    brandId,
    selectedName,
    selectedMoodboard,
    logos,
    guidelines,
    assets,
}) {
    console.log("[brandPackage] Compiling Brand Package JSON v2.0...");

    let parsedColors = [];
    try {
        parsedColors =
            typeof brandDNA.colors === "string"
                ? JSON.parse(brandDNA.colors)
                : brandDNA.colors || [];
    } catch (e) {
        parsedColors = [];
    }

    let vector = [];
    try {
        vector =
            typeof brandDNA.style_vector === "string"
                ? JSON.parse(brandDNA.style_vector)
                : brandDNA.style_vector || [];
    } catch (e) {
        vector = [];
    }

    // Extract typography from guidelines if available
    const guidelineTypo = guidelines?.typography || {};

    const brandPackage = {
        brand_id: brandId || crypto.randomUUID(),
        brand_name: selectedName || brandDNA.name || "Unnamed Brand",
        version: "2.0",

        dna: {
            industry: brandDNA.industry || "",
            target_audience: brandDNA.target_audience || "",
            visual_style: brandDNA.visual_style || "",
            brand_idea: brandDNA.brand_idea || "",
            personality_traits: brandDNA.personality_traits || [],
            brand_values: brandDNA.brand_values || [],
            competitive_position: brandDNA.competitive_position || ""
        },

        colors: {
            primary: parsedColors[0] || "#0A0A0A",
            accent: parsedColors[1] || "#2563EB",
            background: parsedColors[2] || "#FFFFFF",
            surface: parsedColors[3] || "#F8F8F7",
            full_palette: parsedColors
        },

        typography: {
            heading: guidelineTypo.primary || brandDNA.typography || "Inter",
            body: guidelineTypo.secondary || "DM Sans",
            mono: "JetBrains Mono",
            scale: "1.25",
            hierarchy: guidelineTypo.hierarchy || {
                h1: "32px Bold",
                h2: "24px Semi",
                h3: "18px Medium",
                body: "16px Regular",
                caption: "12px Regular"
            }
        },

        logos: {
            primary: logos?.[0]?.imageUrl || null,
            dark: logos?.[1]?.imageUrl || null,
            icon: logos?.[2]?.imageUrl || null,
            concepts: logos ? logos.map(l => ({ type: l.type, url: l.imageUrl })) : []
        },

        voice: {
            tone: brandDNA.voice_tone || brandDNA.tone_of_voice || "confident, minimal",
            personality: brandDNA.personality_traits?.join(", ") || "founder-focused",
            avoid: "corporate jargon, buzzwords"
        },

        social_assets: {
            instagram_post: null,
            story: null,
            linkedin_banner: null
        },

        wireframe_url: null,

        moodboard_url: selectedMoodboard?.imageUrl || null,

        style_vector: vector,

        guidelines_url: null,

        brand_assets: {
            moodboard: selectedMoodboard?.imageUrl || "",
            logos: logos ? logos.map(l => l.imageUrl) : [],
            mockups: assets ? assets.map(a => a.imageUrl) : []
        },

        ai_execution_rules: {
            system_prompt_addition:
                "You are generating products for this brand. Read this JSON configuration as the absolute source of truth. Adhere strictly to the color palette and typography.",
            strict_consistency: true
        },

        generated_at: new Date().toISOString()
    };

    return brandPackage;
}
