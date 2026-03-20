<script>
    import { onMount, tick } from "svelte";
    
    export let data;
    export let form;

    // Silence Svelte IDE unused warnings while still preventing runtime 'unknown prop' warnings
    $: _data = data;
    $: _form = form;
    
    import TopNav from "$lib/components/TopNav.svelte";
    import SideNav from "$lib/components/SideNav.svelte";
    import IdeaPanel from "$lib/components/IdeaPanel.svelte";
    import BrandDNAPanel from "$lib/components/BrandDNAPanel.svelte";
    import MoodboardPanel from "$lib/components/MoodboardPanel.svelte";
    import AssetsWorkspace from "$lib/components/AssetsWorkspace.svelte";
    import InfiniteCanvas from "$lib/components/InfiniteCanvas.svelte";
    import DraggableNode from "$lib/components/DraggableNode.svelte";
    import { downloadSVG, downloadPNG, downloadBrandPackage, downloadAllAsZip } from "$lib/exportService.js";

    // --- State ---
    let step = "IDEA_INPUT"; // IDEA_INPUT, INSPIRATION_UPLOAD, NAME_SELECTION, MOODBOARD_SELECTION, DONE
    $: isInfiniteCanvasMode = step !== "IDEA_INPUT" && step !== "INSPIRATION_UPLOAD";
    let messages = [];
    let isLoading = false;
    let error = null;
    let canvasRef;

    let brandData = {
        idea: "",
        inspirations: [],
        brandDNA: null,
        nameOptions: null,
        name: "",
        tagline: "",
        moodboards: null,
        selectedMoodboard: null,
        logos: null,
        guidelines: null,
        wireframe: null,
        socialCampaigns: null,
        brandPackage: null,
        regenCounts: { names: 0, moodboards: 0, logos: 0, guidelines: 0, wireframe: 0, socialCampaigns: 0 }
    };

    // --- Handlers ---
    async function handleSendMessage(text) {
        brandData.idea = text;
        messages = [...messages, { role: "user", content: text }];
        isLoading = true;
        error = null;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    step: "IDEA_INPUT",
                    message: text,
                    brandData: null,
                }),
            });
            if (!response.ok) throw new Error("API Request Failed");

            const result = await response.json();
            messages = [...messages, { role: "ai", content: result.message, showInspirationUpload: true }];
            step = "INSPIRATION_UPLOAD";
        } catch (err) {
            console.error(err);
            error = "Failed to process idea. Please try again.";
            messages = messages.slice(0, -1);
        } finally {
            isLoading = false;
        }
    }

    async function handleInspirationSubmit(inspirations) {
        brandData.inspirations = inspirations;
        isLoading = true;
        error = null;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    step: "INSPIRATION_UPLOAD",
                    brandData,
                })
            });

            if (!response.ok) throw new Error("API request failed");
            const result = await response.json();

            brandData.brandDNA = result.brandDNA;
            brandData.nameOptions = result.names;
            brandData.brandId = result.brandId;
            brandData.regenCounts.names = 0;
            step = "NAME_SELECTION";
            tick().then(() => canvasRef?.panTo(700, 0));
        } catch (err) {
            console.error(err);
            error = "Neural lab analysis failed. Please retry.";
        } finally {
            isLoading = false;
        }
    }

    async function handleSelectName(nameObj) {
        brandData.name = nameObj.name;
        brandData.tagline = nameObj.tagline;
        isLoading = true;
        error = null;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    step: "NAME_SELECTION",
                    message: brandData.name,
                    brandData,
                })
            });

            if (!response.ok) throw new Error("API request failed");
            const result = await response.json();

            brandData.moodboards = result.moodboards;
            brandData.regenCounts.moodboards = 0;
            step = "MOODBOARD_SELECTION";
            tick().then(() => canvasRef?.panTo(1800, 0));
        } catch(err) {
            console.error(err);
            error = "Failed to synthesize moodboards. Retry recommended.";
        } finally {
            isLoading = false;
        }
    }

    async function handleSelectMoodboard(moodboard) {
        brandData.selectedMoodboard = moodboard;
        isLoading = true;
        error = null;

        try {
             const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    step: "MOODBOARD_SELECTION",
                    brandData,
                })
            });

            if (!response.ok) throw new Error("API request failed");
            const result = await response.json();

            brandData.logos = result.logos;
            brandData.regenCounts.logos = 0;
            brandData.guidelines = result.guidelines;
            brandData.regenCounts.guidelines = 0;
            brandData.wireframe = result.wireframe;
            brandData.regenCounts.wireframe = 0;
            brandData.socialCampaigns = result.socialCampaigns;
            brandData.regenCounts.socialCampaigns = 0;
            brandData.brandPackage = result.brandPackage;
            step = "DONE";
            tick().then(() => canvasRef?.panTo(2900, 0));
        } catch(err) {
            console.error(err);
            error = "Asset generation sequence failed. Re-initiating may be required.";
        } finally {
            isLoading = false;
        }
    }

    async function handleRegenerate(type) {
        isLoading = true;
        error = null;
        try {
            const response = await fetch("/api/regenerate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    brandDNA: brandData.brandDNA,
                    brandName: brandData.name,
                    brandId: brandData.brandId
                })
            });

            if (!response.ok) throw new Error("API request failed");
            const result = await response.json();

            if (type === "names") {
                 brandData.nameOptions = result.result;
                 brandData.regenCounts.names = (brandData.regenCounts.names || 0) + 1;
            } else if (type === "moodboards") {
                 brandData.moodboards = result.result;
                 brandData.regenCounts.moodboards = (brandData.regenCounts.moodboards || 0) + 1;
            } else if (type === "logos") {
                 brandData.logos = result.result;
                 brandData.regenCounts.logos = (brandData.regenCounts.logos || 0) + 1;
                 updateBrandPackage();
            } else if (type === "guidelines") {
                 brandData.guidelines = result.result;
                 brandData.regenCounts.guidelines = (brandData.regenCounts.guidelines || 0) + 1;
                 updateBrandPackage();
            } else if (type === "wireframe") {
                 brandData.wireframe = result.result;
                 brandData.regenCounts.wireframe = (brandData.regenCounts.wireframe || 0) + 1;
                 updateBrandPackage();
            } else if (type === "socialCampaigns") {
                 brandData.socialCampaigns = result.result;
                 brandData.regenCounts.socialCampaigns = (brandData.regenCounts.socialCampaigns || 0) + 1;
                 updateBrandPackage();
            }
        } catch(err) {
             console.error(err);
             error = `Failed to regenerate ${type}.`;
        } finally {
            isLoading = false;
        }
    }

    function updateBrandPackage() {
        brandData.brandPackage = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            brandName: brandData.name,
            tagline: brandData.tagline,
            dna: brandData.brandDNA,
            moodboard: brandData.selectedMoodboard,
            logos: brandData.logos,
            guidelines: brandData.guidelines,
            wireframe: brandData.wireframe,
            socialCampaigns: brandData.socialCampaigns
        };
    }
