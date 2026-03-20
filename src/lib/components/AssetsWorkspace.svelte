<script>
    export let step = "IDEA_INPUT";
    export let brandData = {};
    export let onRegenerate = () => {};
    export let isLoading = false;

    const LIMITS = { logos: 3, guidelines: 2, wireframe: 2, socialCampaigns: 3 };
    let wireframeTab = "preview";

    function buildWireframeHTML(code) {
        if (!code) return "";
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

    function downloadBrandJSON() {
        if (!brandData.brandPackage) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(brandData.brandPackage, null, 2));
        const anchor = document.createElement("a");
        anchor.href = dataStr;
        anchor.download = `${brandData.name.replace(/\s+/g, "_").toLowerCase()}_brand_package.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    function downloadWireframe() {
        if (!brandData.wireframe?.code) return;
        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(brandData.wireframe.code);
        const anchor = document.createElement("a");
        anchor.href = dataStr;
        anchor.download = `${brandData.name.replace(/\s+/g, "_").toLowerCase()}_wireframe.tsx`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    function downloadStandaloneHTML() {
        if (!brandData.wireframe?.code) return;
        const html = buildWireframeHTML(brandData.wireframe.code);
        const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(html);
        const anchor = document.createElement("a");
        anchor.href = dataStr;
        anchor.download = `${brandData.name.replace(/\s+/g, "_").toLowerCase()}_wireframe.html`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
</script>

<div class="h-[calc(100vh-64px)] p-8 custom-scrollbar overflow-y-auto bg-surface-container-lowest">
    <!-- Header & Controls -->
    <header class="flex justify-between items-end mb-12">
        <div>
            <h1 class="font-headline font-extrabold text-4xl text-white tracking-tighter">Assets Workspace</h1>
            <p class="text-secondary mt-2 font-body text-sm max-w-md">Manage, export, and deploy project components with tactile precision.</p>
        </div>
        <div class="flex gap-4">
            <button
                class="px-6 py-2 rounded-xl bg-surface-bright/10 ghost-border text-white label-style font-bold text-[10px] backdrop-blur-md hover:bg-surface-bright/20 transition-all flex items-center gap-2"
            >
                <span class="material-symbols-outlined text-[16px]">filter_list</span>
                Filter
            </button>
            {#if brandData.brandPackage}
                <button
                    class="px-6 py-2 rounded-xl primary-gradient text-on-primary-fixed label-style font-bold text-[10px] shadow-lg shadow-primary-container/20 flex items-center gap-2"
                    on:click={downloadBrandJSON}
                >
                    <span class="material-symbols-outlined text-[16px]">download</span>
                    Export Bundle
                </button>
            {/if}
        </div>
    </header>

    <!-- Bento Grid Workspace -->
    <div class="grid grid-cols-12 gap-6 pb-24">

        <!-- Section: Logos -->
        {#if brandData.logos}
            <section class="col-span-12 lg:col-span-8 space-y-6">
                <div class="flex items-center gap-4">
                    <span class="font-headline font-bold text-xs uppercase tracking-[0.2em] text-secondary">Primary Logos</span>
                    <div class="h-px flex-grow bg-primary-container opacity-30"></div>
                    {#if step === "DONE"}
                        <button
                            class="label-style-sm text-primary font-bold hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("logos")}
                            disabled={brandData.regenCounts?.logos >= LIMITS.logos || isLoading}
                        >Regenerate ({LIMITS.logos - (brandData.regenCounts?.logos || 0)} left)</button>
                    {/if}
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {#each brandData.logos as logo}
                        <div class="group relative aspect-video bg-surface rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all duration-500 cursor-pointer ghost-border">
                            <div class="absolute inset-0 flex items-center justify-center p-8">
                                {#if logo.imageUrl}
                                    <img src={logo.imageUrl} alt={logo.type} class="w-full h-full object-contain" />
                                {:else if logo.mockSvg}
                                    <div class="w-full h-full flex items-center justify-center">
                                        {@html logo.mockSvg}
                                    </div>
                                {:else}
                                    <div class="flex items-center justify-center">
                                        <span class="material-symbols-outlined text-3xl text-primary/20">image</span>
                                    </div>
                                {/if}
                            </div>
                            <div class="absolute bottom-0 inset-x-0 p-4 bg-surface-dim/80 backdrop-blur-md flex justify-between items-center transform translate-y-full group-hover:translate-y-0 transition-transform">
                                <div>
                                    <p class="text-white text-[11px] font-bold uppercase tracking-wider">{logo.type}</p>
                                </div>
                                <button class="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center text-primary hover:bg-primary-container transition-colors">
                                    <span class="material-symbols-outlined text-[18px]">download</span>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Section: Files & Metadata -->
        <section class="col-span-12 lg:col-span-4 space-y-6">
            <!-- Brand Guidelines -->
            {#if brandData.guidelines}
                <div class="flex items-center gap-4">
                    <span class="font-headline font-bold text-xs uppercase tracking-[0.2em] text-secondary">Brand Style</span>
                    <div class="h-px flex-grow bg-primary-container opacity-30"></div>
                </div>
                <div class="bg-surface-container-low rounded-2xl p-6 ghost-border space-y-5">
                    {#if brandData.guidelines.colorPalette}
                        <div>
                            <p class="label-style-sm text-secondary mb-3">Color Palette</p>
                            <div class="flex gap-1">
                                {#each Object.entries(brandData.guidelines.colorPalette) as [name, color]}
                                    <div class="flex-1 text-center">
                                        <div class="h-10 rounded-lg mb-1" style="background: {color.hex}"></div>
                                        <p class="text-[9px] text-secondary/60">{name}</p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                    {#if brandData.guidelines.typography}
                        <div>
                            <p class="label-style-sm text-secondary mb-2">Typography</p>
                            <p class="text-on-surface text-sm font-medium">{brandData.guidelines.typography.primary}</p>
                        </div>
                    {/if}
                    {#if brandData.guidelines.voiceGuidelines}
                        <div>
                            <p class="label-style-sm text-secondary mb-2">Voice & Tone</p>
                            <p class="text-on-surface-variant text-xs leading-relaxed">{brandData.guidelines.voiceGuidelines.tone}</p>
                        </div>
                    {/if}
                    {#if step === "DONE"}
                        <button
                            class="w-full label-style-sm text-primary font-bold hover:underline disabled:opacity-50 text-center pt-2"
                            on:click={() => onRegenerate("guidelines")}
                            disabled={brandData.regenCounts?.guidelines >= LIMITS.guidelines || isLoading}
                        >Regenerate Guidelines ({LIMITS.guidelines - (brandData.regenCounts?.guidelines || 0)} left)</button>
                    {/if}
                </div>
            {/if}

            <!-- Export Bundle -->
            {#if brandData.brandPackage}
                <div class="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-10">
                        <span class="material-symbols-outlined text-6xl text-primary" style="font-variation-settings: 'wght' 100;">ios_share</span>
                    </div>
                    <h3 class="text-primary font-headline font-bold text-sm uppercase tracking-widest mb-4">Export Bundle</h3>
                    <p class="text-secondary text-xs mb-6">Prepare all active brand assets for production delivery.</p>
                    <div class="space-y-2">
                        <button class="w-full py-3 rounded-xl primary-gradient text-on-primary-fixed font-headline font-bold text-[10px] uppercase tracking-[0.2em]" on:click={downloadBrandJSON}>
                            Generate ZIP
                        </button>
                        {#if brandData.wireframe?.code}
                            <button class="w-full py-2.5 rounded-lg border border-primary/40 text-primary label-style-sm font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2" on:click={downloadWireframe}>
                                <span class="material-symbols-outlined text-[14px]">code</span>
                                Download React Code
                            </button>
                            <button class="w-full py-2.5 rounded-lg bg-surface-bright/20 text-white label-style-sm font-bold hover:bg-surface-bright/40 transition-colors flex items-center justify-center gap-2" on:click={downloadStandaloneHTML}>
                                <span class="material-symbols-outlined text-[14px]">html</span>
                                Download Standalone HTML
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Social Campaigns -->
            {#if brandData.socialCampaigns?.copy}
                <div class="flex items-center gap-4">
                    <span class="font-headline font-bold text-xs uppercase tracking-[0.2em] text-secondary">Campaign Copy</span>
                    <div class="h-px flex-grow bg-primary-container opacity-30"></div>
                </div>
                <div class="space-y-3">
                    {#if brandData.socialCampaigns.copy.instagram}
                        <div class="bg-surface-container-low rounded-xl p-4 ghost-border">
                            <p class="label-style-sm text-secondary mb-2">Instagram</p>
                            <p class="text-on-surface text-xs">{brandData.socialCampaigns.copy.instagram.caption}</p>
                            <p class="text-primary text-[10px] mt-1">{(brandData.socialCampaigns.copy.instagram.hashtags || []).join(' ')}</p>
                        </div>
                    {/if}
                    {#if brandData.socialCampaigns.copy.twitter}
                        <div class="bg-surface-container-low rounded-xl p-4 ghost-border">
                            <p class="label-style-sm text-secondary mb-2">Twitter / X</p>
                            <p class="text-on-surface text-xs">{brandData.socialCampaigns.copy.twitter.tweet}</p>
                        </div>
                    {/if}
                    {#if brandData.socialCampaigns.copy.linkedin}
                        <div class="bg-surface-container-low rounded-xl p-4 ghost-border">
                            <p class="label-style-sm text-secondary mb-2">LinkedIn</p>
                            <p class="text-on-surface text-xs">{brandData.socialCampaigns.copy.linkedin.post}</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </section>

        <!-- Section: Wireframes -->
        {#if brandData.wireframe}
            <section class="col-span-12 space-y-6 mt-8">
                <div class="flex items-center gap-4">
                    <span class="font-headline font-bold text-xs uppercase tracking-[0.2em] text-secondary">Wireframes & UI Kits</span>
                    <div class="h-px flex-grow bg-primary-container opacity-30"></div>
                    {#if step === "DONE"}
                        <button
                            class="label-style-sm text-primary font-bold hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("wireframe")}
                            disabled={brandData.regenCounts?.wireframe >= LIMITS.wireframe || isLoading}
                        >Regenerate ({LIMITS.wireframe - (brandData.regenCounts?.wireframe || 0)} left)</button>
                    {/if}
                </div>

                <!-- Tab Switcher -->
                <div class="flex gap-2">
                    <button
                        class="px-4 py-2 rounded-lg text-[10px] font-label font-bold uppercase tracking-wider flex items-center gap-2 transition-all
                            {wireframeTab === 'preview' ? 'bg-primary-container text-white' : 'text-secondary hover:text-white bg-surface-bright/10'}"
                        on:click={() => wireframeTab = "preview"}
                    >
                        <span class="material-symbols-outlined text-xs">grid_view</span>
                        Preview
                    </button>
                    <button
                        class="px-4 py-2 rounded-lg text-[10px] font-label font-bold uppercase tracking-wider flex items-center gap-2 transition-all
                            {wireframeTab === 'code' ? 'bg-primary-container text-white' : 'text-secondary hover:text-white bg-surface-bright/10'}"
                        on:click={() => wireframeTab = "code"}
                    >
                        <span class="material-symbols-outlined text-xs">code</span>
                        Code
                    </button>
                </div>

                {#if wireframeTab === "preview" && brandData.wireframe.code}
                    <div class="rounded-2xl overflow-hidden bg-surface ghost-border" style="height: 500px;">
                        <iframe
                            title="Wireframe Preview"
                            srcdoc={buildWireframeHTML(brandData.wireframe.code)}
                            class="w-full h-full border-0"
                            loading="lazy"
                        ></iframe>
                    </div>
                    <p class="label-style-sm text-secondary/60 text-center">Live render — React 18 + Tailwind CSS</p>
                {/if}

                {#if wireframeTab === "code" && brandData.wireframe.code}
                    <div class="bg-surface-container-lowest rounded-2xl p-6 max-h-[500px] overflow-y-auto custom-scrollbar ghost-border">
                        <pre class="text-[11px] text-on-surface whitespace-pre-wrap font-mono leading-relaxed">{brandData.wireframe.code}</pre>
                    </div>
                {/if}
            </section>
        {/if}

        <!-- Social Campaign Visuals -->
        {#if brandData.socialCampaigns?.visuals}
            <section class="col-span-12 space-y-6 mt-8">
                <div class="flex items-center gap-4">
                    <span class="font-headline font-bold text-xs uppercase tracking-[0.2em] text-secondary">Campaign Visuals</span>
                    <div class="h-px flex-grow bg-primary-container opacity-30"></div>
                    {#if step === "DONE"}
                        <button
                            class="label-style-sm text-primary font-bold hover:underline disabled:opacity-50"
                            on:click={() => onRegenerate("socialCampaigns")}
                            disabled={brandData.regenCounts?.socialCampaigns >= LIMITS.socialCampaigns || isLoading}
                        >Regenerate ({LIMITS.socialCampaigns - (brandData.regenCounts?.socialCampaigns || 0)} left)</button>
                    {/if}
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {#each Object.entries(brandData.socialCampaigns.visuals) as [platform, url]}
                        <div class="group relative overflow-hidden rounded-2xl bg-surface ghost-border">
                            {#if url}
                                <img src={url} alt={platform} class="w-full h-48 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            {:else}
                                <div class="w-full h-48 flex items-center justify-center">
                                    <span class="text-secondary text-xs uppercase">{platform.replace('_', ' ')}</span>
                                </div>
                            {/if}
                            <div class="absolute bottom-0 left-0 p-4">
                                <span class="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] uppercase font-bold tracking-widest">{platform.replace('_', ' ')}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Brand Assets (images) -->
        {#if brandData.assets}
            <section class="col-span-12 space-y-6 mt-8">
                <div class="flex items-center gap-4">
                    <span class="font-headline font-bold text-xs uppercase tracking-[0.2em] text-secondary">Brand Assets</span>
                    <div class="h-px flex-grow bg-primary-container opacity-30"></div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {#each brandData.assets as asset}
                        <div class="group relative overflow-hidden rounded-2xl bg-surface ghost-border">
                            {#if asset.imageUrl}
                                <img src={asset.imageUrl} alt={asset.name} class="w-full h-40 object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            {:else}
                                <div class="w-full h-40 flex items-center justify-center bg-surface-container">
                                    <span class="text-secondary text-xs">{asset.name}</span>
                                </div>
                            {/if}
                            <div class="p-4">
                                <p class="text-white text-[11px] font-bold uppercase tracking-wider">{asset.name}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Empty state -->
        {#if !brandData.logos && !brandData.guidelines && !brandData.wireframe && !brandData.assets}
            <div class="col-span-12 flex flex-col items-center justify-center py-24 text-center">
                <div class="w-16 h-16 rounded-full border border-outline-variant/20 flex items-center justify-center mb-6">
                    <span class="material-symbols-outlined text-3xl text-primary/30">layers</span>
                </div>
                <p class="text-secondary text-sm">Assets will materialize as your brand takes shape...</p>
            </div>
        {/if}
    </div>
</div>
