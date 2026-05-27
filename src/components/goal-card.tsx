'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, ChevronRight, Clock, Share2 } from 'lucide-react'
import { useGoalStore, type Goal } from '@/lib/store'
import { ShareCardOverlay } from '@/components/share-card'
import { hapticLight } from '@/lib/haptic'

function getDeadlineInfo(deadline: string | null): { text: string; urgent: boolean; overdue: boolean } | null {
  if (!deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dl = new Date(deadline + 'T00:00:00')
  const diffMs = dl.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: `Просрочен ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'дн.' : 'дн. назад'}`, urgent: true, overdue: true }
  if (diffDays === 0) return { text: 'Сегодня!', urgent: true, overdue: false }
  if (diffDays === 1) return { text: 'Завтра', urgent: true, overdue: false }
  if (diffDays <= 7) return { text: `${diffDays} дн.`, urgent: true, overdue: false }
  return { text: `${diffDays} дн.`, urgent: false, overdue: false }
}

function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

interface GoalCardProps {
  goal: Goal
  onOpen: (id: string) => void
}

export function GoalCard({ goal, onOpen }: GoalCardProps) {
  const { getTotalSaved } = useGoalStore()
  const [showShare, setShowShare] = useState(false)

  const saved = getTotalSaved(goal.id)
  const progress = goal.targetAmount > 0 ? Math.min((saved / goal.targetAmount) * 100, 100) : 0
  const isCompleted = progress >= 100
  const neonColor = goal.color || '#00f0ff'

  return (
    <>
    {/* Share overlay */}
    {showShare && (
      <ShareCardOverlay goal={goal} saved={saved} progress={progress} onClose={() => setShowShare(false)} />
    )}
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative rounded-2xl border backdrop-blur-md overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: `linear-gradient(135deg, rgba(28, 28, 48, 0.8), rgba(22, 22, 38, 0.9))`,
        boxShadow: `0 0 12px ${neonColor}12`,
        borderColor: `${neonColor}20`,
      }}
      onClick={() => onOpen(goal.id)}
    >
      {/* Completed glow overlay */}
      {isCompleted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${neonColor}0a, transparent 60%)`,
          }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              backgroundColor: neonColor,
              boxShadow: `0 0 8px ${neonColor}50`,
            }}
          />
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-sm truncate"
              style={{ color: neonColor }}
            >
              {isCompleted && '✓ '}{goal.title}
            </h3>
            {goal.link && (
              <div className="flex items-center gap-1 mt-0.5">
                <ExternalLink size={9} style={{ color: `${neonColor}80` }} />
                <span className="text-[10px] truncate" style={{ color: `${neonColor}80` }}>
                  {goal.link.replace(/^https?:\/\//, '').split('/')[0]}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowShare(true)
                hapticLight()
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90"
              style={{ background: `${neonColor}12`, border: `1px solid ${neonColor}20` }}
            >
              <Share2 size={12} style={{ color: neonColor }} />
            </button>
            <ChevronRight size={16} style={{ color: `${neonColor}50` }} />
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="font-mono font-bold text-sm" style={{ color: neonColor }}>
              {formatNumber(saved)} ₽
            </span>
            <span className="text-white/40 text-xs">
              из {formatNumber(goal.targetAmount)} ₽
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full progress-shimmer"
              style={{
                background: `linear-gradient(90deg, ${neonColor}, ${neonColor}cc)`,
                boxShadow: `0 0 6px ${neonColor}35`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono" style={{ color: `${neonColor}99` }}>
              {progress.toFixed(1)}%
            </span>
            {goal.deadline && !isCompleted && (() => {
              const info = getDeadlineInfo(goal.deadline)
              if (!info) return null
              return (
                <div className={`flex items-center gap-1 ${info.urgent ? 'animate-pulse' : ''}`}>
                  <Clock size={10} className={info.overdue ? 'text-red-400' : info.urgent ? 'text-yellow-400' : 'text-white/30'} />
                  <span className={`text-[10px] font-mono ${info.overdue ? 'text-red-400' : info.urgent ? 'text-yellow-400' : 'text-white/35'}`}>
                    {info.text}
                  </span>
                </div>
              )
            })()}
            {isCompleted && (
              <span className="text-[10px] font-bold" style={{ color: neonColor }}>
                Цель закрыта! 🎯
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
    </>
  )
}
