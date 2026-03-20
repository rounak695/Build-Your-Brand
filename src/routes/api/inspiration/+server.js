import { json } from '@sveltejs/kit';
import { analyzeInspiration } from '$lib/ai/inspirationAnalyzer.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST({ request }) {
    try {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            // Handle image upload
            const formData = await request.formData();
            const files = formData.getAll('files');
            const sources = [];

            for (const file of files) {
                // Validation: file type
                if (!ALLOWED_TYPES.includes(file.type)) {
                    return json({ error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF` }, { status: 400 });
                }
                // Validation: file size
                if (file.size > MAX_FILE_SIZE) {
                    return json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 5MB` }, { status: 400 });
                }

                const buffer = await file.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                sources.push({ type: 'image', data: `data:${file.type};base64,${base64}` });
            }

            const analyses = await analyzeInspiration(sources);
            return json({ success: true, analyses });
        }

        // Handle URL or brand name input
        const { type, value } = await request.json();

        if (type === 'url') {
            const analyses = await analyzeInspiration([{ type: 'url', data: value }]);
            return json({ success: true, analyses });
        }

        if (type === 'brand') {
            const analyses = await analyzeInspiration([{ type: 'text', data: value }]);
            return json({ success: true, analyses });
        }

        return json({ error: 'Invalid inspiration type' }, { status: 400 });
    } catch (e) {
        console.error('Inspiration API error:', e);
        return json({ error: 'Failed to analyze inspiration' }, { status: 500 });
    }
}
