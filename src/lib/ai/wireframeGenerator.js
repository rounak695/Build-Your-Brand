import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { uploadImage } from '$lib/r2.js';

/**
 * Generate React high-fidelity wireframe — Claude Opus 4.6 per Architecture v2
 * + Visual screenshot via Gemini 3 Pro (Google Stitch-inspired)
 */
export async function generateWireframe(brandPackage, brandName) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    return mockWireframe(brandName);
  }

  try {
    console.log("[wireframeGenerator] Calling Claude Opus 4.6 + Gemini visual...");
    const anthropic = new Anthropic({ apiKey: key });
    const slug = (brandName || 'brand').replace(/[^a-zA-Z0-9]/g, '') || 'brand';

    // 1. Generate React code (Claude) — runs in parallel with visual
    const codePromise = anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: `You are a senior React developer. Generate a high-fidelity landing page wireframe as a single React component using Tailwind CSS.

Brand Package JSON:
${JSON.stringify(brandPackage || {}, null, 2)}

Requirements:
- Brand-accurate color tokens from the Brand Package JSON
- Typography scale from Brand DNA
- Sections: Navigation, Hero, Features (3 cards), Testimonial, CTA, Footer
- Interactive hover states and transitions
- Fully responsive (mobile-first)
- Use only Tailwind CSS classes — no external CSS
- Export as a single default function component
- Use the exact hex colors from the brand package

Return ONLY the React component code. No explanations, no markdown fences.`
      }]
    });

    // 2. Generate visual screenshot (Gemini) — runs concurrently
    const visualPromise = (async () => {
      const googleKey = env.GOOGLE_AI_API_KEY;
      if (!googleKey) return null;
      try {
        const dna = brandPackage?.brandDNA || {};
        const colorList = (dna.colors || []).join(', ');
        const ai = new GoogleGenAI({ apiKey: googleKey });
        const resp = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: `Generate a high-fidelity landing page wireframe screenshot for "${brandName}". Industry: ${dna.industry || 'tech'}. Style: ${dna.visual_style || 'modern minimal'}. Colors: ${colorList}. Show: Navigation bar, Hero section with headline and CTA, 3 Feature cards, Testimonial. Clean Studio-grade UI, Google Stitch design language.`,
          config: { responseModalities: ['IMAGE', 'TEXT'] }
        });
        const parts = resp.candidates?.[0]?.content?.parts || [];
        const imgPart = parts.find(p => p.inlineData);
        if (imgPart) {
          const buffer = Buffer.from(imgPart.inlineData.data, 'base64');
          const keyPath = `wireframes/${slug}_visual_${Date.now()}.png`;
          let url = null;
          try { url = await uploadImage(keyPath, buffer, 'image/png'); } catch {}
          if (!url) url = `data:image/png;base64,${imgPart.inlineData.data}`;
          console.log("[wireframeGenerator] Visual screenshot generated.");
          return url;
        }
      } catch (vErr) {
        console.warn('[wireframeGenerator] Visual generation skipped:', vErr?.message);
      }
      return null;
    })();

    const [message, visualUrl] = await Promise.all([codePromise, visualPromise]);
    const code = message.content[0].text;

    // Store wireframe code in R2
    let wireframeUrl = null;
    try {
      wireframeUrl = await uploadImage(`wireframes/${slug}_landing_${Date.now()}.tsx`, Buffer.from(code, 'utf-8'), 'text/plain');
    } catch {}

    console.log("[wireframeGenerator] Complete.");
    return {
      code,
      wireframeUrl,
      visualUrl,
      sections: ['Navigation', 'Hero', 'Features', 'Testimonial', 'CTA', 'Footer']
    };
  } catch (e) {
    console.error('[wireframeGenerator] error:', e);
    return mockWireframe(brandName);
  }
}

function mockWireframe(brandName) {
  const name = brandName || 'Brand';
  return {
    code: `export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <span className="text-xl font-bold">${name}</span>
        <div className="flex gap-6 text-sm text-gray-600">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
      <section className="px-8 py-24 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to ${name}</h1>
        <p className="text-xl text-gray-600 mb-8">Building something extraordinary.</p>
        <button className="px-8 py-3 bg-black text-white rounded-lg hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </section>
    </div>
  );
}`,
    wireframeUrl: null,
    sections: ['Navigation', 'Hero', 'Features', 'Testimonial', 'CTA', 'Footer'],
    mock: true
  };
}
