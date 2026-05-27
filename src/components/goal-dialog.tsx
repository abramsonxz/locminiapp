'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useGoalStore } from '@/lib/store'
import { Button } from '@/components/ui/button'

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

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)].value
}

interface GoalDialogProps {
  open: boolean
  onClose: () => void
}

export function GoalDialog({ open, onClose }: GoalDialogProps) {
  const { addGoal } = useGoalStore()
  const defaultColor = useMemo(() => getRandomColor(), [])

  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [color, setColor] = useState(defaultColor)
  const [deadline, setDeadline] = useState('')

  const handleClose = () => {
    setTitle('')
    setLink('')
    setTargetAmount('')
    setDeadline('')
    setColor(getRandomColor())
    onClose()
  }

  const handleSubmit = () => {
    const amount = parseFloat(targetAmount)
    if (!title.trim() || isNaN(amount) || amount <= 0) return
    addGoal(title.trim(), link.trim(), amount, color, deadline || null)
    handleClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Dialog */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-t-3xl border border-white/10 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(28, 28, 48, 0.98), rgba(22, 22, 38, 0.99))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-8 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-lg font-bold" style={{ color }}>
                Новая цель
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/5"
                onClick={handleClose}
              >
                <X size={16} />
              </Button>
            </div>

            {/* Form */}
            <div className="px-5 pb-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wider">
                  Название
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="На что копим?"
                  className="w-full h-10 px-4 rounded-xl bg-white/6 border border-white/10 text-sm focus:border-white/25 focus:outline-none placeholder:text-white/30 transition-colors"
                  style={{ borderColor: title ? `${color}40` : undefined }}
                  autoFocus
                />
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wider">
                  Ссылка <span className="text-white/25">(необязательно)</span>
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-4 rounded-xl bg-white/6 border border-white/10 text-sm focus:border-white/25 focus:outline-none placeholder:text-white/30 transition-colors"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wider">
                  Целевая сумма (₽)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-mono focus:border-white/25 focus:outline-none placeholder:text-white/20 transition-colors"
                  style={{
                    borderColor: targetAmount ? `${color}40` : undefined,
                    color: targetAmount ? color : undefined,
                  }}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wider">
                  Дедлайн <span className="text-white/25">(необязательно)</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/6 border border-white/10 text-sm focus:border-white/25 focus:outline-none placeholder:text-white/30 transition-colors [color-scheme:dark]"
                    style={{ borderColor: deadline ? `${color}40` : undefined, color: deadline ? color : 'rgba(255,255,255,0.5)' }}
                  />
                  {deadline && (
                    <button
                      onClick={() => setDeadline('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X size={12} className="text-white/40" />
                    </button>
                  )}
                </div>
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase tracking-wider">
                  Цвет
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className="w-9 h-9 rounded-full border-2 transition-all duration-200"
                      style={{
                        backgroundColor: c.value,
                        borderColor: color === c.value ? '#ffffff' : 'transparent',
                        boxShadow: color === c.value ? `0 0 12px ${c.value}60` : 'none',
                        transform: color === c.value ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                className="w-full h-11 rounded-xl font-bold text-sm"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  color: '#12121e',
                  boxShadow: `0 0 20px ${color}30`,
                }}
                onClick={handleSubmit}
                disabled={!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0}
              >
                Создать цель
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
