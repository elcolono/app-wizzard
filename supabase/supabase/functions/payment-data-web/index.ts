// @ts-ignore
import { serve } from 'https://deno.land/std@0.132.0/http/server.ts';
import { stripe } from '../_utils/stripe.ts';
import { createOrRetrieveCustomer } from '../_utils/supabase.ts';
import { corsHeaders } from '../_shard/cors.ts';
console.log('payment-data-web handler up and running!');
serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // Get the authorization header from the request.
    // When you invoke the function via the client library it will automatically pass the authenticated user's JWT.
    const authHeader = req.headers.get('Authorization')!;
    const customer = await createOrRetrieveCustomer(authHeader);
    const body = await req.json();
    const { id: priceId, success_url, cancel_url } = body;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customer,
      mode: 'subscription',
      success_url,
      cancel_url,
    });

    const res = { redirect: true, url: session.url };

    return new Response(JSON.stringify(res), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

    // const response = new Response(null, {
    //   status: 303,
    //   headers: {
    //     Location: session.url,
    //   },
    // });
    // return response;
  } catch (error) {
    return new Response(JSON.stringify(error), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
