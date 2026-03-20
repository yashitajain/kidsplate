import type { User } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function syncCurrentUserProfile(user: User) {
  const supabase = await createServerSupabaseClient()
  const metadata = user.user_metadata ?? {}

  await supabase.from('user_profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    full_name:
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : null,
    avatar_url: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null,
    plan_tier: 'free',
    onboarding_completed: false,
  })
}
