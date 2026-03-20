import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

function isReal(key) {
    return key && !key.startsWith('your_') && key !== '';
}

function getStripe() {
    if (!isReal(env.STRIPE_SECRET_KEY)) return null;
    return new Stripe(env.STRIPE_SECRET_KEY);
}

/** Credit packages */
export const CREDIT_PACKAGES = [
    { id: 'starter', name: 'Starter', credits: 10, price: 999, priceId: 'price_starter' },
    { id: 'pro', name: 'Pro', credits: 50, price: 3999, priceId: 'price_pro' },
    { id: 'unlimited', name: 'Unlimited', credits: 200, price: 9999, priceId: 'price_unlimited' }
];

/** Create Stripe Checkout session */
export async function createCheckout(packageId, userId, origin) {
    const stripe = getStripe();
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) throw new Error('Invalid package');

    if (!stripe) {
        // Mock: return fake session
        return { url: `${origin}/?credits=purchased&package=${packageId}`, mock: true };
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: { name: `${pkg.name} — ${pkg.credits} Credits` },
                unit_amount: pkg.price
            },
            quantity: 1
        }],
        metadata: { userId, packageId, credits: pkg.credits.toString() },
        success_url: `${origin}/?credits=success`,
        cancel_url: `${origin}/?credits=cancelled`
    });

    return { url: session.url, sessionId: session.id };
}

/** Handle Stripe webhook event */
export async function handleWebhook(body, signature) {
    const stripe = getStripe();
    if (!stripe) return { received: true, mock: true };

    const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, credits } = session.metadata;
        // TODO: Add credits to user's account in Supabase
        console.log(`Credits purchased: ${credits} for user ${userId}`);
        return { received: true, userId, credits: parseInt(credits) };
    }

    return { received: true };
}
