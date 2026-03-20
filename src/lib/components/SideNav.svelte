<script>
    export let step = "IDEA_INPUT";

    const steps = [
        { id: "IDEA_INPUT", label: "Idea", icon: "lightbulb", includes: ["IDEA_INPUT", "INSPIRATION_UPLOAD"] },
        { id: "NAME_SELECTION", label: "Brand DNA", icon: "fingerprint", includes: ["NAME_SELECTION"] },
        { id: "MOODBOARD_SELECTION", label: "Moodboards", icon: "wb_sunny", includes: ["MOODBOARD_SELECTION"] },
        { id: "DONE", label: "Assets", icon: "layers", includes: ["DONE"] },
    ];

    function isActive(s, currentStep) {
        return s.includes.includes(currentStep);
    }

    function isPast(s, currentStep) {
        const stepOrder = ["IDEA_INPUT", "INSPIRATION_UPLOAD", "NAME_SELECTION", "MOODBOARD_SELECTION", "DONE"];
        const currentIdx = stepOrder.indexOf(currentStep);
        const stepIdx = Math.max(...s.includes.map(inc => stepOrder.indexOf(inc)));
        return stepIdx < currentIdx;
    }
</script>

<aside class="fixed left-0 top-16 h-[calc(100vh-64px)] flex-col py-12 gap-8 bg-obsidian w-64 z-40 hidden lg:flex">
    <div class="px-8 mb-4">
        <h2 class="font-headline font-bold text-white text-lg tracking-tight">
            {#if step === "IDEA_INPUT" || step === "INSPIRATION_UPLOAD"}
                New Project
            {:else}
                Project Alpha
            {/if}
        </h2>
        <p class="label-style-sm text-secondary opacity-60 mt-1">Brand Strategy</p>
    </div>

    <nav class="flex flex-col gap-1">
        {#each steps as s}
            <a
                href="#{s.id}"
                class="flex items-center gap-4 py-3 pl-4 transition-all duration-300 translate-x-1"
                class:text-white={isActive(s, step)}
                class:border-l-2={isActive(s, step)}
                class:border-primary-container={isActive(s, step)}
                class:text-secondary={!isActive(s, step)}
                class:opacity-60={!isActive(s, step) && !isPast(s, step)}
                class:opacity-80={isPast(s, step) && !isActive(s, step)}
                on:click|preventDefault
            >
                <span
                    class="material-symbols-outlined text-[18px]"
                    class:filled={isActive(s, step)}
                >{s.icon}</span>
                <span class="label-style text-[11px]">{s.label}</span>
            </a>
        {/each}
    </nav>

    <div class="mt-auto px-8 py-6 opacity-20">
        <div class="h-px w-full bg-surface"></div>
    </div>
</aside>
