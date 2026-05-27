import { create } from 'zustand'

export interface GoalEntry {
  id: string
  amount: number
  note: string
  date: string
}

export interface Goal {
  id: string
  title: string
  link: string
  targetAmount: number
  entries: GoalEntry[]
  createdAt: string
  color: string
  deadline: string | null
}

const COLORS = ['#00f0ff', '#b44aff', '#00ff88', '#ffaa00', '#ff3366', '#ff6b9d', '#4dffdb', '#7c5cff']

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const STORAGE_KEY = 'lockin-goals'
const STATS_KEY = 'lockin-stats'

function saveToStorage(goals: Goal[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    }
  } catch {
    // localStorage might be full or unavailable
  }
}

function loadFromStorage(): Goal[] | null {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    }
  } catch {
    // corrupted data, ignore
  }
  return null
}

export interface AppStats {
  totalGoalsCreated: number
}

function loadStats(): AppStats {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STATS_KEY)
      if (stored) return JSON.parse(stored)
    }
  } catch { /* ignore */ }
  return { totalGoalsCreated: 0 }
}

function saveStats(stats: AppStats) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    }
  } catch { /* ignore */ }
}

interface GoalStore {
  goals: Goal[]
  loaded: boolean
  stats: AppStats
  load: () => void
  addGoal: (title: string, link: string, targetAmount: number, color?: string, deadline?: string | null) => string
  updateGoal: (id: string, data: Partial<Pick<Goal, 'title' | 'link' | 'targetAmount' | 'color' | 'deadline'>>) => void
  deleteGoal: (id: string) => void
  addEntry: (goalId: string, amount: number, note: string) => void
  deleteEntry: (goalId: string, entryId: string) => void
  getGoal: (id: string) => Goal | undefined
  getTotalSaved: (goalId: string) => number
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loaded: false,
  stats: { totalGoalsCreated: 0 },

  load: () => {
    const stored = loadFromStorage()
    const stats = loadStats()
    if (stored) {
      set({ goals: stored, loaded: true, stats })
    } else {
      set({ loaded: true, stats })
    }
  },

  addGoal: (title, link, targetAmount, color, deadline) => {
    const id = generateId()
    const newGoal: Goal = {
      id,
      title,
      link,
      targetAmount,
      entries: [],
      createdAt: new Date().toISOString(),
      color: color || randomColor(),
      deadline: deadline || null,
    }
    const newGoals = [...get().goals, newGoal]
    const newStats = { ...get().stats, totalGoalsCreated: get().stats.totalGoalsCreated + 1 }
    set({ goals: newGoals, stats: newStats })
    saveToStorage(newGoals)
    saveStats(newStats)
    return id
  },

  updateGoal: (id, data) => {
    const newGoals = get().goals.map(g => g.id === id ? { ...g, ...data } : g)
    set({ goals: newGoals })
    saveToStorage(newGoals)
  },

  deleteGoal: (id) => {
    const newGoals = get().goals.filter(g => g.id !== id)
    set({ goals: newGoals })
    saveToStorage(newGoals)
  },

  addEntry: (goalId, amount, note) => {
    const newGoals = get().goals.map(g => {
      if (g.id !== goalId) return g
      return {
        ...g,
        entries: [
          ...g.entries,
          {
            id: generateId(),
            amount,
            note,
            date: new Date().toISOString(),
          },
        ],
      }
    })
    set({ goals: newGoals })
    saveToStorage(newGoals)
  },

  deleteEntry: (goalId, entryId) => {
    const newGoals = get().goals.map(g => {
      if (g.id !== goalId) return g
      return {
        ...g,
        entries: g.entries.filter(e => e.id !== entryId),
      }
    })
    set({ goals: newGoals })
    saveToStorage(newGoals)
  },

  getGoal: (id) => {
    return get().goals.find(g => g.id === id)
  },

  getTotalSaved: (goalId) => {
    const goal = get().goals.find(g => g.id === goalId)
    if (!goal) return 0
    return goal.entries.reduce((sum, e) => sum + e.amount, 0)
  },
}))
