'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Trash2, ExternalLink, Pencil, Plus, X, Check,
  TrendingUp, Calendar, Wallet, Clock, AlertTriangle, Share2
} from 'lucide-react'
import { useState } from 'react'
import { useGoalStore, type Goal } from '@/lib/store'
import { hapticLight, hapticSuccess, hapticError, hapticMedium } from '@/lib/haptic'
import { Button } from '@/components/ui/button'
import { ShareCardOverlay } from '@/components/share-card'

const COLORS = [
  { name: 'Неон', value: '#00f0ff' },
  { name: 'Фиолет', value: '#b44aff' },
  { name: 'Мята', value: '#00ff88' },
  { name: 'Янтарь', value: '#ffaa00' },
  { name: 'Розовый', value: '#ff3366' },
  { name: 'Коралл', value: '#ff6b9d' },
  { name: 'Бирюза', value: '#4dffdb' },
  { name: 'Индиго', value: '#7c5cff' },
]

function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

function getDeadlineInfo(deadline: string | null): { text: string; urgent: boolean; overdue: boolean; daysLeft: number } | null {
  if (!deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dl = new Date(deadline + 'T00:00:00')
  const diffMs = dl.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: `Просрочен на ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'день' : 'дней'}`, urgent: true, overdue: true, daysLeft: diffDays }
  if (diffDays === 0) return { text: 'Дедлайн сегодня!', urgent: true, overdue: false, daysLeft: 0 }
  if (diffDays === 1) return { text: '1 день до дедлайна', urgent: true, overdue: false, daysLeft: 1 }
  if (diffDays <= 7) return { text: `${diffDays} дней до дедлайна`, urgent: true, overdue: false, daysLeft: diffDays }
  if (diffDays <= 30) return { text: `${diffDays} дней до дедлайна`, urgent: false, overdue: false, daysLeft: diffDays }
  return { text: `${diffDays} дней до дедлайна`, urgent: false, overdue: false, daysLeft: diffDays }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

interface GoalDetailProps {
  goal: Goal
  onBack: () => void
}

export function GoalDetail({ goal, onBack }: GoalDetailProps) {
  const {
    updateGoal, deleteGoal, addEntry, deleteEntry, getTotalSaved
  } = useGoalStore()

  const saved = getTotalSaved(goal.id)
  const progress = goal.targetAmount > 0 ? Math.min((saved / goal.targetAmount) * 100, 100) : 0
  const isCompleted = progress >= 100
  const remaining = Math.max(goal.targetAmount - saved, 0)
  const neonColor = goal.color || '#00f0ff'

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(goal.title)
  const [editLink, setEditLink] = useState(goal.link)
  const [editAmount, setEditAmount] = useState(goal.targetAmount.toString())
  const [editColor, setEditColor] = useState(goal.color)
  const [editDeadline, setEditDeadline] = useState(goal.deadline || '')

  // Add entry
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [entryAmount, setEntryAmount] = useState('')
  const [entryNote, setEntryNote] = useState('')

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Share
  const [showShare, setShowShare] = useState(false)

  const handleSaveEdit = () => {
    const amount = parseFloat(editAmount)
    if (!editTitle.trim() || isNaN(amount) || amount <= 0) return
    updateGoal(goal.id, {
      title: editTitle.trim(),
      link: editLink.trim(),
      targetAmount: amount,
      color: editColor,
      deadline: editDeadline || null,
    })
    hapticMedium()
    setEditing(false)
  }

  const handleAddEntry = () => {
    const amount = parseFloat(entryAmount)
    if (isNaN(amount) || amount <= 0) return

    const wasBeforeCompleted = progress >= 100
    addEntry(goal.id, amount, entryNote.trim())
    const newSaved = saved + amount
    const isNowCompleted = goal.targetAmount > 0 && newSaved >= goal.targetAmount

    if (isNowCompleted && !wasBeforeCompleted) {
      hapticSuccess()
    } else {
      hapticLight()
    }

    setEntryAmount('')
    setEntryNote('')
    setShowAddEntry(false)
  }

  const handleDeleteGoal = () => {
    hapticError()
    deleteGoal(goal.id)
    onBack()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen relative"
    >
      <div className="max-w-md mx-auto px-4 pb-32">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-4 pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 hover:bg-white/5 gap-1"
            onClick={onBack}
          >
            <ArrowLeft size={18} style={{ color: neonColor }} />
            <span className="text-xs" style={{ color: neonColor }}>Назад</span>
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-white/5"
              onClick={() => {
                if (editing) {
                  setEditTitle(goal.title)
                  setEditLink(goal.link)
                  setEditAmount(goal.targetAmount.toString())
                  setEditColor(goal.color)
                  setEditDeadline(goal.deadline || '')
                }
                setEditing(!editing)
              }}
            >
              {editing ? (
                <X size={16} className="text-white/50" />
              ) : (
                <Pencil size={16} style={{ color: neonColor }} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-white/5"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} className="text-red-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-white/5"
              onClick={() => { setShowShare(true); hapticLight() }}
            >
              <Share2 size={16} style={{ color: neonColor }} />
            </Button>
          </div>
        </div>

        {/* Goal header */}
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-3 mb-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">Название</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-white/6 border border-white/10 text-sm focus:border-white/25 focus:outline-none"
                  style={{ borderColor: `${editColor}40`, color: editColor }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">
                  Ссылка <span className="text-white/25">(необязательно)</span>
                </label>
                <input
                  type="url"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-white/6 border border-white/10 text-sm focus:border-white/25 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">Целевая сумма (₽)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-white/6 border border-white/10 text-sm font-mono focus:border-white/25 focus:outline-none"
                  style={{ borderColor: `${editColor}40`, color: editColor }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">
                  Дедлайн <span className="text-white/25">(необязательно)</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 pl-9 pr-10 rounded-xl bg-white/6 border border-white/10 text-sm focus:border-white/25 focus:outline-none [color-scheme:dark]"
                    style={{ borderColor: `${editColor}40`, color: editDeadline ? editColor : 'rgba(255,255,255,0.5)' }}
                  />
                  {editDeadline && (
                    <button
                      onClick={() => setEditDeadline('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X size={12} className="text-white/40" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider">Цвет</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setEditColor(c.value)}
                      className="w-8 h-8 rounded-full border-2 transition-all duration-200"
                      style={{
                        backgroundColor: c.value,
                        borderColor: editColor === c.value ? '#ffffff' : 'transparent',
                        boxShadow: editColor === c.value ? `0 0 10px ${c.value}60` : 'none',
                        transform: editColor === c.value ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
              <Button
                className="w-full h-10 rounded-xl font-bold text-sm"
                style={{
                  background: `linear-gradient(135deg, ${editColor}, ${editColor}cc)`,
                  color: '#12121e',
                  boxShadow: `0 0 18px ${editColor}30`,
                }}
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0}
              >
                <Check size={16} className="mr-1" />
                Сохранить
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-6"
            >
              {/* Title & link */}
              <h1
                className="text-2xl font-black mb-1 leading-tight"
                style={{ color: neonColor }}
              >
                {isCompleted && '✓ '}{goal.title}
              </h1>
              {goal.link && (
                <a
                  href={goal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 hover:underline mb-3"
                  style={{ color: `${neonColor}99` }}
                >
                  <ExternalLink size={10} />
                  <span className="truncate">{goal.link}</span>
                </a>
              )}
              {!goal.link && <div className="mb-3" />}

              {/* Big progress circle */}
              <div className="flex justify-center mb-4">
                <div className="relative w-44 h-44">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Track */}
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="6"
                    />
                    {/* Progress */}
                    <motion.circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke={neonColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - progress / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{
                        filter: `drop-shadow(0 0 6px ${neonColor}70)`,
                      }}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-black font-mono"
                      style={{ color: neonColor }}
                    >
                      {progress.toFixed(0)}%
                    </span>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold" style={{ color: neonColor }}>
                        ЦЕЛЬ ЗАКРЫТА
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/40">
                        осталось {formatNumber(remaining)} ₽
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    background: `linear-gradient(135deg, ${neonColor}0a, ${neonColor}04)`,
                    borderColor: `${neonColor}18`,
                  }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Wallet size={11} style={{ color: neonColor }} />
                    <span className="text-[10px] text-white/45 uppercase">Накоплено</span>
                  </div>
                  <p className="text-base font-bold font-mono" style={{ color: neonColor }}>
                    {formatNumber(saved)} ₽
                  </p>
                </div>
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    background: `linear-gradient(135deg, ${neonColor}0a, ${neonColor}04)`,
                    borderColor: `${neonColor}18`,
                  }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp size={11} style={{ color: neonColor }} />
                    <span className="text-[10px] text-white/45 uppercase">Цель</span>
                  </div>
                  <p className="text-base font-bold font-mono" style={{ color: neonColor }}>
                    {formatNumber(goal.targetAmount)} ₽
                  </p>
                </div>
              </div>

              {/* Creation date + deadline */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Calendar size={10} className="text-white/25" />
                  <span className="text-[10px] text-white/25">
                    Создана {formatDate(goal.createdAt)}
                  </span>
                </div>
                {goal.deadline && (() => {
                  const info = getDeadlineInfo(goal.deadline)
                  if (!info) return null
                  return (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${info.overdue ? 'bg-red-500/10 border border-red-500/20' : info.urgent ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/4 border border-white/8'}`}>
                      {info.overdue ? (
                        <AlertTriangle size={10} className="text-red-400" />
                      ) : (
                        <Clock size={10} className={info.urgent ? 'text-yellow-400' : 'text-white/30'} />
                      )}
                      <span className={`text-[10px] font-mono ${info.overdue ? 'text-red-400' : info.urgent ? 'text-yellow-400' : 'text-white/35'}`}>
                        {info.text}
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Deadline date display */}
              {goal.deadline && !isCompleted && (
                <div
                  className="mt-3 rounded-xl p-3 border flex items-center justify-between"
                  style={{
                    background: (() => {
                      const info = getDeadlineInfo(goal.deadline)
                      if (info?.overdue) return 'linear-gradient(135deg, rgba(255,51,102,0.08), rgba(255,51,102,0.02))'
                      if (info?.urgent) return 'linear-gradient(135deg, rgba(255,170,0,0.08), rgba(255,170,0,0.02))'
                      return `linear-gradient(135deg, ${neonColor}0a, ${neonColor}04)`
                    })(),
                    borderColor: (() => {
                      const info = getDeadlineInfo(goal.deadline)
                      if (info?.overdue) return 'rgba(255,51,102,0.2)'
                      if (info?.urgent) return 'rgba(255,170,0,0.2)'
                      return `${neonColor}18`
                    })(),
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Calendar size={11} className={(() => {
                        const info = getDeadlineInfo(goal.deadline)
                        if (info?.overdue) return 'text-red-400'
                        if (info?.urgent) return 'text-yellow-400'
                        return 'text-white/40'
                      })()} />
                      <span className="text-[10px] text-white/40 uppercase">Дедлайн</span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: (() => {
                      const info = getDeadlineInfo(goal.deadline)
                      if (info?.overdue) return '#ff3366'
                      if (info?.urgent) return '#ffaa00'
                      return neonColor
                    })() }}>
                      {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30">Нужно в день</p>
                    <p className="text-xs font-bold font-mono" style={{ color: neonColor }}>
                      {(() => {
                        const info = getDeadlineInfo(goal.deadline)
                        if (!info || info.daysLeft <= 0) return '—'
                        const perDay = Math.ceil(remaining / info.daysLeft)
                        return `${formatNumber(perDay)} ₽`
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Linear progress bar (always visible) */}
        {!editing && (
          <div className="mb-6">
            <div className="h-3 rounded-full bg-white/6 overflow-hidden">
              <motion.div
                className="h-full rounded-full progress-shimmer"
                style={{
                  background: `linear-gradient(90deg, ${neonColor}, ${neonColor}bb)`,
                  boxShadow: `0 0 10px ${neonColor}40`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Entries section */}
        <div className="space-y-3">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">
              Записи ({goal.entries.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs hover:bg-white/5"
              style={{ color: neonColor }}
              onClick={() => setShowAddEntry(!showAddEntry)}
            >
              <Plus size={14} className="mr-1" />
              Внести
            </Button>
          </div>

          {/* Add entry form */}
          <AnimatePresence>
            {showAddEntry && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl p-3 border space-y-2"
                  style={{
                    background: `linear-gradient(135deg, ${neonColor}0a, ${neonColor}04)`,
                    borderColor: `${neonColor}20`,
                  }}
                >
                  <input
                    type="number"
                    placeholder="Сумма ₽"
                    value={entryAmount}
                    onChange={(e) => setEntryAmount(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/6 border border-white/10 text-sm font-mono focus:border-white/20 focus:outline-none placeholder:text-white/30"
                    style={{ color: neonColor }}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                  />
                  {remaining > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        setEntryAmount(remaining.toString())
                        hapticLight()
                      }}
                      className="w-full h-8 text-[11px] font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                      style={{
                        background: `linear-gradient(135deg, ${neonColor}18, ${neonColor}08)`,
                        color: neonColor,
                        border: `1px solid ${neonColor}25`,
                        boxShadow: `0 0 12px ${neonColor}10`,
                      }}
                    >
                      <Wallet size={12} />
                      Закрыть полностью — {formatNumber(remaining)} ₽
                    </motion.button>
                  )}
                  <input
                    type="text"
                    placeholder="Заметка"
                    value={entryNote}
                    onChange={(e) => setEntryNote(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/6 border border-white/10 text-sm focus:border-white/20 focus:outline-none placeholder:text-white/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${neonColor}, ${neonColor}cc)`,
                        color: '#12121e',
                      }}
                      onClick={handleAddEntry}
                      disabled={!entryAmount || parseFloat(entryAmount) <= 0}
                    >
                      Добавить
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setShowAddEntry(false)
                        setEntryAmount('')
                        setEntryNote('')
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entries list */}
          {goal.entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-xs">Пока нет записей</p>
              <p className="text-white/20 text-[10px] mt-1">Нажми «Внести» чтобы добавить</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <AnimatePresence>
                {[...goal.entries].reverse().map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15, height: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl group hover:bg-white/4 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: neonColor, boxShadow: `0 0 6px ${neonColor}50` }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold font-mono" style={{ color: neonColor }}>
                        +{formatNumber(entry.amount)} ₽
                      </span>
                      {entry.note && (
                        <p className="text-xs text-white/40 truncate mt-0.5">{entry.note}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-white/25 shrink-0">
                      {formatDateShort(entry.date)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity p-0 hover:bg-red-500/10"
                      onClick={() => deleteEntry(goal.id, entry.id)}
                    >
                      <X size={11} className="text-red-400" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative rounded-2xl p-5 border border-white/10 max-w-xs w-full"
              style={{ background: 'linear-gradient(135deg, rgba(30, 30, 48, 0.98), rgba(22, 22, 38, 0.99))' }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <p className="text-sm font-bold text-center text-white/80 mb-1">Удалить цель?</p>
              <p className="text-xs text-center text-white/40 mb-4">
                «{goal.title}» и все записи будут удалены безвозвратно
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-9 text-xs border border-white/10"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs bg-red-500/80 hover:bg-red-500 text-white"
                  onClick={handleDeleteGoal}
                >
                  Удалить
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share overlay */}
      {showShare && (
        <ShareCardOverlay goal={goal} saved={saved} progress={progress} onClose={() => setShowShare(false)} />
      )}
    </motion.div>
  )
}
