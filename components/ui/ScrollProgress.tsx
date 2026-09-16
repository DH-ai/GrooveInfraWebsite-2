'use client'

import { useScroll, useSpring, useReducedMotion, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduceMotion = useReducedMotion()

  // The spring adds an easing overshoot to the bar's width. That is exactly the
  // kind of unrequested movement reduced-motion users are asking us to drop, so
  // for them the bar tracks scroll position directly instead.
  const smoothed = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  const scaleX = reduceMotion ? scrollYProgress : smoothed

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-groove-gold"
      style={{ scaleX }}
    />
  )
}
