import { json } from '@sveltejs/kit';
import { createCheckout, CREDIT_PACKAGES } from '$lib/stripe.js';

export async function POST({ request, url }) {
    const { packageId, userId } = await request.json();
    if (!packageId) return json({ error: 'Missing packageId' }, { status: 400 });

    try {
        const origin = url.origin;
        const result = await createCheckout(packageId, userId || 'anonymous', origin);
        return json({ success: true, ...result });
    } catch (e) {
        console.error('Checkout error:', e);
        return json({ error: e.message || 'Failed to create checkout' }, { status: 500 });
    }
}

export async function GET() {
    return json({ packages: CREDIT_PACKAGES });
}
