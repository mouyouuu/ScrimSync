import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { result, score } = body

  if (result && !['win', 'loss'].includes(result)) {
    return NextResponse.json({ error: 'Résultat invalide' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('events')
    .update({ result: result ?? null, score: score?.trim() || null })
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
  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
