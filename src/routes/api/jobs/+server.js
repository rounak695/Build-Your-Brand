import { json } from '@sveltejs/kit';
import { enqueueJob, getJobStatus } from '$lib/queue.js';

/** POST — Create a new background generation job */
export async function POST({ request }) {
    const { type, payload } = await request.json();
    if (!type) return json({ error: 'Missing job type' }, { status: 400 });

    try {
        const result = await enqueueJob(type, payload);
        return json({ success: true, ...result });
    } catch (e) {
        console.error('Queue error:', e);
        return json({ error: 'Failed to create job' }, { status: 500 });
    }
}

/** GET — Check job status */
export async function GET({ url }) {
    const jobId = url.searchParams.get('id');
    if (!jobId) return json({ error: 'Missing job id' }, { status: 400 });

    try {
        const status = await getJobStatus(jobId);
        return json({ success: true, ...status });
    } catch (e) {
        console.error('Status check error:', e);
        return json({ error: 'Failed to check status' }, { status: 500 });
    }
}
