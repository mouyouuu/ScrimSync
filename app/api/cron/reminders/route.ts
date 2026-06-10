import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import webpush from 'web-push'

function getScrimUTCDate(weekStart: string, dayOfWeek: number, startHour: number): Date {
  const [year, month, day] = weekStart.split('-').map(Number)
  const base = new Date(Date.UTC(year, month - 1, day + dayOfWeek))
  const yr = base.getUTCFullYear()
  const mo = base.getUTCMonth() + 1
  const dy = base.getUTCDate()
  const dateStr = `${yr}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}`

  // Get Paris timezone offset for this specific date (handles DST automatically)
  const noon = new Date(`${dateStr}T12:00:00Z`)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    timeZoneName: 'shortOffset',
  }).formatToParts(noon)
  const tzPart = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+2'
  const offsetHours = parseInt(tzPart.replace('GMT', '')) || 2

  return new Date(Date.UTC(yr, mo - 1, dy, startHour - offsetHours, 0, 0, 0))
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID not configured' }, { status: 500 })
  }

  webpush.setVapidDetails(
    'mailto:admin@scrimsync.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const supabase = createServerClient()
  const now = new Date()

  const { data: scrims } = await supabase
    .from('scrims')
    .select('*')
    .eq('status', 'confirmed')
    .is('result', null)

  if (!scrims?.length) return NextResponse.json({ sent: 0 })

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const scrim of scrims) {
    const scrimDate = getScrimUTCDate(scrim.week_start, scrim.day_of_week, scrim.start_hour)
    const diffMin = (scrimDate.getTime() - now.getTime()) / 60000

    let notification: { title: string; body: string } | null = null

    // 1h avant : fenêtre 45-75 min
    if (diffMin >= 45 && diffMin < 75) {
      notification = {
        title: '⚔️ Scrim dans 1h !',
        body: `vs ${scrim.opponent_name} à ${scrim.start_hour}h`,
      }
    }
    // 24h avant : fenêtre 23h45 - 24h15
    else if (diffMin >= 23 * 60 + 45 && diffMin < 24 * 60 + 15) {
      notification = {
        title: '📅 Scrim demain',
        body: `vs ${scrim.opponent_name} à ${scrim.start_hour}h`,
      }
    }

    if (!notification) continue

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: notification.title, body: notification.body, url: '/' })
        )
        sent++
      } catch {
        // Subscription expirée ou invalide
      }
    }
  }

  return NextResponse.json({ sent, checked: scrims.length })
}
