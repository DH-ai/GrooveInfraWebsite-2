'use client'

import { MotionConfig } from 'framer-motion'

/**
 * Makes every Framer Motion animation in the tree honour the operating
 * system's reduced-motion setting. With `reducedMotion="user"` Motion drops
 * transform and layout animations — the translate, scale and parallax that
 * cause vestibular discomfort — while still allowing opacity, so content that
 * only becomes visible through an animation does not disappear entirely.
 *
 * Components with their own concerns beyond that (an autoplaying marquee, a
 * spring-driven scroll indicator) additionally read `useReducedMotion`,
 * because Motion cannot know that stopping those is the correct behaviour.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
