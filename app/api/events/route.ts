import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, title, event_date, event_time, description, created_by, created_by_name } = body

  if (!type || !['match', 'tournament'].includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
  }
  if (!event_date) {
    return NextResponse.json({ error: 'La date est requise' }, { status: 400 })
  }
  if (!event_time) {
    return NextResponse.json({ error: "L'heure est requise" }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('events')
    .insert({
      type,
      title: title.trim(),
      event_date,
      event_time,
      description: description?.trim() || null,
      created_by: created_by || 'admin',
      created_by_name: created_by_name || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
