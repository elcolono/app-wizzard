// @ts-ignore
import { serve } from 'https://deno.land/std@0.132.0/http/server.ts';
import { stripe } from '../_utils/stripe.ts';
import { supabaseAdmin } from '../_utils/supabase.ts';
import { createOrRetrieveCustomer } from '../_utils/supabase.ts';
import { corsHeaders } from '../_shard/cors.ts';

console.log('payment-data handler up and running!');
serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // Get the authorization header from the request.
    // When you invoke the function via the client library it will automatically pass the authenticated user's JWT.
    const authHeader = req.headers.get('Authorization')!;
    const body = await req.json();
    const { priceId } = body;
    const { data: productPlanData, error } = await supabaseAdmin
      .from('prices')
      .select(
        `
        unit_amount,currency,
        product:product_id (
          description
        )
      `
      )
      .filter('id', 'eq', priceId);

    if (error) throw error;
    if (!productPlanData || productPlanData.length === 0) {
      throw new Error('No product plan found');
    }
    const item = productPlanData[0];

    // Retrieve the logged in user's Stripe customer ID or create a new customer object for them.
    // See ../_utils/supabase.ts for the implementation.
    const customer = await createOrRetrieveCustomer(authHeader);
    // console.log(customer, "customer");

    // Create an ephermeralKey so that the Stripe SDK can fetch the customer's stored payment methods.
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer },
      { apiVersion: '2020-08-27' }
    );

    // Create a PaymentIntent so that the SDK can charge the logged in customer.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: item.unit_amount,
      currency: item.currency,
      customer: customer,
      description: item.product.description,
    });

    // Return the customer details as well as teh Stripe publishable key which we have set in our secrets.
    const res = {
      // @ts-ignore
      stripe_pk: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer,
    };
    return new Response(JSON.stringify(res), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
