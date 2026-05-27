export interface Challenge {
  id: string
  title: string
  description: string
  icon: string
  color: string
  category: 'saving' | 'streak' | 'speed' | 'count'
  /** Compute current progress value from goals data */
  getProgress: (ctx: ChallengeContext) => number
  /** Target value to complete the challenge */
  target: number
  /** Unit label for progress display */
  unit: string
}

export interface ChallengeContext {
  goals: {
    id: string
    title: string
    targetAmount: number
    color: string
    entries: { id: string; amount: number; note: string; date: string }[]
    createdAt: string
  }[]
  currentStreak: number
  maxStreak: number
}

const CHALLENGES_KEY = 'lockin-challenges'
const CHALLENGES_STARTED_KEY = 'lockin-challenges-started'

export const CHALLENGES: Challenge[] = [
  {
    id: 'save-10k-week',
    title: '10К за неделю',
    description: 'Накопи 10 000 ₽ за 7 дней',
    icon: '⚡',
    color: '#00f0ff',
    category: 'saving',
    getProgress: (ctx) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekEntries = ctx.goals.flatMap(g =>
        g.entries.filter(e => new Date(e.date) >= weekAgo)
      )
      return weekEntries.reduce((sum, e) => sum + e.amount, 0)
    },
    target: 10000,
    unit: '₽',
  },
  {
    id: 'save-50k',
    title: 'Полтинник',
    description: 'Накопи 50 000 ₽ всего',
    icon: '💰',
    color: '#00ff88',
    category: 'saving',
    getProgress: (ctx) => {
      return ctx.goals.flatMap(g => g.entries).reduce((sum, e) => sum + e.amount, 0)
    },
    target: 50000,
    unit: '₽',
  },
  {
    id: 'save-100k',
    title: 'Капиталист',
    description: 'Накопи 100 000 ₽ всего',
    icon: '🏦',
    color: '#ffaa00',
    category: 'saving',
    getProgress: (ctx) => {
      return ctx.goals.flatMap(g => g.entries).reduce((sum, e) => sum + e.amount, 0)
    },
    target: 100000,
    unit: '₽',
  },
  {
    id: 'streak-7',
    title: 'Неделя силы',
    description: 'Вноси записи 7 дней подряд',
    icon: '🔥',
    color: '#ff6b9d',
    category: 'streak',
    getProgress: (ctx) => ctx.maxStreak,
    target: 7,
    unit: 'дн.',
  },
  {
    id: 'streak-14',
    title: 'Две недели',
    description: 'Вноси записи 14 дней подряд',
    icon: '💎',
    color: '#b44aff',
    category: 'streak',
    getProgress: (ctx) => ctx.maxStreak,
    target: 14,
    unit: 'дн.',
  },
  {
    id: 'streak-30',
    title: 'Месяц дисциплины',
    description: 'Вноси записи 30 дней подряд',
    icon: '👑',
    color: '#ffaa00',
    category: 'streak',
    getProgress: (ctx) => ctx.maxStreak,
    target: 30,
    unit: 'дн.',
  },
  {
    id: 'close-goal-fast',
    title: 'Быстрый закрыватор',
    description: 'Закрой цель за 14 дней',
    icon: '🚀',
    color: '#ff3366',
    category: 'speed',
    getProgress: (ctx) => {
      const twoWeeks = 14 * 24 * 60 * 60 * 1000
      return ctx.goals.filter(g => {
        if (g.entries.length === 0) return false
        const saved = g.entries.reduce((s, e) => s + e.amount, 0)
        if (saved < g.targetAmount) return false
        const firstEntry = new Date(g.entries[0].date)
        const lastEntry = new Date(g.entries[g.entries.length - 1].date)
        return (lastEntry.getTime() - firstEntry.getTime()) <= twoWeeks
      }).length
    },
    target: 1,
    unit: 'шт.',
  },
  {
    id: 'five-entries-day',
    title: 'День рекордов',
    description: 'Внеси 5 записей за один день',
    icon: '📊',
    color: '#4dffdb',
    category: 'count',
    getProgress: (ctx) => {
      const dayCounts: Record<string, number> = {}
      for (const g of ctx.goals) {
        for (const e of g.entries) {
          const d = new Date(e.date)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          dayCounts[key] = (dayCounts[key] || 0) + 1
        }
      }
      return Math.max(...Object.values(dayCounts), 0)
    },
    target: 5,
    unit: 'зап.',
  },
  {
    id: 'close-3-goals',
    title: 'Мультизакрыватор',
    description: 'Закрой 3 цели',
    icon: '🏆',
    color: '#7c5cff',
    category: 'count',
    getProgress: (ctx) => {
      return ctx.goals.filter(g => {
        const saved = g.entries.reduce((s, e) => s + e.amount, 0)
        return saved >= g.targetAmount && g.targetAmount > 0
      }).length
    },
    target: 3,
    unit: 'шт.',
  },
  {
    id: 'big-deposit',
    title: 'Крупный взнос',
    description: 'Внеси 25 000 ₽ за один раз',
    icon: '🤑',
    color: '#00f0ff',
    category: 'saving',
    getProgress: (ctx) => {
      return Math.max(...ctx.goals.flatMap(g => g.entries.map(e => e.amount)), 0)
    },
    target: 25000,
    unit: '₽',
  },
]

