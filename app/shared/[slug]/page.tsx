import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import SharedMenuClient from './SharedMenuClient'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export default async function SharedMenuPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: menu } = await supabase
    .from('menus')
    .select('*')
    .eq('share_slug', slug)
    .eq('is_public', true)
    .single()

  if (!menu) notFound()

  const { data: items } = await supabase
    .from('menu_items')
    .select('*, food:foods(*)')
    .eq('menu_id', menu.id)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <SharedMenuClient
      menu={menu}
      items={items ?? []}
      currentUserId={user?.id ?? null}
      isOwner={user?.id === menu.user_id}
    />
  )
}
