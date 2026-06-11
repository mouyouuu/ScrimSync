import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const TIER_BASE: Record<string, number> = {
  IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200,
  PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400,
  MASTER: 2800, GRANDMASTER: 3200, CHALLENGER: 3600,
}
const RANK_LP: Record<string, number> = { IV: 0, III: 100, II: 200, I: 300 }

function getTotalLP(tier: string, rank: string | null | undefined, lp: number): number {
  return (TIER_BASE[tier] ?? 0) + ((rank && RANK_LP[rank] != null) ? RANK_LP[rank] : 0) + lp
}

function getCurrentMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

async function riotFetch(url: string) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY ?? '' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Riot ${res.status}`)
  return res.json()
}

async function refreshPlayer(player: { id: string; riot_puuid: string; riot_lp_start: number | null; riot_week_start: string | null }) {
  const supabase = createServerClient()
  const currentMonday = getCurrentMonday()

  const entries: Array<{ queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }> =
    await riotFetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${player.riot_puuid}`)

  const soloQ = entries.find(e => e.queueType === 'RANKED_SOLO_5x5')
  const newTier = soloQ?.tier ?? 'UNRANKED'
  const newLP = soloQ ? getTotalLP(soloQ.tier, soloQ.rank, soloQ.leaguePoints) : 0

  // Reset LP start if new week
  const isNewWeek = !player.riot_week_start || player.riot_week_start < currentMonday
  const lpStart = isNewWeek ? newLP : (player.riot_lp_start ?? newLP)

  await supabase.from('players').update({
    riot_tier: newTier,
    riot_rank: soloQ?.rank ?? null,
    riot_lp: soloQ?.leaguePoints ?? null,
    riot_wins: soloQ?.wins ?? null,
    riot_losses: soloQ?.losses ?? null,
    riot_lp_start: lpStart,
    riot_week_start: isNewWeek ? currentMonday : player.riot_week_start,
    riot_updated_at: new Date().toISOString(),
  }).eq('id', player.id)
}

export async function POST(request: NextRequest) {
  if (!process.env.RIOT_API_KEY) return NextResponse.json({ error: 'RIOT_API_KEY manquant' }, { status: 500 })

  const body = await request.json().catch(() => ({}))

  // Refresh d'un seul joueur via son token (pas besoin d'auth admin)
  if (body.player_token) {
    const supabase = createServerClient()
    const { data: player } = await supabase
      .from('players')
      .select('id, riot_puuid, riot_lp_start, riot_week_start')
      .eq('token', body.player_token)
      .single()

    if (!player?.riot_puuid) return NextResponse.json({ error: 'Compte LoL non lié' }, { status: 404 })

    try {
      await refreshPlayer(player)
      const { data: updated } = await supabase.from('players').select('*').eq('id', player.id).single()
      return NextResponse.json(updated)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur'
      return NextResponse.json({ error: msg }, { status: 502 })
    }
  }

  // Refresh global — admin ou cron
  const authHeader = request.headers.get('authorization')
  const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isAdminCookie = request.cookies.get('admin_session')?.value === 'authenticated'
  if (!isCron && !isAdminCookie) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = createServerClient()
  const { data: players } = await supabase
    .from('players')
    .select('id, riot_puuid, riot_lp_start, riot_week_start')
    .not('riot_puuid', 'is', null)

  if (!players?.length) return NextResponse.json({ updated: 0 })

  let updated = 0
  for (const player of players) {
    try {
      await refreshPlayer(player)
      updated++
      await new Promise(r => setTimeout(r, 100))
    } catch {
      // continuer si un joueur échoue
    }
  }

  return NextResponse.json({ updated })
}
