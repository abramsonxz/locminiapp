'use client'

import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { ACHIEVEMENTS, getUnlockedAchievements } from '@/lib/achievements'

export function AchievementList() {
  const unlocked = getUnlockedAchievements()

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Award size={12} className="text-[#ffaa00]" />
        <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
          Достижения ({unlocked.length}/{ACHIEVEMENTS.length})
        </span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.includes(a.id)
          return (
            <motion.div
              key={a.id}
              title={`${a.title}: ${a.description}`}
              className="w-9 h-9 rounded-lg flex items-center justify-center border cursor-default"
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${a.color}15, ${a.color}08)`
                  : 'rgba(255,255,255,0.02)',
                borderColor: isUnlocked ? `${a.color}25` : 'rgba(255,255,255,0.06)',
                boxShadow: isUnlocked ? `0 0 8px ${a.color}10` : 'none',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={`text-base ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                {a.icon}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
