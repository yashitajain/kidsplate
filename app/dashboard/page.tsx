import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <DashboardClient initialMenus={menus ?? []} user={user} />
}
