import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET ?week_start=...&player_id=... → { absent: bool }
// GET ?week_start=...              → [{ player_id }]
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const week_start = searchParams.get('week_start')
  const player_id = searchParams.get('player_id')

  if (!week_start) return NextResponse.json({ error: 'week_start requis' }, { status: 400 })

  const supabase = createServerClient()
  const query = supabase.from('player_absences').select('player_id').eq('week_start', week_start)

  if (player_id) {
    const { data } = await query.eq('player_id', player_id).maybeSingle()
    return NextResponse.json({ absent: !!data })
  }

  const { data } = await query
  return NextResponse.json(data ?? [])
}

// POST { player_id, week_start, absent: bool }
export async function POST(request: NextRequest) {
  const { player_id, week_start, absent } = await request.json()
  if (!player_id || !week_start) return NextResponse.json({ error: 'params manquants' }, { status: 400 })

  const supabase = createServerClient()

  if (absent) {
    await supabase
      .from('player_absences')
      .upsert({ player_id, week_start }, { onConflict: 'player_id,week_start' })
    await supabase.from('availability').delete().eq('player_id', player_id).eq('week_start', week_start)
    await supabase.from('availability_submissions').delete().eq('player_id', player_id).eq('week_start', week_start)
  } else {
    await supabase.from('player_absences').delete().eq('player_id', player_id).eq('week_start', week_start)
  }

  return NextResponse.json({ ok: true })
}
