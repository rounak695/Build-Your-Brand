# AI Brand Builder — Architecture v2.0

**Architecture Document v2.0**

## AI Brand Builder

Brand DNA–driven generation pipeline · Vector-based style consistency · ₹2,000/month infrastructure budget

**Badges:** Supabase + pgvector | Vercel Serverless | Cloudflare R2 | Upstash Redis | 7 AI Models

---

## Pipeline

**Core generation pipeline · 12 stages**

**Stage 1: Idea**
User submits brand concept, industry, and target audience

**Stage 2: Inspiration Upload**
Images, URLs, brand names, Dribbble / Behance screenshots accepted

**Stage 3: Inspiration Analysis**
Visual style features extracted — colors, mood, layout density, cultural signals
*Badge: gpt-4o · vision*

**Stage 4: Style Vector Creation**
AI descriptions converted to embeddings — stored permanently in pgvector
*Badge: text-embedding-3-small*

**Stage 5: Brand DNA Generation**
Core context object created — feeds all downstream stages · held in session by GPT-4o
*Badge: Central Hub · GPT-4o context*

**Stage 6: Name Suggestions**
Brand name concepts aligned with DNA, visual identity, and target audience
*Badge: Gemini 2.5 Pro*

**Stage 7: Moodboard Generation**
Four visual directions presented as narrative stories through Gemini chat
*Badge: nano-banana-pro · creative*

**Stage 8: Logo Generation**
Logo concepts guided by Brand DNA and style vector — accuracy-first
*Badge: gpt-image-1.5 · accurate*

**Stage 9: Brand Guidelines**
Color system, typography scale, usage rules, brand voice documentation
*Badge: Gemini 2.5 Pro*

**Stage 10: Brand Asset Pack → JSON Export**
Moodboard + Brand Package JSON — primary mandatory outputs delivered
*Badge: Key Output*

**Stage 11: React High Fidelity Wireframe**
Interactive React components generated directly from Brand Package JSON — developer-ready
*Badge: claude-opus-4.6 · new*

**Stage 12: Social Media Campaigns**
Platform-ready campaign assets at native resolution — Instagram, Twitter, LinkedIn
*Badge: nano-banana-pro + Gemini · new*

*All stages consume Brand DNA as primary context · Regenerations always reuse existing Brand DNA · New: React Wireframe + Social Media Campaign outputs added post-asset generation*

---

## Brand DNA

The Brand DNA is the core data structure that controls all generation tasks. Generated once per brand project and threaded through every AI prompt as primary context. GPT-4o holds this context across the full session and at regeneration time.

### Lifecycle rules

How Brand DNA is managed across the session

- Generated once per brand project — never rebuilt on regen
- All AI prompts must include Brand DNA as primary context
- GPT-4o holds context throughout the chat and at regeneration
- Style vector stored permanently via pgvector — never re-embedded

### Style vector pipeline

Inspiration → embedding → vector → DNA

- Inspiration Images
  - ↓ GPT-image-1.5 vision analysis
- Embedding generation
  - ↓ OpenAI text-embedding-3-small
- Vector stored in pgvector
  - ↓ enables similarity search
- Appended to Brand DNA object

### Example Brand DNA object

```json
{
  "brand_id": "uuid-v4",
  "brand_idea": "AI productivity tool",
  "industry": "SaaS",
  "target_audience": "startup founders",
  "visual_style": "minimal tech",
  "colors": ["#0A0A0A", "#2563EB", "#F8F8F7"],
  "typography": "modern sans-serif",
  "voice_tone": "confident, minimal, founder-focused",
  "style_vector": [0.231, 0.553, 0.889, ...],
  "inspiration_sources": [],
  "created_at": "ISO8601 timestamp"
}
```

---

## Infrastructure

Serverless-first stack designed to stay within ₹2,000/month. Every layer is pay-per-use. No persistent servers. AI calls are exclusively server-side.

### Supabase PostgreSQL

**Database** — Primary store with vector support

- pgvector extension — style vector storage + cosine similarity search
- Tables: users · brands · brand_vectors · generations · assets · payments
- Built-in Supabase Auth for user management and RLS policies

### Vercel

