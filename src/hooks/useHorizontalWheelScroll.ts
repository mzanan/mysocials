'use client'

import { useEffect, useRef } from 'react'

export function useHorizontalWheelScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const onWheel = (e: WheelEvent) => {
      if (node.scrollWidth <= node.clientWidth) return
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      node.scrollLeft += e.deltaY
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  return ref
}
