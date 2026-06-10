import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('players')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const supabase = createServerClient()
  const { error } = await supabase.from('players').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
