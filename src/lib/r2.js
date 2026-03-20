import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

function isReal(key) {
    return key && !key.startsWith('your_') && key !== '';
}

function getClient() {
    if (!isReal(env.R2_ACCESS_KEY_ID)) return null;
    return new S3Client({
        region: 'auto',
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: env.R2_ACCESS_KEY_ID,
            secretAccessKey: env.R2_SECRET_ACCESS_KEY
        }
    });
}

/** Upload image buffer to R2, returns public URL */
export async function uploadImage(key, buffer, contentType = 'image/png') {
    const client = getClient();
    if (!client) return null;

    await client.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }));

    // The previous default URL was wrong. Public buckets use pub-[id].r2.dev format if a custom domain isn't set.
    const publicUrl = env.R2_PUBLIC_URL || `https://pub-499044b617844c708b677ef4bd9e5117.r2.dev`;
    return `${publicUrl}/${key}`;
}

/** Download image from a URL and upload to R2 */
export async function persistImage(imageUrl, key) {
    const client = getClient();
    if (!client) return imageUrl; // Return original URL if R2 not configured

    try {
        const response = await fetch(imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || 'image/png';
        const r2Url = await uploadImage(key, buffer, contentType);
        return r2Url || imageUrl;
    } catch (e) {
        console.error('R2 upload error:', e);
        return imageUrl;
    }
}
