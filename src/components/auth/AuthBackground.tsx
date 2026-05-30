'use client'

import { LazyMotion, domAnimation } from 'motion/react'
import { PersonalBackground } from '@/components/Backgrounds/PersonalBackground/PersonalBackground'
import { DEMO_IMAGES } from '@/lib/demo-images'

export function AuthBackground() {
  return (
    <LazyMotion features={domAnimation}>
      <PersonalBackground isActive initialImages={DEMO_IMAGES} />
    </LazyMotion>
  )
}
