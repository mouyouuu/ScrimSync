import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

async function riotFetch(url: string) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY ?? '' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Riot ${res.status}`)
  return res.json()
}

export async function POST(request: NextRequest) {
  if (!process.env.RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY manquant' }, { status: 500 })

  const authHeader = request.headers.get('authorization')
  const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isAdminCookie = request.cookies.get('admin_session')?.value === 'authenticated'
  if (!isCron && !isAdminCookie) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = createServerClient()
  const { data: players } = await supabase
    .from('players')
    .select('id, riot_summoner_id, riot_lp_start')
    .not('riot_summoner_id', 'is', null)

  if (!players?.length) return NextResponse.json({ updated: 0 })

  let updated = 0
  for (const player of players) {
    try {
      const entries: Array<{ queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }> =
        await riotFetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${player.riot_summoner_id}`)

      const soloQ = entries.find(e => e.queueType === 'RANKED_SOLO_5x5')
      if (!soloQ) continue

      await supabase.from('players').update({
        riot_tier: soloQ.tier,
        riot_rank: soloQ.rank,
        riot_lp: soloQ.leaguePoints,
        riot_wins: soloQ.wins,
        riot_losses: soloQ.losses,
        riot_updated_at: new Date().toISOString(),
      }).eq('id', player.id)

      updated++
      // Respecter les rate limits Riot (20 req/s)
      await new Promise(r => setTimeout(r, 100))
    } catch {
      // Continuer si un joueur échoue
    }
  }

  return NextResponse.json({ updated })
}
