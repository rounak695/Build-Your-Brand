<script>
    export let step = "IDEA_INPUT";
    export let brandData = {};
    export let onRegenerate = () => {};

    function downloadBrandJSON() {
        if (!brandData.brandPackage) return;
        const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(brandData.brandPackage, null, 2));
        const anchor = document.createElement("a");
        anchor.href = dataStr;
        anchor.download = `${brandData.name.replace(/\s+/g, "_").toLowerCase()}_brand_package_v2.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    function downloadWireframe() {
        if (!brandData.wireframe?.code) return;
        const dataStr =
            "data:text/plain;charset=utf-8," +
            encodeURIComponent(brandData.wireframe.code);
        const anchor = document.createElement("a");
        anchor.href = dataStr;
        anchor.download = `${brandData.name.replace(/\s+/g, "_").toLowerCase()}_wireframe.tsx`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    function downloadStandaloneHTML() {
        if (!brandData.wireframe?.code) return;
        const code = brandData.wireframe.code;
        const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${brandData.name || 'Brand'} — Wireframe</title>
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
        const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(html);
        const anchor = document.createElement("a");
        anchor.href = dataStr;
        anchor.download = `${brandData.name.replace(/\s+/g, "_").toLowerCase()}_wireframe.html`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
</script>

<div class="w-[300px] flex flex-col h-full bg-panel overflow-y-auto">
    <div
        class="flex items-center justify-between px-5 py-4 border-b border-border"
    >
        <h2 class="text-base font-semibold text-primary">Brand Assets</h2>
    </div>

    <div class="flex-1 p-4 space-y-4">
        <!-- Brand Name & Tagline -->
        {#if brandData.name}
            <div
                class="bg-white rounded-xl border border-border p-4 text-center"
            >
                <h3 class="text-lg font-bold text-primary">{brandData.name}</h3>
                {#if brandData.tagline}
                    <p class="text-xs text-secondary mt-1">
                        {brandData.tagline}
                    </p>
                {/if}
            </div>
        {/if}

        <!-- Download Actions -->
        {#if brandData.brandPackage}
            <div class="space-y-2">
                <button
                    class="w-full bg-primary text-white text-sm font-medium py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    on:click={downloadBrandJSON}
                >
                    Download Brand JSON v2.0
                </button>
                {#if brandData.wireframe?.code}
                    <button
                        class="w-full bg-accent text-white text-sm font-medium py-2 rounded-lg hover:opacity-90 transition-colors"
                        on:click={downloadWireframe}
                    >
                        Download React Wireframe
                    </button>
                    <button
                        class="w-full bg-[#1e1e2e] text-white text-sm font-medium py-2 rounded-lg hover:opacity-90 transition-colors"
                        on:click={downloadStandaloneHTML}
                    >
                        Download Standalone HTML
                    </button>
                {/if}
            </div>
        {/if}

        <!-- Brand Assets -->
        {#if brandData.assets}
            <div>
                <h3 class="text-sm font-semibold text-primary mb-2">
                    Brand Assets
                </h3>
                <div class="space-y-3">
                    {#each brandData.assets as asset}
                        <div
                            class="bg-white rounded-xl border border-border overflow-hidden"
                        >
                            {#if asset.imageUrl}
                                <img
                                    src={asset.imageUrl}
                                    alt={asset.name}
                                    class="w-full h-32 object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-32 bg-[#f8f8f8] flex items-center justify-center"
                                >
                                    <span class="text-xs text-muted"
                                        >{asset.name}</span
                                    >
                                </div>
                            {/if}
                            <div class="px-3 py-2">
                                <p class="text-xs font-medium text-primary">
                                    {asset.name}
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Social Campaign Copy -->
        {#if brandData.socialCampaigns?.copy}
            <div>
                <h3 class="text-sm font-semibold text-primary mb-2">Campaign Copy</h3>
                <div class="space-y-2">
                    {#if brandData.socialCampaigns.copy.instagram}
                        <div class="bg-white rounded-lg border border-border p-3">
                            <p class="text-[10px] font-medium text-muted mb-1">INSTAGRAM</p>
                            <p class="text-xs text-primary">{brandData.socialCampaigns.copy.instagram.caption}</p>
                            <p class="text-[10px] text-accent mt-1">{(brandData.socialCampaigns.copy.instagram.hashtags || []).join(' ')}</p>
                        </div>
                    {/if}
                    {#if brandData.socialCampaigns.copy.twitter}
                        <div class="bg-white rounded-lg border border-border p-3">
                            <p class="text-[10px] font-medium text-muted mb-1">TWITTER / X</p>
                            <p class="text-xs text-primary">{brandData.socialCampaigns.copy.twitter.tweet}</p>
                        </div>
                    {/if}
                    {#if brandData.socialCampaigns.copy.linkedin}
                        <div class="bg-white rounded-lg border border-border p-3">
                            <p class="text-[10px] font-medium text-muted mb-1">LINKEDIN</p>
                            <p class="text-xs text-primary">{brandData.socialCampaigns.copy.linkedin.post}</p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Color Swatches -->
        {#if brandData.brandDNA?.colors}
            <div>
                <h3 class="text-sm font-semibold text-primary mb-2">
                    Color Palette
                </h3>
                <div class="space-y-1">
                    {#each brandData.brandDNA.colors as color}
                        <div
                            class="flex items-center gap-2 bg-white rounded-lg border border-border px-3 py-2"
                        >
                            <div
                                class="w-6 h-6 rounded"
                                style="background: {color}"
                            ></div>
                            <span class="text-xs text-secondary font-mono"
                                >{color}</span
                            >
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Typography -->
        {#if brandData.brandDNA?.typography}
            <div>
                <h3 class="text-sm font-semibold text-primary mb-2">
                    Typography
                </h3>
                <div class="bg-white rounded-xl border border-border p-3">
                    <p
                        class="text-sm text-primary"
                        style="font-family: {brandData.brandDNA.typography}"
                    >
                        {brandData.brandDNA.typography}
                    </p>
                    <p class="text-[10px] text-muted mt-1">Primary typeface</p>
                </div>
            </div>
        {/if}

        <!-- Empty State -->
        {#if !brandData.name && !brandData.assets}
            <div
                class="flex-1 flex flex-col items-center justify-center text-center py-12"
            >
                <div
                    class="w-10 h-10 rounded-full bg-[#f8f8f8] flex items-center justify-center mb-3"
                >
                    <span class="text-lg text-muted">*</span>
                </div>
                <p class="text-sm text-muted">
                    Assets will populate<br />as we build
                </p>
            </div>
        {/if}
    </div>
</div>
