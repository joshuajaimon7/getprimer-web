import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'missing')
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service role client (bypasses RLS for webhook updates)
  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const cliToken = session.metadata?.cli_token
      const subId = session.subscription as string

      if (!userId) break

      // Mark user as Pro
      await supabase.from('users').update({ plan: 'pro' }).eq('id', userId)

      // Store subscription record
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId)
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: subId,
          stripe_price_id: sub.items.data[0]?.price.id ?? '',
          status: sub.status,
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        })
      }

      // If this came from CLI, confirm the CLI auth token so terminal gets linked
      if (cliToken && cliToken.length > 0) {
        await supabase
          .from('cli_auth_tokens')
          .update({ status: 'confirmed', user_id: userId, access_token: `primer_pro_${userId}` })
          .eq('token', cliToken)
          .eq('status', 'pending')
      }
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.supabase_user_id
      if (!userId) break

      const isActive = ['active', 'trialing'].includes(sub.status)
      await supabase.from('users').update({ plan: isActive ? 'pro' : 'free' }).eq('id', userId)
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_price_id: sub.items.data[0]?.price.id ?? '',
        status: sub.status,
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
