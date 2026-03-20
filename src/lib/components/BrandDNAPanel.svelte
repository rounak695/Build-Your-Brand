<script>
    export let brandData = {};
    export let onSelectName = () => {};
    export let onRegenerate = () => {};
    export let isLoading = false;

    const LIMITS = { names: 3 };
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
</script>

<div class="max-w-6xl mx-auto px-8 pb-24">
    <header class="mb-12">
        <h1 class="text-4xl md:text-5xl font-extrabold font-headline text-white mb-2 tracking-tight">Identity Synthesis</h1>
        <p class="text-secondary text-lg max-w-2xl">Refining the core essence through algorithmic generation and strategic curation.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Brand DNA Panel -->
        <section class="lg:col-span-5 flex flex-col gap-6">
            <div class="bg-surface p-8 rounded-xl ghost-border ambient-shadow relative overflow-hidden group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-container/10 transition-colors"></div>

                <div class="flex items-center gap-3 mb-8">
                    <span class="material-symbols-outlined text-primary filled">fingerprint</span>
                    <h2 class="font-headline font-bold text-lg uppercase tracking-widest text-white">Brand DNA</h2>
                </div>

                {#if brandData.brandDNA}
                    <div class="space-y-8">
                        <!-- Personality Tags -->
                        {#if brandData.brandDNA.personality || brandData.brandDNA.visual_style}
                            <div>
                                <h3 class="block font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-4">Personality</h3>
                                <div class="flex flex-wrap gap-2">
                                    {#each (brandData.brandDNA.personality || brandData.brandDNA.visual_style || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4) as tag}
                                        <span class="px-3 py-1 bg-primary-container/20 border border-primary-container/30 text-primary-fixed text-[11px] font-medium rounded-full uppercase tracking-wider">{tag}</span>
                                    {/each}
                                </div>
                            </div>
                        {/if}

                        <!-- Tone & Audience Grid -->
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <h3 class="block font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-3">Tone of Voice</h3>
                                <p class="text-on-surface-variant text-sm leading-relaxed font-light">{brandData.brandDNA.voice_tone || brandData.brandDNA.tone_of_voice || 'Refined'}</p>
                            </div>
                            <div>
                                <h3 class="block font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-3">Target Audience</h3>
                                <p class="text-on-surface-variant text-sm leading-relaxed font-light">{brandData.brandDNA.target_audience || 'Professionals'}</p>
                            </div>
                        </div>

                        <!-- Visual Direction -->
                        {#if brandData.brandDNA.visual_direction || brandData.brandDNA.visual_style}
                            <div>
                                <h3 class="block font-label text-[10px] uppercase tracking-[0.2em] text-secondary mb-3">Visual Direction</h3>
                                <div class="p-4 bg-surface-container-lowest rounded-lg ghost-border">
                                    <p class="text-on-surface text-sm italic">"{brandData.brandDNA.visual_direction || brandData.brandDNA.visual_style}"</p>
                                </div>
                            </div>
                        {/if}

                        <!-- Colors -->
                        {#if brandData.brandDNA.colors}
                            <div class="flex gap-1.5">
                                {#each brandData.brandDNA.colors as color}
                                    <div class="w-10 h-10 rounded-lg ghost-border" style="background: {color}" title={color}></div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="text-center py-8">
                        <p class="text-secondary text-sm opacity-60">DNA will be synthesized from your idea...</p>
                    </div>
                {/if}
            </div>
        </section>

        <!-- Right: Name Suggestions -->
        <section class="lg:col-span-7">
            {#if brandData.nameOptions?.names}
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary filled">auto_awesome</span>
                        <h2 class="font-headline font-bold text-lg uppercase tracking-widest text-white">Name Suggestions</h2>
                    </div>
                    <button
                        class="label-style-sm text-primary font-bold hover:underline disabled:opacity-50"
                        on:click={() => onRegenerate("names")}
                        disabled={brandData.regenCounts?.names >= LIMITS.names || isLoading}
                    >Regenerate All</button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each brandData.nameOptions.names as name, i}
                        <button
                            class="relative group cursor-pointer text-left transition-all"
                            on:click={() => onSelectName(name)}
                            disabled={isLoading}
                        >
                            <div class="bg-surface p-6 rounded-xl ghost-border hover:border-primary-container/50 transition-all duration-300">
                                <div class="flex justify-between items-start mb-8">
                                    <span class="text-[10px] font-bold text-secondary tracking-tighter bg-surface-container-highest px-2 py-0.5 rounded">{labels[i] || ''}</span>
                                    <span class="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">radio_button_unchecked</span>
                                </div>
                                <h3 class="text-3xl font-headline font-extrabold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">{name.name}</h3>
                                <p class="text-secondary text-xs uppercase tracking-[0.1em]">{name.tagline || ''}</p>
                            </div>
                        </button>
                    {/each}
                </div>

                <!-- Regenerate Helper -->
                <div class="mt-8 p-6 bg-surface-container-low rounded-xl ghost-border flex items-center justify-between group">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-obsidian flex items-center justify-center ghost-border group-hover:border-primary-container/30 transition-all">
                            <span class="material-symbols-outlined text-primary">psychology</span>
                        </div>
                        <div>
                            <h4 class="text-white font-bold text-sm">Need more precision?</h4>
                            <p class="text-secondary text-xs">Adjust your DNA keywords to narrow the focus.</p>
                        </div>
                    </div>
                    <button
                        class="px-6 py-2 bg-primary-container/10 border border-primary-container/40 text-primary-fixed text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary-container/20 transition-all disabled:opacity-50"
                        on:click={() => onRegenerate("names")}
                        disabled={brandData.regenCounts?.names >= LIMITS.names || isLoading}
                    >Regenerate</button>
                </div>
            {:else}
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <span class="material-symbols-outlined text-4xl text-primary/30 mb-4">auto_awesome</span>
                        <p class="text-secondary text-sm">Names will be generated after DNA synthesis...</p>
                    </div>
                </div>
            {/if}
        </section>
    </div>
</div>
