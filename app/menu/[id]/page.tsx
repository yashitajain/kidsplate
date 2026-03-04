import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MenuEditor from './MenuEditor'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function MenuPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: menu } = await supabase.from('menus').select('*').eq('id', id).single()
  if (!menu) notFound()
  if (menu.user_id !== user.id) redirect('/dashboard')

  const { data: items } = await supabase
    .from('menu_items')
    .select('*, food:foods(*)')
    .eq('menu_id', id)

  return <MenuEditor initialMenu={menu} initialItems={items ?? []} />
}
