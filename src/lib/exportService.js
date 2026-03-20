/**
 * Brand Export Service — Client-side download utilities
 * Handles individual asset downloads (SVG, PNG) and full ZIP bundle export
 */

/**
 * Download SVG code as an .svg file
 */
export function downloadSVG(svgCode, filename = 'logo.svg') {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    triggerDownload(blob, filename);
}

/**
 * Download an image URL as a PNG file
 */
export async function downloadPNG(imageUrl, filename = 'asset.png') {
    try {
        if (imageUrl.startsWith('data:')) {
            // Base64 data URL
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            triggerDownload(blob, filename);
        } else {
            // Remote URL — fetch through our proxy to avoid CORS
            const response = await fetch(`/api/export/proxy?url=${encodeURIComponent(imageUrl)}`);
            const blob = await response.blob();
            triggerDownload(blob, filename);
        }
    } catch (e) {
        console.error('Download PNG failed:', e);
        // Fallback: open in new tab
        window.open(imageUrl, '_blank');
    }
}

/**
 * Download the full brand package JSON
 */
export function downloadBrandPackage(brandPackage, brandName = 'brand') {
    const json = JSON.stringify(brandPackage, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    triggerDownload(blob, `${sanitize(brandName)}-brand-package.json`);
}

/**
 * Download ALL brand assets as a ZIP bundle
 * Structure:
 *   /logos/         — SVG vector files + PNG previews
 *   /moodboards/    — PNG moodboard images
 *   /social/        — Campaign visual PNGs
 *   /assets/        — Mockup PNGs (business card, letterhead, etc.)
 *   brand-package.json
 */
export async function downloadAllAsZip(brandData, brandName = 'brand') {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const slug = sanitize(brandName);

    // Helper to fetch an image and add to zip
    async function addImage(folder, url, name) {
        if (!url) return;
        try {
            let blob;
            if (url.startsWith('data:')) {
                const response = await fetch(url);
                blob = await response.blob();
            } else {
                const response = await fetch(`/api/export/proxy?url=${encodeURIComponent(url)}`);
                blob = await response.blob();
            }
            const arrayBuf = await blob.arrayBuffer();
            zip.file(`${folder}/${name}`, arrayBuf);
        } catch (e) {
            console.warn(`Failed to add ${name} to ZIP:`, e);
        }
    }

    // --- Logos ---
    const logos = brandData.logos || [];
    for (let i = 0; i < logos.length; i++) {
        const logo = logos[i];
        const type = (logo.type || `variant_${i}`).replace(/\s+/g, '_');
        if (logo.svgCode) {
            zip.file(`logos/${type}.svg`, logo.svgCode);
        }
        if (logo.imageUrl) {
            await addImage('logos', logo.imageUrl, `${type}.png`);
        }
    }

    // --- Moodboards ---
    const moodboards = brandData.moodboards || [];
    for (let i = 0; i < moodboards.length; i++) {
        const mb = moodboards[i];
        if (mb.imageUrl) {
            const name = (mb.name || `moodboard_${i}`).replace(/\s+/g, '_').toLowerCase();
            await addImage('moodboards', mb.imageUrl, `${name}.png`);
        }
    }

    // --- Social Campaign Visuals ---
    const socialVisuals = brandData.socialCampaigns?.visuals || {};
    for (const [platform, url] of Object.entries(socialVisuals)) {
        if (url) {
            await addImage('social', url, `${platform}.png`);
        }
    }

    // --- Asset Mockups ---
    const assets = brandData.assets || [];
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (asset.imageUrl) {
            const name = (asset.name || `asset_${i}`).replace(/\s+/g, '_').toLowerCase();
            await addImage('assets', name, `${name}.png`);
        }
    }

    // --- Brand Package JSON ---
    if (brandData.brandPackage) {
        zip.file('brand-package.json', JSON.stringify(brandData.brandPackage, null, 2));
    }

    // --- Brand DNA Summary ---
    if (brandData.brandDNA) {
        const dna = brandData.brandDNA;
        const summary = `# ${brandName} — Brand DNA Summary

**Product Category:** ${dna.product_category || 'N/A'}
**Industry:** ${dna.industry || 'N/A'}
**Target Audience:** ${dna.target_audience || 'N/A'}
**Visual Style:** ${dna.visual_style || 'N/A'}
**Voice & Tone:** ${dna.voice_tone || dna.tone_of_voice || 'N/A'}
**Colors:** ${(dna.colors || []).join(', ')}
**Typography:** ${dna.typography || 'N/A'}
**Personality:** ${(dna.personality_traits || []).join(', ')}
**Values:** ${(dna.brand_values || []).join(', ')}
**Competitive Position:** ${dna.competitive_position || 'N/A'}
`;
        zip.file('brand-dna.md', summary);
    }

    // Generate and download
    const content = await zip.generateAsync({ type: 'blob' });
    triggerDownload(content, `${slug}-brand-package.zip`);
}

// --- Helpers ---

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function sanitize(name) {
    return (name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}
