'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const dragYRef = useRef(0)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (open) {
      setMounted(true)
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handle = handleRef.current
    const sheet = sheetRef.current
    const overlay = overlayRef.current
    if (!handle || !sheet || !overlay) return

    function setSheetY(y: number, animated: boolean) {
      sheet!.style.transition = animated
        ? 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)'
        : 'none'
      sheet!.style.transform = `translateY(${y}px)`
    }

    function setOverlayOpacity(ratio: number) {
      // ratio 0 = plein, 1 = transparent
      overlay!.style.background = `rgba(0,0,0,${0.6 * (1 - ratio * 0.8)})`
    }

    function onTouchStart(e: TouchEvent) {
      isDraggingRef.current = true
      startYRef.current = e.touches[0].clientY
      dragYRef.current = 0
      setSheetY(0, false)
    }

    function onTouchMove(e: TouchEvent) {
      if (!isDraggingRef.current) return
      e.preventDefault()
      const dy = Math.max(0, e.touches[0].clientY - startYRef.current)
      dragYRef.current = dy
      // Manipulation DOM directe — zéro re-render React
      setSheetY(dy, false)
      // Feedback sur l'overlay proportionnel au glissement
      const ratio = Math.min(dy / 300, 1)
      setOverlayOpacity(ratio)
    }

    function onTouchEnd() {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      const dy = dragYRef.current

      if (dy > 110) {
        // Dismiss : animer vers le bas puis appeler onClose
        setSheetY(window.innerHeight, true)
        overlay!.style.transition = 'background 280ms ease-out'
        overlay!.style.background = 'rgba(0,0,0,0)'
        setTimeout(() => onCloseRef.current(), 280)
      } else {
        // Snap back
        setSheetY(0, true)
        overlay!.style.transition = 'background 200ms ease-out'
        overlay!.style.background = 'rgba(0,0,0,0.6)'
      }
    }

    handle.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      handle.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [mounted])

  if (!mounted) return null

  const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }

  return (
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4',
        'backdrop-blur-sm transition-[background] duration-300',
        visible ? 'bg-black/60' : 'bg-transparent pointer-events-none'
      )}
      onClick={e => { if (e.target === e.currentTarget) onCloseRef.current() }}
    >
      <div
        ref={sheetRef}
        className={cn(
          'w-full bg-bg-surface border border-white/[0.07] shadow-glass',
          'rounded-t-3xl sm:rounded-3xl',
          'transition-transform duration-300 ease-out',
          sizes[size],
          visible ? 'translate-y-0' : 'translate-y-full sm:translate-y-4'
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Poignée — zone de drag (mobile) */}
        <div
          ref={handleRef}
          className="flex justify-center pt-3 pb-2 sm:hidden touch-none select-none"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={() => onCloseRef.current()}
            className="rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[80vh] pb-safe">{children}</div>
      </div>
    </div>
  )
}
