import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';

function isReal(key) {
    return key && !key.startsWith('your_') && key !== '';
}

function getRedis() {
    if (!isReal(env.UPSTASH_REDIS_URL)) return null;
    return new Redis({
        url: env.UPSTASH_REDIS_URL,
        token: env.UPSTASH_REDIS_TOKEN
    });
}

/** Enqueue a generation job */
export async function enqueueJob(type, payload) {
    const redis = getRedis();
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (!redis) {
        // Mock: return immediately
        return { jobId, status: 'completed', mock: true };
    }

    const job = { id: jobId, type, payload, status: 'pending', createdAt: Date.now() };
    await redis.set(`job:${jobId}`, JSON.stringify(job), { ex: 3600 }); // 1hr TTL
    await redis.lpush('job_queue', jobId);
    return { jobId, status: 'pending' };
}

/** Get job status */
export async function getJobStatus(jobId) {
    const redis = getRedis();
    if (!redis) return { status: 'completed', mock: true };

    const raw = await redis.get(`job:${jobId}`);
    if (!raw) return { status: 'not_found' };
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

/** Update job status */
export async function updateJob(jobId, updates) {
    const redis = getRedis();
    if (!redis) return;

    const raw = await redis.get(`job:${jobId}`);
    if (!raw) return;
    const job = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const updated = { ...job, ...updates, updatedAt: Date.now() };
    await redis.set(`job:${jobId}`, JSON.stringify(updated), { ex: 3600 });
}

/** Dequeue the next pending job */
export async function dequeueJob() {
    const redis = getRedis();
    if (!redis) return null;

    const jobId = await redis.rpop('job_queue');
    if (!jobId) return null;
    return getJobStatus(jobId);
}
