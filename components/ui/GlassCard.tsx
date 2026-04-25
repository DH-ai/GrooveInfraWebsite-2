'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  tilt?: boolean
  glow?: boolean
}

export default function GlassCard({ children, className, tilt = true, glow = false }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!tilt || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width
    const cy = (e.clientY - rect.top) / rect.height
    setRotate({ x: (cy - 0.5) * -8, y: (cx - 0.5) * 8 })
    setGlare({ x: cx * 100, y: cy * 100, opacity: 0.08 })
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 })
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl glass',
        glow && 'dark:glow-gold',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          transition: 'opacity 0.15s ease',
        }}
      />
      {children}
    </motion.div>
  )
}
