import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { randomUUID } from 'crypto'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('players')
    .insert({ name: name.trim(), token: randomUUID() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// GET player by token
export async function POST(request: NextRequest) {
  const { token } = await request.json()
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Joueur introuvable' }, { status: 404 })
  }

  return NextResponse.json(data)
}
