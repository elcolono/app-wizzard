// @ts-nocheck
import { stripe } from './stripe.ts';

// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const SUPABASE_URL = Deno.env.get('BASE_SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;

// WARNING: The service role key has admin priviliges and should only be used in secure server environments!
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export const createOrRetrieveCustomer = async (authHeader: string) => {
  // Get JWT from auth header
  const jwt = authHeader.replace('Bearer ', '');
  // Get the user object
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(jwt);
  if (!user) throw new Error('No user found for JWT!');

  // Check if the user already has a Stripe customer ID in the Database.
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('stripe_customer_id')
    .eq('id', user?.id);
  console.log(data?.length, data, error);
  if (error) throw error;
  if (data?.length === 1) {
    // Exactly one customer found, return it.
    const customer = data[0].stripe_customer_id;
    console.log(`Found customer id: ${customer}`);
    return customer;
  }
  if (data?.length === 0) {
    // Create customer object in Stripe.
    const customer = await stripe.customers.create({
      'email': user.email,
      'metadata': { uid: user.id },
      'name': 'test_user',
      'address[line1]': '510 Townsend St',
      'address[postal_code]': 98140,
      'address[city]': 'San Francisco',
      'address[state]': 'CA',
      'address[country]': 'US',
    });
    console.log(`New customer "${customer.id}" created for user "${user.id}"`);
    // Insert new customer into DB
    await supabaseAdmin
      .from('customers')
      .insert({ id: user.id, stripe_customer_id: customer.id })
      .throwOnError();
    return customer.id;
  } else throw new Error(`Unexpected count of customer rows: ${data?.length}`);
};
