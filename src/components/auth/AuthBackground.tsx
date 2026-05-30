'use client'

import { LazyMotion, domAnimation } from 'motion/react'
import { SyntheticGrid } from '@/components/Landing/SyntheticGrid'

export function AuthBackground() {
  return (
    <LazyMotion features={domAnimation}>
      <SyntheticGrid />
    </LazyMotion>
  )
}
