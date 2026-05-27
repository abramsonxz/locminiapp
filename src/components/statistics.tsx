'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Wallet, Calendar, Target, ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react'
import { useGoalStore } from '@/lib/store'
import { getDailyDeposits, getMonthlyDeposits } from '@/lib/challenges'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

function formatCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}М`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}К`
  return num.toString()
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-2.5 py-1.5 border border-white/10 text-xs"
        style={{ background: 'rgba(18, 18, 30, 0.95)', backdropFilter: 'blur(8px)' }}
      >
        <p className="text-white/50 mb-0.5">{label}</p>
        <p className="font-bold font-mono text-[#00f0ff]">
          {formatNumber(payload[0].value)} ₽
        </p>
      </div>
    )
  }
  return null
}

export function Statistics() {
  const { goals, getTotalSaved } = useGoalStore()
  const [chartMode, setChartMode] = useState<'week' | 'month'>('week')

  const allEntries = goals.flatMap(g => g.entries)
  const totalSaved = goals.reduce((sum, g) => sum + getTotalSaved(g.id), 0)
  const avgDeposit = allEntries.length > 0 ? totalSaved / allEntries.length : 0
  const completedGoals = goals.filter(g => getTotalSaved(g.id) >= g.targetAmount && g.targetAmount > 0).length

  // This week vs last week
  const dailyDeposits = getDailyDeposits(goals, 7)
  const thisWeekTotal = dailyDeposits.reduce((s, d) => s + d.amount, 0)
  const lastWeekDeposits = getDailyDeposits(goals, 14).slice(0, 7)
  const lastWeekTotal = lastWeekDeposits.reduce((s, d) => s + d.amount, 0)
  const weekChange = lastWeekTotal > 0
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    : thisWeekTotal > 0 ? 100 : 0

  // This month
  const now = new Date()
  const thisMonthEntries = allEntries.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthEntries.reduce((s, e) => s + e.amount, 0)

  // Most active goal
  const mostActiveGoal = goals.length > 0
    ? goals.reduce((best, g) => {
        const saved = getTotalSaved(g.id)
        return saved > best.saved ? { goal: g, saved } : best
      }, { goal: goals[0], saved: 0 })
    : null

  // Chart data
  const chartData = dailyDeposits.map(d => ({
    name: d.label.replace('.', ''),
    amount: d.amount,
  }))
  const monthlyData = getMonthlyDeposits(goals, 6).map(m => ({
    name: m.label,
    amount: m.amount,
  }))
  const displayData = chartMode === 'week' ? chartData : monthlyData

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={16} className="text-[#00f0ff]" />
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Статистика</h2>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Total saved */}
        <div
          className="rounded-xl p-3 border col-span-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(180, 74, 255, 0.04))',
            borderColor: 'rgba(0, 240, 255, 0.12)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet size={12} className="text-[#00f0ff]" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Всего накоплено</span>
          </div>
          <p className="text-xl font-black font-mono text-[#00f0ff]">
            {formatNumber(totalSaved)} ₽
          </p>
          <div className="flex items-center gap-1 mt-1">
            {weekChange !== 0 && (
              <>
                {weekChange > 0 ? (
                  <ArrowUpRight size={11} className="text-[#00ff88]" />
                ) : (
                  <ArrowDownRight size={11} className="text-red-400" />
                )}
                <span className={`text-[10px] font-mono ${weekChange > 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                  {weekChange > 0 ? '+' : ''}{weekChange}% за неделю
                </span>
              </>
            )}
          </div>
        </div>

        {/* This month */}
        <div
          className="rounded-xl p-3 border"
          style={{
            background: 'linear-gradient(135deg, rgba(180, 74, 255, 0.07), rgba(180, 74, 255, 0.02))',
            borderColor: 'rgba(180, 74, 255, 0.12)',
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Calendar size={11} className="text-[#b44aff]" />
            <span className="text-[10px] text-white/40 uppercase">Этот месяц</span>
          </div>
          <p className="text-base font-bold font-mono text-[#b44aff]">
            {formatNumber(thisMonthTotal)} ₽
          </p>
        </div>

        {/* Average deposit */}
        <div
          className="rounded-xl p-3 border"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.07), rgba(0, 255, 136, 0.02))',
            borderColor: 'rgba(0, 255, 136, 0.12)',
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={11} className="text-[#00ff88]" />
            <span className="text-[10px] text-white/40 uppercase">Средний взнос</span>
          </div>
          <p className="text-base font-bold font-mono text-[#00ff88]">
            {formatNumber(Math.round(avgDeposit))} ₽
          </p>
        </div>
      </div>

      {/* Chart section */}
      <div
        className="rounded-xl p-3 border"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(180, 74, 255, 0.02))',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Динамика</span>
          <div className="flex gap-1 p-0.5 rounded-lg bg-white/4 border border-white/5">
            <button
              onClick={() => setChartMode('week')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                chartMode === 'week' ? 'bg-[#00f0ff]/15 text-[#00f0ff]' : 'text-white/30'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setChartMode('month')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                chartMode === 'month' ? 'bg-[#b44aff]/15 text-[#b44aff]' : 'text-white/30'
              }`}
            >
              Полгода
            </button>
          </div>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompact}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,240,255,0.04)' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={32}>
                {displayData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={chartMode === 'week'
                      ? (index === displayData.length - 1 ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)')
                      : (index === displayData.length - 1 ? '#b44aff' : 'rgba(180, 74, 255, 0.4)')
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most active goal */}
      {mostActiveGoal && mostActiveGoal.saved > 0 && (
        <div
          className="rounded-xl p-3 border flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${mostActiveGoal.goal.color}0a, ${mostActiveGoal.goal.color}04)`,
            borderColor: `${mostActiveGoal.goal.color}18`,
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${mostActiveGoal.goal.color}18, ${mostActiveGoal.goal.color}08)`,
              border: `1px solid ${mostActiveGoal.goal.color}20`,
            }}
          >
            <Target size={16} style={{ color: mostActiveGoal.goal.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Самая активная цель</p>
            <p className="text-sm font-bold truncate" style={{ color: mostActiveGoal.goal.color }}>
              {mostActiveGoal.goal.title}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold font-mono" style={{ color: mostActiveGoal.goal.color }}>
              {formatNumber(mostActiveGoal.saved)} ₽
            </p>
            <p className="text-[10px] text-white/30">
              из {formatNumber(mostActiveGoal.goal.targetAmount)} ₽
            </p>
          </div>
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-2.5 border border-white/5 bg-white/2 text-center">
          <p className="text-lg font-black font-mono text-[#00f0ff]">{allEntries.length}</p>
          <p className="text-[9px] text-white/30 uppercase">Записей</p>
        </div>
        <div className="rounded-xl p-2.5 border border-white/5 bg-white/2 text-center">
          <p className="text-lg font-black font-mono text-[#00ff88]">{completedGoals}</p>
          <p className="text-[9px] text-white/30 uppercase">Закрыто</p>
        </div>
        <div className="rounded-xl p-2.5 border border-white/5 bg-white/2 text-center">
          <p className="text-lg font-black font-mono text-[#b44aff]">{goals.length}</p>
          <p className="text-[9px] text-white/30 uppercase">Всего целей</p>
        </div>
      </div>
    </motion.div>
  )
}
