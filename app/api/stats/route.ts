import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('scrims')
    .select('result, opponent_name, week_start, score')
    .not('result', 'is', null)
    .order('week_start', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const wins = data.filter(s => s.result === 'win').length
  const losses = data.filter(s => s.result === 'loss').length
  return NextResponse.json({ wins, losses, total: data.length, scrims: data })
}
