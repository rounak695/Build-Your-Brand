import { json } from '@sveltejs/kit';
import { handleWebhook } from '$lib/stripe.js';

export async function POST({ request }) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    try {
        const result = await handleWebhook(body, signature);
        return json(result);
    } catch (e) {
        console.error('Webhook error:', e);
        return json({ error: 'Webhook failed' }, { status: 400 });
    }
}
