import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const key = process.env.RIOT_API_KEY
  if (!key) return NextResponse.json({ error: 'RIOT_API_KEY non définie dans Vercel' })

  const candidates = [
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblems/emblem-gold.png',
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblems/gold.png',
    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests-v2/gold.png',
    'https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/Emblem_Gold.png',
    'https://raw.communitydragon.org/latest/game/assets/ux/components/ranked/art/ranked-emblem-gold.png',
  ]

  const results = await Promise.all(
    candidates.map(async url => {
      try {
        const res = await fetch(url, { method: 'HEAD' })
        return { url, status: res.status, ok: res.ok }
      } catch (e) {
        return { url, status: 0, ok: false, error: String(e) }
      }
    })
  )

  return NextResponse.json(results)
}
