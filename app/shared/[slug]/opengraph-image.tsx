import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function OGImage({ params }: Props) {
  const { slug } = await params

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: menu } = await supabase
    .from('menus')
    .select('title, description, age_group')
    .eq('share_slug', slug)
    .eq('is_public', true)
    .single()

  const title = menu?.title ?? 'Meal Plan'
  const description = menu?.description ?? 'A balanced weekly meal plan'
  const ageGroup = menu?.age_group
    ? menu.age_group === 'mom'
      ? 'Mom'
      : `Ages ${menu.age_group} yrs`
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #fef9f0 0%, #f0faf4 100%)',
          padding: '60px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'auto' }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#3d7a57', letterSpacing: '-0.5px' }}>
            KidsBite
          </span>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
          {ageGroup && (
            <div style={{ display: 'flex' }}>
              <span
                style={{
                  background: '#3d7a57',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {ageGroup}
              </span>
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 30 ? 60 : 72,
              fontWeight: 800,
              color: '#1a1a1a',
              lineHeight: 1.1,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>
          {description && (
            <div style={{ fontSize: 28, color: '#555555', lineHeight: 1.4 }}>
              {description.length > 100 ? description.slice(0, 100) + '…' : description}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 22, color: '#888888' }}>
            Weekly Indian meal planner
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#3d7a57',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '24px',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            View Full Plan
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
