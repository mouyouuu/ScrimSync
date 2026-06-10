import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase.from('team_settings').select('*').limit(1).single()
  return NextResponse.json(data ?? {})
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const supabase = createServerClient()

  const { data: existing } = await supabase.from('team_settings').select('id').limit(1).single()

  if (existing?.id) {
    const { data, error } = await supabase
      .from('team_settings')
      .update(body)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase.from('team_settings').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
