'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function PlayerAutoRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('player_token')
    if (token) router.replace(`/player/${token}`)
  }, [router])

  return null
}
