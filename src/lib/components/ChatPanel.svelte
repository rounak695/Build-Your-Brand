<script>
    import { onMount, afterUpdate } from "svelte";

    export let messages = [];
    export let step = "IDEA_INPUT";
    export let isLoading = false;
    export let onSendMessage = () => {};
    export let onInspirationSubmit = () => {};
    export let onSelectName = () => {};

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
            if (f.size > 5 * 1024 * 1024) {
                alert("Max 5MB per image");
                continue;
            }
            const reader = new FileReader();
            reader.onload = () => {
                inspirations = [
                    ...inspirations,
                    { type: "image", data: reader.result, name: f.name },
                ];
            };
            reader.readAsDataURL(f);
        }
    }

    function submitInspirations() {
        if (inspirations.length === 0) {
            inspirations = [
                { type: "text", data: "modern minimal professional" },
            ];
        }
        onInspirationSubmit(inspirations);
    }

    const REGEN_LIMITS = { names: 3, moodboards: 2, logos: 3, guidelines: 2, wireframe: 2, socialCampaigns: 3 };
</script>

<div class="w-[380px] flex flex-col h-full border-r border-border bg-panel">
    <div
        class="flex items-center justify-between px-5 py-4 border-b border-border"
    >
        <h2 class="text-base font-semibold text-primary">Workflow</h2>
        <span
            class="px-3 py-1 text-xs font-medium text-white bg-accent rounded-full"
        >
            {step.replace(/_/g, " ")}
        </span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4" id="chat-scroll">
        {#each messages as msg}
            {#if msg.role === "user"}
                <div class="flex justify-end">
                    <div
                        class="bg-white border border-border rounded-xl px-4 py-2.5 max-w-[85%] text-sm text-primary"
                    >
                        {msg.content}
                    </div>
                </div>
            {:else}
                <div class="flex justify-start">
                    <div
                        class="bg-white border border-border rounded-xl px-4 py-3 max-w-[85%]"
                    >
                        <p class="text-xs font-medium text-accent mb-1">
                            AI Brand Architect
                        </p>
                        <p class="text-sm text-primary leading-relaxed">
                            {msg.content}
                        </p>

                        {#if msg.options}
                            <div class="mt-3 space-y-2">
                                {#each msg.options as opt}
                                    <button
                                        class="block w-full text-left px-3 py-2 text-sm border border-border rounded-lg hover:border-accent hover:bg-[#fdf5f5] transition-all"
                                        on:click={() => onSendMessage(opt)}
                                        disabled={isLoading}>{opt}</button
                                    >
                                {/each}
                            </div>
                        {/if}

                        {#if msg.nameOptions}
                            <div class="mt-3 space-y-2">
                                {#each msg.nameOptions.names || [] as name}
                                    <button
                                        class="block w-full text-left px-3 py-2 border border-border rounded-lg hover:border-accent hover:bg-[#fdf5f5] transition-all"
                                        on:click={() => onSelectName(name)}
                                        disabled={isLoading}
                                    >
                                        <span
                                            class="text-sm font-semibold text-primary"
                                            >{name.name}</span
                                        >
                                        <span
                                            class="block text-xs text-secondary mt-0.5"
                                            >{name.tagline}</span
                                        >
                                    </button>
                                {/each}
                            </div>
                        {/if}

                        {#if msg.showInspirationUpload}
                            <div class="mt-3 space-y-2">
                                <label
                                    class="block w-full px-3 py-3 text-center text-sm border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-all"
                                >
                                    Drop images or click to upload
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        class="hidden"
                                        on:change={handleFileUpload}
                                    />
                                </label>

                                <div class="flex gap-2">
                                    <input
                                        type="text"
                                        bind:value={inspireInput}
                                        placeholder="Brand name or URL..."
                                        class="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-accent"
                                        on:keydown={(e) =>
                                            e.key === "Enter" &&
                                            addInspiration()}
                                    />
                                    <button
                                        class="px-3 py-2 text-sm bg-white border border-border rounded-lg hover:border-accent"
                                        on:click={addInspiration}>Add</button
                                    >
                                </div>

                                {#if inspirations.length > 0}
                                    <div class="space-y-1">
                                        {#each inspirations as insp, i}
                                            <div
                                                class="flex items-center justify-between px-3 py-1.5 bg-[#f8f8f8] rounded text-xs"
                                            >
                                                <span class="truncate"
                                                    >{insp.type === "image"
                                                        ? insp.name
                                                        : insp.data}</span
                                                >
                                                <button
                                                    class="ml-2 text-muted hover:text-accent"
                                                    on:click={() =>
                                                        removeInspiration(i)}
                                                    >x</button
                                                >
                                            </div>
                                        {/each}
                                    </div>
                                {/if}

                                <button
                                    class="w-full px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                    on:click={submitInspirations}
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Analyzing..."
                                        : `Analyze ${inspirations.length || "default"} inspiration(s)`}
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        {/each}

        {#if isLoading}
            <div class="flex justify-start">
                <div class="bg-white border border-border rounded-xl px-4 py-3">
                    <div class="flex items-center gap-2 text-sm text-muted">
                        <span class="animate-pulse">*</span> Generating...
                    </div>
                </div>
            </div>
        {/if}
    </div>

    {#if step !== "INSPIRATION_UPLOAD"}
        <div class="px-4 py-3 border-t border-border bg-white">
            <div class="flex gap-2 items-center">
                <input
                    type="text"
                    bind:value={inputValue}
                    on:keydown={handleKeydown}
                    placeholder={step === "IDEA_INPUT"
                        ? "Describe your business idea..."
                        : "Type a message..."}
                    class="flex-1 px-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-accent transition-all"
                    disabled={isLoading}
                />
                <button
                    on:click={send}
                    disabled={isLoading || !inputValue.trim()}
                    class="px-4 py-2.5 text-sm font-medium text-white bg-accent rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                    >Send</button
                >
            </div>
        </div>
    {/if}
</div>
