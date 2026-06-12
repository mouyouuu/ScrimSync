import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

// GET /api/scrims?week_start=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('week_start')

  if (!weekStart) {
    return NextResponse.json({ error: 'week_start requis' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('scrims')
    .select('*')
    .eq('week_start', weekStart)
    .order('day_of_week', { ascending: true })
    .order('start_hour', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/scrims — create a scrim (admin only)
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { week_start, day_of_week, start_hour, opponent_name, opponent_opgg_url, notes, status } = body

  if (!week_start || !day_of_week || !start_hour || !opponent_name || !opponent_opgg_url) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('scrims')
    .insert({
      week_start,
      day_of_week,
      start_hour,
      opponent_name: opponent_name.trim(),
      opponent_opgg_url: opponent_opgg_url.trim(),
      notes: notes?.trim() || null,
      status: status ?? 'confirmed',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify only when confirmed
  if (data.status === 'confirmed') {
    fetch(`${request.nextUrl.origin}/api/push/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '📅 Nouveau scrim !',
        body: `vs ${data.opponent_name}`,
        url: '/',
      }),
    }).catch(() => {})
  }

  return NextResponse.json(data, { status: 201 })
}
