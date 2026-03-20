<script>
    export let brandData = {};
    export let onSelectMoodboard = () => {};
    export let onRegenerate = () => {};
    export let isLoading = false;

    const LIMITS = { moodboards: 2 };
</script>

<div class="h-[calc(100vh-64px)] overflow-auto canvas-grid relative custom-scrollbar">
    <!-- Canvas Controls Header -->
    <div class="sticky top-0 z-30 px-12 py-8 flex justify-between items-end">
        <div>
            <h1 class="text-4xl font-headline font-extrabold text-white tracking-tighter mb-2">Moodboard Exploration</h1>
            <p class="text-secondary text-sm max-w-md">Visualizing the intersection of high-fidelity aesthetics and functional precision.</p>
        </div>
        <div class="flex gap-3">
            <button
                class="label-style-sm text-primary font-bold hover:underline disabled:opacity-50"
                on:click={() => onRegenerate("moodboards")}
                disabled={brandData.regenCounts?.moodboards >= LIMITS.moodboards || isLoading}
            >Regenerate ({LIMITS.moodboards - (brandData.regenCounts?.moodboards || 0)} left)</button>
        </div>
    </div>

    <!-- Horizontal Moodboards Container -->
    {#if brandData.moodboards}
        <div class="flex gap-12 px-12 pb-32 overflow-x-auto hide-scrollbar pt-4">
            {#each brandData.moodboards as mb, i}
                <button
                    class="moodboard-card flex-shrink-0 w-[420px] group transition-all duration-500 cursor-pointer text-left
                        {brandData.selectedMoodboard?.name === mb.name ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-80 hover:scale-100 hover:opacity-100'}"
                    on:click={() => onSelectMoodboard(mb)}
                    disabled={isLoading}
                >
                    <div class="relative rounded-2xl overflow-hidden bg-surface-container border-2 transition-all duration-500 mb-6
                        {brandData.selectedMoodboard?.name === mb.name ? 'border-primary-container maroon-glow-strong' : 'border-transparent hover:border-primary-container/50'}">

                        <!-- Image or Color Collage -->
                        {#if mb.imageUrl}
                            <div class="h-[400px] w-full">
                                <img src={mb.imageUrl} alt={mb.name} class="w-full h-full object-cover {brandData.selectedMoodboard?.name !== mb.name ? 'grayscale hover:grayscale-0' : ''} transition-all duration-700" />
                            </div>
                        {:else if mb.colors}
                            <div class="h-[400px] w-full grid grid-cols-2 gap-1 p-1">
                                {#each mb.colors.slice(0, 4) as c, ci}
                                    <div class="w-full h-full {ci === 0 ? 'rounded-tl-xl' : ''} {ci === 1 ? 'rounded-tr-xl' : ''} {ci >= 2 ? 'rounded-b-xl' : ''}" style="background: {c}"></div>
                                {/each}
                            </div>
                        {:else}
                            <div class="h-[400px] w-full bg-surface flex items-center justify-center">
                                <span class="material-symbols-outlined text-4xl text-primary/20">image</span>
                            </div>
                        {/if}

                        <!-- Color Strip -->
                        {#if mb.colors}
                            <div class="flex h-12 w-full">
                                {#each mb.colors as c}
                                    <div class="flex-1" style="background: {c}"></div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <!-- Moodboard Info -->
                    <div class="space-y-4 px-2">
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-headline font-bold text-white tracking-tight">{mb.name}</h3>
                            {#if brandData.selectedMoodboard?.name === mb.name}
                                <span class="text-[10px] text-primary border border-primary/30 px-2 py-0.5 rounded font-label uppercase tracking-widest">Selected</span>
                            {/if}
                        </div>
                        {#if mb.keywords}
                            <div class="flex gap-2 flex-wrap">
                                {#each (Array.isArray(mb.keywords) ? mb.keywords : []).slice(0, 3) as kw}
                                    <span class="text-[10px] bg-surface-container-high text-secondary px-3 py-1 rounded-full font-label uppercase tracking-tighter">{kw}</span>
                                {/each}
                            </div>
                        {/if}
                        {#if mb.typography}
                            <div class="pt-2">
                                <p class="text-[28px] font-headline font-extrabold text-white leading-none">{mb.typography}</p>
                                <p class="text-xs text-secondary mt-1 font-body">Aa Bb Cc Dd Ee Ff Gg 0123</p>
                            </div>
                        {/if}
                    </div>
                </button>
            {/each}
        </div>
    {:else}
        <div class="flex items-center justify-center h-64">
            <div class="text-center">
                <div class="w-2 h-2 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
                <p class="text-secondary text-sm">Generating moodboards...</p>
            </div>
        </div>
    {/if}
</div>
