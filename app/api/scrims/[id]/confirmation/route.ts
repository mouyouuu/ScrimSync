import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()

  const [{ data: confirmations }, { count }] = await Promise.all([
    supabase.from('scrim_confirmations').select('player_id, status').eq('scrim_id', id),
    supabase.from('players').select('id', { count: 'exact', head: true }).neq('role', 'staff'),
  ])

  return NextResponse.json({
    confirmations: confirmations ?? [],
    total_players: count ?? 5,
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { player_id, status } = await request.json()

  if (!player_id || !status) return NextResponse.json({ error: 'params manquants' }, { status: 400 })

  const supabase = createServerClient()
  await supabase.from('scrim_confirmations').upsert(
    { scrim_id: id, player_id, status },
    { onConflict: 'scrim_id,player_id' }
  )

  return NextResponse.json({ ok: true })
}
