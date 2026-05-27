'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
  maxStreak: number
}

export function StreakBadge({ streak, maxStreak }: StreakBadgeProps) {
  const isHot = streak >= 7
  const isWarm = streak >= 3 && streak < 7
  const isCold = streak > 0 && streak < 3
  const hasStreak = streak > 0

  const streakColor = isHot ? '#ff6b9d' : isWarm ? '#ffaa00' : '#00f0ff'

  // Build streak dots (last 7 days)
  const dots = []
  for (let i = 6; i >= 0; i--) {
    dots.push(i < streak)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 }}
      className="rounded-xl p-3 border"
      style={{
        background: hasStreak
          ? isHot
            ? 'linear-gradient(135deg, rgba(255,107,157,0.1), rgba(255,170,0,0.06))'
            : isWarm
              ? 'linear-gradient(135deg, rgba(255,170,0,0.08), rgba(255,107,157,0.04))'
              : 'linear-gradient(135deg, rgba(0,240,255,0.07), rgba(180,74,255,0.04))'
          : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        borderColor: hasStreak
          ? isHot
            ? 'rgba(255,107,157,0.2)'
            : isWarm
              ? 'rgba(255,170,0,0.15)'
              : 'rgba(0,240,255,0.12)'
          : 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: streak info */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={isHot ? { scale: [1, 1.15, 1], rotate: [0, 3, -3, 0] } : {}}
            transition={isHot ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: hasStreak
                ? `linear-gradient(135deg, ${streakColor}20, ${streakColor}08)`
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hasStreak ? streakColor + '25' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: hasStreak ? `0 0 12px ${streakColor}15` : 'none',
            }}
          >
            <Flame
              size={20}
              className={hasStreak ? (isHot ? 'text-[#ff6b9d]' : isWarm ? 'text-[#ffaa00]' : 'text-[#00f0ff]') : 'text-white/20'}
            />
          </motion.div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
              Ударный режим
            </p>
            {hasStreak ? (
              <p className="text-sm font-bold font-mono" style={{ color: streakColor }}>
                {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд
              </p>
            ) : (
              <p className="text-sm text-white/25">
                Нет серии
              </p>
            )}
          </div>
        </div>

        {/* Right: streak dots */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-[3px]">
            {dots.map((active, i) => (
              <motion.div
                key={i}
                className="w-[6px] h-[6px] rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                style={{
                  backgroundColor: active ? streakColor : 'rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 4px ${streakColor}50` : 'none',
                }}
              />
            ))}
          </div>
          {maxStreak > streak && (
            <p className="text-[9px] text-white/20 font-mono">
              рекорд {maxStreak}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
