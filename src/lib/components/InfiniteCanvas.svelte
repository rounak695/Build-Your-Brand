<script>
    import { onMount } from 'svelte';
    
    let container;
    let width = 0;
    let height = 0;
    
    let x = 0;
    let y = 0;
    let scale = 1;
    
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    
    const MIN_SCALE = 0.05;
    const MAX_SCALE = 5;

    function handleWheel(e) {
        // Only zoom if ctrl/meta is pressed AND it's a pointer event (touchpad), OR just always zoom
        // Infinite canvas usually implies wheel = zoom
        e.preventDefault();
        const zoomSensitivity = 0.0015;
        const delta = e.deltaY * -zoomSensitivity;
        zoom(delta, e.clientX - container.getBoundingClientRect().left, e.clientY - container.getBoundingClientRect().top);
    }

    function zoom(delta, mouseX, mouseY) {
        let newScale = scale * Math.exp(delta);
        newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
        
        const relX = (mouseX - x) / scale;
        const relY = (mouseY - y) / scale;
        
        x = mouseX - relX * newScale;
        y = mouseY - relY * newScale;
        scale = newScale;
    }

    function handlePointerDown(e) {
        // Can pan with middle mouse button, or clicking directly on the canvas background
        const isBg = e.target === container || e.target.classList.contains('canvas-bg');
        if (isBg || e.button === 1 || e.button === 2) {
            e.preventDefault();
            isPanning = true;
            startX = e.clientX - x;
            startY = e.clientY - y;
            container.setPointerCapture(e.pointerId);
            document.body.style.userSelect = 'none';
        }
    }

    function handlePointerMove(e) {
        if (!isPanning) return;
        x = e.clientX - startX;
        y = e.clientY - startY;
    }

    function handlePointerUp(e) {
        if (!isPanning) return;
        isPanning = false;
        container.releasePointerCapture(e.pointerId);
        document.body.style.userSelect = 'auto';
    }
    
    export function centerView() {
        panTo(0, 0);
    }

    export function panTo(targetX, targetY) {
        // targetX and targetY are the canvas coordinates we want mapped to the center of the screen
        scale = 1;
        x = (width / 2) - targetX;
        y = (height / 2) - targetY;
    }
    
    onMount(() => {
        centerView();
        
        // Handle window resize to keep it centered initially or just update dims
        const observer = new ResizeObserver(() => {
            if (width === 0) {
                centerView(); // first meaningful render
            }
        });
        observer.observe(container);
        return () => observer.disconnect();
    });
</script>

<div 
    bind:this={container}
    bind:clientWidth={width}
    bind:clientHeight={height}
    class="relative w-full h-full overflow-hidden bg-obsidian canvas-bg"
    on:wheel|nonpassive={handleWheel}
    on:pointerdown={handlePointerDown}
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
    on:pointercancel={handlePointerUp}
    on:contextmenu|preventDefault
    style="cursor: {isPanning ? 'grabbing' : 'grab'}; touch-action: none;"
>
    <!-- Background Grid -->
    <div 
        class="absolute inset-0 pointer-events-none opacity-20 canvas-bg"
        style="
            background-image: radial-gradient(circle, #E5E2E1 1px, transparent 1px);
            background-size: {40 * scale}px {40 * scale}px;
            background-position: {x}px {y}px;
        "
    ></div>

    <!-- Transform Container -->
    <div 
        class="absolute origin-top-left will-change-transform"
        style="transform: translate({x}px, {y}px) scale({scale});"
    >
        <!-- Nodes are placed at absolute (0,0) based coordinates inside here -->
        <slot />
    </div>
    
    <!-- Controls (Mini-map / Zoom) -->
    <div class="absolute bottom-8 right-8 flex flex-col items-end gap-4 z-50">
        <!-- Minimap Placeholder representing a 5000x3000 virtual space -->
        <div class="w-48 h-32 bg-surface-container-high/80 backdrop-blur border border-outline-variant/30 rounded-lg relative overflow-hidden ghost-border shadow-2xl transition-all hover:border-primary/30 cursor-pointer" on:click={centerView}>
            <div class="absolute inset-0 bg-[radial-gradient(circle,#E5E2E1_1px,transparent_1px)] bg-[size:10px_10px] opacity-10 pointer-events-none"></div>
            
            <!-- Viewport indication box -->
            <div class="absolute border border-primary/50 bg-primary/10 rounded transition-all duration-300 pointer-events-none"
                 style="
                    width: {Math.min(100, (width / 5000) * 100 / scale)}%; 
                    height: {Math.min(100, (height / 3000) * 100 / scale)}%; 
                    left: {50 - ((x - width/2) / 5000 * 100 / scale)}%; 
                    top: {50 - ((y - height/2) / 3000 * 100 / scale)}%;
                    transform: translate(-50%, -50%);
                 "
            ></div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span class="text-[10px] font-label text-secondary uppercase tracking-widest bg-obsidian/80 px-2 py-1 rounded">Navigator</span>
            </div>
        </div>
        
        <!-- Zoom Controls -->
        <div class="flex items-center gap-2 bg-surface-container-high/80 backdrop-blur p-2 rounded-full border border-outline-variant/30 ghost-border shadow-xl">
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-bright text-secondary hover:text-white transition-colors" on:click|stopPropagation={() => zoom(-0.2, width/2, height/2)}>
                <span class="material-symbols-outlined text-sm">remove</span>
            </button>
            <span class="text-xs font-label font-bold text-white w-12 text-center select-none">{Math.round(scale * 100)}%</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-bright text-secondary hover:text-white transition-colors" on:click|stopPropagation={() => zoom(0.2, width/2, height/2)}>
                <span class="material-symbols-outlined text-sm">add</span>
            </button>
            <div class="w-px h-4 bg-outline-variant/50 mx-1"></div>
            <button class="px-3 py-1.5 flex items-center gap-1 rounded-full hover:bg-surface-bright text-secondary hover:text-white transition-colors" on:click|stopPropagation={centerView}>
                <span class="material-symbols-outlined text-sm">center_focus_strong</span>
                <span class="text-[10px] font-label uppercase tracking-wider font-bold">Center</span>
            </button>
        </div>
    </div>
</div>
