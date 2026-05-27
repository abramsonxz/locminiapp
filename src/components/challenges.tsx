'use client'

import { motion } from 'framer-motion'
import { Swords, Check, Flame, Zap } from 'lucide-react'
import { useGoalStore } from '@/lib/store'
import { calculateStreak } from '@/lib/achievements'
import {
  CHALLENGES, getCompletedChallenges, type ChallengeContext
} from '@/lib/challenges'
import { hapticLight } from '@/lib/haptic'

function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

function formatProgress(current: number, target: number, unit: string): string {
  if (unit === '₽') {
    return `${formatNumber(Math.min(current, target))} / ${formatNumber(target)} ${unit}`
  }
  return `${Math.min(current, target)} / ${target} ${unit}`
}

export function Challenges() {
  const { goals, getTotalSaved } = useGoalStore()
  const { maxStreak } = calculateStreak(goals)
  const completedIds = getCompletedChallenges()

  const ctx: ChallengeContext = {
    goals: goals.map(g => ({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      color: g.color,
      entries: g.entries,
      createdAt: g.createdAt,
    })),
    currentStreak: 0,
    maxStreak,
  }

  const completedCount = completedIds.length
  const totalChallenges = CHALLENGES.length

  const categoryIcons: Record<string, typeof Swords> = {
    saving: Zap,
    streak: Flame,
    speed: Swords,
    count: Swords,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Swords size={16} className="text-[#ff3366]" />
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Челленджи</h2>
        </div>
        <span className="text-[10px] font-mono text-white/30">
          {completedCount}/{totalChallenges}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #ff3366, #ff6b9d)',
            boxShadow: '0 0 8px rgba(255, 51, 102, 0.3)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / totalChallenges) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Challenge cards */}
      <div className="space-y-2">
        {CHALLENGES.map((challenge, index) => {
          const isCompleted = completedIds.includes(challenge.id)
          const progress = challenge.getProgress(ctx)
          const progressPct = Math.min((progress / challenge.target) * 100, 100)
          const CategoryIcon = categoryIcons[challenge.category] || Swords

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl p-3 border relative overflow-hidden"
              style={{
                background: isCompleted
                  ? `linear-gradient(135deg, ${challenge.color}12, ${challenge.color}06)`
                  : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                borderColor: isCompleted
                  ? `${challenge.color}30`
                  : 'rgba(255,255,255,0.06)',
              }}
              onClick={() => hapticLight()}
            >
              {/* Completed overlay */}
              {isCompleted && (
                <div
                  className="absolute top-0 right-0 w-16 h-16 opacity-10"
                  style={{
                    background: `radial-gradient(circle at top right, ${challenge.color}, transparent 70%)`,
                  }}
                />
              )}

              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg relative"
                  style={{
                    background: isCompleted
                      ? `linear-gradient(135deg, ${challenge.color}20, ${challenge.color}08)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isCompleted ? challenge.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {isCompleted ? (
                    <span>{challenge.icon}</span>
                  ) : (
                    <span className="grayscale opacity-40">{challenge.icon}</span>
                  )}
                  {isCompleted && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: challenge.color,
                        boxShadow: `0 0 6px ${challenge.color}60`,
                      }}
                    >
                      <Check size={9} className="text-[#12121e]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: isCompleted ? challenge.color : 'rgba(255,255,255,0.6)' }}
                    >
                      {challenge.title}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/30 mb-1.5">
                    {challenge.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isCompleted
                            ? challenge.color
                            : `linear-gradient(90deg, ${challenge.color}60, ${challenge.color}30)`,
                          boxShadow: isCompleted ? `0 0 6px ${challenge.color}40` : 'none',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                      />
                    </div>
                    <span
                      className="text-[9px] font-mono shrink-0"
                      style={{ color: isCompleted ? challenge.color : 'rgba(255,255,255,0.25)' }}
                    >
                      {progressPct >= 100 ? '✓' : `${Math.round(progressPct)}%`}
                    </span>
                  </div>
                </div>

                {/* Progress value */}
                <div className="text-right shrink-0">
                  <p
                    className="text-[10px] font-mono"
                    style={{ color: isCompleted ? challenge.color : 'rgba(255,255,255,0.3)' }}
                  >
                    {formatProgress(progress, challenge.target, challenge.unit)}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
