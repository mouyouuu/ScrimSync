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
  const [dragY, setDragY] = useState(0)
  const dragYRef = useRef(0)
  const startYRef = useRef(0)
  const isDraggingRef = useRef(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
      const t = setTimeout(() => { setMounted(false); setDragY(0); dragYRef.current = 0 }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  // Drag to dismiss
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return

    function onTouchStart(e: TouchEvent) {
      startYRef.current = e.touches[0].clientY
      isDraggingRef.current = true
    }
    function onTouchMove(e: TouchEvent) {
      if (!isDraggingRef.current) return
      const dy = Math.max(0, e.touches[0].clientY - startYRef.current)
      dragYRef.current = dy
      setDragY(dy)
    }
    function onTouchEnd() {
      isDraggingRef.current = false
      if (dragYRef.current > 120) {
        onClose()
      } else {
        setDragY(0)
        dragYRef.current = 0
      }
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true })
    sheet.addEventListener('touchmove', onTouchMove, { passive: true })
    sheet.addEventListener('touchend', onTouchEnd)
    return () => {
      sheet.removeEventListener('touchstart', onTouchStart)
      sheet.removeEventListener('touchmove', onTouchMove)
      sheet.removeEventListener('touchend', onTouchEnd)
    }
  }, [onClose])

  if (!mounted) return null

  const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4',
        'transition-colors duration-300',
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      )}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={sheetRef}
        className={cn(
          'w-full bg-bg-surface border border-border-subtle shadow-xl',
          'rounded-t-2xl sm:rounded-2xl',
          'transition-transform duration-300 ease-out',
          sizes[size],
          visible ? 'translate-y-0' : 'translate-y-full sm:translate-y-4'
        )}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        role="dialog"
        aria-modal="true"
      >
        {/* Poignée de glissement (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
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
