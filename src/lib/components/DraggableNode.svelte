<script>
    import { createEventDispatcher, onMount } from 'svelte';
    
    export let x = 0;
    export let y = 0;
    export let title = "";
    export let width = "auto";
    export let onExport = null;
    
    let isDragging = false;
    let nodeElement;
    let startX = 0;
    let startY = 0;
    let initialX = x;
    let initialY = y;

    const dispatch = createEventDispatcher();

    function handlePointerDown(e) {
        // Prevent infinite canvas panning when clicking the node
        e.stopPropagation();
        
        // Don't drag if clicking buttons, links, or inputs inside the node
        if (e.target.closest('button, a, input, textarea, select')) return;

        // Bring to front logic (optional, would require tracking z-indexes externally)
        dispatch('focus');

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = x;
        initialY = y;
        
        if (nodeElement) nodeElement.setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e) {
        if (!isDragging) return;
        e.stopPropagation();
        
        // Calculate raw delta
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // We must factor in the pan/zoom scale of the infinite canvas.
        // It's tricky to pass scale down unless we use a context, but we can compute it
        // by checking the node's transform matrix or we can just pass scale as a prop.
        // For simplicity, doing raw pixel movements makes dragging slower when zoomed out, 
        // which physically matches standard OS windows. But for literal space tracking, we need scale.
        // We'll rely on the canvas passing down `canvasScale` if needed.
        // Assuming scale = 1 for a moment, or relying on simple delta.
        // Let's expect InfiniteCanvas to pass context or we just use dom scaling trick:
        let scale = 1;
        const canvasContainer = nodeElement?.closest('.will-change-transform');
        if (canvasContainer) {
            const transform = window.getComputedStyle(canvasContainer).getPropertyValue('transform');
            if (transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                scale = matrix.a || 1; 
            }
        }

        x = initialX + (dx / scale);
        y = initialY + (dy / scale);
        
        dispatch('move', { x, y });
    }

    function handlePointerUp(e) {
        if (!isDragging) return;
        e.stopPropagation();
        isDragging = false;
        if (nodeElement) nodeElement.releasePointerCapture(e.pointerId);
    }
</script>

<!-- The floating node card -->
<!-- Use maroon glow on hover (`hover:shadow-primary/20`) to match OBSIDIAN MAROON aesthetics -->
<div 
    bind:this={nodeElement}
    class="absolute origin-top-left transition-shadow duration-300 rounded-2xl bg-surface border border-outline-variant/30 ambient-shadow hover:border-primary-container/50 hover:shadow-2xl hover:shadow-primary/10 {isDragging ? 'shadow-2xl shadow-primary/20 scale-[1.01] z-50 cursor-grabbing' : 'cursor-grab z-10'}"
    style="transform: translate({x}px, {y}px); width: {width};"
    on:pointerdown={handlePointerDown}
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
    on:pointercancel={handlePointerUp}
>
    <!-- Node Header for dragging -->
    {#if title}
        <div class="px-6 py-3 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low rounded-t-2xl pointer-events-none">
            <h3 class="font-label text-xs uppercase tracking-widest text-secondary font-bold">{title}</h3>
            <div class="flex items-center gap-2">
                {#if onExport}
                    <button 
                        class="pointer-events-auto w-7 h-7 rounded-lg bg-surface-container-highest/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-200 cursor-pointer"
                        on:click|stopPropagation={onExport}
                        title="Export assets"
                    >
                        <span class="material-symbols-outlined text-sm text-secondary hover:text-primary">download</span>
                    </button>
                {/if}
                <span class="material-symbols-outlined text-secondary opacity-50 text-sm">drag_indicator</span>
            </div>
        </div>
    {/if}
    
    <!-- Node Content -->
    <div class="cursor-auto">
        <slot />
    </div>
</div>
