'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, type Achievement } from '@/lib/achievements'
import { hapticSuccess } from '@/lib/haptic'

interface AchievementPopupProps {
  achievementIds: string[]
  onDone: () => void
}

export function AchievementPopup({ achievementIds, onDone }: AchievementPopupProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (achievementIds.length === 0) {
      onDone()
      return
    }
    hapticSuccess()
  }, [achievementIds.length, onDone])

  const currentAchievement: Achievement | undefined = ACHIEVEMENTS.find(
    (a) => a.id === achievementIds[index]
  )

  const handleNext = () => {
    if (index < achievementIds.length - 1) {
      hapticSuccess()
      setIndex(index + 1)
    } else {
      onDone()
    }
  }

  return (
    <AnimatePresence>
      {currentAchievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          onClick={handleNext}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative rounded-2xl p-6 border text-center max-w-xs w-full"
            style={{
              background: `linear-gradient(135deg, rgba(28, 28, 48, 0.98), rgba(22, 22, 38, 0.99))`,
              borderColor: `${currentAchievement.color}30`,
              boxShadow: `0 0 30px ${currentAchievement.color}20, 0 0 60px ${currentAchievement.color}08`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow ring */}
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentAchievement.color}20, ${currentAchievement.color}08)`,
                border: `2px solid ${currentAchievement.color}30`,
                boxShadow: `0 0 20px ${currentAchievement.color}20`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-3xl">{currentAchievement.icon}</span>
            </motion.div>

            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1">
              Достижение разблокировано!
            </p>
            <h3
              className="text-lg font-black mb-1"
              style={{ color: currentAchievement.color }}
            >
              {currentAchievement.title}
            </h3>
            <p className="text-xs text-white/50 mb-5">
              {currentAchievement.description}
            </p>

            <button
              onClick={handleNext}
              className="w-full h-9 rounded-xl text-xs font-bold transition-colors"
              style={{
                background: `linear-gradient(135deg, ${currentAchievement.color}, ${currentAchievement.color}cc)`,
                color: '#12121e',
              }}
            >
              {index < achievementIds.length - 1 ? 'Далее' : 'Отлично!'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