**Hosting** — Next.js frontend + serverless AI endpoints

- API routes only — all AI calls run server-side, keys never exposed
- Edge deployment — low-latency streaming responses for chat
- Pay per invocation — ideal for bursty AI workloads

### Cloudflare R2

**Storage** — Zero egress fee asset storage

- File structure: brand-assets/{brand_id}/logos/ · moodboards/ · social-assets/ · wireframes/
- Stores: logos · moodboards · social campaign assets · Brand Package JSON

### Upstash Redis

**Queue** — Background jobs and rate limiting

- Queue flow: Request → Job → Worker runs AI → Result stored in DB
- Rate limiting: per-user counters enforced before any AI call fires

### AI Orchestration Layer

`/lib/ai/` — TypeScript modules — each pipeline stage maps to one file

- brandDNA.ts
- inspirationAnalyzer.ts
- nameGenerator.ts
- moodboardGenerator.ts
- logoGenerator.ts
- brandGuidelineGenerator.ts
- assetGenerator.ts
- wireframeGenerator.ts
- socialCampaignGenerator.ts

---

## AI Models

Each task is routed to the most purpose-fit model. No generic routing — every model has a specific, exclusive responsibility. Context is held by GPT-4o throughout the session and regeneration cycles.

### gpt-image-1.5 ( Follow the guide : https://developers.openai.com/api/docs/guides/image-generation)

**Brand Asset Generation — Accuracy**

High-fidelity logo rendering, brand asset pack elements, and any generation where pixel-perfect precision and consistent brand color accuracy is paramount. Used when output must exactly match specified hex values and layout.

*Tags: Logos · Brand Asset Pack · Icon sets*

### nano-banana-pro ( Follow the guide : https://ai.google.dev/gemini-api/docs/image-generation)


**Brand Asset Generation — Creativity**

Moodboard exploration, experimental visual directions, and brand assets where creative interpretation and unexpected aesthetics matter more than strict specification adherence. Used for divergent generation passes.

*Tags: Moodboards · Creative directions · Social visuals*

### claude-opus-4.6

**Coding Tasks**

React high-fidelity wireframe generation, interactive component creation, and all technical code output. Handles complex component logic, Tailwind layouts, and full-page UI scaffolding from Brand DNA specs.

*Tags: React wireframes · Interactive UI · Component scaffolding*

### gemini-2.5-pro

**User Chat Intelligence — Humanized**

Powers the conversational brand architect experience. Drives the narrative moodboard presentation, brand psychology explanations, and all exploratory creative dialogue. Gives the AI a creative director persona — never robotic, always collaborative.

*Tags: Brand architect chat · Moodboard narrative · Brand psychology*

### claude-haiku

**Decision Making & Instructions**

Fast, lightweight routing decisions — classifying user intent, deciding which pipeline stage to trigger next, generating structured instructions for other models, and enforcing regeneration limit checks before expensive calls fire.

*Tags: Intent routing · Pipeline decisions · Regen gate checks*

### gpt-4o

**Context Holding — Session & Regeneration**

Maintains the full Brand DNA context across the entire user session. Acts as the persistent memory layer — ensures every regeneration, every downstream task, and every model call has complete awareness of the brand's established direction. Also handles brand vision analysis from uploaded inspiration images.

*Tags: Session context · Regeneration memory · Inspiration analysis*

### Model selection principle

No single model does everything. Accuracy-critical image work goes to gpt-image-1.5. Creative exploration uses nano-banana-pro. Chat persona runs on Gemini. Code stays with Claude Opus. Haiku handles fast decisions cheaply.

### Context persistence strategy

GPT-4o carries Brand DNA as the session-persistent context object. Serialized to Supabase after each stage. Retrieved at regeneration time. Haiku uses this to gate decisions without re-loading expensive context itself.

---

## Key Outputs ★

Every brand generation pipeline must produce all four deliverables. The Moodboard and Brand Package JSON are mandatory primary outputs. React Wireframe and Social Campaigns are mandatory secondary outputs added in v2.0.

### Moodboard

**For Humans**

Four visual directions presented as narrative stories. Each described with atmosphere, brand connection, and emotional tone before the image appears. Powered by nano-banana-pro for creative divergence.

