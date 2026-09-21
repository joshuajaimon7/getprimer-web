import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'missing')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'pro') {
    return NextResponse.json({ error: 'Already on Pro' }, { status: 400 })
  }

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const body = await request.json().catch(() => ({}))
  const cliToken = body.cli_token ?? null  // optional: link CLI machine after payment

  // POST /api/stripe/checkout — creates $5/month Pro subscription session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}&cli_token=${cliToken ?? ''}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?cancelled=1`,
    metadata: { supabase_user_id: user.id, cli_token: cliToken ?? '' },
    subscription_data: { metadata: { supabase_user_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}
