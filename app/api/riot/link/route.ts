import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getTotalLP } from '@/components/lol/RankBadge'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === 'authenticated'
}

async function riotFetch(url: string) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY ?? '' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Riot API ${res.status}: ${url}`)
  return res.json()
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!process.env.RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY manquant' }, { status: 500 })

  const { player_id, game_name, tag_line } = await request.json()
  if (!player_id || !game_name || !tag_line) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const encodedName = encodeURIComponent(game_name)
  const encodedTag  = encodeURIComponent(tag_line)

  // 1. PUUID via account-v1
  const account = await riotFetch(
    `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`
  )

  // 2. Summoner ID via summoner-v4
  const summoner = await riotFetch(
    `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
  )

  // 3. Ranked data via league-v4
  const entries: Array<{ queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }> =
    await riotFetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`)

  const soloQ = entries.find(e => e.queueType === 'RANKED_SOLO_5x5')

  const lpStart = soloQ ? getTotalLP(soloQ.tier, soloQ.rank, soloQ.leaguePoints) : 0

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('players')
    .update({
      riot_game_name: game_name,
      riot_tag_line: tag_line,
      riot_puuid: account.puuid,
      riot_summoner_id: summoner.id,
      riot_tier: soloQ?.tier ?? null,
      riot_rank: soloQ?.rank ?? null,
      riot_lp: soloQ?.leaguePoints ?? null,
      riot_wins: soloQ?.wins ?? null,
      riot_losses: soloQ?.losses ?? null,
      riot_lp_start: lpStart,
      riot_updated_at: new Date().toISOString(),
    })
    .eq('id', player_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { player_id } = await request.json()
  const supabase = createServerClient()
  await supabase
    .from('players')
    .update({
      riot_game_name: null, riot_tag_line: null, riot_puuid: null,
      riot_summoner_id: null, riot_tier: null, riot_rank: null,
      riot_lp: null, riot_wins: null, riot_losses: null,
      riot_lp_start: null, riot_updated_at: null,
    })
    .eq('id', player_id)

  return NextResponse.json({ ok: true })
}
