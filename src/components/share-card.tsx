'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Download } from 'lucide-react'
import { type Goal } from '@/lib/store'
import { hapticLight, hapticMedium } from '@/lib/haptic'

function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

interface ShareCardProps {
  goal: Goal
  saved: number
  progress: number
  onClose: () => void
}

export function ShareCardOverlay({ goal, saved, progress, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const neonColor = goal.color || '#00f0ff'
  const isCompleted = progress >= 100

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = 600
    const H = 400
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#12121e')
    bgGrad.addColorStop(0.5, '#16162a')
    bgGrad.addColorStop(1, '#1a1a30')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // Subtle grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    // Glow circle top-left
    const glowGrad = ctx.createRadialGradient(80, 80, 0, 80, 80, 200)
    glowGrad.addColorStop(0, neonColor + '15')
    glowGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, 300, 300)

    // Glow circle bottom-right
    const glow2 = ctx.createRadialGradient(520, 320, 0, 520, 320, 180)
    glow2.addColorStop(0, '#b44aff10')
    glow2.addColorStop(1, 'transparent')
    ctx.fillStyle = glow2
    ctx.fillRect(320, 200, 280, 200)

    // LOCKIN header
    ctx.font = 'bold 14px Inter, system-ui, sans-serif'
    ctx.fillStyle = neonColor
    ctx.textAlign = 'left'
    ctx.fillText('LOCKIN', 32, 42)

    ctx.font = '9px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillText('ЗАКРЫВАТОР ЦЕЛИ', 110, 42)

    // Divider line
    ctx.strokeStyle = neonColor + '15'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(32, 56)
    ctx.lineTo(W - 32, 56)
    ctx.stroke()

    // Circular progress (center-left)
    const cx = 160
    const cy = 210
    const r = 70

    // Track circle
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 8
    ctx.stroke()

    // Progress arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (Math.PI * 2 * Math.min(progress, 100)) / 100
    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = neonColor
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()

    // Glow on progress arc
    ctx.shadowColor = neonColor
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = neonColor + '60'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.shadowBlur = 0

    // Center percentage
    ctx.font = 'bold 36px Inter, system-ui, sans-serif'
    ctx.fillStyle = neonColor
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(progress)}%`, cx, cy + 5)

    ctx.font = 'bold 10px Inter, system-ui, sans-serif'
    ctx.fillStyle = isCompleted ? neonColor : 'rgba(255,255,255,0.35)'
    ctx.fillText(isCompleted ? 'ЦЕЛЬ ЗАКРЫТА' : 'ПРОГРЕСС', cx, cy + 28)

    // Right side: goal info
    const rx = 310
    ctx.textAlign = 'left'

    // Goal title
    ctx.font = 'bold 22px Inter, system-ui, sans-serif'
    ctx.fillStyle = neonColor
    const titleText = goal.title.length > 18 ? goal.title.slice(0, 17) + '...' : goal.title
    ctx.fillText(titleText, rx, 100)

    // Status badge
    if (isCompleted) {
      ctx.font = 'bold 11px Inter, system-ui, sans-serif'
      ctx.fillStyle = '#12121e'
      const badgeX = rx
      const badgeY = 112
      const badgeW = ctx.measureText('ЗАКРЫТА').width + 16
      ctx.fillStyle = neonColor
      roundRect(ctx, badgeX, badgeY, badgeW, 22, 6)
      ctx.fill()
      ctx.fillStyle = '#12121e'
      ctx.fillText('ЗАКРЫТА', badgeX + 8, badgeY + 15)
    }

    // Stats
    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText('НАКОПЛЕНО', rx, 170)

    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = neonColor
    ctx.fillText(`${formatNumber(saved)} ₽`, rx, 200)

    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillText(`из ${formatNumber(goal.targetAmount)} ₽`, rx, 220)

    // Entries count
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText('ЗАПИСЕЙ', rx, 260)
    ctx.font = 'bold 18px monospace'
    ctx.fillStyle = neonColor
    ctx.fillText(`${goal.entries.length}`, rx, 285)

    // Bottom branding
    ctx.strokeStyle = neonColor + '10'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(32, H - 40)
    ctx.lineTo(W - 32, H - 40)
    ctx.stroke()

    ctx.font = 'bold 11px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.textAlign = 'center'
    ctx.fillText('LOCKIN — Закрыватор цели', W / 2, H - 16)

    // Border
    ctx.strokeStyle = neonColor + '20'
    ctx.lineWidth = 2
    roundRect(ctx, 1, 1, W - 2, H - 2, 16)
    ctx.stroke()
  }, [goal, saved, progress, neonColor, isCompleted])

  // Draw preview on mount
  useEffect(() => {
    generateImage()
  }, [generateImage])

  const handleShare = async () => {
    hapticMedium()
    generateImage()
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Try Telegram share first
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), 'image/png')
        )
        const url = URL.createObjectURL(blob)
        // Try native share if available
        if (navigator.share) {
          const file = new File([blob], `lockin-${goal.title}.png`, { type: 'image/png' })
          await navigator.share({
            files: [file],
            title: `LOCKIN — ${goal.title}`,
            text: `Я накопил ${Math.round(progress)}% на ${goal.title}! 🔥`,
          })
          return
        }
      }

      // Fallback: download
      const link = document.createElement('a')
      link.download = `lockin-${goal.title}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Fallback: download
      const link = document.createElement('a')
      link.download = `lockin-${goal.title}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const handleDownload = () => {
    hapticLight()
    generateImage()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `lockin-${goal.title}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative rounded-2xl p-5 border border-white/10 max-w-sm w-full"
          style={{ background: 'linear-gradient(135deg, rgba(30, 30, 48, 0.98), rgba(22, 22, 38, 0.99))' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X size={14} className="text-white/40" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Share2 size={16} style={{ color: neonColor }} />
            <h3 className="text-sm font-bold" style={{ color: neonColor }}>
              Поделиться прогрессом
            </h3>
          </div>

          {/* Preview card */}
          <div
            className="rounded-xl border overflow-hidden mb-4"
            style={{ borderColor: `${neonColor}20` }}
          >
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ aspectRatio: '3/2' }}
            />
          </div>

          {/* Mini preview text */}
          <div
            className="rounded-lg p-3 mb-4 border"
            style={{
              background: `${neonColor}08`,
              borderColor: `${neonColor}15`,
            }}
          >
            <p className="text-xs text-white/50 mb-1">Текст для отправки:</p>
            <p className="text-sm" style={{ color: neonColor }}>
              🔥 Я накопил {Math.round(progress)}% на {goal.title}! — {formatNumber(saved)} ₽ из {formatNumber(goal.targetAmount)} ₽
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${neonColor}, ${neonColor}cc)`,
                color: '#12121e',
                boxShadow: `0 0 15px ${neonColor}25`,
              }}
            >
              <Share2 size={14} />
              Поделиться
            </button>
            <button
              onClick={handleDownload}
              className="h-10 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-[0.97]"
              style={{
                background: `${neonColor}10`,
                borderColor: `${neonColor}25`,
                color: neonColor,
              }}
            >
              <Download size={14} />
              Скачать
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/** Helper: draw rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/** Small share button for goal cards and goal detail */
export function ShareButton({ goal, saved, progress }: { goal: Goal; saved: number; progress: number }) {
  const [showShare, setShowShare] = useState(false)
  const neonColor = goal.color || '#00f0ff'

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowShare(true)
          hapticLight()
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: `${neonColor}12`,
          border: `1px solid ${neonColor}20`,
        }}
      >
        <Share2 size={12} style={{ color: neonColor }} />
      </button>
      {showShare && (
        <ShareCardOverlay
          goal={goal}
          saved={saved}
          progress={progress}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}


