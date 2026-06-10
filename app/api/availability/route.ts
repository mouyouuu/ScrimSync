import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET /api/availability?week_start=YYYY-MM-DD&player_id=xxx (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start')
  const playerId = searchParams.get('player_id')

  if (!weekStart) {
    return NextResponse.json({ error: 'week_start requis' }, { status: 400 })
  }

  const supabase = createServerClient()
  let query = supabase
    .from('availability')
    .select('*')
    .eq('week_start', weekStart)

  if (playerId) {
    query = query.eq('player_id', playerId)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/availability — save player availabilities for a week
export async function POST(request: NextRequest) {
  const { player_id, week_start, slots } = await request.json()

  if (!player_id || !week_start) {
    return NextResponse.json({ error: 'player_id et week_start requis' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Verify player exists
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('id')
    .eq('id', player_id)
    .single()

  if (playerError || !player) {
    return NextResponse.json({ error: 'Joueur introuvable' }, { status: 404 })
  }

  // Delete existing availability for this week
  await supabase
    .from('availability')
    .delete()
    .eq('player_id', player_id)
    .eq('week_start', week_start)

  // Insert new slots if any
  if (slots && slots.length > 0) {
    const rows = slots.map(({ day_of_week, start_hour }: { day_of_week: number; start_hour: number }) => ({
      player_id,
      week_start,
      day_of_week,
      start_hour,
    }))

    const { error: insertError } = await supabase.from('availability').insert(rows)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  // Upsert submission record
  await supabase.from('availability_submissions').upsert(
    { player_id, week_start, submitted_at: new Date().toISOString() },
    { onConflict: 'player_id,week_start' }
  )

  return NextResponse.json({ success: true })
}

// GET submissions for a week
export async function PATCH(request: NextRequest) {
  const { week_start } = await request.json()
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('availability_submissions')
    .select('*')
    .eq('week_start', week_start)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
