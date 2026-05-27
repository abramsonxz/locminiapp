'use client'

import { motion } from 'framer-motion'

interface NeonBorderBoxProps {
  children: React.ReactNode
  color?: string
  size?: number
  borderRadius?: number
  className?: string
}

export function NeonBorderBox({
  children,
  color = '#00f0ff',
  size = 64,
  borderRadius = 16,
  className = '',
}: NeonBorderBoxProps) {
  const strokeLength = (size - 2) * 4 // approximate perimeter
  const dashLen = strokeLength / 6
  const gapLen = strokeLength / 6

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Glow layer */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ filter: 'blur(4px)' }}
      >
        <rect
          x="1"
          y="1"
          width={size - 2}
          height={size - 2}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={`${dashLen} ${gapLen}`}
          opacity="0.4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to={-(dashLen + gapLen)}
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>

      {/* Main neon border */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        <defs>
          <filter id={`neon-glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="1"
          y="1"
          width={size - 2}
          height={size - 2}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={`${dashLen} ${gapLen}`}
          strokeLinecap="round"
          filter={`url(#neon-glow-${color.replace('#', '')})`}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to={-(dashLen + gapLen)}
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
