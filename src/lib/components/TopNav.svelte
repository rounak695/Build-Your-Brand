<script>
    export let step = "IDEA_INPUT";
    export let brandName = "";
</script>

<nav class="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-obsidian/80 backdrop-blur-xl">
    <div class="text-xl font-bold tracking-tight text-white font-headline">BYB Brand Lab</div>
    <div class="flex items-center gap-8">
        <div class="flex gap-6 items-center">
            {#if step !== "IDEA_INPUT"}
                <span class="label-style font-medium text-primary/80 text-[12px]">
                    {brandName || "New Project"}
                </span>
                <div class="h-4 w-px bg-outline-variant/20"></div>
            {/if}
            <button class="label-style font-medium text-secondary hover:text-white transition-colors duration-300 text-[12px]">
                Saved
            </button>
            <button class="label-style font-medium text-secondary hover:text-white transition-colors duration-300 text-[12px]">
                Share
            </button>
        </div>
        <div class="h-8 w-px bg-surface opacity-50"></div>
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center border border-outline-variant/20">
                <span class="material-symbols-outlined text-secondary text-sm">person</span>
            </div>
        </div>
    </div>
</nav>
