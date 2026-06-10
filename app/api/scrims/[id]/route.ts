import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

// GET /api/scrims/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  const { data, error } = await supabase.from('scrims').select('*').eq('id', id).single()

  if (error || !data) {
    return NextResponse.json({ error: 'Scrim introuvable' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PUT /api/scrims/[id] — update (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { day_of_week, start_hour, opponent_name, opponent_opgg_url, notes } = body

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('scrims')
    .update({
      day_of_week,
      start_hour,
      opponent_name: opponent_name?.trim(),
      opponent_opgg_url: opponent_opgg_url?.trim(),
      notes: notes?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/scrims/[id] — delete (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createServerClient()
  const { error } = await supabase.from('scrims').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
