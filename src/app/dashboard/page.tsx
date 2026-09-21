import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check plan
  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro'

  // Fetch projects if pro
  let projects: any[] = []
  if (isPro) {
    const { data } = await supabase
      .from('projects')
      .select('*, context_snapshots(context, created_at)')
      .eq('user_id', user.id)
      .order('last_synced_at', { ascending: false })
    projects = data ?? []
  }

  return <DashboardClient user={user} isPro={isPro} projects={projects} />
}
