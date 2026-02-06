// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// @ts-ignore
const SUPABASE_URL = Deno.env.get("BASE_SUPABASE_URL")!;
// @ts-ignore
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

// @ts-ignore
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get(
  "STRIPE_WEBHOOK_SIGNING_SECRET"
)!;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// @ts-ignore
import { serveListener } from "https://deno.land/std@0.116.0/http/server.ts";

// @ts-ignore
import Stripe from "npm:stripe@^11.16";

// @ts-ignore
const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// console.log(`HTTP webserver running.  Access it at:  http://localhost:54321/`);
// @ts-ignore
const server = Deno.listen({ port: 54321 });

console.log("Stripe webhook handler is triggered.");

const toDateTime = (secs: number) => {
  var t = new Date(+0); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

const upsertProductRecord = async (product: any) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  const reply = await supabaseAdmin.from("products").upsert(productData);

  if (reply?.error)
    throw new Error(`Product insert/update failed: ${reply?.error.message}`);
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (
  price: any,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData = {
    id: price.id,
    product_id: typeof price.product === "string" ? price.product : "",
    active: price.active,
    description: price.nickname ?? null,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? 0,
  };

  const { error: upsertError } = await supabaseAdmin
    .from("prices")
    .upsert([priceData]);

  if (upsertError?.message.includes("foreign key constraint")) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
    }
  } else if (upsertError) {
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Price inserted/updated: ${price.id}`);
  }
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", product.id);
  if (deletionError)
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  console.log(`Product deleted: ${product.id}`);
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabaseAdmin
    .from("prices")
    .delete()
    .eq("id", price.id);
  if (deletionError)
    throw new Error(`Price deletion failed: ${deletionError.message}`);
  console.log(`Price deleted: ${price.id}`);
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] },
    })
    .eq("id", uuid);
  if (updateError)
    throw new Error(`Customer update failed: ${updateError.message}`);
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (noCustomerError)
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null,
  };

  const { error: upsertError } = await supabaseAdmin
    .from("subscriptions")
    .upsert([subscriptionData]);
  if (upsertError)
    throw new Error(
      `Subscription insert/update failed: ${upsertError.message}`
    );
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};

// This handler will be called for every incoming request.
async function handler(request) {
  const signature = request.headers.get("Stripe-Signature");

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SIGNING_SECRET,
      undefined
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`);
    console.log(err);
    return new Response(err.message, { status: 400 });
  }

  // Secondly, we use this event to query the Stripe API in order to avoid
  // handling any forged event. If available, we use the idempotency key.
  const requestOptions =
    receivedEvent.request && receivedEvent.request.idempotency_key
      ? {
          idempotencyKey: receivedEvent.request.idempotency_key,
        }
      : {};

  let retrievedEvent;
  try {
    retrievedEvent = await stripe.events.retrieve(
      receivedEvent.id,
      requestOptions
    );
    //
    if (retrievedEvent) {
      try {
        switch (retrievedEvent.type) {
          case "product.created":
          case "product.updated":
            await upsertProductRecord(retrievedEvent.data.object);
            break;
          case "price.created":
          case "price.updated":
            await upsertPriceRecord(retrievedEvent.data.object);
            break;
          case "price.deleted":
            await deletePriceRecord(retrievedEvent.data.object);
            break;
          case "product.deleted":
            await deleteProductRecord(retrievedEvent.data.object);
            break;
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = retrievedEvent.data.object;
            await manageSubscriptionStatusChange(
              subscription.id,
              subscription.customer,
              retrievedEvent.type === "customer.subscription.created"
            );
            break;
          case "checkout.session.completed":
            const checkoutSession = retrievedEvent.data.object;
            if (checkoutSession.mode === "subscription") {
              const subscriptionId = checkoutSession.subscription;
              await manageSubscriptionStatusChange(
                subscriptionId,
                checkoutSession.customer,
                true
              );
            }
            break;
          case "payment_intent.payment_failed":
            const paymentIntent = retrievedEvent.data.object;
            console.log(paymentIntent.last_payment_error.message);
            break;
          default:
            console.log("unhandled", retrievedEvent.type);
            console.log("data", retrievedEvent.data.object);
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.log(error);
        return new Response(
          "Webhook handler failed. View your supabase logs.",
          {
            status: 400,
          }
        );
      }
    } else {
      return new Response(`Unsupported event type: ${retrievedEvent.type}`, {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ received: true }));
    //
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }

  // return new Response(JSON.stringify(retrievedEvent), { status: 200 });
}

await serveListener(server, handler);

/* To invoke locally:
  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
*/