</script>

<div class="min-h-screen bg-obsidian text-on-surface font-body overflow-hidden">
    <!-- Top Navigation -->
    <TopNav {step} brandName={brandData.name} />

    <div class="flex pt-16 h-screen">
        <!-- Sidebar Navigation (Hidden on IDEA_INPUT or small screens mapped via component) -->
        <SideNav {step} />

        <!-- Main Content Area -->
        <main class="flex-1 w-full lg:ml-64 relative">
            <!-- Background Enhancements -->
            <div class="fixed top-20 right-0 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50"></div>
            <div class="fixed bottom-0 left-64 w-[600px] h-[400px] bg-surface-bright/5 rounded-full blur-[100px] pointer-events-none"></div>

            {#if error}
                <div class="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-error-container text-error px-6 py-3 rounded-lg flex items-center gap-3 shadow-2xl border border-error/20 animate-fade-in-down">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    <span class="text-[11px] font-bold uppercase tracking-wider">{error}</span>
                    <button on:click={() => error = null} class="ml-4 hover:opacity-70"><span class="material-symbols-outlined text-sm">close</span></button>
                </div>
            {/if}

            {#if !isInfiniteCanvasMode}
                <!-- Static Ideation View -->
                <div class="w-full h-full flex items-center justify-center p-6 relative z-10">
                    <div class="w-full max-w-[600px] h-[750px] bg-surface-container-low/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar border border-outline-variant/20 relative">
                        <!-- Node Header to mimic the DraggableNode aesthetic statically -->
                        <div class="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container/80 sticky top-0 z-10">
                            <h3 class="font-label text-xs uppercase tracking-widest text-primary font-bold">Brainstorm & Strategy</h3>
                            <span class="material-symbols-outlined text-secondary opacity-50 text-sm">psychology</span>
                        </div>
                        <div class="p-6">
                            <IdeaPanel
                                {step}
                                {messages}
                                {isLoading}
                                onSendMessage={handleSendMessage}
                                onInspirationSubmit={handleInspirationSubmit}
                            />
                        </div>
                    </div>
                </div>
            {:else}
                <!-- Infinite Canvas Workspace View -->
                <InfiniteCanvas bind:this={canvasRef}>

                <!-- Brand DNA & Names Node -->
                {#if brandData.brandDNA}
                    <DraggableNode title="Identity Synthesis" x={650} y={0} width="1100px" onExport={() => downloadBrandPackage(brandData.brandPackage, brandData.selectedName)}>
                        <div class="h-[750px] overflow-y-auto custom-scrollbar bg-surface/50 rounded-b-2xl p-6">
                            <BrandDNAPanel
                                {brandData}
                                {isLoading}
                                onSelectName={handleSelectName}
                                onRegenerate={handleRegenerate}
                            />
                        </div>
                    </DraggableNode>
                {/if}

                <!-- Moodboard Node -->
                {#if brandData.moodboards}
                    <DraggableNode title="Visual Direction" x={1800} y={0} width="1050px" onExport={() => {
                        const mb = brandData.moodboards?.find(m => m.imageUrl);
                        if (mb) downloadPNG(mb.imageUrl, `${brandData.selectedName || 'brand'}-moodboard.png`);
                    }}>
                        <div class="h-[750px] overflow-y-auto custom-scrollbar bg-surface/50 rounded-b-2xl p-6">
                            <MoodboardPanel
                                {brandData}
                                {isLoading}
                                onSelectMoodboard={handleSelectMoodboard}
                                onRegenerate={handleRegenerate}
                            />
                        </div>
                    </DraggableNode>
                {/if}

                <!-- Assets Workspace Node -->
                {#if brandData.brandPackage}
                    <DraggableNode title="Brand Assets Studio" x={2900} y={0} width="1200px" onExport={() => downloadAllAsZip(brandData, brandData.selectedName || 'brand')}>
                        <div class="h-[800px] overflow-y-auto custom-scrollbar bg-surface/50 rounded-b-2xl p-6">
                            <AssetsWorkspace
                                {step}
                                {brandData}
                                {isLoading}
                                onRegenerate={handleRegenerate}
                            />
                        </div>
                    </DraggableNode>
                {/if}
            </InfiniteCanvas>
            {/if}


        </main>
    </div>
</div>

<style>
    @keyframes fade-in-down {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    .animate-fade-in-down {
        animation: fade-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>
