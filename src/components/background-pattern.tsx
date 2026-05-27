'use client'

import { useEffect, useRef } from 'react'

export function BackgroundPattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const shapes: Array<{
      x: number
      y: number
      size: number
      type: 'hexagon' | 'triangle' | 'circle' | 'diamond' | 'cross'
      speed: number
      rotation: number
      rotationSpeed: number
      opacity: number
      color: string
      phase: number
    }> = []

    const colors = [
      'rgba(0, 240, 255, ',
      'rgba(180, 74, 255, ',
      'rgba(0, 255, 136, ',
      'rgba(255, 170, 0, ',
      'rgba(255, 51, 102, ',
    ]

    for (let i = 0; i < 14; i++) {
      shapes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 15 + Math.random() * 35,
        type: ['hexagon', 'triangle', 'circle', 'diamond', 'cross'][Math.floor(Math.random() * 5)] as any,
        speed: 0.2 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        opacity: 0.06 + Math.random() * 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      })
    }

    function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (Math.PI / 3) * i
        const px = x + size * Math.cos(angle)
        const py = y + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.beginPath()
      for (let i = 0; i < 3; i++) {
        const angle = rotation + (Math.PI * 2 / 3) * i - Math.PI / 2
        const px = x + size * Math.cos(angle)
        const py = y + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.lineTo(size * 0.6, 0)
      ctx.lineTo(0, size)
      ctx.lineTo(-size * 0.6, 0)
      ctx.closePath()
      ctx.restore()
    }

    function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      const w = size * 0.25
      ctx.beginPath()
      ctx.moveTo(-w, -size)
      ctx.lineTo(w, -size)
      ctx.lineTo(w, -w)
      ctx.lineTo(size, -w)
      ctx.lineTo(size, w)
      ctx.lineTo(w, w)
      ctx.lineTo(w, size)
      ctx.lineTo(-w, size)
      ctx.lineTo(-w, w)
      ctx.lineTo(-size, w)
      ctx.lineTo(-size, -w)
      ctx.lineTo(-w, -w)
      ctx.closePath()
      ctx.restore()
    }

    function drawGrid(ctx: CanvasRenderingContext2D, time: number) {
      const spacing = 50
      const cols = Math.ceil(canvas.width / spacing) + 1
      const rows = Math.ceil(canvas.height / spacing) + 1

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)'
      ctx.lineWidth = 0.5

      for (let i = 0; i < cols; i++) {
        const x = i * spacing
        const wave = Math.sin(time * 0.3 + i * 0.1) * 3
        ctx.beginPath()
        ctx.moveTo(x + wave, 0)
        ctx.lineTo(x + wave, canvas.height)
        ctx.stroke()
      }
      for (let j = 0; j < rows; j++) {
        const y = j * spacing
        const wave = Math.sin(time * 0.3 + j * 0.1) * 3
        ctx.beginPath()
        ctx.moveTo(0, y + wave)
        ctx.lineTo(canvas.width, y + wave)
        ctx.stroke()
      }
    }

    function animate() {
      if (!ctx || !canvas) return
      time += 0.016

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawGrid(ctx, time)

      for (const shape of shapes) {
        shape.rotation += shape.rotationSpeed
        const floatY = Math.sin(time * shape.speed + shape.phase) * 15
        const floatX = Math.cos(time * shape.speed * 0.7 + shape.phase) * 8
        const currentOpacity = shape.opacity * (0.7 + Math.sin(time * 0.5 + shape.phase) * 0.3)

        ctx.strokeStyle = shape.color + currentOpacity + ')'
        ctx.lineWidth = 1
        ctx.fillStyle = shape.color + (currentOpacity * 0.12) + ')'

        const x = shape.x + floatX
        const y = shape.y + floatY

        switch (shape.type) {
          case 'hexagon':
            drawHexagon(ctx, x, y, shape.size, shape.rotation)
            break
          case 'triangle':
            drawTriangle(ctx, x, y, shape.size, shape.rotation)
            break
          case 'circle':
            ctx.beginPath()
            ctx.arc(x, y, shape.size, 0, Math.PI * 2)
            break
          case 'diamond':
            drawDiamond(ctx, x, y, shape.size, shape.rotation)
            break
          case 'cross':
            drawCross(ctx, x, y, shape.size, shape.rotation)
            break
        }

        ctx.fill()
        ctx.stroke()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
