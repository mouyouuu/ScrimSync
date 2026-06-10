import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { result, score } = body

  if (result !== 'win' && result !== 'loss') {
    return NextResponse.json({ error: 'result must be win or loss' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('scrims')
    .update({ result, score: score?.trim() || null })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
