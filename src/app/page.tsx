'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Target, TrendingUp, Wallet, Trophy, BarChart3, Swords } from 'lucide-react'
import { useGoalStore } from '@/lib/store'
import { calculateStreak, checkNewAchievements, type AchievementContext } from '@/lib/achievements'
import { hapticLight, hapticMedium, hapticSelection } from '@/lib/haptic'
import { BackgroundPattern } from '@/components/background-pattern'
import { GoalCard } from '@/components/goal-card'
import { GoalDetail } from '@/components/goal-detail'
import { GoalDialog } from '@/components/goal-dialog'
import { NeonBorderBox } from '@/components/neon-border-box'
import { StreakBadge } from '@/components/streak-badge'
import { AchievementList } from '@/components/achievement-list'
import { AchievementPopup } from '@/components/achievement-popup'
import { Statistics } from '@/components/statistics'
import { Challenges } from '@/components/challenges'
import { Button } from '@/components/ui/button'

type BottomTab = 'goals' | 'stats' | 'challenges' | 'badges'
type GoalTab = 'active' | 'completed'

export default function Home() {
  const { goals, load, loaded, getTotalSaved, getGoal, stats } = useGoalStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('goals')
  const [activeGoalTab, setActiveGoalTab] = useState<GoalTab>('active')
  const [showSplash, setShowSplash] = useState(true)
  const [newAchievements, setNewAchievements] = useState<string[]>([])

  useEffect(() => {
    load()
  }, [load])

  // Minimum splash screen duration so the animation is visible
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  // Telegram WebApp integration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-web-app.js'
      script.async = true
      script.onload = () => {
        const tg = (window as any).Telegram?.WebApp
        if (tg) {
          tg.ready()
          tg.expand()
          tg.setHeaderColor('#12121e')
          tg.setBackgroundColor('#12121e')
        }
      }
      document.head.appendChild(script)
    }
  }, [])

  // Handle TG back button
  useEffect(() => {
    if (typeof window === 'undefined') return
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return

    if (selectedGoalId) {
      tg.BackButton.show()
      const handler = () => setSelectedGoalId(null)
      tg.BackButton.onClick(handler)
      return () => {
        tg.BackButton.offClick(handler)
      }
    } else {
      tg.BackButton.hide()
    }
  }, [selectedGoalId])

  const totalSaved = goals.reduce((sum, g) => sum + getTotalSaved(g.id), 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const completedGoals = goals.filter(g => getTotalSaved(g.id) >= g.targetAmount && g.targetAmount > 0).length

  const activeGoals = goals.filter(g => getTotalSaved(g.id) < g.targetAmount || g.targetAmount <= 0)
  const finishedGoals = goals.filter(g => getTotalSaved(g.id) >= g.targetAmount && g.targetAmount > 0)

  const { currentStreak, maxStreak } = calculateStreak(goals)

  const checkAchievements = () => {
    const totalEntries = goals.reduce((sum, g) => sum + g.entries.length, 0)
    const totalSavedAmt = goals.reduce((sum, g) => sum + getTotalSaved(g.id), 0)
    const totalGoalsCompleted = goals.filter(g => getTotalSaved(g.id) >= g.targetAmount && g.targetAmount > 0).length

    const ctx: AchievementContext = {
      totalGoalsCreated: stats.totalGoalsCreated,
      totalGoalsCompleted,
      totalEntries,
      totalSaved: totalSavedAmt,
      currentStreak,
      maxStreak,
    }

    const newlyUnlocked = checkNewAchievements(ctx)
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked)
    }
  }

  const selectedGoal = selectedGoalId ? getGoal(selectedGoalId) : null

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setTimeout(checkAchievements, 100)
  }

  // ──────────────────── SPLASH SCREEN ────────────────────
  if (!loaded || showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#12121e] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(180, 74, 255, 0.06) 0%, transparent 70%)' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </div>

        {/* Target icon with neon ring */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'backOut' }}
        >
          <motion.div
            className="absolute -inset-3 rounded-2xl"
            style={{
              border: '1.5px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.15), inset 0 0 15px rgba(0, 240, 255, 0.05)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -inset-1.5 rounded-xl"
            style={{
              border: '1px solid rgba(180, 74, 255, 0.2)',
              boxShadow: '0 0 10px rgba(180, 74, 255, 0.1)',
            }}
            animate={{ rotate: -360, scale: [1, 1.04, 1] }}
            transition={{ rotate: { duration: 6, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          />
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center relative z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(180, 74, 255, 0.15))',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.2), 0 0 40px rgba(180, 74, 255, 0.1)',
            }}
          >
            <Target size={26} className="text-[#00f0ff]" />
          </div>
        </motion.div>

        {/* LOCKIN text */}
        <motion.h1
          className="text-3xl font-black tracking-[0.3em] mb-2"
          style={{ color: '#00f0ff' }}
          initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          {'LOCKIN'.split('').map((char, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 30px rgba(0, 240, 255, 0.2)' }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-[10px] text-white/30 uppercase tracking-[0.25em] mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Закрыватор цели
        </motion.p>

        <motion.div
          className="w-32 h-[2px] rounded-full overflow-hidden bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00f0ff, #b44aff, #00f0ff)',
              backgroundSize: '200% 100%',
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
            }}
            animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    )
  }

  // ──────────────────── GOAL DETAIL VIEW ────────────────────
  if (selectedGoal) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#12121e]">
        <BackgroundPattern />
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full"
            style={{ background: `radial-gradient(circle, ${selectedGoal.color}0c 0%, transparent 70%)` }}
          />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(180, 74, 255, 0.06) 0%, transparent 70%)' }}
          />
        </div>
        <div className="relative z-10">
          <GoalDetail goal={selectedGoal} onBack={() => setSelectedGoalId(null)} />
        </div>
      </div>
    )
  }

  // ──────────────────── BOTTOM NAV CONFIG ────────────────────
  const bottomTabs: { id: BottomTab; label: string; icon: typeof Target; color: string }[] = [
    { id: 'goals', label: 'Цели', icon: Target, color: '#00f0ff' },
    { id: 'stats', label: 'Статистика', icon: BarChart3, color: '#b44aff' },
    { id: 'challenges', label: 'Челленджи', icon: Swords, color: '#ff3366' },
    { id: 'badges', label: 'Бейджи', icon: Trophy, color: '#ffaa00' },
  ]

  // Goal sub-tab config
  const goalTabConfig = {
    active: { color: '#00f0ff', index: 0 },
    completed: { color: '#00ff88', index: 1 },
  }

  const getGoalTabIndicator = () => {
    const tabWidth = 'calc(50% - 4px)'
    const offset = goalTabConfig[activeGoalTab].index * 50
    return {
      width: tabWidth,
      left: `calc(${offset}% + 2px)`,
      background: `${goalTabConfig[activeGoalTab].color}15`,
    }
  }

  // ──────────────────── MAIN LAYOUT ────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#12121e]">
      {/* Animated background */}
      <BackgroundPattern />

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.07) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(180, 74, 255, 0.06) 0%, transparent 70%)' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md mx-auto px-4 pb-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-6 pb-4"
        >
          <div className="flex items-center gap-3 mb-1">
            <NeonBorderBox color="#00f0ff" size={40} borderRadius={12}>
              <Target size={20} className="text-[#00f0ff]" />
            </NeonBorderBox>
            <div>
              <h1 className="text-xl font-black tracking-wider neon-text" style={{ color: '#00f0ff' }}>
                LOCKIN
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                Закрыватор цели
              </p>
            </div>
          </div>
        </motion.header>

        {/* Stats row (always visible) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <div
            className="rounded-xl p-3 border border-[#00f0ff]/10"
            style={{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.07), rgba(0, 240, 255, 0.02))' }}
          >
            <div className="flex items-center gap-1 mb-1">
              <Wallet size={11} className="text-[#00f0ff]" />
              <span className="text-[10px] text-white/40 uppercase">Накоплено</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#00f0ff]">
              {totalSaved.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div
            className="rounded-xl p-3 border border-[#b44aff]/10"
            style={{ background: 'linear-gradient(135deg, rgba(180, 74, 255, 0.07), rgba(180, 74, 255, 0.02))' }}
          >
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp size={11} className="text-[#b44aff]" />
              <span className="text-[10px] text-white/40 uppercase">Цель</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#b44aff]">
              {totalTarget.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div
            className="rounded-xl p-3 border border-[#00ff88]/10"
            style={{ background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.07), rgba(0, 255, 136, 0.02))' }}
          >
            <div className="flex items-center gap-1 mb-1">
              <Target size={11} className="text-[#00ff88]" />
              <span className="text-[10px] text-white/40 uppercase">Закрыто</span>
            </div>
            <p className="text-sm font-bold font-mono text-[#00ff88]">
              {completedGoals}/{goals.length}
            </p>
          </div>
        </motion.div>

        {/* Streak card (always visible) */}
        <StreakBadge streak={currentStreak} maxStreak={maxStreak} />

        {/* ──── Tab content ──── */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBottomTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* ──── GOALS TAB ──── */}
              {activeBottomTab === 'goals' && (
                <div className="space-y-3">
                  {/* Goal sub-tabs */}
                  <div className="relative flex gap-1 p-1 rounded-xl bg-white/4 border border-white/5">
                    <motion.div
                      className="absolute top-1 bottom-1 rounded-lg"
                      style={getGoalTabIndicator()}
                      layout
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <button
                      onClick={() => { setActiveGoalTab('active'); hapticSelection() }}
                      className={`relative z-10 flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-1 ${
                        activeGoalTab === 'active' ? 'text-[#00f0ff]' : 'text-white/35 hover:text-white/50'
                      }`}
                    >
                      Активные
                      {activeGoals.length > 0 && (
                        <span className={`text-[9px] font-mono ${activeGoalTab === 'active' ? 'text-[#00f0ff]/60' : 'text-white/20'}`}>
                          {activeGoals.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => { setActiveGoalTab('completed'); hapticSelection() }}
                      className={`relative z-10 flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-1 ${
                        activeGoalTab === 'completed' ? 'text-[#00ff88]' : 'text-white/35 hover:text-white/50'
                      }`}
                    >
                      Закрытые
                      {finishedGoals.length > 0 && (
                        <span className={`text-[9px] font-mono ${activeGoalTab === 'completed' ? 'text-[#00ff88]/60' : 'text-white/20'}`}>
                          {finishedGoals.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Goal list */}
                  {(activeGoalTab === 'active' ? activeGoals : finishedGoals).length === 0 ? (
                    <div className="text-center py-16">
                      <NeonBorderBox
                        color={activeGoalTab === 'active' ? '#00f0ff' : '#00ff88'}
                        size={64}
                        borderRadius={16}
                        className="mx-auto mb-4"
                      >
                        <Target size={28} className={activeGoalTab === 'active' ? 'text-[#00f0ff]/40' : 'text-[#00ff88]/40'} />
                      </NeonBorderBox>
                      <p className="text-white/45 text-sm mb-1">
                        {activeGoalTab === 'active' ? 'Пока нет активных целей' : 'Пока нет закрытых целей'}
                      </p>
                      <p className="text-white/25 text-xs">
                        {activeGoalTab === 'active' ? 'Нажми + чтобы создать первую' : 'Закройте цель, чтобы она появилась здесь'}
                      </p>
                    </div>
                  ) : (
                    (activeGoalTab === 'active' ? activeGoals : finishedGoals).map((goal) => (
                      <GoalCard key={goal.id} goal={goal} onOpen={setSelectedGoalId} />
                    ))
                  )}
                </div>
              )}

              {/* ──── STATS TAB ──── */}
              {activeBottomTab === 'stats' && <Statistics />}

              {/* ──── CHALLENGES TAB ──── */}
              {activeBottomTab === 'challenges' && <Challenges />}

              {/* ──── BADGES TAB ──── */}
              {activeBottomTab === 'badges' && <AchievementList />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ──── BOTTOM NAVIGATION ──── */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div
          className="max-w-md mx-auto px-2 pb-2 pt-1"
        >
          <div
            className="flex items-center justify-around rounded-2xl p-1.5 border backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(18, 18, 30, 0.92), rgba(26, 26, 46, 0.88))',
              borderColor: 'rgba(255,255,255,0.06)',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {bottomTabs.map((tab) => {
              const isActive = activeBottomTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveBottomTab(tab.id)
                    hapticSelection()
                  }}
                  className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200"
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `${tab.color}12`,
                        border: `1px solid ${tab.color}20`,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className="relative z-10 transition-colors duration-200"
                    style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.25)' }}
                  />
                  <span
                    className="relative z-10 text-[9px] font-bold uppercase tracking-wider transition-colors duration-200"
                    style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.25)' }}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAB button — only show on goals tab */}
      {activeBottomTab === 'goals' && (
        <motion.div
          className="fixed bottom-20 right-6 z-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Button
            className="h-14 w-14 rounded-2xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #b44aff)',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.25), 0 0 50px rgba(180, 74, 255, 0.12)',
            }}
            onClick={() => {
              setDialogOpen(true)
              hapticLight()
            }}
          >
            <Plus size={24} className="text-[#12121e]" />
          </Button>
        </motion.div>
      )}

      {/* New goal dialog */}
      <GoalDialog key="new" open={dialogOpen} onClose={handleCloseDialog} />

      {/* Achievement popup */}
      <AchievementPopup achievementIds={newAchievements} onDone={() => setNewAchievements([])} />
    </div>
  )
}
export default function Home() {
  return (
    <div>
      <h1>WORKING</h1>
    </div>
  );
}