- Color palette and dominant mood
- Typography personality and pairing
- Imagery style and subject direction
- Layout density and whitespace feel
- Aesthetic identity — cultural signals

*Human understanding → Visual story*

### Brand Package JSON

**For Machines**

Structured machine-readable output. Consumed by external AI agents — Claude Opus generates React wireframes directly from this JSON. Single source of truth for all downstream digital product generation.

- Complete Brand DNA + style_vector
- Full color system with hex values
- Typography scale, weights, line-heights
- Logo asset URLs from Cloudflare R2
- Voice, tone, personality, avoid list

*Machine understanding → Downstream generation*

### React Wireframe

**New in v2.0 · For Developers** (Interactive)

High-fidelity interactive React components generated by Claude Opus 4.6, consuming the Brand Package JSON directly. Fully functional, Tailwind-styled, ready for developer handoff or Storybook integration.

- Brand-accurate color tokens applied
- Typography scale from Brand DNA
- Navigation, hero, cards, CTA sections
- Interactive states and hover effects
- Developer-ready component export

*Brand JSON → React component code*

### Social Media Campaigns

**New in v2.0 · For Marketing**

Platform-ready marketing campaign assets generated at native resolution. nano-banana-pro for creative visuals, Gemini 2.5 for copy. Brand-consistent across all formats — launch-ready.

- Instagram post + story (1:1 + 9:16)
- Twitter / X card (2:1)
- LinkedIn banner (4:1)
- Campaign copy aligned to brand voice
- Hashtag and caption suggestions

*Brand DNA → Platform-ready assets*

### Brand Package JSON · full schema v2.0

```json
{
  "brand_id": "uuid",
  "brand_name": "Acme AI",
  "version": "2.0",
  "dna": { "industry": "SaaS", "target_audience": "startup founders", "visual_style": "minimal tech" },
  "colors": { "primary": "#0A0A0A", "accent": "#2563EB", "background": "#FFFFFF", "surface": "#F8F8F7" },
  "typography": { "heading": "Inter", "body": "DM Sans", "mono": "JetBrains Mono", "scale": "1.25" },
  "logos": { "primary": "https://r2.cf/...", "dark": "https://r2.cf/...", "icon": "https://r2.cf/..." },
  "voice": { "tone": "confident, minimal", "personality": "founder-focused", "avoid": "corporate jargon" },
  "social_assets": { "instagram_post": "https://r2.cf/...", "story": "https://r2.cf/...", "linkedin_banner": "https://r2.cf/..." },
  "wireframe_url": "https://r2.cf/brand_id/wireframes/landing_v1.tsx",
  "moodboard_url": "https://r2.cf/brand_id/moodboards/selected.png",
  "style_vector": [0.231, 0.553, 0.889, ...],
  "guidelines_url": "https://r2.cf/brand_id/guidelines.pdf",
  "generated_at": "2025-01-01T00:00:00Z"
}
```

---

## Cost & Security

### Regeneration limits · controls AI spend

| Metric | Limit |
|--------|-------|
| Name suggestions | 3× |
| Moodboards | 2× |
| Logo concepts | 3× |
| Brand guidelines | 2× |
| React wireframe | 2× |
| Social campaigns | 3× |

### Cost control rules

- Avoid unnecessary AI calls — gate all generation behind explicit user actions
- Cache all generation results — serve from Supabase, regen only on explicit request
- Haiku for fast decisions — lightweight model handles routing, no expensive model wasted on gating
- Style vector is permanent — embedded once, never re-computed unless inspiration changes
- Serverless only — pay per invocation, zero idle server cost

### Security rules

- API keys server-side only — never in frontend bundles or client-side code
- All AI calls in Vercel routes — zero direct client → AI calls
- Upload validation required — type, size, content validated before R2 storage
- Rate limiting via Redis — Upstash enforces per-user limits before AI fires
- Supabase RLS policies — row-level security on all brand data tables

### Future upgrade path · post-MVP

- Advanced style vector clustering
- Template-based asset generation
- Brand website generation
- AI brand voice training
- Design system generation
- Multi-brand workspace
- Brand consistency scoring
