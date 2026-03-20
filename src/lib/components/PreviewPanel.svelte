<script>
    export let step = "IDEA_INPUT";
    export let brandData = {};
    export let onSelectMoodboard = () => {};
    export let onRegenerate = () => {};

    const LIMITS = { names: 3, moodboards: 2, logos: 3, guidelines: 2, wireframe: 2, socialCampaigns: 3 };

    let wireframeTab = "preview"; // "preview" | "code"

    /** Build a self-contained HTML page that renders the React wireframe */
    function buildWireframeHTML(code) {
        if (!code) return "";
        // Extract the component body. The code may be wrapped in export default function ...
        // We render it inside a minimal React 18 + Tailwind CDN shell.
        return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>body{margin:0;font-family:Inter,system-ui,sans-serif}*{box-sizing:border-box}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const App = typeof LandingPage !== 'undefined' ? LandingPage : (typeof exports !== 'undefined' && exports.default ? exports.default : () => React.createElement('div', null, 'Wireframe'));
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  <\/script>
</body>
</html>`;
    }
</script>

<div
    class="flex-1 flex flex-col h-full border-r border-border bg-panel overflow-y-auto"
>
    <div
        class="flex items-center justify-between px-5 py-4 border-b border-border"
    >
        <h2 class="text-base font-semibold text-primary">Output Preview</h2>
    </div>

    <div class="flex-1 p-5 space-y-6">
        <!-- Brand DNA Summary -->
        {#if brandData.brandDNA}
            <div class="bg-white rounded-xl border border-border p-4">
                <h3 class="text-sm font-semibold text-primary mb-2">
                    Brand DNA
                </h3>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span class="text-muted">Industry:</span>
                        <span class="text-primary"
                            >{brandData.brandDNA.industry}</span
                        >
                    </div>
                    <div>
                        <span class="text-muted">Audience:</span>
                        <span class="text-primary"
                            >{brandData.brandDNA.target_audience}</span
                        >
                    </div>
                    <div>
                        <span class="text-muted">Style:</span>
                        <span class="text-primary"
                            >{brandData.brandDNA.visual_style}</span
                        >
                    </div>
                    <div>
                        <span class="text-muted">Voice:</span>
                        <span class="text-primary"
                            >{brandData.brandDNA.voice_tone || brandData.brandDNA.tone_of_voice}</span
                        >
                    </div>
                </div>
                {#if brandData.brandDNA.colors}
                    <div class="flex gap-1 mt-3">
                        {#each brandData.brandDNA.colors as color}
                            <div
                                class="w-8 h-8 rounded-lg border border-border"
                                style="background: {color}"
                                title={color}
                            ></div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Moodboard Selection -->
        {#if step === "MOODBOARD_SELECTION" && brandData.moodboards}
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-primary">
                        Select a Moodboard
                    </h3>
                    <button
                        class="text-xs text-accent hover:underline disabled:opacity-50"
                        on:click={() => onRegenerate("moodboards")}
                        disabled={brandData.regenCounts?.moodboards >=
                            LIMITS.moodboards}
                        >Regenerate ({LIMITS.moodboards -
                            (brandData.regenCounts?.moodboards || 0)} left)</button
                    >
                </div>
                <div class="grid grid-cols-2 gap-3">
                    {#each brandData.moodboards as mb}
                        <button
                            class="bg-white rounded-xl border-2 p-3 text-left transition-all hover:border-accent
                {brandData.selectedMoodboard?.name === mb.name
                                ? 'border-accent shadow-sm'
                                : 'border-border'}"
                            on:click={() => onSelectMoodboard(mb)}
                        >
                            {#if mb.imageUrl}
                                <img
                                    src={mb.imageUrl}
                                    alt={mb.name}
                                    class="w-full h-24 object-cover rounded-lg mb-2"
                                />
                            {:else if mb.colors}
                                <div class="flex gap-1 mb-2">
                                    {#each mb.colors as c}
                                        <div
                                            class="flex-1 h-16 rounded-lg"
                                            style="background: {c}"
                                        ></div>
                                    {/each}
                                </div>
                            {:else}
                                <div
                                    class="w-full h-24 rounded-lg mb-2 bg-[#f0f0f0] flex items-center justify-center"
                                >
                                    <span class="text-muted text-xs">Image unavailable</span>
                                </div>
                            {/if}
                            <p class="text-xs font-medium text-primary">
                                {mb.name}
                            </p>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Logos -->
        {#if brandData.logos}
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-primary">Logos</h3>
                    {#if step === "DONE"}
                        <button
                            class="text-xs text-accent hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("logos")}
                            disabled={brandData.regenCounts?.logos >=
                                LIMITS.logos}
                            >Regenerate ({LIMITS.logos -
                                (brandData.regenCounts?.logos || 0)} left)</button
                        >
                    {/if}
                </div>
                <div class="grid grid-cols-3 gap-3">
                    {#each brandData.logos as logo}
                        <div
                            class="bg-white rounded-xl border border-border p-3 text-center"
                        >
                            {#if logo.imageUrl}
                                <img
                                    src={logo.imageUrl}
                                    alt={logo.type}
                                    class="w-full h-20 object-contain mb-2"
                                />
                            {:else if logo.mockSvg}
                                <div
                                    class="w-full h-20 flex items-center justify-center mb-2"
                                >
                                    {@html logo.mockSvg}
                                </div>
                            {:else}
                                <div
                                    class="w-full h-20 bg-[#f8f8f8] rounded-lg flex items-center justify-center text-muted text-xs mb-2"
                                >
                                    Generating...
                                </div>
                            {/if}
                            <p
                                class="text-[10px] font-medium text-secondary capitalize"
                            >
                                {logo.type}
                            </p>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Guidelines -->
        {#if brandData.guidelines}
            <div class="bg-white rounded-xl border border-border p-4">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-primary">
                        Brand Guidelines
                    </h3>
                    {#if step === "DONE"}
                        <button
                            class="text-xs text-accent hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("guidelines")}
                            disabled={brandData.regenCounts?.guidelines >=
                                LIMITS.guidelines}
                            >Regenerate ({LIMITS.guidelines -
                                (brandData.regenCounts?.guidelines || 0)} left)</button
                        >
                    {/if}
                </div>

                {#if brandData.guidelines.colorPalette}
                    <div class="mb-3">
                        <p class="text-xs font-medium text-secondary mb-1">
                            Color Palette
                        </p>
                        <div class="flex gap-1">
                            {#each Object.entries(brandData.guidelines.colorPalette) as [name, color]}
                                <div class="flex-1 text-center">
                                    <div
                                        class="h-10 rounded-lg mb-1"
                                        style="background: {color.hex}"
                                    ></div>
                                    <p class="text-[9px] text-muted">{name}</p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if brandData.guidelines.typography}
                    <div class="mb-3">
                        <p class="text-xs font-medium text-secondary mb-1">
                            Typography
                        </p>
                        <p class="text-xs text-primary">
                            {brandData.guidelines.typography.primary}
                        </p>
                    </div>
                {/if}

                {#if brandData.guidelines.voiceGuidelines}
                    <div>
                        <p class="text-xs font-medium text-secondary mb-1">
                            Voice & Tone
                        </p>
                        <p class="text-xs text-primary">
                            {brandData.guidelines.voiceGuidelines.tone}
                        </p>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- React Wireframe — Stitch-inspired Preview -->
        {#if brandData.wireframe}
            <div class="bg-white rounded-xl border border-border overflow-hidden">
                <!-- Header with tabs -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div class="flex items-center gap-3">
                        <h3 class="text-sm font-semibold text-primary">
                            React Wireframe
                        </h3>
                        <!-- Tab switcher -->
                        <div class="flex bg-[#f0f0f0] rounded-lg p-0.5">
                            <button
                                class="px-3 py-1 text-[10px] font-medium rounded-md transition-all {wireframeTab === 'preview' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-secondary'}"
                                on:click={() => wireframeTab = "preview"}
                            >Preview</button>
                            <button
                                class="px-3 py-1 text-[10px] font-medium rounded-md transition-all {wireframeTab === 'code' ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-secondary'}"
                                on:click={() => wireframeTab = "code"}
                            >Code</button>
                        </div>
                    </div>
                    {#if step === "DONE"}
                        <button
                            class="text-xs text-accent hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("wireframe")}
                            disabled={brandData.regenCounts?.wireframe >= LIMITS.wireframe}
                        >Regenerate ({LIMITS.wireframe - (brandData.regenCounts?.wireframe || 0)} left)</button>
                    {/if}
                </div>

                <!-- Sections badges -->
                {#if brandData.wireframe.sections}
                    <div class="flex flex-wrap gap-1 px-4 py-2 border-b border-[#f0f0f0]">
                        {#each brandData.wireframe.sections as section}
                            <span class="px-2 py-0.5 bg-[#f5f5f5] rounded text-[10px] text-secondary font-medium">{section}</span>
                        {/each}
                    </div>
                {/if}

                <!-- Visual screenshot thumbnail -->
                {#if brandData.wireframe.visualUrl}
                    <div class="px-4 pt-3">
                        <img
                            src={brandData.wireframe.visualUrl}
                            alt="Wireframe concept"
                            class="w-full rounded-lg border border-border object-cover max-h-36"
                        />
                        <p class="text-[9px] text-muted mt-1 text-center">AI-generated concept preview</p>
                    </div>
                {/if}

                <!-- Preview tab: live iframe rendering -->
                {#if wireframeTab === "preview" && brandData.wireframe.code}
                    <div class="p-3">
                        <div class="rounded-lg border border-border overflow-hidden bg-white" style="height: 380px;">
                            <iframe
                                title="Wireframe Preview"
                                srcdoc={buildWireframeHTML(brandData.wireframe.code)}
                                class="w-full h-full border-0"
                                loading="lazy"
                            ></iframe>
                        </div>
                        <p class="text-[9px] text-muted mt-2 text-center">
                            Live render — React 18 + Tailwind CSS
                        </p>
                    </div>
                {/if}

                <!-- Code tab: full source view -->
                {#if wireframeTab === "code" && brandData.wireframe.code}
                    <div class="p-3">
                        <div class="bg-[#1e1e2e] rounded-lg p-4 max-h-[380px] overflow-y-auto">
                            <pre class="text-[11px] text-[#cdd6f4] whitespace-pre-wrap font-mono leading-relaxed">{brandData.wireframe.code}</pre>
                        </div>
                    </div>
                {/if}

                <!-- Download link -->
                {#if brandData.wireframe.wireframeUrl}
                    <div class="px-4 pb-3">
                        <a href={brandData.wireframe.wireframeUrl} target="_blank" class="block text-xs text-accent hover:underline text-center">
                            View full wireframe on R2 ↗
                        </a>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Social Media Campaigns (v2.0) -->
        {#if brandData.socialCampaigns}
            <div class="bg-white rounded-xl border border-border p-4">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-primary">
                        Social Campaigns
                    </h3>
                    {#if step === "DONE"}
                        <button
                            class="text-xs text-accent hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("socialCampaigns")}
                            disabled={brandData.regenCounts?.socialCampaigns >=
                                LIMITS.socialCampaigns}
                            >Regenerate ({LIMITS.socialCampaigns -
                                (brandData.regenCounts?.socialCampaigns || 0)} left)</button
                        >
                    {/if}
                </div>

                {#if brandData.socialCampaigns.visuals}
                    <div class="grid grid-cols-2 gap-2 mb-3">
                        {#each Object.entries(brandData.socialCampaigns.visuals) as [platform, url]}
                            <div class="bg-[#f8f8f8] rounded-lg overflow-hidden">
                                {#if url}
                                    <img src={url} alt={platform} class="w-full h-20 object-cover" />
                                {:else}
                                    <div class="w-full h-20 flex items-center justify-center">
                                        <span class="text-[10px] text-muted">{platform.replace('_', ' ')}</span>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if brandData.socialCampaigns.copy?.campaign_theme}
                    <p class="text-xs text-secondary">
                        Theme: <span class="text-primary font-medium">{brandData.socialCampaigns.copy.campaign_theme}</span>
                    </p>
                {/if}
            </div>
        {/if}

        <!-- Empty State -->
        {#if !brandData.brandDNA && !brandData.moodboards && !brandData.logos}
            <div
                class="flex-1 flex flex-col items-center justify-center text-center"
            >
                <div
                    class="w-12 h-12 rounded-full bg-[#f8f8f8] flex items-center justify-center mb-3"
                >
                    <span class="text-xl text-muted">*</span>
                </div>
                <p class="text-sm text-muted">
                    AI is analyzing<br />and generating...
                </p>
            </div>
        {/if}
    </div>
</div>
