import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const key = process.env.RIOT_API_KEY
  if (!key) return NextResponse.json({ error: 'RIOT_API_KEY non définie dans Vercel' })

  const res = await fetch(
    'https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Shade%20Freecs/RDS',
    { headers: { 'X-Riot-Token': key }, next: { revalidate: 0 } }
  )

  const text = await res.text()
  let json: unknown
  try { json = JSON.parse(text) } catch { json = text }

  return NextResponse.json({
    key_prefix: key.slice(0, 12) + '...',
    status: res.status,
    response: json,
  })
}
