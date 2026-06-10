'use client'

import { useRef, useState, useEffect, ReactNode, useCallback } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

const THRESHOLD = 65

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const pullYRef = useRef(0)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const refreshingRef = useRef(false)

  const doRefresh = useCallback(async () => {
    refreshingRef.current = true
    setRefreshing(true)
    setPullY(THRESHOLD)
    pullYRef.current = THRESHOLD
    try {
      await onRefresh()
    } finally {
      refreshingRef.current = false
      setRefreshing(false)
      setPullY(0)
      pullYRef.current = 0
    }
  }, [onRefresh])

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 5 || refreshingRef.current) return
      if ((e.target as Element).closest?.('[data-no-pull]')) return
      startYRef.current = e.touches[0].clientY
      isPullingRef.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!isPullingRef.current || refreshingRef.current) return
      const dy = e.touches[0].clientY - startYRef.current
      if (dy <= 0) { isPullingRef.current = false; return }
      const clamped = Math.min(dy * 0.45, THRESHOLD + 15)
      pullYRef.current = clamped
      setPullY(clamped)
    }

    function onTouchEnd() {
      if (!isPullingRef.current) return
      isPullingRef.current = false
      if (pullYRef.current >= THRESHOLD) {
        doRefresh()
      } else {
        setPullY(0)
        pullYRef.current = 0
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [doRefresh])

  const progress = Math.min(pullY / THRESHOLD, 1)

  return (
    <>
      {/* Indicateur */}
      <div
        className="fixed top-14 left-0 right-0 flex justify-center z-40 pointer-events-none"
        style={{
          transform: `translateY(${pullY > 0 ? pullY - 20 : -40}px)`,
          transition: pullY === 0 ? 'transform 0.3s ease' : 'none',
          opacity: progress,
        }}
      >
        <div className={cn(
          'h-8 w-8 rounded-full border-2 border-accent bg-bg-surface shadow-md flex items-center justify-center',
          refreshing && 'animate-spin border-t-transparent'
        )}>
          {!refreshing && (
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ transform: `rotate(${progress * 180}deg)`, transition: 'none' }}
            >
              <path d="M7 2v3M7 2L5 4M7 2l2 2M7 12V9M7 12l-2-2M7 12l2-2" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div>{children}</div>
    </>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
