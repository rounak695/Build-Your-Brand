<script>
    import { onMount } from "svelte";

    export let messages = [];
    export let step = "IDEA_INPUT";
    export let isLoading = false;
    export let onSendMessage = () => {};
    export let onInspirationSubmit = () => {};

    let inputValue = "";
    let inspirations = [];
    let inspireInput = "";

    function send() {
        if (!inputValue.trim() || isLoading) return;
        onSendMessage(inputValue.trim());
        inputValue = "";
    }

    function handleKeydown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    function addInspiration() {
        if (!inspireInput.trim()) return;
        const type = inspireInput.startsWith("http") ? "url" : "brand";
        inspirations = [...inspirations, { type, data: inspireInput.trim() }];
        inspireInput = "";
    }

    function removeInspiration(i) {
        inspirations = inspirations.filter((_, idx) => idx !== i);
    }

    async function handleFileUpload(e) {
        const files = Array.from(e.target.files || []);
        for (const f of files) {
            if (f.size > 5 * 1024 * 1024) { alert("Max 5MB per image"); continue; }
            const reader = new FileReader();
            reader.onload = () => {
                inspirations = [...inspirations, { type: "image", data: reader.result, name: f.name }];
            };
            reader.readAsDataURL(f);
        }
    }

    function submitInspirations() {
        if (inspirations.length === 0) {
            inspirations = [{ type: "text", data: "modern minimal professional" }];
        }
        onInspirationSubmit(inspirations);
    }

    // Check if we're in inspiration upload mode
    $: showInspirationUI = step === "INSPIRATION_UPLOAD" ||
        messages.some(m => m.showInspirationUpload);
</script>

<section class="flex-1 flex flex-col items-center justify-center px-6 max-w-6xl mx-auto w-full py-20">
    <!-- Hero Header -->
    <div class="text-center mb-16 space-y-4">
        <h1 class="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter max-w-3xl mx-auto leading-[0.9]">
            Start Your <span class="gradient-text">Project</span>
        </h1>
        <p class="text-secondary font-body text-lg max-w-xl mx-auto opacity-80">
            Define your vision. Our neural lab will architect your identity from a single spark.
        </p>
    </div>

    <!-- Main Input Console -->
    <div class="w-full max-w-4xl space-y-8">
        <!-- The Input Card -->
        {#if !showInspirationUI}
            <div class="relative group">
                <div class="absolute -inset-1 bg-primary-container opacity-10 blur-xl group-focus-within:opacity-25 transition duration-1000"></div>
                <div class="relative bg-surface p-1 rounded-2xl">
                    <div class="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden ghost-border">
                        <textarea
                            bind:value={inputValue}
                            on:keydown={handleKeydown}
                            class="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white p-8 text-xl md:text-2xl font-body placeholder:text-surface-bright min-h-[200px] resize-none"
                            placeholder="Tell me your idea..."
                            disabled={isLoading}
                        ></textarea>
                        <div class="flex items-center justify-between p-6 border-t border-outline-variant/5 bg-surface/50">
                            <div class="flex items-center gap-4">
                                <button class="flex items-center gap-2 text-secondary hover:text-white transition-colors">
                                    <span class="material-symbols-outlined">attach_file</span>
                                    <span class="label-style-sm font-bold">Attach context</span>
                                </button>
                            </div>
                            <button
                                on:click={send}
                                disabled={isLoading || !inputValue.trim()}
                                class="primary-gradient px-8 py-3 rounded-lg label-style font-bold text-[11px] text-on-primary-fixed hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isLoading ? "Analyzing..." : "Initiate Concept"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Inspiration Upload Mode -->
        {#if showInspirationUI}
            <!-- AI Message -->
            {#each messages.filter(m => m.role === "ai").slice(-1) as msg}
                <div class="bg-surface rounded-2xl p-6 ghost-border mb-6">
                    <p class="label-style-sm text-primary font-bold mb-2">AI Brand Architect</p>
                    <p class="text-on-surface text-sm leading-relaxed">{msg.content}</p>
                </div>
            {/each}

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Drag & Drop Inspiration -->
                <label class="md:col-span-7 bg-surface-container-low rounded-2xl p-8 ghost-border hover:border-primary/20 transition-all group flex flex-col justify-center items-center text-center gap-4 cursor-pointer relative overflow-hidden min-h-[200px]">
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-primary to-transparent transition-opacity"></div>
                    <div class="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined" style="font-variation-settings: 'wght' 300;">cloud_upload</span>
                    </div>
                    <div>
                        <p class="font-headline font-bold text-white uppercase tracking-wider text-xs">Drag & drop inspiration</p>
                        <p class="text-secondary text-xs mt-1 font-body">Moodboards, logos, or raw sketches</p>
                    </div>
                    <input type="file" accept="image/*" multiple class="hidden" on:change={handleFileUpload} />
                </label>

                <!-- Text/URL Inspiration Input -->
                <div class="md:col-span-5 bg-surface-container-low rounded-2xl ghost-border overflow-hidden flex flex-col">
                    <div class="p-6 space-y-4">
                        <span class="label-style font-bold text-white text-[11px]">Add Inspiration</span>
                        <div class="flex gap-2">
                            <input
                                type="text"
                                bind:value={inspireInput}
                                placeholder="Brand name or URL..."
                                class="flex-1 bg-surface-container-highest border-b border-outline-variant/20 text-white text-xs py-2 px-3 focus:border-primary transition-colors focus:ring-0 focus:outline-none rounded-none"
                                on:keydown={(e) => e.key === "Enter" && addInspiration()}
                            />
                            <button
                                class="px-4 py-2 text-xs text-primary border border-primary-container/40 rounded-lg hover:bg-primary-container/10 transition-all label-style font-bold"
                                on:click={addInspiration}
                            >Add</button>
                        </div>

                        {#if inspirations.length > 0}
                            <div class="space-y-2 mt-3">
                                {#each inspirations as insp, i}
                                    <div class="flex items-center justify-between px-3 py-2 bg-surface rounded-lg ghost-border text-xs">
                                        <span class="text-on-surface truncate max-w-[180px]">
                                            {insp.type === "image" ? insp.name : insp.data}
                                        </span>
                                        <button class="text-secondary hover:text-primary ml-2 transition-colors" on:click={() => removeInspiration(i)}>
                                            <span class="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <div class="p-6 pt-0 mt-auto">
                        <button
                            class="w-full primary-gradient px-6 py-3 rounded-lg label-style font-bold text-[11px] text-on-primary-fixed hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50"
                            on:click={submitInspirations}
                            disabled={isLoading}
                        >
                            {isLoading ? "Analyzing..." : `Analyze ${inspirations.length || "default"} inspiration(s)`}
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Loading State -->
        {#if isLoading}
            <div class="flex justify-center mt-8">
                <div class="bg-surface rounded-2xl px-8 py-4 ghost-border flex items-center gap-3">
                    <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span class="text-secondary text-sm font-body">Neural lab processing...</span>
                </div>
            </div>
        {/if}
    </div>
</section>
