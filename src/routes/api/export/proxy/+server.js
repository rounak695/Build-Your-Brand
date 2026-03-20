/** Proxy endpoint for fetching remote images to avoid CORS issues during export */
export async function GET({ url }) {
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new Response(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (e) {
        console.error('[export/proxy] Failed to fetch:', e);
        return new Response('Failed to fetch image', { status: 500 });
    }
}
