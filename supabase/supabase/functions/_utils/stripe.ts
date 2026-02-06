// @ts-nocheck
// esm.sh is used to compile stripe-node to be compatible with ES modules.
import Stripe from 'https://esm.sh/stripe@15.10.0?target=deno&deno-std=0.132.0&no-check';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;

export const stripe = Stripe(STRIPE_SECRET_KEY, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-08-01',
})!;