export function getCompletedChallenges(): string[] {
  try {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(CHALLENGES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveCompletedChallenges(ids: string[]) {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(ids))
  } catch { /* ignore */ }
}

export function getStartedChallenges(): string[] {
  try {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(CHALLENGES_STARTED_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function markChallengeStarted(id: string) {
  try {
    if (typeof window === 'undefined') return
    const started = getStartedChallenges()
    if (!started.includes(id)) {
      started.push(id)
      localStorage.setItem(CHALLENGES_STARTED_KEY, JSON.stringify(started))
    }
  } catch { /* ignore */ }
}

export function checkChallengeCompletion(challengeId: string, ctx: ChallengeContext): boolean {
  const challenge = CHALLENGES.find(c => c.id === challengeId)
  if (!challenge) return false
  return challenge.getProgress(ctx) >= challenge.target
}

export function checkNewChallengeCompletions(ctx: ChallengeContext): string[] {
  const completed = getCompletedChallenges()
  const newlyCompleted: string[] = []

  for (const c of CHALLENGES) {
    if (!completed.includes(c.id) && c.getProgress(ctx) >= c.target) {
      newlyCompleted.push(c.id)
    }
  }

  if (newlyCompleted.length > 0) {
    saveCompletedChallenges([...completed, ...newlyCompleted])
  }

  return newlyCompleted
}

/** Get stats for the last N days deposits */
export function getDailyDeposits(
  goals: { entries: { amount: number; date: string }[] }[],
  days: number = 7
): { date: string; amount: number; label: string }[] {
  const result: { date: string; amount: number; label: string }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const label = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

    let dayTotal = 0
    for (const g of goals) {
      for (const e of g.entries) {
        const eDate = new Date(e.date)
        const eKey = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}-${String(eDate.getDate()).padStart(2, '0')}`
        if (eKey === key) {
          dayTotal += e.amount
        }
      }
    }

    result.push({ date: key, amount: dayTotal, label })
  }

  return result
}

/** Get monthly deposits for the last N months */
export function getMonthlyDeposits(
  goals: { entries: { amount: number; date: string }[] }[],
  months: number = 6
): { month: string; amount: number; label: string }[] {
  const result: { month: string; amount: number; label: string }[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('ru-RU', { month: 'short' })

    let monthTotal = 0
    for (const g of goals) {
      for (const e of g.entries) {
        const eDate = new Date(e.date)
        const eKey = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`
        if (eKey === key) {
          monthTotal += e.amount
        }
      }
    }

    result.push({ month: key, amount: monthTotal, label })
  }

  return result
}
