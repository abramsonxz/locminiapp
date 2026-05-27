export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
  condition: (ctx: AchievementContext) => boolean
}

export interface AchievementContext {
  totalGoalsCreated: number
  totalGoalsCompleted: number
  totalEntries: number
  totalSaved: number
  currentStreak: number
  maxStreak: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-goal',
    title: 'Первый шаг',
    description: 'Создай первую цель',
    icon: '🎯',
    color: '#00f0ff',
    condition: (ctx) => ctx.totalGoalsCreated >= 1,
  },
  {
    id: 'first-deposit',
    title: 'Первый взнос',
    description: 'Внеси первую запись',
    icon: '💰',
    color: '#00ff88',
    condition: (ctx) => ctx.totalEntries >= 1,
  },
  {
    id: 'goal-closer',
    title: 'Закрыватор',
    description: 'Закрой первую цель',
    icon: '🏆',
    color: '#ffaa00',
    condition: (ctx) => ctx.totalGoalsCompleted >= 1,
  },
  {
    id: 'streak-3',
    title: 'Трёхдневка',
    description: 'Серия 3 дня подряд',
    icon: '🔥',
    color: '#ff6b9d',
    condition: (ctx) => ctx.maxStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Неделя силы',
    description: 'Серия 7 дней подряд',
    icon: '⚡',
    color: '#b44aff',
    condition: (ctx) => ctx.maxStreak >= 7,
  },
  {
    id: 'streak-14',
    title: 'Две недели',
    description: 'Серия 14 дней подряд',
    icon: '💎',
    color: '#7c5cff',
    condition: (ctx) => ctx.maxStreak >= 14,
  },
  {
    id: 'streak-30',
    title: 'Месяц дисциплины',
    description: 'Серия 30 дней подряд',
    icon: '👑',
    color: '#ffaa00',
    condition: (ctx) => ctx.maxStreak >= 30,
  },
  {
    id: 'collector',
    title: 'Коллекционер',
    description: 'Создай 5 целей',
    icon: '📂',
    color: '#4dffdb',
    condition: (ctx) => ctx.totalGoalsCreated >= 5,
  },
  {
    id: 'big-saver',
    title: 'Копилка',
    description: 'Накопи 100 000 ₽',
    icon: '🏦',
    color: '#00f0ff',
    condition: (ctx) => ctx.totalSaved >= 100000,
  },
  {
    id: 'mega-saver',
    title: 'Магнат',
    description: 'Накопи 1 000 000 ₽',
    icon: '🌟',
    color: '#ffaa00',
    condition: (ctx) => ctx.totalSaved >= 1000000,
  },
  {
    id: 'multi-close',
    title: 'Мультизакрыватор',
    description: 'Закрой 3 цели',
    icon: '🎯',
    color: '#00ff88',
    condition: (ctx) => ctx.totalGoalsCompleted >= 3,
  },
  {
    id: 'ten-entries',
    title: 'Дисциплина',
    description: 'Сделай 10 записей',
    icon: '📝',
    color: '#b44aff',
    condition: (ctx) => ctx.totalEntries >= 10,
  },
]

const ACHIEVEMENTS_KEY = 'lockin-achievements'
const STREAK_KEY = 'lockin-streak'

export function getUnlockedAchievements(): string[] {
  try {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveUnlockedAchievements(ids: string[]) {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

export function checkNewAchievements(ctx: AchievementContext): string[] {
  const unlocked = getUnlockedAchievements()
  const newlyUnlocked: string[] = []

  for (const a of ACHIEVEMENTS) {
    if (!unlocked.includes(a.id) && a.condition(ctx)) {
      newlyUnlocked.push(a.id)
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlockedAchievements([...unlocked, ...newlyUnlocked])
  }

  return newlyUnlocked
}

/** Calculate current streak and max streak from all goals' entries */
export function calculateStreak(goals: { entries: { date: string }[] }[]): {
  currentStreak: number
  maxStreak: number
  lastDepositDate: string | null
} {
  // Collect all unique deposit dates across all goals
  const dateSet = new Set<string>()
  for (const g of goals) {
    for (const e of g.entries) {
      const d = new Date(e.date)
      dateSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    }
  }

  if (dateSet.size === 0) return { currentStreak: 0, maxStreak: 0, lastDepositDate: null }

  const sortedDates = [...dateSet].sort().reverse() // newest first

  // Calculate current streak (from today backwards)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  let currentStreak = 0
  const checkDate = new Date(todayStr + 'T00:00:00')

  // Allow streak to include yesterday (in case user hasn't deposited today yet)
  const newestDate = sortedDates[0]
  const dayDiff = Math.floor((checkDate.getTime() - new Date(newestDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff > 1) {
    // Last deposit was more than 1 day ago — streak is broken
    // Still calculate max streak below
  } else {
    // Start from today or yesterday
    const startFrom = dayDiff === 0 ? checkDate : new Date(newestDate + 'T00:00:00')
    let d = new Date(startFrom)

    while (true) {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (dateSet.has(dStr)) {
        currentStreak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate max streak
  const allDates = [...dateSet].sort()
  let maxStreak = 1
  let streak = 1
  for (let i = 1; i < allDates.length; i++) {
    const prev = new Date(allDates[i - 1] + 'T00:00:00')
    const curr = new Date(allDates[i] + 'T00:00:00')
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 1) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
    } else {
      streak = 1
    }
  }
  if (allDates.length === 0) maxStreak = 0

  // Save streak data
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ currentStreak, maxStreak }))
    }
  } catch { /* ignore */ }

  return { currentStreak, maxStreak, lastDepositDate: sortedDates[0] || null }
}
